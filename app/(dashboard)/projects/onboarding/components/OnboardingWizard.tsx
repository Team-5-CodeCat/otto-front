'use client';

import React from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { WelcomeStep } from './WelcomeStep';
import { ProjectNameStep } from './ProjectNameStep';
import { GitHubSetupStep } from './GitHubSetupStep';
import { RepositoryStep } from './RepositoryStep';
import { ReviewStep } from './ReviewStep';
import { CreatingStep } from './CreatingStep';
import { CompleteStep } from './CompleteStep';

export function OnboardingWizard() {
  const onboarding = useOnboarding();
  
  // 단계별 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (onboarding.currentStep) {
      case 'welcome':
        return <WelcomeStep onboarding={onboarding} />;
      case 'project-name':
        return <ProjectNameStep onboarding={onboarding} />;
      case 'github-setup':
        return <GitHubSetupStep onboarding={onboarding} />;
      case 'repository':
        return <RepositoryStep onboarding={onboarding} />;
      case 'review':
        return <ReviewStep onboarding={onboarding} />;
      case 'creating':
        return <CreatingStep onboarding={onboarding} />;
      case 'complete':
        return <CompleteStep onboarding={onboarding} />;
      default:
        return <WelcomeStep onboarding={onboarding} />;
    }
  };

  // 단계별 진행률 계산
  const getProgress = () => {
    const steps = ['welcome', 'project-name', 'github-setup', 'repository', 'review', 'creating', 'complete'];
    const currentIndex = steps.indexOf(onboarding.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Setup Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(getProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/50 overflow-hidden">
        {renderCurrentStep()}
      </div>

      {/* Error Display */}
      {onboarding.error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800">{onboarding.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}