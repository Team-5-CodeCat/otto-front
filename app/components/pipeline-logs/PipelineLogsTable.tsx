'use client';

import React from 'react';
import { Check, Circle } from 'lucide-react';

interface LogItem {
  id: string;
  status: string;
  pipelineName: string;
  trigger: {
    type: string;
    author: string;
    time: string;
  };
  branch: string;
  commit: {
    message: string;
    sha: string;
    author: string;
  };
  duration: string;
}

interface PipelineLogsTableProps {
  logs: LogItem[];
  newLogIds: Set<string>;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

// 향상된 로그 테이블 컴포넌트
const PipelineLogsTable: React.FC<PipelineLogsTableProps> = ({
  logs,
  newLogIds,
  onLoadMore,
  hasMore,
  isLoading,
}) => {
  const observerRef = React.useRef<HTMLTableRowElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // 최신 로그 판별 (5분 이내)
  const isRecentLog = (timeString: string) => {
    const timeValue = parseInt(timeString.match(/\d+/)?.[0] || '0');
    const unit = timeString.includes('s ago')
      ? 'seconds'
      : timeString.includes('m ago')
        ? 'minutes'
        : timeString.includes('h ago')
          ? 'hours'
          : 'hours';

    if (unit === 'seconds') return true;
    if (unit === 'minutes') return timeValue <= 5;
    return false;
  };

  // 행의 배경 스타일 결정
  const getRowClassName = (log: LogItem, index: number) => {
    const isRunning = log.status === 'running';
    const isRecent = isRecentLog(log.trigger.time);

    // 기본 클래스
    let className = 'transition-all duration-200 group cursor-pointer ';

    // 배경 색상 결정 (우선순위: Running > 최신 로그 > 일반)
    if (isRunning) {
      // Running 상태: 노란색 그라데이션 + 펄스
      className +=
        'bg-gradient-to-r from-green-50 to-amber-50 border-l-4 border-green-200 animate-pulse ';
    } else if (isRecent) {
      // 최신 로그 (5분 이내): 파란색 그라데이션 + 펄스
      className += 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-200';
    } else {
      // 일반 로그: 기본 스타일
      className += index % 2 === 0 ? 'bg-white ' : 'bg-gray-50/30 ';
    }

    // 호버 효과 (Running 상태가 아닐 때만)
    if (!isRunning) {
      className += 'hover:bg-gray-50 ';
    }

    return className;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex px-3 py-1 rounded-full text-xs font-medium items-center gap-2 shadow-sm';

    switch (status) {
      case 'running':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`}>
            <div className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></div>
            Running
          </span>
        );
      case 'success':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-700 border border-green-200`}>
            <Check className='w-3 h-3' />
            Success
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-700 border border-red-200`}>
            ✕ Failed
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-700 border border-yellow-200`}>
            <Circle className='w-3 h-3' />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`}>
            Unknown
          </span>
        );
    }
  };

  return (
    <div className='flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95 flex flex-col'>
      {/* 고정 헤더 */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 sticky top-0 z-10'>
        <table className='w-full'>
          <thead>
            <tr>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[120px]'>
                Status
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[150px]'>
                Pipeline
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[200px]'>
                Trigger
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[100px]'>
                Branch
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider flex-1'>
                Commit
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[100px]'>
                Duration
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* 스크롤 가능한 컨텐츠 */}
      <div className='flex-1 overflow-y-auto max-h-[500px]'>
        <table className='w-full'>
          <tbody className='divide-y divide-gray-100 bg-white'>
            {logs.map((log: LogItem, index: number) => (
              <tr key={log.id} className={getRowClassName(log, index)}>
                <td className='p-4 w-[120px]'>{getStatusBadge(log.status)}</td>
                <td className='p-4 w-[150px]'>
                  <span className='font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate block'>
                    {log.pipelineName}
                  </span>
                </td>
                <td className='p-4 w-[200px]'>
                  <div className='text-sm space-y-1'>
                    <div className='font-medium text-gray-800 truncate'>{log.trigger.type}</div>
                    <div className='text-gray-500 flex items-center gap-1 truncate'>
                      by <span className='font-medium'>{log.trigger.author}</span> •{' '}
                      {log.trigger.time}
                    </div>
                  </div>
                </td>
                <td className='p-4 w-[100px]'>
                  <span className='text-sm font-medium text-gray-700 truncate block'>
                    {log.branch}
                  </span>
                </td>
                <td className='p-4 flex-1'>
                  <div className='text-sm space-y-1'>
                    <div
                      className='font-medium text-gray-900 truncate hover:text-blue-700 transition-colors cursor-pointer'
                      title={log.commit.message}
                    >
                      {log.commit.message}
                    </div>
                    <div className='text-gray-500 font-mono text-xs truncate'>
                      #{log.commit.sha} • <span className='font-medium'>{log.commit.author}</span>
                    </div>
                  </div>
                </td>
                <td className='p-4 w-[100px]'>
                  <span className='text-sm font-medium text-gray-700 font-mono'>
                    {log.duration}
                  </span>
                </td>
              </tr>
            ))}
            {/* Intersection Observer 트리거 */}
            {hasMore && (
              <tr ref={observerRef}>
                <td colSpan={6} className='p-4 text-center'>
                  {isLoading ? (
                    <div className='flex items-center justify-center gap-2'>
                      <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                      <span className='text-sm text-gray-500'>Loading more...</span>
                    </div>
                  ) : (
                    <span className='text-sm text-gray-400'>Scroll to load more</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 상태 정보 */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-3 border-t border-gray-200'>
        <div className='text-sm text-gray-600'>
          Showing <span className='font-medium'>{logs.length}</span> results
          {!hasMore && <span className='text-gray-400'> • All data loaded</span>}
        </div>
      </div>
    </div>
  );
};

export default PipelineLogsTable;
