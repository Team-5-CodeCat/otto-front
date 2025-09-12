import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  label: string;
  isOn: boolean;
  onToggle: (checked: boolean) => void;
}

// 토글 스위치 컴포넌트
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, isOn, onToggle }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onToggle(!isOn)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-lg cursor-pointer',
          isOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm',
            isOn ? 'translate-x-6 scale-110' : 'translate-x-1 hover:scale-105'
          )}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
export { ToggleSwitch };