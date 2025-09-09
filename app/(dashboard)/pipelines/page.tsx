'use client';

import React, { useEffect, useState } from 'react';
import { usePipeline } from './components/usePipeline';
import FlowCanvas from './components/FlowCanvas';
import { useUIStore } from '@/app/lib/uiStore';
import { useAuth } from '@/app/hooks/useAuth';
// ✅ SDK import 추가
import { pipelineCreate, pipelineGetById } from '@Team-5-CodeCat/otto-sdk/lib/functional/pipelines';
import { pipelineGetByProject } from '@Team-5-CodeCat/otto-sdk/lib/functional/pipelines/project';
import makeFetch from '@/app/lib/make-fetch';

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

  // 인증 상태 및 refresh token 함수 가져오기
  const { refreshToken, isAuthenticated } = useAuth();

  // ✅ SDK 관련 상태 추가
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null);
  const [availablePipelines, setAvailablePipelines] = useState<
    Array<{
      pipelineID: string;
      name: string;
      version: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SDK를 사용한 파이프라인 저장
  const savePipeline = async (name: string, projectID: string = 'temp-project-id') => {
    if (!yamlText.trim()) {
      alert('YAML 내용이 비어있습니다.');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const response = await pipelineCreate(makeFetch(), {
        name,
        yamlContent: yamlText,
        projectID,
        version: 1,
      });

      setCurrentPipelineId(response.pipelineID);
      alert(`파이프라인 "${response.name}"이 저장되었습니다!`);

      // 파이프라인 목록 새로고침
      await loadProjectPipelines(projectID);

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
  const loadProjectPipelines = async (projectID: string = 'temp-project-id') => {
    try {
      const result = await pipelineGetByProject(makeFetch(), projectID);
      setAvailablePipelines(result.pipelines || []);
    } catch (error) {
      console.error('파이프라인 목록 조회 실패:', error);
      setAvailablePipelines([]);
    }
  };

  // ✅ Refresh Token 전송 함수
  const sendRefreshToken = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      console.warn('사용자가 인증되지 않았습니다.');
      return false;
    }

    try {
      console.log('Refresh token 전송 중...');
      const success = await refreshToken();

      if (success) {
        console.log('Refresh token 전송 성공');
        return true;
      } else {
        console.error('Refresh token 전송 실패');
        return false;
      }
    } catch (error) {
      console.error('Refresh token 전송 중 오류 발생:', error);
      return false;
    }
  };

  // 컴포넌트 마운트 시 Pipeline Builder 활성화
  useEffect(() => {
    setShowPipelineBuilder(true);

    // ✅ 초기 파이프라인 목록 로드
    loadProjectPipelines();

    // ✅ 인증된 사용자인 경우 refresh token 전송
    if (isAuthenticated) {
      sendRefreshToken();
    }

    // 컴포넌트 언마운트 시 Pipeline Builder 비활성화
    return () => {
      setShowPipelineBuilder(false);
    };
  }, [setShowPipelineBuilder, isAuthenticated]);

  return (
    <div className='h-full'>
      {/* ✅ 파이프라인 상태 정보 헤더 */}
      {currentPipelineId && (
        <div className='bg-blue-50 border-b border-blue-200 px-4 py-2'>
          <p className='text-sm text-blue-800'>현재 편집 중인 파이프라인 ID: {currentPipelineId}</p>
        </div>
      )}

      {/* ✅ 로딩 상태 표시 */}
      {isLoading && (
        <div className='bg-yellow-50 border-b border-yellow-200 px-4 py-2'>
          <p className='text-sm text-yellow-800'>처리 중...</p>
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
      />
    </div>
  );
};

export default YamlFlowEditor;
