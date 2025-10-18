import React, { useState, useEffect } from 'react';

const LogAnalysisPanel = ({ logs, alerts }) => {
  const [analysis, setAnalysis] = useState(null);
  const [correlations, setCorrelations] = useState([]);

  useEffect(() => {
    if (logs.length > 0) {
      performAnalysis();
    }
  }, [logs]);

  const performAnalysis = () => {
    // Analyze logs for patterns and correlations
    const analysis = {
      totalLogs: logs.length,
      categoryBreakdown: {},
      severityBreakdown: {},
      timePatterns: {},
      threatCorrelations: [],
      suspiciousActivities: [],
      autoPatchStats: {
        total: logs.filter(log => log.autoPatched).length,
        successRate: 0
      }
    };

    // Category breakdown
    logs.forEach(log => {
      analysis.categoryBreakdown[log.category] = (analysis.categoryBreakdown[log.category] || 0) + 1;
      analysis.severityBreakdown[log.severity] = (analysis.severityBreakdown[log.severity] || 0) + 1;
    });

    // Time pattern analysis
    const hourlyBreakdown = {};
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyBreakdown[hour] = (hourlyBreakdown[hour] || 0) + 1;
    });
    analysis.timePatterns = hourlyBreakdown;

    // Threat correlation analysis
    const ipAddresses = {};
    const users = {};
    logs.forEach(log => {
      const message = log.message.toLowerCase();
      
      // Extract IP addresses
      const ipMatch = message.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
      if (ipMatch) {
        const ip = ipMatch[0];
        ipAddresses[ip] = (ipAddresses[ip] || 0) + 1;
      }
      
      // Extract usernames
      const userMatch = message.match(/user\s+(\w+)/);
      if (userMatch) {
        const user = userMatch[1];
        users[user] = (users[user] || 0) + 1;
      }
    });

    // Find suspicious patterns
    Object.entries(ipAddresses).forEach(([ip, count]) => {
      if (count > 5) {
        analysis.suspiciousActivities.push({
          type: 'High IP Activity',
          value: ip,
          count: count,
          severity: count > 10 ? 'High' : 'Medium'
        });
      }
    });

    Object.entries(users).forEach(([user, count]) => {
      if (count > 3) {
        analysis.suspiciousActivities.push({
          type: 'High User Activity',
          value: user,
          count: count,
          severity: count > 8 ? 'High' : 'Medium'
        });
      }
    });

    // Auto-patch success rate
    const autoPatchableLogs = logs.filter(log => log.autoPatchable);
    if (autoPatchableLogs.length > 0) {
      analysis.autoPatchStats.successRate = Math.round(
        (analysis.autoPatchStats.total / autoPatchableLogs.length) * 100
      );
    }

    setAnalysis(analysis);
    generateCorrelations();
  };

  const generateCorrelations = () => {
    const correlations = [];
    
    // Find logs with same correlation ID
    const correlationGroups = {};
    logs.forEach(log => {
      if (log.correlationId) {
        if (!correlationGroups[log.correlationId]) {
          correlationGroups[log.correlationId] = [];
        }
        correlationGroups[log.correlationId].push(log);
      }
    });

    Object.entries(correlationGroups).forEach(([corrId, groupLogs]) => {
      if (groupLogs.length > 1) {
        correlations.push({
          id: corrId,
          logs: groupLogs,
          type: 'Correlated Events',
          severity: groupLogs.some(log => log.severity === 'Critical') ? 'Critical' : 
                   groupLogs.some(log => log.severity === 'High') ? 'High' : 'Medium'
        });
      }
    });

    setCorrelations(correlations);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'text-green-600',
      'Medium': 'text-yellow-600',
      'High': 'text-orange-600',
      'Critical': 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  };

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Log Analysis & Correlation</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time threat analysis and pattern detection</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Analysis Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600">Total Logs</h3>
            <p className="text-2xl font-bold text-blue-900">{analysis.totalLogs}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600">Auto-Patches</h3>
            <p className="text-2xl font-bold text-green-900">{analysis.autoPatchStats.total}</p>
            <p className="text-xs text-green-600">{analysis.autoPatchStats.successRate}% success</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-600">Suspicious Activities</h3>
            <p className="text-2xl font-bold text-yellow-900">{analysis.suspiciousActivities.length}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-600">Correlations</h3>
            <p className="text-2xl font-bold text-purple-900">{correlations.length}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Category Breakdown</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(analysis.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="bg-gray-50 rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full"
                    style={{ width: `${(count / analysis.totalLogs) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suspicious Activities */}
        {analysis.suspiciousActivities.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Suspicious Activities Detected</h3>
            <div className="space-y-2">
              {analysis.suspiciousActivities.map((activity, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-red-900">{activity.type}</span>
                      <p className="text-xs text-red-700">{activity.value} ({activity.count} occurrences)</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correlations */}
        {correlations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Event Correlations</h3>
            <div className="space-y-2">
              {correlations.slice(0, 5).map((correlation) => (
                <div key={correlation.id} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-900">{correlation.type}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      correlation.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      correlation.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {correlation.severity}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">ID: {correlation.id}</p>
                  <p className="text-xs text-indigo-600">{correlation.logs.length} related events</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogAnalysisPanel;
