import { Node, Edge } from 'reactflow';
import * as YAML from 'yaml';
import { JobNodeData, JobYaml } from './types';

/**
 * 노드 이름을 표시용 형태로 변환 (첫글자 대문자)
 */
const toDisplayName = (name: string): string => {
  const normalized = name.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

/**
 * 노드 이름을 YAML용 형태로 변환 (소문자)
 */
const toYamlName = (name: string): string => {
  return name.toLowerCase();
};

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
          x: 300, // 고정된 x 좌표 (중앙)
          y: 100 + index * 150, // 세로로 순차 배치 (150px 간격)
        },
        data: {
          name: toDisplayName(job.name || `Job ${index + 1}`),
          image: job.image || 'unknown',
          commands: job.commands || '',
          environment: job.environment,
          originalIndex: index, // 원본 YAML에서의 순서를 저장
        } as JobNodeData,
      };
    });
  } catch (error) {
    console.error('YAML 파싱 오류:', error);
    // 빈 배열 대신 기본 노드를 반환하여 UI가 완전히 비워지는 것을 방지
    return existingNodes || [];
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
    let edgeCounter = 0; // 고유한 엣지 ID를 위한 카운터

    // 각 job의 dependencies를 간선으로 변환
    parsed.forEach((job, targetIndex) => {
      if (job.dependencies && Array.isArray(job.dependencies)) {
        job.dependencies.forEach((depName: string) => {
          // 의존성 job의 인덱스 찾기
          const sourceIndex = parsed.findIndex((j: JobYaml) => j.name === depName);
          if (sourceIndex !== -1) {
            edges.push({
              id: `edge-${edgeCounter++}`, // 고유한 순차 ID 사용
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
    // 빈 배열을 반환하여 간선 연결이 초기화됨을 명시
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
        name: toYamlName(node.data.name),
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
        // dependencies도 소문자로 변환
        job.dependencies = dependencies.map(dep => toYamlName(dep)).sort(); // 알파벳 순으로 정렬하여 일관성 유지
      }

      return job;
    });

  // jobs 배열이 비어있으면 빈 문자열 반환
  if (jobs.length === 0) {
    return '';
  }

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
