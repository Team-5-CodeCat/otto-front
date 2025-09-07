'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// UI 컴포넌트
import { Card, Button } from '@/app/components/ui';

// 배포 스토어
import {
  getDeployment,
  updateDeploymentStatus,
  rollbackDeployment,
  type Deployment,
} from '@/app/lib/deploymentStore';

export default function DeploymentDetailPage() {
  const params = useParams();
  const deploymentId = params.id as string;

  // 상태 관리
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // 배포 데이터 로드
  useEffect(() => {
    const loadDeployment = async () => {
      try {
        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 500));

        const deploymentData = getDeployment(deploymentId);
        if (deploymentData) {
          setDeployment(deploymentData);
        }
      } catch (error) {
        console.error('Failed to load deployment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeployment();
  }, [deploymentId]);

  // 배포 상태 업데이트 (테스트용)
  const handleStatusUpdate = async (newStatus: Deployment['status']) => {
    if (!deployment) return;

    setIsUpdating(true);
    try {
      // 상태 업데이트
      const updatedDeployment = updateDeploymentStatus(deploymentId, newStatus);
      if (updatedDeployment) {
        setDeployment(updatedDeployment);
      }

      // TODO: 백엔드 연동 시 실제 상태 업데이트
      // await fetch(`/api/deployments/${deploymentId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // });
    } catch (error) {
      console.error('Failed to update deployment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 롤백 실행
  const handleRollback = async () => {
    if (!deployment) return;

    if (!confirm('이 배포를 롤백하시겠습니까?')) {
      return;
    }

    setIsUpdating(true);
    try {
      const rollback = rollbackDeployment(deploymentId);
      if (rollback) {
        // 롤백 배포 생성 후 현재 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to rollback deployment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 상태별 스타일링
  const statusStyles = {
    pending: 'bg-gray-100 text-gray-800',
    deploying: 'bg-blue-100 text-blue-800 animate-pulse',
    success: 'bg-emerald-100 text-emerald-800',
    failed: 'bg-red-100 text-red-800',
    rolled_back: 'bg-yellow-100 text-yellow-800',
  };

  // 환경별 색상
  const environmentColors = {
    development: 'bg-purple-100 text-purple-800',
    staging: 'bg-yellow-100 text-yellow-800',
    production: 'bg-emerald-100 text-emerald-800',
  };

  // 헬스체크 상태 아이콘
  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'unhealthy':
        return '🔴';
      case 'checking':
        return '🟡';
      default:
        return '⚪';
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

  if (!deployment) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>배포를 찾을 수 없습니다</h2>
          <p className='text-gray-600 mb-4'>요청한 배포 ID가 존재하지 않거나 삭제되었습니다.</p>
          <Link href='/deployments'>
            <Button>배포 목록으로 돌아가기</Button>
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
          <h1 className='text-2xl font-bold text-gray-900'>배포 상세 정보</h1>
          <p className='mt-1 text-sm text-gray-600'>
            배포 #{deployment.id}의 실행 상태와 로그를 확인하세요
          </p>
        </div>

        <div className='flex items-center space-x-3'>
          <Link href='/deployments'>
            <Button variant='outline'>← 배포 목록</Button>
          </Link>

          {/* 상태 변경 버튼 (테스트용) */}
          {deployment.status === 'pending' && (
            <Button
              onClick={() => handleStatusUpdate('deploying')}
              disabled={isUpdating}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isUpdating ? '업데이트 중...' : '배포 시작'}
            </Button>
          )}

          {deployment.status === 'deploying' && (
            <Button
              onClick={() => handleStatusUpdate('success')}
              disabled={isUpdating}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {isUpdating ? '업데이트 중...' : '성공으로 완료'}
            </Button>
          )}

          {/* 롤백 버튼 */}
          {deployment.status === 'success' && (
            <Button
              onClick={handleRollback}
              disabled={isUpdating}
              variant='outline'
              className='border-orange-300 text-orange-700 hover:bg-orange-50'
            >
              {isUpdating ? '롤백 중...' : '롤백'}
            </Button>
          )}
        </div>
      </div>

      {/* 배포 기본 정보 */}
      <Card className='mb-6'>
        <div className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <span
                className={cn('px-3 py-1 text-sm font-medium rounded-full', statusStyles[deployment.status])}
              >
                {deployment.status === 'pending' && '대기 중'}
                {deployment.status === 'deploying' && '배포 중'}
                {deployment.status === 'success' && '성공'}
                {deployment.status === 'failed' && '실패'}
                {deployment.status === 'rolled_back' && '롤백됨'}
              </span>
              <span
                className={cn('px-2 py-1 text-xs rounded', environmentColors[deployment.environment])}
              >
                {deployment.environment === 'development' && '개발'}
                {deployment.environment === 'staging' && '스테이징'}
                {deployment.environment === 'production' && '프로덕션'}
              </span>
              <span className='text-sm text-gray-500'>{deployment.version}</span>
            </div>

            <div className='text-right'>
              <p className='text-sm text-gray-500'>시작 시간</p>
              <p className='font-medium'>{formatTime(deployment.startTime)}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500 mb-1'>프로젝트</p>
              <p className='font-medium text-gray-900'>{deployment.projectName}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>브랜치</p>
              <p className='font-medium text-gray-900'>{deployment.branch}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>커밋</p>
              <p className='font-medium text-gray-900'>#{deployment.commit}</p>
            </div>

            <div>
              <p className='text-sm text-gray-500 mb-1'>실행 시간</p>
              <p className='font-medium text-gray-900'>{formatDuration(deployment.duration)}</p>
            </div>
          </div>

          <div>
            <p className='text-sm text-gray-500 mb-1'>커밋 메시지</p>
            <p className='text-gray-900'>{deployment.commitMessage}</p>
          </div>

          <div className='flex items-center justify-between text-sm text-gray-500'>
            <span>배포 방식: {deployment.deployType}</span>
            <span>실행자: {deployment.deployedBy}</span>
          </div>

          {deployment.url && (
            <div className='pt-2 border-t border-gray-200'>
              <p className='text-sm text-gray-500 mb-1'>배포 URL</p>
              <a
                href={deployment.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-emerald-600 hover:text-emerald-700 font-medium'
              >
                🔗 {deployment.url}
              </a>
            </div>
          )}
        </div>
      </Card>

      {/* 헬스체크 정보 */}
      {deployment.healthCheck && (
        <Card className='mb-6'>
          <div className='p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>헬스체크 상태</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl mb-2'>{getHealthIcon(deployment.healthCheck.status)}</div>
                <p className='text-sm text-gray-500'>상태</p>
                <p className='font-medium text-gray-900'>
                  {deployment.healthCheck.status === 'healthy' && '정상'}
                  {deployment.healthCheck.status === 'unhealthy' && '비정상'}
                  {deployment.healthCheck.status === 'checking' && '확인 중'}
                </p>
              </div>

              <div className='text-center'>
                <p className='text-2xl font-bold text-gray-900'>
                  {Math.floor(deployment.healthCheck.uptime / 60)}
                </p>
                <p className='text-sm text-gray-500'>가동 시간 (분)</p>
              </div>

              <div className='text-center'>
                <p className='text-sm text-gray-500'>마지막 확인</p>
                <p className='font-medium text-gray-900'>
                  {formatTime(deployment.healthCheck.lastChecked)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 배포 로그 */}
      <Card>
        <div className='p-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>배포 로그</h3>

          {deployment.logs.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>아직 로그가 없습니다</p>
          ) : (
            <div className='bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto'>
              {deployment.logs.map((log, index) => (
                <div key={index} className='mb-1'>
                  {log}
                </div>
              ))}
            </div>
          )}

          <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
            <p className='text-sm text-blue-700'>
              💡 배포 로그는 실시간으로 업데이트되며, 각 단계별 진행 상황을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
