const { generateLogs } = require('./utils/logGenerator');
const { classifyLog } = require('./utils/logClassifier');

// Mock Socket.IO for seed script
const mockIo = {
  emit: (event, data) => {
    console.log(`[${new Date().toISOString()}] ${event}:`, JSON.stringify(data, null, 2));
  }
};

async function seedLogs() {
  console.log('🌱 Starting SOC Demo Log Seeding...');
  console.log('Press Ctrl+C to stop\n');
  
  let logCount = 0;
  
  const generateAndClassify = async () => {
    try {
      // Generate 1-3 logs at a time
      const count = Math.floor(Math.random() * 3) + 1;
      const logs = await generateLogs(count);
      
      for (const log of logs) {
        logCount++;
        
        // Emit log
        mockIo.emit('newLog', log);
        
        // Classify log
        const classification = await classifyLog(log);
        
        // If high or critical, emit alert
        if (classification.severity === 'High' || classification.severity === 'Critical') {
          const alert = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            severity: classification.severity,
            message: classification.message,
            log: log,
            acknowledged: false
          };
          mockIo.emit('newAlert', alert);
        }
        
        console.log(`📊 Log #${logCount} - ${log.severity}: ${log.message}`);
      }
      
      // Random interval between 2-8 seconds
      const interval = Math.floor(Math.random() * 6000) + 2000;
      setTimeout(generateAndClassify, interval);
      
    } catch (error) {
      console.error('Error in seed process:', error);
      setTimeout(generateAndClassify, 5000); // Retry after 5 seconds
    }
  };
  
  // Start the process
  generateAndClassify();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping log seeding...');
  process.exit(0);
});

// Start seeding
seedLogs();
