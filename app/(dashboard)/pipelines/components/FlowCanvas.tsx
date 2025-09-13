/**
 * FlowCanvas 컴포넌트
 *
 * 파이프라인 편집기의 메인 캔버스를 제공하는 React Flow 기반 컴포넌트입니다.
 * 블록 기반 파이프라인을 시각적으로 편집할 수 있는 환경을 제공합니다.
 *
 * 주요 기능:
 * - 드래그 앤 드롭: 블록을 캔버스에 드래그하여 추가
 * - 노드 연결: 블록 간 연결선 생성 및 관리
 * - 실시간 편집: 노드 위치 변경, 연결 생성/삭제
 * - 전체 화면 모드: 대시보드 레이아웃을 벗어나 전체 화면 사용
 * - 우측 패널: JSON 편집 및 파이프라인 관리 UI
 *
 * 아키텍처:
 * - ReactFlowProvider로 래핑하여 React Flow 컨텍스트 제공
 * - FlowCanvasInner와 FlowCanvas로 분리하여 Provider 내외부 로직 분리
 * - 동적 nodeTypes 생성으로 onUpdateBlock 콜백 전달
 * - 커스텀 간선(CustomEdge)으로 삭제 기능 제공
 *
 * 레이아웃:
 * - 좌측: 캔버스 영역 (React Flow)
 * - 우측: RightPanel (JSON 편집기, 저장/로드/실행 버튼)
 * - 전체 화면: fixed 포지셔닝으로 대시보드 레이아웃 오버라이드
 */

import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  Connection,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
// import NodePalette from './NodePalette';
// import RightPanel from './RightPanel'; // RightPanel 제거
import JobNode from './JobNode';
import CustomEdge from './CustomEdge';
import { AnyBlock } from './types';

// FlowCanvas 내부에서 동적으로 nodeTypes를 생성해야 함 (props 접근을 위해)

// 간선 타입 정의
const edgeTypes = {
  'custom-edge': CustomEdge,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  jsonText: string;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onAddNode: (nodeType: string, position?: { x: number; y: number }) => void;
  onJsonChange: (value: string) => void;
  onUpdateNodeEnvironment: (nodeId: string, environment: Record<string, string>) => void;
  onUpdateBlock?: (blockId: string, updatedBlock: AnyBlock) => void;
  // ✅ SDK 기반 함수들 추가
  onSavePipeline?: (
    name: string,
    projectID?: string
  ) => Promise<{ success: boolean; pipelineId?: string }>;
  onLoadPipeline?: (pipelineID: string) => Promise<void>;
  availablePipelines?: Array<{ pipelineID: string; name: string; version: number }>;
  onRunPipeline?: () => Promise<void>;
}

// FlowCanvas 내부 컴포넌트
const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  jsonText: _jsonText,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeDelete,
  onAddNode,
  onJsonChange: _onJsonChange,
  onUpdateNodeEnvironment: _onUpdateNodeEnvironment,
  onUpdateBlock,
  // ✅ SDK 기반 함수들 받기
  onSavePipeline: _onSavePipeline,
  onLoadPipeline: _onLoadPipeline,
  availablePipelines: _availablePipelines,
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // onUpdateBlock을 포함한 동적 노드 타입 생성
  const nodeTypes = React.useMemo(
    () => ({
      jobNode: (props: { data: AnyBlock }) => 
        onUpdateBlock ? <JobNode {...props} onUpdateBlock={onUpdateBlock} /> : <JobNode {...props} onUpdateBlock={() => {}} />,
      blockNode: (props: { data: AnyBlock }) =>
        onUpdateBlock ? <JobNode {...props} onUpdateBlock={onUpdateBlock} /> : <JobNode {...props} onUpdateBlock={() => {}} />,
    }),
    [onUpdateBlock]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');

      if (typeof nodeType === 'undefined' || !nodeType || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      onAddNode(nodeType, position);
    },
    [reactFlowInstance, onAddNode]
  );

  // 간선에 삭제 콜백 함수를 전달하기 위해 edges를 수정
  const edgesWithDelete = edges.map((edge) => ({
    ...edge,
    key: edge.id, // React key prop을 명시적으로 설정
    data: {
      ...edge.data,
      onDelete: onEdgeDelete,
    },
  }));

  return (
    <div className='flex-1 bg-gray-50/60 h-full' ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edgesWithDelete}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className='w-full h-full bg-gray-50/60'
        defaultEdgeOptions={{
          type: 'custom-edge',
          animated: true,
        }}
      >
        {/* env_to_settings의 회색 배경 유지 (또는 dev의 녹색 선택 가능) */}
        <Background color='#e5e7eb' />

        {/* env_to_settings의 스타일 + dev의 position 속성 병합 */}
        <Controls
          className='bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm'
          position='bottom-right'
        />

        {/* MiniMap은 필요에 따라 포함/제외 결정 */}
        {/* env_to_settings에만 있던 MiniMap - 필요시 주석 해제
      <MiniMap
        className='bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm'
        maskColor='rgba(0, 0, 0, 0.1)'
      />
      */}
      </ReactFlow>
    </div>
  );
};

const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <>
      {/* 대시보드 레이아웃을 벗어나서 전체 화면 사용 */}
      <div
        className='absolute inset-0 flex bg-gray-100 overflow-hidden'
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 40,
        }}
      >
        {/* 중앙 영역 - 플로우 캔버스 */}
        <div className='flex-1 min-w-0 flex flex-col relative'>
          <div className='flex-1 bg-gray-50/80 h-full'>
            <ReactFlowProvider>
              <FlowCanvasInner {...props} />
            </ReactFlowProvider>
          </div>
        </div>

        {/* RightPanel 제거됨 - 이제 전체 화면 사용 */}
      </div>
    </>
  );
};

export default FlowCanvas;
