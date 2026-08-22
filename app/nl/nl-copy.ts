import type { TemplateCategory } from '@/types/cv';

/**
 * The Dutch site's copy.
 *
 * Written in Dutch rather than translated from the English, for the same reason the French
 * file next to it was. A Dutch cv is not an English CV in Dutch: the search term is
 * `cv sjabloon` and `cv maken`, `template` is understood but reads as an import, and the
 * conventions genuinely differ — a Dutch application is a `cv` plus a `motivatiebrief`, and
 * the photo question has a specific and current Dutch answer that neither the English nor
 * the French page gives.
 *
 * ## The photo, and why it gets its own section
 *
 * The English pages say a photo is a continental-European convention and leave it there.
 * In the Netherlands that is now actively misleading. Anonymous solliciteren — screening
 * applications with name and photo removed — has been trialled by several municipalities
 * and is policy at a number of large employers, and Dutch career advice has moved from
 * "optional" to "usually leave it off". A Dutch visitor who follows the English page's
 * advice is following advice for a different market. Every template here works without one.
 *
 * ## Birth date
 *
 * The other live difference. `Geboortedatum` was standard on a Dutch cv within living
 * memory and is now widely advised against on age-discrimination grounds. The builder has
 * never had a birth-date field, which happens to be the right default — the Dutch page is
 * the one where that is worth saying out loud rather than leaving implicit.
 */

export const NL = {
  /** Nav and chrome. */
  chrome: {
    skipToContent: 'Naar de hoofdinhoud',
    switchToEnglish: 'English',
    switchToDutch: 'Nederlands',
    languageLabel: 'Taal',
  },

  home: {
    metaTitle: 'Gratis cv maken online',
    metaDescription:
      'Maak online in een paar minuten een professioneel cv. Gratis sjablonen die door recruitmentsoftware worden gelezen, een editor met live voorbeeld en meteen een pdf.',
    eyebrow: 'Geen creditcard nodig',
    heading: 'Maak je cv online, gratis',
    /** Fills the shared hero, so the Dutch page is the same design and not a plainer one. */
    hero: {
      headingBefore: 'Maak je ',
      headingHighlight: 'professionele cv',
      headingAfter: ' online',
      badge: 'sjablonen met een 5/5 voor selectiesoftware',
      primaryCta: 'Maak mijn cv — gratis',
      secondaryCta: 'Bekijk de sjablonen',
    },
    lede: 'Kies een sjabloon, vul gestructureerde velden in en zie er een echte A4-pagina naast opbouwen. Als het klopt, exporteer je een pdf waarvan de tekst selecteerbaar blijft — voor een recruiter én voor de software die eerst kijkt.',
    ctaPrimary: 'Maak mijn cv',
    ctaSecondary: 'Bekijk de sjablonen',
    trust: ['Gratis sjablonen', 'ATS-vriendelijk', 'Meteen een pdf', 'Geen creditcard'],

    stepsTitle: 'Drie stappen, meer niet',
    steps: [
      {
        title: 'Kies een sjabloon',
        body: 'Bij elk sjabloon staat hoe goed recruitmentsoftware het kan uitlezen. Je wisselt wanneer je wilt: je inhoud blijft staan.',
      },
      {
        title: 'Vul je secties in',
        body: 'Werkervaring, opleiding, vaardigheden, talen. Secties kun je verslepen, hernoemen en verbergen, net wat je naar voren wilt halen.',
      },
      {
        title: 'Download de pdf',
        body: 'Een A4 of US Letter, met tekst die echt selecteerbaar is. Geen plaatje van een cv dat zich voordoet als een document.',
      },
    ],

    atsTitle: 'Waarom ATS-vriendelijk uitmaakt',
    atsBody:
      'De meeste grote werkgevers laten sollicitaties eerst door een Applicant Tracking System lopen voordat een mens ze leest. Die software haalt de tekst uit je pdf: een cv in twee kolommen, met pictogrammen in plaats van kopjes of met tekst in een afbeelding, komt er door elkaar of half uit. Elk sjabloon hier heeft een score van vijf, gebaseerd op de opmaakeigenschappen die dat uitlezen echt beïnvloeden — het aantal kolommen, de graphics, de structuur van de kopjes.',
    atsCaveat:
      'Die score is onze eigen beoordeling en geen keurmerk: geen enkele aanbieder kan elk pakket op de markt testen.',

    differencesTitle: 'Wat een Nederlands cv verwacht',
    differences: [
      {
        title: 'De pasfoto kun je beter weglaten',
        body: 'In Nederland is het advies de afgelopen jaren gedraaid. Anoniem solliciteren wint terrein en veel loopbaanadviseurs raden een foto af, omdat die de kans op onbewuste vooroordelen in de eerste selectie vergroot. Elk sjabloon met fotovak werkt ook zonder — één klik in de editor.',
      },
      {
        title: 'Geen geboortedatum, geen burgerlijke staat',
        body: 'Allebei stonden ze vroeger standaard op een Nederlands cv en allebei worden ze nu afgeraden: ze zeggen niets over je geschiktheid en geven ruimte aan leeftijdsdiscriminatie. Er is hier geen veld voor, en dat is bewust.',
      },
      {
        title: 'Eén pagina, twee als je die vult',
        body: 'Eén pagina bij minder dan tien jaar ervaring, twee daarboven. Meer dan twee betekent in de praktijk dat er iets in moet dat er niet in hoeft — behalve in de wetenschap, waar een volledige publicatielijst hoort.',
      },
      {
        title: 'Taalniveaus in ERK',
        body: 'A1 tot en met C2 in plaats van “goede beheersing”. Wat je invult, vult meteen het raster van het Europass-sjabloon.',
      },
    ],

    faqTitle: 'Veelgestelde vragen',
    faq: [
      {
        question: 'Is het echt gratis?',
        answer:
          'Ja, voor het maken, bewerken en als pdf downloaden van een cv met de gratis sjablonen. Een account heb je nodig om je document te bewaren en later terug te vinden. Het betaalde abonnement ontgrendelt de Pro-sjablonen en de uitgebreide opmaakinstellingen.',
      },
      {
        question: 'Moet er een foto op mijn cv?',
        answer:
          'In Nederland: liever niet. Het is niet verboden en niemand wijst je af omdat er een foto op staat, maar het advies is de laatste jaren duidelijk verschoven. Steeds meer werkgevers screenen anoniem juist om vooroordelen in de eerste ronde te beperken, en dan voegt een foto niets toe. Solliciteer je in Duitsland, Frankrijk of het Midden-Oosten, dan ligt dat anders — daar is een foto nog gebruikelijk. Elk sjabloon werkt met en zonder.',
      },
      {
        question: 'Wat is het verschil tussen een cv en een Amerikaans resume?',
        answer:
          'Een Amerikaans resume is één pagina, heeft geen foto, geen geboortedatum en geen burgerlijke staat, en draait om meetbare resultaten. Een Nederlands cv lijkt daar inmiddels sterk op, maar mag twee pagina’s zijn en noemt vaker de volledige opleidingsgeschiedenis. In de editor wissel je tussen A4 en US Letter.',
      },
      {
        question: 'Komt mijn cv door de selectiesoftware?',
        answer:
          'De sjablonen met een 5 op 5 zijn daarvoor gemaakt: één kolom, geen graphics, geen pictogram in plaats van een kopje, tekst die uit te lezen is. Geen enkele aanbieder kan garanderen hoe elk pakket zich gedraagt, maar dit zijn precies de opmaakeigenschappen die het misgaan.',
      },
      {
        question: 'Kan ik van sjabloon wisselen als ik alles al heb ingevuld?',
        answer:
          'Ja, en er gaat niets verloren: je inhoud en je instellingen blijven staan. Alleen de typografie van het nieuwe sjabloon wordt toegepast, en alleen als je die niet zelf had gekozen.',
      },
      {
        question: 'Hoort er een motivatiebrief bij?',
        answer:
          'Bij de meeste Nederlandse vacatures wel, tenzij er uitdrukkelijk staat dat het niet hoeft. De editor heeft er een ingebouwd: hij neemt de lettertypen, de accentkleur en de marges van je cv over en wordt als eerste pagina van dezelfde pdf geëxporteerd, zodat de twee documenten er als één set uitzien.',
      },
    ],
  },

  gallery: {
    metaTitle: 'Gratis cv-sjablonen om te downloaden',
    metaDescription:
      'Professionele cv-sjablonen die je online invult en als pdf downloadt. Modern, klassiek, creatief en ATS-vriendelijk. Gratis, zonder creditcard.',
    heading: 'Cv-sjablonen',
    lede: 'Sjablonen die je online invult, geen Word-bestanden die je eerst moet repareren. Bij elk sjabloon staat of het gratis is en hoe het zich houdt tegenover selectiesoftware. Wissel zo vaak je wilt: je inhoud blijft staan.',
    ctaPrimary: 'Maak mijn cv',
    freeBadge: 'gratis',
    designsLabel: 'sjablonen',
    atsLabel: 'met een 5/5 voor ATS',
    singleColumnLabel: 'in één kolom',
    browseByCategory: 'Bekijken op stijl',
    allCategories: 'Alle categorieën',
    whatMakesGood: 'Wat een goed cv-sjabloon maakt',
    whatMakesGoodBody:
      'Een bruikbaar sjabloon is in de eerste plaats leesbaar: een duidelijke hiërarchie, marges die de tekst lucht geven, en een opmaak die recruitmentsoftware kan uitlezen. De rest — de accentkleur, het lettertype, wel of geen foto — hangt af van je vakgebied en je smaak, en stel je in een paar seconden in de editor in.',
  },

  categories: {
    modern: {
      slug: 'modern',
      label: 'Modern',
      metaTitle: 'Moderne cv-sjablonen',
      metaDescription:
        'Moderne cv-sjablonen: rustige opmaak, één accentkleur, in één oogopslag te lezen. Online invullen en downloaden als pdf.',
      heading: 'Moderne cv-sjablonen',
      lede: 'Eigentijdse opmaak, veel witruimte en één accentkleur. Het veiligste startpunt als je niet precies weet wat er in jouw vakgebied wordt verwacht.',
    },
    corporate: {
      slug: 'zakelijk',
      label: 'Zakelijk',
      metaTitle: 'Zakelijke cv-sjablonen',
      metaDescription:
        'Ingetogen, gestructureerde cv-sjablonen voor finance, consultancy en management. Online invullen, meteen een pdf.',
      heading: 'Zakelijke cv-sjablonen',
      lede: 'Gestructureerd en ingetogen, voor finance, consultancy en management — omgevingen waar een cv eerst op zorgvuldigheid wordt beoordeeld en pas daarna op persoonlijkheid.',
    },
    creative: {
      slug: 'creatief',
      label: 'Creatief',
      metaTitle: 'Creatieve cv-sjablonen',
      metaDescription:
        'Creatieve cv-sjablonen voor design, beeld en content. Het document is zelf een staaltje van je werk.',
      heading: 'Creatieve cv-sjablonen',
      lede: 'Voor design, art direction, fotografie en contentberoepen — waar het document zelf een staaltje van je werk is. Eén sjabloon uit deze groep heeft een 5/5 voor ATS, mocht je via een portaal solliciteren.',
    },
    technology: {
      slug: 'it',
      label: 'IT',
      metaTitle: 'Cv-sjablonen voor IT',
      metaDescription:
        'Cv-sjablonen voor technische functies: ruimte voor je stack, je projecten en open source, zonder dat het een lijst met trefwoorden wordt.',
      heading: 'Cv-sjablonen voor IT',
      lede: 'Gemaakt voor technische functies: ruimte voor je stack, je projecten en je open-sourcebijdragen, zonder dat je cv in een lijst met trefwoorden verandert.',
    },
    classic: {
      slug: 'klassiek',
      label: 'Klassiek',
      metaTitle: 'Klassieke cv-sjablonen',
      metaDescription:
        'Traditionele cv-sjablonen voor wetenschap, recht en de overheid. Inclusief Europass, met ERK-raster.',
      heading: 'Klassieke cv-sjablonen',
      lede: 'Traditionele opmaak, vaak met een schreeflettertype, voor de wetenschap, de advocatuur, de overheid en elke werkgever die nog een conventioneel document verwacht. Hier vind je ook het Europass-sjabloon.',
    },
    ats: {
      slug: 'ats',
      label: 'ATS-vriendelijk',
      metaTitle: 'ATS-vriendelijke cv-sjablonen',
      metaDescription:
        'Cv-sjablonen in één kolom, zonder graphics, gemaakt om correct te worden uitgelezen door recruitmentsoftware.',
      heading: 'ATS-vriendelijke cv-sjablonen',
      lede: 'Eén kolom, geen graphics, geen verrassingen: deze sjablonen zijn gemaakt om correct te worden uitgelezen door Applicant Tracking Systems. De standaardkeuze voor een sollicitatie via een portaal.',
    },
  } satisfies Record<
    TemplateCategory,
    {
      slug: string;
      label: string;
      metaTitle: string;
      metaDescription: string;
      heading: string;
      lede: string;
    }
  >,

  card: {
    free: 'Gratis',
    pro: 'Pro',
    oneColumn: 'één kolom',
    twoColumns: 'twee kolommen',
    atsScore: 'ATS',
    withPhoto: 'met foto',
  },

  related: {
    title: 'Ook interessant',
    allTemplates: 'Alle sjablonen',
    allTemplatesDescription: 'De volledige galerij, alle stijlen.',
    englishSite: 'CV templates in English',
    englishSiteDescription: 'The same builder, with UK and US CV conventions.',
  },

  pricing: {
    metaTitle: 'Prijzen',
    metaDescription:
      'Gratis een cv maken en als pdf downloaden. Pro of eenmalige toegang voor alle sjablonen en volledige opmaakvrijheid.',
    heading: 'Simpele prijzen',
    lede: 'Het cv, de editor en de pdf-download zijn gratis met de gratis sjablonen. Het betaalde abonnement is er voor wie vaak solliciteert en de hele collectie en alle instellingen wil.',
    perMonth: 'per maand',
    oneTime: 'eenmalige betaling',
    forever: 'voor altijd',
    currencyNote:
      'De bedragen worden in Amerikaanse dollars afgerekend; je bank rekent zijn eigen wisselkoers.',
    plans: {
      free: {
        name: 'Gratis',
        tagline: 'Voor één sollicitatie.',
        description:
          'Maak een cv, vul het in, exporteer de pdf. Zonder creditcard en zonder aftellende proefperiode.',
        highlights: [
          'De gratis sjablonen uit de collectie',
          'De volledige editor met live voorbeeld',
          'Pdf-export met een kleine vermelding in de voettekst',
          'Eén opgeslagen cv',
        ],
        cta: 'Gratis beginnen',
      },
      pro: {
        name: 'Pro',
        tagline: 'Voor wie actief zoekt.',
        description:
          "Alle sjablonen, onbeperkt cv's en onbeperkt downloads: genoeg om je cv per vacature aan te passen in plaats van overal hetzelfde te sturen.",
        highlights: [
          'Alle sjablonen, Pro inbegrepen',
          "Onbeperkt cv's en downloads",
          'Volledige opmaakvrijheid: lettertypen, kleuren, witruimte, secties',
          'Eigen secties en vrije volgorde',
          'Openbare deellink',
          'Pdf zonder vermelding',
        ],
        cta: 'Upgraden naar Pro',
      },
      lifetime: {
        name: 'Levenslang',
        tagline: 'Eén betaling, geen abonnement.',
        description:
          'Alles wat in Pro zit, één keer betaald. Een cv werk je eens in de twee of drie jaar bij: een maandabonnement is daar niet altijd de juiste vorm voor.',
        highlights: [
          'Alles wat in Pro zit',
          'Eenmalige betaling, geen verlenging',
          'Sjablonen die later worden toegevoegd horen erbij',
        ],
        cta: 'Levenslange toegang nemen',
      },
    },
    faqTitle: 'Vragen over de prijzen',
    faq: [
      {
        question: 'Is het gratis abonnement in tijd beperkt?',
        answer:
          'Nee. Er is geen proefperiode die afloopt: de gratis sjablonen blijven gratis en je downloadt de pdf zonder te betalen. Een account heb je alleen nodig om je cv te bewaren en later terug te vinden.',
      },
      {
        question: 'Wat zit er precies in Pro?',
        answer:
          "Alle sjablonen uit de collectie, onbeperkt cv's en downloads, volledige opmaakvrijheid, eigen secties, de openbare deellink en een pdf zonder vermelding in de voettekst.",
      },
      {
        question: 'Kan ik opzeggen?',
        answer:
          "Ja, wanneer je wilt, vanuit je eigen omgeving. Je toegang loopt door tot het eind van de periode die je al hebt betaald, en je cv's blijven daarna gewoon bereikbaar met de gratis sjablonen.",
      },
      {
        question: 'Waarom een levenslange optie?',
        answer:
          'Omdat je een cv niet elke maand opnieuw maakt. Veel mensen hebben het een paar weken nodig, eens in de twee of drie jaar, en daar past een maandabonnement slecht bij.',
      },
      {
        question: 'Hoe verloopt de betaling?',
        answer:
          'De betaling gaat via Paddle, dat in een venster op de pagina opent zodat je de site niet verlaat. Je betaalt met creditcard (Visa, Mastercard, American Express), PayPal, Apple Pay of Google Pay. Paddle is de officiële verkoper en berekent de btw die in jouw land geldt. De bedragen worden in Amerikaanse dollars afgerekend; je bank rekent zijn eigen wisselkoers.',
      },
    ],
  },

  cta: {
    title: 'Klaar om je cv te maken?',
    description:
      'Kies een sjabloon, vul je loopbaan in en bedenk je zo vaak je wilt. Van sjabloon wisselen raakt je inhoud nooit.',
    primary: 'Gratis beginnen',
    secondary: 'Bekijk de prijzen',
  },
} as const;

/** English category id → Dutch slug, and back. */
export const NL_CATEGORY_SLUG: Record<TemplateCategory, string> = {
  modern: NL.categories.modern.slug,
  corporate: NL.categories.corporate.slug,
  creative: NL.categories.creative.slug,
  technology: NL.categories.technology.slug,
  classic: NL.categories.classic.slug,
  ats: NL.categories.ats.slug,
};

export function categoryFromDutchSlug(slug: string): TemplateCategory | undefined {
  return (Object.keys(NL_CATEGORY_SLUG) as TemplateCategory[]).find(
    (category) => NL_CATEGORY_SLUG[category] === slug,
  );
}
