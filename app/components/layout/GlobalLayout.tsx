'use client';

import React from 'react';
import GlobalSidebar from './GlobalSidebar';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Floating Sidebar */}
      <GlobalSidebar />
      
      {/* Main Content Area - Full Width */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default GlobalLayout;