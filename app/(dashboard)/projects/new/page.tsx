'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// UI components
import { Button, Card, Input, Select, Textarea } from '@/app/components/ui';

// Otto SDK

// 프로젝트 스토어 (폴백용)
import { createProject as createLocalProject } from '@/app/lib/projectStore';
import makeFetch from '@/lib/make-fetch';
import { projectCreateProject } from '@Team-5-CodeCat/otto-sdk/lib/functional/projects';

// 프로젝트 폼 타입
interface ProjectForm {
  name: string;
  description: string;
  language: string;
  deploy: string;
}

// 환경 변수 타입
interface EnvVar {
  key: string;
  value: string;
  masked: boolean;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

export default function NewProjectPage() {
  const router = useRouter();

  // 폼 상태
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    description: '',
    language: 'Node.js',
    deploy: 'S3',
  });

  // 환경 변수 상태
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  // 에러 및 제출 상태
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectForm, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setSubmitting] = useState(false);

  // 폼 입력 핸들러
  const handleInputChange = (field: keyof ProjectForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // 환경 변수 관리 함수들
  const addEnvVar = () => {
    setEnvVars((prev) => [...prev, { key: '', value: '', masked: false }]);
  };

  const removeEnvVar = (index: number) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: keyof EnvVar, value: string | boolean) => {
    setEnvVars((prev) =>
      prev.map((envVar, i) => (i === index ? { ...envVar, [field]: value } : envVar))
    );
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectForm, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '프로젝트 이름을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      console.log('프로젝트 생성 시작:', formData);

      // SDK를 사용하여 프로젝트 생성 (직접 함수 호출)
      const result = await projectCreateProject(makeFetch(), {
        name: formData.name,
        webhookUrl: `https://api.otto.com/webhook/projects/${formData.name}`,
      });

      console.log('프로젝트 생성 성공:', result);

      // 로컬 스토어에도 저장 (폴백)
      const localProject = {
        name: formData.name,
        description: formData.description,
        repo: '',
        triggerBranches: 'main',
        defaultBranch: 'main',
        language: formData.language,
        deploy: formData.deploy,
      };

      createLocalProject(localProject);

      // 성공 시 프로젝트 목록 페이지로 이동
      router.push('/projects');
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='mb-6'>
        <div className='flex items-center gap-2 text-sm text-gray-600 mb-4'>
          <Link href='/projects' className='hover:text-blue-600'>
            프로젝트
          </Link>
          <span>/</span>
          <span>새 프로젝트</span>
        </div>
        <h1 className='text-2xl font-bold'>새 프로젝트 만들기</h1>
        <p className='text-gray-600 mt-2'>새로운 CI/CD 프로젝트를 생성하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* 프로젝트 기본 정보 */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>프로젝트 정보</h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                프로젝트 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='my-awesome-project'
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className='text-sm text-red-600 mt-1'>{errors.name}</p>}
            </div>

            <div>
              <Select
                label='언어/프레임워크'
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                options={[
                  { label: 'Node.js', value: 'Node.js' },
                  { label: 'React', value: 'React' },
                  { label: 'Vue.js', value: 'Vue.js' },
                  { label: 'Python', value: 'Python' },
                  { label: 'Java', value: 'Java' },
                  { label: 'Go', value: 'Go' },
                ]}
              />
            </div>
          </div>

          <div className='mt-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>설명</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder='프로젝트에 대한 간단한 설명을 입력하세요...'
              rows={3}
            />
          </div>
        </Card>

        {/* 배포 설정 */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>배포 설정</h2>

          <Select
            label='배포 대상'
            value={formData.deploy}
            onChange={(e) => handleInputChange('deploy', e.target.value)}
            options={[
              { label: 'Amazon S3', value: 'S3' },
              { label: 'Vercel', value: 'Vercel' },
              { label: 'Netlify', value: 'Netlify' },
              { label: 'GitHub Pages', value: 'GitHub Pages' },
              { label: 'Docker', value: 'Docker' },
            ]}
          />
        </Card>

        {/* 환경 변수 */}
        <Card className='p-6'>
          <h2 className='text-lg font-semibold mb-4'>환경 변수</h2>

          <div className='space-y-3'>
            {envVars.map((envVar, index) => (
              <div key={index} className='flex gap-2 items-start'>
                <Input
                  value={envVar.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  placeholder='환경 변수 이름'
                  className='flex-1'
                />
                <Input
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder='값'
                  type={envVar.masked ? 'password' : 'text'}
                  className='flex-1'
                />
                <label className='flex items-center gap-1 text-sm'>
                  <input
                    type='checkbox'
                    checked={envVar.masked}
                    onChange={(e) => updateEnvVar(index, 'masked', e.target.checked)}
                  />
                  마스킹
                </label>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeEnvVar(index)}
                  className='text-red-600 hover:text-red-700'
                >
                  삭제
                </Button>
              </div>
            ))}

            <Button type='button' variant='outline' onClick={addEnvVar} className='w-full'>
              환경 변수 추가
            </Button>
          </div>
        </Card>

        {/* 제출 버튼 */}
        <div className='flex gap-4'>
          <Button type='button' variant='outline' onClick={() => router.back()}>
            취소
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='bg-blue-600 text-white hover:bg-blue-700'
          >
            {isSubmitting ? '생성 중...' : '프로젝트 생성'}
          </Button>
        </div>

        {submitError && (
          <div className='text-sm text-red-600 bg-red-50 p-3 rounded'>{submitError}</div>
        )}
      </form>
    </div>
  );
}
