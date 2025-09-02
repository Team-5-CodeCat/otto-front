import React from 'react';

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

const nodeTemplates = [
  {
    type: 'build',
    label: 'Build',
    description: 'Build your application',
    defaultImage: 'node:20',
    defaultCommands: 'npm ci\nnpm run build',
  },
  {
    type: 'test',
    label: 'Test',
    description: 'Run tests',
    defaultImage: 'node:20',
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

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  return (
    <div className='w-48 min-w-48 bg-white border-r border-gray-200 flex flex-col md:w-52 lg:w-56 xl:w-60 2xl:w-64'>
      {/* 헤더 */}
      <div className='p-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900'>Pipeline Builder</h3>
      </div>

      {/* 노드 팔레트 */}
      <div className='flex-1 p-4'>
        <div className='space-y-3'>
          {nodeTemplates.map((template) => (
            <button
              key={template.type}
              onClick={() => onAddNode(template.type)}
              className='w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors group'
            >
              <div className='font-medium text-gray-900 group-hover:text-blue-600'>
                {template.label}
              </div>
              <div className='text-sm text-gray-500 mt-1'>{template.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
