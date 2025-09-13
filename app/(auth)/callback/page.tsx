'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleGitHubCallback } from '@/app/lib/github-oauth';
import { useAuth } from '@/app/hooks/useAuth';
import { Cpu, Github, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import BackgroundElements from '@/app/(landing)/components/BackgroundElements';

export default function CallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const { signInWithGitHub, determinePostLoginRoute } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const result = await handleGitHubCallback();

        if (result.success && result.tokens) {
          // GitHub 로그인 완료 - 사용자 정보 가져오고 상태 업데이트
          const signInResult = await signInWithGitHub(result.tokens);

          if (signInResult.success) {
            setStatus('success');
            
            // 성공 UI를 보여준 후 적절한 라우트로 리다이렉트
            setTimeout(async () => {
              const route = await determinePostLoginRoute();
              router.push(route);
            }, 2000);
          } else {
            setError(signInResult.message || '로그인에 실패했습니다');
            setStatus('error');

            // 에러 시 로그인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/signin');
            }, 3000);
          }
        } else {
          setError(result.error || '로그인에 실패했습니다');
          setStatus('error');

          // 에러 시 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/signin');
          }, 3000);
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        setError('예상치 못한 오류가 발생했습니다');
        setStatus('error');

        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      }
    };

    processCallback();
  }, [router, signInWithGitHub, determinePostLoginRoute]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 relative overflow-hidden'>
      {/* Background Elements */}
      <BackgroundElements />
      
      {/* Logo Header */}
      <div className='absolute top-8 left-8 z-20'>
        <div className='flex items-center space-x-2'>
          <div className='bg-gradient-to-r from-emerald-600 to-emerald-500 p-2 rounded-xl shadow-lg'>
            <Cpu className='w-6 h-6 text-white' />
          </div>
          <span className='text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent'>
            Otto
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 flex items-center justify-center min-h-screen px-4'>
        <div className='max-w-md w-full'>
          {/* Loading State */}
          {status === 'loading' && (
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-100/50'>
              <div className='flex flex-col items-center space-y-6'>
                {/* GitHub + Otto Animation */}
                <div className='relative'>
                  <div className='absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse'></div>
                  <div className='relative bg-white rounded-full p-4 shadow-lg'>
                    <Github className='w-8 h-8 text-gray-900 animate-pulse' />
                  </div>
                </div>
                
                {/* Loading Progress */}
                <div className='w-full space-y-3'>
                  <h2 className='text-xl font-semibold text-gray-900 text-center'>
                    GitHub 인증 중
                  </h2>
                  <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
                    <div className='bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full animate-progress'></div>
                  </div>
                  <p className='text-sm text-gray-600 text-center'>
                    인증 정보를 확인하고 워크스페이스를 설정하는 중...
                  </p>
                </div>

                {/* Status Steps */}
                <div className='w-full space-y-2 mt-4'>
                  <div className='flex items-center space-x-3 text-sm text-gray-600'>
                    <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                    <span>GitHub에 연결 중</span>
                  </div>
                  <div className='flex items-center space-x-3 text-sm text-gray-400'>
                    <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                    <span>권한 확인 중</span>
                  </div>
                  <div className='flex items-center space-x-3 text-sm text-gray-400'>
                    <div className='w-2 h-2 bg-gray-300 rounded-full'></div>
                    <span>세션 생성 중</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-emerald-100/50'>
              <div className='flex flex-col items-center space-y-6'>
                {/* Success Icon */}
                <div className='relative'>
                  <div className='absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl'></div>
                  <div className='relative bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full p-4 shadow-lg'>
                    <CheckCircle2 className='w-8 h-8 text-white' />
                  </div>
                </div>
                
                {/* Success Message */}
                <div className='w-full space-y-3 text-center'>
                  <h2 className='text-2xl font-bold text-gray-900'>Otto에 오신 것을 환영합니다!</h2>
                  <p className='text-gray-600'>
                    인증이 완료되었습니다. 워크스페이스를 준비하는 중...
                  </p>
                </div>

                {/* Redirect Indicator */}
                <div className='flex items-center space-x-2 text-sm text-emerald-600'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce' style={{animationDelay: '0ms'}}></div>
                    <div className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce' style={{animationDelay: '150ms'}}></div>
                    <div className='w-2 h-2 bg-emerald-600 rounded-full animate-bounce' style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span>프로젝트로 이동 중</span>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className='bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-red-100/50'>
              <div className='flex flex-col items-center space-y-6'>
                {/* Error Icon */}
                <div className='relative'>
                  <div className='absolute inset-0 bg-red-500/20 rounded-full blur-2xl'></div>
                  <div className='relative bg-gradient-to-r from-red-500 to-red-600 rounded-full p-4 shadow-lg'>
                    <XCircle className='w-8 h-8 text-white' />
                  </div>
                </div>
                
                {/* Error Message */}
                <div className='w-full space-y-3 text-center'>
                  <h2 className='text-2xl font-bold text-gray-900'>인증 실패</h2>
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <div className='flex items-start space-x-2'>
                      <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                      <p className='text-sm text-red-800 text-left'>{error || '인증 중 예상치 못한 오류가 발생했습니다.'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='w-full space-y-3'>
                  <button
                    onClick={() => router.push('/signin')}
                    className='w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg'
                  >
                    다시 시도
                  </button>
                  <p className='text-xs text-gray-500 text-center'>
                    몇 초 후 자동으로 이동됩니다...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
