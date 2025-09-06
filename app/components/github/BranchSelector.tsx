'use client';

import React, { useState, useEffect } from 'react';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { projectApi, Branch } from '../../lib/project-api';

interface BranchSelectorProps {
  projectId: string;
  repositoryId: string;
  onBranchSelect: (branchName: string) => void;
  selectedBranch?: string | null;
  className?: string;
}

/**
 * 브랜치 선택 컴포넌트
 * 
 * 선택된 레포지토리의 브랜치 목록을 조회하고
 * 드롭다운으로 선택할 수 있는 UI를 제공합니다.
 */
export const BranchSelector: React.FC<BranchSelectorProps> = ({
  projectId,
  repositoryId,
  onBranchSelect,
  selectedBranch,
  className = '',
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 ID와 레포지토리 ID가 변경될 때마다 브랜치 목록 조회
  useEffect(() => {
    if (projectId && repositoryId) {
      loadBranches();
    } else {
      setBranches([]);
      setError(null);
    }
  }, [projectId, repositoryId]);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await projectApi.getBranches(projectId, repositoryId);
      setBranches(response);
      
      // 기본 브랜치가 선택되지 않은 경우 첫 번째 브랜치 선택
      if (!selectedBranch && response.length > 0) {
        onBranchSelect(response[0].name);
      }
      
    } catch (error) {
      console.error('브랜치 목록 조회 오류:', error);
      setError(error instanceof Error ? error.message : '브랜치 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBranchChange = (branchName: string) => {
    onBranchSelect(branchName);
  };

  if (!projectId || !repositoryId) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>먼저 레포지토리를 선택해주세요.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">브랜치 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium">브랜치 목록을 불러올 수 없습니다</p>
          <p className="text-xs text-gray-600 mt-1">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadBranches}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">사용 가능한 브랜치가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          CI/CD 대상 브랜치 선택
        </label>
        <Button variant="ghost" size="sm" onClick={loadBranches}>
          새로고침
        </Button>
      </div>
      
      <Select
        value={selectedBranch || ''}
        onChange={(e) => handleBranchChange(e.target.value)}
        options={branches.map((branch) => ({
          label: `${branch.name} ${branch.protected ? '(Protected)' : ''}`,
          value: branch.name,
        }))}
        className="w-full"
      />
      
      {selectedBranch && (
        <div className="text-xs text-gray-500">
          선택된 브랜치: <span className="font-medium">{selectedBranch}</span>
        </div>
      )}
    </div>
  );
};

export default BranchSelector;