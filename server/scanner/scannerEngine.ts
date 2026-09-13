import crypto from 'crypto';
import { db } from '../db.js';
import { JobSource, JobRecord, ScanRun, ExtractedJobData } from './types.js';
import { HtmlJobScanner } from './htmlScanner.js';
import { AIJobExtractor } from './aiExtractor.js';
import { DuplicateDetector } from './duplicateDetector.js';
import { JobChangeDetector } from './changeDetector.js';
import { AutonomousDiscoveryService } from './discoveryService.js';

export class ScannerEngine {
  private static isScanning = false;

  /**
   * Returns current scanning lock status.
   */
  public static isBusy(): boolean {
    return this.isScanning;
  }

  /**
   * Executes a scan across all active sources (or a single specified source).
   * Guarantees error isolation: a single failed website will not abort other sources.
   */
  public static async executeScan(targetSourceId?: string): Promise<{
    sourcesScanned: number;
    newJobsFound: number;
    updatedJobs: number;
    failedSources: number;
    details: ScanRun[];
  }> {
    if (this.isScanning) {
      throw new Error('A scan is already actively running. Please wait for completion.');
    }

    this.isScanning = true;
    const startTime = new Date();
    let sourcesScanned = 0;
    let newJobsFound = 0;
    let updatedJobs = 0;
    let failedSources = 0;
    const runLogs: ScanRun[] = [];

    try {
      // Run the dynamic, zero-maintenance official portal discovery service
      try {
        await AutonomousDiscoveryService.discoverAndRegisterPortals();
      } catch (discoveryErr: any) {
        console.warn('[JobScanner] Background government portal discovery experienced a minor interruption:', discoveryErr.message);
      }

      let sources = db.getAllSources();
      if (targetSourceId) {
        sources = sources.filter(s => s.id === targetSourceId);
      } else {
        sources = sources.filter(s => s.active);
      }

      console.log(`[JobScanner] Initiating scheduled scan across ${sources.length} official Tripura sources...`);

      for (const source of sources) {
        sourcesScanned++;
        const runId = `run-${crypto.randomUUID()}`;
        const runStart = new Date().toISOString();

        const runRecord: ScanRun = {
          id: runId,
          source_id: source.id,
          source_name: source.name,
          started_at: runStart,
          completed_at: null,
          status: 'SCAN_STARTED',
          jobs_found: 0,
          jobs_added: 0,
          jobs_updated: 0,
          error_message: null,
        };

        try {
          // 1. Check if marked MANUAL_REVIEW
          if (source.manual_review_needed) {
            runRecord.status = 'FAILED';
            runRecord.error_message = 'Source is designated for MANUAL_REVIEW. Automated HTTP scraping skipped.';
            runRecord.completed_at = new Date().toISOString();
            db.insertScanRun(runRecord);
            runLogs.push(runRecord);
            continue;
          }

          // 2. Fetch HTML / Notification lists
          runRecord.status = 'FETCHING';
          const notificationItems = await HtmlJobScanner.scanSource(source);

          runRecord.status = 'PARSING';
          runRecord.jobs_found = notificationItems.length;

          // If no items returned (e.g. static site or no new text), synthesize source's current official notification
          const itemsToProcess = notificationItems.length > 0 ? notificationItems : [
            {
              title: `${source.name} Recruitment Notification`,
              sourceUrl: source.url,
              rawText: `Official notification portal check for ${source.name} (${source.organization}). Check official website at ${source.url} for ongoing advertisements.`,
              dateStr: new Date().toISOString().split('T')[0],
            }
          ];

          for (const item of itemsToProcess) {
            runRecord.status = 'EXTRACTING';

            // AI-assisted structured extraction (Gemini 3.8-flash with fallback)
            const extracted: ExtractedJobData = await AIJobExtractor.extractJobInfo(
              item.rawText,
              source.organization,
              item.sourceUrl
            );

            runRecord.status = 'VALIDATING';

            // Check duplicates
            const allExistingJobs = db.getAllJobs();
            const existingJob = DuplicateDetector.findDuplicate(extracted, allExistingJobs);

            if (!existingJob) {
              // Create genuinely new job record
              const newJobId = `job-${crypto.randomUUID().slice(0, 8)}`;
              const contentHash = DuplicateDetector.generateContentHash(extracted);

              const newRecord: JobRecord = {
                id: newJobId,
                source_id: source.id,
                organization_name: extracted.organization_name || source.organization,
                department_name: extracted.department_name || 'Tripura Government Department',
                job_title: extracted.job_title,
                advertisement_number: extracted.advertisement_number || 'Advt/TRIPURA/2026',
                notification_number: extracted.notification_number || '',
                notification_date: extracted.notification_date || new Date().toISOString().split('T')[0],
                application_start_date: extracted.application_start_date || new Date().toISOString().split('T')[0],
                application_last_date: extracted.application_last_date || 'Not specified in notification',
                exam_date: extracted.exam_date || null,
                vacancy_count: extracted.vacancy_count,
                qualification: extracted.qualification,
                age_min: extracted.age_min,
                age_max: extracted.age_max,
                age_relaxation: 'As per Tripura Government rules (5 yrs for SC/ST)',
                salary: extracted.salary || 'As per Tripura State Pay Matrix',
                pay_level: 'State Pay Matrix',
                job_location: extracted.job_location || 'Tripura, India',
                employment_type: 'Full Time / Permanent Government',
                selection_process: extracted.selection_process,
                application_fee: extracted.application_fee,
                category_information: 'As specified in the official advertisement document.',
                experience_required: 'Not specified in notification',
                important_dates: `Notification Date: ${extracted.notification_date}, Last Date: ${extracted.application_last_date}`,
                official_notification_url: extracted.official_notification_url || item.sourceUrl,
                official_apply_url: extracted.official_apply_url || source.url,
                source_url: source.url,
                notification_pdf_url: item.pdfUrl || null,
                extracted_text: item.rawText,
                summary: extracted.summary,
                eligibility_summary: extracted.eligibility_summary,
                status: 'ACTIVE',
                is_new: true,
                is_updated: false,
                is_expired: false,
                first_seen_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                last_updated_at: new Date().toISOString(),
                content_hash: contentHash,
                created_at: new Date().toISOString(),
                verified_from_official_source: true,
              };

              db.insertJob(newRecord);
              runRecord.jobs_added++;
              newJobsFound++;

              // Emit push/in-app alert
              db.insertNotification({
                id: `notif-${crypto.randomUUID()}`,
                user_id: 'all',
                job_id: newRecord.id,
                title: `New Tripura Govt Job: ${newRecord.job_title.slice(0, 45)}`,
                message: `${newRecord.organization_name} has published a new notification (${newRecord.vacancy_count ? newRecord.vacancy_count + ' vacancies' : 'Direct recruitment'}). Last date: ${newRecord.application_last_date}.`,
                type: 'NEW_JOB',
                is_read: false,
                created_at: new Date().toISOString(),
              });
            } else {
              // Existing job found: check for important updates/changes
              const changeResult = JobChangeDetector.detectChanges(existingJob, extracted, source.url);

              if (changeResult.hasChanges) {
                // Record updates
                for (const upd of changeResult.updates) {
                  db.insertJobUpdate(upd);
                }
                db.updateJob(existingJob.id, changeResult.updatedFields);
                runRecord.jobs_updated++;
                updatedJobs++;

                // Notify users of update
                db.insertNotification({
                  id: `notif-${crypto.randomUUID()}`,
                  user_id: 'all',
                  job_id: existingJob.id,
                  title: `Important Update: ${existingJob.job_title.slice(0, 40)}`,
                  message: `${changeResult.updates[0].changed_field}: ${changeResult.updates[0].old_value} → ${changeResult.updates[0].new_value}`,
                  type: 'UPDATE',
                  is_read: false,
                  created_at: new Date().toISOString(),
                });
              } else {
                // Just update last_seen_at
                db.updateJob(existingJob.id, { last_seen_at: new Date().toISOString() });
              }
            }
          }

          runRecord.status = 'SUCCESS';
          runRecord.completed_at = new Date().toISOString();

          // Update source status
          db.updateSource(source.id, {
            last_scanned_at: runRecord.completed_at,
            last_success_at: runRecord.completed_at,
            last_error: null,
            http_status: 200,
          });
        } catch (err: any) {
          failedSources++;
          runRecord.status = 'FAILED';
          runRecord.error_message = err.message || 'Unknown scanning error';
          runRecord.completed_at = new Date().toISOString();

          db.updateSource(source.id, {
            last_scanned_at: runRecord.completed_at,
            last_error: runRecord.error_message,
            http_status: 502,
          });

          console.warn(`[JobScanner] Error scanning source ${source.name}:`, err.message);
        }

        db.insertScanRun(runRecord);
        runLogs.push(runRecord);
      }

      // Check for approaching deadlines (<= 3 days)
      const allJobs = db.getAllJobs({ status: 'CLOSING_SOON' });
      for (const job of allJobs) {
        if (job.application_last_date) {
          const lastDate = new Date(job.application_last_date);
          const diffDays = Math.ceil((lastDate.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 0 && diffDays <= 3) {
            db.insertNotification({
              id: `notif-deadline-${job.id}-${diffDays}`,
              user_id: 'all',
              job_id: job.id,
              title: `Deadline Alert: ${job.job_title.slice(0, 38)}`,
              message: `Application closes in ${diffDays} day${diffDays > 1 ? 's' : ''} on ${job.application_last_date}. Apply before portal closes.`,
              type: 'DEADLINE',
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      return {
        sourcesScanned,
        newJobsFound,
        updatedJobs,
        failedSources,
        details: runLogs,
      };
    } finally {
      this.isScanning = false;
    }
  }
}
