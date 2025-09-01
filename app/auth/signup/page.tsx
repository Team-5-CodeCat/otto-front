'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// UI 컴포넌트들
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';

// 유틸리티
import { validateEmail, validatePassword } from '@/app/utils/validation';

// Sign Up 페이지 컴포넌트
export default function SignUpPage() {
  const router = useRouter();

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 폼 에러 상태 관리
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

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
      case 'name':
        if (!value.trim()) {
          error = '이름을 입력해주세요.';
        } else if (value.trim().length < 2) {
          error = '이름은 최소 2자 이상이어야 합니다.';
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
          error = '비밀번호 확인을 입력해주세요.';
        } else if (value !== formData.password) {
          error = '비밀번호가 일치하지 않습니다.';
        }
        break;
    }

    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 폼 전체 검증
  const validateForm = () => {
    const errors: typeof formErrors = {};

    // 각 필드 검증
    validateField('name', formData.name);
    validateField('email', formData.email);
    validateField('password', formData.password);
    validateField('confirmPassword', formData.confirmPassword);

    // 에러 수집
    if (!formData.name.trim()) errors.name = '이름을 입력해주세요.';
    if (!formData.email) errors.email = '이메일을 입력해주세요.';
    if (!formData.password) errors.password = '비밀번호를 입력해주세요.';
    if (!formData.confirmPassword) errors.confirmPassword = '비밀번호 확인을 입력해주세요.';

    // 추가 검증
    if (formData.name.trim().length < 2) errors.name = '이름은 최소 2자 이상이어야 합니다.';
    if (validateEmail(formData.email)) errors.email = validateEmail(formData.email)!;
    if (validatePassword(formData.password)) errors.password = validatePassword(formData.password)!;
    if (formData.confirmPassword !== formData.password)
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';

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

    setIsLoading(true);

    try {
      // TODO: 실제 백엔드 API 호출로 교체
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // });
      // const data = await response.json();

      // 임시 회원가입 로직 (백엔드 연동 전 테스트용)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

      // 성공 시 로그인 페이지로 리다이렉트
      router.push('/auth/signin?message=회원가입이 완료되었습니다. 로그인해주세요.');
    } catch (error) {
      console.error('회원가입 오류:', error);
      // 에러 처리
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        {/* 로고 및 제목 */}
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Sign Up</h2>
          <p className='mt-2 text-sm text-gray-600'>Create a new account to continue</p>
        </div>

        {/* 회원가입 폼 카드 */}
        <Card className='w-full'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 이름 입력 필드 */}
            <Input
              id='name'
              type='text'
              label='Name'
              placeholder='Boa Kim'
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={formErrors.name}
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
              helperText='Enter at least 6 characters'
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

            {/* 회원가입 버튼 */}
            <Button type='submit' className='w-full' isLoading={isLoading} disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          {/* 로그인 링크 */}
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                href='/auth/signin'
                className='font-medium text-blue-600 hover:text-blue-500 transition-colors'
              >
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
