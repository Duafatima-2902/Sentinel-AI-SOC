import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show toast
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getToastStyles = (type) => {
    const styles = {
      'success': {
        bg: 'bg-green-500',
        icon: '✅',
        border: 'border-green-400'
      },
      'error': {
        bg: 'bg-red-500',
        icon: '❌',
        border: 'border-red-400'
      },
      'warning': {
        bg: 'bg-yellow-500',
        icon: '⚠️',
        border: 'border-yellow-400'
      },
      'info': {
        bg: 'bg-blue-500',
        icon: 'ℹ️',
        border: 'border-blue-400'
      },
      'critical': {
        bg: 'bg-red-600',
        icon: '🚨',
        border: 'border-red-500',
        pulse: 'animate-pulse'
      }
    };
    return styles[type] || styles.info;
  };

  const styles = getToastStyles(type);

  if (!isVisible) return null;

  return (
    <div className={`toast ${styles.bg} ${styles.border} ${styles.pulse || ''} ${
      isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    } transition-all duration-300 ease-in-out`}>
      <div className="flex items-center space-x-3">
        <span className="text-xl">{styles.icon}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast Manager Component
export const ToastManager = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);
  const showCritical = (message, duration) => addToast(message, 'critical', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCritical
  };
};

export default Toast;

