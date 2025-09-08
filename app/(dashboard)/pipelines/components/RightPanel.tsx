import React, { useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { Node } from 'reactflow';
import YamlEditor from '../../../components/ui/YamlEditor';
import EnvironmentTab from '../../../components/ui/EnvironmentTab';
import { EnvironmentVariable } from '../../../components/ui/EnvironmentVariableList';
import { userMyInfo } from '@team-5-codecat/otto-sdk/lib/functional/user';
import makeFetch from '@/app/lib/make-fetch';

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
  const [activeEnvTab, setActiveEnvTab] = useState<'build' | 'test' | 'deploy'>('build');
  const [nodeEnvironments, setNodeEnvironments] = useState<Record<string, EnvironmentVariable[]>>(
    {}
  );
  // 각 탭별로 독립적인 업로드된 파일 상태 관리
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<'build' | 'test' | 'deploy', File | null>
  >({
    build: null,
    test: null,
    deploy: null,
  });

  const handleRefresh = () => {
    // YAML 내용을 빈 문자열로 초기화
    onYamlChange('');

    // 업로드된 파일들 초기화
    setUploadedFiles({
      build: null,
      test: null,
      deploy: null,
    });

    // 환경 변수들 초기화
    setNodeEnvironments({});
  };

  const handleRun = async () => {
    try {
      await userMyInfo(makeFetch());
      /*      const response = await fetch('/api/v1/user');
      console.log('API Response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('API Data:', data);
      }*/
    } catch (error) {
      console.error('API Error:', error);
    }
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
      const nodeEnvs = updated[nodeId]!;
      nodeEnvs[index] = { ...nodeEnvs[index]!, [field]: value };

      // 노드의 환경 변수를 업데이트
      const envObject: Record<string, string> = {};
      nodeEnvs.forEach((env) => {
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
      const nodeEnvs = updated[nodeId]!;
      nodeEnvs[index] = {
        ...nodeEnvs[index]!,
        isVisible: !nodeEnvs[index]!.isVisible,
      };
      return updated;
    });
  };

  // 환경 변수 삭제
  const removeEnvironmentVariable = (nodeId: string, index: number) => {
    setNodeEnvironments((prev) => {
      const updated = { ...prev };
      if (!updated[nodeId]) return prev;
      const nodeEnvs = updated[nodeId]!;
      updated[nodeId] = nodeEnvs.filter((_, i) => i !== index);

      // 노드의 환경 변수를 업데이트
      const envObject: Record<string, string> = {};
      updated[nodeId]!.forEach((env) => {
        if (env.key && env.value) {
          envObject[env.key] = env.value;
        }
      });
      onUpdateNodeEnvironment(nodeId, envObject);

      return updated;
    });
  };

  // .env 파일 업로드 핸들러 (특정 노드 타입에만 적용)
  const handleEnvFileUpload = (envVars: Record<string, string>, file: File) => {
    const targetNodes = getAvailableNodes().filter((node) => node.data.name === activeEnvTab);

    if (targetNodes.length === 0) {
      alert(`No ${activeEnvTab} nodes available. Please add a ${activeEnvTab} node first.`);
      return;
    }

    // 현재 탭에 파일 저장
    setUploadedFiles((prev) => ({
      ...prev,
      [activeEnvTab]: file,
    }));

    // 해당 타입의 노드들에만 환경 변수 적용
    targetNodes.forEach((node) => {
      const envArray: EnvironmentVariable[] = Object.entries(envVars).map(([key, value]) => ({
        key,
        value,
        isVisible: false, // 보안을 위해 기본적으로 숨김
      }));

      setNodeEnvironments((prev) => ({
        ...prev,
        [node.id]: envArray,
      }));

      // 노드의 환경 변수 업데이트
      onUpdateNodeEnvironment(node.id, envVars);
    });

    alert(`Environment variables applied to ${targetNodes.length} ${activeEnvTab} node(s)`);
  };

  // 파일 제거 핸들러
  const handleFileRemove = () => {
    setUploadedFiles((prev) => ({
      ...prev,
      [activeEnvTab]: null,
    }));
  };

  // 현재 캔버스에 있는 노드들 필터링
  const getAvailableNodes = () => {
    return nodes.filter(
      (node) =>
        node.type === 'jobNode' && ['build', 'test', 'deploy'].includes(node.data.name as string)
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
          <button
            onClick={handleRun}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
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
        {activeTab === 'yaml' && <YamlEditor value={yamlText} onChange={onYamlChange} />}

        {activeTab === 'env' && (
          <EnvironmentTab
            activeEnvTab={activeEnvTab}
            onTabChange={setActiveEnvTab}
            uploadedFile={uploadedFiles[activeEnvTab]}
            onFileUpload={handleEnvFileUpload}
            onFileRemove={handleFileRemove}
            nodes={nodes}
            nodeEnvironments={nodeEnvironments}
            onAddEnvironmentVariable={addEnvironmentVariable}
            onUpdateEnvironmentVariable={updateEnvironmentVariable}
            onToggleVisibility={toggleVisibility}
            onRemoveEnvironmentVariable={removeEnvironmentVariable}
          />
        )}
      </div>
    </div>
  );
};

export default RightPanel;
