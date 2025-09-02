import React, { useState } from 'react';
import { RotateCcw, Play, Plus, Eye, EyeOff } from 'lucide-react';
import { Node } from 'reactflow';

interface EnvironmentVariable {
  key: string;
  value: string;
  isVisible: boolean;
}

interface RightPanelProps {
  yamlText: string;
  onYamlChange: (value: string) => void;
  nodes: Node[];
  onUpdateNodeEnvironment: (nodeId: string, environment: Record<string, string>) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  yamlText,
  onYamlChange,
  nodes,
  onUpdateNodeEnvironment,
}) => {
  const [activeTab, setActiveTab] = useState<'yaml' | 'env'>('yaml');
  const [nodeEnvironments, setNodeEnvironments] = useState<Record<string, EnvironmentVariable[]>>(
    {}
  );

  const handleYamlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onYamlChange(event.target.value);
  };

  const handleRefresh = () => {
    // YAML 내용을 빈 문자열로 초기화
    onYamlChange('');
  };

  // 노드별 환경 변수 추가
  const addEnvironmentVariable = (nodeId: string) => {
    setNodeEnvironments((prev) => ({
      ...prev,
      [nodeId]: [...(prev[nodeId] || []), { key: '', value: '', isVisible: false }],
    }));
  };

  // 환경 변수 업데이트
  const updateEnvironmentVariable = (
    nodeId: string,
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setNodeEnvironments((prev) => {
      const updated = { ...prev };
      if (!updated[nodeId]) updated[nodeId] = [];
      updated[nodeId] = [...updated[nodeId]];
      updated[nodeId][index] = { ...updated[nodeId][index], [field]: value };

      // 노드의 환경 변수를 업데이트
      const envObject: Record<string, string> = {};
      updated[nodeId].forEach((env) => {
        if (env.key && env.value) {
          envObject[env.key] = env.value;
        }
      });
      onUpdateNodeEnvironment(nodeId, envObject);

      return updated;
    });
  };

  // 환경 변수 가시성 토글
  const toggleVisibility = (nodeId: string, index: number) => {
    setNodeEnvironments((prev) => {
      const updated = { ...prev };
      if (!updated[nodeId]) return prev;
      updated[nodeId] = [...updated[nodeId]];
      updated[nodeId][index] = {
        ...updated[nodeId][index],
        isVisible: !updated[nodeId][index].isVisible,
      };
      return updated;
    });
  };

  // 환경 변수 삭제
  const removeEnvironmentVariable = (nodeId: string, index: number) => {
    setNodeEnvironments((prev) => {
      const updated = { ...prev };
      if (!updated[nodeId]) return prev;
      updated[nodeId] = updated[nodeId].filter((_, i) => i !== index);

      // 노드의 환경 변수를 업데이트
      const envObject: Record<string, string> = {};
      updated[nodeId].forEach((env) => {
        if (env.key && env.value) {
          envObject[env.key] = env.value;
        }
      });
      onUpdateNodeEnvironment(nodeId, envObject);

      return updated;
    });
  };

  // 현재 캔버스에 있는 노드들 필터링
  const getAvailableNodes = () => {
    return nodes.filter(
      (node) => node.type === 'jobNode' && ['build', 'test', 'deploy'].includes(node.data.name)
    );
  };

  return (
    <div className='w-64 min-w-64 bg-white border-l border-gray-200 flex flex-col md:w-72 lg:w-80 xl:w-96 2xl:w-[26rem]'>
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
      <div className='flex-1 overflow-hidden'>
        {activeTab === 'yaml' && (
          <div className='h-full p-4'>
            <textarea
              value={yamlText}
              onChange={handleYamlChange}
              className='w-full h-full resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='YAML configuration will appear here...'
            />
          </div>
        )}

        {activeTab === 'env' && (
          <div className='h-full flex flex-col'>
            {getAvailableNodes().length === 0 ? (
              <div className='flex-1 flex items-center justify-center p-4'>
                <div className='text-center text-gray-500'>
                  <p className='text-sm'>No nodes available</p>
                  <p className='text-xs mt-1'>
                    Add Build, Test, or Deploy nodes to manage environment variables
                  </p>
                </div>
              </div>
            ) : (
              <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                {getAvailableNodes().map((node) => (
                  <div key={node.id} className='border border-gray-200 rounded-lg p-3'>
                    {/* 노드 헤더 */}
                    <div className='flex items-center justify-between mb-3'>
                      <h4 className='font-medium text-gray-900 capitalize'>{node.data.name}</h4>
                      <button
                        onClick={() => addEnvironmentVariable(node.id)}
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
                      {(nodeEnvironments[node.id] || []).map((env, index) => (
                        <div key={index} className='grid grid-cols-2 gap-2'>
                          <input
                            type='text'
                            value={env.key}
                            onChange={(e) =>
                              updateEnvironmentVariable(node.id, index, 'key', e.target.value)
                            }
                            placeholder='Key'
                            className='px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                          />
                          <div className='relative'>
                            <input
                              type={env.isVisible ? 'text' : 'password'}
                              value={env.value}
                              onChange={(e) =>
                                updateEnvironmentVariable(node.id, index, 'value', e.target.value)
                              }
                              placeholder='Value'
                              className='w-full px-2 py-1 pr-8 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                            />
                            <button
                              onClick={() => toggleVisibility(node.id, index)}
                              className='absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded'
                            >
                              {env.isVisible ? <EyeOff size={10} /> : <Eye size={10} />}
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* 환경 변수가 없을 때 */}
                      {(!nodeEnvironments[node.id] || nodeEnvironments[node.id].length === 0) && (
                        <div className='text-xs text-gray-500 italic py-2'>
                          No environment variables set
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
