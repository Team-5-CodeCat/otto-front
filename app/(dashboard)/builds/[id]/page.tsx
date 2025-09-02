'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// UI 컴포넌트
import { Card, Button } from '@/app/components/ui';

// 빌드 스토어
import { getBuild, updateBuildStatus, type Build } from '@/app/lib/buildStore';

export default function BuildDetailPage() {
  const params = useParams();
  const buildId = params.id as string;

  // 상태 관리
  const [build, setBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 빌드 데이터 로드
  useEffect(() => {
    const loadBuild = async () => {
      try {
        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500));

        const buildData = getBuild(buildId);
        if (buildData) {
          setBuild(buildData);
        }
      } catch (error) {
        console.error('Failed to load build:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBuild();
  }, [buildId]);

  // 빌드 상태 업데이트 (테스트용)
  const handleStatusUpdate = async (newStatus: Build['status']) => {
    if (!build) return;

    setIsUpdating(true);
    try {
      // 상태 업데이트
      const updatedBuild = updateBuildStatus(buildId, newStatus);
      if (updatedBuild) {
        setBuild(updatedBuild);
      }

      // TODO: 백엔드 연동 시 실제 상태 업데이트
      // await fetch(`/api/builds/${buildId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // });
    } catch (error) {
      console.error('Failed to update build status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 상태별 스타일링
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800 animate-pulse',
    success: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
  };

  // 트리거 타입별 아이콘
  const getTriggerIcon = (type: Build['triggerType']) => {
    switch (type) {
      case 'push':
        return '🔄';
      case 'pull_request':
        return '🔀';
      case 'manual':
        return '👤';
      default:
        return '❓';
    }
  };

  // 시간 포맷팅
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  if (!build) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>빌드를 찾을 수 없습니다</h2>
          <p className='text-gray-600 mb-4'>요청한 빌드 ID가 존재하지 않거나 삭제되었습니다.</p>
          <Link href='/builds'>
            <Button>빌드 목록으로 돌아가기</Button>
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
          <h1 className='text-2xl font-bold text-gray-900'>빌드 상세 정보</h1>
          <p className='mt-1 text-sm text-gray-600'>
            빌드 #{build.id}의 실행 상태와 로그를 확인하세요
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <Link href='/builds'>
            <Button variant='outline'>← 빌드 목록</Button>
          </Link>

          {/* 상태 변경 버튼 (테스트용) */}
          {build.status === 'pending' && (
            <Button
              onClick={() => handleStatusUpdate('running')}
              disabled={isUpdating}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isUpdating ? '업데이트 중...' : '빌드 시작'}
            </Button>
          )}

          {build.status === 'running' && (
            <Button
              onClick={() => handleStatusUpdate('success')}
              disabled={isUpdating}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isUpdating ? '업데이트 중...' : '성공으로 완료'}
            </Button>
          )}
        </div>
      </div>

      {/* 빌드 기본 정보 */}
      <Card className='mb-6'>
        <div className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[build.status]}`}
              >
                {build.status === 'pending' && '대기 중'}
                {build.status === 'running' && '실행 중'}
                {build.status === 'success' && '성공'}
                {build.status === 'failed' && '실패'}
              </span>
              <span className='text-sm text-gray-500'>
                {getTriggerIcon(build.triggerType)} {build.triggerType}
              </span>
            </div>

            <div className='text-right'>
              <p className='text-sm text-gray-500'>시작 시간</p>
              <p className='font-medium'>{formatTime(build.startTime)}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>프로젝트</p>
              <p className='font-medium text-gray-900'>{build.projectName}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>브랜치</p>
              <p className='font-medium text-gray-900'>{build.branch}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>커밋</p>
              <p className='font-medium text-gray-900'>#{build.commit}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>실행 시간</p>
              <p className='font-medium text-gray-900'>{formatDuration(build.duration)}</p>
            </div>
          </div>

          <div>
            <p className='text-sm text-gray-500 mb-1'>커밋 메시지</p>
            <p className='text-gray-900'>{build.commitMessage}</p>
          </div>

          <div className='flex items-center justify-between text-sm text-gray-500'>
            <span>작성자: {build.author}</span>
            {build.endTime && <span>완료 시간: {formatTime(build.endTime)}</span>}
          </div>
        </div>
      </Card>

      {/* 빌드 로그 */}
      <Card>
        <div className='p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>빌드 로그</h3>

          {build.logs.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>아직 로그가 없습니다</p>
          ) : (
            <div className='bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto'>
              {build.logs.map((log, index) => (
                <div key={index} className='mb-1'>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
