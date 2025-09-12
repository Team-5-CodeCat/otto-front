/**
 * 파이프라인 유틸리티 함수들
 * 
 * Block 기반 JSON 시스템과 React Flow 간의 데이터 변환을 담당하는 유틸리티 함수들입니다.
 * usePipeline 훅에서 상태 동기화를 위해 사용됩니다.
 * 
 * 주요 변환 함수:
 * - blocksToNodes: Block 배열 → React Flow Node 배열
 * - blocksToEdges: Block 배열 → React Flow Edge 배열  
 * - nodesToBlocks: React Flow Node/Edge 배열 → Block 배열
 * - blocksToJson: Block 배열 → JSON 문자열
 * - jsonToBlocks: JSON 문자열 → Block 배열
 * 
 * 데이터 플로우:
 * JSON ←→ Block[] ←→ {Node[], Edge[]} ←→ React Flow
 * 
 * 위치 보존:
 * - 기존 노드 위치는 blocksToNodes에서 preservePosition으로 유지
 * - 새 노드는 y = 100 + index * 150으로 세로 정렬
 * 
 * 연결 관리:
 * - on_success/on_failed를 React Flow Edge로 변환
 * - success: 실선, failed: 점선(빨간색)
 * - Edge condition으로 연결 타입 구분
 */

import { Node, Edge } from 'reactflow';
import { AnyBlock } from './types';

/**
 * Block들을 React Flow 노드로 변환
 * 
 * Block 배열을 받아서 React Flow에서 사용할 수 있는 Node 배열로 변환합니다.
 * 기존 노드의 위치 정보를 보존하여 사용자가 이동한 노드가 리셋되지 않도록 합니다.
 * 
 * @param blocks - 변환할 Block 배열
 * @param existingNodes - 위치 보존을 위한 기존 Node 배열 (선택적)
 * @returns React Flow Node 배열
 * 
 * 위치 규칙:
 * - 기존 노드: 이전 위치 유지
 * - 새 노드: x=300, y=100+index*150 (세로 정렬)
 * 
 * 노드 구조:
 * - id: block.block_id
 * - type: 'blockNode' (JobNode 컴포넌트 사용)
 * - data: Block 객체 전체
 */
export const blocksToNodes = (blocks: AnyBlock[], existingNodes?: Node[]): Node[] => {
  // 기존 노드 위치 맵 생성
  const existingPositions = new Map<string, { x: number; y: number }>();
  if (existingNodes) {
    existingNodes.forEach((node) => {
      existingPositions.set(node.id, node.position);
    });
  }

  return blocks.map((block, index) => {
    const existingPosition = existingPositions.get(block.block_id);

    return {
      id: block.block_id,
      type: 'blockNode',
      position: existingPosition || {
        x: 300,
        y: 100 + index * 150,
      },
      data: block,
    };
  });
};

/**
 * Block들의 on_success/on_failed 관계를 React Flow 간선으로 변환
 * 
 * Block의 연결 정보(on_success, on_failed)를 읽어서 React Flow Edge 배열로 변환합니다.
 * 각 연결 타입에 따라 다른 시각적 스타일을 적용합니다.
 * 
 * @param blocks - 연결 정보를 읽을 Block 배열
 * @returns React Flow Edge 배열
 * 
 * 간선 타입별 스타일:
 * - success 간선: 실선, 애니메이션, 기본 색상
 * - failed 간선: 점선, 빨간색(#ef4444), 애니메이션
 * 
 * Edge 구조:
 * - id: 'edge-{counter}' (고유 식별자)
 * - source: 출발 블록 ID
 * - target: 도착 블록 ID
 * - type: 'custom-edge' (CustomEdge 컴포넌트 사용)
 * - data.condition: 'success' | 'failed' (연결 타입)
 */
export const blocksToEdges = (blocks: AnyBlock[]): Edge[] => {
  const edges: Edge[] = [];
  let edgeCounter = 0;

  blocks.forEach((block) => {
    // success 간선
    if (block.on_success) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        source: block.block_id,
        target: block.on_success,
        type: 'custom-edge',
        animated: true,
        data: { condition: 'success' },
      });
    }

    // failed 간선
    if (block.on_failed) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        source: block.block_id,
        target: block.on_failed,
        type: 'custom-edge',
        animated: true,
        data: { condition: 'failed' },
        style: { strokeDasharray: '5,5', stroke: '#ef4444' },
      });
    }
  });

  return edges;
};

/**
 * React Flow 노드들과 간선들을 Block 배열로 변환
 * 
 * React Flow에서 사용자가 편집한 노드와 간선 정보를 다시 Block 배열로 변환합니다.
 * 간선의 condition 정보를 읽어서 on_success/on_failed 관계를 재구성합니다.
 * 
 * @param nodeList - React Flow Node 배열
 * @param edgeList - React Flow Edge 배열
 * @returns Block 배열
 * 
 * 변환 로직:
 * 1. 간선들을 순회하여 각 노드의 연결 관계 맵 생성
 * 2. edge.data.condition으로 success/failed 구분
 * 3. 'blockNode' 타입 노드만 필터링하여 Block으로 변환
 * 4. on_success는 필수이므로 기본값 제공
 * 5. on_failed는 선택적이므로 값이 있을 때만 설정
 * 
 * 주의사항:
 * - condition이 없는 간선은 기본적으로 success로 처리
 * - on_success가 없는 블록은 빈 문자열로 설정 (파이프라인 종료)
 */
export const nodesToBlocks = (nodeList: Node[], edgeList: Edge[]): AnyBlock[] => {
  // 간선 정보를 기반으로 연결 관계 맵 생성
  const connectionMap = new Map<string, { on_success?: string; on_failed?: string }>();

  edgeList.forEach((edge) => {
    if (!connectionMap.has(edge.source)) {
      connectionMap.set(edge.source, {});
    }
    
    const connections = connectionMap.get(edge.source)!;
    const condition = edge.data?.condition;
    
    if (condition === 'success') {
      connections.on_success = edge.target;
    } else if (condition === 'failed') {
      connections.on_failed = edge.target;
    } else {
      // 기본적으로 success로 처리
      connections.on_success = edge.target;
    }
  });

  return nodeList
    .filter((node) => node.type === 'blockNode')
    .map((node) => {
      const block = node.data as AnyBlock;
      const connections = connectionMap.get(node.id) || {};
      
      // on_success는 필수이므로 기본값 제공
      const on_success = connections.on_success || block.on_success || '';
      
      const result: AnyBlock = {
        ...block,
        on_success,
      };
      
      // on_failed는 optional이므로 값이 있을 때만 설정
      if (connections.on_failed) {
        result.on_failed = connections.on_failed;
      }
      
      return result;
    });
};

/**
 * Block 배열을 JSON 문자열로 변환
 * 
 * Block 배열을 JSON 형태의 문자열로 직렬화합니다.
 * 2칸 들여쓰기로 가독성 있는 형태로 포맷팅됩니다.
 * 
 * @param blocks - JSON으로 변환할 Block 배열
 * @returns 포맷팅된 JSON 문자열
 * 
 * 용도:
 * - 파이프라인 저장 시 Otto SDK로 전송
 * - 사용자에게 JSON 형태로 표시 (현재는 숨김)
 * - 디버깅 및 로깅
 */
export const blocksToJson = (blocks: AnyBlock[]): string => {
  return JSON.stringify(blocks, null, 2);
};

/**
 * JSON 문자열을 Block 배열로 변환
 * 
 * JSON 문자열을 파싱하여 Block 배열로 변환합니다.
 * 파싱 오류나 유효하지 않은 형식에 대해 안전하게 처리합니다.
 * 
 * @param jsonString - 파싱할 JSON 문자열
 * @returns Block 배열 (오류 시 빈 배열)
 * 
 * 안전성:
 * - JSON.parse 오류를 catch하여 빈 배열 반환
 * - 배열이 아닌 경우 빈 배열 반환
 * - 콘솔에 파싱 오류 로그 출력
 * 
 * 용도:
 * - Otto SDK에서 불러온 파이프라인 데이터 파싱
 * - 사용자가 JSON을 직접 편집했을 때 동기화
 * - 기본 파이프라인 데이터 로딩
 */
export const jsonToBlocks = (jsonString: string): AnyBlock[] => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as AnyBlock[];
  } catch (error) {
    console.error('JSON 파싱 오류:', error);
    return [];
  }
};
