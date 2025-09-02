'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <aside className='h-screen w-64 bg-white border-r border-gray-200 flex flex-col'>
      {/* 로고/브랜드 영역 */}
      <div className='h-16 px-4 flex items-center border-b border-gray-200 flex-shrink-0'>
        {/* Otto 로고 - 클릭 시 홈으로 이동 */}
        <Link href='/' className='flex items-center space-x-2 hover:opacity-80 transition-opacity'>
          <span className='text-lg font-semibold text-gray-900'>Otto</span>
        </Link>
      </div>

      {/* 메뉴 리스트 - 전체 높이 채우기 */}
      <nav className='p-3 space-y-1 flex-1'>
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
    </aside>
  );
};

export default Sidebar;
