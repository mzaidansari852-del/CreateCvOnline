import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Rückerstattungsrichtlinie',
  description: `Vierzehn Tage Rückerstattung bei ${site.name}: was erstattet wird, wie Sie es beantragen und wie lange es dauert.`,
  path: '/de/rueckerstattung',
  locale: 'de',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'the-promise',
    title: 'Die vierzehn Tage',
    body: (
      <>
        <p>
          Sie haben <strong>vierzehn Tage</strong> ab Kauf, um eine vollständige Erstattung zu
          verlangen, ohne Begründung. Schreiben Sie uns, nennen Sie die Bestellnummer, das ist
          alles.
        </p>
        <p>
          Wir fragen nicht, was nicht gepasst hat, wir bieten nicht erst drei Alternativtarife
          an, und es gibt kein Formular. Ein Dienst, der die Erstattung mühsam macht, verdient
          das Vertrauen nicht, das er beim Bezahlen einfordert.
        </p>
        <p>
          Als Verbraucher in der EU gilt Ihr gesetzliches Widerrufsrecht zusätzlich zu dieser
          Richtlinie und wird durch sie in keiner Weise eingeschränkt.
        </p>
      </>
    ),
  },
  {
    id: 'what-is-refundable',
    title: 'Was erstattet wird',
    body: (
      <ul>
        <li>
          <strong>Der erste Kauf eines Abonnements</strong>, innerhalb von vierzehn Tagen,
          unabhängig davon, wie viel Sie zwischenzeitlich genutzt haben.
        </li>
        <li>
          <strong>Der lebenslange Zugang</strong>, innerhalb von vierzehn Tagen nach Kauf.
        </li>
        <li>
          <strong>Eine unerwartete Verlängerung eines Abonnements</strong>, wenn Sie sich nach
          der Abbuchung zügig melden. Eine vergessene Verlängerung ist keine Falle, die wir
          zuschnappen lassen wollen.
        </li>
        <li>
          <strong>Eine Doppelzahlung</strong>, ein falscher Betrag oder eine Transaktion, die
          Sie nicht zuordnen können: vollständig erstattet, ohne Fristbindung.
        </li>
      </ul>
    ),
  },
  {
    id: 'what-is-not',
    title: 'Was nicht erstattet wird',
    body: (
      <>
        <ul>
          <li>
            <strong>Bereits verstrichene Abonnementzeiträume nach den vierzehn Tagen.</strong>{' '}
            Kündigen Sie im achten Monat, erstatten wir die sieben genutzten Monate nicht. Die
            Kündigung verhindert die nächste Abbuchung.
          </li>
          <li>
            <strong>Wiederholte Erstattungen desselben Tarifs.</strong> Wurde Ihnen ein Tarif
            bereits erstattet, fällt der erneute Kauf mit anschließendem Erstattungswunsch
            nicht mehr unter diese Richtlinie.
          </li>
        </ul>
        <p>
          Diese Liste ist bewusst kurz. Wir verweigern die Erstattung nicht, weil Sie ein PDF
          heruntergeladen oder eine Pro-Vorlage benutzt haben: Genau dafür hatten Sie bezahlt,
          und es Ihnen vorzuhalten hieße, ein Recht zu verkaufen, das man nicht ausüben darf.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-ask',
    title: 'Wie Sie eine Erstattung beantragen',
    body: (
      <>
        <p>
          Schreiben Sie an <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> oder
          nutzen Sie das <Link href="/contact">Kontaktformular</Link> mit dem Betreff
          „Refund request“.
        </p>
        <p>Nennen Sie:</p>
        <ul>
          <li>
            die <strong>Paddle-Transaktionsnummer</strong> aus dem Beleg, den Sie beim Kauf
            per E-Mail erhalten haben;
          </li>
          <li>
            die <strong>E-Mail-Adresse des Kontos</strong>, falls sie von der abweicht, aus
            der Sie schreiben.
          </li>
        </ul>
        <p>
          Ein Grund ist freiwillig. Er hilft uns, das Produkt zu verbessern, und ist für nichts
          Voraussetzung.
        </p>
        <p>
          Da Paddle Verkäufer im Rechtssinne ist, funktioniert auch der Link auf Ihrem Beleg.
          Beide Wege führen zum selben Ergebnis; uns zu schreiben ist meist schneller.
        </p>
      </>
    ),
  },
  {
    id: 'how-long',
    title: 'Wie lange es dauert',
    body: (
      <>
        <ul>
          <li>
            <strong>Unsere Entscheidung</strong> — innerhalb von zwei Werktagen, meist noch am
            selben Tag.
          </li>
          <li>
            <strong>Bearbeitung durch Paddle</strong> — die Erstattung wird unmittelbar nach
            unserer Zustimmung angewiesen.
          </li>
          <li>
            <strong>Gutschrift auf Ihrem Konto</strong> — drei bis zehn Werktage, je nach Bank
            oder Kartenherausgeber. Dieser letzte Schritt liegt weder bei uns noch bei Paddle.
          </li>
        </ul>
        <p>
          Ist nach zehn Werktagen ab unserer Bestätigung nichts angekommen, schreiben Sie uns:
          Wir übermitteln Ihnen die Erstattungsreferenz für Ihre Bank.
        </p>
      </>
    ),
  },
  {
    id: 'after-a-refund',
    title: 'Was mit Ihren Lebensläufen und Downloads geschieht',
    body: (
      <>
        <p>
          Ihr Konto wechselt zurück in den kostenlosen Tarif.{' '}
          <strong>Kein Lebenslauf wird gelöscht.</strong> Sie bleiben lesbar, bearbeitbar und
          exportierbar mit den kostenlosen Vorlagen.
        </p>
        <p>
          Was entfällt: die Pro-Vorlagen, mehrere Lebensläufe über das kostenlose Limit
          hinaus, die erweiterte Gestaltung, eigene Abschnitte, der öffentliche Link und das
          PDF ohne Fußzeilenhinweis. Ein mit einer Pro-Vorlage gesetzter Lebenslauf bleibt in
          Ihrem Bereich sichtbar; sein Export wechselt auf eine kostenlose Vorlage.
        </p>
        <p>
          Bereits heruntergeladene PDFs gehören Ihnen und bleiben es. Wir widerrufen sie nicht
          und könnten es auch gar nicht — es sind Dateien auf Ihrer Festplatte.
        </p>
      </>
    ),
  },
  {
    id: 'cancelling',
    title: 'Wie Sie eine erneute Abbuchung verhindern',
    body: (
      <>
        <p>
          Erstattung und Kündigung sind zweierlei. Die Erstattung gibt das Geld einer bereits
          erfolgten Zahlung zurück; die Kündigung verhindert die nächste.
        </p>
        <p>
          Gekündigt wird auf der Seite „Konto“ in Ihrem Bereich oder über den Verwaltungslink
          auf dem Paddle-Beleg. Sie wirkt zum Ende des bereits bezahlten Zeitraums: Bis dahin
          behalten Sie den Zugang, was folgerichtig ist, da dieser Zeitraum berechnet wurde.
        </p>
        <p>
          Der lebenslange Zugang lässt sich nicht kündigen, weil er sich nicht verlängert. Es
          wird nie ein zweites Mal abgebucht.
        </p>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Streitfälle und Rückbuchungen',
    body: (
      <>
        <p>
          Können Sie eine Zahlung nicht zuordnen, schreiben Sie uns, bevor Sie bei Ihrer Bank
          eine Rückbuchung veranlassen. Eine Rückbuchung löst bei Paddle ein förmliches
          Verfahren aus, dauert mehrere Wochen und friert den Vorgang ein — während eine
          direkte Erstattung zwei Tage braucht.
        </p>
        <p>
          Eine laufende Rückbuchung setzt den bezahlten Zugang für die Dauer der Prüfung aus.
          Das ist eine Vorgabe des Zahlungsdienstleisters, keine Sanktion von uns.
        </p>
      </>
    ),
  },
  {
    id: 'statutory-rights',
    title: 'Ihre gesetzlichen Rechte',
    body: (
      <>
        <p>
          Diese Richtlinie tritt neben Ihre gesetzlichen Rechte und ersetzt sie nicht. In
          mehreren Punkten ist sie günstiger als das gesetzliche Minimum; wo sie es nicht
          wäre, gilt das Gesetz.
        </p>
        <p>
          In der EU begründet der Kauf digitaler Inhalte ein vierzehntägiges Widerrufsrecht.
          Ein Unternehmen kann den Verbraucher bitten, darauf für den sofortigen Zugang zu
          verzichten; das tun wir nicht, und die hier beschriebenen vierzehn Tage gelten in
          jedem Fall.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Änderungen dieser Richtlinie',
    body: (
      <p>
        Eine Änderung wirkt nie rückwirkend: Für einen Kauf gilt die Richtlinie, die am Tag
        des Kaufs in Kraft war. Das Datum der letzten Aktualisierung steht oben auf der Seite.
      </p>
    ),
  },
];

export default function GermanRefundPolicyPage() {
  return (
    <LegalDocument
      locale="de"
      title="Rückerstattungsrichtlinie"
      intro="Vierzehn Tage, ohne Begründung. Hier steht genau, was darunter fällt, wie Sie es beantragen und wann das Geld zurück ist."
      summary={[
        <>Vierzehn Tage volle Erstattung, ohne dass Sie sich erklären müssen.</>,
        <>
          Ein heruntergeladenes PDF oder eine genutzte Pro-Vorlage kostet Sie den Anspruch
          nicht: Genau dafür hatten Sie bezahlt.
        </>,
        <>
          Eine unerwartete Verlängerung wird erstattet, wenn Sie sich zügig melden.
        </>,
        <>
          Nach einer Erstattung wird kein Lebenslauf gelöscht; das Konto wechselt nur zurück
          in den kostenlosen Tarif.
        </>,
        <>
          Schreiben Sie uns vor einer Rückbuchung: zwei Tage per E-Mail statt mehrerer Wochen
          Verfahren.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Preise', href: '/de/preise' },
        { label: 'AGB', href: '/de/agb' },
        { label: 'Datenschutzerklärung', href: '/de/datenschutz' },
      ]}
    />
  );
}
