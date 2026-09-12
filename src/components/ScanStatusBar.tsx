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
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 text-xs shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Last scan timestamp & source stats */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-slate-600">
          <div className="flex items-center space-x-1.5 font-medium text-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Updated:</span>
            <span className="text-emerald-700 font-bold">
              {formatLastScan(scannerStatus.lastScanTime)}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Sources:</span>
            <span className="text-slate-900 font-bold">
              {scannerStatus.activeSources}/{scannerStatus.totalSources}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-bold border border-rose-200">
            <CheckCircle2 className="w-3 h-3 text-rose-600" />
            <span>{scannerStatus.newJobsCount} New</span>
          </div>

          <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-200">
            <span>{scannerStatus.updatedJobsCount} Updated</span>
          </div>

          {scannerStatus.failedSourcesCount > 0 && (
            <div className="flex items-center space-x-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{scannerStatus.failedSourcesCount} manual review</span>
            </div>
          )}
        </div>

        {/* Right: Live scan CTA */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            className="flex items-center space-x-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
