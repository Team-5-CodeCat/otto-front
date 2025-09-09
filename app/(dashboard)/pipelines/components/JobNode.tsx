import React from 'react';
import { Handle, Position } from 'reactflow';
import { JobNodeData } from './types';

interface JobNodeProps {
  data: JobNodeData;
}

const JobNode: React.FC<JobNodeProps> = ({ data }) => {
  // 환경 변수 값을 마스킹하는 함수 (전체 마스킹)
  const maskValue = (value: string | number): string => {
    const str = String(value);
    return '*'.repeat(str.length);
  };

  // Build 노드는 첫 번째 노드이므로 상단 핸들이 필요 없음
  const isBuildNode = data.name?.toLowerCase() === 'build';
  // Deploy 노드는 마지막 노드이므로 하단 핸들이 필요 없음
  const isDeployNode = data.name?.toLowerCase() === 'deploy';

  return (
    <div className='px-4 py-3 shadow-lg rounded-lg bg-white border border-emerald-200 min-w-[180px] max-w-[220px] relative hover:shadow-xl transition-shadow'>
      {/* 입력 핸들 (위쪽) - Build 노드가 아닐 때만 표시 */}
      {!isBuildNode && (
        <Handle
          type='target'
          position={Position.Top}
          className='w-3 h-3 bg-emerald-400 border-2 border-white hover:bg-emerald-500 transition-colors'
          style={{ top: -6 }}
        />
      )}

      {/* 노드 헤더 */}
      <div className='text-center'>
        <div className='text-base font-semibold text-gray-900 mb-1'>{data.name}</div>
        <div className='text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200'>
          {data.image}
        </div>
      </div>

      {/* 환경 변수가 있다면 표시 */}
      {data.environment && (
        <div className='mt-2 pt-2 border-t border-gray-100'>
          <div className='text-xs text-gray-600 font-medium mb-1'>Environment:</div>
          {Object.entries(data.environment)
            .slice(0, 2)
            .map(([key, value]) => (
              <div key={key} className='text-xs text-gray-500 truncate'>
                {key}: {maskValue(value)}
              </div>
            ))}
          {Object.entries(data.environment).length > 2 && (
            <div className='text-xs text-gray-400'>
              +{Object.entries(data.environment).length - 2} more...
            </div>
          )}
        </div>
      )}

      {/* 출력 핸들 (아래쪽) - Deploy 노드가 아닐 때만 표시 */}
      {!isDeployNode && (
        <Handle
          type='source'
          position={Position.Bottom}
          className='w-3 h-3 bg-emerald-400 border-2 border-white hover:bg-emerald-500 transition-colors'
          style={{ bottom: -6 }}
        />
      )}
    </div>
  );
};

export default JobNode;
