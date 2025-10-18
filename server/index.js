const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Railway-compatible CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, allow Railway domain and any subdomain
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.RAILWAY_STATIC_URL,
        /^https:\/\/.*\.railway\.app$/,
        /^https:\/\/.*\.up\.railway\.app$/
      ].filter(Boolean);
      
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow localhost
      const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = socketIo(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Import routes
const logRoutes = require('./routes/logs');
const classifyRoutes = require('./routes/classify');

// Use routes
app.use('/api', logRoutes);
app.use('/api', classifyRoutes);
app.use('/api', require('./routes/enhanced')); // New enhanced routes
app.use('/api', require('./routes/cases')); // Case management routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle manual patch from frontend
  socket.on('manualPatch', ({ alertId, alert }) => {
    console.log(`🔧 Manual patch requested for alert ${alertId}`);
    
    // Cancel grace period timer
    cancelGracePeriodTimer(alertId);
    
    const patch = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      description: 'Manual patch applied by security analyst',
      category: alert.log?.category || 'Unknown',
      severity: alert.severity,
      status: 'completed',
      automated: false,
      patchedBy: 'Manual',
      executionTime: Math.floor(Math.random() * 1500) + 300,
      alertId: alertId
    };

    // Emit manual patch completion
    io.emit('autoPatchCompleted', {
      patch: patch,
      alertId: alertId,
      message: `Manual patch completed: ${patch.description}`,
      patchedBy: 'Manual'
    });

    // Mark alert as patched
    io.emit('alertPatched', {
      alertId: alertId,
      patchedBy: 'Manual',
      timestamp: patch.timestamp
    });

    // Add patched log entry
    io.emit('newLog', {
      id: `patched-${patch.id}`,
      timestamp: patch.timestamp,
      category: 'Patched',
      severity: 'Low',
      message: `✅ Patched by Manual: ${alert.message}`,
      source: 'manual-patch',
      patchedBy: 'Manual'
    });
  });
});

// Make io available to routes
app.set('io', io);

// Background scheduler: generate logs every 30 seconds and emit over sockets
const { generateLogs, ipBlockingSystem } = require('./utils/logGenerator');
const AutoPatchSystem = require('./utils/autoPatchSystem');
const CorrelationEngine = require('./utils/correlationEngine');
const autoPatchSystem = new AutoPatchSystem();
const correlationEngine = new CorrelationEngine();

// Track monitoring session start time
let monitoringStartTime = new Date();
let suspiciousActivities = new Map(); // Track suspicious IPs
let alertTimers = new Map(); // Track grace period timers for alerts
const GRACE_PERIOD_SECONDS = 60; // Configurable grace period

// Reset monitoring session every 12 PM
function scheduleDailyReset() {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(12, 0, 0, 0);
  
  // If it's already past 12 PM today, schedule for tomorrow
  if (now.getHours() >= 12) {
    nextReset.setDate(nextReset.getDate() + 1);
  }
  
  const timeUntilReset = nextReset.getTime() - now.getTime();
  
  setTimeout(() => {
    console.log('🔄 Daily reset at 12 PM - Clearing monitoring data');
    monitoringStartTime = new Date();
    suspiciousActivities.clear();
    ipBlockingSystem.cleanup();
    
    // Emit reset event to clients
    io.emit('dailyReset', {
      timestamp: new Date().toISOString(),
      message: 'Daily monitoring reset at 12 PM'
    });
    
    // Schedule next reset
    scheduleDailyReset();
  }, timeUntilReset);
  
  console.log(`📅 Next daily reset scheduled for: ${nextReset.toLocaleString()}`);
}

// Start the daily reset scheduler
scheduleDailyReset();

// Correlation engine event handling
correlationEngine.on('correlatedAlert', (alert) => {
  console.log(`🚨 Correlated Alert: ${alert.message}`);
  
  // Emit correlated alert to clients
  io.emit('newAlert', alert);
  
  // Start grace period timer for correlated alerts
  startGracePeriodTimer(alert.id, alert);
});

// Auto-patch function for grace period expiration
function performAutoPatch(alertId, alert) {
  console.log(`🔄 Auto-patching alert ${alertId} after grace period expired`);
  
  const patch = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    description: 'Auto-patch applied by system policy after grace period',
    category: alert.log?.category || 'Unknown',
    severity: alert.severity,
    status: 'completed',
    automated: true,
    patchedBy: 'Auto-Policy',
    executionTime: Math.floor(Math.random() * 1500) + 300,
    alertId: alertId
  };

  // Emit auto-patch completion
  io.emit('autoPatchCompleted', {
    patch: patch,
    alertId: alertId,
    message: `Auto-patch completed: ${patch.description}`,
    patchedBy: 'Auto-Policy'
  });

  // Mark alert as patched
  io.emit('alertPatched', {
    alertId: alertId,
    patchedBy: 'Auto-Policy',
    timestamp: patch.timestamp
  });

  // Add patched log entry
  io.emit('newLog', {
    id: `patched-${patch.id}`,
    timestamp: patch.timestamp,
    category: 'Patched',
    severity: 'Low',
    message: `✅ Patched by Auto-Policy: ${alert.message}`,
    source: 'auto-policy',
    patchedBy: 'Auto-Policy'
  });

  // Clean up timer
  alertTimers.delete(alertId);
}

// Function to start grace period timer for an alert
function startGracePeriodTimer(alertId, alert) {
  console.log(`⏰ Starting ${GRACE_PERIOD_SECONDS}s grace period for alert ${alertId}`);
  
  const timer = setTimeout(() => {
    performAutoPatch(alertId, alert);
  }, GRACE_PERIOD_SECONDS * 1000);

  alertTimers.set(alertId, {
    timer: timer,
    alert: alert,
    startTime: Date.now(),
    gracePeriod: GRACE_PERIOD_SECONDS
  });

  // Emit countdown start to frontend
  io.emit('gracePeriodStarted', {
    alertId: alertId,
    gracePeriod: GRACE_PERIOD_SECONDS,
    startTime: Date.now()
  });
}

// Function to cancel grace period timer (when manually patched)
function cancelGracePeriodTimer(alertId) {
  const timerData = alertTimers.get(alertId);
  if (timerData) {
    clearTimeout(timerData.timer);
    alertTimers.delete(alertId);
    console.log(`❌ Grace period cancelled for alert ${alertId}`);
    
    io.emit('gracePeriodCancelled', {
      alertId: alertId,
      cancelledAt: Date.now()
    });
  }
}

async function generateAndEmitLogs(batchSize = 5) {
  try {
    const logs = await generateLogs(batchSize, false);
        for (const log of logs) {
          io.emit('newLog', log);

          // Process log through correlation engine
          correlationEngine.processLog(log);

      // Track suspicious activities
      const ipMatch = log.message.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
      if (ipMatch) {
        const ip = ipMatch[0];
        const isSuspicious = log.severity === 'High' || log.severity === 'Critical' ||
                           log.message.includes('failed') || log.message.includes('blocked') ||
                           log.message.includes('attack') || log.message.includes('suspicious');
        
        if (isSuspicious) {
          if (!suspiciousActivities.has(ip)) {
            suspiciousActivities.set(ip, {
              ip,
              occurrences: 0,
              severity: log.severity,
              firstSeen: new Date().toISOString(),
              lastSeen: new Date().toISOString()
            });
          }
          
          const activity = suspiciousActivities.get(ip);
          activity.occurrences++;
          activity.lastSeen = new Date().toISOString();
          activity.severity = log.severity; // Update to highest severity
          
          // Emit suspicious activity update
          io.emit('suspiciousActivityUpdate', {
            ip,
            occurrences: activity.occurrences,
            severity: activity.severity,
            lastSeen: activity.lastSeen
          });
        }
      }

      // Emit alert for High/Critical logs
      if (log.severity === 'High' || log.severity === 'Critical') {
        const alertId = Date.now() + Math.floor(Math.random() * 1000);
        const alert = {
          id: alertId,
          timestamp: new Date().toISOString(),
          severity: log.severity,
          message: log.message,
          log: log,
          acknowledged: false
        };
        
        io.emit('newAlert', alert);
        
        // Start grace period timer for High/Critical alerts
        startGracePeriodTimer(alertId, alert);
      }

      // Auto-patch processing
      if (autoPatchSystem.canAutoPatch(log)) {
        const patch = await autoPatchSystem.performAutoPatch(log);
        if (patch) {
          log.autoPatched = true;
          log.patchId = patch.id;
          io.emit('autoPatchCompleted', {
            logId: log.id,
            patch: patch,
            message: `Auto-patch completed: ${patch.description}`
          });
          io.emit('logUpdated', log);
        }
      }
    }
    
    // Emit monitoring stats
    io.emit('monitoringStats', {
      startTime: monitoringStartTime.toISOString(),
      uptime: Date.now() - monitoringStartTime.getTime(),
      suspiciousActivities: Array.from(suspiciousActivities.values()),
      blockedIPs: ipBlockingSystem.getBlockedIPs()
    });
    
  } catch (e) {
    console.error('Background log generation failed:', e);
  }
}

// Run every 30 seconds
setInterval(() => generateAndEmitLogs(5), 30000);

// Serve React app for all non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
} else {
  // In development, just serve a simple message for non-API routes
  app.get('*', (req, res) => {
    res.json({ 
      message: 'SOC Demo API Server', 
      status: 'running',
      frontend: 'http://localhost:3000',
      note: 'This is the API server. Access the frontend at http://localhost:3000'
    });
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SOC Demo Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origins: ${process.env.NODE_ENV === 'production' ? 'Railway domains' : 'localhost:3000'}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`📊 Production mode: Serving React build from client/build`);
  } else {
    console.log(`🛠️  Development mode: Frontend should be running on http://localhost:3000`);
  }
});

module.exports = { app, server, io };
