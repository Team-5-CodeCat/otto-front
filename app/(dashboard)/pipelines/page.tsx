'use client';

import React from 'react';

export default function PipelinesPage() {
  return (
    <div className='p-6'>
      {/* 파이프라인(블록 코딩) 개요: 추후 드래그앤드롭 에디터 연결 */}
      <h1 className='text-2xl font-bold text-gray-900'>Pipelines</h1>
      <p className='mt-1 text-sm text-gray-600'>Compose pipelines using blocks (PaB).</p>

      {/* Placeholder: 파이프라인 목록/생성 */}
      <div className='mt-6 rounded-lg border border-gray-200 bg-white p-4'>
        {/* TODO: 블록 라이브러리, 샘플 템플릿, 버전 관리 */}
        <p className='text-sm text-gray-700'>No pipelines yet.</p>
      </div>
    </div>
  );
}
