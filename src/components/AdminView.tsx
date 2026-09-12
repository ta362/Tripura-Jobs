import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { JobSource, ScanRun } from '../types';
import { useJobs } from '../context/JobContext';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Database,
  Copy,
  Check,
  Building,
  Terminal,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { isScanning, triggerScan } = useJobs();
  const [sources, setSources] = useState<JobSource[]>([]);
  const [scanRuns, setScanRuns] = useState<ScanRun[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'runs' | 'add' | 'schema'>('sources');
  const [loading, setLoading] = useState<boolean>(true);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // New source form state
  const [newSource, setNewSource] = useState({
    name: '',
    organization: '',
    url: '',
    source_type: 'STATE_DEPT' as JobSource['source_type'],
    scan_frequency: 'DAILY' as JobSource['scan_frequency'],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [srcs, stat] = await Promise.all([api.getSources(), api.getScannerStatus()]);
      setSources(srcs);
      setScanRuns(stat.recentRuns || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (source: JobSource) => {
    try {
      await api.updateSource(source.id, { active: !source.active });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleManualReview = async (source: JobSource) => {
    try {
      await api.updateSource(source.id, {
        manual_review_needed: !source.manual_review_needed,
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.name || !newSource.url || !newSource.organization) return;
    try {
      await api.addSource(newSource);
      setNewSource({
        name: '',
        organization: '',
        url: '',
        source_type: 'STATE_DEPT',
        scan_frequency: 'DAILY',
      });
      setActiveTab('sources');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add source');
    }
  };

  const handleFetchSchema = async () => {
    try {
      const sql = await api.getSupabaseSchemaSql();
      setSchemaSql(sql);
    } catch {
      // fallback
    }
  };

  const handleCopySchema = async () => {
    if (!schemaSql) return;
    await navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Administrator Scanner Console
            </h2>
            <p className="text-xs text-slate-400">
              Manage configured government portals, scheduled crawlers & Supabase RLS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Running Scan Across Portals...' : 'Trigger Full Scan Now'}</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sources ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('runs')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
            activeTab === 'runs'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Scan Logs ({scanRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'add'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Source</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('schema');
            handleFetchSchema();
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'schema'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase SQL Schema</span>
        </button>
      </div>

      {/* Tab 1: Sources List */}
      {activeTab === 'sources' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Government sources are maintained dynamically in the database. Individual sources can be enabled, paused, or marked for Manual Review without rebuilding code.
          </p>

          <div className="space-y-2.5">
            {sources.map(source => (
              <div
                key={source.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm">{source.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {source.source_type}
                    </span>
                    {source.manual_review_needed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        MANUAL_REVIEW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>{source.organization}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-500">
                    <Globe className="w-3 h-3" />
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline truncate max-w-xs sm:max-w-md"
                    >
                      {source.url}
                    </a>
                  </div>

                  {source.last_error && (
                    <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{source.last_error}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(source)}
                    className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                      source.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {source.active ? 'Active' : 'Paused'}
                  </button>

                  {/* Toggle Manual Review */}
                  <button
                    onClick={() => handleToggleManualReview(source)}
                    title="Mark if site has anti-bot or CAPTCHA requiring manual entry"
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      source.manual_review_needed
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    Review Tag
                  </button>

                  {/* Scan single source */}
                  <button
                    onClick={() => triggerScan(source.id)}
                    disabled={isScanning}
                    title="Scan this source now"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Scan Logs */}
      {activeTab === 'runs' && (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400">
            Audit trail of every scheduled and manual scan run across official government portals.
          </p>

          <div className="space-y-2">
            {scanRuns.map(run => (
              <div
                key={run.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">
                      {run.source_name || run.source_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        run.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : run.status === 'FAILED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px]">
                    Found: <strong>{run.jobs_found}</strong> • Added: <strong className="text-emerald-400">{run.jobs_added}</strong> • Updated: <strong className="text-amber-400">{run.jobs_updated}</strong>
                  </p>

                  {run.error_message && (
                    <p className="text-[11px] text-rose-400">{run.error_message}</p>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  <span>{new Date(run.started_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Add New Source Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleAddSource} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-xl">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Configure New Official Government Portal</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Portal / Board Name *
              </label>
              <input
                type="text"
                required
                value={newSource.name}
                onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="e.g. Tripura State Electricity Corporation Recruitment"
                className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Organization / Department *
              </label>
              <input
                type="text"
                required
                value={newSource.organization}
                onChange={e => setNewSource({ ...newSource, organization: e.target.value })}
                placeholder="e.g. TSECL, Power Department, Govt of Tripura"
                className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Official Portal URL (Must be verified) *
              </label>
              <input
                type="url"
                required
                value={newSource.url}
                onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="https://tsecl.tripura.gov.in/recruitment"
                className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Never configure unofficial or blog sources. Only official .gov.in or verified university domains.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Source Category
                </label>
                <select
                  value={newSource.source_type}
                  onChange={e => setNewSource({ ...newSource, source_type: e.target.value as any })}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
                >
                  <option value="STATE_DEPT">State Department</option>
                  <option value="STATE_COMMISSION">State Commission (TPSC)</option>
                  <option value="BOARD">Recruitment Board</option>
                  <option value="UNIVERSITY">State/Central University</option>
                  <option value="CENTRAL_GOVT">Central Govt in Tripura</option>
                  <option value="JUDICIARY">High Court / Judiciary</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Scan Frequency
                </label>
                <select
                  value={newSource.scan_frequency}
                  onChange={e => setNewSource({ ...newSource, scan_frequency: e.target.value as any })}
                  className="w-full bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-700"
                >
                  <option value="DAILY">Daily (Standard)</option>
                  <option value="TWICE_DAILY">Twice Daily</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Save & Enable Source
          </button>
        </form>
      )}

      {/* Tab 4: Supabase Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Supabase PostgreSQL Schema & Row Level Security (RLS)
              </h3>
            </div>
            <button
              onClick={handleCopySchema}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-all"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy Schema SQL'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This SQL script provisions all 7 production tables (`job_sources`, `jobs`, `job_updates`, `scan_runs`, `user_profiles`, `saved_jobs`, `notifications`) along with UUID keys, composite hash unique constraints, performance indices, and strict Row Level Security (RLS) policies. Paste directly into your Supabase SQL Editor.
          </p>

          <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed select-all">
            {schemaSql || '-- Loading schema definition...'}
          </pre>
        </div>
      )}
    </div>
  );
};
