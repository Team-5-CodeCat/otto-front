'use client';

import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Floating Sidebar Test</h1>
        <p className="text-gray-600 mb-8">Testing the new floating sidebar layout with separated card sections</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Main Content Area</h2>
            <p className="text-gray-600 mb-6">
              This content area now spans the full width of the screen. The sidebar floats over the content 
              on the left side with separated card sections for better visual hierarchy.
            </p>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <h3 className="font-medium mb-2">Full Width Layout</h3>
                <p className="text-blue-100 text-sm">Content can now utilize the entire screen width</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <h3 className="font-medium mb-2">Floating Sidebar</h3>
                <p className="text-green-100 text-sm">Sidebar floats above content with elegant shadows</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Separated Cards</h3>
                  <p className="text-gray-600 text-sm">Each section has its own card with shadows</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Floating Position</h3>
                  <p className="text-gray-600 text-sm">Sidebar floats over content with z-index positioning</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Full Width Content</h3>
                  <p className="text-gray-600 text-sm">Content area uses entire screen width</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Layout Grid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="w-full h-24 bg-gray-300 rounded-lg mb-3"></div>
                <h3 className="font-medium text-gray-900 mb-1">Card {index + 1}</h3>
                <p className="text-gray-600 text-sm">Sample content for testing the layout</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;