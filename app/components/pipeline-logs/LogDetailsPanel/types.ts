export interface LogData {
  // 기본 정보
  buildId: string;
  buildNumber: number;
  projectName: string;
  
  // 상태 정보
  buildStatus: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED';
  deployStatus?: 'SUCCEEDED' | 'FAILED' | 'IN_PROGRESS' | 'STOPPED';
  overallStatus: 'SUCCESS' | 'FAILED' | 'RUNNING';
  
  // 시간 정보
  startTime: string; // ISO 8601 format
  endTime?: string;
  duration: string; // "3m 45s" format
  
  // 소스 정보
  trigger: 'Manual' | 'GitHub Push' | 'Scheduled' | 'Webhook';
  branch: string;
  commitHash: string; // 짧은 형태 (7자리)
  commitMessage: string;
  commitAuthor: string;
  
  // 파이프라인 단계
  pipeline: PipelineStage[];
  
  // 배포 정보 (옵션)
  deployment?: {
    environment: 'staging' | 'production';
    deployedVersion: string;
    rollbackAvailable: boolean;
    healthCheckStatus: 'HEALTHY' | 'UNHEALTHY';
  };
  
  // 에러 정보 (실패 시)
  errorSummary?: {
    phase: string;
    errorMessage: string;
    exitCode: number;
    failedTests?: string[];
  };
  
  // 로그 정보
  logs: {
    totalLines: number;
    recentLines: LogLine[]; // 마지막 10-15줄
    hasErrors: boolean;
    cloudWatchUrl: string;
  };
}

export interface PipelineStage {
  stage: string; // "Source Download", "Build & Test", "Deploy"
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS' | 'PENDING';
  duration: string;
  startTime: string;
  endTime?: string;
}

export interface LogLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string; // 로그 소스 (예: "npm", "docker", "aws-cli")
}

export interface LogDetailsPanelProps {
  buildId: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void; // 키보드 네비게이션용
}

export type ViewMode = 'summary' | 'expanded';

export interface LogSearchResult {
  lineNumber: number;
  timestamp: string;
  message: string;
  level: LogLine['level'];
}

export interface LogFilter {
  levels: LogLine['level'][];
  searchQuery: string;
  showTimestamps: boolean;
}

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}