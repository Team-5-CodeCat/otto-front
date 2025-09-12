'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { functional } from '@cooodecat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

// UI components
import { Card, Button } from '@/app/components/ui';

// Project components

// SDK 타입 추출
type UserProject = Awaited<ReturnType<typeof functional.projects.projectGetUserProjects>>[0];

// 프로젝트 상세 타입 (SDK 타입 기반)
interface ProjectDetail extends UserProject {
  description?: string;
  language?: string;
  deploy?: string;
  status: 'active' | 'inactive' | 'error';
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  // 상태 관리
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SDK 연결 설정
  const connection = useMemo(() => makeFetch(), []);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const loadProject = async () => {
      try {
        setError(null);
        console.log('프로젝트 상세 조회 시작...', projectId);

        // SDK를 사용해서 프로젝트 목록 조회 후 해당 프로젝트 찾기
        const projects = await functional.projects.projectGetUserProjects(connection);
        console.log('프로젝트 목록 조회 성공:', projects);

        const projectData = projects.find((p) => p.projectID === projectId);

        if (projectData) {
          // SDK 데이터를 ProjectDetail 타입으로 변환
          const projectDetail: ProjectDetail = {
            ...projectData,
            status: 'active' as const, // 기본값
          };
          setProject(projectDetail);
        } else {
          setError('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트 상세 조회 실패:', error);
        const errorMessage =
          error instanceof Error ? error.message : '프로젝트를 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, connection]);

  // 웹훅 URL 복사
  const copyWebhookUrl = async () => {
    if (!project?.webhookUrl) return;

    try {
      await navigator.clipboard.writeText(project.webhookUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // 프로젝트 삭제 (현재는 비활성화 - SDK에 삭제 API가 없음)
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: SDK에 프로젝트 삭제 API가 추가되면 구현
      console.log('프로젝트 삭제 요청:', projectId);

      // 임시로 로딩 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 현재는 삭제 기능을 비활성화
      alert('프로젝트 삭제 기능은 현재 개발 중입니다.');
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-6'></div>
          <div className='space-y-4'>
            <div className='h-32 bg-gray-200 rounded'></div>
            <div className='h-32 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Error Loading Project</h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Link href='/projects' className='text-blue-600 hover:text-blue-500'>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // 프로젝트 없음
  if (!project) {
    return (
      <div className='p-6'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Project Not Found</h1>
          <p className='text-gray-600 mb-4'>The project you're looking for doesn't exist.</p>
          <Link href='/projects' className='text-blue-600 hover:text-blue-500'>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // 상태 배지 색상
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <div className='p-6 relative'>
      {/* 고정된 Back to Projects 버튼 - 우상단 */}
      <div className='absolute top-6 right-6'>
        <Link href='/projects' className='text-blue-600 hover:text-blue-500 text-sm font-medium'>
          ← Back to Projects
        </Link>
      </div>

      {/* 헤더 - Back 버튼 제거하고 프로젝트 정보만 */}
      <div className='mb-6 pr-32'>
        {' '}
        {/* 우측 여백으로 Back 버튼과 겹치지 않게 */}
        <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
          {project.name}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </h1>
        <p className='text-sm text-gray-600 mt-1'>
          Created {new Date(project.createdAt).toLocaleDateString()} • Last updated{' '}
          {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 기본 정보 */}
        <Card>
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Basic Information</h2>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Description</label>
              <p className='mt-1 text-sm text-gray-900'>
                {project.description || 'No description available'}
              </p>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>GitHub Repositories</label>
              <div className='mt-1 space-y-2'>
                {project.repositories.map((repo, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <a
                      href={`https://github.com/${repo.repoFullName}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:text-blue-500'
                    >
                      {repo.repoFullName} ↗
                    </a>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        repo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {repo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Language</label>
                <p className='mt-1 text-sm text-gray-900 capitalize'>Node.js</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Deployment</label>
                <p className='mt-1 text-sm text-gray-900 uppercase'>AWS EC2</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 브랜치 설정 */}
        <Card>
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Branch Configuration</h2>

            <div>
              <label className='block text-sm font-medium text-gray-700'>Selected Branches</label>
              <div className='mt-1 space-y-2'>
                {project.repositories.map((repo, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <span className='text-sm text-gray-900'>{repo.repoFullName}</span>
                    <span className='inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800'>
                      {repo.selectedBranch}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 웹훅 URL */}
        <Card>
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold text-gray-900'>Webhook Configuration</h2>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Webhook URL</label>
              <div className='flex items-center space-x-2'>
                <input
                  type='text'
                  value={project.webhookUrl || 'Webhook URL not available'}
                  readOnly
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm'
                />
                {project.webhookUrl && (
                  <Button
                    variant='outline'
                    onClick={copyWebhookUrl}
                    className={copySuccess ? 'bg-green-50 border-green-300 text-green-700' : ''}
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                {project.webhookUrl
                  ? 'GitHub App automatically configures this webhook URL for your repository'
                  : 'Webhook URL will be configured automatically when the project is set up'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 액션 버튼들 - 페이지 하단 */}
      <div className='mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3'>
        <Link href={`/projects/${projectId}/edit`}>
          <Button variant='outline'>Edit Project</Button>
        </Link>
        <Button
          variant='outline'
          onClick={() => setShowDeleteModal(true)}
          className='text-red-600 hover:text-red-700 border-red-300 hover:border-red-400'
        >
          Delete Project
        </Button>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Delete Project</h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className='flex justify-end space-x-3'>
              <Button
                variant='outline'
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={isDeleting}
                className='bg-red-600 hover:bg-red-700 text-white'
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
