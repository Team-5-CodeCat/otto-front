/**
 * CustomEdge 컴포넌트
 * 
 * React Flow에서 사용되는 사용자 정의 간선(Edge) 컴포넌트입니다.
 * 파이프라인 블록 간의 연결을 시각적으로 표현하며, 애니메이션과 삭제 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 점선 애니메이션: dashFlow 키프레임으로 흐르는 효과 구현
 * - 선택 상태 시각화: 선택된 간선은 더 굵고 밝은 색상으로 표시
 * - 삭제 버튼: 선택된 간선 중앙에 X 버튼 표시하여 삭제 가능
 * - 성능 최적화: useMemo와 willChange 속성으로 렌더링 최적화
 * 
 * 사용법:
 * - React Flow의 edgeTypes에 'custom-edge'로 등록하여 사용
 * - onDelete 콜백을 통해 간선 삭제 처리
 * - 간선 클릭 시 selected 상태가 되면 삭제 버튼이 표시됨
 */

import React, { useMemo } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomEdgeProps extends EdgeProps {
  onDelete?: (edgeId: string) => void;
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  selected,
  onDelete,
}) => {
  const [edgePath, labelX, labelY] = useMemo(
    () =>
      getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      }),
    [sourceX, sourceY, targetX, targetY]
  );

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  // 애니메이션 스타일을 메모이제이션
  const animationStyle = useMemo(
    () => ({
      ...style,
      animation: selected
        ? 'dashFlow 1.2s linear infinite, pulseWidth 2s ease-in-out infinite'
        : 'dashFlow 1.8s linear infinite',
      strokeDashoffset: 0,
      willChange: 'stroke-dashoffset, stroke-width', // 성능 최적화
    }),
    [style, selected]
  );

  return (
    <>
      {/* 애니메이팅 점선 간선 */}
      <path
        id={id}
        d={edgePath}
        fill='none'
        stroke={selected ? '#059669' : '#10b981'}
        strokeWidth={selected ? 4 : 2.5}
        strokeDasharray='12 6'
        strokeLinecap='round'
        {...(markerEnd && { markerEnd })}
        style={animationStyle}
        className={cn('animated-edge', selected && 'selected')}
      />

      {/* 간선이 선택되었을 때 삭제 버튼 표시 */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className='nodrag nopan'
          >
            <button
              onClick={handleDelete}
              className='w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors'
              title='간선 삭제'
            >
              <X size={12} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
