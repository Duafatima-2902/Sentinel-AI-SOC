// Mock data generator for SOC Dashboard
export const generateMockData = () => {
  const now = new Date();
  
  // Generate KPI data
  const kpis = {
    logsToday: Math.floor(Math.random() * 5000) + 15000,
    alertsTriggered: Math.floor(Math.random() * 50) + 75,
    highSeverity: Math.floor(Math.random() * 15) + 12,
    criticalAlerts: Math.floor(Math.random() * 8) + 5,
    blockedIPs: Math.floor(Math.random() * 10) + 3,
    autoPatches: Math.floor(Math.random() * 25) + 15
  };

  // Generate threat level
  const threatLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const threatLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];

  // Generate chart data (last 24 hours)
  const chartData = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    chartData.push({
      time: hour.getHours() + ':00',
      total: Math.floor(Math.random() * 50) + 20,
      high: Math.floor(Math.random() * 15) + 5,
      critical: Math.floor(Math.random() * 8) + 2
    });
  }

  // Generate logs
  const categories = ['Firewall', 'Authentication', 'Email Security', 'Database', 'Network Security', 'System Performance'];
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const logMessages = [
    'Windows Firewall: Blocked suspicious connection from 192.168.1.100',
    'Authentication: Failed login attempt for user admin',
    'Email Security: Phishing email detected and quarantined',
    'Database: SQL injection attempt blocked',
    'Network Security: Unusual traffic pattern detected',
    'System Performance: High CPU usage detected'
  ];

  const logs = [];
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const message = logMessages[Math.floor(Math.random() * logMessages.length)];
    
    logs.push({
      id: `log-${i}`,
      timestamp: timestamp.toISOString(),
      category,
      severity,
      message,
      autoPatched: Math.random() > 0.7,
      source: 'demo-system'
    });
  }

  // Generate suspicious activities
  const suspiciousActivities = [];
  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.42', '198.51.100.10'];
  
  for (let i = 0; i < 8; i++) {
    const ip = ips[Math.floor(Math.random() * ips.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    suspiciousActivities.push({
      id: `suspicious-${i}`,
      ip,
      occurrences: Math.floor(Math.random() * 20) + 5,
      severity,
      lastSeen: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString()
    });
  }

  // Generate auto-patches
  const autoPatches = [];
  const patchDescriptions = [
    'Updated firewall rule to block malicious IP',
    'Applied security patch for authentication system',
    'Quarantined suspicious email attachment',
    'Blocked SQL injection attempt',
    'Applied rate limiting to prevent DDoS',
    'Updated antivirus signatures'
  ];

  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const description = patchDescriptions[Math.floor(Math.random() * patchDescriptions.length)];
    const statuses = ['completed', 'pending', 'failed', 'in_progress'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    autoPatches.push({
      id: `patch-${i}`,
      timestamp: timestamp.toISOString(),
      category,
      severity,
      description,
      status,
      automated: Math.random() > 0.3,
      executionTime: Math.floor(Math.random() * 2000) + 500
    });
  }

  // Generate alerts
  const alerts = [];
  const alertMessages = [
    'Multiple failed login attempts detected',
    'Suspicious network activity from external IP',
    'Malware signature detected in email',
    'Database injection attempt blocked',
    'High severity security event detected',
    'Critical system vulnerability found'
  ];

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
    const log = logs[Math.floor(Math.random() * logs.length)];
    
    alerts.push({
      id: `alert-${i}`,
      timestamp: timestamp.toISOString(),
      severity,
      message,
      log,
      acknowledged: Math.random() > 0.6,
      status: 'active'
    });
  }

  return {
    kpis,
    threatLevel,
    isConnected: true,
    alerts,
    logs,
    suspiciousActivities,
    autoPatches,
    chartData
  };
};
