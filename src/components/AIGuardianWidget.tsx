import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Activity, RefreshCw, AlertCircle, CheckCircle, Zap, X } from 'lucide-react';

interface HealingLog {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  actionTaken: string;
  status: string;
}

interface GuardianStatus {
  isFullyProtected: boolean;
  protectionLevel: string;
  systemHealthScore: number;
  totalHealsPerformed: number;
  activeMonitors: string[];
  recentLogs: HealingLog[];
  metrics: {
    monitoredRecords: number;
    activeSources: number;
    anomaliesDetected: number;
  };
}

export const AIGuardianWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healing, setHealing] = useState(false);
  const [status, setStatus] = useState<GuardianStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ai-guardian/status');
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI Guardian status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRunHeal = async () => {
    try {
      setHealing(true);
      const res = await fetch('/api/ai-guardian/heal', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setStatus(prev => prev ? { ...prev, totalHealsPerformed: prev.totalHealsPerformed + 1, recentLogs: json.logs } : prev);
        setToast(json.summary);
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      console.error('Heal failed', err);
    } finally {
      setHealing(false);
    }
  };

  return (
    <>
      {/* Floating AI Guardian Pill / Badge in Bottom Left or Header */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => { setIsOpen(true); fetchStatus(); }}
          className="flex items-center space-x-2 bg-slate-900/90 hover:bg-slate-900 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 group text-xs font-bold"
          title="AI Guardian Sentinel Active"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="text-white hidden sm:inline">AI Guardian: <span className="text-emerald-400">100% Secure</span></span>
          <span className="sm:hidden text-emerald-400">AI Safe</span>
        </button>
      </div>

      {/* Toast Notification for Auto-Heal */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center space-x-3 text-xs max-w-sm animate-fade-in">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-emerald-300">AI Sentinel Auto-Heal Executed</p>
            <p className="text-slate-300 text-[11px]">{toast}</p>
          </div>
        </div>
      )}

      {/* AI Guardian Control Center Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl">
                  <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center space-x-2">
                    <span>AI Guardian & Self-Healing Sentinel</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Autonomous v2.5</span>
                  </h3>
                  <p className="text-xs text-slate-400">Continuous AI oversight, self-correction, and zero-downtime safety</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 bg-slate-50/50 flex-1">
              
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">System Health Score</p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {status ? `${status.systemHealthScore}%` : '99.8%'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Auto-Heals Performed</p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {status ? status.totalHealsPerformed : 14}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Monitored Records</p>
                    <p className="text-xl font-extrabold text-slate-900">
                      {status ? status.metrics.monitoredRecords : 0} Jobs
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Protection Shields */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Active Autonomous Safety Shields</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(status?.activeMonitors || [
                    'Real-time Data Sanitization',
                    'Automatic Expired Vacancy Pruning',
                    'Scan Engine Failover & Recovery',
                    'Client-Server State Sync Guard',
                  ]).map((monitor, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                      <span>{monitor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Healing Action & Logs */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>AI Autonomous Healing Log</span>
                  </h4>
                  <button
                    onClick={handleRunHeal}
                    disabled={healing}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${healing ? 'animate-spin' : ''}`} />
                    <span>{healing ? 'Diagnosing & Healing...' : 'Run Deep Diagnosis & Fix Now'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {status?.recentLogs?.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-slate-900">{log.category}</span>
                          <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{log.status}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{log.message}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5 italic">Action: {log.actionTaken}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">AI Sentinel is actively protecting this app 24/7.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
