'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FilterPanel from './FilterPanel';
import PipelineLogsHeader from './PipelineLogsHeader';
import PipelineLogsTable from './PipelineLogsTable';

interface PipelineLogsPageProps {
  projectId?: string;
}

// 메인 페이지 컴포넌트 (/project/{project-id}/logs)
const PipelineLogsPage: React.FC<PipelineLogsPageProps> = () => {
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLogIds, setNewLogIds] = useState(new Set(['5'])); // 최신 로그를 계속 하이라이트
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const LOGS_PER_PAGE = 10;
  const MAX_LOGS = 50;

  // 샘플 데이터 (최신순 정렬 - id 5가 최신, id 1이 가장 오래된)
  const sampleLogs = [
    {
      id: '5',
      status: 'success',
      pipelineName: 'E2E Tests',
      trigger: { type: 'Push to develop', author: 'dev-team', time: '1s ago' },
      branch: 'develop',
      commit: { message: 'test: Update checkout flow tests', sha: 'e5f6789', author: 'Dev Team' },
      duration: '15m 0s',
      isNew: true,
    },
    {
      id: '4',
      status: 'pending',
      pipelineName: 'Mobile App Build',
      trigger: { type: 'Scheduled build', author: 'system', time: '50m ago' },
      branch: 'release/v2.1',
      commit: { message: 'release: Prepare v2.1.0 release', sha: 'd4e5f67', author: 'Release Bot' },
      duration: '-',
      isNew: false,
    },
    {
      id: '3',
      status: 'failed',
      pipelineName: 'Database Migration',
      trigger: { type: 'Manual trigger', author: 'admin', time: '5h ago' },
      branch: 'migration-v2',
      commit: {
        message: 'migration: Add user preferences table',
        sha: 'c3d4e5f',
        author: 'Admin User',
      },
      duration: '3m 0s',
      isNew: false,
    },
    {
      id: '2',
      status: 'success',
      pipelineName: 'Backend API',
      trigger: { type: 'PR #123 merged', author: 'jane-smith', time: '3h ago' },
      branch: 'develop',
      commit: {
        message: 'fix: Resolve authentication middleware issue',
        sha: 'b2c3d44',
        author: 'Jane Smith',
      },
      duration: '7m 0s',
      isNew: false,
    },
    {
      id: '1',
      status: 'running',
      pipelineName: 'Frontend Deploy',
      trigger: { type: 'Push to main', author: 'john-doe', time: '2h ago' },
      branch: 'main',
      commit: {
        message: 'feat: Add new user dashboard component',
        sha: 'a1b2c34',
        author: 'John Doe',
      },
      duration: '19m 33s',
      isNew: false,
    },
  ];

  // 초기 데이터 로드
  useEffect(() => {
    const initialLogs = sampleLogs.slice(0, LOGS_PER_PAGE);
    setDisplayedLogs(initialLogs);
    setPage(1);
    setNewLogIds(new Set(['5']));
  }, []);

  // 더 많은 데이터 로드 함수
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션
    setTimeout(() => {
      const startIndex = page * LOGS_PER_PAGE;
      const endIndex = startIndex + LOGS_PER_PAGE;
      const newLogs = sampleLogs.slice(startIndex, endIndex);
      
      if (newLogs.length > 0) {
        setDisplayedLogs(prev => [...prev, ...newLogs]);
        setPage(prev => prev + 1);
        
        // 최대 개수에 도달하면 더 이상 로드하지 않음
        if (displayedLogs.length + newLogs.length >= MAX_LOGS || endIndex >= sampleLogs.length) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
      
      setIsLoading(false);
    }, 1000); // 1초 딜레이 시뮬레이션
  }, [isLoading, hasMore, page, displayedLogs.length]);

  // Live 모드 시뮬레이션 (polling 시뮬레이션)
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // 실제 구현에서는 여기서 새로운 로그를 fetch하고
        // 새 로그가 있으면 newLogIds에 추가
        console.log('Polling for new logs...');
      }, 5000); // 5초마다 polling
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const handleLiveToggle = (checked: boolean) => {
    setIsLive(checked);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className='h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-4 flex flex-col overflow-hidden'>
      <div className='flex gap-6 flex-1 max-w-[1600px] mx-auto w-full overflow-hidden'>
        {/* 좌측 필터 패널 - 고정 */}
        <div className='w-80 shrink-0'>
          <FilterPanel />
        </div>

        {/* 메인 콘텐츠 */}
        <div className='flex-1 flex flex-col gap-6 min-w-0 overflow-hidden'>
          {/* 헤더 - 고정 */}
          <div className='shrink-0'>
            <PipelineLogsHeader
              isLive={isLive}
              onLiveToggle={handleLiveToggle}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* 로그 테이블 - 스크롤 가능 */}
          <div className='flex-1 overflow-hidden'>
            <PipelineLogsTable 
              logs={displayedLogs} 
              newLogIds={newLogIds}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineLogsPage;
