// /workspaces/otto-front/app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { validateToken } = useAuth();
  const didRunRef = useRef(false); // 최초 1회 실행 가드

  // 홈 진입 시 인증 확인 후 /projects로 이동
  useEffect(() => {
    if (didRunRef.current) return; // 재호출 방지
    didRunRef.current = true;

    const go = async () => {
      try {
        const ok = await validateToken();
        router.replace(ok ? '/projects' : '/auth/signin');
      } catch {
        router.replace('/auth/signin');
      }
    };

    go();
  }, [router, validateToken]); // 의존성 포함해도 ref 가드로 1회 실행 유지

  return null;
}
