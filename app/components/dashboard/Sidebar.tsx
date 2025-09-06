'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import NodeVersionSelector from '@/app/components/ui/NodeVersionSelector';
import { useNodeVersion } from '@/app/contexts/NodeVersionContext';
import { useUIStore } from '@/app/lib/uiStore';

// 사이드바 메뉴 항목 타입
interface SidebarItem {
  label: string; // UI 라벨 (영어)
  href: string; // 라우트 경로
  icon?: React.ReactNode; // 아이콘 (옵션)
}

// 사이드바 메뉴 정의 (우선순위 기반)
const items: SidebarItem[] = [
  {
    label: 'Projects',
    href: '/projects',
    icon: '📁', // 프로젝트 생성/목록
  },
  {
    label: 'Pipelines',
    href: '/pipelines',
    icon: '🔗', // Pipeline as Blocks (PaB)
  },
  {
    label: 'Builds',
    href: '/builds',
    icon: '🔨', // 빌드 기능
  },
  {
    label: 'Tests',
    href: '/tests',
    icon: '🧪', // 테스트 기능
  },
  {
    label: 'Deployments',
    href: '/deployments',
    icon: '🚀', // 배포 기능
  },
  {
    label: 'Environments',
    href: '/environments',
    icon: '🌍', // 환경 설정 (언어/배포)
  },
  {
    label: 'Settings',
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

// Sidebar 컴포넌트
const Sidebar: React.FC = () => {
  const pathname = usePathname(); // 현재 경로
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedVersion } = useNodeVersion();
  
  // Zustand 스토어에서 Pipeline Builder 표시 상태 가져오기
  const { showPipelineBuilder } = useUIStore();
  
  // 파이프라인 페이지인지 확인
  const isPipelinePage = pathname === '/pipelines' || pathname?.startsWith('/pipelines/');

  // 노드 템플릿 정의
  const nodeTemplates = [
    {
      type: 'build',
      label: 'Build',
      description: 'Build your application',
      defaultImage: `node:${selectedVersion}`,
      defaultCommands: 'npm ci\nnpm run build',
    },
    {
      type: 'test',
      label: 'Test',
      description: 'Run tests',
      defaultImage: `node:${selectedVersion}`,
      defaultCommands: 'npm test',
    },
    {
      type: 'deploy',
      label: 'Deploy',
      description: 'Deploy application',
      defaultImage: 'ubuntu:22.04',
      defaultCommands: 'deploy.sh',
    },
  ];

  // 드래그 시작 핸들러
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

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

      {/* 메뉴 리스트 */}
      <nav className='p-3 space-y-1 flex-shrink-0'>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} className={linkClasses(!!isActive)}>
              {/* 아이콘이 있으면 왼쪽에 배치 */}
              {item.icon ? <span className='mr-2'>{item.icon}</span> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Pipeline Builder - 파이프라인 페이지에서만 표시 */}
      {isPipelinePage && showPipelineBuilder && (
        <div className='flex-1 min-h-0 border-t border-gray-200 bg-white'>
          {/* 헤더 */}
          <div className='p-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>Pipeline Builder</h3>
            <p className='text-xs text-gray-500 mt-1'>Drag to canvas to add nodes</p>
          </div>

          {/* Node.js 버전 선택기 */}
          <div className='p-4 border-b border-gray-200'>
            <NodeVersionSelector />
          </div>

          {/* 노드 팔레트 */}
          <div className='flex-1 p-4 overflow-y-auto'>
            <div className='space-y-3'>
              {nodeTemplates.map((template) => (
                <div
                  key={template.type}
                  draggable
                  onDragStart={(event) => onDragStart(event, template.type)}
                  className='w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors group cursor-grab active:cursor-grabbing select-none'
                >
                  <div className='font-medium text-gray-900 group-hover:text-blue-600'>
                    {template.label}
                  </div>
                  <div className='text-sm text-gray-500 mt-1'>{template.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 사용자 정보 및 로그아웃 영역 */}
      <div className='p-3 border-t border-gray-200 flex-shrink-0'>
        {user && (
          <div className='space-y-2'>
            {/* 사용자 정보 */}
            <div className='px-3 py-2 bg-gray-50 rounded-md'>
              <div className='text-xs text-gray-500'>로그인됨</div>
              <div className='text-sm font-medium text-gray-900 truncate'>
                {user.name || user.email}
              </div>
            </div>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleSignOut}
              className='w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors'
            >
              <span className='mr-2'>🚪</span>
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
