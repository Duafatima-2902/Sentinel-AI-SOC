import React from 'react';

const ThreatInsights = ({ logs, alerts, darkMode }) => {
  // Generate mock threat sources data
  const getTopThreatSources = () => {
    const threatSources = [
      { ip: '203.0.113.42', attempts: 12, severity: 'Critical', country: '🇺🇸', countryName: 'United States' },
      { ip: '198.51.100.1', attempts: 8, severity: 'High', country: '🇨🇳', countryName: 'China' },
      { ip: '192.0.2.100', attempts: 6, severity: 'High', country: '🇳🇬', countryName: 'Nigeria' },
      { ip: '203.0.113.50', attempts: 4, severity: 'Medium', country: '🇷🇺', countryName: 'Russia' },
      { ip: '198.51.100.5', attempts: 3, severity: 'Medium', country: '🇰🇷', countryName: 'South Korea' }
    ];
    return threatSources;
  };

  // Generate mock critical incidents timeline
  const getCriticalIncidents = () => {
    const incidents = [
      { time: '9:12 PM', severity: 'Critical', description: 'SQL Injection attempt blocked', icon: '🔴' },
      { time: '8:45 PM', severity: 'Critical', description: 'DDoS attack detected and mitigated', icon: '🔴' },
      { time: '8:23 PM', severity: 'High', description: 'Brute force attack on admin account', icon: '🟠' },
      { time: '7:58 PM', severity: 'Critical', description: 'Malware payload blocked at firewall', icon: '🔴' },
      { time: '7:31 PM', severity: 'High', description: 'Suspicious file upload attempt', icon: '🟠' }
    ];
    return incidents;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[severity] || colors.Low;
  };

  const threatSources = getTopThreatSources();
  const criticalIncidents = getCriticalIncidents();

  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all duration-500">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">🔎</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Threat Insights</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Threat Sources Widget */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <span className="text-lg mr-2">🌍</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Threat Sources</h3>
            </div>
            
            <div className="space-y-3">
              {threatSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{source.country}</span>
                    <div>
                      <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                        {source.ip}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {source.countryName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {source.attempts} attempts
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(source.severity)}`}>
                      {source.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Incidents Timeline Widget */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <span className="text-lg mr-2">🕒</span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Critical Incident Timeline</h3>
            </div>
            
            <div className="space-y-3">
              {criticalIncidents.map((incident, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{incident.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {incident.description}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {incident.time}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatInsights;

