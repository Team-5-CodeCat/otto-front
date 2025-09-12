import { LogData, PipelineStage, LogLine } from './types';

// Mock log lines generator
const generateMockLogLines = (count: number, hasErrors: boolean = false): LogLine[] => {
  const levels: LogLine['level'][] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const sources = ['build', 'npm', 'docker', 'aws-cli', 'jest', 'next', 'deploy', 'health-check'];

  const messages = {
    INFO: [
      'Starting build process...',
      'Installing dependencies with npm',
      'Running TypeScript compiler...',
      'Building Next.js application',
      'Running tests with Jest...',
      '✅ All tests passed (23 tests)',
      'Starting deployment to production...',
      'Uploading assets to S3...',
      '✅ Health check passed',
      '🎉 Build completed successfully!',
      'Initializing build environment',
      'Setting up Node.js version 18.17.0',
      'Cache restored from previous build',
      'Installing production dependencies',
      'Optimizing bundle size',
      'Generating static pages',
      'Uploading build artifacts',
      'Updating load balancer configuration',
      'Deployment completed successfully',
    ],
    WARN: [
      '⚠️ Deprecated dependency found: @types/node@12',
      'Warning: Large bundle size detected',
      'Performance warning: Slow component detected',
      'Warning: Missing alt text in image component',
      'Deprecation warning: Old API usage detected',
      'Warning: Unused dependencies found',
      'Memory usage approaching limit',
      'Warning: Slow database query detected',
    ],
    ERROR: [
      '❌ Build failed: TypeScript compilation error',
      'Error: Module not found',
      'Test suite failed with 3 errors',
      'Deployment failed: Health check timeout',
      'Error: Database connection failed',
      'Build error: Missing environment variable',
      'Error: Authentication failed',
      'Critical error: Out of memory',
      'Error: API endpoint not responding',
      'Build failed: Syntax error in component',
    ],
    DEBUG: [
      'Debug: Cache hit for dependency resolution',
      'Debug: Memory usage: 45% of available',
      'Debug: API response time: 120ms',
      'Debug: Database query executed in 50ms',
      'Debug: File processed: 1,247 lines',
      'Debug: Webpack chunk optimization completed',
      'Debug: Service worker registration successful',
    ],
  };

  const logs: LogLine[] = [];
  const baseTime = new Date(Date.now() - count * 10000); // 10초 간격

  for (let i = 0; i < count; i++) {
    let level: LogLine['level'];

    if (hasErrors && i > count * 0.7 && Math.random() < 0.3) {
      level = 'ERROR';
    } else if (Math.random() < 0.1) {
      level = 'WARN';
    } else if (Math.random() < 0.05) {
      level = 'DEBUG';
    } else {
      level = 'INFO';
    }

    const levelMessages = messages[level];
    const message = levelMessages[Math.floor(Math.random() * levelMessages.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    logs.push({
      timestamp: new Date(baseTime.getTime() + i * 10000).toISOString(),
      level,
      message,
      source,
    });
  }

  return logs;
};

// Mock pipeline stages
const createMockPipeline = (status: 'SUCCESS' | 'FAILED' | 'RUNNING'): PipelineStage[] => {
  const baseTime = new Date(Date.now() - 300000); // 5분 전 시작

  const stages: PipelineStage[] = [
    {
      stage: 'Source Download',
      status: 'SUCCESS',
      duration: '30s',
      startTime: new Date(baseTime.getTime()).toISOString(),
      endTime: new Date(baseTime.getTime() + 30000).toISOString(),
    },
    {
      stage: 'Build & Test',
      status: status === 'FAILED' ? 'FAILED' : 'SUCCESS',
      duration: status === 'FAILED' ? '2m 15s' : '3m 15s',
      startTime: new Date(baseTime.getTime() + 30000).toISOString(),
      ...(status !== 'RUNNING'
        ? { endTime: new Date(baseTime.getTime() + 225000).toISOString() }
        : {}),
    },
    {
      stage: 'Deploy',
      status: status === 'RUNNING' ? 'IN_PROGRESS' : status === 'FAILED' ? 'PENDING' : 'SUCCESS',
      duration: status === 'SUCCESS' ? '30s' : status === 'RUNNING' ? '15s' : '0s',
      startTime: new Date(baseTime.getTime() + 225000).toISOString(),
      ...(status === 'SUCCESS'
        ? { endTime: new Date(baseTime.getTime() + 255000).toISOString() }
        : {}),
    },
  ];

  return stages;
};

// Success case mock data
export const mockSuccessLogData: LogData = {
  buildId: 'build-success-123',
  buildNumber: 123,
  projectName: 'Frontend Deploy',
  buildStatus: 'SUCCEEDED',
  deployStatus: 'SUCCEEDED',
  overallStatus: 'SUCCESS',
  startTime: new Date(Date.now() - 300000).toISOString(),
  endTime: new Date(Date.now() - 45000).toISOString(),
  duration: '4m 15s',
  trigger: 'GitHub Push',
  branch: 'main',
  commitHash: 'a1b2c34',
  commitMessage: 'feat: Add new user dashboard component',
  commitAuthor: 'John Doe',
  pipeline: createMockPipeline('SUCCESS'),
  deployment: {
    environment: 'production',
    deployedVersion: '2.1.0',
    rollbackAvailable: true,
    healthCheckStatus: 'HEALTHY',
  },
  logs: {
    totalLines: 1247,
    hasErrors: false,
    cloudWatchUrl: `https://console.aws.amazon.com/cloudwatch/logs/groups/build-success-123`,
    recentLines: generateMockLogLines(50, false),
  },
};

// Failed case mock data
export const mockFailedLogData: LogData = {
  buildId: 'build-failed-456',
  buildNumber: 124,
  projectName: 'Backend API',
  buildStatus: 'FAILED',
  overallStatus: 'FAILED',
  startTime: new Date(Date.now() - 180000).toISOString(),
  endTime: new Date(Date.now() - 60000).toISOString(),
  duration: '2m 0s',
  trigger: 'Manual',
  branch: 'feature/auth-fix',
  commitHash: 'b2c3d45',
  commitMessage: 'fix: Resolve authentication middleware issue',
  commitAuthor: 'Jane Smith',
  pipeline: createMockPipeline('FAILED'),
  errorSummary: {
    phase: 'Build & Test',
    errorMessage: "TypeScript compilation failed: Type 'string' is not assignable to type 'number'",
    exitCode: 1,
    failedTests: [
      'auth.test.ts - Authentication middleware test',
      'user.test.ts - User creation validation',
      'api.test.ts - API endpoint response format',
    ],
  },
  logs: {
    totalLines: 892,
    hasErrors: true,
    cloudWatchUrl: `https://console.aws.amazon.com/cloudwatch/logs/groups/build-failed-456`,
    recentLines: generateMockLogLines(40, true),
  },
};

// Running case mock data
export const mockRunningLogData: LogData = {
  buildId: 'build-running-789',
  buildNumber: 125,
  projectName: 'Mobile App Build',
  buildStatus: 'IN_PROGRESS',
  overallStatus: 'RUNNING',
  startTime: new Date(Date.now() - 120000).toISOString(),
  duration: '2m 0s',
  trigger: 'Scheduled',
  branch: 'develop',
  commitHash: 'c3d4e56',
  commitMessage: 'feat: Implement push notification system',
  commitAuthor: 'Dev Team',
  pipeline: createMockPipeline('RUNNING'),
  logs: {
    totalLines: 456,
    hasErrors: false,
    cloudWatchUrl: `https://console.aws.amazon.com/cloudwatch/logs/groups/build-running-789`,
    recentLines: generateMockLogLines(30, false),
  },
};

// Database migration failed case
export const mockMigrationFailedLogData: LogData = {
  buildId: 'build-migration-321',
  buildNumber: 126,
  projectName: 'Database Migration',
  buildStatus: 'FAILED',
  overallStatus: 'FAILED',
  startTime: new Date(Date.now() - 900000).toISOString(), // 15분 전
  endTime: new Date(Date.now() - 840000).toISOString(), // 14분 전
  duration: '1m 0s',
  trigger: 'Webhook',
  branch: 'migration-v2',
  commitHash: 'd4e5f67',
  commitMessage: 'migration: Add user preferences table with indexes',
  commitAuthor: 'Admin User',
  pipeline: [
    {
      stage: 'Source Download',
      status: 'SUCCESS',
      duration: '15s',
      startTime: new Date(Date.now() - 900000).toISOString(),
      endTime: new Date(Date.now() - 885000).toISOString(),
    },
    {
      stage: 'Migration Validation',
      status: 'FAILED',
      duration: '45s',
      startTime: new Date(Date.now() - 885000).toISOString(),
      endTime: new Date(Date.now() - 840000).toISOString(),
    },
  ],
  errorSummary: {
    phase: 'Migration Validation',
    errorMessage: 'Migration failed: Duplicate key constraint violation on index idx_user_email',
    exitCode: 2,
  },
  logs: {
    totalLines: 234,
    hasErrors: true,
    cloudWatchUrl: `https://console.aws.amazon.com/cloudwatch/logs/groups/build-migration-321`,
    recentLines: [
      {
        timestamp: new Date(Date.now() - 870000).toISOString(),
        level: 'INFO',
        message: 'Starting database migration...',
        source: 'migration',
      },
      {
        timestamp: new Date(Date.now() - 860000).toISOString(),
        level: 'INFO',
        message: 'Creating table: user_preferences',
        source: 'migration',
      },
      {
        timestamp: new Date(Date.now() - 850000).toISOString(),
        level: 'INFO',
        message: 'Adding column: notification_settings',
        source: 'migration',
      },
      {
        timestamp: new Date(Date.now() - 845000).toISOString(),
        level: 'ERROR',
        message: 'Error creating index idx_user_email: Duplicate key constraint violation',
        source: 'migration',
      },
      {
        timestamp: new Date(Date.now() - 842000).toISOString(),
        level: 'ERROR',
        message: 'Migration rollback initiated',
        source: 'migration',
      },
      {
        timestamp: new Date(Date.now() - 840000).toISOString(),
        level: 'ERROR',
        message: '❌ Migration failed with exit code 2',
        source: 'migration',
      },
    ],
  },
};

// Large logs for performance testing
export const mockLargeLogData: LogData = {
  ...mockSuccessLogData,
  buildId: 'build-large-999',
  buildNumber: 999,
  projectName: 'Large Project Build',
  logs: {
    totalLines: 50000,
    hasErrors: false,
    cloudWatchUrl: `https://console.aws.amazon.com/cloudwatch/logs/groups/build-large-999`,
    recentLines: generateMockLogLines(5000, false), // 큰 데이터셋
  },
};

// Collection of all mock data for easy access
export const mockLogDataCollection = {
  success: mockSuccessLogData,
  failed: mockFailedLogData,
  running: mockRunningLogData,
  migrationFailed: mockMigrationFailedLogData,
  large: mockLargeLogData,
};

// Helper function to get mock data by build ID
export const getMockLogData = (buildId: string): LogData | null => {
  switch (buildId) {
    case 'build-success-123':
    case '1':
      return mockSuccessLogData;
    case 'build-failed-456':
    case '2':
      return mockFailedLogData;
    case 'build-running-789':
    case '3':
      return mockRunningLogData;
    case 'build-migration-321':
    case '4':
      return mockMigrationFailedLogData;
    case 'build-large-999':
    case '5':
      return mockLargeLogData;
    default:
      return mockSuccessLogData; // 기본값
  }
};
