import React, { useState, useEffect } from 'react';

const AlertsPanel = ({ alerts, onPatchAlert }) => {
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [showPatchModal, setShowPatchModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    // Fetch blocked IPs
    const fetchBlockedIPs = async () => {
      try {
        const response = await fetch(`${process.env.NODE_ENV === 'production' 
          ? 'https://soc-demo-app.vercel.app' 
          : 'http://localhost:5000'}/api/blocked-ips`);
        const data = await response.json();
        if (data.success) {
          setBlockedIPs(data.blockedIPs);
        }
      } catch (error) {
        console.error('Error fetching blocked IPs:', error);
      }
    };

    fetchBlockedIPs();
    const interval = setInterval(fetchBlockedIPs, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-severity-low text-white border-severity-low',
      'Medium': 'bg-severity-medium text-white border-severity-medium',
      'High': 'bg-severity-high text-white border-severity-high',
      'Critical': 'bg-severity-critical text-white border-severity-critical'
    };
    return colors[severity] || colors.Low;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'Low': 'ℹ️',
      'Medium': '⚠️',
      'High': '🚨',
      'Critical': '🔴'
    };
    return icons[severity] || 'ℹ️';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handlePatchClick = (alert) => {
    setSelectedAlert(alert);
    setShowPatchModal(true);
  };

  const handlePatchConfirm = () => {
    if (selectedAlert && onPatchAlert) {
      onPatchAlert(selectedAlert);
    }
    setShowPatchModal(false);
    setSelectedAlert(null);
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="bg-soc-secondary rounded-lg shadow-lg border border-soc-accent">
      <div className="px-6 py-4 border-b border-soc-accent">
        <h2 className="text-lg font-semibold text-white">Security Alerts</h2>
        <p className="text-sm text-gray-300 mt-1">
          {unacknowledgedAlerts.length} unacknowledged, {acknowledgedAlerts.length} acknowledged
        </p>
        {blockedIPs.length > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blocked text-white">
              🚫 {blockedIPs.length} IPs Blocked
            </span>
          </div>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-gray-300">
            <div className="text-4xl mb-2">🔒</div>
            <p>No alerts yet. High/Critical logs will trigger alerts.</p>
          </div>
        ) : (
          <div className="divide-y divide-soc-accent">
            {/* Unacknowledged alerts first */}
            {unacknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 ${alert.acknowledged ? 'bg-gray-50 opacity-75' : 'bg-soc-primary'} transition-all hover:bg-soc-accent/20`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-xl">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      {alert.acknowledged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-soc-success text-white">
                          ✓ Acknowledged
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white font-medium mb-1">
                      {alert.message}
                    </p>
                    {alert.log && (
                      <p className="text-xs text-gray-300 font-mono bg-soc-secondary p-2 rounded">
                        {alert.log.message}
                      </p>
                    )}
                    {(alert.severity === 'High' || alert.severity === 'Critical') && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handlePatchClick(alert)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-soc-accent hover:bg-blue-600 text-white transition-colors"
                        >
                          🔧 Patch
                        </button>
                        <button
                          onClick={() => {/* Handle acknowledge */}}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-soc-success hover:bg-green-600 text-white transition-colors"
                        >
                          ✓ Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Acknowledged alerts */}
            {acknowledgedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-soc-secondary opacity-75 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-xl">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-soc-success text-white">
                        ✓ Acknowledged
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">
                      {alert.message}
                    </p>
                    {alert.log && (
                      <p className="text-xs text-gray-300 font-mono bg-soc-primary p-2 rounded">
                        {alert.log.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {alerts.length > 0 && (
        <div className="px-6 py-3 bg-soc-primary border-t border-soc-accent">
          <p className="text-xs text-gray-300">
            Showing {alerts.length} alerts ({unacknowledgedAlerts.length} active)
          </p>
        </div>
      )}

      {/* Patch Confirmation Modal */}
      {showPatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-soc-secondary rounded-lg p-6 max-w-md w-full mx-4 border border-soc-accent">
            <h3 className="text-lg font-semibold text-white mb-4">Apply Security Patch</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to apply a security patch for this alert?
            </p>
            {selectedAlert && (
              <div className="bg-soc-primary p-3 rounded mb-4">
                <p className="text-sm text-white font-medium">{selectedAlert.message}</p>
                <p className="text-xs text-gray-300 mt-1">Severity: {selectedAlert.severity}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handlePatchConfirm}
                className="flex-1 bg-soc-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Apply Patch
              </button>
              <button
                onClick={() => setShowPatchModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
