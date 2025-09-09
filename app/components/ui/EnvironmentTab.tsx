'use client';

import React from 'react';
import { Node } from 'reactflow';
import EnvFileUploader from './EnvFileUploader';
import EnvironmentVariableList, { EnvironmentVariable } from './EnvironmentVariableList';

interface EnvironmentTabProps {
  activeEnvTab: 'build' | 'test' | 'deploy';
  onTabChange: (tab: 'build' | 'test' | 'deploy') => void;
  uploadedFile: File | null;
  onFileUpload: (envVars: Record<string, string>, file: File) => void;
  onFileRemove: () => void;
  nodes: Node[];
  nodeEnvironments: Record<string, EnvironmentVariable[]>;
  onAddEnvironmentVariable: (nodeId: string) => void;
  onUpdateEnvironmentVariable: (
    nodeId: string,
    index: number,
    field: 'key' | 'value',
    value: string
  ) => void;
  onToggleVisibility: (nodeId: string, index: number) => void;
  onRemoveEnvironmentVariable: (nodeId: string, index: number) => void;
}

export const EnvironmentTab: React.FC<EnvironmentTabProps> = ({
  activeEnvTab,
  onTabChange,
  uploadedFile,
  onFileUpload,
  onFileRemove,
  nodes,
  nodeEnvironments,
  onAddEnvironmentVariable,
  onUpdateEnvironmentVariable,
  onToggleVisibility,
  onRemoveEnvironmentVariable,
}) => {
  // 현재 탭에 해당하는 노드들 필터링
  const getAvailableNodes = () => {
    return nodes.filter((node) => {
      const name = String(node.data.name || '').toLowerCase();
      return (
        node.type === 'jobNode' &&
        ['build', 'test', 'deploy'].includes(name) &&
        name === activeEnvTab
      );
    });
  };

  const availableNodes = getAvailableNodes();

  return (
    <div className='h-full flex flex-col'>
      {/* Build, Test, Deploy 서브탭 */}
      <div className='flex border-b border-gray-200'>
        {(['build', 'test', 'deploy'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors capitalize ${
              activeEnvTab === tab
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 파일 업로드 섹션 */}
      <div className='p-4 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-900 mb-3'>Upload .env File</h3>
        <EnvFileUploader
          onFileUpload={onFileUpload}
          onFileRemove={onFileRemove}
          uploadedFile={uploadedFile}
        />
      </div>

      {/* 환경 변수 관리 섹션 */}
      <div className='flex-1 overflow-hidden'>
        {availableNodes.length === 0 ? (
          <div className='flex-1 flex items-center justify-center p-4'>
            <div className='text-center text-gray-500'>
              <p className='text-sm'>No {activeEnvTab} nodes available</p>
              <p className='text-xs mt-1'>
                Add a {activeEnvTab} node to manage environment variables
              </p>
            </div>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto p-4'>
            <div className='mb-3'>
              <h3 className='text-sm font-medium text-gray-900'>Environment Variables</h3>
              <p className='text-xs text-gray-500 mt-1'>
                Manage environment variables for {activeEnvTab} nodes
              </p>
            </div>
            {availableNodes.map((node) => (
              <EnvironmentVariableList
                key={node.id}
                nodeId={node.id}
                nodeName={node.data.name as string}
                environmentVariables={nodeEnvironments[node.id] || []}
                onAddVariable={onAddEnvironmentVariable}
                onUpdateVariable={onUpdateEnvironmentVariable}
                onToggleVisibility={onToggleVisibility}
                onRemoveVariable={onRemoveEnvironmentVariable}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentTab;
