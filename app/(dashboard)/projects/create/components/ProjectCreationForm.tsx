'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { functional } from '@Team-5-CodeCat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

// SDK 타입 추출
// type CreateProjectResponse = Awaited<
//   ReturnType<typeof functional.projects.with_github.createProjectWithGithub>
// >;
type CreateProjectDto = Parameters<
  typeof functional.projects.with_github.createProjectWithGithub
>[1];

// Hooks
import { useProjectCreation } from '../hooks/useProjectCreation';
import { useGitHubIntegration } from '../hooks/useGitHubIntegration';

// Components
import { BasicInfoStep } from './BasicInfoStep';
import { GitHubConnectionStep } from './GitHubConnectionStep';
import { RepositorySelectionStep } from './RepositorySelectionStep';
import { CreateReviewStep } from './CreateReviewStep';

// Step indicator component
interface StepIndicatorProps {
  currentStep: number;
  stepLabels: string[];
}

function StepIndicator({ currentStep, stepLabels }: StepIndicatorProps) {
  return (
    <div className='w-full bg-white border-b border-gray-200 py-6'>
      <div className='max-w-4xl mx-auto px-6'>
        <div className='flex items-center justify-between'>
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={index} className='flex items-center'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                      ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span
                    className={`
                      text-sm font-medium
                      ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                    `}
                  >
                    {label}
                  </span>
                </div>
                {index < stepLabels.length - 1 && (
                  <div
                    className={`
                      w-16 h-0.5 mx-4
                      ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProjectCreationForm() {
  const router = useRouter();
  const projectState = useProjectCreation();
  const githubIntegration = useGitHubIntegration();

  const connection = useMemo(() => makeFetch(), []);

  const stepLabels = ['기본 정보', 'GitHub 연동', '레포지토리 선택', '생성 확인'];
  const stepMap = {
    basic: 1,
    github: 2,
    repository: 3,
    review: 4,
  };
  const currentStep = stepMap[projectState.state.step];

  // 프로젝트 생성 함수
  const handleCreateProject = async () => {
    const { basicInfo, githubSelection } = projectState.state;

    if (
      !githubSelection.installationId ||
      !githubSelection.repositoryName ||
      !githubSelection.branch
    ) {
      projectState.setSubmitError('필요한 정보가 누락되었습니다.');
      return;
    }

    try {
      projectState.setSubmitting(true);
      projectState.setSubmitError(null);

      // SDK를 사용하여 GitHub 프로젝트 생성
      const createProjectData: CreateProjectDto = {
        name: basicInfo.name,
        installationId: githubSelection.installationId?.toString() || '', // GitHub Installation ID를 문자열로 변환
        repositoryFullName: githubSelection.repositoryName || '',
        selectedBranch: githubSelection.branch || '',
      };

      const result = await functional.projects.with_github.createProjectWithGithub(
        connection,
        createProjectData
      );

      console.log('프로젝트 생성 성공:', result);

      // 세션 정리
      projectState.clearSession();

      // 프로젝트 생성 완료 후 프로젝트 목록 페이지로 이동
      router.push('/projects');
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.';
      projectState.setSubmitError(errorMessage);
    } finally {
      projectState.setSubmitting(false);
    }
  };

  // GitHub 앱 설치 처리
  const handleInstallGitHub = async () => {
    await githubIntegration.installGitHubApp();
  };

  // 레포지토리 목록 가져오기
  const handleFetchRepositories = async (installationId: number) => {
    githubIntegration.clearRepositories();
    return await githubIntegration.fetchRepositories(installationId);
  };

  // 브랜치 목록 가져오기
  const handleFetchBranches = async (installationId: number, repositoryName: string) => {
    githubIntegration.clearBranches();
    return await githubIntegration.fetchBranches(installationId, repositoryName);
  };

  const renderCurrentStep = () => {
    switch (projectState.state.step) {
      case 'basic':
        return (
          <BasicInfoStep
            basicInfo={projectState.state.basicInfo}
            onBasicInfoChange={projectState.setBasicInfo}
            onNext={projectState.goToNextStep}
            canProceed={projectState.canProceedFromBasic()}
          />
        );

      case 'github':
        return (
          <GitHubConnectionStep
            hasInstallation={githubIntegration.hasInstallation}
            isPolling={githubIntegration.isPolling}
            isLoading={githubIntegration.loading.status || githubIntegration.loading.installUrl}
            error={githubIntegration.errors.status || githubIntegration.errors.installUrl}
            onInstallGitHub={handleInstallGitHub}
            onNext={projectState.goToNextStep}
            onPrevious={projectState.goToPreviousStep}
            canProceed={githubIntegration.hasInstallation}
          />
        );

      case 'repository':
        return (
          <RepositorySelectionStep
            githubSelection={projectState.state.githubSelection}
            installations={githubIntegration.installations}
            repositories={githubIntegration.repositories}
            branches={githubIntegration.branches}
            loading={{
              installations: githubIntegration.loading.installations,
              repositories: githubIntegration.loading.repositories,
              branches: githubIntegration.loading.branches,
            }}
            errors={{
              installations: githubIntegration.errors.installations,
              repositories: githubIntegration.errors.repositories,
              branches: githubIntegration.errors.branches,
            }}
            onGitHubSelectionChange={projectState.setGitHubSelection}
            onFetchRepositories={handleFetchRepositories}
            onFetchBranches={handleFetchBranches}
            onNext={projectState.goToNextStep}
            onPrevious={projectState.goToPreviousStep}
            canProceed={projectState.canProceedFromRepository()}
          />
        );

      case 'review':
        return (
          <CreateReviewStep
            basicInfo={projectState.state.basicInfo}
            githubSelection={projectState.state.githubSelection}
            installations={githubIntegration.installations}
            isSubmitting={projectState.state.isSubmitting}
            submitError={projectState.state.submitError}
            onCreateProject={handleCreateProject}
            onPrevious={projectState.goToPreviousStep}
            canCreate={projectState.canCreateProject()}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 스텝 인디케이터 */}
      <StepIndicator currentStep={currentStep} stepLabels={stepLabels} />

      {/* 메인 컨텐츠 */}
      <div className='py-12 px-6'>{renderCurrentStep()}</div>
    </div>
  );
}
