/**
 * Seeds a fresh Firebase project so the app is usable the moment it boots.
 *
 *   npm run seed
 *   npm run seed -- --demo-user demo@example.com --demo-password 'a-strong-password'
 *
 * What it writes:
 *   • `settings/site`      — pricing, feature flags and copy the admin console reads.
 *   • `templates/{id}`     — usage-tracking stubs for the 56 code-defined templates, so
 *                            the admin templates page has rows before anyone signs up.
 *   • a demo account       — optional; creates a verified user with two realistic CVs.
 *
 * Everything is idempotent: run it as many times as you like.
 */
import { arg, adminApp, auth, db, loadEnv } from './lib/bootstrap.ts';

loadEnv();

/* -------------------------------------------------------------------------- */
/* Template metadata                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The registry lives in TypeScript that imports React components, which plain Node
 * cannot execute. Rather than build the app just to seed it, the generated registry file
 * is parsed for the fields the admin console needs.
 */
async function readTemplateMeta(): Promise<
  { id: string; slug: string; name: string; category: string; premium: boolean }[]
> {
  const { readFileSync, readdirSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { projectRoot } = await import('./lib/bootstrap.ts');

  const root = join(projectRoot, 'components', 'cv', 'templates');
  if (!existsSync(root)) return [];

  const results: { id: string; slug: string; name: string; category: string; premium: boolean }[] = [];

  for (const category of readdirSync(root)) {
    const dir = join(root, category);
    let files: string[];
    try {
      files = readdirSync(dir).filter((file) => file.endsWith('.tsx'));
    } catch {
      continue;
    }

    for (const file of files) {
      const source = readFileSync(join(dir, file), 'utf8');
      const id = /id:\s*'([^']+)'/.exec(source)?.[1];
      const slug = /slug:\s*'([^']+)'/.exec(source)?.[1];
      const name = /name:\s*'([^']+)'/.exec(source)?.[1];
      const premium = /premium:\s*(true|false)/.exec(source)?.[1] === 'true';
      if (id && slug && name) results.push({ id, slug, name, category, premium });
    }
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

async function seedSettings(): Promise<void> {
  await db()
    .collection('settings')
    .doc('site')
    .set(
      {
        maintenanceMode: false,
        registrationOpen: true,
        announcement: null,
        supportEmail: process.env.SUPPORT_EMAIL ?? 'support@createcvonline.com',
        seededAt: new Date().toISOString(),
      },
      { merge: true },
    );
  console.log('✓ settings/site');
}

async function seedTemplates(): Promise<void> {
  const templates = await readTemplateMeta();
  if (templates.length === 0) {
    console.log('· no template files found — skipping template stubs');
    return;
  }

  const batchSize = 400;
  for (let index = 0; index < templates.length; index += batchSize) {
    const batch = db().batch();
    for (const template of templates.slice(index, index + batchSize)) {
      batch.set(
        db().collection('templates').doc(template.id),
        {
          id: template.id,
          slug: template.slug,
          name: template.name,
          category: template.category,
          premium: template.premium,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }
    await batch.commit();
  }

  console.log(`✓ templates — ${templates.length} entries`);
}

/* -------------------------------------------------------------------------- */
/* Demo account                                                               */
/* -------------------------------------------------------------------------- */

function uid(): string {
  return globalThis.crypto.randomUUID();
}

function demoCV(templateId: string, accentColor: string) {
  const now = new Date().toISOString();
  return {
    title: templateId === 'modern-01' ? 'Product Designer — general' : 'Product Designer — startups',
    createdAt: now,
    updatedAt: now,
    shareId: null,
    isPublic: false,
    downloadCount: 0,
    lastDownloadedAt: null,
    customization: {
      templateId,
      accentColor,
      secondaryColor: '#0a0e18',
      textColor: '#1f2430',
      headingFont: 'inter',
      bodyFont: 'inter',
      fontSize: 10.5,
      lineHeight: 1.5,
      sectionSpacing: 18,
      pageMargin: 44,
      paperSize: 'a4',
      headingCase: 'uppercase',
      showPhoto: true,
      photoShape: 'circle',
      showIcons: true,
      dateFormat: 'month-year-short',
      skillDisplay: 'bars',
    },
    data: {
      personal: {
        firstName: 'Amina',
        lastName: 'El Fassi',
        title: 'Senior Product Designer',
        email: 'amina.elfassi@example.com',
        phone: '+212 6 12 34 56 78',
        location: 'Casablanca, Morocco',
        website: 'aminaelfassi.design',
        linkedin: 'linkedin.com/in/aminaelfassi',
        github: '',
        photoUrl: '',
        links: [],
      },
      summary:
        'Senior product designer with nine years of experience shaping B2B SaaS products used by more than two million people. I pair rigorous discovery with fast, high-fidelity prototyping, and I am happiest when a design decision can be traced back to a measured user outcome.',
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
            'Design lead for the Workspace pillar — onboarding, billing and the admin console.',
          achievements: [
            'Rebuilt the self-serve onboarding flow, lifting activation from 34% to 58% within two quarters.',
            'Created and shipped a 180-component design system, cutting time-to-first-prototype by 40%.',
          ],
          tags: ['Design systems', 'Onboarding'],
        },
        {
          id: uid(),
          role: 'Product Designer',
          company: 'Medina Labs',
          location: 'Rabat, Morocco',
          startDate: '2018-06',
          endDate: '2021-02',
          current: false,
          description: 'Second designer in a 25-person fintech startup.',
          achievements: [
            'Shipped a reconciliation dashboard that cut support tickets per merchant by 31%.',
          ],
          tags: ['Fintech'],
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
          description: '',
        },
      ],
      skills: [
        { id: uid(), name: 'Product discovery', level: 'expert', category: 'Practice' },
        { id: uid(), name: 'Design systems', level: 'expert', category: 'Practice' },
        { id: uid(), name: 'Figma', level: 'expert', category: 'Tools' },
        { id: uid(), name: 'Accessibility (WCAG)', level: 'advanced', category: 'Practice' },
        { id: uid(), name: 'HTML & CSS', level: 'advanced', category: 'Engineering' },
      ],
      languages: [
        { id: uid(), name: 'Arabic', level: 'native' },
        { id: uid(), name: 'French', level: 'full-professional' },
        { id: uid(), name: 'English', level: 'full-professional' },
      ],
      projects: [],
      certifications: [],
      awards: [],
      volunteer: [],
      publications: [],
      interests: [],
      references: [],
      customSections: [],
      sections: [
        { id: 'summary', label: 'Profile', enabled: true },
        { id: 'experience', label: 'Experience', enabled: true },
        { id: 'education', label: 'Education', enabled: true },
        { id: 'skills', label: 'Skills', enabled: true },
        { id: 'languages', label: 'Languages', enabled: true },
        { id: 'projects', label: 'Projects', enabled: false },
        { id: 'certifications', label: 'Certifications', enabled: false },
        { id: 'awards', label: 'Awards', enabled: false },
        { id: 'volunteer', label: 'Volunteer Experience', enabled: false },
        { id: 'publications', label: 'Publications', enabled: false },
        { id: 'interests', label: 'Interests', enabled: false },
        { id: 'references', label: 'References', enabled: false },
      ],
    },
  };
}

async function seedDemoUser(email: string, password: string): Promise<void> {
  let user = await auth()
    .getUserByEmail(email)
    .catch(() => null);

  if (!user) {
    user = await auth().createUser({
      email,
      password,
      displayName: 'Amina El Fassi',
      emailVerified: true,
    });
    console.log(`✓ created demo user ${email}`);
  } else {
    console.log(`· demo user ${email} already exists`);
  }

  const now = new Date().toISOString();
  await db()
    .collection('users')
    .doc(user.uid)
    .set(
      {
        uid: user.uid,
        email,
        displayName: 'Amina El Fassi',
        photoURL: '',
        role: 'user',
        emailVerified: true,
        entitlement: {
          plan: 'free',
          status: 'none',
          currentPeriodEnd: null,
          lastPaymentId: null,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
        cvCount: 2,
        downloadsThisMonth: 0,
        downloadsPeriod: '',
        marketingOptIn: false,
        locale: 'en',
      },
      { merge: true },
    );

  const cvs = db().collection('users').doc(user.uid).collection('cvs');
  const existing = await cvs.limit(1).get();
  if (existing.empty) {
    await cvs.add({ ...demoCV('modern-01', '#1f3af5'), ownerId: user.uid });
    await cvs.add({ ...demoCV('modern-03', '#0d9488'), ownerId: user.uid });
    console.log('✓ created 2 demo CVs');
  } else {
    console.log('· demo CVs already present');
  }
}

/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  adminApp();
  console.log('Seeding Firestore…\n');

  await seedSettings();
  await seedTemplates();

  const demoEmail = arg('demo-user');
  const demoPassword = arg('demo-password');
  if (demoEmail) {
    if (!demoPassword || demoPassword.length < 8) {
      console.error('✗ --demo-password is required and must be at least 8 characters.');
      process.exit(1);
    }
    await seedDemoUser(demoEmail, demoPassword);
  }

  console.log('\nDone. Next: `npm run set-admin -- --all-from-env` to grant yourself admin access.');
}

main().catch((error: unknown) => {
  console.error('\n✗ Seed failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
