import React from 'react';
import { useJobs } from '../context/JobContext';
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export const ScanStatusBar: React.FC = () => {
  const { scannerStatus, isScanning, triggerScan } = useJobs();

  if (!scannerStatus) return null;

  const formatLastScan = (isoString: string | null) => {
    if (!isoString) return 'Today, Recent';
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `Today, ${hours}:${mins}`;
    } catch {
      return 'Today, Recent';
    }
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Last scan timestamp & source stats */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-slate-300">
          <div className="flex items-center space-x-1.5 font-medium text-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Last data update:</span>
            <span className="text-emerald-300 font-semibold">
              {formatLastScan(scannerStatus.lastScanTime)}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Sources scanned:</span>
            <span className="text-slate-200 font-medium">
              {scannerStatus.activeSources} / {scannerStatus.totalSources}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>New:</span>
            <span className="font-semibold">{scannerStatus.newJobsCount}</span>
          </div>

          <div className="flex items-center space-x-1 text-amber-400">
            <span>Updated:</span>
            <span className="font-semibold">{scannerStatus.updatedJobsCount}</span>
          </div>

          {scannerStatus.failedSourcesCount > 0 && (
            <div className="flex items-center space-x-1 text-rose-400 font-medium bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{scannerStatus.failedSourcesCount} source temporarily in manual review</span>
            </div>
          )}
        </div>

        {/* Right: Live scan CTA */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            className="flex items-center space-x-1 text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 px-2.5 py-1 rounded-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Portals...' : 'Run Scanner'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
