'use client';

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Sidebar from './Sidebar';

// 대시보드 레이아웃 Props
interface DashboardLayoutProps {
  children: React.ReactNode; // 메인 콘텐츠
}

// 대시보드 레이아웃 (좌: Sidebar, 우: Content)
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();

  // 인증 상태 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto'></div>
          <p className='mt-2 text-sm text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex'>
      {/* 고정 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className='flex-1'>
        {/* 상단 바(옵션): 필요시 추가 */}
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
