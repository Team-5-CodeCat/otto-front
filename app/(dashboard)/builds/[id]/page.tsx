'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Loader,
  AlertCircle,
  GitBranch,
  User,
  Calendar,
  ExternalLink,
  Timer,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';

interface LogEntry {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
  timestamp: string;
}

interface JobStep {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: string;
  details?: string[];
  logs?: LogEntry[];
}

interface Job {
  id: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: string;
  steps: JobStep[];
}

interface BuildInfo {
  id: string;
  title: string;
  branch: string;
  commit: string;
  author: string;
  startTime: string;
  endTime?: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  jobs: Job[];
}

const BuildDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const buildId = params.id as string;

  const [buildData, setBuildData] = useState<BuildInfo | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<{ [key: string]: boolean }>({
    'setup-node': true,
  });
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    // 실제 데이터 로딩 시뮬레이션
    const mockBuildData: BuildInfo = {
      id: buildId,
      title: 'feat: CI/CD 로그 페이지 구현',
      branch: 'feat/cicd-logs',
      commit: 'e4f5g6h',
      author: 'developer',
      startTime: '2025-01-08 10:30:00',
      endTime: '2025-01-08 10:32:30',
      status: 'running',
      jobs: [
        {
          id: 'test',
          name: 'test',
          status: 'completed',
          duration: '2m 30s',
          steps: [],
        },
        {
          id: 'deploy',
          name: 'deploy',
          status: 'running',
          duration: '11s',
          steps: [
            {
              id: 'set-up-job',
              name: 'Set up job',
              status: 'completed',
              duration: '2s',
              logs: [
                {
                  id: '1',
                  message: 'Setting up job environment...',
                  level: 'info',
                  timestamp: '10:30:01',
                },
                {
                  id: '2',
                  message: 'Job environment ready',
                  level: 'success',
                  timestamp: '10:30:03',
                },
              ],
            },
            {
              id: 'run-actions-checkout',
              name: 'Run actions/checkout@v3',
              status: 'completed',
              duration: '0s',
              logs: [
                {
                  id: '3',
                  message: 'Checking out repository...',
                  level: 'info',
                  timestamp: '10:30:03',
                },
                {
                  id: '4',
                  message: 'Repository checked out successfully',
                  level: 'success',
                  timestamp: '10:30:03',
                },
              ],
            },
            {
              id: 'setup-node',
              name: 'Setup node.js 14.x',
              status: 'running',
              duration: '1s',
              details: [
                'Run actions/setup-node@v3',
                'Found in cache @ /opt/hostedtoolcache/node/14.19.3/x64',
                '/opt/hostedtoolcache/node/14.19.3/x64/bin/npm config get cache',
                '/home/runner/.npm',
                '',
                'npm cache is not found',
              ],
              logs: [
                {
                  id: '5',
                  message: 'Setting up Node.js 14.x...',
                  level: 'info',
                  timestamp: '10:30:04',
                },
                {
                  id: '6',
                  message: 'Found cached Node.js installation',
                  level: 'info',
                  timestamp: '10:30:04',
                },
                {
                  id: '7',
                  message: 'Configuring npm cache...',
                  level: 'info',
                  timestamp: '10:30:05',
                },
              ],
            },
            {
              id: 'run-npm-ci',
              name: 'Run npm ci',
              status: 'pending',
              duration: '4s',
              logs: [],
            },
          ],
        },
      ],
    };

    setBuildData(mockBuildData);
    setSelectedJob('deploy');

    // 실시간 로그 스트리밍 시뮬레이션
    const simulateLogStream = () => {
      setIsStreaming(true);

      const logMessages = [
        { message: 'Installing dependencies...', level: 'info' as const },
        { message: 'npm WARN deprecated package found', level: 'warn' as const },
        { message: 'Dependencies installed successfully', level: 'success' as const },
      ];

      let messageIndex = 0;
      const interval = setInterval(() => {
        if (messageIndex < logMessages.length) {
          const currentTime = new Date().toLocaleTimeString();
          const currentMessage = logMessages[messageIndex];
          if (!currentMessage) return;

          const newLog: LogEntry = {
            id: `stream-${Date.now()}`,
            message: currentMessage.message,
            level: currentMessage.level,
            timestamp: currentTime,
          };

          setBuildData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              jobs: prev.jobs.map((job) =>
                job.id === 'deploy'
                  ? {
                      ...job,
                      steps: job.steps.map((step) =>
                        step.id === 'setup-node'
                          ? {
                              ...step,
                              logs: [...(step.logs || []), newLog],
                            }
                          : step
                      ),
                    }
                  : job
              ),
            };
          });

          messageIndex++;
        } else {
          clearInterval(interval);
          setIsStreaming(false);
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    const cleanup = simulateLogStream();
    return cleanup;
  }, [buildId]);

  // 자동 스크롤 기능
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [buildData, autoScroll]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const getStatusIcon = (status: string, size: string = 'w-5 h-5') => {
    const baseClasses = `${size} transition-colors`;
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-500`} />;
      case 'running':
        return <Loader className={`${baseClasses} text-blue-500 animate-spin`} />;
      case 'failed':
        return <AlertCircle className={`${baseClasses} text-red-500`} />;
      case 'pending':
        return <Clock className={`${baseClasses} text-gray-400`} />;
      default:
        return <Clock className={`${baseClasses} text-gray-400`} />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'info':
      default:
        return 'text-gray-300';
    }
  };

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!buildData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader className='w-8 h-8 text-blue-500 animate-spin' />
        <span className='ml-2 text-gray-600'>빌드 정보를 불러오는 중...</span>
      </div>
    );
  }

  const currentJob = buildData.jobs.find((job) => job.id === selectedJob);

  return (
    <div className='space-y-6'>
      {/* Dark Theme Header Card */}
      <div className='bg-slate-900 border border-slate-700 rounded-xl shadow-sm p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            {/* 상단: 타이틀 + 상태 아이콘 */}
            <div className='flex items-center space-x-3 mb-4'>
              {getStatusIcon(buildData.status, 'w-6 h-6')}
              <h1 className='text-xl font-semibold text-white'>{buildData.title}</h1>
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  buildData.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : buildData.status === 'running'
                      ? 'bg-blue-100 text-blue-800'
                      : buildData.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                }`}
              >
                {buildData.status === 'completed'
                  ? '완료'
                  : buildData.status === 'running'
                    ? '실행중'
                    : buildData.status === 'failed'
                      ? '실패'
                      : '대기중'}
              </div>
            </div>

            {/* 하단: 브랜치 정보 + 커밋ID + 작성자 + 시간정보 */}
            <div className='flex items-center space-x-6 text-sm text-gray-300'>
              <div className='flex items-center space-x-1'>
                <GitBranch className='w-4 h-4' />
                <span>{buildData.branch}</span>
                <span className='text-gray-400'>({buildData.commit})</span>
              </div>
              <div className='flex items-center space-x-1'>
                <User className='w-4 h-4' />
                <span>{buildData.author}</span>
              </div>
              <div className='flex items-center space-x-1'>
                <Calendar className='w-4 h-4' />
                <span>{formatTime(buildData.startTime)}</span>
              </div>
              {buildData.status === 'running' && (
                <div className='flex items-center space-x-1'>
                  <Timer className='w-4 h-4' />
                  <span>2m 15s</span>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 액션 버튼 + 빌드 목록 버튼 */}
          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-2'>
              <button className='p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'>
                <Play className='w-4 h-4' />
              </button>
              <button className='p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'>
                <Pause className='w-4 h-4' />
              </button>
              <button className='p-2 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'>
                <RotateCcw className='w-4 h-4' />
              </button>
            </div>
            <div className='w-px h-6 bg-slate-700'></div>
            <button
              onClick={() => router.push('/builds')}
              className='inline-flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 border border-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-colors'
            >
              <span>빌드 목록</span>
              <ExternalLink className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Dark Theme Log Card */}
      <div className='bg-slate-900 border border-slate-700 rounded-xl shadow-sm overflow-hidden'>
        {currentJob && (
          <>
            {/* Job Status Bar */}
            <div className='bg-slate-800 px-6 py-4 border-b border-slate-700'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <h3 className='text-xl font-semibold text-white'>{currentJob.name}</h3>
                  <div className='flex items-center space-x-3'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentJob.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : currentJob.status === 'running'
                            ? 'bg-blue-100 text-blue-800'
                            : currentJob.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {currentJob.status === 'running'
                        ? 'Running'
                        : currentJob.status === 'completed'
                          ? 'Completed'
                          : currentJob.status === 'failed'
                            ? 'Failed'
                            : 'Pending'}
                    </span>
                    <span className='text-sm text-gray-300'>
                      {currentJob.status === 'completed' ? 'succeeded' : 'running'} in{' '}
                      {currentJob.duration}
                    </span>
                  </div>
                  {isStreaming && (
                    <div className='flex items-center space-x-2 bg-blue-900 bg-opacity-50 px-3 py-1.5 rounded-lg'>
                      <Loader className='w-4 h-4 text-blue-400 animate-spin' />
                      <span className='text-sm text-blue-400'>Live streaming...</span>
                    </div>
                  )}
                </div>
                <div className='flex items-center space-x-3'>
                  <label className='flex items-center space-x-2 text-sm text-gray-300'>
                    <input
                      type='checkbox'
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className='rounded border-gray-500 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0'
                    />
                    <span>Auto-scroll</span>
                  </label>
                  <button
                    onClick={scrollToBottom}
                    className='px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-gray-300'
                  >
                    ↓ Bottom
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Container */}
            <div className='h-[48rem] overflow-auto' ref={logContainerRef}>
              <div className='p-6'>
                <div className='space-y-3'>
                  {currentJob.steps.map((step) => (
                    <div
                      key={step.id}
                      className='bg-slate-800 rounded-xl overflow-hidden shadow-sm'
                    >
                      <div
                        className='flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-750 transition-colors'
                        onClick={() => (step.details || step.logs) && toggleStepExpansion(step.id)}
                      >
                        <div className='flex items-center space-x-3'>
                          {(step.details || step.logs) && (
                            <button className='text-gray-400 hover:text-white transition-colors'>
                              {expandedSteps[step.id] ? (
                                <ChevronDown className='w-4 h-4' />
                              ) : (
                                <ChevronRight className='w-4 h-4' />
                              )}
                            </button>
                          )}
                          {!(step.details || step.logs) && <div className='w-4' />}
                          {getStatusIcon(step.status, 'w-4 h-4')}
                          <span className='font-medium text-gray-100'>{step.name}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm text-gray-300'>{step.duration}</span>
                        </div>
                      </div>

                      {expandedSteps[step.id] && (
                        <div className='bg-slate-900 px-5 py-4 border-t border-slate-700'>
                          {/* Details */}
                          {step.details &&
                            step.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className='flex text-sm font-mono mb-1.5'>
                                <span className='text-slate-500 w-8 text-right mr-4 select-none'>
                                  {detailIndex + 1}
                                </span>
                                <span
                                  className={`${
                                    detail.includes('Run')
                                      ? 'text-blue-300'
                                      : detail.includes('/opt/') || detail.includes('/home/')
                                        ? 'text-cyan-300'
                                        : detail.includes('Found in cache')
                                          ? 'text-green-300'
                                          : detail === ''
                                            ? ''
                                            : 'text-gray-300'
                                  }`}
                                >
                                  {detail || ' '}
                                </span>
                              </div>
                            ))}

                          {/* Logs */}
                          {step.logs &&
                            step.logs.map((log) => (
                              <div
                                key={log.id}
                                className='flex text-sm font-mono py-1.5 hover:bg-slate-800 px-3 -mx-3 rounded-lg transition-colors'
                              >
                                <span className='text-slate-400 w-20 text-right mr-4 flex-shrink-0 select-none'>
                                  {log.timestamp}
                                </span>
                                <span className={`${getLogLevelColor(log.level)} flex-1`}>
                                  <span className='text-slate-500'>
                                    [{log.level.toUpperCase()}]
                                  </span>{' '}
                                  {log.message}
                                </span>
                              </div>
                            ))}

                          {/* Live streaming cursor */}
                          {step.status === 'running' && isStreaming && (
                            <div className='flex text-sm font-mono py-1.5'>
                              <span className='text-slate-400 w-20 text-right mr-4 flex-shrink-0 select-none'>
                                {new Date().toLocaleTimeString()}
                              </span>
                              <span className='text-blue-400 animate-pulse'>
                                ▋ Waiting for output...
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuildDetailPage;
