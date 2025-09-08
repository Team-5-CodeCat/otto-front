import { useState, useCallback, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  Edge,
  addEdge,
  Connection,
  NodeChange,
} from 'reactflow';
import { yamlToNodes, yamlToEdges, nodesToYaml } from './utils';
import { useNodeVersion } from '../../../contexts/NodeVersionContext';

export const usePipeline = () => {
  const { selectedVersion } = useNodeVersion();
  
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
    setNodes((currentNodes) => {
      const newNodes = yamlToNodes(yamlText, currentNodes);
      return newNodes;
    });
    const newEdges = yamlToEdges(yamlText);
    setEdges(newEdges);
  }, [yamlText, setNodes, setEdges]);

  // Node.js 버전이 변경될 때 YAML 텍스트의 node:20 부분을 업데이트
  useEffect(() => {
    setYamlText(prevYaml => {
      return prevYaml.replace(/image: node:\d+/g, `image: node:${selectedVersion}`);
    });
  }, [selectedVersion]);

  // 노드 변경사항을 처리하는 함수 (위치 변경 시에는 YAML을 업데이트하지 않음)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 노드 상태만 업데이트하고, YAML은 건드리지 않음
    // 노드의 시각적 위치와 YAML은 독립적으로 관리됨
    return changes;
  }, []);

  // 간선 연결 시 YAML 업데이트
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => {
        // addEdge가 자동으로 고유한 ID를 생성하도록 함
        const newEdges = addEdge(params, eds);

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
    [setEdges, setNodes, setYamlText]
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
    [setEdges, setNodes, setYamlText]
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
          image: nodeType === 'build' || nodeType === 'test' ? `node:${selectedVersion}` : 'ubuntu:22.04',
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
    [nodes.length, edges, setNodes, setYamlText, selectedVersion]
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
        const updatedNodes = currentNodes.map((node) => {
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

        // YAML도 업데이트
        setTimeout(() => {
          const newYaml = nodesToYaml(updatedNodes, edges);
          setYamlText(newYaml);
        }, 50);

        return updatedNodes;
      });
    },
    [edges, setNodes, setYamlText]
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
