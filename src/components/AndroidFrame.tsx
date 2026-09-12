import React from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { SidebarDrawer } from './SidebarDrawer';
import {
  Briefcase,
  Search,
  Bookmark,
  Bell,
  Shield,
  User,
  Building2,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

const TRIPURA_DEPARTMENTS = [
  { name: 'TPSC', filterOrg: 'Tripura Public Service Commission' },
  { name: 'JRBT', filterOrg: 'Joint Recruitment Board Tripura' },
  { name: 'Health & Family Welfare', filterOrg: 'Health & Family Welfare' },
  { name: 'Education Dept', filterOrg: 'Education (School) Department' },
  { name: 'Tripura Police', filterOrg: 'Tripura Police Department' },
  { name: 'High Court', filterOrg: 'High Court of Tripura' },
];

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    setFilters,
  } = useJobs();
  const { isAdmin } = useAuth();

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
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      badge: isAdmin ? null : null,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Swipeable & Collapsible Full Menu Drawer */}
      <SidebarDrawer />

      {/* Top Header */}
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row pb-20 md:pb-0">
        {/* Desktop Left Sidebar Navigation */}
        <aside className="hidden md:block w-64 border-r border-slate-200 bg-white p-4 shrink-0 shadow-xs">
          <div className="space-y-1.5 sticky top-20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Main Menu
            </span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Department Shortcuts in Desktop Sidebar */}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2 flex items-center justify-between">
                <span>Tripura Portals</span>
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <div className="space-y-1">
                {TRIPURA_DEPARTMENTS.map(dept => (
                  <button
                    key={dept.name}
                    type="button"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, organization: dept.filterOrg, search: '' }));
                      setActiveTab('home');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{dept.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">{children}</main>
      </div>

      {/* Mobile Bottom Navigation (Responsive for phones and small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-2 px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl relative transition-all active:scale-95 ${
                isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-emerald-600 rounded-full" />
              )}
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
