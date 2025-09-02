import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  style?: React.CSSProperties;
  markerEnd?: string;
  label?: string;
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
  label,
  onDelete,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            backgroundColor: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className='nodrag nopan'
        >
          {label && <span style={{ fontWeight: 'bold', color: '#666' }}>{label}</span>}
          {onDelete && (
            <button
              onClick={handleDelete}
              style={{
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '2px',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title='간선 삭제'
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
