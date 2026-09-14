export function getVerifiedOfficialApplyUrl(orgName: string, rawUrl?: string, sourceUrl?: string): string {
  const org = (orgName || '').toLowerCase();
  const url = (rawUrl || '').trim();

  if (org.includes('tpsc') || org.includes('public service commission')) {
    return 'https://tpsc.tripura.gov.in/online-application';
  }
  if (org.includes('trbt') || org.includes('teachers') || org.includes('tet')) {
    return 'https://trb.tripura.gov.in';
  }
  if (org.includes('employment') || org.includes('manpower')) {
    return 'https://employment.tripura.gov.in';
  }
  if (org.includes('police')) {
    return 'https://tripurapolice.gov.in/recruitment';
  }
  if (org.includes('health') || org.includes('medical') || org.includes('family welfare')) {
    return 'https://health.tripura.gov.in';
  }
  if (org.includes('high court') || org.includes('thc')) {
    return 'https://thc.nic.in/recruitment';
  }
  if (org.includes('nit') || org.includes('agartala')) {
    return 'https://www.nita.ac.in/faculty-recruitment';
  }
  if (org.includes('rural') || org.includes('mgnrega') || org.includes('grs')) {
    return 'https://rural.tripura.gov.in/online-application-grs';
  }
  if (org.includes('tsecl') || org.includes('electricity') || org.includes('power')) {
    return 'https://www.tsecl.in/recruitment';
  }
  if (org.includes('trlm') || org.includes('livelihood')) {
    return 'https://trlm.tripura.gov.in/apply';
  }
  if (org.includes('social welfare')) {
    return 'https://socialwelfare.tripura.gov.in/careers';
  }
  if (org.includes('krishi') || org.includes('agriculture')) {
    return 'https://krishi.tripura.gov.in/apply';
  }

  if (url && url.startsWith('http') && !url.endsWith('.rss') && !url.endsWith('.xml')) {
    return url;
  }
  if (sourceUrl && sourceUrl.startsWith('http')) {
    return sourceUrl;
  }

  return 'https://employment.tripura.gov.in';
}
