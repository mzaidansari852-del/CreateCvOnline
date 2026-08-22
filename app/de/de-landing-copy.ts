import type { Landing } from '@/lib/i18n/landing';

/**
 * The German commercial landing pages, as data.
 *
 * ## Why these eight
 *
 * They carry buying intent. `Lebenslauf erstellen`, `Lebenslauf schreiben`,
 * `Lebenslauf Muster` and `Lebenslauf kostenlos` are typed by someone who intends to produce
 * a document today. The blog, the role examples and the profession guides are deliberately
 * absent: they are read-and-leave traffic, they are the largest body of prose on the site,
 * and translating them buys the least.
 *
 * ## Why `Muster` and `Vorlage` are different pages
 *
 * `/de/lebenslauf-vorlagen` is the gallery and has been since the German site launched. This
 * file adds `/de/lebenslauf-muster`, and they are not synonyms doing duplicate work: a
 * *Vorlage* is the empty design you fill in, a *Muster* is a filled-in example you read to
 * see what belongs where. German searchers use both, they want different things, and the two
 * pages answer accordingly — one shows the designs, the other shows completed documents.
 *
 * ## What makes these German rather than translated
 *
 * The conventions genuinely differ and each page says so where it matters: a German
 * Lebenslauf is tabellarisch and antichronologisch, it is signed with Ort und Datum, it
 * travels inside a Bewerbungsmappe alongside the Anschreiben and the Arbeitszeugnisse, and
 * the photo question has a specific German answer — the AGG means no employer may require
 * one, while a photo remains far more common than in the Netherlands or the UK. None of that
 * appears on the English pages because none of it is true there.
 */

/** The links every one of these pages offers back into the German subtree. */
const CORE_LINKS = [
  {
    label: 'Lebenslauf-Vorlagen',
    href: '/de/lebenslauf-vorlagen',
    description: 'Die vollständige Galerie, alle Stile.',
  },
  {
    label: 'Preise',
    href: '/de/preise',
    description: 'Kostenlos, Pro und einmalig.',
  },
];

export const DE_LANDING: Record<string, Landing> = {
  'lebenslauf-erstellen': {
    path: '/de/lebenslauf-erstellen',
    breadcrumb: 'Lebenslauf erstellen',
    metaTitle: 'Lebenslauf erstellen — online und kostenlos',
    metaDescription:
      'Erstellen Sie Ihren Lebenslauf in einem Editor, der die fertige Seite zeigt, während Sie schreiben. Kostenlose Vorlagen, sofortiger PDF-Export, ohne Installation.',
    keywords: [
      'lebenslauf erstellen',
      'lebenslauf online erstellen',
      'lebenslauf erstellen kostenlos',
      'lebenslauf generator',
      'lebenslauf programm',
    ],
    heading: 'Lebenslauf erstellen',
    lede: 'Ein Editor, der die Seite so zeigt, wie sie herauskommt. Links füllen Sie Felder aus, rechts setzt sich die A4-Seite, und das PDF, das Sie herunterladen, ist genau das, was Sie sehen — keine Näherung, die beim Drucken auf eine zweite Seite rutscht.',
    badges: ['Ohne Installation', 'Live-Vorschau', 'Auswählbarer PDF-Text'],
    steps: {
      title: 'Was der Editor macht',
      items: [
        {
          title: 'Felder statt leerer Seite',
          body: 'Jeder Abschnitt hat seine Felder: Position, Arbeitgeber, Zeitraum, Erfolge. Sie formatieren nicht, Sie tragen ein — das Layout ist Sache der Vorlage.',
        },
        {
          title: 'Die Vorschau ist das Dokument',
          body: 'Die rechte Seite wird von demselben Code gerendert wie Ihr PDF. Das ist keine ungefähre Voransicht, das ist das Dokument, nur verkleinert.',
        },
        {
          title: 'Umsortieren ohne Abtippen',
          body: 'Abschnitte lassen sich verschieben, umbenennen und ausblenden. Kenntnisse vor die Berufserfahrung zu ziehen dauert drei Sekunden und rührt keinen Text an.',
        },
        {
          title: 'Als PDF exportieren',
          body: 'A4 oder US Letter, mit Text, den man wirklich markieren kann. Die Datei entsteht serverseitig durch die Engine, die auch die Vorschau rendert — die beiden können also nicht auseinanderlaufen.',
        },
      ],
    },
    features: {
      title: 'Die Einstellungen, die zählen',
      description:
        'Genug Kontrolle, damit das Dokument nach Ihnen aussieht, nicht genug, um es zu zerlegen.',
      items: [
        {
          title: 'Typografie',
          body: 'Fünfzehn Schriftfamilien, ausgewählt danach, dass sie bei 10 Punkt auf Papier lesbar bleiben. Jede Vorlage bringt ein stimmiges Paar aus Überschrift und Fließtext mit.',
        },
        {
          title: 'Akzentfarbe',
          body: 'Eine einzige, angewendet auf Abschnittsüberschriften und Linien. Ein Lebenslauf in vier Farben ist nicht ausdrucksstärker, nur schwerer zu lesen.',
        },
        {
          title: 'Abstände und Ränder',
          body: 'Zeilenabstand, Abstand zwischen Abschnitten und Seitenrand sind getrennt einstellbar. Das ist der Hebel, wenn Ihnen drei Zeilen zur einen Seite fehlen.',
        },
        {
          title: 'Bewerbungsfoto',
          body: 'Im Browser quadratisch zugeschnitten und auf 600px verkleinert, bevor es hochgeladen wird — ein Handyfoto bläht Ihr PDF also nicht auf. Auf jeder Vorlage abschaltbar, die eines vorsieht.',
        },
        {
          title: 'Eigene Abschnitte',
          body: 'Für alles, was die zwölf Standardabschnitte nicht abdecken: Patente, Ehrenämter, Vorträge, Wehr- oder Zivildienst.',
        },
        {
          title: 'Anschreiben',
          body: 'Es übernimmt Schriften, Farbe und Ränder des Lebenslaufs und wird als erste Seite desselben PDFs exportiert — die Bewerbungsmappe kommt als ein Stück an.',
        },
      ],
    },
    prose: [
      {
        heading: 'Warum ein Editor statt einer Word-Datei',
        paragraphs: [
          'Eine Word-Vorlage ist ein Dokument, das Sie reparieren müssen. Die unsichtbaren Tabellen, die es zusammenhalten, verrutschen, sobald Sie eine Zeile ergänzen, die Schrift fehlt auf dem Rechner gegenüber, und das exportierte PDF sieht nicht mehr ganz so aus wie am Bildschirm. Die Zeit, die Sie mit einer fertigen Vorlage zu sparen glauben, verbringen Sie damit, ihr Layout einzufangen.',
          'Hier lässt sich das Layout nicht versehentlich verstellen, weil es gar nicht in Ihrem Dokument steckt: Es gehört zur Vorlage, und Ihr Inhalt ist davon getrennt. Genau das erlaubt es, die Vorlage nach dem Eintippen noch zu wechseln, ohne etwas neu zu machen — und es sorgt dafür, dass ein in zwei Minuten gefüllter Lebenslauf genauso sauber gesetzt ist wie einer, an dem Sie zwei Stunden saßen.',
        ],
      },
      {
        heading: 'Was Sie behalten',
        paragraphs: [
          'Ihr Lebenslauf gehört Ihnen und bleibt exportierbar. In den Einstellungen laden Sie sämtliche Dokumente als JSON herunter — Kontaktdaten, Abschnitte, Gestaltung — in einer Datei, die in Ihrem Browser aus Ihrem eigenen Konto entsteht. Dafür wird nichts an anderer Stelle abgelegt.',
          'PDFs laufen nicht ab und tragen kein Wasserzeichen. Der kostenlose Tarif setzt einen dezenten Hinweis in die Fußzeile, der bezahlte entfernt ihn. Es gibt keine Fassung des Dokuments, die Sie nicht mitnehmen können.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Muss ich etwas installieren?',
        answer:
          'Nein. Alles läuft im Browser, am Rechner wie am Telefon. Das PDF entsteht serverseitig und wird wie jede andere Datei heruntergeladen.',
      },
      {
        question: 'Wird meine Arbeit automatisch gespeichert?',
        answer:
          'Ja, während der Eingabe. Schlägt ein Speichern fehl — abgebrochene Verbindung, zu schnell geschlossener Tab —, bleibt eine Kopie im Browser und wird Ihnen beim nächsten Öffnen mit Datum angeboten, damit Sie wählen können.',
      },
      {
        question: 'Kann ich mehrere Fassungen anlegen?',
        answer:
          'Ja. Duplizieren Sie einen bestehenden Lebenslauf und passen Sie ihn an die Stelle an — das ist die wirksamste Nutzung des Werkzeugs und genau das, was der Pro-Tarif unbegrenzt macht. Der kostenlose Tarif behält einen.',
      },
      {
        question: 'Funktioniert der Editor am Telefon?',
        answer:
          'Ja. Die Vorschau rückt unter das Formular statt daneben, und die Abschnitte werden einzeln durchlaufen. Einen ganzen Lebenslauf mit dem Daumen zu schreiben bleibt unbequem — einen Tippfehler oder ein Datum vor dem Absenden zu korrigieren nicht.',
      },
    ],
    related: [
      {
        label: 'Lebenslauf schreiben, Schritt für Schritt',
        href: '/de/lebenslauf-schreiben',
        description: 'Was in jeden Abschnitt gehört und wie man es formuliert.',
      },
      {
        label: 'ATS-tauglicher Lebenslauf',
        href: '/de/ats-lebenslauf',
        description: 'Layouts, die Bewerbermanagementsysteme fehlerfrei auslesen.',
      },
      ...CORE_LINKS,
    ],
  },

  'lebenslauf-schreiben': {
    path: '/de/lebenslauf-schreiben',
    breadcrumb: 'Lebenslauf schreiben',
    metaTitle: 'Lebenslauf schreiben: die vollständige Anleitung',
    metaDescription:
      'Wie man einen Lebenslauf schreibt, Abschnitt für Abschnitt: was hineingehört, was nicht mehr, und wie man eine Station so formuliert, dass sie etwas aussagt.',
    keywords: [
      'lebenslauf schreiben',
      'lebenslauf aufbau',
      'wie schreibt man einen lebenslauf',
      'lebenslauf tipps',
      'tabellarischer lebenslauf',
    ],
    heading: 'Lebenslauf schreiben, von der leeren Seite zum PDF',
    lede: 'Das Schwierige ist fast nie das Layout — es ist die Frage, was unter „Berufserfahrung“ stehen soll, wenn man auf das leere Feld schaut. Diese Seite behandelt beides: was in jeden Abschnitt gehört, und das Werkzeug, um es zu schreiben.',
    badges: ['Abschnitt für Abschnitt', 'Konkrete Beispiele', 'Kostenlos'],
    howTo: true,
    steps: {
      title: 'Die Reihenfolge',
      items: [
        {
          title: 'Sammeln, bevor Sie formulieren',
          body: 'Anfangs- und Enddaten jeder Station, exakte Positionsbezeichnungen, Abschlüsse und Jahre. Mitten im Schreiben ein Datum zu suchen ist der Grund, aus dem Lebensläufe halbfertig liegen bleiben.',
        },
        {
          title: 'Zuerst die Berufserfahrung',
          body: 'Sie ist der längste und meistgelesene Abschnitt. Alles andere ordnet sich danach — auch das Profil, das sich leichter schreibt, wenn der Werdegang schon steht.',
        },
        {
          title: 'Auf eine Seite kürzen',
          body: 'Streichen Sie zuerst Stationen, die über zehn Jahre zurückliegen, dann Aufgaben, die in Ihrem Beruf selbstverständlich sind. Übrig bleiben soll, wonach Sie im Gespräch gefragt werden wollen.',
        },
        {
          title: 'Laut lesen, unterschreiben, exportieren',
          body: 'Fehler, die drei stille Korrekturgänge überleben, überleben kein lautes Lesen. Danach Ort und Datum ergänzen, unterschreiben und das PDF exportieren.',
        },
      ],
    },
    features: {
      title: 'Was in jeden Abschnitt gehört',
      columns: 2,
      items: [
        {
          title: 'Persönliche Daten',
          body: 'Name, Anschrift, Telefonnummer, E-Mail. Geburtsdatum und -ort sind üblich, aber seit dem AGG nicht verlangt — Familienstand, Konfession und Staatsangehörigkeit gehören nicht mehr hinein.',
        },
        {
          title: 'Das Profil',
          body: 'Drei bis vier Zeilen: Ihr Fachgebiet, Ihre Jahre Erfahrung und das Ergebnis, das zuerst gelesen werden soll. Nicht „teamfähig und motiviert“ — dafür wurde noch nie jemand eingeladen.',
        },
        {
          title: 'Berufserfahrung',
          body: 'Pro Station eine Zeile Kontext (Verantwortungsbereich, Teamgröße), dann Erfolge. „Zuständig für das Budget“ beschreibt eine Stellenausschreibung; „Budget von 400 T€ über zwei Geschäftsjahre auf 3 % genau gehalten“ beschreibt Ihre Arbeit.',
        },
        {
          title: 'Ausbildung',
          body: 'Abschluss, Hochschule, Jahr. Am Anfang der Laufbahn steht sie vor der Berufserfahrung und darf Thema der Abschlussarbeit oder relevante Schwerpunkte nennen. Zehn Jahre später genügen zwei Zeilen.',
        },
        {
          title: 'Kenntnisse und Sprachen',
          body: 'Fünf bis fünfzehn Kenntnisse, nach Gruppen sortiert. Sprachen mit GER-Niveau — A1 bis C2 — statt „gute Kenntnisse“, das nichts Überprüfbares aussagt.',
        },
        {
          title: 'Ort, Datum, Unterschrift',
          body: 'In Deutschland weiterhin üblich und einer der wenigen Punkte, an denen sich ein deutscher Lebenslauf von einem englischen unterscheidet. Eine eingescannte Unterschrift genügt.',
        },
      ],
    },
    prose: [
      {
        heading: 'Eine Station schreiben, die etwas aussagt',
        paragraphs: [
          'Der Reflex ist, zu beschreiben, wofür man zuständig war. Der Personalverantwortliche sucht dagegen, was Sie verändert haben. Der Unterschied liegt in einer einfachen Umstellung: Beginnen Sie mit einem Verb, enden Sie mit einer Zahl oder einem Zeitraum, und streichen Sie alles, was die Stelle beschreibt statt Ihrer Zeit darin.',
          '„Onboarding neu aufgebaut, Aktivierungsquote in zwei Quartalen von 34 % auf 58 % gehoben“ passt in eine Zeile und enthält Handlung, Messgröße und Zeitraum. Man kann Sie im Gespräch darauf ansprechen, was genau der Zweck einer Zeile im Lebenslauf ist. Drei oder vier solcher Zeilen wiegen mehr als acht Zeilen Zuständigkeiten.',
          'Fehlen Ihnen Zahlen — was häufig vorkommt und kein Ausschlusskriterium ist —, ersetzen Sie die Messgröße durch eine Größenordnung: die Zahl der betroffenen Personen, den Umfang des Bereichs, die Dauer des Projekts, was vorher nicht existierte und danach schon.',
        ],
      },
      {
        heading: 'Eine Seite oder zwei?',
        paragraphs: [
          'Eine Seite unter zehn Jahren Erfahrung, zwei darüber. Die Regel zählt weniger um ihrer selbst willen als wegen dessen, was sie erzwingt: Auf einer Seite müssen Sie auswählen, und diese Auswahl ist für die lesende Person bereits eine Information.',
          'Jenseits von zwei Seiten schreiben Sie keinen Lebenslauf mehr, sondern eine Akte. In der Wissenschaft ist das berechtigt, wo die Publikationsliste erwartet wird, und in Teilen des öffentlichen Dienstes. Sonst ist eine dritte Seite fast immer das Zeichen, dass nicht abgewogen wurde.',
          'Wenn Ihnen drei Zeilen fehlen, verkleinern Sie die Schrift nicht unter 10 Punkt: Das sieht man sofort, und es wirkt wie ein Dokument, das überläuft. Stellen Sie stattdessen Zeilenabstand und Seitenrand nach oder streichen Sie eine alte Station.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Gehört ein Anschreiben dazu?',
        answer:
          'In Deutschland ja, außer die Ausschreibung sagt ausdrücklich etwas anderes. Zur vollständigen Bewerbungsmappe gehören Anschreiben, Lebenslauf und die Zeugnisse. Der Editor hat ein Anschreiben eingebaut: Es übernimmt Schriften, Farbe und Ränder des Lebenslaufs und wird als erste Seite desselben PDFs exportiert.',
      },
      {
        question: 'In welcher Reihenfolge stehen die Stationen?',
        answer:
          'Antichronologisch: die aktuellste zuerst. Das ist, was gesucht wird, und niemand sollte es sich erschließen müssen. Die übliche Ausnahme ist der Lebenslauf nach Kompetenzen, bei dem Erfolge nach Themen gebündelt werden und die Stationen am Ende in wenigen Zeilen stehen.',
      },
      {
        question: 'Wie gehe ich mit einer Lücke um?',
        answer:
          'Indem Sie sie kurz benennen statt sie zu kaschieren: Elternzeit, Weiterbildung, Umorientierung, Pflege von Angehörigen. Eine erklärte Lücke von sechs Monaten stört niemanden; dieselbe Lücke unkommentiert ist genau das, was im Gespräch die Nachfrage auslöst.',
      },
      {
        question: 'Muss ich Arbeitszeugnisse mitschicken?',
        answer:
          'Bei einer vollständigen Bewerbung in Deutschland üblicherweise ja — meist das letzte Arbeitszeugnis und die relevanten Abschlusszeugnisse. Sie gehören als eigene Anlagen in die Mappe, nicht in den Lebenslauf; dieser Editor erzeugt den Lebenslauf und das Anschreiben, die Zeugnisse legen Sie beim Versand dazu.',
      },
    ],
    related: [
      {
        label: 'Lebenslauf erstellen',
        href: '/de/lebenslauf-erstellen',
        description: 'Der Editor, die Live-Vorschau und der PDF-Export.',
      },
      {
        label: 'Lebenslauf-Muster',
        href: '/de/lebenslauf-muster',
        description: 'Ausgefüllte Beispiele, Abschnitt für Abschnitt.',
      },
      ...CORE_LINKS,
    ],
  },

  'lebenslauf-online': {
    path: '/de/lebenslauf-online',
    breadcrumb: 'Lebenslauf online',
    metaTitle: 'Lebenslauf online schreiben und herunterladen',
    metaDescription:
      'Schreiben Sie Ihren Lebenslauf online und laden Sie ihn als PDF herunter. Nichts zu installieren, und das Dokument bleibt von jedem Gerät aus erreichbar und änderbar.',
    keywords: [
      'lebenslauf online',
      'lebenslauf online erstellen kostenlos',
      'lebenslauf im browser',
      'lebenslauf online schreiben',
      'lebenslauf pdf online',
    ],
    heading: 'Ihr Lebenslauf, online',
    lede: 'Ein Lebenslauf online ist kein im Netz veröffentlichter Lebenslauf — es ist einer, den Sie nicht wiederfinden müssen. Er liegt in Ihrem Konto, öffnet sich auf jedem Gerät und erzeugt ein PDF, wenn Sie eines brauchen.',
    badges: ['Überall erreichbar', 'Nichts zu installieren', 'Mit Pro unbegrenzte Exporte'],
    steps: {
      title: 'Was „online“ konkret ändert',
      items: [
        {
          title: 'Keine Datei mehr suchen',
          body: 'Schluss mit Lebenslauf_final_v3_wirklich_final.docx. Es gibt ein Dokument, an einer Adresse, und es ist immer die letzte Fassung.',
        },
        {
          title: 'Auf allen Geräten dasselbe',
          body: 'Am Arbeitsrechner begonnen, im Zug am Telefon korrigiert. Kein Übertragen, kein USB-Stick, keine Mail an sich selbst.',
        },
        {
          title: 'Eine Aktualisierung statt eines Neuanfangs',
          body: 'In zwei Jahren ergänzen Sie eine Station und exportieren. Sie öffnen keine Datei, deren Layout gealtert ist und deren Schrift fehlt.',
        },
        {
          title: 'Ein Link, wenn Sie möchten',
          body: 'Der Pro-Tarif veröffentlicht Ihren Lebenslauf unter einer nicht erratbaren Adresse, die Sie mit einem Klick wieder abschalten. In Suchmaschinen erscheint sie nicht.',
        },
      ],
    },
    prose: [
      {
        heading: 'Online, aber nicht öffentlich',
        paragraphs: [
          'Das ist die häufigste Verwechslung und verdient eine klare Antwort: Ihr Lebenslauf ist für niemanden außer Ihnen sichtbar, solange Sie nicht ausdrücklich einen Freigabelink erzeugen. Er wird nicht indexiert, nicht gelistet und keinem Personalverantwortlichen angeboten. Wir verkaufen keine Bewerberdatenbank, und diese Seite ist keine Vermittlungsplattform.',
          'Der öffentliche Link führt, wenn Sie ihn aktivieren, auf eine schreibgeschützte Seite unter einer zufälligen, für Suchmaschinen nicht indexierbaren Adresse. Sie schalten ihn ab, wann Sie wollen, und die alte Adresse funktioniert dann sofort nicht mehr.',
        ],
      },
      {
        heading: 'Das PDF bleibt das maßgebliche Dokument',
        paragraphs: [
          'Wie modern das Werkzeug auch ist: Was im Postfach eines Personalverantwortlichen oder in einem Bewerbungsportal ankommt, ist ein PDF. Deshalb wird die Vorschau in echter Seitengröße gesetzt und von derselben Engine gerendert wie der Export — die Übereinstimmung der beiden ist die wichtigste Eigenschaft des Produkts, keine Bequemlichkeit.',
          'Der Text im PDF ist immer echter Text. Man kann ihn markieren, kopieren und auslesen — genau das tut ein Bewerbermanagementsystem, bevor ein Mensch die Datei öffnet. Ein als Bild exportierter Lebenslauf gilt diesen Systemen als leer, und das ist eine lautlose Art zu verschwinden.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Sehen Personalverantwortliche meinen Lebenslauf?',
        answer:
          'Nein. Es wird nichts geteilt, solange Sie nicht selbst einen öffentlichen Link aktivieren, und diese Seite bietet Lebensläufe niemandem an — es gibt keine Bewerberdatenbank.',
      },
      {
        question: 'Was passiert, wenn ich mein Konto lösche?',
        answer:
          'Ihre Lebensläufe, Ihre Zahlungshistorie und Ihr Profil werden entfernt. Exportieren Sie vorher in den Einstellungen als JSON, wenn Sie eine Kopie behalten möchten: Die Löschung lässt sich nicht rückgängig machen.',
      },
      {
        question: 'Kann ich offline arbeiten?',
        answer:
          'Teilweise. Der Editor hält eine lokale Kopie Ihrer Arbeit im Browser, was eine von einer wackligen Verbindung unterbrochene Sitzung schützt. Das endgültige Speichern und der PDF-Export brauchen jedoch eine Verbindung.',
      },
      {
        question: 'Wie lange wird mein Lebenslauf aufbewahrt?',
        answer:
          'Unbegrenzt, solange das Konto besteht. Dokumente eines inaktiven Kontos löschen wir nicht ohne Ankündigung, und ein mit dem kostenlosen Tarif erstellter Lebenslauf bleibt auch dann erreichbar, wenn ein bezahltes Abonnement endet.',
      },
    ],
    related: [
      {
        label: 'Lebenslauf erstellen',
        href: '/de/lebenslauf-erstellen',
        description: 'Editor und Export im Detail.',
      },
      {
        label: 'Lebenslauf kostenlos',
        href: '/de/lebenslauf-kostenlos',
        description: 'Was der kostenlose Tarif genau enthält.',
      },
      ...CORE_LINKS,
    ],
  },

  'lebenslauf-muster': {
    path: '/de/lebenslauf-muster',
    breadcrumb: 'Lebenslauf-Muster',
    metaTitle: 'Lebenslauf-Muster zum Übernehmen',
    metaDescription:
      'Ausgefüllte Lebenslauf-Muster, um die Form zu sehen, bevor Sie schreiben: was in jeden Abschnitt gehört, in welcher Reihenfolge und in welcher Länge.',
    keywords: [
      'lebenslauf muster',
      'lebenslauf beispiel',
      'lebenslauf muster kostenlos',
      'ausgefüllter lebenslauf',
      'lebenslauf vorlage ausgefüllt',
    ],
    heading: 'Lebenslauf-Muster',
    lede: 'Eine leere Vorlage sagt nicht, wie lang eine Station sein soll oder wie viele Kenntnisse sich zu nennen lohnen. Ein ausgefülltes Muster schon. Jede Vorlage der Galerie zeigt sich mit einem vollständigen Beispiel, das Sie Zeile für Zeile ersetzen können.',
    badges: ['Vollständige Beispiele', 'Direkt übernehmbar', 'Alle Berufe'],
    features: {
      title: 'Was ein Muster zeigt und eine leere Vorlage nicht',
      items: [
        {
          title: 'Die richtige Länge',
          body: 'Drei Zeilen Erfolge pro Station, nicht acht. Auf einem Muster sieht man das auf einen Blick, auf einem leeren Raster gar nicht.',
        },
        {
          title: 'Die Flughöhe',
          body: 'Was in eine Zeile Berufserfahrung gehört und was man für das Gespräch aufhebt. Die Grenze lässt sich leichter zeigen als erklären.',
        },
        {
          title: 'Die Reihenfolge der Abschnitte',
          body: 'Ausbildung vor Erfahrung am Anfang der Laufbahn, danach umgekehrt. Das Muster zeigt die Abwägung, statt die Regel zu nennen.',
        },
        {
          title: 'Was auf eine Seite passt',
          body: 'Mit den echten Schriften und den echten Rändern. Nur so lässt sich ehrlich sagen, wie viele Stationen hineingehen, bevor es überläuft.',
        },
        {
          title: 'Die vertretbare Dichte',
          body: 'Ein zu luftiger Lebenslauf wirkt leer, ein zu dichter wird nicht gelesen. Das Muster ist dazwischen gesetzt, auf der Vorlage, die Sie gerade ansehen.',
        },
        {
          title: 'Wie die Vorlage wirklich aussieht',
          body: 'Ein Screenshot einer leeren Vorlage schmeichelt immer. Gefüllt zeigt sie, was das Layout tut, wenn eine Positionsbezeichnung lang ist.',
        },
      ],
    },
    prose: [
      {
        heading: 'Ein Muster übernehmen, ohne seinen Inhalt abzuschreiben',
        paragraphs: [
          'Ein Muster zeigt die Form, es liefert nicht die Sätze. Übernehmen Sie die Struktur — die Zeilenzahl, die Art, wie ein Erfolg formuliert ist, die Reihenfolge der Abschnitte — und ersetzen Sie den Text vollständig durch Ihren eigenen. Eine Formulierung von der Stange erkennt man sofort, und Formulierungen von der Stange stehen in hunderten Lebensläufen.',
          'Der sinnvolle Weg: Muster öffnen, eine Zeile Berufserfahrung lesen, sich fragen, was bei Ihnen die Entsprechung wäre, sie aufschreiben, zur nächsten. Das ist langsamer als Kopieren und das einzige Verfahren, das einen Lebenslauf ergibt, der nach Ihnen aussieht.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Kann ich die Muster unverändert verwenden?',
        answer:
          'Das Layout ja — dafür ist die Vorlage da. Den Text nein: Er steht dort, um die Form zu zeigen. Ein mit den Sätzen des Musters gefüllter Lebenslauf fällt auf und schadet der Bewerbung.',
      },
      {
        question: 'Gibt es Muster nach Berufsfeld?',
        answer:
          'Die Vorlagen decken die großen Felder ab — IT, Finanzen, Kreation, Gesundheit, Bildung, öffentlicher Dienst — und jede zeigt ein zu ihrem Feld passendes Beispiel. Ausführliche Leitfäden je Beruf gibt es vorerst nur auf Englisch.',
      },
      {
        question: 'Was ist der Unterschied zwischen Muster und Vorlage?',
        answer:
          'Eine Vorlage ist das leere Design, das Sie ausfüllen; ein Muster ist ein ausgefülltes Beispiel, an dem Sie ablesen, was wohin gehört. Die Galerie unter „Lebenslauf-Vorlagen“ zeigt die Designs, diese Seite die fertigen Dokumente.',
      },
    ],
    related: [
      {
        label: 'Lebenslauf schreiben',
        href: '/de/lebenslauf-schreiben',
        description: 'Was in jeden Abschnitt gehört und wie man es formuliert.',
      },
      {
        label: 'Moderne Lebenslauf-Vorlagen',
        href: '/de/lebenslauf-vorlagen/modern',
        description: 'Der sicherste Ausgangspunkt.',
      },
      ...CORE_LINKS,
    ],
  },

  'ats-lebenslauf': {
    path: '/de/ats-lebenslauf',
    breadcrumb: 'ATS-Lebenslauf',
    metaTitle: 'ATS-tauglicher Lebenslauf',
    metaDescription:
      'Ein Lebenslauf, den Bewerbermanagementsysteme fehlerfrei auslesen: eine Spalte, keine Grafiken, ausgeschriebene Überschriften. Vorlagen mit 5/5, kostenlos.',
    keywords: [
      'ats lebenslauf',
      'lebenslauf ats optimiert',
      'bewerbermanagementsystem lebenslauf',
      'lebenslauf maschinenlesbar',
      'ats vorlage',
    ],
    heading: 'ATS-tauglicher Lebenslauf',
    lede: 'Bevor ein Mensch Ihre Bewerbung öffnet, zieht eine Software den Text heraus. Macht sie dabei einen Fehler, werden Sie aussortiert, ohne dass jemand es entschieden hätte. Diese Vorlagen sind dafür gebaut, dass diese Extraktion gelingt.',
    badges: ['Einspaltig', 'Ohne Grafiken', 'Auslesbarer Text'],
    features: {
      title: 'Was eine Extraktion zerstört',
      description: 'Die sechs wiederkehrenden Ursachen und was die 5/5-Vorlagen stattdessen tun.',
      items: [
        {
          title: 'Zwei Spalten',
          body: 'Die Software liest über die volle Breite von links nach rechts. Eine Seitenleiste verschränkt sich mit dem Fließtext, und die Reihenfolge der Stationen wird unlesbar.',
        },
        {
          title: 'Symbole statt Bezeichnungen',
          body: 'Ein Briefumschlag für die E-Mail-Adresse, ein Hörer für die Nummer. Ein Bild trägt keinen Text: Die Information existiert fürs Auge und nicht für den Extraktor.',
        },
        {
          title: 'Text in einem Bild',
          body: 'Ein als Bild exportierter Lebenslauf kommt vollständig leer heraus. Das ist der einzige Fehler dieser Liste, der die Bewerbung zu 100 % scheitern lässt.',
        },
        {
          title: 'Kopf- und Fußzeilen',
          body: 'Viele Extraktoren ignorieren sie. Eine Telefonnummer in der Fußzeile kommt womöglich nie auf der anderen Seite an.',
        },
        {
          title: 'Niveaubalken',
          body: 'Ein zu drei Vierteln gefüllter Balken ergibt keinen Text. Er nimmt den Platz einer überprüfbaren Angabe ein und liefert keine.',
        },
        {
          title: 'Erfundene Überschriften',
          body: '„Mein Werdegang“ statt „Berufserfahrung“. Extraktoren suchen die Standardbezeichnungen; eine originelle Überschrift kostet Sie den ganzen Abschnitt.',
        },
      ],
    },
    prose: [
      {
        heading: 'Die Bewertung von fünf, und was sie wert ist',
        paragraphs: [
          'Jede Vorlage trägt eine Bewertung von 1 bis 5. Sie wird aus den oben genannten Layout-Eigenschaften berechnet — Spaltenzahl, Grafiken im Textfluss, informationstragende Symbole, Struktur der Überschriften — und nicht aus einem Test gegen ein tatsächliches System.',
          'Das ist eine Einschätzung, kein Gütesiegel, und das gehört klar gesagt: Es gibt dutzende Bewerbermanagementsysteme, sie verhalten sich unterschiedlich, und kein Anbieter eines Lebenslauf-Werkzeugs kann behaupten, sie alle geprüft zu haben. Was die Bewertung aussagt, ist belastbar und begrenzt: wie stark ein Layout jene Eigenschaften aufweist, die Probleme machen, wenn sie Probleme machen.',
          'Die praktische Folge ist einfach. Für eine Bewerbung über ein Portal — Konzern, Personalberatung, Jobbörse — nehmen Sie eine mit 5 bewertete Vorlage. Für eine Bewerbung direkt an eine Person oder in einem Beruf, in dem die Gestaltung Teil der Arbeitsprobe ist, gilt die Einschränkung nicht, und eine grafischere Vorlage lässt sich gut begründen.',
        ],
      },
      {
        heading: 'Schlüsselwörter, ohne Stopfen',
        paragraphs: [
          'Ein ATS sortiert Bewerbungen oft nach dem Vorkommen von Begriffen aus der Ausschreibung. Die vernünftige Antwort ist, die Wörter der Anzeige zu verwenden, wenn sie wirklich beschreiben, was Sie getan haben — steht dort „Projektsteuerung“ und Sie schreiben „Projektleitung“, spricht nichts dagegen, beide Formulierungen je einmal zu nutzen.',
          'Die unvernünftige Antwort ist die Schlüsselwortliste am Seitenende oder weißer Text auf weißem Grund. Das Erste ist sichtbar und macht einen schlechten Eindruck; das Zweite wird erkannt und führt zum Aussortieren. Keines von beiden ist das Risiko wert.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Ist ein zweispaltiger Lebenslauf ein Ausschlusskriterium?',
        answer:
          'Nein, aber es ist ein unnötiges Risiko, wenn die Bewerbung über ein Portal läuft. Viele moderne Extraktoren kommen damit zurecht; die, die scheitern, tun es lautlos, und Sie werden nie erfahren, dass es passiert ist.',
      },
      {
        question: 'Muss ich für ein ATS das Foto weglassen?',
        answer:
          'Die Software ignoriert das Bild schlicht, es zerstört also nichts. Es nimmt allerdings Platz ein. In Deutschland ist ein Bewerbungsfoto weiterhin verbreitet, und das AGG verbietet lediglich, es zu verlangen — bei einer Portalbewerbung kostet es nichts, darauf zu verzichten.',
      },
      {
        question: 'Welches Dateiformat soll ich senden?',
        answer:
          'PDF, außer die Ausschreibung verlangt ausdrücklich Word. Das hier exportierte PDF enthält echten Text, wird also genauso gut ausgelesen wie eine .docx und behält dabei sein Layout — was die .docx nicht garantiert.',
      },
      {
        question: 'Sind die ATS-Vorlagen kostenlos?',
        answer:
          'Alle mit 5 von 5 bewerteten Vorlagen gehören zum kostenlosen Tarif. Das ist Absicht: Von einer Software gelesen zu werden sollte keine Zahlfunktion sein.',
      },
    ],
    related: [
      {
        label: 'ATS-taugliche Vorlagen',
        href: '/de/lebenslauf-vorlagen/ats',
        description: 'Die mit 5/5 bewerteten Vorlagen in der Galerie.',
      },
      {
        label: 'Lebenslauf erstellen',
        href: '/de/lebenslauf-erstellen',
        description: 'Der Editor, die Live-Vorschau und der PDF-Export.',
      },
      ...CORE_LINKS,
    ],
  },

  'lebenslauf-kostenlos': {
    path: '/de/lebenslauf-kostenlos',
    breadcrumb: 'Lebenslauf kostenlos',
    metaTitle: 'Lebenslauf kostenlos erstellen',
    metaDescription:
      'Lebenslauf erstellen, gestalten und als PDF herunterladen, ohne zu zahlen und ohne Kreditkarte. Genau, was der kostenlose Tarif enthält — und was nicht.',
    keywords: [
      'lebenslauf kostenlos',
      'lebenslauf kostenlos erstellen',
      'lebenslauf vorlage kostenlos',
      'gratis lebenslauf',
      'lebenslauf kostenlos downloaden',
    ],
    heading: 'Kostenlos, ohne bösen Moment am Ende',
    lede: 'Viele Werkzeuge nennen es „kostenlos“, einen Lebenslauf zu setzen, und verlangen dann Geld beim Herunterladen. Hier ist das nicht so, und diese Seite sagt genau, wo die Grenze verläuft.',
    badges: ['Ohne Kreditkarte', 'PDF herunterladbar', 'Ohne Testphase'],
    features: {
      title: 'Was der kostenlose Tarif enthält',
      columns: 2,
      items: [
        {
          title: 'Die kostenlosen Vorlagen',
          body: 'Ein erheblicher Teil der Galerie, darunter alle mit 5/5 für Bewerbermanagementsysteme bewerteten. ATS-Tauglichkeit steht nicht hinter der Bezahlschranke.',
        },
        {
          title: 'Der vollständige Editor',
          body: 'Alle Abschnitte, die Live-Vorschau, das Umsortieren, das Foto, das Anschreiben. Keine Schreibfunktion ist beschnitten.',
        },
        {
          title: 'Der PDF-Download',
          body: 'Ein echtes PDF mit markierbarem Text, ohne Wasserzeichen quer über der Seite. In der Fußzeile steht ein dezenter Hinweis.',
        },
        {
          title: 'Ein gespeicherter Lebenslauf',
          body: 'In Ihrem Konto abgelegt, änderbar, exportierbar. Er verschwindet nicht nach dreißig Tagen.',
        },
      ],
    },
    prose: [
      {
        heading: 'Und was er nicht enthält',
        paragraphs: [
          'Die mit Pro gekennzeichneten Vorlagen, mehrere Lebensläufe, unbegrenzte Downloads, die erweiterte Gestaltung, eigene Abschnitte, den öffentlichen Freigabelink und das PDF ohne Fußzeilenhinweis. Das ist die vollständige Liste: Es gibt keine verborgene Grenze, die auftaucht, sobald Sie sie brauchen.',
          'Der Grund, warum ausgerechnet diese Punkte etwas kosten, passt in einen Satz: Sie nützen vor allem jemandem, der sich häufig bewirbt. Wer einen Lebenslauf für eine Bewerbung schreibt, hat keine Verwendung dafür, und ihm das Herunterladen eines selbst geschriebenen Dokuments in Rechnung zu stellen wäre für alle Beteiligten ein schlechtes Geschäft.',
        ],
      },
      {
        heading: 'Warum ein Konto nötig ist',
        paragraphs: [
          'Um Ihren Lebenslauf zu speichern und Ihnen später zurückzugeben. Ohne Konto gibt es keinen Ort dafür: Er lebte im Tab und verschwände mit ihm. Die Registrierung verlangt eine E-Mail-Adresse und ein Passwort oder ein Google-Konto — nie eine Kreditkarte.',
          'Die Adresse dient drei Dingen: der erneuten Anmeldung, dem Zurücksetzen eines vergessenen Passworts und dem Beleg, falls Sie eines Tages zahlen. Produkt-E-Mails sind freiwillig und in den Einstellungen abschaltbar.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Brauche ich zum Start eine Kreditkarte?',
        answer:
          'Nein, zu keinem Zeitpunkt. Es gibt keine Testphase, die man kündigen müsste, also auch nichts einzugeben, solange Sie sich nicht für einen bezahlten Tarif entscheiden.',
      },
      {
        question: 'Trägt das kostenlose PDF ein Wasserzeichen?',
        answer:
          'Kein Wasserzeichen quer über der Seite. In der Fußzeile steht ein dezenter Hinweis, ähnlich der Adresszeile eines gedruckten Dokuments. Der bezahlte Tarif entfernt ihn.',
      },
      {
        question: 'Was passiert, wenn ich aufhöre zu zahlen?',
        answer:
          'Ihre Lebensläufe bleiben erreichbar und mit den kostenlosen Vorlagen herunterladbar. Nichts wird gelöscht und nichts rückwirkend gesperrt: Ein mit einer Pro-Vorlage gesetztes Dokument bleibt einsehbar, sein Export wechselt auf eine kostenlose Vorlage.',
      },
      {
        question: 'Wie viele Lebensläufe kann ich kostenlos speichern?',
        answer:
          'Einen. Sie können ihn beliebig oft ändern und mehrmals im Monat herunterladen. Für mehrere Fassungen parallel — eine je Stellentyp — brauchen Sie Pro.',
      },
    ],
    related: [
      {
        label: 'Preise',
        href: '/de/preise',
        description: 'Der vollständige Vergleich der drei Tarife.',
      },
      {
        label: 'Kostenlose Lebenslauf-Vorlagen',
        href: '/de/lebenslauf-vorlagen',
        description: 'Die Galerie, mit dem Status jeder Vorlage.',
      },
      {
        label: 'Lebenslauf erstellen',
        href: '/de/lebenslauf-erstellen',
        description: 'Der Editor, die Live-Vorschau und der PDF-Export.',
      },
    ],
  },

  funktionen: {
    path: '/de/funktionen',
    breadcrumb: 'Funktionen',
    metaTitle: 'Funktionen',
    metaDescription:
      'Alles, was der Editor kann: Vorschau in echter Seitengröße, originalgetreuer PDF-Export, Typografie-Einstellungen, eigene Abschnitte und ein passendes Anschreiben.',
    keywords: ['lebenslauf editor funktionen', 'lebenslauf tool', 'lebenslauf software'],
    heading: 'Was das Werkzeug kann',
    lede: 'Eine ehrliche Liste, einschließlich dessen, was fehlt. Ein Lebenslauf-Editor misst sich an zwei Dingen: der Übereinstimmung von Bildschirm und PDF, und daran, wie oft er sich Ihnen in den Weg stellt.',
    badges: ['Originalgetreue Vorschau', 'PDF-Export', 'Automatisches Speichern'],
    features: {
      title: 'Das Wesentliche',
      items: [
        {
          title: 'Vorschau in echter Größe',
          body: 'Die Seite wird in Millimetern gesetzt, nicht in ungefähren Pixeln. Sie sehen den Seitenumbruch genau dort, wo er stattfinden wird.',
        },
        {
          title: 'Eine einzige Render-Engine',
          body: 'Vorschau, Druckansicht und PDF entstehen aus demselben Code. Sie können nicht auseinanderlaufen, weil es nichts zu synchronisieren gibt.',
        },
        {
          title: 'Automatisches Speichern',
          body: 'Während der Eingabe, mit lokaler Sicherungskopie, falls das Speichern scheitert — und einem Wiederherstellungsangebot beim nächsten Öffnen.',
        },
        {
          title: 'Rückgängig und Wiederholen',
          body: 'Strg+Z für die gesamte Eingabe, auch für das Löschen eines ganzen Abschnitts. Nichts, was Sie entfernen, ist ohne Weiteres verloren.',
        },
        {
          title: 'Bewegliche Abschnitte',
          body: 'Ziehen mit der Maus, Pfeiltasten auf der Tastatur. Ein Abschnitt lässt sich ausblenden statt löschen, sodass zwei Varianten in einem Dokument Platz haben.',
        },
        {
          title: 'Zwölf Standardabschnitte',
          body: 'Profil, Kernkompetenzen, Berufserfahrung, Ausbildung, Kenntnisse, Sprachen, Projekte, Zertifikate, Auszeichnungen, Ehrenamt, Publikationen, Interessen.',
        },
        {
          title: 'Eigene Abschnitte',
          body: 'Für alles Übrige. Überschrift, Unterzeile, Datum und Beschreibung: genug für ein Patent, ein Mandat, einen Vortrag oder den Wehrdienst.',
        },
        {
          title: 'Passendes Anschreiben',
          body: 'Es erbt Schriften, Farbe, Ränder und Sprache des Lebenslaufs und erscheint als erste Seite desselben PDFs.',
        },
        {
          title: 'Datenexport',
          body: 'Alle Lebensläufe als JSON, im Browser erzeugt. Sie gehen mit Ihrem Inhalt, wann Sie wollen.',
        },
      ],
    },
    prose: [
      {
        heading: 'Was es nicht gibt',
        paragraphs: [
          'Kein automatisches Texten durch künstliche Intelligenz. Ein generierter Text ist erkennbar, sagt dasselbe wie der des vorigen Bewerbers und nimmt dem Lebenslauf das Einzige, was er beiträgt — was Sie getan haben, in Ihren Worten.',
          'Keine Lebenslauf-Bewertung auf einer Skala von hundert. So etwas erweckt den Eindruck von Strenge, ohne zu messen, worauf ein Personalverantwortlicher schaut. Es gibt stattdessen eine Vollständigkeitsanzeige, die konkrete Dinge prüft: Name, Kontaktdaten, Profil, mindestens eine Station mit Erfolgen, fünf Kenntnisse.',
          'Keine automatische Verteilung Ihres Lebenslaufs an Personalvermittler und keine Bewerberdatenbank. Diese Seite stellt ein Dokument her; sie vermittelt nicht.',
        ],
      },
      {
        heading: 'Barrierefreiheit und Kompatibilität',
        paragraphs: [
          'Die Oberfläche lässt sich vollständig mit der Tastatur bedienen, auch das Umsortieren der Abschnitte, und die Bedienelemente tragen Bezeichnungen, die ein Screenreader vorlesen kann. Statusfarben sind nie der einzige Träger einer Information.',
          'Der Editor läuft in aktuellen Versionen von Chrome, Firefox, Safari und Edge, am Rechner wie am Telefon. Auf dem Telefon rückt die Vorschau unter das Formular statt daneben.',
        ],
      },
    ],
    showTemplates: true,
    faq: [
      {
        question: 'Kann ich die Vorlage wechseln, ohne Inhalt zu verlieren?',
        answer:
          'Ja. Inhalt und Einstellungen bleiben erhalten; nur die Typografie der neuen Vorlage greift, und auch das nur, wenn Sie keine eigene gewählt hatten.',
      },
      {
        question: 'Ist das PDF identisch mit der Vorschau?',
        answer:
          'Ja, weil beide aus demselben Render-Code stammen. Das ist die Eigenschaft, die die Architektur des Produkts vorrangig schützt.',
      },
      {
        question: 'Gibt es eine Obergrenze für Abschnitte?',
        answer:
          'Jeder Abschnitt hat eine maximale Zahl an Einträgen, großzügig genug für jeden realen Einsatz und dazu gedacht, Dokumente zu vermeiden, die sich nicht mehr öffnen lassen. Eigene Abschnitte sind dem Pro-Tarif vorbehalten.',
      },
    ],
    related: [
      {
        label: 'Lebenslauf erstellen',
        href: '/de/lebenslauf-erstellen',
        description: 'Der Editor im Detail.',
      },
      {
        label: 'Häufige Fragen',
        href: '/de/faq',
        description: 'Antworten auf die meistgestellten Fragen.',
      },
      ...CORE_LINKS,
    ],
  },

  faq: {
    path: '/de/faq',
    breadcrumb: 'Häufige Fragen',
    metaTitle: 'Häufige Fragen',
    metaDescription:
      'Antworten auf die meistgestellten Fragen: was kostenlos ist, ATS-Tauglichkeit, das Bewerbungsfoto, Datenschutz, Zahlung und Rückerstattung.',
    keywords: ['lebenslauf faq', 'hilfe lebenslauf', 'fragen lebenslauf'],
    heading: 'Häufige Fragen',
    lede: 'Die Fragen, die wiederkehren, mit vollständigen statt beruhigenden Antworten. Steht Ihre nicht dabei, schreiben Sie uns: Wir antworten innerhalb von zwei Werktagen.',
    faqTitle: 'Das Produkt',
    faq: [
      {
        question: 'Ist der Dienst wirklich kostenlos?',
        answer:
          'Ja, um einen Lebenslauf zu erstellen, zu gestalten und das PDF mit den kostenlosen Vorlagen herunterzuladen — ohne Kreditkarte und ohne Testphase. Der bezahlte Tarif schaltet die Pro-Vorlagen, unbegrenzte Lebensläufe, die erweiterte Gestaltung und das PDF ohne Fußzeilenhinweis frei.',
      },
      {
        question: 'Muss ich ein Konto anlegen?',
        answer:
          'Um einen Lebenslauf zu speichern ja: Ohne Konto gibt es keinen Ort, an dem er bleiben könnte. Eine E-Mail-Adresse und ein Passwort genügen, oder ein Google-Konto. Für den kostenlosen Tarif wird nie eine Kreditkarte verlangt.',
      },
      {
        question: 'Sind meine Lebensläufe privat?',
        answer:
          'Ja. Nichts ist für Dritte sichtbar, solange Sie nicht selbst einen Freigabelink aktivieren, und dieser Link führt auf eine zufällige, für Suchmaschinen nicht indexierbare Adresse. Wir verkaufen keine Daten und bieten keine Lebensläufe an Personalvermittler an.',
      },
      {
        question: 'Kommt mein Lebenslauf durch ein Bewerbermanagementsystem?',
        answer:
          'Die mit 5 von 5 bewerteten Vorlagen sind dafür gebaut: eine Spalte, keine Grafiken im Textfluss, keine Symbole anstelle von Bezeichnungen, wirklich auslesbarer Text. Kein Anbieter kann das Verhalten aller Systeme garantieren, aber genau diese Eigenschaften sind es, die Probleme machen, wenn sie Probleme machen.',
      },
      {
        question: 'Gehört ein Foto auf einen deutschen Lebenslauf?',
        answer:
          'Es ist in Deutschland weiterhin verbreitet, aber nicht verpflichtend: Nach dem AGG darf kein Arbeitgeber ein Foto verlangen, und manche Unternehmen entfernen es vor der Vorauswahl, um Vorurteile zu begrenzen. Wenn Sie eines verwenden: scharf, auf das Gesicht ausgerichtet, neutraler Hintergrund. Alle Vorlagen funktionieren mit und ohne.',
      },
      {
        question: 'Kann ich die Vorlage wechseln, nachdem ich alles eingetragen habe?',
        answer:
          'Ja, ohne Verlust. Inhalt und Einstellungen bleiben; nur die Typografie der neuen Vorlage greift, und auch das nur, wenn Sie keine eigene gewählt hatten.',
      },
      {
        question: 'Kann ich meine Daten mitnehmen?',
        answer:
          'Jederzeit, über die Einstellungen: eine JSON-Datei mit allen Lebensläufen vollständig, in Ihrem Browser aus Ihrem Konto zusammengesetzt. Dafür wird nichts anderswo abgelegt.',
      },
      {
        question: 'Wie läuft die Zahlung?',
        answer:
          'Über Paddle, das sich in einem Fenster auf der Seite öffnet. Kreditkarte, PayPal, Apple Pay oder Google Pay. Paddle ist der Verkäufer im Rechtssinne und berechnet die in Ihrem Land geltende Umsatzsteuer. Die Beträge lauten auf US-Dollar; Ihre Bank wendet ihren Umrechnungskurs an.',
      },
      {
        question: 'Bekomme ich mein Geld zurück?',
        answer:
          'Ja, innerhalb von vierzehn Tagen nach dem Kauf, nach unserer Rückerstattungsrichtlinie. Schreiben Sie uns mit der Bestellnummer aus dem Beleg von Paddle.',
      },
      {
        question: 'Wie lösche ich mein Konto?',
        answer:
          'In den Einstellungen. Die Löschung entfernt Ihr Profil, alle Lebensläufe und die Zahlungshistorie und ist nicht umkehrbar — exportieren Sie vorher. Der Antrag wird von unserem Team manuell bearbeitet, das die Löschung per E-Mail bestätigt.',
      },
    ],
    related: [
      {
        label: 'Preise',
        href: '/de/preise',
        description: 'Die drei Tarife im Detail.',
      },
      {
        label: 'Kontakt',
        href: '/de/kontakt',
        description: 'Für alles, was oben nicht steht.',
      },
      {
        label: 'Rückerstattung',
        href: '/de/rueckerstattung',
        description: 'Der vollständige Text, vierzehn Tage.',
      },
      {
        label: 'Datenschutz',
        href: '/de/datenschutz',
        description: 'Was wir erheben und was wir damit nicht tun.',
      },
    ],
  },
};
