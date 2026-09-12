import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string; demoOtp: string }>;
  verifyPhoneOtp: (phone: string, otp: string, fullName?: string, district?: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  adminLogin: (loginId: string, pass: string) => Promise<void>;
  adminLogout: () => void;
  signup: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  switchRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First-time visitors have no session until they login with Mobile + OTP or Admin ID
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tripura_job_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tripura_job_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tripura_job_user');
    }
  }, [user]);

  const sendPhoneOtp = async (phone: string) => {
    return await api.sendOtp(phone);
  };

  const verifyPhoneOtp = async (
    phone: string,
    otp: string,
    fullName?: string,
    district?: string
  ) => {
    const res = await api.verifyOtp(phone, otp, fullName, district);
    setUser(res.user);
    localStorage.setItem('tripura_cand_token', res.token);
  };

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const adminLogin = async (loginId: string, pass: string) => {
    const res = await api.adminLogin(loginId, pass);
    setUser(res.user);
    localStorage.setItem('tripura_admin_token', res.token);
  };

  const adminLogout = () => {
    localStorage.removeItem('tripura_admin_token');
    if (user && user.role === 'admin') {
      setUser(null);
    }
  };

  const signup = async (email: string, pass: string, fullName: string) => {
    const res = await api.login(email, pass);
    const updatedUser = { ...res.user, full_name: fullName };
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('tripura_admin_token');
    localStorage.removeItem('tripura_cand_token');
    localStorage.removeItem('tripura_job_user');
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  const switchRole = (role: 'admin' | 'user') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAuthenticated,
        sendPhoneOtp,
        verifyPhoneOtp,
        login,
        adminLogin,
        adminLogout,
        signup,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
