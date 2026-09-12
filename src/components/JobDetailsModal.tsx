import React from 'react';
import { useJobs } from '../context/JobContext';
import {
  X,
  Calendar,
  Users,
  Award,
  ExternalLink,
  FileText,
  Bookmark,
  Share2,
  ShieldCheck,
  Building2,
  AlertCircle,
  Briefcase,
  IndianRupee,
  History,
  CheckCircle,
} from 'lucide-react';

export const JobDetailsModal: React.FC = () => {
  const { selectedJob, setSelectedJob, savedJobIds, toggleSave } = useJobs();

  if (!selectedJob) return null;

  const isSaved = savedJobIds.has(selectedJob.id);

  const handleShare = async () => {
    const text = `${selectedJob.job_title} - ${selectedJob.organization_name}\nLast Date: ${selectedJob.application_last_date}\nOfficial URL: ${selectedJob.official_notification_url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedJob.job_title,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        // cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Notification details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/90">
          <div className="flex-1 pr-4">
            <div className="flex items-center flex-wrap gap-1.5 mb-1.5">
              <span className="text-xs font-semibold text-emerald-400">
                {selectedJob.organization_name}
              </span>
              {selectedJob.verified_from_official_source && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-medium bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified from Official Source</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
              {selectedJob.job_title}
            </h2>
            <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{selectedJob.department_name}</span>
            </p>
          </div>

          <button
            onClick={() => setSelectedJob(null)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-300 text-sm">
          {/* Status & Advertisement Notice Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Advertisement No.</span>
              <span className="font-mono text-xs font-bold text-white">
                {selectedJob.advertisement_number}
              </span>
            </div>
            {selectedJob.notification_number && (
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Notification Ref</span>
                <span className="font-mono text-xs text-slate-300">
                  {selectedJob.notification_number}
                </span>
              </div>
            )}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Published Date</span>
              <span className="text-xs font-semibold text-emerald-400">
                {selectedJob.notification_date}
              </span>
            </div>
          </div>

          {/* Important Updates History (if any) */}
          {selectedJob.is_updated && selectedJob.update_history && selectedJob.update_history.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <History className="w-4 h-4" />
                <span>Notification Change / Update History</span>
              </div>
              <div className="space-y-1.5">
                {selectedJob.update_history.map(upd => (
                  <div key={upd.id} className="text-xs flex items-start space-x-2">
                    <span className="text-amber-400 font-semibold">• {upd.changed_field}:</span>
                    <span className="text-slate-300">
                      <span className="line-through text-slate-500">{upd.old_value}</span> →{' '}
                      <span className="text-amber-200 font-bold">{upd.new_value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Dates Timeline */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Important Dates Schedule</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Application Starts</span>
                <span className="font-semibold text-white mt-0.5 block">
                  {selectedJob.application_start_date}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Application Last Date</span>
                <span className="font-semibold text-rose-400 mt-0.5 block">
                  {selectedJob.application_last_date}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Examination Date</span>
                <span className="font-semibold text-teal-400 mt-0.5 block">
                  {selectedJob.exam_date || 'To be announced officially'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Parameters: Vacancies, Salary, Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Total Vacancies</span>
              </div>
              <span className="text-base font-bold text-white">
                {selectedJob.vacancy_count !== null ? `${selectedJob.vacancy_count} Posts` : 'Not specified'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedJob.category_information || 'Category-wise quota in notification'}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Salary / Scale</span>
              </div>
              <span className="text-base font-bold text-white">
                {selectedJob.pay_level || 'State Scale'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={selectedJob.salary}>
                {selectedJob.salary}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Age Criteria</span>
              </div>
              <span className="text-base font-bold text-white">
                {selectedJob.age_min ? `${selectedJob.age_min} - ${selectedJob.age_max} Years` : 'As per norms'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedJob.age_relaxation || '5 yrs relaxation for SC/ST'}
              </p>
            </div>
          </div>

          {/* Educational Qualification & Eligibility */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Educational Qualification & Eligibility</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {selectedJob.qualification}
            </p>
            {selectedJob.eligibility_summary && (
              <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                <strong>Summary:</strong> {selectedJob.eligibility_summary}
              </p>
            )}
          </div>

          {/* Selection Process & Application Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
              <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Selection Process
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedJob.selection_process || 'Written Examination & Interview'}
              </p>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
              <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Application Fee
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedJob.application_fee || 'As per official notification'}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl space-y-1">
            <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Official Notification Summary
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedJob.summary}
            </p>
          </div>

          {/* Source Provenance Notice */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-600/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified Government Source Provenance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              This recruitment record was monitored and retrieved from the official portal:{' '}
              <a
                href={selectedJob.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300 underline break-all hover:text-emerald-200"
              >
                {selectedJob.source_url}
              </a>
              . Last verified timestamp: {new Date(selectedJob.last_seen_at).toLocaleString()}.
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleSave(selectedJob.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Job'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Official Notification PDF / Link */}
            <a
              href={selectedJob.official_notification_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>View Official PDF</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Apply on Official Website */}
            <a
              href={selectedJob.official_apply_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition-all active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
