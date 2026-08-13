import { jsonLdGraph, type JsonLd as JsonLdNode } from '@/lib/seo/schema';

/**
 * Emits a `application/ld+json` block.
 *
 * `JSON.stringify` output is escaped for `</script>` so structured data can never break
 * out of the tag — the one XSS vector JSON-LD actually has.
 */
export function JsonLd({ nodes }: { nodes: (JsonLdNode | null | undefined)[] }) {
  const json = jsonLdGraph(...nodes).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
