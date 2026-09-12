import React from 'react';
import { JobRecord } from '../types';
import { useJobs } from '../context/JobContext';
import {
  Calendar,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Clock,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface JobCardProps {
  job: JobRecord;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { setSelectedJob, savedJobIds, toggleSave } = useJobs();
  const isSaved = savedJobIds.has(job.id);

  // Calculate days remaining
  const getDaysRemaining = (lastDateStr: string) => {
    if (!lastDateStr || lastDateStr === 'Not specified in notification') return null;
    const lastDate = new Date(lastDateStr);
    if (isNaN(lastDate.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysLeft = getDaysRemaining(job.application_last_date);

  return (
    <div
      onClick={() => setSelectedJob(job)}
      className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
    >
      {/* Top Bar: Organization & Status Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-emerald-400 line-clamp-1">
              {job.organization_name}
            </span>
            {job.verified_from_official_source && (
              <span
                title="Verified against configured official government source"
                className="inline-flex items-center space-x-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/25"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Verified</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 line-clamp-1 flex items-center space-x-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span>{job.department_name}</span>
          </span>
        </div>

        {/* Bookmark Action */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleSave(job.id);
          }}
          className={`p-2 rounded-full transition-colors ${
            isSaved
              ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save this job'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Job Title */}
      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors leading-snug mb-2">
        {job.job_title}
      </h3>

      {/* Prominent Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {job.is_new && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-md shadow-sm shadow-rose-900/40">
            <Sparkles className="w-3 h-3" />
            <span>NEW</span>
          </span>
        )}

        {job.is_updated && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
            <RefreshCw className="w-3 h-3" />
            <span>UPDATED</span>
          </span>
        )}

        {job.status === 'CLOSING_SOON' && daysLeft !== null && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3" />
            <span>Closing in {daysLeft} day{daysLeft > 1 ? 's' : ''}</span>
          </span>
        )}

        {job.status === 'EXPIRED' && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md">
            <span>Expired (Reference)</span>
          </span>
        )}

        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
          {job.advertisement_number}
        </span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/60 mb-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-semibold">
              {job.vacancy_count !== null ? `${job.vacancy_count} Posts` : 'Direct Recruitment'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">
            Last Date:{' '}
            <strong className="text-slate-100 font-medium">
              {job.application_last_date}
            </strong>
          </span>
        </div>

        <div className="col-span-2 flex items-start space-x-2 text-slate-400 pt-1 border-t border-slate-800/50">
          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="line-clamp-1 text-[11px]">
            {job.qualification}
          </span>
        </div>
      </div>

      {/* Footer link */}
      <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
        <span className="text-[11px]">
          {job.salary.slice(0, 32)}
        </span>
        <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
          <span>View Notification</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
