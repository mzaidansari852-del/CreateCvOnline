import type { Locale } from '@/lib/i18n/locales';

/**
 * The announcement templates.
 *
 * Each one is written in all four languages the site publishes, and a recipient gets the
 * language on their profile. That costs four times the writing, and it is the right trade
 * for the same reason the marketing site is translated: somebody who signed up in German,
 * reads the dashboard in German and bought in German should not first hear from us in
 * English. An English-only campaign to a localised product is the point at which the
 * localisation stops being believed.
 *
 * ## Shape
 *
 * A template is a pure function from context to strings. It renders no HTML — that is
 * `render.ts`, which owns the shell every template shares — so a template is only ever
 * about *what is said*, and adding one cannot break the layout of the others.
 *
 * ## `requiresOffer`
 *
 * Two of these quote a price and a saving. Without a running offer they have nothing to
 * say, and the admin page refuses to send them rather than producing an e-mail with a hole
 * where the discount should be.
 */

export interface EmailContext {
  /** The recipient's first name, or an empty string. Templates must read as sentences without it. */
  name: string;
  siteName: string;
  siteUrl: string;
  /** Where the call-to-action button goes, already localised to the reader's language. */
  ctaUrl: string;
  /** Set only when an offer is running. */
  offer: {
    planName: string;
    price: string;
    listPrice: string;
    saving: string;
    percent: number;
    currency: string;
    seats: number | null;
  } | null;
  /** Free text from the admin form, used by the plain template. */
  custom: { subject: string; heading: string; body: string };
}

export interface EmailBody {
  subject: string;
  /** The big line at the top. */
  heading: string;
  /** Paragraphs. Rendered as `<p>`, and joined with blank lines in the plain-text part. */
  paragraphs: string[];
  /** The button. */
  cta: string;
  /** One quiet line under the button, or null. */
  footnote: string | null;
}

export interface EmailTemplate {
  id: string;
  /** Shown in the admin picker. */
  name: string;
  description: string;
  requiresOffer: boolean;
  /** Where the button points, as a path per language. */
  path: Record<Locale, string>;
  render: Record<Locale, (context: EmailContext) => EmailBody>;
}

/** `Hi Sara,` — or just `Hi,` when we have no name. Never `Hi ,`. */
function greeting(name: string, hi: Record<Locale, string>, locale: Locale): string {
  const trimmed = name.trim();
  return trimmed ? `${hi[locale]} ${trimmed},` : `${hi[locale]},`;
}

const HI: Record<Locale, string> = { en: 'Hi', fr: 'Bonjour', de: 'Hallo', nl: 'Hoi' };

const PRICING_PATH: Record<Locale, string> = {
  en: '/pricing',
  fr: '/fr/tarifs',
  de: '/de/preise',
  nl: '/nl/prijzen',
};

const BUILDER_PATH: Record<Locale, string> = {
  en: '/dashboard',
  fr: '/dashboard',
  de: '/dashboard',
  nl: '/dashboard',
};

/** `$6.00` — the currency code is spelled out rather than guessed at a symbol. */
function money(amount: string, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency];
  return symbol ? `${symbol}${amount}` : `${amount} ${currency}`;
}

/* -------------------------------------------------------------------------- */
/* 1. The offer announcement                                                   */
/* -------------------------------------------------------------------------- */

const offerAnnouncement: EmailTemplate = {
  id: 'offer',
  name: 'Offer announcement',
  description:
    'Announces the running offer with its price, saving and seat count. Needs an active offer.',
  requiresOffer: true,
  path: PRICING_PATH,
  render: {
    en: ({ name, offer, siteName }) => ({
      subject: offer
        ? `${offer.planName} is ${money(offer.price, offer.currency)} — down from ${money(offer.listPrice, offer.currency)}`
        : `An offer from ${siteName}`,
      heading: offer
        ? `${offer.planName}, now ${money(offer.price, offer.currency)}`
        : 'A new offer',
      paragraphs: [
        greeting(name, HI, 'en'),
        offer
          ? `${offer.planName} normally costs ${money(offer.listPrice, offer.currency)}. For now it is ${money(offer.price, offer.currency)} — a saving of ${money(offer.saving, offer.currency)}, ${offer.percent}% off.`
          : '',
        'It is a single payment with no renewal and no expiry date: every template, unlimited CVs, unlimited PDF downloads, and every template we add later.',
        offer?.seats
          ? `The price is for the first ${offer.seats.toLocaleString('en')} members, after which it goes back to normal.`
          : '',
      ].filter(Boolean),
      cta: offer ? `Get ${offer.planName} for ${money(offer.price, offer.currency)}` : 'See the offer',
      footnote: '14-day refund on every paid plan, for any reason.',
    }),
    fr: ({ name, offer, siteName }) => ({
      subject: offer
        ? `${offer.planName} à ${money(offer.price, offer.currency)} au lieu de ${money(offer.listPrice, offer.currency)}`
        : `Une offre de ${siteName}`,
      heading: offer
        ? `${offer.planName}, désormais à ${money(offer.price, offer.currency)}`
        : 'Une nouvelle offre',
      paragraphs: [
        greeting(name, HI, 'fr'),
        offer
          ? `${offer.planName} coûte normalement ${money(offer.listPrice, offer.currency)}. Pour le moment, c’est ${money(offer.price, offer.currency)} — soit ${money(offer.saving, offer.currency)} d’économie, ${offer.percent} % de remise.`
          : '',
        'Un paiement unique, sans renouvellement ni date d’expiration : tous les modèles, un nombre illimité de CV, des téléchargements PDF illimités, et tous les modèles que nous ajouterons par la suite.',
        offer?.seats
          ? `Ce tarif est réservé aux ${offer.seats.toLocaleString('fr-FR')} premiers membres ; ensuite, il revient au prix normal.`
          : '',
      ].filter(Boolean),
      cta: offer
        ? `Obtenir ${offer.planName} à ${money(offer.price, offer.currency)}`
        : 'Voir l’offre',
      footnote: 'Remboursement sous 14 jours sur toutes les formules payantes, sans justification.',
    }),
    de: ({ name, offer, siteName }) => ({
      subject: offer
        ? `${offer.planName} für ${money(offer.price, offer.currency)} statt ${money(offer.listPrice, offer.currency)}`
        : `Ein Angebot von ${siteName}`,
      heading: offer
        ? `${offer.planName}, jetzt für ${money(offer.price, offer.currency)}`
        : 'Ein neues Angebot',
      paragraphs: [
        greeting(name, HI, 'de'),
        offer
          ? `${offer.planName} kostet normalerweise ${money(offer.listPrice, offer.currency)}. Im Moment sind es ${money(offer.price, offer.currency)} — ${money(offer.saving, offer.currency)} gespart, ${offer.percent} % Rabatt.`
          : '',
        'Eine einmalige Zahlung, ohne Verlängerung und ohne Ablaufdatum: alle Vorlagen, unbegrenzt viele Lebensläufe, unbegrenzte PDF-Downloads und jede Vorlage, die später dazukommt.',
        offer?.seats
          ? `Der Preis gilt für die ersten ${offer.seats.toLocaleString('de-DE')} Mitglieder, danach gilt wieder der reguläre Preis.`
          : '',
      ].filter(Boolean),
      cta: offer
        ? `${offer.planName} für ${money(offer.price, offer.currency)} sichern`
        : 'Angebot ansehen',
      footnote: ' 14 Tage Rückgaberecht auf alle kostenpflichtigen Tarife, ohne Angabe von Gründen.',
    }),
    nl: ({ name, offer, siteName }) => ({
      subject: offer
        ? `${offer.planName} voor ${money(offer.price, offer.currency)} in plaats van ${money(offer.listPrice, offer.currency)}`
        : `Een aanbieding van ${siteName}`,
      heading: offer
        ? `${offer.planName}, nu ${money(offer.price, offer.currency)}`
        : 'Een nieuwe aanbieding',
      paragraphs: [
        greeting(name, HI, 'nl'),
        offer
          ? `${offer.planName} kost normaal ${money(offer.listPrice, offer.currency)}. Nu is het ${money(offer.price, offer.currency)} — dat scheelt ${money(offer.saving, offer.currency)}, ${offer.percent}% korting.`
          : '',
        'Eén betaling, zonder verlenging en zonder vervaldatum: alle sjablonen, onbeperkt cv’s, onbeperkt pdf-downloads, en elk sjabloon dat we later toevoegen.',
        offer?.seats
          ? `Deze prijs geldt voor de eerste ${offer.seats.toLocaleString('nl-NL')} leden; daarna gaat hij terug naar normaal.`
          : '',
      ].filter(Boolean),
      cta: offer
        ? `${offer.planName} nemen voor ${money(offer.price, offer.currency)}`
        : 'Bekijk de aanbieding',
      footnote: '14 dagen bedenktijd op elk betaald abonnement, om welke reden dan ook.',
    }),
  },
};

/* -------------------------------------------------------------------------- */
/* 2. The offer is ending                                                      */
/* -------------------------------------------------------------------------- */

const offerEnding: EmailTemplate = {
  id: 'offer-ending',
  name: 'Offer ending',
  description:
    'A short reminder that the running offer is closing. Send once — a second "last chance" is not one. Needs an active offer.',
  requiresOffer: true,
  path: PRICING_PATH,
  render: {
    en: ({ name, offer }) => ({
      subject: offer
        ? `Last call: ${offer.planName} at ${money(offer.price, offer.currency)}`
        : 'The offer is ending',
      heading: 'This one is closing',
      paragraphs: [
        greeting(name, HI, 'en'),
        offer
          ? `${offer.planName} goes back to ${money(offer.listPrice, offer.currency)} shortly. Until then it is ${money(offer.price, offer.currency)}.`
          : '',
        'Nothing else changes and there is no catch — one payment, kept permanently, and 14 days to change your mind.',
      ].filter(Boolean),
      cta: offer ? `Get it for ${money(offer.price, offer.currency)}` : 'See the offer',
      footnote: 'If you have already bought it, ignore this — nothing is being charged again.',
    }),
    fr: ({ name, offer }) => ({
      subject: offer
        ? `Dernier rappel : ${offer.planName} à ${money(offer.price, offer.currency)}`
        : 'L’offre se termine',
      heading: 'L’offre se termine bientôt',
      paragraphs: [
        greeting(name, HI, 'fr'),
        offer
          ? `${offer.planName} repassera bientôt à ${money(offer.listPrice, offer.currency)}. D’ici là, le tarif est de ${money(offer.price, offer.currency)}.`
          : '',
        'Rien d’autre ne change et il n’y a pas de piège : un paiement unique, conservé définitivement, et 14 jours pour changer d’avis.',
      ].filter(Boolean),
      cta: offer ? `En profiter à ${money(offer.price, offer.currency)}` : 'Voir l’offre',
      footnote: 'Si vous l’avez déjà acheté, ignorez ce message — rien ne sera débité une seconde fois.',
    }),
    de: ({ name, offer }) => ({
      subject: offer
        ? `Letzte Erinnerung: ${offer.planName} für ${money(offer.price, offer.currency)}`
        : 'Das Angebot endet',
      heading: 'Das Angebot endet bald',
      paragraphs: [
        greeting(name, HI, 'de'),
        offer
          ? `${offer.planName} kostet bald wieder ${money(offer.listPrice, offer.currency)}. Bis dahin sind es ${money(offer.price, offer.currency)}.`
          : '',
        'Sonst ändert sich nichts, und es gibt keinen Haken: eine einmalige Zahlung, dauerhaft behalten, und 14 Tage Zeit, es sich anders zu überlegen.',
      ].filter(Boolean),
      cta: offer ? `Für ${money(offer.price, offer.currency)} sichern` : 'Angebot ansehen',
      footnote: 'Falls Sie bereits gekauft haben, ignorieren Sie diese E-Mail — es wird nichts erneut abgebucht.',
    }),
    nl: ({ name, offer }) => ({
      subject: offer
        ? `Laatste kans: ${offer.planName} voor ${money(offer.price, offer.currency)}`
        : 'De aanbieding loopt af',
      heading: 'De aanbieding loopt af',
      paragraphs: [
        greeting(name, HI, 'nl'),
        offer
          ? `${offer.planName} gaat binnenkort terug naar ${money(offer.listPrice, offer.currency)}. Tot die tijd is het ${money(offer.price, offer.currency)}.`
          : '',
        'Verder verandert er niets en er zit geen addertje onder het gras: één betaling, blijft van jou, en 14 dagen bedenktijd.',
      ].filter(Boolean),
      cta: offer ? `Nemen voor ${money(offer.price, offer.currency)}` : 'Bekijk de aanbieding',
      footnote: 'Heb je het al gekocht, negeer dit dan — er wordt niets opnieuw afgeschreven.',
    }),
  },
};

/* -------------------------------------------------------------------------- */
/* 3. Something new in the product                                             */
/* -------------------------------------------------------------------------- */

const productUpdate: EmailTemplate = {
  id: 'product-update',
  name: 'Product update',
  description:
    'New templates or features. The heading and body come from the form, so this one says whatever you write.',
  requiresOffer: false,
  path: BUILDER_PATH,
  render: {
    en: ({ name, custom, siteName }) => ({
      subject: custom.subject || `What's new at ${siteName}`,
      heading: custom.heading || "What's new",
      paragraphs: [greeting(name, HI, 'en'), custom.body].filter(Boolean),
      cta: 'Open your dashboard',
      footnote: null,
    }),
    fr: ({ name, custom, siteName }) => ({
      subject: custom.subject || `Les nouveautés de ${siteName}`,
      heading: custom.heading || 'Les nouveautés',
      paragraphs: [greeting(name, HI, 'fr'), custom.body].filter(Boolean),
      cta: 'Ouvrir mon tableau de bord',
      footnote: null,
    }),
    de: ({ name, custom, siteName }) => ({
      subject: custom.subject || `Neues bei ${siteName}`,
      heading: custom.heading || 'Was es Neues gibt',
      paragraphs: [greeting(name, HI, 'de'), custom.body].filter(Boolean),
      cta: 'Zum Dashboard',
      footnote: null,
    }),
    nl: ({ name, custom, siteName }) => ({
      subject: custom.subject || `Nieuw bij ${siteName}`,
      heading: custom.heading || 'Wat er nieuw is',
      paragraphs: [greeting(name, HI, 'nl'), custom.body].filter(Boolean),
      cta: 'Naar je dashboard',
      footnote: null,
    }),
  },
};

/* -------------------------------------------------------------------------- */
/* 4. Anything else                                                            */
/* -------------------------------------------------------------------------- */

const plain: EmailTemplate = {
  id: 'plain',
  name: 'Plain announcement',
  description:
    'Subject, heading and body exactly as you write them, in the site shell. Written once and sent to everyone in the same words — it is not translated per recipient.',
  requiresOffer: false,
  path: BUILDER_PATH,
  render: {
    en: ({ name, custom }) => ({
      subject: custom.subject,
      heading: custom.heading,
      paragraphs: [greeting(name, HI, 'en'), custom.body].filter(Boolean),
      cta: 'Open your dashboard',
      footnote: null,
    }),
    /*
     * The greeting follows the reader's language even here, because it is the one line this
     * template knows the meaning of. The body is whatever was typed, in whatever language it
     * was typed in — which the description says plainly, so nobody sends English prose under
     * a Dutch "Hoi" believing it was translated.
     */
    fr: ({ name, custom }) => ({
      subject: custom.subject,
      heading: custom.heading,
      paragraphs: [greeting(name, HI, 'fr'), custom.body].filter(Boolean),
      cta: 'Ouvrir mon tableau de bord',
      footnote: null,
    }),
    de: ({ name, custom }) => ({
      subject: custom.subject,
      heading: custom.heading,
      paragraphs: [greeting(name, HI, 'de'), custom.body].filter(Boolean),
      cta: 'Zum Dashboard',
      footnote: null,
    }),
    nl: ({ name, custom }) => ({
      subject: custom.subject,
      heading: custom.heading,
      paragraphs: [greeting(name, HI, 'nl'), custom.body].filter(Boolean),
      cta: 'Naar je dashboard',
      footnote: null,
    }),
  },
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  offerAnnouncement,
  offerEnding,
  productUpdate,
  plain,
];

export function emailTemplate(id: string): EmailTemplate | null {
  return EMAIL_TEMPLATES.find((template) => template.id === id) ?? null;
}

export const EMAIL_TEMPLATE_IDS = EMAIL_TEMPLATES.map((template) => template.id);
