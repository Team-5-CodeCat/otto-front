'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Settings, User, Palette, Server, Monitor, Key, Shield, CreditCard, X, Plus, Eye, EyeOff, Github, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import EnvFileUploader from '../ui/EnvFileUploader';
import { EnvironmentVariable } from '../ui/EnvironmentVariableList';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = React.useState('general');
  const { user, signOut, isAuthenticated } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const router = useRouter();
  
  // Environment variables state
  const [activeEnvTab, setActiveEnvTab] = React.useState<'build' | 'test' | 'deploy'>('build');
  const [environmentVariables, setEnvironmentVariables] = React.useState<Record<string, EnvironmentVariable[]>>({});
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<'build' | 'test' | 'deploy', File | null>>({
    build: null,
    test: null,
    deploy: null,
  });

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (selectedTab === 'environment') {
      // Load environment variables from localStorage
      const savedEnvVars = localStorage.getItem('otto-env-variables');
      if (savedEnvVars) {
        try {
          setEnvironmentVariables(JSON.parse(savedEnvVars));
        } catch (error) {
          console.error('Failed to parse saved environment variables:', error);
        }
      }
    }
  }, [selectedTab]);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'integrations', label: 'Integrations', icon: Server },
    { id: 'mcp-servers', label: 'MCP Servers', icon: Monitor },
    { id: 'environment', label: 'Environment', icon: Palette },
    { id: 'account', label: 'Account', icon: User },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'copilot-keys', label: 'Copilot Keys', icon: Key },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const renderGeneralContent = () => (
    <div className='space-y-6'>
      <div className='form-control'>
        <label className='label'>
          <span className='label-text font-medium'>Theme</span>
        </label>
        <select className='select select-bordered w-full max-w-xs'>
          <option>System</option>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </div>

      <div className='form-control'>
        <label className='cursor-pointer label justify-start space-x-3'>
          <input type='checkbox' defaultChecked className='toggle toggle-primary' />
          <span className='label-text'>Auto-connect on drop</span>
        </label>
      </div>

      <div className='form-control'>
        <label className='cursor-pointer label justify-start space-x-3'>
          <input type='checkbox' defaultChecked className='toggle toggle-primary' />
          <span className='label-text'>Console expanded by default</span>
        </label>
      </div>
    </div>
  );

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      onClose(); // 모달 닫기
      router.push('/signin'); // 로그인 페이지로 이동
    } catch (error) {
      console.error('Sign out failed:', error);
      setIsSigningOut(false);
    }
  };

  const renderAccountContent = () => (
    <div className='space-y-6'>
      {/* User Profile Section */}
      <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200'>
        <div className='flex items-center space-x-4 mb-6'>
          <div className='relative'>
            <div className='w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg'>
              <Github className='w-10 h-10 text-white' />
            </div>
            <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white'></div>
          </div>
          <div className='flex-1'>
            <h3 className='text-xl font-bold text-gray-900'>
              {user?.nickname || 'GitHub User'}
            </h3>
            <p className='text-sm text-gray-600 flex items-center gap-1 mt-1'>
              <Github className='w-3 h-3' />
              Connected via GitHub OAuth
            </p>
            {isAuthenticated && (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2'>
                Active Session
              </span>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className='space-y-4'>
          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>User ID</label>
            <div className='mt-1 flex items-center justify-between'>
              <p className='text-sm font-mono text-gray-900'>{user?.user_id || 'Not available'}</p>
              <button
                onClick={() => navigator.clipboard.writeText(user?.user_id || '')}
                className='text-xs text-blue-600 hover:text-blue-700 font-medium'
              >
                Copy
              </button>
            </div>
          </div>

          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Username</label>
            <div className='mt-1 flex items-center gap-2'>
              <User className='w-4 h-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-900'>{user?.nickname || 'Not available'}</p>
            </div>
          </div>

          <div className='bg-white rounded-lg p-4 border border-gray-200'>
            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Authentication Method</label>
            <div className='mt-1 flex items-center gap-2'>
              <Github className='w-4 h-4 text-gray-400' />
              <p className='text-sm font-medium text-gray-900'>GitHub OAuth 2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className='border-t border-gray-200 pt-6'>
        <h4 className='text-sm font-semibold text-gray-900 mb-4'>Account Actions</h4>
        <div className='space-y-3'>
          <button
            className='w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
            onClick={() => window.open('https://github.com/settings/profile', '_blank')}
          >
            <Github className='w-4 h-4' />
            Manage GitHub Profile
          </button>
          
          <button
            className='w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2'
            onClick={() => window.open('https://github.com/settings/applications', '_blank')}
          >
            <Shield className='w-4 h-4' />
            Manage App Permissions
          </button>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className='border-t border-gray-200 pt-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <h4 className='text-sm font-semibold text-red-900 mb-2'>Sign Out</h4>
          <p className='text-xs text-red-700 mb-4'>
            This will end your current session and you'll need to sign in again with GitHub.
          </p>
          <button
            className='w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                Signing out...
              </>
            ) : (
              <>
                <LogOut className='w-4 h-4' />
                Sign Out from Otto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );


  /**
   * 특정 카테고리에 새로운 빈 환경 변수를 추가합니다.
   * @param category - 환경 변수를 추가할 카테고리 ('build' | 'test' | 'deploy')
   * @description 기본값으로 빈 key, value와 숨김 상태(isVisible: false)로 생성됩니다.
   */
  const addEnvironmentVariable = (category: 'build' | 'test' | 'deploy') => {
    setEnvironmentVariables(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { key: '', value: '', isVisible: false }]
    }));
  };

  /**
   * 특정 환경 변수의 key 또는 value를 업데이트합니다.
   * @param category - 환경 변수가 속한 카테고리 ('build' | 'test' | 'deploy')
   * @param index - 업데이트할 환경 변수의 인덱스
   * @param field - 업데이트할 필드 ('key' | 'value')
   * @param value - 새로운 값
   * @description 해당 카테고리의 특정 인덱스에 있는 환경 변수를 수정합니다.
   */
  const updateEnvironmentVariable = (
    category: 'build' | 'test' | 'deploy',
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    setEnvironmentVariables(prev => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = [];
      const categoryVars = [...updated[category]];
      const existingVar = categoryVars[index];
      if (existingVar) {
        categoryVars[index] = { ...existingVar, [field]: value };
      }
      updated[category] = categoryVars;
      return updated;
    });
  };

  /**
   * 특정 환경 변수의 가시성을 토글합니다 (보이기/숨기기).
   * @param category - 환경 변수가 속한 카테고리 ('build' | 'test' | 'deploy')
   * @param index - 가시성을 토글할 환경 변수의 인덱스
   * @description 비밀번호 필드처럼 값을 숨기거나 보이게 할 때 사용합니다.
   */
  const toggleVisibility = (category: 'build' | 'test' | 'deploy', index: number) => {
    setEnvironmentVariables(prev => {
      const updated = { ...prev };
      if (!updated[category]) return prev;
      const categoryVars = [...updated[category]];
      const existingVar = categoryVars[index];
      if (existingVar) {
        categoryVars[index] = {
          ...existingVar,
          isVisible: !existingVar.isVisible
        };
      }
      updated[category] = categoryVars;
      return updated;
    });
  };

  /**
   * 특정 환경 변수를 삭제합니다.
   * @param category - 환경 변수가 속한 카테고리 ('build' | 'test' | 'deploy')
   * @param index - 삭제할 환경 변수의 인덱스
   * @description 해당 인덱스의 환경 변수를 배열에서 제거합니다.
   */
  const removeEnvironmentVariable = (category: 'build' | 'test' | 'deploy', index: number) => {
    setEnvironmentVariables(prev => {
      const updated = { ...prev };
      if (!updated[category]) return prev;
      updated[category] = updated[category].filter((_, i) => i !== index);
      return updated;
    });
  };

  /**
   * .env 파일을 업로드하여 환경 변수를 추가합니다.
   * @param envVars - 파일에서 파싱된 환경 변수 객체 (key-value 쌍)
   * @param file - 업로드된 .env 파일 객체
   * @description 업로드된 환경 변수들을 현재 활성 탭에 추가하고, 보안을 위해 기본적으로 숨김 처리합니다.
   */
  const handleEnvFileUpload = (envVars: Record<string, string>, file: File) => {
    // Convert uploaded env vars to EnvironmentVariable format
    const envArray: EnvironmentVariable[] = Object.entries(envVars).map(([key, value]) => ({
      key,
      value,
      isVisible: false, // Default to hidden for security
    }));

    // Add to current active tab
    setEnvironmentVariables(prev => ({
      ...prev,
      [activeEnvTab]: [...(prev[activeEnvTab] || []), ...envArray]
    }));

    // Store the uploaded file
    setUploadedFiles(prev => ({
      ...prev,
      [activeEnvTab]: file
    }));

    alert(`Loaded ${envArray.length} environment variables into ${activeEnvTab} tab`);
  };

  /**
   * 업로드된 .env 파일을 제거합니다.
   * @description 현재 활성 탭에서 업로드된 파일 정보를 null로 설정합니다.
   */
  const handleFileRemove = () => {
    setUploadedFiles(prev => ({
      ...prev,
      [activeEnvTab]: null
    }));
  };

  /**
   * 모든 환경 변수를 .env 파일 형태로 다운로드합니다.
   * @description 모든 탭(build, test, deploy)의 환경 변수를 포함한 .env 파일을 생성하여 다운로드합니다.
   */
  const downloadEnvironmentVariables = () => {
    const allEnvVars: string[] = [];
    
    // Add header comment
    allEnvVars.push('# Otto Environment Variables');
    allEnvVars.push('# Generated from Otto Settings');
    allEnvVars.push('');

    // Add variables from all tabs
    (['build', 'test', 'deploy'] as const).forEach(tab => {
      const vars = environmentVariables[tab];
      if (vars && vars.length > 0) {
        allEnvVars.push(`# ${tab.toUpperCase()} Environment Variables`);
        vars.forEach(env => {
          if (env.key && env.value) {
            allEnvVars.push(`${env.key}=${env.value}`);
          }
        });
        allEnvVars.push('');
      }
    });

    const content = allEnvVars.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderEnvironmentContent = () => (
    <div className='h-full flex flex-col space-y-3 overflow-hidden'>
      {/* Header - compact */}
      <div className='flex-shrink-0'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold'>Environment Variables</h3>
          <div className='flex space-x-2'>
            <button
              onClick={downloadEnvironmentVariables}
              className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700'
            >
              Download .env
            </button>
          </div>
        </div>
        <p className='text-sm text-gray-500'>
          Manage environment variables for different pipeline stages.
        </p>
      </div>

      {/* Environment tabs - compact */}
      <div className='flex-shrink-0 flex border-b border-gray-200'>
        {(['build', 'test', 'deploy'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveEnvTab(tab)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors capitalize ${
              activeEnvTab === tab
                ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* File uploader - more compact */}
      <div className='flex-shrink-0 p-3 border border-gray-200 rounded-lg bg-gray-50'>
        <div className='flex justify-between items-center mb-2'>
          <h4 className='text-sm font-medium text-gray-900'>Upload .env File</h4>
          <span className='text-xs text-gray-500'>{activeEnvTab} stage</span>
        </div>
        <EnvFileUploader
          onFileUpload={handleEnvFileUpload}
          onFileRemove={handleFileRemove}
          uploadedFile={uploadedFiles[activeEnvTab]}
        />
      </div>

      {/* Environment variables list - PROPERLY SCROLLABLE */}
      <div className='flex-1 min-h-0 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col'>
        <div className='flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200'>
          <h4 className='font-medium text-gray-900 capitalize'>{activeEnvTab} Variables</h4>
          <button
            onClick={() => addEnvironmentVariable(activeEnvTab)}
            className='flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors border border-blue-200'
          >
            <Plus size={14} />
            Add Variable
          </button>
        </div>

        {/* Variables container - PROPERLY SCROLLABLE */}
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='space-y-3'>
            {/* Header */}
            <div className='grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2'>
              <div>Variable Name</div>
              <div>Variable Value</div>
            </div>

            {/* Variables - larger inputs with more vertical space */}
            {(environmentVariables[activeEnvTab] || []).map((env, index) => (
              <div key={index} className='grid grid-cols-2 gap-3 p-4 border border-gray-100 rounded-lg hover:bg-gray-50'>
                <input
                  type='text'
                  value={env.key}
                  onChange={(e) => updateEnvironmentVariable(activeEnvTab, index, 'key', e.target.value)}
                  placeholder='Enter variable name (e.g., API_KEY)'
                  className='px-3 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <div className='relative flex items-center space-x-2'>
                  <input
                    type={env.isVisible ? 'text' : 'password'}
                    value={env.value}
                    onChange={(e) => updateEnvironmentVariable(activeEnvTab, index, 'value', e.target.value)}
                    placeholder='Enter variable value'
                    className='flex-1 px-3 py-3 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <button
                    onClick={() => toggleVisibility(activeEnvTab, index)}
                    className='absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded'
                    title={env.isVisible ? 'Hide value' : 'Show value'}
                  >
                    {env.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => removeEnvironmentVariable(activeEnvTab, index)}
                    className='px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200'
                    title='Remove variable'
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {/* Empty state with more vertical space */}
            {(!environmentVariables[activeEnvTab] || environmentVariables[activeEnvTab].length === 0) && (
              <div className='text-center py-16 text-gray-500'>
                <div className='text-lg mb-2'>No {activeEnvTab} variables yet</div>
                <div className='text-sm mb-4'>Click "Add Variable" to create your first environment variable</div>
                <div className='text-xs text-gray-400'>This area will scroll as you add more variables</div>
              </div>
            )}
            
            {/* Bottom padding to ensure comfortable scrolling */}
            <div className='h-8'></div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'general':
        return renderGeneralContent();
      case 'environment':
        return renderEnvironmentContent();
      case 'account':
        return renderAccountContent();
      default:
        return <div className='text-center text-gray-500 py-8'>Coming soon...</div>;
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Modal backdrop with blur */}
      <div
        className='fixed inset-0 bg-gray-900/10 backdrop-blur-md z-50 flex items-center justify-center p-4'
        onClick={onClose}
      >
        {/* Modal container - now responsive and scrollable */}
        <div
          className='bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative flex flex-col'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - fixed */}
          <div className='flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
            <h2 className='text-xl font-semibold text-gray-900'>Settings</h2>
            <button
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              onClick={onClose}
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          {/* Content area - scrollable */}
          <div className='flex flex-1 min-h-0'>
            {/* Sidebar - scrollable */}
            <div className='w-64 bg-gray-50 p-4 space-y-1 overflow-y-auto flex-shrink-0'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-white shadow-sm text-blue-600 border border-gray-200'
                      : 'hover:bg-white hover:bg-opacity-50 text-gray-600'
                  }`}
                >
                  <tab.icon className='w-4 h-4' />
                  <span className='text-sm font-medium'>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content - scrollable */}
            <div className='flex-1 overflow-y-auto bg-white'>
              <div className='p-6 h-full'>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default SettingsModal;
