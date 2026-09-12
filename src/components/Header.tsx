import React from 'react';
import { useJobs } from '../context/JobContext';
import { Bell, Search, ShieldCheck, RefreshCw, Menu } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    unreadNotificationsCount,
    setActiveTab,
    isScanning,
    triggerScan,
    toggleSidebar,
  } = useJobs();

  return (
    <header className="bg-white text-slate-900 sticky top-0 z-30 shadow-xs border-b border-slate-200">
      <div className="px-4 py-3 flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* Left: Hamburger Menu Button + Emblem & App Branding */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={toggleSidebar}
            title="Open all menus (or swipe from left)"
            className="p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 leading-tight">
                  Tripura Job Scanner
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200 shrink-0">
                  Official
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Tripura Govt Recruitment Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Trigger Scan button */}
          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            title="Scan official Tripura portals now"
            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setActiveTab('search')}
            title="Search notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications with Unread Badge */}
          <button
            onClick={() => setActiveTab('notifications')}
            title="Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
