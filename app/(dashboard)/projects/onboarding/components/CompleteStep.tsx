'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, ExternalLink, Zap } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface CompleteStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function CompleteStep({ onboarding }: CompleteStepProps) {
  const { data } = onboarding;

  const nextSteps = [
    {
      icon: Zap,
      title: '파이프라인 커스터마이징',
      description: '배포 대상, 환경 변수, 커스텀 빌드 단계를 추가해보세요',
      action: '다음 단계'
    },
    {
      icon: ExternalLink,
      title: '코드 푸시로 빌드 트리거',
      description: '저장소에 커밋을 만들어 Otto가 작동하는 모습을 확인해보세요',
      action: '지금 시도하기'
    },
    {
      icon: CheckCircle2,
      title: '모니터링 & 최적화',
      description: '빌드 로그를 보고, 성능을 추적하며, 파이프라인을 최적화하세요',
      action: '대시보드 탐색하기'
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="relative bg-gradient-to-r from-green-600 to-green-500 p-4 rounded-2xl shadow-lg mx-auto w-20 h-20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 모든 준비가 완료되었습니다!
          </h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            프로젝트 <strong>{data.projectName}</strong>가 성공적으로 생성되었습니다. 
            이제 Otto가 저장소의 변경사항을 모니터링하고 있습니다.
          </p>
        </div>

        {/* Project Summary */}
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-green-900 mb-3">생성된 항목들:</h3>
          <div className="text-sm text-green-800 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>프로젝트 <code className="bg-white px-1 rounded">{data.projectName}</code></span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span><code className="bg-white px-1 rounded">{data.githubOwner}/{data.githubRepoName}</code>에 연결됨</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>빌드 및 테스트 작업을 포함한 기본 파이프라인</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>푸시 시 자동 빌드를 위한 웹훅</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">다음 단계는?</h3>
          <div className="grid gap-4">
            {nextSteps.map((step, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <step.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <span className="text-xs text-blue-600 font-medium">{step.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redirect Info */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center space-x-2 text-blue-800">
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">3초 후 파이프라인으로 이동합니다...</span>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            자동화를 커스터마이징할 수 있는 파이프라인 에디터로 이동합니다.
          </p>
        </div>

        {/* Manual Action Button */}
        <button
          onClick={() => {
            // 온보딩 완료 후 첫 번째 프로젝트의 파이프라인 페이지로 이동
            // 실제로는 방금 생성된 프로젝트 ID를 사용해야 함
            window.location.href = `/projects/${data.githubOwner}/pipelines`;
          }}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg"
        >
          파이프라인으로 이동
        </button>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            도움이 필요하신가요?{' '}
            <a href="/docs" className="text-blue-600 hover:underline">문서</a>를 확인하거나{' '}
            <a href="/support" className="text-blue-600 hover:underline">지원팀에 문의</a>하세요.
          </p>
        </div>
      </div>
    </div>
  );
}