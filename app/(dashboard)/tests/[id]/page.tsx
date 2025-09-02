'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// UI 컴포넌트
import { Card, Button } from '@/app/components/ui';

// 테스트 스토어
import { getTestSummary, updateTestSummary, type TestSummary } from '@/app/lib/testStore';

export default function TestDetailPage() {
  const params = useParams();
  const testId = params.id as string;

  // 상태 관리
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 테스트 데이터 로드
  useEffect(() => {
    const loadTest = async () => {
      try {
        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500));

        const testData = getTestSummary(testId);
        if (testData) {
          setTestSummary(testData);
        }
      } catch (error) {
        console.error('Failed to load test:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  // 테스트 상태 업데이트 (테스트용)
  const handleStatusUpdate = async (newStatus: TestSummary['status']) => {
    if (!testSummary) return;

    setIsUpdating(true);
    try {
      // 상태 업데이트
      const updatedTest = updateTestSummary(testId, { status: newStatus });
      if (updatedTest) {
        setTestSummary(updatedTest);
      }

      // TODO: 백엔드 연동 시 실제 상태 업데이트
      // await fetch(`/api/tests/${testId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // });
    } catch (error) {
      console.error('Failed to update test status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 상태별 스타일링
  const statusStyles = {
    running: 'bg-blue-100 text-blue-800 animate-pulse',
    passed: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
  };

  // 테스트 성공률 계산
  const getSuccessRate = (summary: TestSummary) => {
    if (summary.totalTests === 0) return 0;
    return Math.round((summary.passedTests / summary.totalTests) * 100);
  };

  // 커버리지 색상
  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-emerald-600';
    if (coverage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 시간 포맷팅
  const formatDuration = (ms: number) => {
    if (ms === 0) return '-';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/3'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!testSummary) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>테스트를 찾을 수 없습니다</h2>
          <p className='text-gray-600 mb-4'>요청한 테스트 ID가 존재하지 않거나 삭제되었습니다.</p>
          <Link href='/tests'>
            <Button>테스트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* 헤더 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>테스트 상세 정보</h1>
          <p className='mt-1 text-sm text-gray-600'>
            테스트 #{testSummary.id}의 실행 결과와 메트릭을 확인하세요
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <Link href='/tests'>
            <Button variant='outline'>← 테스트 목록</Button>
          </Link>

          {/* 상태 변경 버튼 (테스트용) */}
          {testSummary.status === 'running' && (
            <Button
              onClick={() => handleStatusUpdate('passed')}
              disabled={isUpdating}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isUpdating ? '업데이트 중...' : '성공으로 완료'}
            </Button>
          )}
        </div>
      </div>

      {/* 테스트 요약 정보 */}
      <Card className='mb-6'>
        <div className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[testSummary.status]}`}
              >
                {testSummary.status === 'running' && '실행 중'}
                {testSummary.status === 'passed' && '성공'}
                {testSummary.status === 'failed' && '실패'}
                {testSummary.status === 'partial' && '부분 성공'}
              </span>
              <span className='text-sm text-gray-500'>#{testSummary.commit}</span>
            </div>

            <div className='text-right'>
              <p className='text-sm text-gray-500'>시작 시간</p>
              <p className='font-medium'>{formatTime(testSummary.startTime)}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>프로젝트</p>
              <p className='font-medium text-gray-900'>{testSummary.projectName}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>브랜치</p>
              <p className='font-medium text-gray-900'>{testSummary.branch}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>테스트 스위트</p>
              <p className='font-medium text-gray-900'>{testSummary.suites.join(', ')}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>실행 시간</p>
              <p className='font-medium text-gray-900'>
                {formatDuration(testSummary.totalDuration)}
              </p>
            </div>
          </div>

          <div className='flex items-center justify-between text-sm text-gray-500'>
            <span>커밋: #{testSummary.commit}</span>
            {testSummary.endTime && <span>완료 시간: {formatTime(testSummary.endTime)}</span>}
          </div>
        </div>
      </Card>

      {/* 테스트 메트릭 */}
      <Card className='mb-6'>
        <div className='p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>테스트 메트릭</h3>

          <div className='grid grid-cols-2 md:grid-cols-5 gap-6'>
            {/* 총 테스트 수 */}
            <div className='text-center'>
              <p className='text-2xl font-bold text-gray-900'>{testSummary.totalTests}</p>
              <p className='text-sm text-gray-500'>총 테스트</p>
            </div>

            {/* 성공한 테스트 */}
            <div className='text-center'>
              <p className='text-2xl font-bold text-emerald-600'>{testSummary.passedTests}</p>
              <p className='text-sm text-gray-500'>성공</p>
            </div>

            {/* 실패한 테스트 */}
            <div className='text-center'>
              <p className='text-2xl font-bold text-red-600'>{testSummary.failedTests}</p>
              <p className='text-sm text-gray-500'>실패</p>
            </div>

            {/* 건너뛴 테스트 */}
            <div className='text-center'>
              <p className='text-2xl font-bold text-yellow-600'>{testSummary.skippedTests}</p>
              <p className='text-sm text-gray-500'>건너뜀</p>
            </div>

            {/* 성공률 */}
            <div className='text-center'>
              <p
                className={`text-2xl font-bold ${getSuccessRate(testSummary) >= 90 ? 'text-emerald-600' : getSuccessRate(testSummary) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
              >
                {getSuccessRate(testSummary)}%
              </p>
              <p className='text-sm text-gray-500'>성공률</p>
            </div>
          </div>

          {/* 커버리지 */}
          <div className='mt-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>코드 커버리지</span>
              <span className={`text-sm font-medium ${getCoverageColor(testSummary.coverage)}`}>
                {testSummary.coverage}%
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className={`h-2 rounded-full ${getCoverageColor(testSummary.coverage).replace('text-', 'bg-')}`}
                style={{ width: `${testSummary.coverage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* 테스트 스위트 상세 정보 */}
      <Card>
        <div className='p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>테스트 스위트 상세</h3>

          <div className='space-y-3'>
            {testSummary.suites.map((suite, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div className='flex items-center space-x-2'>
                  <span className='text-lg'>🧪</span>
                  <span className='font-medium text-gray-900'>{suite}</span>
                </div>
                <span className='text-sm text-gray-500'>실행됨</span>
              </div>
            ))}
          </div>

          <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-700'>
              💡 테스트 스위트는 빌드 과정에서 자동으로 실행되며, 각 환경별로 다른 테스트를 실행할
              수 있습니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
