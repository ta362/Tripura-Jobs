import React, { useState } from 'react';
import { JobRecord } from '../types';
import { useJobs } from '../context/JobContext';
import { formatReadableDate } from '../utils/dateFormatter';
import {
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  Bookmark,
  Sparkles,
  Inbox
} from 'lucide-react';

interface ExamScheduleAlertsProps {
  jobs: JobRecord[];
}

export const ExamScheduleAlerts: React.FC<ExamScheduleAlertsProps> = ({ jobs }) => {
  const { setSelectedJob, savedJobIds, toggleSave } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter only official exam notices (exclude general recruitment jobs)
  const examJobs = jobs.filter(job => {
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

    const isOfficialExamNotice = isExamNoticeType && !isDirectRecruitmentJob && Boolean(job.exam_date);

    const matchesSearch = 
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.selection_process && job.selection_process.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && isOfficialExamNotice;
  });

  // Sort upcoming exams chronologically (nearest first)
  const sortedExamJobs = [...examJobs].sort((a, b) => {
    if (!a.exam_date) return 1;
    if (!b.exam_date) return -1;
    return new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime();
  });

  // Calculate days remaining to exam
  const getDaysToExam = (examDateStr: string | null) => {
    if (!examDateStr) return null;
    const examDate = new Date(examDateStr);
    if (isNaN(examDate.getTime())) return null;
    const now = new Date();
    const diff = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-4">
      {/* Search Filter Inside Exams */}
      <div className="px-3 pt-1">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search exam, test pattern or board (e.g., Written, TPSC)..."
            className="w-full bg-white text-[11px] rounded-lg pl-3 pr-10 py-2 border border-slate-350 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100/50 transition-all duration-300 shadow-xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <span className="text-[9px] bg-red-50 text-red-600 font-extrabold px-1.5 py-0.5 rounded border border-red-200 animate-pulse">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Active Exam Alerts List */}
      <div className="px-4 pb-6 space-y-4">
        {sortedExamJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Exam Alerts Found</h3>
            <p className="text-xs text-slate-500">
              No upcoming exams or interview schedules match your filter query.
            </p>
          </div>
        ) : (
          sortedExamJobs.map(job => {
            const daysToExam = getDaysToExam(job.exam_date);
            const isSaved = savedJobIds.has(job.id);
            const isSoon = daysToExam !== null && daysToExam <= 30 && daysToExam > 0;

            return (
              <div
                key={`exam-${job.id}`}
                onClick={() => setSelectedJob(job)}
                className="group bg-white hover:bg-slate-50/80 border-2 border-slate-200 hover:border-red-200 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer relative overflow-hidden"
              >
                {/* Left Colored Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />

                {/* Top Header: Board & Save Toggle */}
                <div className="flex items-start justify-between gap-2 mb-2 pl-1.5">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {job.organization_name}
                      </span>
                      {job.verified_from_official_source && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{job.department_name}</span>
                    </span>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleSave(job.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors shrink-0 ${
                      isSaved
                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Post Title */}
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-red-600 transition-colors pl-1.5 leading-snug mb-3">
                  {job.job_title}
                </h3>

                {/* Visual Exam Notification / Schedule Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1.5 mb-3">
                  {/* Left Column: Date and Countdown */}
                  <div className="flex items-center space-x-3 bg-red-50/70 border border-red-100 rounded-xl p-3">
                    <Calendar className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                        Scheduled Date
                      </div>
                      <div className="text-xs font-black text-slate-900">
                        {job.exam_date ? formatReadableDate(job.exam_date) : 'Tentatively Nov/Dec 2026'}
                      </div>
                    </div>
                    {daysToExam !== null && daysToExam > 0 && (
                      <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSoon 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        In {daysToExam} Days
                      </span>
                    )}
                  </div>

                  {/* Right Column: Advertisement Details */}
                  <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                    <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Advt No. & Notice
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                        {job.advertisement_number}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Pattern Summary */}
                {job.selection_process && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px] text-slate-700 pl-1.5 mb-3">
                    <div className="font-extrabold text-slate-800 mb-0.5 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      <span>Official Exam / Selection Pattern:</span>
                    </div>
                    <p className="line-clamp-2 text-slate-600 leading-normal">
                      {job.selection_process}
                    </p>
                  </div>
                )}

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-1 pl-1.5 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      <span>Official Notification Released</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center space-x-1 text-red-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Notice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
