import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; // 라벨 텍스트
  description?: string; // 라벨 아래 설명 (한국어)
  error?: string | undefined; // 에러 메시지
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  description,
  error,
  className,
  id,
  ...props
}) => {
  const base =
    'w-full min-h-[90px] rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
      )}
      {description && <p className='text-xs text-gray-500 mb-2'>{description}</p>}
      <textarea id={id} className={cn(
        base,
        error && 'border-red-500 focus:ring-red-500',
        className
      )} {...props} />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  );
};

export default Textarea;
