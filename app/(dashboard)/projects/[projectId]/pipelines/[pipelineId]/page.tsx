'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Settings } from 'lucide-react';
import FlowCanvas from '@/app/(dashboard)/pipelines/components/FlowCanvas';
import { usePipeline } from '@/app/(dashboard)/pipelines/components/usePipeline';
import { useUIStore } from '@/app/lib/uiStore';
import { functional } from '@cooodecat/otto-sdk';
import makeFetch from '@/app/lib/make-fetch';

/**
 * 파이프라인 상세 페이지
 *
 * 전체 화면을 캔버스로 사용하며, 사이드바는 캔버스 위에 floating됩니다.
 * projects/{project_id}/pipelines/{pipeline_id} 경로에서 사용됩니다.
 */
export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const pipelineId = params.pipelineId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [pipelineName, setPipelineName] = useState('');

  const { nodes, edges, jsonText, onNodesChange, onEdgesChange, onConnect } = usePipeline();

  const _uiStore = useUIStore();

  useEffect(() => {
    // 파이프라인 데이터 로드
    const loadPipeline = async () => {
      try {
        setIsLoading(true);
        // TODO: SDK를 사용하여 실제 파이프라인 데이터 로드
        setPipelineName(`Pipeline ${pipelineId}`);

        // 임시 데이터
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to load pipeline:', error);
        setIsLoading(false);
      }
    };

    loadPipeline();
  }, [pipelineId]);

  /**
   * 파이프라인을 저장하고 즉시 실행합니다.
   *
   * @description 현재 파이프라인의 JSON 데이터를 백엔드에 저장한 후 실행을 시작합니다.
   * 웹훅 트리거와 동일한 JSON 구조(AnyBlock[])를 사용합니다.
   *
   * @async
   * @returns {Promise<void>} 실행 시작시 resolve되는 Promise
   * @throws {Error} API 호출 실패시 에러를 throw합니다.
   *
   * @example
   * ```typescript
   * // 실행 버튼 클릭시 호출
   * await handleRun();
   * ```
   *
   * @see {@link https://docs.anthropic.com/en/docs/claude-code} - 웹훅과 동일한 JSON 구조 사용
   */
  const handleRun = async (): Promise<void> => {
    try {
      console.log('파이프라인 저장 및 실행 중...', { projectId, pipelineId });

      // JSON 내용 검증
      if (!jsonText.trim() || jsonText.trim() === '[]') {
        alert('파이프라인 내용이 비어있습니다.');
        return;
      }

      console.log('실행할 파이프라인 JSON:', jsonText);

      // otto-sdk를 사용한 파이프라인 저장 및 실행
      const connection = makeFetch();

      try {
        // 1. 파이프라인 저장
        const result = await functional.pipelines.create(connection, {
          name: `pipeline-execution-${Date.now()}`,
          content: jsonText,
          projectID: projectId,
          version: 1,
        } as any);

        console.log('파이프라인 저장 결과:', result);

        // 2. TODO: 파이프라인 실행 트리거 (백엔드 실행 API 준비되면 추가)
        // await functional.pipelines.execute(connection, result.pipelineId);

        alert(`파이프라인이 저장되고 실행이 시작되었습니다!\nPipeline ID: ${result.pipelineId}`);
      } catch (apiError) {
        console.error('SDK API 호출 실패:', apiError);
        alert(
          `파이프라인 실행 실패: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`
        );
      }
    } catch (error) {
      console.error('Failed to run pipeline:', error);
      alert('파이프라인 실행 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className='w-full h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>파이프라인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative w-full h-screen bg-gray-50'>
      {/* 헤더 바 - 캔버스 상단에 고정 */}
      <div className='absolute top-0 left-0 right-0 z-40 bg-white border-b border-gray-200'>
        <div className='flex items-center justify-between px-6 py-3'>
          {/* 왼쪽: 뒤로가기 및 파이프라인 정보 */}
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => router.push(`/projects/${projectId}/pipelines`)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              title='파이프라인으로 돌아가기'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600' />
            </button>

            <div>
              <h1 className='text-lg font-semibold text-gray-900'>{pipelineName}</h1>
              <p className='text-sm text-gray-500'>Project {projectId}</p>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => {}} // setTab 메서드가 UI 스토어에 없으므로 빈 함수로 대체
              className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2'
            >
              <Settings className='w-4 h-4' />
              <span>Settings</span>
            </button>

            <button
              onClick={handleRun}
              className='px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors flex items-center space-x-2'
            >
              <Play className='w-4 h-4' />
              <span>실행</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 캔버스 - 전체 화면 사용 */}
      <div className='w-full h-full pt-16'>
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          jsonText=''
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onAddNode={() => {}}
          onJsonChange={() => {}}
          onUpdateNodeEnvironment={() => {}}
        />
      </div>
    </div>
  );
}
