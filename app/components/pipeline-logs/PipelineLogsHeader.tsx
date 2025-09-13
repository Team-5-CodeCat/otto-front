'use client';

import React from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { ToggleSwitch } from './ui/ToggleSwitch';

interface PipelineLogsHeaderProps {
  isLive: boolean;
  onLiveToggle: (value: boolean) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  unreadCount?: number; // 읽지 않은 로그 개수
}

// 향상된 헤더 컴포넌트
const PipelineLogsHeader: React.FC<PipelineLogsHeaderProps> = ({
  isLive,
  onLiveToggle,
  searchQuery,
  onSearchChange,
  unreadCount = 0,
}) => {
  return (
    <div className='bg-gradient-to-r from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-200 p-6 backdrop-blur-sm'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full'></div>
          <h1 className='text-2xl font-bold text-gray-900'>Pipeline Logs</h1>
          {unreadCount > 0 && (
            <div className='flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-200'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
              <span className='text-sm font-medium'>
                {unreadCount} new build{unreadCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-4'>
          <ToggleSwitch label='Live' isOn={isLive} onToggle={onLiveToggle} />
          <button className='group p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer'>
            <RefreshCw className='w-5 h-5 group-hover:rotate-180 transition-transform duration-500' />
          </button>
        </div>
      </div>

      <div className='relative'>
        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
          <Search className='h-4 w-4 text-gray-400' />
        </div>
        <input
          type='text'
          placeholder='Search pipelines, commits, authors...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm'
        />
      </div>
    </div>
  );
};

export default PipelineLogsHeader;
