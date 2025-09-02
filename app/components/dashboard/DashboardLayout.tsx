'use client';

import React from 'react';
import Sidebar from './Sidebar';

// 대시보드 레이아웃 Props
interface DashboardLayoutProps {
  children: React.ReactNode; // 메인 콘텐츠
}

// 대시보드 레이아웃 (좌: Sidebar, 우: Content)
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
