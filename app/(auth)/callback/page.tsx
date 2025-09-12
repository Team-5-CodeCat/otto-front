'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleGitHubCallback } from '@/app/lib/github-oauth';
import { useAuth } from '@/app/hooks/useAuth';

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { signInWithGitHub } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleGitHubCallback();
        
        if (result.success && result.user) {
          // TODO: signInWithGitHub 메서드가 useAuth에 구현되면 사용
          // await signInWithGitHub(result.user);
          
          setStatus('success');
          
          // 성공 시 대시보드로 리다이렉트
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError(result.error || 'Login failed');
          setStatus('error');
          
          // 에러 시 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/signin');
          }, 3000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('An unexpected error occurred');
        setStatus('error');
        
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      }
    };

    processCallback();
  }, [router, signInWithGitHub]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-900">Processing GitHub login...</h2>
            <p className="text-gray-600">Please wait while we verify your account.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <div className="rounded-full h-12 w-12 bg-green-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-900">Login successful!</h2>
            <p className="text-green-700">Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="rounded-full h-12 w-12 bg-red-100 mx-auto flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-900">Login failed</h2>
            <p className="text-red-700">{error}</p>
            <p className="text-gray-600">Redirecting to sign in page...</p>
          </div>
        )}
      </div>
    </div>
  );
}