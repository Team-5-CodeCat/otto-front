'use client';

import React from 'react';
import Link from 'next/link';

interface ActionIconsProps {
  icons: Array<{
    href?: string;
    title: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }>;
}

const ActionIcons: React.FC<ActionIconsProps> = ({ icons }) => {
  return (
    <div className='flex space-x-2'>
      {icons.map((icon, index) => {
        // onClick이 있으면 button, href가 있으면 Link 사용
        if (icon.onClick) {
          return (
            <button
              key={index}
              onClick={icon.onClick}
              className='flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group'
              title={icon.title}
            >
              <div className='w-5 h-5 text-gray-600 group-hover:text-emerald-600 mx-auto'>
                {icon.icon}
              </div>
            </button>
          );
        }
        
        if (icon.href) {
          return (
            <Link
              key={index}
              href={icon.href}
              className='flex-1 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group'
              title={icon.title}
            >
              <div className='w-5 h-5 text-gray-600 group-hover:text-emerald-600 mx-auto'>
                {icon.icon}
              </div>
            </Link>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default ActionIcons;
