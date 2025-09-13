/**
 * 파이프라인 실행 기록 관리 유틸리티
 *
 * @description 파이프라인 실행 기록(Run) 생성, 조회, 상태 업데이트를 관리합니다.
 * 실행할 때마다 새로운 Run 기록을 생성하고 번호를 자동 증가시킵니다.
 */

import { functional } from '@cooodecat/otto-sdk';
import makeFetch from './make-fetch';
import type {
  PipelineRun,
  CreatePipelineRunRequest,
  UpdatePipelineRunRequest,
  PipelineRunListResponse,
  WebhookTriggerData,
  PipelineRunTrigger,
} from '@/app/types/pipeline-run';

/**
 * 임시 실행 기록 저장소 (실제로는 데이터베이스에 저장되어야 함)
 *
 * @todo 백엔드 데이터베이스에 pipeline_runs 테이블 생성 필요
 */
const TEMP_PIPELINE_RUNS: PipelineRun[] = [];

/**
 * 파이프라인의 다음 실행 번호를 계산합니다.
 *
 * @param pipelineId - 파이프라인 ID
 * @returns 다음 실행 번호
 */
function getNextRunNumber(pipelineId: string): number {
  const pipelineRuns = TEMP_PIPELINE_RUNS.filter(run => run.pipelineId === pipelineId);
  const maxRunNumber = Math.max(0, ...pipelineRuns.map(run => run.runNumber));
  return maxRunNumber + 1;
}

/**
 * 새로운 파이프라인 실행 기록을 생성합니다.
 *
 * @description 파이프라인이 실행될 때마다 호출되어 새로운 Run 기록을 생성합니다.
 * 실행 번호를 자동으로 증가시키고, 실행 시점의 파이프라인 스냅샷을 저장합니다.
 *
 * @param request - 실행 기록 생성 요청
 * @returns 생성된 실행 기록
 *
 * @example
 * ```typescript
 * // 수동 실행
 * const run = await createPipelineRun({
 *   pipelineId: 'pipeline-123',
 *   trigger: 'manual',
 *   triggerBy: 'user-456',
 *   pipelineSnapshot: jsonText
 * });
 *
 * // 웹훅 실행
 * const webhookRun = await createPipelineRun({
 *   pipelineId: 'pipeline-123',
 *   trigger: 'webhook',
 *   triggerBy: 'github',
 *   pipelineSnapshot: savedPipelineContent,
 *   webhookData: {
 *     repository: 'user/repo',
 *     branch: 'main',
 *     commit: 'abc1234'
 *   }
 * });
 * ```
 */
export async function createPipelineRun(
  request: CreatePipelineRunRequest
): Promise<PipelineRun> {
  try {
    // TODO: 실제로는 백엔드 API 호출
    // const connection = makeFetch();
    // const result = await functional.pipelines.createRun(connection, request);

    const runNumber = getNextRunNumber(request.pipelineId);
    const now = new Date().toISOString();

    const newRun: PipelineRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      pipelineId: request.pipelineId,
      runNumber,
      trigger: request.trigger,
      triggerBy: request.triggerBy,
      status: 'queued',
      startedAt: now,
      webhookData: request.webhookData,
      pipelineSnapshot: request.pipelineSnapshot,
      createdAt: now,
      updatedAt: now,
    };

    // 임시로 메모리에 저장
    TEMP_PIPELINE_RUNS.push(newRun);

    console.log('파이프라인 실행 기록 생성:', {
      runId: newRun.id,
      pipelineId: newRun.pipelineId,
      runNumber: newRun.runNumber,
      trigger: newRun.trigger,
      triggerBy: newRun.triggerBy,
    });

    // 실행 시작 (실제로는 백엔드에서 처리)
    setTimeout(() => {
      updatePipelineRunStatus(newRun.id, 'running');
    }, 100);

    return newRun;

  } catch (error) {
    console.error('파이프라인 실행 기록 생성 실패:', error);
    throw error;
  }
}

/**
 * 파이프라인 실행 기록의 상태를 업데이트합니다.
 *
 * @param runId - 실행 기록 ID
 * @param status - 새로운 상태
 * @param updates - 추가 업데이트 정보
 * @returns 업데이트된 실행 기록
 */
export async function updatePipelineRunStatus(
  runId: string,
  status: PipelineRun['status'],
  updates?: Partial<UpdatePipelineRunRequest>
): Promise<PipelineRun | null> {
  try {
    // TODO: 실제로는 백엔드 API 호출
    // const connection = makeFetch();
    // const result = await functional.pipelines.updateRun(connection, runId, { status, ...updates });

    const runIndex = TEMP_PIPELINE_RUNS.findIndex(run => run.id === runId);
    if (runIndex === -1) {
      console.error('실행 기록을 찾을 수 없음:', runId);
      return null;
    }

    const updatedRun = {
      ...TEMP_PIPELINE_RUNS[runIndex],
      status,
      updatedAt: new Date().toISOString(),
      ...updates,
    };

    // 완료 상태인 경우 duration 계산
    if ((status === 'success' || status === 'failed') && !updatedRun.completedAt) {
      updatedRun.completedAt = new Date().toISOString();
      const startTime = new Date(updatedRun.startedAt).getTime();
      const endTime = new Date(updatedRun.completedAt).getTime();
      updatedRun.duration = Math.round((endTime - startTime) / 1000);
    }

    TEMP_PIPELINE_RUNS[runIndex] = updatedRun;

    console.log('파이프라인 실행 상태 업데이트:', {
      runId,
      status,
      duration: updatedRun.duration,
    });

    return updatedRun;

  } catch (error) {
    console.error('파이프라인 실행 상태 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 파이프라인의 실행 기록 목록을 조회합니다.
 *
 * @param pipelineId - 파이프라인 ID
 * @param page - 페이지 번호 (기본값: 1)
 * @param limit - 페이지당 항목 수 (기본값: 20)
 * @returns 실행 기록 목록
 */
export async function getPipelineRuns(
  pipelineId: string,
  page: number = 1,
  limit: number = 20
): Promise<PipelineRunListResponse> {
  try {
    // TODO: 실제로는 백엔드 API 호출
    // const connection = makeFetch();
    // const result = await functional.pipelines.getRuns(connection, pipelineId, { page, limit });

    const allRuns = TEMP_PIPELINE_RUNS
      .filter(run => run.pipelineId === pipelineId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const runs = allRuns.slice(startIndex, endIndex);

    return {
      runs,
      total: allRuns.length,
      page,
      limit,
    };

  } catch (error) {
    console.error('파이프라인 실행 기록 조회 실패:', error);
    throw error;
  }
}

/**
 * 특정 실행 기록을 조회합니다.
 *
 * @param runId - 실행 기록 ID
 * @returns 실행 기록 또는 null
 */
export async function getPipelineRun(runId: string): Promise<PipelineRun | null> {
  try {
    // TODO: 실제로는 백엔드 API 호출
    // const connection = makeFetch();
    // const result = await functional.pipelines.getRun(connection, runId);

    const run = TEMP_PIPELINE_RUNS.find(r => r.id === runId);
    return run || null;

  } catch (error) {
    console.error('파이프라인 실행 기록 조회 실패:', error);
    return null;
  }
}

/**
 * 파이프라인의 최신 실행 기록을 조회합니다.
 *
 * @param pipelineId - 파이프라인 ID
 * @returns 최신 실행 기록 또는 null
 */
export async function getLatestPipelineRun(pipelineId: string): Promise<PipelineRun | null> {
  try {
    const runs = TEMP_PIPELINE_RUNS
      .filter(run => run.pipelineId === pipelineId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return runs[0] || null;

  } catch (error) {
    console.error('최신 파이프라인 실행 기록 조회 실패:', error);
    return null;
  }
}