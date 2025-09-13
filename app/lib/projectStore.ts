'use client';

import { create } from 'zustand';
import { functional } from '@cooodecat/otto-sdk';
import makeFetch from './make-fetch';

// SDK 타입 추출
type UserProject = Awaited<ReturnType<typeof functional.projects.projectGetUserProjects>>[0];

interface ProjectState {
  // 데이터
  projects: UserProject[];
  selectedProjectId: string | null;
  
  // 상태
  isLoading: boolean;
  error: string | null;
  
  // 액션들
  fetchProjects: () => Promise<void>;
  setSelectedProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
  
  // 헬퍼
  getSelectedProject: () => UserProject | null;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 초기 상태
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,

  // 프로젝트 목록 조회
  fetchProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const connection = makeFetch();
      const projects = await functional.projects.projectGetUserProjects(connection);
      
      set({ 
        projects,
        isLoading: false,
        // 첫 번째 프로젝트를 기본 선택 (기존에 선택된게 없는 경우)
        selectedProjectId: get().selectedProjectId ?? (projects.length > 0 ? projects[0]?.projectId ?? null : null)
      });
    } catch (error) {
      console.error('프로젝트 목록 조회 실패:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '프로젝트를 불러올 수 없습니다.',
        projects: []
      });
    }
  },

  // 프로젝트 선택
  setSelectedProject: (projectId: string) => {
    set({ selectedProjectId: projectId });
  },

  // 프로젝트 새로고침 (강제)
  refreshProjects: async () => {
    await get().fetchProjects();
  },

  // 선택된 프로젝트 반환
  getSelectedProject: () => {
    const { projects, selectedProjectId } = get();
    return projects.find(p => p.projectId === selectedProjectId) || null;
  },

  // 에러 클리어
  clearError: () => {
    set({ error: null });
  },
}));