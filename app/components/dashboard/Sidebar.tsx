'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

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

// 사이드바 메뉴 항목 타입
interface SidebarItem {
  href: string; // 라우트 경로
  icon?: React.ReactNode; // 아이콘 (옵션)
}

// 사이드바 메뉴 정의 (우선순위 기반)
const items: SidebarItem[] = [
  {
    href: '/pipelines',
    icon: '🔗', // Pipeline as Blocks (PaB)
  },
  {
    href: '/builds',
    icon: '🔨', // 빌드 기능
  },
  {
    href: '/settings',
    icon: '⚙️', // 사용자/워크스페이스 설정
  },
];

// 링크 활성화 스타일 도우미 (그린 테마)
const linkClasses = (active: boolean) =>
  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    active
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
  }`;

// Sidebar Props
interface SidebarProps {
  projects: Project[];
  pipelines: Pipeline[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onNewProjectClick: () => void;
  onNewPipelineClick: () => void;
}

// Sidebar 컴포넌트
const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  pipelines, 
  selectedProject, 
  onProjectSelect, 
  onNewProjectClick, 
  onNewPipelineClick 
}) => {
  const pathname = usePathname(); // 현재 경로
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  // 드롭다운 상태 관리
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isPipelineDropdownOpen, setIsPipelineDropdownOpen] = useState(false);

  // 로그아웃 핸들러
  const handleSignOut = () => {
    signOut();
    router.push('/signin');
  };

  return (
    <aside className='h-screen w-64 bg-white border-r border-gray-200 flex flex-col'>
      {/* 로고/브랜드 영역 */}
      <div className='h-16 px-4 flex items-center border-b border-gray-200 flex-shrink-0'>
        {/* Otto 로고 - 클릭 시 홈으로 이동 */}
        <Link href='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
          <span className='text-lg font-semibold text-gray-900'>Otto</span>
        </Link>
      </div>

                   {/* 프로젝트 선택 드롭다운 */}
             <div className='px-4 py-2'>
               <div className='relative'>
                 <button
                   onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                   className='w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500'
                 >
                   <span>{selectedProject?.name || '프로젝트 선택'}</span>
                   <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                     <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                   </svg>
                 </button>

                 {isProjectDropdownOpen && (
                   <div className='absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg' style={{ zIndex: 1000 }}>
                     {projects.map((project) => (
                       <button
                         key={project.id}
                         onClick={() => {
                           onProjectSelect(project);
                           setIsProjectDropdownOpen(false);
                         }}
                         className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50'
                       >
                         {project.name}
                       </button>
                     ))}
                     <div className='border-t border-gray-200'>
                       <button
                         onClick={() => {
                           setIsProjectDropdownOpen(false);
                           onNewProjectClick();
                         }}
                         className='w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center'
                       >
                         <span className='mr-2'>+</span>
                         새 프로젝트 생성
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             {/* 파이프라인 선택 드롭다운 */}
             <div className='px-4 py-2'>
        <div className='relative'>
          <button
            onClick={() => setIsPipelineDropdownOpen(!isPipelineDropdownOpen)}
            disabled={!selectedProject}
            className='w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <span>{pipelines.length > 0 ? '파이프라인 선택' : '파이프라인 없음'}</span>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
            </svg>
          </button>
          
          {isPipelineDropdownOpen && selectedProject && (
            <div className='absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg' style={{ zIndex: 1000 }}>
              {pipelines.map((pipeline) => (
                <button
                  key={pipeline.id}
                  onClick={() => {
                    setIsPipelineDropdownOpen(false);
                    // TODO: 선택된 파이프라인 처리 (백엔드 연결 시)
                    console.log('선택된 파이프라인:', pipeline);
                  }}
                  className='w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50'
                >
                  {pipeline.name}
                </button>
              ))}
              <div className='border-t border-gray-200'>
                <button
                  onClick={() => {
                    setIsPipelineDropdownOpen(false);
                    onNewPipelineClick();
                  }}
                  className='w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 flex items-center'
                >
                  <span className='mr-2'>+</span>
                  새 파이프라인 생성
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메뉴 리스트 - 한 줄로 배치 */}
      <nav className='p-3 flex space-x-2'>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={`p-2 rounded-md transition-colors ${
              isActive
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}>
              {/* 아이콘만 표시 */}
              {item.icon ? <span className='text-xl'>{item.icon}</span> : null}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};

export default Sidebar;
