'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  placeholder = 'JSON configuration will appear here...',
  className
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  // JSON 포맷팅 함수
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
    } catch {
      // JSON이 유효하지 않으면 포맷팅하지 않음
      console.warn('Invalid JSON, skipping format');
    }
  };

  return (
    <div className={cn('h-full p-4', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">JSON Editor</span>
        <button
          onClick={formatJson}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
        >
          Format
        </button>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        className='w-full h-[calc(100%-2rem)] resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        placeholder={placeholder}
      />
    </div>
  );
};

export default JsonEditor;