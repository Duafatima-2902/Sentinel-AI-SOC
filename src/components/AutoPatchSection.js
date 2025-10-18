import React, { useState } from 'react';

const AutoPatchSection = ({ patches }) => {
  const [showAllPatches, setShowAllPatches] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, severity, status
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status) => {
    const icons = {
      'completed': '✅',
      'pending': '⏳',
      'failed': '❌',
      'in_progress': '🔄'
    };
    return icons[status] || '⏳';
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'text-green-600',
      'pending': 'text-yellow-600',
      'failed': 'text-red-600',
      'in_progress': 'text-blue-600'
    };
    return colors[status] || 'text-yellow-600';
  };

  // Sort patches based on selected criteria
  const sortedPatches = [...patches].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'severity':
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = severityOrder[a.severity] || 0;
        bValue = severityOrder[b.severity] || 0;
        break;
      case 'status':
        const statusOrder = { 'completed': 4, 'in_progress': 3, 'pending': 2, 'failed': 1 };
        aValue = statusOrder[a.status] || 0;
        bValue = statusOrder[b.status] || 0;
        break;
      case 'timestamp':
      default:
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const displayedPatches = showAllPatches ? sortedPatches : sortedPatches.slice(0, 10);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🔧</span>
          Auto-Patch System
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total Patches:</span> {patches.length}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Success Rate:</span> 
            <span className="ml-1 text-green-600 font-bold">
              {patches.length > 0 ? Math.round((patches.filter(p => p.status === 'completed').length / patches.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      {patches.length > 0 && (
        <div className="mb-4 flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => handleSort('timestamp')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'timestamp' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Time {sortBy === 'timestamp' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('severity')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'severity' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Severity {sortBy === 'severity' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('status')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'status' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Severity</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Patched By</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Execution Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {displayedPatches.map((patch, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getStatusColor(patch.status)}`}>
                      {getStatusIcon(patch.status)}
                    </span>
                    <span className={`text-sm font-medium capitalize ${getStatusColor(patch.status)}`}>
                      {patch.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-gray-900 font-medium">{patch.description}</p>
                  {patch.automated && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Automated
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    {patch.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    patch.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    patch.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    patch.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {patch.severity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {patch.patchedBy === 'Auto-Policy' ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <span className="mr-1">✅</span>
                        Auto-Policy
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        <span className="mr-1">👤</span>
                        Manual
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {patch.executionTime ? `${patch.executionTime}ms` : 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">
                    {formatTimestamp(patch.timestamp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {patches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-lg font-medium mb-2">No patches applied yet</p>
          <p className="text-sm">Auto-patches will appear here when security threats are detected and resolved.</p>
        </div>
      )}

      {patches.length > 10 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowAllPatches(!showAllPatches)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showAllPatches ? 'Show Less' : `View All Patches (${patches.length})`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoPatchSection;
