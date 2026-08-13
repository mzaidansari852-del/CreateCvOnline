export interface BlogAuthor {
  name: string;
  role: string;
  avatarInitials: string;
}

export type BlogBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'callout'; tone: 'info' | 'success' | 'warning'; title: string; text: string }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'checklist'; items: string[] }
  | { type: 'code'; language: string; code: string };

export interface BlogPost {
  slug: string;
  title: string;
  /** Used verbatim as the meta description — keep to ~155 characters. */
  description: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  author: BlogAuthor;
  /** Rendered as an FAQPage JSON-LD block and an on-page accordion. */
  faq?: { question: string; answer: string }[];
  body: BlogBlock[];
  related: string[];
}
