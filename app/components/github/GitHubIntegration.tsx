'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import {
  getGitHubInstallUrl,
  registerGitHubApp,
  getGitHubBranches,
  registerGitHubBranch,
  handleApiError,
  type GitHubRepo,
  type GitHubBranch,
} from '@/app/lib/api';

// 타입은 이미 api.ts에서 import했으므로 중복 정의 제거

// 워크플로우 단계 타입
type WorkflowStep = 'install' | 'repository-selection' | 'branch-selection' | 'completed';

// GitHub 통합 컴포넌트 Props
interface GitHubIntegrationProps {
  onRepoSelect: (repo: GitHubRepo | null) => void;
  onBranchSelect: (branch: string | null) => void;
  initialRepo?: GitHubRepo | null;
  initialBranch?: string | null;
}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  onRepoSelect,
  onBranchSelect,
  initialRepo = null,
  initialBranch = null,
}) => {
  // 상태 관리
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('install');
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(initialRepo);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranch);
  const [installUrl, setInstallUrl] = useState<string>('');
  const [callbackUrl, setCallbackUrl] = useState<string>('');

  // 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeGitHubIntegration();
    checkInstallationStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // URL 파라미터로 설치 완료 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('github_installed') === 'true') {
      const installationId = urlParams.get('installation_id');
      const accessToken = urlParams.get('access_token');
      if (installationId) {
        handleInstallationComplete(installationId, accessToken || '');
      }
    }
  }, []);

  // GitHub 통합 초기화
  const initializeGitHubIntegration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // GitHub 앱 설치 URL 조회
      const data = await getGitHubInstallUrl();
      setInstallUrl(data.installUrl);
      setCallbackUrl(data.callbackUrl);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 설치 상태 확인
  const checkInstallationStatus = () => {
    if (initialRepo) {
      setCurrentStep('repository-selection');
      setRepositories([initialRepo]);
    }
  };

  // 설치 완료 감지를 위한 폴링 시작
  const startInstallationPolling = () => {
    const checkInstallation = setInterval(async () => {
      try {
        // URL 파라미터로 설치 완료 확인
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('github_installed') === 'true') {
          clearInterval(checkInstallation);
          const installationId = urlParams.get('installation_id');
          const accessToken = urlParams.get('access_token');
          if (installationId) {
            await handleInstallationComplete(installationId, accessToken || '');
          }
        }
      } catch (error) {
        console.error('설치 상태 확인 중 오류:', error);
      }
    }, 2000);

    // 5분 후 폴링 중단
    setTimeout(() => {
      clearInterval(checkInstallation);
    }, 300000);
  };

  // GitHub 앱 설치 핸들러
  const handleInstallGitHubApp = () => {
    if (!installUrl) {
      setError('GitHub 앱 설치 URL을 가져올 수 없습니다.');
      return;
    }

    // 새 창에서 GitHub 앱 설치 페이지 열기
    const installWindow = window.open(
      installUrl,
      '_blank',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // 설치 완료 감지를 위한 폴링 시작
    if (installWindow) {
      startInstallationPolling();
    }

    // 설치 완료 감지를 위한 폴링
    const checkInstallation = setInterval(async () => {
      try {
        if (installWindow?.closed) {
          clearInterval(checkInstallation);
          // 설치 창이 닫혔을 때 설치 상태 확인
          await checkInstallationStatus();
        }
      } catch (err) {
        console.error('설치 상태 확인 중 오류:', err);
      }
    }, 2000);

    // 5분 후 폴링 중단
    setTimeout(() => {
      clearInterval(checkInstallation);
    }, 300000);
  };

  // GitHub 앱 설치 완료 처리
  const handleInstallationComplete = async (installationId: string, accessToken: string = '') => {
    setIsLoading(true);
    setError(null);

    try {
      // GitHub 앱 등록 API 호출
      const data = await registerGitHubApp(installationId, accessToken);

      if (data.success && data.repositories) {
        setRepositories(data.repositories);
        setCurrentStep('repository-selection');
        setSuccessMessage('GitHub 앱이 성공적으로 설치되었습니다!');
      } else {
        throw new Error('레포지토리 목록을 가져올 수 없습니다.');
      }
    } catch (err) {
      // 백엔드 API 호출 실패 시 대체 로직
      console.warn('백엔드 API 호출 실패, 대체 로직 실행:', err);
      setError(
        '백엔드 서버에 연결할 수 없습니다. GitHub 앱은 설치되었지만 레포지토리 목록을 가져올 수 없습니다.'
      );

      // 설치 완료 상태로 변경 (사용자가 수동으로 진행할 수 있도록)
      setCurrentStep('repository-selection');
      setSuccessMessage('GitHub 앱이 설치되었습니다! (백엔드 연결 필요)');
    } finally {
      setIsLoading(false);
    }
  };

  // 레포지토리 선택 핸들러
  const handleRepoSelect = async (repo: GitHubRepo) => {
    setIsLoading(true);
    setError(null);

    try {
      // 선택된 레포지토리의 브랜치 목록 조회
      const branchesData = await getGitHubBranches(repo.full_name);

      // 상태 업데이트
      setSelectedRepo(repo);
      setBranches(branchesData);
      setSelectedBranch(null); // 브랜치 초기화
      setCurrentStep('branch-selection');

      // 부모 컴포넌트에 선택된 레포 전달
      onRepoSelect(repo);
      onBranchSelect(null);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 브랜치 선택 핸들러
  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
    onBranchSelect(branchName);
  };

  // 브랜치 등록 핸들러
  const handleBranchRegister = async () => {
    if (!selectedRepo || !selectedBranch) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await registerGitHubBranch(selectedRepo.full_name, selectedBranch);

      if (result.success) {
        setCurrentStep('completed');
        setSuccessMessage('브랜치가 성공적으로 등록되었습니다!');
      } else {
        throw new Error(result.message || '브랜치 등록에 실패했습니다.');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 단계별 렌더링
  const renderInstallStep = () => (
    <Card>
      <div className='p-6 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
          <span className='text-2xl'>🔗</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>GitHub 앱 설치</h3>
        <p className='text-sm text-gray-600 mb-6'>
          CI/CD 파이프라인을 위해 GitHub 앱을 설치하고 레포지토리를 연결하세요.
        </p>

        <Button
          onClick={handleInstallGitHubApp}
          disabled={isLoading || !installUrl}
          className='bg-gray-900 hover:bg-gray-800 text-white'
        >
          {isLoading ? '설치 URL 조회 중...' : 'GitHub 앱 설치'}
        </Button>

        {callbackUrl && (
          <div className='mt-4 p-3 bg-gray-50 rounded-md'>
            <p className='text-xs text-gray-500 mb-1'>콜백 URL:</p>
            <p className='text-xs text-gray-700 font-mono break-all'>{callbackUrl}</p>
          </div>
        )}

        {/* 백엔드 연결 상태 표시 */}
        <div className='mt-4 p-3 bg-blue-50 rounded-md'>
          <p className='text-xs text-blue-600 mb-1'>백엔드 상태:</p>
          <p className='text-xs text-blue-700'>
            {installUrl.includes('github.com/apps')
              ? '✅ GitHub 앱 직접 연결 (백엔드 API 사용 불가)'
              : '✅ 백엔드 API 연결됨'}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderRepositorySelection = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>레포지토리 선택</h3>
        <p className='text-sm text-gray-600'>연결할 GitHub 레포지토리를 선택하세요.</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedRepo?.id === repo.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleRepoSelect(repo)}
          >
            <Card>
              <div className='p-4'>
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center'>
                      <span className='text-lg'>📁</span>
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900'>{repo.name}</h4>
                      <p className='text-sm text-gray-600'>{repo.full_name}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      repo.private ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {repo.private ? 'Private' : 'Public'}
                  </span>
                </div>

                {repo.description && (
                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{repo.description}</p>
                )}

                <div className='flex items-center justify-between text-sm text-gray-500'>
                  <span>기본 브랜치: {repo.default_branch}</span>
                  <a
                    href={repo.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-700'
                    onClick={(e) => e.stopPropagation()}
                  >
                    GitHub에서 보기 →
                  </a>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBranchSelection = () => (
    <div className='space-y-4'>
      <div className='text-center'>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>브랜치 선택</h3>
        <p className='text-sm text-gray-600'>
          {selectedRepo?.name} 레포지토리에서 사용할 브랜치를 선택하세요.
        </p>
      </div>

      <Card>
        <div className='p-6'>
          <div className='space-y-3'>
            {branches.map((branch) => (
              <label
                key={branch.name}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedBranch === branch.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type='radio'
                  name='branch'
                  value={branch.name}
                  checked={selectedBranch === branch.name}
                  onChange={(e) => handleBranchSelect(e.target.value)}
                  className='sr-only'
                />
                <div className='flex items-center space-x-3 flex-1'>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedBranch === branch.name
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedBranch === branch.name && (
                      <div className='w-2 h-2 bg-white rounded-full mx-auto mt-0.5'></div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-gray-900'>{branch.name}</span>
                      {branch.name === selectedRepo?.default_branch && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800'>
                          기본 브랜치
                        </span>
                      )}
                      {branch.protected && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800'>
                          보호됨
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                      최근 커밋: {branch.commit.sha.substring(0, 7)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedBranch && (
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-900'>선택된 브랜치</p>
                  <p className='text-sm text-gray-600'>{selectedBranch}</p>
                </div>
                <Button
                  onClick={handleBranchRegister}
                  disabled={isLoading}
                  className='bg-blue-600 hover:bg-blue-700 text-white'
                >
                  {isLoading ? '등록 중...' : '등록 완료'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderCompleted = () => (
    <Card>
      <div className='p-6 text-center'>
        <div className='w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center'>
          <span className='text-2xl'>✅</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>설정 완료!</h3>
        <p className='text-sm text-gray-600 mb-4'>GitHub 앱이 성공적으로 설정되었습니다.</p>

        {selectedRepo && selectedBranch && (
          <div className='bg-gray-50 rounded-lg p-4 mb-4'>
            <p className='text-sm text-gray-700'>
              <strong>레포지토리:</strong> {selectedRepo.full_name}
            </p>
            <p className='text-sm text-gray-700'>
              <strong>브랜치:</strong> {selectedBranch}
            </p>
          </div>
        )}

        <Button
          onClick={() => {
            setCurrentStep('install');
            setSelectedRepo(null);
            setSelectedBranch(null);
            setRepositories([]);
            setBranches([]);
            onRepoSelect(null);
            onBranchSelect(null);
          }}
          variant='outline'
        >
          다시 설정하기
        </Button>
      </div>
    </Card>
  );

  return (
    <div className='space-y-6'>
      {/* 진행 단계 표시 */}
      <div className='flex items-center justify-center space-x-4'>
        {['install', 'repository-selection', 'branch-selection', 'completed'].map((step, index) => (
          <div key={step} className='flex items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : ['install', 'repository-selection', 'branch-selection', 'completed'].indexOf(
                        currentStep
                      ) > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < 3 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  ['install', 'repository-selection', 'branch-selection', 'completed'].indexOf(
                    currentStep
                  ) > index
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 성공 메시지 */}
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <span className='text-green-400'>✅</span>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-green-800'>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <span className='text-red-400'>⚠️</span>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>오류 발생</h3>
              <p className='mt-1 text-sm text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 단계별 컨텐츠 */}
      {currentStep === 'install' && renderInstallStep()}
      {currentStep === 'repository-selection' && renderRepositorySelection()}
      {currentStep === 'branch-selection' && renderBranchSelection()}
      {currentStep === 'completed' && renderCompleted()}
    </div>
  );
};

export default GitHubIntegration;
