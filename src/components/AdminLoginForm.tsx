import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onSuccess }) => {
  const { adminLogin } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setErrorMessage('Please enter your Admin Login ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your Admin Password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await adminLogin(loginId.trim(), password.trim());
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid Login ID or Password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setLoginId('admin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Shield className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 block">
            Government of Tripura
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Admin Panel Login
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            Please enter your Admin Login ID and Password to access the recruitment portal console.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start space-x-2.5 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login ID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="admin-login-id">
              Admin Login ID / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-login-id"
                type="text"
                autoComplete="username"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="Enter Login ID (e.g. admin)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700" htmlFor="admin-password">
                Password
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Case-sensitive</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Password (e.g. admin123)"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        {/* Security Badge Footer */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Secure Admin Session &bull; Official Use Only</span>
          </p>
        </div>
      </div>
    </div>
  );
};
