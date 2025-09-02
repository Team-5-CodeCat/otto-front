'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// UI 컴포넌트
import { Card, Button, Select } from '@/app/components/ui';

// 빌드 스토어
import { getBuilds, createBuild, initializeBuilds, type Build } from '@/app/lib/buildStore';

// 프로젝트 스토어 (빌드 트리거 시 프로젝트 정보 필요)
import { getProjects } from '@/app/lib/projectStore';

export default function BuildsPage() {
  // 상태 관리
  const [builds, setBuilds] = useState<Build[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>(''); // 프로젝트 필터
  const [isCreatingBuild, setIsCreatingBuild] = useState(false);

  // 빌드 목록 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 초기 데이터 설정
        initializeBuilds();

        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 600));

        // 빌드 목록과 프로젝트 목록 가져오기
        const buildData = getBuilds();
        const projectData = getProjects();

        setBuilds(buildData);
        setProjects(projectData.map((p) => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('Failed to load builds:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 프로젝트별 필터링된 빌드 목록
  const filteredBuilds = selectedProject
    ? builds.filter((build) => build.projectId === selectedProject)
    : builds;

  // 수동 빌드 트리거 (테스트용)
  const handleTriggerBuild = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    setIsCreatingBuild(true);
    try {
      const project = projects.find((p) => p.id === selectedProject);
      if (!project) return;

      // 새 빌드 생성
      const newBuild = createBuild({
        projectId: selectedProject,
        projectName: project.name,
        branch: 'main', // TODO: 실제로는 사용자가 선택
        triggerType: 'manual',
      });

      // 빌드 목록 새로고침
      setBuilds(getBuilds());

      // TODO: 백엔드 연동 시 실제 빌드 프로세스 시작
      // await fetch('/api/builds', { method: 'POST', body: JSON.stringify(newBuild) });
    } catch (error) {
      console.error('Failed to trigger build:', error);
    } finally {
      setIsCreatingBuild(false);
    }
  };

  // 상태별 배지 스타일
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800 animate-pulse',
    success: 'bg-green-100 text-green-800',
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

  // 시간 포맷팅 (상대 시간)
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // 빌드 소요 시간 포맷팅
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className='p-6'>
      {/* 헤더 및 필터 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>빌드</h1>
          <p className='mt-1 text-sm text-gray-600'>빌드 히스토리와 실시간 로그를 확인하세요</p>
        </div>

        {/* 빌드 트리거 버튼 */}
        <Button
          onClick={handleTriggerBuild}
          isLoading={isCreatingBuild}
          disabled={isCreatingBuild || !selectedProject}
          className='bg-emerald-600 hover:bg-emerald-700'
        >
          {isCreatingBuild ? '빌드 시작 중...' : '빌드 시작'}
        </Button>
      </div>

      {/* 프로젝트 필터 */}
      <div className='mb-6 flex items-center space-x-4'>
        <div className='w-64'>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            options={[
              { label: 'All Projects', value: '' },
              ...projects.map((p) => ({ label: p.name, value: p.id })),
            ]}
          />
        </div>
        <span className='text-sm text-gray-500'>{filteredBuilds.length}개의 빌드를 찾았습니다</span>
      </div>

      {/* 빌드 목록 */}
      <div className='space-y-4'>
        {isLoading ? (
          // 로딩 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className='animate-pulse space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='h-4 bg-gray-200 rounded w-24'></div>
                  <div className='h-4 bg-gray-200 rounded w-32'></div>
                  <div className='h-4 bg-gray-200 rounded w-16'></div>
                </div>
                <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
              </div>
            </Card>
          ))
        ) : filteredBuilds.length === 0 ? (
          // 빈 상태
          <Card>
            <div className='text-center py-8'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🔨</span>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>아직 빌드가 없습니다</h3>
              <p className='text-gray-600 mb-4'>
                {selectedProject
                  ? '선택한 프로젝트에 대한 빌드가 없습니다.'
                  : '첫 번째 빌드를 시작해보세요.'}
              </p>
              {selectedProject && (
                <Button
                  onClick={handleTriggerBuild}
                  disabled={isCreatingBuild}
                  className='bg-emerald-600 hover:bg-emerald-700'
                >
                  첫 번째 빌드 시작
                </Button>
              )}
            </div>
          </Card>
        ) : (
          // 빌드 목록 표시
          filteredBuilds.map((build) => (
            <Card key={build.id}>
              <div className='flex items-center justify-between'>
                <div className='flex-1 min-w-0'>
                  {/* 빌드 기본 정보 */}
                  <div className='flex items-center space-x-3 mb-2'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[build.status]}`}
                    >
                      {build.status.charAt(0).toUpperCase() + build.status.slice(1)}
                    </span>
                    <span className='text-xs text-gray-500'>
                      {getTriggerIcon(build.triggerType)} {build.triggerType}
                    </span>
                    <span className='text-xs text-gray-500'>#{build.commit}</span>
                    <span className='text-xs text-gray-500'>
                      {formatRelativeTime(build.startTime)}
                    </span>
                  </div>

                  {/* 프로젝트 및 브랜치 */}
                  <div className='flex items-center space-x-2 mb-1'>
                    <Link
                      href={`/projects/${build.projectId}`}
                      className='font-medium text-gray-900 hover:text-blue-600'
                    >
                      {build.projectName}
                    </Link>
                    <span className='text-gray-400'>•</span>
                    <span className='text-sm text-gray-600'>branch: {build.branch}</span>
                  </div>

                  {/* 커밋 메시지 */}
                  <p className='text-sm text-gray-700 mb-2'>{build.commitMessage}</p>

                  {/* 빌드 메타 정보 */}
                  <div className='flex items-center space-x-4 text-xs text-gray-500'>
                    <span>by {build.author}</span>
                    <span>Duration: {formatDuration(build.duration)}</span>
                    {build.logs.length > 0 && <span>{build.logs.length} log entries</span>}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className='flex items-center space-x-2'>
                  <Link href={`/builds/${build.id}`}>
                    <Button variant='outline' size='sm'>
                      View Logs
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
