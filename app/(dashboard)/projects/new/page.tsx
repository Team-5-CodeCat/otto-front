'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// UI components (shadcn-like wrappers)
import { Card, Button, Input, Textarea, Select } from '@/app/components/ui';

// 프로젝트 스토어
import { createProject } from '@/app/lib/projectStore';

// 프로젝트 폼 타입 개선
interface ProjectForm {
  name: string;
  description: string;
  repo: string;
  triggerBranches: string; // 웹훅 트리거 대상 브랜치들 (쉼표로 구분)
  defaultBranch: string; // 기본 작업 브랜치
  language: string;
  deploy: string;
}

export default function ProjectCreatePage() {
  const router = useRouter();

  // 폼 상태
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    description: '',
    repo: '',
    triggerBranches: 'main,develop', // 기본값: main, develop
    defaultBranch: 'main', // 기본값: main
    language: '',
    deploy: '',
  });

  // 에러 상태
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectForm, string>>>({});
  const [isSubmitting, setSubmitting] = useState(false);

  // 간단 검증 로직 (필수값 확인)
  const validate = (data: ProjectForm) => {
    const next: Partial<Record<keyof ProjectForm, string>> = {};
    if (!data.name.trim()) next.name = '프로젝트 이름을 입력하세요.';
    if (!data.repo.trim()) next.repo = 'GitHub 레포지토리를 입력하세요.';
    if (!data.triggerBranches.trim()) next.triggerBranches = '트리거 브랜치를 입력하세요.';
    if (!data.defaultBranch.trim()) next.defaultBranch = '기본 브랜치를 입력하세요.';
    if (!data.language) next.language = '언어 환경을 선택하세요.';
    if (!data.deploy) next.deploy = '배포 환경을 선택하세요.';
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
      // 로컬 스토어에 프로젝트 생성 (실제로는 백엔드 API 호출)
      const newProject = createProject({
        name: form.name,
        description: form.description,
        repo: form.repo,
        triggerBranches: form.triggerBranches,
        defaultBranch: form.defaultBranch,
        language: form.language,
        deploy: form.deploy,
      });

      // 로딩 시뮬레이션
      await new Promise((r) => setTimeout(r, 800));

      // 생성된 프로젝트 상세 페이지로 이동
      router.push(`/projects/${newProject.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 셀렉트 옵션
  const languageOptions = [
    { label: 'Node.js', value: 'node' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'Go', value: 'go' },
  ];

  const deployOptions = [
    { label: 'AWS EC2', value: 'ec2' },
    { label: 'Docker Container', value: 'docker' },
    { label: 'AWS Lambda', value: 'lambda' },
  ];

  return (
    <div className='p-6'>
      {/* 상단 헤더 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Create Project</h1>
          <p className='text-sm text-gray-600 mt-1'>
            GitHub App will automatically configure webhooks
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
            placeholder='e.g. acme-ci'
            description='프로젝트를 식별하기 위한 고유 이름'
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
          />

          {/* Description */}
          <Textarea
            id='description'
            label='Description'
            description='프로젝트 목적이나 세부 사항을 간단히 기록'
            placeholder='Short description of the project'
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          {/* GitHub Repository */}
          <Input
            id='repo'
            label='GitHub Repository'
            placeholder='owner/repo'
            description='GitHub 앱이 설치된 레포지토리 (앱 설치 후 자동으로 웹훅 설정됨)'
            value={form.repo}
            onChange={(e) => handleChange('repo', e.target.value)}
            error={errors.repo}
            required
          />

          {/* Branch Configuration Section */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Branch Configuration</h3>

            {/* Trigger Branches */}
            <Input
              id='triggerBranches'
              label='Trigger Branches'
              placeholder='main,develop,feature/*'
              description='CI/CD를 트리거할 브랜치들 (쉼표로 구분, 와일드카드 지원)'
              value={form.triggerBranches}
              onChange={(e) => handleChange('triggerBranches', e.target.value)}
              error={errors.triggerBranches}
              required
            />

            {/* Default Branch */}
            <Input
              id='defaultBranch'
              label='Default Branch'
              placeholder='main'
              description='기본 작업 브랜치 (배포 기준 브랜치)'
              value={form.defaultBranch}
              onChange={(e) => handleChange('defaultBranch', e.target.value)}
              error={errors.defaultBranch}
              required
            />
          </div>

          {/* Environment Configuration Section */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Environment Configuration</h3>

            {/* Language Environment */}
            <Select
              id='language'
              label='Language Environment'
              description='기본 언어/런타임 환경'
              value={form.language}
              onChange={(e) => handleChange('language', e.target.value)}
              options={languageOptions}
              error={errors.language}
              required
            />

            {/* Deployment Environment */}
            <Select
              id='deploy'
              label='Deployment Environment'
              description='배포 대상 환경'
              value={form.deploy}
              onChange={(e) => handleChange('deploy', e.target.value)}
              options={deployOptions}
              error={errors.deploy}
              required
            />
          </div>

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
                <h4 className='text-sm font-medium text-blue-800'>Automatic Webhook Setup</h4>
                <p className='text-sm text-blue-700 mt-1'>
                  GitHub App이 레포지토리에 설치되면 push, pull_request 등의 웹훅이 자동으로
                  설정됩니다. 위에서 설정한 브랜치 조건에 따라 파이프라인이 트리거됩니다.
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
