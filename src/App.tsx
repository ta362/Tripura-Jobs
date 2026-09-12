import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { AndroidFrame } from './components/AndroidFrame';
import { ScanStatusBar } from './components/ScanStatusBar';
import { StatCards } from './components/StatCards';
import { FilterDrawer } from './components/FilterDrawer';
import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { SavedJobsView } from './components/SavedJobsView';
import { NotificationsView } from './components/NotificationsView';
import { AdminView } from './components/AdminView';
import { ProfileView } from './components/ProfileView';
import {
  Sparkles,
  Inbox,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    jobs,
    loading,
    error,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    resetFilters,
  } = useJobs();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-0">
            {/* Real-time telemetry scan bar */}
            <ScanStatusBar />

            {/* Metric Filter Cards */}
            <StatCards />

            {/* Section Header */}
            <div className="p-4 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Official Recruitment Notifications
                </h2>
                <span className="text-[11px] font-semibold text-slate-400">
                  ({jobs.length})
                </span>
              </div>

              <button
                onClick={() => setActiveTab('search')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
              >
                <span>Filter & Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick search input */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Quick search (e.g., TPSC, Engineer, Teacher, Police)..."
                  className="w-full bg-slate-900 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Jobs List */}
            <div className="px-4 pb-6 space-y-3">
              {loading ? (
                <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                  <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning and loading official Tripura notifications...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs">
                  {error}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No Matching Notifications</h3>
                  <p className="text-xs text-slate-400">
                    No active recruitment notices match the applied filter.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-emerald-400 text-xs font-semibold hover:bg-slate-700"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                jobs.map(job => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {/* Trust Footer */}
            <div className="px-4 py-4 border-t border-slate-800/80 bg-slate-950 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-slate-500 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tripura Govt Job Scanner • Automated Verification Engine</span>
              </div>
              <p className="text-[10px] text-slate-600">
                Official notices verified directly from portal feeds. No third-party advertisements or fees.
              </p>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-4">
            <FilterDrawer />
            <div className="px-4 pb-6 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Found <strong>{jobs.length}</strong> matching recruitment notices
                </span>
              </div>
              {jobs.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                  <Inbox className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">Try modifying your filter or keyword</p>
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                jobs.map(job => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </div>
        );

      case 'saved':
        return <SavedJobsView />;

      case 'notifications':
        return <NotificationsView />;

      case 'admin':
        return <AdminView />;

      case 'profile':
        return <ProfileView />;

      default:
        return null;
    }
  };

  return (
    <AndroidFrame>
      {renderTabContent()}
      <JobDetailsModal />
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <MainAppContent />
      </JobProvider>
    </AuthProvider>
  );
}
