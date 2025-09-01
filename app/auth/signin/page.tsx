'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// UI 컴포넌트들
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';

// 커스텀 훅과 유틸리티
import { useAuth } from '@/app/hooks/useAuth';
import { validateSignInForm } from '@/app/utils/validation';

// Sign In 페이지 컴포넌트
export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading, error: authError } = useAuth();

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
  useEffect(() => {
    // TODO: 이미 로그인된 사용자인지 확인하고 리다이렉트
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   router.push('/dashboard');
    // }
  }, [router]);

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

    // 로그인 시도
    const result = await signIn(formData);

    if (result.success) {
      // 로그인 성공 시 메인 페이지로 리다이렉트
      router.push('/');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* 로고 및 제목 */}
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Sign In</h2>
          <p className='mt-2 text-sm text-gray-600'>Sign in to your account to continue</p>
        </div>

        {/* 로그인 폼 카드 */}
        <Card className='w-full'>
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
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

            {/* 인증 에러 메시지 */}
            {authError && (
              <div className='bg-red-50 border border-red-200 rounded-md p-4'>
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
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-red-800'>{authError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button type='submit' className='w-full' isLoading={isLoading} disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* 회원가입 링크 */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Don’t have an account?{' '}
              <Link
                href='/auth/signup'
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* 테스트 계정 정보 (개발용) */}
          <div className='mt-4 p-4 bg-gray-50 rounded-md'>
            <p className='text-xs text-gray-500 text-center'>
              <strong>테스트 계정:</strong>
              <br />
              이메일: test@example.com
              <br />
              비밀번호: password
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
