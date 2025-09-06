'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// UI components
import { Card, Button, Input } from '@/app/components/ui';

// GitHub 통합 컴포넌트
import { GitHubInstallButton } from '@/app/components/github/GitHubInstallButton';
import RepositorySelector from '@/app/components/github/RepositorySelector';
import BranchSelector from '@/app/components/github/BranchSelector';

// API
import { projectApi, GitHubRepository } from '@/app/lib/project-api';

// 프로젝트 폼 타입
interface ProjectForm {
  name: string;
  webhookUrl: string;
}

export default function ProjectCreatePage() {
  const router = useRouter();

  // 폼 상태
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    webhookUrl: '',
  });

  // GitHub 통합 상태
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>('');
  const [repositoryId, setRepositoryId] = useState<string>('');

  // 에러 상태
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectForm, string>>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  // 레포지토리 선택 핸들러
  const handleRepositorySelect = (repository: GitHubRepository) => {
    setSelectedRepository(repository);
    setSelectedBranch(repository.defaultBranch);
  };

  // 브랜치 선택 핸들러
  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
  };

  // 간단 검증 로직
  const validate = (data: ProjectForm) => {
    const next: Partial<Record<keyof ProjectForm, string>> = {};
    if (!data.name.trim()) next.name = '프로젝트 이름을 입력하세요.';
    return next;
  };

  const handleChange = (field: keyof ProjectForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // 프로젝트 생성
      const newProject = await projectApi.createProject({
        name: form.name,
        webhookUrl: form.webhookUrl || undefined,
      });

      setProjectId(newProject.projectID);

      // GitHub 통합이 이미 완료된 경우 레포지토리 연결
      if (selectedRepository && selectedBranch) {
        const connectedRepo = await projectApi.connectRepository(newProject.projectID, {
          repoFullName: selectedRepository.fullName,
          selectedBranch: selectedBranch,
          installationId: selectedRepository.installationId || undefined,
        });
        setRepositoryId(connectedRepo.id);
      }

      // 생성된 프로젝트 상세 페이지로 이동
      router.push(`/projects/${newProject.projectID}`);

    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      setErrors({ name: error instanceof Error ? error.message : '프로젝트 생성에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='p-6'>
      {/* 상단 헤더 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Create Project</h1>
          <p className='text-sm text-gray-600 mt-1'>
            GitHub 레포지토리와 연결된 CI/CD 프로젝트를 생성하세요
          </p>
        </div>
        <Link href='/projects' className='text-sm text-blue-600 hover:text-blue-500'>
          Back to Projects
        </Link>
      </div>

      {/* 폼 카드 */}
      <Card>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Project Name */}
          <Input
            id='name'
            label='Project Name'
            placeholder='e.g. my-awesome-project'
            description='프로젝트를 식별하기 위한 고유 이름'
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />

          {/* Webhook URL */}
          <Input
            id='webhookUrl'
            label='Webhook URL (Optional)'
            placeholder='https://myapp.com/webhook'
            description='CI/CD 이벤트를 받을 웹훅 URL (선택사항)'
            value={form.webhookUrl}
            onChange={(e) => handleChange('webhookUrl', e.target.value)}
          />

          {/* GitHub Repository Integration */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              GitHub Repository
            </label>
            <p className='text-sm text-gray-600 mb-4'>
              GitHub 앱을 설치하고 레포지토리를 연결하세요.
            </p>
            
            {/* GitHub 앱 설치 버튼 */}
            <div className="mb-4">
              <GitHubInstallButton
                onInstallSuccess={() => {
                  // 설치 성공 후 페이지 새로고침으로 설치 목록 업데이트
                  window.location.reload();
                }}
                onInstallError={(error) => {
                  setErrors({ name: error });
                }}
              />
            </div>

            {/* 레포지토리 선택 */}
            <RepositorySelector
              onRepositorySelect={handleRepositorySelect}
              selectedRepository={selectedRepository}
            />
          </div>

          {/* Branch Configuration Section */}
          {selectedRepository && projectId && (
            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Branch Configuration</h3>

              {/* Selected Branch Display */}
              {selectedBranch && (
                <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-green-600'>✅</span>
                    <span className='text-sm font-medium text-green-800'>
                      선택된 브랜치: {selectedBranch}
                    </span>
                  </div>
                </div>
              )}

              {/* 브랜치 선택 */}
              <BranchSelector
                projectId={projectId}
                repositoryId={repositoryId}
                onBranchSelect={handleBranchSelect}
                selectedBranch={selectedBranch}
              />
            </div>
          )}

          {/* GitHub App Webhook Info */}
          <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-blue-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h4 className='text-sm font-medium text-blue-800'>GitHub Integration</h4>
                <p className='text-sm text-blue-700 mt-1'>
                  GitHub 앱이 설치되면 자동으로 웹훅이 설정되어 push, pull_request 등의 이벤트를 감지합니다.
                  선택한 브랜치에 변경사항이 있을 때마다 CI/CD 파이프라인이 실행됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className='pt-2'>
            <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
