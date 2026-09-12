import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import {
  User,
  Shield,
  Bell,
  CheckCircle2,
  LogOut,
  Sliders,
  ExternalLink,
  Lock,
  Smartphone,
  MapPin,
  Save,
} from 'lucide-react';

const TRIPURA_DISTRICTS = [
  'West Tripura (Agartala)',
  'Gomati (Udaipur)',
  'South Tripura (Belonia)',
  'Dhalai (Ambassa)',
  'Khowai',
  'North Tripura (Dharmanagar)',
  'Unakoti (Kailashahar)',
  'Sepahijala (Bishramganj)',
];

export const ProfileView: React.FC = () => {
  const { user, isAdmin, switchRole, logout, updateProfile } = useAuth();
  const { setActiveTab } = useJobs();

  const [editMode, setEditMode] = useState(false);
  const [nameInput, setNameInput] = useState(user?.full_name || '');
  const [districtInput, setDistrictInput] = useState(user?.district || TRIPURA_DISTRICTS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Please log in to view account preferences.</p>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: nameInput.trim() || user.full_name,
      district: districtInput,
    });
    setEditMode(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      {/* Account Card - Crisp White */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="text-base font-extrabold text-slate-900 truncate">{user.full_name}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {isAdmin ? 'Recruitment Admin' : 'Registered Candidate'}
              </span>
            </div>

            {/* Mobile & OTP Verification badge */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              {user.phone ? (
                <div className="inline-flex items-center space-x-1.5 text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold">{user.phone}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md flex items-center space-x-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>OTP Verified</span>
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
              )}

              {user.district && (
                <div className="inline-flex items-center space-x-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user.district}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Candidate Profile Details */}
        {!isAdmin && (
          <div className="pt-2 border-t border-slate-100">
            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="profile-name">
                    Candidate Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="profile-district">
                    Home District
                  </label>
                  <select
                    id="profile-district"
                    value={districtInput}
                    onChange={e => setDistrictInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {TRIPURA_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center space-x-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 text-[11px]">
                  Registered for Tripura Government job notifications
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(user.full_name);
                    setDistrictInput(user.district || TRIPURA_DISTRICTS[0]);
                    setEditMode(true);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold"
                >
                  Edit Profile
                </button>
              </div>
            )}
            {savedSuccess && (
              <p className="text-[11px] text-emerald-700 font-bold mt-2">
                Profile updated successfully!
              </p>
            )}
          </div>
        )}

        {/* Role Demonstration Toggle */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-slate-700 font-bold">Role Mode:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => switchRole('user')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                !isAdmin
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {isAdmin ? 'Admin Console' : 'Admin Login'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Alert & Notification Settings</span>
        </h4>

        <div className="space-y-2.5 text-xs text-slate-700">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <div>
              <span className="font-bold block text-slate-900">New Job Alerts</span>
              <span className="text-[11px] text-slate-500">
                Notify instantly when TPSC or State boards post new advertisements
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_new_jobs}
              className="accent-emerald-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <div>
              <span className="font-bold block text-slate-900">Deadline Reminders</span>
              <span className="text-[11px] text-slate-500">
                Notify 3 days and 24 hours prior to application portal closing
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_closing_soon}
              className="accent-emerald-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
            <div>
              <span className="font-bold block text-slate-900">Date Extension & Corrigendum Alerts</span>
              <span className="text-[11px] text-slate-500">
                Notify when exam dates or vacancy revisions are officially published
              </span>
            </div>
            <input
              type="checkbox"
              defaultChecked={user.preferences.notify_updates}
              className="accent-emerald-600 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Supabase Security Guarantees */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2.5 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center space-x-2 text-emerald-800 font-bold">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Supabase Architecture & Data Privacy</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Client communicates via authenticated REST API with Row Level Security (RLS). Service-role keys are securely retained inside the server backend and never exposed to client applications.
        </p>
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-semibold">
          <div className="flex items-center space-x-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RLS Active</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Encrypted Storage</span>
          </div>
        </div>
      </div>

      {/* Official Data Integrity Policy */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
        <h5 className="font-bold text-slate-900">Official Data Policy</h5>
        <p>
          Tripura Govt Job Scanner aggregates exclusively from verified official portals (NIC Tripura, TPSC, TRBT, JRBT). We do not host recruitment forms or charge application fees. Always verify against original government gazettes.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Session</span>
      </button>
    </div>
  );
};
