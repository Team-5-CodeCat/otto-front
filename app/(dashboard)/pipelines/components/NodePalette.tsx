/**
 * NodePalette 컴포넌트
 * 
 * 파이프라인 편집기의 좌측 패널로 사용되는 노드 팔레트 컴포넌트입니다.
 * 현재는 PipelineBuilder 컴포넌트를 래핑하여 사용합니다.
 * 
 * 주요 기능:
 * - 드래그 가능한 블록 제공: 사용자가 캔버스로 드래그하여 새 노드 생성
 * - 반응형 너비: 화면 크기에 따라 팔레트 너비 조정
 * - 헤더 및 버전 선택기 표시: PipelineBuilder의 UI 요소 활용
 * 
 * 레이아웃:
 * - w-48 (기본) ~ w-64 (2xl) 반응형 너비
 * - 우측 테두리로 캔버스 영역과 구분
 * - flex flex-col 레이아웃으로 세로 배치
 * 
 * 현재 구현:
 * - PipelineBuilder 컴포넌트를 내부적으로 사용
 * - onAddNode props는 현재 사용되지 않음 (_onAddNode로 무시)
 * - 실제 노드 추가는 드래그 앤 드롭으로 처리
 * 
 * 향후 개선사항:
 * - 블록 타입별 아이콘과 설명 추가
 * - 검색 및 필터링 기능
 * - 커스텀 블록 템플릿 저장/불러오기
 */

import React from 'react';
import PipelineBuilder from '../../../components/dashboard/PipelineBuilder';

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode: _onAddNode }) => {
  return (
    <div className='w-48 min-w-48 md:w-52 lg:w-56 xl:w-60 2xl:w-64'>
      <PipelineBuilder 
        className='border-r border-gray-200 flex flex-col'
        showHeader={true}
        showVersionSelector={true}
      />
    </div>
  );
};

export default NodePalette;
