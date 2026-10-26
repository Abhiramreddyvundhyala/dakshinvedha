-- ============================================================================
-- DAKSHINVEDHA PORTAL — COMPLETE DATABASE RESET & FRESH UNIVERSITY SEED
-- ============================================================================
-- INSTRUCTIONS FOR RUNNING:
-- 1. Open Supabase Dashboard -> SQL Editor -> New Query.
-- 2. Paste this entire script into the editor and click "Run".
--
-- WHAT THIS SCRIPT DOES:
-- 1. PRESERVES existing admin credentials and profiles (role = 'admin').
-- 2. PURGES all student, partner/B2B, and applicant accounts from auth.users and profiles.
-- 3. TRUNCATES all operational transactional data:
--    - Applications, qualifications, timeline, notes, drafts
--    - Student profiles, tests, education, documents, notes
--    - Partner organizations, B2B access requests
--    - Chat conversations, messages, participants
--    - Portal mails, notices, notifications
--    - Enquiries, commission ledger, vouchers, VAS requests, account history
-- 4. RESETS the course and institution catalog cleanly.
-- 5. RESETS tracking counters so fresh registrations start at DV-*-2026-10001.
-- 6. INSERTS 5 world-class universities (UK, Canada, Australia, Ireland, USA).
-- 7. INSERTS 4 comprehensive courses per university (20 complete courses).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- STEP 1: PURGE ALL TRANSACTIONAL DATA & CHILD TABLES
-- ----------------------------------------------------------------------------

-- Disable triggers temporarily on public tables to avoid cascade interference
SET session_replication_role = 'replica';

-- Truncate application-related tables
TRUNCATE TABLE 
  public.application_notes,
  public.application_timeline,
  public.application_documents,
  public.application_qualifications,
  public.applications,
  public.application_drafts
CASCADE;

-- Truncate student-related tables
TRUNCATE TABLE 
  public.student_notes,
  public.student_documents,
  public.student_tests,
  public.student_education,
  public.students
CASCADE;

-- Truncate communications, operations & finance
TRUNCATE TABLE 
  public.chat_messages,
  public.chat_participants,
  public.chat_conversations,
  public.mails,
  public.notices,
  public.notifications,
  public.enquiries,
  public.commission_ledger,
  public.vouchers,
  public.vas_requests,
  public.account_history,
  public.b2b_access_requests,
  public.partners,
  public.otp_challenges
CASCADE;

-- Truncate catalog tables
TRUNCATE TABLE 
  public.courses,
  public.institutions
CASCADE;

-- Re-enable normal trigger execution
SET session_replication_role = 'origin';

-- ----------------------------------------------------------------------------
-- STEP 2: REMOVE ALL NON-ADMIN AUTH USERS & PROFILES
-- ----------------------------------------------------------------------------

-- Remove student records that may have been created for admins
DELETE FROM public.students 
WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Delete non-admin users from auth.users (cascades to their public.profiles)
DELETE FROM auth.users
WHERE id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'admin'
);

-- Delete any non-admin profiles that might not have had an auth.users record
DELETE FROM public.profiles
WHERE role != 'admin';

-- Ensure all remaining admin profiles are active
UPDATE public.profiles
SET status = 'Active',
    updated_at = now()
WHERE role = 'admin';

-- ----------------------------------------------------------------------------
-- STEP 3: RESET TRACKING COUNTERS
-- ----------------------------------------------------------------------------
UPDATE public.tracking_counters 
SET last_value = 10000;

-- ----------------------------------------------------------------------------
-- STEP 4: SEED 5 PRESTIGIOUS UNIVERSITIES
-- ----------------------------------------------------------------------------

-- 1. University of Oxford (UK)
INSERT INTO public.institutions (
  id, name, country, city, logo, image, website, about, intakes, representative, created_at, updated_at
) VALUES (
  'uni-oxford',
  'University of Oxford',
  'United Kingdom',
  'Oxford',
  'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?w=1200&auto=format&fit=crop&q=80',
  'https://www.ox.ac.uk',
  'The University of Oxford is a collegiate research university in Oxford, England. It is the oldest university in the English-speaking world and consistently ranks among the top institutions globally. Oxford offers world-renowned academic faculties, historic libraries, and unparalleled research facilities.',
  ARRAY['September 2026', 'January 2027'],
  jsonb_build_object(
    'id', 'rep-oxford-01',
    'name', 'Eleanor Vance',
    'mobile', '+44 7700 900123',
    'phone', '+44 1865 270000',
    'email', 'eleanor.vance@ox.ac.uk',
    'designation', 'Senior International Admissions Officer',
    'whatsapp', '+44 7700 900123',
    'officeHours', 'Mon–Fri, 9:00 AM – 5:00 PM GMT',
    'region', 'UK & Europe'
  ),
  now(),
  now()
);

-- 2. University of Toronto (Canada)
INSERT INTO public.institutions (
  id, name, country, city, logo, image, website, about, intakes, representative, created_at, updated_at
) VALUES (
  'uni-toronto',
  'University of Toronto',
  'Canada',
  'Toronto',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&auto=format&fit=crop&q=80',
  'https://www.utoronto.ca',
  'The University of Toronto is Canada''s premier public research university, leading the nation in innovation, discoveries, and patents. Situated in the heart of North America''s most multicultural tech hub, U of T delivers globally recognized degrees in computer science, business, and biomedical sciences.',
  ARRAY['September 2026', 'January 2027'],
  jsonb_build_object(
    'id', 'rep-toronto-01',
    'name', 'Liam MacDougall',
    'mobile', '+1 416 555 0198',
    'phone', '+1 416 978 2011',
    'email', 'liam.macdougall@utoronto.ca',
    'designation', 'Regional Recruitment Director - Asia Pacific',
    'whatsapp', '+1 416 555 0198',
    'officeHours', 'Mon–Fri, 9:00 AM – 5:00 PM EST',
    'region', 'North America'
  ),
  now(),
  now()
);

-- 3. University of Melbourne (Australia)
INSERT INTO public.institutions (
  id, name, country, city, logo, image, website, about, intakes, representative, created_at, updated_at
) VALUES (
  'uni-melbourne',
  'University of Melbourne',
  'Australia',
  'Melbourne',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
  'https://www.unimelb.edu.au',
  'Ranked #1 in Australia and among the finest in the world, the University of Melbourne is a global leader in higher education. Its distinctive Melbourne Curriculum blends rigorous academics with wide interdisciplinary exploration.',
  ARRAY['February 2026', 'July 2026'],
  jsonb_build_object(
    'id', 'rep-melb-01',
    'name', 'Sarah Jenkins',
    'mobile', '+61 400 123 456',
    'phone', '+61 3 9035 5511',
    'email', 'sarah.jenkins@unimelb.edu.au',
    'designation', 'Senior Liaison Manager - Global Admissions',
    'whatsapp', '+61 400 123 456',
    'officeHours', 'Mon–Fri, 9:00 AM – 5:00 PM AEST',
    'region', 'Australia & Oceania'
  ),
  now(),
  now()
);

-- 4. Trinity College Dublin (Ireland)
INSERT INTO public.institutions (
  id, name, country, city, logo, image, website, about, intakes, representative, created_at, updated_at
) VALUES (
  'uni-tcd',
  'Trinity College Dublin',
  'Ireland',
  'Dublin',
  'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1200&auto=format&fit=crop&q=80',
  'https://www.tcd.ie',
  'Trinity College Dublin is Ireland''s highest ranked university and one of Europe''s elite research centres. Situated in Dublin''s thriving Silicon Docks, students benefit from direct recruitment by Google, Meta, Pfizer, and European financial headquarters.',
  ARRAY['September 2026', 'January 2027'],
  jsonb_build_object(
    'id', 'rep-tcd-01',
    'name', 'Declan O''Connor',
    'mobile', '+353 87 123 4567',
    'phone', '+353 1 896 1000',
    'email', 'declan.oconnor@tcd.ie',
    'designation', 'Regional Advisor for International Partnerships',
    'whatsapp', '+353 87 123 4567',
    'officeHours', 'Mon–Fri, 9:00 AM – 5:00 PM IST',
    'region', 'Ireland & EU'
  ),
  now(),
  now()
);

-- 5. Arizona State University (United States)
INSERT INTO public.institutions (
  id, name, country, city, logo, image, website, about, intakes, representative, created_at, updated_at
) VALUES (
  'uni-asu',
  'Arizona State University',
  'United States',
  'Tempe, Phoenix',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80',
  'https://www.asu.edu',
  'Arizona State University has been recognized as the #1 most innovative university in the United States by U.S. News & World Report for 9 consecutive years. With cutting-edge engineering laboratories, top-ranked business faculties, and strong industry partnerships, ASU is a premier choice for global students.',
  ARRAY['August 2026', 'January 2027', 'May 2027'],
  jsonb_build_object(
    'id', 'rep-asu-01',
    'name', 'Marcus Reynolds',
    'mobile', '+1 480 555 7821',
    'phone', '+1 480 965 9011',
    'email', 'marcus.reynolds@asu.edu',
    'designation', 'Associate Director of Global Student Success',
    'whatsapp', '+1 480 555 7821',
    'officeHours', 'Mon–Fri, 8:30 AM – 5:00 PM MST',
    'region', 'North America'
  ),
  now(),
  now()
);

-- ----------------------------------------------------------------------------
-- STEP 5: SEED COURSES (4 COURSES PER UNIVERSITY = 20 TOTAL)
-- ----------------------------------------------------------------------------

-- ====================
-- OXFORD COURSES (4)
-- ====================
INSERT INTO public.courses (id, university_id, payload, created_at, updated_at)
VALUES 
(
  'crs-oxf-cs',
  'uni-oxford',
  jsonb_build_object(
    'id', 'crs-oxf-cs',
    'universityId', 'uni-oxford',
    'universityName', 'University of Oxford',
    'campus', 'Oxford Main Campus',
    'city', 'Oxford',
    'country', 'United Kingdom',
    'courseName', 'MSc in Advanced Computer Science',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Department of Computer Science',
    'subject', 'Computer Science & AI',
    'duration', '1 Year',
    'tuitionFee', '£36,500 / year',
    'tuitionFeeNum', 36500,
    'applicationFee', '£75',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-03-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'First-class honours degree or equivalent (minimum 75% or 8.0/10 CGPA) in Computer Science or Mathematics.',
      'english', 'IELTS 7.5 overall with minimum 7.0 in each sub-score, or TOEFL 110 (min 22 in each band).',
      'workExperience', 'Not mandatory, but relevant technical research or software engineering experience is favored.'
    ),
    'scholarshipsInfo', 'Clarendon Fund and Oxford-DeepMind Graduate Scholarships cover 100% of tuition plus generous living stipend.',
    'additionalNotes', 'Includes rigorous coursework in formal verification, quantum computing, deep learning, and cryptographic protocols.',
    'commissionRate', '10%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in CS, Math or Software Engineering',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc in CS', 'BCA'),
      'minPercentage', 75,
      'minCgpa', 8.0,
      'maxBacklogs', 0,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL'),
      'minIelts', 7.5,
      'minToefl', 110,
      'minPte', 76,
      'minDuolingo', 135,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', false,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'The University of Oxford is the oldest university in the English-speaking world and ranks #1 globally in computer science research and teaching.'
  ),
  now(), now()
),
(
  'crs-oxf-mba',
  'uni-oxford',
  jsonb_build_object(
    'id', 'crs-oxf-mba',
    'universityId', 'uni-oxford',
    'universityName', 'University of Oxford',
    'campus', 'Saïd Business School',
    'city', 'Oxford',
    'country', 'United Kingdom',
    'courseName', 'Oxford MBA (Master of Business Administration)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Saïd Business School',
    'subject', 'Business & Management',
    'duration', '1 Year',
    'tuitionFee', '£71,440 / year',
    'tuitionFeeNum', 71440,
    'applicationFee', '£150',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-04-05',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'Undergraduate degree with minimum upper second-class honours (65%+) or international equivalent.',
      'english', 'IELTS 7.5 with 7.0 in each component, or TOEFL iBT 110.',
      'workExperience', 'Minimum 2 years of full-time professional managerial or analytical experience.'
    ),
    'scholarshipsInfo', 'Saïd Business School Foundation Scholarships available for up to £30,000 for exceptional international candidates.',
    'additionalNotes', 'Focus on impact finance, entrepreneurship, global strategy, and sustainable enterprise.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in any discipline',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'BBA', 'B.Com', 'BA', 'B.Sc'),
      'minPercentage', 65,
      'minCgpa', 7.0,
      'maxBacklogs', 1,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL'),
      'minIelts', 7.5,
      'minToefl', 110,
      'minPte', 76,
      'minDuolingo', 135,
      'greRequired', true,
      'gmatRequired', true,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', false,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation', 'GMAT / GRE Scorecard')
    ),
    'aboutUniversity', 'Saïd Business School at Oxford blends centuries of academic tradition with modern global commerce and transformative leadership.'
  ),
  now(), now()
),
(
  'crs-oxf-fin',
  'uni-oxford',
  jsonb_build_object(
    'id', 'crs-oxf-fin',
    'universityId', 'uni-oxford',
    'universityName', 'University of Oxford',
    'campus', 'Oxford Main Campus',
    'city', 'Oxford',
    'country', 'United Kingdom',
    'courseName', 'MSc in Financial Economics (MFE)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Department of Economics',
    'subject', 'Finance & Economics',
    'duration', '9 Months',
    'tuitionFee', '£52,560 / year',
    'tuitionFeeNum', 52560,
    'applicationFee', '£100',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-03-15',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'First class or strong upper second class undergraduate degree in economics, finance, math, or quantitative discipline.',
      'english', 'IELTS 7.5 or TOEFL 110.',
      'workExperience', 'Internships or experience in investment banking, asset management, or economic consulting highly valued.'
    ),
    'scholarshipsInfo', 'Merit-based bursaries of up to £25,000 awarded jointly by Saïd Business School and Department of Economics.',
    'additionalNotes', 'Direct placement pipeline to London, New York, and Singapore tier-1 financial institutions.',
    'commissionRate', '10%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in Economics, Math, Statistics or Engineering',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc Math', 'B.Com', 'BA Economics'),
      'minPercentage', 70,
      'minCgpa', 7.5,
      'maxBacklogs', 0,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL'),
      'minIelts', 7.5,
      'minToefl', 110,
      'minPte', 76,
      'minDuolingo', 135,
      'greRequired', true,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', false,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'World-leading curriculum jointly delivered by the Department of Economics and Saïd Business School.'
  ),
  now(), now()
),
(
  'crs-oxf-biomed',
  'uni-oxford',
  jsonb_build_object(
    'id', 'crs-oxf-biomed',
    'universityId', 'uni-oxford',
    'universityName', 'University of Oxford',
    'campus', 'Old Road Campus',
    'city', 'Oxford',
    'country', 'United Kingdom',
    'courseName', 'MSc in Precision Cancer Medicine',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Nuffield Department of Medicine',
    'subject', 'Medicine & Life Sciences',
    'duration', '1 Year',
    'tuitionFee', '£44,120 / year',
    'tuitionFeeNum', 44120,
    'applicationFee', '£75',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-03-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'First class or upper second class honours degree in Medicine, Pharmacy, Biomedical Sciences or Biochemistry.',
      'english', 'IELTS 7.5 or equivalent.',
      'workExperience', 'Clinical or scientific laboratory research experience preferred.'
    ),
    'scholarshipsInfo', 'Cancer Research UK and Nuffield Medical Trust international student fellowships.',
    'additionalNotes', 'Hands-on clinical translational oncology, genomics, immunotherapy, and bio-marker analytics.',
    'commissionRate', '10%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s or MBBS Degree in Medical or Life Sciences',
      'acceptedDegrees', jsonb_build_array('MBBS', 'B.Pharm', 'B.Sc Biotechnology', 'B.Sc Biochemistry'),
      'minPercentage', 68,
      'minCgpa', 7.2,
      'maxBacklogs', 1,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL'),
      'minIelts', 7.5,
      'minToefl', 105,
      'minPte', 70,
      'minDuolingo', 130,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Oxford medical sciences division is internationally lauded for discovering penicillin and developing the Oxford-AstraZeneca COVID vaccine.'
  ),
  now(), now()
);

-- ====================
-- TORONTO COURSES (4)
-- ====================
INSERT INTO public.courses (id, university_id, payload, created_at, updated_at)
VALUES 
(
  'crs-uoft-cs',
  'uni-toronto',
  jsonb_build_object(
    'id', 'crs-uoft-cs',
    'universityId', 'uni-toronto',
    'universityName', 'University of Toronto',
    'campus', 'St. George Campus',
    'city', 'Toronto',
    'country', 'Canada',
    'courseName', 'Master of Science in Applied Computing (MScAC) - Data Science',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Department of Computer Science',
    'subject', 'Data Science & Machine Learning',
    'duration', '16 Months',
    'tuitionFee', 'CAD 62,500 / year',
    'tuitionFeeNum', 62500,
    'applicationFee', 'CAD 125',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-01-15',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'Four-year Bachelor''s degree with B+ standing (77-79% or 3.3/4.0 GPA) in the final two years in CS or quantitative field.',
      'english', 'IELTS 7.0 overall with minimum 6.5 in each section, or TOEFL iBT 93.',
      'workExperience', 'Includes an 8-month paid industrial applied research internship.'
    ),
    'scholarshipsInfo', 'Paid 8-month internship provides CAD 45,000+ average earnings during study.',
    'additionalNotes', 'Partners include Vector Institute, Google Brain, IBM, and Canadian banking data labs.',
    'commissionRate', '14%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '4-Year Bachelor''s Degree in CS, Math or Software Engineering',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc in CS', 'BCA'),
      'minPercentage', 72,
      'minCgpa', 7.5,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 7.0,
      'minToefl', 93,
      'minPte', 65,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'The University of Toronto is the birthplace of modern deep learning and Geoffrey Hinton''s groundbreaking research.'
  ),
  now(), now()
),
(
  'crs-uoft-meng',
  'uni-toronto',
  jsonb_build_object(
    'id', 'crs-uoft-meng',
    'universityId', 'uni-toronto',
    'universityName', 'University of Toronto',
    'campus', 'St. George Campus',
    'city', 'Toronto',
    'country', 'Canada',
    'courseName', 'Master of Engineering (MEng) in Mechanical & Industrial Engineering',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Faculty of Applied Science & Engineering',
    'subject', 'Robotics & Automation',
    'duration', '1 Year',
    'tuitionFee', 'CAD 58,900 / year',
    'tuitionFeeNum', 58900,
    'applicationFee', 'CAD 125',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026', 'January 2027'),
    'applicationDeadline', '2026-03-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', false, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Bachelor''s degree in engineering with at least mid-B standing (73-76% or 3.0/4.0 GPA).',
      'english', 'IELTS 7.0 (with no band under 6.5) or TOEFL 93.',
      'workExperience', 'Professional engineering internship or capstone project experience recommended.'
    ),
    'scholarshipsInfo', 'Faculty of Applied Science & Engineering entrance awards of up to CAD 10,000.',
    'additionalNotes', 'Certificates available in AI engineering, healthcare engineering, robotics, and advanced manufacturing.',
    'commissionRate', '14%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor of Engineering / B.Tech in Mechanical, Production, or Mechatronics',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.'),
      'minPercentage', 70,
      'minCgpa', 7.0,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE'),
      'minIelts', 7.0,
      'minToefl', 93,
      'minPte', 65,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'U of T Engineering is Canada''s oldest and consistently top-ranked engineering school.'
  ),
  now(), now()
),
(
  'crs-uoft-mga',
  'uni-toronto',
  jsonb_build_object(
    'id', 'crs-uoft-mga',
    'universityId', 'uni-toronto',
    'universityName', 'University of Toronto',
    'campus', 'Munk School of Global Affairs',
    'city', 'Toronto',
    'country', 'Canada',
    'courseName', 'Master of Global Affairs (MGA)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Munk School of Global Affairs & Public Policy',
    'subject', 'International Relations & Policy',
    'duration', '2 Years',
    'tuitionFee', 'CAD 45,200 / year',
    'tuitionFeeNum', 45200,
    'applicationFee', 'CAD 110',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-02-15',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Four-year Bachelor''s degree with B+ standing in final two years in social sciences, humanities, or related fields.',
      'english', 'IELTS 7.5 overall with 7.0 in writing and speaking, or TOEFL 100.',
      'workExperience', 'Mandatory summer internship with multilateral organisations, NGOs, or global consultancy firms.'
    ),
    'scholarshipsInfo', 'Munk School Global Fellowships offering CAD 15,000 renewable awards.',
    'additionalNotes', 'Includes overseas study immersion and global policy capstone projects.',
    'commissionRate', '14%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in Social Sciences, Humanities, Law or Commerce',
      'acceptedDegrees', jsonb_build_array('BA', 'BBA', 'B.Com', 'B.Sc'),
      'minPercentage', 65,
      'minCgpa', 6.8,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL'),
      'minIelts', 7.5,
      'minToefl', 100,
      'minPte', 70,
      'minDuolingo', 125,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'The Munk School is an internationally renowned hub for dialogue on geopolitics, international security, and digital governance.'
  ),
  now(), now()
),
(
  'crs-uoft-bcom',
  'uni-toronto',
  jsonb_build_object(
    'id', 'crs-uoft-bcom',
    'universityId', 'uni-toronto',
    'universityName', 'University of Toronto',
    'campus', 'Rotman School of Management',
    'city', 'Toronto',
    'country', 'Canada',
    'courseName', 'Bachelor of Commerce (Rotman Commerce) - Finance & Economics',
    'studyLevel', 'Undergraduate',
    'courseType', 'Full-Time',
    'department', 'Rotman School of Management',
    'subject', 'Commerce & Finance',
    'duration', '4 Years',
    'tuitionFee', 'CAD 60,510 / year',
    'tuitionFeeNum', 60510,
    'applicationFee', 'CAD 180',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-01-15',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'Completion of 12th Grade with strong performance in Mathematics/Calculus (minimum 85%+ overall).',
      'english', 'IELTS 6.5 overall (minimum 6.0 in each band) or TOEFL 100.',
      'workExperience', 'Not required. Supplemental video interview and timed written submission mandatory.'
    ),
    'scholarshipsInfo', 'Lester B. Pearson International Scholarship covering four years of tuition, books, and full residence support.',
    'additionalNotes', 'Triple-crown accredited business programme with direct recruitment on Bay Street and Wall Street.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '12th Standard / Higher Secondary with Calculus/Maths',
      'acceptedDegrees', jsonb_build_array('CBSE 12th', 'ICSE 12th', 'State Board 12th', 'IB Diploma', 'A-Levels'),
      'minPercentage', 85,
      'minCgpa', 8.5,
      'maxBacklogs', 0,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 100,
      'minPte', 65,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Rotman Commerce combines the academic rigor of the University of Toronto with the elite business networks of Bay Street.'
  ),
  now(), now()
),

-- ====================
-- MELBOURNE COURSES (4)
-- ====================
(
  'crs-unimelb-it',
  'uni-melbourne',
  jsonb_build_object(
    'id', 'crs-unimelb-it',
    'universityId', 'uni-melbourne',
    'universityName', 'University of Melbourne',
    'campus', 'Parkville Campus',
    'city', 'Melbourne',
    'country', 'Australia',
    'courseName', 'Master of Information Technology (Cyber Security)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'School of Computing and Information Systems',
    'subject', 'Cyber Security & Cloud',
    'duration', '2 Years',
    'tuitionFee', 'AUD 51,200 / year',
    'tuitionFeeNum', 51200,
    'applicationFee', 'AUD 100',
    'activeIntake', 'February 2026',
    'availableIntakes', jsonb_build_array('February 2026', 'July 2026'),
    'applicationDeadline', '2025-11-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'An undergraduate degree with at least 65% weighted average mark, including at least one computer programming subject.',
      'english', 'IELTS 6.5 overall (no band below 6.0) or PTE 58.',
      'workExperience', 'Not mandatory. Prior IT industry experience can qualify for advanced standing of up to 50 credits.'
    ),
    'scholarshipsInfo', 'Melbourne International Graduate Scholarship providing 25% to 50% tuition remission.',
    'additionalNotes', 'Accredited at the Professional Level by the Australian Computer Society (ACS). Post-study work visa eligible.',
    'commissionRate', '15%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in any field with programming subject',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'BCA', 'B.Sc in IT', 'B.Sc in CS'),
      'minPercentage', 65,
      'minCgpa', 6.5,
      'maxBacklogs', 3,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 79,
      'minPte', 58,
      'minDuolingo', 115,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'The University of Melbourne has led Australian higher education for over 170 years and ranks #13 globally in QS 2025.'
  ),
  now(), now()
),
(
  'crs-unimelb-mgmt',
  'uni-melbourne',
  jsonb_build_object(
    'id', 'crs-unimelb-mgmt',
    'universityId', 'uni-melbourne',
    'universityName', 'University of Melbourne',
    'campus', 'Parkville Campus',
    'city', 'Melbourne',
    'country', 'Australia',
    'courseName', 'Master of Management (Marketing)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Melbourne Business School',
    'subject', 'Marketing & Strategy',
    'duration', '2 Years',
    'tuitionFee', 'AUD 49,800 / year',
    'tuitionFeeNum', 49800,
    'applicationFee', 'AUD 100',
    'activeIntake', 'February 2026',
    'availableIntakes', jsonb_build_array('February 2026', 'July 2026'),
    'applicationDeadline', '2025-11-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'An undergraduate degree in any discipline with a minimum weighted average of 65%.',
      'english', 'IELTS 7.0 overall with no band less than 6.5, or PTE 65.',
      'workExperience', 'No prior business work experience required; designed for conversion candidates.'
    ),
    'scholarshipsInfo', 'Commerce International Scholarship providing AUD 10,000 for top incoming applicants.',
    'additionalNotes', 'Includes real-world business consulting practicum with Australian corporate sponsors.',
    'commissionRate', '15%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in any discipline',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'BBA', 'B.Com', 'BA', 'B.Sc'),
      'minPercentage', 65,
      'minCgpa', 6.5,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE'),
      'minIelts', 7.0,
      'minToefl', 88,
      'minPte', 65,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Melbourne Business School holds dual AACSB and EQUIS accreditation and ranks among Asia-Pacific top business institutions.'
  ),
  now(), now()
),
(
  'crs-unimelb-biomed',
  'uni-melbourne',
  jsonb_build_object(
    'id', 'crs-unimelb-biomed',
    'universityId', 'uni-melbourne',
    'universityName', 'University of Melbourne',
    'campus', 'Parkville Campus',
    'city', 'Melbourne',
    'country', 'Australia',
    'courseName', 'Master of Biomedical Engineering',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Faculty of Engineering and IT',
    'subject', 'Biomedical Devices & Health Tech',
    'duration', '3 Years',
    'tuitionFee', 'AUD 52,600 / year',
    'tuitionFeeNum', 52600,
    'applicationFee', 'AUD 100',
    'activeIntake', 'February 2026',
    'availableIntakes', jsonb_build_array('February 2026', 'July 2026'),
    'applicationDeadline', '2025-11-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Bachelor of Science or Engineering with relevant university-level math, chemistry, and physics.',
      'english', 'IELTS 6.5 (min 6.0 in all bands) or TOEFL 79.',
      'workExperience', 'Not mandatory. Students with a relevant 4-year engineering degree may receive up to 1 year of credit exemption.'
    ),
    'scholarshipsInfo', 'Dean''s International Scholarship covering up to 50% of annual course fees.',
    'additionalNotes', 'Accredited by Engineers Australia and EUR-ACE (European Engineering Accreditation).',
    'commissionRate', '15%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s in Engineering, Biotechnology, Physics or Life Sciences',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc Biotechnology'),
      'minPercentage', 65,
      'minCgpa', 6.5,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE'),
      'minIelts', 6.5,
      'minToefl', 79,
      'minPte', 58,
      'minDuolingo', 115,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Melbourne biomedical research precinct is the largest in the southern hemisphere, housing the Doherty Institute and Walter and Eliza Hall Institute.'
  ),
  now(), now()
),
(
  'crs-unimelb-bcs',
  'uni-melbourne',
  jsonb_build_object(
    'id', 'crs-unimelb-bcs',
    'universityId', 'uni-melbourne',
    'universityName', 'University of Melbourne',
    'campus', 'Parkville Campus',
    'city', 'Melbourne',
    'country', 'Australia',
    'courseName', 'Bachelor of Science - Computing & Software Systems',
    'studyLevel', 'Undergraduate',
    'courseType', 'Full-Time',
    'department', 'Faculty of Science',
    'subject', 'Software Engineering',
    'duration', '3 Years',
    'tuitionFee', 'AUD 48,500 / year',
    'tuitionFeeNum', 48500,
    'applicationFee', 'AUD 100',
    'activeIntake', 'February 2026',
    'availableIntakes', jsonb_build_array('February 2026', 'July 2026'),
    'applicationDeadline', '2025-11-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Completion of 12th Standard (CBSE/ICSE/State Board) with strong marks in Mathematics (min 80%).',
      'english', 'IELTS 6.5 with no band under 6.0, or PTE 58.',
      'workExperience', 'Not applicable.'
    ),
    'scholarshipsInfo', 'Melbourne International Undergraduate Scholarship offering $10,000 to full 100% tuition remission.',
    'additionalNotes', 'Pathway to Melbourne Master of Engineering or Master of Computer Science.',
    'commissionRate', '14%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '12th Grade with Higher Mathematics',
      'acceptedDegrees', jsonb_build_array('CBSE 12th', 'ICSE 12th', 'State Board 12th', 'IB Diploma', 'A-Levels'),
      'minPercentage', 80,
      'minCgpa', 8.0,
      'maxBacklogs', 0,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 79,
      'minPte', 58,
      'minDuolingo', 115,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', true,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'IELTS', 'CV / Resume', 'Statement of Purpose')
    ),
    'aboutUniversity', 'Ranked in the top 15 universities globally, Melbourne provides Australian degrees recognized worldwide.'
  ),
  now(), now()
),

-- ====================
-- TRINITY DUBLIN (4)
-- ====================
(
  'crs-tcd-arvr',
  'uni-tcd',
  jsonb_build_object(
    'id', 'crs-tcd-arvr',
    'universityId', 'uni-tcd',
    'universityName', 'Trinity College Dublin',
    'campus', 'College Green Campus',
    'city', 'Dublin',
    'country', 'Ireland',
    'courseName', 'MSc Computer Science - Augmented & Virtual Reality',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'School of Computer Science & Statistics',
    'subject', 'Interactive Media & XR',
    'duration', '1 Year',
    'tuitionFee', '€25,800 / year',
    'tuitionFeeNum', 25800,
    'applicationFee', '€55',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-04-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'First class honours or upper second class honours (minimum 60-65% or 6.5/10 CGPA) in Computer Science or Electrical Engineering.',
      'english', 'IELTS 6.5 (no individual band below 6.0) or Duolingo 120.',
      'workExperience', 'Strong proficiency in C++, Python, Computer Vision, or Computer Graphics is desirable.'
    ),
    'scholarshipsInfo', 'Global Excellence Postgraduate Scholarship offering €5,000 fee deduction to distinguished international admits.',
    'additionalNotes', 'Ireland offers a 2-year post-study work visa (Third Level Graduate Scheme). Dublin hosts Google, Meta, Apple, and TikTok European headquarters.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in Computer Science, IT, or Electronics',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'BCA', 'B.Sc in CS'),
      'minPercentage', 60,
      'minCgpa', 6.5,
      'maxBacklogs', 3,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 88,
      'minPte', 63,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Founded in 1592, Trinity College Dublin is Ireland''s premier institution, famous for its historic Old Library and vibrant tech partnerships.'
  ),
  now(), now()
),
(
  'crs-tcd-fin',
  'uni-tcd',
  jsonb_build_object(
    'id', 'crs-tcd-fin',
    'universityId', 'uni-tcd',
    'universityName', 'Trinity College Dublin',
    'campus', 'Trinity Business School',
    'city', 'Dublin',
    'country', 'Ireland',
    'courseName', 'MSc in Finance & Risk Management',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Trinity Business School',
    'subject', 'Finance & Analytics',
    'duration', '1 Year',
    'tuitionFee', '€26,500 / year',
    'tuitionFeeNum', 26500,
    'applicationFee', '€55',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-05-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'First class honours or upper second class honours degree in business, economics, or quantitative discipline.',
      'english', 'IELTS 6.5 (minimum 6.0 in each band) or TOEFL 88.',
      'workExperience', 'Not mandatory. Relevant banking or financial modeling experience strengthens application.'
    ),
    'scholarshipsInfo', 'Trinity Business School Merit Scholarships up to €10,000 available.',
    'additionalNotes', 'Partnership with the CFA Institute and PRMIA; prepares candidates directly for Level I and Level II CFA exams.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in Business, Commerce, Economics or Mathematics',
      'acceptedDegrees', jsonb_build_array('B.Com', 'BBA', 'B.Tech', 'B.E.', 'BA Economics'),
      'minPercentage', 62,
      'minCgpa', 6.5,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 88,
      'minPte', 63,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Trinity Business School is in the top 1% of business schools worldwide, holding coveted Triple-Accreditation (AACSB, AMBA, EQUIS).'
  ),
  now(), now()
),
(
  'crs-tcd-pharma',
  'uni-tcd',
  jsonb_build_object(
    'id', 'crs-tcd-pharma',
    'universityId', 'uni-tcd',
    'universityName', 'Trinity College Dublin',
    'campus', 'College Green Campus',
    'city', 'Dublin',
    'country', 'Ireland',
    'courseName', 'MSc in Pharmaceutical Sciences',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'School of Pharmacy & Pharmaceutical Sciences',
    'subject', 'Biotechnology & Drug Discovery',
    'duration', '1 Year',
    'tuitionFee', '€24,900 / year',
    'tuitionFeeNum', 24900,
    'applicationFee', '€55',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-05-15',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Bachelor''s degree in Pharmacy, Chemistry, Biochemistry, Pharmacology, or related bioscience (minimum 60%+).',
      'english', 'IELTS 6.5 or equivalent.',
      'workExperience', 'Laboratory or biopharmaceutical industry exposure is an advantage.'
    ),
    'scholarshipsInfo', 'School of Pharmacy International Student Bursaries up to €4,000.',
    'additionalNotes', 'Ireland is the world''s 3rd largest exporter of pharmaceuticals; 9 of the top 10 global pharma firms operate manufacturing and R&D plants in Ireland.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s in Pharmacy, Chemistry, or Biological Sciences',
      'acceptedDegrees', jsonb_build_array('B.Pharm', 'B.Sc Chemistry', 'B.Sc Biotechnology', 'B.Tech Biotech'),
      'minPercentage', 60,
      'minCgpa', 6.2,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 88,
      'minPte', 63,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Trinity''s School of Pharmacy is ranked among the top 35 pharmacy schools worldwide.'
  ),
  now(), now()
),
(
  'crs-tcd-digital',
  'uni-tcd',
  jsonb_build_object(
    'id', 'crs-tcd-digital',
    'universityId', 'uni-tcd',
    'universityName', 'Trinity College Dublin',
    'campus', 'Trinity Business School',
    'city', 'Dublin',
    'country', 'Ireland',
    'courseName', 'MSc in Digital Marketing Strategy',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Trinity Business School',
    'subject', 'Digital Growth & Strategy',
    'duration', '1 Year',
    'tuitionFee', '€23,500 / year',
    'tuitionFeeNum', 23500,
    'applicationFee', '€55',
    'activeIntake', 'September 2026',
    'availableIntakes', jsonb_build_array('September 2026'),
    'applicationDeadline', '2026-05-30',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'An undergraduate degree in any discipline with at least 60% or 6.5 CGPA.',
      'english', 'IELTS 6.5 (all bands 6.0+) or Duolingo 120.',
      'workExperience', 'No formal work experience required. Open to business and non-business graduates.'
    ),
    'scholarshipsInfo', 'Regional scholarship awards of €3,000–€5,000 for high-achieving applicants.',
    'additionalNotes', 'Course syllabus includes Google Ads, HubSpot certification, behavioral analytics, and omnichannel campaign planning.',
    'commissionRate', '12%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in any discipline',
      'acceptedDegrees', jsonb_build_array('BBA', 'B.Com', 'BA', 'B.Tech', 'B.Sc'),
      'minPercentage', 60,
      'minCgpa', 6.2,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 88,
      'minPte', 63,
      'minDuolingo', 120,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Trinity College Dublin provides direct networking access to tech multinationals located just minutes from the university campus.'
  ),
  now(), now()
),

-- ====================
-- ARIZONA STATE (4)
-- ====================
(
  'crs-asu-ai',
  'uni-asu',
  jsonb_build_object(
    'id', 'crs-asu-ai',
    'universityId', 'uni-asu',
    'universityName', 'Arizona State University',
    'campus', 'Tempe Campus',
    'city', 'Tempe, Phoenix',
    'country', 'United States',
    'courseName', 'MS in Artificial Intelligence & Machine Learning',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'Ira A. Fulton Schools of Engineering',
    'subject', 'Machine Learning & Neural Systems',
    'duration', '2 Years',
    'tuitionFee', '$38,400 / year',
    'tuitionFeeNum', 38400,
    'applicationFee', '$115',
    'activeIntake', 'August 2026',
    'availableIntakes', jsonb_build_array('August 2026', 'January 2027'),
    'applicationDeadline', '2026-03-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Minimum 3.00 cumulative GPA (approx 65%+) in a four-year bachelor''s degree in computer science, engineering, or related field.',
      'english', 'TOEFL 80, IELTS 6.5, or Duolingo 105.',
      'workExperience', 'Not mandatory. GRE waiver available for students with strong undergraduate GPA.'
    ),
    'scholarshipsInfo', 'New American University Scholar award offering $5,000 to $10,000 per academic year.',
    'additionalNotes', 'STEM-designated program providing 3-year OPT (Optional Practical Training) work authorization in the USA.',
    'commissionRate', '16%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '4-Year Bachelor''s Degree in CS, IT, or Engineering',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc in CS', 'BCA + MCA'),
      'minPercentage', 65,
      'minCgpa', 6.5,
      'maxBacklogs', 4,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 80,
      'minPte', 60,
      'minDuolingo', 105,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'Ranked #1 for Innovation in the United States, ASU is one of the largest and most dynamic public research universities.'
  ),
  now(), now()
),
(
  'crs-asu-ba',
  'uni-asu',
  jsonb_build_object(
    'id', 'crs-asu-ba',
    'universityId', 'uni-asu',
    'universityName', 'Arizona State University',
    'campus', 'Tempe Campus',
    'city', 'Tempe, Phoenix',
    'country', 'United States',
    'courseName', 'MS in Business Analytics (MS-BA)',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'W. P. Carey School of Business',
    'subject', 'Predictive Modeling & Big Data',
    'duration', '9 Months',
    'tuitionFee', '$54,200 / year',
    'tuitionFeeNum', 54200,
    'applicationFee', '$115',
    'activeIntake', 'August 2026',
    'availableIntakes', jsonb_build_array('August 2026'),
    'applicationDeadline', '2026-03-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', true),
    'entryRequirements', jsonb_build_object(
      'academic', 'Undergraduate degree with minimum 3.0 GPA in business, engineering, math, statistics, or sciences.',
      'english', 'TOEFL 80, IELTS 6.5, or Duolingo 105.',
      'workExperience', 'Prior analytics, SQL, Python, or business internship experience preferred.'
    ),
    'scholarshipsInfo', 'W. P. Carey Graduate Scholarships awarded automatically based on admissions profile.',
    'additionalNotes', 'STEM-designated program granting 3-year OPT in the US. Ranked in the top 15 in the US for Business Analytics.',
    'commissionRate', '15%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', 'Bachelor''s Degree in Engineering, Business, Math or Economics',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'BBA', 'B.Com', 'B.Sc'),
      'minPercentage', 65,
      'minCgpa', 6.8,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 80,
      'minPte', 60,
      'minDuolingo', 105,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'W. P. Carey School of Business at ASU is AACSB-accredited and home to world-renowned faculty in supply chain and data analytics.'
  ),
  now(), now()
),
(
  'crs-asu-cyber',
  'uni-asu',
  jsonb_build_object(
    'id', 'crs-asu-cyber',
    'universityId', 'uni-asu',
    'universityName', 'Arizona State University',
    'campus', 'Tempe Campus',
    'city', 'Tempe, Phoenix',
    'country', 'United States',
    'courseName', 'MS in Cybersecurity & Information Assurance',
    'studyLevel', 'Postgraduate',
    'courseType', 'Full-Time',
    'department', 'School of Computing and Augmented Intelligence',
    'subject', 'Network Defense & Cryptography',
    'duration', '2 Years',
    'tuitionFee', '$36,800 / year',
    'tuitionFeeNum', 36800,
    'applicationFee', '$115',
    'activeIntake', 'August 2026',
    'availableIntakes', jsonb_build_array('August 2026', 'January 2027'),
    'applicationDeadline', '2026-04-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Minimum 3.00 GPA in a four-year bachelor''s in Computer Science, Information Security, or Engineering.',
      'english', 'TOEFL 80 or IELTS 6.5.',
      'workExperience', 'Security certifications (Security+, CEH, CISSP) can bolster candidate profile.'
    ),
    'scholarshipsInfo', 'Fulton Schools international fellowship awards of $5,000.',
    'additionalNotes', 'Designated by the National Security Agency (NSA) and DHS as a National Center of Academic Excellence in Cyber Defense.',
    'commissionRate', '16%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '4-Year Bachelor''s Degree in CS or IT',
      'acceptedDegrees', jsonb_build_array('B.Tech', 'B.E.', 'B.Sc in CS', 'BCA + MCA'),
      'minPercentage', 62,
      'minCgpa', 6.5,
      'maxBacklogs', 3,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.5,
      'minToefl', 80,
      'minPte', 60,
      'minDuolingo', 105,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'Bachelor Degree', 'Bachelor Transcripts', 'IELTS', 'CV / Resume', 'Statement of Purpose', 'Letter of Recommendation')
    ),
    'aboutUniversity', 'ASU Center for Cybersecurity and Trusted Foundations works directly with the US Department of Defense and major industry partners.'
  ),
  now(), now()
),
(
  'crs-asu-swe',
  'uni-asu',
  jsonb_build_object(
    'id', 'crs-asu-swe',
    'universityId', 'uni-asu',
    'universityName', 'Arizona State University',
    'campus', 'Polytechnic Campus',
    'city', 'Mesa, Phoenix',
    'country', 'United States',
    'courseName', 'BS in Software Engineering',
    'studyLevel', 'Undergraduate',
    'courseType', 'Full-Time',
    'department', 'Ira A. Fulton Schools of Engineering',
    'subject', 'Full-Stack & Cloud Computing',
    'duration', '4 Years',
    'tuitionFee', '$33,500 / year',
    'tuitionFeeNum', 33500,
    'applicationFee', '$85',
    'activeIntake', 'August 2026',
    'availableIntakes', jsonb_build_array('August 2026', 'January 2027'),
    'applicationDeadline', '2026-05-01',
    'images', jsonb_build_array('https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&auto=format&fit=crop&q=80'),
    'badges', jsonb_build_object('scholarship', true, 'freeToApply', false, 'noAppFee', false, 'interviewRequired', false),
    'entryRequirements', jsonb_build_object(
      'academic', 'Higher Secondary / 12th Grade with minimum 3.00 GPA equivalent (approx 65%+) and 4 years of math.',
      'english', 'TOEFL 61, IELTS 6.0, or Duolingo 95.',
      'workExperience', 'Not applicable.'
    ),
    'scholarshipsInfo', 'ASU New American University Scholarship up to $14,500 per year renewable for 4 years.',
    'additionalNotes', 'Project-based engineering curriculum with industry-sponsored senior design capstones.',
    'commissionRate', '15%',
    'requirementsConfig', jsonb_build_object(
      'minQualification', '12th Grade / Senior Secondary School',
      'acceptedDegrees', jsonb_build_array('CBSE 12th', 'ICSE 12th', 'State Board 12th', 'IB Diploma', 'A-Levels'),
      'minPercentage', 65,
      'minCgpa', 6.5,
      'maxBacklogs', 2,
      'acceptedEnglishTests', jsonb_build_array('IELTS', 'TOEFL', 'PTE', 'Duolingo'),
      'minIelts', 6.0,
      'minToefl', 61,
      'minPte', 53,
      'minDuolingo', 95,
      'greRequired', false,
      'gmatRequired', false,
      'academicEnglishAccepted', true,
      'englishWaiverAvailable', true,
      'passportRequiredAtApplication', false,
      'requiredDocuments', jsonb_build_array('Passport', '10th Certificate', '12th Certificate', 'IELTS', 'CV / Resume', 'Statement of Purpose')
    ),
    'aboutUniversity', 'ASU Fulton Engineering is the largest engineering school in the US, providing top equipment, maker spaces, and career fairs.'
  ),
  now(), now()
);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
  (SELECT count(*) FROM public.profiles WHERE role = 'admin') AS remaining_admins,
  (SELECT count(*) FROM public.profiles WHERE role != 'admin') AS remaining_non_admins,
  (SELECT count(*) FROM public.students) AS remaining_students,
  (SELECT count(*) FROM public.applications) AS remaining_applications,
  (SELECT count(*) FROM public.institutions) AS total_universities,
  (SELECT count(*) FROM public.courses) AS total_courses;
