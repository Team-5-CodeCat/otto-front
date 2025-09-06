'use client';

import React from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';

export interface EnvironmentVariable {
  key: string;
  value: string;
  isVisible: boolean;
}

interface EnvironmentVariableListProps {
  nodeId: string;
  nodeName: string;
  environmentVariables: EnvironmentVariable[];
  onAddVariable: (nodeId: string) => void;
  onUpdateVariable: (nodeId: string, index: number, field: 'key' | 'value', value: string) => void;
  onToggleVisibility: (nodeId: string, index: number) => void;
  onRemoveVariable: (nodeId: string, index: number) => void;
}

export const EnvironmentVariableList: React.FC<EnvironmentVariableListProps> = ({
  nodeId,
  nodeName,
  environmentVariables,
  onAddVariable,
  onUpdateVariable,
  onToggleVisibility,
  onRemoveVariable,
}) => {
  return (
    <div className='border border-gray-200 rounded-lg p-3'>
      {/* 노드 헤더 */}
      <div className='flex items-center justify-between mb-3'>
        <h4 className='font-medium text-gray-900 capitalize'>{nodeName}</h4>
        <button
          onClick={() => onAddVariable(nodeId)}
          className='flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors'
        >
          <Plus size={12} />
          추가
        </button>
      </div>

      {/* 환경 변수 목록 */}
      <div className='space-y-2'>
        {/* 헤더 */}
        <div className='grid grid-cols-2 gap-2 text-xs font-medium text-gray-500'>
          <div>Key</div>
          <div>Value</div>
        </div>

        {/* 환경 변수 행들 */}
        {environmentVariables.map((env, index) => (
          <div key={index} className='grid grid-cols-2 gap-2'>
            <input
              type='text'
              value={env.key}
              onChange={(e) => onUpdateVariable(nodeId, index, 'key', e.target.value)}
              placeholder='Key'
              className='px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
            />
            <div className='relative'>
              <input
                type={env.isVisible ? 'text' : 'password'}
                value={env.value}
                onChange={(e) => onUpdateVariable(nodeId, index, 'value', e.target.value)}
                placeholder='Value'
                className='w-full px-2 py-1 pr-8 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
              <button
                onClick={() => onToggleVisibility(nodeId, index)}
                className='absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded'
              >
                {env.isVisible ? <EyeOff size={10} /> : <Eye size={10} />}
              </button>
            </div>
          </div>
        ))}

        {/* 환경 변수가 없을 때 */}
        {environmentVariables.length === 0 && (
          <div className='text-xs text-gray-500 italic py-2'>
            No environment variables set
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentVariableList;
