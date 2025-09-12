'use client';

import React, { useState } from 'react';
import { Circle } from 'lucide-react';
import { EnhancedSelect } from './ui/EnhancedSelect';

// 필터 패널 컴포넌트 (Radix UI로 업그레이드)
const FilterPanel: React.FC = () => {
  const [timeline, setTimeline] = useState('all-time');
  const [status, setStatus] = useState('any-status');
  const [trigger, setTrigger] = useState('all-triggers');
  const [branch, setBranch] = useState('all-branches');
  const [author, setAuthor] = useState('all-authors');

  const timelineOptions = [
    { value: 'all-time', label: 'All time', description: '' },
    { value: 'today', label: 'Today', description: '24h' },
    { value: 'week', label: 'This week', description: '7d' },
    { value: 'month', label: 'This month', description: '30d' },
  ];

  const statusOptions = [
    {
      value: 'any-status',
      label: 'Any status',
      icon: <Circle className='h-3 w-3 text-gray-400' />,
    },
    {
      value: 'running',
      label: 'Running',
      icon: <Circle className='h-3 w-3 text-blue-500 animate-pulse' />,
    },
    { value: 'success', label: 'Success', icon: <Circle className='h-3 w-3 text-green-500' /> },
    { value: 'failed', label: 'Failed', icon: <Circle className='h-3 w-3 text-red-500' /> },
    { value: 'pending', label: 'Pending', icon: <Circle className='h-3 w-3 text-yellow-500' /> },
  ];

  const triggerOptions = [
    { value: 'all-triggers', label: 'All triggers' },
    { value: 'push', label: 'Push to branch' },
    { value: 'pr-merged', label: 'PR merged' },
    { value: 'manual', label: 'Manual trigger' },
    { value: 'scheduled', label: 'Scheduled' },
  ];

  const branchOptions = [
    { value: 'all-branches', label: 'All branches' },
    { value: 'main', label: 'main', icon: <div className='h-2 w-2 rounded-full bg-purple-500' /> },
    {
      value: 'develop',
      label: 'develop',
      icon: <div className='h-2 w-2 rounded-full bg-blue-500' />,
    },
    {
      value: 'staging',
      label: 'staging',
      icon: <div className='h-2 w-2 rounded-full bg-orange-500' />,
    },
  ];

  const authorOptions = [
    { value: 'all-authors', label: 'All authors' },
    { value: 'john-doe', label: 'John Doe' },
    { value: 'jane-smith', label: 'Jane Smith' },
    { value: 'dev-team', label: 'Dev Team' },
    { value: 'admin', label: 'Admin User' },
  ];

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6 backdrop-blur-sm bg-white/95'>
      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <div className='h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'></div>
          Timeline
        </h4>
        <EnhancedSelect
          placeholder='Select timeline'
          value={timeline}
          onValueChange={setTimeline}
          options={timelineOptions}
          icon={undefined}
        />
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <div className='h-1 w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full'></div>
          Status
        </h4>
        <EnhancedSelect
          placeholder='Select status'
          value={status}
          onValueChange={setStatus}
          options={statusOptions}
          icon={undefined}
        />
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <div className='h-1 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full'></div>
          Trigger
        </h4>
        <EnhancedSelect
          placeholder='Select trigger'
          value={trigger}
          onValueChange={setTrigger}
          options={triggerOptions}
          icon={undefined}
        />
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <div className='h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full'></div>
          Branch
        </h4>
        <EnhancedSelect
          placeholder='Select branch'
          value={branch}
          onValueChange={setBranch}
          options={branchOptions}
          icon={undefined}
        />
      </div>

      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-800 flex items-center gap-2'>
          <div className='h-1 w-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full'></div>
          Author
        </h4>
        <EnhancedSelect
          placeholder='Select author'
          value={author}
          onValueChange={setAuthor}
          options={authorOptions}
          icon={undefined}
        />
      </div>

      {/* 필터 리셋 버튼 */}
      <div className='pt-4 border-t border-gray-100'>
        <button
          className='w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200'
          onClick={() => {
            setTimeline('all-time');
            setStatus('any-status');
            setTrigger('all-triggers');
            setBranch('all-branches');
            setAuthor('all-authors');
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
