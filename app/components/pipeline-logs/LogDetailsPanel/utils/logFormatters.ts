import { LogLine, LogData } from '../types';

export const formatLogLevel = (level: LogLine['level']): string => {
  switch (level) {
    case 'ERROR':
      return '🔴 ERROR';
    case 'WARN':
      return '🟡 WARN';
    case 'INFO':
      return '🔵 INFO';
    case 'DEBUG':
      return '🟢 DEBUG';
    default:
      return level;
  }
};

export const getLogLevelColor = (level: LogLine['level']): string => {
  switch (level) {
    case 'ERROR':
      return 'text-red-600';
    case 'WARN':
      return 'text-yellow-600';
    case 'INFO':
      return 'text-blue-600';
    case 'DEBUG':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const getLogLevelBgColor = (level: LogLine['level']): string => {
  switch (level) {
    case 'ERROR':
      return 'bg-red-50 border-red-200';
    case 'WARN':
      return 'bg-yellow-50 border-yellow-200';
    case 'INFO':
      return 'bg-blue-50 border-blue-200';
    case 'DEBUG':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const highlightSearchText = (text: string, searchQuery: string): string => {
  if (!searchQuery.trim() || !text) return text || '';
  
  try {
    // 단순 문자열 치환으로 변경 (정규식 제거)
    const query = searchQuery.trim();
    if (!query) return text;
    
    // 대소문자 무시하고 모든 일치 항목을 하이라이트
    const parts = text.split(new RegExp(`(${escapeForSplit(query)})`, 'gi'));
    return parts.map(part => 
      part.toLowerCase() === query.toLowerCase() 
        ? `<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${part}</mark>`
        : part
    ).join('');
  } catch (error) {
    console.error('Error highlighting search text:', error);
    return text;
  }
};

// split용 간단한 이스케이프 (정규식 최소화)
const escapeForSplit = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const escapeRegex = (string: string): string => {
  if (!string || typeof string !== 'string') return '';
  
  try {
    // 특수문자 이스케이프 처리
    const escaped = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 이스케이프된 문자열로 정규식 생성 테스트
    new RegExp(escaped, 'gi');
    
    return escaped;
  } catch (error) {
    // 정규식 생성 실패 시 빈 문자열 반환
    console.warn('Failed to escape regex:', string, error);
    return '';
  }
};

export const truncateMessage = (message: string, maxLength: number = 100): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

export const formatCommitHash = (hash: string, length: number = 7): string => {
  return hash.substring(0, length);
};

export const parseLogLine = (line: string): Partial<LogLine> => {
  // AWS CodeBuild 로그 형식 파싱: [2023-12-01 10:30:45] [INFO] message
  const timestampRegex = /^\[([^\]]+)\]/;
  const levelRegex = /\[(ERROR|WARN|INFO|DEBUG)\]/;
  
  const timestampMatch = line.match(timestampRegex);
  const levelMatch = line.match(levelRegex);
  
  let message = line;
  let timestamp = new Date().toISOString();
  let level: LogLine['level'] = 'INFO';
  
  if (timestampMatch && timestampMatch[1]) {
    timestamp = new Date(timestampMatch[1]).toISOString();
    message = message.replace(timestampRegex, '').trim();
  }
  
  if (levelMatch) {
    level = levelMatch[1] as LogLine['level'];
    message = message.replace(levelRegex, '').trim();
  }
  
  return { timestamp, level, message };
};

export const getErrorContext = (logs: LogLine[], errorLineIndex: number, contextLines: number = 3): LogLine[] => {
  const start = Math.max(0, errorLineIndex - contextLines);
  const end = Math.min(logs.length, errorLineIndex + contextLines + 1);
  return logs.slice(start, end);
};

export const findErrorLines = (logs: LogLine[]): number[] => {
  return logs
    .map((log, index) => ({ log, index }))
    .filter(({ log }) => log.level === 'ERROR')
    .map(({ index }) => index);
};

export const getLogPreview = (logData: LogData): LogLine[] => {
  if (logData.logs.hasErrors) {
    // 에러가 있으면 마지막 에러 주변의 컨텍스트를 반환
    const errorLines = findErrorLines(logData.logs.recentLines);
    if (errorLines.length > 0) {
      const lastErrorLine = errorLines[errorLines.length - 1];
      if (lastErrorLine !== undefined) {
        return getErrorContext(logData.logs.recentLines, lastErrorLine, 5);
      }
    }
  }
  
  // 에러가 없으면 마지막 10줄 반환
  return logData.logs.recentLines.slice(-10);
};

export const exportLogs = (logData: LogData, format: 'txt' | 'json' = 'txt'): string => {
  if (format === 'json') {
    return JSON.stringify(logData, null, 2);
  }
  
  // 텍스트 형식
  let content = `Build Log Export - ${logData.projectName}\n`;
  content += `Build ID: ${logData.buildId}\n`;
  content += `Build Number: ${logData.buildNumber}\n`;
  content += `Status: ${logData.overallStatus}\n`;
  content += `Started: ${logData.startTime}\n`;
  content += `Duration: ${logData.duration}\n`;
  content += `Branch: ${logData.branch}\n`;
  content += `Commit: ${logData.commitHash} - ${logData.commitMessage}\n`;
  content += `Author: ${logData.commitAuthor}\n`;
  content += `Trigger: ${logData.trigger}\n\n`;
  
  content += '='.repeat(80) + '\n';
  content += 'PIPELINE STAGES\n';
  content += '='.repeat(80) + '\n\n';
  
  logData.pipeline.forEach((stage, index) => {
    content += `${index + 1}. ${stage.stage}\n`;
    content += `   Status: ${stage.status}\n`;
    content += `   Duration: ${stage.duration}\n`;
    content += `   Started: ${stage.startTime}\n`;
    if (stage.endTime) content += `   Ended: ${stage.endTime}\n`;
    content += '\n';
  });
  
  if (logData.errorSummary) {
    content += '='.repeat(80) + '\n';
    content += 'ERROR SUMMARY\n';
    content += '='.repeat(80) + '\n\n';
    content += `Phase: ${logData.errorSummary.phase}\n`;
    content += `Message: ${logData.errorSummary.errorMessage}\n`;
    content += `Exit Code: ${logData.errorSummary.exitCode}\n`;
    if (logData.errorSummary.failedTests) {
      content += `Failed Tests: ${logData.errorSummary.failedTests.join(', ')}\n`;
    }
    content += '\n';
  }
  
  content += '='.repeat(80) + '\n';
  content += 'LOG PREVIEW\n';
  content += '='.repeat(80) + '\n\n';
  
  logData.logs.recentLines.forEach(log => {
    content += `[${log.timestamp}] [${log.level}] ${log.message}\n`;
  });
  
  return content;
};