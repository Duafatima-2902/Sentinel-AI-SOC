const express = require('express');
const router = express.Router();
const { generateLogs, ipBlockingSystem } = require('../utils/logGenerator');
const AutoPatchSystem = require('../utils/autoPatchSystem');

// Initialize auto-patch system
const autoPatchSystem = new AutoPatchSystem();

// POST /api/generate-logs
router.post('/generate-logs', async (req, res) => {
  try {
    const { count = 1, useLLM = false } = req.body;
    const logs = await generateLogs(count, useLLM);
    
    // Process each log for auto-patching
    for (const log of logs) {
      // Emit log first
      const io = req.app.get('io');
      io.emit('newLog', log);
      
      // Check if log can be auto-patched
      if (autoPatchSystem.canAutoPatch(log)) {
        // Perform auto-patch
        const patch = await autoPatchSystem.performAutoPatch(log);
        if (patch) {
          // Mark log as auto-patched
          log.autoPatched = true;
          log.patchId = patch.id;
          
          // Emit patch notification
          io.emit('autoPatchCompleted', {
            logId: log.id,
            patch: patch,
            message: `Auto-patch completed: ${patch.description}`
          });
          
          // Emit updated log
          io.emit('logUpdated', log);
        }
      }
    }
    
    res.json({ 
      success: true, 
      logs: logs,
      message: `Generated ${logs.length} logs` 
    });
  } catch (error) {
    console.error('Error generating logs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/logs/stats
router.get('/logs/stats', (req, res) => {
  // Enhanced realistic stats for SOC dashboard
  const blockedIPStats = ipBlockingSystem.getBlockedIPStats();
  const patchStats = autoPatchSystem.getPatchStats();
  
  const stats = {
    logsToday: Math.floor(Math.random() * 5000) + 15000, // 15k-20k logs
    alertsTriggered: Math.floor(Math.random() * 50) + 75, // 75-125 alerts
    highSeverityAlerts: Math.floor(Math.random() * 15) + 12, // 12-27 high alerts
    criticalAlerts: Math.floor(Math.random() * 8) + 5, // 5-13 critical alerts
    autoPatchesApplied: patchStats.totalPatches,
    blockedIPs: blockedIPStats.totalBlocked,
    threatLevels: {
      low: Math.floor(Math.random() * 2000) + 12000, // 12k-14k low
      medium: Math.floor(Math.random() * 500) + 800, // 800-1300 medium
      high: Math.floor(Math.random() * 100) + 150, // 150-250 high
      critical: Math.floor(Math.random() * 30) + 20 // 20-50 critical
    },
    securityMetrics: {
      totalThreats: Math.floor(Math.random() * 200) + 300,
      activeIncidents: Math.floor(Math.random() * 10) + 5,
      resolvedIncidents: Math.floor(Math.random() * 50) + 100,
      falsePositives: Math.floor(Math.random() * 20) + 10
    }
  };
  
  res.json({ success: true, stats });
});

// GET /api/patches/history
router.get('/patches/history', (req, res) => {
  try {
    const patches = autoPatchSystem.getPatchHistory();
    res.json({ success: true, patches });
  } catch (error) {
    console.error('Error fetching patch history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/patches/stats
router.get('/patches/stats', (req, res) => {
  try {
    const stats = autoPatchSystem.getPatchStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching patch stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/blocked-ips
router.get('/blocked-ips', (req, res) => {
  try {
    const blockedIPs = ipBlockingSystem.getBlockedIPs();
    const stats = ipBlockingSystem.getBlockedIPStats();
    res.json({ 
      success: true, 
      blockedIPs,
      stats 
    });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/blocked-ips/history
router.get('/blocked-ips/history', (req, res) => {
  try {
    const history = ipBlockingSystem.getBlockedIPHistory();
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching blocked IP history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/unblock-ip
router.post('/unblock-ip', (req, res) => {
  try {
    const { ip } = req.body;
    
    if (!ip) {
      return res.status(400).json({ 
        success: false, 
        error: 'IP address is required' 
      });
    }
    
    ipBlockingSystem.unblockIP(ip);
    
    // Emit unblock notification
    const io = req.app.get('io');
    io.emit('ipUnblocked', {
      ip,
      timestamp: new Date().toISOString(),
      message: `IP ${ip} has been unblocked by administrator`
    });
    
    res.json({ 
      success: true, 
      message: `IP ${ip} has been unblocked` 
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
