import React, { useState, useEffect } from 'react';

const KPICard = ({ title, value, icon, color, trend, darkMode, index }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Stagger animation delay
    const delay = index * 100;
    setTimeout(() => setIsVisible(true), delay);
  }, [index]);

  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  const getCardStyles = (color) => {
    const styles = {
      'logs': {
        gradient: 'from-blue-500 to-blue-600',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-blue-200',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600'
      },
      'alerts': {
        gradient: 'from-yellow-500 to-orange-500',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-yellow-200',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600'
      },
      'high': {
        gradient: 'from-orange-500 to-red-500',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-orange-200',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600'
      },
      'critical': {
        gradient: 'from-red-500 to-red-600',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-red-200',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600',
        pulse: 'animate-pulse'
      },
      'blocked': {
        gradient: 'from-purple-500 to-purple-600',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-purple-200',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600'
      },
      'patches': {
        gradient: 'from-green-500 to-green-600',
        bg: darkMode ? 'bg-slate-800' : 'bg-white',
        border: darkMode ? 'border-slate-700' : 'border-green-200',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: darkMode ? 'text-white' : 'text-gray-900',
        subtitleColor: darkMode ? 'text-gray-400' : 'text-gray-600'
      }
    };
    return styles[color] || styles.logs;
  };

  const styles = getCardStyles(color);

  return (
    <div className={`kpi-card fade-in ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}>
      {/* Gradient Header */}
      <div className={`h-1 w-full bg-gradient-to-r ${styles.gradient} rounded-t-xl mb-4`}></div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-medium ${styles.subtitleColor}`}>{title}</p>
            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center ${styles.pulse || ''}`}>
              <span className={`text-xl ${styles.iconColor}`}>{icon}</span>
            </div>
          </div>
          
          <div className="mb-2">
            <p className={`text-3xl font-bold ${styles.textColor} count-up`}>
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 bg-gradient-to-r ${styles.gradient} rounded-full animate-pulse`}></div>
            <p className={`text-xs ${styles.subtitleColor}`}>Live updates</p>
            {trend && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                trend === '+' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICards = ({ data, darkMode }) => {
  const cards = [
    {
      title: 'Logs Today',
      value: data.logsToday,
      icon: '📊',
      color: 'logs',
      trend: '+'
    },
    {
      title: 'Alerts Triggered',
      value: data.alertsTriggered,
      icon: '🚨',
      color: 'alerts',
      trend: '+'
    },
    {
      title: 'High Severity',
      value: data.highSeverity,
      icon: '⚠️',
      color: 'high',
      trend: '+'
    },
    {
      title: 'Critical Alerts',
      value: data.criticalAlerts,
      icon: '🔴',
      color: 'critical',
      trend: '+'
    },
    {
      title: 'Blocked IPs',
      value: data.blockedIPs,
      icon: '🚫',
      color: 'blocked',
      trend: '+'
    },
    {
      title: 'Auto-Patches',
      value: data.autoPatches,
      icon: '🔧',
      color: 'patches',
      trend: '+'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {cards.map((card, index) => (
        <KPICard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          trend={card.trend}
          darkMode={darkMode}
          index={index}
        />
      ))}
    </div>
  );
};

export default KPICards;