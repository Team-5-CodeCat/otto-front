import { useEffect, useCallback } from 'react';
import { KeyboardShortcut, ViewMode } from '../types';

interface UseKeyboardShortcutsProps {
  isOpen: boolean;
  viewMode: ViewMode;
  onClose: () => void;
  onToggleViewMode: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onFocusSearch?: () => void;
  onOpenInNewWindow?: () => void;
}

export const useKeyboardShortcuts = ({
  isOpen,
  viewMode,
  onClose,
  onToggleViewMode,
  onNavigate,
  onFocusSearch,
  onOpenInNewWindow
}: UseKeyboardShortcutsProps) => {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'Escape',
      action: () => {
        if (viewMode === 'expanded') {
          onToggleViewMode();
        } else {
          onClose();
        }
      },
      description: 'Close modal or collapse view'
    },
    {
      key: ' ',
      action: onToggleViewMode,
      description: 'Toggle summary/expanded view'
    },
    {
      key: 'ArrowUp',
      action: () => onNavigate?.('prev'),
      description: 'Navigate to previous log'
    },
    {
      key: 'ArrowDown',
      action: () => onNavigate?.('next'),
      description: 'Navigate to next log'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => onFocusSearch?.(),
      description: 'Focus search input'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => onOpenInNewWindow?.(),
      description: 'Open in new window'
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    // 입력 필드에서는 단축키 비활성화
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Ctrl+F는 입력 필드에서도 허용
      if (event.key === 'f' && event.ctrlKey) {
        event.preventDefault();
        onFocusSearch?.();
      }
      return;
    }

    const shortcut = shortcuts.find(s => {
      const keyMatch = s.key === event.key;
      const ctrlMatch = (s.ctrlKey || false) === event.ctrlKey;
      const altMatch = (s.altKey || false) === event.altKey;
      const metaMatch = (s.metaKey || false) === event.metaKey;
      
      return keyMatch && ctrlMatch && altMatch && metaMatch;
    });

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    }
  }, [
    isOpen,
    shortcuts,
    onFocusSearch
  ]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return shortcuts;
};