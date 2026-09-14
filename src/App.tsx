import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { AndroidFrame } from './components/AndroidFrame';
import { UserAuthScreen } from './components/UserAuthScreen';
import { FilterDrawer } from './components/FilterDrawer';
import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { SavedJobsView } from './components/SavedJobsView';
import { NotificationsView } from './components/NotificationsView';
import { AdminView } from './components/AdminView';
import { ProfileView } from './components/ProfileView';
import { ExamScheduleAlerts } from './components/ExamScheduleAlerts';
import {
  Inbox,
  ArrowRight,
  ShieldCheck,
  Search,
  Radio,
  Calendar,
  AlertCircle
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

  const [homeSubTab, setHomeSubTab] = useState<'recruitment' | 'exams'>('recruitment');

  if (!isAuthenticated || !user) {
    return <UserAuthScreen />;
  }

  // Count official exam notices only
  const examJobsCount = jobs.filter(job => {
    const title = job.job_title.toLowerCase();
    const isExamNoticeType = job.vacancy_count === null || job.vacancy_count === 0 || 
      title.includes('tet') || 
      title.includes('test') || 
      title.includes('exam schedule') || 
      title.includes('admit card') || 
      title.includes('syllabus') || 
      title.includes('answer key') || 
      title.includes('exam notice') || 
      title.includes('written examination schedule');
    
    const isDirectRecruitmentJob = job.vacancy_count !== null && job.vacancy_count > 0 && 
      (title.includes('recruitment') || title.includes('posts') || title.includes('grade-ii') || title.includes('junior engineer') || title.includes('sub-inspector') || title.includes('lower division clerk') || title.includes('medical officer'));

    return isExamNoticeType && !isDirectRecruitmentJob && Boolean(job.exam_date);
  }).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-0">
            {/* Dynamic Segmented Custom Navigation Switcher */}
            <div className="p-3 pb-0.5">
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shadow-xs">
                <button
                  onClick={() => setHomeSubTab('recruitment')}
                  className={`relative flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 ${
                    homeSubTab === 'recruitment'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/40 transform scale-[1.01]'
                      : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50/40'
                  }`}
                >
                  <span className="inline-flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    <span className="truncate">Recruitment</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                    homeSubTab === 'recruitment' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {jobs.length}
                  </span>
                </button>

                <button
                  onClick={() => setHomeSubTab('exams')}
                  className={`relative flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-extrabold transition-all duration-300 ${
                    homeSubTab === 'exams'
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/40 transform scale-[1.01]'
                      : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50/40'
                  }`}
                >
                  <span className="inline-flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-red-500 shrink-0" />
                    <span className="truncate">Exam Alerts</span>
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                    homeSubTab === 'exams' ? 'bg-red-50 text-red-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {examJobsCount}
                  </span>
                </button>
              </div>
            </div>

            {homeSubTab === 'recruitment' ? (
              <>
                {/* Section Header */}
                <div className="px-3.5 pt-3 pb-2 flex items-center">
                  <div className="flex items-center space-x-1.5">
                    <div className="relative flex items-center justify-center w-5 h-5 shrink-0 select-none">
                      {/* Central solid red dot */}
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 z-10 animate-signal-glow"></span>
                      {/* Rippling Signal Wave 1 */}
                      <span className="absolute w-1.5 h-1.5 rounded-full border border-red-500/80 animate-signal-wave"></span>
                    </div>
                    <h2 className="text-xs font-black text-slate-900 tracking-tight">
                      Official Recruitment Notices
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500">
                      ({jobs.length})
                    </span>
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
              </>
            ) : (
              <ExamScheduleAlerts jobs={jobs} />
            )}

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
