import Link from 'next/link';
import type { ReactNode } from 'react';

import { headingId, stripInlineMarkup } from '@/lib/blog';
import { cn } from '@/lib/utils/cn';
import type { BlogBlock } from '@/types/blog';

/**
 * Renders an article body.
 *
 * Article content is structured data (`BlogBlock[]`), not HTML, which is what lets the
 * same source drive the page, the table of contents, the word count and the structured
 * data without an HTML sanitiser anywhere in the pipeline. Every branch of the union is
 * handled below and the switch is exhaustive — adding a block type to `types/blog.ts`
 * fails the build here until it is rendered.
 *
 * Typography deliberately mirrors `Prose` in `components/marketing/primitives.tsx`; the
 * values are repeated rather than inherited because the table, callout, checklist and
 * code blocks need to opt out of Prose's descendant selectors.
 */

/* -------------------------------------------------------------------------- */
/* Inline markup                                                               */
/* -------------------------------------------------------------------------- */

/** `[label](/path)`, `**strong**` and `` `code` `` — the only inline syntax articles may use. */
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;

const linkClasses =
  'font-medium text-brand-700 underline underline-offset-2 hover:text-brand-800';

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  if (/^https?:\/\//i.test(href) || href.startsWith('mailto:')) {
    return (
      <a href={href} className={linkClasses} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClasses}>
      {children}
    </Link>
  );
}

/** Turns the inline syntax into React nodes. No HTML is ever parsed or injected. */
function inline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const whole = match[0] ?? '';
    const start = match.index;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    const [, label, href, strong, code] = match;
    if (label !== undefined && href !== undefined) {
      nodes.push(
        <InlineLink key={key++} href={href}>
          {label}
        </InlineLink>,
      );
    } else if (strong !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-ink-950">
          {strong}
        </strong>,
      );
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-ink-100 px-1 py-0.5 font-mono text-[0.9em] text-ink-800"
        >
          {code}
        </code>,
      );
    }

    cursor = start + whole.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length === 1 ? nodes[0] : nodes;
}

/* -------------------------------------------------------------------------- */
/* Callout                                                                     */
/* -------------------------------------------------------------------------- */

const calloutTones = {
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: 'text-brand-600',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8v.3" strokeLinecap="round" />
      </>
    ),
  },
  success: {
    wrap: 'border-success-500/25 bg-success-50 text-success-700',
    icon: 'text-success-600',
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.3 2.4 2.4 4.6-4.9" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  warning: {
    wrap: 'border-warning-500/30 bg-warning-50 text-warning-700',
    icon: 'text-warning-600',
    path: (
      <>
        <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9.5v4M12 16.7v.3" strokeLinecap="round" />
      </>
    ),
  },
} as const;

function Callout({
  tone,
  title,
  text,
}: {
  tone: 'info' | 'success' | 'warning';
  title: string;
  text: string;
}) {
  const config = calloutTones[tone];
  return (
    <aside className={cn('my-6 flex gap-3 rounded-xl border p-4', config.wrap)}>
      <svg
        className={cn('mt-0.5 size-[18px] shrink-0', config.icon)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        {config.path}
      </svg>
      <div className="min-w-0 flex-1 text-sm leading-relaxed">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 opacity-90">{inline(text)}</p>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Blocks                                                                      */
/* -------------------------------------------------------------------------- */

function Block({ block, tableCaption }: { block: BlogBlock; tableCaption: string }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="mb-4">{inline(block.text)}</p>;

    case 'heading': {
      const id = headingId(block.text);
      if (block.level === 2) {
        return (
          <h2 id={id} className="mt-10 mb-3 scroll-mt-28 text-2xl font-bold text-ink-950">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 id={id} className="mt-8 mb-2 scroll-mt-28 text-lg font-bold text-ink-950">
          {block.text}
        </h3>
      );
    }

    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List
          className={cn(
            'mb-5 flex flex-col gap-2 pl-5 marker:text-brand-500',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </List>
      );
    }

    case 'quote':
      return (
        <blockquote className="my-6 border-l-3 border-brand-300 pl-4 text-ink-600 italic">
          <p>{inline(block.text)}</p>
          {block.cite ? (
            <cite className="mt-1 block text-sm not-italic text-ink-500">— {block.cite}</cite>
          ) : null}
        </blockquote>
      );

    case 'callout':
      return <Callout tone={block.tone} title={block.title} text={block.text} />;

    case 'table':
      return (
        <div className="my-6 overflow-x-auto rounded-xl border border-ink-200">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{tableCaption}</caption>
            <thead className="bg-ink-50">
              <tr>
                {block.head.map((cell, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="border-b border-ink-200 px-4 py-2.5 font-semibold text-ink-950"
                  >
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-ink-100 last:border-0">
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th
                        key={cellIndex}
                        scope="row"
                        className="px-4 py-2.5 align-top font-semibold text-ink-900"
                      >
                        {inline(cell)}
                      </th>
                    ) : (
                      <td key={cellIndex} className="px-4 py-2.5 align-top text-ink-700">
                        {inline(cell)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'checklist':
      return (
        <ul className="mb-5 flex list-none flex-col gap-2.5 pl-0">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-2.5">
              <svg
                className="mt-1 size-4 shrink-0 text-success-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden
              >
                <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{inline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'code':
      return (
        <figure className="my-6">
          {block.language && block.language !== 'text' ? (
            <figcaption className="mb-1.5 text-2xs font-semibold tracking-[0.14em] text-ink-500 uppercase">
              {block.language}
            </figcaption>
          ) : null}
          <pre className="overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-4 text-[13px] leading-[1.6] text-ink-800">
            <code className="font-mono">{block.code}</code>
          </pre>
        </figure>
      );

    default: {
      // Exhaustiveness guard: a new member of `BlogBlock` fails to compile here.
      const unhandled: never = block;
      return unhandled;
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Body                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * For each block, the nearest preceding heading. Tables carry a visually hidden caption
 * and that heading is the most useful description of one, at no cost to the author.
 * Computed up front rather than by mutating a variable while mapping, so the render
 * stays pure.
 */
function captionsFor(blocks: BlogBlock[]): string[] {
  const captions: string[] = [];
  let nearestHeading = '';
  for (const block of blocks) {
    if (block.type === 'heading') nearestHeading = stripInlineMarkup(block.text);
    captions.push(nearestHeading ? `Table: ${nearestHeading}` : 'Reference table');
  }
  return captions;
}

export function BlogBody({ blocks, className }: { blocks: BlogBlock[]; className?: string }) {
  const captions = captionsFor(blocks);

  return (
    <div className={cn('max-w-3xl text-[15px] leading-[1.75] text-ink-700', className)}>
      {blocks.map((block, index) => {
        return (
          <Block
            key={index}
            block={block}
            tableCaption={captions[index] ?? 'Reference table'}
          />
        );
      })}
    </div>
  );
}
