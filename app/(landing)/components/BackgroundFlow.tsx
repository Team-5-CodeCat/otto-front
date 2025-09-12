'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, { Node, Edge, Background, ReactFlowProvider, MarkerType } from 'reactflow';
import { cn } from '@/lib/utils';
import 'reactflow/dist/style.css';

const BackgroundFlow: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 데스크톱용 가로 레이아웃 노드
  const desktopNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 0, y: 30 },
      data: { label: 'Build' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#10b981',
        color: 'white',
        border: '2px solid #059669',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: '600',
        width: 140,
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 220, y: 30 },
      data: { label: 'Test' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#059669',
        color: 'white',
        border: '2px solid #047857',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: '600',
        width: 140,
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 440, y: 30 },
      data: { label: 'Deploy' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#047857',
        color: 'white',
        border: '2px solid #065f46',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: '600',
        width: 140,
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  ];

  // 모바일용 계단식 레이아웃 노드
  const mobileNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 20, y: 20 },
      data: { label: 'Build' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#10b981',
        color: 'white',
        border: '2px solid #059669',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        width: 120,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Test' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#059669',
        color: 'white',
        border: '2px solid #047857',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        width: 120,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      id: '3',
      type: 'default',
      position: { x: 180, y: 180 },
      data: { label: 'Deploy' },
      draggable: false,
      selectable: false,
      style: {
        backgroundColor: '#047857',
        color: 'white',
        border: '2px solid #065f46',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        width: 120,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
  ];

  // 데스크톱용 가로 엣지
  const desktopEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5 5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#10b981',
      },
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5 5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#10b981',
      },
    },
  ];

  // 모바일용 세로 엣지
  const mobileEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5 5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#10b981',
      },
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#10b981', 
        strokeWidth: 2,
        strokeDasharray: '5 5',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#10b981',
      },
    },
  ];

  const nodes = isMobile ? mobileNodes : desktopNodes;
  const edges = isMobile ? mobileEdges : desktopEdges;

  return (
    <div className={cn('w-full flex justify-center items-center', isMobile ? 'h-72' : 'h-52')}>
        <ReactFlowProvider>
          <div className={cn('w-full h-full mx-auto', isMobile ? 'max-w-md' : 'max-w-4xl')}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              fitViewOptions={{
                padding: isMobile ? 0.15 : 0.05,
                includeHiddenNodes: false,
                minZoom: isMobile ? 0.7 : 1,
                maxZoom: isMobile ? 0.7 : 1,
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
              <Background color='transparent' gap={0} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
    </div>
  );
};

export default BackgroundFlow;