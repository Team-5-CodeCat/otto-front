'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

// UI components
import { Card, Button, Input, Textarea, Select } from '@/app/components/ui';

// 프로젝트 스토어
import { getProject, updateProject } from '@/app/lib/projectStore';

// 프로젝트 편집 폼 타입
interface ProjectEditForm {
  name: string;
  description: string;
  repo: string;
  triggerBranches: string;
  defaultBranch: string;
  language: string;
  deploy: string;
}

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // 상태 관리
  const [form, setForm] = useState<ProjectEditForm>({
    name: '',
    description: '',
    repo: '',
    triggerBranches: '',
    defaultBranch: '',
    language: '',
    deploy: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectEditForm, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadProject = async () => {
      try {
        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 로컬 스토어에서 프로젝트 조회
        const projectData = getProject(projectId);

        if (projectData) {
          // Project 데이터를 폼 데이터로 변환
          setForm({
            name: projectData.name,
            description: projectData.description,
            repo: projectData.repo,
            triggerBranches: projectData.triggerBranches,
            defaultBranch: projectData.defaultBranch,
            language: projectData.language,
            deploy: projectData.deploy,
          });
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // 검증 로직
  const validate = (data: ProjectEditForm) => {
    const next: Partial<Record<keyof ProjectEditForm, string>> = {};
    if (!data.name.trim()) next.name = '프로젝트 이름을 입력하세요.';
    if (!data.repo.trim()) next.repo = 'GitHub 레포지토리를 입력하세요.';
    if (!data.triggerBranches.trim()) next.triggerBranches = '트리거 브랜치를 입력하세요.';
    if (!data.defaultBranch.trim()) next.defaultBranch = '기본 브랜치를 입력하세요.';
    if (!data.language) next.language = '언어 환경을 선택하세요.';
    if (!data.deploy) next.deploy = '배포 환경을 선택하세요.';
    return next;
  };

  const handleChange = (field: keyof ProjectEditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // 실시간 검증 (에러가 있을 때만)
    if (errors[field]) {
      const fieldErrors = validate({ ...form, [field]: value });
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      // 로딩 시뮬레이션
      await new Promise((r) => setTimeout(r, 800));

      // 로컬 스토어에서 프로젝트 업데이트
      const updatedProject = updateProject(projectId, {
        name: form.name,
        description: form.description,
        repo: form.repo,
        triggerBranches: form.triggerBranches,
        defaultBranch: form.defaultBranch,
        language: form.language,
        deploy: form.deploy,
      });

      if (updatedProject) {
        router.push(`/projects/${projectId}`);
      } else {
        console.error('Failed to update project: Project not found');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 셀렉트 옵션
  const languageOptions = [
    { label: 'Node.js', value: 'node' },
    //{ label: 'Python', value: 'python' },
    //{ label: 'Java', value: 'java' },
    //{ label: 'Go', value: 'go' },
  ];

  const deployOptions = [
    { label: 'AWS EC2', value: 'ec2' },
    //{ label: 'Docker Container', value: 'docker' },
    //{ label: 'AWS Lambda', value: 'lambda' },
  ];

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-6'></div>
          <div className='space-y-4'>
            <div className='h-10 bg-gray-200 rounded'></div>
            <div className='h-24 bg-gray-200 rounded'></div>
            <div className='h-10 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 relative'>
      {/* 고정된 Back 버튼 - 우상단 */}
      <div className='absolute top-6 right-6'>
        <Link
          href={`/projects/${projectId}`}
          className='text-blue-600 hover:text-blue-500 text-sm font-medium'
        >
          ← Back to Project
        </Link>
      </div>

      {/* 헤더 */}
      <div className='mb-6 pr-32'>
        {' '}
        {/* 우측 여백으로 Back 버튼과 겹치지 않게 */}
        <h1 className='text-2xl font-bold text-gray-900'>Edit Project</h1>
        <p className='text-sm text-gray-600 mt-1'>Update project configuration and settings</p>
      </div>

      {/* 편집 폼 */}
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
            description='GitHub 앱이 설치된 레포지토리'
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

          {/* Submit Buttons */}
          <div className='flex justify-end space-x-3 pt-6 border-t'>
            <Link href={`/projects/${projectId}`}>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </Link>
            <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
