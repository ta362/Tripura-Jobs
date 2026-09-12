import React from 'react';
import { useJobs } from '../context/JobContext';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const FilterDrawer: React.FC = () => {
  const { filters, setFilters, resetFilters } = useJobs();

  const qualifications = [
    { label: 'All Qualifications', value: 'ALL' },
    { label: '10th / 12th Pass', value: '10th' },
    { label: 'Polytechnic Diploma', value: 'Diploma' },
    { label: 'Graduate / Degree', value: 'Degree' },
    { label: 'Engineering (B.E/B.Tech)', value: 'Engineering' },
    { label: 'Medical (MBBS)', value: 'MBBS' },
    { label: 'Teaching (B.Ed/TET)', value: 'B.Ed' },
    { label: 'Ph.D. / Post Graduate', value: 'Ph.D.' },
  ];

  const organizations = [
    { label: 'All Organizations', value: 'ALL' },
    { label: 'Tripura Public Service Commission (TPSC)', value: 'TPSC' },
    { label: "Teachers' Recruitment Board (TRBT)", value: 'TRBT' },
    { label: 'Joint Recruitment Board (JRBT)', value: 'JRBT' },
    { label: 'Tripura Police', value: 'Police' },
    { label: 'Directorate of Health Services', value: 'Health' },
    { label: 'High Court of Tripura', value: 'High Court' },
    { label: 'NIT Agartala / Universities', value: 'University' },
    { label: 'Central Govt (SSC / Tripura Postings)', value: 'Staff Selection' },
  ];

  const statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: '🔴 New Jobs Only', value: 'NEW' },
    { label: '🟡 Updated Jobs Only', value: 'UPDATED' },
    { label: '⏰ Closing Soon (≤ 5 days)', value: 'CLOSING_SOON' },
    { label: '💼 Active Jobs', value: 'ACTIVE' },
    { label: '📁 Expired (Reference)', value: 'EXPIRED' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Search by job title, department, qualification, or advertisement number..."
          className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-10 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 w-5 h-5 rounded-full flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter Select Dropdowns & Quick Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Status */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Qualification */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Minimum Qualification
          </label>
          <select
            value={filters.qualification}
            onChange={e => setFilters(prev => ({ ...prev, qualification: e.target.value }))}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {qualifications.map(q => (
              <option key={q.value} value={q.value}>
                {q.label}
              </option>
            ))}
          </select>
        </div>

        {/* Organization */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Recruitment Board / Org
          </label>
          <select
            value={filters.organization}
            onChange={e => setFilters(prev => ({ ...prev, organization: e.target.value }))}
            className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            {organizations.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter summary & Reset */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Active criteria applied</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset all</span>
        </button>
      </div>
    </div>
  );
};
