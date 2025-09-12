'use client';

import React, { useState } from 'react';
import { LogDetailsPanel } from './index';

// Demo component to test the LogDetailsPanel functionality
const LogDetailsPanelDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState('1');

  const mockBuilds = [
    { id: '1', name: 'Success Build' },
    { id: '2', name: 'Failed Build' },
    { id: '3', name: 'Running Build' },
    { id: '4', name: 'Migration Failed' },
    { id: '5', name: 'Large Log Build' }
  ];

  const handleOpenPanel = (buildId: string) => {
    setSelectedBuildId(buildId);
    setIsOpen(true);
  };

  const handleClosePanel = () => {
    setIsOpen(false);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const currentIndex = mockBuilds.findIndex(build => build.id === selectedBuildId);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedBuildId(mockBuilds[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < mockBuilds.length - 1) {
      setSelectedBuildId(mockBuilds[currentIndex + 1].id);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          CI/CD Log Details Panel Demo
        </h1>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Sample Build List</h2>
            <p className="text-sm text-gray-600 mt-1">
              Click on any build row to open the log details panel
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockBuilds.map((build) => (
              <div
                key={build.id}
                onClick={() => handleOpenPanel(build.id)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{build.name}</h3>
                    <p className="text-sm text-gray-600">Build ID: {build.id}</p>
                  </div>
                  <div className="text-sm text-blue-600">Click to view logs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Features Demonstration</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Build ID 1:</strong> Success case with full pipeline and deployment info</li>
            <li>• <strong>Build ID 2:</strong> Failed build with error summary and failed tests</li>
            <li>• <strong>Build ID 3:</strong> Currently running build with in-progress status</li>
            <li>• <strong>Build ID 4:</strong> Database migration failure case</li>
            <li>• <strong>Build ID 5:</strong> Large log data for performance testing (5000+ lines)</li>
          </ul>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Updated UI Features</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Header Controls:</strong> Expand, Previous/Next navigation, and Close buttons</li>
            <li>• <strong>Status Badges:</strong> Consistent design with the main logs table</li>
            <li>• <strong>Time Format:</strong> Updated to YYYY/MM/DD HH:MM:SS format</li>
            <li>• <strong>Simplified UI:</strong> Removed unnecessary buttons and streamlined interface</li>
            <li>• <strong>Keyboard Shortcuts:</strong> Space (Expand), Esc (Close), ↑/↓ (Navigate)</li>
          </ul>
        </div>
      </div>

      {/* LogDetailsPanel */}
      <LogDetailsPanel
        buildId={selectedBuildId}
        isOpen={isOpen}
        onClose={handleClosePanel}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default LogDetailsPanelDemo;