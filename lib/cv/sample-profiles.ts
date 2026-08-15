import { cvDataSchema, type CVData, type LanguageLevel, type SkillLevel } from '@/types/cv';
import { defaultSectionConfigs } from './sections';

/**
 * The people whose CVs the template pages show.
 *
 * Until now there was one: Amina El Fassi, senior product designer, rendered identically on
 * all fifty-six template pages. That is 3,361 words of body copy repeated verbatim across
 * fifty-six URLs on a domain with no authority — and it is also just unpersuasive. Somebody
 * landing on `/templates/legal-cv` is trying to picture their own CV in that layout, and
 * what they get is a designer's portfolio links and an Awwwards mention.
 *
 * Each profile here is a different person with a different career shape, because the shape
 * is the point: a researcher's CV is publication-heavy and runs long, a student's is thin
 * and leans on projects, an operations director's is three roles and a lot of numbers. A
 * template that handles one of those well may handle another badly, and the preview should
 * be honest about that.
 *
 * Everything is fictional. Surnames are ordinary, employers are invented, and every address
 * is `@example.com`, which is the reserved domain for exactly this.
 *
 * ## Ids
 *
 * Hand-written, not generated. These documents are rendered into statically prerendered
 * pages, so a `uid()` would change the markup on every build and defeat the caching — the
 * same reason `content/examples` writes its ids out.
 */

interface Role {
  role: string;
  company: string;
  location: string;
  start: string;
  end?: string;
  description: string;
  achievements: string[];
  tags?: string[];
}

interface Study {
  degree: string;
  field?: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  grade?: string;
  description?: string;
}

interface ProfileInput {
  /** Stable key, used for element ids and for the template map. */
  id: string;
  /** Sentence case, for the "this preview shows a …" line and for tests. */
  label: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
  experience: Role[];
  education: Study[];
  /** `Category: name @ level`, kept flat because that is how a CV reads. */
  skills: { category: string; name: string; level: SkillLevel }[];
  languages: { name: string; level: LanguageLevel }[];
  /**
   * Areas of expertise with the evidence for each.
   *
   * Only the profiles shown on a functional or hybrid template need these, and only those
   * templates render them — a chronological design leaves the section out entirely. But a
   * preview of a functional CV with an empty competency block is a preview of nothing, so
   * where it is needed it is written properly rather than generated from the skills list.
   */
  competencies?: { name: string; description?: string; achievements: string[] }[];
  certifications?: { name: string; issuer: string; date: string }[];
  projects?: { name: string; role: string; description: string; highlights?: string[] }[];
  publications?: { title: string; publisher: string; date: string; description: string }[];
  interests?: string[];
}

function build(input: ProfileInput): CVData {
  const key = input.id;
  return cvDataSchema.parse({
    personal: {
      firstName: input.firstName,
      lastName: input.lastName,
      title: input.title,
      email: `${input.firstName.toLowerCase()}@example.com`,
      phone: '+44 20 7946 0100',
      location: input.location,
      website: input.website ?? '',
      linkedin: input.linkedin ?? '',
      github: input.github ?? '',
      photoUrl: '',
      links: [],
    },
    summary: input.summary,
    experience: input.experience.map((role, index) => ({
      id: `${key}-exp-${index + 1}`,
      role: role.role,
      company: role.company,
      location: role.location,
      startDate: role.start,
      endDate: role.end ?? '',
      current: !role.end,
      description: role.description,
      achievements: role.achievements,
      tags: role.tags ?? [],
    })),
    education: input.education.map((study, index) => ({
      id: `${key}-edu-${index + 1}`,
      degree: study.degree,
      field: study.field ?? '',
      institution: study.institution,
      location: study.location,
      startDate: study.start,
      endDate: study.end,
      current: false,
      grade: study.grade ?? '',
      description: study.description ?? '',
    })),
    skills: input.skills.map((skill, index) => ({
      id: `${key}-skill-${index + 1}`,
      name: skill.name,
      category: skill.category,
      level: skill.level,
    })),
    languages: input.languages.map((language, index) => ({
      id: `${key}-lang-${index + 1}`,
      name: language.name,
      level: language.level,
    })),
    competencies: (input.competencies ?? []).map((competency, index) => ({
      id: `${key}-comp-${index + 1}`,
      name: competency.name,
      description: competency.description ?? '',
      achievements: competency.achievements,
    })),
    projects: (input.projects ?? []).map((project, index) => ({
      id: `${key}-proj-${index + 1}`,
      name: project.name,
      role: project.role,
      startDate: '',
      endDate: '',
      url: '',
      description: project.description,
      highlights: project.highlights ?? [],
      tags: [],
    })),
    certifications: (input.certifications ?? []).map((certification, index) => ({
      id: `${key}-cert-${index + 1}`,
      name: certification.name,
      issuer: certification.issuer,
      date: certification.date,
      expiryDate: '',
      credentialId: '',
      url: '',
    })),
    awards: [],
    volunteer: [],
    publications: (input.publications ?? []).map((publication, index) => ({
      id: `${key}-pub-${index + 1}`,
      title: publication.title,
      publisher: publication.publisher,
      date: publication.date,
      url: '',
      authors: `${input.firstName} ${input.lastName}`,
      description: publication.description,
    })),
    interests: (input.interests ?? []).map((name, index) => ({
      id: `${key}-int-${index + 1}`,
      name,
      description: '',
    })),
    references: [],
    customSections: [],
    /*
     * A section the author wrote content for is a section the author meant to show.
     *
     * `defaultSectionConfigs()` ships `competencies`, `projects`, `certifications` and the
     * rest switched off, because a blank CV should not open with nine empty headings. On a
     * *sample* that default is exactly wrong: it silently drops the section the template
     * was chosen to demonstrate. The functional and hybrid previews rendered with no
     * competencies block at all — the one thing those two formats exist for.
     */
    sections: defaultSectionConfigs().map((section) => ({
      ...section,
      enabled: section.enabled || hasAuthoredContent(input, section.id),
    })),
  });
}

/** True when `input` carries anything for this section. */
function hasAuthoredContent(input: ProfileInput, id: string): boolean {
  switch (id) {
    case 'competencies':
      return (input.competencies?.length ?? 0) > 0;
    case 'projects':
      return (input.projects?.length ?? 0) > 0;
    case 'certifications':
      return (input.certifications?.length ?? 0) > 0;
    case 'publications':
      return (input.publications?.length ?? 0) > 0;
    case 'interests':
      return (input.interests?.length ?? 0) > 0;
    default:
      return false;
  }
}

/* -------------------------------------------------------------------------- */
/* The profiles                                                                */
/* -------------------------------------------------------------------------- */

const OPERATIONS_DIRECTOR = build({
  id: 'operations-director',
  label: 'Operations director',
  firstName: 'Helen',
  lastName: 'Okafor',
  title: 'Director of Operations',
  location: 'Birmingham, UK',
  linkedin: 'linkedin.com/in/helen-okafor',
  summary:
    'Operations director with fourteen years in multi-site distribution, currently accountable for four warehouses, 380 staff and a £62M cost base. I am usually brought in when service levels and cost are pulling in opposite directions: my last two roles were both turnarounds where the fix was scheduling and supplier discipline rather than headcount. Comfortable owning a P&L and equally comfortable on the floor at six in the morning.',
  experience: [
    {
      role: 'Director of Operations',
      company: 'Kestrel Distribution',
      location: 'Birmingham, UK',
      start: '2021-02',
      description:
        'Accountable for four regional distribution centres, 380 staff and a £62M annual cost base, reporting to the COO. Five direct reports.',
      achievements: [
        'Took on-time-in-full from 91.4% to 98.1% across eighteen months by rebuilding the inbound booking system and moving three carriers onto penalty-backed SLAs.',
        'Reduced cost per despatched unit by 11% without redundancies, mainly by shifting to a four-shift pattern that cut agency hours from 22% of labour to 6%.',
        'Led the Redditch site consolidation — 140 roles relocated or redeployed, no compulsory redundancies, and the site closed two weeks ahead of plan.',
      ],
      tags: ['P&L', 'S&OP', 'Change management'],
    },
    {
      role: 'Head of Regional Operations',
      company: 'Marlow Foods Group',
      location: 'Leicester, UK',
      start: '2017-06',
      end: '2021-01',
      description:
        'Ran two chilled distribution sites through a period of rapid retail growth, from 90 to 210 staff.',
      achievements: [
        'Introduced daily short-interval control across both sites; stock accuracy moved from 96.2% to 99.4% within a year and stayed there.',
        'Negotiated a three-year transport framework that saved £1.4M against the previous arrangement and removed a single-carrier dependency.',
        'Cut reportable accidents by 60% over two years after rebuilding the induction programme around the three incident types that accounted for most of them.',
      ],
      tags: ['Cold chain', 'H&S', 'Procurement'],
    },
    {
      role: 'Operations Manager',
      company: 'Marlow Foods Group',
      location: 'Leicester, UK',
      start: '2013-09',
      end: '2017-05',
      description:
        'Shift and then site management on a single chilled site, 24-hour operation, roughly 90 staff.',
      achievements: [
        'Redesigned the pick face after a two-week time study, taking average pick rate from 118 to 152 lines an hour.',
        'Ran the WMS replacement on site — go-live over a single weekend with no missed customer deliveries.',
      ],
    },
  ],
  education: [
    {
      degree: 'MSc',
      field: 'Supply Chain Management',
      institution: 'Aston University',
      location: 'Birmingham, UK',
      start: '2011-09',
      end: '2013-06',
      grade: 'Distinction',
    },
    {
      degree: 'BSc',
      field: 'Business Management',
      institution: 'University of Leicester',
      location: 'Leicester, UK',
      start: '2007-09',
      end: '2010-06',
      grade: '2:1',
    },
  ],
  skills: [
    { category: 'Operations', name: 'S&OP', level: 'expert' },
    { category: 'Operations', name: 'Lean and continuous improvement', level: 'expert' },
    { category: 'Operations', name: 'Warehouse management systems', level: 'advanced' },
    { category: 'Operations', name: 'Demand planning', level: 'advanced' },
    { category: 'Commercial', name: 'P&L ownership', level: 'expert' },
    { category: 'Commercial', name: 'Supplier negotiation', level: 'expert' },
    { category: 'Commercial', name: 'Capital business cases', level: 'advanced' },
    { category: 'Leadership', name: 'Multi-site management', level: 'expert' },
    { category: 'Leadership', name: 'Union and works council relations', level: 'advanced' },
    { category: 'Leadership', name: 'Restructuring and TUPE', level: 'advanced' },
  ],
  languages: [
    { name: 'English', level: 'native' },
    { name: 'French', level: 'limited-working' },
  ],
  certifications: [
    { name: 'Lean Six Sigma Black Belt', issuer: 'British Quality Foundation', date: '2018-03' },
    { name: 'NEBOSH General Certificate', issuer: 'NEBOSH', date: '2015-11' },
  ],
  interests: ['Open-water swimming', 'Restoring a 1974 Land Rover'],
});

const SOLICITOR = build({
  id: 'solicitor',
  label: 'Solicitor',
  firstName: 'Daniel',
  lastName: 'Whitmore',
  title: 'Senior Associate, Commercial Litigation',
  location: 'London, UK',
  linkedin: 'linkedin.com/in/daniel-whitmore',
  summary:
    'Commercial litigator, admitted 2016, with a practice centred on contractual disputes and post-acquisition warranty claims in the £2M–£40M range. Substantial experience of the disclosure exercise on document-heavy matters and of the interlocutory work that decides most cases before anyone reaches trial. Two reported decisions in the Commercial Court.',
  experience: [
    {
      role: 'Senior Associate',
      company: 'Harrow & Finch LLP',
      location: 'London, UK',
      start: '2021-09',
      description:
        'Commercial disputes team of eleven. Day-to-day conduct of six to nine matters, supervising two junior associates and a paralegal.',
      achievements: [
        'Led the disclosure exercise on a £38M warranty claim — 1.4M documents reduced to 9,000 by a sampling protocol agreed with the other side, which the court adopted and which took roughly £600,000 out of the projected cost budget.',
        'Obtained summary judgment for a manufacturing client on a £4.2M supply agreement claim, disposing of the matter fourteen months before the listed trial window.',
        'Built the team’s costs-budgeting precedent bank after two adverse Precedent H outcomes; budgets have been approved as filed in every case since.',
      ],
      tags: ['Commercial Court', 'Disclosure', 'Injunctions'],
    },
    {
      role: 'Associate',
      company: 'Harrow & Finch LLP',
      location: 'London, UK',
      start: '2018-09',
      end: '2021-08',
      description:
        'General commercial disputes with a growing share of post-M&A work; own caseload from year two.',
      achievements: [
        'Second-chairing a four-week Commercial Court trial, with responsibility for the factual chronology and two witnesses.',
        'Secured a without-notice freezing order over assets of £2.6M, continued at the return date.',
      ],
    },
    {
      role: 'Trainee Solicitor',
      company: 'Bellamy Cross',
      location: 'Leeds, UK',
      start: '2014-09',
      end: '2016-08',
      description: 'Four seats: commercial litigation, corporate, employment and real estate.',
      achievements: ['Retained on qualification into the commercial litigation team.'],
    },
  ],
  education: [
    {
      degree: 'Legal Practice Course',
      field: '',
      institution: 'University of Law',
      location: 'Leeds, UK',
      start: '2013-09',
      end: '2014-06',
      grade: 'Distinction',
    },
    {
      degree: 'LLB',
      field: 'Law',
      institution: 'University of Bristol',
      location: 'Bristol, UK',
      start: '2010-09',
      end: '2013-06',
      grade: 'First class',
    },
  ],
  skills: [
    { category: 'Practice', name: 'Contractual disputes', level: 'expert' },
    { category: 'Practice', name: 'Post-acquisition warranty claims', level: 'expert' },
    { category: 'Practice', name: 'Interim injunctions', level: 'advanced' },
    { category: 'Practice', name: 'Mediation and settlement', level: 'advanced' },
    { category: 'Procedure', name: 'CPR and case management', level: 'expert' },
    { category: 'Procedure', name: 'E-disclosure (Relativity)', level: 'expert' },
    { category: 'Procedure', name: 'Costs budgeting', level: 'advanced' },
    { category: 'Other', name: 'Supervision and training', level: 'advanced' },
  ],
  languages: [
    { name: 'English', level: 'native' },
    { name: 'German', level: 'full-professional' },
  ],
  certifications: [
    { name: 'Admitted as a Solicitor of England and Wales', issuer: 'SRA', date: '2016-09' },
    { name: 'Higher Rights of Audience (Civil)', issuer: 'SRA', date: '2020-04' },
  ],
  interests: ['Chamber choir', 'Cricket umpiring'],
});

const RESEARCHER = build({
  id: 'researcher',
  label: 'Academic researcher',
  firstName: 'Mei',
  lastName: 'Tanaka',
  title: 'Postdoctoral Research Fellow, Atmospheric Physics',
  location: 'Edinburgh, UK',
  website: 'mtanaka.example.com',
  summary:
    'Atmospheric physicist working on aerosol–cloud interaction, with a focus on reconciling satellite retrievals against in-situ aircraft measurements. Fourteen peer-reviewed papers, three as first author, and 620 citations. Currently hold a two-year fellowship funded by NERC and co-supervise two PhD students. Looking for a lectureship where I can keep the observational programme running alongside teaching.',
  experience: [
    {
      role: 'Postdoctoral Research Fellow',
      company: 'University of Edinburgh, School of GeoSciences',
      location: 'Edinburgh, UK',
      start: '2022-10',
      description:
        'NERC-funded independent fellowship. Own research programme, co-supervision of two PhD students, and 40 hours a year of undergraduate teaching.',
      achievements: [
        'First author on a 2024 paper in Atmospheric Chemistry and Physics reconciling a long-standing 30% discrepancy between MODIS retrievals and aircraft-measured droplet number, now cited 48 times.',
        'Wrote and won a £310,000 NERC standard grant as co-investigator, funding two field campaigns and a research software engineer.',
        'Released the retrieval-comparison toolkit as open source; it has been adopted by four other groups and is a dependency of two published studies.',
      ],
      tags: ['NERC', 'Remote sensing', 'Python'],
    },
    {
      role: 'Postdoctoral Research Associate',
      company: 'University of Manchester, Centre for Atmospheric Science',
      location: 'Manchester, UK',
      start: '2020-01',
      end: '2022-09',
      description:
        'Worked on the FAAM aircraft observation programme; responsible for cloud physics instrument calibration and data reduction across nine campaigns.',
      achievements: [
        'Rebuilt the calibration pipeline for the cloud droplet probe, cutting the post-campaign data turnaround from about six weeks to nine days.',
        'Co-authored six papers over three years, two of them in Journal of Geophysical Research: Atmospheres.',
      ],
    },
  ],
  education: [
    {
      degree: 'PhD',
      field: 'Atmospheric Physics',
      institution: 'University of Leeds',
      location: 'Leeds, UK',
      start: '2016-10',
      end: '2019-12',
      description:
        'Thesis: "Constraining aerosol indirect effects in marine stratocumulus using paired satellite and airborne observations." Supervisors: Prof. A. Rowntree and Dr S. Iqbal.',
    },
    {
      degree: 'MPhys',
      field: 'Physics',
      institution: 'University of Bristol',
      location: 'Bristol, UK',
      start: '2012-09',
      end: '2016-06',
      grade: 'First class',
    },
  ],
  skills: [
    { category: 'Research', name: 'Satellite retrieval validation', level: 'expert' },
    { category: 'Research', name: 'Airborne instrument calibration', level: 'expert' },
    { category: 'Research', name: 'Radiative transfer modelling', level: 'advanced' },
    { category: 'Research', name: 'Bayesian inverse methods', level: 'advanced' },
    { category: 'Computing', name: 'Python (xarray, dask)', level: 'expert' },
    { category: 'Computing', name: 'Fortran', level: 'intermediate' },
    { category: 'Computing', name: 'HPC and job scheduling', level: 'advanced' },
    { category: 'Academic', name: 'Grant writing', level: 'advanced' },
    { category: 'Academic', name: 'PhD supervision', level: 'intermediate' },
    { category: 'Academic', name: 'Undergraduate lecturing', level: 'intermediate' },
  ],
  languages: [
    { name: 'English', level: 'native' },
    { name: 'Japanese', level: 'native' },
    { name: 'German', level: 'limited-working' },
  ],
  publications: [
    {
      title:
        'Reconciling satellite and in-situ estimates of cloud droplet number in marine stratocumulus',
      publisher: 'Atmospheric Chemistry and Physics',
      date: '2024-03',
      description: 'First author. 48 citations.',
    },
    {
      title: 'A calibration framework for airborne cloud droplet probes',
      publisher: 'Atmospheric Measurement Techniques',
      date: '2022-06',
      description: 'First author.',
    },
    {
      title: 'Aerosol indirect effects over the North Atlantic: a nine-campaign synthesis',
      publisher: 'Journal of Geophysical Research: Atmospheres',
      date: '2021-11',
      description: 'Third of seven authors.',
    },
  ],
  interests: ['Hill running', 'Amateur radio'],
});

const HR_MANAGER = build({
  id: 'hr-manager',
  label: 'HR manager',
  firstName: 'Rachel',
  lastName: 'Adeyemi',
  title: 'HR Business Partner',
  location: 'Manchester, UK',
  linkedin: 'linkedin.com/in/rachel-adeyemi',
  summary:
    'HR business partner supporting a 600-person commercial and engineering population through two years of fast hiring and one restructure. Chartered MCIPD. My work is mostly the unglamorous half of the function — getting managers to have the conversation early, making pay bands defensible, and keeping the case work clean enough that it never becomes a tribunal.',
  experience: [
    {
      role: 'HR Business Partner',
      company: 'Halden Engineering Group',
      location: 'Manchester, UK',
      start: '2021-04',
      description:
        'Partner to the commercial and engineering directors, covering 600 employees across three sites. One HR advisor reporting in.',
      achievements: [
        'Rebuilt the pay framework onto seven bands with published criteria, closing a gender pay gap of 8.9% to 2.4% over two review cycles.',
        'Ran a 45-role restructure to completion with full consultation, one settlement agreement and no claims.',
        'Cut voluntary turnover in the engineering population from 19% to 11% by acting on exit-interview themes — the fix turned out to be the promotion process, not pay.',
      ],
      tags: ['ER', 'Reward', 'TUPE'],
    },
    {
      role: 'HR Advisor',
      company: 'Northbrook Retail',
      location: 'Leeds, UK',
      start: '2018-02',
      end: '2021-03',
      description:
        'Generalist advisory across 20 stores, roughly 800 employees, with an employee relations caseload of 15 to 25 live matters.',
      achievements: [
        'Introduced a manager coaching clinic before formal process; formal disciplinary cases fell by roughly a third in the first year.',
        'Led the move to a new HRIS across 20 sites, including data cleansing of 1,100 records and manager training.',
      ],
    },
  ],
  education: [
    {
      degree: 'CIPD Level 7 Advanced Diploma',
      field: 'Human Resource Management',
      institution: 'Manchester Metropolitan University',
      location: 'Manchester, UK',
      start: '2017-09',
      end: '2019-07',
    },
    {
      degree: 'BA',
      field: 'Psychology',
      institution: 'University of Sheffield',
      location: 'Sheffield, UK',
      start: '2013-09',
      end: '2016-06',
      grade: '2:1',
    },
  ],
  skills: [
    { category: 'Employee relations', name: 'Disciplinary and grievance', level: 'expert' },
    { category: 'Employee relations', name: 'Redundancy and consultation', level: 'expert' },
    { category: 'Employee relations', name: 'TUPE', level: 'advanced' },
    { category: 'Reward', name: 'Pay banding and benchmarking', level: 'advanced' },
    { category: 'Reward', name: 'Gender pay gap reporting', level: 'advanced' },
    { category: 'Talent', name: 'Succession planning', level: 'advanced' },
    { category: 'Talent', name: 'Manager coaching', level: 'expert' },
    { category: 'Systems', name: 'Workday', level: 'intermediate' },
  ],
  languages: [{ name: 'English', level: 'native' }],
  certifications: [
    { name: 'Chartered MCIPD', issuer: 'CIPD', date: '2020-01' },
    { name: 'Mental Health First Aider', issuer: 'MHFA England', date: '2022-05' },
  ],
  interests: ['Bouldering', 'Community mediation volunteering'],
});

const PHOTOGRAPHER = build({
  id: 'photographer',
  label: 'Photographer',
  firstName: 'Léa',
  lastName: 'Moreau',
  title: 'Editorial & Documentary Photographer',
  location: 'Marseille, France',
  website: 'leamoreau.example.com',
  summary:
    'Editorial and documentary photographer, eleven years freelance, working mostly on long-form commissions around migration and coastal industry in the western Mediterranean. Published by Le Monde, Geo and The Guardian. I shoot, edit and sequence my own work, and I am comfortable running a commission end to end including fixers, permits and post.',
  experience: [
    {
      role: 'Freelance Photographer',
      company: 'Self-employed',
      location: 'Marseille, France',
      start: '2016-01',
      description:
        'Editorial, documentary and NGO commissions. Roughly 25 assignments a year, half of them multi-day, across France, Italy, Morocco and Tunisia.',
      achievements: [
        '"The Last Trawlers" — an eighteen-month documentary project on the decline of the Gulf of Lion fishing fleet, published as a twelve-page feature in Geo and exhibited at Les Rencontres d’Arles.',
        'Regular contributor to Le Monde’s weekend supplement since 2019; fourteen commissioned features, three of them cover stories.',
        'Built and ran a two-person production setup for NGO work, delivering edited, captioned and consent-cleared sets within 48 hours of leaving the field.',
      ],
      tags: ['Documentary', 'Editorial', 'Reportage'],
    },
    {
      role: 'Staff Photographer',
      company: 'La Provence',
      location: 'Marseille, France',
      start: '2013-03',
      end: '2015-12',
      description:
        'Regional daily. News, sport and features on a same-day turnaround, typically three assignments a day.',
      achievements: [
        'Covered the 2014 flooding across the Var, filing from the field for four consecutive front pages.',
        'Set up the picture desk’s first shared metadata and captioning standard, still in use.',
      ],
    },
  ],
  education: [
    {
      degree: 'Diplôme',
      field: 'Photography',
      institution: 'École Nationale Supérieure de la Photographie',
      location: 'Arles, France',
      start: '2009-09',
      end: '2012-06',
    },
  ],
  skills: [
    { category: 'Shooting', name: 'Documentary and reportage', level: 'expert' },
    { category: 'Shooting', name: 'Environmental portraiture', level: 'expert' },
    { category: 'Shooting', name: 'Available-light and mixed-light', level: 'expert' },
    { category: 'Shooting', name: 'Studio lighting', level: 'intermediate' },
    { category: 'Post', name: 'Capture One', level: 'expert' },
    { category: 'Post', name: 'Sequencing and edit', level: 'expert' },
    { category: 'Post', name: 'Colour management for print', level: 'advanced' },
    { category: 'Production', name: 'Fixers and permits', level: 'advanced' },
    { category: 'Production', name: 'Consent and ethics in the field', level: 'expert' },
  ],
  languages: [
    { name: 'French', level: 'native' },
    { name: 'English', level: 'full-professional' },
    { name: 'Italian', level: 'limited-working' },
    { name: 'Arabic', level: 'elementary' },
  ],
  projects: [
    {
      name: 'The Last Trawlers',
      role: 'Photographer and author',
      description:
        'Eighteen months with four crews out of Port-de-Bouc, following the fleet through the 2022 quota changes.',
      highlights: [
        'Twelve-page feature in Geo, September 2023.',
        'Exhibited at Les Rencontres d’Arles, 2024.',
      ],
    },
    {
      name: 'Crossing Seasons',
      role: 'Photographer',
      description:
        'A three-year record of seasonal agricultural workers in the Bouches-du-Rhône, made with and shown back to the communities photographed.',
      highlights: ['Shortlisted, Prix Roger Pic, 2022.'],
    },
  ],
  interests: ['Darkroom printing', 'Sailing'],
});

const DATA_SCIENTIST = build({
  id: 'data-scientist',
  label: 'Data scientist',
  firstName: 'Arjun',
  lastName: 'Rao',
  title: 'Senior Data Scientist',
  location: 'Berlin, Germany',
  linkedin: 'linkedin.com/in/arjun-rao',
  github: 'github.com/arjun-rao',
  summary:
    'Data scientist with eight years on forecasting and pricing problems, currently owning the demand model behind a €400M inventory position. I care more about whether a model survives contact with the business than about the last two points of accuracy — most of my measurable wins have come from fixing the feedback loop, not the estimator. I ship my own models and keep them running.',
  experience: [
    {
      role: 'Senior Data Scientist',
      company: 'Vellum Retail Group',
      location: 'Berlin, Germany',
      start: '2021-05',
      description:
        'Own demand forecasting and markdown pricing for 140,000 SKUs across nine countries. Two data scientists and an ML engineer.',
      achievements: [
        'Replaced a per-SKU ARIMA ensemble with a single global gradient-boosted model on hierarchical features, cutting weighted MAPE from 24% to 16% and training time from eleven hours to twenty minutes.',
        'Found and fixed a two-year-old leakage in the markdown model — promotion flags were being joined after the fact — which had been inflating backtest accuracy by roughly eight points.',
        'Built the monitoring that catches drift on 40 model segments; three silent failures caught in the first year, each within a day rather than at quarter end.',
      ],
      tags: ['Forecasting', 'Python', 'dbt', 'Airflow'],
    },
    {
      role: 'Data Scientist',
      company: 'Hafen Analytics',
      location: 'Hamburg, Germany',
      start: '2017-09',
      end: '2021-04',
      description:
        'Consultancy work across logistics and energy clients; typically two projects at a time, from scoping to handover.',
      achievements: [
        'Built a vessel arrival-time model for a port operator that reduced berth idle time by an estimated 6%, validated against a six-month holdout.',
        'Wrote the team’s project template — data contract, backtest protocol, handover checklist — after two engagements failed at handover; it was used on every project afterwards.',
      ],
    },
  ],
  education: [
    {
      degree: 'MSc',
      field: 'Statistics',
      institution: 'Humboldt-Universität zu Berlin',
      location: 'Berlin, Germany',
      start: '2015-10',
      end: '2017-07',
      grade: '1.3',
    },
    {
      degree: 'BSc',
      field: 'Mathematics',
      institution: 'University of Delhi',
      location: 'Delhi, India',
      start: '2011-07',
      end: '2014-06',
    },
  ],
  skills: [
    { category: 'Modelling', name: 'Time series forecasting', level: 'expert' },
    { category: 'Modelling', name: 'Gradient boosting', level: 'expert' },
    { category: 'Modelling', name: 'Causal inference', level: 'advanced' },
    { category: 'Modelling', name: 'Bayesian hierarchical models', level: 'advanced' },
    { category: 'Engineering', name: 'Python', level: 'expert' },
    { category: 'Engineering', name: 'SQL and dbt', level: 'expert' },
    { category: 'Engineering', name: 'Airflow', level: 'advanced' },
    { category: 'Engineering', name: 'Model monitoring', level: 'advanced' },
    { category: 'Working with people', name: 'Stakeholder framing', level: 'expert' },
    { category: 'Working with people', name: 'Mentoring', level: 'advanced' },
  ],
  languages: [
    { name: 'English', level: 'native' },
    { name: 'Hindi', level: 'native' },
    { name: 'German', level: 'full-professional' },
  ],
  projects: [
    {
      name: 'hierarchical-forecast',
      role: 'Maintainer',
      description:
        'A small Python package for reconciling forecasts across a product hierarchy, extracted from work at Vellum.',
      highlights: ['1.2k downloads a month.'],
    },
  ],
  interests: ['Go (baduk)', 'Bread'],
});

const SECURITY_ENGINEER = build({
  id: 'security-engineer',
  label: 'Security engineer',
  firstName: 'Tomas',
  lastName: 'Novak',
  title: 'Senior Security Engineer',
  location: 'Prague, Czechia',
  linkedin: 'linkedin.com/in/tomas-novak',
  github: 'github.com/tomas-novak',
  summary:
    'Security engineer working the detection and response side, currently running the platform that covers 4,000 endpoints and about 900 cloud accounts. My background is infrastructure, which is why most of what I build is aimed at making the secure path the easy one rather than adding another gate. On the incident rota; three P1s led to date.',
  experience: [
    {
      role: 'Senior Security Engineer',
      company: 'Radek Financial',
      location: 'Prague, Czechia',
      start: '2021-08',
      description:
        'Detection engineering and incident response for a regulated fintech: 4,000 endpoints, ~900 AWS accounts, 24/7 rota shared across six engineers.',
      achievements: [
        'Rewrote the detection library as version-controlled Sigma rules with CI backtesting; false positives fell from around 400 a week to 60 and mean time to triage from 34 minutes to 9.',
        'Led response on a business email compromise affecting eleven mailboxes — contained in under two hours, no funds lost, and the phishing-resistant MFA rollout that followed closed the class of attack.',
        'Built the AWS guardrail set as service control policies rather than detective controls, removing four recurring misconfiguration findings entirely from the quarterly audit.',
      ],
      tags: ['Detection engineering', 'AWS', 'Incident response'],
    },
    {
      role: 'Infrastructure Engineer',
      company: 'Vltava Hosting',
      location: 'Brno, Czechia',
      start: '2017-03',
      end: '2021-07',
      description:
        'Linux and network infrastructure for a hosting provider, moving into the security function over the last eighteen months.',
      achievements: [
        'Automated patch management across 1,200 hosts; time to patch a critical CVE went from a fortnight to under 72 hours.',
        'Ran the migration to mutual TLS between internal services, which is what made the later network segmentation work possible.',
      ],
    },
  ],
  education: [
    {
      degree: 'Bc.',
      field: 'Computer Science',
      institution: 'Masaryk University',
      location: 'Brno, Czechia',
      start: '2013-09',
      end: '2016-06',
    },
  ],
  skills: [
    { category: 'Detection', name: 'Sigma and detection-as-code', level: 'expert' },
    { category: 'Detection', name: 'SIEM engineering', level: 'expert' },
    { category: 'Detection', name: 'Threat hunting', level: 'advanced' },
    { category: 'Response', name: 'Incident command', level: 'advanced' },
    { category: 'Response', name: 'Forensics and triage', level: 'advanced' },
    { category: 'Cloud', name: 'AWS security services', level: 'expert' },
    { category: 'Cloud', name: 'Terraform', level: 'advanced' },
    { category: 'Cloud', name: 'Kubernetes hardening', level: 'advanced' },
    { category: 'Cloud', name: 'Python and Go tooling', level: 'advanced' },
  ],
  languages: [
    { name: 'Czech', level: 'native' },
    { name: 'English', level: 'full-professional' },
    { name: 'German', level: 'elementary' },
  ],
  certifications: [
    { name: 'GIAC Certified Detection Analyst (GCDA)', issuer: 'GIAC', date: '2022-09' },
    { name: 'AWS Certified Security – Specialty', issuer: 'Amazon Web Services', date: '2021-02' },
  ],
  interests: ['Capture-the-flag competitions', 'Cross-country skiing'],
});

/** The profiles authored for this purpose, keyed by id. */
/**
 * The career changer — the reader a functional CV is written for.
 *
 * Twelve years in secondary teaching, then a conversion into learning technology. Told
 * chronologically it reads as a teacher who recently changed jobs; told by competency it
 * reads as someone who has been designing instruction, running stakeholder programmes and
 * handling data protection the whole time. That inversion is the entire argument for the
 * format, so the sample has to be a CV where it actually makes a difference.
 */
const CAREER_CHANGER = build({
  id: 'career-changer',
  label: 'Career changer',
  firstName: 'Priya',
  lastName: 'Raghavan',
  title: 'Learning Experience Designer',
  location: 'Bristol, UK',
  linkedin: 'linkedin.com/in/priya-raghavan',
  summary:
    'Twelve years teaching secondary science, now designing learning for adults. The through-line is the same work in a different setting: finding out what people already believe, building something that changes it, and checking afterwards whether it did. I moved across deliberately rather than by accident, and the evidence below is grouped by what I do rather than by who was paying at the time.',
  competencies: [
    {
      name: 'Instructional design',
      description:
        'Designing and rebuilding courses against a stated learning outcome rather than a content list.',
      achievements: [
        'Rebuilt a two-day compliance course as four 40-minute modules with a scenario assessment; completion went from 61% to 94% and the pass rate on first attempt from 58% to 89%.',
        'Wrote the department scheme of work for GCSE combined science, used unchanged by six teachers across three years.',
        'Converted eleven face-to-face workshops to blended delivery during 2020 without dropping the practical assessment component.',
      ],
    },
    {
      name: 'Stakeholder and programme management',
      description:
        'Running work that depends on people who do not report to you and have their own deadlines.',
      achievements: [
        'Coordinated a 340-pupil curriculum change across four departments, chairing the working group and holding the timeline to a fixed exam-board deadline.',
        'Negotiated release time with six line managers to get subject experts into content review, which is what kept the technical accuracy sign-off inside two weeks.',
      ],
    },
    {
      name: 'Assessment and data',
      description: 'Measuring whether the thing worked, and changing it when it did not.',
      achievements: [
        'Built the departmental tracking spreadsheet that identified underperformance by topic rather than by pupil, redirecting revision time to the three weakest areas.',
        'Ran the post-course evaluation for the learning team: Kirkpatrick levels 1 and 2 for every course, level 3 for the two with a measurable operational outcome.',
      ],
    },
    {
      name: 'Safeguarding and data protection',
      achievements: [
        'Designated safeguarding lead for three years, including the referral process and the annual staff training.',
        'Completed the GDPR review of the learning platform before rollout, cutting retained personal data to what the lawful basis actually covered.',
      ],
    },
  ],
  experience: [
    {
      role: 'Learning Experience Designer',
      company: 'Meridian Care Group',
      location: 'Bristol, UK',
      start: '2024-02',
      description:
        'Designing statutory and clinical training for 2,100 care staff across 34 sites.',
      achievements: [
        'Owner of the mandatory training curriculum: eleven courses, rebuilt six of them in the first year against measured completion and pass-rate targets.',
      ],
    },
    {
      role: 'Head of Science',
      company: 'Ashfield Academy',
      location: 'Bristol, UK',
      start: '2019-09',
      end: '2024-01',
      description:
        'Curriculum, staffing and outcomes for a department of nine across three key stages.',
      achievements: [
        'Progress 8 score for the department moved from −0.21 to +0.34 over four years, against a roughly flat intake profile.',
      ],
    },
    {
      role: 'Teacher of Science',
      company: 'Ashfield Academy',
      location: 'Bristol, UK',
      start: '2012-09',
      end: '2019-08',
      description: 'Biology and combined science, key stages 3 to 5.',
      achievements: [],
    },
  ],
  education: [
    {
      degree: 'PGCE',
      field: 'Secondary Science',
      institution: 'University of Bristol',
      location: 'Bristol, UK',
      start: '2011-09',
      end: '2012-07',
    },
    {
      degree: 'BSc (Hons)',
      field: 'Biochemistry',
      institution: 'University of Leeds',
      location: 'Leeds, UK',
      start: '2008-09',
      end: '2011-06',
      grade: 'First class',
    },
  ],
  skills: [
    { category: 'Design', name: 'Backward design', level: 'expert' },
    { category: 'Design', name: 'Scenario-based assessment', level: 'advanced' },
    { category: 'Design', name: 'Accessibility (WCAG 2.2)', level: 'intermediate' },
    { category: 'Tools', name: 'Articulate Storyline', level: 'advanced' },
    { category: 'Tools', name: 'Moodle and Totara', level: 'advanced' },
    { category: 'Tools', name: 'Camtasia', level: 'intermediate' },
    { category: 'Evaluation', name: 'Kirkpatrick evaluation', level: 'advanced' },
    { category: 'Evaluation', name: 'Data analysis in Excel', level: 'advanced' },
  ],
  languages: [
    { name: 'English', level: 'native' },
    { name: 'Tamil', level: 'full-professional' },
    { name: 'French', level: 'limited-working' },
  ],
  certifications: [
    { name: 'Certified Professional in Talent Development (CPTD)', issuer: 'ATD', date: '2025-03' },
  ],
  interests: ['Open-water swimming', 'Science communication', 'Allotment'],
});

/**
 * The Europass reader: an EU policy officer whose application will be screened against a
 * standard form. Multilingual by necessity, which is the part of the format that the CEFR
 * grid exists to carry, and with competencies because the same person is a plausible
 * hybrid-CV subject too.
 */
const POLICY_OFFICER = build({
  id: 'policy-officer',
  label: 'Policy officer',
  firstName: 'Elena',
  lastName: 'Marchetti',
  title: 'Policy Officer, Environmental Regulation',
  location: 'Brussels, Belgium',
  linkedin: 'linkedin.com/in/elena-marchetti',
  summary:
    'Policy officer working on environmental regulation, currently on the implementation side of the packaging and packaging waste file. Seven years split between a national ministry and the Brussels institutions, which means I have drafted for both audiences and know where the two diverge. Working languages Italian, English and French; reading Spanish.',
  competencies: [
    {
      name: 'Legislative drafting',
      description: 'Turning a policy objective into text that survives legal scrutiny.',
      achievements: [
        'Drafted three implementing acts under the Waste Framework Directive, all adopted without substantive amendment at comitology.',
        'Led the legal-linguistic review across four language versions of a delegated act, resolving eleven divergences before publication.',
      ],
    },
    {
      name: 'Stakeholder consultation',
      achievements: [
        'Ran the public consultation on packaging waste targets: 1,240 responses, synthesised into a 40-page report inside six weeks.',
        'Chaired eight expert-group meetings with member-state representatives, including two where the mandate was contested.',
      ],
    },
    {
      name: 'Impact assessment',
      achievements: [
        'Built the cost model underlying the Commission impact assessment on reusable packaging, working with JRC on the sensitivity analysis.',
        'Presented the evidence base to the Regulatory Scrutiny Board; opinion returned positive at first reading.',
      ],
    },
  ],
  experience: [
    {
      role: 'Policy Officer',
      company: 'European Commission, DG Environment',
      location: 'Brussels, Belgium',
      start: '2021-09',
      description:
        'Implementation of the packaging and packaging waste file: implementing acts, expert groups and member-state liaison.',
      achievements: [
        'Case handler for three implementing acts from first draft to adoption, including the comitology procedure and the WTO TBT notification.',
        'Point of contact for nine member states on transposition questions, with a two-working-day response standard maintained across the year.',
      ],
    },
    {
      role: 'Legal and Policy Adviser',
      company: 'Ministry of Environment and Energy Security',
      location: 'Rome, Italy',
      start: '2018-01',
      end: '2021-08',
      description:
        'National transposition of EU environmental law, and the ministry position in Council working parties.',
      achievements: [
        'Prepared the Italian position for eighteen Council working-party meetings on the circular-economy package.',
        'Coordinated transposition of the Single-Use Plastics Directive, delivered four months inside the deadline.',
      ],
    },
  ],
  education: [
    {
      degree: 'LLM',
      field: 'European Law',
      institution: 'College of Europe',
      location: 'Bruges, Belgium',
      start: '2016-09',
      end: '2017-06',
    },
    {
      degree: 'Laurea Magistrale',
      field: 'Giurisprudenza',
      institution: 'Università di Bologna',
      location: 'Bologna, Italy',
      start: '2011-09',
      end: '2016-07',
      grade: '110/110 cum laude',
    },
  ],
  skills: [
    { category: 'Policy', name: 'Legislative drafting', level: 'expert' },
    { category: 'Policy', name: 'Impact assessment', level: 'advanced' },
    { category: 'Policy', name: 'Comitology procedure', level: 'expert' },
    { category: 'Policy', name: 'Infringement procedure', level: 'intermediate' },
    { category: 'Analysis', name: 'Cost-benefit modelling', level: 'advanced' },
    { category: 'Analysis', name: 'Stakeholder mapping', level: 'advanced' },
    { category: 'Digital', name: 'Excel modelling', level: 'advanced' },
    { category: 'Digital', name: 'Decide and CIRCABC', level: 'advanced' },
  ],
  languages: [
    { name: 'Italian', level: 'native' },
    { name: 'English', level: 'full-professional' },
    { name: 'French', level: 'professional-working' },
    { name: 'Spanish', level: 'limited-working' },
  ],
  certifications: [
    { name: 'EU Law and Policy Making', issuer: 'European Institute of Public Administration', date: '2019-11' },
  ],
  interests: ['Choral singing', 'Long-distance cycling'],
});

export const AUTHORED_PROFILES: { id: string; label: string; cv: CVData }[] = [
  { id: 'operations-director', label: 'Operations director', cv: OPERATIONS_DIRECTOR },
  { id: 'solicitor', label: 'Solicitor', cv: SOLICITOR },
  { id: 'researcher', label: 'Academic researcher', cv: RESEARCHER },
  { id: 'hr-manager', label: 'HR manager', cv: HR_MANAGER },
  { id: 'photographer', label: 'Photographer', cv: PHOTOGRAPHER },
  { id: 'data-scientist', label: 'Data scientist', cv: DATA_SCIENTIST },
  { id: 'security-engineer', label: 'Security engineer', cv: SECURITY_ENGINEER },
  { id: 'career-changer', label: 'Career changer', cv: CAREER_CHANGER },
  { id: 'policy-officer', label: 'Policy officer', cv: POLICY_OFFICER },
];
