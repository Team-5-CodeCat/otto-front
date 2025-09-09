'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { functional } from '@Team-5-CodeCat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

export interface PushEvent {
  id: string;
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  baseRef: string | null;
  compare: string;
  commits: {
    id: string;
    treeId: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username?: string;
    };
    committer: {
      name: string;
      email: string;
      username?: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  }[];
  headCommit: {
    id: string;
    treeId: string;
    distinct: boolean;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
      username?: string;
    };
    committer: {
      name: string;
      email: string;
      username?: string;
    };
    added: string[];
    removed: string[];
    modified: string[];
  } | null;
  repository: {
    id: number;
    nodeId: string;
    name: string;
    fullName: string;
    private: boolean;
    htmlUrl: string;
    description: string | null;
    fork: boolean;
    url: string;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    gitUrl: string;
    sshUrl: string;
    cloneUrl: string;
    size: number;
    stargazersCount: number;
    watchersCount: number;
    language: string | null;
    hasIssues: boolean;
    hasProjects: boolean;
    hasWiki: boolean;
    hasPages: boolean;
    forksCount: number;
    archived: boolean;
    disabled: boolean;
    openIssuesCount: number;
    forks: number;
    openIssues: number;
    watchers: number;
    defaultBranch: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  sender: {
    login: string;
    id: number;
    nodeId: string;
    avatarUrl: string;
    gravatarId: string;
    url: string;
    htmlUrl: string;
    type: string;
    siteAdmin: boolean;
  };
  createdAt: string;
  projectId: string;
}

interface UsePushEventsOptions {
  projectId: string;
  pollingInterval?: number;
  enabled?: boolean;
}

interface UsePushEventsReturn {
  pushEvents: PushEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export function usePushEvents({
  projectId,
  pollingInterval = 30000,
  enabled = true,
}: UsePushEventsOptions): UsePushEventsReturn {
  const [pushEvents, setPushEvents] = useState<PushEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Otto SDK connection (향후 push events API 추가시 사용)
  const connection = useMemo(() => makeFetch(), []);

  const fetchPushEvents = useCallback(async (): Promise<void> => {
    if (!projectId) return;

    try {
      setError(null);
      setIsLoading(true);

      // TODO: Otto SDK에 push events API가 추가되면 아래 코드로 교체 - by 진우
      // const events = await functional.projects.projectGetPushEvents(connection, projectId);

      // 현재는 fetch 사용 (Otto SDK에 push events API가 없음)
      const response = await fetch(
        `http://localhost:4004/api/v1/projects/${projectId}/push-events`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // 쿠키 기반 인증 사용
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `푸시 이벤트 조회 실패: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log('푸시 이벤트 API 응답:', responseData);

      // 백엔드에서 실제 푸시 이벤트 데이터만 반환됨
      // 데이터가 없을 때는 빈 배열이 반환되므로 그대로 사용
      const events: PushEvent[] = Array.isArray(responseData) ? responseData : [];

      console.log('추출된 이벤트:', events);
      console.log('이벤트 개수:', events.length);
      setPushEvents(events);
      lastFetchRef.current = Date.now();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '푸시 이벤트를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('푸시 이벤트 조회 에러:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const startPolling = useCallback(() => {
    if (pollingRef.current || !enabled) return;

    setIsPolling(true);

    // 즉시 한 번 실행
    fetchPushEvents();

    // 정기적 폴링 시작
    pollingRef.current = setInterval(() => {
      fetchPushEvents();
    }, pollingInterval);
  }, [fetchPushEvents, pollingInterval, enabled]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      setIsPolling(false);
    }
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchPushEvents();
  }, [fetchPushEvents]);

  // 컴포넌트 마운트 시 폴링 시작
  useEffect(() => {
    if (enabled && projectId) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, projectId, startPolling, stopPolling]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    pushEvents,
    isLoading,
    error,
    refetch,
    startPolling,
    stopPolling,
    isPolling,
  };
}
