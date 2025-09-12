'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { usePipeline } from './components/usePipeline';
import FlowCanvas from './components/FlowCanvas';
import { useUIStore } from '@/app/lib/uiStore';

import { projectGetUserProjects } from '@cooodecat/otto-sdk/lib/functional/projects';
import makeFetch from '@/app/lib/make-fetch';
import { pipelineCreate, pipelineGetById } from '@cooodecat/otto-sdk/lib/functional/pipelines';
import { pipelineGetByProject } from '@cooodecat/otto-sdk/lib/functional/pipelines/project';
import { pipelineCreateRun } from '@cooodecat/otto-sdk/lib/functional/pipelines/runs';

const YamlFlowEditor = () => {
  // 파이프라인 상태 및 액션 관리
  const {
    yamlText,
    nodes,
    edges,
    onEdgesChange,
    handleNodesChange,
    onConnect,
    handleEdgeDelete,
    handleAddNode,
    handleYamlChange,
    handleUpdateNodeEnvironment,
  } = usePipeline();

  // UI 스토어에서 Pipeline Builder 제어 함수 가져오기
  const { setShowPipelineBuilder } = useUIStore();

  // ✅ SDK 관련 상태 추가
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [availablePipelines, setAvailablePipelines] = useState<
    Array<{
      pipelineID: string;
      name: string;
      version: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 파이프라인 캔버스와 YAML 내용을 초기화합니다.
   * 모든 노드와 YAML 텍스트를 빈 상태로 리셋합니다.
   * @description 사용자가 새로운 파이프라인을 시작하고 싶을 때 사용
   */
  const handleRefresh = () => {
    // YAML 내용을 빈 문자열로 초기화
    handleYamlChange('');
  };

  /**
   * 현재 작성된 파이프라인을 서버에 저장합니다.
   * @param name - 저장할 파이프라인의 이름
   * @param projectID - 파이프라인을 저장할 프로젝트 ID (선택사항)
   * @returns Promise<{success: boolean; pipelineId?: string}> - 저장 결과와 생성된 파이프라인 ID
   * @description YAML 내용이 비어있으면 저장하지 않고 에러 메시지를 표시합니다.
   */
  const savePipeline = async (name: string, projectID?: string) => {
    if (!yamlText.trim()) {
      alert('YAML 내용이 비어있습니다.');
      return { success: false };
    }

    const pid = projectID ?? currentProjectId;
    if (!pid) {
      alert('프로젝트가 선택되지 않았습니다. 프로젝트를 먼저 생성/선택해주세요.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const response = await pipelineCreate(makeFetch(), {
        name,
        yamlContent: yamlText,
        projectID: pid,
        version: 1,
      });

      setCurrentPipelineId(response.pipelineID);
      alert(`파이프라인 "${response.name}"이 저장되었습니다!`);

      // 파이프라인 목록 새로고침
      await loadProjectPipelines(pid);

      return { success: true, pipelineId: response.pipelineID };
    } catch (error) {
      console.error('파이프라인 저장 실패:', error);
      alert('파이프라인 저장에 실패했습니다.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 서버에서 기존 파이프라인을 불러와서 에디터에 로드합니다.
   * @param pipelineID - 불러올 파이프라인의 고유 ID
   * @returns Promise<void>
   * @description 파이프라인의 YAML 내용을 가져와서 현재 에디터에 표시합니다.
   * @throws 파이프라인 로드에 실패하면 에러 메시지를 표시합니다.
   */
  const loadPipeline = async (pipelineID: string) => {
    setIsLoading(true);
    try {
      const pipeline = await pipelineGetById(makeFetch(), pipelineID);

      if (pipeline.originalSpec) {
        handleYamlChange(pipeline.originalSpec);
        setCurrentPipelineId(pipelineID);
        alert(`파이프라인 "${pipeline.name}"을 불러왔습니다.`);
      }
    } catch (error) {
      console.error('파이프라인 로드 실패:', error);
      alert('파이프라인 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 특정 프로젝트에 속한 모든 파이프라인 목록을 조회합니다.
   * @param projectID - 파이프라인을 조회할 프로젝트의 고유 ID
   * @returns Promise<void>
   * @description 조회된 파이프라인 목록을 availablePipelines 상태에 저장합니다.
   */
  const loadProjectPipelines = async (projectID: string) => {
    try {
      const result = await pipelineGetByProject(makeFetch(), projectID);
      setAvailablePipelines(result.pipelines || []);
    } catch (error) {
      console.error('파이프라인 목록 조회 실패:', error);
      setAvailablePipelines([]);
    }
  };

  /**
   * 현재 파이프라인을 실행합니다.
   * 파이프라인이 저장되지 않은 경우 자동으로 임시 파이프라인을 생성한 후 실행합니다.
   * @param projectID - 파이프라인을 실행할 프로젝트 ID (선택사항, 기본값은 currentProjectId)
   * @returns Promise<void>
   * @description YAML 내용과 프로젝트가 선택되어 있어야 실행 가능합니다.
   * @throws 파이프라인 실행에 실패하면 에러 메시지를 표시합니다.
   */
  const runPipeline = async (projectID?: string) => {
    if (!yamlText.trim()) {
      alert('YAML 내용이 비어있습니다.');
      return;
    }
    const pid = projectID ?? currentProjectId;
    if (!pid) {
      alert('프로젝트가 선택되지 않았습니다. 프로젝트를 먼저 생성/선택해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      let pipelineID = currentPipelineId;
      if (!pipelineID) {
        const created = await pipelineCreate(makeFetch(), {
          name: 'quick-run',
          yamlContent: yamlText,
          projectID: pid,
          version: 1,
        });
        pipelineID = created.pipelineID;
        setCurrentPipelineId(pipelineID);
        await loadProjectPipelines(pid);
      }

      await pipelineCreateRun(makeFetch(), pipelineID!, {});

      alert('파이프라인 실행을 시작했습니다.');
    } catch (error) {
      console.error('파이프라인 실행 실패:', error);
      alert('파이프라인 실행에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 Pipeline Builder 활성화
  useEffect(() => {
    setShowPipelineBuilder(true);

    // ✅ 사용자 프로젝트 조회 후 첫 프로젝트 선택 및 파이프라인 목록 로드
    (async () => {
      try {
        const projects = await projectGetUserProjects(makeFetch());
        if (projects.length > 0) {
          const recent = [...projects].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0]!;
          setCurrentProjectId(recent.projectID);
          await loadProjectPipelines(recent.projectID);
        } else {
          console.warn('사용자 프로젝트가 없습니다. 프로젝트를 먼저 생성하세요.');
        }
      } catch (error) {
        console.error('프로젝트 목록 조회 실패:', error);
      }
    })();

    // 컴포넌트 언마운트 시 Pipeline Builder 비활성화
    return () => {
      setShowPipelineBuilder(false);
    };
  }, [setShowPipelineBuilder]);

  return (
    <div className='relative'>
      {/* ✅ Floating Action Buttons - 레이아웃과 통일된 디자인 */}
      <div className='fixed top-4 right-4 z-50 flex items-center space-x-3'>
        <button
          onClick={handleRefresh}
          className='p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-sm hover:shadow-md'
          title='스크립트 내용 초기화'
        >
          <RotateCcw size={18} />
        </button>
        
        <button
          onClick={runPipeline}
          disabled={isLoading}
          className='p-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 disabled:text-gray-400 disabled:hover:bg-gray-50 rounded-lg transition-colors bg-white/90 backdrop-blur-sm border border-emerald-200/80 shadow-sm hover:shadow-md disabled:cursor-not-allowed'
          title='파이프라인 실행'
        >
          <Play size={18} />
        </button>
      </div>

      {/* ✅ 파이프라인 상태 정보 헤더 - 통일된 디자인 */}
      {currentPipelineId && (
        <div className='bg-gray-50 border-b border-gray-200 px-4 py-2'>
          <p className='text-sm text-gray-600'>
            현재 편집 중인 파이프라인 ID: {currentPipelineId}
          </p>
        </div>
      )}

      {/* ✅ 로딩 상태 표시 - 통일된 디자인 */}
      {isLoading && (
        <div className='bg-gray-50 border-b border-gray-200 px-4 py-2'>
          <p className='text-sm text-gray-600'>처리 중...</p>
        </div>
      )}

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        yamlText={yamlText}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDelete={handleEdgeDelete}
        onAddNode={handleAddNode}
        onYamlChange={handleYamlChange}
        onUpdateNodeEnvironment={handleUpdateNodeEnvironment}
        // ✅ SDK 기반 함수들 전달
        onSavePipeline={savePipeline}
        onLoadPipeline={loadPipeline}
        availablePipelines={availablePipelines}
        onRunPipeline={runPipeline}
      />
    </div>
  );
};

export default YamlFlowEditor;
