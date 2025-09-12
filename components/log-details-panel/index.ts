// Main component
export { default as LogDetailsPanel } from './LogDetailsPanel';

// View components
export { default as LogSummaryView } from './LogSummaryView';
export { default as LogExpandedView } from './LogExpandedView';

// Sub-components
export { default as BuildSummary } from './BuildSummary';
export { default as PipelineTimeline } from './PipelineTimeline';
export { default as LogPreview } from './LogPreview';
export { default as LogViewer } from './LogViewer';

// Hooks
export { useLogData } from './hooks/useLogData';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
export { useLogSearch } from './hooks/useLogSearch';

// Types
export type {
  LogData,
  PipelineStage,
  LogLine,
  LogDetailsPanelProps,
  ViewMode,
  LogSearchResult,
  LogFilter,
  KeyboardShortcut,
} from './types';

// Utilities
export {
  formatDuration,
  formatTimestamp,
  isRecent,
  getStatusColor,
  getStatusBgColor,
} from './utils/timeUtils';

export {
  formatLogLevel,
  getLogLevelColor,
  getLogLevelBgColor,
  highlightSearchText,
  escapeRegex,
  truncateMessage,
  formatCommitHash,
  parseLogLine,
  getErrorContext,
  findErrorLines,
  getLogPreview,
  exportLogs,
} from './utils/logFormatters';

// Mock data for development and testing
export {
  mockSuccessLogData,
  mockFailedLogData,
  mockRunningLogData,
  mockMigrationFailedLogData,
  mockLargeLogData,
  mockLogDataCollection,
  getMockLogData,
} from './mockData';
