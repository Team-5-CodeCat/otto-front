'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import { githubAppApi } from '../../lib/github-app-api';

interface GitHubInstallButtonProps {
  onInstallSuccess?: (installationId: string) => void;
  onInstallError?: (error: string) => void;
  className?: string;
}

/**
 * GitHub 앱 설치 버튼 컴포넌트
 * 
 * GitHub 앱 설치 URL을 조회하고 새 창에서 설치 페이지를 엽니다.
 * 설치 완료 후 콜백을 통해 부모 컴포넌트에 알립니다.
 */
export const GitHubInstallButton: React.FC<GitHubInstallButtonProps> = ({
  onInstallSuccess,
  onInstallError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    try {
      setIsLoading(true);
      
      // GitHub 앱 설치 URL 조회
      const { url } = await githubAppApi.getInstallUrl();
      
      // 새 창에서 GitHub 앱 설치 페이지 열기
      const newWindow = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      if (!newWindow) {
        throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }

      // 설치 완료 감지를 위한 폴링 (선택사항)
      // 실제로는 GitHub에서 콜백 URL로 리다이렉트하므로
      // 이 부분은 필요에 따라 구현할 수 있습니다.
      
      onInstallSuccess?.('');
      
    } catch (error) {
      console.error('GitHub 앱 설치 오류:', error);
      onInstallError?.(error instanceof Error ? error.message : 'GitHub 앱 설치 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="primary"
      size="md"
      onClick={handleInstall}
      isLoading={isLoading}
      className={className}
    >
      {isLoading ? 'GitHub 앱 설치 중...' : 'GitHub 앱 설치'}
    </Button>
  );
};

export default GitHubInstallButton;