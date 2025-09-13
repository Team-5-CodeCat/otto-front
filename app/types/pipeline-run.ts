/**
 * 파이프라인 실행 기록 (PipelineRun) 타입 정의
 *
 * @description 파이프라인의 각 실행을 추적하기 위한 타입들입니다.
 * 파이프라인 정의는 업데이트되고, 실행할 때마다 새로운 Run 기록이 생성됩니다.
 */

/**
 * 파이프라인 실행 트리거 타입
 */
export type PipelineRunTrigger = 'manual' | 'webhook' | 'schedule';

/**
 * 파이프라인 실행 상태
 */
export type PipelineRunStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

/**
 * 웹훅 트리거 메타데이터
 */
export interface WebhookTriggerData {
  /** 저장소 전체 이름 */
  repository: string;
  /** 브랜치 이름 */
  branch: string;
  /** 커밋 해시 */
  commit: string;
  /** 커밋 메시지 */
  commitMessage: string;
  /** 커밋 작성자 */
  author: string;
  /** 웹훅 수신 시간 */
  webhookReceivedAt: string;
}

/**
 * 파이프라인 실행 기록 인터페이스
 */
export interface PipelineRun {
  /** 실행 기록 고유 ID */
  id: string;

  /** 소속 파이프라인 ID */
  pipelineId: string;

  /** 실행 번호 (#1, #2, #3...) */
  runNumber: number;

  /** 실행 트리거 방식 */
  trigger: PipelineRunTrigger;

  /** 실행을 트리거한 사용자 또는 시스템 */
  triggerBy: string;

  /** 현재 실행 상태 */
  status: PipelineRunStatus;

  /** 실행 시작 시간 */
  startedAt: string;

  /** 실행 완료 시간 (완료된 경우) */
  completedAt?: string;

  /** 실행 소요 시간 (초) */
  duration?: number;

  /** 웹훅 트리거 데이터 (웹훅인 경우) */
  webhookData?: WebhookTriggerData;

  /** 실행 시점의 파이프라인 스냅샷 (JSON) */
  pipelineSnapshot: string;

  /** 실행 로그 URL 또는 ID */
  logsUrl?: string;

  /** 실행 결과 메시지 */
  resultMessage?: string;

  /** 생성 시간 */
  createdAt: string;

  /** 업데이트 시간 */
  updatedAt: string;
}

/**
 * 파이프라인 실행 생성 요청
 */
export interface CreatePipelineRunRequest {
  /** 실행할 파이프라인 ID */
  pipelineId: string;

  /** 실행 트리거 방식 */
  trigger: PipelineRunTrigger;

  /** 실행을 트리거한 사용자 ID */
  triggerBy: string;

  /** 웹훅 트리거 데이터 (웹훅인 경우) */
  webhookData?: WebhookTriggerData;

  /** 실행 시점의 파이프라인 JSON 스냅샷 */
  pipelineSnapshot: string;
}

/**
 * 파이프라인 실행 상태 업데이트 요청
 */
export interface UpdatePipelineRunRequest {
  /** 업데이트할 실행 상태 */
  status?: PipelineRunStatus;

  /** 실행 완료 시간 */
  completedAt?: string;

  /** 실행 소요 시간 */
  duration?: number;

  /** 실행 결과 메시지 */
  resultMessage?: string;

  /** 로그 URL */
  logsUrl?: string;
}

/**
 * 파이프라인 실행 목록 조회 응답
 */
export interface PipelineRunListResponse {
  /** 실행 기록 목록 */
  runs: PipelineRun[];

  /** 전체 실행 기록 수 */
  total: number;

  /** 현재 페이지 */
  page: number;

  /** 페이지당 항목 수 */
  limit: number;
}