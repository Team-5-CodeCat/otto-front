'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, X, Filter } from 'lucide-react';
import { LogLine } from './types';
import { useLogSearch } from './hooks/useLogSearch';
import { formatTimestamp } from './utils/timeUtils';
import { getLogLevelColor } from './utils/logFormatters';
import { highlightSearchText } from './utils/logFormatters';

interface LogViewerProps {
  logs: LogLine[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showLineNumbers?: boolean;
  showTimestamps?: boolean;
  maxHeight?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  showLineNumbers = true,
  showTimestamps = true,
  maxHeight = '500px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [showFilters, setShowFilters] = useState(false);


  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredLogs,
    searchResults,
    currentResultIndex,
    totalResults,
    nextResult,
    previousResult,
    clearSearch,
  } = useLogSearch(logs);

  // 초기화 시에만 외부 검색어 동기화
  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery, setSearchQuery]);

  // 외부 검색어가 변경될 때만 동기화 (내부 변경 제외)
  const prevExternalQuery = useRef(externalSearchQuery);
  useEffect(() => {
    if (externalSearchQuery !== prevExternalQuery.current) {
      prevExternalQuery.current = externalSearchQuery;
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery, setSearchQuery]);

  // 내부 검색어 변경은 입력 이벤트에서만 처리 (useEffect 제거)

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 검색 입력창이 포커스된 상태에서만 동작
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'ArrowLeft' && totalResults > 0) {
          e.preventDefault();
          previousResult();
        } else if (e.key === 'ArrowRight' && totalResults > 0) {
          e.preventDefault();
          nextResult();
        } else if (e.key === 'Enter' && totalResults > 0) {
          e.preventDefault();
          nextResult(); // Enter로도 다음 결과로 이동
        } else if (e.key === 'Escape') {
          e.preventDefault();
          clearSearch(); // Esc로 검색 지우기
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [totalResults, previousResult, nextResult, clearSearch]);

  const ITEM_HEIGHT = 24; // 각 로그 라인의 높이 (px)
  const BUFFER_SIZE = 10; // 버퍼 사이즈

  // 가상화 계산
  const getContainerHeight = () => {
    if (maxHeight === '100%') return 600;
    return parseInt(maxHeight) || 500;
  };
  const containerHeight = getContainerHeight();
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT);

  // 스크롤 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const start = Math.floor(scrollTop / ITEM_HEIGHT);
    const end = Math.min(start + visibleCount + BUFFER_SIZE, filteredLogs.length);

    setVisibleRange({
      start: Math.max(0, start - BUFFER_SIZE),
      end,
    });
  };

  // 보이는 로그들
  const visibleLogs = filteredLogs.slice(visibleRange.start, visibleRange.end);


  // 레벨 필터 토글
  const toggleLevelFilter = (level: LogLine['level']) => {
    const newLevels = filter.levels.includes(level)
      ? filter.levels.filter((l) => l !== level)
      : [...filter.levels, level];

    setFilter({ ...filter, levels: newLevels });
  };

  // 로그 라인 렌더링
  const renderLogLine = (log: LogLine, _index: number, absoluteIndex: number) => {
    const isHighlighted = searchResults.some(
      (result) =>
        result.lineNumber === absoluteIndex &&
        absoluteIndex === searchResults[currentResultIndex]?.lineNumber
    );

    return (
      <div
        key={`${absoluteIndex}-${log.timestamp}`}
        id={`log-line-${absoluteIndex}`}
        className={`
          flex items-start gap-2 px-3 py-1 text-sm font-mono hover:bg-gray-50 border-l-2
          ${isHighlighted ? 'bg-yellow-100 border-yellow-400' : 'border-transparent'}
        `}
        style={{
          position: 'absolute',
          top: `${absoluteIndex * ITEM_HEIGHT}px`,
          height: `${ITEM_HEIGHT}px`,
          left: 0,
          right: 0,
        }}
      >
        {/* 라인 번호 */}
        {showLineNumbers && (
          <span className='text-gray-400 text-xs w-12 text-right shrink-0 leading-tight'>
            {absoluteIndex + 1}
          </span>
        )}

        {/* 타임스탬프 */}
        {showTimestamps && (
          <span className='text-gray-500 text-xs w-20 shrink-0 leading-tight'>
            {formatTimestamp(log.timestamp, 'time')}
          </span>
        )}

        {/* 로그 레벨 */}
        <span
          className={`
          w-14 text-xs font-bold uppercase shrink-0 leading-tight
          ${getLogLevelColor(log.level)}
        `}
        >
          {log.level}
        </span>

        {/* 로그 메시지 */}
        <span
          className='flex-1 text-gray-800 leading-tight break-all'
          dangerouslySetInnerHTML={{
            __html: highlightSearchText(log.message, searchQuery),
          }}
        />

        {/* 소스 */}
        {log.source && (
          <span className='text-xs text-gray-400 shrink-0 leading-tight'>[{log.source}]</span>
        )}
      </div>
    );
  };


  return (
    <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 transparent;
          }
        `
      }} />
      {/* 툴바 */}
      <div className='bg-gray-50 border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center gap-3'>
          {/* 검색 입력 */}
          <div className='flex-1 relative'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                ref={searchInputRef}
                type='text'
                placeholder='Search logs...'
                value={searchQuery}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSearchQuery(newValue);
                  // 외부로 직접 알림 (useEffect 없이)
                  if (onSearchChange) {
                    onSearchChange(newValue);
                  }
                }}
                className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>

            {/* 검색 결과 네비게이션 */}
            {searchQuery.trim() && totalResults > 0 && (
              <div className='absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1 text-xs'>
                <span className='text-gray-600'>
                  {currentResultIndex + 1} of {totalResults}
                </span>
                <button
                  onClick={previousResult}
                  className='text-gray-400 hover:text-gray-600'
                  disabled={totalResults === 0}
                >
                  <ChevronUp className='w-3 h-3' />
                </button>
                <button
                  onClick={nextResult}
                  className='text-gray-400 hover:text-gray-600'
                  disabled={totalResults === 0}
                >
                  <ChevronDown className='w-3 h-3' />
                </button>
              </div>
            )}
          </div>

          {/* 필터 버튼 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
              ${showFilters ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            <Filter className='w-4 h-4' />
            Filter
          </button>

          {/* 로그 통계 */}
          <div className='text-sm text-gray-600'>
            {filteredLogs.length} / {logs.length} lines
          </div>
        </div>

        {/* 필터 패널 */}
        {showFilters && (
          <div className='mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-4 px-4 rounded-b-lg'>
            <div className='flex items-center justify-between'>
              {/* 로그 레벨 필터 */}
              <div className='flex items-center gap-3'>
                <span className='text-sm font-semibold text-gray-700'>Levels:</span>
                <div className='flex items-center gap-3'>
                  {(['ERROR', 'WARN', 'INFO', 'DEBUG'] as LogLine['level'][]).map((level) => (
                    <label key={level} className='flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors'>
                      <input
                        type='checkbox'
                        checked={filter.levels.includes(level)}
                        onChange={() => toggleLevelFilter(level)}
                        className='w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1'
                      />
                      <span className={`text-xs font-bold uppercase ${getLogLevelColor(level)}`}>
                        {level}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 표시 옵션 */}
              <div className='flex items-center gap-4'>
                <span className='text-sm font-semibold text-gray-700'>Display:</span>
                <label className='flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors'>
                  <input
                    type='checkbox'
                    checked={showTimestamps}
                    onChange={() => {
                      // 타임스탬프 표시 토글 (부모 컴포넌트에서 제어)
                    }}
                    className='w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1'
                  />
                  <span className='text-sm text-gray-700'>Timestamps</span>
                </label>

                <label className='flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors'>
                  <input
                    type='checkbox'
                    checked={showLineNumbers}
                    onChange={() => {
                      // 라인 번호 표시 토글 (부모 컴포넌트에서 제어)
                    }}
                    className='w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1'
                  />
                  <span className='text-sm text-gray-700'>Line numbers</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 로그 컨텐츠 */}
      <div
        ref={containerRef}
        className='relative overflow-auto bg-gray-50 custom-scrollbar'
        style={{ 
          height: maxHeight === '100%' ? '600px' : maxHeight,
          minHeight: '400px'
        }}
        onScroll={handleScroll}
      >
        {/* 가상 스크롤 컨테이너 */}
        <div style={{ height: `${filteredLogs.length * ITEM_HEIGHT}px`, position: 'relative' }}>
          {visibleLogs.map((log, index) => renderLogLine(log, index, visibleRange.start + index))}
        </div>

        {/* 빈 상태 */}
        {filteredLogs.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center text-gray-500'>
              {searchQuery ? (
                <>
                  <Search className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                  <p>No logs match your search</p>
                  <button
                    onClick={clearSearch}
                    className='mt-2 text-blue-600 hover:text-blue-700 text-sm'
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <div className='text-lg mb-2'>📄</div>
                  <p>No logs available</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LogViewer;
