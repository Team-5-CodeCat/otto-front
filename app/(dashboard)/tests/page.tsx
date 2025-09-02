'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// UI 컴포넌트
import { Card, Button, Select } from '@/app/components/ui';

// 테스트 스토어
import {
  getTestSummaries,
  getTestResults,
  runTests,
  initializeTests,
  type TestSummary,
  type TestResult,
} from '@/app/lib/testStore';

// 프로젝트 스토어 (테스트 실행 시 프로젝트 정보 필요)
import { getProjects } from '@/app/lib/projectStore';

// 빌드 스토어 (최신 빌드 정보 참조)
import { getBuilds } from '@/app/lib/buildStore';

export default function TestsPage() {
  // 상태 관리
  const [testSummaries, setTestSummaries] = useState<TestSummary[]>([]);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>(''); // 프로젝트 필터
  const [isRunningTests, setIsRunningTests] = useState(false);

  // 테스트 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 초기 데이터 설정
        initializeTests();

        // 로딩 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 700));

        // 테스트 요약과 프로젝트 목록 가져오기
        const summaryData = getTestSummaries();
        const projectData = getProjects();

        setTestSummaries(summaryData);
        setProjects(projectData.map((p) => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('Failed to load test data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 프로젝트별 필터링된 테스트 요약
  const filteredSummaries = selectedProject
    ? testSummaries.filter((summary) => summary.projectId === selectedProject)
    : testSummaries;

  // 수동 테스트 실행 (실제로는 최신 빌드에 대해 실행)
  const handleRunTests = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    setIsRunningTests(true);
    try {
      const project = projects.find((p) => p.id === selectedProject);
      if (!project) return;

      // 해당 프로젝트의 최신 빌드 찾기
      const projectBuilds = getBuilds(selectedProject);
      const latestBuild = projectBuilds[0]; // 이미 최신순 정렬됨

      if (!latestBuild) {
        alert('No builds found for this project. Please trigger a build first.');
        return;
      }

      // 새 테스트 실행 시작
      const newTestSummary = runTests({
        buildId: latestBuild.id,
        projectId: selectedProject,
        projectName: project.name,
        branch: latestBuild.branch,
        commit: latestBuild.commit,
        suites: ['unit', 'integration'], // TODO: 실제로는 사용자가 선택
      });

      // 테스트 목록 새로고침
      setTestSummaries(getTestSummaries());

      // TODO: 백엔드 연동 시 실제 테스트 프로세스 시작
      // await fetch('/api/tests', { method: 'POST', body: JSON.stringify(newTestSummary) });
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 상태별 스타일링
  const statusStyles = {
    running: 'bg-blue-100 text-blue-800 animate-pulse',
    passed: 'bg-green-100 text-green-800',
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
    if (coverage >= 80) return 'text-green-600';
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

  // 상대 시간 포맷팅
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
      {/* 헤더 및 액션 */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Tests</h1>
          <p className='mt-1 text-sm text-gray-600'>
            View test results, coverage reports, and quality metrics
          </p>
        </div>

        {/* 테스트 실행 버튼 */}
        <Button
          onClick={handleRunTests}
          isLoading={isRunningTests}
          disabled={isRunningTests || !selectedProject}
        >
          {isRunningTests ? 'Running Tests...' : 'Run Tests'}
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
        <span className='text-sm text-gray-500'>
          {filteredSummaries.length} test run{filteredSummaries.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* 테스트 요약 목록 */}
      <div className='space-y-4'>
        {isLoading ? (
          // 로딩 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <div className='animate-pulse space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-5 bg-gray-200 rounded w-16'></div>
                    <div className='h-4 bg-gray-200 rounded w-24'></div>
                    <div className='h-4 bg-gray-200 rounded w-20'></div>
                  </div>
                  <div className='h-8 bg-gray-200 rounded w-20'></div>
                </div>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='grid grid-cols-4 gap-4'>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className='space-y-2'>
                      <div className='h-3 bg-gray-200 rounded w-16'></div>
                      <div className='h-6 bg-gray-200 rounded w-12'></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        ) : filteredSummaries.length === 0 ? (
          // 빈 상태
          <Card>
            <div className='text-center py-8'>
              <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🧪</span>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>No test results yet</h3>
              <p className='text-gray-600 mb-4'>
                {selectedProject
                  ? 'No tests have been run for the selected project.'
                  : 'Run your first test suite to see results here.'}
              </p>
              {selectedProject && (
                <Button onClick={handleRunTests} disabled={isRunningTests}>
                  Run First Test
                </Button>
              )}
            </div>
          </Card>
        ) : (
          // 테스트 요약 목록 표시
          filteredSummaries.map((summary) => (
            <Card key={summary.id}>
              <div className='space-y-4'>
                {/* 헤더 - 상태, 프로젝트, 시간 */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[summary.status]}`}
                    >
                      {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                    </span>
                    <Link
                      href={`/projects/${summary.projectId}`}
                      className='font-medium text-gray-900 hover:text-blue-600'
                    >
                      {summary.projectName}
                    </Link>
                    <span className='text-gray-400'>•</span>
                    <span className='text-sm text-gray-600'>branch: {summary.branch}</span>
                    <span className='text-gray-400'>•</span>
                    <span className='text-sm text-gray-500'>#{summary.commit}</span>
                  </div>

                  <div className='flex items-center space-x-3'>
                    <span className='text-sm text-gray-500'>
                      {formatRelativeTime(summary.startTime)}
                    </span>
                    <Link href={`/tests/${summary.id}`}>
                      <Button variant='outline' size='sm'>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 테스트 통계 그리드 */}
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                  {/* 총 테스트 수 */}
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>Total Tests</p>
                    <p className='text-lg font-semibold text-gray-900'>{summary.totalTests}</p>
                  </div>

                  {/* 성공률 */}
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>Success Rate</p>
                    <p
                      className={`text-lg font-semibold ${getSuccessRate(summary) >= 90 ? 'text-green-600' : getSuccessRate(summary) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}
                    >
                      {getSuccessRate(summary)}%
                    </p>
                  </div>

                  {/* 커버리지 */}
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>Coverage</p>
                    <p className={`text-lg font-semibold ${getCoverageColor(summary.coverage)}`}>
                      {summary.coverage}%
                    </p>
                  </div>

                  {/* 실행 시간 */}
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>Duration</p>
                    <p className='text-lg font-semibold text-gray-900'>
                      {formatDuration(summary.totalDuration)}
                    </p>
                  </div>

                  {/* 실패한 테스트 수 */}
                  <div>
                    <p className='text-xs text-gray-500 mb-1'>Failed</p>
                    <p
                      className={`text-lg font-semibold ${summary.failedTests > 0 ? 'text-red-600' : 'text-gray-900'}`}
                    >
                      {summary.failedTests}
                    </p>
                  </div>
                </div>

                {/* 테스트 스위트 정보 */}
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <span>Suites: {summary.suites.join(', ')}</span>
                  <span>•</span>
                  <span>
                    ✅ {summary.passedTests} passed, ❌ {summary.failedTests} failed, ⏭️{' '}
                    {summary.skippedTests} skipped
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
