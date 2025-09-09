'use client';

import React from 'react';
import { Card, Button } from '@/app/components/ui';

interface GitHubConnectionStepProps {
  hasInstallation: boolean;
  isPolling: boolean;
  isLoading: boolean;
  error: string | null;
  onInstallGitHub: () => Promise<void>;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

export function GitHubConnectionStep({
  hasInstallation,
  isPolling,
  isLoading,
  error,
  onInstallGitHub,
  onNext,
  onPrevious,
  canProceed,
}: GitHubConnectionStepProps) {
  const [isInstalling, setIsInstalling] = React.useState(false);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await onInstallGitHub();
    } finally {
      // 폴링이 시작되면 설치 상태를 유지
      // setIsInstalling(false); - 폴링 중일 때는 유지
    }
  };

  const handleNext = () => {
    if (canProceed) {
      onNext();
    }
  };

  // 설치 완료 또는 오류 시 상태 리셋
  React.useEffect(() => {
    if (hasInstallation || (!isPolling && isInstalling)) {
      setIsInstalling(false);
    }
  }, [hasInstallation, isPolling, isInstalling]);

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>GitHub Integration</h1>
        <p className='text-gray-600'>
          Connect with GitHub repositories to set up automatic deployment.
        </p>
      </div>

      <Card className='p-8'>
        {!hasInstallation ? (
          <div className='text-center space-y-6'>
            <div className='space-y-4'>
              <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center'>
                <svg className='w-8 h-8 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  GitHub App Installation Required
                </h3>
                <p className='text-gray-600 mb-4'>
                  Please install the GitHub App to allow Otto to access your GitHub repositories.
                </p>
              </div>
            </div>

            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            <div className='space-y-4'>
              <Button
                onClick={handleInstall}
                disabled={isLoading || isInstalling}
                className='bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 px-6 py-2'
              >
                {isLoading
                  ? 'Generating installation URL...'
                  : isInstalling
                    ? 'Installation page opened'
                    : 'Install GitHub App'}
              </Button>

              {(isPolling || isInstalling) && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                    <p className='text-sm text-blue-600'>Verifying GitHub App installation...</p>
                  </div>
                  <p className='text-xs text-blue-500 mt-2'>
                    Once you complete the installation on GitHub, you will automatically proceed to
                    the next step.
                  </p>
                </div>
              )}
            </div>

            <div className='text-xs text-gray-500 space-y-2'>
              <p>✓ Repository read access</p>
              <p>✓ Webhook configuration access</p>
              <p>✓ Deployment status update access</p>
            </div>
          </div>
        ) : (
          <div className='text-center space-y-6'>
            <div className='space-y-4'>
              <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-8 h-8 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  ></path>
                </svg>
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  GitHub Integration Complete!
                </h3>
                <p className='text-gray-600'>
                  Otto has been successfully connected to your GitHub repositories. You can now
                  select a repository.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className='flex justify-between mt-8'>
        <Button type='button' variant='outline' onClick={onPrevious} className='px-6 py-2'>
          Previous Step
        </Button>

        <Button
          type='button'
          onClick={handleNext}
          disabled={!canProceed}
          className='bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-2'
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
