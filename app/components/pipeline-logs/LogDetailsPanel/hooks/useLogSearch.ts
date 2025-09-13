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

  // 안전한 검색어 설정 함수 - useMemo로 안정화
  const safeSetSearchQuery = useMemo(() => {
    return (query: string) => {
      // 입력값 검증
      if (typeof query !== 'string') return;
      // 너무 긴 검색어 제한 (성능상 문제 방지)  
      const trimmedQuery = query.slice(0, 100);
      setSearchQuery(trimmedQuery);
    };
  }, []);

  // 디바운싱된 검색어 (300ms 지연 - 단순 검색으로 빨라짐)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);


  // 필터링된 로그 (디바운싱된 검색어 사용)
  const filteredLogs = useMemo(() => {
    try {
      // 검색어가 없거나 너무 짧으면 레벨 필터만 적용
      const trimmedQuery = debouncedSearchQuery.trim();
      if (!trimmedQuery || trimmedQuery.length < 2) {
        return logs.filter(log => filter.levels.includes(log.level));
      }

      return logs.filter(log => {
        // 레벨 필터
        if (!filter.levels.includes(log.level)) {
          return false;
        }
        
        // 검색 쿼리 필터 (단순 문자열 검색으로 변경)
        const lowerQuery = trimmedQuery.toLowerCase();
        return log.message.toLowerCase().includes(lowerQuery) ||
               (log.source || '').toLowerCase().includes(lowerQuery);
      });
    } catch (error) {
      console.error('Error filtering logs:', error);
      return logs.filter(log => filter.levels.includes(log.level));
    }
  }, [logs, filter.levels, debouncedSearchQuery]);

  // 검색 결과 (디바운싱된 검색어 사용)
  const searchResults = useMemo(() => {
    const trimmedQuery = debouncedSearchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return [];
    
    try {
      const results: LogSearchResult[] = [];
      const lowerQuery = trimmedQuery.toLowerCase();
      
      // 대량 데이터 처리를 위해 결과 제한 (최대 1000개)
      let resultCount = 0;
      const maxResults = 1000;
      
      for (let index = 0; index < filteredLogs.length && resultCount < maxResults; index++) {
        const log = filteredLogs[index];
        if (log) {
          // 단순 문자열 검색으로 변경 (안정적이고 빠름)
          if (log.message.toLowerCase().includes(lowerQuery) || 
              (log.source || '').toLowerCase().includes(lowerQuery)) {
            results.push({
              lineNumber: index,
              timestamp: log.timestamp,
              message: log.message,
              level: log.level
            });
            resultCount++;
          }
        }
      }
      
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
    setSearchQuery: safeSetSearchQuery, // 안전한 함수로 교체
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