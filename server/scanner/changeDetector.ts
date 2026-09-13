import crypto from 'crypto';
import { JobRecord, ExtractedJobData, JobUpdate } from './types';

export interface ChangeDetectionResult {
  hasChanges: boolean;
  updates: JobUpdate[];
  updatedFields: Partial<JobRecord>;
}

export class JobChangeDetector {
  /**
   * Compares an existing job record against newly extracted data.
   * If meaningful changes exist, records them as JobUpdate entries.
   */
  public static detectChanges(
    existing: JobRecord,
    incoming: ExtractedJobData,
    sourceUrl: string
  ): ChangeDetectionResult {
    const updates: JobUpdate[] = [];
    const updatedFields: Partial<JobRecord> = {};
    const now = new Date().toISOString();

    // 1. Last Date Change (critical for job seekers!)
    if (
      incoming.application_last_date &&
      incoming.application_last_date !== existing.application_last_date &&
      incoming.application_last_date !== 'Not specified in notification'
    ) {
      updates.push({
        id: `upd-${crypto.randomUUID()}`,
        job_id: existing.id,
        changed_field: 'Last Date Extended / Changed',
        old_value: existing.application_last_date,
        new_value: incoming.application_last_date,
        detected_at: now,
        source_url: sourceUrl,
      });
      updatedFields.application_last_date = incoming.application_last_date;
    }

    // 2. Vacancy Count revision
    if (
      incoming.vacancy_count !== null &&
      incoming.vacancy_count !== undefined &&
      incoming.vacancy_count !== existing.vacancy_count
    ) {
      updates.push({
        id: `upd-${crypto.randomUUID()}`,
        job_id: existing.id,
        changed_field: 'Vacancies Revised',
        old_value: existing.vacancy_count !== null ? `${existing.vacancy_count} posts` : 'Not specified',
        new_value: `${incoming.vacancy_count} posts`,
        detected_at: now,
        source_url: sourceUrl,
      });
      updatedFields.vacancy_count = incoming.vacancy_count;
    }

    // 3. Exam Date update
    if (
      incoming.exam_date &&
      incoming.exam_date !== existing.exam_date &&
      incoming.exam_date !== 'Not specified in notification'
    ) {
      updates.push({
        id: `upd-${crypto.randomUUID()}`,
        job_id: existing.id,
        changed_field: 'Exam Date Announced / Rescheduled',
        old_value: existing.exam_date || 'To be announced',
        new_value: incoming.exam_date,
        detected_at: now,
        source_url: sourceUrl,
      });
      updatedFields.exam_date = incoming.exam_date;
    }

    // 4. Official Apply URL updated
    if (
      incoming.official_apply_url &&
      incoming.official_apply_url !== existing.official_apply_url &&
      incoming.official_apply_url !== 'Not specified in notification'
    ) {
      updates.push({
        id: `upd-${crypto.randomUUID()}`,
        job_id: existing.id,
        changed_field: 'Official Apply Portal Activated / Updated',
        old_value: existing.official_apply_url || 'Pending',
        new_value: incoming.official_apply_url,
        detected_at: now,
        source_url: sourceUrl,
      });
      updatedFields.official_apply_url = incoming.official_apply_url;
    }

    // 5. Qualification / Eligibility criteria amended
    if (
      incoming.qualification &&
      incoming.qualification !== existing.qualification &&
      incoming.qualification.length > 5 &&
      incoming.qualification !== 'Not specified in notification'
    ) {
      updates.push({
        id: `upd-${crypto.randomUUID()}`,
        job_id: existing.id,
        changed_field: 'Qualification Criteria Revised',
        old_value: existing.qualification,
        new_value: incoming.qualification,
        detected_at: now,
        source_url: sourceUrl,
      });
      updatedFields.qualification = incoming.qualification;
    }

    if (updates.length > 0) {
      updatedFields.is_updated = true;
      updatedFields.last_updated_at = now;
      updatedFields.last_seen_at = now;
    }

    return {
      hasChanges: updates.length > 0,
      updates,
      updatedFields,
    };
  }
}
