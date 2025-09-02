import React from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
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
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (params: Connection) => void;
  onEdgeDelete?: (edgeId: string) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeDelete,
}) => {
  // 간선에 삭제 콜백 함수를 전달하기 위해 edges를 수정
  const edgesWithDelete = edges.map((edge) => ({
    ...edge,
    data: {
      ...edge.data,
      onDelete: onEdgeDelete,
    },
  }));

  return (
    <div className='flex-1 bg-gray-50 h-full'>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edgesWithDelete}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className='w-full h-full bg-gray-50'
          defaultEdgeOptions={{
            type: 'custom-edge',
            animated: true,
          }}
        >
          <Background color='#e5e7eb' />
          <Controls className='bg-white border border-gray-200 rounded-lg shadow-sm' />
          <MiniMap
            className='bg-white border border-gray-200 rounded-lg shadow-sm'
            maskColor='rgba(0, 0, 0, 0.1)'
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCanvas;
