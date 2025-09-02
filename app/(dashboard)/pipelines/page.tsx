'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { addEdge, useNodesState, useEdgesState, Connection, Edge, NodeChange } from 'reactflow';
import NodePalette from './components/NodePalette';
import FlowCanvas from './components/FlowCanvas';
import RightPanel from './components/RightPanel';
import { yamlToNodes, yamlToEdges, nodesToYaml } from './components/utils';

const YamlFlowEditor = () => {
  // YAML 텍스트 상태 - 이것이 우리의 단일 진실 소스입니다
  const [yamlText, setYamlText] = useState(`- name: build
  image: node:20
  commands: |
    npm ci
    npm run build
    
- name: test
  image: node:20
  dependencies:
    - build
  commands: |
    npm test
    
- name: deploy 
  image: ubuntu:22.04
  dependencies:
    - test
  environment: 
    hello: 1234
    hi: 1234
  commands: | 
    deploy.sh`);

  // React Flow 상태
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // YAML 텍스트가 변경될 때 노드와 간선을 업데이트
  useEffect(() => {
    setNodes((currentNodes) => {
      const newNodes = yamlToNodes(yamlText, currentNodes);
      return newNodes;
    });
    const newEdges = yamlToEdges(yamlText);
    setEdges(newEdges);
  }, [yamlText, setNodes, setEdges]);

  // 노드 변경사항을 처리하는 함수 (위치 변경 시에는 YAML을 업데이트하지 않음)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 노드 상태만 업데이트하고, YAML은 건드리지 않음
      // 노드의 시각적 위치와 YAML은 독립적으로 관리됨
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // 간선 연결 시 YAML 업데이트
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, type: 'custom-edge' }, eds);

        // 간선이 추가되면 YAML을 업데이트 (노드 위치는 변경하지 않음)
        setTimeout(() => {
          setNodes((currentNodes) => {
            const newYaml = nodesToYaml(currentNodes, newEdges);
            setYamlText(newYaml);
            return currentNodes; // 노드 위치는 그대로 유지
          });
        }, 50);

        return newEdges;
      });
    },
    [setEdges, setNodes]
  );

  // 간선 삭제 핸들러
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => {
        const newEdges = eds.filter((edge) => edge.id !== edgeId);

        // 간선이 삭제되면 YAML을 업데이트 (노드 위치는 변경하지 않음)
        setTimeout(() => {
          setNodes((currentNodes) => {
            const newYaml = nodesToYaml(currentNodes, newEdges);
            setYamlText(newYaml);
            return currentNodes; // 노드 위치는 그대로 유지
          });
        }, 50);

        return newEdges;
      });
    },
    [setEdges, setNodes]
  );

  // 노드 추가 핸들러 (드래그 앤 드롭 지원)
  const handleAddNode = useCallback(
    (nodeType: string, position?: { x: number; y: number }) => {
      const newNodeIndex = nodes.length;
      const newNode = {
        id: `job-${newNodeIndex}`,
        type: 'jobNode',
        position: position || {
          x: 300, // 고정된 x 좌표 (중앙)
          y: 100 + newNodeIndex * 150, // 세로로 순차 배치 (150px 간격)
        },
        data: {
          name: nodeType,
          image: nodeType === 'build' || nodeType === 'test' ? 'node:20' : 'ubuntu:22.04',
          commands:
            nodeType === 'build'
              ? 'npm ci\nnpm run build'
              : nodeType === 'test'
                ? 'npm test'
                : 'deploy.sh',
          environment: nodeType === 'deploy' ? { NODE_ENV: 'production' } : undefined,
          originalIndex: newNodeIndex,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      // YAML도 업데이트
      setTimeout(() => {
        setNodes((currentNodes) => {
          const newYaml = nodesToYaml(currentNodes, edges);
          setYamlText(newYaml);
          return currentNodes;
        });
      }, 50);
    },
    [nodes.length, edges, setNodes, nodesToYaml, setYamlText]
  );

  // YAML 텍스트 변경 핸들러
  const handleYamlChange = useCallback((value: string) => {
    setYamlText(value);
  }, []);

  return (
    <>
      {/* 대시보드 레이아웃을 벗어나서 전체 화면 사용 */}
      <div
        className='absolute inset-0 flex bg-gray-100 overflow-hidden z-10'
        style={{
          position: 'fixed',
          top: 0,
          left: '256px', // 사이드바 너비만큼 왼쪽 여백
          right: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* 왼쪽 패널 - 노드 팔레트 */}
        <NodePalette onAddNode={handleAddNode} />

        {/* 중앙 영역 - 플로우 캔버스 */}
        <div className='flex-1 min-w-0 flex flex-col relative'>
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDelete={handleEdgeDelete}
            onAddNode={handleAddNode}
          />
        </div>

        {/* 오른쪽 패널 - YAML 편집기 */}
        <RightPanel yamlText={yamlText} onYamlChange={handleYamlChange} />
      </div>
    </>
  );
};

export default YamlFlowEditor;
