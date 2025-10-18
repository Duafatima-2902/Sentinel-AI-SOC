import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AlertsChart = ({ alerts }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate chart data based on alerts
    const now = new Date();
    const data = [];
    
    // Create data points for the last 24 hours (hourly)
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourStr = hour.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Count alerts for this hour
      const alertsInHour = alerts.filter(alert => {
        const alertTime = new Date(alert.timestamp);
        return alertTime.getHours() === hour.getHours() && 
               alertTime.getDate() === hour.getDate();
      }).length;
      
      data.push({
        time: hourStr,
        alerts: alertsInHour,
        high: alerts.filter(alert => {
          const alertTime = new Date(alert.timestamp);
          return alertTime.getHours() === hour.getHours() && 
                 alertTime.getDate() === hour.getDate() &&
                 alert.severity === 'High';
        }).length,
        critical: alerts.filter(alert => {
          const alertTime = new Date(alert.timestamp);
          return alertTime.getHours() === hour.getHours() && 
                 alertTime.getDate() === hour.getDate() &&
                 alert.severity === 'Critical';
        }).length
      });
    }
    
    setChartData(data);
  }, [alerts]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Alerts Over Time</h2>
        <p className="text-sm text-gray-500 mt-1">Last 24 hours</p>
      </div>
      
      <div className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#f9fafb', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="alerts" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Total Alerts"
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#f97316" 
                strokeWidth={2}
                dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                name="High Severity"
              />
              <Line 
                type="monotone" 
                dataKey="critical" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Critical"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Total Alerts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">High Severity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsChart;
