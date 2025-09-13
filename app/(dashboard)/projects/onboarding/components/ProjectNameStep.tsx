'use client';

import React, { useState, useEffect } from 'react';
import { Folder, Sparkles } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface ProjectNameStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

export function ProjectNameStep({ onboarding }: ProjectNameStepProps) {
  const [inputValue, setInputValue] = useState(onboarding.data.projectName);

  // 입력값 변경 시 onboarding 데이터 업데이트
  useEffect(() => {
    onboarding.updateData({ projectName: inputValue });
  }, [inputValue, onboarding]);

  // 프로젝트 이름 제안
  const suggestions = [
    '멋진 앱',
    '웹 포트폴리오',
    'API 서비스',
    'React 대시보드',
    '모바일 백엔드',
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleNext = () => {
    if (onboarding.canProceedToNext()) {
      onboarding.nextStep();
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Folder className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프로젝트 이름 설정
          </h2>
          <p className="text-gray-600">
            CI/CD 프로젝트를 위한 기억하기 쉬운 이름을 선택하세요. 나중에 언제든지 변경할 수 있습니다.
          </p>
        </div>

        {/* Project Name Input */}
        <div className="mb-6">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 이름
          </label>
          <input
            id="projectName"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="프로젝트 이름을 입력하세요..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">빠른 제안:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
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

        {/* Helper Text */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 프로젝트의 목적을 반영하는 설명적인 이름을 사용하세요. 
            여러 프로젝트가 있을 때 빠르게 식별하는 데 도움이 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}