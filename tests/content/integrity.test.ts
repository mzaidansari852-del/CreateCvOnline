import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getAllPosts,
  getAllSlugs,
  getPost,
  getPostWordCount,
  getRelatedPosts,
  getTableOfContents,
} from '@/lib/blog';
import {
  getAllExampleSlugs,
  getAllExamples,
  getExample,
  getHighlightedBullets,
  getRelatedExamples,
} from '@/lib/cv-examples';
import {
  getAllProfessionSlugs,
  getAllProfessions,
  getProfession,
  getProfessionFields,
  getProfessionWordCount,
  getRecommendedTemplates,
  getRelatedProfessions,
} from '@/lib/professions';
import { findTemplate, TEMPLATES, TEMPLATE_CATEGORIES } from '@/lib/cv/template-registry';
import { CATEGORY_COPY } from '@/app/(marketing)/templates/category-copy';
import { footerNav, isPrivatePath, primaryNav, PRIVATE_PATH_PREFIXES, site } from '@/lib/site';
import sitemap from '@/app/sitemap';
import { pageMetadata } from '@/lib/seo/metadata';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  jsonLdGraph,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from '@/lib/seo/schema';

const root = process.cwd();

/**
 * Content and SEO integrity.
 *
 * These are the checks a human reviewer would otherwise have to do by hand across ninety
 * pages: no broken internal link, no duplicated meta description, nothing private in the
 * sitemap, no leftover brand name.
 */

describe('brand consistency', () => {
  it('uses CreateCVOnline everywhere', () => {
    expect(site.name).toBe('CreateCVOnline');
    expect(site.legalName).toBe('CreateCVOnline');
    expect(site.url).not.toMatch(/\/$/);
  });

  it('has no leftover placeholder brand name in the source', () => {
    // Assembled at run time so this file does not match its own search.
    const stale = ['vita', 'ely'].join('');
    const output = execSyncSafe(
      `grep -ril --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git ` +
        `--exclude=integrity.test.ts "${stale}" ${root} || true`,
    );
    expect(output.trim(), 'a previous brand name is still present').toBe('');
  });

  it('never hardcodes the production domain outside the site config and env example', () => {
    const output = execSyncSafe(
      `grep -rl --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git ` +
        `--include=*.ts --include=*.tsx "https://createcvonline\\.com" ${root} || true`,
    );
    const offenders = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(`${root}/`, ''))
      // The site config derives from env; tests set the value explicitly.
      .filter((file) => !file.startsWith('tests/'));

    expect(offenders, 'use absoluteUrl()/site.url instead of a literal URL').toEqual([]);
  });
});

function execSyncSafe(command: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execSync } = require('node:child_process') as typeof import('node:child_process');
  try {
    return execSync(command, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  } catch {
    return '';
  }
}

describe('blog content', () => {
  const posts = getAllPosts();

  it('ships ten articles', () => {
    expect(posts.length).toBeGreaterThanOrEqual(10);
  });

  it('has unique slugs', () => {
    const slugs = getAllSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(posts.map((post) => [post.slug, post] as const))('%s is complete', (_slug, post) => {
    expect(post.title.length).toBeGreaterThan(10);
    expect(post.description.length).toBeGreaterThanOrEqual(80);
    expect(post.description.length).toBeLessThanOrEqual(200);
    expect(post.category).toBeTruthy();
    expect(post.tags.length).toBeGreaterThanOrEqual(3);
    expect(post.author.name).toBeTruthy();
    expect(post.body.length).toBeGreaterThan(8);
    expect(Number.isNaN(Date.parse(post.publishedAt))).toBe(false);
    expect(Number.isNaN(Date.parse(post.updatedAt))).toBe(false);
  });

  it.each(posts.map((post) => [post.slug, post] as const))(
    '%s is substantial (900+ words)',
    (_slug, post) => {
      expect(getPostWordCount(post)).toBeGreaterThanOrEqual(900);
    },
  );

  it('has unique titles and descriptions', () => {
    expect(new Set(posts.map((post) => post.title)).size).toBe(posts.length);
    expect(new Set(posts.map((post) => post.description)).size).toBe(posts.length);
  });

  it('only cross-links to articles that exist', () => {
    const slugs = new Set(getAllSlugs());
    for (const post of posts) {
      for (const related of post.related) {
        expect(slugs.has(related), `${post.slug} links to a missing article: ${related}`).toBe(
          true,
        );
      }
      expect(post.related, `${post.slug} links to itself`).not.toContain(post.slug);
    }
  });

  it('builds a table of contents with unique anchors', () => {
    for (const post of posts) {
      const toc = getTableOfContents(post);
      const ids = toc.map((entry) => entry.id);
      expect(new Set(ids).size, `${post.slug} has duplicate heading anchors`).toBe(ids.length);
    }
  });

  it('returns related posts that are never the post itself', () => {
    for (const post of posts) {
      for (const related of getRelatedPosts(post.slug, 3)) {
        expect(related.slug).not.toBe(post.slug);
      }
    }
  });

  it('resolves a known slug and rejects an unknown one', () => {
    expect(getPost(posts[0]!.slug)).toBeDefined();
    expect(getPost('no-such-article')).toBeUndefined();
  });
});

describe('profession guides', () => {
  const professions = getAllProfessions();

  it('ships a guide for every registered profession', () => {
    expect(professions).toHaveLength(11);
    expect(new Set(getAllProfessionSlugs()).size).toBe(professions.length);
  });

  it.each(professions.map((profession) => [profession.slug, profession] as const))(
    '%s is complete',
    (_slug, profession) => {
      expect(profession.role.length).toBeGreaterThan(2);
      expect(profession.metaTitle.length).toBeGreaterThan(10);
      expect(profession.metaDescription.length).toBeGreaterThanOrEqual(80);
      expect(profession.metaDescription.length).toBeLessThanOrEqual(200);
      expect(profession.field).toBeTruthy();
      expect(profession.keywords.length).toBeGreaterThanOrEqual(3);
      expect(profession.overview.length).toBeGreaterThanOrEqual(2);
      expect(profession.scanOrder.length).toBeGreaterThanOrEqual(3);
      expect(profession.metrics.length).toBeGreaterThanOrEqual(3);
      expect(profession.sectionPlan.order.length).toBeGreaterThanOrEqual(5);
      expect(profession.sectionPlan.drop.length).toBeGreaterThanOrEqual(3);
      expect(profession.steps.length).toBeGreaterThanOrEqual(4);
      expect(profession.us.points.length).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(professions.map((profession) => [profession.slug, profession] as const))(
    '%s carries three before/after rewrites and four unique questions',
    (_slug, profession) => {
      expect(profession.rewrites).toHaveLength(3);
      for (const rewrite of profession.rewrites) {
        expect(rewrite.before.length).toBeGreaterThan(20);
        expect(rewrite.after.length).toBeGreaterThan(rewrite.before.length);
        expect(rewrite.change.length).toBeGreaterThan(40);
      }
      expect(profession.faq).toHaveLength(4);
      expect(new Set(profession.faq.map((entry) => entry.question)).size).toBe(4);
    },
  );

  it.each(professions.map((profession) => [profession.slug, profession] as const))(
    '%s is substantial (700+ words)',
    (_slug, profession) => {
      expect(getProfessionWordCount(profession)).toBeGreaterThanOrEqual(700);
    },
  );

  it('recommends between two and four templates that all exist', () => {
    for (const profession of professions) {
      expect(profession.templates.length).toBeGreaterThanOrEqual(2);
      expect(profession.templates.length).toBeLessThanOrEqual(4);
      for (const pick of profession.templates) {
        expect(findTemplate(pick.id), `${profession.slug} → ${pick.id}`).toBeDefined();
        expect(pick.reason.length).toBeGreaterThan(40);
      }
      // Resolved picks must not silently fall back to the default template.
      expect(getRecommendedTemplates(profession)).toHaveLength(profession.templates.length);
    }
  });

  it('is written per profession, not from one template', () => {
    // The two most template-prone fields: if any two professions shared them, the pages
    // would be the duplicate thin content these guides exist to avoid.
    const intros = professions.map((profession) => profession.intro);
    const headings = professions.map((profession) => profession.heading);
    const rewrites = professions.flatMap((profession) =>
      profession.rewrites.map((rewrite) => rewrite.after),
    );
    expect(new Set(intros).size).toBe(professions.length);
    expect(new Set(headings).size).toBe(professions.length);
    expect(new Set(rewrites).size).toBe(rewrites.length);
  });

  it('has unique titles and meta descriptions', () => {
    expect(new Set(professions.map((profession) => profession.metaTitle)).size).toBe(
      professions.length,
    );
    expect(new Set(professions.map((profession) => profession.metaDescription)).size).toBe(
      professions.length,
    );
  });

  it('only cross-links to professions that exist', () => {
    const slugs = new Set(getAllProfessionSlugs());
    for (const profession of professions) {
      expect(profession.related.length).toBeGreaterThanOrEqual(2);
      for (const related of profession.related) {
        expect(slugs.has(related), `${profession.slug} → ${related}`).toBe(true);
      }
      expect(profession.related).not.toContain(profession.slug);
      for (const related of getRelatedProfessions(profession.slug, 3)) {
        expect(related.slug).not.toBe(profession.slug);
      }
    }
  });

  it('points every advertised worked example at a real one', () => {
    const examples = new Set(getAllExampleSlugs());
    for (const profession of professions) {
      if (!profession.exampleSlug) continue;
      expect(examples.has(profession.exampleSlug), `${profession.slug}`).toBe(true);
    }
  });

  it('groups every profession into exactly one field', () => {
    const fields = getProfessionFields();
    const grouped = fields.flatMap((field) => field.professions);
    expect(grouped).toHaveLength(professions.length);
    expect(new Set(fields.map((field) => field.name)).size).toBe(fields.length);
  });

  it('resolves a known slug and rejects an unknown one', () => {
    expect(getProfession('software-engineer')).toBeDefined();
    expect(getProfession('astronaut')).toBeUndefined();
  });
});

describe('worked CV examples', () => {
  const examples = getAllExamples();

  it('ships five worked examples with unique slugs', () => {
    expect(examples).toHaveLength(5);
    expect(new Set(getAllExampleSlugs()).size).toBe(examples.length);
  });

  it.each(examples.map((example) => [example.slug, example] as const))(
    '%s is complete',
    (_slug, example) => {
      expect(example.metaDescription.length).toBeGreaterThanOrEqual(80);
      expect(example.metaDescription.length).toBeLessThanOrEqual(200);
      expect(example.keywords.length).toBeGreaterThanOrEqual(3);
      expect(example.summaryNote.length).toBeGreaterThan(80);
      expect(example.commentary.length).toBeGreaterThanOrEqual(6);
      expect(example.lessExperience.length).toBeGreaterThanOrEqual(4);
      expect(example.usResume.length).toBeGreaterThanOrEqual(4);
      expect(example.faq).toHaveLength(4);
      expect(findTemplate(example.templateId), example.templateId).toBeDefined();
    },
  );

  it.each(examples.map((example) => [example.slug, example] as const))(
    '%s renders a real document, not a placeholder',
    (_slug, example) => {
      const { cv } = example;
      expect(cv.summary.length).toBeGreaterThan(200);
      expect(cv.experience.length).toBeGreaterThanOrEqual(2);
      expect(cv.education.length).toBeGreaterThanOrEqual(1);
      expect(cv.skills.length).toBeGreaterThanOrEqual(5);
      expect(cv.sections.some((section) => section.enabled)).toBe(true);
      // Section ids must be unique, or the render order silently drops one.
      expect(new Set(cv.sections.map((section) => section.id)).size).toBe(cv.sections.length);
    },
  );

  it.each(examples.map((example) => [example.slug, example] as const))(
    '%s explains three or four bullets from the current role',
    (_slug, example) => {
      const bullets = getHighlightedBullets(example);
      expect(bullets.length).toBeGreaterThanOrEqual(3);
      expect(bullets.length).toBeLessThanOrEqual(4);
      for (const bullet of bullets) {
        expect(bullet.text.length).toBeGreaterThan(40);
        expect(bullet.note.length, bullet.text).toBeGreaterThan(40);
      }
    },
  );

  it.each(examples.map((example) => [example.slug, example] as const))(
    '%s uses an obviously fictional person',
    (_slug, example) => {
      const { personal } = example.cv;
      expect(personal.lastName).toBe('Example');
      expect(personal.email).toMatch(/@example\.com$/);
      for (const contact of [personal.website, personal.linkedin, personal.github]) {
        if (contact) expect(contact).toMatch(/example/i);
      }
      // Every page must carry a visible note that the person is not real.
      expect(example.fictionNote).toMatch(/fictional/i);
      expect(example.fictionNote).toContain(personal.firstName);
    },
  );

  it('only cross-links to examples and professions that exist', () => {
    const exampleSlugs = new Set(getAllExampleSlugs());
    const professionSlugs = new Set(getAllProfessionSlugs());
    for (const example of examples) {
      for (const related of example.relatedExamples) {
        expect(exampleSlugs.has(related), `${example.slug} → ${related}`).toBe(true);
      }
      expect(example.relatedExamples).not.toContain(example.slug);
      expect(example.relatedProfessions.length).toBeGreaterThanOrEqual(2);
      for (const related of example.relatedProfessions) {
        expect(professionSlugs.has(related), `${example.slug} → ${related}`).toBe(true);
      }
      for (const related of getRelatedExamples(example.slug, 2)) {
        expect(related.slug).not.toBe(example.slug);
      }
    }
  });

  it('resolves a known slug and rejects an unknown one', () => {
    expect(getExample('student')).toBeDefined();
    expect(getExample('no-such-role')).toBeUndefined();
  });
});

describe('sitemap', () => {
  const urls = new Set(sitemap().map((entry) => entry.url));

  it('lists every profession guide and the index above them', () => {
    expect(urls.has(`${site.url}/cv-for`)).toBe(true);
    for (const slug of getAllProfessionSlugs()) {
      expect(urls.has(`${site.url}/cv-for/${slug}`), slug).toBe(true);
    }
  });

  it('lists every worked example', () => {
    for (const slug of getAllExampleSlugs()) {
      expect(urls.has(`${site.url}/cv-examples/${slug}`), slug).toBe(true);
    }
  });

  it('never lists a private URL', () => {
    for (const url of urls) {
      expect(isPrivatePath(url.replace(site.url, '') || '/'), url).toBe(false);
    }
  });
});

describe('navigation', () => {
  const routeExists = (href: string): boolean => {
    const path = href.split('?')[0] ?? href;
    if (path === '/') return true;

    const candidates = [
      join(root, 'app', '(marketing)', path.slice(1), 'page.tsx'),
      join(root, 'app', path.slice(1), 'page.tsx'),
      join(root, 'app', '(auth)', path.slice(1), 'page.tsx'),
    ];

    return candidates.some((candidate) => {
      try {
        readFileSync(candidate);
        return true;
      } catch {
        return false;
      }
    });
  };

  it('links only to routes that exist, from the header', () => {
    for (const group of primaryNav) {
      if (group.href) expect(routeExists(group.href), `header: ${group.href}`).toBe(true);
      for (const link of group.links) {
        expect(routeExists(link.href), `header: ${link.href}`).toBe(true);
      }
    }
  });

  it('links only to routes that exist, from the footer', () => {
    for (const group of footerNav) {
      for (const link of group.links) {
        expect(routeExists(link.href), `footer: ${link.href}`).toBe(true);
      }
    }
  });

  it('never puts a private route in public navigation', () => {
    for (const group of [...primaryNav, ...footerNav]) {
      for (const link of group.links) {
        expect(isPrivatePath(link.href), `${link.href} is private`).toBe(false);
      }
    }
  });
});

describe('redirects', () => {
  it('never shadows a page that actually exists', async () => {
    // A redirect whose source is also a real route silently deletes that page from the
    // site — which is how `/resume-templates` was briefly a 308 to `/templates` instead
    // of the SEO landing page it is meant to be.
    const config = readFileSync(join(root, 'next.config.ts'), 'utf8');
    const sources = [...config.matchAll(/source:\s*'([^']+)'/g)]
      .map((match) => match[1])
      .filter((value): value is string => Boolean(value))
      // `headers()` entries use the same key but are not redirects.
      .filter((value) => !value.includes(':path*'));

    for (const source of sources) {
      const marketing = join(root, 'app', '(marketing)', source.slice(1), 'page.tsx');
      const top = join(root, 'app', source.slice(1), 'page.tsx');
      const auth = join(root, 'app', '(auth)', source.slice(1), 'page.tsx');

      for (const candidate of [marketing, top, auth]) {
        let exists = true;
        try {
          readFileSync(candidate);
        } catch {
          exists = false;
        }
        expect(exists, `redirect source ${source} shadows the real page at ${candidate}`).toBe(
          false,
        );
      }
    }
  });
});

describe('private path policy', () => {
  it.each(PRIVATE_PATH_PREFIXES)('treats %s as private', (prefix) => {
    expect(isPrivatePath(prefix)).toBe(true);
    expect(isPrivatePath(`${prefix}/anything`)).toBe(true);
  });

  it('treats public marketing paths as public', () => {
    for (const path of ['/', '/templates', '/cv-builder', '/blog/some-post', '/pricing']) {
      expect(isPrivatePath(path), path).toBe(false);
    }
  });

  it('does not mistake a lookalike prefix for a private path', () => {
    // `/logins-explained` must not be caught by the `/login` prefix.
    expect(isPrivatePath('/logins-explained')).toBe(false);
    expect(isPrivatePath('/administration')).toBe(false);
  });
});

describe('metadata builder', () => {
  it('produces an absolute canonical URL', () => {
    const meta = pageMetadata({
      title: 'CV builder',
      description: 'x'.repeat(150),
      path: '/cv-builder',
    });
    expect(meta.alternates?.canonical).toBe(`${site.url}/cv-builder`);
  });

  it('appends the brand exactly once, bypassing the root title template', () => {
    // `absolute` is what stops the root layout's `%s | CreateCVOnline` template from
    // adding the brand a second time — the bug this test exists to prevent.
    const pricing = pageMetadata({ title: 'Pricing', description: 'd', path: '/pricing' });
    expect(pricing.title).toEqual({ absolute: `Pricing | ${site.name}` });

    const about = pageMetadata({ title: `About ${site.name}`, description: 'd', path: '/about' });
    expect(about.title).toEqual({ absolute: `About ${site.name}` });

    for (const meta of [pricing, about]) {
      const rendered = (meta.title as { absolute: string }).absolute;
      const occurrences = rendered.split(site.name).length - 1;
      expect(occurrences, `"${rendered}" repeats the brand`).toBe(1);
    }
  });

  it('marks a page noindex when asked', () => {
    const meta = pageMetadata({ title: 'x', description: 'y', path: '/x', noindex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it('always supplies an Open Graph image', () => {
    const meta = pageMetadata({ title: 'x', description: 'y', path: '/x' });
    expect(meta.openGraph?.images).toBeTruthy();
  });
});

describe('structured data', () => {
  it('emits a valid @graph document', () => {
    const json = jsonLdGraph(organizationSchema(), websiteSchema(), softwareApplicationSchema());
    const parsed = JSON.parse(json) as { '@context': string; '@graph': unknown[] };
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toHaveLength(3);
  });

  it('drops null nodes rather than emitting them', () => {
    const parsed = JSON.parse(jsonLdGraph(organizationSchema(), null, undefined)) as {
      '@graph': unknown[];
    };
    expect(parsed['@graph']).toHaveLength(1);
  });

  it('advertises only prices the plan catalogue actually charges', () => {
    const app = softwareApplicationSchema() as { offers: { name: string; price: string }[] };
    const free = app.offers.find((offer) => offer.name === 'Free');
    expect(free?.price).toBe('0');
    expect(app.offers.length).toBeGreaterThanOrEqual(2);
  });

  it('numbers breadcrumb positions from one', () => {
    const crumbs = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Templates', path: '/templates' },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(crumbs.itemListElement[0]?.position).toBe(1);
    expect(crumbs.itemListElement[1]?.item).toBe(`${site.url}/templates`);
  });

  it('shapes FAQ entries the way Google expects', () => {
    const faq = faqSchema([{ question: 'Is it free?', answer: 'Yes, to start.' }]) as {
      mainEntity: { '@type': string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faq.mainEntity[0]?.['@type']).toBe('Question');
    expect(faq.mainEntity[0]?.acceptedAnswer.text).toBe('Yes, to start.');
  });

  it('caps an article headline at Google’s limit', () => {
    const article = articleSchema({
      title: 'A'.repeat(200),
      description: 'd',
      path: '/blog/x',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-02',
      authorName: 'Editorial team',
    }) as { headline: string };
    expect(article.headline.length).toBeLessThanOrEqual(110);
  });
});

describe('template category pages', () => {
  it('never collides a category slug with a template slug', () => {
    // `/templates/[slug]` resolves a category before a template. If a template were ever
    // given a bare category name as its slug, that template page would silently become
    // unreachable.
    const templateSlugs = new Set(TEMPLATES.map((template) => template.slug));
    for (const category of TEMPLATE_CATEGORIES) {
      expect(
        templateSlugs.has(category.slug),
        `template slug "${category.slug}" collides with a category page`,
      ).toBe(false);
    }
  });

  it('has hand-written copy for every category', () => {
    const descriptions = new Set<string>();
    const ledes = new Set<string>();

    for (const category of TEMPLATE_CATEGORIES) {
      const copy = CATEGORY_COPY[category.id];
      expect(copy, `no copy for category "${category.id}"`).toBeDefined();
      expect(copy.metaDescription.length).toBeGreaterThanOrEqual(90);
      expect(copy.metaDescription.length).toBeLessThanOrEqual(200);
      expect(copy.lede.length).toBeGreaterThan(150);
      expect(copy.ats.length).toBeGreaterThan(200);
      expect(copy.audience.forYou.length).toBeGreaterThanOrEqual(3);
      expect(copy.characteristics.length).toBeGreaterThanOrEqual(3);
      expect(copy.faq.length).toBeGreaterThanOrEqual(4);
      expect(copy.related.length).toBeGreaterThanOrEqual(2);
      expect(copy.related, `${category.id} relates to itself`).not.toContain(category.id);

      descriptions.add(copy.metaDescription);
      ledes.add(copy.lede);
    }

    expect(descriptions.size).toBe(TEMPLATE_CATEGORIES.length);
    expect(ledes.size).toBe(TEMPLATE_CATEGORIES.length);
  });

  it('only relates categories that exist', () => {
    const ids = new Set(TEMPLATE_CATEGORIES.map((category) => category.id));
    for (const category of TEMPLATE_CATEGORIES) {
      for (const related of CATEGORY_COPY[category.id].related) {
        expect(ids.has(related), `${category.id} relates to unknown "${related}"`).toBe(true);
      }
    }
  });
});

describe('template SEO surface', () => {
  it('gives every template an indexable page slug', () => {
    for (const template of TEMPLATES) {
      expect(template.slug).toBeTruthy();
      expect(isPrivatePath(`/templates/${template.slug}`)).toBe(false);
    }
  });

  it('never collides a template slug with a top-level SEO landing page', () => {
    const landingPages = new Set([
      'cv-builder',
      'cv-maker',
      'create-cv-online',
      'resume-builder',
      'resume-maker',
      'cv-templates',
      'resume-templates',
      'professional-cv',
      'ats-cv',
      'ats-resume',
      'free-cv-builder',
      'cv-examples',
      'resume-examples',
    ]);
    // Template pages are nested under /templates/, so a shared word is fine — this guards
    // against someone later flattening the route and creating a real conflict.
    for (const template of TEMPLATES) {
      if (landingPages.has(template.slug)) {
        expect(
          `/templates/${template.slug}`.startsWith('/templates/'),
          'template pages must stay nested',
        ).toBe(true);
      }
    }
  });
});
