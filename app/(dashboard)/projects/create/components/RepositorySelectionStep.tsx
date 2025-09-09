'use client';

import React, { useEffect } from 'react';
import { Card, Button, Select } from '@/app/components/ui';
import type { GitHubSelection } from '../hooks/useProjectCreation';

interface GitHubInstallation {
  id: string;
  installationId: string;
  accountLogin: string | null;
  accountId: string | null;
}

interface Repository {
  name: string;
  fullName: string;
  private: boolean;
}

interface Branch {
  name: string;
  protected: boolean;
}

interface RepositorySelectionStepProps {
  githubSelection: GitHubSelection;
  installations: GitHubInstallation[];
  repositories: Repository[];
  branches: Branch[];
  loading: {
    installations: boolean;
    repositories: boolean;
    branches: boolean;
  };
  errors: {
    installations: string | null;
    repositories: string | null;
    branches: string | null;
  };
  onGitHubSelectionChange: (selection: Partial<GitHubSelection>) => void;
  onFetchRepositories: (installationId: number) => Promise<Repository[]>;
  onFetchBranches: (installationId: number, repositoryName: string) => Promise<Branch[]>;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

export function RepositorySelectionStep({
  githubSelection,
  installations,
  repositories,
  branches,
  loading,
  errors,
  onGitHubSelectionChange,
  onFetchRepositories,
  onFetchBranches,
  onNext,
  onPrevious,
  canProceed,
}: RepositorySelectionStepProps) {
  // 브랜치 가져오기 시도 추적
  const [branchFetchAttempts, setBranchFetchAttempts] = React.useState(new Set<string>());

  // 설치 선택 시 레포지토리 목록 가져오기
  useEffect(() => {
    if (
      githubSelection.installationId &&
      repositories.length === 0 &&
      !loading.repositories &&
      !errors.repositories
    ) {
      onFetchRepositories(githubSelection.installationId);
    }
  }, [
    githubSelection.installationId,
    repositories.length,
    loading.repositories,
    errors.repositories,
    onFetchRepositories,
  ]);

  // 레포지토리 선택 시 브랜치 목록 가져오기 (한 번만)
  useEffect(() => {
    if (
      githubSelection.installationId &&
      githubSelection.repositoryName &&
      !loading.branches &&
      !errors.branches
    ) {
      const attemptKey = `${githubSelection.installationId}-${githubSelection.repositoryName}`;

      // 이미 시도한 적이 있으면 다시 시도하지 않음
      if (!branchFetchAttempts.has(attemptKey)) {
        setBranchFetchAttempts((prev) => new Set([...prev, attemptKey]));
        onFetchBranches(githubSelection.installationId, githubSelection.repositoryName);
      }
    }
  }, [
    githubSelection.installationId,
    githubSelection.repositoryName,
    loading.branches,
    errors.branches,
    onFetchBranches,
    branchFetchAttempts,
  ]);

  // 레포지토리가 변경될 때 브랜치 시도 기록 초기화
  useEffect(() => {
    setBranchFetchAttempts(new Set());
  }, [githubSelection.repositoryName]);

  const handleInstallationChange = (value: string) => {
    if (value) {
      const installationId = parseInt(value, 10);
      onGitHubSelectionChange({ installationId });
    } else {
      onGitHubSelectionChange({ installationId: null });
    }
  };

  const handleRepositoryChange = (value: string) => {
    onGitHubSelectionChange({ repositoryName: value });
  };

  const handleBranchChange = (value: string) => {
    onGitHubSelectionChange({ branch: value });
  };

  const handleNext = () => {
    if (canProceed) {
      onNext();
    }
  };

  const installationOptions = installations.map((installation) => ({
    label: `${installation.accountLogin} (설치 ID: ${installation.installationId})`,
    value: installation.installationId.toString(),
  }));

  const repositoryOptions = repositories.map((repo) => ({
    label: `${repo.name} ${repo.private ? '(Private)' : '(Public)'}`,
    value: repo.name,
  }));

  const branchOptions = branches.map((branch) => ({
    label: `${branch.name} ${branch.protected ? '(Protected)' : ''}`,
    value: branch.name,
  }));

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Repository Selection</h1>
        <p className='text-gray-600'>Please select the GitHub repository and branch to connect.</p>
      </div>

      <Card className='p-8 space-y-6'>
        {/* GitHub Account/Organization Selection */}
        <div>
          <Select
            label='GitHub Account/Organization *'
            value={githubSelection.installationId?.toString() || ''}
            onChange={(e) => handleInstallationChange(e.target.value)}
            options={[{ label: 'Select account/organization', value: '' }, ...installationOptions]}
            className='w-full'
            disabled={loading.installations}
          />
          {loading.installations && (
            <p className='text-sm text-blue-600 mt-2'>Loading account list...</p>
          )}
          {errors.installations && (
            <p className='text-sm text-red-600 mt-2'>{errors.installations}</p>
          )}
          <p className='text-sm text-gray-500 mt-2'>
            Please select the GitHub account or organization where Otto is installed.
          </p>
        </div>

        {/* Repository Selection */}
        <div>
          <Select
            label='Repository *'
            value={githubSelection.repositoryName || ''}
            onChange={(e) => handleRepositoryChange(e.target.value)}
            options={[{ label: 'Select repository', value: '' }, ...repositoryOptions]}
            className='w-full'
            disabled={!githubSelection.installationId || loading.repositories}
          />
          {loading.repositories && (
            <p className='text-sm text-blue-600 mt-2'>Loading repository list...</p>
          )}
          {errors.repositories && (
            <div className='mt-2 space-y-2'>
              <p className='text-sm text-red-600'>{errors.repositories}</p>
              <button
                type='button'
                onClick={() =>
                  githubSelection.installationId &&
                  onFetchRepositories(githubSelection.installationId)
                }
                className='text-sm text-blue-600 hover:text-blue-800 underline'
                disabled={loading.repositories}
              >
                Try again
              </button>
            </div>
          )}
          <p className='text-sm text-gray-500 mt-2'>
            Please select the repository where you want to set up the CI/CD pipeline.
          </p>
        </div>

        {/* Branch Selection */}
        <div>
          <Select
            label='Branch *'
            value={githubSelection.branch || ''}
            onChange={(e) => handleBranchChange(e.target.value)}
            options={[{ label: 'Select branch', value: '' }, ...branchOptions]}
            className='w-full'
            disabled={!githubSelection.repositoryName || loading.branches}
          />
          {loading.branches && <p className='text-sm text-blue-600 mt-2'>Loading branch list...</p>}
          {!loading.branches &&
            !errors.branches &&
            githubSelection.repositoryName &&
            branches.length === 0 && (
              <div className='mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                <p className='text-sm text-yellow-800'>
                  Could not find branches in the selected repository. Please check if the repository
                  has branches and try again.
                </p>
                <button
                  type='button'
                  onClick={() => {
                    if (githubSelection.installationId && githubSelection.repositoryName) {
                      const attemptKey = `${githubSelection.installationId}-${githubSelection.repositoryName}`;
                      setBranchFetchAttempts((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(attemptKey);
                        return newSet;
                      });
                      onFetchBranches(
                        githubSelection.installationId,
                        githubSelection.repositoryName
                      );
                    }
                  }}
                  className='text-sm text-blue-600 hover:text-blue-800 underline mt-2'
                  disabled={loading.branches}
                >
                  Try again
                </button>
              </div>
            )}
          {errors.branches && (
            <div className='mt-2 space-y-2'>
              <p className='text-sm text-red-600'>{errors.branches}</p>
              <button
                type='button'
                onClick={() => {
                  if (githubSelection.installationId && githubSelection.repositoryName) {
                    // 시도 기록 초기화 후 재시도
                    const attemptKey = `${githubSelection.installationId}-${githubSelection.repositoryName}`;
                    setBranchFetchAttempts((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(attemptKey);
                      return newSet;
                    });
                    onFetchBranches(githubSelection.installationId, githubSelection.repositoryName);
                  }
                }}
                className='text-sm text-blue-600 hover:text-blue-800 underline'
                disabled={loading.branches}
              >
                Try again
              </button>
            </div>
          )}
          <p className='text-sm text-gray-500 mt-2'>
            Please select the branch that will trigger automatic deployment.
          </p>
        </div>

        {/* Selection Summary */}
        {githubSelection.installationId &&
          githubSelection.repositoryName &&
          githubSelection.branch && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
              <h4 className='font-semibold text-green-900 mb-2'>Selected Configuration</h4>
              <div className='space-y-1 text-sm text-green-700'>
                <p>
                  <strong>Account:</strong>{' '}
                  {
                    installations.find(
                      (i) => Number(i.installationId) === githubSelection.installationId
                    )?.accountLogin
                  }
                </p>
                <p>
                  <strong>Repository:</strong> {githubSelection.repositoryName}
                </p>
                <p>
                  <strong>Branch:</strong> {githubSelection.branch}
                </p>
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
