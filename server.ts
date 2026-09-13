import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './server/db.js';
import { ScannerEngine } from './server/scanner/scannerEngine.js';

const app = express();
const PORT = 3000;

app.use(express.json());

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check & Supabase configuration status
  app.get('/api/health', (req, res) => {
    const sbInfo = db.getSupabaseInfo ? db.getSupabaseInfo() : null;
    res.json({
      status: 'ok',
      service: 'Tripura Govt Job Scanner API',
      timestamp: new Date().toISOString(),
      supabase: sbInfo,
    });
  });

  // Supabase project status
  app.get('/api/supabase/info', (req, res) => {
    const sbInfo = db.getSupabaseInfo ? db.getSupabaseInfo() : {
      projectUrl: 'https://fnanpfwiyxzgpjutqndb.supabase.co',
      projectId: 'fnanpfwiyxzgpjutqndb',
      isConnected: false,
      hasKey: false,
      keyType: 'none',
    };
    res.json({
      success: true,
      data: sbInfo,
    });
  });

  // Jobs: list with filtering & search
  app.get('/api/jobs', (req, res) => {
    try {
      const { search, status, qualification, organization, is_new, is_updated } = req.query;
      const jobs = db.getAllJobs({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        qualification: qualification ? String(qualification) : undefined,
        organization: organization ? String(organization) : undefined,
        is_new: is_new === 'true' ? true : undefined,
        is_updated: is_updated === 'true' ? true : undefined,
      });
      res.json({ success: true, count: jobs.length, data: jobs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Jobs: single details
  app.get('/api/jobs/:id', (req, res) => {
    const job = db.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job notification not found' });
    }
    const updates = db.getJobUpdates(req.params.id);
    res.json({ success: true, data: { ...job, update_history: updates } });
  });

  // Admin Job Edit / Correction
  app.put('/api/jobs/:id', (req, res) => {
    const updated = db.updateJob(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    res.json({ success: true, data: updated });
  });

  // Saved Jobs: list for user
  app.get('/api/saved-jobs', (req, res) => {
    const userId = (req.query.userId as string) || 'usr-admin-01';
    const saved = db.getSavedJobs(userId);
    res.json({ success: true, count: saved.length, data: saved });
  });

  // Saved Jobs: toggle bookmark
  app.post('/api/jobs/:id/save', (req, res) => {
    const userId = (req.body.userId as string) || 'usr-admin-01';
    const notes = req.body.notes as string | undefined;
    const result = db.toggleSavedJob(userId, req.params.id, notes);
    res.json({ success: true, ...result });
  });

  // Sources: list all
  app.get('/api/sources', (req, res) => {
    const sources = db.getAllSources();
    res.json({ success: true, count: sources.length, data: sources });
  });

  // Sources: create new official source (admin)
  app.post('/api/sources', (req, res) => {
    const { name, organization, url, source_type, scan_frequency } = req.body;
    if (!name || !url || !organization) {
      return res.status(400).json({ success: false, error: 'Missing required source parameters' });
    }
    const newSource = db.insertSource({
      id: `src-${Date.now()}`,
      name,
      organization,
      url,
      source_type: source_type || 'STATE_DEPT',
      active: true,
      scan_frequency: scan_frequency || 'DAILY',
      last_scanned_at: null,
      last_success_at: null,
      last_error: null,
      http_status: null,
      created_at: new Date().toISOString(),
    });
    res.json({ success: true, data: newSource });
  });

  // Sources: update / toggle status / manual review
  app.put('/api/sources/:id', (req, res) => {
    const updated = db.updateSource(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Source not found' });
    }
    res.json({ success: true, data: updated });
  });

  // Sources: delete
  app.delete('/api/sources/:id', (req, res) => {
    const success = db.deleteSource(req.params.id);
    res.json({ success });
  });

  // Scanner: run immediate scan
  app.post('/api/scanner/run', async (req, res) => {
    const targetSourceId = req.body.sourceId as string | undefined;
    try {
      const result = await ScannerEngine.executeScan(targetSourceId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(409).json({ success: false, error: err.message });
    }
  });

  // Scanner: telemetry & scan runs status
  app.get('/api/scanner/status', (req, res) => {
    const runs = db.getScanRuns();
    const sources = db.getAllSources();
    const activeSources = sources.filter(s => s.active);
    const failedSources = sources.filter(s => s.last_error !== null || s.manual_review_needed);
    const allJobs = db.getAllJobs();
    const newJobs = allJobs.filter(j => j.is_new);
    const updatedJobs = allJobs.filter(j => j.is_updated);
    const closingSoon = allJobs.filter(j => j.status === 'CLOSING_SOON');

    res.json({
      success: true,
      data: {
        isScanning: ScannerEngine.isBusy(),
        totalSources: sources.length,
        activeSources: activeSources.length,
        failedSourcesCount: failedSources.length,
        totalJobs: allJobs.length,
        newJobsCount: newJobs.length,
        updatedJobsCount: updatedJobs.length,
        closingSoonCount: closingSoon.length,
        lastScanTime: runs.length > 0 ? runs[0].started_at : null,
        recentRuns: runs.slice(0, 10),
      },
    });
  });

  // Notifications: list for user
  app.get('/api/notifications', (req, res) => {
    const userId = (req.query.userId as string) || 'usr-admin-01';
    const notifs = db.getUserNotifications(userId);
    res.json({ success: true, count: notifs.length, data: notifs });
  });

  // Notifications: mark read
  app.post('/api/notifications/:id/read', (req, res) => {
    const ok = db.markNotificationRead(req.params.id);
    res.json({ success: ok });
  });

  // Admin Dedicated Auth with Login ID and Password
  app.post('/api/auth/admin/login', (req, res) => {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'Admin Login ID and Password are required' });
    }

    const verification = db.verifyAdmin(loginId, password);
    if (!verification.success || !verification.user) {
      return res.status(401).json({ success: false, error: verification.error || 'Authentication failed' });
    }

    res.json({
      success: true,
      data: {
        user: verification.user,
        token: `admin-token-${Date.now()}`,
      },
    });
  });

  app.get('/api/auth/admin/info', (req, res) => {
    const info = db.getAdminInfo();
    res.json({ success: true, data: info });
  });

  app.post('/api/auth/admin/change-credentials', (req, res) => {
    const { currentPassword, newLoginId, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password is required' });
    }

    const result = db.updateAdminCredentials(currentPassword, newLoginId, newPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Admin credentials updated successfully' });
  });

  // Email & OTP Candidate Registration / Login
  app.post('/api/auth/send-otp', (req, res) => {
    const { email, phone } = req.body;
    const target = email || phone;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    try {
      const result = db.sendPhoneOtp(target);
      res.json({
        success: true,
        message: result.message,
        demoOtp: result.demoOtp, // Delivered to client simulator for seamless experience
        isSmtpConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to send OTP' });
    }
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { email, phone, otp, fullName, district } = req.body;
    const target = email || phone;
    if (!target || !otp) {
      return res.status(400).json({ success: false, error: 'Email address and 6-digit OTP are required' });
    }

    const verification = db.verifyPhoneOtp(target, otp, fullName, district);
    if (!verification.success || !verification.user) {
      return res.status(400).json({ success: false, error: verification.error || 'Invalid OTP' });
    }

    res.json({
      success: true,
      data: {
        user: verification.user,
        token: `cand-token-${Date.now()}-${verification.user.id}`,
      },
    });
  });

  // Auth: user profile / mock Supabase auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const user = db.getUserByEmail(email);
    if (user) {
      return res.json({
        success: true,
        data: {
          user,
          token: `jwt-${Date.now()}-${user.id}`,
        },
      });
    }
    // Auto-create demo user
    const newUser = db.insertUserProfile({
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: [],
      },
      created_at: new Date().toISOString(),
    });
    res.json({
      success: true,
      data: {
        user: newUser,
        token: `jwt-${Date.now()}-${newUser.id}`,
      },
    });
  });

  // Supabase SQL script endpoint for one-click setup
  app.get('/api/schema.sql', (req, res) => {
    const schemaPath = path.join(process.cwd(), 'server', 'supabaseSchema.sql');
    if (fs.existsSync(schemaPath)) {
      res.setHeader('Content-Type', 'text/plain');
      return res.sendFile(schemaPath);
    }
    res.status(404).send('-- Schema file not found');
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    import('vite').then(({ createServer: createViteServer }) => {
      createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      }).then(vite => {
        app.use(vite.middlewares);
      });
    }).catch(err => {
      console.error('Failed to load Vite server', err);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Tripura Govt Job Scanner running on port ${PORT}`);
    });
  }

export default app;
