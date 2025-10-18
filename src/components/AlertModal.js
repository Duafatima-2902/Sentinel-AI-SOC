import React, { useEffect, useState } from 'react';

const AlertModal = ({ alert, onAction, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          // Auto-patch when timer expires
          onAction(alert.id, 'Auto-Policy');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, alert.id, onAction]);

  const getSeverityPill = (severity) => {
    const colors = {
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Critical': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity] || colors.High;
  };

  const getHeaderBg = (severity) => severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500';

  const getSeverityIcon = (severity) => {
    const icons = {
      'High': '⚠️',
      'Critical': '🔴'
    };
    return icons[severity] || '⚠️';
  };

  const handleAction = (action) => {
    setIsActive(false);
    onAction(alert.id, action);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
        {/* Header with severity color */}
        <div className={`px-6 py-4 ${getHeaderBg(alert.severity)} rounded-t-2xl text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
              <h3 className="text-lg font-bold">Security Alert</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Grace Period Countdown */}
          {isActive && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">Auto-patching in:</span>
                <span className="text-lg font-bold text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Severity Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityPill(alert.severity)}`}>
              <span className="mr-1">{getSeverityIcon(alert.severity)}</span>
              {alert.severity} SEVERITY
            </span>
          </div>

          {/* Alert Message */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Alert Details</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{alert.message}</p>
          </div>

          {/* Log Details */}
          {alert.log && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2 text-sm">Source Log</h5>
              <p className="text-xs text-gray-600 font-mono break-all">{alert.log.message}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>Category: {alert.log.category}</span>
                <span>{new Date(alert.log.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mb-6 text-xs text-gray-500">
            Alert triggered: {new Date(alert.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction('Manual')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              ✓ Patch Now
            </button>
            <button
              onClick={() => handleAction('Escalate')}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              📋 Escalate
            </button>
            <button
              onClick={() => handleAction('Ignore')}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              ✕ Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;