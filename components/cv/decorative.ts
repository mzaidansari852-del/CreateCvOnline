/**
 * Turns a rendered CV into a decorative preview.
 *
 * A CV document legitimately contains an `<h1>` (the candidate's name) and an `<h2>` per
 * section. That is correct inside the document — and wrong on a marketing page, where a
 * gallery of twenty template previews would contribute twenty `<h1>` elements and bury
 * the page's own heading.
 *
 * Templates set every visual property inline, so demoting the tag to a `<div>` changes
 * nothing about how the preview looks while removing it from the page's outline. The
 * alternative — threading a heading-level prop through all 56 templates — would put the
 * burden on every future template author for no visual gain.
 */
export function demoteHeadings(html: string): string {
  return html
    .replace(/<h([1-6])(\s[^>]*)?>/g, (_match, _level: string, attributes = '') => `<div${attributes}>`)
    .replace(/<\/h[1-6]>/g, '</div>');
}
