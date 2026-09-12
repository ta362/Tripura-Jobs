import { JobSource } from './types.js';

export interface FetchedNotificationItem {
  title: string;
  sourceUrl: string;
  pdfUrl?: string;
  rawText: string;
  dateStr?: string;
  advtNo?: string;
}

export class HtmlJobScanner {
  private static USER_AGENT = 'TripuraGovtJobScanner/1.0 (+https://tripuragovtjobs.nic.in; official public job scanner)';

  /**
   * Fetches public portal contents with timeout, error isolation, and status tracking.
   */
  public static async scanSource(source: JobSource): Promise<FetchedNotificationItem[]> {
    if (!source.active) {
      return [];
    }

    if (source.manual_review_needed) {
      console.log(`Source ${source.name} is marked as MANUAL_REVIEW. Skipping automated scraping.`);
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

      const response = await fetch(source.url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseHtml(html, source);
    } catch (err: any) {
      const errorMsg = err.name === 'AbortError' ? 'Connection timeout (8s limit)' : err.message || 'Network error';
      throw new Error(`Failed scanning ${source.name}: ${errorMsg}`);
    }
  }

  /**
   * Parses HTML documents for recruitment notices, tables, PDF links, and advertisement notices.
   */
  public static parseHtml(html: string, source: JobSource): FetchedNotificationItem[] {
    const items: FetchedNotificationItem[] = [];

    // Match links with recruitment keywords or PDF files
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    const recruitmentKeywords = [
      'recruitment', 'advertisement', 'notification', 'vacancy', 'post', 'application',
      'interview', 'exam', 'tpsc', 'trbt', 'jrbt', 'advt', 'selection'
    ];

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1].trim();
      const rawAnchorText = match[2].replace(/<[^>]+>/g, '').trim();

      const lowerText = rawAnchorText.toLowerCase();
      const lowerHref = href.toLowerCase();

      const isRecruitmentRelated = recruitmentKeywords.some(
        kw => lowerText.includes(kw) || lowerHref.includes(kw)
      );

      if (isRecruitmentRelated && rawAnchorText.length >= 8 && rawAnchorText.length <= 250) {
        // Resolve absolute URL
        let fullUrl = href;
        try {
          fullUrl = new URL(href, source.url).href;
        } catch {
          fullUrl = source.url;
        }

        const isPdf = href.endsWith('.pdf') || href.includes('.pdf?');

        items.push({
          title: rawAnchorText,
          sourceUrl: fullUrl,
          pdfUrl: isPdf ? fullUrl : undefined,
          rawText: `${rawAnchorText} - Official Notification published on ${source.name} (${source.organization}). Visit ${fullUrl} for comprehensive instructions, eligibility criteria, and application procedure.`,
          dateStr: new Date().toISOString().split('T')[0],
        });
      }
    }

    // Deduplicate discovered links from the page
    const uniqueItems: FetchedNotificationItem[] = [];
    const seenUrls = new Set<string>();

    for (const item of items) {
      if (!seenUrls.has(item.sourceUrl)) {
        seenUrls.add(item.sourceUrl);
        uniqueItems.push(item);
      }
    }

    return uniqueItems.slice(0, 5); // Take top 5 latest notices per source run to respect rate limits
  }
}
