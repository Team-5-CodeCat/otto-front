'use client';

import React from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface CreatingStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function CreatingStep({ onboarding: _onboarding }: CreatingStepProps) {
  const steps = [
    { id: 1, label: '프로젝트 워크스페이스 생성 중', completed: true },
    { id: 2, label: 'GitHub 저장소 연결 중', completed: true },
    { id: 3, label: '파이프라인 설정 구성 중', completed: true },
    { id: 4, label: '웹훅 핸들러 설치 중', completed: false },
    { id: 5, label: '설정 마무리 중', completed: false },
  ];

  return (
    <div className="p-8">
      <div className="max-w-lg mx-auto text-center">
        {/* Loading Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 rounded-2xl shadow-lg mx-auto w-20 h-20 flex items-center justify-center">
              <Cpu className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프로젝트 생성 중
          </h2>
          <p className="text-gray-600">
            Otto가 CI/CD 파이프라인을 설정하고 있습니다. 잠시만 기다려 주세요...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 text-left">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-emerald-600 text-white' 
                    : index === steps.findIndex(s => !s.completed)
                    ? 'bg-emerald-100 border-2 border-emerald-600'
                    : 'bg-gray-200'
                }`}>
                  {step.completed ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : index === steps.findIndex(s => !s.completed) ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium text-gray-500">{step.id}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  step.completed 
                    ? 'text-gray-900 font-medium' 
                    : index === steps.findIndex(s => !s.completed)
                    ? 'text-emerald-600 font-medium'
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Progress */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: '75%' }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">거의 완료되었습니다...</p>
        </div>

        {/* Fun Facts */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>알고 계셨나요?</strong> Otto는 프로젝트의 언어를 자동으로 감지하고 
            최적화된 빌드 구성을 제안할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}