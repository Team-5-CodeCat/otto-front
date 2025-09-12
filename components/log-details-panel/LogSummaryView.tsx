'use client';

import React from 'react';
import { Maximize2, ChevronUp, ChevronDown, X } from 'lucide-react';
import { LogData } from './types';
import BuildSummary from './BuildSummary';
import PipelineTimeline from './PipelineTimeline';
import LogPreview from './LogPreview';

interface LogSummaryViewProps {
  logData: LogData;
  onExpandLogs: () => void;
  onOpenInNewWindow: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onClose: () => void;
}

const LogSummaryView: React.FC<LogSummaryViewProps> = ({
  logData,
  onExpandLogs,
  onOpenInNewWindow,
  onNavigate,
  onClose,
}) => {
  return (
    <div className='flex flex-col h-full max-h-[80vh] overflow-hidden relative'>
      {/* 절대 위치 액션 버튼들 */}
      <div className='absolute top-6 right-4 z-10 flex items-center'>
        <button
          onClick={onExpandLogs}
          className='flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer'
          title='Expand to full view (Space)'
        >
          <Maximize2 className='w-4 h-4' />
        </button>

        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className='flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer'
              title='Previous build (↑)'
            >
              <ChevronUp className='w-4 h-4' />
            </button>

            <button
              onClick={() => onNavigate('next')}
              className='flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer'
              title='Next build (↓)'
            >
              <ChevronDown className='w-4 h-4' />
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className='flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer'
          title='Close (Esc)'
        >
          <X className='w-4 h-4' />
        </button>
      </div>

      {/* 헤더 */}
      <div className='p-6 border-b border-gray-200 shrink-0'>
        <div className='pr-20'>
          {' '}
          {/* 버튼 공간 확보를 위한 패딩 */}
          <h1 className='text-2xl font-bold text-gray-900'>Build Details</h1>
          <p className='text-sm text-gray-600 mt-1'>
            {logData.projectName} • Build #{logData.buildNumber}
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 - 스크롤 가능 */}
      <div className='flex-1 overflow-y-auto'>
        <div className='p-6 space-y-6'>
          {/* 빌드 요약 */}
          <BuildSummary logData={logData} showDeploymentInfo={true} />

          {/* 파이프라인 타임라인 */}
          <PipelineTimeline stages={logData.pipeline} showDurations={true} />

          {/* 로그 미리보기 */}
          <LogPreview
            logData={logData}
            onExpandLogs={onExpandLogs}
            onOpenInNewWindow={onOpenInNewWindow}
            maxLines={15}
          />
        </div>
      </div>

      {/* 푸터 - 키보드 단축키 */}
      <div className='border-t border-gray-200 p-2 bg-gray-50 shrink-0'>
        <div className='flex items-center justify-center'>
          <div className='text-xs text-gray-600'>
            <div className='flex items-center gap-6'>
              <span className='flex items-center gap-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono shadow-sm'>
                  Space
                </kbd>
                <span className='text-gray-500'>Expand</span>
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono shadow-sm'>
                  Esc
                </kbd>
                <span className='text-gray-500'>Close</span>
              </span>
              <span className='flex items-center gap-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono shadow-sm'>
                  ↑/↓
                </kbd>
                <span className='text-gray-500'>Navigate Results</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogSummaryView;
