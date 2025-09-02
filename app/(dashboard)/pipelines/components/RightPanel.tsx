import React, { useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';

interface RightPanelProps {
  yamlText: string;
  onYamlChange: (value: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ yamlText, onYamlChange }) => {
  const [activeTab, setActiveTab] = useState<'yaml' | 'env'>('yaml');

  const handleYamlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onYamlChange(event.target.value);
  };

  const handleRefresh = () => {
    // YAML 내용을 빈 문자열로 초기화
    onYamlChange('');
  };

  return (
    <div className='w-72 min-w-72 bg-white border-l border-gray-200 flex flex-col md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem]'>
      {/* 헤더 */}
      <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <button
            onClick={handleRefresh}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='스크립트 내용 초기화'
          >
            <RotateCcw size={16} className='text-gray-600' />
          </button>
          <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <Play size={16} className='text-gray-600' />
          </button>
        </div>
      </div>

      {/* 탭 헤더 */}
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('yaml')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'yaml'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          YAML
        </button>
        <button
          onClick={() => setActiveTab('env')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'env'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          .env
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      <div className='flex-1 p-4'>
        {activeTab === 'yaml' && (
          <div className='h-full'>
            <textarea
              value={yamlText}
              onChange={handleYamlChange}
              className='w-full h-full resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='YAML configuration will appear here...'
            />
          </div>
        )}

        {activeTab === 'env' && (
          <div className='h-full'>
            <textarea
              className='w-full h-full resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='Environment variables...'
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
