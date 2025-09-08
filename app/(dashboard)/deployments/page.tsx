'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// UI 컴포넌트
import { Card, Button, Select } from '@/app/components/ui';

// 배포 스토어
import {
  getDeployments,
  getEnvironmentStatus,
  createDeployment,
  rollbackDeployment,
  initializeDeployments,
  type Deployment,
  type DeploymentEnvironment,
} from '@/app/lib/deploymentStore';

// 프로젝트 스토어
import { getProjects } from '@/app/lib/projectStore';

// 빌드 스토어 (배포 시 빌드 정보 필요)
import { getBuilds } from '@/app/lib/buildStore';

export default function DeploymentsPage() {
  // 상태 관리
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>(''); // 프로젝트 필터
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>(''); // 환경 필터
  const [isDeploying, setIsDeploying] = useState(false);

  // 배포 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 초기 데이터 설정
        initializeDeployments();

        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 배포 목록과 프로젝트 목록 가져오기
        const deploymentData = getDeployments();
        const projectData = getProjects();

        setDeployments(deploymentData);
        setProjects(projectData.map((p) => ({ id: p.id, name: p.name })));

        // 첫 번째 프로젝트의 환경 정보 로드
        if (projectData.length > 0 && projectData[0]) {
          const envData = getEnvironmentStatus(projectData[0].id);
          setEnvironments(envData);
        }
      } catch (error) {
        console.error('Failed to load deployment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 프로젝트 변경 시 환경 정보 업데이트
  useEffect(() => {
    if (selectedProject) {
      const envData = getEnvironmentStatus(selectedProject);
      setEnvironments(envData);
    }
  }, [selectedProject]);

  // 필터링된 배포 목록
  const filteredDeployments = deployments.filter((deployment) => {
    const projectMatch = !selectedProject || deployment.projectId === selectedProject;
    const envMatch = !selectedEnvironment || deployment.environment === selectedEnvironment;
    return projectMatch && envMatch;
  });

  // 수동 배포 실행
  const handleDeploy = async (environment: 'development' | 'staging' | 'production') => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    setIsDeploying(true);
    try {
      const project = projects.find((p) => p.id === selectedProject);
      if (!project) return;

      // 해당 프로젝트의 최신 성공한 빌드 찾기
      const projectBuilds = getBuilds(selectedProject);
      const latestSuccessBuild = projectBuilds.find((build) => build.status === 'success');

      if (!latestSuccessBuild) {
        alert('No successful builds found for this project. Please run a successful build first.');
        return;
      }

      // 새 배포 생성
      const _newDeployment = createDeployment({
        buildId: latestSuccessBuild.id,
        projectId: selectedProject,
        projectName: project.name,
        environment,
        version: `v1.${Date.now().toString().slice(-3)}.0`, // 임시 버전 생성
        branch: latestSuccessBuild.branch,
        commit: latestSuccessBuild.commit,
        commitMessage: latestSuccessBuild.commitMessage,
        deployType: 'manual',
      });

      // 배포 목록 새로고침
      setDeployments(getDeployments());
      setEnvironments(getEnvironmentStatus(selectedProject));

      // TODO: 백엔드 연동 시 실제 배포 프로세스 시작
      // await fetch('/api/deployments', { method: 'POST', body: JSON.stringify(newDeployment) });
    } catch (error) {
      console.error('Failed to deploy:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  // 롤백 실행
  const handleRollback = async (deploymentId: string) => {
    if (!confirm('Are you sure you want to rollback this deployment?')) {
      return;
    }

    try {
      const rollback = rollbackDeployment(deploymentId);
      if (rollback) {
        setDeployments(getDeployments());
        if (selectedProject) {
          setEnvironments(getEnvironmentStatus(selectedProject));
        }
      } else {
        alert('Failed to create rollback deployment');
      }
    } catch (error) {
      console.error('Failed to rollback:', error);
    }
  };

  // 상태별 스타일링
  const statusStyles = {
    pending: 'bg-gray-100 text-gray-800',
    deploying: 'bg-blue-100 text-blue-800 animate-pulse',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    rolled_back: 'bg-yellow-100 text-yellow-800',
  };

  // 환경별 색상
  const environmentColors = {
    development: 'bg-purple-100 text-purple-800',
    staging: 'bg-yellow-100 text-yellow-800',
    production: 'bg-green-100 text-green-800',
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

  return (
    <div className='p-6'>
      {/* 헤더 */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Deployments</h1>
        <p className='mt-1 text-sm text-gray-600'>
          Manage deployments across environments and monitor application health
        </p>
      </div>

      {/* 프로젝트 및 환경 필터 */}
      <div className='mb-6 flex items-center space-x-4'>
        <div className='w-64'>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            options={[
              { label: 'Select Project', value: '' },
              ...projects.map((p) => ({ label: p.name, value: p.id })),
            ]}
          />
        </div>
        <div className='w-48'>
          <Select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            options={[
              { label: 'All Environments', value: '' },
              { label: 'Development', value: 'development' },
              { label: 'Staging', value: 'staging' },
              { label: 'Production', value: 'production' },
            ]}
          />
        </div>
        <span className='text-sm text-gray-500'>
          {filteredDeployments.length} deployment{filteredDeployments.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* 환경별 현재 상태 */}
      {selectedProject && environments.length > 0 && (
        <div className='mb-8'>
          <h2 className='text-lg font-medium text-gray-900 mb-4'>Environment Status</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {environments.map((env) => (
              <Card key={env.name}>
                <div className='space-y-3'>
                  {/* 환경 헤더 */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={cn('px-2 py-1 text-xs font-medium rounded-full', environmentColors[env.type])}
                      >
                        {env.name}
                      </span>
                      {env.lastDeployment?.healthCheck && (
                        <span>{getHealthIcon(env.lastDeployment.healthCheck.status)}</span>
                      )}
                    </div>
                    <Button
                      size='sm'
                      onClick={() => handleDeploy(env.type)}
                      disabled={isDeploying || !selectedProject}
                    >
                      Deploy
                    </Button>
                  </div>

                  {/* 현재 배포 정보 */}
                  {env.lastDeployment ? (
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={cn('px-2 py-1 text-xs rounded', statusStyles[env.lastDeployment.status])}
                        >
                          {env.lastDeployment.status}
                        </span>
                        <span className='text-sm text-gray-600'>{env.lastDeployment.version}</span>
                      </div>
                      <p className='text-xs text-gray-500'>
                        #{env.lastDeployment.commit} •{' '}
                        {formatRelativeTime(env.lastDeployment.startTime)}
                      </p>
                      {env.url && (
                        <a
                          href={env.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-blue-600 hover:text-blue-500'
                        >
                          🔗 {env.url}
                        </a>
                      )}
                      {env.lastDeployment.status === 'success' && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleRollback(env.lastDeployment!.id)}
                          className='w-full text-xs'
                        >
                          Rollback
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500'>No deployments yet</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 배포 히스토리 */}
      <div className='space-y-4'>
        <h2 className='text-lg font-medium text-gray-900'>Deployment History</h2>

        {isLoading ? (
          // 로딩 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className='animate-pulse space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-5 bg-gray-200 rounded w-20'></div>
                    <div className='h-4 bg-gray-200 rounded w-24'></div>
                    <div className='h-4 bg-gray-200 rounded w-16'></div>
                  </div>
                  <div className='h-8 bg-gray-200 rounded w-20'></div>
                </div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='grid grid-cols-4 gap-4'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className='h-3 bg-gray-200 rounded w-16'></div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : filteredDeployments.length === 0 ? (
          // 빈 상태
          <Card>
            <div className='text-center py-8'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🚀</span>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>No deployments yet</h3>
              <p className='text-gray-600 mb-4'>
                {selectedProject
                  ? 'No deployments found for the selected filters.'
                  : 'Select a project to view and manage deployments.'}
              </p>
            </div>
          </Card>
        ) : (
          // 배포 목록 표시
          filteredDeployments.map((deployment) => (
            <Card key={deployment.id}>
              <div className='space-y-4'>
                {/* 배포 기본 정보 */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <span
                      className={cn('px-2 py-1 text-sm font-medium rounded-full', statusStyles[deployment.status])}
                    >
                      {deployment.status.replace('_', ' ')}
                    </span>
                    <span
                      className={cn('px-2 py-1 text-xs rounded', environmentColors[deployment.environment])}
                    >
                      {deployment.environment}
                    </span>
                    <Link
                      href={`/projects/${deployment.projectId}`}
                      className='font-medium text-gray-900 hover:text-blue-600'
                    >
                      {deployment.projectName}
                    </Link>
                    <span className='text-gray-400'>•</span>
                    <span className='text-sm text-gray-600'>{deployment.version}</span>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <span className='text-sm text-gray-500'>
                      {formatRelativeTime(deployment.startTime)}
                    </span>
                    <Link href={`/deployments/${deployment.id}`}>
                      <Button variant='outline' size='sm'>
                        View Logs
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 배포 세부 정보 */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-700 mb-1'>{deployment.commitMessage}</p>
                    <div className='flex items-center space-x-4 text-xs text-gray-500'>
                      <span>branch: {deployment.branch}</span>
                      <span>#{deployment.commit}</span>
                      <span>by {deployment.deployedBy}</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-1'>
                      <p className='text-xs text-gray-500'>
                        Duration: {formatDuration(deployment.duration)}
                      </p>
                      <p className='text-xs text-gray-500'>Type: {deployment.deployType}</p>
                      {deployment.url && (
                        <a
                          href={deployment.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-blue-600 hover:text-blue-500 block'
                        >
                          🔗 {deployment.url}
                        </a>
                      )}
                    </div>

                    {/* 헬스체크 정보 */}
                    {deployment.healthCheck && (
                      <div className='text-right'>
                        <div className='flex items-center space-x-1'>
                          <span>{getHealthIcon(deployment.healthCheck.status)}</span>
                          <span className='text-xs text-gray-600'>
                            {deployment.healthCheck.status}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          Uptime: {Math.floor(deployment.healthCheck.uptime / 60)}m
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
