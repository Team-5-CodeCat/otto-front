'use client';

import React from 'react';
import DashboardLayout from '@/app/components/dashboard/DashboardLayout';

export default function DashboardSegmentLayout({ children }: { children: React.ReactNode }) {
  // 대시보드 전용 레이아웃 래핑
  return <DashboardLayout>{children}</DashboardLayout>;
}
