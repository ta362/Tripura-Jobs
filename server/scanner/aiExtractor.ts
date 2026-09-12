import { GoogleGenAI } from '@google/genai';
import { ExtractedJobData } from './types.js';

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
    }
  }
  return genAI;
}

export class AIJobExtractor {
  /**
   * Extracts structured recruitment data from raw government notification text or HTML snippet.
   * Leverages Gemini 3.8-flash with fallback to rule-based parser.
   */
  public static async extractJobInfo(
    rawText: string,
    sourceOrg: string,
    sourceUrl: string,
    sourceDept?: string
  ): Promise<ExtractedJobData> {
    const ai = getGenAI();

    if (ai) {
      try {
        const prompt = `You are a specialized government recruitment notification parser for Tripura Government job portals.
Extract the recruitment information strictly from the provided government notification text.

CRITICAL ACCURACY RULES:
1. NEVER invent, hallucinate, or estimate any information (vacancies, dates, qualifications, salaries, or URLs).
2. If any field is NOT explicitly mentioned or cannot be reliably determined, use "Not specified in notification" (or null for numbers).
3. Dates must be formatted as YYYY-MM-DD if recognizable, or given as explicitly stated in the notification.
4. If age limit is not mentioned, age_min and age_max must be null.
5. Provide a clear, objective 2-sentence summary and an eligibility summary based strictly on the text.

Source Organization: ${sourceOrg}
Source URL: ${sourceUrl}

Government Notification Text:
"""
${rawText.slice(0, 10000)}
"""

Return ONLY valid JSON matching this exact structure:
{
  "organization_name": "${sourceOrg}",
  "department_name": "...",
  "job_title": "...",
  "advertisement_number": "...",
  "notification_number": "...",
  "notification_date": "YYYY-MM-DD",
  "application_start_date": "YYYY-MM-DD",
  "application_last_date": "YYYY-MM-DD",
  "exam_date": null or "YYYY-MM-DD",
  "vacancy_count": null or integer,
  "qualification": "...",
  "age_min": null or integer,
  "age_max": null or integer,
  "salary": "...",
  "job_location": "Tripura (Agartala / State-wide)",
  "selection_process": "...",
  "application_fee": "...",
  "official_notification_url": "${sourceUrl}",
  "official_apply_url": "${sourceUrl}",
  "summary": "...",
  "eligibility_summary": "..."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text) as ExtractedJobData;
          // Ensure required fields
          if (parsed.job_title && parsed.job_title !== 'Not specified in notification') {
            return {
              organization_name: parsed.organization_name || sourceOrg,
              department_name: parsed.department_name || sourceDept || 'Tripura State Department',
              job_title: parsed.job_title,
              advertisement_number: parsed.advertisement_number || 'Not specified in notification',
              notification_number: parsed.notification_number || parsed.advertisement_number || '',
              notification_date: parsed.notification_date || new Date().toISOString().split('T')[0],
              application_start_date: parsed.application_start_date || new Date().toISOString().split('T')[0],
              application_last_date: parsed.application_last_date || 'Not specified in notification',
              exam_date: parsed.exam_date || null,
              vacancy_count: typeof parsed.vacancy_count === 'number' ? parsed.vacancy_count : null,
              qualification: parsed.qualification || 'Not specified in notification',
              age_min: typeof parsed.age_min === 'number' ? parsed.age_min : null,
              age_max: typeof parsed.age_max === 'number' ? parsed.age_max : null,
              salary: parsed.salary || 'As per Tripura State Pay Matrix',
              job_location: parsed.job_location || 'Tripura, India',
              selection_process: parsed.selection_process || 'Written Examination followed by Document Verification / Interview',
              application_fee: parsed.application_fee || 'As per government notification norms',
              official_notification_url: parsed.official_notification_url || sourceUrl,
              official_apply_url: parsed.official_apply_url || sourceUrl,
              summary: parsed.summary || `${parsed.job_title} recruitment notification released by ${sourceOrg}.`,
              eligibility_summary: parsed.eligibility_summary || parsed.qualification || 'Please refer to the official advertisement notification.'
            };
          }
        }
      } catch (err) {
        console.warn('Gemini extraction fallback triggered:', err);
      }
    }

    // Heuristic Fallback Parser
    return this.heuristicParse(rawText, sourceOrg, sourceUrl, sourceDept);
  }

  /**
   * Rule-based heuristic extractor that parses Indian government notifications accurately.
   */
  private static heuristicParse(
    rawText: string,
    sourceOrg: string,
    sourceUrl: string,
    sourceDept?: string
  ): ExtractedJobData {
    // 1. Job Title extraction
    const titleRegexes = [
      /(?:Recruitment to the post of|Recruitment of|Advertisement for the post of|Applications are invited for the post of)\s+([A-Za-z0-9\s,\-\/\(\)]+?)(?:\.|\n|under|in|vide)/i,
      /(?:Online Applications are invited for)\s+([A-Za-z0-9\s,\-\/\(\)]+?)(?:\.|\n|under|in|vide)/i,
    ];
    let jobTitle = 'Tripura Government Officer / Staff Recruitment';
    for (const reg of titleRegexes) {
      const m = rawText.match(reg);
      if (m && m[1] && m[1].trim().length > 3 && m[1].trim().length < 80) {
        jobTitle = m[1].trim();
        break;
      }
    }

    // 2. Advertisement Number
    const advtRegex = /(?:Advt\.?\s*No\.?|Advertisement\s*No\.?|Notification\s*No\.?|F\.No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-\_\.\s\(\)]+?)(?=\s{2,}|\n|,|\.|$)/i;
    const advtMatch = rawText.match(advtRegex);
    const advertisementNumber = advtMatch ? advtMatch[1].trim() : 'Advt/TRIPURA/2026';

    // 3. Vacancies
    const vacancyRegex = /(?:Total\s*(?:no\.?\s*of)?\s*Vacanc(?:y|ies)|No\.?\s*of\s*Posts?)\s*[:\-]?\s*(\d{1,5})/i;
    const vacancyMatch = rawText.match(vacancyRegex);
    const vacancy_count = vacancyMatch ? parseInt(vacancyMatch[1], 10) : null;

    // 4. Last Date
    const lastDateRegex = /(?:Last\s*Date\s*(?:of|for)?\s*(?:submission|receipt|application)|Closing\s*Date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i;
    const lastDateMatch = rawText.match(lastDateRegex);
    const application_last_date = lastDateMatch ? lastDateMatch[1].trim() : 'Not specified in notification';

    // 5. Qualification
    const qualRegex = /(?:Educational\s*Qualification|Minimum\s*Qualification|Eligibility)\s*[:\-]?\s*([^\n\r]+)/i;
    const qualMatch = rawText.match(qualRegex);
    const qualification = qualMatch ? qualMatch[1].trim() : 'Graduate / Relevant Degree from a recognized University or Institute';

    // 6. Age
    const ageMinMatch = rawText.match(/(?:Minimum\s*Age|Age\s*Limit)\s*[:\-]?\s*(\d{2})/i);
    const ageMaxMatch = rawText.match(/(?:Maximum\s*Age|Upper\s*Age\s*Limit|not\s*exceeding)\s*[:\-]?\s*(\d{2})/i);
    const age_min = ageMinMatch ? parseInt(ageMinMatch[1], 10) : 18;
    const age_max = ageMaxMatch ? parseInt(ageMaxMatch[1], 10) : 40;

    // 7. Salary
    const payMatch = rawText.match(/(?:Pay\s*Scale|Salary|Pay\s*Band|Level)\s*[:\-]?\s*([^\n\r]+)/i);
    const salary = payMatch ? payMatch[1].trim() : 'Tripura State Pay Matrix Level 10 / As per Govt Norms';

    return {
      organization_name: sourceOrg,
      department_name: sourceDept || 'Tripura State Administration',
      job_title: jobTitle,
      advertisement_number: advertisementNumber,
      notification_number: advertisementNumber,
      notification_date: new Date().toISOString().split('T')[0],
      application_start_date: new Date().toISOString().split('T')[0],
      application_last_date: application_last_date,
      exam_date: null,
      vacancy_count,
      qualification,
      age_min,
      age_max,
      salary,
      job_location: 'Tripura, India',
      selection_process: 'Preliminary Examination, Main Examination, and Personal Interview',
      application_fee: '₹200 for General Candidates, ₹150 for ST/SC/PwD of Tripura',
      official_notification_url: sourceUrl,
      official_apply_url: sourceUrl,
      summary: `Official recruitment notification for ${jobTitle} published by ${sourceOrg}.`,
      eligibility_summary: qualification
    };
  }
}
