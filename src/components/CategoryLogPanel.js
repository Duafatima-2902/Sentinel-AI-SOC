import React from 'react';

const CategoryLogPanel = ({ title, logs, category, color, icon }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-severity-low text-white',
      'Medium': 'bg-severity-medium text-white',
      'High': 'bg-severity-high text-white',
      'Critical': 'bg-severity-critical text-white'
    };
    return colors[severity] || colors.Low;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const categoryLogs = logs.filter(log => log.category === category);

  return (
    <div className={`bg-white rounded-lg shadow-lg border-2 border-${color}-200`}>
      <div className={`px-6 py-4 border-b border-${color}-200 bg-gradient-to-r from-${color}-50 to-${color}-100`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-${color}-500 rounded-lg flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600">{categoryLogs.length} logs</p>
          </div>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {categoryLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No {category.toLowerCase()} logs yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categoryLogs.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                  log.autoPatched ? 'border-patched bg-green-50' : 
                  log.severity === 'Critical' ? 'border-severity-critical' :
                  log.severity === 'High' ? 'border-severity-high' :
                  log.severity === 'Medium' ? 'border-severity-medium' : 'border-severity-low'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.autoPatched && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-patched text-white">
                          🔧 Auto-Patched
                        </span>
                      )}
                      {log.threatLevel && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Threat: {log.threatLevel}/4
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 font-mono break-words">
                      {log.message}
                    </p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Source: {log.source}</span>
                      {log.correlationId && <span>ID: {log.correlationId}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {categoryLogs.length > 20 && (
        <div className={`px-6 py-3 bg-${color}-50 border-t border-${color}-200`}>
          <p className="text-xs text-gray-600">
            Showing 20 of {categoryLogs.length} logs
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryLogPanel;
