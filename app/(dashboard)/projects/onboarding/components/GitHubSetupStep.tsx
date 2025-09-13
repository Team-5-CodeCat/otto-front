'use client';

import React, { useEffect } from 'react';
import { Github, CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface GitHubSetupStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function GitHubSetupStep({ onboarding }: GitHubSetupStepProps) {
  // 컴포넌트 마운트 시 GitHub 연결 상태 확인
  useEffect(() => {
    onboarding.checkGitHubConnection();
  }, [onboarding]);

  const handleInstallGitHubApp = () => {
    onboarding.installGitHubApp();
  };

  const handleRefreshConnection = () => {
    onboarding.checkGitHubConnection();
  };

  const handleNext = () => {
    if (onboarding.canProceedToNext()) {
      onboarding.nextStep();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gray-900 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Github className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            GitHub 연결
          </h2>
          <p className="text-gray-600">
            저장소의 CI/CD 자동화를 위해 Otto GitHub 앱을 설치해주세요.
          </p>
        </div>

        {/* Connection Status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          onboarding.isGitHubConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            {onboarding.isGitHubConnected ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">GitHub 연결됨!</p>
                  <p className="text-sm text-green-700">
                    Otto가 이제 저장소에 접근할 수 있습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <Github className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">GitHub 연결되지 않음</p>
                  <p className="text-sm text-gray-600">
                    계속하려면 Otto GitHub 앱을 설치해주세요.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Setup Instructions */}
        {!onboarding.isGitHubConnected && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Otto를 설치할 때 일어나는 일:</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-800">Otto가 저장소 코드를 읽을 수 있는 권한을 얻습니다</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-800">푸시 이벤트에 대한 웹훅 알림</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-800">상태 확인 및 배포 업데이트</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6">
          {!onboarding.isGitHubConnected ? (
            <button
              onClick={handleInstallGitHubApp}
              disabled={onboarding.isLoading}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>Otto GitHub 앱 설치</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleRefreshConnection}
              disabled={onboarding.isLoading}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              {onboarding.isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              <span>연결 새로 고침</span>
            </button>
          )}
        </div>

        {/* Polling Status */}
        {onboarding.isPollingGitHub && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">GitHub 설치 대기 중</p>
                <p className="text-sm text-blue-700">
                  팝업 창에서 설치를 완료하면 자동으로 계속 진행됩니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => onboarding.prevStep()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
이전
          </button>
          <button
            onClick={handleNext}
            disabled={!onboarding.canProceedToNext()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              onboarding.canProceedToNext()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
계속
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            🔒 <strong>보안:</strong> Otto는 필요한 최소한의 권한만 요청합니다. 
            GitHub 설정에서 언제든지 액세스를 철회할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}