import {
  JobRecord,
  JobSource,
  ScannerStatusData,
  SavedJobItem,
  UserNotification,
  UserProfile,
  FilterOptions,
} from '../types';

export const api = {
  // Jobs
  async getJobs(filters?: Partial<FilterOptions>): Promise<JobRecord[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'ALL') {
      if (filters.status === 'NEW') {
        params.append('is_new', 'true');
      } else if (filters.status === 'UPDATED') {
        params.append('is_updated', 'true');
      } else {
        params.append('status', filters.status);
      }
    }
    if (filters?.qualification && filters.qualification !== 'ALL') {
      params.append('qualification', filters.qualification);
    }
    if (filters?.organization && filters.organization !== 'ALL') {
      params.append('organization', filters.organization);
    }

    const res = await fetch(`/api/jobs?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const json = await res.json();
    return json.data || [];
  },

  async getJobById(id: string): Promise<JobRecord> {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    const json = await res.json();
    return json.data;
  },

  async updateJob(id: string, partial: Partial<JobRecord>): Promise<JobRecord> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    if (!res.ok) throw new Error('Failed to update job');
    const json = await res.json();
    return json.data;
  },

  // Saved Jobs
  async getSavedJobs(userId: string): Promise<SavedJobItem[]> {
    const res = await fetch(`/api/saved-jobs?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch saved jobs');
    const json = await res.json();
    return json.data || [];
  },

  async toggleSavedJob(userId: string, jobId: string, notes?: string): Promise<{ isSaved: boolean }> {
    const res = await fetch(`/api/jobs/${jobId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notes }),
    });
    if (!res.ok) throw new Error('Failed to toggle bookmark');
    return await res.json();
  },

  // Sources
  async getSources(): Promise<JobSource[]> {
    const res = await fetch('/api/sources');
    if (!res.ok) throw new Error('Failed to fetch sources');
    const json = await res.json();
    return json.data || [];
  },

  async addSource(source: Partial<JobSource>): Promise<JobSource> {
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(source),
    });
    if (!res.ok) throw new Error('Failed to create source');
    const json = await res.json();
    return json.data;
  },

  async updateSource(id: string, partial: Partial<JobSource>): Promise<JobSource> {
    const res = await fetch(`/api/sources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    if (!res.ok) throw new Error('Failed to update source');
    const json = await res.json();
    return json.data;
  },

  async deleteSource(id: string): Promise<boolean> {
    const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete source');
    const json = await res.json();
    return json.success;
  },

  // Scanner
  async getScannerStatus(): Promise<ScannerStatusData> {
    const res = await fetch('/api/scanner/status');
    if (!res.ok) throw new Error('Failed to fetch scanner status');
    const json = await res.json();
    return json.data;
  },

  async triggerScan(sourceId?: string): Promise<{
    sourcesScanned: number;
    newJobsFound: number;
    updatedJobs: number;
    failedSources: number;
  }> {
    const res = await fetch('/api/scanner/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to trigger scan');
    }
    const json = await res.json();
    return json.data;
  },

  // Notifications
  async getNotifications(userId: string): Promise<UserNotification[]> {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const json = await res.json();
    return json.data || [];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success;
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    const json = await res.json();
    return json.data;
  },

  // Supabase Schema
  async getSupabaseSchemaSql(): Promise<string> {
    const res = await fetch('/api/schema.sql');
    if (!res.ok) throw new Error('Failed to fetch schema');
    return await res.text();
  },
};
