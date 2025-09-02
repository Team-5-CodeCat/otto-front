'use client';

import React from 'react';
import ReactFlow, { Node, Edge, Background, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

const backgroundNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 260 },
    data: { label: 'Git Clone' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#111827',
      color: 'white',
      border: '2px solid #374151',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 300, y: 210 },
    data: { label: 'Build' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#1f2937',
      color: 'white',
      border: '2px solid #4B5563',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '3',
    type: 'default',
    position: { x: 500, y: 310 },
    data: { label: 'Test' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#374151',
      color: 'white',
      border: '2px solid #6B7280',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '4',
    type: 'default',
    position: { x: 700, y: 230 },
    data: { label: 'Deploy' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#4B5563',
      color: 'white',
      border: '2px solid #9CA3AF',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '5',
    type: 'default',
    position: { x: 200, y: 360 },
    data: { label: 'Monitor' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#374151',
      color: 'white',
      border: '2px solid #6B7280',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: '6',
    type: 'default',
    position: { x: 600, y: 160 },
    data: { label: 'Notify' },
    draggable: false,
    selectable: false,
    style: {
      backgroundColor: '#4B5563',
      color: 'white',
      border: '2px solid #9CA3AF',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      width: 140,
      height: 70,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
    },
  },
];

const backgroundEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    style: { stroke: '#6B7280', strokeWidth: 3, opacity: 0.9 },
    animated: true,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'smoothstep',
    style: { stroke: '#6B7280', strokeWidth: 3, opacity: 0.9 },
    animated: true,
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    style: { stroke: '#6B7280', strokeWidth: 3, opacity: 0.9 },
    animated: true,
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
    type: 'smoothstep',
    style: { stroke: '#6B7280', strokeWidth: 3, opacity: 0.9 },
    animated: true,
  },
  {
    id: 'e2-6',
    source: '2',
    target: '6',
    type: 'smoothstep',
    style: { stroke: '#6B7280', strokeWidth: 3, opacity: 0.9 },
    animated: true,
  },
];

const BackgroundFlow: React.FC = () => {
  return (
    <div className='absolute inset-0 opacity-60 pointer-events-none'>
      <ReactFlowProvider>
        <ReactFlow
          nodes={backgroundNodes}
          edges={backgroundEdges}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          attributionPosition='bottom-left'
          proOptions={{ hideAttribution: true }}
        >
          <Background color='#f3f4f6' gap={16} size={1} style={{ opacity: 0.8 }} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default BackgroundFlow;
