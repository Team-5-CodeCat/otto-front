'use client';

import React, { useState, useEffect } from 'react';
import { Check, Circle } from 'lucide-react';
import { LogDetailsPanel } from './LogDetailsPanel';

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
  searchQuery?: string;
  onMarkAsRead?: (logId: string) => void; // 키보드 내비게이션에서 읽음 처리용
}

// 향상된 로그 테이블 컴포넌트
const PipelineLogsTable: React.FC<PipelineLogsTableProps> = ({
  logs,
  newLogIds: _newLogIds,
  onLoadMore,
  hasMore,
  isLoading,
  searchQuery: _searchQuery,
  onMarkAsRead,
}) => {
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // 읽지 않은 로그 ID들을 관리 (초기값: _newLogIds와 동일)
  const [unreadLogIds, setUnreadLogIds] = useState<Set<string>>(_newLogIds);

  // _newLogIds가 변경될 때 unreadLogIds 업데이트 (새로운 로그 추가 시)
  useEffect(() => {
    setUnreadLogIds((prev) => {
      const newSet = new Set(prev);
      _newLogIds.forEach((id: string) => newSet.add(id)); // 새로운 로그들을 읽지 않음으로 추가
      return newSet;
    });
  }, [_newLogIds]);

  // 읽음 처리 함수 (마우스 클릭과 키보드 내비게이션에서 공통 사용)
  const markLogAsRead = (logId: string) => {
    setUnreadLogIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(logId);
      return newSet;
    });
    // 부모 컴포넌트에도 읽음 처리 알림 (헤더 카운트 업데이트용)
    onMarkAsRead?.(logId);
  };

  const handleRowClick = (logId: string) => {
    markLogAsRead(logId); // 읽음 처리
    setSelectedBuildId(logId);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedBuildId(null);
  };
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

  // 읽지 않은 로그인지 판단하는 함수 (시간 기반에서 상태 기반으로 변경)
  const isUnreadLog = (logId: string): boolean => {
    return unreadLogIds.has(logId);
  };

  // 행의 배경 스타일 결정
  const getRowClassName = (log: LogItem, index: number) => {
    const isRunning = log.status === 'running';
    const isUnread = isUnreadLog(log.id); // 시간 기반에서 상태 기반으로 변경
    const isSelected = selectedBuildId === log.id && isDetailsOpen;

    // 기본 클래스
    let className = 'transition-all duration-200 group cursor-pointer ';

    // 배경 색상 결정 (우선순위: Running > 선택됨 > 읽지 않음 > 일반)
    if (isRunning) {
      // Running 상태: 노란색 그라데이션 + 펄스
      className +=
        'bg-gradient-to-r from-green-50 to-amber-50 border-l-4 border-green-200 animate-pulse ';
    } else if (isSelected) {
      // 선택된 상태: 호버보다 조금 더 진한 회색
      className += 'bg-gray-100 ';
    } else if (isUnread) {
      // 읽지 않은 로그: 파란색 그라데이션 (펄스 효과 유지)
      className += 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-200';
    } else {
      // 일반 로그: 기본 스타일
      className += index % 2 === 0 ? 'bg-white ' : 'bg-gray-50/30 ';
    }

    // 호버 효과 (Running 상태와 선택된 상태가 아닐 때만)
    if (!isRunning && !isSelected) {
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
              <th className='text-center p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[120px]'>
                Status
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[140px]'>
                Pipeline
              </th>
              <th className='text-center p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[180px]'>
                Trigger
              </th>
              <th className='text-center p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[110px]'>
                Branch
              </th>
              <th className='text-center p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[300px]'>
                Commit
              </th>
              <th className='text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wider w-[120px]'>
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
              <tr
                key={log.id}
                className={getRowClassName(log, index)}
                onClick={() => handleRowClick(log.id)}
              >
                <td className='p-4 w-[120px]'>{getStatusBadge(log.status)}</td>
                <td className='p-4 w-[140px]'>
                  <span className='font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate block'>
                    {log.pipelineName}
                  </span>
                </td>
                <td className='p-4 w-[180px]'>
                  <div className='text-sm space-y-1'>
                    <div className='font-medium text-gray-800 truncate'>{log.trigger.type}</div>
                    <div className='text-gray-500 flex items-center gap-1 truncate'>
                      by <span className='font-medium'>{log.trigger.author}</span> •{' '}
                      {log.trigger.time}
                    </div>
                  </div>
                </td>
                <td className='p-4 w-[110px]'>
                  <span className='text-sm font-medium text-gray-700 truncate block'>
                    {log.branch}
                  </span>
                </td>
                <td className='p-4 w-[300px]'>
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
                <td className='p-4 w-[120px]'>
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

      {/* 로그 상세 패널 */}
      {selectedBuildId && (
        <LogDetailsPanel
          buildId={selectedBuildId}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onNavigate={(direction) => {
            // 이전/다음 로그로 네비게이션 + 읽음 처리
            const currentIndex = logs.findIndex((log) => log.id === selectedBuildId);
            let newLogId: string | undefined;

            if (direction === 'prev' && currentIndex > 0) {
              newLogId = logs[currentIndex - 1]?.id;
            } else if (direction === 'next' && currentIndex < logs.length - 1) {
              newLogId = logs[currentIndex + 1]?.id;
            }

            if (newLogId) {
              markLogAsRead(newLogId); // 키보드 내비게이션 시 즉시 읽음 처리
              setSelectedBuildId(newLogId);
            }
          }}
        />
      )}
    </div>
  );
};

export default PipelineLogsTable;
