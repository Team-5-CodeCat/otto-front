import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, Edge, addEdge, Connection, NodeChange } from 'reactflow';
import { yamlToNodes, yamlToEdges, nodesToYaml } from './utils';

export const usePipeline = () => {
  // 기본 노드 버전 사용
  const selectedVersion = '18';

  // 업데이트 소스 추적용 ref
  const isUpdatingFromYaml = useRef(false);
  const isUpdatingFromNodes = useRef(false);

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

  commands: | 
    deploy.sh`);

  // React Flow 상태
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // YAML 텍스트가 변경될 때 노드와 간선을 업데이트
  useEffect(() => {
    if (!isUpdatingFromNodes.current) {
      isUpdatingFromYaml.current = true;
      setNodes((currentNodes) => {
        const newNodes = yamlToNodes(yamlText, currentNodes);
        return newNodes;
      });
      const newEdges = yamlToEdges(yamlText);
      setEdges(newEdges);
      // 다음 렌더 사이클에서 플래그 리셋
      setTimeout(() => {
        isUpdatingFromYaml.current = false;
      }, 0);
    }
  }, [yamlText, setNodes, setEdges]);

  // Node.js 버전이 변경될 때 YAML 텍스트의 node:20 부분을 업데이트
  useEffect(() => {
    setYamlText((prevYaml) => {
      return prevYaml.replace(/image: node:\d+/g, `image: node:${selectedVersion}`);
    });
  }, [selectedVersion]);

  // 노드나 간선이 변경될 때마다 YAML 업데이트 (수동 YAML 편집은 제외)
  useEffect(() => {
    if (!isUpdatingFromYaml.current) {
      isUpdatingFromNodes.current = true;
      const newYaml = nodesToYaml(nodes, edges);
      // 현재 YAML과 다른 경우에만 업데이트 (무한 루프 방지)
      setYamlText((currentYaml) => {
        const shouldUpdate = newYaml !== currentYaml;
        return shouldUpdate ? newYaml : currentYaml;
      });
      // 다음 렌더 사이클에서 플래그 리셋
      setTimeout(() => {
        isUpdatingFromNodes.current = false;
      }, 0);
    }
  }, [nodes, edges]);

  // 노드 변경사항을 처리하는 함수 (위치 변경 시에는 YAML을 업데이트하지 않음)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // React Flow의 onNodesChange를 직접 사용
      // 위치 변경은 시각적으로만 반영하고 YAML은 건드리지 않음
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // 간선 연결 시 YAML 업데이트
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // 간선 삭제 핸들러
  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
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
          name:
            nodeType === 'build'
              ? 'Build'
              : nodeType === 'test'
                ? 'Test'
                : nodeType === 'deploy'
                  ? 'Deploy'
                  : nodeType,
          image:
            nodeType === 'build' || nodeType === 'test'
              ? `node:${selectedVersion}`
              : 'ubuntu:22.04',
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
    },
    [nodes.length, setNodes, selectedVersion]
  );

  // YAML 텍스트 변경 핸들러
  const handleYamlChange = useCallback(
    (value: string) => {
      setYamlText(value);
    },
    [setYamlText]
  );

  // 노드 환경 변수 업데이트 핸들러
  const handleUpdateNodeEnvironment = useCallback(
    (nodeId: string, environment: Record<string, string>) => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                environment: environment,
              },
            };
          }
          return node;
        });
      });
    },
    [setNodes]
  );

  return {
    // 상태
    yamlText,
    setYamlText,
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,

    // 액션
    handleNodesChange,
    onConnect,
    handleEdgeDelete,
    handleAddNode,
    handleYamlChange,
    handleUpdateNodeEnvironment,
  };
};
