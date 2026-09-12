import React from 'react';
import { useJobs } from '../context/JobContext';
import { Bell, Search, Smartphone, Monitor, ShieldCheck, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    unreadNotificationsCount,
    setActiveTab,
    deviceView,
    setDeviceView,
    isScanning,
    triggerScan,
  } = useJobs();

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Emblem & App Branding */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40 border border-emerald-400/30">
            {/* Ashoka Lion / State Seal emblem representation */}
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-white leading-tight">
                Tripura Govt Job Scanner
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-emerald-500/30">
                Official
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">
              Automated State Recruitment Monitor
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-2">
          {/* Quick Trigger Scan button */}
          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            title="Scan official Tripura portals now"
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setActiveTab('search')}
            title="Search notifications"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications with Unread Badge */}
          <button
            onClick={() => setActiveTab('notifications')}
            title="Notifications"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Device Mockup vs Full Desktop Toggle */}
          <button
            onClick={() => setDeviceView(deviceView === 'android' ? 'desktop' : 'android')}
            title={deviceView === 'android' ? 'Switch to Full Screen View' : 'Switch to Android Phone Preview'}
            className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-700/60"
          >
            {deviceView === 'android' ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline text-[11px] font-medium">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[11px] font-medium">Android</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
