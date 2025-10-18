import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import KPICards from './components/KPICards';
import ChartsSection from './components/ChartsSection';
import LogAnalysisSection from './components/LogAnalysisSection';
import ThreatInsights from './components/ThreatInsights';
import MiniKPIStrip from './components/MiniKPIStrip';
import AutoPatchSection from './components/AutoPatchSection';
import AlertModal from './components/AlertModal';
import CasesTab from './components/CasesTab';
import GeoMapPanel from './components/GeoMapPanel';
import ThreatIntelBadge from './components/ThreatIntelBadge';
import PlaybookRunner from './components/PlaybookRunner';
import { ToastManager, useToast } from './components/Toast';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://soc-demo-app.vercel.app' 
  : 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [patches, setPatches] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [monitoringStats, setMonitoringStats] = useState({
    startTime: new Date().toISOString(),
    uptime: 0
  });
  const [cases, setCases] = useState([]);
  const [threatIntel, setThreatIntel] = useState(new Map());
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Toast management
  const { toasts, removeToast, showCritical, showWarning, showSuccess, showInfo } = useToast();

  // Load demo cases on component mount
  useEffect(() => {
    const loadDemoCases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cases`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCases(data.cases);
          }
        }
      } catch (error) {
        console.error('Error loading demo cases:', error);
      }
    };
    
    loadDemoCases();
  }, []);

  // Connect to Socket.IO
  useEffect(() => {
    const s = io(API_BASE_URL);
    setSocket(s);

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    s.on('newLog', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 500));
    });

    s.on('logUpdated', (updated) => {
      setLogs(prev => prev.map(l => l.id === updated.id ? updated : l));
    });

    s.on('newAlert', (alert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 200));
      
      // Show toast notification based on severity
      if (alert.severity === 'Critical') {
        showCritical(`🚨 Critical Alert: ${alert.message}`, 8000);
      } else if (alert.severity === 'High') {
        showWarning(`⚠️ High Severity Alert: ${alert.message}`, 6000);
      } else {
        showInfo(`ℹ️ New Alert: ${alert.message}`, 4000);
      }
      
      if (alert.severity === 'High' || alert.severity === 'Critical') {
        setActiveAlert(alert);
      }
    });

    s.on('alertAcknowledged', ({ alertId }) => {
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    });

        s.on('autoPatchCompleted', ({ patch, logId, patchedBy }) => {
          setPatches(prev => [patch, ...prev].slice(0, 200));
          if (logId) {
            setLogs(prev => prev.map(l => l.id === logId ? { ...l, autoPatched: true, patchId: patch.id } : l));
          }
        });

        s.on('alertPatched', ({ alertId, patchedBy, timestamp }) => {
          setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, patched: true, patchedBy, patchedAt: timestamp } : a));
        });

        s.on('gracePeriodStarted', ({ alertId, gracePeriod, startTime }) => {
          console.log(`Grace period started for alert ${alertId}: ${gracePeriod}s`);
        });

        s.on('gracePeriodCancelled', ({ alertId, cancelledAt }) => {
          console.log(`Grace period cancelled for alert ${alertId}`);
        });

        s.on('playbookCompleted', ({ executionId, playbookId, caseId, alertId, status, result, message }) => {
          console.log(`Playbook ${playbookId} completed: ${message}`);
          
          // Update patches with playbook result
          const patch = {
            id: executionId,
            timestamp: new Date().toISOString(),
            description: message,
            category: 'Playbook',
            severity: 'Low',
            status: 'completed',
            automated: true,
            patchedBy: 'Playbook',
            executionTime: Math.floor(Math.random() * 2000) + 1000,
            playbookId,
            result
          };
          setPatches(prev => [patch, ...prev].slice(0, 200));
        });

    s.on('suspiciousActivityUpdate', (activity) => {
      setSuspiciousActivities(prev => {
        const existing = prev.find(a => a.ip === activity.ip);
        if (existing) {
          return prev.map(a => a.ip === activity.ip ? { ...a, ...activity } : a);
        }
        return [activity, ...prev].slice(0, 50);
      });
    });

    s.on('monitoringStats', (stats) => {
      setMonitoringStats(stats);
      setSuspiciousActivities(stats.suspiciousActivities || []);
      setBlockedIPs(stats.blockedIPs || []);
    });

    s.on('dailyReset', () => {
      console.log('Daily reset received');
      setLogs([]);
      setAlerts([]);
      setPatches([]);
      setSuspiciousActivities([]);
      setBlockedIPs([]);
      setMonitoringStats({
        startTime: new Date().toISOString(),
        uptime: 0
      });
    });

    return () => s.close();
  }, []);

  // Compute KPIs from actual data
  const kpis = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const logsToday = logs.filter(l => new Date(l.timestamp) >= today).length;
    const alertsTriggered = alerts.length;
    const highSeverity = alerts.filter(a => a.severity === 'High').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'Critical').length;
    const autoPatches = patches.length;
    return { logsToday, alertsTriggered, highSeverity, criticalAlerts, blockedIPs: blockedIPs.length, autoPatches };
  }, [logs, alerts, patches, blockedIPs]);

  // Compute simple chart data from logs per hour
  const chartData = useMemo(() => {
    const buckets = {};
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getTime() - i * 3600 * 1000);
      const key = `${d.getHours()}:00`;
      buckets[key] = { time: key, total: 0, high: 0, critical: 0 };
    }
    logs.forEach(l => {
      const d = new Date(l.timestamp);
      const key = `${d.getHours()}:00`;
      if (!buckets[key]) buckets[key] = { time: key, total: 0, high: 0, critical: 0 };
      buckets[key].total += 1;
      if (l.severity === 'High') buckets[key].high += 1;
      if (l.severity === 'Critical') buckets[key].critical += 1;
    });
    // return last 24h in chronological order
    return Object.values(buckets).slice(-24).reverse();
  }, [logs]);

  // Derive threat level
  const threatLevel = useMemo(() => {
    if (kpis.criticalAlerts > 0) return 'CRITICAL';
    if (kpis.highSeverity > 2) return 'HIGH';
    if (kpis.alertsTriggered > 5) return 'MEDIUM';
    return 'LOW';
  }, [kpis]);

  // Modal actions: Patch, Escalate, and Ignore
  const handleAlertAction = async (alertId, action) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) {
      setActiveAlert(null);
      return;
    }

    if (action === 'Manual') {
      // Send manual patch request to backend
      if (socket) {
        socket.emit('manualPatch', { alertId, alert });
      }
    } else if (action === 'Escalate') {
      // Create case from escalated alert
      try {
        const response = await fetch(`${API_BASE_URL}/api/cases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alertId: alertId,
            category: alert.log?.category || 'Unknown',
            severity: alert.severity,
            message: alert.message,
            source: alert.log?.source || 'unknown',
            threatIntel: alert.log?.threatIntel || null
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCases(prev => [data.case, ...prev]);
          }
        } else {
          // Fallback to local case creation
          const newCase = {
            id: `case-${Date.now()}`,
            alertId: alertId,
            timestamp: new Date().toISOString(),
            category: alert.log?.category || 'Unknown',
            severity: alert.severity,
            message: alert.message,
            source: alert.log?.source || 'unknown',
            status: 'Open',
            actions: [{
              action: 'Escalated',
              analyst: 'Security Analyst',
              timestamp: new Date().toISOString()
            }],
            threatIntel: alert.log?.threatIntel || null
          };
          setCases(prev => [newCase, ...prev]);
        }
      } catch (error) {
        console.error('Error creating case:', error);
        // Fallback to local case creation
        const newCase = {
          id: `case-${Date.now()}`,
          alertId: alertId,
          timestamp: new Date().toISOString(),
          category: alert.log?.category || 'Unknown',
          severity: alert.severity,
          message: alert.message,
          source: alert.log?.source || 'unknown',
          status: 'Open',
          actions: [{
            action: 'Escalated',
            analyst: 'Security Analyst',
            timestamp: new Date().toISOString()
          }],
          threatIntel: alert.log?.threatIntel || null
        };
        setCases(prev => [newCase, ...prev]);
      }
    } else if (action === 'Auto-Policy') {
      // Auto-patch was triggered by timer - backend handles this
      console.log(`Auto-patch triggered for alert ${alertId}`);
    }
    
    setActiveAlert(null);
  };

  // Case management functions
  const handleResolveCase = async (caseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolutionType: 'Manual',
          playbooksRun: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCases(prev => prev.map(c => 
            c.id === caseId ? data.case : c
          ));
        }
      } else {
        // Fallback to local state update if API fails
        setCases(prev => prev.map(c => 
          c.id === caseId 
            ? { ...c, status: 'Resolved', actions: [...c.actions, {
                action: 'Resolved',
                analyst: 'Security Analyst',
                timestamp: new Date().toISOString()
              }]}
            : c
        ));
      }
    } catch (error) {
      console.error('Error resolving case:', error);
      // Fallback to local state update
      setCases(prev => prev.map(c => 
        c.id === caseId 
          ? { ...c, status: 'Resolved', actions: [...c.actions, {
              action: 'Resolved',
              analyst: 'Security Analyst',
              timestamp: new Date().toISOString()
            }]}
          : c
      ));
    }
  };

  const handleRunPlaybook = async (caseId, playbookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/playbook/${playbookId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Playbook ${playbookId} started:`, result);
        
        // Update case with playbook action
        setCases(prev => prev.map(c => 
          c.id === caseId 
            ? { ...c, actions: [...c.actions, {
                action: `Playbook: ${playbookId}`,
                analyst: 'System',
                timestamp: new Date().toISOString()
              }]}
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to run playbook:', error);
    }
  };

  // Fetch threat intelligence for IPs
  const fetchThreatIntel = async (ip) => {
    if (threatIntel.has(ip)) return threatIntel.get(ip);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/threatintel/${ip}`);
      if (response.ok) {
        const intel = await response.json();
        setThreatIntel(prev => new Map(prev).set(ip, intel));
        return intel;
      }
    } catch (error) {
      console.error('Failed to fetch threat intel:', error);
    }
    return null;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-cyber-dark-bg' : 'bg-cyber-light-bg'}`}>
      <Header 
        threatLevel={threatLevel} 
        isConnected={isConnected} 
        monitoringStats={monitoringStats}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'cases' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 Cases ({cases.filter(c => c.status !== 'Resolved').length})
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌍 Map
            </button>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <section className="mb-8">
              <KPICards data={kpis} darkMode={darkMode} />
            </section>

            <section className="mb-8">
              <ChartsSection data={chartData} darkMode={darkMode} />
            </section>

            <section className="mb-8">
              <LogAnalysisSection 
                logs={logs} 
                suspiciousActivities={suspiciousActivities}
                darkMode={darkMode}
                fetchThreatIntel={fetchThreatIntel}
                threatIntel={threatIntel}
              />
            </section>

            <section className="mb-8">
              <ThreatInsights logs={logs} alerts={alerts} darkMode={darkMode} />
            </section>

            <section className="mb-8">
              <MiniKPIStrip darkMode={darkMode} />
            </section>

            <section className="mb-8">
              <AutoPatchSection patches={patches} darkMode={darkMode} />
            </section>
          </>
        )}

        {/* Cases Tab */}
        {activeTab === 'cases' && (
          <section className="mb-8">
            <CasesTab 
              cases={cases}
              onResolveCase={handleResolveCase}
              onRunPlaybook={handleRunPlaybook}
              darkMode={darkMode}
            />
          </section>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <section className="mb-8">
            <GeoMapPanel logs={logs} alerts={alerts} darkMode={darkMode} />
          </section>
        )}
      </main>

      {activeAlert && (
        <AlertModal
          alert={activeAlert}
          onAction={handleAlertAction}
          onClose={() => setActiveAlert(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastManager toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;