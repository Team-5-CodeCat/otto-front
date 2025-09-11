'use client';

import React from 'react';
import WorkspaceLayout from '../components/workspace/WorkspaceLayout';
import { Play, Save, Settings, Download } from 'lucide-react';

const WorkspacePage = () => {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-base-content">Workspace Canvas</h2>
            <div className="badge badge-primary badge-outline">Active Project</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="btn btn-ghost btn-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button className="btn btn-outline btn-sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
            <button className="btn btn-primary btn-sm">
              <Play className="w-4 h-4 mr-2" />
              Run
            </button>
          </div>
        </div>

        <div className="flex-1 bg-base-200/30 rounded-2xl border-2 border-dashed border-base-300 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-base-content mb-2">Start Building</h3>
              <p className="text-base-content/70 mb-4 max-w-sm">
                Drag and drop blocks from the sidebar to start creating your workflow
              </p>
              <div className="flex justify-center space-x-2">
                <button className="btn btn-primary btn-sm">Add Block</button>
                <button className="btn btn-ghost btn-sm">View Templates</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};

export default WorkspacePage;
