// /workspaces/otto-front/app/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const _router = useRouter();
  const { validateToken } = useAuth();
  const didRunRef = useRef(false);

  // 인증 상태 확인 (백그라운드에서)
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const checkAuth = async () => {
      try {
        const _isAuthenticated = await validateToken();
        // 인증된 사용자가 루트 페이지에 접근하면 프로젝트로 리다이렉트
        // 하지만 즉시 리다이렉트하지 않고 사용자가 선택할 수 있도록 함
      } catch {
        // 인증 실패는 무시하고 랜딩 페이지 표시
      }
    };

    checkAuth();
  }, [validateToken]);

  // 임시 홈: 로그인/회원가입 링크만 표시
  return (
    <main className='mx-auto max-w-3xl px-4 py-16'>
      <h1 className='text-2xl font-semibold mb-4'>Welcome to Otto</h1>
      <p className='text-gray-600 mb-6'>Choose an action to continue.</p>
      <div className='flex gap-3'>
        <Link href='/signin' className='px-4 py-2 rounded-md bg-emerald-600 text-white'>
          Sign in
        </Link>
        <Link
          href='/signup'
          className='px-4 py-2 rounded-md border border-emerald-600 text-emerald-700'
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
