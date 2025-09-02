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
