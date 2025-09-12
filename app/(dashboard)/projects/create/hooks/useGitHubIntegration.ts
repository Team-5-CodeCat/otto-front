'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { functional, type IConnection } from '@cooodecat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

// SDK 타입 추출
type GitHubStatus = Awaited<ReturnType<typeof functional.projects.github.status.getGithubStatus>>;
type GitHubInstallation = Awaited<
  ReturnType<typeof functional.projects.github_installations.projectGetUserGithubInstallations>
>[0];
type Repository = Awaited<
  ReturnType<
    typeof functional.projects.github_installations.repositories.projectGetAvailableRepositories
  >
>[0];
type Branch = Awaited<
  ReturnType<
    typeof functional.projects.github_installations.repositories.branches.getRepositoryBranchesFromInstallation
  >
>[0];
type GitHubInstallUrlResponse = Awaited<
  ReturnType<typeof functional.projects.github.install_url.getGithubInstallUrl>
>;

// 타입 가드 함수들
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasProperty = <T extends string>(obj: unknown, property: T): obj is Record<T, unknown> => {
  return isObject(obj) && property in obj;
};

interface GitHubState {
  status: GitHubStatus | null;
  installations: GitHubInstallation[];
  repositories: Repository[];
  branches: Branch[];
  installUrl: string | null;
}

interface LoadingState {
  status: boolean;
  installations: boolean;
  repositories: boolean;
  branches: boolean;
  installUrl: boolean;
}

interface ErrorState {
  status: string | null;
  installations: string | null;
  repositories: string | null;
  branches: string | null;
  installUrl: string | null;
}

const initialGitHubState: GitHubState = {
  status: null,
  installations: [],
  repositories: [],
  branches: [],
  installUrl: null,
};

const initialLoadingState: LoadingState = {
  status: false,
  installations: false,
  repositories: false,
  branches: false,
  installUrl: false,
};

const initialErrorState: ErrorState = {
  status: null,
  installations: null,
  repositories: null,
  branches: null,
  installUrl: null,
};

export function useGitHubIntegration() {
  const [data, setData] = useState<GitHubState>(initialGitHubState);
  const [loading, setLoading] = useState<LoadingState>(initialLoadingState);
  const [errors, setErrors] = useState<ErrorState>(initialErrorState);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const connection = useMemo<IConnection>(() => makeFetch(), []);

  const handleError = (key: keyof ErrorState, error: unknown) => {
    let message = '알 수 없는 오류가 발생했습니다';

    if (isError(error)) {
      message = error.message;

      // HTTP 응답 에러인 경우 더 구체적인 메시지 추출 시도
      try {
        // 에러 메시지가 JSON 형태인 경우 파싱 시도
        if (error.message.includes('{') && error.message.includes('}')) {
          const errorData = JSON.parse(error.message);
          if (
            isObject(errorData) &&
            hasProperty(errorData, 'message') &&
            isString(errorData.message)
          ) {
            message = errorData.message;
          }
        }
      } catch {
        // JSON 파싱 실패시 원래 메시지 사용
      }
    }

    // 특정 오류에 대한 사용자 친화적 메시지
    if (message.includes('404') || message.includes('Not Found')) {
      if (key === 'repositories') {
        message = '선택한 설치에서 레포지토리를 찾을 수 없습니다. 권한을 확인해주세요.';
      } else if (key === 'branches') {
        message =
          '선택한 레포지토리의 브랜치를 찾을 수 없습니다. 레포지토리가 존재하는지 확인해주세요.';
      }
    } else if (message.includes('403') || message.includes('Forbidden')) {
      message = 'GitHub 앱의 권한이 부족합니다. 레포지토리 접근 권한을 확인해주세요.';
    } else if (message.includes('401') || message.includes('Unauthorized')) {
      message = '인증이 만료되었습니다. 페이지를 새로고침하고 다시 시도해주세요.';
    } else if (message.includes('Network Error') || message.includes('fetch')) {
      message = '네트워크 연결을 확인하고 다시 시도해주세요.';
    }

    setErrors((prev) => ({ ...prev, [key]: message }));
    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  // GitHub 상태 확인
  const fetchGitHubStatus = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, status: true }));
      setErrors((prev) => ({ ...prev, status: null }));

      const status = await functional.projects.github.status.getGithubStatus(connection);
      setData((prev) => ({ ...prev, status }));

      return status;
    } catch (error) {
      handleError('status', error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, status: false }));
    }
  }, [connection]);

  // GitHub 설치 URL 가져오기
  const fetchInstallUrl = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, installUrl: true }));
      setErrors((prev) => ({ ...prev, installUrl: null }));

      console.log('GitHub 설치 URL API 호출 시작...');
      const response: GitHubInstallUrlResponse =
        await functional.projects.github.install_url.getGithubInstallUrl(connection);
      console.log('API 응답:', response);

      // 타입 안전한 속성 접근
      const installUrl = response.installUrl;
      console.log('추출된 설치 URL:', installUrl);

      if (!isString(installUrl) || installUrl.trim() === '') {
        throw new Error('설치 URL이 응답에 없거나 유효하지 않습니다.');
      }

      setData((prev) => ({ ...prev, installUrl }));
      return installUrl;
    } catch (error) {
      console.error('GitHub 설치 URL 가져오기 실패:', error);
      handleError('installUrl', error);
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, installUrl: false }));
    }
  }, [connection]);

  // GitHub 설치 목록 가져오기
  const fetchInstallations = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, installations: true }));
      setErrors((prev) => ({ ...prev, installations: null }));

      const installations =
        await functional.projects.github_installations.projectGetUserGithubInstallations(
          connection
        );
      setData((prev) => ({ ...prev, installations }));

      return installations;
    } catch (error) {
      handleError('installations', error);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, installations: false }));
    }
  }, [connection]);

  // 레포지토리 목록 가져오기
  const fetchRepositories = useCallback(
    async (installationId: number) => {
      try {
        setLoading((prev) => ({ ...prev, repositories: true }));
        setErrors((prev) => ({ ...prev, repositories: null }));

        const repositories =
          await functional.projects.github_installations.repositories.projectGetAvailableRepositories(
            connection,
            installationId.toString()
          );

        setData((prev) => ({ ...prev, repositories }));
        return repositories;
      } catch (error) {
        handleError('repositories', error);
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, repositories: false }));
      }
    },
    [connection]
  );

  // 브랜치 목록 가져오기 (Otto SDK 사용)
  const fetchBranches = useCallback(
    async (installationId: number, repositoryName: string) => {
      try {
        setLoading((prev) => ({ ...prev, branches: true }));
        setErrors((prev) => ({ ...prev, branches: null }));

        console.log('브랜치 조회 API 시작 (Otto SDK 사용)');
        console.log('요청 파라미터:', { installationId, repositoryName });

        // repositoryName을 repoFullName으로 변환 (owner/repo 형식)
        const installations = data.installations;
        const installation = installations.find(
          (install) => install.installationId === installationId.toString()
        );

        if (!installation) {
          throw new Error('GitHub 설치 정보를 찾을 수 없습니다.');
        }

        if (!installation.accountLogin) {
          throw new Error('GitHub 계정 정보가 없습니다.');
        }

        const repoFullName = `${installation.accountLogin}/${repositoryName}`;
        console.log('구성된 repoFullName:', repoFullName);

        // Otto SDK를 사용하여 브랜치 목록 가져오기
        const branches = await functional.projects.github_installations.repositories.branches.getRepositoryBranchesFromInstallation(
          connection,
          installationId.toString(),
          encodeURIComponent(repoFullName)
        );
        console.log('브랜치 데이터:', branches);

        setData((prev) => ({ ...prev, branches }));
        return branches;
      } catch (error) {
        console.error('브랜치 조회 에러:', error);
        handleError('branches', error);
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, branches: false }));
      }
    },
    [connection, data.installations] // installations 의존성 추가
  );

  // GitHub 상태 폴링 시작
  const startPolling = useCallback(() => {
    if (pollingInterval) return; // 이미 폴링 중이면 중복 시작 방지

    const interval = setInterval(async () => {
      const status = await fetchGitHubStatus();
      if (status?.hasInstallation) {
        stopPolling();
        // 설치가 완료되면 설치 목록도 다시 가져오기
        await fetchInstallations();
      }
    }, 3000); // 3초마다 폴링

    setPollingInterval(interval);
  }, [pollingInterval, fetchGitHubStatus, fetchInstallations]);

  // GitHub 상태 폴링 중지
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // GitHub 앱 설치 및 폴링 시작
  const installGitHubApp = useCallback(async () => {
    const installUrl = await fetchInstallUrl();
    console.log('설치 URL 가져오기 완료:', installUrl);

    if (installUrl) {
      console.log('팝업 창 열기 시도:', installUrl);
      // PROJECTS.md 요구사항: 팝업 창으로 GitHub 앱 설치 (새 탭이 아닌 팝업)
      const popup = window.open(
        installUrl,
        'github-install',
        'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );

      if (!popup) {
        console.error('팝업이 차단되었습니다. 브라우저 설정을 확인하세요.');
        // 팝업이 차단된 경우 현재 창에서 열기
        window.location.href = installUrl;
        return;
      }

      console.log('팝업 창 열기 성공, 폴링 및 팝업 모니터링 시작');

      // 팝업 상태 모니터링 (PROJECTS.md 요구사항)
      const popupMonitor = setInterval(() => {
        if (popup.closed) {
          console.log('팝업 창이 닫혔습니다. GitHub 상태를 재확인합니다.');
          clearInterval(popupMonitor);
          // 팝업이 닫히면 GitHub 상태 즉시 재확인
          fetchGitHubStatus();
        }
      }, 1000);

      // 폴링 시작
      startPolling();

      // 정리 함수에서 팝업 모니터링도 정리 (나중에 확장 가능)
      // const originalStopPolling = stopPolling;

      // 10분 후 자동 정리 (타임아웃)
      setTimeout(
        () => {
          if (!popup.closed) {
            console.log('GitHub 설치 타임아웃, 팝업 모니터링 종료');
            clearInterval(popupMonitor);
          }
        },
        10 * 60 * 1000
      ); // 10분
    } else {
      console.error('설치 URL이 없습니다.');
    }
  }, [fetchInstallUrl, startPolling, stopPolling, fetchGitHubStatus]);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 초기 GitHub 상태 확인
  useEffect(() => {
    fetchGitHubStatus();
  }, [fetchGitHubStatus]);

  // GitHub 상태가 설치됨으로 변경되면 설치 목록 가져오기
  useEffect(() => {
    if (data.status?.hasInstallation && data.installations.length === 0) {
      fetchInstallations();
    }
  }, [data.status?.hasInstallation, data.installations.length, fetchInstallations]);

  const clearRepositories = useCallback(() => {
    setData((prev) => ({ ...prev, repositories: [], branches: [] }));
  }, []);

  const clearBranches = useCallback(() => {
    setData((prev) => ({ ...prev, branches: [] }));
  }, []);


  return {
    // 데이터
    status: data.status,
    installations: data.installations,
    repositories: data.repositories,
    branches: data.branches,
    installUrl: data.installUrl,

    // 로딩 상태
    loading,

    // 에러 상태
    errors,

    // 액션들
    fetchGitHubStatus,
    fetchInstallUrl,
    fetchInstallations,
    fetchRepositories,
    fetchBranches,
    installGitHubApp,
    startPolling,
    stopPolling,
    clearRepositories,
    clearBranches,

    // 헬퍼
    isPolling: pollingInterval !== null,
    hasInstallation: data.status?.hasInstallation || false,
  };
}
