import { describe, expect, it } from 'vitest';

import {
  breadcrumbSchema,
  itemListSchema,
  jsonLdGraph,
  templateSchema,
  webPageSchema,
} from '@/lib/seo/schema';
import { TEMPLATES, freeTemplates, premiumTemplates } from '@/lib/cv/template-registry';
import { site } from '@/lib/site';

/**
 * Structured data.
 *
 * Structured data is only worth emitting if it is true, and the two ways it goes wrong are
 * opposite. Claiming too little — a CreativeWork with no image, no page and no relation to
 * the breadcrumb next to it — is a pile of disconnected facts a parser can do nothing with.
 * Claiming too much — a price on a template that is not sold separately, a rating nobody
 * left — is the kind of thing that earns a manual action instead of a rich result.
 *
 * So the interesting assertions here are the negative ones.
 */

const parse = (json: string) => JSON.parse(json) as { '@graph': Record<string, unknown>[] };

describe('webPageSchema', () => {
  const page = webPageSchema({
    path: '/templates/modern-ats',
    name: 'Modern ATS CV template',
    description: 'A parser-safe single-column layout.',
    primaryImage: `${site.url}/previews/modern-ats.webp`,
    hasBreadcrumb: true,
    type: 'ItemPage',
  });

  it('identifies itself by canonical URL so other nodes can point at it', () => {
    expect(page['@id']).toBe(`${site.url}/templates/modern-ats`);
    expect(page.url).toBe(`${site.url}/templates/modern-ats`);
  });

  it('references the breadcrumb node that <Breadcrumbs> emits separately', () => {
    // The two live in different <script> blocks; @id is what joins them.
    expect(page.breadcrumb).toEqual({ '@id': `${site.url}/templates/modern-ats#breadcrumb` });

    // The reference has to resolve to a node that is actually emitted — by <Breadcrumbs>,
    // in a different <script> block, from a list that never learns which page it is on.
    const crumbs = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'CV templates', path: '/templates' },
      { name: 'Modern ATS', path: '/templates/modern-ats' },
    ]);
    expect(crumbs['@id']).toBe(page.breadcrumb ? (page.breadcrumb as { '@id': string })['@id'] : null);
  });

  it('omits the breadcrumb reference when the page renders no breadcrumb', () => {
    const bare = webPageSchema({ path: '/faq', name: 'FAQ', description: 'Questions.' });
    expect(bare.breadcrumb).toBeUndefined();
    expect(JSON.parse(jsonLdGraph(bare))['@graph'][0]).not.toHaveProperty('breadcrumb');
  });
});

describe('templateSchema', () => {
  const free = freeTemplates()[0]!;
  const premium = premiumTemplates()[0]!;

  it('states a zero price for a template that is genuinely free', () => {
    const node = templateSchema(free);
    expect(node['@type']).toEqual(['CreativeWork', 'Product']);
    expect(node.isAccessibleForFree).toBe(true);
    expect(node.offers).toMatchObject({ '@type': 'Offer', price: '0' });
  });

  it('states no price at all for a template that is not sold separately', () => {
    // Pro and Lifetime are the products. Putting a plan price here would say this one
    // template costs that much, which is not what buying it does.
    const node = templateSchema(premium);
    expect(node['@type']).toBe('CreativeWork');
    expect(node.isAccessibleForFree).toBe(false);
    expect(node.offers).toBeUndefined();
    expect(node.usageInfo).toBe(`${site.url}/pricing`);
  });

  it('never invents a rating', () => {
    for (const template of TEMPLATES) {
      const node = templateSchema(template);
      expect(node.aggregateRating).toBeUndefined();
      expect(node.review).toBeUndefined();
    }
  });

  it('carries the preview image, absolute, when one is given', () => {
    const node = templateSchema(free, {
      image: `${site.url}/previews/${free.slug}.webp`,
      thumbnail: `${site.url}/previews/${free.slug}-card.webp`,
    });
    expect(node.image).toEqual([`${site.url}/previews/${free.slug}.webp`]);
    expect(node.thumbnailUrl).toBe(`${site.url}/previews/${free.slug}-card.webp`);
  });

  it('omits image rather than emitting an empty array when there is none', () => {
    const serialised = parse(jsonLdGraph(templateSchema(free)))['@graph'][0]!;
    expect(serialised).not.toHaveProperty('image');
    expect(serialised).not.toHaveProperty('thumbnailUrl');
  });

  it('points its mainEntityOfPage at the page it appears on', () => {
    const node = templateSchema(free);
    expect(node.mainEntityOfPage).toEqual({ '@id': `${site.url}/templates/${free.slug}` });
  });
});

describe('itemListSchema', () => {
  it('numbers items from one and resolves paths to absolute URLs', () => {
    const list = itemListSchema(
      [
        { name: 'A', path: '/templates/a', image: `${site.url}/previews/a-card.webp` },
        { name: 'B', path: '/templates/b' },
      ],
      'Related',
    );
    expect(list.numberOfItems).toBe(2);
    const items = list.itemListElement as Record<string, unknown>[];
    expect(items[0]).toMatchObject({ position: 1, url: `${site.url}/templates/a` });
    expect(items[1]).toMatchObject({ position: 2, url: `${site.url}/templates/b` });
    expect(items[1]?.image).toBeUndefined();
  });
});

describe('the emitted document', () => {
  it('escapes < so a template name can never close the script tag', () => {
    const json = jsonLdGraph({ '@type': 'Thing', name: '</script><script>alert(1)</script>' });
    expect(json.replace(/</g, '\\u003c')).not.toContain('</script>');
  });

  it('drops undefined nodes instead of emitting null into the graph', () => {
    const graph = parse(jsonLdGraph(webPageSchema({ path: '/', name: 'Home', description: 'x' }), null, undefined));
    expect(graph['@graph']).toHaveLength(1);
  });
});
