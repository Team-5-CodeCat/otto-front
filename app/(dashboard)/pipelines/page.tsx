'use client';

import React from 'react';
import { usePipeline } from './components/usePipeline';
import FlowCanvas from './components/FlowCanvas';

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
