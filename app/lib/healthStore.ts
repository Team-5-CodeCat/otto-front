// Health Check 상태 관리 스토어

import * as ottoscalerHealth from '@Team-5-CodeCat/otto-sdk/lib/functional/health/ottoscaler';
import type { OttoscalerHealthDto } from '@Team-5-CodeCat/otto-sdk/lib/structures/OttoscalerHealthDto';
import { makeFetch } from './make-fetch';

// SDK의 타입을 그대로 사용
export type OttoscalerHealth = OttoscalerHealthDto;

interface HealthStore {
  ottoscalerHealth: OttoscalerHealth | null;
  isChecking: boolean;
  lastCheckedAt: string | null;
}

const STORAGE_KEY = 'health_store';

// 초기 상태
const initialState: HealthStore = {
  ottoscalerHealth: null,
  isChecking: false,
  lastCheckedAt: null,
};

// localStorage에서 상태 로드
const loadState = (): HealthStore => {
  if (typeof window === 'undefined') return initialState;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load health store:', error);
  }
  
  return initialState;
};

// localStorage에 상태 저장
const saveState = (state: HealthStore): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save health store:', error);
  }
};

// Health Check API 호출 - SDK 사용
export const checkOttoscalerHealth = async (): Promise<OttoscalerHealth> => {
  try {
    // makeFetch()로 connection 설정을 가져와서 SDK 호출
    const connection = makeFetch();
    const result = await ottoscalerHealth.checkOttoscalerHealth(connection);
    return result;
  } catch (error) {
    // SDK 에러 처리
    if (error instanceof Error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
    throw new Error('Health check failed: Unknown error');
  }
};

// Store 관리 함수들
export const healthStore = {
  // 현재 상태 가져오기
  getState: (): HealthStore => {
    return loadState();
  },

  // Health check 시작
  startHealthCheck: (): void => {
    const state = loadState();
    state.isChecking = true;
    saveState(state);
  },

  // Health check 완료
  setHealthCheckResult: (health: OttoscalerHealth): void => {
    const state = loadState();
    state.ottoscalerHealth = health;
    state.isChecking = false;
    state.lastCheckedAt = new Date().toISOString();
    saveState(state);
  },

  // Health check 실패
  setHealthCheckError: (error: string): void => {
    const state = loadState();
    state.ottoscalerHealth = {
      connected: false,
      status: 'unhealthy',
      responseTime: 0,
      timestamp: new Date().toISOString(),
      error,
    };
    state.isChecking = false;
    state.lastCheckedAt = new Date().toISOString();
    saveState(state);
  },

  // 상태 초기화
  reset: (): void => {
    saveState(initialState);
  },
};