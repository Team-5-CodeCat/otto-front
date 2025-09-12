'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

// AuthGuard Props 타입
interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // 인증이 필요한지 여부 (기본값: true)
  redirectTo?: string; // 인증 실패 시 리다이렉트할 경로
  fallback?: ReactNode; // 로딩 중일 때 보여줄 컴포넌트
}

// AuthGuard 컴포넌트
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
  fallback = <DefaultLoadingFallback />,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (isLoading) return;

    // 인증이 필요한 페이지인데 인증되지 않은 경우
    if (requireAuth && !isAuthenticated) {
      const redirectPath = redirectTo || '/signin';
      router.push(redirectPath);
      return;
    }

    // 인증이 필요하지 않은 페이지인데 인증된 경우 (로그인/회원가입 페이지 등)
    if (!requireAuth && isAuthenticated) {
      const redirectPath = redirectTo || '/projects';
      router.push(redirectPath);
      return;
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, pathname, router]);

  // 로딩 중이면 fallback 표시
  if (isLoading) {
    return <>{fallback}</>;
  }

  // 인증이 필요한 페이지인데 인증되지 않은 경우 아무것도 렌더링하지 않음
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // 인증이 필요하지 않은 페이지인데 인증된 경우 아무것도 렌더링하지 않음
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // 조건을 만족하면 children 렌더링
  return <>{children}</>;
};

// 기본 로딩 fallback 컴포넌트
const DefaultLoadingFallback: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/20'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto'></div>
      <p className='mt-4 text-gray-600'>Verifying authentication...</p>
    </div>
  </div>
);

// 편의 컴포넌트들
export const ProtectedRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => (
  <AuthGuard requireAuth={true} fallback={fallback}>
    {children}
  </AuthGuard>
);

export const PublicRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => (
  <AuthGuard requireAuth={false} fallback={fallback}>
    {children}
  </AuthGuard>
);

export default AuthGuard;
