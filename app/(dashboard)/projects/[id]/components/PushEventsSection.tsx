'use client';

import React from 'react';
import { Card } from '@/app/components/ui';
import { usePushEvents, type PushEvent } from '../hooks/usePushEvents';

interface PushEventsSectionProps {
  projectId: string;
}

function formatCommitMessage(message: string): string {
  return message.length > 60 ? `${message.substring(0, 60)}...` : message;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function getBranchName(ref: string): string {
  return ref.replace('refs/heads/', '');
}

interface PushEventItemProps {
  event: PushEvent;
}

function PushEventItem({ event }: PushEventItemProps) {
  const branchName = getBranchName(event.ref);
  const commitCount = event.commits.length;
  const headCommit = event.headCommit;

  return (
    <div className="border-b border-gray-100 last:border-b-0 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              {event.pusher.name}
            </span>
            <span className="text-sm text-gray-500">pushed to</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {branchName}
            </span>
          </div>
          
          {headCommit && (
            <div className="ml-4 space-y-1">
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                  {headCommit.id.substring(0, 7)}
                </code>
                <span className="text-sm text-gray-700">
                  {formatCommitMessage(headCommit.message)}
                </span>
              </div>
              
              {commitCount > 1 && (
                <div className="text-xs text-gray-500 ml-8">
                  +{commitCount - 1} more {commitCount === 2 ? 'commit' : 'commits'}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>📁 {event.repository.name}</span>
            <span>{formatTimestamp(event.createdAt)}</span>
            {event.forced && (
              <span className="text-red-600 font-medium">Force pushed</span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <a
            href={event.compare}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            View diff ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export function PushEventsSection({ projectId }: PushEventsSectionProps) {
  const { 
    pushEvents, 
    isLoading, 
    error, 
    refetch, 
    isPolling 
  } = usePushEvents({ 
    projectId, 
    pollingInterval: 30000, // 30초마다 폴링
    enabled: true 
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card className="lg:col-span-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Push Events</h2>
            {isPolling && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading push events
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {error}
                </div>
                <div className="mt-2">
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-red-800 hover:text-red-900 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && pushEvents.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && pushEvents.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No push events yet</h3>
            <p className="text-sm text-gray-500">
              Push events will appear here when code is pushed to your connected repositories.
            </p>
          </div>
        )}

        {pushEvents.length > 0 && (
          <div className="divide-y divide-gray-100 -mx-4">
            {pushEvents.map((event) => (
              <PushEventItem key={event.id} event={event} />
            ))}
          </div>
        )}

        {pushEvents.length > 0 && (
          <div className="text-center pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Showing {pushEvents.length} recent push {pushEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}