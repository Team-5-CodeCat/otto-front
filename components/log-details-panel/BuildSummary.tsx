'use client';

import React from 'react';
import { GitBranch, User, Clock, Tag, ExternalLink, Check } from 'lucide-react';
import { LogData } from './types';
import { formatTimestamp, getStatusColor, getStatusBgColor } from './utils/timeUtils';
import { formatCommitHash } from './utils/logFormatters';

interface BuildSummaryProps {
  logData: LogData;
  isCompact?: boolean;
  showDeploymentInfo?: boolean;
}

const BuildSummary: React.FC<BuildSummaryProps> = ({
  logData,
  isCompact = false,
  showDeploymentInfo = true,
}) => {
  const getOverallStatusBadge = () => {
    const baseClasses =
      'inline-flex px-3 py-1 rounded-full text-xs font-medium items-center gap-2 shadow-sm';

    switch (logData.overallStatus) {
      case 'SUCCESS':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-700 border border-green-200`}>
            <Check className='w-3 h-3' />
            Success
          </span>
        );
      case 'FAILED':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-700 border border-red-200`}>
            ✕ Failed
          </span>
        );
      case 'RUNNING':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-700 border border-blue-200`}>
            <div className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></div>
            Running
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-600 border border-gray-200`}>
            Unknown
          </span>
        );
    }
  };

  const getTriggerIcon = () => {
    switch (logData.trigger) {
      case 'GitHub Push':
        return <GitBranch className='w-4 h-4' />;
      case 'Manual':
        return <User className='w-4 h-4' />;
      case 'Scheduled':
        return <Clock className='w-4 h-4' />;
      case 'Webhook':
        return <Tag className='w-4 h-4' />;
      default:
        return <Tag className='w-4 h-4' />;
    }
  };

  if (isCompact) {
    return (
      <div className='bg-white border border-gray-200 rounded-lg p-4 space-y-3'>
        {/* 상태와 기본 정보 */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {getOverallStatusBadge()}
            <span className='text-sm text-gray-600'>#{logData.buildNumber}</span>
          </div>
          <span className='text-sm font-mono text-gray-700'>{logData.duration}</span>
        </div>

        {/* 프로젝트 정보 */}
        <div>
          <h3 className='font-semibold text-gray-900'>{logData.projectName}</h3>
          <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
            <div className='flex items-center gap-1'>
              <GitBranch className='w-3 h-3' />
              {logData.branch}
            </div>
            <div className='flex items-center gap-1'>
              {getTriggerIcon()}
              {logData.trigger}
            </div>
          </div>
        </div>

        {/* 커밋 정보 */}
        <div className='space-y-1'>
          <div className='text-sm text-gray-900 truncate' title={logData.commitMessage}>
            {logData.commitMessage}
          </div>
          <div className='text-xs text-gray-500 font-mono'>
            {formatCommitHash(logData.commitHash)} • {logData.commitAuthor}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6 space-y-6'>
      {/* 헤더 섹션 */}
      <div className='flex items-start justify-between'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            {getOverallStatusBadge()}
            <span className='text-sm text-gray-600'>Build #{logData.buildNumber}</span>
          </div>
          <h2 className='text-xl font-bold text-gray-900'>{logData.projectName}</h2>
          <p className='text-sm text-gray-600 mt-1'>
            Started {formatTimestamp(logData.startTime, 'relative')} • Duration {logData.duration}
          </p>
        </div>
      </div>

      {/* 빌드 정보 그리드 */}
      <div className='grid grid-cols-2 gap-4'>
        {/* 트리거 정보 */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Trigger</h4>
          <div className='flex items-center gap-2 text-gray-900'>
            {getTriggerIcon()}
            <span>{logData.trigger}</span>
          </div>
        </div>

        {/* 브랜치 정보 */}
        <div className='space-y-2'>
          <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Branch</h4>
          <div className='flex items-center gap-2 text-gray-900'>
            <GitBranch className='w-4 h-4' />
            <span className='font-mono'>{logData.branch}</span>
          </div>
        </div>
      </div>

      {/* 커밋 정보 */}
      <div className='space-y-3'>
        <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Commit</h4>
        <div className='bg-gray-50 border border-gray-200 rounded-md p-3'>
          <div className='text-gray-900 mb-2 leading-relaxed'>{logData.commitMessage}</div>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2 text-gray-600'>
              <span className='font-mono'>{formatCommitHash(logData.commitHash)}</span>
              <span>•</span>
              <div className='flex items-center gap-1'>
                <User className='w-3 h-3' />
                {logData.commitAuthor}
              </div>
            </div>
            <button className='flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer'>
              <ExternalLink className='w-3 h-3' />
              View Commit
            </button>
          </div>
        </div>
      </div>

      {/* 시간 정보 */}
      <div className='grid grid-cols-2 gap-4 text-sm'>
        <div>
          <span className='text-gray-600'>Started:</span>
          <div className='font-mono text-gray-900 mt-1'>
            {formatTimestamp(logData.startTime, 'full')}
          </div>
        </div>
        {logData.endTime && (
          <div>
            <span className='text-gray-600'>Completed:</span>
            <div className='font-mono text-gray-900 mt-1'>
              {formatTimestamp(logData.endTime, 'full')}
            </div>
          </div>
        )}
      </div>

      {/* 배포 정보 (있는 경우) */}
      {showDeploymentInfo && logData.deployment && (
        <div className='space-y-3 border-t border-gray-200 pt-6'>
          <h4 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>
            Deployment
          </h4>
          <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'>
                  {logData.deployment.environment.toUpperCase()}
                </span>
                <span className='text-sm text-gray-700'>v{logData.deployment.deployedVersion}</span>
              </div>
              <div className='flex items-center gap-2'>
                {logData.deployment.healthCheckStatus === 'HEALTHY' ? (
                  <span className='text-green-600 text-xs font-medium'>✅ Healthy</span>
                ) : (
                  <span className='text-red-600 text-xs font-medium'>❌ Unhealthy</span>
                )}
              </div>
            </div>
            {logData.deployment.rollbackAvailable && (
              <div className='text-xs text-blue-700'>💫 Rollback available</div>
            )}
          </div>
        </div>
      )}

      {/* 에러 정보 (실패 시) */}
      {logData.errorSummary && (
        <div className='space-y-3 border-t border-gray-200 pt-6'>
          <h4 className='text-sm font-semibold text-red-700 uppercase tracking-wide'>
            Error Summary
          </h4>
          <div className='bg-red-50 border border-red-200 rounded-md p-3'>
            <div className='text-sm text-red-900 mb-2'>
              <span className='font-semibold'>Phase:</span> {logData.errorSummary.phase}
            </div>
            <div className='text-sm text-red-800 mb-2'>{logData.errorSummary.errorMessage}</div>
            <div className='text-xs text-red-700'>Exit Code: {logData.errorSummary.exitCode}</div>
            {logData.errorSummary.failedTests && logData.errorSummary.failedTests.length > 0 && (
              <div className='mt-3 text-xs text-red-700'>
                <span className='font-semibold'>Failed Tests:</span>
                <ul className='list-disc list-inside mt-1 space-y-1'>
                  {logData.errorSummary.failedTests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildSummary;
