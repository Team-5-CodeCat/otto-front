// 파이프라인 관련 타입 정의
import type { Node, Edge, NodeChange, Connection } from 'reactflow';

export interface JobNodeData {
  name: string;
  image: string;
  commands: string;
  environment?: Record<string, string | number>;
  originalIndex?: number;
}

export interface JobYaml {
  name: string;
  image: string;
  commands?: string;
  environment?: Record<string, string | number>;
  dependencies?: string[]; // 의존성 job 이름들
}

// React Flow 노드와 엣지 타입 (간단한 정의)
export interface FlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
}

export interface NodeChange {
  type: string;
  [key: string]: unknown;
}

export interface ConnectionParams {
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}

// 파이프라인 상태 타입
export interface PipelineState {
  yamlText: string;
  nodes: Node<JobNodeData>[];
  edges: Edge[];
}

// 파이프라인 액션 타입
export interface PipelineActions {
  handleNodesChange: (changes: NodeChange[]) => Node[];
  onConnect: (params: Connection) => void;
  handleEdgeDelete: (edgeId: string) => void;
  handleAddNode: (nodeType: string, position?: { x: number; y: number }) => void;
  handleYamlChange: (value: string) => void;
  handleUpdateNodeEnvironment: (nodeId: string, environment: Record<string, string>) => void;
}

// 환경 변수 타입
export interface EnvironmentVariable {
  key: string;
  value: string;
  isVisible: boolean;
}
