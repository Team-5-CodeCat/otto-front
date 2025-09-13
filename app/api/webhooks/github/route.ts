/**
 * GitHub 웹훅 수신 API 엔드포인트
 *
 * @description GitHub에서 전송되는 push 이벤트를 수신하여 자동으로 파이프라인을 실행합니다.
 * 웹훅 페이로드를 검증하고, 해당하는 프로젝트의 파이프라인을 자동 실행합니다.
 *
 * @route POST /api/webhooks/github
 */

import { NextRequest, NextResponse } from 'next/server';
import { functional } from '@cooodecat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';
import { findPipelineByWebhook } from '@/app/lib/webhookManager';
import { createPipelineRun } from '@/app/lib/pipelineRunManager';

/**
 * GitHub 웹훅 페이로드 타입 정의
 */
interface GitHubWebhookPayload {
  repository: {
    id: number;
    full_name: string;
    html_url: string;
  };
  ref: string; // 브랜치 정보 (예: refs/heads/main)
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  pusher: {
    name: string;
    email: string;
  };
  head_commit: {
    id: string;
    message: string;
  };
}

/**
 * GitHub ref 문자열에서 브랜치 이름을 추출합니다.
 *
 * @description GitHub 웹훅에서 전송되는 ref 필드는 "refs/heads/브랜치명" 형태이므로
 * 앞의 "refs/heads/" 부분을 제거하여 실제 브랜치 이름만 반환합니다.
 *
 * @param ref - GitHub ref 문자열
 * @returns 추출된 브랜치 이름
 *
 * @example
 * ```typescript
 * const branchName = extractBranchName("refs/heads/main");
 * // Returns: "main"
 *
 * const featureBranch = extractBranchName("refs/heads/feature/login");
 * // Returns: "feature/login"
 * ```
 */
function extractBranchName(ref: string): string {
  return ref.replace('refs/heads/', '');
}


/**
 * 연결된 파이프라인의 새로운 실행 기록(Run)을 생성합니다.
 *
 * @description GitHub 웹훅으로 트리거될 때 기존 파이프라인의 새로운 Run 기록을 생성하고
 * 실행 번호를 자동으로 증가시킵니다. 파이프라인 정의는 변경하지 않고 실행만 수행합니다.
 *
 * @async
 * @param pipelineId - 실행할 기존 파이프라인의 ID
 * @param webhookData - GitHub 웹훅 페이로드
 * @returns 파이프라인 실행 Run 기록
 * @throws {Error} 파이프라인 실행 중 오류 발생시
 *
 * @example
 * ```typescript
 * const result = await createWebhookPipelineRun(
 *   "pipeline-123",
 *   webhookPayload
 * );
 * // Result: { runId: "run-456", runNumber: 5, ... }
 * ```
 */
async function createWebhookPipelineRun(
  pipelineId: string,
  webhookData: GitHubWebhookPayload
) {
  try {
    const connection = makeFetch();

    // 1. 기존 파이프라인 조회 (실행할 파이프라인 정의 확인)
    const existingPipeline = await functional.pipelines.findOne(connection, pipelineId);

    if (!existingPipeline) {
      throw new Error(`파이프라인을 찾을 수 없습니다: ${pipelineId}`);
    }

    const pipelineContent = (existingPipeline as any).content || '[]';

    // 2. 웹훅 트리거 메타데이터 생성
    const webhookTriggerData = {
      repository: webhookData.repository.full_name,
      branch: extractBranchName(webhookData.ref),
      commit: webhookData.head_commit.id,
      commitMessage: webhookData.head_commit.message,
      author: webhookData.head_commit.author?.name || 'Unknown',
      webhookReceivedAt: new Date().toISOString(),
    };

    // 3. 새로운 파이프라인 실행 기록(Run) 생성
    const runResult = await createPipelineRun({
      pipelineId: pipelineId,
      trigger: 'webhook',
      triggerBy: 'github',
      pipelineSnapshot: pipelineContent,
      webhookData: webhookTriggerData,
    });

    console.log('웹훅으로 파이프라인 실행 기록 생성 완료:', {
      pipelineId: pipelineId,
      runId: runResult.id,
      runNumber: runResult.runNumber,
      repository: webhookTriggerData.repository,
      branch: webhookTriggerData.branch,
      commit: webhookTriggerData.commit.substring(0, 7),
      commitMessage: webhookTriggerData.commitMessage,
    });

    return {
      success: true,
      pipelineId: pipelineId,
      runId: runResult.id,
      runNumber: runResult.runNumber,
      webhookData: webhookTriggerData,
    };

  } catch (error) {
    console.error('웹훅 파이프라인 실행 기록 생성 실패:', error);
    throw error;
  }
}

/**
 * GitHub 웹훅 POST 요청을 처리합니다.
 *
 * @description GitHub에서 전송되는 push 이벤트 웹훅을 수신하여 다음 과정을 수행합니다:
 * 1. 웹훅 페이로드 검증
 * 2. push 이벤트 확인 (다른 이벤트 무시)
 * 3. 저장소 ID로 프로젝트 매핑
 * 4. 활성 파이프라인 조회
 * 5. 파이프라인 자동 실행
 *
 * @async
 * @param request - Next.js 요청 객체 (GitHub 웹훅 페이로드 포함)
 * @returns JSON 응답 (성공/실패 상태와 메타데이터)
 *
 * @example
 * ```typescript
 * // GitHub에서 자동 호출
 * // POST /api/webhooks/github
 * // Headers: x-github-event: push
 * // Body: GitHubWebhookPayload
 *
 * // 성공 응답:
 * {
 *   "success": true,
 *   "message": "파이프라인 자동 실행이 시작되었습니다.",
 *   "data": {
 *     "pipelineId": "pipeline-123",
 *     "repository": "username/repo-name",
 *     "branch": "main",
 *     "commit": "abc1234"
 *   }
 * }
 * ```
 *
 * @throws {400} 유효하지 않은 웹훅 페이로드
 * @throws {404} 연결된 프로젝트 또는 파이프라인을 찾을 수 없음
 * @throws {500} 서버 내부 오류
 */
export async function POST(request: NextRequest) {
  try {
    console.log('GitHub 웹훅 수신:', request.url);

    // 1. 요청 바디 파싱
    const payload: GitHubWebhookPayload = await request.json();

    // 2. 웹훅 페이로드 검증
    if (!payload.repository || !payload.ref || !payload.commits) {
      return NextResponse.json(
        { error: '유효하지 않은 웹훅 페이로드입니다.' },
        { status: 400 }
      );
    }

    // 3. push 이벤트만 처리 (다른 이벤트는 무시)
    const eventType = request.headers.get('x-github-event');
    if (eventType !== 'push') {
      console.log(`GitHub 이벤트 무시: ${eventType}`);
      return NextResponse.json({ message: 'Push 이벤트가 아닙니다. 무시됩니다.' });
    }

    // 4. 브랜치 정보 추출
    const branchName = extractBranchName(payload.ref);
    console.log(`웹훅 처리 시작: ${payload.repository.full_name}/${branchName}`);

    // 5. 저장소 ID와 브랜치로 연결된 파이프라인 찾기
    const webhookMatch = await findPipelineByWebhook(payload.repository.id, branchName);
    if (!webhookMatch) {
      console.log(`해당 저장소와 브랜치에 연결된 파이프라인이 없습니다: ${payload.repository.full_name}/${branchName}`);
      return NextResponse.json(
        { error: '연결된 파이프라인이 없습니다.' },
        { status: 404 }
      );
    }

    // 6. 파이프라인 실행 가능 여부 확인
    if (!webhookMatch.canExecute) {
      console.log(`파이프라인 실행 불가: ${webhookMatch.reason}`);
      return NextResponse.json(
        { error: webhookMatch.reason || '파이프라인을 실행할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 7. 연결된 파이프라인의 새로운 실행 기록(Run) 생성
    const result = await createWebhookPipelineRun(webhookMatch.pipelineId, payload);

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      message: '연결된 파이프라인 실행이 시작되었습니다.',
      data: {
        pipelineId: result.pipelineId,
        runId: result.runId,
        runNumber: result.runNumber,
        projectId: webhookMatch.projectId,
        repository: result.webhookData.repository,
        branch: result.webhookData.branch,
        commit: result.webhookData.commit.substring(0, 7),
        commitMessage: result.webhookData.commitMessage,
        author: result.webhookData.author,
        webhookConfig: {
          triggerBranch: webhookMatch.webhookConfig.triggerBranch,
          githubRepoName: webhookMatch.webhookConfig.githubRepoName,
        },
        execution: {
          trigger: 'webhook',
          startedAt: new Date().toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('GitHub 웹훅 처리 실패:', error);
    return NextResponse.json(
      {
        error: '웹훅 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

/**
 * GitHub 웹훅 엔드포인트의 상태를 확인합니다.
 *
 * @description GET 요청을 통해 웹훅 엔드포인트가 정상적으로 작동하는지 확인할 수 있습니다.
 * 주로 개발 및 디버깅 용도로 사용되며, GitHub 웹훅 설정 전에 엔드포인트 연결을 테스트할 때 유용합니다.
 *
 * @returns 웹훅 엔드포인트 정보와 상태
 *
 * @example
 * ```typescript
 * // GET /api/webhooks/github
 * // 응답:
 * {
 *   "message": "GitHub 웹훅 엔드포인트가 정상 작동 중입니다.",
 *   "endpoint": "/api/webhooks/github",
 *   "methods": ["POST"]
 * }
 * ```
 */
export async function GET() {
  return NextResponse.json({
    message: 'GitHub 웹훅 엔드포인트가 정상 작동 중입니다.',
    endpoint: '/api/webhooks/github',
    methods: ['POST'],
  });
}