import { Node, Edge } from 'reactflow';
import * as YAML from 'yaml';
import { JobNodeData, JobYaml } from './types';

/**
 * YAML 문자열을 파싱하여 React Flow 노드로 변환
 * 기존 노드가 있으면 위치를 보존함
 */
export const yamlToNodes = (yamlString: string, existingNodes?: Node[]): Node[] => {
  try {
    const parsed = YAML.parse(yamlString);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // 기존 노드 위치 맵 생성
    const existingPositions = new Map<string, { x: number; y: number }>();
    if (existingNodes) {
      existingNodes.forEach((node) => {
        existingPositions.set(node.id, node.position);
      });
    }

    // 각 작업을 노드로 변환합니다
    return parsed.map((job, index) => {
      const nodeId = `job-${index}`;
      const existingPosition = existingPositions.get(nodeId);

      return {
        id: nodeId,
        type: 'jobNode',
        position: existingPosition || {
          x: 50 + index * 300, // 기본값으로 가로 배치 (기존 위치가 없을 때만)
          y: 100,
        },
        data: {
          name: job.name || `Job ${index + 1}`,
          image: job.image || 'unknown',
          commands: job.commands || '',
          environment: job.environment,
          originalIndex: index, // 원본 YAML에서의 순서를 저장
        } as JobNodeData,
      };
    });
  } catch (error) {
    console.error('YAML 파싱 오류:', error);
    return [];
  }
};

/**
 * YAML 문자열을 파싱하여 React Flow 간선으로 변환
 */
export const yamlToEdges = (yamlString: string): Edge[] => {
  try {
    const parsed = YAML.parse(yamlString);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const edges: Edge[] = [];

    // 각 job의 dependencies를 간선으로 변환
    parsed.forEach((job, targetIndex) => {
      if (job.dependencies && Array.isArray(job.dependencies)) {
        job.dependencies.forEach((depName: string) => {
          // 의존성 job의 인덱스 찾기
          const sourceIndex = parsed.findIndex((j: any) => j.name === depName);
          if (sourceIndex !== -1) {
            edges.push({
              id: `edge-${sourceIndex}-${targetIndex}`,
              source: `job-${sourceIndex}`,
              target: `job-${targetIndex}`,
              type: 'custom-edge',
              animated: true,
            });
          }
        });
      }
    });

    return edges;
  } catch (error) {
    console.error('YAML 간선 파싱 오류:', error);
    return [];
  }
};

/**
 * React Flow 노드들과 간선들을 YAML 문자열로 변환
 * 간선 연결 순서에 따라 dependencies를 설정하여 YAML 순서 유지
 */
export const nodesToYaml = (nodeList: Node[], edgeList: Edge[]): string => {
  // 간선 정보를 기반으로 dependencies 맵 생성
  const dependenciesMap = new Map<string, string[]>();

  edgeList.forEach((edge) => {
    const targetNode = nodeList.find((n) => n.id === edge.target);
    const sourceNode = nodeList.find((n) => n.id === edge.source);

    if (targetNode && sourceNode) {
      const targetName = targetNode.data.name;
      const sourceName = sourceNode.data.name;

      if (!dependenciesMap.has(targetName)) {
        dependenciesMap.set(targetName, []);
      }
      dependenciesMap.get(targetName)?.push(sourceName);
    }
  });

  const jobs = nodeList
    .filter((node) => node.type === 'jobNode') // job 노드만 필터링
    .sort((a, b) => {
      // originalIndex가 있으면 원본 순서로 정렬, 없으면 x 좌표로 정렬
      const aIndex = a.data.originalIndex ?? a.position.x;
      const bIndex = b.data.originalIndex ?? b.position.x;
      return aIndex - bIndex;
    })
    .map((node) => {
      const job: JobYaml = {
        name: node.data.name,
        image: node.data.image,
      };

      // 환경 변수가 있다면 추가
      if (node.data.environment) {
        job.environment = node.data.environment;
      }

      // 커맨드 추가
      if (node.data.commands) {
        job.commands = node.data.commands;
      }

      // dependencies 추가 (간선이 있는 경우)
      const dependencies = dependenciesMap.get(node.data.name);
      if (dependencies && dependencies.length > 0) {
        job.dependencies = dependencies.sort(); // 알파벳 순으로 정렬하여 일관성 유지
      }

      return job;
    });

  const yamlString = YAML.stringify(jobs, {
    indent: 2, // 들여쓰기 2칸
    lineWidth: 0, // 긴 줄도 자동으로 줄바꿈하지 않음
  });

  // 각 job 항목 사이에 빈 줄을 추가하여 가독성 개선
  return yamlString.replace(/^- name:/gm, (match, offset) => {
    // 첫 번째 항목이 아닌 경우에만 앞에 빈 줄 추가
    return offset === 0 ? match : '\n' + match;
  });
};
