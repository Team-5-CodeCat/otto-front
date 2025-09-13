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
 * GitHub 저장소 ID를 기반으로 연결된 프로젝트를 찾습니다.
 *
 * @description GitHub 저장소 ID와 프로젝트 간의 매핑을 통해 웹훅을 수신할
 * 해당하는 프로젝트를 식별합니다. 현재는 임시로 첫 번째 프로젝트를 반환하지만,
 * 실제로는 프로젝트 테이블에 github_repo_id 필드가 필요합니다.
 *
 * @async
 * @param repositoryId - GitHub 저장소의 고유 ID
 * @returns 매칭되는 프로젝트 ID 또는 null (찾지 못한 경우)
 * @throws {Error} 프로젝트 조회 중 오류 발생시
 *
 * @example
 * ```typescript
 * const projectId = await findProjectByRepository(123456789);
 * if (projectId) {
 *   console.log(`찾은 프로젝트: ${projectId}`);
 * } else {
 *   console.log('연결된 프로젝트가 없습니다.');
 * }
 * ```
 *
 * @todo 백엔드에 저장소 ID -> 프로젝트 매핑 API 구현 필요
 */
async function findProjectByRepository(repositoryId: number): Promise<string | null> {
  try {
    const connection = makeFetch();

    // TODO: 백엔드에 저장소 ID -> 프로젝트 매핑 API가 필요
    // 현재는 임시로 모든 프로젝트를 조회해서 찾는 방식 사용
    const projects = await functional.projects.projectGetUserProjects(connection);

    // 실제로는 프로젝트 테이블에 github_repo_id 필드가 있어야 함
    // 현재는 첫 번째 프로젝트를 반환 (임시)
    if (projects.length > 0) {
      return projects[0].projectId;
    }

    return null;
  } catch (error) {
    console.error('프로젝트 조회 실패:', error);
    return null;
  }
}

/**
 * 지정된 프로젝트의 활성 파이프라인을 조회합니다.
 *
 * @description 프로젝트 ID를 기반으로 해당 프로젝트에 등록된 파이프라인 중
 * 가장 최근에 생성된 파이프라인을 반환합니다. 웹훅으로 자동 실행할 파이프라인을 결정합니다.
 *
 * @async
 * @param projectId - 파이프라인을 조회할 프로젝트의 고유 ID
 * @returns 활성 파이프라인 객체 또는 null (파이프라인이 없는 경우)
 * @throws {Error} 파이프라인 조회 중 오류 발생시
 *
 * @example
 * ```typescript
 * const pipeline = await getActivePipeline("project-123");
 * if (pipeline && pipeline.content) {
 *   console.log(`활성 파이프라인: ${pipeline.name}`);
 *   // 파이프라인 실행 로직
 * } else {
 *   console.log('실행할 파이프라인이 없습니다.');
 * }
 * ```
 */
async function getActivePipeline(projectId: string) {
  try {
    const connection = makeFetch();
    const result = await functional.pipelines.findAll(connection, {
      projectId: projectId,
      page: 1,
      limit: 1
    });

    if (result.pipelines && result.pipelines.length > 0) {
      return result.pipelines[0];
    }

    return null;
  } catch (error) {
    console.error('파이프라인 조회 실패:', error);
    return null;
  }
}

/**
 * 웹훅으로 트리거된 파이프라인을 자동 실행합니다.
 *
 * @description GitHub 웹훅 이벤트를 기반으로 파이프라인을 생성하고 실행합니다.
 * 수동 실행과 동일한 otto-sdk API를 사용하여 일관된 실행 방식을 보장합니다.
 *
 * @async
 * @param projectId - 파이프라인을 실행할 프로젝트의 고유 ID
 * @param pipelineContent - 실행할 파이프라인의 JSON 콘텐츠 (AnyBlock[] 구조)
 * @param webhookData - GitHub 웹훅 페이로드 (로깅 및 메타데이터용)
 * @returns 파이프라인 실행 결과 (success, pipelineId 포함)
 * @throws {Error} 파이프라인 실행 중 오류 발생시
 *
 * @example
 * ```typescript
 * const result = await executePipeline(
 *   "project-123",
 *   '["pipeline", "json", "content"]',
 *   webhookPayload
 * );
 *
 * console.log(`실행된 파이프라인 ID: ${result.pipelineId}`);
 * ```
 *
 * @see {@link handleRun} - 수동 실행과 동일한 API 사용
 */
async function executePipeline(
  projectId: string,
  pipelineContent: string,
  webhookData: GitHubWebhookPayload
) {
  try {
    const connection = makeFetch();

    // 웹훅 트리거로 파이프라인 생성 및 실행
    const result = await functional.pipelines.create(connection, {
      name: `webhook-trigger-${Date.now()}`,
      content: pipelineContent,
      projectID: projectId,
      version: 1,
    } as any);

    console.log('웹훅으로 파이프라인 실행 완료:', {
      pipelineId: result.pipelineId,
      repository: webhookData.repository.full_name,
      branch: extractBranchName(webhookData.ref),
      commit: webhookData.head_commit.id.substring(0, 7),
      commitMessage: webhookData.head_commit.message,
    });

    return { success: true, pipelineId: result.pipelineId };

  } catch (error) {
    console.error('웹훅 파이프라인 실행 실패:', error);
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

    // 5. 저장소 ID로 프로젝트 찾기
    const projectId = await findProjectByRepository(payload.repository.id);
    if (!projectId) {
      console.log('해당 저장소와 연결된 프로젝트를 찾을 수 없습니다.');
      return NextResponse.json(
        { error: '연결된 프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 6. 프로젝트의 활성 파이프라인 조회
    const pipeline = await getActivePipeline(projectId);
    if (!pipeline || !pipeline.content) {
      console.log('실행할 활성 파이프라인이 없습니다.');
      return NextResponse.json(
        { error: '실행할 파이프라인이 없습니다.' },
        { status: 404 }
      );
    }

    // 7. 파이프라인 자동 실행
    const result = await executePipeline(projectId, pipeline.content, payload);

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      message: '파이프라인 자동 실행이 시작되었습니다.',
      data: {
        pipelineId: result.pipelineId,
        projectId: projectId,
        repository: payload.repository.full_name,
        branch: branchName,
        commit: payload.head_commit.id.substring(0, 7),
        commitMessage: payload.head_commit.message,
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