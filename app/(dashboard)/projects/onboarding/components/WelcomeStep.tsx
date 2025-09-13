'use client';

import React from 'react';
import { Cpu, Github, Zap, Shield } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface WelcomeStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function WelcomeStep({ onboarding }: WelcomeStepProps) {
  const features = [
    {
      icon: Github,
      title: 'GitHub 연동',
      description: '저장소를 연결하고 푸시할 때마다 자동으로 배포되도록 설정하세요'
    },
    {
      icon: Zap,
      title: '빠른 속도',
      description: '코드 커밋부터 프로덕션까지 몇 분 안에 완료되는 최적화된 파이프라인'
    },
    {
      icon: Shield,
      title: '보안 & 안정성',
      description: '엔터프라이즈급 보안과 신뢰할 수 있는 인프라를 제공합니다'
    }
  ];

  return (
    <div className="p-8 text-center">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 rounded-2xl shadow-lg mx-auto w-20 h-20 flex items-center justify-center mb-6">
          <Cpu className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Otto에 오신 것을 환영합니다! 🎉
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Otto는 여러분의 지능형 CI/CD 동반자입니다. 코드를 자동으로 빌드, 테스트, 배포하는
          파이프라인을 안전하게 설정할 수 있도록 도와드립니다.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6">
            <div className="bg-white p-3 rounded-lg shadow-sm w-fit mx-auto mb-4">
              <feature.icon className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* What We'll Do */}
      <div className="bg-emerald-50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-emerald-900 mb-3">함께 설정할 항목들:</h3>
        <div className="text-left max-w-md mx-auto space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            <span className="text-sm text-emerald-800">GitHub 계정 연결하기</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            <span className="text-sm text-emerald-800">자동화할 저장소 선택하기</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            <span className="text-sm text-emerald-800">첫 번째 파이프라인 생성하기</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={() => onboarding.nextStep()}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg"
        >
          시작하기
        </button>
      </div>

      {/* Time Estimate */}
      <p className="text-xs text-gray-500 mt-6">
        ⏱️ 설정 완료까지 약 2-3분 소요됩니다
      </p>
    </div>
  );
}