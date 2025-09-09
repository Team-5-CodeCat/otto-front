'use client';

import React from 'react';

interface SavePipelineModalProps {
  open: boolean;
  pipelineName: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
}

const SavePipelineModal: React.FC<SavePipelineModalProps> = ({
  open,
  pipelineName,
  onChange,
  onCancel,
  onConfirm,
  confirmDisabled,
}) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>파이프라인 저장</h3>
        <input
          type='text'
          value={pipelineName}
          onChange={(e) => onChange(e.target.value)}
          className='w-full p-2 border border-gray-300 rounded-lg mb-4'
          placeholder='파이프라인 이름을 입력하세요'
          onKeyDown={(e) => {
            if (e.key === 'Enter' && pipelineName.trim()) {
              onConfirm();
            }
          }}
        />
        <div className='flex justify-end space-x-3'>
          <button onClick={onCancel} className='px-4 py-2 text-gray-600 hover:text-gray-800'>
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePipelineModal;
