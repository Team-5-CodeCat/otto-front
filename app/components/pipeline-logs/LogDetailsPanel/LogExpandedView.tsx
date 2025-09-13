'use client';

import React, { useState } from 'react';
import { Minimize2, ExternalLink, Download } from 'lucide-react';
import { LogData } from './types';
import BuildSummary from './BuildSummary';
import PipelineTimeline from './PipelineTimeline';
import LogViewer from './LogViewer';
import { exportLogs } from './utils/logFormatters';

interface LogExpandedViewProps {
  logData: LogData;
  onCollapse: () => void;
  onOpenInNewWindow: () => void;
}

const LogExpandedView: React.FC<LogExpandedViewProps> = ({
  logData,
  onCollapse,
  onOpenInNewWindow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownload = () => {
    const content = exportLogs(logData, 'txt');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logData.projectName}_build_${logData.buildNumber}_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const content = exportLogs(logData, 'json');
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logData.projectName}_build_${logData.buildNumber}_logs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='flex flex-col h-full max-h-[90vh] overflow-hidden'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e0 transparent;
          }
        `,
        }}
      />
      {/* 헤더 툴바 */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 shrink-0'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCollapse}
            className='flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors cursor-pointer'
            title='Collapse to summary view (Esc)'
          >
            <Minimize2 className='w-4 h-4' />
            Collapse
          </button>
          <div className='h-4 w-px bg-gray-300' /> {/* 구분선 */}
          <div className='text-sm'>
            <span className='font-semibold text-gray-900'>{logData.projectName}</span>
            <span className='text-gray-600 ml-2'>• Build #{logData.buildNumber}</span>
            <span className='text-gray-600 ml-2'>• {logData.logs.totalLines} lines</span>
          </div>
        </div>

        <div className='relative group'>
          <button className='flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors cursor-pointer'>
            <Download className='w-4 h-4' />
            Export
          </button>

          {/* 드롭다운 메뉴 */}
          <div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
            <button
              onClick={handleDownload}
              className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
            >
              Download as TXT
            </button>
            <button
              onClick={handleDownloadJson}
              className='w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
            >
              Download as JSON
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 분할 레이아웃 */}
      <div className='flex flex-1 overflow-hidden'>
        {/* 좌측 사이드바 - 빌드 요약 (축소된 형태) */}
        <div className='w-80 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto custom-scrollbar'>
          <div className='p-4 space-y-4'>
            {/* 축소된 빌드 요약 */}
            <BuildSummary logData={logData} isCompact={true} showDeploymentInfo={false} />

            {/* 축소된 파이프라인 타임라인 */}
            <PipelineTimeline stages={logData.pipeline} isCompact={true} showDurations={false} />

            {/* 추가 정보 */}
            {logData.deployment && (
              <div className='bg-white border border-gray-200 rounded-lg p-3'>
                <h4 className='text-sm font-semibold text-gray-700 mb-2'>Deployment</h4>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Environment:</span>
                    <span className='font-medium text-gray-900'>
                      {logData.deployment.environment}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Version:</span>
                    <span className='font-medium text-gray-900'>
                      v{logData.deployment.deployedVersion}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Health:</span>
                    <span
                      className={`font-medium ${
                        logData.deployment.healthCheckStatus === 'HEALTHY'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {logData.deployment.healthCheckStatus === 'HEALTHY'
                        ? '✅ Healthy'
                        : '❌ Unhealthy'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 에러 요약 (실패 시) */}
            {logData.errorSummary && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <h4 className='text-sm font-semibold text-red-700 mb-2'>Error Summary</h4>
                <div className='space-y-1 text-sm text-red-800'>
                  <div>
                    <strong>Phase:</strong> {logData.errorSummary.phase}
                  </div>
                  <div>
                    <strong>Exit Code:</strong> {logData.errorSummary.exitCode}
                  </div>
                  <div className='text-xs mt-2'>{logData.errorSummary.errorMessage}</div>
                </div>
              </div>
            )}

            {/* 빠른 링크 */}
            <div className='bg-white border border-gray-200 rounded-lg p-3'>
              <h4 className='text-sm font-semibold text-gray-700 mb-2'>Quick Links</h4>
              <div className='space-y-2'>
                <button
                  onClick={onOpenInNewWindow}
                  className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer'
                  title='Open in new window'
                >
                  <ExternalLink className='w-3 h-3' />
                  Open in New Window
                </button>

                <button
                  onClick={() => {
                    // GitHub 커밋 링크로 이동 (실제로는 API에서 URL 제공)
                    window.open(
                      `https://github.com/example/repo/commit/${logData.commitHash}`,
                      '_blank'
                    );
                  }}
                  className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer'
                >
                  <ExternalLink className='w-3 h-3' />
                  View Commit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 로그 뷰어 */}
        <div className='flex-1 overflow-hidden'>
          <LogViewer
            logs={logData.logs.recentLines}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showLineNumbers={true}
            showTimestamps={true}
            maxHeight='100%'
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
                <span className='text-gray-500'>Minimize</span>
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
              <span className='flex items-center gap-1'>
                <kbd className='px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono shadow-sm'>
                  ←/→
                </kbd>
                <span className='text-gray-500'>Search Results</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogExpandedView;
