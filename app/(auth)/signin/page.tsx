'use client';

import React, { useState } from 'react';
import { Cpu, Github } from 'lucide-react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import BackgroundElements from '@/app/(landing)/components/BackgroundElements';

// 인증 훅
import { useAuth } from '@/app/hooks/useAuth';

// GitHub OAuth
import { redirectToGitHub } from '@/app/lib/github-oauth';

// Sign In 페이지 컴포넌트
export default function SignInPage() {
  const { isLoading, error } = useAuth();
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // GitHub 로그인 핸들러
  const handleGitHubLogin = () => {
    setIsGitHubLoading(true);
    redirectToGitHub();
  };

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 relative overflow-hidden'>
      {/* Background Elements - 랜딩 페이지와 동일한 배경 */}
      <BackgroundElements />

      {/* Content Layer */}
      <div className='relative z-10'>
        {/* Header with Logo */}
        <header className='py-8'>
          <div className='container mx-auto px-6'>
            <div className='flex items-center justify-center'>
              <div className='flex items-center space-x-2'>
                <div className='bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-xl'>
                  <Cpu className='w-6 h-6 text-white' />
                </div>
                <span className='text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'>
                  Otto
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className='flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16'>
          <div className='max-w-md w-full space-y-8'>
            <div className='text-center'>
              <h2 className='text-3xl font-extrabold text-gray-900'>Welcome to Otto</h2>
              <p className='mt-2 text-sm text-gray-600'>Sign in or create your account with GitHub</p>
            </div>

            <Card className='w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border border-gray-200 shadow-lg'>
              <div className='space-y-6'>
                {/* 인증 에러 메시지 */}
                {error && (
                  <div className='bg-red-50 border-l-4 border-red-400 p-4 rounded-md'>
                    <div className='flex'>
                      <div className='flex-shrink-0'>
                        <svg
                          className='h-5 w-5 text-red-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                          />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-sm font-medium text-red-800'>{error}</h3>
                      </div>
                    </div>
                  </div>
                )}

                {/* GitHub 로그인 버튼 */}
                <Button
                  onClick={handleGitHubLogin}
                  className='w-full bg-gray-900 hover:bg-gray-800 focus-visible:ring-gray-500 text-white shadow-sm'
                  isLoading={isGitHubLoading}
                  disabled={isGitHubLoading}
                >
                  <div className='flex items-center justify-center space-x-3'>
                    {!isGitHubLoading && (
                      <Github className='w-5 h-5' />
                    )}
                    <span className='font-medium'>
                      {isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}
                    </span>
                  </div>
                </Button>

                <div className='text-center text-sm text-gray-500'>
                  <p>One account for everything - powered by GitHub</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
