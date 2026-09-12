import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Bell,
  CheckCircle2,
  LogOut,
  Sliders,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, isAdmin, switchRole, logout } = useAuth();

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>Please log in to view account preferences.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      {/* Account Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">{user.full_name}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isAdmin ? 'State Recruitment Admin' : 'Job Seeker'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Role Demonstration Toggle */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-medium">Demo Role Mode:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => switchRole('user')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                !isAdmin
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>Alert & Notification Settings</span>
        </h4>

        <div className="space-y-2.5 text-xs text-slate-300">
          <label className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold block text-white">New Job Alerts</span>
              <span className="text-[11px] text-slate-400">
                Notify instantly when TPSC or State boards post new advertisements
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_new_jobs}
              className="accent-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold block text-white">Deadline Reminders</span>
              <span className="text-[11px] text-slate-400">
                Notify 3 days and 24 hours prior to application portal closing
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_closing_soon}
              className="accent-emerald-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <span className="font-semibold block text-white">Date Extension & Corrigendum Alerts</span>
              <span className="text-[11px] text-slate-400">
                Notify when exam dates or vacancy revisions are officially published
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_updates}
              className="accent-emerald-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Supabase Security Guarantees */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs text-slate-300">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold">
          <Lock className="w-4 h-4" />
          <span>Supabase Architecture & Data Privacy</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Client communicates via authenticated REST API with Row Level Security (RLS). Service-role keys are securely retained inside the server backend and never exposed to client applications.
        </p>
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RLS Active</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Encrypted Storage</span>
          </div>
        </div>
      </div>

      {/* Official Data Integrity Policy */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] text-slate-400 space-y-1.5">
        <h5 className="font-bold text-slate-300">Official Data Policy</h5>
        <p>
          Tripura Govt Job Scanner aggregates exclusively from verified official portals (NIC Tripura, TPSC, TRBT, JRBT). We do not host recruitment forms or charge application fees. Always verify against original government gazettes.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-2.5 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out Session</span>
      </button>
    </div>
  );
};
