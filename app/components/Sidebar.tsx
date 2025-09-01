'use client';

import React from 'react';

interface SidebarProps {
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className='w-16 h-full bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4'>
      {/* 로고 영역 - 맨 위 */}
      <div className='w-10 h-10 bg-gray-200 rounded-lg mb-8 flex items-center justify-center'>
        <div className='w-6 h-6 bg-gray-400 rounded'></div>
      </div>

      {/* 네비게이션 아이템들 - 중간 영역 */}
      <div className='flex-1 flex flex-col items-center space-y-4'>
        {/* 왼쪽 열 - 원형 아이템들 */}
        <div className='flex flex-col space-y-3'>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className='w-8 h-8 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors'
            />
          ))}
        </div>

        {/* 구분선 */}
        <div className='w-8 h-px bg-gray-300 my-4'></div>

        {/* 단일 원형 아이템 */}
        <div className='w-8 h-8 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors'></div>
      </div>
    </div>
  );
};

export default Sidebar;
