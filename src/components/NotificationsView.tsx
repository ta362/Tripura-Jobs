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
        return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'DEADLINE':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'UPDATE':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
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
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Recruitment Alerts & Deadlines</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts for new vacancies, last-date extensions, and closing deadlines
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">All Caught Up</h3>
          <p className="text-xs text-slate-400">
            No unread recruitment notifications right now. The scanner continuously monitors for updates.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.job_id, notif.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                notif.is_read
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-emerald-500/40 shadow-sm text-slate-200'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  notif.is_read ? 'bg-slate-800 text-slate-500' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-xs font-bold leading-tight truncate ${
                      notif.is_read ? 'text-slate-300' : 'text-white'
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatTime(notif.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.job_id && (
                  <div className="mt-2 flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
                    <span>View Notification Details</span>
                    <ExternalLink className="w-3 h-3" />
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
