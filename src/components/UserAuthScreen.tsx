import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminLoginForm } from './AdminLoginForm';
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  RotateCcw,
  Check,
  MapPin,
  User,
  BellRing,
  Mail,
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
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [authMode, setAuthMode] = useState<'candidate' | 'admin'>('candidate');

  // Candidate Registration & OTP State
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState(TRIPURA_DISTRICTS[0]);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeOtpCode, setActiveOtpCode] = useState<string>('');
  const [timer, setTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await sendPhoneOtp(cleanEmail);
      setActiveOtpCode(res.demoOtp);
      setStep('otp');
      setTimer(180);
      setCanResend(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await verifyPhoneOtp(email, otp.trim(), fullName, district);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code. Please check and re-enter.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background decoration */}
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
              Official automated recruitment scanner and direct vacancy alert portal
            </p>
          </div>

          {/* Mode Switch: Candidate vs Admin */}
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-xs text-xs font-bold mt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('candidate');
                setErrorMsg(null);
              }}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                authMode === 'candidate'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candidate Login (Email + OTP)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('admin');
                setErrorMsg(null);
              }}
              className={`px-4 py-1.5 rounded-xl transition-all ${
                authMode === 'admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Card Body */}
        {authMode === 'admin' ? (
          <div className="space-y-4">
            <AdminLoginForm />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            {/* Step 1: Email & Registration Info */}
            {step === 'phone' && (
              <>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Registration & Quick Login
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter your email address to receive official Tripura job notifications via OTP.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">{errorMsg}</div>
                  </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="user-email">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="user-email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="e.g. candidate@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Candidate Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="user-fullname">
                      Candidate Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="user-fullname"
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Rajib Debbarma"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* District in Tripura */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="user-district">
                      Home District (Tripura)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <select
                        id="user-district"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        disabled={loading}
                      >
                        {TRIPURA_DISTRICTS.map(d => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                     {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending OTP to email...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification Screen */}
            {step === 'otp' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Enter Verification Code
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Enter 6-digit OTP sent to <span className="font-bold text-slate-800 font-mono">{email}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setErrorMsg(null);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">{errorMsg}</div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="otp-input">
                      6-Digit OTP Code
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full text-center tracking-[0.4em] py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      required
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {timer > 0 ? (
                        <span>Resend OTP in <strong className="text-slate-700 font-mono">{formatTime(timer)}</strong></span>
                      ) : (
                        <span>Didn't receive code?</span>
                      )}
                    </span>
                    {canResend && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Enter Job Portal</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Privacy & Guarantee note */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-center">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium">
                Verified Candidate Access &bull; 100% Free Official Service
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
