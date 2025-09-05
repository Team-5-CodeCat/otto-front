import React from 'react';
import NodeVersionSelector from '../../../components/ui/NodeVersionSelector';
import { useNodeVersion } from '../../../contexts/NodeVersionContext';

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  const { selectedVersion } = useNodeVersion();

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

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className='w-48 min-w-48 bg-white border-r border-gray-200 flex flex-col md:w-52 lg:w-56 xl:w-60 2xl:w-64'>
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
      <div className='flex-1 p-4'>
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
  );
};

export default NodePalette;
