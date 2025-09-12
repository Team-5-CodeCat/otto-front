// src/types/pipeline-logs.ts
export interface PipelineLog {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  pipelineName: string;
  trigger: {
    type: string;
    author: string;
    time: string;
  };
  branch: string;
  commit: {
    message: string;
    sha: string;
    author: string;
  };
  duration: string;
  isNew?: boolean;
}

export interface FilterOptions {
  timeline: string;
  status: string;
  trigger: string;
  branch: string;
  author: string;
}