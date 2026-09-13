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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
      {/* 1. New Jobs */}
      <div
        onClick={() => handleSelectStatus('NEW')}
        className={`cursor-pointer rounded-2xl p-3 border transition-all select-none ${
          currentFilter === 'NEW'
            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-bold text-rose-700">New Jobs</span>
          </div>
          <Sparkles className="w-4 h-4 text-rose-600" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {scannerStatus.newJobsCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Recently added</span>
        </div>
      </div>

      {/* 2. Updated */}
      <div
        onClick={() => handleSelectStatus('UPDATED')}
        className={`cursor-pointer rounded-2xl p-3 border transition-all select-none ${
          currentFilter === 'UPDATED'
            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-800">Updated</span>
          </div>
          <RefreshCw className="w-4 h-4 text-amber-600" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {scannerStatus.updatedJobsCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Dates extended</span>
        </div>
      </div>

      {/* 3. Closing Soon */}
      <div
        onClick={() => handleSelectStatus('CLOSING_SOON')}
        className={`cursor-pointer rounded-2xl p-3 border transition-all select-none ${
          currentFilter === 'CLOSING_SOON'
            ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-200 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-xs font-bold text-orange-800">Closing Soon</span>
          </div>
          <Clock className="w-4 h-4 text-orange-600" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {scannerStatus.closingSoonCount}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">≤ 5 Days left</span>
        </div>
      </div>

      {/* 4. Total Active */}
      <div
        onClick={() => handleSelectStatus('ACTIVE')}
        className={`cursor-pointer rounded-2xl p-3 border transition-all select-none ${
          currentFilter === 'ACTIVE'
            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-beacon-pulse"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800">All Active</span>
          </div>
          <Briefcase className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {scannerStatus.totalJobs}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Live vacancies</span>
        </div>
      </div>
    </div>
  );
};
