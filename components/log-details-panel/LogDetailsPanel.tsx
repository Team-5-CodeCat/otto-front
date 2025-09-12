'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { LogDetailsPanelProps, ViewMode } from './types';
import { useLogData } from './hooks/useLogData';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import LogSummaryView from './LogSummaryView';
import LogExpandedView from './LogExpandedView';

const LogDetailsPanel: React.FC<LogDetailsPanelProps> = ({ 
  buildId, 
  isOpen, 
  onClose, 
  onNavigate 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { logData, loading, error, refetch } = useLogData(buildId);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'summary' ? 'expanded' : 'summary');
  };

  const handleOpenInNewWindow = () => {
    // 새 창으로 로그 페이지 열기
    if (logData) {
      const url = `/logs/${buildId}?mode=expanded`;
      window.open(url, '_blank', 'width=1200,height=800');
    }
  };

  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  // 키보드 단축키 설정
  useKeyboardShortcuts({
    isOpen,
    viewMode,
    onClose,
    onToggleViewMode: toggleViewMode,
    onNavigate: onNavigate || (() => {}),
    onFocusSearch: focusSearch,
    onOpenInNewWindow: handleOpenInNewWindow
  });

  // 뷰 모드에 따른 모달 크기 결정
  const getModalWidth = () => {
    return viewMode === 'summary' ? 'max-w-2xl' : 'max-w-6xl';
  };

  // 뷰 모드 변경시 애니메이션을 위한 클래스
  const getModalClasses = () => {
    const baseClasses = 'fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out overflow-hidden';
    const widthClasses = getModalWidth();
    const heightClasses = viewMode === 'summary' ? 'max-h-[80vh]' : 'max-h-[90vh] h-[90vh]';
    
    return `${baseClasses} ${widthClasses} ${heightClasses} w-[90vw]`;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* 오버레이 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* 메인 컨텐츠 */}
        <Dialog.Content className={getModalClasses()} style={{ zIndex: 50 }}>
          {/* 로딩 상태 */}
          {loading && (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600">Loading build details...</p>
              </div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Build</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 성공 상태 - 실제 컨텐츠 */}
          {logData && !loading && !error && (
            <>
              {/* 뷰 모드에 따른 컨텐츠 */}
              {viewMode === 'summary' ? (
                <LogSummaryView
                  logData={logData}
                  onExpandLogs={toggleViewMode}
                  onOpenInNewWindow={handleOpenInNewWindow}
                  {...(onNavigate ? { onNavigate } : {})}
                  onClose={onClose}
                />
              ) : (
                <LogExpandedView
                  logData={logData}
                  onCollapse={toggleViewMode}
                  onOpenInNewWindow={handleOpenInNewWindow}
                />
              )}
            </>
          )}

          {/* 숨겨진 검색 input (키보드 단축키용) */}
          <input
            ref={searchInputRef}
            type="text"
            className="sr-only"
            tabIndex={-1}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LogDetailsPanel;