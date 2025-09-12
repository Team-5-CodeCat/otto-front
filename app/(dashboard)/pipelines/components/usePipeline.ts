/**
 * usePipeline Hook
 * 
 * 파이프라인 편집기의 모든 상태와 로직을 관리하는 커스텀 훅입니다.
 * Block 기반 JSON 시스템과 React Flow의 시각적 인터페이스를 연결합니다.
 * 
 * 주요 기능:
 * - 상태 동기화: JSON ↔ React Flow 노드/간선 양방향 동기화
 * - 블록 관리: 블록 추가, 수정, 삭제
 * - 연결 관리: 블록 간 연결 생성 및 삭제
 * - 환경 변수: 노드별 환경 변수 설정
 * - 무한 루프 방지: 업데이트 플래그로 순환 업데이트 차단
 * 
 * 아키텍처:
 * - JSON이 단일 진실 소스(Single Source of Truth)
 * - useEffect로 JSON → React Flow 동기화
 * - 콜백으로 React Flow → JSON 동기화
 * - ref를 사용한 업데이트 플래그로 무한 루프 방지
 * 
 * 기본 블록:
 * - 3개의 연결된 CUSTOM_COMMAND 블록으로 시작
 * - npm ci & build → npm test → deploy.sh 순서
 * - crypto.randomUUID()로 고유 ID 생성
 * 
 * 반환값:
 * - 상태: jsonText, nodes, edges 등
 * - 액션: handleAddNode, handleUpdateBlock, onConnect 등
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, Edge, addEdge, Connection, NodeChange } from 'reactflow';
import { blocksToNodes, blocksToEdges, nodesToBlocks, jsonToBlocks, blocksToJson } from './utils';
import { AnyBlock, BlockType, CustomCommandBlock } from './types';
// crypto.randomUUID() 사용 (브라우저 네이티브)

export const usePipeline = () => {
  // 기본 노드 버전 사용

  // 업데이트 소스 추적용 ref
  const isUpdatingFromJson = useRef(false);
  const isUpdatingFromNodes = useRef(false);

  // 기본 블록들 - on_success는 체인 형태로 연결
  const block1Id = crypto.randomUUID();
  const block2Id = crypto.randomUUID();
  const block3Id = crypto.randomUUID();

  const defaultBlocks: AnyBlock[] = [
    {
      type: BlockType.CUSTOM_COMMAND,
      block_id: block1Id,
      commands: ['npm ci', 'npm run build'],
      on_success: block2Id, // 다음 블록으로 연결
    },
    {
      type: BlockType.CUSTOM_COMMAND,
      block_id: block2Id,
      commands: ['npm test'],
      on_success: block3Id, // 다음 블록으로 연결
    },
    {
      type: BlockType.CUSTOM_COMMAND,
      block_id: block3Id,
      commands: ['deploy.sh'],
      on_success: '', // 마지막 블록은 빈 문자열
    },
  ];

  // JSON 텍스트 상태 - 이것이 우리의 단일 진실 소스입니다
  const [jsonText, setJsonText] = useState(blocksToJson(defaultBlocks));

  // React Flow 상태
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // JSON 텍스트가 변경될 때 노드와 간선을 업데이트
  useEffect(() => {
    if (!isUpdatingFromNodes.current) {
      isUpdatingFromJson.current = true;
      const blocks = jsonToBlocks(jsonText);
      setNodes((currentNodes) => {
        const newNodes = blocksToNodes(blocks, currentNodes);
        return newNodes;
      });
      const newEdges = blocksToEdges(blocks);
      setEdges(newEdges);
      // 다음 렌더 사이클에서 플래그 리셋
      setTimeout(() => {
        isUpdatingFromJson.current = false;
      }, 0);
    }
  }, [jsonText, setNodes, setEdges]);

  // Node.js 버전이 변경될 때는 일단 제거 (Block 시스템에서는 직접 관리)

  // 노드나 간선이 변경될 때마다 JSON 업데이트 (수동 JSON 편집은 제외)
  useEffect(() => {
    if (!isUpdatingFromJson.current) {
      isUpdatingFromNodes.current = true;
      const blocks = nodesToBlocks(nodes, edges);
      const newJson = blocksToJson(blocks);
      // 현재 JSON과 다른 경우에만 업데이트 (무한 루프 방지)
      setJsonText((currentJson) => {
        const shouldUpdate = newJson !== currentJson;
        return shouldUpdate ? newJson : currentJson;
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

  // 블록 추가 핸들러 (드래그 앤 드롭 지원)
  const handleAddNode = useCallback(
    (blockType: BlockType | string, position?: { x: number; y: number }) => {
      let newBlock: AnyBlock;
      
      switch (blockType) {
        case BlockType.OS_PACKAGE:
          newBlock = {
            type: BlockType.OS_PACKAGE,
            block_id: crypto.randomUUID(),
            package_manager: 'apt',
            install_packages: ['curl', 'wget'],
            on_success: '', // 새 블록은 연결되지 않은 상태로 시작
          };
          break;
        case BlockType.OS:
          newBlock = {
            type: BlockType.OS,
            block_id: crypto.randomUUID(),
            os_name: 'ubuntu:22.04',
            on_success: '',
          };
          break;
        case BlockType.INSTALL_MODULE_NODE:
          newBlock = {
            type: BlockType.INSTALL_MODULE_NODE,
            block_id: crypto.randomUUID(),
            package_manager: 'npm',
            install_packages: ['express', 'lodash'],
            on_success: '',
          };
          break;
        case BlockType.CUSTOM_TEST_BLOCK:
          newBlock = {
            type: BlockType.CUSTOM_TEST_BLOCK,
            block_id: crypto.randomUUID(),
            commands: ['npm test', 'npm run test:coverage'],
            on_success: '',
          };
          break;
        case BlockType.CUSTOM_COMMAND:
        default:
          // 기존 문자열 호환성을 위해 유지
          const isLegacyString = typeof blockType === 'string' && !Object.values(BlockType).includes(blockType as BlockType);
          newBlock = {
            type: BlockType.CUSTOM_COMMAND,
            block_id: crypto.randomUUID(),
            commands: isLegacyString
              ? blockType === 'build'
                ? ['npm ci', 'npm run build']
                : blockType === 'test'
                  ? ['npm test']
                  : blockType === 'deploy'
                    ? ['deploy.sh']
                    : ['echo "Hello World"']
              : ['echo "Custom command"'],
            on_success: '', // 새 블록은 연결되지 않은 상태로 시작
          };
          break;
      }

      const newNode = {
        id: newBlock.block_id,
        type: 'blockNode',
        position: position || {
          x: 300,
          y: 100 + nodes.length * 150,
        },
        data: newBlock,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  // JSON 텍스트 변경 핸들러
  const handleJsonChange = useCallback(
    (value: string) => {
      setJsonText(value);
    },
    [setJsonText]
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

  // 블록 업데이트 핸들러
  const handleUpdateBlock = useCallback(
    (blockId: string, updatedBlock: AnyBlock) => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          if (node.id === blockId) {
            return {
              ...node,
              data: updatedBlock,
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
    jsonText,
    setJsonText,
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
    handleJsonChange,
    handleUpdateNodeEnvironment,
    handleUpdateBlock,
  };
};
