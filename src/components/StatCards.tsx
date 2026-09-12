import React from 'react';
import { useJobs } from '../context/JobContext';
import { Sparkles, RefreshCw, Clock, Briefcase } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { scannerStatus, filters, setFilters } = useJobs();

  if (!scannerStatus) return null;

  const currentFilter = filters.status;

  const handleSelectStatus = (statusKey: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === statusKey ? 'ALL' : statusKey,
    }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800/80">
      {/* 1. New Jobs */}
      <div
        onClick={() => handleSelectStatus('NEW')}
        className={`cursor-pointer rounded-xl p-3 border transition-all select-none ${
          currentFilter === 'NEW'
            ? 'bg-rose-950/50 border-rose-500 shadow-md shadow-rose-900/20'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold text-rose-300">New Jobs</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {scannerStatus.newJobsCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Added recently</span>
        </div>
      </div>

      {/* 2. Updated */}
      <div
        onClick={() => handleSelectStatus('UPDATED')}
        className={`cursor-pointer rounded-xl p-3 border transition-all select-none ${
          currentFilter === 'UPDATED'
            ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-900/20'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-300">Updated</span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {scannerStatus.updatedJobsCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Dates / Vacancies</span>
        </div>
      </div>

      {/* 3. Closing Soon */}
      <div
        onClick={() => handleSelectStatus('CLOSING_SOON')}
        className={`cursor-pointer rounded-xl p-3 border transition-all select-none ${
          currentFilter === 'CLOSING_SOON'
            ? 'bg-orange-950/50 border-orange-500 shadow-md shadow-orange-900/20'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-xs font-semibold text-orange-300">Closing Soon</span>
          </div>
          <Clock className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {scannerStatus.closingSoonCount}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">≤ 5 Days Left</span>
        </div>
      </div>

      {/* 4. Total Active */}
      <div
        onClick={() => handleSelectStatus('ACTIVE')}
        className={`cursor-pointer rounded-xl p-3 border transition-all select-none ${
          currentFilter === 'ACTIVE'
            ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-900/20'
            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">Active Jobs</span>
          </div>
          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {scannerStatus.totalJobs}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Live notifications</span>
        </div>
      </div>
    </div>
  );
};
