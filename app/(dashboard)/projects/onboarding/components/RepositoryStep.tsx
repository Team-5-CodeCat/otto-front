'use client';

import React, { useEffect, useState } from 'react';
import { GitBranch, Search, Star, GitFork, Calendar } from 'lucide-react';
import type { useOnboarding } from '../hooks/useOnboarding';

interface RepositoryStepProps {
  onboarding: ReturnType<typeof useOnboarding>;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description?: string;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language?: string;
  default_branch: string;
}

export function RepositoryStep({ onboarding }: RepositoryStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null);

  // 컴포넌트 마운트 시 저장소 목록 조회
  useEffect(() => {
    onboarding.fetchRepositories();
  }, [onboarding]);

  // 선택된 저장소가 변경될 때 onboarding 데이터 업데이트
  useEffect(() => {
    if (selectedRepo) {
      onboarding.updateData({
        githubRepoId: selectedRepo.id,
        githubRepoName: selectedRepo.name,
        githubRepoUrl: selectedRepo.html_url,
        selectedBranch: selectedRepo.default_branch,
      });
    }
  }, [selectedRepo, onboarding]);

  // 검색 필터링
  const filteredRepositories = onboarding.availableRepositories.filter((repo: any) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepositorySelect = (repo: any) => {
    setSelectedRepo(repo);
  };

  const handleNext = () => {
    if (onboarding.canProceedToNext()) {
      onboarding.nextStep();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <GitBranch className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            저장소 선택
          </h2>
          <p className="text-gray-600">
            CI/CD 자동화를 설정하고 싶은 저장소를 선택해주세요.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="저장소 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Repository List */}
        <div className="mb-6">
          {onboarding.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="flex space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">저장소를 찾을 수 없습니다</h3>
              <p className="text-gray-600">
                {searchQuery ? '검색 조건을 조정해 보세요.' : '자동화에 사용할 수 있는 저장소가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {filteredRepositories.map((repo: any) => (
                <div
                  key={repo.id}
                  onClick={() => handleRepositorySelect(repo)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRepo?.id === repo.id
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{repo.name}</h3>
                        {repo.private && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            비공개
                          </span>
                        )}
                        {repo.language && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {repo.language}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>업데이트: {formatDate(repo.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    {selectedRepo?.id === repo.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Repository Info */}
        {selectedRepo && (
          <div className="mb-6 bg-emerald-50 rounded-lg p-4">
            <h4 className="font-medium text-emerald-900 mb-2">선택된 저장소:</h4>
            <p className="text-sm text-emerald-800">
              <strong>{selectedRepo.full_name}</strong> - 기본 브랜치: <code className="bg-white px-1 rounded">{selectedRepo.default_branch}</code>
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => onboarding.prevStep()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
이전
          </button>
          <button
            onClick={handleNext}
            disabled={!onboarding.canProceedToNext()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              onboarding.canProceedToNext()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
계속
          </button>
        </div>
      </div>
    </div>
  );
}