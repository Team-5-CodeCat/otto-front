'use client';

import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { projectApi, GitHubRepository, GitHubInstallation } from '../../lib/project-api';

interface RepositorySelectorProps {
  onRepositorySelect: (repository: GitHubRepository) => void;
  selectedRepository?: GitHubRepository | null;
  className?: string;
}

/**
 * 레포지토리 선택 컴포넌트
 * 
 * 사용자가 등록한 GitHub 설치의 레포지토리 목록을 표시하고
 * 선택할 수 있는 UI를 제공합니다.
 */
export const RepositorySelector: React.FC<RepositorySelectorProps> = ({
  onRepositorySelect,
  selectedRepository,
  className = '',
}) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트 마운트 시 GitHub 설치 목록과 레포지토리 조회
  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // GitHub 설치 목록 조회
      const installations = await projectApi.getGitHubInstallations();
      setInstallations(installations);
      
      if (installations.length === 0) {
        setRepositories([]);
        return;
      }
      
      // 모든 설치에서 레포지토리 조회
      const allRepositories: GitHubRepository[] = [];
      for (const installation of installations) {
        try {
          const repos = await projectApi.getRepositories(installation.installationId);
          // installationId 추가
          const reposWithInstallation = repos.map(repo => ({
            ...repo,
            installationId: installation.installationId,
          }));
          allRepositories.push(...reposWithInstallation);
        } catch (error) {
          console.error(`설치 ${installation.installationId}의 레포지토리 조회 실패:`, error);
        }
      }
      
      setRepositories(allRepositories);
      
    } catch (error) {
      console.error('레포지토리 목록 조회 오류:', error);
      setError(error instanceof Error ? error.message : '레포지토리 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepositoryClick = (repository: GitHubRepository) => {
    onRepositorySelect(repository);
  };

  if (isLoading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">레포지토리 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">레포지토리 목록을 불러올 수 없습니다</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={loadRepositories}>
          다시 시도
        </Button>
      </div>
    );
  }

  if (installations.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">등록된 GitHub 설치가 없습니다</p>
          <p className="text-sm text-gray-600 mt-1">GitHub 앱을 설치하고 계정을 등록해주세요.</p>
        </div>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium">사용 가능한 레포지토리가 없습니다</p>
          <p className="text-sm text-gray-600 mt-1">GitHub 계정에 접근 가능한 레포지토리가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">레포지토리 선택</h3>
        <Button variant="ghost" size="sm" onClick={loadRepositories}>
          새로고침
        </Button>
      </div>
      
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {repositories.map((repository) => (
          <Card
            key={`${repository.id}-${repository.installationId}`}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRepository?.id === repository.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleRepositoryClick(repository)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {repository.fullName}
                  </h4>
                  {repository.private && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Private
                    </span>
                  )}
                </div>
                
                {repository.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {repository.description}
                  </p>
                )}
                
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>기본 브랜치: {repository.defaultBranch}</span>
                  <span>언어: {repository.language || 'Unknown'}</span>
                  <span>⭐ {repository.stargazersCount}</span>
                  <span>🍴 {repository.forksCount}</span>
                </div>
              </div>
              
              {selectedRepository?.id === repository.id && (
                <div className="ml-2 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RepositorySelector;