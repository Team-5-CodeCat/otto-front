'use client';

import React from 'react';
import { CheckCircle2, Github, Folder, GitBranch, ArrowRight } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface ReviewStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function ReviewStep({ onboarding }: ReviewStepProps) {
  const { data } = onboarding;

  const handleCreateProject = () => {
    onboarding.createOnboardingProject();
  };

  const summaryItems = [
    {
      icon: Folder,
      label: '프로젝트 이름',
      value: data.projectName,
      color: 'blue'
    },
    {
      icon: Github,
      label: 'GitHub 저장소',
      value: `${data.githubOwner}/${data.githubRepoName}`,
      color: 'gray'
    },
    {
      icon: GitBranch,
      label: '브랜치',
      value: data.selectedBranch,
      color: 'green'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            확인 및 생성
          </h2>
          <p className="text-gray-600">
            설정을 확인해 주세요. 프로젝트와 기본 파이프라인을 생성해 드리겠습니다.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-8">
          {summaryItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  item.color === 'blue' ? 'bg-blue-100' :
                  item.color === 'gray' ? 'bg-gray-100' :
                  'bg-green-100'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.color === 'blue' ? 'text-blue-600' :
                    item.color === 'gray' ? 'text-gray-600' :
                    'text-green-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What Will Be Created */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-blue-900 mb-4 flex items-center space-x-2">
            <ArrowRight className="w-5 h-5" />
            <span>생성될 항목들:</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">프로젝트 설정</p>
                <p className="text-xs text-blue-700">
                  GitHub 저장소에 연결된 새 프로젝트
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">기본 파이프라인</p>
                <p className="text-xs text-blue-700">
                  빌드 및 테스트 작업을 포함한 기본 CI/CD 파이프라인
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-blue-900">웹훅 설정</p>
                <p className="text-xs text-blue-700">
                  {data.selectedBranch} 브랜치의 푸시 이벤트에 대한 자동 트리거
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => onboarding.prevStep()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
이전
          </button>
          <button
            onClick={handleCreateProject}
            disabled={onboarding.isLoading}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {onboarding.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>생성 중...</span>
              </div>
            ) : (
              '프로젝트 및 파이프라인 생성'
            )}
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚡ <strong>빠른 시작:</strong> 생성 후 새 파이프라인으로 이동하여 
            빌드 단계를 커스터마이즈하고 배포 대상을 추가할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}