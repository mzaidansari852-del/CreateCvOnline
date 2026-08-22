import 'server-only';

import type { Locale } from '@/lib/i18n/locales';

/**
 * Reading a CV with a language model.
 *
 * ## Why this is worth having, and why it is not the whole answer
 *
 * Published benchmarks on this exact task put a commercial rule-based parser at 0.817 F1, a
 * model given raw text at 0.919, and a model given *layout-aware* text at 0.959. The gap
 * between the last two is the reason `layout.ts` runs first and this reads its output: the
 * marked-up text tells the model where sections begin instead of making it infer boundaries
 * from wording, and that is most of the difference.
 *
 * It is also why the heuristic parser stays. This path needs a key, a network and a vendor
 * that is up; the parser needs none of those, and an import feature that fails because a
 * third party is down is worse than one that reads a CV imperfectly.
 *
 * ## The one rule the prompt is built around
 *
 * Extract, never compose. A heuristic parser fails by dropping things, which is visible; a
 * model fails by *inventing* things, which is not. A fabricated employment date on a CV
 * somebody then sends to an employer is a considerably worse outcome than a missing one, so
 * the instructions say so repeatedly, the schema has no field that invites elaboration, and
 * the review screen still stands between this and the database.
 *
 * ## Swappable on purpose
 *
 * This is one JSON call against a commodity capability, and the market reprices it every few
 * months. `extractWithModel` is the whole interface; a different vendor is a new function
 * behind it, not a refactor.
 */

/** Set in the environment. Absent means the AI path is simply off, everywhere. */
const API_KEY = process.env.GEMINI_API_KEY?.trim() ?? '';

/**
 * Flash-Lite, deliberately.
 *
 * This is a copying task, not a reasoning one — the same benchmark found a fine-tuned 0.6B
 * model beating a frontier model on it. Paying for intelligence that the work does not need
 * buys latency the user waits through.
 */
const MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash-lite';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Long enough for a two-page CV, short enough that a hung call falls back rather than hangs. */
const TIMEOUT_MS = 25_000;

/**
 * The ceiling on what is sent.
 *
 * A CV is three or four thousand characters. Anything past this is a document that is not a
 * CV, or one padded to run up a bill, and truncating costs nothing real: no CV worth reading
 * has its employment history on page nine.
 */
const MAX_CHARS = 24_000;

export function aiExtractionAvailable(): boolean {
  return API_KEY.length > 0;
}

export interface AiCv {
  personal?: {
    firstName?: string;
    lastName?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: {
    role?: string;
    company?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    achievements?: string[];
  }[];
  education?: {
    degree?: string;
    institution?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  skills?: { name?: string; category?: string }[];
  languages?: { name?: string; level?: string }[];
  /** Anything with a heading that does not map onto a field above. */
  customSections?: {
    title?: string;
    items?: { heading?: string; subheading?: string; date?: string; description?: string }[];
  }[];
}

/**
 * The response shape, as a JSON Schema the API enforces.
 *
 * Declared rather than derived from `cvDataSchema` on purpose. The stored schema carries
 * ids, display settings and section configuration — none of which a model should be inventing
 * — and handing it over would invite exactly that. This describes only what is readable off
 * a page, and the real schema validates the result afterwards regardless.
 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    personal: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        title: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        linkedin: { type: 'string' },
        website: { type: 'string' },
      },
    },
    summary: { type: 'string' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          current: { type: 'boolean' },
          achievements: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          location: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, category: { type: 'string' } },
      },
    },
    languages: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, level: { type: 'string' } },
      },
    },
    customSections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string' },
                subheading: { type: 'string' },
                date: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const;

function prompt(text: string, locale: Locale): string {
  return [
    'You are reading text extracted from a CV. Copy what it says into the given JSON schema.',
    '',
    'Rules, in order of importance:',
    '1. Copy only. Never write a sentence that is not in the document. If a field is not',
    '   there, leave it out — an empty field is correct, an invented one is a lie on a',
    '   document someone will send to an employer.',
    '2. Never guess a date. Use exactly what is written. Output YYYY-MM when the month is',
    '   given and YYYY when only a year is. If a role is ongoing ("present", "aujourd\'hui",',
    '   "heute", "heden"), set current true and leave endDate empty.',
    '3. Keep the original language. Do not translate, rewrite, summarise or improve anything.',
    '   Spelling mistakes stay as they are.',
    '4. Every job, every qualification. Do not merge two entries, and do not drop the oldest',
    '   ones. Bullet points under a job are its achievements, one string each.',
    '5. A section whose heading does not fit any field above goes into customSections under',
    '   its own heading, verbatim. Certifications, interests, projects, references, awards,',
    '   publications, volunteering. Do not discard a section because there is nowhere obvious',
    '   to put it.',
    '',
    'Lines starting with "# " were set larger than the body text in the original: they are',
    'section headings. A line starting with a tab is a date or a place printed beside the',
    'line above it, not an entry of its own.',
    '',
    `The document is written in ${locale}. The reply must be JSON only.`,
    '',
    '--- CV ---',
    text.slice(0, MAX_CHARS),
  ].join('\n');
}

export class AiExtractionError extends Error {}

/**
 * Sends the marked-up text to the model and returns whatever it read.
 *
 * Throws rather than degrading quietly — the caller decides whether to fall back, and it
 * does, to the heuristic parser. Every failure mode lands here: no key, a bad key, a rate
 * limit, a timeout, a malformed reply.
 */
export async function extractWithModel(text: string, locale: Locale): Promise<AiCv> {
  if (!API_KEY) throw new AiExtractionError('No model API key is configured.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ENDPOINT}/${MODEL}:generateContent`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt(text, locale) }] }],
        generationConfig: {
          // Zero, because there is exactly one right answer and it is written on the page.
          temperature: 0,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      // The body can carry the key back in an error echo, so only the status is kept.
      throw new AiExtractionError(`Model request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new AiExtractionError('The model returned no content.');

    try {
      return JSON.parse(raw) as AiCv;
    } catch {
      throw new AiExtractionError('The model returned malformed JSON.');
    }
  } catch (error) {
    if (error instanceof AiExtractionError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AiExtractionError('The model took too long to answer.');
    }
    throw new AiExtractionError('The model could not be reached.');
  } finally {
    clearTimeout(timer);
  }
}
