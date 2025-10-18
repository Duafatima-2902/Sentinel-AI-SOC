const express = require('express');
const router = express.Router();
const { classifyLog } = require('../utils/logClassifier');

// POST /api/classify
router.post('/classify', async (req, res) => {
  try {
    const { log } = req.body;
    
    if (!log) {
      return res.status(400).json({ 
        success: false, 
        error: 'Log data is required' 
      });
    }
    
    const classification = await classifyLog(log);
    
    // If high or critical severity, emit alert
    if (classification.severity === 'High' || classification.severity === 'Critical') {
      const io = req.app.get('io');
      io.emit('newAlert', {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        severity: classification.severity,
        message: classification.message,
        log: log,
        acknowledged: false
      });
    }
    
    res.json({ 
      success: true, 
      classification 
    });
  } catch (error) {
    console.error('Error classifying log:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/acknowledge-alert
router.post('/acknowledge-alert', (req, res) => {
  try {
    const { alertId } = req.body;
    
    // Emit acknowledgment to all clients
    const io = req.app.get('io');
    io.emit('alertAcknowledged', { alertId });
    
    res.json({ 
      success: true, 
      message: 'Alert acknowledged' 
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
