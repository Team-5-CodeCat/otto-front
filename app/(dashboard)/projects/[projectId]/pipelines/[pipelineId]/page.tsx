'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Save, Settings } from 'lucide-react';
import FlowCanvas from '@/app/(dashboard)/pipelines/components/FlowCanvas';
import { usePipeline } from '@/app/(dashboard)/pipelines/components/usePipeline';
import { useUIStore } from '@/app/lib/uiStore';

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
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = usePipeline();
  
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

  const handleSave = async () => {
    try {
      // TODO: 파이프라인 저장 로직
      console.log('Saving pipeline...', { projectId, pipelineId, nodes, edges });
    } catch (error) {
      console.error('Failed to save pipeline:', error);
    }
  };

  const handleRun = async () => {
    try {
      // TODO: 파이프라인 실행 로직
      console.log('파이프라인 실행 중...', { projectId, pipelineId });
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">파이프라인을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* 헤더 바 - 캔버스 상단에 고정 */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* 왼쪽: 뒤로가기 및 파이프라인 정보 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/projects/${projectId}/pipelines`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="파이프라인으로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{pipelineName}</h1>
              <p className="text-sm text-gray-500">Project {projectId}</p>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {}} // setTab 메서드가 UI 스토어에 없으므로 빈 함수로 대체
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            
            <button
              onClick={handleRun}
              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>실행</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 캔버스 - 전체 화면 사용 */}
      <div className="w-full h-full pt-16">
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          jsonText=""
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