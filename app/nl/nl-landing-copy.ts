import type { Landing } from '@/lib/i18n/landing';

/**
 * The Dutch commercial landing pages, as data.
 *
 * ## Why these eight
 *
 * They carry buying intent. `cv maken`, `cv schrijven`, `cv voorbeeld` and `gratis cv` are
 * typed by someone who means to produce a document today. The blog, the role examples and
 * the profession guides are deliberately absent: read-and-leave traffic, the largest body of
 * prose on the site, and the least bought by translating.
 *
 * ## What makes these Dutch rather than translated
 *
 * The same two facts that shape the Dutch home page shape these, and neither is true on the
 * English or German pages. The photo advice is *leave it off* — anonymous solliciteren has
 * moved Dutch guidance from "optional" to "usually not" — and `geboortedatum` and
 * `burgerlijke staat`, once standard, are now advised against on age-discrimination grounds.
 * A page that repeated the German line about photos being expected would be giving Dutch
 * readers advice for a different market.
 */

/** The links every one of these pages offers back into the Dutch subtree. */
const CORE_LINKS = [
  {
    label: 'Cv-sjablonen',
    href: '/nl/cv-sjablonen',
    description: 'De volledige galerij, alle stijlen.',
  },
  {
    label: 'Prijzen',
    href: '/nl/prijzen',
    description: 'Gratis, Pro en eenmalig.',
  },
];

export const NL_LANDING: Record<string, Landing> = {
  'cv-met-ai': {
    path: '/nl/cv-met-ai',
    breadcrumb: 'Cv met AI',
    metaTitle: 'Cv met AI — tien vragen, niets verzonnen',
    metaDescription:
      'Een AI die je cv schrijft zonder je resultaten te verzinnen. Beantwoord ongeveer tien vragen: hij schrijft het profiel, de bullets en de datums, en haalt elk getal weg dat je niet hebt gegeven.',
    keywords: [
      'cv met ai',
      'cv maken met ai',
      'ai cv generator',
      'cv laten schrijven ai',
      'kunstmatige intelligentie cv',
    ],
    heading: 'Een cv geschreven door AI, zonder verzinsels',
    lede: 'Beantwoord ongeveer tien vragen in je eigen woorden. De AI schrijft het profiel, maakt van wat je zei nette bullets en leidt de datums af — en haalt daarna elk getal weg dat je niet hebt gegeven. En vertelt je hoeveel.',
    badges: ['Ongeveer tien vragen', 'Geen verzonnen getallen', 'Alles blijft aanpasbaar'],
    steps: {
      title: 'Van blanco pagina naar eerste versie',
      items: [
        {
          title: 'Ongeveer tien vragen',
          body: 'Je naam, de functie waarop je solliciteert, en dan één baan tegelijk: welke, waar, wanneer, en wat je er deed — in de woorden die je hardop zou gebruiken. Onder elke vraag staat een voorbeeldantwoord.',
        },
        {
          title: 'De getallen die je hebt',
          body: 'Eén vraag vraagt expliciet om getallen: teamgrootte, budget, aantal locaties of klanten. Alleen daar mogen getallen vandaan komen. Laat je het leeg, dan staan er geen in je cv.',
        },
        {
          title: 'De AI schrijft het document',
          body: 'Hij schrijft het profiel vanaf nul, maakt van elk antwoord losse bullets die met een werkwoord beginnen, leidt datums af uit hoe je ze opschreef, en sorteert alles per onderdeel. Een paar seconden.',
        },
        {
          title: 'Je leest het voordat het bestaat',
          body: 'Er wordt niets bewaard voordat je het hebt gezien. Je houdt het, of je gaat terug en past je antwoorden aan. Daarna opent het in de editor als elk ander cv.',
        },
      ],
    },
    howTo: true,
    features: {
      title: 'Wat de AI niet doet',
      description:
        'Elke tool belooft nauwkeurigheid. Dit is het mechanisme achter die belofte, zodat je het kunt beoordelen in plaats van geloven.',
      columns: 2,
      items: [
        {
          title: 'Hij kan geen getal gebruiken dat je niet gaf',
          body: 'Na het schrijven wordt elke bullet vergeleken met wat je hebt getypt. Elke regel met een getal dat niet in je antwoorden voorkwam, wordt verwijderd — en je krijgt te horen hoeveel. Geen beleefde instructie in een prompt, maar een controle die erna draait.',
        },
        {
          title: 'Hij herformuleert, hij verfraait niet',
          body: '„Ik stuurde het onderhoudsteam aan en maakte de maandrapportages” wordt twee nette bullets. Niet „Leidde een team van 12 en verkortte de responstijd met 30%” — je zei geen twaalf en geen dertig procent.',
        },
        {
          title: 'Hij schrijft in jouw taal',
          body: 'Antwoord je in het Nederlands, dan is je cv Nederlands. Er is geen vertaalstap die je woorden stilletjes verandert in die van iemand anders.',
        },
        {
          title: 'Achteraf is elk woord aanpasbaar',
          body: 'Het resultaat is een gewoon cv in de gewone editor. Herschrijf een bullet, verwijder een functie, wissel van sjabloon — niets zit vast omdat een machine de eerste versie maakte.',
        },
      ],
    },
    prose: [
      {
        heading: 'Het echte probleem met een AI die je vleit',
        paragraphs: [
          'Een cv dat „30% verbetering” claimt, roept in een gesprek precies één vraag op: hoe heb je dat gemeten? Wie daar geen antwoord op heeft, verliest niet alleen een punt — de rest van de pagina wordt ook verdacht.',
          'Getallen zijn juist wat een cv senior laat klinken, en daarom grijpt een taalmodel ernaar. Vraag een algemene AI om een cv-bullet en tel de percentages die terugkomen die je nooit hebt genoemd.',
          'Het ergste is dat je het niet zult merken. Niemand leest een zin na die hem vleit: een verzonnen prestatie leest als een goede dag die je half was vergeten. Daarom draait de controle voordat je de concepttekst ziet.',
        ],
      },
      {
        heading: 'Heb je al een cv?',
        paragraphs: [
          'Beantwoord dan geen vragen, maar upload het. De import leest een pdf of Word-bestand en vult de editor: functies, werkgevers, datums, bullets, opleiding, vaardigheden en talen.',
          'Hij werkt vanuit de pagina-indeling in plaats van de ruwe tekstvolgorde, waardoor een cv met twee kolommen niet door elkaar terugkomt. En hij laat zien wat hij heeft gelezen voordat er iets wordt bewaard.',
        ],
      },
    ],
    faq: [
      {
        question: 'Schrijft de AI het echt, of is het een formulier?',
        answer:
          'Hij schrijft het. Het profiel staat helemaal niet in je antwoorden — de AI stelt het op. Je gewone zinnen worden gestructureerde bullets, en „januari 2021 tot nu” wordt een startdatum met de functie als lopend gemarkeerd. De vragen bestaan omdat een AI niet kan schrijven over iemand die hij niet kent.',
      },
      {
        question: 'Hoe verschilt dit van ChatGPT om een cv vragen?',
        answer:
          'Op twee punten. Hij stelt eerst de juiste vragen, dus hij werkt met echt materiaal in plaats van te gokken naar een generiek cv voor jouw functietitel. En hij houdt geen getal dat je niet gaf — een algemene chatbot geeft je met plezier een verzonnen percentage, niet te onderscheiden van een echt.',
      },
      {
        question: 'En als ik geen indrukwekkende getallen heb?',
        answer:
          'Dan staan er geen in je cv, en dat is prima. De meeste mensen hebben voor het meeste wat ze deden geen nette meetwaarde. Een concrete ware bullet — „verzorgde de maandelijkse rapportage voor vier regiokantoren” — is meer waard dan een verzonnen percentage, omdat je er tien minuten over kunt praten.',
      },
      {
        question: 'Hoe lang duurt het?',
        answer:
          'De vragen kosten vijf tot tien minuten als je je datums weet. Het schrijven duurt seconden. De rest van de tijd gaat naar de editor, waar je schrapt en aanscherpt — en dat is het deel dat tijd verdient.',
      },
      {
        question: 'Is het gratis?',
        answer:
          'De vragen beantwoorden is gratis, en de vragen zijn op zichzelf nuttig: sommige mensen lopen ze door en schrijven het cv daarna zelf in de editor, wat niets kost en dat ook nooit zal doen. De AI-stap hoort bij Pro en Lifetime.',
      },
      {
        question: 'In welke talen werkt het?',
        answer:
          'Nederlands, Engels, Frans en Duits. De vragen en hun voorbeelden zijn in elke taal geschreven in plaats van machinaal vertaald, en het cv komt terug in de taal waarin je hebt geantwoord.',
      },
    ],
    related: [
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor, scherm voor scherm.',
      },
      {
        label: 'Cv schrijven',
        href: '/nl/cv-schrijven',
        description: 'Van blanco pagina tot afgerond document, op volgorde.',
      },
      ...CORE_LINKS,
    ],
  },
  'cv-maken': {
    path: '/nl/cv-maken',
    breadcrumb: 'Cv maken',
    metaTitle: 'Cv maken — online en gratis',
    metaDescription:
      'Maak je cv in een editor die de echte pagina toont terwijl je typt. Gratis sjablonen, meteen een pdf, niets te installeren.',
    keywords: [
      'cv maken',
      'cv maken online',
      'cv maken gratis',
      'cv opstellen',
      'curriculum vitae maken',
    ],
    heading: 'Cv maken',
    lede: 'Een editor die de pagina laat zien zoals die eruit komt. Links vul je velden in, rechts bouwt de A4-pagina zich op, en de pdf die je downloadt is precies wat je ziet — geen benadering die bij het afdrukken op een tweede pagina belandt.',
    badges: ['Niets te installeren', 'Live voorbeeld', 'Selecteerbare pdf-tekst'],
    steps: {
      title: 'Wat de editor doet',
      items: [
        {
          title: 'Velden in plaats van een leeg vel',
          body: 'Elke sectie heeft zijn velden: functie, werkgever, periode, resultaten. Je maakt niets op, je vult in — de opmaak is het werk van het sjabloon.',
        },
        {
          title: 'Het voorbeeld ís het document',
          body: 'De pagina rechts wordt gemaakt door dezelfde code als je pdf. Geen ruwe voorvertoning: het document, op schaal.',
        },
        {
          title: 'Herschikken zonder overtypen',
          body: 'Secties verplaats, hernoem en verberg je. Vaardigheden vóór je werkervaring zetten kost drie seconden en raakt geen letter tekst.',
        },
        {
          title: 'Exporteren als pdf',
          body: 'A4 of US Letter, met tekst die je echt kunt selecteren. Het bestand komt van de server, van dezelfde engine die het voorbeeld rendert, dus de twee kunnen niet uit elkaar lopen.',
        },
      ],
    },
    features: {
      title: 'De instellingen die ertoe doen',
      description:
        'Genoeg vrijheid om het document van jou te maken, niet genoeg om het te slopen.',
      items: [
        {
          title: 'Typografie',
          body: 'Vijftien lettertypefamilies, gekozen omdat ze op 10 punt op papier leesbaar blijven. Elk sjabloon komt met een kloppend paar voor koppen en tekst.',
        },
        {
          title: 'Accentkleur',
          body: 'Eén kleur, op de sectiekoppen en de lijnen. Een cv in vier kleuren is niet expressiever, alleen lastiger te lezen.',
        },
        {
          title: 'Witruimte en marges',
          body: 'Regelafstand, ruimte tussen secties en paginamarge stel je apart in. Dat is de knop waar je aan draait als je drie regels tekortkomt voor één pagina.',
        },
        {
          title: 'Pasfoto',
          body: 'In je browser vierkant bijgesneden en verkleind naar 600px vóór het uploaden, zodat een telefoonfoto je pdf niet opblaast. Uit te zetten op elk sjabloon dat er een heeft — op een Nederlands cv meestal het advies.',
        },
        {
          title: 'Eigen secties',
          body: 'Voor alles wat de twaalf standaardsecties niet dekken: octrooien, bestuursfuncties, lezingen, vrijwilligerswerk met een eigen kop.',
        },
        {
          title: 'Motivatiebrief',
          body: 'Neemt de lettertypen, de kleur en de marges van je cv over en wordt geëxporteerd als eerste pagina van dezelfde pdf — de twee documenten komen als één set aan.',
        },
      ],
    },
    prose: [
      {
        heading: 'Waarom een editor en geen Word-bestand',
        paragraphs: [
          'Een Word-sjabloon is een document dat je moet repareren. De onzichtbare tabellen die het bij elkaar houden verschuiven zodra je een regel toevoegt, het lettertype ontbreekt op de computer aan de andere kant, en de geëxporteerde pdf lijkt niet meer helemaal op wat je op het scherm had. De tijd die je denkt te winnen met een kant-en-klaar sjabloon, besteed je aan het bijtrekken van de opmaak.',
          'Hier kun je de opmaak niet per ongeluk verzetten, want die zit niet in jouw document: hij hoort bij het sjabloon, en jouw inhoud staat er los van. Precies daardoor kun je na het invullen nog van sjabloon wisselen zonder iets over te doen, en daardoor is een cv dat je in twee minuten vult net zo netjes gezet als een waar je twee uur aan hebt gewerkt.',
        ],
      },
      {
        heading: 'Wat je houdt',
        paragraphs: [
          'Je cv is van jou en blijft exporteerbaar. Vanuit de instellingen download je al je documenten als JSON — contactgegevens, secties, opmaakinstellingen — in een bestand dat in je browser wordt gebouwd uit je eigen account. Daar wordt niets elders voor opgeslagen.',
          'Pdf’s verlopen niet en dragen geen watermerk. Het gratis abonnement zet een kleine vermelding in de voettekst; het betaalde haalt die weg. Er is geen versie van het document die je niet kunt meenemen.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Moet ik iets installeren?',
        answer:
          'Nee. Alles gebeurt in de browser, op een computer én op een telefoon. De pdf wordt op de server gemaakt en gedownload als elk ander bestand.',
      },
      {
        question: 'Wordt mijn werk automatisch opgeslagen?',
        answer:
          'Ja, terwijl je typt. Mislukt het opslaan — verbinding weg, tabblad te snel dicht — dan blijft er een kopie in je browser die je bij het opnieuw openen krijgt aangeboden, met datum, zodat jij kiest welke je houdt.',
      },
      {
        question: 'Kan ik meerdere versies van mijn cv maken?',
        answer:
          'Ja. Dupliceer een bestaand cv en pas het aan op de vacature: dat is het nuttigste gebruik van het gereedschap, en precies wat Pro onbeperkt maakt. Het gratis abonnement bewaart er één.',
      },
      {
        question: 'Werkt de editor op een telefoon?',
        answer:
          'Ja. Het voorbeeld schuift onder het formulier in plaats van ernaast, en je loopt de secties één voor één door. Een heel cv met je duim schrijven blijft onhandig — een typefout of een datum corrigeren vlak voor het versturen niet.',
      },
    ],
    related: [
      {
        label: 'Cv schrijven, stap voor stap',
        href: '/nl/cv-schrijven',
        description: 'Wat er in elke sectie hoort en hoe je het opschrijft.',
      },
      {
        label: 'ATS-vriendelijk cv',
        href: '/nl/ats-cv',
        description: 'Opmaak die recruitmentsoftware foutloos uitleest.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-schrijven': {
    path: '/nl/cv-schrijven',
    breadcrumb: 'Cv schrijven',
    metaTitle: 'Cv schrijven: de complete aanpak',
    metaDescription:
      'Hoe je een cv schrijft, sectie voor sectie: wat erin hoort, wat er niet meer in hoort, en hoe je een functie zo opschrijft dat die iets zegt.',
    keywords: ['cv schrijven', 'hoe schrijf je een cv', 'cv opbouw', 'cv tips', 'goed cv'],
    heading: 'Cv schrijven, van leeg vel tot pdf',
    lede: 'Het lastige is bijna nooit de opmaak — het is wat er onder “Werkervaring” moet komen als je naar het lege veld kijkt. Deze pagina behandelt allebei: wat er in elke sectie hoort, en het gereedschap om het te schrijven.',
    badges: ['Sectie voor sectie', 'Concrete voorbeelden', 'Gratis'],
    howTo: true,
    steps: {
      title: 'De volgorde',
      items: [
        {
          title: 'Verzamel voordat je schrijft',
          body: 'Begin- en einddata van elke functie, precieze functietitels, diploma’s en jaartallen. Midden in het schrijven een datum zoeken is waarom cv’s half af blijven liggen.',
        },
        {
          title: 'Begin met je werkervaring',
          body: 'Dat is de langste en meestgelezen sectie. De rest schikt zich eromheen — ook je profieltekst, die makkelijker schrijft als je loopbaan er al staat.',
        },
        {
          title: 'Terugbrengen tot één pagina',
          body: 'Schrap eerst functies van meer dan tien jaar geleden, daarna taken die in jouw vak vanzelfsprekend zijn. Wat overblijft moet zijn waarover je in het gesprek vragen wilt krijgen.',
        },
        {
          title: 'Hardop lezen, dan exporteren',
          body: 'Fouten die drie stille leesbeurten overleven, overleven één keer hardop lezen niet. Exporteer daarna de pdf en open hem: dat is het document dat de recruiter ziet.',
        },
      ],
    },
    features: {
      title: 'Wat er in elke sectie hoort',
      columns: 2,
      items: [
        {
          title: 'Persoonlijke gegevens',
          body: 'Naam, woonplaats, telefoonnummer, e-mail. Géén geboortedatum, géén burgerlijke staat en géén nationaliteit: ze zeggen niets over je geschiktheid en geven ruimte aan vooroordelen.',
        },
        {
          title: 'Je profiel',
          body: 'Drie of vier regels: je vakgebied, je jaren ervaring en het resultaat dat als eerste gelezen moet worden. Niet “enthousiast en teamplayer” — daar is nog nooit iemand op uitgenodigd.',
        },
        {
          title: 'Werkervaring',
          body: 'Per functie één regel context (omvang, teamgrootte) en dan resultaten. “Verantwoordelijk voor het budget” beschrijft een vacaturetekst; “budget van € 400k over twee boekjaren binnen 3% gehouden” beschrijft wat jij deed.',
        },
        {
          title: 'Opleiding',
          body: 'Diploma, instelling, jaartal. Aan het begin van een loopbaan staat het boven je werkervaring en mag je je afstudeeronderwerp of relevante vakken noemen. Tien jaar later volstaan twee regels.',
        },
        {
          title: 'Vaardigheden en talen',
          body: 'Vijf tot vijftien vaardigheden, gegroepeerd. Talen met een ERK-niveau — A1 tot C2 — in plaats van “goede beheersing”, wat niets controleerbaars zegt.',
        },
        {
          title: 'Wat er niet meer in hoort',
          body: 'De kop “Curriculum Vitae”, de zin “referenties op aanvraag beschikbaar”, en bij de meeste sollicitaties ook de foto. Geen van drieën helpt, en elk neemt de plek in van een regel die dat wel doet.',
        },
      ],
    },
    prose: [
      {
        heading: 'Een functie opschrijven die iets zegt',
        paragraphs: [
          'De reflex is om te beschrijven waar je verantwoordelijk voor was. De recruiter zoekt wat je hebt veranderd. Het verschil zit in één omzetting: begin de zin met een werkwoord, eindig met een getal of een termijn, en schrap alles wat de functie beschrijft in plaats van jouw tijd erin.',
          '“Onboarding opnieuw opgebouwd, activatie in twee kwartalen van 34% naar 58% gebracht” past op één regel en bevat een handeling, een maat en een periode. Je kunt erop bevraagd worden in een gesprek, wat precies het doel van een cv-regel is. Drie of vier van dat soort regels wegen zwaarder dan acht regels verantwoordelijkheden.',
          'Heb je geen cijfers — dat komt vaak voor en is geen bezwaar — vervang de maat dan door een omvang: het aantal mensen dat het raakte, de grootte van het gebied, de duur van het project, wat er eerst niet was en daarna wel.',
        ],
      },
      {
        heading: 'Eén pagina of twee?',
        paragraphs: [
          'Eén pagina onder de tien jaar ervaring, twee daarboven. De regel telt minder om zichzelf dan om wat hij afdwingt: op één pagina moet je kiezen, en die keuze is voor de lezer al informatie.',
          'Boven twee pagina’s schrijf je geen cv meer maar een dossier. In de wetenschap is dat terecht, waar de publicatielijst verwacht wordt. Elders is een derde pagina bijna altijd het teken dat er niet is afgewogen.',
          'Kom je drie regels tekort, verklein het lettertype dan niet onder 10 punt: dat zie je meteen en het oogt als een document dat overloopt. Draai liever aan de regelafstand en de paginamarge, of schrap een oude functie.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Hoort er een motivatiebrief bij?',
        answer:
          'Bij de meeste Nederlandse vacatures wel, tenzij er uitdrukkelijk staat dat het niet hoeft. De editor heeft er een ingebouwd: hij neemt de lettertypen, de kleur en de marges van je cv over en wordt als eerste pagina van dezelfde pdf geëxporteerd.',
      },
      {
        question: 'In welke volgorde zet ik mijn werkervaring?',
        answer:
          'Omgekeerd chronologisch: de meest recente bovenaan. Dat is wat een recruiter zoekt en niemand zou het moeten afleiden. De gebruikelijke uitzondering is het functionele cv, waarin resultaten per vakgebied worden gebundeld en de functies onderaan in een paar regels staan.',
      },
      {
        question: 'Hoe ga ik om met een gat in mijn cv?',
        answer:
          'Door het kort te benoemen in plaats van te verbergen: ouderschapsverlof, opleiding, omscholing, mantelzorg. Een uitgelegd gat van zes maanden is voor niemand een probleem; hetzelfde gat zonder toelichting is precies wat de vraag in het gesprek oproept.',
      },
      {
        question: 'Moet ik mijn cv per vacature aanpassen?',
        answer:
          'Bij de vacatures die je echt wilt, ja — en de nuttige aanpassing is korter dan je denkt: je profieltekst, de volgorde van je vaardigheden en de twee of drie resultaten die je naar voren haalt. Een bestaand cv dupliceren kost een seconde en scheelt opnieuw beginnen.',
      },
    ],
    related: [
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor, het live voorbeeld en de pdf-export.',
      },
      {
        label: 'Cv-voorbeelden',
        href: '/nl/cv-voorbeelden',
        description: 'Ingevulde cv’s om sectie voor sectie over te nemen.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-online': {
    path: '/nl/cv-online',
    breadcrumb: 'Cv online',
    metaTitle: 'Cv online maken, opmaken en downloaden',
    metaDescription:
      'Schrijf je cv online en download het als pdf vanuit je browser. Niets te installeren, en je document blijft bereikbaar en aanpasbaar vanaf elk apparaat.',
    keywords: [
      'cv online',
      'cv online maken gratis',
      'cv in de browser',
      'online cv maken',
      'cv pdf online',
    ],
    heading: 'Je cv, online',
    lede: 'Een cv online is geen op het web gepubliceerd cv — het is een cv dat je niet hoeft terug te vinden. Het staat in je account, opent op elk apparaat en levert een pdf wanneer je er een nodig hebt.',
    badges: ['Overal bereikbaar', 'Niets te installeren', 'Met Pro onbeperkt exporteren'],
    steps: {
      title: 'Wat “online” concreet verandert',
      items: [
        {
          title: 'Geen bestand meer zoeken',
          body: 'Geen cv_definitief_v3_echt_definitief.docx meer. Er is één document, op één adres, en het is altijd de laatste versie.',
        },
        {
          title: 'Op al je apparaten hetzelfde',
          body: 'Begonnen op de computer van je werk, gecorrigeerd in de trein op je telefoon. Geen overzetten, geen usb-stick, geen mail aan jezelf.',
        },
        {
          title: 'Bijwerken in plaats van overdoen',
          body: 'Over twee jaar voeg je een functie toe en exporteer je. Je opent geen bestand waarvan de opmaak is verouderd en het lettertype ontbreekt.',
        },
        {
          title: 'Een link om te delen, als je wilt',
          body: 'Pro publiceert je cv op een adres dat niemand kan raden en dat je met één klik weer uitzet. In zoekmachines verschijnt het niet.',
        },
      ],
    },
    prose: [
      {
        heading: 'Online, maar niet openbaar',
        paragraphs: [
          'Dat is de vaakst gemaakte verwarring en die verdient een helder antwoord: je cv is voor niemand behalve jou zichtbaar zolang je niet zelf een deellink aanzet. Het wordt niet geïndexeerd, niet ergens opgesomd en aan geen enkele recruiter aangeboden. We verkopen geen kandidatendatabank en deze site is geen bemiddelingsplatform.',
          'De openbare link wijst, als je hem aanzet, naar een alleen-lezen pagina op een willekeurig adres dat zoekmachines niet indexeren. Je zet hem uit wanneer je wilt, en het oude adres werkt dan meteen niet meer.',
        ],
      },
      {
        heading: 'De pdf blijft het document dat telt',
        paragraphs: [
          'Hoe modern het gereedschap ook is: wat er in de inbox van een recruiter of in een sollicitatieportaal aankomt is een pdf. Daarom wordt het voorbeeld op ware paginagrootte gezet en door dezelfde engine gerenderd als de export: dat die twee overeenkomen is de belangrijkste eigenschap van het product, geen bijkomstigheid.',
          'De tekst in de pdf is altijd echte tekst. Je kunt hem selecteren, kopiëren en uitlezen — precies wat een Applicant Tracking System doet voordat een mens het bestand opent. Een als afbeelding geëxporteerd cv is voor die software leeg, en dat is een geruisloze manier om te verdwijnen.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Zien recruiters mijn cv?',
        answer:
          'Nee. Er wordt niets gedeeld zolang je niet zelf een openbare link aanzet, en deze site biedt cv’s aan niemand aan — er is geen kandidatendatabank.',
      },
      {
        question: 'Wat gebeurt er als ik mijn account verwijder?',
        answer:
          'Je cv’s, je betaalgeschiedenis en je profiel worden verwijderd. Exporteer je documenten eerst als JSON vanuit de instellingen als je een kopie wilt houden: verwijderen is onomkeerbaar.',
      },
      {
        question: 'Kan ik offline werken?',
        answer:
          'Gedeeltelijk. De editor houdt een lokale kopie van je werk in je browser, wat een sessie beschermt die door een wankele verbinding wordt onderbroken. Definitief opslaan en de pdf-export hebben wel verbinding nodig.',
      },
      {
        question: 'Hoe lang wordt mijn cv bewaard?',
        answer:
          'Onbeperkt, zolang je account bestaat. We verwijderen documenten van een inactief account niet zonder waarschuwing, en een cv dat je met het gratis abonnement hebt gemaakt blijft bereikbaar ook als een betaald abonnement afloopt.',
      },
    ],
    related: [
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor en de export in detail.',
      },
      {
        label: 'Gratis cv',
        href: '/nl/gratis-cv',
        description: 'Wat het gratis abonnement precies bevat.',
      },
      ...CORE_LINKS,
    ],
  },

  'cv-voorbeelden': {
    path: '/nl/cv-voorbeelden',
    breadcrumb: 'Cv-voorbeelden',
    metaTitle: 'Cv-voorbeelden om over te nemen',
    metaDescription:
      'Ingevulde cv-voorbeelden om de vorm te zien voordat je schrijft: wat er in elke sectie staat, in welke volgorde en op welke lengte.',
    keywords: [
      'cv voorbeeld',
      'cv voorbeelden',
      'voorbeeld cv gratis',
      'ingevuld cv',
      'cv voorbeeld pdf',
    ],
    heading: 'Cv-voorbeelden',
    lede: 'Een leeg sjabloon zegt niet hoe lang een functie mag zijn, of hoeveel vaardigheden de moeite waard zijn om te noemen. Een ingevuld cv wel. Elk sjabloon in de galerij wordt getoond met een volledig voorbeeld dat je regel voor regel kunt vervangen.',
    badges: ['Volledige voorbeelden', 'Direct over te nemen', 'Alle beroepen'],
    features: {
      title: 'Wat een voorbeeld laat zien en een leeg sjabloon niet',
      items: [
        {
          title: 'De juiste lengte',
          body: 'Drie regels resultaten per functie, geen acht. Op een voorbeeld zie je dat in één oogopslag, op een leeg raster helemaal niet.',
        },
        {
          title: 'Het detailniveau',
          body: 'Wat er in een regel werkervaring hoort en wat je bewaart voor het gesprek. Die grens is makkelijker te laten zien dan uit te leggen.',
        },
        {
          title: 'De volgorde van de secties',
          body: 'Opleiding vóór werkervaring aan het begin van een loopbaan, daarna andersom. Het voorbeeld toont de afweging in plaats van de regel op te sommen.',
        },
        {
          title: 'Wat er op één pagina past',
          body: 'Met de echte lettertypen en de echte marges. Alleen zo weet je eerlijk hoeveel functies erin gaan voordat het overloopt.',
        },
        {
          title: 'De dichtheid die werkt',
          body: 'Een te luchtig cv oogt leeg, een te vol cv wordt niet gelezen. Het voorbeeld is daartussenin gezet, op het sjabloon dat je bekijkt.',
        },
        {
          title: 'Hoe het sjabloon echt oogt',
          body: 'Een screenshot van een leeg sjabloon vleit altijd. Ingevuld laat het zien wat de opmaak doet als een functietitel lang is.',
        },
      ],
    },
    prose: [
      {
        heading: 'Een voorbeeld overnemen zonder de inhoud te kopiëren',
        paragraphs: [
          'Een voorbeeld toont de vorm, het levert niet de zinnen. Neem de structuur over — het aantal regels, hoe een resultaat is geformuleerd, de volgorde van de secties — en vervang de tekst volledig door die van jou. Een standaardformulering herkent een recruiter meteen, en standaardformuleringen staan in honderden cv’s.',
          'De juiste manier: open het voorbeeld, lees één regel werkervaring, vraag je af wat bij jou het equivalent zou zijn, schrijf het op, ga naar de volgende. Dat is trager dan kopiëren en het enige dat een cv oplevert dat op jou lijkt.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Kan ik de voorbeelden zo overnemen?',
        answer:
          'De opmaak wel — daar is het sjabloon voor. De tekst niet: die staat er om de vorm te tonen. Een cv gevuld met de zinnen uit het voorbeeld valt op en werkt tegen je.',
      },
      {
        question: 'Zijn er voorbeelden per beroep?',
        answer:
          'De sjablonen dekken de grote velden — IT, finance, creatief, zorg, onderwijs, overheid — en elk wordt getoond met een voorbeeld dat bij dat veld past. Uitgebreide gidsen per beroep bestaan voorlopig alleen in het Engels.',
      },
      {
        question: 'Kan ik in de editor met een voorbeeld beginnen?',
        answer:
          'Ja. Kies bij het maken van een cv voor “Beginnen met een voorbeeld”: het document komt ingevuld binnen en je vervangt de secties één voor één. Dat is vaak sneller dan een leeg vel.',
      },
    ],
    related: [
      {
        label: 'Cv schrijven, stap voor stap',
        href: '/nl/cv-schrijven',
        description: 'Wat er in elke sectie hoort en hoe je het opschrijft.',
      },
      {
        label: 'Moderne cv-sjablonen',
        href: '/nl/cv-sjablonen/modern',
        description: 'Het veiligste startpunt.',
      },
      ...CORE_LINKS,
    ],
  },

  'ats-cv': {
    path: '/nl/ats-cv',
    breadcrumb: 'ATS-vriendelijk cv',
    metaTitle: 'ATS-vriendelijk cv',
    metaDescription:
      'Een cv dat recruitmentsoftware foutloos uitleest: één kolom, geen graphics, kopjes voluit. Sjablonen met een 5/5, gratis.',
    keywords: [
      'ats cv',
      'ats vriendelijk cv',
      'cv recruitmentsoftware',
      'cv scanbaar',
      'ats sjabloon',
    ],
    heading: 'ATS-vriendelijk cv',
    lede: 'Voordat een mens je sollicitatie opent, haalt software de tekst eruit. Gaat dat mis, dan val je af zonder dat iemand daarover heeft besloten. Deze sjablonen zijn gemaakt zodat dat uitlezen goed gaat.',
    badges: ['Eén kolom', 'Zonder graphics', 'Uitleesbare tekst'],
    features: {
      title: 'Wat het uitlezen stukmaakt',
      description:
        'De zes oorzaken die steeds terugkomen, en wat de 5/5-sjablonen in plaats daarvan doen.',
      items: [
        {
          title: 'Twee kolommen',
          body: 'De software leest over de volle breedte van links naar rechts. Een zijbalk raakt verweven met de hoofdtekst, en de volgorde van je functies wordt onleesbaar.',
        },
        {
          title: 'Pictogrammen in plaats van kopjes',
          body: 'Een envelopje voor je e-mailadres, een hoorntje voor je nummer. Een afbeelding bevat geen tekst: de informatie bestaat voor het oog en niet voor de software.',
        },
        {
          title: 'Tekst in een afbeelding',
          body: 'Een als afbeelding geëxporteerd cv komt er volledig leeg uit. Dat is het enige punt in deze lijst dat de sollicitatie voor 100% laat mislukken.',
        },
        {
          title: 'Kop- en voetteksten',
          body: 'Veel uitleessoftware negeert die. Een telefoonnummer in de voettekst komt er aan de andere kant misschien nooit uit.',
        },
        {
          title: 'Niveaubalkjes',
          body: 'Een balkje dat voor driekwart is gevuld levert geen tekst op. Het neemt de plek in van iets controleerbaars en levert niets.',
        },
        {
          title: 'Zelfbedachte kopjes',
          body: '“Mijn loopbaan” in plaats van “Werkervaring”. Uitleessoftware zoekt de standaardkopjes; een origineel kopje kost je de hele sectie.',
        },
      ],
    },
    prose: [
      {
        heading: 'De score van vijf, en wat die waard is',
        paragraphs: [
          'Elk sjabloon heeft een score van 1 tot 5. Die wordt berekend uit de opmaakeigenschappen hierboven — aantal kolommen, graphics in de tekstkolom, pictogrammen die informatie dragen, structuur van de kopjes — en niet uit een test tegen echte software.',
          'Het is een beoordeling, geen keurmerk, en dat hoort er duidelijk bij: er zijn tientallen Applicant Tracking Systems, ze gedragen zich verschillend, en geen enkele aanbieder van cv-gereedschap kan beweren ze allemaal te hebben getest. Wat de score zegt is betrouwbaar én begrensd: in hoeverre de opmaak de eigenschappen heeft die problemen geven wanneer ze problemen geven.',
          'Het praktische gevolg is simpel. Voor een sollicitatie via een portaal — een groot bedrijf, een bureau, een vacaturesite — neem je een sjabloon met een 5. Voor een sollicitatie rechtstreeks aan een persoon, of in een vak waar de vormgeving onderdeel is van je werk, geldt die beperking niet en is een grafischer sjabloon prima te verdedigen.',
        ],
      },
      {
        heading: 'Trefwoorden, zonder stapelen',
        paragraphs: [
          'Een ATS rangschikt sollicitaties vaak op het voorkomen van termen uit de vacature. Het verstandige antwoord is de woorden van de advertentie gebruiken wanneer die echt beschrijven wat je hebt gedaan — staat er “projectbeheersing” en schrijf jij “projectleiding”, dan mag je beide één keer gebruiken.',
          'Het onverstandige antwoord is een trefwoordenlijst onderaan de pagina, of witte tekst op een witte achtergrond. Het eerste is zichtbaar en maakt een slechte indruk; het tweede wordt herkend en leidt tot afwijzing. Geen van beide is het risico waard.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Is een cv in twee kolommen een afwijzing waard?',
        answer:
          'Nee, maar het is een onnodig risico als de sollicitatie via een portaal loopt. Veel moderne uitleessoftware komt er wel uit; de software die faalt doet dat geruisloos, en jij hoort nooit dat het is gebeurd.',
      },
      {
        question: 'Moet ik de foto weghalen voor een ATS?',
        answer:
          'De software negeert de afbeelding gewoon, dus die maakt niets stuk. Wel neemt hij ruimte in — en op een Nederlands cv is de foto weglaten sowieso meestal het advies, omdat steeds meer werkgevers anoniem screenen. Bij een portaalsollicitatie kost weglaten je dus niets.',
      },
      {
        question: 'Welk bestandsformaat stuur ik?',
        answer:
          'Pdf, tenzij de vacature uitdrukkelijk om Word vraagt. De pdf die hier wordt geëxporteerd bevat echte tekst, dus die wordt net zo goed uitgelezen als een .docx en houdt daarbij zijn opmaak — wat een .docx niet garandeert.',
      },
      {
        question: 'Zijn de ATS-sjablonen gratis?',
        answer:
          'Alle sjablonen met een 5 op 5 horen bij het gratis abonnement. Dat is bewust: door de software gelezen worden hoort geen betaalde functie te zijn.',
      },
    ],
    related: [
      {
        label: 'ATS-vriendelijke sjablonen',
        href: '/nl/cv-sjablonen/ats',
        description: 'De sjablonen met een 5/5, in de galerij.',
      },
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor, het live voorbeeld en de pdf-export.',
      },
      ...CORE_LINKS,
    ],
  },

  'gratis-cv': {
    path: '/nl/gratis-cv',
    breadcrumb: 'Gratis cv',
    metaTitle: 'Gratis cv maken — wat er echt bij zit',
    metaDescription:
      'Een cv maken, opmaken en als pdf downloaden zonder te betalen en zonder creditcard. Precies wat het gratis abonnement bevat — en wat niet.',
    keywords: [
      'gratis cv',
      'gratis cv maken',
      'cv gratis downloaden',
      'gratis cv sjabloon',
      'cv maken zonder betalen',
    ],
    heading: 'Gratis cv, zonder addertje',
    lede: 'Veel tools noemen het “gratis” om een cv op te maken, en vragen dan geld op het moment van downloaden. Zo werkt het hier niet, en deze pagina zegt precies waar de grens ligt.',
    badges: ['Geen creditcard', 'Pdf te downloaden', 'Geen proefperiode'],
    features: {
      title: 'Wat het gratis abonnement bevat',
      columns: 2,
      items: [
        {
          title: 'De gratis sjablonen',
          body: 'Een flink deel van de galerij, waaronder alle sjablonen met een 5/5 voor recruitmentsoftware. ATS-vriendelijkheid zit niet achter de betaalmuur.',
        },
        {
          title: 'De volledige editor',
          body: 'Alle secties, het live voorbeeld, herschikken, de foto, de motivatiebrief. Geen enkele schrijffunctie is beperkt.',
        },
        {
          title: 'De pdf-download',
          body: 'Een echte pdf, met selecteerbare tekst, zonder watermerk over de pagina. In de voettekst staat een kleine vermelding.',
        },
        {
          title: 'Eén opgeslagen cv',
          body: 'Bewaard in je account, aanpasbaar, exporteerbaar. Het verdwijnt niet na dertig dagen.',
        },
      ],
    },
    prose: [
      {
        heading: 'En wat er niet bij zit',
        paragraphs: [
          'De sjablonen met het label Pro, meerdere cv’s, onbeperkt downloaden, de uitgebreide opmaak, eigen secties, de openbare deellink en de pdf zonder vermelding in de voettekst. Dat is de volledige lijst: er is geen verborgen grens die opduikt op het moment dat je hem nodig hebt.',
          'Waarom juist die dingen geld kosten en andere niet, past in één zin: ze zijn vooral nuttig voor wie vaak solliciteert. Wie één cv maakt voor één sollicitatie heeft er niets aan, en die laten betalen voor het downloaden van een document dat hij zelf heeft geschreven zou voor iedereen een slechte deal zijn.',
        ],
      },
      {
        heading: 'Waarom er een account nodig is',
        paragraphs: [
          'Om je cv te bewaren en het je later terug te geven. Zonder account is er geen plek voor: het zou in het tabblad leven en daarmee verdwijnen. Registreren vraagt een e-mailadres en een wachtwoord, of een Google-account — nooit een creditcard.',
          'Dat adres dient drie dingen: opnieuw inloggen, een vergeten wachtwoord herstellen, en je een bon sturen als je ooit betaalt. Producte-mails zijn optioneel en zet je uit in de instellingen.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Heb ik een creditcard nodig om te beginnen?',
        answer:
          'Nee, op geen enkel moment. Er is geen proefperiode die je moet opzeggen, dus er valt niets in te vullen zolang je niet zelf voor een betaald abonnement kiest.',
      },
      {
        question: 'Zit er een watermerk op de gratis pdf?',
        answer:
          'Geen watermerk over de pagina. In de voettekst staat een kleine vermelding, in de geest van de adresregel op een gedrukt document. Het betaalde abonnement haalt die weg.',
      },
      {
        question: 'Wat gebeurt er als ik stop met betalen?',
        answer:
          'Je cv’s blijven bereikbaar en te downloaden met de gratis sjablonen. Er wordt niets verwijderd en niets met terugwerkende kracht op slot gezet: een document dat met een Pro-sjabloon is opgemaakt blijft zichtbaar, maar de export schakelt over op een gratis sjabloon.',
      },
      {
        question: 'Hoeveel cv’s kan ik gratis bewaren?',
        answer:
          'Eén. Je mag het zo vaak aanpassen als je wilt en het meerdere keren per maand downloaden. Voor meerdere versies naast elkaar — één per type functie — heb je Pro nodig.',
      },
    ],
    related: [
      {
        label: 'Prijzen',
        href: '/nl/prijzen',
        description: 'De volledige vergelijking van de drie abonnementen.',
      },
      {
        label: 'Gratis cv-sjablonen',
        href: '/nl/cv-sjablonen',
        description: 'De galerij, met de status van elk sjabloon.',
      },
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor, het live voorbeeld en de pdf-export.',
      },
    ],
  },

  functies: {
    path: '/nl/functies',
    breadcrumb: 'Functies',
    metaTitle: 'Functies',
    metaDescription:
      'Alles wat de editor doet: voorbeeld op ware paginagrootte, pdf-export die exact klopt, typografie-instellingen, eigen secties en een bijpassende motivatiebrief.',
    keywords: ['cv editor functies', 'cv tool', 'cv software'],
    heading: 'Wat het gereedschap doet',
    lede: 'Een eerlijke lijst, inclusief wat er níét in zit. Een cv-editor beoordeel je op twee dingen: of het scherm en de pdf overeenkomen, en hoe vaak hij je in de weg zit.',
    badges: ['Kloppend voorbeeld', 'Pdf-export', 'Automatisch opslaan'],
    features: {
      title: 'Het belangrijkste',
      items: [
        {
          title: 'Voorbeeld op ware grootte',
          body: 'De pagina wordt in millimeters gezet, niet in geschatte pixels. Je ziet de pagina-afbreking precies waar die gaat vallen.',
        },
        {
          title: 'Eén render-engine',
          body: 'Het voorbeeld, de afdrukpagina en de pdf komen uit dezelfde code. Ze kunnen niet uit elkaar lopen, want er is niets te synchroniseren.',
        },
        {
          title: 'Automatisch opslaan',
          body: 'Terwijl je typt, met een lokale reservekopie als het opslaan mislukt — en een aanbod om te herstellen bij het opnieuw openen.',
        },
        {
          title: 'Ongedaan maken en opnieuw',
          body: 'Ctrl+Z op alles wat je typt, ook op het verwijderen van een hele sectie. Niets wat je weghaalt is zomaar weg.',
        },
        {
          title: 'Verplaatsbare secties',
          body: 'Slepen met de muis, pijltjestoetsen op het toetsenbord. Een sectie verbergen kan zonder hem te verwijderen, zodat twee varianten in één document passen.',
        },
        {
          title: 'Twaalf standaardsecties',
          body: 'Profiel, kerncompetenties, werkervaring, opleiding, vaardigheden, talen, projecten, certificaten, onderscheidingen, vrijwilligerswerk, publicaties, interesses.',
        },
        {
          title: 'Eigen secties',
          body: 'Voor al het overige. Kop, subkop, datum en omschrijving: genoeg voor een octrooi, een bestuursfunctie of een lezing.',
        },
        {
          title: 'Bijpassende motivatiebrief',
          body: 'Neemt de lettertypen, de kleur, de marges en de taal van je cv over, en komt als eerste pagina uit dezelfde pdf.',
        },
        {
          title: 'Gegevensexport',
          body: 'Al je cv’s als JSON, opgebouwd in je browser. Je vertrekt met je inhoud wanneer je wilt.',
        },
      ],
    },
    prose: [
      {
        heading: 'Wat er niet in zit',
        paragraphs: [
          'Geen automatisch schrijven door kunstmatige intelligentie. Een gegenereerde tekst is herkenbaar, zegt hetzelfde als die van de vorige kandidaat, en ontneemt het cv het enige wat het bijdraagt — wat jij hebt gedaan, in jouw woorden.',
          'Geen cv-“score” op honderd. Zoiets wekt de indruk van precisie zonder te meten waar een recruiter naar kijkt. Er is wel een volledigheidsmeter, die concrete dingen controleert: je naam, je contactgegevens, je profieltekst, minstens één functie met resultaten, vijf vaardigheden.',
          'Geen automatische verspreiding van je cv onder recruiters, en geen kandidatendatabank. Deze site maakt een document; ze bemiddelt niet.',
        ],
      },
      {
        heading: 'Toegankelijkheid en compatibiliteit',
        paragraphs: [
          'De interface is volledig met het toetsenbord te bedienen, ook het herschikken van secties, en de bedieningselementen hebben namen die een schermlezer voorleest. Statuskleuren zijn nooit de enige drager van informatie.',
          'De editor werkt in recente versies van Chrome, Firefox, Safari en Edge, op computer en telefoon. Op een telefoon schuift het voorbeeld onder het formulier in plaats van ernaast.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Kan ik van sjabloon wisselen zonder inhoud te verliezen?',
        answer:
          'Ja. Je inhoud en je instellingen blijven staan; alleen de typografie van het nieuwe sjabloon wordt toegepast, en alleen als je die niet zelf had gekozen.',
      },
      {
        question: 'Is de pdf identiek aan het voorbeeld?',
        answer:
          'Ja, omdat beide uit dezelfde rendercode komen. Dat is de eigenschap die de architectuur van het product met voorrang beschermt.',
      },
      {
        question: 'Zit er een limiet op het aantal secties?',
        answer:
          'Elke sectie heeft een maximum aantal items, ruim genoeg voor elk realistisch gebruik en bedoeld om documenten te voorkomen die niet meer opengaan. Eigen secties zijn voorbehouden aan Pro.',
      },
    ],
    related: [
      {
        label: 'Cv maken',
        href: '/nl/cv-maken',
        description: 'De editor in detail.',
      },
      {
        label: 'Veelgestelde vragen',
        href: '/nl/veelgestelde-vragen',
        description: 'Antwoorden op de meestgestelde vragen.',
      },
      ...CORE_LINKS,
    ],
  },

  'veelgestelde-vragen': {
    path: '/nl/veelgestelde-vragen',
    breadcrumb: 'Veelgestelde vragen',
    metaTitle: 'Veelgestelde vragen',
    metaDescription:
      'Antwoorden op de meestgestelde vragen: wat gratis is, ATS-vriendelijkheid, de foto op een Nederlands cv, privacy, betaling en terugbetaling.',
    keywords: ['cv veelgestelde vragen', 'hulp cv maken', 'vragen cv'],
    heading: 'Veelgestelde vragen',
    lede: 'De vragen die steeds terugkomen, met volledige in plaats van geruststellende antwoorden. Staat die van jou er niet bij, mail ons: we antwoorden binnen twee werkdagen.',
    faqTitle: 'Het product',
    faq: [
      {
        question: 'Is het echt gratis?',
        answer:
          'Ja, om een cv te maken, op te maken en als pdf te downloaden met de gratis sjablonen, zonder creditcard en zonder proefperiode. Het betaalde abonnement ontgrendelt de Pro-sjablonen, onbeperkt cv’s, de uitgebreide opmaak en de pdf zonder vermelding in de voettekst.',
      },
      {
        question: 'Moet ik een account aanmaken?',
        answer:
          'Om een cv te bewaren wel: zonder account is er geen plek om het te laten staan. Een e-mailadres en een wachtwoord volstaan, of een Google-account. Voor het gratis abonnement wordt nooit om een creditcard gevraagd.',
      },
      {
        question: 'Zijn mijn cv’s privé?',
        answer:
          'Ja. Niets is voor anderen zichtbaar zolang je niet zelf een deellink aanzet, en die link wijst naar een willekeurig adres dat zoekmachines niet indexeren. We verkopen geen gegevens en bieden geen cv’s aan recruiters aan.',
      },
      {
        question: 'Komt mijn cv door de recruitmentsoftware?',
        answer:
          'De sjablonen met een 5 op 5 zijn daarvoor gemaakt: één kolom, geen graphics in de tekstkolom, geen pictogram in plaats van een kopje, tekst die echt uit te lezen is. Geen enkele aanbieder kan het gedrag van alle software garanderen, maar dit zijn precies de eigenschappen die problemen geven wanneer ze problemen geven.',
      },
      {
        question: 'Hoort er een foto op mijn cv?',
        answer:
          'In Nederland: liever niet. Het mag en niemand wijst je erom af, maar het advies is de laatste jaren duidelijk verschoven, en steeds meer werkgevers screenen juist anoniem om vooroordelen in de eerste ronde te beperken. Solliciteer je in Duitsland of Frankrijk, dan ligt dat anders — daar is een foto nog gebruikelijk. Elk sjabloon werkt met en zonder.',
      },
      {
        question: 'Kan ik van sjabloon wisselen als ik alles al heb ingevuld?',
        answer:
          'Ja, zonder verlies. Je inhoud en instellingen blijven staan; alleen de typografie van het nieuwe sjabloon wordt toegepast, en alleen als je die niet zelf had gekozen.',
      },
      {
        question: 'Kan ik mijn gegevens meenemen?',
        answer:
          'Op elk moment, vanuit de instellingen: een JSON-bestand met al je cv’s in hun geheel, in je browser opgebouwd uit je eigen account. Daar wordt niets elders voor opgeslagen.',
      },
      {
        question: 'Hoe verloopt de betaling?',
        answer:
          'Via Paddle, dat in een venster op de pagina opent. Creditcard, PayPal, Apple Pay of Google Pay. Paddle is de verkoper in juridische zin en berekent de btw die in jouw land geldt. De bedragen luiden in Amerikaanse dollars; je bank rekent zijn eigen wisselkoers.',
      },
      {
        question: 'Krijg ik mijn geld terug?',
        answer:
          'Ja, binnen veertien dagen na de aankoop, volgens ons terugbetalingsbeleid. Mail ons met het bestelnummer van de bon die Paddle heeft gestuurd.',
      },
      {
        question: 'Hoe verwijder ik mijn account?',
        answer:
          'Vanuit de instellingen. Verwijderen haalt je profiel, al je cv’s en je betaalgeschiedenis weg en is onomkeerbaar — exporteer eerst. Het verzoek wordt met de hand afgehandeld door ons team, dat de verwijdering per e-mail bevestigt.',
      },
    ],
    related: [
      {
        label: 'Prijzen',
        href: '/nl/prijzen',
        description: 'De drie abonnementen in detail.',
      },
      {
        label: 'Contact',
        href: '/nl/contact',
        description: 'Voor alles wat hierboven niet staat.',
      },
      {
        label: 'Terugbetalingsbeleid',
        href: '/nl/terugbetaling',
        description: 'De volledige tekst, veertien dagen.',
      },
      {
        label: 'Privacy',
        href: '/nl/privacy',
        description: 'Wat we verzamelen, en wat we ermee niet doen.',
      },
    ],
  },
};
