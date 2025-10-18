const express = require('express');
const router = express.Router();

// Mock threat intelligence database
const threatIntelDB = {
  '203.0.113.42': {
    reputation: 'Known Malicious (Botnet C&C)',
    riskScore: 95,
    country: 'Russia',
    lastSeen: '2024-01-15T10:30:00Z',
    categories: ['Botnet', 'C&C Server', 'Malware Distribution']
  },
  '198.51.100.1': {
    reputation: 'Suspicious Activity',
    riskScore: 75,
    country: 'China',
    lastSeen: '2024-01-14T15:45:00Z',
    categories: ['Port Scanning', 'Brute Force']
  },
  '192.0.2.100': {
    reputation: 'Known Malicious (Phishing)',
    riskScore: 88,
    country: 'Nigeria',
    lastSeen: '2024-01-13T08:20:00Z',
    categories: ['Phishing', 'Social Engineering']
  },
  '10.0.0.1': {
    reputation: 'Internal Network',
    riskScore: 5,
    country: 'Internal',
    lastSeen: '2024-01-15T12:00:00Z',
    categories: ['Internal']
  },
  '172.16.0.1': {
    reputation: 'Internal Network',
    riskScore: 5,
    country: 'Internal',
    lastSeen: '2024-01-15T12:00:00Z',
    categories: ['Internal']
  }
};

// Generate mock threat intelligence for unknown IPs
function generateMockThreatIntel(ip) {
  const isInternal = ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('192.168.');
  
  if (isInternal) {
    return {
      reputation: 'Internal Network',
      riskScore: Math.floor(Math.random() * 10) + 1,
      country: 'Internal',
      lastSeen: new Date().toISOString(),
      categories: ['Internal']
    };
  }

  const reputations = [
    'Known Malicious (Botnet C&C)',
    'Suspicious Activity',
    'Known Malicious (Phishing)',
    'Malware Distribution',
    'Port Scanning Activity',
    'Brute Force Source',
    'Clean IP',
    'Unknown Reputation'
  ];

  const countries = ['Russia', 'China', 'North Korea', 'Iran', 'United States', 'Germany', 'France', 'Brazil', 'India', 'Japan'];
  const categories = [
    ['Botnet', 'C&C Server'],
    ['Port Scanning', 'Brute Force'],
    ['Phishing', 'Social Engineering'],
    ['Malware Distribution', 'Ransomware'],
    ['DDoS', 'Network Attack'],
    ['Clean'],
    ['Unknown']
  ];

  const reputation = reputations[Math.floor(Math.random() * reputations.length)];
  const riskScore = reputation.includes('Malicious') ? 
    Math.floor(Math.random() * 20) + 80 : 
    reputation.includes('Suspicious') ? 
    Math.floor(Math.random() * 20) + 60 :
    Math.floor(Math.random() * 40) + 10;

  return {
    reputation,
    riskScore,
    country: countries[Math.floor(Math.random() * countries.length)],
    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    categories: categories[Math.floor(Math.random() * categories.length)]
  };
}

// Threat Intelligence API
router.get('/threatintel/:ip', (req, res) => {
  const { ip } = req.params;
  
  // Check if IP exists in our mock database
  let threatIntel = threatIntelDB[ip];
  
  // If not found, generate mock data
  if (!threatIntel) {
    threatIntel = generateMockThreatIntel(ip);
    // Store in mock database for consistency
    threatIntelDB[ip] = threatIntel;
  }

  res.json({
    ip,
    ...threatIntel,
    timestamp: new Date().toISOString()
  });
});

// Bulk threat intelligence lookup
router.post('/threatintel/bulk', (req, res) => {
  const { ips } = req.body;
  
  if (!Array.isArray(ips)) {
    return res.status(400).json({ error: 'IPs must be an array' });
  }

  const results = ips.map(ip => {
    let threatIntel = threatIntelDB[ip];
    if (!threatIntel) {
      threatIntel = generateMockThreatIntel(ip);
      threatIntelDB[ip] = threatIntel;
    }
    return { ip, ...threatIntel };
  });

  res.json({
    results,
    timestamp: new Date().toISOString()
  });
});

// Playbook execution API
router.post('/playbook/:id/run', (req, res) => {
  const { id } = req.params;
  const { caseId, alertId } = req.body;

  const playbooks = {
    'block-ip': {
      name: 'Block IP Address',
      description: 'Block malicious IP address across all security controls',
      estimatedDuration: 8000
    },
    'lock-user': {
      name: 'Lock User Account',
      description: 'Lock compromised user account and force password reset',
      estimatedDuration: 5000
    },
    'isolate-host': {
      name: 'Isolate Host',
      description: 'Isolate compromised host from network',
      estimatedDuration: 7500
    }
  };

  const playbook = playbooks[id];
  if (!playbook) {
    return res.status(404).json({ error: 'Playbook not found' });
  }

  // Simulate playbook execution
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.json({
    executionId,
    playbook,
    status: 'started',
    startedAt: new Date().toISOString(),
    estimatedDuration: playbook.estimatedDuration
  });

  // Simulate completion after estimated duration
  setTimeout(() => {
    const io = req.app.get('io');
    if (io) {
      io.emit('playbookCompleted', {
        executionId,
        playbookId: id,
        caseId,
        alertId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        result: 'success',
        message: `${playbook.name} executed successfully`
      });
    }
  }, Math.min(playbook.estimatedDuration, 5000)); // Cap at 5 seconds for demo
});

// Get playbook status
router.get('/playbook/:executionId/status', (req, res) => {
  const { executionId } = req.params;
  
  // Mock status response
  res.json({
    executionId,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    currentStep: 'Executing security controls',
    startedAt: new Date(Date.now() - Math.random() * 10000).toISOString()
  });
});

// Generate incident report
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    // Mock report data
    const reportData = {
      reportId: `RPT-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString()
      },
      summary: {
        totalLogs: Math.floor(Math.random() * 1000) + 500,
        totalAlerts: Math.floor(Math.random() * 100) + 50,
        highSeverity: Math.floor(Math.random() * 20) + 10,
        criticalAlerts: Math.floor(Math.random() * 10) + 5,
        blockedIPs: Math.floor(Math.random() * 50) + 20,
        autoPatches: Math.floor(Math.random() * 30) + 15,
        manualPatches: Math.floor(Math.random() * 20) + 10
      },
      topMaliciousIPs: [
        { ip: '203.0.113.42', occurrences: 45, severity: 'Critical', country: 'Russia' },
        { ip: '198.51.100.1', occurrences: 32, severity: 'High', country: 'China' },
        { ip: '192.0.2.100', occurrences: 28, severity: 'High', country: 'Nigeria' },
        { ip: '203.0.113.50', occurrences: 22, severity: 'Medium', country: 'Russia' },
        { ip: '198.51.100.5', occurrences: 18, severity: 'Medium', country: 'China' }
      ],
      actionsBreakdown: {
        manual: Math.floor(Math.random() * 20) + 10,
        autoPolicy: Math.floor(Math.random() * 30) + 15,
        playbook: Math.floor(Math.random() * 10) + 5
      },
      threatCategories: {
        'Brute Force': Math.floor(Math.random() * 50) + 20,
        'Malware': Math.floor(Math.random() * 30) + 15,
        'Phishing': Math.floor(Math.random() * 25) + 10,
        'DDoS': Math.floor(Math.random() * 15) + 5,
        'Port Scanning': Math.floor(Math.random() * 40) + 20
      }
    };

    if (format === 'pdf') {
      // For PDF generation, we'll return a mock PDF URL
      // In a real implementation, you'd use pdfkit or reportlab
      res.json({
        ...reportData,
        downloadUrl: `/api/report/${reportData.reportId}/download`,
        format: 'pdf'
      });
    } else {
      res.json(reportData);
    }
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Download report (mock PDF)
router.get('/report/:reportId/download', (req, res) => {
  const { reportId } = req.params;
  
  // Mock PDF download - in real implementation, generate actual PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="incident-report-${reportId}.pdf"`);
  
  // Return a simple text response for demo
  res.send(`Mock PDF Report: ${reportId}\n\nThis would be a real PDF file in production.`);
});

// Get all threat intelligence data
router.get('/threatintel', (req, res) => {
  res.json({
    totalIPs: Object.keys(threatIntelDB).length,
    maliciousIPs: Object.values(threatIntelDB).filter(ti => ti.riskScore > 70).length,
    suspiciousIPs: Object.values(threatIntelDB).filter(ti => ti.riskScore > 40 && ti.riskScore <= 70).length,
    cleanIPs: Object.values(threatIntelDB).filter(ti => ti.riskScore <= 40).length,
    data: threatIntelDB
  });
});

module.exports = router;
