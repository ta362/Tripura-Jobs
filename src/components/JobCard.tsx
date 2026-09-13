import React from 'react';
import { JobRecord } from '../types';
import { useJobs } from '../context/JobContext';
import { formatReadableDate } from '../utils/dateFormatter';
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
      className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden"
    >
      {/* Top Bar: Organization & Status Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-emerald-800 line-clamp-1">
              {job.organization_name}
            </span>
            {job.verified_from_official_source && (
              <span
                title="Verified against configured official government source"
                className="inline-flex items-center space-x-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                <span>Verified</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 line-clamp-1 flex items-center space-x-1 mt-0.5">
            <Building2 className="w-3 h-3 text-slate-400" />
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
              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save this job'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Job Title - High Contrast */}
      <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors leading-snug mb-2.5">
        {job.job_title}
      </h3>

      {/* Prominent Badges Row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {job.is_new && (
          <span className="inline-flex items-center space-x-0.5 text-[7px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-sm shadow-xs">
            <Sparkles className="w-2 h-2" />
            <span>NEW</span>
          </span>
        )}

        {job.is_updated && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
            <RefreshCw className="w-3 h-3 text-amber-700" />
            <span>UPDATED</span>
          </span>
        )}

        {job.status === 'CLOSING_SOON' && daysLeft !== null && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-bold bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-orange-700" />
            <span>Closing in {daysLeft} day{daysLeft > 1 ? 's' : ''}</span>
          </span>
        )}

        {job.status === 'EXPIRED' && (
          <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md">
            <span>Expired (Reference)</span>
          </span>
        )}

        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {job.advertisement_number}
        </span>
      </div>

      {/* Key Metrics Grid - Clean Light Design */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 rounded-xl p-3 border border-slate-200/90 mb-3">
        <div className="flex items-center space-x-2 text-slate-700">
          <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-900 font-bold">
              {job.vacancy_count !== null ? `${job.vacancy_count} Vacancies` : 'Direct Recruitment'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            Last Date:{' '}
            <strong className="text-slate-900 font-bold">
              {formatReadableDate(job.application_last_date)}
            </strong>
          </span>
        </div>

        <div className="col-span-2 flex items-start space-x-2 text-slate-600 pt-1.5 border-t border-slate-200">
          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="line-clamp-1 text-[11px] font-medium text-slate-800">
            {job.qualification}
          </span>
        </div>
      </div>

      {/* Footer link */}
      <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
        <span className="text-[11px] font-medium text-slate-600">
          {job.salary.slice(0, 34)}
        </span>
        <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
