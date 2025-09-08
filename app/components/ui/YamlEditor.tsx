'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface YamlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onChange,
  placeholder = 'YAML configuration will appear here...',
  className
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={cn('h-full p-4', className)}>
      <textarea
        value={value}
        onChange={handleChange}
        className='w-full h-full resize-none border border-gray-300 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        placeholder={placeholder}
      />
    </div>
  );
};

export default YamlEditor;
