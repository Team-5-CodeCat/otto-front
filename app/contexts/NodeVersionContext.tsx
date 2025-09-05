'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NodeVersion = '20' | '21' | '22' | '23' | '24';

interface NodeVersionContextType {
  selectedVersion: NodeVersion;
  setSelectedVersion: (version: NodeVersion) => void;
  availableVersions: Array<{ version: NodeVersion; label: string; isLTS: boolean }>;
}

const NodeVersionContext = createContext<NodeVersionContextType | undefined>(undefined);

const AVAILABLE_VERSIONS = [
  { version: '20' as NodeVersion, label: 'Node.js 20', isLTS: true },
  { version: '21' as NodeVersion, label: 'Node.js 21', isLTS: false },
  { version: '22' as NodeVersion, label: 'Node.js 22', isLTS: false },
  { version: '23' as NodeVersion, label: 'Node.js 23', isLTS: false },
  { version: '24' as NodeVersion, label: 'Node.js 24', isLTS: false },
];

const STORAGE_KEY = 'otto_node_version';

interface NodeVersionProviderProps {
  children: ReactNode;
}

export function NodeVersionProvider({ children }: NodeVersionProviderProps) {
  const [selectedVersion, setSelectedVersionState] = useState<NodeVersion>('20');

  // 로컬 스토리지에서 버전 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && AVAILABLE_VERSIONS.some(v => v.version === stored)) {
          setSelectedVersionState(stored as NodeVersion);
        }
      } catch (error) {
        console.warn('Failed to load stored node version:', error);
      }
    }
  }, []);

  const setSelectedVersion = (version: NodeVersion) => {
    setSelectedVersionState(version);
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, version);
      } catch (error) {
        console.warn('Failed to store node version:', error);
      }
    }
  };

  const value: NodeVersionContextType = {
    selectedVersion,
    setSelectedVersion,
    availableVersions: AVAILABLE_VERSIONS,
  };

  return (
    <NodeVersionContext.Provider value={value}>
      {children}
    </NodeVersionContext.Provider>
  );
}

export function useNodeVersion() {
  const context = useContext(NodeVersionContext);
  if (context === undefined) {
    throw new Error('useNodeVersion must be used within a NodeVersionProvider');
  }
  return context;
}
