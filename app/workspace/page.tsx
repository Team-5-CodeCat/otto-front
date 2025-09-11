'use client';

import React from 'react';
import { Play, Save, Settings } from 'lucide-react';

const WorkspacePage = () => {
  return (
    <div className="p-8">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">Workspace Canvas</h2>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              Active Project
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button className="flex items-center px-3 py-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              <Play className="w-4 h-4 mr-2" />
              Run
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building</h3>
              <p className="text-gray-600 mb-4 max-w-sm">
                Drag and drop blocks from the sidebar to start creating your workflow
              </p>
              <div className="flex justify-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                  Add Block
                </button>
                <button className="px-4 py-2 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors">
                  View Templates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;