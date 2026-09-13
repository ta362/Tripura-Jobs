import crypto from 'crypto';
import { JobRecord, ExtractedJobData } from './types.js';

export class DuplicateDetector {
  /**
   * Generates a stable content hash from core notification identifiers.
   */
  public static generateContentHash(data: Partial<JobRecord> | ExtractedJobData): string {
    const normOrg = (data.organization_name || '').trim().toLowerCase();
    const normAdvt = (data.advertisement_number || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const normTitle = (data.job_title || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const normDate = (data.notification_date || '').trim();
    const normUrl = (data.official_notification_url || ('source_url' in data ? (data as any).source_url : '') || '').trim().toLowerCase();

    const rawString = `${normOrg}::${normAdvt}::${normTitle}::${normDate}::${normUrl}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
  }

  /**
   * Evaluates whether an incoming extracted job matches an existing job in the database.
   * Returns matching JobRecord if found, null otherwise.
   */
  public static findDuplicate(
    incoming: ExtractedJobData,
    existingJobs: JobRecord[]
  ): JobRecord | null {
    const incomingAdvt = (incoming.advertisement_number || '').trim().toLowerCase();
    const incomingTitle = (incoming.job_title || '').trim().toLowerCase();
    const incomingOrg = (incoming.organization_name || '').trim().toLowerCase();
    const incomingPdf = (incoming.official_notification_url || '').trim().toLowerCase();

    // 1. Direct Content Hash match
    const incomingHash = this.generateContentHash(incoming);
    const hashMatch = existingJobs.find(j => j.content_hash === incomingHash);
    if (hashMatch) return hashMatch;

    // 2. Strict Advertisement Number + Organization match (if advt number is valid and not generic)
    if (incomingAdvt && incomingAdvt !== 'not specified' && incomingAdvt !== 'n/a' && incomingAdvt.length >= 4) {
      const advtMatch = existingJobs.find(j => {
        const existingAdvt = (j.advertisement_number || '').trim().toLowerCase();
        const existingOrg = (j.organization_name || '').trim().toLowerCase();
        return existingAdvt === incomingAdvt && (existingOrg.includes(incomingOrg) || incomingOrg.includes(existingOrg));
      });
      if (advtMatch) return advtMatch;
    }

    // 3. Official PDF / Notification URL exact match
    if (incomingPdf && incomingPdf.startsWith('http')) {
      const urlMatch = existingJobs.find(j => {
        const existingPdf = (j.official_notification_url || j.notification_pdf_url || '').trim().toLowerCase();
        return existingPdf === incomingPdf;
      });
      if (urlMatch) return urlMatch;
    }

    // 4. Normalized Job Title + Organization + Notification Date match
    const titleMatch = existingJobs.find(j => {
      const matchOrg = j.organization_name.toLowerCase().includes(incomingOrg) || incomingOrg.includes(j.organization_name.toLowerCase());
      const matchTitle = j.job_title.toLowerCase() === incomingTitle;
      const matchDate = !incoming.notification_date || j.notification_date === incoming.notification_date;
      return matchOrg && matchTitle && matchDate;
    });

    return titleMatch || null;
  }
}
