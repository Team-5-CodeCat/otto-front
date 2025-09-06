'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { NodeVersionProvider } from '../../contexts/NodeVersionContext';
import Sidebar from './Sidebar';

// 프로젝트 데이터 타입
interface Project {
  id: string;
  name: string;
}

// 파이프라인 데이터 타입
interface Pipeline {
  id: string;
  name: string;
  projectId: string;
}

// 임시 프로젝트 데이터 (전역 상태로 관리)
let mockProjects: Project[] = [
  { id: '1', name: 'Frontend Project' },
  { id: '2', name: 'Backend API' },
  { id: '3', name: 'Mobile App' },
];

// 임시 파이프라인 데이터 (전역 상태로 관리)
let mockPipelines: Pipeline[] = [
  { id: '1', name: 'Pipeline #1', projectId: '1' },
  { id: '2', name: 'Pipeline #2', projectId: '1' },
  { id: '3', name: 'Pipeline #3', projectId: '2' },
  { id: '4', name: 'Pipeline #4', projectId: '2' },
  { id: '5', name: 'Pipeline #5', projectId: '3' },
];

// 대시보드 레이아웃 Props
interface DashboardLayoutProps {
  children: React.ReactNode; // 메인 콘텐츠
}

// 대시보드 레이아웃 (좌: Sidebar, 우: Content)
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isLoading } = useAuth();
  
  // 새 프로젝트 생성 모달 상태
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  
  // 새 파이프라인 생성 모달 상태
  const [isNewPipelineModalOpen, setIsNewPipelineModalOpen] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);

  // 새 프로젝트 생성 핸들러
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      // TODO: 백엔드와 연결하여 실제 프로젝트 생성
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: newProjectName.trim()
      };
      
      // mockProjects와 상태 모두 업데이트
      mockProjects.push(newProject);
      setProjects([...mockProjects]);
      setSelectedProject(newProject); // 새 프로젝트를 선택된 프로젝트로 설정
      setNewProjectName('');
      setIsNewProjectModalOpen(false);
      console.log('새 프로젝트 생성:', newProject);
    }
  };

  // 새 파이프라인 생성 핸들러
  const handleCreatePipeline = () => {
    if (newPipelineName.trim() && selectedProject) {
      // TODO: 백엔드와 연결하여 실제 파이프라인 생성
      const newPipeline: Pipeline = {
        id: `pipeline-${Date.now()}`,
        name: newPipelineName.trim(),
        projectId: selectedProject.id
      };
      
      // mockPipelines와 상태 모두 업데이트
      mockPipelines.push(newPipeline);
      setPipelines([...mockPipelines]);
      setNewPipelineName('');
      setIsNewPipelineModalOpen(false);
      console.log('새 파이프라인 생성:', newPipeline);
    }
  };

  // 선택된 프로젝트의 파이프라인들 필터링
  const filteredPipelines = selectedProject 
    ? pipelines.filter(pipeline => pipeline.projectId === selectedProject.id)
    : [];

  // 인증 상태 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto'></div>
          <p className='mt-2 text-sm text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NodeVersionProvider>
      <div className='min-h-screen bg-gray-50 flex'>
        {/* 고정 사이드바 */}
        <Sidebar 
          projects={projects}
          pipelines={filteredPipelines}
          selectedProject={selectedProject}
          onProjectSelect={setSelectedProject}
          onNewProjectClick={() => setIsNewProjectModalOpen(true)}
          onNewPipelineClick={() => setIsNewPipelineModalOpen(true)}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className='flex-1'>
          {/* 상단 바(옵션): 필요시 추가 */}
          <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>{children}</main>
        </div>
      </div>

      {/* 새 프로젝트 생성 모달 */}
      {isNewProjectModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' style={{ zIndex: 9999 }}>
          <div className='bg-white rounded-lg p-6 w-96'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>새 프로젝트 생성</h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                프로젝트 이름
              </label>
              <input
                type='text'
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500'
                placeholder='프로젝트 이름을 입력하세요'
                autoFocus
              />
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => {
                  setIsNewProjectModalOpen(false);
                  setNewProjectName('');
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                취소
              </button>
              <button
                onClick={handleCreateProject}
                className='px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700'
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 파이프라인 생성 모달 */}
      {isNewPipelineModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center' style={{ zIndex: 9999 }}>
          <div className='bg-white rounded-lg p-6 w-96'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>새 파이프라인 생성</h3>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                파이프라인 이름
              </label>
              <input
                type='text'
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500'
                placeholder='파이프라인 이름을 입력하세요'
                autoFocus
              />
            </div>
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                프로젝트
              </label>
              <div className='px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700'>
                {selectedProject?.name || '프로젝트를 선택해주세요'}
              </div>
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => {
                  setIsNewPipelineModalOpen(false);
                  setNewPipelineName('');
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                취소
              </button>
              <button
                onClick={handleCreatePipeline}
                disabled={!selectedProject}
                className='px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeVersionProvider>
  );
};

export default DashboardLayout;
