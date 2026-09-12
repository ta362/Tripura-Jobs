import React, { useEffect, useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  Bookmark,
  Bell,
  Shield,
  User,
  X,
  ShieldCheck,
  Smartphone,
  MapPin,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

const TRIPURA_DEPARTMENTS = [
  { name: 'TPSC (Public Service Commission)', code: 'TPSC', filterOrg: 'Tripura Public Service Commission' },
  { name: 'JRBT (Joint Recruitment Board)', code: 'JRBT', filterOrg: 'Joint Recruitment Board Tripura' },
  { name: 'Health & Family Welfare', code: 'HEALTH', filterOrg: 'Health & Family Welfare' },
  { name: 'School Education Dept', code: 'EDU', filterOrg: 'Education (School) Department' },
  { name: 'Tripura Police Recruitment', code: 'POLICE', filterOrg: 'Tripura Police Department' },
  { name: 'High Court of Tripura', code: 'HC', filterOrg: 'High Court of Tripura' },
];

export const SidebarDrawer: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarOpen,
    setIsSidebarOpen,
    unreadNotificationsCount,
    savedJobIds,
    jobs,
    isScanning,
    triggerScan,
    setFilters,
  } = useJobs();

  const { user, isAdmin, logout } = useAuth();

  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Global Edge Swipe to Open & Swipe to Close Gesture Listeners
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartXRef.current;
      const deltaY = touchEndY - touchStartYRef.current;

      // Only trigger if horizontal movement is significantly greater than vertical movement
      if (Math.abs(deltaY) > Math.abs(deltaX) * 0.8) {
        return;
      }

      // If sidebar is CLOSED: swipe from the left edge (startX < 60) to the right (> 50px)
      if (!isSidebarOpen && touchStartXRef.current < 60 && deltaX > 45) {
        setIsSidebarOpen(true);
      }

      // If sidebar is OPEN: swipe to the left (< -45px) closes the sidebar
      if (isSidebarOpen && deltaX < -45) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarOpen, setIsSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  const handleNavClick = (tabId: any) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  const handleDeptFilter = (deptOrg: string) => {
    setFilters(prev => ({
      ...prev,
      organization: deptOrg,
      search: '',
    }));
    setActiveTab('home');
    setIsSidebarOpen(false);
  };

  const menuItems = [
    {
      id: 'home',
      label: 'All Tripura Govt Jobs',
      sublabel: 'Latest recruitment notices',
      icon: Briefcase,
      badge: `${jobs.length} Active`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'search',
      label: 'Search & Filters',
      sublabel: 'Qualifications, Pay scale & Age',
      icon: Search,
    },
    {
      id: 'saved',
      label: 'Saved & Bookmarked',
      sublabel: 'Your shortlisted vacancies',
      icon: Bookmark,
      badge: savedJobIds.size > 0 ? `${savedJobIds.size}` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'notifications',
      label: 'Notices & Alerts',
      sublabel: 'Daily deadline & admit cards',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New` : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'admin',
      label: 'Recruitment Admin Portal',
      sublabel: 'Trigger scanner & feed manager',
      icon: Shield,
      badge: isAdmin ? 'Admin' : 'Protected',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'profile',
      label: 'Candidate Profile',
      sublabel: 'Mobile OTP & district settings',
      icon: User,
    },
  ];

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Menu"
      >
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Tripura Job Scanner
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Govt
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Official Recruitment & Alerts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Drawer */}
        {user && (
          <div className="p-3.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {user.full_name}
                    </span>
                    {user.is_phone_verified && (
                      <span title="Mobile OTP Verified">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                    {user.phone ? (
                      <span className="truncate">{user.phone}</span>
                    ) : (
                      <span className="truncate">{user.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-1 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 transition-all shrink-0"
              >
                Profile
              </button>
            </div>

            {user.district && (
              <div className="mt-2 flex items-center space-x-1 text-[10px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{user.district}</span>
              </div>
            )}
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 divide-y divide-slate-100">
          {/* Main Menus */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1">
              All Application Menus
            </span>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isActive
                          ? 'bg-white text-emerald-800 border-white'
                          : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Department Shortcuts */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Official Departments
              </span>
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 gap-1">
              {TRIPURA_DEPARTMENTS.map(dept => (
                <button
                  key={dept.code}
                  type="button"
                  onClick={() => handleDeptFilter(dept.filterOrg)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate text-[11px] font-semibold">{dept.name}</span>
                  <span className="text-[9px] font-bold bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 px-1.5 py-0.5 rounded-md shrink-0">
                    {dept.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Sync Status Card */}
          <div className="pt-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Daily Auto-Scanner</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Regularly crawls official TPSC, JRBT, Tripura Portal, Health & Education recruitment circulars.
              </p>
              <button
                type="button"
                onClick={() => triggerScan()}
                disabled={isScanning}
                className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 shadow-2xs disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isScanning ? 'Scanning Portals...' : 'Scan Portals Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              logout();
              setIsSidebarOpen(false);
            }}
            className="flex items-center space-x-1.5 text-rose-600 hover:text-rose-700 font-bold py-1.5 px-2.5 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <span className="text-[10px] text-slate-400 font-medium">
            Tripura Govt Scanner &bull; v2.4
          </span>
        </div>
      </aside>
    </>
  );
};
