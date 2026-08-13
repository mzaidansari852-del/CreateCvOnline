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
        priceCurrency: publicEnv.paypalCurrency,
        description: PLANS.free.tagline,
        url: absoluteUrl('/register'),
      },
      ...plans.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        price: plan.price,
        priceCurrency: publicEnv.paypalCurrency,
        description: plan.tagline,
        url: absoluteUrl('/pricing'),
      })),
    ],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(entries: { question: string; answer: string }[]): JsonLd {
  return {
    '@type': 'FAQPage',
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

export function templateSchema(template: TemplateDefinition): JsonLd {
  const url = absoluteUrl(`/templates/${template.slug}`);
  return {
    '@type': 'CreativeWork',
    '@id': `${url}#template`,
    name: `${template.name} CV template`,
    url,
    description: template.description,
    creator: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    genre: template.category,
    keywords: template.keywords.join(', '),
    isAccessibleForFree: !template.premium,
    learningResourceType: 'Template',
  };
}

export function itemListSchema(
  items: { name: string; path: string; description?: string }[],
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
