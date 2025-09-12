import { useState, useEffect } from 'react';
import { LogData } from '../types';
import { getMockLogData } from '../mockData';

interface UseLogDataResult {
  logData: LogData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLogData = (buildId: string): UseLogDataResult => {
  const [logData, setLogData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: 실제 API 호출로 교체
      // const response = await fetch(`/api/builds/${buildId}/logs`);
      // const data = await response.json();

      // 모킹 데이터 사용 (개발용)
      const mockData = getMockLogData(buildId);

      // 시뮬레이션 딜레이
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mockData) {
        setLogData(mockData);
      } else {
        throw new Error(`Build with ID ${buildId} not found`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log data');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchLogData();
  };

  useEffect(() => {
    if (buildId) {
      fetchLogData();
    }
  }, [buildId]);

  return {
    logData,
    loading,
    error,
    refetch,
  };
};
