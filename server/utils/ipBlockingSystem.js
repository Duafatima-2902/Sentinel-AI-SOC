const { v4: uuidv4 } = require('uuid');

class IPBlockingSystem {
  constructor() {
    this.ipAttempts = new Map(); // Track failed attempts per IP
    this.blockedIPs = new Set(); // Set of blocked IPs
    this.blockedIPHistory = []; // History of blocked IPs
  }

  // Track failed attempt from an IP
  trackFailedAttempt(ip, logMessage) {
    if (!this.ipAttempts.has(ip)) {
      this.ipAttempts.set(ip, {
        count: 0,
        firstAttempt: new Date(),
        lastAttempt: new Date(),
        logs: []
      });
    }

    const ipData = this.ipAttempts.get(ip);
    ipData.count++;
    ipData.lastAttempt = new Date();
    ipData.logs.push({
      timestamp: new Date().toISOString(),
      message: logMessage
    });

    // Keep only last 10 logs per IP
    if (ipData.logs.length > 10) {
      ipData.logs = ipData.logs.slice(-10);
    }

    // Check if IP should be blocked (5+ attempts)
    if (ipData.count >= 5 && !this.blockedIPs.has(ip)) {
      this.blockIP(ip, ipData);
    }

    return ipData;
  }

  // Block an IP address
  blockIP(ip, ipData) {
    this.blockedIPs.add(ip);
    
    const blockRecord = {
      id: uuidv4(),
      ip: ip,
      blockedAt: new Date().toISOString(),
      attempts: ipData.count,
      firstAttempt: ipData.firstAttempt.toISOString(),
      lastAttempt: ipData.lastAttempt.toISOString(),
      reason: 'Multiple failed attempts detected',
      status: 'blocked'
    };

    this.blockedIPHistory.push(blockRecord);
    
    // Keep only last 100 blocked IPs
    if (this.blockedIPHistory.length > 100) {
      this.blockedIPHistory = this.blockedIPHistory.slice(-100);
    }

    return blockRecord;
  }

  // Check if an IP is blocked
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  // Get blocked IP statistics
  getBlockedIPStats() {
    return {
      totalBlocked: this.blockedIPs.size,
      recentBlocks: this.blockedIPHistory.slice(-10),
      topOffenders: Array.from(this.ipAttempts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([ip, data]) => ({
          ip,
          attempts: data.count,
          firstAttempt: data.firstAttempt,
          lastAttempt: data.lastAttempt
        }))
    };
  }

  // Get all blocked IPs
  getBlockedIPs() {
    return Array.from(this.blockedIPs);
  }

  // Get blocked IP history
  getBlockedIPHistory() {
    return this.blockedIPHistory;
  }

  // Unblock an IP (for admin use)
  unblockIP(ip) {
    this.blockedIPs.delete(ip);
    this.ipAttempts.delete(ip);
    
    // Add to history as unblocked
    this.blockedIPHistory.push({
      id: uuidv4(),
      ip: ip,
      unblockedAt: new Date().toISOString(),
      reason: 'Manually unblocked by administrator',
      status: 'unblocked'
    });
  }

  // Clean up old data (older than 24 hours)
  cleanup() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Clean up old IP attempts
    for (const [ip, data] of this.ipAttempts.entries()) {
      if (data.lastAttempt < oneDayAgo) {
        this.ipAttempts.delete(ip);
      }
    }

    // Clean up old blocked IP history
    this.blockedIPHistory = this.blockedIPHistory.filter(record => {
      const recordDate = new Date(record.blockedAt || record.unblockedAt);
      return recordDate > oneDayAgo;
    });
  }
}

module.exports = IPBlockingSystem;
