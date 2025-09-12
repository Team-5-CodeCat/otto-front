'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { LogData, LogLine } from './types';
import { formatTimestamp } from './utils/timeUtils';
import { getLogLevelColor, getLogPreview } from './utils/logFormatters';

interface LogPreviewProps {
  logData: LogData;
  onExpandLogs: () => void;
  onOpenInNewWindow: () => void;
  maxLines?: number;
}

const LogPreview: React.FC<LogPreviewProps> = ({
  logData,
  onExpandLogs,
  onOpenInNewWindow,
  maxLines = 10,
}) => {
  const previewLogs = getLogPreview(logData);
  const displayedLogs = previewLogs.slice(-maxLines);

  const hasMoreLogs = logData.logs.totalLines > displayedLogs.length;
  const errorCount = logData.logs.recentLines.filter((log) => log.level === 'ERROR').length;
  const warningCount = logData.logs.recentLines.filter((log) => log.level === 'WARN').length;

  const renderLogLine = (log: LogLine, index: number) => (
    <div
      key={index}
      className='flex items-start gap-3 py-2 px-3 hover:bg-gray-50 rounded text-sm font-mono group'
    >
      {/* 타임스탬프 */}
      <span className='text-gray-500 text-xs shrink-0 w-16'>
        {formatTimestamp(log.timestamp, 'time')}
      </span>

      {/* 로그 레벨 */}
      <span
        className={`
        shrink-0 w-12 text-xs font-bold uppercase
        ${getLogLevelColor(log.level)}
      `}
      >
        {log.level}
      </span>

      {/* 로그 메시지 */}
      <span className='flex-1 text-gray-800 leading-relaxed break-all'>{log.message}</span>

      {/* 소스 (있는 경우) */}
      {log.source && <span className='text-xs text-gray-400 shrink-0'>[{log.source}]</span>}
    </div>
  );

  return (
    <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
      {/* 헤더 */}
      <div className='bg-gray-50 border-b border-gray-200 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <h3 className='font-semibold text-gray-900'>Log Preview</h3>

            {/* 로그 통계 */}
            <div className='flex items-center gap-3 text-sm'>
              <span className='text-gray-600'>
                {displayedLogs.length} of {logData.logs.totalLines} lines
              </span>

              {errorCount > 0 && (
                <span className='flex items-center gap-1 text-red-600'>
                  <AlertCircle className='w-4 h-4' />
                  {errorCount} errors
                </span>
              )}

              {warningCount > 0 && (
                <span className='flex items-center gap-1 text-yellow-600'>
                  <AlertCircle className='w-4 h-4' />
                  {warningCount} warnings
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 로그 컨텐츠 */}
      <div className='max-h-96 overflow-y-auto'>
        {displayedLogs.length === 0 ? (
          <div className='p-8 text-center text-gray-500'>
            <div className='text-lg mb-2'>📄</div>
            <p>No logs available</p>
          </div>
        ) : (
          <div className='divide-y divide-gray-100'>
            {/* 생략된 로그 표시 */}
            {hasMoreLogs && (
              <div className='px-4 py-2 bg-gray-50 border-b border-gray-200'>
                <button
                  onClick={onExpandLogs}
                  className='text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer'
                >
                  ... {logData.logs.totalLines - displayedLogs.length} more lines (click to view
                  all)
                </button>
              </div>
            )}

            {/* 로그 라인들 */}
            {displayedLogs.map((log, index) => renderLogLine(log, index))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      {logData.logs.hasErrors && (
        <div className='bg-gray-50 border-t border-gray-200 px-4 py-2'>
          <div className='flex items-center text-sm text-red-600'>
            <AlertCircle className='w-4 h-4 mr-2' />
            Contains errors
          </div>
        </div>
      )}
    </div>
  );
};

export default LogPreview;
