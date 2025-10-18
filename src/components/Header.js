import React from 'react';

const Header = ({ threatLevel, isConnected, monitoringStats, darkMode, setDarkMode, activeTab, setActiveTab }) => {
  const formatUptime = (uptime) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getThreatLevelStyles = (level) => {
    const styles = {
      'LOW': {
        bg: 'bg-green-500',
        text: 'text-white',
        pulse: ''
      },
      'MEDIUM': {
        bg: 'bg-yellow-500',
        text: 'text-white',
        pulse: ''
      },
      'HIGH': {
        bg: 'bg-orange-500',
        text: 'text-white',
        pulse: ''
      },
      'CRITICAL': {
        bg: 'bg-red-500',
        text: 'text-white',
        pulse: 'animate-pulse'
      }
    };
    return styles[level] || styles.LOW;
  };

  const threatStyles = getThreatLevelStyles(threatLevel);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 shadow-xl border-b transition-all duration-500 ${
      darkMode ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-purple-900 border-slate-700' : 'bg-gradient-to-r from-gray-50 via-white to-purple-50 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Branding */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <h1 className={`text-xl font-bold transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sentinel AI
            </h1>
          </div>

          {/* Center - Threat Level */}
          <div className="flex items-center justify-center flex-1">
            <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${threatStyles.bg} ${threatStyles.text} ${threatStyles.pulse}`}>
              <span className="mr-2">🛡️</span>
              <span>Threat Level: {threatLevel}</span>
            </span>
          </div>

          {/* Right Side - Controls & Status */}
          <div className="flex items-center space-x-4">
            
            {/* Monitoring Time */}
            {monitoringStats && (
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  <span className="mr-2">⏱️</span>
                  <span>Monitoring: {formatUptime(monitoringStats.uptime)}</span>
                </span>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isConnected
                  ? darkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'
                  : darkMode ? 'bg-red-900/30 text-red-200' : 'bg-red-100 text-red-800'
              }`}>
                <span className="mr-2">{isConnected ? '✅' : '❌'}</span>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </span>
            </div>

            {/* Live Monitoring */}
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                darkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                <span>🔴 Live Monitoring</span>
              </span>
            </div>

            {/* Dark Mode Toggle - Icon Only (Rightmost) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
