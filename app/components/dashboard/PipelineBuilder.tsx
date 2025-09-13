'use client';

import React from 'react';
import { createNodeTemplates } from './constants';

interface PipelineBuilderProps {
  className?: string;
  showHeader?: boolean;
  showVersionSelector?: boolean;
  onDragStart?: (event: React.DragEvent, nodeType: string) => void;
}

const PipelineBuilder: React.FC<PipelineBuilderProps> = ({
  className = '',
  showHeader = false,
  onDragStart,
}) => {
  // 기본 노드 버전 사용
  const defaultVersion = '18'; // 기본값으로 Node.js 18 사용
  
  // 노드 템플릿 정의
  const nodeTemplates = createNodeTemplates();

  // 기본 드래그 시작 핸들러
  const defaultOnDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragStart = onDragStart || defaultOnDragStart;

  return (
    <div className={`bg-white flex flex-col ${className}`}>
      {/* 헤더 (옵션) */}
      {showHeader && (
        <div className='p-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>Pipeline Builder</h3>
          <p className='text-xs text-gray-500 mt-1'>Drag to canvas to add nodes</p>
        </div>
      )}


      {/* 노드 팔레트 */}
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='space-y-3'>
          {nodeTemplates.map((template: any) => (
            <div
              key={template.type}
              draggable
              onDragStart={(event) => handleDragStart(event, template.type)}
              className='w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors group cursor-grab active:cursor-grabbing select-none'
            >
              <div className='font-medium text-gray-900 group-hover:text-blue-600'>
                {template.label}
              </div>
              <div className='text-sm text-gray-500 mt-1'>{template.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineBuilder;
