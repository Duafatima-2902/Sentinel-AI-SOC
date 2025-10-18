const EventEmitter = require('events');

class CorrelationEngine extends EventEmitter {
  constructor() {
    super();
    this.ipActivity = new Map(); // Track IP activity
    this.failedLogins = new Map(); // Track failed login attempts
    this.multiVectorAttacks = new Map(); // Track multi-vector attacks
    this.correlationRules = [
      {
        name: 'Brute Force Attack',
        condition: (ip, logs) => {
          const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
          );
          return recentLogs.filter(log => 
            log.message.toLowerCase().includes('failed') && 
            log.message.toLowerCase().includes('login')
          ).length > 5;
        },
        severity: 'High',
        category: 'Brute Force'
      },
      {
        name: 'Multi-Vector Attack',
        condition: (ip, logs) => {
          const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
          );
          const categories = new Set(recentLogs.map(log => log.category));
          return categories.size >= 3; // At least 3 different categories
        },
        severity: 'Critical',
        category: 'Multi-Vector'
      },
      {
        name: 'Port Scanning Activity',
        condition: (ip, logs) => {
          const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > new Date(Date.now() - 2 * 60 * 1000) // Last 2 minutes
          );
          return recentLogs.filter(log => 
            log.message.toLowerCase().includes('port') && 
            log.message.toLowerCase().includes('scan')
          ).length > 10;
        },
        severity: 'Medium',
        category: 'Port Scanning'
      },
      {
        name: 'DDoS Attack Pattern',
        condition: (ip, logs) => {
          const recentLogs = logs.filter(log => 
            new Date(log.timestamp) > new Date(Date.now() - 1 * 60 * 1000) // Last 1 minute
          );
          return recentLogs.length > 50; // High volume of requests
        },
        severity: 'Critical',
        category: 'DDoS'
      }
    ];
  }

  // Process a new log for correlation
  processLog(log) {
    const ipMatch = log.message.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    if (!ipMatch) return;

    const ip = ipMatch[0];
    
    // Skip internal IPs
    if (this.isInternalIP(ip)) return;

    // Initialize IP activity tracking
    if (!this.ipActivity.has(ip)) {
      this.ipActivity.set(ip, []);
    }

    // Add log to IP activity
    const ipLogs = this.ipActivity.get(ip);
    ipLogs.push(log);

    // Keep only last hour of logs for performance
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const filteredLogs = ipLogs.filter(log => new Date(log.timestamp) > oneHourAgo);
    this.ipActivity.set(ip, filteredLogs);

    // Run correlation rules
    this.runCorrelationRules(ip, filteredLogs);
  }

  // Check if IP is internal
  isInternalIP(ip) {
    const parts = ip.split('.').map(Number);
    return (
      (parts[0] === 10) ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 127) // localhost
    );
  }

  // Run all correlation rules for an IP
  runCorrelationRules(ip, logs) {
    this.correlationRules.forEach(rule => {
      try {
        if (rule.condition(ip, logs)) {
          this.triggerCorrelatedAlert(ip, rule, logs);
        }
      } catch (error) {
        console.error(`Error in correlation rule ${rule.name}:`, error);
      }
    });
  }

  // Trigger a correlated alert
  triggerCorrelatedAlert(ip, rule, logs) {
    const alertId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if we've already triggered this alert recently (prevent spam)
    const alertKey = `${ip}-${rule.name}`;
    const lastAlert = this.getLastAlertTime(alertKey);
    const now = Date.now();
    
    if (lastAlert && (now - lastAlert) < 5 * 60 * 1000) { // 5 minute cooldown
      return;
    }

    const recentLogs = logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 10 * 60 * 1000)
    );

    const correlatedAlert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      severity: rule.severity,
      category: rule.category,
      message: `${rule.name} detected from IP ${ip}`,
      source: 'correlation-engine',
      correlationId: alertId,
      metadata: {
        ruleName: rule.name,
        sourceIP: ip,
        logCount: recentLogs.length,
        timeWindow: '10 minutes',
        relatedLogs: recentLogs.slice(-5).map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          category: log.category,
          severity: log.severity,
          message: log.message
        }))
      }
    };

    // Store alert timestamp
    this.setLastAlertTime(alertKey, now);

    // Emit correlated alert
    this.emit('correlatedAlert', correlatedAlert);
    
    console.log(`🚨 Correlated Alert: ${rule.name} from IP ${ip}`);
  }

  // Get last alert time for a rule-IP combination
  getLastAlertTime(key) {
    return this.lastAlertTimes ? this.lastAlertTimes.get(key) : null;
  }

  // Set last alert time for a rule-IP combination
  setLastAlertTime(key, timestamp) {
    if (!this.lastAlertTimes) {
      this.lastAlertTimes = new Map();
    }
    this.lastAlertTimes.set(key, timestamp);
  }

  // Get correlation statistics
  getStats() {
    const totalIPs = this.ipActivity.size;
    const activeIPs = Array.from(this.ipActivity.entries())
      .filter(([ip, logs]) => logs.length > 0)
      .length;

    const suspiciousIPs = Array.from(this.ipActivity.entries())
      .filter(([ip, logs]) => {
        const recentLogs = logs.filter(log => 
          new Date(log.timestamp) > new Date(Date.now() - 10 * 60 * 1000)
        );
        return recentLogs.length > 5;
      }).length;

    return {
      totalTrackedIPs: totalIPs,
      activeIPs,
      suspiciousIPs,
      correlationRules: this.correlationRules.length,
      lastAlertTimes: this.lastAlertTimes ? this.lastAlertTimes.size : 0
    };
  }

  // Clean up old data
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    this.ipActivity.forEach((logs, ip) => {
      const filteredLogs = logs.filter(log => new Date(log.timestamp) > oneHourAgo);
      if (filteredLogs.length === 0) {
        this.ipActivity.delete(ip);
      } else {
        this.ipActivity.set(ip, filteredLogs);
      }
    });

    // Clean up old alert times (older than 1 hour)
    if (this.lastAlertTimes) {
      const now = Date.now();
      this.lastAlertTimes.forEach((timestamp, key) => {
        if (now - timestamp > 60 * 60 * 1000) {
          this.lastAlertTimes.delete(key);
        }
      });
    }
  }
}

module.exports = CorrelationEngine;
