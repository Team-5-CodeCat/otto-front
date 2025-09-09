'use client';

import { useReducer, useCallback, useEffect } from 'react';

export type ProjectStep = 'basic' | 'github' | 'repository' | 'review';

export interface ProjectBasicInfo {
  name: string;
  language: 'node.js';
  deploy: 'EC2';
}

export interface GitHubSelection {
  installationId: number | null;
  repositoryName: string | null;
  branch: string | null;
}

export interface ProjectState {
  step: ProjectStep;
  basicInfo: ProjectBasicInfo;
  githubSelection: GitHubSelection;
  isSubmitting: boolean;
  submitError: string | null;
  isPollingGitHubStatus: boolean;
}

type ProjectAction =
  | { type: 'SET_STEP'; payload: ProjectStep }
  | { type: 'SET_BASIC_INFO'; payload: Partial<ProjectBasicInfo> }
  | { type: 'SET_GITHUB_SELECTION'; payload: Partial<GitHubSelection> }
  | { type: 'RESET_GITHUB_SELECTION' }
  | { type: 'RESET_REPOSITORY_SELECTION' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUBMIT_ERROR'; payload: string | null }
  | { type: 'SET_POLLING_GITHUB_STATUS'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: Partial<ProjectState> }
  | { type: 'CLEAR_SESSION' };

const initialState: ProjectState = {
  step: 'basic',
  basicInfo: {
    name: '',
    language: 'node.js',
    deploy: 'EC2',
  },
  githubSelection: {
    installationId: null,
    repositoryName: null,
    branch: null,
  },
  isSubmitting: false,
  submitError: null,
  isPollingGitHubStatus: false,
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'SET_BASIC_INFO':
      return {
        ...state,
        basicInfo: { ...state.basicInfo, ...action.payload },
      };

    case 'SET_GITHUB_SELECTION':
      return {
        ...state,
        githubSelection: { ...state.githubSelection, ...action.payload },
      };

    case 'RESET_GITHUB_SELECTION':
      return {
        ...state,
        githubSelection: {
          installationId: null,
          repositoryName: null,
          branch: null,
        },
      };

    case 'RESET_REPOSITORY_SELECTION':
      return {
        ...state,
        githubSelection: {
          ...state.githubSelection,
          repositoryName: null,
          branch: null,
        },
      };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };

    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.payload };

    case 'SET_POLLING_GITHUB_STATUS':
      return { ...state, isPollingGitHubStatus: action.payload };

    case 'RESTORE_SESSION':
      return { ...state, ...action.payload };

    case 'CLEAR_SESSION':
      return initialState;

    default:
      return state;
  }
}

const SESSION_KEY = 'otto-project-creation';

export function useProjectCreation() {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // 세션 복원
  useEffect(() => {
    const savedState = sessionStorage.getItem(SESSION_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'RESTORE_SESSION', payload: parsedState });
      } catch (error) {
        console.error('Failed to restore project creation session:', error);
      }
    }
  }, []);

  // 세션 저장
  const saveSession = useCallback(() => {
    const sessionData = {
      basicInfo: state.basicInfo,
      step: state.step,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }, [state.basicInfo, state.step]);

  // 기본 정보가 변경될 때 세션 저장
  useEffect(() => {
    if (state.basicInfo.name) {
      saveSession();
    }
  }, [state.basicInfo, saveSession]);

  const setStep = useCallback((step: ProjectStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setBasicInfo = useCallback((info: Partial<ProjectBasicInfo>) => {
    dispatch({ type: 'SET_BASIC_INFO', payload: info });
  }, []);

  const setGitHubSelection = useCallback(
    (selection: Partial<GitHubSelection>) => {
      dispatch({ type: 'SET_GITHUB_SELECTION', payload: selection });

      // GitHub 계정/조직을 변경하면 레포지토리와 브랜치 리셋
      if (
        selection.installationId !== undefined &&
        selection.installationId !== state.githubSelection.installationId
      ) {
        dispatch({ type: 'RESET_REPOSITORY_SELECTION' });
      }

      // 레포지토리를 변경하면 브랜치 리셋
      if (
        selection.repositoryName !== undefined &&
        selection.repositoryName !== state.githubSelection.repositoryName
      ) {
        dispatch({ type: 'SET_GITHUB_SELECTION', payload: { branch: null } });
      }
    },
    [state.githubSelection.installationId, state.githubSelection.repositoryName]
  );

  const resetGitHubSelection = useCallback(() => {
    dispatch({ type: 'RESET_GITHUB_SELECTION' });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
  }, []);

  const setSubmitError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_SUBMIT_ERROR', payload: error });
  }, []);

  const setPollingGitHubStatus = useCallback((isPolling: boolean) => {
    dispatch({ type: 'SET_POLLING_GITHUB_STATUS', payload: isPolling });
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  const goToNextStep = useCallback(() => {
    switch (state.step) {
      case 'basic':
        setStep('github');
        break;
      case 'github':
        setStep('repository');
        break;
      case 'repository':
        setStep('review');
        break;
    }
  }, [state.step, setStep]);

  const goToPreviousStep = useCallback(() => {
    switch (state.step) {
      case 'github':
        setStep('basic');
        break;
      case 'repository':
        setStep('github');
        break;
      case 'review':
        setStep('repository');
        break;
    }
  }, [state.step, setStep]);

  // 검증 함수들
  const canProceedFromBasic = useCallback(() => {
    return state.basicInfo.name.trim().length > 0;
  }, [state.basicInfo.name]);

  const canProceedFromGitHub = useCallback(() => {
    return state.githubSelection.installationId !== null;
  }, [state.githubSelection.installationId]);

  const canProceedFromRepository = useCallback(() => {
    return (
      state.githubSelection.installationId !== null &&
      state.githubSelection.repositoryName !== null &&
      state.githubSelection.branch !== null
    );
  }, [state.githubSelection]);

  const canCreateProject = useCallback(() => {
    return canProceedFromBasic() && canProceedFromRepository();
  }, [canProceedFromBasic, canProceedFromRepository]);

  return {
    state,
    setStep,
    setBasicInfo,
    setGitHubSelection,
    resetGitHubSelection,
    setSubmitting,
    setSubmitError,
    setPollingGitHubStatus,
    clearSession,
    goToNextStep,
    goToPreviousStep,
    canProceedFromBasic,
    canProceedFromGitHub,
    canProceedFromRepository,
    canCreateProject,
  };
}
