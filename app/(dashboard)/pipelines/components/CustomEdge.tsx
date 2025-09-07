import React, { useMemo } from 'react';
import { BaseEdge, EdgeProps, getStraightPath, EdgeLabelRenderer } from 'reactflow';
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
  sourcePosition,
  targetPosition,
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
        stroke={selected ? '#3b82f6' : '#06b6d4'}
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
