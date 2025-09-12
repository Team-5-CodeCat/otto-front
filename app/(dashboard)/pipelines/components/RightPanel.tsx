import React, { useState } from 'react';
import SavePipelineModal from './SavePipelineModal';
import LoadPipelineModal from './LoadPipelineModel';
// import { userMyInfo } from '@cooodecat/otto-sdk/lib/functional/user';
// import makeFetch from '@/app/lib/make-fetch';

interface RightPanelProps {
  yamlText: string;
  onYamlChange: (value: string) => void;
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
  onSavePipeline,
  onLoadPipeline,
  availablePipelines = [],
}) => {
  // ✅ 저장/불러오기 모달 상태
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [pipelineName, setPipelineName] = useState('');

  const handleSaveConfirm = async () => {
    if (!pipelineName.trim() || !onSavePipeline) return;

    const result = await onSavePipeline(pipelineName);
    if (result.success) {
      setShowSaveModal(false);
      setPipelineName('');
    }
  };

  const handleLoadConfirm = async (pipelineID: string) => {
    if (onLoadPipeline) {
      await onLoadPipeline(pipelineID);
      setShowLoadModal(false);
    }
  };

  return (
    <div className='w-64 min-w-64 bg-white border-l border-gray-200 flex flex-col md:w-72 lg:w-80 xl:w-96 2xl:w-[26rem]'>
      {/* 빈 패널 */}
      <div className='flex-1'></div>

      {/* 모달들은 유지 (필요시 사용) */}
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
