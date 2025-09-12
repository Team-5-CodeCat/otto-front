'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Settings, User, Palette, Server, Monitor, Key, Shield, CreditCard, X } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedTab, setSelectedTab] = React.useState('general');
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const renderAccountContent = () => (
    <div className='space-y-6'>
      <div className='flex items-center space-x-4'>
        <div className='avatar'>
          <div className='w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center'>
            <User className='w-8 h-8' />
          </div>
        </div>
        <div>
          <h3 className='text-lg font-semibold'>{user?.nickname || 'Guest User'}</h3>
          <p className='text-sm text-gray-500'>{user?.email || 'Not connected to server'}</p>
        </div>
      </div>

      <div className='form-control w-full max-w-xs'>
        <label className='label'>
          <span className='label-text'>Name</span>
        </label>
        <div className='flex space-x-2'>
          <input
            type='text'
            value={user?.nickname || ''}
            className='input input-bordered flex-1'
            readOnly
          />
          <button className='btn btn-outline btn-sm'>update</button>
        </div>
      </div>

      <div className='form-control w-full max-w-xs'>
        <label className='label'>
          <span className='label-text'>Email</span>
        </label>
        <input type='email' value={user?.email || ''} className='input input-bordered' readOnly />
      </div>

      <div className='form-control w-full max-w-xs'>
        <label className='label'>
          <span className='label-text'>Password</span>
        </label>
        <div className='flex space-x-2'>
          <input
            type='password'
            value='••••••••'
            className='input input-bordered flex-1'
            readOnly
          />
          <button className='btn btn-outline btn-sm'>reset</button>
        </div>
      </div>

      <div className='pt-4'>
        <button className='btn btn-error' onClick={signOut}>
          Sign Out
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'general':
        return renderGeneralContent();
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
        className='fixed inset-0 bg-gray-900/10 backdrop-blur-md z-50 flex items-center justify-center'
        onClick={onClose}
      >
        {/* Modal container */}
        <div
          className='bg-white rounded-lg shadow-2xl w-11/12 max-w-5xl h-[600px] overflow-hidden relative'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
            <h2 className='text-xl font-semibold text-gray-900'>Settings</h2>
            <button
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              onClick={onClose}
            >
              <X className='w-4 h-4' />
            </button>
          </div>

          <div className='flex h-[calc(100%-64px)]'>
            {/* Sidebar */}
            <div className='w-64 bg-gray-50 p-4 space-y-1 overflow-y-auto'>
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

            {/* Content */}
            <div className='flex-1 p-6 overflow-y-auto bg-white'>{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default SettingsModal;
