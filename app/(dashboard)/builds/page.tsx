'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  ExternalLink,
  Calendar,
  GitBranch,
  User,
  Timer,
} from 'lucide-react';

interface LogEntry {
  id: string;
  deploymentId: string;
  title: string;
  branch: string;
  commit: string;
  author: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration: string;
  startTime: string;
  endTime?: string;
  jobsCount: number;
  completedJobs: number;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  useEffect(() => {
    // 실제 데이터 로딩 시뮬레이션
    const mockLogs: LogEntry[] = [
      {
        id: 'log-1',
        deploymentId: 'deploy-1',
        title: 'chore-fe: Sentry 세팅',
        branch: 'feature/sentry-setup',
        commit: 'a1b2c3d',
        author: 'lurgi',
        status: 'completed',
        duration: '2m 30s',
        startTime: '2025-01-08 10:30:00',
        endTime: '2025-01-08 10:32:30',
        jobsCount: 3,
        completedJobs: 3,
      },
      {
        id: 'log-2',
        deploymentId: 'deploy-2',
        title: 'feat: CI/CD 로그 페이지 구현',
        branch: 'feature/cicd-logs',
        commit: 'e4f5g6h',
        author: 'developer',
        status: 'running',
        duration: '1m 15s',
        startTime: '2025-01-08 11:15:00',
        jobsCount: 4,
        completedJobs: 2,
      },
      {
        id: 'log-3',
        deploymentId: 'deploy-3',
        title: 'fix: 배포 스크립트 오류 수정',
        branch: 'hotfix/deploy-script',
        commit: 'i7j8k9l',
        author: 'admin',
        status: 'failed',
        duration: '45s',
        startTime: '2025-01-08 09:20:00',
        endTime: '2025-01-08 09:20:45',
        jobsCount: 2,
        completedJobs: 1,
      },
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'running':
        return <Loader className='w-5 h-5 text-blue-500 animate-spin' />;
      case 'failed':
        return <AlertCircle className='w-5 h-5 text-red-500' />;
      case 'pending':
        return <Clock className='w-5 h-5 text-gray-400' />;
      default:
        return <Clock className='w-5 h-5 text-gray-400' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'running':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.status === filter);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader className='w-8 h-8 text-blue-500 animate-spin' />
        <span className='ml-2 text-gray-600'>Loading your builds...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Builds</h1>
          <p className='text-gray-600 mt-1'>Monitor your build and deployment logs</p>
        </div>

        {/* Filter Buttons */}
        <div className='flex space-x-2'>
          {(['all', 'completed', 'running', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all'
                ? 'All'
                : status === 'completed'
                  ? 'Completed'
                  : status === 'running'
                    ? 'Running'
                    : 'Failed'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Total Builds</p>
              <p className='text-2xl font-bold text-gray-900'>{logs.length}</p>
            </div>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <GitBranch className='w-5 h-5 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Success</p>
              <p className='text-2xl font-bold text-green-600'>
                {logs.filter((log) => log.status === 'completed').length}
              </p>
            </div>
            <div className='p-2 bg-green-50 rounded-lg'>
              <CheckCircle className='w-5 h-5 text-green-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Running</p>
              <p className='text-2xl font-bold text-blue-600'>
                {logs.filter((log) => log.status === 'running').length}
              </p>
            </div>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <Loader className='w-5 h-5 text-blue-600' />
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded-xl border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Failed</p>
              <p className='text-2xl font-bold text-red-600'>
                {logs.filter((log) => log.status === 'failed').length}
              </p>
            </div>
            <div className='p-2 bg-red-50 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-red-600' />
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Build Log History</h2>
        </div>

        <div className='divide-y divide-gray-200'>
          {filteredLogs.map((log) => (
            <div key={log.id} className='p-6 hover:bg-gray-50 transition-colors'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start space-x-4'>
                  {getStatusIcon(log.status)}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center space-x-3 mb-2'>
                      <Link
                        href={`/builds/${log.deploymentId}`}
                        className='text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors'
                      >
                        {log.title}
                      </Link>
                      <span className={getStatusBadge(log.status)}>
                        {log.status === 'completed'
                          ? 'Completed'
                          : log.status === 'running'
                            ? 'Running'
                            : log.status === 'failed'
                              ? 'Failed'
                              : 'Pending'}
                      </span>
                    </div>

                    <div className='flex items-center space-x-6 text-sm text-gray-600'>
                      <div className='flex items-center space-x-1'>
                        <GitBranch className='w-4 h-4' />
                        <span>{log.branch}</span>
                        <span className='text-gray-400'>({log.commit})</span>
                      </div>

                      <div className='flex items-center space-x-1'>
                        <User className='w-4 h-4' />
                        <span>{log.author}</span>
                      </div>

                      <div className='flex items-center space-x-1'>
                        <Calendar className='w-4 h-4' />
                        <span>{formatTime(log.startTime)}</span>
                      </div>

                      <div className='flex items-center space-x-1'>
                        <Timer className='w-4 h-4' />
                        <span>{log.duration}</span>
                      </div>
                    </div>

                    <div className='mt-2 flex items-center space-x-4 text-sm'>
                      <span className='text-gray-600'>
                        Jobs: {log.completedJobs}/{log.jobsCount}
                      </span>
                      <div className='flex-1 bg-gray-200 rounded-full h-2 max-w-32'>
                        <div
                          className={`h-2 rounded-full ${
                            log.status === 'completed'
                              ? 'bg-green-500'
                              : log.status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                          }`}
                          style={{ width: `${(log.completedJobs / log.jobsCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Link
                    href={`/builds/${log.deploymentId}`}
                    className='inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
                  >
                    <span>View Details</span>
                    <ExternalLink className='w-3 h-3' />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className='text-center py-12'>
          <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-600'>No logs found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
