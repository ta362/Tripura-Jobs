import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  MapPin,
  User,
  Mail,
  Lock,
  Key,
  Copy,
  Check,
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

export const UserAuthScreen: React.FC = () => {
  const { candidateRegister, candidateLogin } = useAuth();
  
  // UI views: 'login' | 'register' | 'success'
  const [mode, setMode] = useState<'login' | 'register' | 'success'>('register');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState(TRIPURA_DISTRICTS[0]);
  const [phone, setPhone] = useState('');
  
  // Login credentials
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Result
  const [generatedId, setGeneratedId] = useState('');
  const [generatedPass, setGeneratedPass] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await candidateRegister(fullName, cleanEmail, district, phone);
      if (user.login_id && user.password) {
        setGeneratedId(user.login_id);
        setGeneratedPass(user.password);
        setMode('success');
      } else {
        setErrorMsg('Successfully registered, but no ID/Password was returned.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMsg('Please enter your User ID and Password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await candidateLogin(loginId, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect User ID or Password. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const textToCopy = `User ID: ${generatedId}\nPassword: ${generatedPass}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md my-auto">
        {/* Top Emblem & Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 mb-1 border-2 border-white">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Government of Tripura
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Tripura Job Scanner
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto mt-1">
              Official candidate registration and direct vacancy notification alerts
            </p>
          </div>

          {/* Registration vs Login mode switch (Hides Admin completely!) */}
          {mode !== 'success' && (
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs font-bold mt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                New Registration
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`px-4 py-1.5 rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Candidate Registration
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Create your profile to get a personalized Tripura Jobs scanning account.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="reg-fullname">
                    Candidate Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="reg-email">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    required
                    disabled={loading}
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="reg-district">
                    Home District (Tripura) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="reg-district"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    disabled={loading}
                  >
                    {TRIPURA_DISTRICTS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate User ID & Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Candidate Sign In
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Enter your generated credentials to access your Tripura Jobs profile.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* User ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="login-id">
                    User ID or Email
                  </label>
                  <input
                    id="login-id"
                    type="text"
                    value={loginId}
                    onChange={e => setLoginId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="login-pass">
                    Password
                  </label>
                  <input
                    id="login-pass"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Submit Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sign In & Enter Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* MODE: REGISTRATION SUCCESS - SHOW CREDENTIALS */}
          {mode === 'success' && (
            <div className="space-y-5 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Profile Created Successfully!
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Please copy or write down your official credentials. You will need them to log in next time.
                </p>
              </div>

              {/* Credentials Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 text-left relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs transition-all active:scale-95"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Your User ID</span>
                  <div className="text-lg font-black font-mono text-slate-900 tracking-wide mt-0.5">{generatedId}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Password</span>
                  <div className="text-lg font-black font-mono text-emerald-800 tracking-wide mt-0.5">{generatedPass}</div>
                </div>
              </div>

              {copied && (
                <div className="text-xs font-bold text-emerald-700 animate-pulse">
                  Credentials copied to clipboard!
                </div>
              )}

              {/* Proceed to manual sign-in button */}
              <button
                type="button"
                onClick={() => {
                  setLoginId(generatedId);
                  setPassword(generatedPass);
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Privacy & Guarantee note */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-center">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <p className="text-[10px] text-slate-500 font-medium">
              Verified Candidate Access &bull; 100% Free Official Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
