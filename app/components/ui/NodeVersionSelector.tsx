'use client';

import React, { useState } from 'react';
import { useNodeVersion, NodeVersion } from '../../contexts/NodeVersionContext';
import { cn } from '@/lib/utils';

interface NodeVersionSelectorProps {
  className?: string;
}

export const NodeVersionSelector: React.FC<NodeVersionSelectorProps> = ({
  className
}) => {
  const { selectedVersion, setSelectedVersion, availableVersions } = useNodeVersion();
  const [isOpen, setIsOpen] = useState(false);

  const handleVersionSelect = (version: NodeVersion) => {
    setSelectedVersion(version);
    setIsOpen(false);
  };

  const currentVersionInfo = availableVersions.find(v => v.version === selectedVersion);

  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Node.js 버전
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="block truncate text-gray-900 dark:text-gray-100">
                {currentVersionInfo?.label || `Node.js ${selectedVersion}`}
              </span>
              {currentVersionInfo?.isLTS && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  LTS
                </span>
              )}
            </div>
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {availableVersions.map((versionInfo) => (
              <button
                key={versionInfo.version}
                type="button"
                onClick={() => handleVersionSelect(versionInfo.version)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                  selectedVersion === versionInfo.version
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{versionInfo.label}</span>
                  {versionInfo.isLTS && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      LTS
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        선택한 버전이 build/test 노드에 적용됩니다
      </div>
    </div>
  );
};

export default NodeVersionSelector;
