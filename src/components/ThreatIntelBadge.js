import React from 'react';

const ThreatIntelBadge = ({ ip, threatIntel }) => {
  if (!threatIntel) {
    return (
      <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
        <span className="mr-1">❓</span>
        Unknown
      </div>
    );
  }

  const getRiskColor = (riskScore) => {
    if (riskScore >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (riskScore >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (riskScore >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getRiskIcon = (riskScore) => {
    if (riskScore >= 80) return '🔴';
    if (riskScore >= 60) return '🟠';
    if (riskScore >= 40) return '🟡';
    return '🟢';
  };

  const getReputationColor = (reputation) => {
    const lowerRep = reputation.toLowerCase();
    if (lowerRep.includes('malicious') || lowerRep.includes('botnet') || lowerRep.includes('malware')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (lowerRep.includes('suspicious') || lowerRep.includes('unknown')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="space-y-2">
      {/* IP Address */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">IP:</span>
        <span className="text-sm font-mono text-gray-900">{ip}</span>
      </div>

      {/* Reputation */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Reputation:</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getReputationColor(threatIntel.reputation)}`}>
          <span className="mr-1">
            {threatIntel.reputation.toLowerCase().includes('malicious') ? '🚫' : 
             threatIntel.reputation.toLowerCase().includes('suspicious') ? '⚠️' : '✅'}
          </span>
          {threatIntel.reputation}
        </span>
      </div>

      {/* Risk Score */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Risk Score:</span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(threatIntel.riskScore)}`}>
          <span className="mr-1">{getRiskIcon(threatIntel.riskScore)}</span>
          {threatIntel.riskScore}/100
        </span>
      </div>

      {/* Additional Details */}
      {threatIntel.country && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Country:</span>
          <span className="text-sm text-gray-900">{threatIntel.country}</span>
        </div>
      )}

      {threatIntel.lastSeen && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Last Seen:</span>
          <span className="text-sm text-gray-900">{new Date(threatIntel.lastSeen).toLocaleDateString()}</span>
        </div>
      )}

      {/* Threat Categories */}
      {threatIntel.categories && threatIntel.categories.length > 0 && (
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Categories:</span>
          <div className="flex flex-wrap gap-1">
            {threatIntel.categories.map((category, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatIntelBadge;
