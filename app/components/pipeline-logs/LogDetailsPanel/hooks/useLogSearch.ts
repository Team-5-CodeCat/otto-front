import { useState, useMemo, useCallback, useEffect } from 'react';
import { LogLine, LogFilter, LogSearchResult } from '../types';
import { highlightSearchText, escapeRegex } from '../utils/logFormatters';

// 디바운스 훅
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface UseLogSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: LogFilter;
  setFilter: (filter: LogFilter) => void;
  filteredLogs: LogLine[];
  searchResults: LogSearchResult[];
  currentResultIndex: number;
  totalResults: number;
  navigateToResult: (index: number) => void;
  nextResult: () => void;
  previousResult: () => void;
  clearSearch: () => void;
}

export const useLogSearch = (logs: LogLine[]): UseLogSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<LogFilter>({
    levels: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
    searchQuery: '',
    showTimestamps: true
  });
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // 디바운싱된 검색어 (300ms 지연)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);


  // 필터링된 로그 (디바운싱된 검색어 사용)
  const filteredLogs = useMemo(() => {
    try {
      return logs.filter(log => {
        // 레벨 필터
        if (!filter.levels.includes(log.level)) {
          return false;
        }
        
        // 검색 쿼리 필터 (디바운싱된 검색어 사용)
        if (debouncedSearchQuery.trim()) {
          const escapedQuery = escapeRegex(debouncedSearchQuery);
          const regex = new RegExp(escapedQuery, 'gi');
          return regex.test(log.message) || regex.test(log.source || '');
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering logs:', error);
      return logs.filter(log => filter.levels.includes(log.level));
    }
  }, [logs, filter.levels, debouncedSearchQuery]);

  // 검색 결과 (디바운싱된 검색어 사용)
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    try {
      const results: LogSearchResult[] = [];
      const escapedQuery = escapeRegex(debouncedSearchQuery);
      const regex = new RegExp(escapedQuery, 'gi');
      
      filteredLogs.forEach((log, index) => {
        if (regex.test(log.message) || regex.test(log.source || '')) {
          results.push({
            lineNumber: index,
            timestamp: log.timestamp,
            message: log.message,
            level: log.level
          });
        }
      });
      
      return results;
    } catch (error) {
      console.error('Error creating search results:', error);
      return [];
    }
  }, [filteredLogs, debouncedSearchQuery]);

  const totalResults = searchResults.length;

  const navigateToResult = useCallback((index: number) => {
    if (searchResults.length === 0) return;
    
    const clampedIndex = Math.max(0, Math.min(index, searchResults.length - 1));
    setCurrentResultIndex(clampedIndex);
    
    // 검색 결과로 스크롤 - 컨테이너 내부에서만 스크롤
    const result = searchResults[clampedIndex];
    if (result) {
      try {
        // 로그 컨테이너를 찾아서 스크롤
        const logContainer = document.querySelector('.custom-scrollbar[style*="height"]');
        if (logContainer) {
          const targetScrollTop = result.lineNumber * 24; // ITEM_HEIGHT = 24px
          logContainer.scrollTop = targetScrollTop;
        }
      } catch (error) {
        console.error('Error scrolling to search result:', error);
      }
    }
  }, [searchResults]);

  const nextResult = useCallback(() => {
    const nextIndex = currentResultIndex + 1;
    if (nextIndex < searchResults.length) {
      navigateToResult(nextIndex);
    } else {
      navigateToResult(0); // 첫 번째 결과로 순환
    }
  }, [currentResultIndex, searchResults.length, navigateToResult]);

  const previousResult = useCallback(() => {
    const prevIndex = currentResultIndex - 1;
    if (prevIndex >= 0) {
      navigateToResult(prevIndex);
    } else {
      navigateToResult(searchResults.length - 1); // 마지막 결과로 순환
    }
  }, [currentResultIndex, searchResults.length, navigateToResult]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentResultIndex(0);
  }, []);

  // 디바운싱된 검색 쿼리가 변경될 때 현재 결과 인덱스 리셋
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setCurrentResultIndex(0);
    }
  }, [debouncedSearchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    filteredLogs,
    searchResults,
    currentResultIndex,
    totalResults,
    navigateToResult,
    nextResult,
    previousResult,
    clearSearch
  };
};