import React from 'react';
import { Handle, Position } from 'reactflow';
import { JobNodeData } from './types';

interface JobNodeProps {
  data: JobNodeData;
}

const JobNode: React.FC<JobNodeProps> = ({ data }) => {
  return (
    <div className='px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 min-w-[200px] relative'>
      {/* 입력 핸들 (위쪽) */}
      <Handle
        type='target'
        position={Position.Top}
        className='w-3 h-3 bg-blue-500 border-2 border-white'
        style={{ top: -6 }}
      />

      {/* 노드 헤더 */}
      <div className='flex items-center'>
        <div className='ml-2'>
          <div className='text-lg font-bold text-gray-900'>{data.name}</div>
          <div className='text-gray-500 text-sm'>Image: {data.image}</div>
        </div>
      </div>

      {/* 환경 변수가 있다면 표시 */}
      {data.environment && (
        <div className='mt-2'>
          <div className='text-xs text-gray-600 font-semibold'>Environment:</div>
          {Object.entries(data.environment).map(([key, value]) => (
            <div key={key} className='text-xs text-gray-500'>
              {key}: {String(value)}
            </div>
          ))}
        </div>
      )}

      {/* 커맨드 표시 */}
      <div className='mt-2'>
        <div className='text-xs text-gray-600 font-semibold'>Commands:</div>
        <div className='text-xs text-gray-500 whitespace-pre-wrap font-mono'>{data.commands}</div>
      </div>

      {/* 출력 핸들 (아래쪽) */}
      <Handle
        type='source'
        position={Position.Bottom}
        className='w-3 h-3 bg-green-500 border-2 border-white'
        style={{ bottom: -6 }}
      />
    </div>
  );
};

export default JobNode;
