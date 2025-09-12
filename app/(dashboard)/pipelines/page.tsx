'use client';

import React, { useEffect, useState } from 'react';
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

  // ✅ SDK를 사용한 파이프라인 저장
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

  // ✅ SDK를 사용한 파이프라인 로드
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

  // ✅ SDK를 사용한 프로젝트별 파이프라인 목록 조회
  const loadProjectPipelines = async (projectID: string) => {
    try {
      const result = await pipelineGetByProject(makeFetch(), projectID);
      setAvailablePipelines(result.pipelines || []);
    } catch (error) {
      console.error('파이프라인 목록 조회 실패:', error);
      setAvailablePipelines([]);
    }
  };

  // ✅ 실행: 저장 유무 확인 후 Run 호출
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
    <div>
      {/* ✅ 파이프라인 상태 정보 헤더 */}
      {currentPipelineId && (
        <div className='bg-emerald-50 border-b border-emerald-200 px-4 py-2'>
          <p className='text-sm text-emerald-800'>
            현재 편집 중인 파이프라인 ID: {currentPipelineId}
          </p>
        </div>
      )}

      {/* ✅ 로딩 상태 표시 */}
      {isLoading && (
        <div className='bg-emerald-50 border-b border-emerald-200 px-4 py-2'>
          <p className='text-sm text-emerald-800'>처리 중...</p>
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
