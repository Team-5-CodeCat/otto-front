'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { ProtectedRoute } from '@/app/components/auth/AuthGuard';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';

export default function ProjectsPage() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <div className='p-6'>
        {/* 상단 헤더 */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
            <p className='text-sm text-gray-600 mt-1'>
              안녕하세요, {user?.name || '사용자'}님! 프로젝트를 관리하세요.
            </p>
          </div>
          <div className='flex space-x-3'>
            <Link href='/projects/new'>
              <Button variant='primary'>
                새 프로젝트
              </Button>
            </Link>
            <Button variant='outline' onClick={signOut}>
              로그아웃
            </Button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className='space-y-4'>
          <Card className='p-6'>
            <div className='text-center py-12'>
              <div className='text-gray-400 mb-4'>
                <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>아직 프로젝트가 없습니다</h3>
              <p className='text-gray-600 mb-6'>
                첫 번째 CI/CD 프로젝트를 생성하고 GitHub와 연결해보세요.
              </p>
              <Link href='/projects/new'>
                <Button variant='primary' size='lg'>
                  프로젝트 생성하기
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
