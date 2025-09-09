'use client';

import React from 'react';

interface DropdownSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; name: string }>;
  placeholder?: string;
  disabled?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
}) => {
  return (
    <div className='mb-4'>
      <label className='block text-xs font-medium text-gray-900 mb-2'>{label}</label>
      <div className='relative'>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer'
          disabled={disabled}
        >
          <option value=''>{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
          <svg className='w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DropdownSelect;
