'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
  BackgroundVariant,
} from 'reactflow';
import { cn } from '@/lib/utils';
import AnimatedSection from './AnimatedSection';
import 'reactflow/dist/style.css';

// Node data interfaces
interface NodeData {
  title: string;
  subtitle: string;
  type?: 'build' | 'test' | 'deploy';
  hasNext?: boolean;
  isCompleted?: boolean;
}

// 커스텀 트리거 노드
const TriggerNode = ({ data }: { data: NodeData }) => (
  <div className='relative'>
    {data.isCompleted && (
      <div className='absolute -top-2 -right-2 bg-white text-emerald-600 border border-emerald-300 rounded-full text-[10px] px-2 py-0.5 shadow-sm font-semibold'>
        Completed
      </div>
    )}
    <div className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-5 rounded-xl shadow-lg border-2 border-blue-400'>
      <div className='flex items-center gap-4'>
        <div className='w-4 h-4 bg-green-400 rounded-full animate-pulse'></div>
        <div>
          <div className='font-semibold text-base'>{data.title}</div>
          <div className='text-sm opacity-90'>{data.subtitle}</div>
        </div>
      </div>
    </div>
    <Handle
      type='source'
      position={Position.Bottom}
      className='w-3 h-3 bg-blue-500 border-2 border-white'
    />
  </div>
);

// 커스텀 조건 노드
const ConditionNode = ({ data }: { data: NodeData }) => (
  <div className='relative'>
    {data.isCompleted && (
      <div className='absolute -top-2 -right-2 bg-white text-emerald-600 border border-emerald-300 rounded-full text-[10px] px-2 py-0.5 shadow-sm font-semibold'>
        Completed
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-3 h-3 bg-purple-500 border-2 border-white'
    />
    <div className='bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-5 rounded-xl shadow-lg border-2 border-purple-400'>
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div>
          <div className='font-semibold text-base'>{data.title}</div>
          <div className='text-sm opacity-90'>{data.subtitle}</div>
        </div>
      </div>
    </div>
    <Handle
      type='source'
      position={Position.Bottom}
      id='main'
      className='w-3 h-3 bg-purple-500 border-2 border-white'
      style={{ left: '30%' }}
    />
    <Handle
      type='source'
      position={Position.Bottom}
      id='alt'
      className='w-3 h-3 bg-purple-500 border-2 border-white'
      style={{ left: '70%' }}
    />
  </div>
);

// 커스텀 파이프라인 노드
const PipelineNode = ({ data }: { data: NodeData }) => (
  <div className='relative'>
    {data.isCompleted && (
      <div className='absolute -top-2 -right-2 bg-white text-emerald-600 border border-emerald-300 rounded-full text-[10px] px-2 py-0.5 shadow-sm font-semibold'>
        Completed
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-3 h-3 bg-emerald-500 border-2 border-white'
    />
    <div
      className={cn(
        'text-white px-8 py-5 rounded-xl shadow-lg border-2',
        data.type === 'build' &&
          'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
        data.type === 'test' && 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400',
        data.type === 'deploy' && 'bg-gradient-to-r from-indigo-500 to-indigo-600 border-indigo-400'
      )}
    >
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
          {data.type === 'build' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' />
            </svg>
          )}
          {data.type === 'test' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
          {data.type === 'deploy' && (
            <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
        <div>
          <div className='font-semibold text-base'>{data.title}</div>
          <div className='text-sm opacity-90'>{data.subtitle}</div>
        </div>
      </div>
    </div>
    {data.hasNext && (
      <Handle
        type='source'
        position={Position.Bottom}
        className={cn(
          'w-3 h-3 border-2 border-white',
          data.type === 'build' && 'bg-emerald-500',
          data.type === 'test' && 'bg-amber-500',
          data.type === 'deploy' && 'bg-indigo-500'
        )}
      />
    )}
  </div>
);

// 커스텀 결과 노드
const ResultNode = ({ data }: { data: NodeData }) => (
  <div className='relative'>
    {data.isCompleted && (
      <div className='absolute -top-2 -right-2 bg-white text-emerald-600 border border-emerald-300 rounded-full text-[10px] px-2 py-0.5 shadow-sm font-semibold'>
        Completed
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-3 h-3 bg-green-500 border-2 border-white'
    />
    <div className='bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-5 rounded-xl shadow-lg border-2 border-green-400'>
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div>
          <div className='font-semibold text-base'>{data.title}</div>
          <div className='text-sm opacity-90'>{data.subtitle}</div>
        </div>
      </div>
    </div>
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  pipeline: PipelineNode,
  result: ResultNode,
};

const PipelineFlowSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 엣지 도착 타이밍에 맞춰 순차적으로 Completed 표시 (반복 애니메이션)
  useEffect(() => {
    const sequence = ['trigger', 'condition', 'build', 'test', 'deploy'];
    let allTimeouts: number[] = [];
    const runAnimation = () => {
      // 이전 타이머들 정리
      allTimeouts.forEach((t) => clearTimeout(t));
      allTimeouts = [];

      // 초기화
      setCompletedNodes(new Set());

      // 순차적으로 completed 추가
      sequence.forEach((id, index) => {
        const delay = index * 1200; // 1.2초 간격으로 조금 더 여유있게
        const t = window.setTimeout(() => {
          setCompletedNodes((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }, delay);
        allTimeouts.push(t);
      });

      // 모든 애니메이션이 끝난 후 2초 대기 후 리셋
      const resetTimeout = window.setTimeout(
        () => {
          setCompletedNodes(new Set());
        },
        sequence.length * 1200 + 2000
      );
      allTimeouts.push(resetTimeout);
    };

    // 초기 실행
    runAnimation();

    // 주기적 반복 (총 사이클: 6초 애니메이션 + 2초 대기 + 2초 간격 = 10초)
    const intervalId = window.setInterval(() => {
      runAnimation();
    }, 10000);

    return () => {
      clearInterval(intervalId);
      allTimeouts.forEach((t) => clearTimeout(t));
    };
  }, [isMobile]);

  // 데스크톱용 노드 레이아웃
  const desktopNodes: Node[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 400, y: 0 },
      data: {
        title: 'Git Push 감지',
        subtitle: 'main 브랜치에 코드 푸시됨',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'condition',
      type: 'condition',
      position: { x: 350, y: 120 },
      data: {
        title: '조건 검사',
        subtitle: '브랜치 및 파일 변경 확인',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'build',
      type: 'pipeline',
      position: { x: 100, y: 260 },
      data: {
        title: 'Build',
        subtitle: '소스 코드 빌드',
        type: 'build',
        hasNext: true,
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'test',
      type: 'pipeline',
      position: { x: 100, y: 380 },
      data: {
        title: 'Test',
        subtitle: '자동화된 테스트 실행',
        type: 'test',
        hasNext: true,
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'deploy',
      type: 'pipeline',
      position: { x: 100, y: 500 },
      data: {
        title: 'Deploy',
        subtitle: '프로덕션 환경에 배포',
        type: 'deploy',
        hasNext: false,
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'skip',
      type: 'result',
      position: { x: 600, y: 260 },
      data: {
        title: '스킵됨',
        subtitle: '조건에 맞지 않아 실행되지 않음',
      },
      draggable: false,
      selectable: false,
    },
  ];

  // 모바일용 노드 레이아웃 (세로로 단순화)
  const mobileNodes: Node[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 50, y: 0 },
      data: {
        title: 'Git Push',
        subtitle: 'main 브랜치',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'condition',
      type: 'condition',
      position: { x: 30, y: 100 },
      data: {
        title: '조건 검사',
        subtitle: '변경사항 확인',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'build',
      type: 'pipeline',
      position: { x: 50, y: 220 },
      data: {
        title: 'Build',
        subtitle: '코드 빌드',
        type: 'build',
        hasNext: true,
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'test',
      type: 'pipeline',
      position: { x: 50, y: 320 },
      data: {
        title: 'Test',
        subtitle: '테스트 실행',
        type: 'test',
        hasNext: true,
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'deploy',
      type: 'pipeline',
      position: { x: 50, y: 420 },
      data: {
        title: 'Deploy',
        subtitle: '배포',
        type: 'deploy',
        hasNext: false,
      },
      draggable: false,
      selectable: false,
    },
  ];

  const desktopEdges: Edge[] = [
    {
      id: 'trigger-condition',
      source: 'trigger',
      target: 'condition',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    },
    {
      id: 'condition-build',
      source: 'condition',
      sourceHandle: 'main',
      target: 'build',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      label: 'success',
      labelStyle: { fill: '#10b981', fontWeight: 600 },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
    },
    {
      id: 'condition-skip',
      source: 'condition',
      sourceHandle: 'alt',
      target: 'skip',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6b7280', strokeWidth: 2, strokeDasharray: '5 5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
      label: 'fail',
      labelStyle: { fill: '#6b7280', fontWeight: 600 },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
    },
    {
      id: 'build-test',
      source: 'build',
      target: 'test',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    },
    {
      id: 'test-deploy',
      source: 'test',
      target: 'deploy',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    },
  ];

  const mobileEdges: Edge[] = [
    {
      id: 'trigger-condition',
      source: 'trigger',
      target: 'condition',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    },
    {
      id: 'condition-build',
      source: 'condition',
      sourceHandle: 'main',
      target: 'build',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    },
    {
      id: 'build-test',
      source: 'build',
      target: 'test',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#f59e0b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    },
    {
      id: 'test-deploy',
      source: 'test',
      target: 'deploy',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    },
  ];

  const baseNodes = isMobile ? mobileNodes : desktopNodes;
  const nodes = baseNodes.map((n) => ({
    ...n,
    data: { ...n.data, isCompleted: completedNodes.has(n.id) },
  }));
  const edges = isMobile ? mobileEdges : desktopEdges;

  return (
    <section className='py-20 bg-gradient-to-b from-gray-50 to-white'>
      <div className='w-full px-4 sm:px-6 lg:px-8'>
        <AnimatedSection>
          <div className='text-center mb-16'>
            <h2 className='text-3xl sm:text-4xl font-bold mb-4 text-gray-900'>
              <span className='bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent'>
                스마트한 파이프라인 자동화
              </span>
            </h2>
            <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
              트리거가 발생하면 Otto가 자동으로 조건을 판단하여 필요한 파이프라인만 실행합니다
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className='w-full max-w-none'>
            <div
              className={cn(
                'bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl border border-gray-200 p-4 w-full',
                isMobile ? 'h-[80vh] min-h-[800px]' : 'h-[85vh] min-h-[1000px]'
              )}
            >
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: isMobile ? 0.05 : 0.02,
                    includeHiddenNodes: false,
                    minZoom: isMobile ? 0.8 : 1.0,
                    maxZoom: isMobile ? 1.2 : 1.5,
                  }}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  preventScrolling={false}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color='#e5e7eb' gap={20} size={1} variant={BackgroundVariant.Dots} />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <div className='mt-12 grid md:grid-cols-3 gap-6'>
            <div className='text-center p-6 bg-blue-50 rounded-xl'>
              <div className='w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>지능형 트리거</h3>
              <p className='text-gray-600 text-sm'>
                Git Push, PR, 스케줄 등 다양한 이벤트를 감지하여 파이프라인을 자동으로 시작합니다
              </p>
            </div>

            <div className='text-center p-6 bg-purple-50 rounded-xl'>
              <div className='w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>조건부 실행</h3>
              <p className='text-gray-600 text-sm'>
                브랜치, 파일 변경사항, 시간 등의 조건을 확인하여 필요할 때만 파이프라인을 실행합니다
              </p>
            </div>

            <div className='text-center p-6 bg-emerald-50 rounded-xl'>
              <div className='w-12 h-12 bg-emerald-500 rounded-lg mx-auto mb-4 flex items-center justify-center'>
                <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <h3 className='font-semibold text-gray-900 mb-2'>순차적 실행</h3>
              <p className='text-gray-600 text-sm'>
                Build → Test → Deploy 단계를 순서대로 실행하며, 실패 시 자동으로 중단됩니다
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PipelineFlowSection;
