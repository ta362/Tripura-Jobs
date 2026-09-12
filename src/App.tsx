import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { AndroidFrame } from './components/AndroidFrame';
import { UserAuthScreen } from './components/UserAuthScreen';
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
  Inbox,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
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

  if (!isAuthenticated || !user) {
    return <UserAuthScreen />;
  }

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
            <div className="p-4 pb-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Official Recruitment Notices
                </h2>
                <span className="text-xs font-bold text-slate-500">
                  ({jobs.length})
                </span>
              </div>

              <button
                onClick={() => setActiveTab('search')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1"
              >
                <span>Filter & Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick search input */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Quick search (e.g., TPSC, Engineer, Teacher, Police)..."
                  className="w-full bg-white text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-300 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 shadow-xs"
                />
              </div>
            </div>

            {/* Jobs List */}
            <div className="px-4 pb-6 space-y-3">
              {loading ? (
                <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                  <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Scanning and loading official Tripura notifications...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium">
                  {error}
                </div>
              ) : jobs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
                  <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">No Matching Notifications</h3>
                  <p className="text-xs text-slate-500">
                    No active recruitment notices match the applied filter.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                jobs.map(job => <JobCard key={job.id} job={job} />)
              )}
            </div>

            {/* Trust Footer */}
            <div className="px-4 py-4 border-t border-slate-200 bg-white text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-slate-600 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tripura Govt Job Scanner • Automated Verification Engine</span>
              </div>
              <p className="text-[11px] text-slate-400">
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
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>
                  Found <strong className="text-slate-900 font-bold">{jobs.length}</strong> matching recruitment notices
                </span>
              </div>
              {jobs.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-xs">
                  <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">Try modifying your filter or keyword</p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
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
