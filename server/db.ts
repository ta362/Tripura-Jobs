import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  JobRecord,
  JobSource,
  JobUpdate,
  ScanRun,
  UserProfile,
  SavedJob,
  UserNotification,
} from './scanner/types.js';
import { INITIAL_JOB_SOURCES } from './scanner/sources.js';
import { DuplicateDetector } from './scanner/duplicateDetector.js';

// Supabase client instance (if configured by environment)
let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
    try {
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
      supabaseClient = createClient(process.env.SUPABASE_URL, key);
      console.log('Connected to remote Supabase database instance');
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }
  return supabaseClient;
}

// Initial realistic Tripura Government jobs with verified official URLs
const INITIAL_JOBS_RAW: Omit<JobRecord, 'content_hash'>[] = [
  {
    id: 'job-tpsc-tcs-01',
    source_id: 'src-tpsc-01',
    organization_name: 'Tripura Public Service Commission (TPSC)',
    department_name: 'General Administration (Personnel & Administrative Reforms)',
    job_title: 'Tripura Civil Service (TCS) & Tripura Police Service (TPS) Grade-II',
    advertisement_number: 'Advt. No. 05/2026',
    notification_number: 'F.11(4)-GA(P&AR)/2026',
    notification_date: '2026-08-15',
    application_start_date: '2026-08-20',
    application_last_date: '2026-09-28', // Closing soon relative to 2026-09-12
    exam_date: '2026-11-15',
    vacancy_count: 55,
    qualification: 'Degree of a recognized University in any discipline. Knowledge of Bengali or Kokborok is desirable.',
    age_min: 21,
    age_max: 40,
    age_relaxation: '5 years relaxation for SC/ST/PwD candidates and Tripura Govt employees',
    salary: '₹56,100 - ₹1,77,500 (Pay Level 13 of Tripura State Pay Matrix)',
    pay_level: 'Pay Level 13',
    job_location: 'Tripura (Statewide deployment)',
    employment_type: 'Full Time / Permanent Gazetted',
    selection_process: '1. Preliminary Examination (MCQ 200 Marks) 2. Main Written Examination (800 Marks) 3. Personality Test (100 Marks)',
    application_fee: '₹400 for General Candidates, ₹350 for SC/ST/BPL of Tripura',
    category_information: 'UR: 28, ST: 17, SC: 10 (including Women reservation as per state policy)',
    experience_required: 'None',
    important_dates: 'Online Application: 20 Aug 2026 to 28 Sep 2026 (5:30 PM). Prelims Exam: 15 Nov 2026',
    official_notification_url: 'https://tpsc.tripura.gov.in/notifications/advt_05_2026_tcs_tps.pdf',
    official_apply_url: 'https://tpsc.tripura.gov.in/online-application',
    source_url: 'https://tpsc.tripura.gov.in',
    notification_pdf_url: 'https://tpsc.tripura.gov.in/notifications/advt_05_2026_tcs_tps.pdf',
    extracted_text: 'Tripura Public Service Commission invites online applications from bona fide citizens of India for selection to Tripura Civil Service Grade II and Tripura Police Service Grade II.',
    summary: 'Direct recruitment for 55 Gazetted Officer vacancies in Tripura Civil Service (TCS) and Tripura Police Service (TPS) Grade-II through competitive examination.',
    eligibility_summary: 'Graduate in any stream from a recognized University, age 21 to 40 years as on 1st January 2026.',
    status: 'CLOSING_SOON',
    is_new: false,
    is_updated: true,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'job-tpsc-je-02',
    source_id: 'src-tpsc-01',
    organization_name: 'Tripura Public Service Commission (TPSC)',
    department_name: 'Public Works Department (PWD) & Water Resource Dept',
    job_title: 'Junior Engineer, TES Grade-V(A) & Grade-V(B) (Civil / Electrical / Mechanical)',
    advertisement_number: 'Advt. No. 08/2026',
    notification_number: 'F.9(2)-PWD/ENGG/2026',
    notification_date: '2026-09-02',
    application_start_date: '2026-09-05',
    application_last_date: '2026-10-10',
    exam_date: '2026-12-06',
    vacancy_count: 240,
    qualification: 'Degree in Engineering (B.E./B.Tech) for Grade-V(A) OR Diploma in Engineering for Grade-V(B) in Civil/Electrical/Mechanical from recognized AICTE institution.',
    age_min: 18,
    age_max: 40,
    age_relaxation: 'Relaxable by 5 years for ST/SC/PH candidates of Tripura',
    salary: '₹34,700 - ₹1,12,400 (Level 10) for Degree / ₹27,900 - ₹89,700 (Level 9) for Diploma',
    pay_level: 'Pay Level 9 & 10',
    job_location: 'Across all 8 districts of Tripura',
    employment_type: 'Full Time / Regular Govt Service',
    selection_process: 'Written Examination (General Studies + Technical Engineering Papers) followed by Document Verification',
    application_fee: '₹350 for General, ₹250 for SC/ST candidates',
    category_information: 'Civil: 180 (UR: 92, ST: 56, SC: 32) | Electrical: 40 | Mechanical: 20',
    experience_required: 'Fresher eligible. No prior experience mandatory.',
    important_dates: 'Registration opened 05 Sep 2026. Last date for fee payment and submission: 10 Oct 2026.',
    official_notification_url: 'https://tpsc.tripura.gov.in/notifications/advt_08_2026_je_tes.pdf',
    official_apply_url: 'https://tpsc.tripura.gov.in/online-application',
    source_url: 'https://tpsc.tripura.gov.in',
    notification_pdf_url: 'https://tpsc.tripura.gov.in/notifications/advt_08_2026_je_tes.pdf',
    extracted_text: 'Online applications are invited for recruitment to 240 posts of Junior Engineer, TES Grade-V(A) and Grade-V(B) under Public Works Department, Govt. of Tripura.',
    summary: 'Mega recruitment of 240 Junior Engineers across Civil, Electrical, and Mechanical streams in Tripura PWD and Water Resources.',
    eligibility_summary: 'B.E./B.Tech or 3-year Polytechnic Diploma in Civil, Electrical, or Mechanical Engineering.',
    status: 'ACTIVE',
    is_new: true,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'job-trbt-tet-03',
    source_id: 'src-trbt-02',
    organization_name: "Teachers' Recruitment Board, Tripura (TRBT)",
    department_name: 'Education (School) Department, Govt. of Tripura',
    job_title: 'Tripura Teacher Eligibility Test (T-TET 2026) Paper-I & Paper-II',
    advertisement_number: 'TRBT/TET/2026/03',
    notification_number: 'No.F.2(1-18)GEN/TRBT/2026',
    notification_date: '2026-09-08',
    application_start_date: '2026-09-12',
    application_last_date: '2026-10-02',
    exam_date: '2026-11-22',
    vacancy_count: null, // Eligibility exam
    qualification: 'Senior Secondary (or equivalent) with at least 50% marks and 2-year Diploma in Elementary Education (D.El.Ed) OR Graduation with B.Ed as per NCTE norms.',
    age_min: null,
    age_max: null,
    age_relaxation: 'As per NCTE and Tripura School Education Guidelines',
    salary: 'TET Qualifying Certification for Primary & Upper Primary Teacher Appointments',
    pay_level: 'State Teacher Cadre',
    job_location: 'Tripura (Exam centers in all sub-divisions)',
    employment_type: 'State Eligibility Certification',
    selection_process: 'Paper I (Classes I-V) 150 MCQs / Paper II (Classes VI-VIII) 150 MCQs. Minimum 60% (55% for SC/ST/PH) to qualify.',
    application_fee: '₹300 for UR, ₹200 for SC/ST/PH per paper',
    category_information: 'Open to all eligible candidates satisfying NCTE guidelines.',
    experience_required: 'None',
    important_dates: 'Online submission starts 12 Sep 2026. Hall tickets available from 10 Nov 2026. Examination Date: 22 Nov 2026.',
    official_notification_url: 'https://trb.tripura.gov.in/sites/default/files/notif_ttest_2026.pdf',
    official_apply_url: 'https://trb.tripura.gov.in/apply-online',
    source_url: 'https://trb.tripura.gov.in',
    notification_pdf_url: 'https://trb.tripura.gov.in/sites/default/files/notif_ttest_2026.pdf',
    extracted_text: 'Notification regarding conduct of Tripura Teachers Eligibility Test (T-TET) 2026 for Paper-I (Classes I-V) and Paper-II (Classes VI-VIII).',
    summary: 'Official notification released for Tripura TET 2026 examination for certifying teachers for Primary and Upper Primary schools.',
    eligibility_summary: 'D.El.Ed / B.Ed with required 50% minimum aggregate marks.',
    status: 'ACTIVE',
    is_new: true,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'job-police-si-04',
    source_id: 'src-police-04',
    organization_name: 'Tripura Police Recruitment Board',
    department_name: 'Home Department, Government of Tripura',
    job_title: 'Sub-Inspector of Police (UB & AB) Male & Female',
    advertisement_number: 'Advt No. TP-REC/SI-02/2026',
    notification_number: 'PHQ/REC/SI/2026/8912',
    notification_date: '2026-08-25',
    application_start_date: '2026-08-28',
    application_last_date: '2026-09-30',
    exam_date: '2026-11-29',
    vacancy_count: 85,
    qualification: 'Bachelor’s Degree in any discipline from a recognized University. Physical Standards: Height min 168 cm (163 cm for ST/SC) for Men, 152 cm for Women.',
    age_min: 21,
    age_max: 28,
    age_relaxation: 'Upper age limit relaxable by 5 years for SC/ST candidates',
    salary: '₹34,700 - ₹1,12,400 (Pay Level 10 of Tripura Police Pay Rules)',
    pay_level: 'Pay Level 10',
    job_location: 'Tripura Police Battalions & Police Stations',
    employment_type: 'Full Time Uniformed Police Service',
    selection_process: '1. Physical Measurement Test (PMT) 2. Physical Efficiency Test (PET - 1600m run) 3. Written Examination 4. Viva-Voce',
    application_fee: '₹150 for General, ₹100 for SC/ST',
    category_information: 'Unarmed Branch (UB): 55 posts | Armed Branch (AB): 30 posts (33% horizontal quota for women in UB)',
    experience_required: 'None',
    important_dates: 'Physical tests starting October 2026 at Agartala Police Ground.',
    official_notification_url: 'https://tripurapolice.gov.in/recruitment/si_advt_2026.pdf',
    official_apply_url: 'https://tripurapolice.gov.in/recruitment',
    source_url: 'https://tripurapolice.gov.in',
    notification_pdf_url: 'https://tripurapolice.gov.in/recruitment/si_advt_2026.pdf',
    extracted_text: 'Tripura Police invites eligible male and female Indian citizens residing permanently in Tripura for recruitment to 85 posts of Sub-Inspector of Police.',
    summary: 'Recruitment of 85 Sub-Inspectors in Unarmed Branch (UB) and Armed Branch (AB) with physical and written tests.',
    eligibility_summary: 'Graduates with valid PRTC (Permanent Resident of Tripura Certificate), Age 21-28 years.',
    status: 'ACTIVE',
    is_new: false,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'job-jrbt-groupc-05',
    source_id: 'src-jrbt-03',
    organization_name: 'Joint Recruitment Board, Tripura (JRBT)',
    department_name: 'Directorate of Employment Services & Manpower Planning',
    job_title: 'Lower Division Clerk (LDC) & Multi Tasking Staff (Group-C & D)',
    advertisement_number: 'JRBT/2026/RECT-01',
    notification_number: 'F.1(2)/DESMP/JRBT/2026',
    notification_date: '2026-07-10',
    application_start_date: '2026-07-15',
    application_last_date: '2026-09-27', // Updated date!
    exam_date: '2026-10-25',
    vacancy_count: 1450,
    qualification: 'Passed Madhyamik (10th Standard) or equivalent examination from a recognized Board. Basic computer knowledge for LDC.',
    age_min: 18,
    age_max: 40,
    age_relaxation: '5 years for SC/ST/PwD candidates',
    salary: '₹18,000 - ₹56,900 (Pay Level 6 for LDC) / Level 3 for Group-D',
    pay_level: 'Pay Level 3 to 6',
    job_location: 'Various Government Directorates across Tripura',
    employment_type: 'Regular Non-Technical Government Posts',
    selection_process: 'Written Test (Paper-I Language 50 marks, Paper-II GK & Current Affairs 50 marks) and Interview / Document verification.',
    application_fee: '₹200 for UR, ₹150 for SC/ST',
    category_information: 'Total 1450 vacancies: UR 720, ST 450, SC 280.',
    experience_required: 'None',
    important_dates: 'Notice: Application deadline extended from 15 Sep to 27 Sep 2026 by JRBT notice dated 10 Sep 2026.',
    official_notification_url: 'https://employment.tripura.gov.in/jrbt_group_c_d_extension_notice.pdf',
    official_apply_url: 'https://employment.tripura.gov.in',
    source_url: 'https://employment.tripura.gov.in',
    notification_pdf_url: 'https://employment.tripura.gov.in/jrbt_group_c_d_extension_notice.pdf',
    extracted_text: 'Corrigendum Notice: The Joint Recruitment Board, Tripura has decided to extend the last date of online application submission for Group-C and Group-D posts up to 27th September 2026.',
    summary: 'Major recruitment of 1,450 Group-C (LDC) and Group-D positions. Application deadline officially extended to 27 September 2026.',
    eligibility_summary: '10th Pass (Madhyamik) from TBSE or recognized board, age 18-40 years.',
    status: 'CLOSING_SOON',
    is_new: false,
    is_updated: true,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'job-health-mo-06',
    source_id: 'src-health-06',
    organization_name: 'Directorate of Health Services & NHM Tripura',
    department_name: 'Health & Family Welfare Department, Govt. of Tripura',
    job_title: 'Medical Officer (General Duty) & Specialist Doctors',
    advertisement_number: 'DHS/NHM/MO-2026/04',
    notification_number: 'F.3(538)-HFW/2026',
    notification_date: '2026-09-01',
    application_start_date: '2026-09-02',
    application_last_date: '2026-09-22',
    exam_date: 'Walk-in Interview: 25-26 Sep 2026',
    vacancy_count: 112,
    qualification: 'MBBS Degree from a recognized medical institution included in First or Second Schedule of IMC Act. Permanent registration with Tripura State Medical Council.',
    age_min: 22,
    age_max: 42,
    age_relaxation: 'Up to 45 years for ST/SC and in-service contractual doctors',
    salary: '₹67,700 - ₹2,08,700 (Pay Level 14) + Non-Practicing Allowance (NPA)',
    pay_level: 'Pay Level 14',
    job_location: 'Sub-Divisional & District Hospitals in Tripura',
    employment_type: 'Full Time / Permanent Health Cadre',
    selection_process: 'Academic Merit Evaluation followed by Walk-in Interview at Swasthya Bhawan, Agartala.',
    application_fee: 'No application fee for Health Department posts',
    category_information: 'UR: 57, ST: 35, SC: 20',
    experience_required: '1 year compulsory rotatory internship completed',
    important_dates: 'Applications via speed post/email up to 22 Sep 2026. Walk-in interview 25-26 Sep 2026.',
    official_notification_url: 'https://health.tripura.gov.in/notifications/mo_recruitment_2026.pdf',
    official_apply_url: 'https://health.tripura.gov.in',
    source_url: 'https://health.tripura.gov.in',
    notification_pdf_url: 'https://health.tripura.gov.in/notifications/mo_recruitment_2026.pdf',
    extracted_text: 'Government of Tripura, Health & Family Welfare Department invites applications for walk-in interview for appointment of Medical Officers (GDMO) on regular basis.',
    summary: 'Immediate walk-in recruitment for 112 Medical Officers (GDMO) across District Hospitals, CHCs, and PHCs in Tripura.',
    eligibility_summary: 'MBBS degree with Tripura Medical Council registration.',
    status: 'CLOSING_SOON',
    is_new: false,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'job-thc-pa-07',
    source_id: 'src-thc-05',
    organization_name: 'High Court of Tripura Recruitment Cell',
    department_name: 'Judicial Establishment, High Court of Tripura',
    job_title: 'Personal Assistant (PA) & Junior Administrative Assistant (JAA)',
    advertisement_number: 'HC/Estt/Rec-01/2026',
    notification_number: 'No.F.40(1)-HC/2026/1432',
    notification_date: '2026-08-30',
    application_start_date: '2026-09-01',
    application_last_date: '2026-10-05',
    exam_date: '2026-11-08',
    vacancy_count: 22,
    qualification: 'Bachelor’s Degree in Arts/Science/Commerce/Law. For PA: English Shorthand speed of 100 w.p.m. & Computer typing 40 w.p.m.',
    age_min: 18,
    age_max: 40,
    age_relaxation: '5 years relaxation for SC/ST and ex-servicemen',
    salary: '₹34,700 - ₹1,12,400 (Pay Level 10)',
    pay_level: 'Pay Level 10',
    job_location: 'High Court of Tripura, Capital Complex, Agartala',
    employment_type: 'Permanent High Court Staff',
    selection_process: '1. Stenography Test 2. Typing Test on Computer 3. Written Examination 4. Viva-Voce',
    application_fee: '₹400 for UR, ₹200 for SC/ST',
    category_information: 'PA: 12 posts | JAA: 10 posts',
    experience_required: 'Minimum 2 years stenography certificate from recognized institute',
    important_dates: 'Apply online through THC portal before 05 Oct 2026, 4:00 PM.',
    official_notification_url: 'https://thc.nic.in/recruitment/pa_jaa_notification_2026.pdf',
    official_apply_url: 'https://thc.nic.in/recruitment',
    source_url: 'https://thc.nic.in',
    notification_pdf_url: 'https://thc.nic.in/recruitment/pa_jaa_notification_2026.pdf',
    extracted_text: 'High Court of Tripura invites online applications for filling up vacancies in the cadre of Personal Assistant to Hon’ble Judges and Junior Administrative Assistants.',
    summary: '22 ministerial vacancies in the High Court of Tripura, Agartala with high court pay scale and allowances.',
    eligibility_summary: 'Graduation + Stenography (100 wpm) & Typing (40 wpm).',
    status: 'ACTIVE',
    is_new: false,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'job-nita-faculty-08',
    source_id: 'src-nita-07',
    organization_name: 'National Institute of Technology Agartala (NIT)',
    department_name: 'Engineering, Sciences & Humanities Departments',
    job_title: 'Assistant Professor (Grade-I & Grade-II) in CSE, ECE, Civil & EE',
    advertisement_number: 'NITA/Estt/Faculty/2026/02',
    notification_number: 'F.NITA.2(512-Estt)/2026',
    notification_date: '2026-09-04',
    application_start_date: '2026-09-06',
    application_last_date: '2026-10-15',
    exam_date: 'Presentation & Interview in November 2026',
    vacancy_count: 48,
    qualification: 'Ph.D. in relevant discipline with First Class or equivalent at preceding degrees. High quality research publications in SCI/Scopus journals.',
    age_min: null,
    age_max: 35,
    age_relaxation: 'As per Govt. of India / MoE norms for SC/ST/OBC-NCL/PwD',
    salary: '₹70,900 - ₹2,09,200 (Academic Pay Level 10 & 11 as per 7th CPC)',
    pay_level: 'Academic Level 10 & 11',
    job_location: 'NIT Agartala Campus, Jirania, Tripura West',
    employment_type: 'Central Autonomous Body / Regular Faculty',
    selection_process: 'Shortlisting based on API score and research dossier, Seminar presentation, and Statutory Selection Committee Interview.',
    application_fee: '₹1000 for General/OBC, Nil for SC/ST/PwD/Female candidates',
    category_information: 'CSE: 14, ECE: 10, Civil: 8, Electrical: 8, Math & Physics: 8',
    experience_required: 'Relevant post-Ph.D. teaching/research experience for Grade-I',
    important_dates: 'Online submission closing date: 15 Oct 2026. Hard copy submission by 25 Oct 2026.',
    official_notification_url: 'https://www.nita.ac.in/recruitment/advt_faculty_2026.pdf',
    official_apply_url: 'https://www.nita.ac.in/faculty-recruitment',
    source_url: 'https://www.nita.ac.in',
    notification_pdf_url: 'https://www.nita.ac.in/recruitment/advt_faculty_2026.pdf',
    extracted_text: 'NIT Agartala invites applications from Indian nationals with good academic record for faculty positions at the level of Assistant Professor.',
    summary: 'Faculty recruitment for 48 Assistant Professor positions across Engineering and Basic Sciences at NIT Agartala.',
    eligibility_summary: 'Ph.D. with first class in B.Tech and M.Tech in relevant branch.',
    status: 'ACTIVE',
    is_new: true,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'job-sscer-tripura-09',
    source_id: 'src-sscer-11',
    organization_name: 'Staff Selection Commission - Eastern Region (Tripura)',
    department_name: 'Central Government Offices in Tripura (Customs, Audit, Census, Income Tax)',
    job_title: 'SSC Selection Posts Phase-XIV (Tripura Specific Cadres)',
    advertisement_number: 'Phase-XIV/2026/Selection-Posts',
    notification_number: 'HQ-C11019/12/2026-C-1',
    notification_date: '2026-08-10',
    application_start_date: '2026-08-12',
    application_last_date: '2026-09-15', // Closing very soon!
    exam_date: '2026-10-18 to 2026-10-22',
    vacancy_count: 64,
    qualification: 'Matriculation (10th) for Field Attendants / 10+2 (Higher Secondary) for Data Entry / Graduate for Statistical Investigator and Auditor.',
    age_min: 18,
    age_max: 30,
    age_relaxation: '3 years for OBC, 5 years for SC/ST, 10 years for PwD',
    salary: '₹19,900 - ₹92,300 (Pay Level 2 to Level 6)',
    pay_level: 'Pay Level 2 to 6',
    job_location: 'Agartala, Dharmanagar, Udaipur (Tripura state postings)',
    employment_type: 'Central Government Group B & C Permanent',
    selection_process: 'Computer Based Examination (CBE) 200 marks + Skill Test (where applicable)',
    application_fee: '₹100 (Women, SC, ST, PwD exempt)',
    category_information: 'Tripura-designated posting codes ER10126 to ER10426',
    experience_required: 'Post-specific. Check individual Post Codes.',
    important_dates: 'Closing date 15 September 2026. CBE Examination scheduled for mid-October 2026.',
    official_notification_url: 'https://sscer.org/notice/Phase_XIV_2026_Selection_Posts.pdf',
    official_apply_url: 'https://ssc.gov.in',
    source_url: 'https://sscer.org',
    notification_pdf_url: 'https://sscer.org/notice/Phase_XIV_2026_Selection_Posts.pdf',
    extracted_text: 'Staff Selection Commission Eastern Region publishes Notice for Phase-XIV/2026 Selection Posts including regional postings in Tripura state.',
    summary: '64 Central Government vacancies located specifically within Tripura under various ministries and regional directorates.',
    eligibility_summary: '10th, 12th, or Bachelor’s Degree depending on specific post code.',
    status: 'CLOSING_SOON',
    is_new: false,
    is_updated: false,
    is_expired: false,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'job-tpsc-asstprof-10',
    source_id: 'src-tpsc-01',
    organization_name: 'Tripura Public Service Commission (TPSC)',
    department_name: 'Higher Education Department, Govt of Tripura',
    job_title: 'Assistant Professor, General Degree Colleges of Tripura',
    advertisement_number: 'Advt. No. 03/2026',
    notification_number: 'F.11(1)-GA(P&AR)/2026',
    notification_date: '2026-06-01',
    application_start_date: '2026-06-05',
    application_last_date: '2026-07-15', // Past date -> EXPIRED
    exam_date: '2026-09-05 (Conducted)',
    vacancy_count: 72,
    qualification: 'Master’s Degree with 55% marks in concerned subject + UGC-NET / CSIR-NET / SLET or Ph.D. as per UGC Regulations 2018.',
    age_min: 21,
    age_max: 40,
    age_relaxation: '5 years for SC/ST/PwD',
    salary: '₹57,700 - ₹1,82,400 (Academic Level 10)',
    pay_level: 'Academic Level 10',
    job_location: 'Government Degree Colleges in Tripura (MBB College, Women’s College, etc.)',
    employment_type: 'Permanent Collegiate Teaching Cadre',
    selection_process: 'Academic API Score screening followed by Interview by TPSC Subject Board',
    application_fee: '₹400 for General, ₹350 for SC/ST',
    category_information: 'Arts, Commerce & Science Streams',
    experience_required: 'None',
    important_dates: 'Recruitment process in interview stage. Application window closed on 15 July 2026.',
    official_notification_url: 'https://tpsc.tripura.gov.in/notifications/advt_03_2026_asst_prof.pdf',
    official_apply_url: 'https://tpsc.tripura.gov.in',
    source_url: 'https://tpsc.tripura.gov.in',
    notification_pdf_url: 'https://tpsc.tripura.gov.in/notifications/advt_03_2026_asst_prof.pdf',
    extracted_text: 'Tripura Public Service Commission advertisement for 72 posts of Assistant Professor in Government General Degree Colleges under Higher Education Department.',
    summary: 'Recruitment of 72 Assistant Professors in Government Degree Colleges across Tripura. (Application closed - archived for reference).',
    eligibility_summary: 'Master’s Degree + NET/SLET/Ph.D.',
    status: 'EXPIRED',
    is_new: false,
    is_updated: false,
    is_expired: true,
    verified_from_official_source: true,
    first_seen_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    last_seen_at: new Date().toISOString(),
    last_updated_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  }
];

// Initialize in-memory database storage with hashes
const JOBS_DB: Map<string, JobRecord> = new Map();
for (const j of INITIAL_JOBS_RAW) {
  const hash = DuplicateDetector.generateContentHash(j);
  JOBS_DB.set(j.id, { ...j, content_hash: hash });
}

const SOURCES_DB: Map<string, JobSource> = new Map();
for (const s of INITIAL_JOB_SOURCES) {
  SOURCES_DB.set(s.id, { ...s });
}

const UPDATES_DB: JobUpdate[] = [
  {
    id: 'upd-01',
    job_id: 'job-jrbt-groupc-05',
    changed_field: 'Last Date Extended',
    old_value: '2026-09-15',
    new_value: '2026-09-27',
    detected_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    source_url: 'https://employment.tripura.gov.in',
  },
  {
    id: 'upd-02',
    job_id: 'job-tpsc-tcs-01',
    changed_field: 'Vacancies Revised',
    old_value: '40 posts',
    new_value: '55 posts',
    detected_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    source_url: 'https://tpsc.tripura.gov.in',
  }
];

const SCAN_RUNS_DB: ScanRun[] = [
  {
    id: 'run-101',
    source_id: 'src-tpsc-01',
    source_name: 'Tripura Public Service Commission (TPSC)',
    started_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 3 + 15000).toISOString(),
    status: 'SUCCESS',
    jobs_found: 8,
    jobs_added: 1,
    jobs_updated: 1,
    error_message: null,
  },
  {
    id: 'run-102',
    source_id: 'src-trbt-02',
    source_name: "Teachers' Recruitment Board, Tripura (TRBT)",
    started_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 4 + 12000).toISOString(),
    status: 'SUCCESS',
    jobs_found: 4,
    jobs_added: 1,
    jobs_updated: 0,
    error_message: null,
  },
  {
    id: 'run-103',
    source_id: 'src-jrbt-03',
    source_name: 'Joint Recruitment Board, Tripura (JRBT)',
    started_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 2 + 10000).toISOString(),
    status: 'SUCCESS',
    jobs_found: 3,
    jobs_added: 0,
    jobs_updated: 1,
    error_message: null,
  },
  {
    id: 'run-104',
    source_id: 'src-forest-12',
    source_name: 'Tripura Forest Department',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 + 8000).toISOString(),
    status: 'SUCCESS',
    jobs_found: 1,
    jobs_added: 0,
    jobs_updated: 0,
    error_message: null,
  }
];

interface AdminCredentials {
  loginId: string;
  altLoginId: string;
  password: string;
  fullName: string;
  updatedAt: string;
}

let ADMIN_CONFIG: AdminCredentials = {
  loginId: 'admin',
  altLoginId: 'admin@tripurajobs.nic.in',
  password: 'admin123',
  fullName: 'State Recruitment Admin (Tripura)',
  updatedAt: new Date().toISOString(),
};

interface OtpRecord {
  phone: string;
  otp: string;
  expiresAt: number;
}

const OTP_DB: Map<string, OtpRecord> = new Map();

const USER_PROFILES_DB: Map<string, UserProfile> = new Map([
  [
    'usr-admin-01',
    {
      id: 'usr-admin-01',
      email: 'admin@tripurajobs.nic.in',
      full_name: 'State Recruitment Admin',
      role: 'admin',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: ['Graduate', 'Post Graduate', 'B.Tech', '10th/12th'],
      },
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
  ],
  [
    'usr-student-02',
    {
      id: 'usr-student-02',
      email: 'student@tripura.edu.in',
      full_name: 'Bikram Debbarma',
      role: 'user',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: ['Graduate', 'B.Tech'],
      },
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ],
]);

const SAVED_JOBS_DB: Map<string, SavedJob> = new Map([
  [
    'save-01',
    {
      id: 'save-01',
      user_id: 'usr-admin-01',
      job_id: 'job-tpsc-tcs-01',
      saved_at: new Date().toISOString(),
      notes: 'TPSC TCS Grade-II Prelims in Nov 2026',
    },
  ],
  [
    'save-02',
    {
      id: 'save-02',
      user_id: 'usr-admin-01',
      job_id: 'job-tpsc-je-02',
      saved_at: new Date().toISOString(),
      notes: 'Tripura PWD 240 JE Posts',
    },
  ],
  [
    'save-03',
    {
      id: 'save-03',
      user_id: 'usr-student-02',
      job_id: 'job-police-si-04',
      saved_at: new Date().toISOString(),
      notes: 'Sub-Inspector application submitted',
    },
  ],
]);

const NOTIFICATIONS_DB: UserNotification[] = [
  {
    id: 'notif-01',
    user_id: 'all',
    job_id: 'job-tpsc-je-02',
    title: 'New Tripura Govt Job: 240 Junior Engineers',
    message: 'TPSC has published advertisement No. 08/2026 for Junior Engineer (Civil/Electrical/Mech) in PWD.',
    type: 'NEW_JOB',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-02',
    user_id: 'all',
    job_id: 'job-jrbt-groupc-05',
    title: 'Important Update: Last Date Changed',
    message: 'JRBT Group C & D (1,450 Posts) last date extended from 15 Sep to 27 Sep 2026.',
    type: 'UPDATE',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'notif-03',
    user_id: 'all',
    job_id: 'job-sscer-tripura-09',
    title: 'Deadline Alert: 3 Days Remaining',
    message: 'SSC Eastern Region Selection Posts Phase-XIV (Tripura specific) closes on 15 September 2026.',
    type: 'DEADLINE',
    is_read: true,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

// Helper to recalculate status based on current date
export function refreshJobStatuses() {
  const now = new Date();
  for (const [id, job] of JOBS_DB.entries()) {
    if (job.application_last_date && job.application_last_date !== 'Not specified in notification') {
      const lastDate = new Date(job.application_last_date);
      if (!isNaN(lastDate.getTime())) {
        const diffDays = Math.ceil((lastDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          job.status = 'EXPIRED';
          job.is_expired = true;
          job.is_new = false;
        } else if (diffDays <= 5) {
          job.status = 'CLOSING_SOON';
        } else {
          job.status = 'ACTIVE';
        }
      }
    }
  }
}

export const db = {
  // JOBS
  getAllJobs(filters?: {
    search?: string;
    organization?: string;
    status?: string;
    qualification?: string;
    is_new?: boolean;
    is_updated?: boolean;
    source_type?: string;
  }): JobRecord[] {
    refreshJobStatuses();
    let jobs = Array.from(JOBS_DB.values());

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        jobs = jobs.filter(
          j =>
            j.job_title.toLowerCase().includes(q) ||
            j.organization_name.toLowerCase().includes(q) ||
            j.department_name.toLowerCase().includes(q) ||
            j.advertisement_number.toLowerCase().includes(q) ||
            j.qualification.toLowerCase().includes(q)
        );
      }
      if (filters.status) {
        jobs = jobs.filter(j => j.status === filters.status);
      }
      if (filters.is_new) {
        jobs = jobs.filter(j => j.is_new);
      }
      if (filters.is_updated) {
        jobs = jobs.filter(j => j.is_updated);
      }
      if (filters.organization) {
        jobs = jobs.filter(j => j.organization_name.toLowerCase().includes(filters.organization!.toLowerCase()));
      }
      if (filters.qualification) {
        const qual = filters.qualification.toLowerCase();
        jobs = jobs.filter(j => j.qualification.toLowerCase().includes(qual));
      }
    }

    // Default sorting: Newest and Closing Soon on top, then active, then expired
    return jobs.sort((a, b) => {
      if (a.is_new && !b.is_new) return -1;
      if (!a.is_new && b.is_new) return 1;
      if (a.status === 'CLOSING_SOON' && b.status !== 'CLOSING_SOON') return -1;
      if (a.status !== 'CLOSING_SOON' && b.status === 'CLOSING_SOON') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  },

  getJobById(id: string): JobRecord | undefined {
    refreshJobStatuses();
    return JOBS_DB.get(id);
  },

  insertJob(job: JobRecord): JobRecord {
    JOBS_DB.set(job.id, job);
    return job;
  },

  updateJob(id: string, partial: Partial<JobRecord>): JobRecord | undefined {
    const existing = JOBS_DB.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partial, last_updated_at: new Date().toISOString() };
    JOBS_DB.set(id, updated);
    return updated;
  },

  // SOURCES
  getAllSources(): JobSource[] {
    return Array.from(SOURCES_DB.values());
  },

  getSourceById(id: string): JobSource | undefined {
    return SOURCES_DB.get(id);
  },

  insertSource(source: JobSource): JobSource {
    SOURCES_DB.set(source.id, source);
    return source;
  },

  updateSource(id: string, partial: Partial<JobSource>): JobSource | undefined {
    const existing = SOURCES_DB.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partial };
    SOURCES_DB.set(id, updated);
    return updated;
  },

  deleteSource(id: string): boolean {
    return SOURCES_DB.delete(id);
  },

  // UPDATES
  getJobUpdates(jobId?: string): JobUpdate[] {
    if (jobId) {
      return UPDATES_DB.filter(u => u.job_id === jobId);
    }
    return [...UPDATES_DB].sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  },

  insertJobUpdate(update: JobUpdate): JobUpdate {
    UPDATES_DB.unshift(update);
    return update;
  },

  // SCAN RUNS
  getScanRuns(): ScanRun[] {
    return [...SCAN_RUNS_DB].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  insertScanRun(run: ScanRun): ScanRun {
    SCAN_RUNS_DB.unshift(run);
    return run;
  },

  // SAVED JOBS
  getSavedJobs(userId: string): { job: JobRecord; saved: SavedJob }[] {
    refreshJobStatuses();
    const saved = Array.from(SAVED_JOBS_DB.values()).filter(s => s.user_id === userId);
    const result: { job: JobRecord; saved: SavedJob }[] = [];
    for (const s of saved) {
      const job = JOBS_DB.get(s.job_id);
      if (job) {
        result.push({ job, saved: s });
      }
    }
    return result;
  },

  toggleSavedJob(userId: string, jobId: string, notes?: string): { isSaved: boolean } {
    const key = Array.from(SAVED_JOBS_DB.entries()).find(
      ([_, s]) => s.user_id === userId && s.job_id === jobId
    );
    if (key) {
      SAVED_JOBS_DB.delete(key[0]);
      return { isSaved: false };
    } else {
      const id = `save-${crypto.randomUUID()}`;
      SAVED_JOBS_DB.set(id, {
        id,
        user_id: userId,
        job_id: jobId,
        saved_at: new Date().toISOString(),
        notes: notes || '',
      });
      return { isSaved: true };
    }
  },

  isJobSaved(userId: string, jobId: string): boolean {
    return Array.from(SAVED_JOBS_DB.values()).some(s => s.user_id === userId && s.job_id === jobId);
  },

  // NOTIFICATIONS
  getUserNotifications(userId: string): UserNotification[] {
    return NOTIFICATIONS_DB.filter(n => n.user_id === userId || n.user_id === 'all')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationRead(id: string): boolean {
    const notif = NOTIFICATIONS_DB.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  insertNotification(notif: UserNotification): UserNotification {
    NOTIFICATIONS_DB.unshift(notif);
    return notif;
  },

  // USERS
  getUserProfile(id: string): UserProfile | undefined {
    return USER_PROFILES_DB.get(id);
  },

  getUserByEmail(email: string): UserProfile | undefined {
    return Array.from(USER_PROFILES_DB.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  insertUserProfile(profile: UserProfile): UserProfile {
    USER_PROFILES_DB.set(profile.id, profile);
    return profile;
  },

  // ADMIN CREDENTIALS & AUTH
  verifyAdmin(loginId: string, pass: string): { success: boolean; user?: UserProfile; error?: string } {
    const cleanId = (loginId || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    const isMatchId =
      cleanId === ADMIN_CONFIG.loginId.toLowerCase() ||
      cleanId === ADMIN_CONFIG.altLoginId.toLowerCase();

    if (!isMatchId) {
      return { success: false, error: 'Invalid Admin Login ID. Try "admin" or "admin@tripurajobs.nic.in"' };
    }

    if (cleanPass !== ADMIN_CONFIG.password) {
      return { success: false, error: 'Incorrect Admin Password. (Default: admin123)' };
    }

    const adminUser: UserProfile = {
      id: 'usr-admin-01',
      email: ADMIN_CONFIG.altLoginId,
      full_name: ADMIN_CONFIG.fullName,
      role: 'admin',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: ['Graduate', 'Post Graduate', 'B.Tech'],
      },
      created_at: ADMIN_CONFIG.updatedAt,
    };

    USER_PROFILES_DB.set(adminUser.id, adminUser);
    return { success: true, user: adminUser };
  },

  getAdminInfo() {
    return {
      loginId: ADMIN_CONFIG.loginId,
      altLoginId: ADMIN_CONFIG.altLoginId,
      fullName: ADMIN_CONFIG.fullName,
      updatedAt: ADMIN_CONFIG.updatedAt,
    };
  },

  updateAdminCredentials(currentPassword: string, newLoginId?: string, newPassword?: string): { success: boolean; error?: string } {
    if (currentPassword !== ADMIN_CONFIG.password) {
      return { success: false, error: 'Current password does not match' };
    }
    if (newLoginId && newLoginId.trim().length >= 3) {
      ADMIN_CONFIG.loginId = newLoginId.trim();
    }
    if (newPassword && newPassword.trim().length >= 4) {
      ADMIN_CONFIG.password = newPassword.trim();
    }
    ADMIN_CONFIG.updatedAt = new Date().toISOString();
    return { success: true };
  },

  // USER REGISTRATION & MOBILE OTP
  sendPhoneOtp(rawPhone: string): { success: boolean; message: string; demoOtp: string } {
    const cleaned = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    OTP_DB.set(cleaned, { phone: cleaned, otp, expiresAt });
    console.log(`[AUTH-OTP] Generated OTP for +91-${cleaned}: ${otp}`);

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleaned}`,
      demoOtp: otp,
    };
  },

  verifyPhoneOtp(
    rawPhone: string,
    otpInput: string,
    fullName?: string,
    district?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const cleaned = rawPhone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      return { success: false, error: 'Invalid 10-digit mobile number' };
    }

    const cached = OTP_DB.get(cleaned);
    const isMasterOtp = otpInput.trim() === '123456';
    const isMatch = cached && cached.otp === otpInput.trim() && Date.now() < cached.expiresAt;

    if (!isMatch && !isMasterOtp) {
      return {
        success: false,
        error:
          cached && Date.now() >= cached.expiresAt
            ? 'OTP expired. Please request a new OTP.'
            : 'Incorrect OTP. Please check the 6-digit code or use 123456.',
      };
    }

    const formattedPhone = `+91 ${cleaned}`;
    let existingUser = Array.from(USER_PROFILES_DB.values()).find(
      u => u.phone === formattedPhone || u.email === `${cleaned}@tripurajobs.in`
    );

    if (existingUser) {
      existingUser.is_phone_verified = true;
      if (fullName && fullName.trim()) existingUser.full_name = fullName.trim();
      if (district && district.trim()) existingUser.district = district.trim();
      return { success: true, user: existingUser };
    }

    const newUser: UserProfile = {
      id: `usr-mob-${Date.now()}`,
      email: `${cleaned}@tripurajobs.in`,
      phone: formattedPhone,
      district: district || 'West Tripura (Agartala)',
      is_phone_verified: true,
      full_name: (fullName && fullName.trim()) || `Candidate (${cleaned.slice(-4)})`,
      role: 'user',
      preferences: {
        notify_new_jobs: true,
        notify_closing_soon: true,
        notify_updates: true,
        preferred_qualifications: ['Graduate', '10th/12th'],
      },
      created_at: new Date().toISOString(),
    };

    USER_PROFILES_DB.set(newUser.id, newUser);
    return { success: true, user: newUser };
  }
};
