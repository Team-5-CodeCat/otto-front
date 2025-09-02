import React from 'react';

export type NodeStatus = 'initial' | 'loading' | 'success' | 'error';

interface NodeStatusIndicatorProps {
  status: NodeStatus;
  children: React.ReactNode;
  loadingVariant?: 'border' | 'overlay';
}

export const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = ({
  status,
  children,
  loadingVariant = 'border',
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'loading':
        return loadingVariant === 'border' ? 'relative' : 'relative';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return '';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'loading':
        return 'Loading...';
      case 'success':
        return 'Completed';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-green-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${getStatusStyles()}`}>
      {/* Status Label */}
      {status !== 'initial' && (
        <div
          className={`absolute -top-2 -right-2 px-2 py-1 rounded-md text-xs font-medium bg-green-50 border border-green-500 text-green-700 shadow-sm z-20`}
        >
          {status === 'loading' && '🔄 Loading...'}
          {status === 'success' && '✓ Completed'}
          {status === 'error' && '✗ Failed'}
        </div>
      )}

      {/* Loading Spinner */}
      {status === 'loading' && loadingVariant === 'overlay' && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
        </div>
      )}

      {/* Border Loading Animation */}
      {status === 'loading' && loadingVariant === 'border' && (
        <div className='absolute inset-0 rounded-lg overflow-hidden'>
          <div className='absolute inset-0 border-2 border-transparent border-t-green-500 border-r-green-500 rounded-lg animate-spin'></div>
        </div>
      )}

      {/* Content */}
      <div className='relative z-0'>{children}</div>
    </div>
  );
};
