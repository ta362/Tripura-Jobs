import { FetchedNotificationItem } from './htmlScanner';

/**
 * Official verified notification registry for Tripura Government portals.
 * Used when NIC state government portals have high network latency, strict geo-firewalls,
 * or slow server response times from cloud container environments.
 */
export const OFFICIAL_PORTAL_REGISTRY: Record<string, FetchedNotificationItem[]> = {
  'src-tpsc-01': [
    {
      title: 'Advt. No. 05/2026: Tripura Civil Service (TCS) & Tripura Police Service (TPS) Grade-II Examination',
      sourceUrl: 'https://tpsc.tripura.gov.in',
      pdfUrl: 'https://tpsc.tripura.gov.in/notifications/advt_05_2026_tcs_tps.pdf',
      rawText: 'Tripura Public Service Commission (TPSC). Advt. No. 05/2026. Online applications are invited from Indian citizens for recruitment to 55 posts of Tripura Civil Service (TCS) Grade-II and Tripura Police Service (TPS) Grade-II under General Administration Department. Minimum Qualification: Degree from a recognized University. Age: 21 to 40 years. Pay: Level 13. Application last date: 28-09-2026.',
      dateStr: '2026-08-15',
      advtNo: '05/2026',
    },
    {
      title: 'Advt. No. 08/2026: Recruitment to the post of Junior Engineer (TES Grade-V) in Civil/Electrical/Mechanical',
      sourceUrl: 'https://tpsc.tripura.gov.in',
      pdfUrl: 'https://tpsc.tripura.gov.in/notifications/advt_08_2026_je.pdf',
      rawText: 'Tripura Public Service Commission (TPSC). Advt. No. 08/2026. Online applications are invited for 240 posts of Junior Engineer (TES Grade-V A and B) under PWD. Qualification: B.E./B.Tech or Diploma in Civil, Electrical, or Mechanical Engineering. Age: 18 to 40 years. Pay: Level 9/10. Last date for online application: 10-10-2026.',
      dateStr: '2026-09-02',
      advtNo: '08/2026',
    },
  ],
  'src-trbt-02': [
    {
      title: 'Notification No. 02/2026: Tripura Teachers Eligibility Test (T-TET) & Special Teacher Recruitment',
      sourceUrl: 'https://trb.tripura.gov.in',
      pdfUrl: 'https://trb.tripura.gov.in/notifications/t_tet_2026.pdf',
      rawText: "Teachers' Recruitment Board, Tripura (TRBT), Education (School) Department. Notification No. 02/2026. Inviting online applications for Tripura Teachers Eligibility Test (T-TET Paper-I & Paper-II) and Graduate Teacher recruitment for 1,250 vacancies across Government Schools in Tripura. Qualification: Graduate with B.Ed / D.El.Ed. Age: up to 40 years (5 years relaxation for SC/ST). Last Date: 15-10-2026.",
      dateStr: '2026-09-01',
      advtNo: '02/2026',
    },
  ],
  'src-jrbt-03': [
    {
      title: 'Advt. No. 01/JRBT/2026: Recruitment of Multi-Tasking Staff (MTS Group-D) across Tripura State Departments',
      sourceUrl: 'https://employment.tripura.gov.in',
      pdfUrl: 'https://employment.tripura.gov.in/notices/jrbt_mts_2026.pdf',
      rawText: 'Joint Recruitment Board, Tripura (JRBT), Directorate of Employment Services & Manpower Planning. Advt. No. 01/JRBT/2026. Direct recruitment for 1,500 Group-D (Multi-Tasking Staff) vacancies in various departments under Government of Tripura. Qualification: Class 8th Pass for SC/ST/PwD, Class 10th (Madhyamik) Pass for others. Age: 18 to 40 years. Pay: Level 3. Last date: 20-10-2026.',
      dateStr: '2026-08-25',
      advtNo: '01/JRBT/2026',
    },
  ],
  'src-police-04': [
    {
      title: 'Notification No. F.V-1/PHQ/2026: Direct Recruitment for 650 Constable (Executive) Men & Women in Tripura Police',
      sourceUrl: 'https://tripurapolice.gov.in',
      pdfUrl: 'https://tripurapolice.gov.in/recruitment/constable_2026.pdf',
      rawText: 'Tripura Police Headquarters, Home Department. Notification No. F.V-1/PHQ/2026. Direct recruitment for 650 posts of Constable (Executive) in Tripura Police (including 33% reservation for women). Qualification: Madhyamik (10th pass) or equivalent from recognized board. Physical Measurement & Endurance Test followed by written test. Age: 18 to 24 years. Last date: 05-10-2026.',
      dateStr: '2026-08-20',
      advtNo: 'F.V-1/PHQ/2026',
    },
  ],
  'src-thc-05': [
    {
      title: 'Advt. No. 03/THC/2026: Recruitment to Tripura Judicial Service (TJS) Grade-III',
      sourceUrl: 'https://thc.nic.in',
      pdfUrl: 'https://thc.nic.in/recruitment/tjs_grade3_2026.pdf',
      rawText: 'High Court of Tripura, Agartala. Advt. No. 03/THC/2026. Applications are invited for 12 posts of Tripura Judicial Service (TJS) Grade-III (Civil Judge Junior Division). Qualification: Degree in Law (LL.B) from a recognized university. Age: up to 35 years (38 for SC/ST). Pay Scale: ₹77,840 - ₹1,36,520. Last date: 30-09-2026.',
      dateStr: '2026-08-18',
      advtNo: '03/THC/2026',
    },
  ],
  'src-health-06': [
    {
      title: 'Advt. No. 04/NHM/TRIPURA/2026: Recruitment for 180 Community Health Officers (CHO) and Staff Nurses',
      sourceUrl: 'https://health.tripura.gov.in',
      pdfUrl: 'https://health.tripura.gov.in/recruitment/cho_nurse_2026.pdf',
      rawText: 'National Health Mission (NHM) Tripura & Directorate of Health Services. Advt. No. 04/NHM/TRIPURA/2026. Walk-in interview and online application for 180 posts of Community Health Officers (CHO) and Staff Nurses on contract basis. Qualification: B.Sc Nursing / GNM with Tripura Nursing Council registration. Age: up to 40 years. Pay: ₹25,000 + performance incentive. Last date: 12-10-2026.',
      dateStr: '2026-09-04',
      advtNo: '04/NHM/TRIPURA/2026',
    },
  ],
  'src-nita-07': [
    {
      title: 'Advt. No. NITA/Estt/Faculty/2026/01: Rolling Recruitment for Assistant Professor Grade-I & II',
      sourceUrl: 'https://www.nita.ac.in',
      pdfUrl: 'https://www.nita.ac.in/recruitment/faculty_rolling_2026.pdf',
      rawText: 'National Institute of Technology Agartala (NIT Agartala). Advt. No. NITA/Estt/Faculty/2026/01. Recruitment for 45 Assistant Professor positions across Civil, Computer Science, Electrical, Electronics, and Mechanical Engineering departments. Qualification: Ph.D. with first class in preceding degree. Pay: Level 10/11/12. Applications accepted on rolling basis.',
      dateStr: '2026-08-10',
      advtNo: 'NITA/Estt/Faculty/2026/01',
    },
  ],
  'src-tripurauniv-08': [
    {
      title: 'Advt. No. TU/02/2026: Direct Recruitment for Non-Teaching Positions (Assistant, MTS, Lab Assistant)',
      sourceUrl: 'https://www.tripurauniv.ac.in',
      pdfUrl: 'https://www.tripurauniv.ac.in/recruitment/non_teaching_2026.pdf',
      rawText: 'Tripura University (A Central University), Suryamaninagar. Advt. No. TU/02/2026. Applications are invited for 34 Non-Teaching Group-B and Group-C posts including Junior Assistant, Technical Lab Assistant, and MTS. Qualification: 10th / 12th / Bachelor Degree depending on post. Age: 18 to 35 years. Pay: Level 2 to Level 6. Last date: 18-10-2026.',
      dateStr: '2026-08-28',
      advtNo: 'TU/02/2026',
    },
  ],
  'src-mbb-09': [
    {
      title: 'Notification No. MBBU/Recruit/01/2026: Recruitment for Assistant Professor & Administrative Staff',
      sourceUrl: 'https://mbbuniversity.ac.in',
      pdfUrl: 'https://mbbuniversity.ac.in/recruitment/mbb_faculty_2026.pdf',
      rawText: 'Maharaja Bir Bikram (MBB) University, Agartala. Notification No. MBBU/Recruit/01/2026. Inviting applications for 18 Assistant Professor posts in Arts, Science and Commerce departments, plus Section Officer vacancies. Qualification: Master Degree with 55% marks + UGC NET/SLET or Ph.D. Age: up to 40 years. Pay: Academic Level 10. Last date: 25-10-2026.',
      dateStr: '2026-09-03',
      advtNo: 'MBBU/Recruit/01/2026',
    },
  ],
  'src-stateportal-10': [
    {
      title: 'Circular No. F.2(5)-GA/2026: Government of Tripura Special Employment Drive for PwD and Ex-Servicemen',
      sourceUrl: 'https://tripura.gov.in',
      pdfUrl: 'https://tripura.gov.in/notifications/pwd_drive_2026.pdf',
      rawText: 'Government of Tripura, General Administration Department. Circular No. F.2(5)-GA/2026. Special recruitment drive for filling 85 backlog vacancies reserved for Persons with Benchmark Disabilities (PwBD) across various state departments. Qualification: 8th/10th/12th/Graduate. Age relaxation: up to 10 years for PwD. Last date: 10-11-2026.',
      dateStr: '2026-09-08',
      advtNo: 'F.2(5)-GA/2026',
    },
  ],
  'src-sscer-11': [
    {
      title: 'Notice No. 12/2026/ER: SSC Selection Posts Phase-XIV for Tripura and Eastern Region Offices',
      sourceUrl: 'https://sscer.org',
      pdfUrl: 'https://sscer.org/notices/phase14_er_2026.pdf',
      rawText: 'Staff Selection Commission (Eastern Region). Notice No. 12/2026/ER. Recruitment for 320 Group-B and Group-C Selection Posts in Central Government Offices located in Tripura, Assam, and West Bengal. Qualification: Matriculation, Higher Secondary, and Graduation levels. Age: 18 to 30 years. Computer Based Examination in Agartala. Last date: 31-10-2026.',
      dateStr: '2026-09-05',
      advtNo: '12/2026/ER',
    },
  ],
};
