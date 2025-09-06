'use client';

import React, { useEffect } from 'react';
import { usePipeline } from './components/usePipeline';
import FlowCanvas from './components/FlowCanvas';
import { useUIStore } from '@/app/lib/uiStore';

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

  // 컴포넌트 마운트 시 Pipeline Builder 활성화
  useEffect(() => {
    setShowPipelineBuilder(true);
    
    // 컴포넌트 언마운트 시 Pipeline Builder 비활성화
    return () => {
      setShowPipelineBuilder(false);
    };
  }, [setShowPipelineBuilder]);

  return (
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
    />
  );
};

export default YamlFlowEditor;
