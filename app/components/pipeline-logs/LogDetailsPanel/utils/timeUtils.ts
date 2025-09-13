export const formatDuration = (startTime: string, endTime?: string): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();

  const diffMs = end.getTime() - start.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    const remainingSeconds = diffSeconds % 60;
    return `${diffHours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (diffMinutes > 0) {
    const remainingSeconds = diffSeconds % 60;
    return `${diffMinutes}m ${remainingSeconds}s`;
  } else {
    return `${diffSeconds}s`;
  }
};

export const formatTimestamp = (
  timestamp: string,
  format: 'full' | 'time' | 'relative' = 'full'
): string => {
  const date = new Date(timestamp);
  const now = new Date();

  switch (format) {
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

    case 'relative': {
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMinutes > 0) return `${diffMinutes}m ago`;
      return `${diffSeconds}s ago`;
    }

    case 'full':
    default:
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
  }
};

export const isRecent = (timestamp: string, thresholdMinutes: number = 5): boolean => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= thresholdMinutes;
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'running':
    case 'in_progress':
      return 'text-blue-600';
    case 'pending':
      return 'text-yellow-600';
    case 'stopped':
      return 'text-gray-600';
    default:
      return 'text-gray-500';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'success':
    case 'succeeded':
      return 'bg-green-50 border-green-200';
    case 'failed':
      return 'bg-red-50 border-red-200';
    case 'running':
    case 'in_progress':
      return 'bg-blue-50 border-blue-200';
    case 'pending':
      return 'bg-yellow-50 border-yellow-200';
    case 'stopped':
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};
