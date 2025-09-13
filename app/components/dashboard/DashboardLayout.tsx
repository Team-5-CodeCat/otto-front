'use client';

import React from 'react';
import { ProtectedRoute } from '@/app/components/auth/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default DashboardLayout;
