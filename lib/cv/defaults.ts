import { uid } from '@/lib/utils/id';
import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { defaultSectionConfigs } from './sections';
import { cvCustomizationSchema, cvDataSchema, type CVCustomization, type CVData } from '@/types/cv';

/**
 * A blank but structurally valid CV, written in `language`.
 *
 * The language is read off the overrides rather than taken as a second argument, so the
 * one place that knows it — whichever caller is creating the document for a signed-in
 * user — passes it the same way it passes everything else.
 */
export function createEmptyCV(overrides: Partial<CVData> = {}): CVData {
  const language = overrides.language ?? DEFAULT_LOCALE;
  const base = cvDataSchema.parse({
    language,
    personal: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    projects: [],
    certifications: [],
    awards: [],
    volunteer: [],
    publications: [],
    interests: [],
    references: [],
    customSections: [],
    sections: defaultSectionConfigs(language),
  });
  return { ...base, ...overrides };
}

export function createDefaultCustomization(
  overrides: Partial<CVCustomization> = {},
): CVCustomization {
  return cvCustomizationSchema.parse({ ...overrides });
}

/**
 * A realistic, fully-populated CV.
 *
 * Used for: template gallery previews, the `/templates/[slug]` pages, PDF regression
 * tests and the "start from example" action in the editor. Keeping one canonical
 * example means every template is exercised against the same non-trivial content —
 * long descriptions, many skills, several jobs, multi-page overflow.
 */
export function createSampleCV(): CVData {
  return cvDataSchema.parse({
    personal: {
      firstName: 'Amina',
      lastName: 'El Fassi',
      title: 'Senior Product Designer',
      email: 'amina.elfassi@example.com',
      phone: '+212 6 12 34 56 78',
      location: 'Casablanca, Morocco',
      // example.com is the domain reserved for exactly this. A plausible-looking real
      // one on 56 marketing pages is somebody else's website.
      website: 'aminaelfassi.example.com',
      linkedin: 'linkedin.com/in/aminaelfassi',
      github: 'github.com/aminaelfassi',
      photoUrl: '',
      links: [{ id: uid(), label: 'Dribbble', url: 'dribbble.example.com/aminaelfassi' }],
    },
    summary:
      'Senior product designer with nine years of experience shaping B2B SaaS products used by more than two million people. I pair rigorous discovery with fast, high-fidelity prototyping, and I am happiest when a design decision can be traced back to a measured user outcome. Previously led the design system that unified four product surfaces at Atlas Cloud, cutting new-feature design time by 40%.',
    experience: [
      {
        id: uid(),
        role: 'Senior Product Designer',
        company: 'Atlas Cloud',
        location: 'Casablanca, Morocco',
        startDate: '2021-03',
        endDate: '',
        current: true,
        description:
          'Design lead for the Workspace pillar — onboarding, billing and the admin console — supporting 2.1M monthly active users across web and mobile.',
        achievements: [
          'Rebuilt the self-serve onboarding flow, lifting activation from 34% to 58% within two quarters.',
          'Created and shipped the Atlas Design System (180 components, 3 platforms), reducing time-to-first-prototype by 40%.',
          'Introduced a fortnightly research cadence; 46 studies run in 18 months now inform the roadmap.',
          'Mentored four designers, two of whom were promoted to senior level.',
        ],
        tags: ['Design systems', 'Onboarding', 'B2B SaaS'],
      },
      {
        id: uid(),
        role: 'Product Designer',
        company: 'Medina Labs',
        location: 'Rabat, Morocco',
        startDate: '2018-06',
        endDate: '2021-02',
        current: false,
        description:
          'Second designer in a 25-person fintech startup. Owned the merchant-facing dashboard end to end, from problem framing through to shipped interface.',
        achievements: [
          'Shipped a reconciliation dashboard that cut average support tickets per merchant by 31%.',
          'Ran the first accessibility audit in company history and closed 92% of WCAG AA issues.',
          'Established the component library that the engineering team still builds on today.',
        ],
        tags: ['Fintech', 'Dashboards', 'Accessibility'],
      },
      {
        id: uid(),
        role: 'UI Designer',
        company: 'Studio Nord',
        location: 'Lyon, France',
        startDate: '2016-09',
        endDate: '2018-05',
        current: false,
        description:
          'Agency work across fifteen client engagements in retail, travel and public sector, from brand-led marketing sites to internal tooling.',
        achievements: [
          'Delivered a booking flow redesign that increased completed reservations by 22%.',
          'Standardised the studio’s handoff process, halving design-to-development clarification cycles.',
        ],
        tags: ['Agency', 'E-commerce'],
      },
    ],
    education: [
      {
        id: uid(),
        degree: 'MSc',
        field: 'Human–Computer Interaction',
        institution: 'Université Grenoble Alpes',
        location: 'Grenoble, France',
        startDate: '2014-09',
        endDate: '2016-06',
        current: false,
        grade: 'Mention Bien',
        description:
          'Thesis on trust signals in financial interfaces, supervised by the LIG research group.',
      },
      {
        id: uid(),
        degree: 'BSc',
        field: 'Computer Science',
        institution: 'Université Mohammed V',
        location: 'Rabat, Morocco',
        startDate: '2011-09',
        endDate: '2014-06',
        current: false,
        grade: '',
        description: '',
      },
    ],
    skills: [
      { id: uid(), name: 'Product discovery', level: 'expert', category: 'Practice' },
      { id: uid(), name: 'Interaction design', level: 'expert', category: 'Practice' },
      { id: uid(), name: 'Design systems', level: 'expert', category: 'Practice' },
      { id: uid(), name: 'User research', level: 'advanced', category: 'Practice' },
      { id: uid(), name: 'Accessibility (WCAG)', level: 'advanced', category: 'Practice' },
      { id: uid(), name: 'Figma', level: 'expert', category: 'Tools' },
      { id: uid(), name: 'Framer', level: 'advanced', category: 'Tools' },
      { id: uid(), name: 'Rive', level: 'intermediate', category: 'Tools' },
      { id: uid(), name: 'HTML & CSS', level: 'advanced', category: 'Engineering' },
      { id: uid(), name: 'React', level: 'intermediate', category: 'Engineering' },
      { id: uid(), name: 'Design tokens', level: 'advanced', category: 'Engineering' },
      { id: uid(), name: 'Workshop facilitation', level: 'advanced', category: 'Leadership' },
    ],
    languages: [
      { id: uid(), name: 'Arabic', level: 'native' },
      { id: uid(), name: 'French', level: 'full-professional' },
      { id: uid(), name: 'English', level: 'full-professional' },
      { id: uid(), name: 'Spanish', level: 'limited-working' },
    ],
    projects: [
      {
        id: uid(),
        name: 'Souk Kit',
        role: 'Creator',
        startDate: '2022-01',
        endDate: '',
        url: 'soukkit.design',
        description:
          'An open-source UI kit for North African e-commerce, with first-class RTL support and Arabic type pairing guidance.',
        highlights: [
          '4.1k GitHub stars and 60+ contributors.',
          'Adopted by three regional marketplaces.',
        ],
        tags: ['Open source', 'RTL', 'Design system'],
      },
      {
        id: uid(),
        name: 'Tafoukt',
        role: 'Designer & front-end',
        startDate: '2020-04',
        endDate: '2020-11',
        url: '',
        description:
          'A volunteer-built platform matching solar installers with rural cooperatives; designed and built the entire front end.',
        highlights: ['Deployed across 12 cooperatives in the Souss-Massa region.'],
        tags: ['Civic tech'],
      },
    ],
    certifications: [
      {
        id: uid(),
        name: 'Certified Professional in Accessibility Core Competencies (CPACC)',
        issuer: 'IAAP',
        date: '2022-05',
        expiryDate: '',
        credentialId: 'CPACC-2022-4417',
        url: '',
      },
      {
        id: uid(),
        name: 'Nielsen Norman Group UX Certification',
        issuer: 'NN/g',
        date: '2019-11',
        expiryDate: '',
        credentialId: '',
        url: '',
      },
    ],
    awards: [
      {
        id: uid(),
        title: 'Awwwards Site of the Day',
        issuer: 'Awwwards',
        date: '2021-08',
        description: 'For the Atlas Cloud marketing relaunch.',
      },
      {
        id: uid(),
        title: 'Best Student Thesis, HCI',
        issuer: 'Université Grenoble Alpes',
        date: '2016-06',
        description: '',
      },
    ],
    volunteer: [
      {
        id: uid(),
        role: 'Design mentor',
        organization: 'ADPlist',
        location: 'Remote',
        startDate: '2020-01',
        endDate: '',
        current: true,
        description:
          'Over 300 hours of one-to-one mentoring for designers entering the industry, with a focus on the MENA region.',
      },
    ],
    publications: [
      {
        id: uid(),
        title: 'Designing trust into cross-border payment interfaces',
        publisher: 'Smashing Magazine',
        date: '2023-02',
        url: '',
        authors: 'Amina El Fassi',
        description:
          'A field study of how visual and copy signals change completion rates in remittance flows.',
      },
    ],
    interests: [
      { id: uid(), name: 'Analogue photography', description: '' },
      { id: uid(), name: 'Long-distance running', description: '' },
      { id: uid(), name: 'Arabic calligraphy', description: '' },
    ],
    references: [
      {
        id: uid(),
        name: 'Youssef Benali',
        role: 'VP Product',
        company: 'Atlas Cloud',
        email: 'y.benali@example.com',
        phone: '',
        relationship: 'Direct manager',
      },
    ],
    customSections: [],
    sections: [
      { id: 'summary', label: 'Profile', enabled: true },
      { id: 'experience', label: 'Experience', enabled: true },
      { id: 'education', label: 'Education', enabled: true },
      { id: 'skills', label: 'Skills', enabled: true },
      { id: 'projects', label: 'Projects', enabled: true },
      { id: 'certifications', label: 'Certifications', enabled: true },
      { id: 'languages', label: 'Languages', enabled: true },
      { id: 'awards', label: 'Awards', enabled: true },
      { id: 'volunteer', label: 'Volunteering', enabled: true },
      { id: 'publications', label: 'Publications', enabled: true },
      { id: 'interests', label: 'Interests', enabled: true },
      { id: 'references', label: 'References', enabled: false },
    ],
  });
}

/**
 * A deliberately short CV — one page, few sections. Used by the PDF test suite to
 * verify that templates do not collapse or leave orphan headings when content is thin.
 */
export function createMinimalCV(): CVData {
  return cvDataSchema.parse({
    personal: {
      firstName: 'Sam',
      lastName: 'Rivera',
      title: 'Junior Data Analyst',
      email: 'sam.rivera@example.com',
      phone: '+1 555 0147',
      location: 'Austin, TX',
      website: '',
      linkedin: '',
      github: '',
      photoUrl: '',
      links: [],
    },
    summary:
      'Recent statistics graduate looking for a first analyst role. Comfortable with SQL, Python and dashboarding.',
    experience: [
      {
        id: uid(),
        role: 'Data Intern',
        company: 'Northline Retail',
        location: 'Austin, TX',
        startDate: '2024-06',
        endDate: '2024-09',
        current: false,
        description: 'Built weekly sales reporting for a 40-store retail chain.',
        achievements: ['Automated a manual report that took eight hours per week.'],
        tags: [],
      },
    ],
    education: [
      {
        id: uid(),
        degree: 'BSc',
        field: 'Statistics',
        institution: 'University of Texas at Austin',
        location: 'Austin, TX',
        startDate: '2021-09',
        endDate: '2025-05',
        current: false,
        grade: '3.7 GPA',
        description: '',
      },
    ],
    skills: [
      { id: uid(), name: 'SQL', level: 'advanced', category: '' },
      { id: uid(), name: 'Python', level: 'intermediate', category: '' },
      { id: uid(), name: 'Tableau', level: 'intermediate', category: '' },
    ],
    languages: [{ id: uid(), name: 'English', level: 'native' }],
    projects: [],
    certifications: [],
    awards: [],
    volunteer: [],
    publications: [],
    interests: [],
    references: [],
    customSections: [],
    sections: defaultSectionConfigs(),
  });
}
