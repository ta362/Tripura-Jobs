import React from 'react';
import { useJobs } from '../context/JobContext';
import { formatReadableDate } from '../utils/dateFormatter';
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
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Notification details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header - Pure White */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-white">
          <div className="flex-1 pr-4">
            <div className="flex items-center flex-wrap gap-1.5 mb-1">
              <span className="text-xs font-bold text-emerald-800">
                {selectedJob.organization_name}
              </span>
              {selectedJob.verified_from_official_source && (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Official Source</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
              {selectedJob.job_title}
            </h2>
            <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedJob.department_name}</span>
            </p>
          </div>

          <button
            onClick={() => setSelectedJob(null)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body - Clean Light Hierarchy */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-700 text-sm bg-white">
          {/* Advertisement Numbers Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 block font-semibold">Advertisement No.</span>
              <span className="font-mono text-xs font-bold text-slate-900">
                {selectedJob.advertisement_number}
              </span>
            </div>
            {selectedJob.notification_number && (
              <div>
                <span className="text-[11px] text-slate-500 block font-semibold">Notification Ref</span>
                <span className="font-mono text-xs text-slate-700">
                  {selectedJob.notification_number}
                </span>
              </div>
            )}
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-semibold">Published Date</span>
              <span className="text-xs font-bold text-emerald-800">
                {formatReadableDate(selectedJob.notification_date)}
              </span>
            </div>
          </div>

          {/* Important Updates History (if any) */}
          {selectedJob.is_updated && selectedJob.update_history && selectedJob.update_history.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <History className="w-4 h-4 text-amber-700" />
                <span>Notification Change & Corrigendum History</span>
              </div>
              <div className="space-y-1.5">
                {selectedJob.update_history.map(upd => (
                  <div key={upd.id} className="text-xs flex items-start space-x-2 text-slate-800">
                    <span className="text-amber-800 font-bold">• {upd.changed_field}:</span>
                    <span>
                      <span className="line-through text-slate-400">{upd.old_value}</span> →{' '}
                      <span className="text-amber-900 font-extrabold">{upd.new_value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Dates Timeline */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Important Dates Schedule</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Application Starts</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {formatReadableDate(selectedJob.application_start_date)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/40">
                <span className="text-rose-700 block text-[11px] font-semibold">Application Last Date</span>
                <span className="font-bold text-rose-800 mt-0.5 block">
                  {formatReadableDate(selectedJob.application_last_date)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Examination Date</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {selectedJob.exam_date ? formatReadableDate(selectedJob.exam_date) : 'To be announced officially'}
                </span>
              </div>
            </div>
          </div>

          {/* Key Parameters: Vacancies, Salary, Age */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Total Vacancies</span>
              </div>
              <span className="text-base font-black text-slate-900">
                {selectedJob.vacancy_count !== null ? `${selectedJob.vacancy_count} Posts` : 'Direct Recruitment'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {selectedJob.category_information || 'Category quota as per norms'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salary / Pay Scale</span>
              </div>
              <span className="text-base font-black text-slate-900">
                {selectedJob.pay_level || 'State Scale'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate" title={selectedJob.salary}>
                {selectedJob.salary}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Age Criteria</span>
              </div>
              <span className="text-base font-black text-slate-900">
                {selectedJob.age_min ? `${selectedJob.age_min} - ${selectedJob.age_max} Years` : 'As per norms'}
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {selectedJob.age_relaxation || '5 yrs relaxation for SC/ST'}
              </p>
            </div>
          </div>

          {/* Educational Qualification & Eligibility */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Educational Qualification & Eligibility</span>
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              {selectedJob.qualification}
            </p>
            {selectedJob.eligibility_summary && (
              <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                <strong className="text-slate-800">Summary:</strong> {selectedJob.eligibility_summary}
              </p>
            )}
          </div>

          {/* Selection Process & Application Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
              <h5 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                Selection Process
              </h5>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {selectedJob.selection_process || 'Written Examination & Interview'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
              <h5 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                Application Fee
              </h5>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {selectedJob.application_fee || 'As per official notification'}
              </p>
            </div>
          </div>

          {/* Notification Summary */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
            <h5 className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              Official Notification Summary
            </h5>
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedJob.summary}
            </p>
          </div>

          {/* Source Provenance Notice */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Government Source Provenance</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              Official Portal Feed:{' '}
              <a
                href={selectedJob.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline font-semibold break-all hover:text-emerald-900"
              >
                {selectedJob.source_url}
              </a>
              . Last verified timestamp: {new Date(selectedJob.last_seen_at).toLocaleString()}.
            </p>
          </div>
        </div>

        {/* Modal Action Footer - Pure White & High Contrast */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleSave(selectedJob.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isSaved
                  ? 'bg-amber-100 border-amber-400 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-amber-600' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save Job'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all"
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
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>View Official PDF</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            {/* Apply on Official Website */}
            <a
              href={selectedJob.official_apply_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all active:scale-95"
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
