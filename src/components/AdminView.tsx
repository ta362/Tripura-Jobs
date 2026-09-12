import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { JobSource, ScanRun } from '../types';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { AdminLoginForm } from './AdminLoginForm';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  AlertTriangle,
  Globe,
  Database,
  Copy,
  Check,
  Building,
  KeyRound,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { isScanning, triggerScan } = useJobs();
  const { isAdmin, user, adminLogout } = useAuth();
  const [sources, setSources] = useState<JobSource[]>([]);
  const [scanRuns, setScanRuns] = useState<ScanRun[]>([]);
  const [activeTab, setActiveTab] = useState<'sources' | 'runs' | 'add' | 'schema' | 'credentials'>('sources');
  const [, setLoading] = useState<boolean>(true);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);

  // Admin Credentials form state
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newLoginId: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [credMsg, setCredMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [credLoading, setCredLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ loginId: string; altLoginId: string; updatedAt: string } | null>(null);

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

  const loadAdminInfo = async () => {
    try {
      const info = await api.getAdminInfo();
      setAdminInfo(info);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
      loadAdminInfo();
    }
  }, [isAdmin]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credForm.currentPassword.trim()) {
      setCredMsg({ type: 'error', text: 'Current password is required to make changes.' });
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      setCredMsg({ type: 'error', text: 'New passwords do not match. Please recheck.' });
      return;
    }
    if (credForm.newPassword && credForm.newPassword.length < 4) {
      setCredMsg({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    try {
      setCredLoading(true);
      setCredMsg(null);
      await api.changeAdminCredentials(
        credForm.currentPassword,
        credForm.newLoginId.trim() || undefined,
        credForm.newPassword.trim() || undefined
      );
      setCredMsg({ type: 'success', text: 'Admin credentials successfully updated!' });
      setCredForm({ currentPassword: '', newLoginId: '', newPassword: '', confirmPassword: '' });
      await loadAdminInfo();
    } catch (err: any) {
      setCredMsg({ type: 'error', text: err.message || 'Failed to update credentials.' });
    } finally {
      setCredLoading(false);
    }
  };

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

  if (!isAdmin) {
    return <AdminLoginForm />;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Top Banner - Clean White */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Admin Portal Scanner Console
              </h2>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Logged In</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Admin ID: <span className="font-mono font-bold text-slate-800">{adminInfo?.loginId || 'admin'}</span> &bull; Full administrative and scanner controls
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('credentials')}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all"
            title="Manage Admin Login ID & Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>ID & Password</span>
          </button>

          <button
            onClick={() => adminLogout()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs transition-all"
            title="Lock Admin Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Log Out</span>
          </button>

          <button
            onClick={() => triggerScan()}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Full Scan'}</span>
          </button>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'sources'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Sources ({sources.length})
        </button>

        <button
          onClick={() => setActiveTab('runs')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
            activeTab === 'runs'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Scan Logs ({scanRuns.length})
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'add'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Source</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'credentials'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Login ID & Password</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('schema');
            handleFetchSchema();
          }}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'schema'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Supabase SQL</span>
        </button>
      </div>

      {/* Tab 1: Sources List */}
      {activeTab === 'sources' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Government sources are maintained dynamically in the database. Individual sources can be enabled or paused at any time.
          </p>

          <div className="space-y-2.5">
            {sources.map(source => (
              <div
                key={source.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{source.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                      {source.source_type}
                    </span>
                    {source.manual_review_needed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        MANUAL_REVIEW
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 font-medium">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{source.organization}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-500">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-medium hover:underline truncate max-w-xs sm:max-w-md"
                    >
                      {source.url}
                    </a>
                  </div>

                  {source.last_error && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center space-x-1 mt-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{source.last_error}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center shrink-0">
                  {/* Toggle Active */}
                  <button
                    onClick={() => handleToggleActive(source)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold border transition-all ${
                      source.active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {source.active ? 'Active' : 'Paused'}
                  </button>

                  {/* Toggle Manual Review */}
                  <button
                    onClick={() => handleToggleManualReview(source)}
                    title="Mark if site requires manual intervention"
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                      source.manual_review_needed
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Review Tag
                  </button>

                  {/* Scan single source */}
                  <button
                    onClick={() => triggerScan(source.id)}
                    disabled={isScanning}
                    title="Scan this source now"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
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
          <p className="text-xs text-slate-500 font-medium">
            Audit trail of every scheduled and manual scan run across official portals.
          </p>

          <div className="space-y-2">
            {scanRuns.map(run => (
              <div
                key={run.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      {run.source_name || run.source_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        run.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : run.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] font-medium">
                    Found: <strong className="text-slate-900">{run.jobs_found}</strong> • Added:{' '}
                    <strong className="text-emerald-700">{run.jobs_added}</strong> • Updated:{' '}
                    <strong className="text-amber-800">{run.jobs_updated}</strong>
                  </p>

                  {run.error_message && (
                    <p className="text-[11px] text-rose-600 font-medium">{run.error_message}</p>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400 font-medium">
                  <span>{new Date(run.started_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Add New Source Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleAddSource} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 max-w-xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Configure New Official Government Portal</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Portal / Board Name *
              </label>
              <input
                type="text"
                required
                value={newSource.name}
                onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="e.g. Tripura State Electricity Corporation Recruitment"
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Organization / Department *
              </label>
              <input
                type="text"
                required
                value={newSource.organization}
                onChange={e => setNewSource({ ...newSource, organization: e.target.value })}
                placeholder="e.g. TSECL, Power Department, Govt of Tripura"
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Official Portal URL (Must be verified) *
              </label>
              <input
                type="url"
                required
                value={newSource.url}
                onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="https://tsecl.tripura.gov.in/recruitment"
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Only official .gov.in or verified university domains.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Source Category
                </label>
                <select
                  value={newSource.source_type}
                  onChange={e => setNewSource({ ...newSource, source_type: e.target.value as any })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-300"
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
                <label className="block text-slate-700 font-bold mb-1">
                  Scan Frequency
                </label>
                <select
                  value={newSource.scan_frequency}
                  onChange={e => setNewSource({ ...newSource, scan_frequency: e.target.value as any })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-300"
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
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Save & Enable Source
          </button>
        </form>
      )}

      {/* Tab 4: Credentials & Password Management */}
      {activeTab === 'credentials' && (
        <div className="space-y-4 max-w-2xl">
          {/* Active Admin Overview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Admin Credentials & Access Settings
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Manage the Login ID and Password used to access this administrative console.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Active Login ID
                </span>
                <span className="font-mono font-extrabold text-xs text-slate-900 block">
                  {adminInfo?.loginId || 'admin'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Official Email
                </span>
                <span className="font-mono font-bold text-xs text-slate-900 block truncate">
                  {adminInfo?.altLoginId || 'admin@tripurajobs.nic.in'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Authorization
                </span>
                <span className="font-bold text-xs text-emerald-700 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Full Access</span>
                </span>
              </div>
            </div>
          </div>

          {/* Change Credentials Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Update Login ID & Password
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                To update your credentials, enter your current password first for security confirmation.
              </p>
            </div>

            {credMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start space-x-2.5 ${
                  credMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {credMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <div className="flex-1 leading-relaxed">{credMsg.text}</div>
              </div>
            )}

            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              {/* Current Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Current Admin Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Required (default: admin123)</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={credForm.currentPassword}
                    onChange={e => setCredForm({ ...credForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  New Credentials (Optional)
                </span>

                <div className="space-y-3.5">
                  {/* New Login ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      New Admin Login ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={credForm.newLoginId}
                        onChange={e => setCredForm({ ...credForm, newLoginId: e.target.value })}
                        placeholder={`Leave blank to keep current ("${adminInfo?.loginId || 'admin'}")`}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={credForm.newPassword}
                          onChange={e => setCredForm({ ...credForm, newPassword: e.target.value })}
                          placeholder="Min 4 characters"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={credForm.confirmPassword}
                          onChange={e => setCredForm({ ...credForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={credLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {credLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Update Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 5: Supabase Schema */}
      {activeTab === 'schema' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Supabase PostgreSQL Schema & RLS
              </h3>
            </div>
            <button
              onClick={handleCopySchema}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-all"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy Schema SQL'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Paste this SQL script directly into your Supabase SQL Editor. It provisions all 7 production tables with Row Level Security (RLS) policies.
          </p>

          <pre className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed select-all">
            {schemaSql || '-- Loading schema definition...'}
          </pre>
        </div>
      )}
    </div>
  );
};
