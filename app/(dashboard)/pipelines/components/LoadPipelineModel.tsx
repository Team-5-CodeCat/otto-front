/**
 * LoadPipelineModal 컴포넌트
 *
 * 저장된 파이프라인 목록을 보여주고 선택할 수 있는 모달 다이얼로그입니다.
 * Otto SDK를 통해 가져온 파이프라인 목록을 표시하며, 사용자가 선택한 파이프라인을 불러올 수 있습니다.
 *
 * 주요 기능:
 * - 파이프라인 목록 표시: 이름, 버전, ID 정보 표시
 * - 클릭 선택: 파이프라인 클릭 시 onSelect 콜백 호출
 * - 빈 상태 처리: 저장된 파이프라인이 없을 때 안내 메시지 표시
 * - 스크롤 지원: 많은 파이프라인에 대해 max-h-64로 스크롤 영역 제한
 * - 모달 오버레이: 배경 클릭으로 닫기 불가, 취소 버튼으로만 닫기 가능
 *
 * 사용법:
 * - RightPanel에서 폴더 아이콘 클릭 시 표시
 * - availablePipelines props로 파이프라인 목록 전달
 * - onSelect로 선택된 파이프라인 ID를 상위 컴포넌트로 전달
 * - onCancel로 모달 닫기 처리
 *
 * Props:
 * - open: 모달 표시 여부
 * - pipelines: 파이프라인 목록 (PipelineItem[])
 * - onCancel: 취소 버튼 클릭 핸들러
 * - onSelect: 파이프라인 선택 핸들러 (pipelineID string 전달)
 */

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
