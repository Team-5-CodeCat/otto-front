'use client';

import React from 'react';

export default function EnvironmentsPage() {
  return (
    <div className='p-6'>
      {/* 언어/배포 환경 설정 개요 */}
      <h1 className='text-2xl font-bold text-gray-900'>Environments</h1>
      <p className='mt-1 text-sm text-gray-600'>Configure language and deployment environments.</p>

      {/* Placeholder: 환경 카드들 */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          {/* TODO: Node/Python/Java 선택 UI */}
          <h2 className='font-medium text-gray-900'>Language</h2>
          <p className='text-sm text-gray-600 mt-1'>Node, Python, Java</p>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          {/* TODO: EC2/Docker 선택 UI */}
          <h2 className='font-medium text-gray-900'>Deployment</h2>
          <p className='text-sm text-gray-600 mt-1'>EC2, Docker</p>
        </div>
      </div>
    </div>
  );
}
