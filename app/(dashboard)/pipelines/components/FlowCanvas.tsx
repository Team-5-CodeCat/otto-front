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
import RightPanel from './RightPanel';
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
  // ✅ SDK 기반 함수들 추가
  onSavePipeline?: (
    name: string,
    projectID?: string
  ) => Promise<{ success: boolean; pipelineId?: string }>;
  onLoadPipeline?: (pipelineID: string) => Promise<void>;
  availablePipelines?: Array<{
    pipelineID: string;
    name: string;
    version: number;
  }>;
  // ✅ 실행 콜백 추가
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
    <div className='flex-1 bg-emerald-50/40 h-full' ref={reactFlowWrapper}>
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
        className='w-full h-full bg-emerald-50/40'
        defaultEdgeOptions={{
          type: 'custom-edge',
          animated: true,
        }}
      >
        <Background color='#d1fae5' />
        <Controls
          className='bg-white border border-emerald-200 rounded-lg shadow-sm'
          position='bottom-right'
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
          <div className='flex-1 bg-gray-50 h-full'>
            <ReactFlowProvider>
              <FlowCanvasInner {...props} />
            </ReactFlowProvider>
          </div>
        </div>

        {/* 오른쪽 패널 - YAML 편집기 */}
        <RightPanel
          yamlText={props.yamlText}
          onYamlChange={props.onYamlChange}
          nodes={props.nodes}
          onUpdateNodeEnvironment={props.onUpdateNodeEnvironment}
          // ✅ SDK 기반 함수들 전달 (조건부)
          {...(props.onSavePipeline && { onSavePipeline: props.onSavePipeline })}
          {...(props.onLoadPipeline && { onLoadPipeline: props.onLoadPipeline })}
          {...(props.availablePipelines && { availablePipelines: props.availablePipelines })}
          {...(props.onRunPipeline && { onRunPipeline: props.onRunPipeline })}
        />
      </div>
    </>
  );
};

export default FlowCanvas;
