import React, { useState } from 'react';

const CasesTab = ({ cases, onResolveCase, onRunPlaybook }) => {
  const [activeTab, setActiveTab] = useState('open');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const openCases = cases.filter(c => c.status === 'Open' || c.status === 'In Progress');
  const closedCases = cases.filter(c => c.status === 'Resolved');

  const getSeverityColor = (severity) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.Low;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-red-100 text-red-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.Open;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // PDF Generation function
  const generatePDFReport = async (caseId) => {
    setIsGeneratingPDF(true);
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://soc-demo-app.vercel.app' 
        : 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/report`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `case-report-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const CaseCard = ({ caseItem }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-lg">🔍</span>
          <div>
            <h3 className="font-semibold text-gray-900">Case #{caseItem.id}</h3>
            <p className="text-sm text-gray-600">{caseItem.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
            {caseItem.severity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
            {caseItem.status}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-2">{caseItem.message}</p>
        <div className="text-xs text-gray-500">
          <span className="mr-4">Source: {caseItem.source}</span>
          <span>Created: {formatTimestamp(caseItem.timestamp)}</span>
        </div>
      </div>

      {/* Threat Intelligence */}
      {caseItem.threatIntel && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-red-800">Threat Intel:</span>
            <span className="text-red-600">{caseItem.threatIntel.reputation}</span>
          </div>
          <div className="text-xs text-red-600">
            Risk Score: {caseItem.threatIntel.riskScore}/100
          </div>
        </div>
      )}

      {/* Actions Log */}
      <div className="mb-3">
        <h4 className="text-xs font-medium text-gray-700 mb-1">Actions Log:</h4>
        <div className="space-y-1">
          {caseItem.actions?.map((action, idx) => (
            <div key={idx} className="text-xs text-gray-600 flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>{action.action} by {action.analyst} at {formatTimestamp(action.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedCase(caseItem)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
        >
          View Details
        </button>
        {caseItem.status !== 'Resolved' && (
          <>
            <button
              onClick={() => onRunPlaybook(caseItem.id, 'block-ip')}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Run Playbook
            </button>
            <button
              onClick={() => onResolveCase(caseItem.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Resolve
            </button>
          </>
        )}
        {caseItem.status === 'Resolved' && (
          <button
            onClick={() => generatePDFReport(caseItem.id)}
            disabled={isGeneratingPDF}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-blue-300 disabled:to-cyan-300 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-1"
          >
            <span>📄</span>
            <span>{isGeneratingPDF ? 'Generating...' : 'Generate Report'}</span>
          </button>
        )}
      </div>
    </div>
  );

  const CaseDetailModal = ({ caseItem, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Case #{caseItem.id} Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Alert Information</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Category:</span> {caseItem.category}</div>
                <div><span className="font-medium">Severity:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(caseItem.severity)}`}>
                    {caseItem.severity}
                  </span>
                </div>
                <div><span className="font-medium">Source:</span> {caseItem.source}</div>
                <div><span className="font-medium">Timestamp:</span> {formatTimestamp(caseItem.timestamp)}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Threat Intelligence</h3>
              {caseItem.threatIntel ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm">
                    <div><span className="font-medium">Reputation:</span> {caseItem.threatIntel.reputation}</div>
                    <div><span className="font-medium">Risk Score:</span> {caseItem.threatIntel.riskScore}/100</div>
                    <div><span className="font-medium">Last Seen:</span> {caseItem.threatIntel.lastSeen}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No threat intelligence available</div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Alert Message</h3>
            <div className="p-3 bg-gray-50 rounded text-sm font-mono">
              {caseItem.message}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Actions Log</h3>
            <div className="space-y-2">
              {caseItem.actions?.map((action, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">{action.action}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.analyst} • {formatTimestamp(action.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 transition-all duration-500`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🔍</span>
          Case Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Open Cases:</span> {openCases.length}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Closed Cases:</span> {closedCases.length}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('open')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'open' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Open Cases ({openCases.length})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'closed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Closed Cases ({closedCases.length})
        </button>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'open' ? openCases : closedCases).map((caseItem) => (
          <CaseCard key={caseItem.id} caseItem={caseItem} />
        ))}
      </div>

      {/* Empty State */}
      {(activeTab === 'open' ? openCases : closedCases).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg font-medium mb-2">
            {activeTab === 'open' ? 'No open cases' : 'No closed cases'}
          </p>
          <p className="text-sm">
            {activeTab === 'open' 
              ? 'Escalated alerts will appear here for investigation.'
              : 'Resolved cases will be archived here.'
            }
          </p>
        </div>
      )}

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal 
          caseItem={selectedCase} 
          onClose={() => setSelectedCase(null)} 
        />
      )}
    </div>
  );
};

export default CasesTab;
