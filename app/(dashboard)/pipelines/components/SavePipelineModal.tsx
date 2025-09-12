/**
 * SavePipelineModal 컴포넌트
 * 
 * 파이프라인을 저장할 때 사용하는 모달 다이얼로그입니다.
 * 사용자가 파이프라인 이름을 입력하고 Otto SDK를 통해 저장할 수 있게 합니다.
 * 
 * 주요 기능:
 * - 파이프라인 이름 입력: 텍스트 input으로 이름 설정
 * - Enter 키 지원: 입력 후 Enter로 빠른 저장 가능
 * - 유효성 검사: 빈 이름일 때 저장 버튼 비활성화
 * - 모달 오버레이: 배경 어둡게 처리하여 포커스 집중
 * - 취소/확인 버튼: 명확한 액션 구분
 * 
 * 사용법:
 * - RightPanel에서 Save 버튼 클릭 시 표시
 * - pipelineName state와 onChange로 이름 입력 관리
 * - onConfirm으로 실제 저장 로직 실행
 * - confirmDisabled로 저장 버튼 활성화/비활성화 제어
 * 
 * Props:
 * - open: 모달 표시 여부
 * - pipelineName: 현재 입력된 파이프라인 이름
 * - onChange: 이름 변경 핸들러
 * - onCancel: 취소 버튼 클릭 핸들러
 * - onConfirm: 저장 버튼 클릭 핸들러
 * - confirmDisabled: 저장 버튼 비활성화 여부 (이름이 비어있을 때)
 * 
 * 키보드 지원:
 * - Enter: 이름이 입력되어 있으면 저장 실행
 * - Escape: 모달 닫기 (브라우저 기본 동작)
 */

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
