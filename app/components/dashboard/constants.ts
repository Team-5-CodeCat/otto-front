// 파이프라인 빌더 상수 정의
export const PIPELINE_TEMPLATES = [
  {
    id: 'basic',
    name: 'Basic Pipeline',
    description: 'Simple build and test pipeline'
  },
  {
    id: 'full',
    name: 'Full CI/CD',
    description: 'Complete build, test, and deploy pipeline'
  }
];

export const NODE_TYPES = [
  'build',
  'test',
  'deploy'
] as const;

export type NodeType = typeof NODE_TYPES[number];

export const createNodeTemplates = () => PIPELINE_TEMPLATES;