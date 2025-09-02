'use client';

import React, { useState } from 'react';

interface EnvVariable {
  key: string;
  value: string;
}

interface EnvPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (envVars: EnvVariable[]) => void;
}

const EnvPopup: React.FC<EnvPopupProps> = ({ isOpen, onClose, onSave }) => {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([{ key: '', value: '' }]);
  const [showValues, setShowValues] = useState<boolean[]>([]);

  if (!isOpen) return null;

  const addNewRow = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
    setShowValues([...showValues, false]);
  };

  const removeRow = (index: number) => {
    if (envVars.length > 1) {
      const newEnvVars = envVars.filter((_, i) => i !== index);
      const newShowValues = showValues.filter((_, i) => i !== index);
      setEnvVars(newEnvVars);
      setShowValues(newShowValues);
    }
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const toggleValueVisibility = (index: number) => {
    const newShowValues = [...showValues];
    newShowValues[index] = !newShowValues[index];
    setShowValues(newShowValues);
  };

  const handleSave = () => {
    const validEnvVars = envVars.filter((env) => env.key.trim() !== '');
    onSave(validEnvVars);
    onClose();
  };

  const handleCancel = () => {
    setEnvVars([{ key: '', value: '' }]);
    setShowValues([]);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-gray-800 rounded-lg p-6 w-96 max-h-96 overflow-y-auto shadow-2xl border border-gray-600'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-white'>환경 변수 설정</h2>
          <button
            onClick={handleCancel}
            className='text-gray-400 hover:text-white transition-colors'
            style={{ fontSize: '18px' }}
          >
            ✕
          </button>
        </div>

        <div className='space-y-3 mb-4'>
          {envVars.map((envVar, index) => (
            <div key={index} className='flex items-center space-x-2'>
              <input
                type='text'
                placeholder='키'
                value={envVar.key}
                onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                className='flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400'
              />
              <div className='flex-1 relative'>
                <input
                  type={showValues[index] ? 'text' : 'password'}
                  placeholder='값'
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  className='w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400'
                />
                <button
                  type='button'
                  onClick={() => toggleValueVisibility(index)}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                  title={showValues[index] ? '값 숨기기' : '값 보기'}
                >
                  {showValues[index] ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                onClick={() => removeRow(index)}
                className='px-2 py-2 text-red-400 hover:text-red-300 transition-colors'
                disabled={envVars.length === 1}
                title='행 삭제'
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className='flex justify-between'>
          <button
            onClick={addNewRow}
            className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors'
          >
            행 추가
          </button>
          <div className='space-x-2'>
            <button
              onClick={handleCancel}
              className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors'
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors'
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvPopup;
