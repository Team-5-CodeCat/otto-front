'use client';

/**
 * 파이프라인 편집기 메인 페이지
 * 
 * 이 컴포넌트는 Block 기반의 JSON 파이프라인 시스템을 제공합니다.
 * 사용자는 시각적으로 파이프라인을 구성하고, 백그라운드에서는 JSON 형태로 저장됩니다.
 * 
 * 주요 기능:
 * 1. 시각적 파이프라인 편집 (React Flow)
 * 2. Block 기반 타입 시스템
 * 3. OS 패키지 매니저 선택 및 패키지 관리
 * 4. JSON 기반 저장/불러오기
 * 
 * 지원하는 Block 타입:
 * - OSBlock: OS 설정
 * - OSPackageBlock: OS 패키지 설치 (apt, yum, dnf, apk, zypper, pacman, brew)
 * - InstallNodePackageBlock: Node.js 패키지 설치
 * - CustomTestBlock: 테스트 명령어
 * - CustomCommandBlock: 사용자 정의 명령어
 * 
 * 사용법:
 * 1. 새 블록 추가:
 *    - handleAddNode(BlockType.CUSTOM_COMMAND): 커스텀 명령어 블록 생성
 *    - handleAddNode(BlockType.CUSTOM_TEST_BLOCK): 테스트 명령어 블록 생성
 *    - handleAddNode(BlockType.OS): OS 설정 블록 생성
 *    - handleAddNode(BlockType.OS_PACKAGE): OS 패키지 설치 블록 생성
 *    - handleAddNode(BlockType.INSTALL_MODULE_NODE): Node.js 패키지 설치 블록 생성
 * 
 * 2. 블록 편집:
 *    - OS 패키지 블록: Edit 버튼 클릭 → 패키지 매니저 선택 및 패키지 추가/제거
 *    - 다른 블록들: Environment 탭에서 환경변수 설정
 * 
 * 3. 연결 관리:
 *    - 블록 간 연결: 드래그&드롭으로 간선 생성
 *    - on_success: 성공 시 다음 블록 (필수)
 *    - on_failed: 실패 시 다음 블록 (선택적)
 * 
 * 4. 저장/불러오기:
 *    - 저장: 우상단 Save 버튼 → 파이프라인 이름 입력
 *    - 불러오기: 우상단 Folder 버튼 → 저장된 파이프라인 선택
 *    - 실행: 우상단 Play 버튼 → 파이프라인 즉시 실행
 */

import React, { useEffect, useState } from 'react';
import { usePipeline } from './components/usePipeline';
import FlowCanvas from './components/FlowCanvas';
import { useUIStore } from '@/app/lib/uiStore';
/*
import { projectGetUserProjects } from '@cooodecat/otto-sdk/lib/functional/projects';*/
import makeFetch from '@/app/lib/make-fetch';
/*import { pipelineCreate, pipelineGetById } from '@cooodecat/otto-sdk/lib/functional/pipelines';
import { pipelineGetByProject } from '@cooodecat/otto-sdk/lib/functional/pipelines/project';
import { pipelineCreateRun } from '@cooodecat/otto-sdk/lib/functional/pipelines/runs';*/

const JsonFlowEditor = () => {
  // 파이프라인 상태 및 액션 관리
  const {
    jsonText,
    nodes,
    edges,
    onEdgesChange,
    handleNodesChange,
    onConnect,
    handleEdgeDelete,
    handleAddNode,
    handleJsonChange,
    handleUpdateNodeEnvironment,
    handleUpdateBlock,
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
    if (!jsonText.trim() || jsonText.trim() === '[]') {
      alert('JSON 내용이 비어있습니다.');
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
        yamlContent: jsonText, // JSON을 yamlContent로 전송 (백엔드 API 호환성)
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
        handleJsonChange(pipeline.originalSpec);
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
    if (!jsonText.trim() || jsonText.trim() === '[]') {
      alert('JSON 내용이 비어있습니다.');
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
          yamlContent: jsonText, // JSON을 yamlContent로 전송 (백엔드 API 호환성)
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
        jsonText={jsonText}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDelete={handleEdgeDelete}
        onAddNode={handleAddNode}
        onJsonChange={handleJsonChange}
        onUpdateNodeEnvironment={handleUpdateNodeEnvironment}
        onUpdateBlock={handleUpdateBlock}
        // ✅ SDK 기반 함수들 전달
        onSavePipeline={savePipeline}
        onLoadPipeline={loadPipeline}
        availablePipelines={availablePipelines}
        onRunPipeline={runPipeline}
      />
    </div>
  );
};

export default JsonFlowEditor;
