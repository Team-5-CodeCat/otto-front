/**
 * 파이프라인 웹훅 관리 유틸리티
 *
 * @description 파이프라인과 GitHub 저장소 간의 웹훅 연결을 관리합니다.
 * 특정 저장소에서 push 이벤트 발생시 해당 파이프라인만 자동 실행되도록 필터링합니다.
 */

import { functional } from '@cooodecat/otto-sdk';
import makeFetch from './make-fetch';
import type { PipelineWebhookConfig, WebhookMatchResult } from '@/app/types/pipeline-webhook';

/**
 * 임시 웹훅 설정 저장소 (실제로는 데이터베이스에 저장되어야 함)
 *
 * @todo 백엔드 데이터베이스에 webhook_configs 테이블 생성 필요:
 * - pipeline_id, project_id, github_repo_id, github_repo_name, trigger_branch, is_active
 */
const TEMP_WEBHOOK_CONFIGS: PipelineWebhookConfig[] = [
  // 테스트용 예시 설정 - GitHub 저장소 ID는 실제 값으로 변경 필요
  {
    pipelineId: 'test-pipeline-123',
    projectId: 'test-project-456',
    githubRepoId: 123456789, // 실제 GitHub 저장소 ID로 변경
    githubRepoName: 'testuser/test-repository',
    triggerBranch: 'main',
    isActive: true,
    createdAt: '2025-01-13T00:00:00Z'
  },
  {
    pipelineId: 'dev-pipeline-456',
    projectId: 'dev-project-789',
    githubRepoId: 987654321, // 다른 테스트 저장소
    githubRepoName: 'devuser/dev-repo',
    triggerBranch: 'develop',
    isActive: true,
    createdAt: '2025-01-13T00:00:00Z'
  }
];

/**
 * 파이프라인에 GitHub 저장소 웹훅을 연결합니다.
 *
 * @description 파이프라인 생성 후 특정 GitHub 저장소와 연결하여
 * 해당 저장소에서 push 이벤트 발생시에만 파이프라인이 자동 실행되도록 설정합니다.
 *
 * @param pipelineId - 연결할 파이프라인 ID
 * @param projectId - 프로젝트 ID
 * @param githubRepoId - GitHub 저장소 ID
 * @param githubRepoName - GitHub 저장소 이름 (예: "username/repo")
 * @param triggerBranch - 웹훅 트리거할 브랜치 (기본값: "main")
 * @returns 웹훅 설정 결과
 *
 * @example
 * ```typescript
 * const config = await connectPipelineToGitHub(
 *   'pipeline-123',
 *   'project-456',
 *   123456789,
 *   'username/my-repo',
 *   'main'
 * );
 * ```
 */
export async function connectPipelineToGitHub(
  pipelineId: string,
  projectId: string,
  githubRepoId: number,
  githubRepoName: string,
  triggerBranch: string = 'main'
): Promise<PipelineWebhookConfig> {
  // TODO: 실제로는 백엔드 API 호출
  // const connection = makeFetch();
  // const result = await functional.webhooks.connectPipeline(connection, {...});

  const webhookConfig: PipelineWebhookConfig = {
    pipelineId,
    projectId,
    githubRepoId,
    githubRepoName,
    triggerBranch,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // 임시로 메모리에 저장 (실제로는 데이터베이스)
  TEMP_WEBHOOK_CONFIGS.push(webhookConfig);

  console.log('파이프라인 웹훅 연결 완료:', webhookConfig);
  return webhookConfig;
}

/**
 * GitHub 저장소 ID와 브랜치로 연결된 파이프라인을 찾습니다.
 *
 * @description 웹훅 수신시 해당 저장소와 브랜치에 연결된 활성 파이프라인을 찾아
 * 자동 실행 여부를 결정합니다.
 *
 * @param githubRepoId - GitHub 저장소 ID
 * @param branchName - 푸시된 브랜치 이름
 * @returns 매칭된 파이프라인 정보 또는 null
 *
 * @example
 * ```typescript
 * const match = await findPipelineByWebhook(123456789, 'main');
 * if (match && match.canExecute) {
 *   console.log(`실행할 파이프라인: ${match.pipelineId}`);
 * }
 * ```
 */
export async function findPipelineByWebhook(
  githubRepoId: number,
  branchName: string
): Promise<WebhookMatchResult | null> {
  try {
    // 1. 저장소 ID와 브랜치에 매칭되는 웹훅 설정 찾기
    const webhookConfig = TEMP_WEBHOOK_CONFIGS.find(config =>
      config.githubRepoId === githubRepoId &&
      config.triggerBranch === branchName &&
      config.isActive
    );

    if (!webhookConfig) {
      console.log(`웹훅 설정을 찾을 수 없음: repoId=${githubRepoId}, branch=${branchName}`);
      return null;
    }

    // 2. 해당 파이프라인이 실제로 존재하고 실행 가능한지 확인
    const connection = makeFetch();
    const pipeline = await functional.pipelines.findOne(connection, webhookConfig.pipelineId);

    if (!pipeline) {
      return {
        pipelineId: webhookConfig.pipelineId,
        projectId: webhookConfig.projectId,
        webhookConfig,
        canExecute: false,
        reason: '파이프라인을 찾을 수 없습니다.'
      };
    }

    // 3. 파이프라인 실행 가능
    return {
      pipelineId: webhookConfig.pipelineId,
      projectId: webhookConfig.projectId,
      webhookConfig,
      canExecute: true
    };

  } catch (error) {
    console.error('웹훅 파이프라인 매칭 실패:', error);
    return null;
  }
}

/**
 * 파이프라인의 웹훅 설정을 조회합니다.
 *
 * @param pipelineId - 조회할 파이프라인 ID
 * @returns 웹훅 설정 정보 또는 null
 */
export async function getPipelineWebhookConfig(
  pipelineId: string
): Promise<PipelineWebhookConfig | null> {
  const config = TEMP_WEBHOOK_CONFIGS.find(c => c.pipelineId === pipelineId);
  return config || null;
}

/**
 * 파이프라인의 웹훅 설정을 비활성화합니다.
 *
 * @param pipelineId - 비활성화할 파이프라인 ID
 * @returns 성공 여부
 */
export async function disablePipelineWebhook(pipelineId: string): Promise<boolean> {
  const configIndex = TEMP_WEBHOOK_CONFIGS.findIndex(c => c.pipelineId === pipelineId);

  if (configIndex >= 0) {
    TEMP_WEBHOOK_CONFIGS[configIndex].isActive = false;
    console.log(`파이프라인 웹훅 비활성화: ${pipelineId}`);
    return true;
  }

  return false;
}

/**
 * 프로젝트의 모든 웹훅 설정을 조회합니다.
 *
 * @param projectId - 조회할 프로젝트 ID
 * @returns 프로젝트의 웹훅 설정 목록
 */
export async function getProjectWebhookConfigs(
  projectId: string
): Promise<PipelineWebhookConfig[]> {
  return TEMP_WEBHOOK_CONFIGS.filter(c => c.projectId === projectId);
}