const express = require('express');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Mock cases database (in a real app, this would be a proper database)
let casesDB = [
  {
    id: 'case-1703123456789',
    alertId: 'alert-1703123456789',
    timestamp: '2024-01-15T10:30:00Z',
    resolvedAt: '2024-01-15T11:45:00Z',
    category: 'Windows Firewall',
    severity: 'High',
    message: 'Multiple failed connection attempts from 203.0.113.42 - Possible port scan',
    source: 'demo-app',
    status: 'Resolved',
    actions: [
      {
        action: 'Escalated',
        analyst: 'Security Analyst',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        action: 'IP Blocked',
        analyst: 'Security Analyst',
        timestamp: '2024-01-15T10:35:00Z'
      },
      {
        action: 'Threat Intel Enriched',
        analyst: 'System',
        timestamp: '2024-01-15T10:40:00Z'
      },
      {
        action: 'Resolved',
        analyst: 'Security Analyst',
        timestamp: '2024-01-15T11:45:00Z'
      }
    ],
    threatIntel: {
      reputation: 'Known Malicious (Botnet C&C)',
      riskScore: 95,
      country: 'Russia',
      lastSeen: '2024-01-15T10:30:00Z',
      categories: ['Botnet', 'C&C Server', 'Malware Distribution']
    },
    resolutionType: 'Manual',
    playbooksRun: ['block-ip'],
    autoPatched: false
  },
  {
    id: 'case-1703123456790',
    alertId: 'alert-1703123456790',
    timestamp: '2024-01-15T09:15:00Z',
    resolvedAt: '2024-01-15T09:25:00Z',
    category: 'Authentication',
    severity: 'Medium',
    message: 'Multiple failed login attempts for user admin from 198.51.100.1',
    source: 'demo-app',
    status: 'Resolved',
    actions: [
      {
        action: 'Escalated',
        analyst: 'Security Analyst',
        timestamp: '2024-01-15T09:15:00Z'
      },
      {
        action: 'Account Locked',
        analyst: 'System',
        timestamp: '2024-01-15T09:20:00Z'
      },
      {
        action: 'Resolved',
        analyst: 'Security Analyst',
        timestamp: '2024-01-15T09:25:00Z'
      }
    ],
    threatIntel: {
      reputation: 'Suspicious Activity',
      riskScore: 75,
      country: 'China',
      lastSeen: '2024-01-14T15:45:00Z',
      categories: ['Port Scanning', 'Brute Force']
    },
    resolutionType: 'Auto',
    playbooksRun: ['lock-user'],
    autoPatched: true
  }
];

// GET /api/cases - Get all cases
router.get('/cases', (req, res) => {
  res.json({
    success: true,
    cases: casesDB
  });
});

// GET /api/cases/:id/report - Generate PDF report for a case
router.get('/cases/:id/report', (req, res) => {
  const { id } = req.params;
  const caseData = casesDB.find(c => c.id === id);
  
  if (!caseData) {
    return res.status(404).json({
      success: false,
      error: 'Case not found'
    });
  }

  if (caseData.status !== 'Resolved') {
    return res.status(400).json({
      success: false,
      error: 'Can only generate reports for resolved cases'
    });
  }

  try {
    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Case Report - ${caseData.id}`,
        Author: 'SOC Demo System',
        Subject: 'Security Incident Report',
        Creator: 'SOC Demo Application'
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="case-report-${caseData.id}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function to add section headers
    const addSectionHeader = (text, y = null) => {
      if (y) doc.y = y;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text(text, 50, doc.y);
      doc.moveDown(0.5);
    };

    // Helper function to add key-value pairs
    const addKeyValue = (key, value, indent = 0) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#374151')
         .text(key, 50 + indent, doc.y);
      
      doc.font('Helvetica')
         .fillColor('#6b7280')
         .text(value, 50 + indent + 120, doc.y);
      doc.moveDown(0.3);
    };

    // Title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('Security Incident Report', 50, 50)
       .text(`Case #${caseData.id}`, 50, 80);

    // Case Information Section
    addSectionHeader('Case Information', 120);
    addKeyValue('Case ID:', caseData.id);
    addKeyValue('Category:', caseData.category);
    addKeyValue('Severity:', caseData.severity);
    addKeyValue('Status:', caseData.status);
    addKeyValue('Created:', new Date(caseData.timestamp).toLocaleString());
    addKeyValue('Resolved:', new Date(caseData.resolvedAt).toLocaleString());
    addKeyValue('Source:', caseData.source);
    addKeyValue('Resolution Type:', caseData.resolutionType);

    // Alert Details Section
    addSectionHeader('Alert Details', doc.y + 20);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(caseData.message, 50, doc.y, {
         width: 500,
         align: 'left'
       });
    doc.moveDown(1);

    // Threat Intelligence Section
    if (caseData.threatIntel) {
      addSectionHeader('Threat Intelligence', doc.y + 20);
      addKeyValue('Reputation:', caseData.threatIntel.reputation);
      addKeyValue('Risk Score:', `${caseData.threatIntel.riskScore}/100`);
      addKeyValue('Country:', caseData.threatIntel.country);
      addKeyValue('Last Seen:', new Date(caseData.threatIntel.lastSeen).toLocaleString());
      
      if (caseData.threatIntel.categories && caseData.threatIntel.categories.length > 0) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#374151')
           .text('Categories:', 50, doc.y);
        
        doc.font('Helvetica')
           .fillColor('#6b7280')
           .text(caseData.threatIntel.categories.join(', '), 50, doc.y + 12);
        doc.moveDown(0.5);
      }
    }

    // Actions Log Section
    addSectionHeader('Analyst Actions', doc.y + 20);
    
    // Create table for actions
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [120, 150, 200];
    
    // Table headers
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .rect(tableLeft, tableTop, colWidths[0], 20)
       .fill('#374151')
       .text('Action', tableLeft + 5, tableTop + 6);
    
    doc.rect(tableLeft + colWidths[0], tableTop, colWidths[1], 20)
       .fill('#374151')
       .text('Analyst', tableLeft + colWidths[0] + 5, tableTop + 6);
    
    doc.rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], 20)
       .fill('#374151')
       .text('Timestamp', tableLeft + colWidths[0] + colWidths[1] + 5, tableTop + 6);

    // Table rows
    let currentY = tableTop + 20;
    caseData.actions.forEach((action, index) => {
      const rowHeight = 25;
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.rect(tableLeft, currentY, colWidths[0] + colWidths[1] + colWidths[2], rowHeight)
           .fill('#f9fafb');
      }
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#374151')
         .text(action.action, tableLeft + 5, currentY + 8);
      
      doc.text(action.analyst, tableLeft + colWidths[0] + 5, currentY + 8);
      
      doc.text(new Date(action.timestamp).toLocaleString(), 
               tableLeft + colWidths[0] + colWidths[1] + 5, currentY + 8);
      
      currentY += rowHeight;
    });

    doc.y = currentY + 20;

    // Playbooks Section
    if (caseData.playbooksRun && caseData.playbooksRun.length > 0) {
      addSectionHeader('Playbooks Executed', doc.y + 20);
      caseData.playbooksRun.forEach(playbook => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#6b7280')
           .text(`• ${playbook}`, 70, doc.y);
        doc.moveDown(0.2);
      });
    }

    // Resolution Summary Section
    addSectionHeader('Resolution Summary', doc.y + 20);
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`This case was ${caseData.resolutionType.toLowerCase()}ly resolved on ${new Date(caseData.resolvedAt).toLocaleString()}.`, 50, doc.y, {
         width: 500,
         align: 'left'
       });
    
    if (caseData.autoPatched) {
      doc.text('The incident was automatically patched by the system.', 50, doc.y + 15, {
        width: 500,
        align: 'left'
      });
    }

    // Footer
    const footerY = doc.page.height - 50;
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#9ca3af')
       .text(`Generated on ${new Date().toLocaleString()}`, 50, footerY)
       .text('SOC Demo System - Security Operations Center', 50, footerY + 12);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF report'
    });
  }
});

// POST /api/cases - Create a new case (for demo purposes)
router.post('/cases', (req, res) => {
  const { alertId, category, severity, message, source, threatIntel } = req.body;
  
  const newCase = {
    id: `case-${Date.now()}`,
    alertId: alertId || `alert-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category: category || 'Unknown',
    severity: severity || 'Medium',
    message: message || 'No message provided',
    source: source || 'unknown',
    status: 'Open',
    actions: [{
      action: 'Created',
      analyst: 'System',
      timestamp: new Date().toISOString()
    }],
    threatIntel: threatIntel || null,
    resolutionType: null,
    playbooksRun: [],
    autoPatched: false
  };

  casesDB.unshift(newCase);
  
  res.json({
    success: true,
    case: newCase
  });
});

// PUT /api/cases/:id/resolve - Resolve a case
router.put('/cases/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { resolutionType = 'Manual', playbooksRun = [] } = req.body;
  
  const caseIndex = casesDB.findIndex(c => c.id === id);
  if (caseIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Case not found'
    });
  }

  const caseData = casesDB[caseIndex];
  caseData.status = 'Resolved';
  caseData.resolvedAt = new Date().toISOString();
  caseData.resolutionType = resolutionType;
  caseData.playbooksRun = playbooksRun;
  caseData.actions.push({
    action: 'Resolved',
    analyst: 'Security Analyst',
    timestamp: new Date().toISOString()
  });

  casesDB[caseIndex] = caseData;

  res.json({
    success: true,
    case: caseData
  });
});

module.exports = router;

