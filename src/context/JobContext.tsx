import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JobRecord, FilterOptions, ScannerStatusData, UserNotification } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface JobContextType {
  jobs: JobRecord[];
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  resetFilters: () => void;
  selectedJob: JobRecord | null;
  setSelectedJob: (job: JobRecord | null) => void;
  savedJobIds: Set<string>;
  toggleSave: (jobId: string) => Promise<void>;
  scannerStatus: ScannerStatusData | null;
  refreshJobs: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  triggerScan: (sourceId?: string) => Promise<any>;
  isScanning: boolean;
  notifications: UserNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  deviceView: 'android' | 'desktop';
  setDeviceView: (mode: 'android' | 'desktop') => void;
  activeTab: 'home' | 'search' | 'saved' | 'notifications' | 'admin' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'saved' | 'notifications' | 'admin' | 'profile') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const defaultFilters: FilterOptions = {
  search: '',
  status: 'ALL',
  qualification: 'ALL',
  organization: 'ALL',
  jurisdiction: 'ALL',
};

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [scannerStatus, setScannerStatus] = useState<ScannerStatusData | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [deviceView, setDeviceView] = useState<'android' | 'desktop'>('android');
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'saved' | 'notifications' | 'admin' | 'profile'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const refreshJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getJobs(filters);
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await api.getScannerStatus();
      setScannerStatus(status);
    } catch (e) {
      console.warn('Could not fetch scanner status:', e);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications(user.id);
      setNotifications(notifs);
    } catch (e) {
      console.warn('Could not fetch notifications:', e);
    }
  }, [user]);

  const refreshSaved = useCallback(async () => {
    if (!user) return;
    try {
      const saved = await api.getSavedJobs(user.id);
      setSavedJobIds(new Set(saved.map(s => s.job.id)));
    } catch (e) {
      console.warn('Could not fetch saved jobs:', e);
    }
  }, [user]);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  useEffect(() => {
    refreshStatus();
    // Refresh scanner status every 15 seconds to catch ongoing scans
    const interval = setInterval(refreshStatus, 15000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  useEffect(() => {
    refreshNotifications();
    refreshSaved();
  }, [refreshNotifications, refreshSaved]);

  // Periodic 1-minute auto-update for jobs and notifications to sync with the background scanner
  useEffect(() => {
    const interval = setInterval(() => {
      refreshJobs();
      refreshNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshJobs, refreshNotifications]);

  const toggleSave = async (jobId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleSavedJob(user.id, jobId);
      setSavedJobIds(prev => {
        const next = new Set(prev);
        if (res.isSaved) {
          next.add(jobId);
        } else {
          next.delete(jobId);
        }
        return next;
      });
    } catch (e) {
      console.error('Error toggling save:', e);
    }
  };

  const triggerScan = async (sourceId?: string) => {
    setIsScanning(true);
    try {
      const res = await api.triggerScan(sourceId);
      await refreshJobs();
      await refreshStatus();
      await refreshNotifications();
      return res;
    } finally {
      setIsScanning(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        error,
        filters,
        setFilters,
        resetFilters,
        selectedJob,
        setSelectedJob,
        savedJobIds,
        toggleSave,
        scannerStatus,
        refreshJobs,
        refreshStatus,
        triggerScan,
        isScanning,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        deviceView,
        setDeviceView,
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within a JobProvider');
  return context;
};
