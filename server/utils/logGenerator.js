const { v4: uuidv4 } = require('uuid');
const IPBlockingSystem = require('./ipBlockingSystem');

// Global IP blocking system instance
const ipBlockingSystem = new IPBlockingSystem();

const logTemplates = [
  // Windows Firewall Logs
  {
    template: '{timestamp} INFO Windows Firewall: Allowed connection from {ip} to port {port}',
    severity: 'Low',
    category: 'Windows Firewall',
    fields: ['ip', 'port'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN Windows Firewall: Blocked suspicious connection from {ip} to port {port}',
    severity: 'Medium',
    category: 'Windows Firewall',
    fields: ['ip', 'port'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL Windows Firewall: Multiple failed connection attempts from {ip} - Possible port scan',
    severity: 'Critical',
    category: 'Windows Firewall',
    fields: ['ip'],
    autoPatchable: false
  },
  
  // Network Security Logs
  {
    template: '{timestamp} INFO Network: DNS query resolved for {domain}',
    severity: 'Low',
    category: 'Network Security',
    fields: ['domain'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN Network: Unusual traffic pattern detected from {ip}',
    severity: 'Medium',
    category: 'Network Security',
    fields: ['ip'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL Network: DDoS attack detected from {ip} - Rate limiting applied',
    severity: 'Critical',
    category: 'Network Security',
    fields: ['ip'],
    autoPatchable: false
  },
  
  // Authentication Logs
  {
    template: '{timestamp} INFO Auth: User {user} logged in successfully from {ip}',
    severity: 'Low',
    category: 'Authentication',
    fields: ['user', 'ip'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN Auth: Failed login attempt for user {user} from {ip}',
    severity: 'Medium',
    category: 'Authentication',
    fields: ['user', 'ip'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL Auth: Brute force attack detected from {ip} - Account {user} locked',
    severity: 'Critical',
    category: 'Authentication',
    fields: ['ip', 'user'],
    autoPatchable: false
  },
  
  // System Performance Logs
  {
    template: '{timestamp} INFO System: Service {service} started successfully',
    severity: 'Low',
    category: 'System Performance',
    fields: ['service'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN System: High CPU usage detected: {cpu}%',
    severity: 'Medium',
    category: 'System Performance',
    fields: ['cpu'],
    autoPatchable: false
  },
  {
    template: '{timestamp} ERROR System: Memory leak detected in process {pid}',
    severity: 'High',
    category: 'System Performance',
    fields: ['pid'],
    autoPatchable: false
  },
  
  // File System Logs
  {
    template: '{timestamp} INFO File: File {filename} uploaded successfully',
    severity: 'Low',
    category: 'File System',
    fields: ['filename'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN File: Suspicious file {filename} detected - Quarantined',
    severity: 'High',
    category: 'File System',
    fields: ['filename'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL File: Malware detected in {filename} - Immediate action required',
    severity: 'Critical',
    category: 'File System',
    fields: ['filename'],
    autoPatchable: false
  },
  
  // Database Logs
  {
    template: '{timestamp} INFO Database: Query executed successfully on {table}',
    severity: 'Low',
    category: 'Database',
    fields: ['table'],
    autoPatchable: true
  },
  {
    template: '{timestamp} ERROR Database: Connection failed to {database}',
    severity: 'High',
    category: 'Database',
    fields: ['database'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL Database: SQL injection attempt detected from {ip}',
    severity: 'Critical',
    category: 'Database',
    fields: ['ip'],
    autoPatchable: false
  },

  // Email Security Logs
  {
    template: '{timestamp} INFO Email Security: Email delivered successfully to {recipient}',
    severity: 'Low',
    category: 'Email Security',
    fields: ['recipient'],
    autoPatchable: true
  },
  {
    template: '{timestamp} WARN Email Security: Suspicious email blocked from {sender} - Phishing attempt',
    severity: 'Medium',
    category: 'Email Security',
    fields: ['sender'],
    autoPatchable: false
  },
  {
    template: '{timestamp} CRITICAL Email Security: Malware attachment detected from {sender} - Email quarantined',
    severity: 'Critical',
    category: 'Email Security',
    fields: ['sender'],
    autoPatchable: false
  },
  {
    template: '{timestamp} WARN Email Security: Multiple failed login attempts from {ip} - Account locked',
    severity: 'High',
    category: 'Email Security',
    fields: ['ip'],
    autoPatchable: false
  },
  {
    template: '{timestamp} INFO Email Security: Spam email filtered from {sender}',
    severity: 'Low',
    category: 'Email Security',
    fields: ['sender'],
    autoPatchable: true
  }
];

const sampleData = {
  users: ['admin', 'user1', 'john.doe', 'jane.smith', 'test.user'],
  ips: ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.42', '198.51.100.10'],
  ports: ['80', '443', '22', '3389', '8080', '3306', '5432'],
  domains: ['google.com', 'microsoft.com', 'github.com', 'stackoverflow.com', 'wikipedia.org'],
  services: ['Windows Update', 'SQL Server', 'IIS', 'Apache', 'MySQL', 'PostgreSQL'],
  filenames: ['document.pdf', 'image.jpg', 'data.csv', 'config.json', 'malware.exe', 'virus.dll'],
  cpus: ['85', '92', '78', '95'],
  pids: ['1234', '5678', '9012', '3456'],
  tables: ['users', 'orders', 'products', 'logs', 'sessions'],
  databases: ['production_db', 'staging_db', 'test_db', 'analytics_db'],
  errors: ['Connection timeout', 'Authentication failed', 'Permission denied', 'Resource not found'],
  spaces: ['15', '8', '22', '5'],
  recipients: ['user@company.com', 'admin@company.com', 'support@company.com', 'sales@company.com'],
  senders: ['noreply@company.com', 'alerts@company.com', 'phishing@fake.com', 'malware@evil.com', 'spam@suspicious.com']
};

function generateRandomValue(field) {
  const data = sampleData[field + 's'] || sampleData[field];
  return data ? data[Math.floor(Math.random() * data.length)] : 'unknown';
}

function generateLog(useLLM = false) {
  const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
  const timestamp = new Date().toISOString();
  
  let message = template.template.replace('{timestamp}', timestamp);
  
  // Replace field placeholders with random values
  template.fields.forEach(field => {
    const value = generateRandomValue(field);
    message = message.replace(`{${field}}`, value);
  });
  
  const log = {
    id: uuidv4(),
    timestamp,
    severity: template.severity,
    message,
    source: 'demo-app',
    category: template.category,
    autoPatchable: template.autoPatchable,
    autoPatched: false,
    threatLevel: getThreatLevel(template.severity),
    correlationId: generateCorrelationId(),
    metadata: generateMetadata(template.category, template.fields)
  };
  
  return log;
}

function getThreatLevel(severity) {
  const threatLevels = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Critical': 4
  };
  return threatLevels[severity] || 1;
}

function generateCorrelationId() {
  return 'CORR-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateMetadata(category, fields) {
  const metadata = {
    category,
    timestamp: new Date().toISOString(),
    environment: 'production',
    region: 'us-east-1'
  };
  
  // Add category-specific metadata
  switch (category) {
    case 'Windows Firewall':
      metadata.protocol = 'TCP';
      metadata.action = 'blocked';
      break;
    case 'Network Security':
      metadata.protocol = 'HTTP/HTTPS';
      metadata.bandwidth = Math.floor(Math.random() * 1000) + 100;
      break;
    case 'Authentication':
      metadata.sessionId = 'SESS-' + Math.random().toString(36).substr(2, 8);
      metadata.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      break;
    case 'System Performance':
      metadata.cpuUsage = Math.floor(Math.random() * 100);
      metadata.memoryUsage = Math.floor(Math.random() * 100);
      break;
    case 'File System':
      metadata.fileSize = Math.floor(Math.random() * 1000000) + 1000;
      metadata.fileType = 'application/octet-stream';
      break;
    case 'Database':
      metadata.queryTime = Math.floor(Math.random() * 1000) + 10;
      metadata.connectionPool = 'main';
      break;
  }
  
  return metadata;
}

function getCategoryFromSeverity(severity) {
  const categories = {
    'Low': 'Info',
    'Medium': 'Warning',
    'High': 'Error',
    'Critical': 'Critical'
  };
  return categories[severity] || 'Unknown';
}

async function generateLogs(count = 1, useLLM = false) {
  const logs = [];
  
  for (let i = 0; i < count; i++) {
    const log = generateLog(useLLM);
    
    // Enhanced IP blocking detection for various log types
    const ipMatch = log.message.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
    if (ipMatch) {
      const ip = ipMatch[0];
      
      // Check if this log indicates suspicious activity
      const isSuspicious = log.message.includes('failed') || 
                          log.message.includes('blocked') || 
                          log.message.includes('unauthorized') || 
                          log.message.includes('injection') ||
                          log.message.includes('suspicious') ||
                          log.message.includes('attack') ||
                          log.severity === 'High' ||
                          log.severity === 'Critical';
      
      if (isSuspicious) {
        const ipData = ipBlockingSystem.trackFailedAttempt(ip, log.message);
        
        // If IP was just blocked, create a blocking log
        if (ipData.count === 5) {
          const blockLog = {
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            severity: 'Critical',
            message: `IP ${ip} has been automatically blocked due to ${ipData.count} failed attempts`,
            source: 'ip-blocking-system',
            category: 'IP Blocking',
            autoPatchable: false,
            autoPatched: false,
            threatLevel: 4,
            correlationId: generateCorrelationId(),
            metadata: {
              blockedIP: ip,
              attempts: ipData.count,
              reason: 'Multiple failed attempts',
              action: 'automatic_block'
            }
          };
          logs.push(blockLog);
        }
      }
    }
    
    logs.push(log);
    
    // Add small delay to simulate real-time generation
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return logs;
}

module.exports = {
  generateLog,
  generateLogs,
  ipBlockingSystem
};
