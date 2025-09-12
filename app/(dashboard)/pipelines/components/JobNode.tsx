/**
 * JobNode 컴포넌트
 * 
 * 파이프라인의 각 블록을 시각적으로 표현하는 React Flow 노드 컴포넌트입니다.
 * Block 타입에 따라 다른 UI와 기능을 제공합니다.
 * 
 * 지원하는 Block 타입:
 * - OS: 운영체제 설정 (파란색)
 * - OS_PACKAGE: OS 패키지 설치 (초록색) - 인라인 편집 지원
 * - INSTALL_MODULE_NODE: Node.js 패키지 설치 (노란색)
 * - CUSTOM_TEST_BLOCK: 테스트 명령어 (보라색)
 * - CUSTOM_COMMAND: 사용자 정의 명령어 (에메랄드색)
 * 
 * 주요 기능:
 * - 타입별 색상 구분: 각 블록 타입마다 다른 색상 테마 적용
 * - 인라인 편집: OS_PACKAGE 블록은 Edit 버튼으로 PackageManagerSelector 표시
 * - 명령어/패키지 미리보기: 내용을 축약하여 표시 (2-3개만 표시, 나머지는 +N more...)
 * - React Flow 연결점: 상단(target), 하단(source) Handle로 연결 가능
 * - 호버 효과: 그림자 변화로 상호작용 피드백
 * 
 * 편집 기능:
 * - OS_PACKAGE 블록만 Edit3 아이콘 버튼 표시
 * - 편집 모드에서 PackageManagerSelector 컴포넌트 표시
 * - 패키지 매니저 변경 및 패키지 목록 실시간 수정 가능
 * - onUpdateBlock 콜백으로 상위 컴포넌트에 변경사항 전달
 */

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { AnyBlock, BlockType, OSPackageBlock } from './types';
import { Edit3 } from 'lucide-react';
import PackageManagerSelector, { PackageManager } from '../../../components/ui/PackageManagerSelector';

interface JobNodeProps {
  data: AnyBlock;
  onUpdateBlock?: (blockId: string, updatedBlock: AnyBlock) => void;
}

const JobNode: React.FC<JobNodeProps> = ({ data, onUpdateBlock }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Block 타입에 따른 노드 정보 추출
  const getNodeInfo = (block: AnyBlock) => {
    switch (block.type) {
      case BlockType.OS:
        return {
          title: 'OS Setup',
          subtitle: block.os_name,
          color: 'bg-blue-50 border-blue-200 text-blue-700'
        };
      case BlockType.OS_PACKAGE:
        return {
          title: 'Install Packages',
          subtitle: `${block.package_manager} (${block.install_packages.length} packages)`,
          color: 'bg-green-50 border-green-200 text-green-700'
        };
      case BlockType.INSTALL_MODULE_NODE:
        return {
          title: 'Node Packages',
          subtitle: `${block.package_manager} (${block.install_packages.length} packages)`,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
        };
      case BlockType.CUSTOM_TEST_BLOCK:
        return {
          title: 'Test',
          subtitle: `${block.commands.length} command(s)`,
          color: 'bg-purple-50 border-purple-200 text-purple-700'
        };
      case BlockType.CUSTOM_COMMAND:
        return {
          title: 'Custom Command',
          subtitle: `${block.commands.length} command(s)`,
          color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
        };
      default:
        return {
          title: 'Unknown Block',
          subtitle: 'Unknown type',
          color: 'bg-gray-50 border-gray-200 text-gray-700'
        };
    }
  };

  const nodeInfo = getNodeInfo(data);

  // OS 패키지 블록 업데이트 함수
  const handleUpdateOSPackage = (packageManager: PackageManager, packages: string[]) => {
    if (data.type === BlockType.OS_PACKAGE && onUpdateBlock) {
      const updatedBlock: OSPackageBlock = {
        ...data,
        package_manager: packageManager,
        install_packages: packages,
      };
      onUpdateBlock(data.block_id, updatedBlock);
    }
  };

  // 첫 번째/마지막 노드 처리는 on_success/on_failed 기반으로 판단
  const hasIncomingConnection = data.on_failed || data.on_success; // 다른 노드에서 오는 연결 있을 것으로 추정
  const hasOutgoingConnection = data.on_success || data.on_failed;

  return (
    <div className='px-4 py-3 shadow-lg rounded-lg bg-white border border-emerald-200 min-w-[180px] max-w-[220px] relative hover:shadow-xl transition-shadow'>
      {/* 입력 핸들 (위쪽) - 들어오는 연결이 있을 때만 표시 */}
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-emerald-400 border-2 border-white hover:bg-emerald-500 transition-colors'
        style={{ top: -6 }}
      />

      {/* 노드 헤더 */}
      <div className='text-center'>
        <div className='flex items-center justify-between mb-1'>
          <div className='text-base font-semibold text-gray-900'>{nodeInfo.title}</div>
          {data.type === BlockType.OS_PACKAGE && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='p-1 hover:bg-gray-100 rounded'
              title='편집'
            >
              <Edit3 size={14} className='text-gray-500' />
            </button>
          )}
        </div>
        <div className={`text-xs px-2 py-1 rounded border ${nodeInfo.color}`}>
          {nodeInfo.subtitle}
        </div>
      </div>

      {/* 커맨드 목록 표시 (CUSTOM_COMMAND, CUSTOM_TEST_BLOCK에만) */}
      {(data.type === BlockType.CUSTOM_COMMAND || data.type === BlockType.CUSTOM_TEST_BLOCK) && (
        <div className='mt-2 pt-2 border-t border-gray-100'>
          <div className='text-xs text-gray-600 font-medium mb-1'>Commands:</div>
          {data.commands.slice(0, 2).map((cmd, idx) => (
            <div key={idx} className='text-xs text-gray-500 truncate font-mono'>
              {cmd}
            </div>
          ))}
          {data.commands.length > 2 && (
            <div className='text-xs text-gray-400'>
              +{data.commands.length - 2} more...
            </div>
          )}
        </div>
      )}

      {/* OS 패키지 편집 UI */}
      {data.type === BlockType.OS_PACKAGE && isEditing && (
        <div className='mt-2 pt-2 border-t border-gray-100'>
          <PackageManagerSelector
            selectedManager={data.package_manager as PackageManager}
            onManagerChange={(manager) => handleUpdateOSPackage(manager, data.install_packages)}
            packages={data.install_packages}
            onPackagesChange={(packages) => handleUpdateOSPackage(data.package_manager as PackageManager, packages)}
            className='text-xs'
          />
        </div>
      )}

      {/* 패키지 목록 표시 (OS_PACKAGE, INSTALL_MODULE_NODE에만, 편집 모드 아닐 때) */}
      {(data.type === BlockType.OS_PACKAGE || data.type === BlockType.INSTALL_MODULE_NODE) && !isEditing && (
        <div className='mt-2 pt-2 border-t border-gray-100'>
          <div className='text-xs text-gray-600 font-medium mb-1'>Packages:</div>
          {data.install_packages.slice(0, 3).map((pkg, idx) => (
            <div key={idx} className='text-xs text-gray-500 truncate font-mono'>
              {pkg}
            </div>
          ))}
          {data.install_packages.length > 3 && (
            <div className='text-xs text-gray-400'>
              +{data.install_packages.length - 3} more...
            </div>
          )}
        </div>
      )}

      {/* 출력 핸들 (아래쪽) - 나가는 연결이 있을 때만 표시 */}
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-emerald-400 border-2 border-white hover:bg-emerald-500 transition-colors'
        style={{ bottom: -6 }}
      />
    </div>
  );
};

export default JobNode;
