import React from 'react';
import { cn } from '@/lib/utils';

// Input 컴포넌트의 props 타입 정의
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  helperText?: string;
  description?: string; // 입력 필드 설명 텍스트
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Input 컴포넌트
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  description,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  // 기본 스타일 클래스
  const baseClasses =
    'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className='w-full'>
      {/* 라벨 */}
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
      )}

      {/* 설명 텍스트 */}
      {description && <p className='text-sm text-gray-600 mb-2'>{description}</p>}

      {/* 입력 필드 컨테이너 */}
      <div className='relative'>
        {/* 왼쪽 아이콘 */}
        {leftIcon && (
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
            {leftIcon}
          </div>
        )}

        {/* 입력 필드 */}
        <input id={id} className={cn(
          baseClasses,
          error && 'border-red-500 focus:ring-red-500',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )} {...props} />

        {/* 오른쪽 아이콘 */}
        {rightIcon && (
          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
            {rightIcon}
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

      {/* 도움말 텍스트 */}
      {helperText && !error && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
    </div>
  );
};

export default Input;
