import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  Breadcrumbs,
  CtaBanner,
  FaqSection,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { Badge } from '@/components/ui/feedback';
import { BlogBody } from '@/components/blog/BlogBody';
import { JsonLd } from '@/components/seo/JsonLd';
import { PostCard } from '@/components/blog/PostCard';
import { TemplateGrid } from '@/components/marketing/TemplateStrip';
import {
  categorySlug,
  formatPostDate,
  getAdjacentPosts,
  getAllSlugs,
  getPost,
  getPostWordCount,
  getRelatedPosts,
  getTableOfContents,
} from '@/lib/blog';
import { atsSafeTemplates, templatesByCategory } from '@/lib/cv/template-registry';
import { articleSchema } from '@/lib/seo/schema';
import { ogImageUrl, pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import type { BlogPost } from '@/types/blog';
import type { TemplateDefinition } from '@/types/cv';

/**
 * One page per article.
 *
 * Every post is statically generated from `content/blog`. The table of contents targets
 * the ids `BlogBody` emits via `headingId`, so the anchors cannot drift from the headings
 * — both call the same function.
 */

export function generateStaticParams(): { slug: string }[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);

  if (!post) {
    return pageMetadata({
      title: 'Article not found',
      description: 'This article does not exist. Browse the CV advice blog instead.',
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    image: ogImageUrl(post.title, post.category),
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author.name],
  });
}

/* -------------------------------------------------------------------------- */
/* Template strip                                                              */
/* -------------------------------------------------------------------------- */

interface TemplatePick {
  title: string;
  description: string;
  templates: TemplateDefinition[];
}

/**
 * The templates worth showing next to this article.
 *
 * Chosen from the post's own tags and category rather than at random, so an ATS guide is
 * followed by parser-safe layouts and an executive guide by corporate ones. Deterministic,
 * which keeps the page statically renderable.
 */
function templatePickFor(post: BlogPost): TemplatePick {
  const tags = new Set(post.tags);

  if (post.category === 'ATS & applications' || tags.has('ATS')) {
    return {
      title: 'Layouts built to be parsed correctly',
      description:
        'Single-column, real headings, no tables and no text inside images — the designs that come back out of an applicant tracking system in the order you wrote them.',
      templates: atsSafeTemplates(5).slice(0, 4),
    };
  }

  if (tags.has('Software engineering') || tags.has('Technical CV')) {
    return {
      title: 'Templates with room for a stack and side projects',
      description:
        'Engineering layouts that give projects, tooling and open-source work their own space without turning the document into a keyword dump.',
      templates: templatesByCategory('technology').slice(0, 4),
    };
  }

  if (tags.has('Management') || tags.has('Executive') || tags.has('Leadership')) {
    return {
      title: 'Templates for senior and executive CVs',
      description:
        'Restrained, structured designs that put scope, budget and outcomes above decoration — drawn for readers who judge a CV on rigour first.',
      templates: templatesByCategory('corporate').slice(0, 4),
    };
  }

  if (tags.has('Students') || tags.has('Graduates') || tags.has('First CV')) {
    return {
      title: 'Templates for a first CV',
      description:
        'Plain, generous layouts that read well when your education section is longer than your experience section — and that survive a university careers portal.',
      templates: templatesByCategory('ats').slice(0, 4),
    };
  }

  if (post.category === 'International' || tags.has('Country conventions')) {
    return {
      title: 'Templates that travel well',
      description:
        'Conventional formats that read as normal in most markets, on A4 or US Letter, with the photo slot switched on or off per application.',
      templates: templatesByCategory('classic').slice(0, 4),
    };
  }

  return {
    title: 'Templates to write this into',
    description:
      'Contemporary layouts with room to breathe and a single accent colour. The safest starting point when you are not sure what your industry expects.',
    templates: templatesByCategory('modern').slice(0, 4),
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const toc = getTableOfContents(post);
  const { previous, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug, 3);
  const pick = templatePickFor(post);
  const updated = post.updatedAt !== post.publishedAt;

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />

        <div className="max-w-3xl">
          <Link
            href={`/blog?category=${categorySlug(post.category)}`}
            className="inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Badge tone="brand">{post.category}</Badge>
          </Link>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance text-ink-950 sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-pretty text-ink-700">
            {post.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-ink-200 py-4">
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-100"
            >
              {post.author.avatarInitials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink-950">{post.author.name}</p>
              <p className="text-[13px] text-ink-500">{post.author.role}</p>
            </div>
            <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-500 sm:ml-auto">
              <div className="flex gap-1.5">
                <dt>Published</dt>
                <dd className="font-medium text-ink-700">
                  <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                </dd>
              </div>
              {updated ? (
                <div className="flex gap-1.5">
                  <dt>Updated</dt>
                  <dd className="font-medium text-ink-700">
                    <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
                  </dd>
                </div>
              ) : null}
              <div className="flex gap-1.5">
                <dt className="sr-only">Reading time</dt>
                <dd className="font-medium text-ink-700">{post.readingMinutes} min read</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-14">
          <article>
            <BlogBody blocks={post.body} />

            {post.tags.length > 0 ? (
              <div className="mt-12 max-w-3xl border-t border-ink-200 pt-6">
                <h2 className="text-sm font-bold tracking-wide text-ink-950 uppercase">Topics</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-ink-100 px-3 py-1 text-[13px] font-medium text-ink-700"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>

          {toc.length > 0 ? (
            <aside className="hidden lg:block">
              <nav
                aria-labelledby="article-toc-heading"
                className="lg:sticky lg:top-24 rounded-xl border border-ink-200 bg-white p-5"
              >
                <h2
                  id="article-toc-heading"
                  className="text-sm font-bold tracking-wide text-ink-950 uppercase"
                >
                  On this page
                </h2>
                <ol className="mt-3 flex flex-col gap-2 text-[13px] leading-snug">
                  {toc.map((entry, index) => (
                    <li key={entry.id} className="flex gap-2">
                      <span className="tabular-nums text-ink-400">{index + 1}.</span>
                      <a
                        href={`#${entry.id}`}
                        className="text-ink-600 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
                      >
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 border-t border-ink-100 pt-3 text-2xs text-ink-500">
                  {post.readingMinutes} min read · {toc.length} sections
                </p>
              </nav>
            </aside>
          ) : null}
        </div>
      </Section>

      {post.faq && post.faq.length > 0 ? (
        <Section tone="muted">
          <FaqSection
            entries={post.faq}
            title="Questions this raises"
            description="The follow-ups readers send us most often about this topic."
          />
        </Section>
      ) : null}

      {previous || next ? (
        <Section size="sm">
          <nav aria-label="More articles" className="max-w-3xl">
            <h2 className="text-sm font-bold tracking-wide text-ink-950 uppercase">
              Keep reading
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={`/blog/${previous.slug}`}
                  rel="prev"
                  className="group flex flex-col rounded-xl border border-ink-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
                >
                  <span className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                    ← Previous
                  </span>
                  <span className="mt-1.5 text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                    {previous.title}
                  </span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  rel="next"
                  className="group flex flex-col rounded-xl border border-ink-200 bg-white p-4 text-right transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card sm:col-start-2"
                >
                  <span className="text-2xs font-bold tracking-[0.12em] text-ink-500 uppercase">
                    Next →
                  </span>
                  <span className="mt-1.5 text-sm font-semibold text-ink-950 group-hover:text-brand-700">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </div>
          </nav>
        </Section>
      ) : null}

      {pick.templates.length > 0 ? (
        <Section tone="muted">
          <SectionHeading
            align="left"
            as="h2"
            eyebrow="Put it into practice"
            title={pick.title}
            description={pick.description}
          />
          <TemplateGrid templates={pick.templates} className="mt-8" columns={4} />
          <p className="mt-6 text-sm text-ink-600">
            <Link
              href="/templates"
              className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
            >
              Browse every template
            </Link>{' '}
            — you can switch design at any point without losing a word you have written.
          </p>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section>
          <SectionHeading
            align="left"
            as="h2"
            eyebrow="Related reading"
            title="Guides that go with this one"
            description="Chosen for what they add rather than for how recent they are."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.slug} post={item} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section size="sm">
        <CtaBanner
          title="Now write the CV"
          description="Open the editor with a template already applied, work through your history section by section, and download a PDF when it reads the way you want it to."
          primaryLabel="Start your CV — free"
          secondaryHref="/cv-builder"
          secondaryLabel="See how the builder works"
          note={`${site.name} is free to start — no credit card, and the PDF download is included.`}
        />
      </Section>

      <JsonLd
        nodes={[
          articleSchema({
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            authorName: post.author.name,
            wordCount: getPostWordCount(post),
            keywords: post.tags,
          }),
        ]}
      />
    </>
  );
}
