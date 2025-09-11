'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { functional } from '@Team-5-CodeCat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

// Otto SDK 타입 추출
type UserProject = Awaited<ReturnType<typeof functional.projects.projectGetUserProjects>>[0];


// 프로젝트 목록 컴포넌트
function ProjectsList() {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connection = useMemo(() => makeFetch(), []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setError(null);
        console.log('프로젝트 목록 조회 시작...');
        
        // Otto SDK를 사용해서 프로젝트 목록 조회
        const projectData = await functional.projects.projectGetUserProjects(connection);
        console.log('프로젝트 목록 조회 성공:', projectData);
        
        setProjects(projectData);
      } catch (error) {
        console.error('프로젝트 목록 조회 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '프로젝트 목록을 불러오는데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [connection]);

  // 상태별 배지 스타일
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return (
      <div className='p-4'>
        <div className='animate-pulse space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='border-b border-gray-200 pb-4'>
              <div className='h-5 bg-gray-200 rounded w-1/3 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-2/3 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-1/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-8 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-red-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>프로젝트를 불러올 수 없습니다</h3>
        <p className='text-gray-600 mb-4'>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className='inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className='p-8 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-1'>No projects yet</h3>
        <p className='text-gray-600 mb-4'>
          Create your first project to get started with CI/CD automation.
        </p>
        <Link
          href='/projects/new'
          className='inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
        >
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className='divide-y divide-gray-200'>
      {projects.map((project) => (
        <div key={project.projectID} className='p-4 hover:bg-gray-50 transition-colors'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center space-x-3'>
                <Link
                  href={`/projects/${project.projectID}`}
                  className='text-lg font-medium text-gray-900 hover:text-blue-600'
                >
                  {project.name}
                </Link>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles.active}`}
                >
                  Active
                </span>
              </div>

              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                {project.repositories.length > 0 && project.repositories[0] && (
                  <span>📁 {project.repositories[0].repoFullName}</span>
                )}
                {project.repositories.length > 1 && (
                  <span>+{project.repositories.length - 1} more</span>
                )}
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>

              {project.repositories.length > 0 && (
                <div className='mt-2'>
                  <div className='flex flex-wrap gap-2'>
                    {project.repositories.map((repo) => (
                      <span
                        key={repo.id}
                        className={`px-2 py-1 text-xs rounded-md ${
                          repo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {repo.selectedBranch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Link href={`/projects/${project.projectID}`}>
                <button className='text-blue-600 hover:text-blue-500 text-sm font-medium'>
                  View Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className='p-6'>
      {/* 프로젝트 개요 섹션: 추후 백엔드 연동으로 목록/페이지네이션 */}
      <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
      <p className='mt-1 text-sm text-gray-600'>Create and manage your CI/CD projects.</p>

      {/* 액션 영역: 프로젝트 생성 (가변 URL, Webhook 가이드 진입점) */}
      <div className='mt-6'>
        <Link
          href='/projects/create'
          className='inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
        >
          New Project
        </Link>
      </div>

      {/* 프로젝트 목록 */}
      <div className='mt-6 bg-white shadow rounded-lg overflow-hidden'>
        {/* TODO(백엔드 연동): 서버에서 프로젝트 목록 페치, 정렬/필터링 */}
        <ProjectsList />
      </div>
    </div>
  );
}
