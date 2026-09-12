import React from 'react';
import { useJobs } from '../context/JobContext';
import { Bell, Sparkles, Clock, RefreshCw, CheckCheck, ExternalLink } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, setSelectedJob, jobs } = useJobs();

  const handleNotificationClick = (jobId: string | null, notifId: string) => {
    markNotificationRead(notifId);
    if (jobId) {
      const target = jobs.find(j => j.id === jobId);
      if (target) {
        setSelectedJob(target);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_JOB':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      case 'DEADLINE':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'UPDATE':
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>Recruitment Alerts & Deadlines</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Automated alerts for new vacancies, last-date extensions, and closing deadlines
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2 shadow-xs">
          <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Caught Up</h3>
          <p className="text-xs text-slate-500">
            No unread recruitment notifications right now. The scanner continuously monitors for updates.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.job_id, notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 select-none shadow-xs ${
                notif.is_read
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-white border-emerald-300 shadow-sm text-slate-900 ring-1 ring-emerald-100'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                  notif.is_read ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 border border-emerald-100'
                }`}
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-black leading-tight truncate ${
                      notif.is_read ? 'text-slate-700' : 'text-slate-900'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                    {formatTime(notif.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                  {notif.message}
                </p>

                {notif.job_id && (
                  <div className="mt-2.5 flex items-center space-x-1 text-xs text-emerald-700 font-bold">
                    <span>View Notification Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
