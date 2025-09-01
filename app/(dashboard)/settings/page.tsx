'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className='p-6'>
      {/* 사용자/워크스페이스 설정 개요 */}
      <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
      <p className='mt-1 text-sm text-gray-600'>Manage user and workspace settings.</p>

      {/* Placeholder: 설정 섹션들 */}
      <div className='mt-6 space-y-4'>
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          {/* TODO: Profile 정보, 이메일 변경, 비밀번호 변경 */}
          <h2 className='font-medium text-gray-900'>Profile</h2>
          <p className='text-sm text-gray-600 mt-1'>Update your personal information.</p>
        </div>
        <div className='rounded-lg border border-gray-200 bg-white p-4'>
          {/* TODO: 토큰/보안 설정 */}
          <h2 className='font-medium text-gray-900'>Security</h2>
          <p className='text-sm text-gray-600 mt-1'>Manage tokens and security.</p>
        </div>
      </div>
    </div>
  );
}
