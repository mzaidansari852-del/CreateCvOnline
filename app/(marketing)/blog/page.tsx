import Link from 'next/link';
import type { Metadata } from 'next';

import {
  Breadcrumbs,
  CtaBanner,
  Section,
  SectionHeading,
} from '@/components/marketing/primitives';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/feedback';
import { FeaturedPostCard, PostCard } from '@/components/blog/PostCard';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  getAllCategories,
  getAllPosts,
  getPostsByCategory,
  resolveCategory,
} from '@/lib/blog';
import { itemListSchema } from '@/lib/seo/schema';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils/cn';
import type { BlogPost } from '@/types/blog';

/**
 * The blog index.
 *
 * Category filtering is a `next/link` writing to `?category=…` rather than client state,
 * so the page stays a server component, every filtered view has a real crawlable address,
 * and the whole thing works with JavaScript switched off. Same reasoning as the template
 * gallery — see `app/(marketing)/templates/page.tsx`.
 */

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' ? raw.trim() : '';
}

/** `/blog` for "everything", `/blog?category=…` for a filtered view. */
function categoryHref(slug: string | null): string {
  return slug ? `/blog?category=${slug}` : '/blog';
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                    */
/* -------------------------------------------------------------------------- */

const BASE_DESCRIPTION =
  'Practical guides on writing a CV that gets read: structure, wording, applicant tracking systems, country conventions and worked examples for every career stage.';

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const requested = firstValue((await props.searchParams).category);
  const category = resolveCategory(requested);

  if (!requested) {
    return pageMetadata({
      title: 'CV and Resume Advice',
      description: BASE_DESCRIPTION,
      path: '/blog',
      keywords: [
        'cv advice',
        'how to write a cv',
        'cv tips',
        'resume advice',
        'ats cv guide',
        'cv writing blog',
      ],
    });
  }

  if (!category) {
    return pageMetadata({
      title: 'CV and Resume Advice',
      description: BASE_DESCRIPTION,
      path: '/blog',
      // An unrecognised category is a dead end, not a page worth indexing.
      noindex: true,
    });
  }

  const posts = getPostsByCategory(category.slug);
  return pageMetadata({
    title: `${category.name} — CV advice`,
    // Kept under ~160 characters: a category description that truncates in results
    // wastes the only sentence a searcher reads before deciding to click.
    description: `${posts.length} practical ${posts.length === 1 ? 'guide' : 'guides'} on ${category.name.toLowerCase()}, written by the ${site.name} editorial desk and kept up to date.`,
    path: categoryHref(category.slug),
  });
}

/* -------------------------------------------------------------------------- */
/* Filter chips                                                                */
/* -------------------------------------------------------------------------- */

function chipClass(active: boolean): string {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
    active
      ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
      : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700',
  );
}

function CategoryChips({ activeSlug }: { activeSlug: string | null }) {
  const categories = getAllCategories();
  const total = getAllPosts().length;

  return (
    <nav aria-label="Filter articles by category">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/blog"
            className={chipClass(activeSlug === null)}
            aria-current={activeSlug === null ? 'true' : undefined}
          >
            All articles
            <span className="text-2xs opacity-70">{total}</span>
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.slug}>
              <Link
                href={categoryHref(category.slug)}
                className={chipClass(active)}
                aria-current={active ? 'true' : undefined}
              >
                {category.name}
                <span className="text-2xs opacity-70">{category.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default async function BlogIndexPage(props: { searchParams: Promise<SearchParams> }) {
  const requested = firstValue((await props.searchParams).category);
  const category = resolveCategory(requested);

  // A `?category=` value that matches nothing yields an empty list on purpose: the reader
  // followed a stale link and deserves to be told so, not silently shown everything.
  const posts: BlogPost[] = requested
    ? category
      ? getPostsByCategory(category.slug)
      : []
    : getAllPosts();

  const [featured, ...rest] = posts;
  const heading = category ? `${category.name} guides` : 'CV and resume advice';

  return (
    <>
      <Section size="sm">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]}
        />

        <SectionHeading
          as="h1"
          align="left"
          eyebrow={`${getAllPosts().length} guides · written by the ${site.name} editorial desk`}
          title={heading}
          description={
            category ? (
              <p>{`Everything we have published on ${category.name.toLowerCase()}. Each guide is written against real hiring practice rather than recycled advice, and every claim about formatting is one you can check against the templates.`}</p>
            ) : (
              <>
                <p>
                  Long-form, specific guidance on the parts of a CV people actually get
                  wrong: what a summary is for, how to quantify an achievement you did not
                  measure at the time, what an applicant tracking system does with your file,
                  and how the conventions change when you apply abroad.
                </p>
                <p className="mt-3">
                  No listicles, no &ldquo;power words&rdquo;, and no promises about beating a
                  robot. Filter by topic below, or start with the featured guide.
                </p>
              </>
            )
          }
        />

        <div className="mt-8">
          <CategoryChips activeSlug={category?.slug ?? null} />
        </div>
      </Section>

      <Section tone="muted" size="sm">
        {posts.length === 0 ? (
          <EmptyState
            title="No articles in that category"
            description={`Nothing is filed under “${requested}”. The category may have been renamed since the link you followed was made — the topics we do write about are listed above.`}
            action={<ButtonLink href="/blog">Show all articles</ButtonLink>}
            secondaryAction={
              <ButtonLink href="/faq" variant="outline">
                Read the FAQ instead
              </ButtonLink>
            }
          />
        ) : (
          <>
            {featured ? <FeaturedPostCard post={featured} /> : null}

            {rest.length > 0 ? (
              <div className="mt-14">
                <h2 className="text-xl font-bold text-ink-950">
                  {category ? `More on ${category.name.toLowerCase()}` : 'More guides'}
                </h2>
                <p className="mt-1.5 text-sm text-ink-600">
                  {rest.length} {rest.length === 1 ? 'article' : 'articles'}, newest first.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-8 text-sm text-ink-600">
                This is the only article filed under {category?.name ?? 'this topic'} so far.{' '}
                <Link
                  href="/blog"
                  className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800"
                >
                  Browse every guide
                </Link>
                .
              </p>
            )}
          </>
        )}
      </Section>

      <Section size="sm">
        <CtaBanner
          title="Reading about CVs is not writing one"
          description="Every guide here is written against the same editor you can open in the next thirty seconds. Pick a template, paste in what you have, and fix it as you read."
          primaryLabel="Start your CV — free"
          secondaryHref="/templates"
          secondaryLabel="Browse the templates"
          note={`No credit card. ${site.name} keeps your CV in your account so you can tailor it for the next application.`}
        />
      </Section>

      {/* An empty list is not structured data worth emitting. */}
      {posts.length > 0 ? (
        <JsonLd
          nodes={[
            itemListSchema(
              posts.map((post) => ({
                name: post.title,
                path: `/blog/${post.slug}`,
                description: post.description,
              })),
              category ? `${site.name} blog: ${category.name}` : `${site.name} blog`,
            ),
          ]}
        />
      ) : null}
    </>
  );
}
