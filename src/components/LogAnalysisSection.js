import React, { useState } from 'react';

const LogAnalysisSection = ({ logs, suspiciousActivities }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Calculate summary stats
  const totalLogs = logs.length;
  const autoPatchesCount = logs.filter(log => log.autoPatched).length;
  const autoPatchesPercentage = totalLogs > 0 ? Math.round((autoPatchesCount / totalLogs) * 100) : 0;
  const suspiciousCount = suspiciousActivities.length;

  // Group logs by category
  const logsByCategory = logs.reduce((acc, log) => {
    const category = log.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(log);
    return acc;
  }, {});

  const categories = [
    { name: 'Windows Firewall', icon: '🛡️', color: 'blue' },
    { name: 'Authentication', icon: '🔐', color: 'green' },
    { name: 'Email Security', icon: '📧', color: 'pink' },
    { name: 'Database', icon: '🗄️', color: 'purple' },
    { name: 'Network Security', icon: '🌐', color: 'indigo' },
    { name: 'System Performance', icon: '⚙️', color: 'gray' }
  ];

  const getSeverityBadge = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.Low;
  };

  const getCategoryColor = (color) => {
    const colors = {
      'blue': 'bg-blue-50 border-blue-200',
      'green': 'bg-green-50 border-green-200',
      'pink': 'bg-pink-50 border-pink-200',
      'purple': 'bg-purple-50 border-purple-200',
      'indigo': 'bg-indigo-50 border-indigo-200',
      'gray': 'bg-gray-50 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Log Analysis Summary */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Log Analysis & Correlation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalLogs.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Logs</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{autoPatchesPercentage}%</p>
              <p className="text-sm text-gray-600">Auto-Patches</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{suspiciousCount}</p>
              <p className="text-sm text-gray-600">Suspicious Activities</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => {
              const count = logsByCategory[category.name]?.length || 0;
              return (
                <div key={index} className={`p-4 rounded-lg border ${getCategoryColor(category.color)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Suspicious Activities */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Suspicious Activities Detected</h3>
          <div className="space-y-3">
            {suspiciousActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-mono text-sm">{activity.ip}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{activity.occurrences} attempts</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(activity.severity)}`}>
                    {activity.severity}
                  </span>
                </div>
              </div>
            ))}
            {suspiciousActivities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔒</div>
                <p>No suspicious activities detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Log Categories Accordion */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security Log Categories</h3>
          <div className="space-y-2">
            {categories.map((category, index) => {
              const categoryLogs = logsByCategory[category.name] || [];
              const isExpanded = expandedCategory === category.name;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {categoryLogs.length}
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {categoryLogs.slice(0, 10).map((log, logIndex) => (
                          <div key={logIndex} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 truncate">{log.message}</p>
                              <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getSeverityBadge(log.severity)}`}>
                              {log.severity}
                            </span>
                          </div>
                        ))}
                        {categoryLogs.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No logs in this category
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogAnalysisSection;
