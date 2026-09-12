-- ========================================================================
-- TRIPURA GOVT JOB SCANNER - SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. JOB SOURCES TABLE
CREATE TABLE IF NOT EXISTS job_sources (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name TEXT NOT NULL,
    organization TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('STATE_COMMISSION', 'STATE_DEPT', 'BOARD', 'UNIVERSITY', 'CENTRAL_GOVT', 'JUDICIARY')),
    active BOOLEAN DEFAULT TRUE,
    scan_frequency TEXT DEFAULT 'DAILY',
    last_scanned_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    http_status INTEGER,
    manual_review_needed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    source_id TEXT REFERENCES job_sources(id) ON DELETE SET NULL,
    organization_name TEXT NOT NULL,
    department_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    advertisement_number TEXT NOT NULL,
    notification_number TEXT,
    notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_last_date TEXT NOT NULL,
    exam_date TEXT,
    vacancy_count INTEGER,
    qualification TEXT NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    age_relaxation TEXT,
    salary TEXT NOT NULL,
    pay_level TEXT,
    job_location TEXT NOT NULL DEFAULT 'Tripura, India',
    employment_type TEXT NOT NULL DEFAULT 'Full Time / Permanent Government',
    selection_process TEXT NOT NULL,
    application_fee TEXT NOT NULL,
    category_information TEXT,
    experience_required TEXT,
    important_dates TEXT,
    official_notification_url TEXT NOT NULL,
    official_apply_url TEXT NOT NULL,
    source_url TEXT NOT NULL,
    notification_pdf_url TEXT,
    extracted_text TEXT,
    summary TEXT NOT NULL,
    eligibility_summary TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSING_SOON', 'EXPIRED', 'UPCOMING')),
    is_new BOOLEAN DEFAULT TRUE,
    is_updated BOOLEAN DEFAULT FALSE,
    is_expired BOOLEAN DEFAULT FALSE,
    verified_from_official_source BOOLEAN DEFAULT TRUE,
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    content_hash TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid search and filtering
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs(organization_name);
CREATE INDEX IF NOT EXISTS idx_jobs_is_new ON jobs(is_new);
CREATE INDEX IF NOT EXISTS idx_jobs_is_updated ON jobs(is_updated);
CREATE INDEX IF NOT EXISTS idx_jobs_content_hash ON jobs(content_hash);

-- 3. JOB UPDATES TABLE (Change History)
CREATE TABLE IF NOT EXISTS job_updates (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    changed_field TEXT NOT NULL,
    old_value TEXT NOT NULL,
    new_value TEXT NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    source_url TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_updates_job_id ON job_updates(job_id);

-- 4. SCAN RUNS TABLE
CREATE TABLE IF NOT EXISTS scan_runs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    source_id TEXT NOT NULL REFERENCES job_sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('SCAN_STARTED', 'FETCHING', 'PARSING', 'EXTRACTING', 'VALIDATING', 'SAVED', 'FAILED', 'SUCCESS')),
    jobs_found INTEGER DEFAULT 0,
    jobs_added INTEGER DEFAULT 0,
    jobs_updated INTEGER DEFAULT 0,
    error_message TEXT
);

-- 5. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    preferences JSONB DEFAULT '{"notify_new_jobs": true, "notify_closing_soon": true, "notify_updates": true, "preferred_qualifications": []}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SAVED JOBS TABLE (Bookmarks)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);

-- 7. USER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('NEW_JOB', 'DEADLINE', 'UPDATE', 'SYSTEM')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. JOBS & SOURCES: Public read access
CREATE POLICY "Allow public read on jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Allow public read on job_sources" ON job_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read on job_updates" ON job_updates FOR SELECT USING (true);
CREATE POLICY "Allow public read on scan_runs" ON scan_runs FOR SELECT USING (true);

-- 2. USER PROFILES: Users read/write their own profile
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 3. SAVED JOBS: Users manage their own saved jobs only
CREATE POLICY "Users can view their saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- 4. NOTIFICATIONS: Users view and update their own notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 5. ADMIN / SERVICE ROLE: Admins can modify sources and jobs
CREATE POLICY "Service role full access on job_sources" ON job_sources USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on jobs" ON jobs USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on scan_runs" ON scan_runs USING (auth.role() = 'service_role');
