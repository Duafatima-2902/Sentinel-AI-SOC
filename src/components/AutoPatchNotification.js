import React, { useState, useEffect } from 'react';

const AutoPatchNotification = ({ patches }) => {
  const [visiblePatches, setVisiblePatches] = useState([]);

  useEffect(() => {
    if (patches && patches.length > 0) {
      // Show the latest patch
      const latestPatch = patches[patches.length - 1];
      setVisiblePatches([latestPatch]);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisiblePatches([]);
      }, 5000);
    }
  }, [patches]);

  const removeNotification = (patchId) => {
    setVisiblePatches(prev => prev.filter(patch => patch.id !== patchId));
  };

  if (visiblePatches.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {visiblePatches.map((patch) => (
        <div
          key={patch.id}
          className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm animate-slide-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🔧</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-green-900">
                  Auto-Patch Applied
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  {patch.description}
                </p>
                <div className="mt-2 flex items-center space-x-2 text-xs text-green-600">
                  <span>Category: {patch.category}</span>
                  <span>•</span>
                  <span>{patch.executionTime}ms</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeNotification(patch.id)}
              className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutoPatchNotification;
