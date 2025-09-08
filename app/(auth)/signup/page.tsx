'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// UI 컴포넌트들
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';
import Header from '@/app/(landing)/components/Header';
import Footer from '@/app/(landing)/components/Footer';
import BackgroundElements from '@/app/(landing)/components/BackgroundElements';

// 인증 훅
import { useAuth } from '@/app/hooks/useAuth';

// 유틸리티
import { validateEmail, validatePassword } from '@/app/utils/validation';

// Sign Up 페이지 컴포넌트
export default function SignUpPage() {
  const { signUp, isLoading, error } = useAuth();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 폼 에러 상태 관리
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // 비밀번호 표시/숨김 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 검증 (에러가 있을 때만)
    if (formErrors[field]) {
      validateField(field, value);
    }
  };

  // 개별 필드 검증
  const validateField = (field: keyof typeof formData, value: string) => {
    let error: string | undefined;

    switch (field) {
      case 'username':
        if (!value.trim()) {
          error = 'Please enter a username.';
        } else if (value.trim().length < 2) {
          error = 'Username must be at least 2 characters long.';
        }
        break;
      case 'email':
        error = validateEmail(value) || undefined;
        break;
      case 'password':
        error = validatePassword(value) || undefined;
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password.';
        } else if (value !== formData.password) {
          error = 'Passwords do not match.';
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 폼 전체 검증
  const validateForm = () => {
    const errors: typeof formErrors = {};

    // 각 필드 검증
    validateField('username', formData.username);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);

    // 에러 수집
    if (!formData.username.trim()) errors.username = 'Please enter a username.';
    if (!formData.email) errors.email = 'Please enter an email address.';
    if (!formData.password) errors.password = 'Please enter a password.';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password.';

    // 추가 검증
    if (formData.username.trim().length < 2)
      errors.username = 'Username must be at least 2 characters long.';
    if (validateEmail(formData.email)) errors.email = validateEmail(formData.email)!;
    if (validatePassword(formData.password)) errors.password = validatePassword(formData.password)!;
    if (formData.confirmPassword !== formData.password)
      errors.confirmPassword = 'Passwords do not match.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    if (!validateForm()) {
      return;
    }

    // SDK를 통한 실제 회원가입 처리
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (!result.success) {
        console.error('Sign up failed:', result.message);
      }
      // 성공 시 useAuth의 signUp에서 자동으로 로그인 페이지로 리다이렉트 처리
    } catch (error) {
      console.error('Sign up error:', error);
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
            <h2 className='mt-2 text-3xl font-extrabold text-gray-900'>Sign Up</h2>
            <p className='mt-2 text-sm text-gray-600'>Create a new account to continue</p>
          </div>

          <Card className='w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border border-gray-200'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* 사용자명 입력 필드 */}
              <Input
                id='username'
                type='text'
                label='Username'
                placeholder='username'
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={formErrors.username}
                leftIcon={
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                }
                required
              />

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
                helperText='Enter at least 8 characters'
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

              {/* 비밀번호 확인 입력 필드 */}
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                label='Confirm Password'
                placeholder='Enter your password again'
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={formErrors.confirmPassword}
                leftIcon={
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                }
                rightIcon={
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    {showConfirmPassword ? (
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

              {/* 인증 에러 메시지 */}
              {error && (
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
                      <p className='text-sm text-red-800'>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 회원가입 버튼 */}
              <Button
                type='submit'
                className='w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500'
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link
                  href='/signin'
                  className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
                >
                  Sign In
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
