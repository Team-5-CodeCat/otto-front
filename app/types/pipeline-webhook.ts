/**
 * 파이프라인-웹훅 연결 타입 정의
 *
 * @description 파이프라인과 GitHub 저장소 간의 웹훅 연결 정보를 정의합니다.
 * 특정 저장소에서 push 이벤트 발생시 해당 파이프라인만 자동 실행되도록 합니다.
 */

/**
 * 파이프라인 웹훅 설정 인터페이스
 */
export interface PipelineWebhookConfig {
  /** 파이프라인 고유 ID */
  pipelineId: string;

  /** 프로젝트 고유 ID */
  projectId: string;

  /** GitHub 저장소 ID */
  githubRepoId: number;

  /** GitHub 저장소 전체 이름 (예: "username/repository-name") */
  githubRepoName: string;

  /** 웹훅 트리거할 브랜치 (기본값: "main") */
  triggerBranch: string;

  /** 웹훅 활성화 여부 */
  isActive: boolean;

  /** 웹훅 생성 시간 */
  createdAt: string;

  /** 마지막 실행 시간 (선택적) */
  lastTriggeredAt?: string;
}

/**
 * 웹훅 매칭 결과
 */
export interface WebhookMatchResult {
  /** 매칭된 파이프라인 ID */
  pipelineId: string;

  /** 매칭된 프로젝트 ID */
  projectId: string;

  /** 웹훅 설정 정보 */
  webhookConfig: PipelineWebhookConfig;

  /** 파이프라인 실행 가능 여부 */
  canExecute: boolean;

  /** 실행 불가능한 경우 이유 */
  reason?: string;
}