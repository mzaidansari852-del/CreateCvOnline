import type { TemplateCategory } from '@/types/cv';

/**
 * The German site's copy.
 *
 * A Lebenslauf is not a CV with German words in it. It is *tabellarisch* — a table of dates
 * against facts, not prose — the photo is still normal in most of the market, and a
 * complete Bewerbung is expected to arrive as Anschreiben plus Lebenslauf plus Zeugnisse
 * rather than a single document. Translating the English page would produce something
 * grammatically German that no German applicant would recognise as advice.
 *
 * One thing deliberately hedged rather than asserted: the photo. It is still normal, and
 * the AGG has made a growing number of employers ask for applications without one. Saying
 * "always include a photo" would be out of date and saying "never" would be wrong; the copy
 * says what is actually true, which is that it depends on the employer.
 *
 * The market case, from the audit: `lebenslauf template` returns simplegermany.com,
 * liveingermany.de, coolfreecv.com and expatrio.com. No major player — the same picture as
 * French, which is why this is the second language rather than the fifth.
 */

export const DE = {
  home: {
    metaTitle: 'Lebenslauf online erstellen',
    metaDescription:
      'Lebenslauf online erstellen und als PDF herunterladen. Kostenlose Vorlagen, die von Bewerbermanagement-Systemen gelesen werden, mit Live-Editor.',
    eyebrow: 'Ohne Kreditkarte',
    hero: {
      headingBefore: 'Erstellen Sie Ihren ',
      headingHighlight: 'Lebenslauf',
      headingAfter: ' online',
      badge: 'Vorlagen mit 5/5 für die maschinelle Lesbarkeit',
      primaryCta: 'Lebenslauf erstellen — kostenlos',
      secondaryCta: 'Vorlagen ansehen',
    },
    lede: 'Wählen Sie eine Vorlage, füllen Sie strukturierte Felder aus und sehen Sie zu, wie sich daneben eine echte DIN-A4-Seite aufbaut. Wenn es passt, exportieren Sie ein PDF, dessen Text sich markieren lässt — von einem Personaler wie von einer Software.',
    trust: ['Kostenlose Vorlagen', 'ATS-tauglich', 'Sofort als PDF', 'Ohne Kreditkarte'],

    stepsTitle: 'Drei Schritte, mehr nicht',
    steps: [
      {
        title: 'Vorlage wählen',
        body: 'Jede Vorlage zeigt, wie gut eine Bewerbersoftware sie lesen kann. Sie können jederzeit wechseln — Ihre Inhalte bleiben.',
      },
      {
        title: 'Abschnitte ausfüllen',
        body: 'Berufserfahrung, Ausbildung, Kenntnisse, Sprachen. Abschnitte lassen sich umsortieren, umbenennen und ausblenden.',
      },
      {
        title: 'PDF herunterladen',
        body: 'DIN A4 oder US Letter, mit echtem Text statt eines Bildes vom Lebenslauf.',
      },
    ],

    atsTitle: 'Warum maschinelle Lesbarkeit zählt',
    atsBody:
      'Größere Unternehmen lassen Bewerbungen durch ein Bewerbermanagement-System laufen, bevor ein Mensch sie liest. Diese Systeme ziehen den Text aus Ihrem PDF: ein zweispaltiger Lebenslauf, Symbole statt Überschriften oder Text in einer Grafik kommen dort verstümmelt an. Jede Vorlage hier trägt eine Bewertung von eins bis fünf, die sich auf genau die Layout-Eigenschaften stützt, die diese Extraktion beeinflussen.',
    atsCaveat:
      'Die Bewertung ist unsere eigene Einschätzung, keine Zertifizierung: kein Anbieter kann gegen jedes System am Markt testen.',

    differencesTitle: 'Was ein deutscher Lebenslauf erwartet',
    differences: [
      {
        title: 'Tabellarisch, nicht als Fließtext',
        body: 'Der Standard ist der tabellarische Lebenslauf: Zeitraum links, Station rechts, rückwärts chronologisch. Ausformulierte Absätze gehören ins Anschreiben, nicht hierhin.',
      },
      {
        title: 'Das Foto: kommt auf den Arbeitgeber an',
        body: 'Ein Bewerbungsfoto ist weiterhin verbreitet, aber seit dem AGG bitten immer mehr Unternehmen ausdrücklich um eine Bewerbung ohne Foto. Prüfen Sie die Ausschreibung. Jede Vorlage mit Foto lässt sich mit einem Klick ohne verwenden.',
      },
      {
        title: 'Ort, Datum und Unterschrift',
        body: 'Am Ende stehen traditionell Ort, Datum und Unterschrift. Bei einer Online-Bewerbung wird das zunehmend weggelassen, erwartet wird es aber immer noch oft.',
      },
      {
        title: 'Kenntnisse mit Niveau, nicht mit Balken',
        body: 'Sprachen nach GER von A1 bis C2, EDV-Kenntnisse mit einer nachvollziehbaren Einstufung. Ein Balkendiagramm sagt einem Personaler nichts und einer Software gar nichts.',
      },
    ],

    faqTitle: 'Häufige Fragen',
    faq: [
      {
        question: 'Ist das wirklich kostenlos?',
        answer:
          'Ja — Lebenslauf anlegen, bearbeiten und als PDF herunterladen ist mit den kostenlosen Vorlagen kostenfrei. Ein Konto brauchen Sie nur, um Ihr Dokument zu speichern und später wiederzufinden. Der Pro-Zugang schaltet die übrigen Vorlagen und die vollständige Gestaltung frei.',
      },
      {
        question: 'Gehört ein Foto in den Lebenslauf?',
        answer:
          'Das hängt vom Arbeitgeber ab. Ein Bewerbungsfoto ist in Deutschland weiterhin üblich, aber viele Unternehmen bitten inzwischen ausdrücklich um eine Bewerbung ohne Foto, um Vorurteile bei der Vorauswahl zu vermeiden. Steht nichts in der Ausschreibung, ist ein professionelles Foto die sichere Variante. Alle Vorlagen funktionieren mit und ohne.',
      },
      {
        question: 'Wie lang darf ein Lebenslauf sein?',
        answer:
          'Eine Seite bei weniger als zehn Jahren Berufserfahrung, zwei darüber. Mehr als zwei Seiten sind in Forschung und Medizin normal, in einer gewöhnlichen Bewerbung aber selten sinnvoll — die dritte Seite wird meist nicht gelesen.',
      },
      {
        question: 'Wird mein Lebenslauf von Bewerbersoftware gelesen?',
        answer:
          'Die mit 5/5 bewerteten Vorlagen sind genau dafür gebaut: eine Spalte, keine Grafiken, keine Symbole anstelle von Überschriften, extrahierbarer Text. Garantieren kann das kein Anbieter, aber es sind genau diese Layout-Eigenschaften, an denen es sonst scheitert.',
      },
      {
        question: 'Kann ich die Vorlage später noch wechseln?',
        answer:
          'Ja, ohne Verlust: Inhalte und Einstellungen bleiben erhalten. Übernommen wird nur die Schrift der neuen Vorlage, und auch das nur, solange Sie keine eigene gewählt haben.',
      },
    ],
  },

  gallery: {
    metaTitle: 'Lebenslauf-Vorlagen kostenlos',
    metaDescription:
      'Professionelle Lebenslauf-Vorlagen zum Ausfüllen im Browser und als PDF herunterladen. Modern, klassisch, kreativ und ATS-tauglich. Kostenlos, ohne Kreditkarte.',
    heading: 'Lebenslauf-Vorlagen',
    lede: 'Vorlagen zum Ausfüllen im Browser, keine Word-Dateien, die man erst reparieren muss. Jede zeigt, ob sie kostenlos ist und wie sie sich gegenüber einer Bewerbersoftware verhält. Wechseln Sie, so oft Sie wollen — Ihre Inhalte bleiben.',
    ctaPrimary: 'Lebenslauf erstellen',
    freeBadge: 'kostenlos',
    designsLabel: 'Vorlagen',
    atsLabel: 'mit 5/5 für ATS',
    singleColumnLabel: 'einspaltig',
    browseByCategory: 'Nach Stil durchsuchen',
    whatMakesGood: 'Was eine gute Lebenslauf-Vorlage ausmacht',
    whatMakesGoodBody:
      'Eine brauchbare Vorlage ist zuerst eine lesbare: eine klare Gliederung, Ränder, die dem Text Luft lassen, und ein Aufbau, den eine Bewerbersoftware korrekt zerlegt. Alles Weitere — die Akzentfarbe, die Schrift, ob ein Foto vorgesehen ist — hängt von Ihrer Branche ab und ist im Editor in Sekunden geändert.',
  },

  categories: {
    modern: {
      slug: 'modern',
      label: 'Modern',
      metaTitle: 'Moderne Lebenslauf-Vorlagen',
      metaDescription:
        'Moderne Lebenslauf-Vorlagen: klare Gliederung, viel Weißraum, eine Akzentfarbe. Online ausfüllen und als PDF herunterladen.',
      heading: 'Moderne Lebenslauf-Vorlagen',
      lede: 'Zeitgemäße Layouts mit viel Weißraum und einer einzigen Akzentfarbe. Der sicherste Ausgangspunkt, wenn Sie nicht genau wissen, was Ihre Branche erwartet.',
    },
    corporate: {
      slug: 'business',
      label: 'Business',
      metaTitle: 'Lebenslauf-Vorlagen für Wirtschaft und Verwaltung',
      metaDescription:
        'Sachliche, strukturierte Lebenslauf-Vorlagen für Finanzwesen, Beratung und Management. Online ausfüllen, sofort als PDF.',
      heading: 'Business-Lebenslauf-Vorlagen',
      lede: 'Strukturiert und zurückhaltend, für Finanzwesen, Beratung und Management — überall dort, wo ein Lebenslauf zuerst an seiner Sorgfalt gemessen wird.',
    },
    creative: {
      slug: 'kreativ',
      label: 'Kreativ',
      metaTitle: 'Kreative Lebenslauf-Vorlagen',
      metaDescription:
        'Kreative Lebenslauf-Vorlagen für Design-, Medien- und Kommunikationsberufe. Das Dokument selbst wird zur Arbeitsprobe.',
      heading: 'Kreative Lebenslauf-Vorlagen',
      lede: 'Für Design, Art Direction, Fotografie und Content — dort, wo das Dokument selbst eine Arbeitsprobe ist. Eine Vorlage dieser Familie erreicht 5/5 für ATS, falls Sie über ein Portal bewerben.',
    },
    technology: {
      slug: 'it',
      label: 'IT',
      metaTitle: 'Lebenslauf-Vorlagen für IT-Berufe',
      metaDescription:
        'Lebenslauf-Vorlagen für Entwicklung, Data und IT-Sicherheit: Platz für Stack, Projekte und Open Source, ohne Stichwortliste zu werden.',
      heading: 'IT-Lebenslauf-Vorlagen',
      lede: 'Für technische Berufe gebaut: Platz für Ihren Stack, Ihre Projekte und Open-Source-Beiträge, ohne dass der Lebenslauf zur Stichwortliste wird.',
    },
    classic: {
      slug: 'klassisch',
      label: 'Klassisch',
      metaTitle: 'Klassische Lebenslauf-Vorlagen',
      metaDescription:
        'Traditionelle Lebenslauf-Vorlagen für Wissenschaft, Recht und öffentlichen Dienst. Europass-Format mit GER-Tabelle enthalten.',
      heading: 'Klassische Lebenslauf-Vorlagen',
      lede: 'Traditionelle Formate, meist mit Serifenschrift, für Wissenschaft, Recht, den öffentlichen Dienst und jeden Arbeitgeber, der ein konventionelles Dokument erwartet. Hier liegt auch die Europass-Vorlage.',
    },
    ats: {
      slug: 'ats',
      label: 'ATS-tauglich',
      metaTitle: 'ATS-taugliche Lebenslauf-Vorlagen',
      metaDescription:
        'Einspaltige Lebenslauf-Vorlagen ohne Grafiken, gebaut dafür, von Bewerbermanagement-Systemen korrekt gelesen zu werden.',
      heading: 'ATS-taugliche Lebenslauf-Vorlagen',
      lede: 'Eine Spalte, keine Grafiken, keine Überraschungen: diese Vorlagen sind darauf ausgelegt, von einer Bewerbersoftware korrekt gelesen zu werden. Die Standardwahl für eine Bewerbung über ein Portal.',
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

  pricing: {
    metaTitle: 'Preise',
    metaDescription:
      'Kostenlos einen Lebenslauf erstellen und als PDF herunterladen. Pro für 9 $ im Monat oder einmalig 69 $ für alle Vorlagen und die volle Gestaltung.',
    heading: 'Einfache Preise',
    lede: 'Lebenslauf, Editor und PDF-Download sind mit den kostenlosen Vorlagen kostenfrei. Der Pro-Zugang ist für alle, die sich häufig bewerben und den ganzen Katalog wollen.',
    perMonth: 'pro Monat',
    oneTime: 'einmalig',
    forever: 'dauerhaft',
    mostChosen: 'Am häufigsten gewählt',
    currencyNote:
      'Die Beträge werden in US-Dollar abgerechnet; Ihre Bank rechnet zum jeweiligen Kurs um.',
    plans: {
      free: {
        name: 'Kostenlos',
        tagline: 'Für eine Bewerbung.',
        description:
          'Lebenslauf anlegen, ausfüllen, PDF exportieren. Ohne Kreditkarte und ohne ablaufende Testphase.',
        highlights: [
          'Die kostenlosen Vorlagen des Katalogs',
          'Vollständiger Editor mit Live-Vorschau',
          'PDF-Export mit einem dezenten Hinweis in der Fußzeile',
          'Ein gespeicherter Lebenslauf',
        ],
        cta: 'Kostenlos starten',
      },
      pro: {
        name: 'Pro',
        tagline: 'Für eine laufende Bewerbungsphase.',
        description:
          'Alle Vorlagen, beliebig viele Lebensläufe und Downloads — damit Sie Ihren Lebenslauf auf jede Stelle zuschneiden können, statt überall dasselbe Dokument zu schicken.',
        highlights: [
          'Alle Vorlagen, auch die Pro-Vorlagen',
          'Unbegrenzt Lebensläufe und Downloads',
          'Volle Gestaltung: Schriften, Farben, Abstände, Abschnitte',
          'Eigene Abschnitte und freie Reihenfolge',
          'Teilbarer öffentlicher Link',
          'PDF ohne Hinweis',
        ],
        cta: 'Zu Pro wechseln',
      },
      lifetime: {
        name: 'Einmalzahlung',
        tagline: 'Einmal zahlen, kein Abo.',
        description:
          'Alles aus Pro, einmal bezahlt. Ein Lebenslauf wird alle zwei bis drei Jahre überarbeitet — ein Monatsabo ist dafür die falsche Form.',
        highlights: [
          'Alles aus Pro',
          'Einmalzahlung, keine Verlängerung',
          'Später hinzugefügte Vorlagen sind enthalten',
        ],
        cta: 'Einmalzugang kaufen',
      },
    },
    faqTitle: 'Fragen zu den Preisen',
    faq: [
      {
        question: 'Läuft die kostenlose Nutzung irgendwann ab?',
        answer:
          'Nein. Es gibt keine Testphase, die endet: die kostenlosen Vorlagen bleiben kostenlos, und Sie können das PDF herunterladen, ohne zu zahlen. Ein Konto brauchen Sie nur zum Speichern.',
      },
      {
        question: 'Was ist in Pro enthalten?',
        answer:
          'Alle Vorlagen des Katalogs, unbegrenzt viele Lebensläufe und Downloads, die vollständige Gestaltung, eigene Abschnitte, der teilbare öffentliche Link und ein PDF ohne Hinweis in der Fußzeile.',
      },
      {
        question: 'Kann ich kündigen?',
        answer:
          'Jederzeit in Ihrem Bereich. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums bestehen, und Ihre Lebensläufe bleiben danach mit den kostenlosen Vorlagen erreichbar.',
      },
      {
        question: 'Warum eine Einmalzahlung?',
        answer:
          'Weil ein Lebenslauf nicht monatlich neu geschrieben wird. Viele brauchen ihn ein paar Wochen alle zwei bis drei Jahre, und dafür ist ein Monatsabo die falsche Form.',
      },
      {
        question: 'Wie wird bezahlt?',
        answer:
          'Über PayPal, Kreditkarte eingeschlossen. Die Beträge werden in US-Dollar abgerechnet; Ihre Bank rechnet zum jeweiligen Kurs um.',
      },
    ],
  },

  related: {
    title: 'Passend dazu',
    allTemplates: 'Alle Vorlagen',
    allTemplatesDescription: 'Die vollständige Galerie, alle Stile.',
    englishSite: 'CV templates in English',
    englishSiteDescription: 'The same builder, with UK and US CV conventions.',
    home: 'Zur Startseite',
    nearby: 'Ähnliche Vorlagen',
  },

  cta: {
    title: 'Bereit für Ihren Lebenslauf?',
    description:
      'Vorlage wählen, Werdegang eintragen, so oft umentscheiden, wie Sie möchten. Ein Vorlagenwechsel fasst Ihre Inhalte nie an.',
    secondary: 'Preise ansehen',
  },
} as const;

export const DE_CATEGORY_SLUG: Record<TemplateCategory, string> = {
  modern: DE.categories.modern.slug,
  corporate: DE.categories.corporate.slug,
  creative: DE.categories.creative.slug,
  technology: DE.categories.technology.slug,
  classic: DE.categories.classic.slug,
  ats: DE.categories.ats.slug,
};

export function categoryFromGermanSlug(slug: string): TemplateCategory | undefined {
  return (Object.keys(DE_CATEGORY_SLUG) as TemplateCategory[]).find(
    (category) => DE_CATEGORY_SLUG[category] === slug,
  );
}
