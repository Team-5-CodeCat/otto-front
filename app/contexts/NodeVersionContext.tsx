'use client';

import React, { createContext, useContext, useState } from 'react';

export interface NodeVersion {
  version: string;
  lts: boolean;
  description: string;
}

interface NodeVersionContextType {
  availableVersions: NodeVersion[];
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
}

const NodeVersionContext = createContext<NodeVersionContextType | undefined>(undefined);

export const NodeVersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVersion, setSelectedVersion] = useState('18');
  const [availableVersions] = useState<NodeVersion[]>([
    { version: '16', lts: true, description: 'Node.js 16 (LTS)' },
    { version: '18', lts: true, description: 'Node.js 18 (LTS)' },
    { version: '20', lts: true, description: 'Node.js 20 (LTS)' },
  ]);

  return (
    <NodeVersionContext.Provider value={{
      availableVersions,
      selectedVersion,
      setSelectedVersion,
    }}>
      {children}
    </NodeVersionContext.Provider>
  );
};

export const useNodeVersion = (): NodeVersionContextType => {
  const context = useContext(NodeVersionContext);
  if (context === undefined) {
    throw new Error('useNodeVersion must be used within a NodeVersionProvider');
  }
  return context;
};