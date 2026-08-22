import { NL } from './nl-copy';
import { fontLabel } from '@/lib/cv/format';
import type { TemplateDefinition } from '@/types/cv';

/**
 * Dutch copy for a template's detail page, generated from its metadata.
 *
 * Built the same way as the French file next to it, and for the same reason: each
 * template's `description`, `tagline`, `bestFor` and `features` are English prose written
 * per template, and machine-translating six hundred sentences would put six hundred
 * unread sentences on the pages that are supposed to sell the product.
 *
 * So the Dutch page is written from the *structured* facts — category, column count, ATS
 * score, photo, plan, typeface pairing. Those are what a shopper compares, they are true by
 * construction, and the sentences below were written once, in Dutch, by someone who could
 * read them back.
 *
 * The photo question is answered in the Dutch register rather than the French one. See the
 * note in `nl-copy.ts`: on a Dutch cv the current advice is to leave the photo off, so the
 * FAQ entry for a template *with* a photo slot says how to remove it and why you might,
 * rather than treating the photo as the expected default.
 */

const ATS_NOTE: Record<number, string> = {
  5: 'Maximaal leesbaar voor selectiesoftware: één kolom, geen graphics in de tekstkolom, kopjes voluit geschreven. Dit is de keuze voor een sollicitatie via een portaal.',
  4: 'Goed leesbaar voor selectiesoftware. Er zitten nog wat grafische elementen in, maar geen enkel element draagt informatie die de tekst niet ook geeft.',
  3: 'Redelijk leesbaar, met een kanttekening: de opmaak bevat onderdelen die selectiesoftware verkeerd kan interpreteren. Vooral geschikt als je rechtstreeks naar een persoon stuurt.',
  2: 'Dit sjabloon is gemaakt voor het menselijk oog, niet voor de software. Houd het voor open sollicitaties, je netwerk en vakgebieden waarin de presentatie meetelt.',
  1: 'Sterk grafische opmaak, slecht geschikt voor geautomatiseerd uitlezen. Gebruik het naast een ATS-vriendelijk cv, niet in plaats daarvan.',
};

const COLUMN_NOTE: Record<1 | 2, string> = {
  1: 'Eén kolom, van boven naar beneden: de structuur die recruitmentsoftware zonder fouten uitleest, en die de meeste ruimte laat voor de omschrijving van je functies.',
  2: 'Twee kolommen: een zijbalk voor vaardigheden, talen en contactgegevens, de resterende breedte voor je loopbaan. De regels zijn korter, wat op een scherm sneller leest.',
};

export interface DutchTemplateCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  lede: string;
  atsHeading: string;
  atsBody: string;
  layoutHeading: string;
  layoutBody: string;
  typeHeading: string;
  typeBody: string;
  factsHeading: string;
  facts: { label: string; value: string }[];
  faqHeading: string;
  faq: { question: string; answer: string }[];
}

export function dutchTemplateCopy(template: TemplateDefinition): DutchTemplateCopy {
  const category = NL.categories[template.category];
  const styleWord = category.label.toLowerCase();
  const plan = template.premium ? 'Pro' : 'gratis';
  const columns = template.columns === 1 ? 'één kolom' : 'twee kolommen';

  return {
    metaTitle: `Cv-sjabloon ${template.name}`,
    metaDescription: `Cv-sjabloon ${template.name}: ${columns}, ${styleWord} van stijl, ${template.atsScore}/5 voor selectiesoftware. Online invullen en downloaden als pdf.`,
    heading: `Cv-sjabloon ${template.name}`,
    lede: `Een ${styleWord} sjabloon in ${columns}, ${plan}, met een ${template.atsScore} op 5 voor geautomatiseerd uitlezen. Vul het online in en exporteer een pdf waarvan de tekst selecteerbaar blijft.`,

    atsHeading: 'Tegenover selectiesoftware',
    atsBody: ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!,

    layoutHeading: 'De opmaak',
    layoutBody: COLUMN_NOTE[template.columns],

    typeHeading: 'De typografie',
    typeBody: `Kopjes in ${fontLabel(template.fonts.heading)}, lopende tekst in ${fontLabel(
      template.fonts.body,
    )}. Dat is de oorspronkelijke instelling van het sjabloon: je kunt hem in de editor wijzigen, en zolang je dat niet doet houdt elk sjabloon zijn eigen typografie.`,

    factsHeading: 'In het kort',
    facts: [
      { label: 'Stijl', value: category.label },
      { label: 'Kolommen', value: template.columns === 1 ? 'Eén' : 'Twee' },
      { label: 'ATS-score', value: `${template.atsScore}/5` },
      { label: 'Foto', value: template.hasPhoto ? 'Mogelijk, uit te zetten' : 'Zonder foto' },
      { label: 'Toegang', value: template.premium ? 'Pro' : 'Gratis' },
      { label: 'Formaat', value: 'A4 of US Letter' },
    ],

    faqHeading: 'Vragen over dit sjabloon',
    faq: [
      {
        question: `Is het sjabloon ${template.name} gratis?`,
        answer: template.premium
          ? 'Dit sjabloon hoort bij Pro. Een cv maken, de editor en de pdf-export zijn gratis met de gratis sjablonen; het abonnement ontgrendelt dit sjabloon en de andere Pro-ontwerpen.'
          : 'Ja. Je kunt het invullen en de pdf downloaden zonder te betalen. Een account heb je nodig om je document te bewaren en later terug te vinden.',
      },
      {
        question: 'Kan ik van sjabloon wisselen als ik mijn inhoud al heb ingevuld?',
        answer:
          'Ja, en er gaat niets verloren: je inhoud en je instellingen blijven staan. Alleen de typografie van het nieuwe sjabloon wordt toegepast, en alleen als je die niet zelf had gekozen.',
      },
      {
        question: template.hasPhoto
          ? 'Kan ik de foto weglaten?'
          : 'Kan ik een foto aan dit sjabloon toevoegen?',
        answer: template.hasPhoto
          ? 'Ja, met één klik in de editor, en op een Nederlands cv is dat meestal ook het advies — steeds meer werkgevers screenen anoniem om vooroordelen in de eerste ronde te beperken. De opmaak sluit netjes rond de vrijgekomen ruimte. Solliciteer je in Duitsland of Frankrijk, dan is een foto daar nog wel gebruikelijk.'
          : 'Dit sjabloon is ontworpen zonder foto, wat op een Nederlands cv doorgaans de betere keuze is. Wil je er toch een, kies dan een sjabloon met een fotovak in plaats van er een te plaatsen waar de opmaak hem niet verwacht.',
      },
      {
        question: 'Is de pdf leesbaar voor recruitmentsoftware?',
        answer: `${ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!} De tekst in de pdf is altijd echte tekst, nooit een afbeelding.`,
      },
    ],
  };
}
