import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { PipelineNodeData } from './codegen';
import CustomNode from '../components/CustomNode';
import { NodeStatus } from '../components/NodeStatusIndicator';

// 초기 그래프: Start 노드 1개만 배치
const initialNodes: Node<PipelineNodeData>[] = [
  {
    id: 'start',
    position: { x: 50, y: 80 },
    data: { kind: 'start', label: 'Start' },
    type: 'customNode',
  },
];

export interface FlowEditorProps {
  onGraphChange?: (nodes: Node<PipelineNodeData>[], edges: Edge[]) => void;
  onGenerateFromScript?: (nodes: PipelineNodeData[]) => void;
}

// 실제 에디터 캔버스 컴포넌트 (Provider 내부에서만 동작)
function EditorCanvas({ onGraphChange, onGenerateFromScript }: FlowEditorProps) {
  // React Flow 상태 훅: 노드/엣지 배열과 변경 핸들러를 반환
  const [nodes, setNodes, onNodesChange] = useNodesState<PipelineNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 노드 상태 관리를 위한 상태
  const [isRunning, setIsRunning] = useState(false);

  // ReactFlow 인스턴스/좌표 변환에 사용
  const flowRef = useRef<HTMLDivElement>(null);
  const rf = useReactFlow();

  // nodeTypes를 메모이제이션하여 무한 루프 방지
  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // 고유한 엣지 ID 생성 함수
  const generateUniqueEdgeId = useCallback((sourceId: string, targetId: string) => {
    const baseId = `edge-${sourceId}-${targetId}`;
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${baseId}-${timestamp}-${random}`;
  }, []);

  // 상위(App)로 그래프 변경 통지
  useEffect(() => {
    if (onGraphChange) {
      onGraphChange(nodes, edges);
    }
  }, [nodes, edges, onGraphChange]);

  // 스크립트에서 생성된 노드들을 처리
  useEffect(() => {
    const handleScriptNodes = (scriptNodes: PipelineNodeData[]) => {
      console.log('Handling script nodes:', scriptNodes);

      // 기존 노드들 제거 (start 노드 제외)
      const startNode = nodes.find((n) => n.data.kind === 'start');
      const newNodes: Node<PipelineNodeData>[] = startNode ? [startNode] : [];

      // 스크립트에서 생성된 노드들을 순차적으로 추가
      scriptNodes.forEach((nodeData, index) => {
        if (nodeData.kind === 'start') return; // start 노드는 이미 있음

        const id = `${nodeData.kind}-${Date.now()}-${index}`;
        const position = { x: 100, y: 200 + index * 120 };
        const node: Node<PipelineNodeData> = {
          id,
          position,
          type: 'customNode',
          data: { ...nodeData, label: nodeData.label || (nodeData.kind ?? 'Unknown') },
        };
        newNodes.push(node);
      });

      console.log('Setting new nodes:', newNodes);
      setNodes(newNodes);

      // 노드들을 순차적으로 연결하는 엣지 생성
      const newEdges: Edge[] = [];
      for (let i = 0; i < newNodes.length - 1; i++) {
        const currentNode = newNodes[i];
        const nextNode = newNodes[i + 1];
        if (currentNode && nextNode) {
          newEdges.push({
            id: generateUniqueEdgeId(currentNode.id, nextNode.id),
            source: currentNode.id,
            target: nextNode.id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        }
      }
      console.log('Setting new edges:', newEdges);
      setEdges(newEdges);
    };

    // 전역 함수로 등록하여 외부에서 호출 가능하게 함
    (
      window as { generateNodesFromScript?: (nodes: PipelineNodeData[]) => void }
    ).generateNodesFromScript = handleScriptNodes;

    // 컴포넌트 언마운트 시 전역 함수 정리
    return () => {
      delete (window as any).generateNodesFromScript;
    };
  }, [setNodes, setEdges, generateUniqueEdgeId]);

  // 엣지 연결 시: 화살표와 애니메이션 추가
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((e) =>
        addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, e)
      );
    },
    [setEdges]
  );

  // 엣지 변경 처리 개선
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // 기본 엣지 변경 처리 먼저 실행
      onEdgesChange(changes);

      // 엣지 삭제 시 추가 처리
      const deletedEdges = changes.filter((change) => change.type === 'remove');

      if (deletedEdges.length > 0) {
        // 삭제 후 순서 라벨 재계산과 자동 연결을 위해 약간의 지연
        setTimeout(() => {
          // 현재 edges 상태를 다시 가져와서 순서 재계산
          setEdges((currentEdges) => {
            const byId = new Map(nodes.map((n) => [n.id, n]));
            const outgoing = new Map<string, string[]>();

            // 현재 엣지들로 순서 재계산
            currentEdges.forEach((e) => {
              if (!outgoing.has(e.source)) outgoing.set(e.source, []);
              outgoing.get(e.source)!.push(e.target);
            });

            const start = nodes.find((n) => n.data.kind === 'start');
            const ordered: string[] = [];

            if (start) {
              const visited = new Set<string>();
              let cursor: Node<PipelineNodeData> | undefined = start;

              while (cursor && !visited.has(cursor.id)) {
                ordered.push(cursor.id);
                visited.add(cursor.id);
                const nextIds = outgoing.get(cursor.id) || [];
                if (nextIds.length !== 1) break;
                const next = byId.get(nextIds[0]);
                if (!next) break;
                cursor = next;
              }
            }

            // 순서 매핑 재생성
            const orderMap = new Map<string, number>();
            for (let i = 0; i < ordered.length - 1; i++) {
              const key = `${ordered[i]}->${ordered[i + 1]}`;
              orderMap.set(key, i + 1);
            }

            // 엣지 라벨 업데이트
            return currentEdges.map((e) => {
              const key = `${e.source}->${e.target}`;
              const orderValue = orderMap.get(key);
              const label = orderValue !== undefined ? String(orderValue) : undefined;
              return { ...e, label };
            });
          });

          // 연결이 끊어진 노드들이 있으면 자동으로 연결
          setTimeout(() => {
            setEdges((currentEdges) => {
              const start = nodes.find((n) => n.data.kind === 'start');
              if (!start) return currentEdges;

              // 연결된 노드들 찾기
              const connectedNodes = new Set<string>([start.id]);
              currentEdges.forEach((edge) => {
                if (connectedNodes.has(edge.source)) {
                  connectedNodes.add(edge.target);
                }
              });

              // 연결되지 않은 노드들 찾기
              const disconnectedNodes = nodes
                .filter((n) => n.data.kind !== 'start' && !connectedNodes.has(n.id))
                .sort((a, b) => a.position.y - b.position.y);

              if (disconnectedNodes.length > 0) {
                // 마지막 연결된 노드 찾기
                let lastConnectedNode = start;
                currentEdges.forEach((edge) => {
                  if (edge.source === lastConnectedNode.id) {
                    const targetNode = nodes.find((n) => n.id === edge.target);
                    if (targetNode) lastConnectedNode = targetNode;
                  }
                });

                // 연결되지 않은 노드들을 순서대로 연결
                const newEdges = [...currentEdges];
                let currentNode = lastConnectedNode;

                disconnectedNodes.forEach((node, index) => {
                  const newEdge: Edge = {
                    id: generateUniqueEdgeId(currentNode.id, node.id),
                    source: currentNode.id,
                    target: node.id,
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    label: String(currentEdges.length + index + 1),
                  };
                  newEdges.push(newEdge);
                  currentNode = node;
                });

                return newEdges;
              }

              return currentEdges;
            });
          }, 50);
        }, 100); // 100ms 지연으로 상태 업데이트 완료 후 실행
      }
    },
    [nodes, onEdgesChange, setEdges, generateUniqueEdgeId]
  );

  // 팔레트 항목 → 사용자가 알아볼 라벨 생성
  const labelFor = (data: Partial<PipelineNodeData>): string => {
    switch (data.kind) {
      case 'git_clone':
        return 'Git Clone';
      case 'linux_install':
        return 'Linux Install';
      case 'prebuild_node':
        return `Prebuild Node (${data.manager ?? 'npm'})`;
      case 'prebuild_python':
        return 'Prebuild Python';
      case 'prebuild_java':
        return 'Prebuild Java';
      case 'prebuild_custom':
        return 'Prebuild Custom';
      case 'build_npm':
        return 'Build NPM';
      case 'build_python':
        return 'Build Python';
      case 'build_java':
        return 'Build Java';
      case 'docker_build':
        return 'Docker Build';
      case 'run_tests':
        return `Run Tests (${data.testType ?? ''})`;
      case 'deploy':
        return `Deploy (${data.environment ?? ''})`;
      case 'notify_slack':
        return 'Notify Slack';
      case 'start':
        return 'Start';
      default:
        return data.kind ?? 'Node';
    }
  };

  // 노드 추가(클릭/드롭 공용). 위치 미지정 시 간단한 세로 오프셋 배치
  const addNode = useCallback(
    (data: Partial<PipelineNodeData>, position?: { x: number; y: number }) => {
      setNodes((ns) => {
        const id = `${data.kind ?? 'unknown'}-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
        const pos = position ?? { x: 100, y: 200 + ns.length * 120 };
        const node: Node<PipelineNodeData> = {
          id,
          position: pos,
          type: 'customNode',
          data: { label: labelFor(data), ...(data as PipelineNodeData) },
        };
        return [...ns, node];
      });
    },
    [setNodes]
  );

  // 노드가 추가될 때마다 자동으로 엣지 생성
  useEffect(() => {
    if (nodes.length > 1) {
      const lastNode = nodes[nodes.length - 1];
      const secondLastNode = nodes[nodes.length - 2];

      // start 노드가 아닌 경우에만 이전 노드와 연결
      if (lastNode && lastNode.data.kind !== 'start' && secondLastNode) {
        // 이미 연결된 엣지가 있는지 확인
        const edgeExists = edges.some(
          (e) => e.source === secondLastNode.id && e.target === lastNode.id
        );

        if (!edgeExists) {
          const newEdge: Edge = {
            id: generateUniqueEdgeId(secondLastNode.id, lastNode.id),
            source: secondLastNode.id,
            target: lastNode.id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          };
          setEdges((es) => [...es, newEdge]);
        }
      }
    }
  }, [nodes, edges, setEdges, generateUniqueEdgeId]);

  // 좌측 팔레트 정의 (드래그&클릭으로 추가)
  const palette = useMemo(
    () => [
      {
        label: 'Git Clone',
        data: {
          kind: 'git_clone' as const,
          repoUrl: 'https://github.com/user/repo.git',
          branch: 'main',
        },
      },
      {
        label: 'Linux Install',
        data: { kind: 'linux_install' as const, osPkg: 'apt' as const, packages: 'git curl' },
      },
      { label: 'Prebuild Node', data: { kind: 'prebuild_node' as const, manager: 'npm' as const } },
      { label: 'Prebuild Python', data: { kind: 'prebuild_python' as const } },
      { label: 'Prebuild Java', data: { kind: 'prebuild_java' as const } },
      {
        label: 'Prebuild Custom',
        data: { kind: 'prebuild_custom' as const, script: 'echo "custom prebuild"' },
      },
      { label: 'Build NPM', data: { kind: 'build_npm' as const } },
      { label: 'Build Python', data: { kind: 'build_python' as const } },
      { label: 'Build Java', data: { kind: 'build_java' as const } },
      {
        label: 'Docker Build',
        data: { kind: 'docker_build' as const, dockerfile: 'Dockerfile', tag: 'myapp:latest' },
      },
      {
        label: 'Run Tests',
        data: { kind: 'run_tests' as const, testType: 'unit' as const, command: 'npm test' },
      },
      {
        label: 'Deploy',
        data: {
          kind: 'deploy' as const,
          environment: 'staging' as const,
          deployScript: './deploy.sh',
        },
      },
      {
        label: 'Notify Slack',
        data: {
          kind: 'notify_slack' as const,
          channel: '#deployments',
          message: 'Deployment completed!',
        },
      },
    ],
    []
  );

  // 선형 순서를 계산하여 엣지 라벨(1,2,3...)과 화살표를 갱신
  useEffect(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const outgoing = new Map<string, string[]>();
    edges.forEach((e) => {
      if (!outgoing.has(e.source)) outgoing.set(e.source, []);
      outgoing.get(e.source)!.push(e.target);
    });
    const start = nodes.find((n) => n.data.kind === 'start');
    const ordered: string[] = [];
    if (start) {
      const visited = new Set<string>();
      let cursor: Node<PipelineNodeData> | undefined = start;
      while (cursor && !visited.has(cursor.id)) {
        ordered.push(cursor.id);
        visited.add(cursor.id);
        const nextIds = outgoing.get(cursor.id) || [];
        if (nextIds.length !== 1) break;
        const next = byId.get(nextIds[0]);
        if (!next) break;
        cursor = next;
      }
    }

    const orderMap = new Map<string, number>();
    for (let i = 0; i < ordered.length - 1; i++) {
      orderMap.set(`${ordered[i]}->${ordered[i + 1]}`, i + 1);
    }

    let changed = false;
    const nextEdges = edges.map((e) => {
      const key = `${e.source}->${e.target}`;
      const label = orderMap.has(key) ? String(orderMap.get(key)) : undefined;
      const markerEnd = { type: MarkerType.ArrowClosed };
      const needUpdate =
        e.label !== label || JSON.stringify(e.markerEnd) !== JSON.stringify(markerEnd);
      if (needUpdate) {
        changed = true;
        return { ...e, label, markerEnd };
      }
      return e;
    });

    if (changed) setEdges(nextEdges);
    // 의존성: nodes/edges 변화 시 순서 라벨 재계산
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  // 워크플로우 실행 함수
  const runWorkflow = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);

    // start 노드를 제외한 모든 노드를 순서대로 실행
    const executionNodes = nodes.filter((node) => node.data.kind !== 'start');

    for (let i = 0; i < executionNodes.length; i++) {
      const node = executionNodes[i];
      if (!node) continue;

      // 노드 상태를 로딩으로 변경
      setNodes((ns) =>
        ns.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'loading' as NodeStatus } } : n
        )
      );

      // 시뮬레이션된 실행 시간 (실제로는 백엔드 API 호출)
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

      // 노드 상태를 성공으로 변경
      setNodes((ns) =>
        ns.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, status: 'success' as NodeStatus } } : n
        )
      );
    }

    setIsRunning(false);
  }, [nodes, setNodes, isRunning]);

  // 워크플로우 초기화 함수
  const resetWorkflow = useCallback(() => {
    setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        data: { ...n.data, status: 'initial' as NodeStatus },
      }))
    );
    setIsRunning(false);
  }, [setNodes]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setIsRunning(false);
  }, [setNodes, setEdges, initialNodes]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12, height: '100%' }}>
      <div style={{ borderRight: '1px solid rgba(255,255,255,.15)', paddingRight: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Palette</div>

        {/* 워크플로우 제어 버튼들 */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={runWorkflow}
            disabled={isRunning || nodes.length <= 1}
            style={{
              width: '100%',
              marginBottom: 8,
              padding: '8px 12px',
              backgroundColor: isRunning ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isRunning ? 0.6 : 1,
            }}
            title='워크플로우를 실행합니다'
          >
            {isRunning ? '🔄 실행 중...' : '▶️ 워크플로우 실행'}
          </button>

          <button
            onClick={resetWorkflow}
            disabled={isRunning}
            style={{
              width: '100%',
              marginBottom: 8,
              padding: '8px 12px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isRunning ? 0.6 : 1,
            }}
            title='워크플로우 상태를 초기화합니다'
          >
            🔄 상태 초기화
          </button>
        </div>

        <button
          onClick={resetFlow}
          style={{
            width: '100%',
            marginBottom: 16,
            padding: '8px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          title='모든 노드와 엣지를 지우고 초기 상태로 되돌립니다'
        >
          🗑️ 완전 초기화
        </button>
        {palette.map((p, idx) => (
          <button
            key={idx}
            draggable
            onDragStart={(e) => {
              // React Flow 드래그 페이로드 규약
              e.dataTransfer.setData('application/reactflow', JSON.stringify(p.data));
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => addNode(p.data)}
            style={{ width: '100%', textAlign: 'left', marginBottom: 6 }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div ref={flowRef} style={{ height: '100%', minHeight: 420, position: 'relative' }}>
        <ReactFlow
          style={{ width: '100%', height: '100%' }}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => {
            setTimeout(() => instance.fitView(), 0);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(e) => {
            e.preventDefault();
            const raw = e.dataTransfer.getData('application/reactflow');
            if (!raw) return;
            const data = JSON.parse(raw) as Partial<PipelineNodeData>;
            const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
            addNode(data, pos);
          }}
          selectionOnDrag
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background gap={16} size={1} />
          <Panel position='top-right'>
            <span style={{ opacity: 0.8 }}>
              노드 {nodes.length} / 엣지 {edges.length}
            </span>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

// Provider로 감싼 래퍼. useReactFlow 훅 사용을 가능하게 함
export default function FlowEditor({ onGraphChange, onGenerateFromScript }: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <EditorCanvas onGraphChange={onGraphChange} onGenerateFromScript={onGenerateFromScript} />
    </ReactFlowProvider>
  );
}
