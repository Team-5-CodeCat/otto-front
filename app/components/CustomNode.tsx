import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeStatusIndicator, NodeStatus } from './NodeStatusIndicator';
import type { PipelineNodeData } from '../flow/codegen';

interface CustomNodeData extends PipelineNodeData {
  status?: NodeStatus;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const status = data.status || 'initial';

  const getNodeIcon = (kind: string) => {
    switch (kind) {
      case 'start':
        return '🚀';
      case 'git_clone':
        return '📥';
      case 'linux_install':
        return '🐧';
      case 'prebuild_node':
        return '📦';
      case 'prebuild_python':
        return '🐍';
      case 'prebuild_java':
        return '☕';
      case 'prebuild_custom':
        return '⚙️';
      case 'build_npm':
        return '🔨';
      case 'build_python':
        return '🔨';
      case 'build_java':
        return '🔨';
      case 'docker_build':
        return '🐳';
      case 'run_tests':
        return '🧪';
      case 'deploy':
        return '🚀';
      case 'notify_slack':
        return '💬';
      default:
        return '📋';
    }
  };

  const getNodeColor = (kind: string) => {
    switch (kind) {
      case 'start':
        return 'bg-blue-500';
      case 'git_clone':
        return 'bg-green-500';
      case 'linux_install':
        return 'bg-purple-500';
      case 'prebuild_node':
      case 'prebuild_python':
      case 'prebuild_java':
      case 'prebuild_custom':
        return 'bg-yellow-500';
      case 'build_npm':
      case 'build_python':
      case 'build_java':
        return 'bg-orange-500';
      case 'docker_build':
        return 'bg-blue-600';
      case 'run_tests':
        return 'bg-pink-500';
      case 'deploy':
        return 'bg-indigo-500';
      case 'notify_slack':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <NodeStatusIndicator status={status} loadingVariant='border'>
      <div
        className={`
          min-w-[200px] p-4 rounded-lg border-2 shadow-lg
          ${
            status === 'success'
              ? 'border-green-500 bg-green-50'
              : status === 'error'
                ? 'border-red-500 bg-red-50'
                : selected
                  ? 'border-blue-400 shadow-xl'
                  : 'border-gray-300'
          }
          bg-white transition-all duration-200 hover:shadow-md relative
        `}
      >
        {/* Input Handle */}
        {data.kind !== 'start' && (
          <Handle
            type='target'
            position={Position.Top}
            className='w-3 h-3 bg-gray-400 border-2 border-white'
          />
        )}

        {/* Node Content */}
        <div className='flex items-center space-x-3'>
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-white text-lg
              ${getNodeColor(data.kind)}
            `}
          >
            {getNodeIcon(data.kind)}
          </div>

          <div className='flex-1'>
            <div className='font-semibold text-gray-800 text-sm'>{data.label || data.kind}</div>
            {data.description && (
              <div className='text-xs text-gray-500 mt-1'>{data.description}</div>
            )}
          </div>
        </div>

        {/* Output Handle */}
        <Handle
          type='source'
          position={Position.Bottom}
          className='w-3 h-3 bg-gray-400 border-2 border-white'
        />
      </div>
    </NodeStatusIndicator>
  );
};

export default CustomNode;
