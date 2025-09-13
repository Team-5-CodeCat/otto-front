'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from './components/OnboardingWizard';
import { useProjectStore } from '@/lib/projectStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { projects, fetchProjects, isLoading } = useProjectStore();
  
  // 페이지 로드 시 프로젝트 확인
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // 이미 프로젝트가 있는 사용자라면 적절한 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      // 첫 번째 프로젝트의 파이프라인 페이지로 이동
      router.push(`/projects/${projects[0]?.projectId}/pipelines`);
    }
  }, [isLoading, projects, router]);
  
  // 로딩 중이거나 프로젝트가 있으면 아무것도 렌더링하지 않음
  if (isLoading || projects.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트를 확인 중입니다...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Otto에 오신 것을 환영합니다! 🚀
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            첫 번째 CI/CD 파이프라인을 시작해보세요. 
            GitHub 저장소를 연결하고 자동화를 설정하는 과정을 안내해드립니다.
          </p>
        </div>

        {/* Onboarding Wizard */}
        <OnboardingWizard />
      </div>
    </div>
  );
}