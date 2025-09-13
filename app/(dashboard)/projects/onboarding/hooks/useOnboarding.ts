'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { functional, type IConnection } from '@cooodecat/otto-sdk';
import { projectCreateOnboardingProject } from '@cooodecat/otto-sdk/lib/functional/projects/onboarding';
import makeFetch from '@/app/lib/make-fetch';

// 온보딩 단계 타입
export type OnboardingStep = 'welcome' | 'project-name' | 'github-setup' | 'repository' | 'review' | 'creating' | 'complete';

// 온보딩 데이터 타입
export interface OnboardingData {
  projectName: string;
  githubOwner: string;
  githubRepoId: number | null;
  githubRepoName: string;
  githubRepoUrl: string;
  installationId: number | null;
  selectedBranch: string;
}

// 온보딩 상태 타입
interface OnboardingState {
  currentStep: OnboardingStep;
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  isGitHubConnected: boolean;
  availableRepositories: any[];
  githubInstallUrl: string | null;
  isPollingGitHub: boolean;
}

// 초기 온보딩 데이터
const initialData: OnboardingData = {
  projectName: '',
  githubOwner: '',
  githubRepoId: null,
  githubRepoName: '',
  githubRepoUrl: '',
  installationId: null,
  selectedBranch: 'main',
};

// 초기 온보딩 상태
const initialState: OnboardingState = {
  currentStep: 'welcome',
  data: initialData,
  isLoading: false,
  error: null,
  isGitHubConnected: false,
  availableRepositories: [],
  githubInstallUrl: null,
  isPollingGitHub: false,
};

export function useOnboarding() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>(initialState);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const connection = useMemo<IConnection>(() => makeFetch(), []);

  // 단계 이동
  const goToStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentStep: step, error: null }));
  }, []);

  // 다음 단계로 이동
  const nextStep = useCallback(() => {
    const stepOrder: OnboardingStep[] = ['welcome', 'project-name', 'github-setup', 'repository', 'review', 'creating', 'complete'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1 && currentIndex >= 0) {
      goToStep(stepOrder[currentIndex + 1]!);
    }
  }, [state.currentStep, goToStep]);

  // 이전 단계로 이동
  const prevStep = useCallback(() => {
    const stepOrder: OnboardingStep[] = ['welcome', 'project-name', 'github-setup', 'repository', 'review', 'creating', 'complete'];
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0 && currentIndex >= 0) {
      goToStep(stepOrder[currentIndex - 1]!);
    }
  }, [state.currentStep, goToStep]);

  // 데이터 업데이트
  const updateData = useCallback((partialData: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...partialData },
      error: null,
    }));
  }, []);

  // GitHub 설치 URL 가져오기
  const fetchGitHubInstallUrl = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await functional.projects.github.install_url.getGithubInstallUrl(connection);
      const installUrl = response.installUrl;
      
      if (!installUrl || typeof installUrl !== 'string' || installUrl.trim() === '') {
        throw new Error('GitHub 설치 URL을 가져올 수 없습니다.');
      }
      
      setState(prev => ({
        ...prev,
        githubInstallUrl: installUrl,
        isLoading: false,
      }));
      
      return installUrl;
    } catch (error) {
      console.error('GitHub 설치 URL 가져오기 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'GitHub 설치 URL을 가져올 수 없습니다.',
      }));
      return null;
    }
  }, [connection]);

  // GitHub App 설치 시작
  const installGitHubApp = useCallback(async () => {
    const installUrl = state.githubInstallUrl || await fetchGitHubInstallUrl();
    
    if (installUrl) {
      // 팝업 창으로 GitHub 설치 열기
      const popup = window.open(
        installUrl,
        'github-install',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );
      
      if (!popup) {
        // 팝업이 차단된 경우 현재 창에서 열기
        window.location.href = installUrl;
        return;
      }
      
      // 폴링 시작
      startPolling();
      
      // 팝업 모니터링
      const popupMonitor = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupMonitor);
          checkGitHubConnection();
        }
      }, 1000);
      
      // 10분 후 자동 정리
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(popupMonitor);
        }
      }, 10 * 60 * 1000);
    }
  }, [state.githubInstallUrl, fetchGitHubInstallUrl]);
  
  // GitHub 상태 폴링 시작
  const startPolling = useCallback(() => {
    if (pollingInterval) return;
    
    setState(prev => ({ ...prev, isPollingGitHub: true }));
    
    const interval = setInterval(async () => {
      const isConnected = await checkGitHubConnection();
      if (isConnected) {
        stopPolling();
      }
    }, 3000);
    
    setPollingInterval(interval);
  }, [pollingInterval]);
  
  // GitHub 상태 폴링 중지
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setState(prev => ({ ...prev, isPollingGitHub: false }));
    }
  }, [pollingInterval]);

  // GitHub 연결 상태 확인
  const checkGitHubConnection = useCallback(async () => {
    try {
      const installations = await functional.projects.github_installations.projectGetUserGithubInstallations(connection);
      
      if (installations.length > 0) {
        setState(prev => ({
          ...prev,
          isGitHubConnected: true,
          data: {
            ...prev.data,
            installationId: installations[0]?.installationId ? parseInt(installations[0].installationId) : null,
            githubOwner: installations[0]?.accountLogin || '',
          }
        }));
        return true;
      } else {
        setState(prev => ({
          ...prev,
          isGitHubConnected: false,
        }));
        return false;
      }
    } catch (error) {
      console.error('GitHub 연결 확인 실패:', error);
      setState(prev => ({
        ...prev,
        error: 'GitHub 연결을 확인할 수 없습니다.',
        isGitHubConnected: false,
      }));
      return false;
    }
  }, [connection]);

  // 사용 가능한 저장소 조회
  const fetchRepositories = useCallback(async () => {
    if (!state.data.installationId) {
      setState(prev => ({ ...prev, error: 'GitHub 설치 ID가 없습니다.' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const repositories = await functional.projects.github_installations.repositories.projectGetAvailableRepositories(
        connection,
        String(state.data.installationId)
      );
      
      setState(prev => ({
        ...prev,
        availableRepositories: repositories,
        isLoading: false,
      }));
    } catch (error) {
      console.error('저장소 조회 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '저장소를 불러올 수 없습니다.',
        availableRepositories: [],
      }));
    }
  }, [state.data.installationId, connection]);

  // 온보딩 프로젝트 생성
  const createOnboardingProject = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      goToStep('creating');

      const connection = makeFetch();
      const response = await projectCreateOnboardingProject(connection, {
        projectName: state.data.projectName,
        githubOwner: state.data.githubOwner,
        githubRepoId: String(state.data.githubRepoId!),
        githubRepoName: state.data.githubRepoName,
        githubRepoUrl: state.data.githubRepoUrl,
        installationId: String(state.data.installationId!),
        selectedBranch: state.data.selectedBranch,
      });

      setState(prev => ({ ...prev, isLoading: false }));
      goToStep('complete');

      // 성공 시 생성된 프로젝트의 파이프라인 페이지로 리다이렉트
      setTimeout(() => {
        // 응답에서 projectId를 받아와서 해당 프로젝트의 파이프라인 페이지로 이동
        if (response && response.project?.projectId) {
          router.push(`/projects/${response.project.projectId}/pipelines`);
        } else {
          // projectId가 없으면 온보딩 페이지에 머물기
          console.warn('프로젝트 ID를 받지 못했습니다.');
        }
      }, 3000);

    } catch (error) {
      console.error('온보딩 프로젝트 생성 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.',
      }));
      // 에러 시 리뷰 단계로 돌아가기
      goToStep('review');
    }
  }, [state.data, router, goToStep]);

  // 온보딩 완료 여부 확인
  const canProceedToNext = useCallback(() => {
    switch (state.currentStep) {
      case 'welcome':
        return true;
      case 'project-name':
        return state.data.projectName.trim().length > 0;
      case 'github-setup':
        return state.isGitHubConnected;
      case 'repository':
        return state.data.githubRepoId !== null && state.data.githubRepoName.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [state.currentStep, state.data, state.isGitHubConnected]);

  // 초기 GitHub 상태 확인
  useEffect(() => {
    checkGitHubConnection();
  }, [connection]);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    ...state,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    checkGitHubConnection,
    fetchRepositories,
    createOnboardingProject,
    canProceedToNext,
    
    // GitHub 관련 기능들
    installGitHubApp,
    fetchGitHubInstallUrl,
    startPolling,
    stopPolling,
  };
}