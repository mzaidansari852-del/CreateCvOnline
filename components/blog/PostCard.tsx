import Link from 'next/link';

import { Badge } from '@/components/ui/feedback';
import { formatPostDate } from '@/lib/blog';
import { cn } from '@/lib/utils/cn';
import type { BlogPost } from '@/types/blog';

/**
 * An article card.
 *
 * Used by the blog index, the related-reading block on an article and anywhere else a
 * post needs to be linked. The whole card is one link — no nested interactive elements —
 * so it behaves predictably for keyboard and screen-reader users.
 */

function AuthorLine({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 text-[13px] text-ink-500', className)}>
      <span
        aria-hidden
        className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-50 text-2xs font-bold text-brand-700 ring-1 ring-brand-100"
      >
        {post.author.avatarInitials}
      </span>
      <span className="min-w-0 truncate">
        {post.author.name} · <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      </span>
    </div>
  );
}

export function PostCard({
  post,
  headingLevel: Heading = 'h3',
  className,
}: {
  post: BlogPost;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <article className={cn('h-full', className)}>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{post.category}</Badge>
          <span className="text-2xs font-medium text-ink-500">
            {post.readingMinutes} min read
          </span>
        </div>

        <Heading className="text-base font-bold text-ink-950 group-hover:text-brand-700">
          {post.title}
        </Heading>

        <p className="mt-2 mb-5 line-clamp-3 text-sm leading-relaxed text-ink-600">
          {post.excerpt}
        </p>

        <AuthorLine post={post} className="mt-auto" />
      </Link>
    </article>
  );
}

/** The lead article on the blog index: same data, more room, one per page. */
export function FeaturedPostCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <article className={className}>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-6 overflow-hidden rounded-2xl border border-ink-200 bg-white p-6 transition-all duration-200 hover:border-brand-300 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:items-center"
      >
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="accent">Featured</Badge>
            <Badge tone="brand">{post.category}</Badge>
            <span className="text-2xs font-medium text-ink-500">
              {post.readingMinutes} min read
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-balance text-ink-950 group-hover:text-brand-700 sm:text-3xl">
            {post.title}
          </h2>

          <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-600">
            {post.excerpt}
          </p>

          <AuthorLine post={post} className="mt-6" />
        </div>

        <div className="relative hidden overflow-hidden rounded-xl bg-ink-950 p-6 lg:block">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-brand-600/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-accent-500/20 blur-3xl"
          />
          <div className="relative">
            <p className="text-2xs font-bold tracking-[0.14em] text-brand-300 uppercase">
              In this guide
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-300">{post.description}</p>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-white/10 px-2.5 py-1 text-2xs font-medium text-ink-100"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
              Read the guide
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
