import React from 'react';

const PatchedLogsPanel = ({ logs }) => {
  const patchedLogs = logs.filter(log => log.autoPatched);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Windows Firewall': 'bg-firewall text-white',
      'Network Security': 'bg-network text-white',
      'Authentication': 'bg-auth text-white',
      'System Performance': 'bg-system text-white',
      'File System': 'bg-file text-white',
      'Database': 'bg-database text-white'
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-patched">
      <div className="px-6 py-4 border-b border-patched bg-gradient-to-r from-green-50 to-green-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-patched rounded-lg flex items-center justify-center text-white text-xl">
            🔧
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Auto-Patched Logs</h2>
            <p className="text-sm text-gray-600">{patchedLogs.length} successfully patched</p>
          </div>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {patchedLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <p>No patched logs yet. Low severity logs will be auto-patched.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {patchedLogs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-green-50 transition-colors border-l-4 border-patched bg-green-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${getCategoryColor(log.category)}`}>
                        {log.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-patched text-white">
                        ✅ Patched
                      </span>
                      {log.patchId && (
                        <span className="text-xs text-gray-500">
                          Patch: {log.patchId.slice(-8)}
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
      
      {patchedLogs.length > 15 && (
        <div className="px-6 py-3 bg-green-50 border-t border-patched">
          <p className="text-xs text-gray-600">
            Showing 15 of {patchedLogs.length} patched logs
          </p>
        </div>
      )}
    </div>
  );
};

export default PatchedLogsPanel;
