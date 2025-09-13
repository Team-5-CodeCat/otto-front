'use client';

import { create } from 'zustand';
import { functional } from '@cooodecat/otto-sdk';
import makeFetch from './make-fetch';

// SDK 타입 추출
type PipelineItem = Awaited<ReturnType<typeof functional.pipelines.findAll>>['pipelines'][0];
type PipelineQueryParams = Parameters<typeof functional.pipelines.findAll>[1];

interface PipelineState {
  // 데이터
  pipelines: PipelineItem[];
  selectedPipelineId: string | null;
  currentProjectId: string | null;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션들
  fetchPipelines: (projectId?: string) => Promise<void>;
  fetchPipelinesByProject: (projectId: string) => Promise<void>;
  setSelectedPipeline: (pipelineId: string) => void;
  setCurrentProject: (projectId: string) => void;
  refreshPipelines: (projectId?: string) => Promise<void>;
  
  // 헬퍼
  getSelectedPipeline: () => PipelineItem | null;
  getPipelinesByProject: (projectId: string) => PipelineItem[];
  clearError: () => void;
  clearPipelines: () => void;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  // 초기 상태
  pipelines: [],
  selectedPipelineId: null,
  currentProjectId: null,
  isLoading: false,
  error: null,

  // 파이프라인 목록 조회 (전체 또는 프로젝트별)
  fetchPipelines: async (projectId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const connection = makeFetch();
      const query: PipelineQueryParams = {};
      
      // 특정 프로젝트의 파이프라인만 조회하는 경우
      if (projectId) {
        query.projectId = projectId;
        set({ currentProjectId: projectId });
      }
      
      const result = await functional.pipelines.findAll(connection, query);
      const pipelines = result.pipelines || [];
      
      set({ 
        pipelines,
        isLoading: false,
        // 첫 번째 파이프라인을 기본 선택 (기존에 선택된게 없는 경우)
        selectedPipelineId: get().selectedPipelineId ?? (pipelines.length > 0 ? pipelines[0]?.pipelineId ?? null : null)
      });
    } catch (error) {
      console.error('파이프라인 목록 조회 실패:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '파이프라인을 불러올 수 없습니다.',
        pipelines: []
      });
    }
  },

  // 프로젝트의 파이프라인 목록 조회 (호환성 유지)
  fetchPipelinesByProject: async (projectId: string) => {
    await get().fetchPipelines(projectId);
  },

  // 파이프라인 선택
  setSelectedPipeline: (pipelineId: string) => {
    set({ selectedPipelineId: pipelineId });
  },

  // 현재 프로젝트 설정
  setCurrentProject: (projectId: string) => {
    set({ currentProjectId: projectId });
    // 프로젝트가 변경되면 해당 프로젝트의 파이프라인들을 조회
    get().fetchPipelines(projectId);
  },

  // 파이프라인 새로고침 (강제)
  refreshPipelines: async (projectId?: string) => {
    const targetProjectId = projectId || get().currentProjectId;
    await get().fetchPipelines(targetProjectId || undefined);
  },

  // 선택된 파이프라인 반환
  getSelectedPipeline: () => {
    const { pipelines, selectedPipelineId } = get();
    return pipelines.find(p => p.pipelineId === selectedPipelineId) || null;
  },

  // 특정 프로젝트의 파이프라인들 반환
  getPipelinesByProject: (projectId: string) => {
    const { pipelines } = get();
    return pipelines.filter(p => p.projectId === projectId);
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },

  // 파이프라인 목록 클리어
  clearPipelines: () => {
    set({ pipelines: [], selectedPipelineId: null });
  },
}));