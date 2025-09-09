'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore } from '@/app/lib/uiStore';
import { Project, Pipeline } from './types';
import DropdownSelect from './DropdownSelect';
import ActionIcons from './ActionIcons';
import PipelineBuilder from './PipelineBuilder';
import { actionIcons } from './constants';
import { checkOttoscalerHealth, healthStore } from '@/app/lib/healthStore';

// Job 인터페이스
interface Job {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: string;
}

// Sidebar Props 타입
interface SidebarProps {
  projects: Project[];
  pipelines: Pipeline[];
  selectedProject: Project | null;
  selectedPipeline: Pipeline | null;
  onProjectSelect: (project: Project) => void;
  onPipelineSelect: (pipeline: Pipeline) => void;
  onNewPipelineClick: () => void;
  showJobs?: boolean;
  jobs?: Job[];
  selectedJob?: string;
  onJobSelect?: (jobId: string) => void;
}

// Sidebar 컴포넌트
const Sidebar: React.FC<SidebarProps> = ({
  projects,
  pipelines,
  selectedProject,
  selectedPipeline,
  onProjectSelect,
  onPipelineSelect,
  onNewPipelineClick,
  showJobs = false,
  jobs = [],
  selectedJob,
  onJobSelect,
}) => {
  const pathname = usePathname(); // 현재 경로
  const router = useRouter();

  // Zustand 스토어에서 Pipeline Builder 표시 상태 가져오기
  const { showPipelineBuilder } = useUIStore();

  // 파이프라인 페이지인지 확인
  const isPipelinePage = pathname === '/pipelines' || pathname?.startsWith('/pipelines/');

  return (
    <aside className='h-screen w-64 bg-white border-r border-gray-200 flex flex-col'>
      {/* 로고/브랜드 영역 */}
      <div className='h-16 px-4 flex items-center border-b border-gray-200 flex-shrink-0'>
        {/* Otto 로고 - 클릭 시 홈으로 이동 */}
        <Link href='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
          <span className='text-lg font-semibold text-gray-900'>Otto</span>
        </Link>
      </div>

      {/* 프로젝트/파이프라인 선택 섹션 */}
      <div className='p-4 border-t border-gray-200 bg-white'>
        {/* 프로젝트 드롭다운 */}
        <DropdownSelect
          label='Project'
          value={selectedProject?.id || ''}
          onChange={(value) => {
            const project = projects.find((p) => p.id === value);
            if (project) onProjectSelect(project);
          }}
          options={projects}
          placeholder='Select a project'
        />

        {/* 파이프라인 드롭다운 */}
        <DropdownSelect
          label='Pipeline'
          value={selectedPipeline?.id || ''}
          onChange={(value) => {
            if (value) {
              const pipeline = pipelines.find((p) => p.id === value);
              if (pipeline) {
                onPipelineSelect(pipeline);
                router.push(`/pipelines/${pipeline.id}`);
              }
            }
          }}
          options={pipelines}
          placeholder='Select a pipeline'
          disabled={!selectedProject}
        />

        {/* 액션 아이콘들 */}
        <ActionIcons icons={actionIcons} />

        {/* Health Check 버튼 */}
        <button
          onClick={async () => {
            try {
              healthStore.startHealthCheck();
              const health = await checkOttoscalerHealth();
              healthStore.setHealthCheckResult(health);
              
              // 결과를 alert로 표시 (나중에 더 나은 UI로 개선 가능)
              if (health.connected) {
                alert(`✅ Ottoscaler is healthy!\n\nResponse time: ${health.responseTime}ms\nWorkers: ${health.workerStatus?.totalCount || 0} total`);
              } else {
                alert(`❌ Ottoscaler is unhealthy!\n\n${health.error || 'Connection failed'}`);
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              healthStore.setHealthCheckError(errorMessage);
              alert(`❌ Health check failed!\n\n${errorMessage}`);
            }
          }}
          className='w-full mt-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors font-medium border border-blue-200'
        >
          🩺 Check Ottoscaler Health
        </button>

        {/* 새 파이프라인 생성 버튼 */}
        <button
          onClick={onNewPipelineClick}
          className='w-full mt-3 px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors font-medium'
        >
          + New Pipeline
        </button>
      </div>


      {/* Pipeline Builder - 파이프라인 페이지에서만 표시 */}
      {isPipelinePage && showPipelineBuilder && (
        <PipelineBuilder
          className='flex-1 min-h-0 border-t border-gray-200'
          showHeader={false}
          showVersionSelector={true}
        />
      )}

      {/* Jobs 목록 - showJobs가 true일 때만 표시 */}
      {showJobs && jobs.length > 0 && (
        <div className='flex-1 min-h-0 border-t border-gray-200 p-4'>
          <h3 className='font-semibold text-gray-900 mb-4'>Jobs</h3>
          <div className='space-y-2'>
            {jobs.map(job => (
              <div 
                key={job.id}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedJob === job.id 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                    : 'text-gray-700'
                }`}
                onClick={() => onJobSelect && onJobSelect(job.id)}
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  job.status === 'completed' ? 'bg-green-500' : 
                  job.status === 'running' ? 'bg-blue-500' : 
                  job.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <div className='flex-1 min-w-0'>
                  <span className='text-sm font-medium block truncate'>{job.name}</span>
                  <span className='text-xs text-gray-500'>{job.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
