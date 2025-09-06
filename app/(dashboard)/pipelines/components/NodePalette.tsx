import React from 'react';
import PipelineBuilder from '../../../components/dashboard/PipelineBuilder';

interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ onAddNode }) => {
  return (
    <div className='w-48 min-w-48 md:w-52 lg:w-56 xl:w-60 2xl:w-64'>
      <PipelineBuilder 
        className='border-r border-gray-200 flex flex-col'
        showHeader={true}
        showVersionSelector={true}
      />
    </div>
  );
};

export default NodePalette;
