'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 프로젝트 스토어
import { getProjects, initializeProjects, type Project } from '@/app/lib/projectStore';

// 프로젝트 목록 아이템 타입
interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  repo: string;
  status: 'active' | 'inactive' | 'error';
  lastBuild: string | null;
  updatedAt: string;
}

// 프로젝트 목록 컴포넌트
function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        // 초기 데이터 설정
        initializeProjects();

        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 로컬 스토어에서 프로젝트 목록 가져오기
        const projectData = getProjects();
        setProjects(projectData);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

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
        <div key={project.id} className='p-4 hover:bg-gray-50 transition-colors'>
          <div className='flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center space-x-3'>
                <Link
                  href={`/projects/${project.id}`}
                  className='text-lg font-medium text-gray-900 hover:text-blue-600'
                >
                  {project.name}
                </Link>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[project.status]}`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              <p className='text-sm text-gray-600 mt-1'>{project.description}</p>

              <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                <span>📁 {project.repo}</span>
                <span>
                  {project.lastBuild
                    ? `Last build: ${new Date(project.lastBuild).toLocaleDateString()}`
                    : 'No builds yet'}
                </span>
                <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Link href={`/projects/${project.id}`}>
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
          href='/projects/new'
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
