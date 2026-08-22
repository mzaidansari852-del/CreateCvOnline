import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Datenschutzerklärung',
  description: `Wie ${site.name} Ihre Kontodaten und Lebenslauf-Inhalte erhebt, speichert und löscht, welche Auftragsverarbeiter beteiligt sind und wie Sie Ihre Rechte ausüben.`,
  path: '/de/datenschutz',
  locale: 'de',
});

/**
 * The German privacy policy.
 *
 * Section ids match the English and French pages, so `/privacy#your-rights` and
 * `/de/datenschutz#your-rights` land on the same clause — support answers questions with
 * deep links and does not know which language the person is reading.
 *
 * The vocabulary is the DSGVO's own German: `Verantwortlicher`, `Auftragsverarbeiter`,
 * `Rechtsgrundlage`, `berechtigtes Interesse`. A German reader checking their rights is
 * looking for those exact words, and a literal translation of the English terms would send
 * them past the section they came for.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'Wer wir sind und was dieses Dokument abdeckt',
    body: (
      <>
        <p>
          Diese Erklärung beschreibt, was mit personenbezogenen Daten geschieht, wenn Sie{' '}
          {site.name} unter {site.domain} nutzen („der Dienst“). Sie gilt für die öffentliche
          Website, den Lebenslauf-Editor, den PDF-Export und den Kontobereich. Für andere
          Websites, die Sie über einen Link von hier aus erreichen, gilt sie nicht.
        </p>
        <p>
          Verantwortlicher im Sinne der DSGVO ist der Betreiber von {site.domain}. Fragen,
          Anträge und Beschwerden richten Sie bitte an{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <p>
          Ein Hinweis, der hier zählt: Ein Lebenslauf ist ungewöhnlich aufschlussreich. Er
          enthält in der Regel Ihren vollständigen Namen, Ihre Kontaktdaten, Ihren
          beruflichen Werdegang, Ihre Ausbildung und mitunter Ihr Bewerbungsfoto. Wir
          behandeln den Inhalt Ihrer Dokumente als das Sensibelste am gesamten Dienst, und
          die folgenden Abschnitte sagen genau, wer darauf zugreifen kann.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Welche Daten wir erheben',
    body: (
      <>
        <h3>Kontodaten</h3>
        <p>
          Ihre E-Mail-Adresse, ein Anzeigename, sofern Sie einen angeben, und die verwendete
          Anmeldemethode. Bei der Anmeldung mit Google erhalten wir von Google Ihre
          E-Mail-Adresse, Ihren Namen und die URL Ihres Profilbilds.{' '}
          <strong>Ihr Passwort erhalten und speichern wir zu keinem Zeitpunkt</strong> — die
          Authentifizierung übernimmt Firebase Authentication, und Passwörter erreichen
          unseren Anwendungscode nie.
        </p>
        <h3>Lebenslauf-Inhalte</h3>
        <p>
          Alles, was Sie in den Editor eingeben: Kontaktdaten, Berufserfahrung, Ausbildung,
          Kenntnisse, Sprachen, Projekte und eigene Abschnitte, dazu die Gestaltungs­
          einstellungen jedes Dokuments. Das wird gespeichert, damit Sie es wiederfinden, und
          zu keinem anderen Zweck.
        </p>
        <h3>Zahlungsdaten</h3>
        <p>
          Bei einem Tarifkauf speichern wir die Paddle-Transaktions-ID, den gekauften Tarif,
          den Betrag, die Währung, den Status und den Zeitpunkt.{' '}
          <strong>Ihre Kartennummer sehen wir nie.</strong> Das Zahlungsfenster öffnet sich
          über unserer Seite, das Formular darin ist jedoch ein iframe von Paddle: Kartendaten
          werden dort eingegeben und ausschließlich von Paddle verarbeitet.
        </p>
        <h3>Technische Daten und Nutzungsdaten</h3>
        <p>
          Die serverseitigen Aufzeichnungen, die der Betrieb und die Absicherung eines
          Webdienstes erfordern: die Anzahl der Lebensläufe in Ihrem Konto, Ihr
          Download-Zähler des laufenden Monats, Zeitstempel und — zur Ratenbegrenzung und
          Missbrauchsabwehr — ein kurzlebiger, aus Anfrage-Headern abgeleiteter Wert.
          Nachrichten über das Kontaktformular werden mit der dort angegebenen Adresse
          gespeichert.
        </p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Zu welchen Zwecken und auf welcher Rechtsgrundlage',
    body: (
      <>
        <p>
          Jede hier beschriebene Verarbeitung stützt sich auf eine der Rechtsgrundlagen des
          Art. 6 DSGVO:
        </p>
        <ul>
          <li>
            <strong>Vertragserfüllung</strong> — Ihr Konto anlegen und führen, Ihre
            Lebensläufe speichern, Ihre PDFs erzeugen, die Grenzen Ihres Tarifs durchsetzen
            und Ihre Zahlung abwickeln. Ohne diese Verarbeitungen kann der Dienst nicht
            erbracht werden.
          </li>
          <li>
            <strong>Berechtigtes Interesse</strong> — den Dienst absichern, Missbrauch und
            Betrug verhindern und technische Protokolle so lange vorhalten, wie es zur
            Analyse eines Vorfalls nötig ist. Das verfolgte Interesse ist der zuverlässige
            Betrieb; der Eingriff bleibt gering, weil diese Daten technisch und kurzlebig
            sind.
          </li>
          <li>
            <strong>Rechtliche Verpflichtung</strong> — die Aufbewahrung zahlungsbezogener
            Buchungsbelege für die gesetzlich vorgeschriebene Dauer.
          </li>
          <li>
            <strong>Einwilligung</strong> — Produkt-E-Mails, die Sie aktiv abonnieren und mit
            einem Klick abbestellen, sowie Analyse-Cookies, sofern auf diesem Deployment
            aktiviert.
          </li>
        </ul>
        <p>
          Wir nutzen den Inhalt Ihrer Lebensläufe nicht für Werbung, verkaufen ihn nicht und
          bieten ihn keinem Personalvermittler an. Eine Bewerberdatenbank gibt es nicht.
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Wer sonst beteiligt ist',
    body: (
      <>
        <p>Wir setzen wenige Auftragsverarbeiter ein, jeden für eine klar umrissene Aufgabe:</p>
        <ul>
          <li>
            <strong>Google Firebase</strong> (Authentifizierung, Firestore-Datenbank,
            Dateispeicher) — hostet Ihr Konto, Ihre Lebensläufe und Ihre Profilfotos.
          </li>
          <li>
            <strong>Paddle</strong> — Verkäufer im Rechtssinne für Zahlungen. Paddle erhebt
            Ihre Zahlungsdaten, berechnet und führt die anfallende Umsatzsteuer ab und
            übermittelt uns eine Transaktions-ID und einen Status. Für die eigene
            Rechnungsstellung ist Paddle selbst Verantwortlicher.
          </li>
          <li>
            <strong>Vercel</strong> — Hosting der Anwendung und des Auslieferungsnetzes.
          </li>
          <li>
            <strong>Google Analytics</strong> — nur, wenn auf diesem Deployment eine Mess-ID
            konfiguriert ist. Siehe die <Link href="/de/cookies">Cookie-Richtlinie</Link>.
          </li>
        </ul>
        <p>
          Alle sind durch einen Auftragsverarbeitungsvertrag gebunden und dürfen die Daten
          nur zu den von uns bestimmten Zwecken verarbeiten. An andere geben wir nichts
          weiter, außer wir sind gesetzlich dazu verpflichtet.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <>
        <p>
          Der Dienst setzt ein technisch notwendiges Sitzungs-Cookie, ohne das Sie nicht
          angemeldet bleiben können, sowie ein Cookie für die Sprachpräferenz.
          Analyse-Cookies werden nur gesetzt, wenn die Analyse konfiguriert ist, und sind
          freiwillig.
        </p>
        <p>
          Die vollständige Aufstellung — Name, Zweck, Laufzeit und Abschaltung — steht in der{' '}
          <Link href="/de/cookies">Cookie-Richtlinie</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Wie lange wir Daten aufbewahren',
    body: (
      <>
        <ul>
          <li>
            <strong>Konto und Lebensläufe</strong> — solange das Konto besteht. Dokumente
            eines inaktiven Kontos löschen wir nicht ohne vorherige Ankündigung.
          </li>
          <li>
            <strong>Zahlungshistorie</strong> — für die handels- und steuerrechtliche
            Aufbewahrungsfrist, auch nach Kontolöschung, weil das eine gesetzliche Pflicht
            und keine Entscheidung von uns ist.
          </li>
          <li>
            <strong>Kontaktnachrichten</strong> — vierundzwanzig Monate, dann Löschung. Lang
            genug, um den Zusammenhang eines früheren Vorgangs wiederzufinden, zu kurz für
            ein Archiv.
          </li>
          <li>
            <strong>Technische Protokolle und Ratenbegrenzung</strong> — höchstens wenige
            Tage.
          </li>
        </ul>
        <p>
          Löschen Sie einen Lebenslauf, wird er aus der Datenbank entfernt; in den Backups
          unseres Hosters kann er für kurze Zeit fortbestehen, bis diese rotieren.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Wo Ihre Daten verarbeitet werden',
    body: (
      <>
        <p>
          Unsere Auftragsverarbeiter betreiben unter anderem Infrastruktur in den USA.
          Übermittlungen außerhalb des EWR stützen sich auf die Mechanismen des Kapitels V
          DSGVO: das EU-US Data Privacy Framework, sofern der Anbieter zertifiziert ist, und
          andernfalls die Standardvertragsklauseln der Europäischen Kommission.
        </p>
        <p>
          Wir können nicht garantieren, dass niemals eine ausländische Behörde an einen
          dieser Anbieter herantritt. Das ist eine reale Grenze weltweiter Infrastruktur, und
          wir halten es für ehrlicher, sie zu benennen, als sie zu verschweigen.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Sicherheit',
    body: (
      <>
        <p>
          Die Übertragung erfolgt ausschließlich über HTTPS. Passwörter verwaltet Firebase
          Authentication und erreichen unseren Code nie. Der Zugriff auf Ihre Dokumente ist
          zusätzlich auf Datenbankebene durch Firestore-Sicherheitsregeln beschränkt, die die
          Identität des Anfragenden prüfen — ein Fehler in unserem Anwendungscode genügt also
          nicht, um den Lebenslauf einer anderen Person offenzulegen.
        </p>
        <p>
          Ein öffentlicher Freigabelink, sofern Sie einen erzeugen, verweist auf eine
          zufällige, nicht erratbare und für Suchmaschinen nicht indexierbare Adresse. Wer
          den Link hat, kann das Dokument dennoch aufrufen: Geben Sie ihn nicht weiter als
          nötig und schalten Sie ihn ab, wenn er seinen Zweck erfüllt hat.
        </p>
        <p>
          Kein Dienst ist vor Kompromittierung sicher. Bei einer Datenschutzverletzung mit
          Risiko für Ihre Rechte und Freiheiten informieren wir Sie und melden den Vorfall
          der zuständigen Aufsichtsbehörde innerhalb der Fristen der DSGVO.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Ihre Rechte',
    body: (
      <>
        <p>Die DSGVO gibt Ihnen die folgenden Rechte, die Sie jederzeit ausüben können:</p>
        <ul>
          <li>
            <strong>Auskunft</strong> — eine Kopie der Daten, die wir über Sie führen. Der
            JSON-Export in den Einstellungen beantwortet das sofort, ohne uns zu schreiben.
          </li>
          <li>
            <strong>Berichtigung</strong> — unrichtige Daten korrigieren. Die Inhalte Ihrer
            Lebensläufe ändern Sie direkt im Editor.
          </li>
          <li>
            <strong>Löschung</strong> — Ihr Konto und dessen Inhalte löschen lassen,
            vorbehaltlich der Belege, die wir gesetzlich aufbewahren müssen.
          </li>
          <li>
            <strong>Einschränkung</strong> und <strong>Widerspruch</strong> — eine auf
            berechtigtes Interesse gestützte Verarbeitung einschränken oder ihr
            widersprechen.
          </li>
          <li>
            <strong>Datenübertragbarkeit</strong> — Ihre Daten in einem strukturierten,
            maschinenlesbaren Format erhalten. Genau das erzeugt der JSON-Export.
          </li>
          <li>
            <strong>Widerruf der Einwilligung</strong> — für Produkt-E-Mails und freiwillige
            Cookies, ohne dass die Rechtmäßigkeit der bisherigen Verarbeitung berührt wird.
          </li>
        </ul>
        <p>
          Schreiben Sie an <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
          Wir antworten innerhalb eines Monats, wie die Verordnung es vorsieht, in der Praxis
          deutlich schneller. Sind Sie mit unserer Antwort nicht einverstanden, können Sie
          sich an die Aufsichtsbehörde Ihres Wohnsitzlandes wenden.
        </p>
      </>
    ),
  },
  {
    id: 'export-delete',
    title: 'Daten exportieren und löschen',
    body: (
      <>
        <p>
          <strong>Exportieren.</strong> In den Kontoeinstellungen lädt eine Schaltfläche
          sämtliche Lebensläufe als JSON herunter — Kontaktdaten, Abschnitte und
          Gestaltungseinstellungen je Dokument. Die Datei wird in Ihrem Browser aus Ihrem
          eigenen Konto zusammengesetzt; dafür wird nichts an anderer Stelle gespeichert.
        </p>
        <p>
          <strong>Löschen.</strong> Die Kontolöschung beantragen Sie in den Einstellungen.
          Sie ist noch nicht automatisiert: Der Antrag öffnet eine vorausgefüllte Nachricht
          an unser Team, das ihn manuell bearbeitet und die Löschung per E-Mail bestätigt.
          Wir schreiben das lieber so, als eine Schaltfläche anzuzeigen, die eine sofortige
          Löschung suggeriert.
        </p>
        <p>
          Exportieren Sie vor dem Löschen: Der Vorgang entfernt Ihr Profil, alle Lebensläufe
          und die zugehörige Historie und ist nicht umkehrbar.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Minderjährige',
    body: (
      <p>
        Der Dienst richtet sich nicht an Kinder unter sechzehn Jahren, und wir erheben deren
        Daten nicht wissentlich. Ein Lebenslauf für einen Praktikumsplatz ist eine legitime
        Nutzung; wenn Sie sorgeberechtigt sind und meinen, ein Konto sei ohne gültige
        Grundlage angelegt worden, schreiben Sie uns, und wir löschen es.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Änderungen dieser Erklärung',
    body: (
      <p>
        Wir aktualisieren dieses Dokument, wenn sich der Dienst ändert. Das Datum der letzten
        Aktualisierung steht oben auf der Seite. Wesentliche Änderungen — ein neuer
        Verarbeitungszweck, ein neuer Auftragsverarbeiter mit Zugriff auf Ihre
        Lebenslauf-Inhalte — teilen wir Ihnen vorab per E-Mail oder im Produkt mit, nicht
        rückwirkend.
      </p>
    ),
  },
];

export default function GermanPrivacyPage() {
  return (
    <LegalDocument
      locale="de"
      title="Datenschutzerklärung"
      intro={`Was ${site.name} erhebt, wozu, mit wem diese Daten geteilt werden, wie lange sie gespeichert bleiben und wie Sie Ihre Rechte ausüben.`}
      summary={[
        <>
          Wir verkaufen Ihre Daten nicht und bieten keinen Lebenslauf an Personalvermittler
          an. Eine Bewerberdatenbank gibt es nicht.
        </>,
        <>
          Ihre Lebensläufe sieht niemand außer Ihnen, solange Sie keinen Freigabelink
          aktivieren.
        </>,
        <>
          Ihr Passwort und Ihre Kartennummer sehen wir nie: das übernehmen Firebase und
          Paddle.
        </>,
        <>Sie exportieren jederzeit alle Lebensläufe als JSON aus den Einstellungen.</>,
        <>
          Die Kontolöschung entfernt alles bis auf die Belege, die wir gesetzlich aufbewahren
          müssen.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'AGB', href: '/de/agb' },
        { label: 'Cookie-Richtlinie', href: '/de/cookies' },
        { label: 'Rückerstattung', href: '/de/rueckerstattung' },
      ]}
    />
  );
}
