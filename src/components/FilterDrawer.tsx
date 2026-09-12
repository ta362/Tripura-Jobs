import React from 'react';
import { useJobs } from '../context/JobContext';
import { Search, Filter, RotateCcw, Check } from 'lucide-react';

export const FilterDrawer: React.FC = () => {
  const { filters, setFilters, resetFilters } = useJobs();

  const quickPills = [
    { label: 'All Jobs', value: 'ALL' },
    { label: 'Graduate / Degree', value: 'Degree' },
    { label: '10th / 12th Pass', value: '10th' },
    { label: 'Diploma', value: 'Diploma' },
    { label: 'Engineering', value: 'Engineering' },
    { label: 'Medical (MBBS)', value: 'MBBS' },
  ];

  const organizations = [
    { label: 'All Organizations / Boards', value: 'ALL' },
    { label: 'Tripura Public Service Commission (TPSC)', value: 'TPSC' },
    { label: "Teachers' Recruitment Board (TRBT)", value: 'TRBT' },
    { label: 'Joint Recruitment Board (JRBT)', value: 'JRBT' },
    { label: 'Tripura Police', value: 'Police' },
    { label: 'Directorate of Health Services', value: 'Health' },
    { label: 'High Court of Tripura', value: 'High Court' },
    { label: 'NIT Agartala / Universities', value: 'University' },
    { label: 'Central Govt in Tripura (SSC / UPSC)', value: 'Staff Selection' },
  ];

  const statuses = [
    { label: 'All Statuses', value: 'ALL' },
    { label: '🔴 New Notifications Only', value: 'NEW' },
    { label: '🟡 Updated Notifications', value: 'UPDATED' },
    { label: '⏰ Closing Soon (≤ 5 Days)', value: 'CLOSING_SOON' },
    { label: '💼 Active Vacancies', value: 'ACTIVE' },
    { label: '📁 Expired (Reference)', value: 'EXPIRED' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 p-4 space-y-3.5 shadow-xs">
      {/* Search Input - Big, Clear & Easy */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Search by job title, department, qualification, or advertisement number..."
          className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm rounded-xl pl-10 pr-10 py-3 border border-slate-300 focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
        />
        {filters.search && (
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center font-bold"
          >
            ×
          </button>
        )}
      </div>

      {/* Quick Qualification Pills - 1-tap filtering for mobile users */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {quickPills.map(pill => {
          const isSelected = filters.qualification === pill.value;
          return (
            <button
              key={pill.value}
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  qualification: isSelected && pill.value !== 'ALL' ? 'ALL' : pill.value,
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Organization / Board */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Recruitment Board / Agency
          </label>
          <select
            value={filters.organization}
            onChange={e => setFilters(prev => ({ ...prev, organization: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2.5 border border-slate-300 font-medium focus:outline-none focus:bg-white focus:border-emerald-600"
          >
            {organizations.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Notification Status
          </label>
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full bg-slate-50 text-slate-800 text-xs rounded-xl px-3 py-2.5 border border-slate-300 font-medium focus:outline-none focus:bg-white focus:border-emerald-600"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reset & Status Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters applied automatically</span>
        </div>
        <button
          onClick={resetFilters}
          className="flex items-center space-x-1 font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>
    </div>
  );
};
