import type { Profession } from '@/types/profession';

const profession: Profession = {
  slug: 'nurse',
  role: 'Nurse',
  rolePlural: 'nurses',
  field: 'Public service & care',
  metaTitle: 'Nursing CV: Registration, Acuity and Rostering',
  metaDescription:
    'A nursing CV is read for three things: whether you can be rostered at all, the acuity you are used to, and the competencies that decide what you can be assigned to.',
  keywords: [
    'nursing cv',
    'nurse cv example',
    'registered nurse cv',
    'nhs cv',
    'healthcare cv',
    'newly qualified nurse cv',
  ],
  heading: 'How to write a nursing CV',
  intro:
    'A ward manager reading your CV is doing something quite specific: building next month’s rota in their head. Can this person be registered on the system, which shifts can they cover, what can they be assigned to unsupervised, and how much supernumerary time will they need? Everything on the page should help answer those four questions.',
  overview: [
    'That practical framing is why generic nursing CVs underperform so badly. “Provided compassionate patient care as part of a multidisciplinary team” is true of every nurse who has ever qualified, and it tells a manager nothing about whether you can take charge of a bay on a Saturday night.',
    'It is also why the structure differs from most professions. Registration and mandatory training are not credentials to list at the bottom — they are gating facts that belong near the top. And the acuity of your settings does more work than your job titles, because a band 5 on a busy acute medical ward and a band 5 in a day unit have accumulated very different skills.',
  ],
  scanOrder: [
    {
      title: 'Registration status',
      description:
        'Whether you are registered and can be rostered at all. NMC registration and PIN status in the UK, or state licensure and NCLEX status in the US, plus revalidation date and any restrictions. If this is not visible in the first few lines, the reader has to hunt for the one fact that determines everything else.',
    },
    {
      title: 'Setting and acuity',
      description:
        'Speciality, bed numbers, typical staffing ratio, patient dependency and whether the unit takes admissions overnight. Acuity is the single most transferable thing about nursing experience and the most commonly omitted.',
    },
    {
      title: 'Competencies that decide assignment',
      description:
        'Cannulation, venepuncture, IV administration, catheterisation, tracheostomy care, syringe drivers, ALS or ILS, mentorship and sign-off status, and the electronic patient record you use. These decide what you can be given on day one and what needs supervision.',
    },
    {
      title: 'Currency of mandatory training',
      description:
        'Safeguarding levels, basic and immediate life support, moving and handling, infection prevention, medicines management. Out-of-date training is an onboarding cost, and stating your dates saves the recruiter a chase.',
    },
  ],
  metrics: [
    {
      name: 'Setting scale and ratio',
      detail:
        'Bed numbers, speciality, typical nurse-to-patient ratio on days and nights, and admission volume. “A 28-bed acute medical ward, typically 1:6 on days and 1:10 at night” describes your working reality more precisely than any adjective.',
    },
    {
      name: 'Shift leadership frequency',
      detail:
        'How often you coordinate a shift or take charge of a bay, and how long you have been doing it. A manager reads this as a direct answer to whether you can fill a rota gap in week two rather than week twelve.',
    },
    {
      name: 'Teaching and preceptorship',
      detail:
        'Students precepted per rotation, new starters supported, competencies you are signed off to assess, sessions delivered. Practice assessor and supervisor status is a genuine credential worth naming explicitly.',
    },
    {
      name: 'Quality improvement outcomes',
      detail:
        'Audits led, incident reduction, complaint resolution, compliance figures before and after a change you made. Falls, pressure ulcers, hand hygiene and documentation audits are the usual sources and are almost never on a CV.',
    },
  ],
  sectionPlan: {
    order: [
      {
        section: 'Contact and registration line',
        note: 'Name, city, phone, email, and your registration on the same line: “Registered Nurse (Adult), NMC PIN held, revalidation due May 2027”. This is the fact everything else depends on.',
      },
      {
        section: 'Profile — three or four lines',
        note: 'Field of practice, years registered, the settings and acuity you know, and the thing you want to do next. Keep it factual; this is not the place for a statement about your compassion.',
      },
      {
        section: 'Clinical skills and competencies',
        note: 'High on the page, grouped and specific. This is the section a ward manager reads to work out what they can assign you, and it earns its position above the job history.',
      },
      {
        section: 'Clinical experience',
        note: 'Reverse chronological, each post with the setting line — trust or provider, speciality, bed numbers, ratio, band — before the responsibilities.',
      },
      {
        section: 'Mandatory and professional training',
        note: 'Safeguarding levels with dates, life support qualifications with expiry, speciality courses, mentorship and assessor qualifications.',
      },
      {
        section: 'Education',
        note: 'Nursing qualification with institution and year, plus any post-registration study. Two or three lines.',
      },
    ],
    drop: [
      {
        section: 'Statements about compassion and care',
        note: '“Caring, compassionate and committed to person-centred care.” True of the profession as a whole and therefore evidence of nothing.',
      },
      {
        section: 'A generic duties list',
        note: 'Administering medication, monitoring observations, documenting care and escalating concerns is the definition of the role. Say what was distinctive about doing it in your setting.',
      },
      {
        section: 'Your PIN number itself',
        note: 'State that you hold current registration and give the field of practice; there is no need to publish the number on a document you email to strangers and upload to job boards.',
      },
      {
        section: 'Referee contact details',
        note: 'Healthcare employers take references formally after an offer. Printing a former ward manager’s mobile number achieves nothing and shares data you were not asked to share.',
      },
    ],
  },
  rewrites: [
    {
      before: 'Provided patient care on a busy ward and worked as part of a multidisciplinary team.',
      after:
        'Registered nurse on a 28-bed acute medical ward, typically 1:6 on days and 1:10 at night; shift coordinator twice a week, precepting three student nurses per rotation and leading a falls-reduction audit that cut ward incidents by a fifth over two quarters.',
      change:
        'Every nurse provides patient care and every ward is busy; the rewrite gives the acuity, the ratio, how often you take charge, your teaching load and one measurable improvement — which together tell a manager exactly how to roster you.',
    },
    {
      before: 'Assisted with medication rounds and ensured accurate documentation.',
      after:
        'Managed the drug round for a 14-patient bay including IV antibiotics, syringe drivers and controlled drugs; identified a recurring transcription error in discharge summaries and worked with pharmacy on a checklist that removed it from the next quarter’s audit.',
      change:
        '“Assisted with” understates registered practice; the rewrite names the caseload and the specific medication competencies, then shows you noticed a systemic problem and closed it — which is what distinguishes an experienced nurse from a safe one.',
    },
    {
      before: 'Supported junior staff and helped with training on the ward.',
      after:
        'Practice supervisor for second- and third-year students, signing off six competency portfolios across two placements; delivered the ward’s monthly deteriorating-patient teaching session and rewrote the induction pack now given to every new band 5.',
      change:
        'Supporting colleagues is unverifiable as a claim; the rewrite converts it into a formal role, a countable output — six portfolios — and a resource other people use, all of which can be checked with one phone call.',
    },
  ],
  ats: {
    intro: [
      'Healthcare recruitment at scale is highly systematised. Large providers use structured application systems that filter on registration status, band, speciality and mandatory training before a manager sees anything, and agencies filter on much the same fields. The terms are precise and clinical, which makes them easy to match — and easy to miss if you have described a competency in your own words.',
      'So write the speciality names as the sector writes them, spell out both the abbreviation and the full term the first time — “ALS (Advanced Life Support)” — and put your competencies in a labelled block rather than leaving them embedded in narrative paragraphs where a filter and a hurried reader will both miss them.',
    ],
    groups: [
      {
        group: 'Registration and grade',
        examples: ['NMC registered', 'Registered Nurse (Adult)', 'RN', 'band 5', 'band 6', 'revalidation', 'NCLEX'],
      },
      {
        group: 'Clinical competencies',
        examples: ['cannulation', 'venepuncture', 'IV therapy', 'catheterisation', 'tracheostomy care', 'wound care', 'syringe driver'],
      },
      {
        group: 'Training and certification',
        examples: ['BLS', 'ILS', 'ALS', 'safeguarding level 3', 'infection prevention', 'moving and handling', 'medicines management'],
      },
      {
        group: 'Settings and systems',
        examples: ['acute medical', 'surgical', 'ITU', 'ED', 'community', 'theatre', 'Epic', 'Cerner', 'SystmOne', 'EMIS'],
      },
    ],
    caveat:
      'Systems differ between providers and agencies, and many nursing posts are shortlisted by a clinical manager reading applications directly. The aim is that a competency you genuinely hold is never invisible — not that the document is written for software.',
  },
  mistakes: [
    {
      title: 'Registration status left unclear',
      description:
        'A CV that does not state registration, field of practice and revalidation position makes the reader do compliance work before they can consider you. For overseas applicants, say exactly where you are in the process rather than leaving it implied.',
    },
    {
      title: 'No acuity anywhere',
      description:
        'Without bed numbers, speciality and ratio, a manager cannot tell whether your experience matches their unit. “Busy ward” is the phrase that costs nursing candidates the most and is used the most.',
    },
    {
      title: 'Competencies buried in prose',
      description:
        'Cannulation and IV administration mentioned halfway through a paragraph about a previous post will be missed by a skim-reader and by a filter. Put them in a labelled block.',
    },
    {
      title: 'Mandatory training left off',
      description:
        'Life support, safeguarding levels and infection prevention with their dates are practical onboarding facts. Omitting them does not make you look less bureaucratic; it makes you look like more work.',
    },
    {
      title: 'Bank and agency work presented as instability',
      description:
        'Bank shifts and agency placements are normal and often show breadth across several settings. Group them into one entry with the trusts, the specialities and the approximate shift volume rather than listing them as a series of short jobs.',
    },
  ],
  templates: [
    {
      id: 'ats-03',
      reason:
        'Stripped-back text with nothing decorative — the right choice for large healthcare application portals, which convert files aggressively and will discard anything clever.',
    },
    {
      id: 'classic-05',
      reason:
        'Every section in its own ruled box with contact details set out as labelled fields, which suits a document built from compliance facts: registration, training dates, competencies and settings.',
    },
    {
      id: 'ats-01',
      reason:
        'A plain, single-column layout that keeps a long competency list and several posts legible across two pages, and is free to use and download.',
    },
  ],
  steps: [
    {
      name: 'Put registration in the header',
      text: 'Field of practice, registration status, revalidation due date and any restrictions. One line, at the top, so no reader has to look for it.',
    },
    {
      name: 'Write the setting line for every post',
      text: 'Provider, speciality, bed numbers, ratio and band. This single line does more to place you than the entire responsibilities list underneath it.',
    },
    {
      name: 'Build the competency block',
      text: 'Group clinical skills, assessment and teaching qualifications, and the electronic patient record systems you have used. Mark anything you are signed off to supervise.',
    },
    {
      name: 'Add the dates to your mandatory training',
      text: 'Safeguarding level and date, life support qualification and expiry, infection prevention, moving and handling. Currency is the point, so the dates matter as much as the courses.',
    },
    {
      name: 'Find one quality improvement result',
      text: 'An audit, an incident reduction, a documentation change, a complaint resolved and its cause removed. One of these per post lifts a nursing CV out of the ordinary.',
    },
  ],
  us: {
    intro:
      'US nursing recruitment turns on state licensure and a different vocabulary for grades and settings, so a UK nursing CV needs translation rather than a trim.',
    points: [
      'Licensure is state-based: name the state, the licence type and its expiry, whether you hold a multistate compact licence, and your NCLEX-RN status. NMC registration alone does not make you rosterable in the US.',
      'Certifications are named differently and matter a great deal — BLS and ACLS from the American Heart Association, PALS, and speciality certifications such as CCRN or CEN.',
      'Bands do not exist; describe the role instead — staff nurse, charge nurse, clinical nurse III — and give unit type and bed count, which US managers read the same way UK ones do.',
      'The document is a résumé of one to two pages, degree qualifications are stated as BSN or ADN, and no photo or personal details are included.',
    ],
  },
  faq: [
    {
      question: 'Should I put my NMC PIN on my CV?',
      answer:
        'State that you hold current registration and your field of practice; the number itself can wait for the application form or the pre-employment checks. Employers verify the register directly and do not need the digits from a document you are emailing to agencies and uploading to job boards. What is worth including is your revalidation date, because it tells a recruiter your registration is in good standing and when the next cycle falls.',
    },
    {
      question: 'I qualified overseas. How do I present my registration?',
      answer:
        'Say exactly where you are in the process, with dates. “Registered nurse in the Philippines since 2019; NMC application submitted March 2026, CBT passed, OSCE booked for July” is a strong, unambiguous line — vagueness here is the main reason strong overseas candidates get set aside. Then describe your clinical experience in terms a UK or US manager can calibrate: bed numbers, ratios, specialities and procedures, rather than local grade titles that will not translate.',
    },
    {
      question: 'How do I write bank, agency or travel work?',
      answer:
        'As one grouped entry rather than a dozen short ones. “Agency nursing across four acute trusts in the West Midlands, 2023–2025 — acute medical, surgical and ED, approximately 900 shifts” reads as deliberate and shows breadth. Then pull out any long placement of three months or more as its own entry with a setting line, because those are the ones where you can describe outcomes and shift leadership rather than only attendance.',
    },
    {
      question: 'I am newly qualified with only placements. What goes on the CV?',
      answer:
        'Your placements, written the way a nurse would describe a post: setting, speciality, bed numbers, length of placement, competencies achieved and anything you were signed off to do. List the procedures you have performed and the number of times where it is meaningful. Add your dissertation or final project if it is clinically relevant, and your mandatory training with dates. Newly qualified applications are read against each other, so the specificity of the placement descriptions is what separates two otherwise identical candidates.',
    },
  ],
  related: ['teacher', 'student', 'project-manager'],
};

export default profession;
