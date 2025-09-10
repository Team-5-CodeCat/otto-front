// 공통 fetch 유틸리티 - makeFetch를 사용한 기본 설정

// 환경별 API URL 설정
import type { IConnection } from '@nestia/fetcher';

const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
  
  // 프로덕션 환경에서는 직접 API 서버로 요청하므로 /api/v1 prefix 추가
  if (baseUrl.includes('codecat-otto.shop')) {
    return `${baseUrl}/api/v1`;
  }
  
  // 개발 환경에서는 Next.js rewrite가 /api/v1을 처리하므로 prefix 없이 반환
  return baseUrl;
};

// SDK용 연결 설정 생성
export const makeFetch = (): IConnection => ({
  host: getApiBaseUrl(),
  options: { credentials: 'include' },
});

// 기본 export
export default makeFetch;
