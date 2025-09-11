'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';

// 인증 훅
import { useAuth } from '@/app/hooks/useAuth';

// 유틸리티
import { validateSignInForm } from '@/app/utils/validation';

// Sign In 페이지 컴포넌트
export default function SignInPage() {
  const { signIn, isLoading, error, errorInfo } = useAuth();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // 폼 에러 상태 관리
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState(false);

  // 컴포넌트 마운트 시 인증 상태 확인
  // 이미 로그인된 사용자는 자동으로 리다이렉트됨 (useAuth에서 처리)

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 검증 (에러가 있을 때만)
    if (formErrors[field]) {
      const errors = validateSignInForm(
        field === 'email' ? value : formData.email,
        field === 'password' ? value : formData.password
      );
      setFormErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    const errors = validateSignInForm(formData.email, formData.password);
    setFormErrors(errors);

    // 에러가 있으면 제출 중단
    if (Object.keys(errors).length > 0) {
      return;
    }

    // SDK를 통한 실제 로그인 처리
    try {
      const result = await signIn(formData);

      if (!result.success) {
        console.error('로그인 실패:', result.message);
      }
      // 성공 시 useAuth에서 자동으로 리다이렉트 처리
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900 relative overflow-hidden'>
      <BackgroundElements />
      <div className='relative z-10'>
        <Header />
      </div>
      <div className='relative z-10 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='mt-2 text-3xl font-extrabold text-gray-900'>Sign In</h2>
            <p className='mt-2 text-sm text-gray-600'>Sign in to your account to continue</p>
          </div>

          <Card className='w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border border-gray-200'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* 이메일 입력 필드 */}
              <Input
                id='email'
                type='email'
                label='Email'
                placeholder='your-email@example.com'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
                leftIcon={
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                    />
                  </svg>
                }
                required
              />

              {/* 비밀번호 입력 필드 */}
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                label='Password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={formErrors.password}
                leftIcon={
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                }
                rightIcon={
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    {showPassword ? (
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                        />
                      </svg>
                    ) : (
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    )}
                  </button>
                }
                required
              />

              {/* 인증 에러 메시지 - 개선된 UI */}
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
                      {errorInfo?.suggestion && (
                        <p className='mt-1 text-sm text-red-700'>{errorInfo.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button
                type='submit'
                className='w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Don’t have an account?{' '}
                <Link
                  href='/signup'
                  className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
      <div className='relative z-10'>
        <Footer />
      </div>
    </div>
  );
}
