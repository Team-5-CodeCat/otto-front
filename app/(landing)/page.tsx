'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Landing from './landing';

export default function Home() {
  const router = useRouter();
  const { validateToken } = useAuth();
  const didRunRef = useRef(false);

  // 인증 상태 확인 (백그라운드에서)
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const checkAuth = async () => {
      try {
        const isAuthenticated = await validateToken();
        // 인증된 사용자가 루트 페이지에 접근하면 프로젝트로 리다이렉트
        // 하지만 즉시 리다이렉트하지 않고 사용자가 선택할 수 있도록 함
      } catch {
        // 인증 실패는 무시하고 랜딩 페이지 표시
      }
    };

    checkAuth();
  }, [validateToken]);

  // 랜딩 페이지 표시
  return <Landing />;
}
