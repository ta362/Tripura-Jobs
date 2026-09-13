export interface JobSource {
  id: string;
  name: string;
  organization: string;
  url: string;
  source_type: 'STATE_COMMISSION' | 'STATE_DEPT' | 'BOARD' | 'UNIVERSITY' | 'CENTRAL_GOVT' | 'JUDICIARY';
  active: boolean;
  scan_frequency: 'DAILY' | 'TWICE_DAILY' | 'HOURLY';
  last_scanned_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  http_status: number | null;
  manual_review_needed?: boolean;
  created_at: string;
}

export type JobStatus = 'ACTIVE' | 'CLOSING_SOON' | 'EXPIRED' | 'UPCOMING';

export interface JobRecord {
  id: string;
  source_id: string;
  organization_name: string;
  department_name: string;
  job_title: string;
  advertisement_number: string;
  notification_number: string;
  notification_date: string;
  application_start_date: string;
  application_last_date: string;
  exam_date: string | null;
  vacancy_count: number | null;
  qualification: string;
  age_min: number | null;
  age_max: number | null;
  age_relaxation: string;
  salary: string;
  pay_level: string;
  job_location: string;
  employment_type: string;
  selection_process: string;
  application_fee: string;
  category_information: string;
  experience_required: string;
  important_dates: string;
  official_notification_url: string;
  official_apply_url: string;
  source_url: string;
  notification_pdf_url: string | null;
  extracted_text: string;
  summary: string;
  eligibility_summary: string;
  status: JobStatus;
  is_new: boolean;
  is_updated: boolean;
  is_expired: boolean;
  first_seen_at: string;
  last_seen_at: string;
  last_updated_at: string;
  content_hash: string;
  created_at: string;
  verified_from_official_source: boolean;
}

export interface JobUpdate {
  id: string;
  job_id: string;
  changed_field: string;
  old_value: string;
  new_value: string;
  detected_at: string;
  source_url: string;
}

export interface ScanRun {
  id: string;
  source_id: string;
  source_name?: string;
  started_at: string;
  completed_at: string | null;
  status: 'SCAN_STARTED' | 'FETCHING' | 'PARSING' | 'EXTRACTING' | 'VALIDATING' | 'SAVED' | 'FAILED' | 'SUCCESS';
  jobs_found: number;
  jobs_added: number;
  jobs_updated: number;
  error_message: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  district?: string;
  is_phone_verified?: boolean;
  full_name: string;
  role: 'user' | 'admin';
  login_id?: string;
  password?: string;
  preferences: {
    notify_new_jobs: boolean;
    notify_closing_soon: boolean;
    notify_updates: boolean;
    preferred_qualifications: string[];
  };
  created_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
  notes?: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  job_id: string | null;
  title: string;
  message: string;
  type: 'NEW_JOB' | 'DEADLINE' | 'UPDATE' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
}

export interface ExtractedJobData {
  organization_name: string;
  department_name: string;
  job_title: string;
  advertisement_number: string;
  notification_number?: string;
  notification_date: string;
  application_start_date: string;
  application_last_date: string;
  exam_date?: string | null;
  vacancy_count: number | null;
  qualification: string;
  age_min: number | null;
  age_max: number | null;
  salary: string;
  job_location: string;
  selection_process: string;
  application_fee: string;
  official_notification_url: string;
  official_apply_url: string;
  summary: string;
  eligibility_summary: string;
}
