'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import GlobalSidebar from './GlobalSidebar';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

/**
 * 사이드바가 표시되지 않아야 하는 경로들
 */
const SIDEBAR_EXCLUDED_PATHS = ['/', '/signin', '/signup'];

/**
 * 전역 레이아웃 컴포넌트
 * 특정 경로(랜딩, 인증 페이지)를 제외하고 플로팅 사이드바를 표시합니다
 */
const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // 현재 경로가 사이드바 제외 목록에 있는지 확인
  const shouldShowSidebar = !SIDEBAR_EXCLUDED_PATHS.includes(pathname);

  return (
    <div className={`min-h-screen relative ${shouldShowSidebar ? 'bg-gray-50' : ''}`}>
      {/* 조건부 사이드바 렌더링 */}
      {shouldShowSidebar && <GlobalSidebar />}s{/* Main Content Area - Full Width */}
      <main className='min-h-screen'>{children}</main>
    </div>
  );
};

export default GlobalLayout;
