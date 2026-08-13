import type { Metadata } from 'next';
import Link from 'next/link';

import {
  AdminPageHeader,
  AdminTable,
  Env,
  StatTile,
  StatTileGrid,
  TableEmptyRow,
  Td,
  Th,
  formatCount,
} from '@/components/admin/primitives';
import { Alert, Badge } from '@/components/ui/feedback';
import { Card } from '@/components/ui/card';
import {
  formatPostDate,
  getAllCategories,
  getAllPosts,
  getPostWordCount,
  getScheduledPosts,
} from '@/lib/blog';
import { privateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = privateMetadata(
  'Blog',
  'Inventory of the articles shipped with this build.',
);

export default function AdminBlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const totalWords = posts.reduce((sum, post) => sum + getPostWordCount(post), 0);
  const totalMinutes = posts.reduce((sum, post) => sum + post.readingMinutes, 0);
  const scheduled = getScheduledPosts();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Blog"
        description="Every article compiled into this build, newest first."
      />

      <Alert tone="info" title="The blog is file-based, so this is a read-only inventory">
        <p>
          Articles are TypeScript modules in <Env>content/blog/</Env>, read through{' '}
          <Env>lib/blog.ts</Env>. There is no database behind them and no editor here —
          publishing is a deploy, which is also what makes every post statically renderable
          and instantly cacheable.
        </p>
        <p className="mt-2">
          To add one: create <Env>content/blog/&lt;slug&gt;.ts</Env> exporting a{' '}
          <Env>BlogPost</Env> object, then add a single re-export line to{' '}
          <Env>content/blog/articles.ts</Env>. Reading time is computed from the body, so
          leave <Env>readingMinutes</Env> at any placeholder. A duplicate slug or a{' '}
          <Env>related</Env> entry that points at a missing article is caught by{' '}
          <Env>content/blog/index.ts</Env> rather than shipping quietly.
        </p>
      </Alert>

      <StatTileGrid>
        <StatTile label="Articles" value={String(posts.length)} hint="Compiled into this build." />
        <StatTile
          label="Categories"
          value={String(categories.length)}
          hint={categories.map((category) => category.name).join(', ') || 'None yet.'}
        />
        <StatTile
          label="Total words"
          value={formatCount(totalWords)}
          hint="Body text only, inline markup stripped."
        />
        <StatTile
          label="Reading time"
          value={`${totalMinutes} min`}
          hint={
            posts.length > 0
              ? `About ${Math.round(totalMinutes / posts.length)} minutes per article.`
              : 'No articles yet.'
          }
        />
      </StatTileGrid>

      {scheduled.length > 0 ? (
        <Alert tone="warning" title="Future-dated articles">
          <p>
            {scheduled.length} article{scheduled.length === 1 ? ' is' : 's are'} dated in the
            future. Nothing schedules a post — they are live as soon as they are deployed, so
            a future date only affects sort order and the date shown to readers.
          </p>
        </Alert>
      ) : null}

      <Card>
        <AdminTable minWidth={1000}>
          <thead>
            <tr>
              <Th sticky>Title</Th>
              <Th>Slug</Th>
              <Th>Category</Th>
              <Th align="right">Published</Th>
              <Th align="right">Updated</Th>
              <Th align="right">Reading</Th>
              <Th align="right">Live post</Th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <TableEmptyRow colSpan={7}>
                No articles are registered. Add a module to <Env>content/blog/</Env> and
                re-export it from <Env>content/blog/articles.ts</Env>.
              </TableEmptyRow>
            ) : (
              posts.map((post) => (
                <tr key={post.slug}>
                  <Td sticky className="max-w-80">
                    <span className="block truncate font-medium text-ink-900" title={post.title}>
                      {post.title}
                    </span>
                    <span className="mt-0.5 block truncate text-2xs text-ink-500">
                      {post.author.name} · {post.tags.length} tag
                      {post.tags.length === 1 ? '' : 's'}
                      {post.faq?.length ? ` · ${post.faq.length} FAQ` : ''}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-ink-600">{post.slug}</span>
                  </Td>
                  <Td>
                    <Badge tone="brand">{post.category}</Badge>
                  </Td>
                  <Td align="right" className="whitespace-nowrap text-ink-600">
                    {formatPostDate(post.publishedAt)}
                  </Td>
                  <Td align="right" className="whitespace-nowrap text-ink-600">
                    {formatPostDate(post.updatedAt)}
                  </Td>
                  <Td align="right">{post.readingMinutes} min</Td>
                  <Td align="right">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-semibold text-brand-700 hover:text-brand-800"
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </AdminTable>
      </Card>
    </div>
  );
}
