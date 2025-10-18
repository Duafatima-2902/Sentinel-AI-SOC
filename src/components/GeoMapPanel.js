import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeoMapPanel = ({ logs, alerts }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Extract IPs from logs and alerts
  const extractIPs = () => {
    const ipMap = new Map();
    
    [...logs, ...alerts].forEach(item => {
      const message = item.message || item.log?.message || '';
      const ipMatch = message.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
      
      if (ipMatch) {
        const ip = ipMatch[0];
        const severity = item.severity || item.log?.severity || 'Low';
        
        if (!ipMap.has(ip)) {
          ipMap.set(ip, {
            ip,
            severity,
            count: 0,
            timestamp: item.timestamp,
            category: item.category || item.log?.category || 'Unknown'
          });
        }
        
        const existing = ipMap.get(ip);
        existing.count++;
        
        // Update to highest severity
        const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        if (severityOrder[severity] > severityOrder[existing.severity]) {
          existing.severity = severity;
        }
      }
    });
    
    return Array.from(ipMap.values());
  };

  // Get marker color based on severity
  const getMarkerColor = (severity) => {
    const colors = {
      'Low': '#22C55E',      // green
      'Medium': '#FBBF24',   // yellow
      'High': '#FB923C',     // orange
      'Critical': '#EF4444'  // red
    };
    return colors[severity] || colors.Low;
  };

  // Create custom marker icon
  const createMarkerIcon = (color) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Mock geolocation for IPs (in real implementation, use a geolocation service)
  const getMockLocation = (ip) => {
    // Simple hash-based mock locations
    const hash = ip.split('.').reduce((a, b) => a + parseInt(b), 0);
    const locations = [
      { lat: 40.7128, lng: -74.0060, country: 'United States' },
      { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
      { lat: 35.6762, lng: 139.6503, country: 'Japan' },
      { lat: 52.5200, lng: 13.4050, country: 'Germany' },
      { lat: 48.8566, lng: 2.3522, country: 'France' },
      { lat: 39.9042, lng: 116.4074, country: 'China' },
      { lat: -33.8688, lng: 151.2093, country: 'Australia' },
      { lat: 55.7558, lng: 37.6176, country: 'Russia' },
      { lat: 19.4326, lng: -99.1332, country: 'Mexico' },
      { lat: -22.9068, lng: -43.1729, country: 'Brazil' }
    ];
    return locations[hash % locations.length];
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    setIsMapLoaded(true);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers when logs/alerts change
  useEffect(() => {
    if (!mapInstance.current || !isMapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    const ips = extractIPs();
    ips.forEach(ipData => {
      const location = getMockLocation(ipData.ip);
      const color = getMarkerColor(ipData.severity);
      const icon = createMarkerIcon(color);

      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${ipData.ip}</h3>
            <p style="margin: 4px 0;"><strong>Severity:</strong> 
              <span style="color: ${color}; font-weight: bold;">${ipData.severity}</span>
            </p>
            <p style="margin: 4px 0;"><strong>Occurrences:</strong> ${ipData.count}</p>
            <p style="margin: 4px 0;"><strong>Country:</strong> ${location.country}</p>
            <p style="margin: 4px 0;"><strong>Category:</strong> ${ipData.category}</p>
            <p style="margin: 4px 0;"><strong>Last Seen:</strong> ${new Date(ipData.timestamp).toLocaleString()}</p>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [logs, alerts, isMapLoaded]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="mr-2">🌍</span>
          Global Threat Map
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total IPs:</span> {extractIPs().length}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Critical:</span> 
            <span className="ml-1 text-red-600 font-bold">
              {extractIPs().filter(ip => ip.severity === 'Critical').length}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          <span>High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Critical</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border border-gray-200"
          style={{ minHeight: '384px' }}
        />
        
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Low', 'Medium', 'High', 'Critical'].map(severity => {
          const count = extractIPs().filter(ip => ip.severity === severity).length;
          const color = getMarkerColor(severity);
          return (
            <div key={severity} className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold" style={{ color }}>{count}</div>
              <div className="text-xs text-gray-600">{severity}</div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GeoMapPanel;
