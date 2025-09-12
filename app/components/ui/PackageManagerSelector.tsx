'use client';

import React, { useState } from 'react';
import { ChevronDown, Package, Plus, X } from 'lucide-react';

export type PackageManager = 'apt' | 'yum' | 'apk' | 'dnf' | 'zypper' | 'pacman' | 'brew';

interface PackageManagerSelectorProps {
  selectedManager: PackageManager;
  onManagerChange: (manager: PackageManager) => void;
  packages: string[];
  onPackagesChange: (packages: string[]) => void;
  className?: string;
}

const PACKAGE_MANAGERS: { value: PackageManager; label: string; description: string }[] = [
  { value: 'apt', label: 'APT', description: 'Debian/Ubuntu' },
  { value: 'yum', label: 'YUM', description: 'Red Hat/CentOS' },
  { value: 'dnf', label: 'DNF', description: 'Fedora' },
  { value: 'apk', label: 'APK', description: 'Alpine Linux' },
  { value: 'zypper', label: 'Zypper', description: 'openSUSE' },
  { value: 'pacman', label: 'Pacman', description: 'Arch Linux' },
  { value: 'brew', label: 'Homebrew', description: 'macOS/Linux' },
];

export const PackageManagerSelector: React.FC<PackageManagerSelectorProps> = ({
  selectedManager,
  onManagerChange,
  packages,
  onPackagesChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPackage, setNewPackage] = useState('');

  const selectedManagerInfo = PACKAGE_MANAGERS.find(pm => pm.value === selectedManager);

  const handleAddPackage = () => {
    if (newPackage.trim() && !packages.includes(newPackage.trim())) {
      onPackagesChange([...packages, newPackage.trim()]);
      setNewPackage('');
    }
  };

  const handleRemovePackage = (packageName: string) => {
    onPackagesChange(packages.filter(pkg => pkg !== packageName));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPackage();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 패키지 매니저 선택 */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Package Manager
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center space-x-2">
            <Package size={16} className="text-gray-500" />
            <div className="text-left">
              <div className="font-medium">{selectedManagerInfo?.label}</div>
              <div className="text-xs text-gray-500">{selectedManagerInfo?.description}</div>
            </div>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            {PACKAGE_MANAGERS.map((pm) => (
              <button
                key={pm.value}
                type="button"
                onClick={() => {
                  onManagerChange(pm.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                  selectedManager === pm.value ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <div className="font-medium">{pm.label}</div>
                <div className="text-xs text-gray-500">{pm.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 패키지 추가 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Packages
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newPackage}
            onChange={(e) => setNewPackage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter package name"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddPackage}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* 패키지 목록 */}
      {packages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Packages ({packages.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {packages.map((pkg) => (
              <span
                key={pkg}
                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg"
              >
                {pkg}
                <button
                  type="button"
                  onClick={() => handleRemovePackage(pkg)}
                  className="ml-1 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagerSelector;