import { DE } from './de-copy';
import { fontLabel } from '@/lib/cv/format';
import type { TemplateDefinition } from '@/types/cv';

/**
 * German copy for a template's detail page, generated from its metadata.
 *
 * Same approach as `app/fr/fr-template-copy.ts`, and for the same reason: sixty-one
 * templates times four prose fields is roughly six hundred sentences, and machine
 * translating them would put six hundred unread sentences on the pages meant to sell the
 * product. These are written from the structured facts — category, columns, ATS score,
 * photo, plan, typeface — in sentences written once by someone who could read them.
 */

const ATS_NOTE: Record<number, string> = {
  5: 'Maximale maschinelle Lesbarkeit: eine Spalte, keine Grafik im Textfluss, ausgeschriebene Überschriften. Die richtige Wahl für eine Bewerbung über ein Portal.',
  4: 'Gut maschinell lesbar. Es gibt einzelne grafische Elemente, aber keines trägt eine Information, die nicht auch im Text steht.',
  3: 'Ordentlich lesbar, mit Einschränkungen: das Layout enthält Elemente, die eine Bewerbersoftware falsch deuten kann. Eher für Bewerbungen direkt an eine Person.',
  2: 'Diese Vorlage ist für das menschliche Auge gebaut, nicht für die Software. Für Initiativbewerbungen, Netzwerkkontakte und Berufe, in denen die Gestaltung Teil der Bewerbung ist.',
  1: 'Stark grafisches Layout, für maschinelles Auslesen wenig geeignet. Als Ergänzung zu einem ATS-tauglichen Lebenslauf zu verwenden, nicht als Ersatz.',
};

const COLUMN_NOTE: Record<1 | 2, string> = {
  1: 'Eine Spalte, von oben nach unten: der Aufbau, den eine Bewerbersoftware zuverlässig zerlegt, und der den Stationen am meisten Platz lässt.',
  2: 'Zwei Spalten: eine Seitenleiste für Kenntnisse, Sprachen und Kontaktdaten, die restliche Breite für den Werdegang. Die Zeilen sind kürzer, was sich am Bildschirm schnell liest.',
};

export interface GermanTemplateCopy {
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
  facts: { label: string; value: string }[];
  faqHeading: string;
  faq: { question: string; answer: string }[];
}

export function germanTemplateCopy(template: TemplateDefinition): GermanTemplateCopy {
  const category = DE.categories[template.category];
  const plan = template.premium ? 'Pro' : 'kostenlos';
  const columns = template.columns === 1 ? 'einspaltig' : 'zweispaltig';

  return {
    metaTitle: `Lebenslauf-Vorlage ${template.name}`,
    metaDescription: `Lebenslauf-Vorlage ${template.name}: ${columns}, Stil ${category.label}, ${template.atsScore}/5 für die maschinelle Lesbarkeit. Online ausfüllen und als PDF herunterladen.`,
    heading: `Lebenslauf-Vorlage ${template.name}`,
    lede: `Eine ${columns}e Vorlage im Stil ${category.label}, ${plan}, mit ${template.atsScore} von 5 für die maschinelle Lesbarkeit. Im Browser ausfüllen und als PDF exportieren, dessen Text sich markieren lässt.`,

    atsHeading: 'Gegenüber Bewerbersoftware',
    atsBody: ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!,

    layoutHeading: 'Der Aufbau',
    layoutBody: COLUMN_NOTE[template.columns],

    typeHeading: 'Die Typografie',
    typeBody: `Überschriften in ${fontLabel(template.fonts.heading)}, Fließtext in ${fontLabel(
      template.fonts.body,
    )}. Das ist die Voreinstellung der Vorlage: Sie können sie im Editor ändern, und solange Sie das nicht tun, behält jede Vorlage ihre eigene.`,

    facts: [
      { label: 'Stil', value: category.label },
      { label: 'Spalten', value: template.columns === 1 ? 'Eine' : 'Zwei' },
      { label: 'ATS', value: `${template.atsScore}/5` },
      { label: 'Foto', value: template.hasPhoto ? 'Vorgesehen, abschaltbar' : 'Ohne Foto' },
      { label: 'Zugang', value: template.premium ? 'Pro' : 'Kostenlos' },
      { label: 'Format', value: 'DIN A4 oder US Letter' },
    ],

    faqHeading: `Fragen zur Vorlage ${template.name}`,
    faq: [
      {
        question: `Ist die Vorlage ${template.name} kostenlos?`,
        answer: template.premium
          ? 'Diese Vorlage gehört zum Pro-Zugang. Lebenslauf anlegen, Editor und PDF-Export sind mit den kostenlosen Vorlagen kostenfrei; der Zugang schaltet diese und die übrigen Pro-Vorlagen frei.'
          : 'Ja. Sie können sie ausfüllen und das PDF herunterladen, ohne zu zahlen. Ein Konto brauchen Sie nur, um das Dokument zu speichern und später wiederzufinden.',
      },
      {
        question: 'Kann ich die Vorlage nachträglich wechseln?',
        answer:
          'Ja, ohne Verlust: Inhalte und Einstellungen bleiben. Übernommen wird nur die Schrift der neuen Vorlage, und auch das nur, solange Sie keine eigene gewählt haben.',
      },
      {
        question: template.hasPhoto
          ? 'Kann ich das Foto weglassen?'
          : 'Kann ich dieser Vorlage ein Foto hinzufügen?',
        answer: template.hasPhoto
          ? 'Ja, mit einem Klick im Editor — das Layout schließt die frei gewordene Fläche sauber. Sinnvoll, wenn die Ausschreibung um eine Bewerbung ohne Foto bittet.'
          : 'Diese Vorlage ist ohne Foto angelegt. Wenn Sie eines möchten, wählen Sie eine Vorlage, die einen Platz dafür vorsieht, statt eines dort einzusetzen, wo das Layout keines erwartet.',
      },
      {
        question: 'Liest eine Bewerbersoftware das PDF?',
        answer: `${ATS_NOTE[template.atsScore] ?? ATS_NOTE[3]!} Der Text im PDF ist immer echter Text, nie ein Bild.`,
      },
    ],
  };
}
