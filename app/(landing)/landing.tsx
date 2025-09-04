'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundFlow from './components/BackgroundFlow';

export default function Landing() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/pipelines');
  };

  const handleLoginClick = () => {
    router.push('/signin');
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden'>
      {/* Background React Flow */}
      <BackgroundFlow />

      {/* Content Layer */}
      <div className='relative z-10'>
        {/* Header */}
        <header className='flex items-center justify-between p-6'>
          <div className='bg-gray-900 text-white px-4 py-2 rounded font-semibold'>Logo</div>
          <div className='flex items-center space-x-4'>
            <button
              onClick={handleLoginClick}
              className='text-gray-700 hover:text-gray-900 px-4 py-2 rounded font-medium transition-colors'
            >
              로그인
            </button>
            <button
              onClick={handleSignupClick}
              className='bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors'
            >
              회원가입
            </button>
            <div className='bg-gray-700 text-white px-6 py-2 rounded font-medium'>Docs</div>
          </div>
        </header>

        {/* Main Content */}
        <main className='flex flex-col items-center justify-center px-6 py-16'>
          {/* Title Section */}
          <div className='text-center mb-16 max-w-4xl'>
            <h1 className='text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              Build / Deploy
              <br />
              Agent Workflows
            </h1>
            <p className='text-xl text-gray-600 mb-12'>누구나 손쉽게. 빌드부터 배포까지.</p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button
                onClick={handleGetStarted}
                className='bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
              >
                바로 시작 →
              </button>
              <button
                onClick={handleLoginClick}
                className='bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
              >
                로그인
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
