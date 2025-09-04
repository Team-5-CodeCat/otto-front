// 파이프라인 관련 타입 정의

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

// 파이프라인 상태 타입
export interface PipelineState {
  yamlText: string;
  nodes: any[];
  edges: any[];
}

// 파이프라인 액션 타입
export interface PipelineActions {
  handleNodesChange: (changes: any[]) => any[];
  onConnect: (params: any) => void;
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
