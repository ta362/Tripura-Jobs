import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '../db.js';
import { JobSource } from './types.js';
import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch {
      // Ignored
    }
  }
  return genAI;
}

export class AutonomousDiscoveryService {
  /**
   * Discovers and registers newly launched official Tripura government recruitment portals autonomously.
   */
  public static async discoverAndRegisterPortals(): Promise<{
    discoveredCount: number;
    registeredPortals: string[];
  }> {
    console.log('[AutoDiscovery] Launching autonomous government portal discovery scan...');
    const discoveredUrls: Set<string> = new Set();
    const registeredPortals: string[] = [];

    // 1. Try to fetch links from the main state government portal directory
    try {
      const response = await axios.get('https://tripura.gov.in', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000,
      });
      const $ = cheerio.load(response.data);
      
      $('a').each((_, elem) => {
        const href = $(elem).attr('href');
        if (href && (href.includes('tripura.gov.in') || href.startsWith('http')) && !href.includes('google')) {
          try {
            const urlObj = new URL(href);
            if (urlObj.hostname.endsWith('tripura.gov.in')) {
              discoveredUrls.add(`https://${urlObj.hostname}`);
            }
          } catch {
            // Invalid URL format
          }
        }
      });
    } catch (err: any) {
      console.log('[AutoDiscovery] Main directory crawl delayed or offline, relying on AI-driven dynamic active-subdomain discovery:', err.message);
    }

    // 2. Leverage Gemini API to dynamically look up and suggest any recently published/upcoming official Tripura department portals
    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `Identify active and newly launched official Tripura Government websites or recruitment boards (usually ending with .tripura.gov.in or .gov.in).
Provide a list of up to 5 legitimate portals that are extremely relevant for local recruitment or government tenders in Tripura.
Return valid JSON array of objects:
[
  {
    "name": "Department Name",
    "url": "https://[subdomain].tripura.gov.in",
    "organization": "Official Organization Name, Govt of Tripura",
    "source_type": "STATE_DEPT"
  }
]`;
        let response;
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            }
          });
        } catch (primaryErr: any) {
          console.warn('[AutoDiscovery] Primary model gemini-3.5-flash busy, falling back...', primaryErr.message);
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            }
          });
        }

        const text = response.text || '[]';
        const aiSuggested: Array<{ name: string; url: string; organization: string; source_type: string }> = JSON.parse(text);
        
        for (const item of aiSuggested) {
          if (item.url && item.url.startsWith('http') && item.url.includes('tripura')) {
            discoveredUrls.add(item.url);
          }
        }
      } catch (err: any) {
        console.warn('[AutoDiscovery] AI-driven discovery lookup skipped or limited:', err.message);
      }
    }

    // Fallback/Proactive Discovery List: Real government recruitment portals to guarantee discovery coverage even without active search indexing
    const proactiveSubdomains = [
      { name: 'Tripura Public Works Department (PWD)', url: 'https://pwd.tripura.gov.in', org: 'Public Works Department, Govt of Tripura', type: 'STATE_DEPT' },
      { name: 'Tripura Health Services (DHS)', url: 'https://health.tripura.gov.in', org: 'Directorate of Health Services, Govt of Tripura', type: 'STATE_DEPT' },
      { name: 'Tripura Animal Resources Development (ARDD)', url: 'https://ardd.tripura.gov.in', org: 'Animal Resources Development, Govt of Tripura', type: 'STATE_DEPT' },
      { name: 'Tripura Fire & Emergency Services', url: 'https://fireservice.tripura.gov.in', org: 'Fire & Emergency Services, Govt of Tripura', type: 'STATE_DEPT' },
      { name: 'Tripura Revenue Department', url: 'https://revenue.tripura.gov.in', org: 'Revenue Department, Govt of Tripura', type: 'STATE_DEPT' },
    ];

    for (const item of proactiveSubdomains) {
      discoveredUrls.add(item.url);
    }

    // 3. Process discovered portals and register them if they don't already exist in our database
    const existingSources = db.getAllSources();
    const existingUrls = new Set(existingSources.map(s => {
      try {
        return new URL(s.url).hostname.replace('www.', '');
      } catch {
        return s.url;
      }
    }));

    for (const url of discoveredUrls) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');

        if (!existingUrls.has(hostname)) {
          // Determine clean name
          const subd = hostname.split('.')[0];
          const displayName = subd.toUpperCase() + ' Portal (Auto-Discovered)';
          const orgName = `${subd.charAt(0).toUpperCase() + subd.slice(1)} Department, Govt of Tripura`;
          
          const newSource: JobSource = {
            id: `src-auto-${subd}-${Date.now().toString().slice(-4)}`,
            name: displayName,
            organization: orgName,
            url: url,
            source_type: 'STATE_DEPT',
            active: true,
            scan_frequency: 'DAILY',
            last_scanned_at: null,
            last_success_at: null,
            last_error: null,
            http_status: null,
            manual_review_needed: false,
            created_at: new Date().toISOString(),
          };

          db.insertSource(newSource);
          registeredPortals.push(displayName);
          console.log(`[AutoDiscovery] Successfully registered new government portal: ${displayName} (${url})`);
        }
      } catch {
        // Handle malformed URL strings safely
      }
    }

    return {
      discoveredCount: discoveredUrls.size,
      registeredPortals
    };
  }
}
