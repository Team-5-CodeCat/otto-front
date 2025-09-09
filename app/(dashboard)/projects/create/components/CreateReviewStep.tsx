'use client';

import React from 'react';
import { Card, Button } from '@/app/components/ui';
import type { ProjectBasicInfo, GitHubSelection } from '../hooks/useProjectCreation';

interface GitHubInstallation {
  id: string;
  installationId: string;
  accountLogin: string | null;
  accountId: string | null;
}

interface CreateReviewStepProps {
  basicInfo: ProjectBasicInfo;
  githubSelection: GitHubSelection;
  installations: GitHubInstallation[];
  isSubmitting: boolean;
  submitError: string | null;
  onCreateProject: () => Promise<void>;
  onPrevious: () => void;
  canCreate: boolean;
}

export function CreateReviewStep({
  basicInfo,
  githubSelection,
  installations,
  isSubmitting,
  submitError,
  onCreateProject,
  onPrevious,
  canCreate,
}: CreateReviewStepProps) {
  const selectedInstallation = installations.find(
    (installation) => Number(installation.installationId) === githubSelection.installationId
  );

  const handleCreate = async () => {
    if (canCreate && !isSubmitting) {
      await onCreateProject();
    }
  };

  const getLanguageDisplayName = (language: string) => {
    const languageMap: Record<string, string> = {
      'node.js': 'Node.js',
    };
    return languageMap[language] || language;
  };

  const getDeployDisplayName = (deploy: string) => {
    const deployMap: Record<string, string> = {
      EC2: 'Amazon EC2',
    };
    return deployMap[deploy] || deploy;
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Review and Create</h1>
        <p className='text-gray-600'>Please review your information and create the project.</p>
      </div>

      <div className='space-y-6'>
        {/* Project Basic Information */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Project Information</h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Project Name:</span>
              <span className='font-semibold'>{basicInfo.name}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Development Language:</span>
              <span className='font-semibold'>{getLanguageDisplayName(basicInfo.language)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Deployment Environment:</span>
              <span className='font-semibold'>{getDeployDisplayName(basicInfo.deploy)}</span>
            </div>
          </div>
        </Card>

        {/* GitHub Integration Information */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>GitHub Integration Settings</h3>
          <div className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>GitHub Account/Organization:</span>
              <span className='font-semibold'>
                {selectedInstallation?.accountLogin} (Installation ID:{' '}
                {selectedInstallation?.installationId})
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Repository:</span>
              <span className='font-semibold'>{githubSelection.repositoryName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Branch:</span>
              <span className='font-semibold'>{githubSelection.branch}</span>
            </div>
          </div>
        </Card>

        {/* Auto-Generated Configuration */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Auto-Generated Configuration</h3>
          <div className='space-y-3 text-sm'>
            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-semibold text-gray-900'>Webhook Configuration</p>
                <p className='text-gray-600'>
                  Build will be automatically triggered when code is pushed to the selected branch.
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-semibold text-gray-900'>Build Pipeline</p>
                <p className='text-gray-600'>
                  Build scripts optimized for {getLanguageDisplayName(basicInfo.language)} projects
                  will be configured.
                </p>
              </div>
            </div>
            <div className='flex items-start space-x-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-semibold text-gray-900'>Deployment Settings</p>
                <p className='text-gray-600'>
                  Automatic deployment to {getDeployDisplayName(basicInfo.deploy)} will be
                  configured.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 에러 메시지 */}
        {submitError && (
          <Card className='p-4 bg-red-50 border-red-200'>
            <div className='flex items-start space-x-3'>
              <svg className='w-5 h-5 text-red-500 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <h4 className='text-sm font-semibold text-red-800'>Project Creation Failed</h4>
                <p className='text-sm text-red-700 mt-1'>{submitError}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className='flex justify-between mt-8'>
        <Button
          type='button'
          variant='outline'
          onClick={onPrevious}
          disabled={isSubmitting}
          className='px-6 py-2'
        >
          Previous Step
        </Button>

        <Button
          type='button'
          onClick={handleCreate}
          disabled={!canCreate || isSubmitting}
          className='bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-8 py-2'
        >
          {isSubmitting ? (
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
              <span>Creating project...</span>
            </div>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>

      {/* 생성 중 안내 */}
      {isSubmitting && (
        <Card className='mt-6 p-4 bg-blue-50 border-blue-200'>
          <div className='flex items-start space-x-3'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mt-0.5'></div>
            <div>
              <h4 className='text-sm font-semibold text-blue-800'>Creating Project</h4>
              <p className='text-sm text-blue-700 mt-1'>
                Please wait while webhook configuration and initial pipeline setup are completed.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
