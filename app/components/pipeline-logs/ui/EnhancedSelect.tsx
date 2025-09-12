import React from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface EnhancedSelectProps {
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  icon?: React.ReactNode;
}

// 향상된 Select 컴포넌트
const EnhancedSelect: React.FC<EnhancedSelectProps> = ({ placeholder, value, onValueChange, options }) => {
  return (
    <select 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
          {option.description && ` - ${option.description}`}
        </option>
      ))}
    </select>
  );
};

export default EnhancedSelect;
export { EnhancedSelect };