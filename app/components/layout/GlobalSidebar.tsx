'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Settings,
  HelpCircle,
  ChevronDown,
  Copy,
  BookOpen,
  FileText,
  Home,
} from 'lucide-react';

/**
 * 블록 팔레트 아이템의 인터페이스
 */
interface Block {
  /** 블록의 표시 이름 */
  name: string;
  /** 블록의 이모지 아이콘 */
  icon: string;
  /** Tailwind CSS 배경색 클래스 */
  color: string;
}

/**
 * 폴더 섹션 아이템의 인터페이스
 */
interface Folder {
  /** 폴더의 표시 이름 */
  name: string;
  /** 폴더의 이모지 아이콘 */
  icon: string;
  /** 현재 폴더가 활성/선택 상태인지 여부 */
  isActive?: boolean;
}

/**
 * 하단 네비게이션 아이콘의 인터페이스
 */
interface BottomIcon {
  /** Lucide React 아이콘 컴포넌트 */
  icon: React.ComponentType<{ className?: string }>;
  /** 아이콘의 툴팁 제목 */
  title: string;
}

/**
 * GlobalSidebar 컴포넌트
 *
 * 워크스페이스 네비게이션과 블록 팔레트 기능을 제공하는 플로팅 사이드바 컴포넌트입니다.
 * 주요 기능:
 * - 검색 기능이 있는 워크스페이스 헤더
 * - 폴더 관리 섹션
 * - 워크플로 생성을 위한 드래그 가능한 블록 팔레트
 * - 하단 네비게이션 아이콘
 *
 * 사이드바는 화면 왼쪽에 고정된 오버레이로 위치하며,
 * 더 나은 시각적 계층구조를 위해 분리된 카드 섹션들로 구성됩니다.
 *
 * @returns 플로팅 사이드바를 나타내는 JSX 엘리먼트
 */
const GlobalSidebar = () => {
  /** 글로벌 워크스페이스 검색용 쿼리 */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /** 팔레트에서 블록 필터링을 위한 검색 쿼리 */
  const [searchBlocks, setSearchBlocks] = useState<string>('');

  /** 현재 선택된 폴더 이름 */
  const [selectedFolder, setSelectedFolder] = useState<string>('dfsdfdsf');

  /**
   * 팔레트에서 사용 가능한 블록들의 설정
   * 각 블록은 드래그하여 워크플로 노드를 생성할 수 있습니다
   */
  const blocks: Block[] = [
    { name: 'Agent', icon: '🤖', color: 'bg-purple-500' },
    { name: 'API', icon: '🔗', color: 'bg-blue-500' },
    { name: 'Condition', icon: '🔶', color: 'bg-orange-500' },
    { name: 'Function', icon: '</>', color: 'bg-red-500' },
    { name: 'Knowledge', icon: '🧠', color: 'bg-teal-500' },
  ];

  /**
   * 워크스페이스 폴더들의 설정
   * 폴더는 다양한 프로젝트나 워크플로를 조직화하는데 도움을 줍니다
   */
  const folders: Folder[] = [
    { name: 'Folder 1', icon: '📁' },
    { name: 'dfsdfdsf', icon: '🔵', isActive: true },
  ];

  /**
   * 하단 네비게이션 아이콘들의 설정
   * 일반적인 워크스페이스 기능에 빠르게 접근할 수 있게 해줍니다
   */
  const bottomIcons: BottomIcon[] = [
    { icon: Settings, title: 'Settings' },
    { icon: HelpCircle, title: 'Help' },
    { icon: FileText, title: 'Documentation' },
    { icon: BookOpen, title: 'Resources' },
    { icon: Home, title: 'Home' },
  ];

  /**
   * 블록의 드래그 시작 이벤트를 처리합니다
   * 캔버스에 블록을 드롭할 수 있도록 드래그 데이터를 설정합니다
   *
   * @param e - 드래그 이벤트
   * @param blockType - 드래그되는 블록의 타입 (소문자 블록 이름)
   */
  const handleBlockDragStart = (e: React.DragEvent<HTMLDivElement>, blockType: string) => {
    e.dataTransfer.setData('application/reactflow', blockType.toLowerCase());
  };

  /**
   * 폴더 선택을 처리합니다
   * 현재 선택된 폴더 상태를 업데이트합니다
   *
   * @param folderName - 선택할 폴더의 이름
   */
  const handleFolderSelect = (folderName: string) => {
    setSelectedFolder(folderName);
  };

  /**
   * 검색 쿼리를 기반으로 블록들을 필터링합니다
   * 검색어와 일치하는 블록들을 반환합니다 (대소문자 구분 안함)
   *
   * @returns 검색 쿼리와 일치하는 필터링된 블록 배열
   */
  const getFilteredBlocks = (): Block[] => {
    return blocks.filter((block) => block.name.toLowerCase().includes(searchBlocks.toLowerCase()));
  };

  return (
    <div className='fixed left-4 top-4 w-72 z-50 flex flex-col space-y-3 h-[calc(100vh-2rem)]'>
      {/* Workspace Header Card */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <h1 className='text-lg font-semibold text-gray-900'>dbswl030's Workspace</h1>
            <ChevronDown className='w-4 h-4 text-gray-400' />
          </div>
          <button className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
            <Copy className='w-4 h-4' />
          </button>
        </div>

        {/* Search Section */}
        <div className='mt-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search anything'
              className='w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className='absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded shadow-sm'>
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Folders Section Card */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-semibold text-gray-800'>Folder 1</h3>
          <button className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
            <Plus className='w-3 h-3' />
          </button>
        </div>

        <div className='space-y-2'>
          {folders.map((folder) => (
            <div
              key={folder.name}
              className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                folder.isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'hover:bg-gray-50 text-gray-700 border border-transparent'
              }`}
              onClick={() => handleFolderSelect(folder.name)}
            >
              <span className='mr-3 text-lg'>{folder.icon}</span>
              <span className='text-sm font-medium truncate'>{folder.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Blocks Palette Section Card */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0'>
        <div className='mb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search blocks...'
              className='w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
              value={searchBlocks}
              onChange={(e) => setSearchBlocks(e.target.value)}
            />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto space-y-2 pr-1'>
          {getFilteredBlocks().map((block) => (
            <div
              key={block.name}
              className='flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 group border border-gray-100 hover:border-gray-200 hover:shadow-sm'
              draggable
              onDragStart={(e) => handleBlockDragStart(e, block.name)}
            >
              <div
                className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform shadow-sm`}
              >
                <span className='text-white text-sm font-medium'>{block.icon}</span>
              </div>
              <span className='text-sm font-medium text-gray-900'>{block.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section Cards */}
      <div className='space-y-2'>
        {/* Navigation Icons Card */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-3'>
          <div className='flex items-center justify-between'>
            {bottomIcons.map((item, index) => (
              <button
                key={index}
                className='p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors'
                title={item.title}
              >
                <item.icon className='w-4 h-4' />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSidebar;
