import React from 'react';
import { NodeTemplate, ActionIcon } from './types';

// 노드 템플릿 정의
export const createNodeTemplates = (selectedVersion: string): NodeTemplate[] => [
  {
    type: 'build',
    label: 'Build',
    description: 'Build your application',
    defaultImage: `node:${selectedVersion}`,
    defaultCommands: 'npm ci\nnpm run build',
  },
  {
    type: 'test',
    label: 'Test',
    description: 'Run tests',
    defaultImage: `node:${selectedVersion}`,
    defaultCommands: 'npm test',
  },
  {
    type: 'deploy',
    label: 'Deploy',
    description: 'Deploy application',
    defaultImage: 'ubuntu:22.04',
    defaultCommands: 'deploy.sh',
  },
];

// 액션 아이콘 정의
export const actionIcons: ActionIcon[] = [
  {
    href: '/pipelines',
    title: 'Pipelines',
    icon: React.createElement(
      'svg',
      { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M13 10V3L4 14h7v7l9-11h-7z',
      })
    ),
  },
  {
    href: '/builds',
    title: 'Builds',
    icon: React.createElement(
      'svg',
      { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      })
    ),
  },
  {
    href: '/settings',
    title: 'Settings',
    icon: React.createElement(
      'svg',
      { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      }),
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      })
    ),
  },
];
