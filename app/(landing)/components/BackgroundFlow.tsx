'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import { cn } from '@/lib/utils';
import 'reactflow/dist/style.css';

// Node data interface
interface NodeData {
  title: string;
  subtitle?: string;
  type?: 'trigger' | 'condition' | 'build' | 'test' | 'deploy' | 'skip';
}

// 커스텀 트리거 노드 (Attio 스타일)
const TriggerNode = ({
  data,
  isActive,
  isCompleted,
}: {
  data: NodeData;
  isActive?: boolean;
  isCompleted?: boolean;
}) => (
  <div className='relative' style={{ width: '200px', height: '60px' }}>
    {/* 완료 배지 - Attio 스타일 */}
    {isCompleted && (
      <div className='absolute -top-3 -right-3 z-20'>
        {/* 연결선 */}
        <div className='absolute top-full left-1/2 w-px h-3 bg-[#E6E7EA] transform -translate-x-1/2'></div>

        {/* 배지 */}
        <div className='bg-[#DDF9E4] border border-[#C7F4D3] rounded-lg px-2.5 py-1.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <svg className='w-3 h-3 text-[#0B935D]' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-[#0B935D] text-xs font-medium'>Completed</span>
          </div>
        </div>
      </div>
    )}
    {/* 메인 카드 */}
    <div
      className={`h-full w-full bg-white border rounded-xl shadow-sm transition-all duration-500 ${
        isActive ? 'border-[#407FF2] shadow-lg scale-105 shadow-blue-200/50' : 'border-[#E6E7EA]'
      }`}
    >
      <div className='flex flex-col h-full px-3 py-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-1.5'>
            <div
              className={`w-5 h-5 bg-[#E5EEFF] border border-[#D6E5FF] rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <div
                className={`w-2 h-2 bg-[#407FF2] rounded-full ${isActive ? 'animate-pulse' : ''}`}
              ></div>
            </div>
            <span className='text-sm font-medium text-gray-900'>{data.title}</span>
          </div>
          <div className='px-1.5 py-px text-xs bg-[#F4F5F6] border border-[#EEEFF1] rounded text-[#5C5E63]'>
            Trigger
          </div>
        </div>
      </div>
    </div>

    <Handle
      type='source'
      position={Position.Bottom}
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ bottom: '-4px' }}
    />
  </div>
);

// 커스텀 조건 노드 (Attio 스타일)
const ConditionNode = ({
  data,
  isActive,
  isCompleted,
}: {
  data: NodeData;
  isActive?: boolean;
  isCompleted?: boolean;
}) => (
  <div className='relative' style={{ width: '180px', height: '60px' }}>
    {/* 완료 배지 - Attio 스타일 */}
    {isCompleted && (
      <div className='absolute -top-3 -right-3 z-20'>
        {/* 연결선 */}
        <div className='absolute top-full left-1/2 w-px h-3 bg-[#E6E7EA] transform -translate-x-1/2'></div>

        {/* 배지 */}
        <div className='bg-[#DDF9E4] border border-[#C7F4D3] rounded-lg px-2.5 py-1.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <svg className='w-3 h-3 text-[#0B935D]' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-[#0B935D] text-xs font-medium'>Completed</span>
          </div>
        </div>
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ top: '-4px' }}
    />

    {/* 메인 카드 */}
    <div
      className={`h-full w-full bg-white border rounded-xl shadow-sm transition-all duration-500 ${
        isActive ? 'border-[#8B5CF6] shadow-lg scale-105 shadow-purple-200/50' : 'border-[#E6E7EA]'
      }`}
    >
      <div className='flex flex-col h-full px-3 py-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-1.5'>
            <div
              className={`w-5 h-5 bg-[#E5EEFF] border border-[#D6E5FF] rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                <path
                  d='M7.00013 8.66666L7.00013 6.16664C7.00013 5.83822 6.6717 5.66666 6.50011 5.66666V5.66666C6.32854 5.66666 6.0001 5.99507 6.0001 6.16664L6 7.33332M7.00013 8.66666L6.66689 7.9999M7.00013 8.66666L7.33337 7.9999'
                  stroke='#407FF2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M5.9999 8.66666L5.9999 6.16664C5.9999 5.83822 5.3283 5.66666 5.4999 5.66666V5.66666C5.6715 5.66666 5.99988 5.99507 5.99991 6.16664L5.99996 7.33332M5.9999 8.66666L6.3331 7.9999M5.9999 8.66666L5.6666 7.9999'
                  stroke='#407FF2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <span className='text-sm font-medium text-gray-900'>{data.title}</span>
          </div>
          <div className='px-1.5 py-px text-xs bg-[#F4F5F6] border border-[#EEEFF1] rounded text-[#5C5E63]'>
            Condition
          </div>
        </div>
      </div>
    </div>

    <Handle
      type='source'
      position={Position.Bottom}
      id='left'
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ left: '30%', bottom: '-4px' }}
    />
    <Handle
      type='source'
      position={Position.Bottom}
      id='right'
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ left: '70%', bottom: '-4px' }}
    />
  </div>
);

// 커스텀 파이프라인 노드 (Attio 스타일)
const PipelineNode = ({
  data,
  isActive,
  isCompleted,
}: {
  data: NodeData;
  isActive?: boolean;
  isCompleted?: boolean;
}) => (
  <div className='relative' style={{ width: '190px', height: '60px' }}>
    {/* 완료 배지 - Attio 스타일 */}
    {isCompleted && (
      <div className='absolute -top-3 -right-3 z-20'>
        {/* 연결선 */}
        <div className='absolute top-full left-1/2 w-px h-3 bg-[#E6E7EA] transform -translate-x-1/2'></div>

        {/* 배지 */}
        <div className='bg-[#DDF9E4] border border-[#C7F4D3] rounded-lg px-2.5 py-1.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <svg className='w-3 h-3 text-[#0B935D]' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-[#0B935D] text-xs font-medium'>Completed</span>
          </div>
        </div>
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ top: '-4px' }}
    />

    {/* 메인 카드 */}
    <div
      className={`h-full w-full bg-white border rounded-xl shadow-sm transition-all duration-500 ${
        isActive ? 'border-[#10B981] shadow-lg scale-105 shadow-emerald-200/50' : 'border-[#E6E7EA]'
      }`}
    >
      <div className='flex flex-col h-full px-3 py-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-1.5'>
            <div
              className={cn(
                'w-5 h-5 border rounded-lg flex items-center justify-center transition-all duration-300',
                data.type === 'build' && 'bg-[#E5F7F0] border-[#C7F4D3]',
                data.type === 'test' && 'bg-[#FFF4E5] border-[#FFE4B5]',
                data.type === 'deploy' && 'bg-[#E5EEFF] border-[#D6E5FF]',
                isActive && 'scale-110'
              )}
            >
              {data.type === 'build' && (
                <svg width='12' height='12' fill='none'>
                  <path d='M2 3h8M2 6h8M2 9h8' stroke='#0B935D' strokeLinecap='round' />
                </svg>
              )}
              {data.type === 'test' && (
                <svg width='12' height='12' fill='none'>
                  <path
                    d='M2 6l2 2 4-4'
                    stroke='#B45309'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
              {data.type === 'deploy' && (
                <svg width='12' height='12' fill='none'>
                  <path
                    d='M6 2v8m0 0l3-3m-3 3L3 7'
                    stroke='#407FF2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </div>
            <span className='text-sm font-medium text-gray-900'>{data.title}</span>
          </div>
          <div className='px-1.5 py-px text-xs bg-[#F4F5F6] border border-[#EEEFF1] rounded text-[#5C5E63]'>
            {data.type === 'build' && 'Build'}
            {data.type === 'test' && 'Test'}
            {data.type === 'deploy' && 'Deploy'}
          </div>
        </div>
      </div>
    </div>

    <Handle
      type='source'
      position={Position.Bottom}
      className='w-2 h-2 bg-[#407FF2] border border-white'
      style={{ bottom: '-4px' }}
    />
  </div>
);

// 커스텀 스킵 노드 (Attio 스타일)
const SkipNode = ({
  data,
  isActive,
  isCompleted,
}: {
  data: NodeData;
  isActive?: boolean;
  isCompleted?: boolean;
}) => (
  <div className='relative opacity-60' style={{ width: '160px', height: '60px' }}>
    {/* 완료 배지 - Attio 스타일 */}
    {isCompleted && (
      <div className='absolute -top-3 -right-3 z-20'>
        {/* 연결선 */}
        <div className='absolute top-full left-1/2 w-px h-3 bg-[#E6E7EA] transform -translate-x-1/2'></div>

        {/* 배지 */}
        <div className='bg-[#DDF9E4] border border-[#C7F4D3] rounded-lg px-2.5 py-1.5 shadow-sm'>
          <div className='flex items-center gap-1.5'>
            <svg className='w-3 h-3 text-[#0B935D]' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='text-[#0B935D] text-xs font-medium'>Completed</span>
          </div>
        </div>
      </div>
    )}
    <Handle
      type='target'
      position={Position.Top}
      className='w-2 h-2 bg-[#9CA3AF] border border-white'
      style={{ top: '-4px' }}
    />

    {/* 메인 카드 - 비활성화된 스타일 */}
    <div
      className={`h-full w-full bg-white border rounded-xl shadow-sm transition-all duration-500 ${
        isActive ? 'border-[#F59E0B] shadow-lg scale-105 shadow-orange-200/50' : 'border-[#E6E7EA]'
      }`}
    >
      <div className='flex flex-col h-full px-3 py-3'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-1.5'>
            <div
              className={`w-5 h-5 bg-[#F4F5F6] border border-[#EEEFF1] rounded-lg flex items-center justify-center transition-all duration-300 ${
                isActive ? 'scale-110' : ''
              }`}
            >
              <svg width='12' height='12' fill='none'>
                <path d='M3 3l6 6M9 3l-6 6' stroke='#9CA3AF' strokeLinecap='round' />
              </svg>
            </div>
            <span className='text-sm font-medium text-[#9CA3AF]'>{data.title}</span>
          </div>
          <div className='px-1.5 py-px text-xs bg-[#F4F5F6] border border-[#EEEFF1] rounded text-[#9CA3AF]'>
            Notify
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BackgroundFlow: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());

  // 노드 순서 정의
  const nodeOrder = useMemo(() => ['trigger', 'condition', 'build', 'test', 'deploy'], []);

  // 현재 활성 노드 계산
  const getCurrentActiveNode = () => nodeOrder[currentStepIndex];
  const isNodeActive = (nodeId: string) => getCurrentActiveNode() === nodeId;

  // 동적 nodeTypes (활성 상태 및 완료 상태 전달)
  const nodeTypes = {
    trigger: (props: { data: NodeData; id: string }) => (
      <TriggerNode
        {...props}
        isActive={isNodeActive('trigger')}
        isCompleted={completedNodes.has('trigger')}
      />
    ),
    condition: (props: { data: NodeData; id: string }) => (
      <ConditionNode
        {...props}
        isActive={isNodeActive('condition')}
        isCompleted={completedNodes.has('condition')}
      />
    ),
    pipeline: (props: { data: NodeData; id: string }) => (
      <PipelineNode
        {...props}
        isActive={isNodeActive(props.id)}
        isCompleted={completedNodes.has(props.id)}
      />
    ),
    skip: (props: { data: NodeData; id: string }) => (
      <SkipNode
        {...props}
        isActive={isNodeActive('skip')}
        isCompleted={completedNodes.has('skip')}
      />
    ),
  };

  // 자동 진행 애니메이션
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIndex = (prev + 1) % nodeOrder.length;

        // 이전 노드를 완료 상태로 추가
        if (prev < nodeOrder.length) {
          const prevNodeId = nodeOrder[prev];
          if (prevNodeId) {
            setCompletedNodes((completed) => {
              const newCompleted = new Set(completed);
              newCompleted.add(prevNodeId);
              return newCompleted;
            });
          }
        }

        // 사이클이 완료되면 완료 상태 초기화
        if (nextIndex === 0) {
          setTimeout(() => {
            setCompletedNodes(new Set());
          }, 1000); // 1초 후 초기화
        }

        return nextIndex;
      });
    }, 2500); // 2.5초마다 다음 단계로

    return () => clearInterval(interval);
  }, [isAutoPlaying, nodeOrder]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 엣지가 활성 상태인지 확인하는 함수
  const isEdgeActive = (sourceIndex: number, targetIndex: number) => {
    return currentStepIndex >= targetIndex;
  };

  // 데스크톱용 트리거 기반 플로우 노드 (Otto 타이틀을 위해 아래쪽으로 이동)
  const desktopNodes: Node[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 200, y: 120 },
      data: {
        title: 'Git Push 감지',
        type: 'trigger',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'condition',
      type: 'condition',
      position: { x: 210, y: 220 },
      data: {
        title: '조건 검사',
        type: 'condition',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'build',
      type: 'pipeline',
      position: { x: 50, y: 320 },
      data: {
        title: 'Build',
        type: 'build',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'test',
      type: 'pipeline',
      position: { x: 50, y: 400 },
      data: {
        title: 'Test',
        type: 'test',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'deploy',
      type: 'pipeline',
      position: { x: 50, y: 480 },
      data: {
        title: 'Deploy',
        type: 'deploy',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'skip',
      type: 'skip',
      position: { x: 420, y: 320 },
      data: {
        title: 'Notify',
        type: 'skip',
      },
      draggable: false,
      selectable: false,
    },
  ];

  // 모바일용 간단한 세로 플로우 노드
  const mobileNodes: Node[] = [
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 10, y: 100 },
      data: {
        title: 'Git Push',
        type: 'trigger',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'condition',
      type: 'condition',
      position: { x: 20, y: 190 },
      data: {
        title: '조건 검사',
        type: 'condition',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'build',
      type: 'pipeline',
      position: { x: 5, y: 280 },
      data: {
        title: 'Build',
        type: 'build',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'test',
      type: 'pipeline',
      position: { x: 5, y: 360 },
      data: {
        title: 'Test',
        type: 'test',
      },
      draggable: false,
      selectable: false,
    },
    {
      id: 'deploy',
      type: 'pipeline',
      position: { x: 5, y: 440 },
      data: {
        title: 'Deploy',
        type: 'deploy',
      },
      draggable: false,
      selectable: false,
    },
  ];

  // 데스크톱용 트리거 기반 엣지 (Attio 스타일)
  const desktopEdges: Edge[] = [
    {
      id: 'trigger-condition',
      source: 'trigger',
      target: 'condition',
      type: 'smoothstep',
      animated: isEdgeActive(0, 1),
      style: {
        stroke: isEdgeActive(0, 1) ? '#54D490' : '#E5E7EB',
        strokeWidth: isEdgeActive(0, 1) ? 3 : 2,
        strokeDasharray: '4 4',
        opacity: isEdgeActive(0, 1) ? 1 : 0.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEdgeActive(0, 1) ? '#0FC27B' : '#9CA3AF',
      },
    },
    {
      id: 'condition-build',
      source: 'condition',
      sourceHandle: 'left',
      target: 'build',
      type: 'smoothstep',
      animated: isEdgeActive(1, 2),
      style: {
        stroke: isEdgeActive(1, 2) ? '#54D490' : '#E5E7EB',
        strokeWidth: isEdgeActive(1, 2) ? 3 : 2,
        strokeDasharray: '4 4',
        opacity: isEdgeActive(1, 2) ? 1 : 0.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEdgeActive(1, 2) ? '#0FC27B' : '#9CA3AF',
      },
      label: 'sucess',
      labelStyle: {
        fill: isEdgeActive(1, 2) ? '#0B935D' : '#9CA3AF',
        fontWeight: 600,
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      labelBgStyle: {
        fill: isEdgeActive(1, 2) ? '#DDF9E4' : '#F9FAFB',
        fillOpacity: 0.9,
      },
    },
    {
      id: 'condition-skip',
      source: 'condition',
      sourceHandle: 'right',
      target: 'skip',
      type: 'smoothstep',
      animated: false, // Skip은 항상 비활성
      style: {
        stroke: '#D1D3D6',
        strokeWidth: 2,
        strokeDasharray: '6 6',
        opacity: 0.5,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#9CA3AF' },
      label: 'fail',
      labelStyle: {
        fill: '#6B7280',
        fontWeight: 500,
        fontSize: '11px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      labelBgStyle: {
        fill: '#F9FAFB',
        fillOpacity: 0.9,
      },
    },
    {
      id: 'build-test',
      source: 'build',
      target: 'test',
      type: 'smoothstep',
      animated: isEdgeActive(2, 3),
      style: {
        stroke: isEdgeActive(2, 3) ? '#54D490' : '#E5E7EB',
        strokeWidth: isEdgeActive(2, 3) ? 3 : 2,
        strokeDasharray: '4 4',
        opacity: isEdgeActive(2, 3) ? 1 : 0.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEdgeActive(2, 3) ? '#0FC27B' : '#9CA3AF',
      },
    },
    {
      id: 'test-deploy',
      source: 'test',
      target: 'deploy',
      type: 'smoothstep',
      animated: isEdgeActive(3, 4),
      style: {
        stroke: isEdgeActive(3, 4) ? '#54D490' : '#E5E7EB',
        strokeWidth: isEdgeActive(3, 4) ? 3 : 2,
        strokeDasharray: '4 4',
        opacity: isEdgeActive(3, 4) ? 1 : 0.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEdgeActive(3, 4) ? '#0FC27B' : '#9CA3AF',
      },
    },
  ];

  // 모바일용 간단한 세로 엣지
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
      sourceHandle: 'left',
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

  const nodes = isMobile ? mobileNodes : desktopNodes;
  const edges = isMobile ? mobileEdges : desktopEdges;

  return (
    <ReactFlowProvider>
      <div
        className={cn(
          'w-screen relative -mx-4 sm:-mx-6 lg:-mx-8',
          isMobile ? 'h-[500px]' : 'h-[600px]'
        )}
      >
        {/* 심플한 그리드 배경 */}
        <div className='absolute inset-0 pointer-events-none opacity-30'>
          <svg width='100%' height='100%' className='text-gray-300'>
            <defs>
              <pattern id='simple-grid' width='24' height='24' patternUnits='userSpaceOnUse'>
                <circle cx='2' cy='2' r='1' fill='currentColor' opacity='0.2' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#simple-grid)' />
          </svg>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: isMobile ? 0.05 : 0.02,
            includeHiddenNodes: false,
            minZoom: isMobile ? 1.0 : 1.2,
            maxZoom: isMobile ? 1.4 : 1.8,
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
          onPaneClick={() => {
            // 클릭 시 자동 재생 토글
            setIsAutoPlaying(!isAutoPlaying);
          }}
        >
          <Background color='transparent' />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default BackgroundFlow;
