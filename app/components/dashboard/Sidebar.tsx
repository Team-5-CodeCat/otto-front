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

// Sidebar Props 타입
interface SidebarProps {
  projects: Project[];
  pipelines: Pipeline[];
  selectedProject: Project | null;
  selectedPipeline: Pipeline | null;
  onProjectSelect: (project: Project) => void;
  onPipelineSelect: (pipeline: Pipeline) => void;
  onNewPipelineClick: () => void;
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
            const project = projects.find(p => p.id === value);
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
              const pipeline = pipelines.find(p => p.id === value);
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

    </aside>
  );
};

export default Sidebar;
