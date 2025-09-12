import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
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

// 노드 타입 정의
const nodeTypes = {
  jobNode: JobNode,
};

// 간선 타입 정의
const edgeTypes = {
  'custom-edge': CustomEdge,
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  yamlText: string;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onAddNode: (nodeType: string, position?: { x: number; y: number }) => void;
  onYamlChange: (value: string) => void;
  onUpdateNodeEnvironment: (nodeId: string, environment: Record<string, string>) => void;
  // RightPanel 관련 props들 제거됨 (더 이상 필요없음)
  onSavePipeline?: (name: string, projectID?: string) => Promise<{ success: boolean; pipelineId?: string }>;
  onLoadPipeline?: (pipelineID: string) => Promise<void>;
  availablePipelines?: Array<{ pipelineID: string; name: string; version: number; }>;
  onRunPipeline?: () => Promise<void>;
}

// FlowCanvas 내부 컴포넌트
const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  yamlText: _yamlText,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeDelete,
  onAddNode,
  onYamlChange: _onYamlChange,
  onUpdateNodeEnvironment: _onUpdateNodeEnvironment,
  // ✅ SDK 기반 함수들 받기
  onSavePipeline: _onSavePipeline,
  onLoadPipeline: _onLoadPipeline,
  availablePipelines: _availablePipelines,
}) => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
        <Background color='#e5e7eb' />
        <Controls className='bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm' />
        <MiniMap
          className='bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm'
          maskColor='rgba(0, 0, 0, 0.1)'
        />
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
