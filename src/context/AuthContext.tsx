import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  candidateRegister: (fullName: string, email: string, district: string, phone?: string) => Promise<UserProfile>;
  candidateLogin: (loginId: string, pass: string) => Promise<void>;
  sendPhoneOtp?: (emailOrPhone: string) => Promise<{ success: boolean; message: string; demoOtp: string; isSmtpConfigured?: boolean }>;
  verifyPhoneOtp?: (emailOrPhone: string, otp: string, fullName?: string, district?: string) => Promise<void>;
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

  const [localOtpStore, setLocalOtpStore] = useState<{ [phone: string]: string }>({});

  useEffect(() => {
    if (user) {
      localStorage.setItem('tripura_job_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tripura_job_user');
    }
  }, [user]);

  const candidateRegister = async (
    fullName: string,
    email: string,
    district: string,
    phone?: string
  ): Promise<UserProfile> => {
    try {
      const res = await api.candidateRegister(fullName, email, district, phone);
      // Removed auto-login: Do not set user or token here so that they must sign in manually
      return res.user;
    } catch (err) {
      console.warn('API Registration failed, using client-side fallback:', err);
      const login_id = `TJ-${Math.floor(10000 + Math.random() * 90000)}`;
      const password = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: email.trim().toLowerCase(),
        phone: phone || undefined,
        full_name: fullName.trim() || 'Candidate',
        role: 'user',
        district: district || 'West Tripura (Agartala)',
        login_id,
        password,
        preferences: {
          notify_new_jobs: true,
          notify_closing_soon: true,
          notify_updates: true,
          preferred_qualifications: [],
        },
        created_at: new Date().toISOString(),
      };
      // Removed fallback auto-login: Just return the credentials
      return mockUser;
    }
  };

  const candidateLogin = async (loginId: string, pass: string) => {
    try {
      const res = await api.candidateLogin(loginId, pass);
      setUser(res.user);
      localStorage.setItem('tripura_cand_token', res.token);
    } catch (err) {
      console.warn('API Login failed, trying client fallback:', err);
      // Fallback allows user to login as student if the user matches local storage or demo ID
      if (loginId.trim().toUpperCase() === 'STUDENT' || loginId.trim().toUpperCase() === 'TJ-12345') {
        const mockUser: UserProfile = {
          id: 'usr-student-02',
          email: 'student@tripura.edu.in',
          full_name: 'Bikram Debbarma',
          role: 'user',
          district: 'West Tripura (Agartala)',
          login_id: 'TJ-12345',
          password: 'DEMO',
          preferences: {
            notify_new_jobs: true,
            notify_closing_soon: true,
            notify_updates: true,
            preferred_qualifications: ['Graduate'],
          },
          created_at: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('tripura_cand_token', 'local-cand-token-demo');
      } else {
        throw err;
      }
    }
  };

  const sendPhoneOtp = async (emailOrPhone: string) => {
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    // Generate a 6-digit local OTP
    const localOtp = '123456';
    setLocalOtpStore(prev => ({ ...prev, [cleanIdentifier]: localOtp }));
    return {
      success: true,
      message: `OTP generated locally for ${cleanIdentifier}`,
      demoOtp: localOtp,
      isSmtpConfigured: false,
    };
  };

  const verifyPhoneOtp = async (
    emailOrPhone: string,
    otp: string,
    fullName?: string,
    district?: string
  ) => {
    const cleanIdentifier = emailOrPhone.trim().toLowerCase();
    const isMasterOtp = otp.trim() === '123456';
    if (isMasterOtp) {
      const mockUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@tripura-jobs.in`,
        full_name: fullName?.trim() || 'Candidate',
        role: 'user',
        district: district || 'West Tripura (Agartala)',
        preferences: {
          notify_new_jobs: true,
          notify_closing_soon: true,
          notify_updates: true,
          preferred_qualifications: [],
        },
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem('tripura_cand_token', `local-cand-token-${Date.now()}`);
    } else {
      throw new Error('Invalid OTP code. Please enter the correct code or use the master code 123456.');
    }
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
        candidateRegister,
        candidateLogin,
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
