import React from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import {
  Briefcase,
  Search,
  Bookmark,
  Bell,
  Shield,
  User,
  Wifi,
  BatteryMedium,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const {
    deviceView,
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
  } = useJobs();
  const { isAdmin } = useAuth();

  const currentTime = '09:41';

  // Navigation Items
  const navItems = [
    { id: 'home', label: 'Jobs', icon: Briefcase },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      id: isAdmin ? 'admin' : 'profile',
      label: isAdmin ? 'Admin' : 'Profile',
      icon: isAdmin ? Shield : User,
    },
  ];

  if (deviceView === 'desktop') {
    // Expanded Full Screen Layout
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
        <Header />
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row pb-20 md:pb-0">
          {/* Desktop Left Sidebar Navigation */}
          <aside className="hidden md:block w-64 border-r border-slate-800/80 bg-slate-900/60 p-4 shrink-0">
            <div className="space-y-1.5 sticky top-20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
                Navigation
              </span>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Desktop Content */}
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>

        {/* Mobile Bottom Navigation fallback on mobile viewport */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl relative transition-all ${
                  isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Realistic Android Mobile Phone Viewport
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Device Frame */}
      <div className="w-full sm:max-w-[430px] h-screen sm:h-[890px] sm:max-h-[95vh] bg-slate-950 sm:border-[10px] sm:border-slate-800 sm:rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative sm:ring-1 sm:ring-slate-700/60">
        {/* Android 14 Status Bar */}
        <div className="h-7 bg-slate-900 text-slate-300 text-xs px-6 flex items-center justify-between select-none shrink-0 border-b border-slate-800/60">
          <span className="font-semibold text-[12px] tracking-tight">{currentTime}</span>

          {/* Camera Punch Hole */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner" />

          {/* Icons: 5G, Wifi, Battery */}
          <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-300">
            <span>5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">98%</span>
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Top App Bar */}
        <Header />

        {/* Scrollable Android Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-950 pb-20">
          {children}
        </main>

        {/* Material 3 Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 z-40 flex items-center justify-around pt-2 pb-5 px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center py-1 px-3 rounded-2xl relative transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-1 w-8 h-1 bg-emerald-500 rounded-full" />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-1">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Android Gesture Bar Pill */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-600/60 rounded-full pointer-events-none z-50" />
      </div>
    </div>
  );
};
