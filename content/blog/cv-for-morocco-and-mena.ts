import type { BlogPost } from '@/types/blog';

import { regionalDesk } from './authors';

const post: BlogPost = {
  slug: 'cv-for-morocco-and-mena',
  title: 'CV conventions in Morocco and the MENA region',
  description:
    'Writing a CV for Morocco, the Maghreb and the wider MENA region: which language to use, photo and personal-details conventions, qualifications and local norms.',
  excerpt:
    'Which language to write in, what belongs in the personal details, how to present Moroccan and regional qualifications, and what multinationals in the region expect instead.',
  category: 'International',
  tags: ['Morocco', 'MENA', 'Bilingual CV', 'Local conventions'],
  publishedAt: '2026-05-12',
  updatedAt: '2026-08-08',
  readingMinutes: 0, // computed from the body by lib/blog.ts — leave at 0.
  author: regionalDesk,
  faq: [
    {
      question: 'Should my CV be in French, Arabic or English in Morocco?',
      answer:
        'Mirror the advert. French remains the default for most private-sector business roles in Morocco and the wider Maghreb, English is standard in technology, offshoring and multinational environments, and Arabic is expected for parts of the public sector and for some roles in the Gulf. When the employer is bilingual and you cannot tell, French with an English version attached is a safe combination in Morocco.',
    },
    {
      question: 'Do I need a photo on my CV in Morocco or the Gulf?',
      answer:
        'A photo is conventional in much of the region and is unlikely to count against you locally. It is not obligatory, and international employers — particularly UK-, US- and Canada-headquartered companies operating locally — increasingly prefer CVs without one. If you include a photo, use a neutral, professional headshot; if the employer is an international group, leaving it off is the safer default.',
    },
    {
      question: 'Should I put my nationality and visa status on a Gulf CV?',
      answer:
        'Yes for the Gulf, where nationality, current location and visa or sponsorship status are practical hiring questions and recruiters expect to see them. One line is enough: nationality, city of residence, and whether you hold a transferable residence permit. Elsewhere in the region, work authorisation is worth stating only when it is not obvious.',
    },
    {
      question: 'How should I present a Licence or a Grande École diploma to a foreign employer?',
      answer:
        'Give the qualification in its original name, then a short equivalence in brackets — “Licence en Économie (three-year bachelor’s degree)” or “Diplôme d’Ingénieur d’État, ENSA (five-year engineering degree, master’s level)”. Never translate the title into something you did not receive; the equivalence note is what makes it readable abroad.',
    },
  ],
  body: [
    {
      type: 'paragraph',
      text: 'CV conventions in Morocco and across the MENA region are not one convention. A Casablanca offshoring centre hiring English-speaking analysts, a family business in Fez, a ministry in Rabat, a bank in Dubai and a start-up in Cairo have visibly different expectations of the same document. The useful skill is not learning one format — it is reading which of them you are applying to.',
    },
    {
      type: 'paragraph',
      text: 'What follows are the patterns that hold most often, with the caveat that they are conventions rather than rules, and that individual employers vary. When the advert tells you something different from this article, the advert is right.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Which language to write in',
    },
    {
      type: 'paragraph',
      text: 'The single reliable rule: **write in the language of the job advert**. It signals that you can work in that language and it puts your CV in the vocabulary the reader will search with.',
    },
    {
      type: 'table',
      head: ['Employer', 'Usual CV language', 'Notes'],
      rows: [
        [
          'Moroccan / Maghreb private sector',
          'French',
          'The default for business, finance, engineering and services',
        ],
        [
          'Offshoring, tech, multinationals',
          'English',
          'Often English-only adverts; French version useful as a second file',
        ],
        [
          'Public sector and administration',
          'Arabic or French',
          'Arabic is common; follow the announcement exactly',
        ],
        [
          'Gulf (UAE, Saudi Arabia, Qatar, Kuwait)',
          'English',
          'Arabic sometimes requested for government and semi-government roles',
        ],
        [
          'Egypt, Jordan, Lebanon',
          'English, or bilingual',
          'English CVs are standard in the private sector',
        ],
        [
          'International organisations and NGOs',
          'English or French',
          'Many use their own application form; the CV supplements it',
        ],
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Keeping two versions honest',
      text: 'If you maintain a French and an English CV, keep the facts identical and the structure parallel, and re-check both whenever you change one. Name the files clearly — amina-kadiri-cv-fr.pdf and amina-kadiri-cv-en.pdf — and send only the version that matches the advert unless you are explicitly asked for both.',
    },
    {
      type: 'paragraph',
      text: 'An Arabic CV brings one technical trap worth knowing about: right-to-left text and Arabic shaping can be mangled by PDF exporters and by parsers alike. Export it, reopen the PDF, and copy a paragraph into a plain text editor to confirm the letters have stayed joined and in order.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Photo and personal details',
    },
    {
      type: 'paragraph',
      text: 'This is where regional and Anglo-American conventions diverge most sharply, and where a lot of confusing advice comes from — much of the English-language internet writes for the US and UK markets, where photos and personal data are actively discouraged for discrimination reasons.',
    },
    {
      type: 'table',
      head: ['Detail', 'Regional convention', 'Recommendation'],
      rows: [
        [
          'Photo',
          'Common in the Maghreb and the Gulf',
          'Optional. Neutral headshot if included; omit for international groups',
        ],
        [
          'Nationality',
          'Frequently expected, especially in the Gulf',
          'Include in the Gulf; include elsewhere if work authorisation is a question',
        ],
        [
          'Date of birth',
          'Still common on local CVs',
          'Include only where the employer clearly expects it',
        ],
        [
          'Marital status, children',
          'Traditional on older local formats',
          'Safe to omit; rarely relevant to the decision',
        ],
        [
          'National ID (CIN), passport number',
          'Sometimes requested at hiring stage',
          'Leave off the CV entirely; provide when formally requested',
        ],
        [
          'Driving licence',
          'Conventional in many local formats',
          'Include when the role involves travel or site work',
        ],
        [
          'Military service status',
          'Conventional in some countries, notably Egypt',
          'Follow local practice for that country',
        ],
      ],
    },
    {
      type: 'paragraph',
      text: 'The honest position is that including a photo and a date of birth will not usually harm you with a local employer, and omitting them will not usually harm you either. Where it matters is the international end of the market, where a photo can quietly complicate a compliant hiring process. If you are applying to both, keep the local version and the international version separate.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'The languages section is not a formality',
    },
    {
      type: 'paragraph',
      text: 'In a region where a normal working day moves between three languages, this section carries real weight, and vagueness in it is expensive. Be specific about which Arabic, and use a recognised scale for the rest.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Languages
Arabic     Native (Darija; Modern Standard Arabic: professional, written)
Amazigh    Conversational (Tachelhit)
French     Fluent (C1) - full professional working proficiency
English    Professional (B2) - daily written use, comfortable in meetings
Spanish    Basic (A2)`,
    },
    {
      type: 'paragraph',
      text: 'Distinguishing Darija from Modern Standard Arabic matters for roles involving official correspondence, media or government, where written MSA is the actual requirement. Claiming a level you cannot hold up in a five-minute interview switch is one of the few CV exaggerations that gets tested on the spot.',
    },
    {
      type: 'heading',
      level: 2,
      text: 'Qualifications a foreign reader can parse',
    },
    {
      type: 'paragraph',
      text: 'Regional education systems do not map neatly onto the Anglo-American one, and a reader in London or Dubai may not know what a Diplôme d’Ingénieur d’État represents. Keep the real name, add a plain equivalence, and name the school — reputations that are obvious locally are invisible abroad.',
    },
    {
      type: 'code',
      language: 'text',
      code: `Diplome d'Ingenieur d'Etat, Genie Industriel                  2018-2023
Ecole Nationale Superieure d'Arts et Metiers (ENSAM), Casablanca
Five-year post-baccalaureate engineering degree (master's level),
entry by national competitive examination.`,
    },
    {
      type: 'list',
      items: [
        'Baccalauréat: state the stream (Sciences Maths, Sciences Économiques) if you are early in your career; drop it once you have a degree and experience.',
        'Licence: three years post-bac, comparable to a bachelor’s degree.',
        'Grandes écoles (ENCG, ENSA, ENSAM, EMI, ISCAE and others): note the competitive entry, which is the part a foreign reader will otherwise miss.',
        'Professional certifications (PMP, CFA, ACCA, AWS, Cisco): list with the awarding body and year — these travel across borders unchanged.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'How applications actually work here',
    },
    {
      type: 'list',
      items: [
        '**The cover letter is not optional.** A lettre de motivation is expected with most French-language applications and is read more often than in the US or UK. One page, addressed to the company, referencing the specific role.',
        '**Speculative applications are normal.** A candidature spontanée to a company you want to work for is an accepted channel, not an imposition, particularly with mid-sized local employers.',
        '**Job boards and networks both matter.** Regional platforms and LinkedIn carry the formal market; personal and alumni networks carry a large share of the rest.',
        '**Multinationals use the same systems as everywhere else.** Workday, SuccessFactors and Taleo are common in the region’s large employers, so the parsing rules in the [ATS guide](/blog/ats-cv-guide) apply directly.',
        '**Keep supporting documents ready but unattached.** Attestations de travail, diploma copies and references are frequently requested later; do not staple them to the initial application unless asked.',
      ],
    },
    {
      type: 'heading',
      level: 2,
      text: 'What international employers in the region expect',
    },
    {
      type: 'checklist',
      items: [
        'English, two pages maximum, single column, A4.',
        'No photo, no date of birth, no marital status.',
        'Achievement bullets with numbers, not lists of responsibilities.',
        'Nationality and visa or residence status where relocation is involved — in the Gulf especially.',
        'Consistent transliteration of your name across CV, LinkedIn and diplomas.',
        'Local qualifications with a one-line international equivalence.',
      ],
    },
    {
      type: 'quote',
      text: 'The most useful question is not “what is the correct format?” but “who is reading this, and in which language do they think about the job?”',
    },
    {
      type: 'paragraph',
      text: 'If your search spans the region and Europe or North America, keep the two documents genuinely separate rather than compromising into one that fits neither — [adapting a CV for international jobs](/blog/cv-for-international-jobs) sets out what changes country by country.',
    },
  ],
  related: ['cv-for-international-jobs', 'how-to-write-a-professional-cv', 'ats-cv-guide'],
};

export default post;
