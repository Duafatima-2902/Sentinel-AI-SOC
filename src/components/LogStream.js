import React from 'react';

const LogStream = ({ logs }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800 border-green-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Critical': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || colors.Low;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Windows Firewall': 'bg-blue-100 text-blue-800',
      'Network Security': 'bg-purple-100 text-purple-800',
      'Authentication': 'bg-indigo-100 text-indigo-800',
      'System Performance': 'bg-gray-100 text-gray-800',
      'File System': 'bg-pink-100 text-pink-800',
      'Database': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Live Log Stream</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time security logs</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>No logs yet. Click "Generate Logs" to start the demo.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                  log.autoPatched ? 'border-green-400 bg-green-50' : 
                  log.severity === 'Critical' ? 'border-red-400' :
                  log.severity === 'High' ? 'border-orange-400' :
                  log.severity === 'Medium' ? 'border-yellow-400' : 'border-green-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.autoPatched && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                      {log.correlationId && <span>Correlation: {log.correlationId}</span>}
                      {log.metadata && log.metadata.protocol && <span>Protocol: {log.metadata.protocol}</span>}
                    </div>
                    {log.metadata && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <div className="grid grid-cols-2 gap-2">
                          {log.metadata.environment && <span>Env: {log.metadata.environment}</span>}
                          {log.metadata.region && <span>Region: {log.metadata.region}</span>}
                          {log.metadata.cpuUsage && <span>CPU: {log.metadata.cpuUsage}%</span>}
                          {log.metadata.memoryUsage && <span>Memory: {log.metadata.memoryUsage}%</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {logs.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Showing {logs.length} most recent logs
          </p>
        </div>
      )}
    </div>
  );
};

export default LogStream;
