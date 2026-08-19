import { absoluteUrl, site } from '@/lib/site';
import { PLANS, purchasablePlans } from '@/lib/plans';
import { publicEnv } from '@/lib/env';
import { TEMPLATE_COUNT } from '@/lib/cv/template-registry';
import type { TemplateDefinition } from '@/types/cv';

/**
 * JSON-LD builders.
 *
 * Structured data is only useful if it is *true*, so every builder here derives from the
 * same data the page renders — plan prices come from `lib/plans`, template counts from the
 * registry, FAQ entries from the questions actually shown on the page.
 */

export type JsonLd = Record<string, unknown>;

const ORGANIZATION_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

export function organizationSchema(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon.svg'),
      width: 512,
      height: 512,
    },
    description: site.description,
    email: site.supportEmail,
    foundingDate: site.founded,
    sameAs: [site.social.x, site.social.linkedin, site.social.facebook, site.social.instagram],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: site.supportEmail,
        availableLanguage: ['English', 'French', 'Arabic'],
      },
    ],
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.shortDescription,
    inLanguage: 'en',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.url}/templates?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationSchema(): JsonLd {
  const plans = purchasablePlans();
  return {
    '@type': 'SoftwareApplication',
    '@id': `${site.url}/#app`,
    name: site.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Resume Builder',
    operatingSystem: 'Web browser',
    url: site.url,
    description: site.description,
    softwareVersion: '1.0',
    featureList: [
      `${TEMPLATE_COUNT} professional CV and resume templates`,
      'ATS-friendly layouts',
      'Real-time preview editor',
      'PDF download',
      'Multiple CVs per account',
      'Section reordering and customisation',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: PLANS.free.name,
        price: '0',
        priceCurrency: publicEnv.storeCurrency,
        description: PLANS.free.tagline,
        url: absoluteUrl('/register'),
      },
      ...plans.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        price: plan.price,
        priceCurrency: publicEnv.storeCurrency,
        description: plan.tagline,
        url: absoluteUrl('/pricing'),
      })),
    ],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/**
 * The page itself, as a node other nodes can point at.
 *
 * Without this the graph is a pile of unrelated facts: a CreativeWork, a FAQPage and a
 * BreadcrumbList that never say they are describing the same URL. `WebPage` is the anchor
 * — `@id` is the canonical URL, so `mainEntityOfPage` on the CreativeWork and `breadcrumb`
 * here resolve to it, including across separate `<script>` blocks on the same page.
 */
export function webPageSchema(input: {
  path: string;
  name: string;
  description: string;
  /** The one image that represents the page — the template preview, not a logo. */
  primaryImage?: string;
  /** Set when the page renders `<Breadcrumbs>`, which emits its own node. */
  hasBreadcrumb?: boolean;
  type?: 'WebPage' | 'CollectionPage' | 'ItemPage';
  /** BCP-47. Defaults to English; the French pages say so. */
  inLanguage?: string;
}): JsonLd {
  const url = absoluteUrl(input.path);
  return {
    '@type': input.type ?? 'WebPage',
    '@id': url,
    url,
    name: input.name,
    description: input.description,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: input.inLanguage ?? 'en',
    primaryImageOfPage: input.primaryImage
      ? { '@type': 'ImageObject', url: input.primaryImage }
      : undefined,
    breadcrumb: input.hasBreadcrumb ? { '@id': `${url}#breadcrumb` } : undefined,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  // The last crumb is the current page, so the list can identify itself without being
  // told which page it is on — which is what lets `webPageSchema` reference it.
  const self = items[items.length - 1];
  return {
    '@type': 'BreadcrumbList',
    '@id': self ? `${absoluteUrl(self.path)}#breadcrumb` : undefined,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(
  entries: { question: string; answer: string }[],
  options: { inLanguage?: string } = {},
): JsonLd {
  return {
    '@type': 'FAQPage',
    inLanguage: options.inLanguage,
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  authorName: string;
  wordCount?: number;
  keywords?: string[];
}): JsonLd {
  const url = absoluteUrl(input.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: input.title.slice(0, 110),
    description: input.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { '@type': 'Person', name: input.authorName },
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    wordCount: input.wordCount,
    keywords: input.keywords?.join(', '),
    image: [absoluteUrl('/icon.svg')],
  };
}

/**
 * A single template.
 *
 * ## Why the free ones are `Product` and the paid ones are not
 *
 * A free template is a thing you can have, right now, for nothing. `Product` with an
 * `Offer` at zero is literally true, and it is the only way the word "Free" can reach a
 * search result.
 *
 * A premium template is not sold. Pro and Lifetime are sold, and they unlock all 56.
 * Putting the Lifetime price in an `Offer` on this page would state that this template
 * costs that much, which is not what happens if you click — you would be buying every
 * template. Google's structured-data policy is that markup describes the item it is on,
 * and a price for something that is not individually purchasable is the kind of detail
 * that earns a manual action rather than a rich result. So premium templates carry no
 * price at all: `isAccessibleForFree: false` and a link to the page that does have the
 * real prices, where `softwareApplicationSchema` states them once, correctly.
 *
 * `image` matters more than any of it. It is the preview file, absolute, and it is what
 * makes a page eligible to appear in Google Images for "modern CV template" — the query
 * this entire section of the site exists to answer.
 */
export function templateSchema(
  template: TemplateDefinition,
  options: { image?: string; thumbnail?: string } = {},
): JsonLd {
  const url = absoluteUrl(`/templates/${template.slug}`);
  const free = !template.premium;

  return {
    '@type': free ? ['CreativeWork', 'Product'] : 'CreativeWork',
    '@id': `${url}#template`,
    name: `${template.name} CV template`,
    url,
    mainEntityOfPage: { '@id': url },
    description: template.description,
    creator: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    genre: template.category,
    keywords: template.keywords.join(', '),
    isAccessibleForFree: free,
    learningResourceType: 'Template',
    image: options.image ? [options.image] : undefined,
    thumbnailUrl: options.thumbnail,
    offers: free
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: publicEnv.storeCurrency,
          availability: 'https://schema.org/InStock',
          url: absoluteUrl('/register'),
          seller: { '@id': ORGANIZATION_ID },
        }
      : undefined,
    // Not an offer — a pointer to where the real terms are stated.
    usageInfo: free ? undefined : absoluteUrl('/pricing'),
  };
}

export function itemListSchema(
  items: { name: string; path: string; description?: string; image?: string }[],
  listName: string,
): JsonLd {
  return {
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      description: item.description,
      image: item.image,
    })),
  };
}

export function howToSchema(input: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}): JsonLd {
  return {
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    totalTime: 'PT15M',
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/** Wraps one or more schema objects into a single `@graph` document. */
export function jsonLdGraph(...nodes: (JsonLd | null | undefined)[]): string {
  const graph = nodes.filter((node): node is JsonLd => Boolean(node));
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}
