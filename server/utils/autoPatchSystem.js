const { v4: uuidv4 } = require('uuid');

class AutoPatchSystem {
  constructor() {
    this.patchHistory = [];
    this.patchRules = this.initializePatchRules();
  }

  initializePatchRules() {
    return {
      'Windows Firewall': {
        'Low': [
          {
            condition: (log) => log.message.includes('Allowed connection'),
            action: 'update_firewall_rule',
            description: 'Updated firewall rule to allow trusted connections',
            automated: true
          }
        ]
      },
      'Network Security': {
        'Low': [
          {
            condition: (log) => log.message.includes('DNS query resolved'),
            action: 'cache_dns_result',
            description: 'Cached DNS resolution for faster future queries',
            automated: true
          }
        ]
      },
      'Authentication': {
        'Low': [
          {
            condition: (log) => log.message.includes('logged in successfully'),
            action: 'update_user_session',
            description: 'Updated user session information',
            automated: true
          }
        ]
      },
      'System Performance': {
        'Low': [
          {
            condition: (log) => log.message.includes('Service') && log.message.includes('started'),
            action: 'optimize_service',
            description: 'Optimized service configuration for better performance',
            automated: true
          }
        ]
      },
      'File System': {
        'Low': [
          {
            condition: (log) => log.message.includes('uploaded successfully'),
            action: 'scan_file',
            description: 'Performed automated security scan on uploaded file',
            automated: true
          }
        ]
      },
      'Database': {
        'Low': [
          {
            condition: (log) => log.message.includes('Query executed successfully'),
            action: 'optimize_query',
            description: 'Optimized database query for better performance',
            automated: true
          }
        ]
      }
    };
  }

  canAutoPatch(log) {
    if (!log.autoPatchable || log.severity !== 'Low') {
      return false;
    }

    const categoryRules = this.patchRules[log.category];
    if (!categoryRules) {
      return false;
    }

    const severityRules = categoryRules[log.severity];
    if (!severityRules) {
      return false;
    }

    return severityRules.some(rule => rule.condition(log));
  }

  async performAutoPatch(log) {
    if (!this.canAutoPatch(log)) {
      return null;
    }

    const categoryRules = this.patchRules[log.category][log.severity];
    const applicableRule = categoryRules.find(rule => rule.condition(log));

    if (!applicableRule) {
      return null;
    }

    // Simulate patch execution time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    const patch = {
      id: uuidv4(),
      logId: log.id,
      timestamp: new Date().toISOString(),
      action: applicableRule.action,
      description: applicableRule.description,
      status: 'completed',
      automated: true,
      executionTime: Math.floor(Math.random() * 1500) + 500,
      category: log.category,
      severity: log.severity
    };

    this.patchHistory.push(patch);
    
    // Keep only last 100 patches
    if (this.patchHistory.length > 100) {
      this.patchHistory = this.patchHistory.slice(-100);
    }

    return patch;
  }

  getPatchHistory() {
    return this.patchHistory;
  }

  getPatchStats() {
    const stats = {
      totalPatches: this.patchHistory.length,
      successfulPatches: this.patchHistory.filter(p => p.status === 'completed').length,
      failedPatches: this.patchHistory.filter(p => p.status === 'failed').length,
      averageExecutionTime: 0,
      categoryBreakdown: {}
    };

    if (stats.totalPatches > 0) {
      stats.averageExecutionTime = Math.round(
        this.patchHistory.reduce((sum, p) => sum + p.executionTime, 0) / stats.totalPatches
      );
    }

    // Category breakdown
    this.patchHistory.forEach(patch => {
      if (!stats.categoryBreakdown[patch.category]) {
        stats.categoryBreakdown[patch.category] = 0;
      }
      stats.categoryBreakdown[patch.category]++;
    });

    return stats;
  }

  // Simulate patch failure for demo purposes
  simulatePatchFailure(logId) {
    const patch = this.patchHistory.find(p => p.logId === logId);
    if (patch) {
      patch.status = 'failed';
      patch.error = 'Simulated patch failure for demonstration';
    }
  }
}

module.exports = AutoPatchSystem;
