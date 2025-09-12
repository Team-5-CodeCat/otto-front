/**
 * RightPanel 컴포넌트
 *
 * 파이프라인 편집기의 우측 패널로, 파이프라인 관리 및 환경 변수 설정 기능을 제공합니다.
 * JSON 편집기는 숨겨져 있으며, Environment 탭만 사용자에게 노출됩니다.
 *
 * 주요 기능:
 * - 파이프라인 관리: 저장, 불러오기, 실행, 초기화
 * - 환경 변수 관리: 노드별 환경 변수 설정 및 .env 파일 업로드
 * - 탭 기반 UI: Environment 탭으로 구성 (JSON 탭은 숨김)
 * - 모달 다이얼로그: 저장/불러오기를 위한 모달 UI
 *
 * 버튼 기능:
 * - Refresh: 파이프라인 초기화 (JSON을 빈 배열로 리셋)
 * - Save: 현재 파이프라인을 이름과 함께 저장
 * - FolderOpen: 저장된 파이프라인 목록에서 선택하여 불러오기
 * - Play: 파이프라인 즉시 실행
 *
 * Environment 탭 기능:
 * - 노드별 환경 변수: 각 블록에 개별 환경 변수 설정
 * - .env 파일 업로드: 파일에서 환경 변수 일괄 로드
 * - 가시성 토글: 민감한 정보 숨김/표시
 * - 탭별 관리: build, test, deploy 노드별로 독립 관리
 *
 * SDK 통합:
 * - onSavePipeline: Otto SDK를 통한 파이프라인 저장
 * - onLoadPipeline: 파이프라인 ID로 기존 파이프라인 불러오기
 * - onRunPipeline: 파이프라인 실행 (저장 후 실행 또는 바로 실행)
 * - availablePipelines: 프로젝트의 파이프라인 목록
 *
 * 레이아웃:
 * - 고정 너비 (w-64 ~ w-[26rem] 반응형)
 * - 헤더: 액션 버튼들
 * - 탭 영역: Environment 탭만 표시
 * - 모달: SavePipelineModal, LoadPipelineModal 오버레이
 */

import React, { useState } from 'react';
import { RotateCcw, Play, Save, FolderOpen } from 'lucide-react';
import { Node } from 'reactflow';
// JsonEditor는 사용하지 않음 - 주석 처리
// import JsonEditor from '../../../components/ui/JsonEditor';
import EnvironmentTab from '../../../components/ui/EnvironmentTab';
import SavePipelineModal from './SavePipelineModal';
import { EnvironmentVariable } from '../../../components/ui/EnvironmentVariableList';
import LoadPipelineModal from './LoadPipelineModel';
// import { userMyInfo } from '@cooodecat/otto-sdk/lib/functional/user';
// import makeFetch from '@/app/lib/make-fetch';

export interface RightPanelProps {
  jsonText: string;
  onJsonChange: (value: string) => void;
  nodes: Node[];
  onUpdateNodeEnvironment: (nodeId: string, environment: Record<string, string>) => void;
  // ✅ SDK 기반 함수들 추가
  onSavePipeline?: (
    name: string,
    projectID?: string
  ) => Promise<{ success: boolean; pipelineId?: string }>;
  onLoadPipeline?: (pipelineID: string) => Promise<void>;
  availablePipelines?: Array<{
    pipelineID: string;
    name: string;
    version: number;
  }>;
  // ✅ 실행 콜백 추가
  onRunPipeline?: () => Promise<void>;
}

const RightPanel: React.FC<RightPanelProps> = ({
  jsonText,
  onJsonChange,
  nodes,
  onUpdateNodeEnvironment,
  onSavePipeline,
  onLoadPipeline,
  availablePipelines = [],
  onRunPipeline,
}) => {
  const [activeTab, setActiveTab] = useState<'yaml' | 'env'>('env'); // 기본적으로 env 탭 활성화
  const [activeEnvTab, setActiveEnvTab] = useState<'build' | 'test' | 'deploy'>('build');
  const [nodeEnvironments, setNodeEnvironments] = useState<Record<string, EnvironmentVariable[]>>(
    {}
  );

  // ✅ 저장/불러오기 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [pipelineName, setPipelineName] = useState('');

  // 각 탭별로 독립적인 업로드된 파일 상태 관리
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<'build' | 'test' | 'deploy', File | null>
  >({
    build: null,
    test: null,
    deploy: null,
  });

  const handleRefresh = () => {
    // JSON 내용을 빈 배열로 초기화
    onJsonChange('[]');

    // 업로드된 파일들 초기화
    setUploadedFiles({
      build: null,
      test: null,
      deploy: null,
    });

    // 환경 변수들 초기화
    setNodeEnvironments({});
  };

  // ✅ SDK를 통한 저장 함수
  const handleSave = () => {
    if (!jsonText.trim() || jsonText.trim() === '[]') {
      alert('JSON 내용이 비어있습니다.');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!pipelineName.trim() || !onSavePipeline) return;

    const result = await onSavePipeline(pipelineName);
    if (result.success) {
      setShowSaveModal(false);
      setPipelineName('');
    }
  };

  // ✅ SDK를 통한 불러오기 함수
  const handleLoad = () => {
    if (availablePipelines.length === 0) {
      alert('불러올 파이프라인이 없습니다.');
      return;
    }
    setShowLoadModal(true);
  };

  const handleLoadConfirm = async (pipelineID: string) => {
    if (onLoadPipeline) {
      await onLoadPipeline(pipelineID);
      setShowLoadModal(false);
    }
  };

  // ✅ 파이프라인 실행 (SDK)
  const handleRun = async () => {
    if (onRunPipeline) {
      await onRunPipeline();
      return;
    }
    alert('파이프라인 실행 기능은 준비 중입니다.');
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
    const targetNodes = getAvailableNodes().filter(
      (node) => getNodeNameLower(node) === activeEnvTab
    );

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
  const getNodeNameLower = (node: Node): string => {
    const data = node.data as { name?: string };
    return String(data?.name ?? '').toLowerCase();
  };

  const getAvailableNodes = () => {
    return nodes.filter((node) => {
      const name = getNodeNameLower(node);
      return node.type === 'jobNode' && ['build', 'test', 'deploy'].includes(name);
    });
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
          {/* ✅ 저장 버튼 */}
          {onSavePipeline && (
            <button
              onClick={handleSave}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='파이프라인 저장'
            >
              <Save size={16} className='text-gray-600' />
            </button>
          )}

          {/* ✅ 불러오기 버튼 */}
          {onLoadPipeline && (
            <button
              onClick={handleLoad}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='파이프라인 불러오기'
            >
              <FolderOpen size={16} className='text-gray-600' />
            </button>
          )}

          <button
            onClick={handleRun}
            className='px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
            title='파이프라인 실행'
          >
            <Play size={16} className='text-white' />
          </button>
        </div>
      </div>

      {/* 탭 헤더 - JSON 탭 숨김 */}
      <div className='flex border-b border-gray-200'>
        {/* JSON 탭 주석 처리
        <button
          onClick={() => setActiveTab('yaml')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'yaml'
              ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          JSON
        </button>
        */}
        <button
          onClick={() => setActiveTab('env')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'env'
              ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Environment
        </button>
      </div>

      {/* 탭 컨텐츠 - JSON 에디터 제거 */}
      <div className='flex-1 overflow-hidden'>
        {/* JSON 에디터 주석 처리
        {activeTab === 'yaml' && <JsonEditor value={jsonText} onChange={onJsonChange} />}
        */}

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

      <SavePipelineModal
        open={showSaveModal}
        pipelineName={pipelineName}
        onChange={setPipelineName}
        onCancel={() => setShowSaveModal(false)}
        onConfirm={handleSaveConfirm}
        confirmDisabled={!pipelineName.trim()}
      />

      <LoadPipelineModal
        open={showLoadModal}
        pipelines={availablePipelines}
        onCancel={() => setShowLoadModal(false)}
        onSelect={handleLoadConfirm}
      />
    </div>
  );
};

export default RightPanel;
