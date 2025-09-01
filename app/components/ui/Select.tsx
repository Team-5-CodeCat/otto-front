import React from 'react';

interface Option {
  label: string; // 표시 라벨 (영문)
  value: string; // 전송 값
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; // 라벨 텍스트
  description?: string; // 라벨 아래 설명 (한국어)
  error?: string | undefined; // 에러 메시지
  options: Option[]; // 선택 옵션들
}

const Select: React.FC<SelectProps> = ({
  label,
  description,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const base =
    'w-full h-10 rounded-md border border-gray-300 bg-transparent px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';
  const errorCls = error ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
      )}
      {description && <p className='text-xs text-gray-500 mb-2'>{description}</p>}
      <select id={id} className={`${base} ${errorCls} ${className}`} {...props}>
        <option value='' disabled hidden>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default Select;
