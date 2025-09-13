// Health Store는 더 이상 사용되지 않습니다.
// 이 파일은 호환성을 위해 유지되지만 내용은 비어있습니다.

export const healthStore = {
  getState: () => ({}),
  startHealthCheck: () => {},
  setHealthCheckResult: () => {},
  setHealthCheckError: () => {},
  reset: () => {},
};

export const checkHealth = async () => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
});