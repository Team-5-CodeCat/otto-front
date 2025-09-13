'use client';

import React, { useState } from 'react';
import { useNodeVersion, NodeVersion } from '../../contexts/NodeVersionContext';
import { cn } from '@/lib/utils';

interface NodeVersionSelectorProps {
  className?: string;
}

export const NodeVersionSelector: React.FC<NodeVersionSelectorProps> = ({ className }) => {
  const { selectedVersion, setSelectedVersion, availableVersions } = useNodeVersion();
  const [isOpen, setIsOpen] = useState(false);

  const handleVersionSelect = (version: NodeVersion) => {
    setSelectedVersion(version.version);
    setIsOpen(false);
  };

  const currentVersionInfo = availableVersions.find((v) => v.version === selectedVersion);

  return (
    <div className={cn('relative', className)}>
      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
        Node.js version
      </label>

      <div className='relative'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <span className='block truncate text-gray-900 dark:text-gray-100'>
                {currentVersionInfo?.description || `Node.js ${selectedVersion}`}
              </span>
              {currentVersionInfo?.lts && (
                <span className='ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                  LTS
                </span>
              )}
            </div>
            <svg
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className='absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none'>
            {availableVersions.map((versionInfo) => (
              <button
                key={versionInfo.version}
                type='button'
                onClick={() => handleVersionSelect(versionInfo)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-gray-700',
                  selectedVersion === versionInfo.version
                    ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                    : 'text-gray-900 dark:text-gray-100'
                )}
              >
                <div className='flex items-center justify-between'>
                  <span>{versionInfo.description}</span>
                  {versionInfo.lts && (
                    <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'>
                      LTS
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
        Pick the version of your choice, and it will be applied to your Build/Test nodes.
      </div>
    </div>
  );
};

export default NodeVersionSelector;
