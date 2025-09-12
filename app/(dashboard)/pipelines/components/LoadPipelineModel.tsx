'use client';

import React from 'react';

interface PipelineItem {
  pipelineID: string;
  name: string;
  version: number;
}

interface LoadPipelineModalProps {
  open: boolean;
  pipelines: PipelineItem[];
  onCancel: () => void;
  onSelect: (pipelineID: string) => void;
}

const LoadPipelineModal: React.FC<LoadPipelineModalProps> = ({
  open,
  pipelines,
  onCancel,
  onSelect,
}) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>파이프라인 불러오기</h3>
        <div className='max-h-64 overflow-y-auto'>
          {pipelines.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>저장된 파이프라인이 없습니다.</p>
          ) : (
            pipelines.map((pipeline) => (
              <div
                key={pipeline.pipelineID}
                className='p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50'
                onClick={() => onSelect(pipeline.pipelineID)}
              >
                <h4 className='font-medium'>{pipeline.name}</h4>
                <p className='text-sm text-gray-600'>버전: {pipeline.version}</p>
                <p className='text-xs text-gray-500'>ID: {pipeline.pipelineID}</p>
              </div>
            ))
          )}
        </div>
        <div className='flex justify-end mt-4'>
          <button onClick={onCancel} className='px-4 py-2 text-gray-600 hover:text-gray-800'>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadPipelineModal;
