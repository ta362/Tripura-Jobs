import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default mock session as Administrator for full preview experience
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tripura_job_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      id: 'usr-admin-01',
      email: 'admin@tripurajobs.nic.in',
      full_name: 'State Portal Officer (Tripura)',
      role: 'admin',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: ['Graduate', 'Post Graduate', 'B.Tech'],
      },
      created_at: new Date().toISOString(),
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('tripura_job_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tripura_job_user');
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
  };

  const signup = async (email: string, pass: string, fullName: string) => {
    const res = await api.login(email, pass);
    const updatedUser = { ...res.user, full_name: fullName };
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: 'admin' | 'user') => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
