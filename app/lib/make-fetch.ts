// 공통 fetch 유틸리티 - makeFetch를 사용한 기본 설정

// 환경별 API URL 설정
import type { IConnection } from '@nestia/fetcher';

const getApiBaseUrl = (): string => {
  // 클라이언트 사이드
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  }
  // 서버 사이드 (Docker 환경 고려)
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:4000';
};

// SDK용 연결 설정 생성
export const makeFetch = (): IConnection => ({
  host: getApiBaseUrl(),
  options: { credentials: 'include' },
});

// 기본 export
export default makeFetch;
