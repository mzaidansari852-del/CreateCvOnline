import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Allgemeine Geschäftsbedingungen',
  description: `Die Nutzungsbedingungen von ${site.name}: was der Dienst leistet, Tarife und Zahlung, die Rechte an Ihren Inhalten und die Haftungsgrenzen.`,
  path: '/de/agb',
  locale: 'de',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Dieser Vertrag',
    body: (
      <>
        <p>
          Indem Sie ein Konto anlegen oder {site.name} unter {site.domain} nutzen, akzeptieren
          Sie diese Bedingungen. Wenn Sie sie nicht akzeptieren, nutzen Sie den Dienst nicht —
          eine andere Folge gibt es nicht.
        </p>
        <p>
          Zusammen mit der <Link href="/de/datenschutz">Datenschutzerklärung</Link>, der{' '}
          <Link href="/de/cookies">Cookie-Richtlinie</Link> und der{' '}
          <Link href="/de/rueckerstattung">Rückerstattungsrichtlinie</Link> bilden sie die
          vollständige Vereinbarung zwischen Ihnen und dem Betreiber des Dienstes.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'Was der Dienst ist',
    body: (
      <>
        <p>
          {site.name} ist ein Werkzeug zur Erstellung von Dokumenten. Sie tragen Ihren
          Werdegang in strukturierte Felder ein, gestalten ihn über Vorlagen und exportieren
          das Ergebnis als PDF.
        </p>
        <p>
          Es ist keine Arbeitsvermittlung, keine Personalberatung und keine Jobbörse. Wir
          übermitteln Ihren Lebenslauf keinem Arbeitgeber, bieten ihn keinem
          Personalvermittler an und sichern selbstverständlich keinerlei Bewerbungserfolg zu.
        </p>
        <p>
          Die redaktionellen Hinweise auf der Website — der ATS-Score, die Schreibtipps, die
          Anmerkungen zu Konventionen eines deutschen Lebenslaufs — sind belegte
          Einschätzungen, keine individuelle arbeitsrechtliche oder berufliche Beratung.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Ihr Konto',
    body: (
      <>
        <p>
          Für ein Konto müssen Sie mindestens sechzehn Jahre alt sein. Sie sind für die
          Richtigkeit der angegebenen E-Mail-Adresse und die Vertraulichkeit Ihrer
          Zugangsdaten verantwortlich; informieren Sie uns unverzüglich bei Verdacht auf
          unbefugten Zugriff.
        </p>
        <p>
          Ein Konto ist persönlich. Das Teilen eines kostenpflichtigen Kontos zwischen
          mehreren Personen widerspricht diesen Bedingungen, schon weil die Nutzungsgrenzen
          pro Konto berechnet werden.
        </p>
        <p>
          Die Bestätigung Ihrer E-Mail-Adresse wird dringend empfohlen und sperrt nichts im
          Editor: Sie ist der einzige Weg zurück, wenn Sie Ihr Passwort vergessen.
        </p>
      </>
    ),
  },
  {
    id: 'plans',
    title: 'Tarife, Preise und Zahlung',
    body: (
      <>
        <p>
          Die Tarife stehen auf der Seite <Link href="/de/preise">Preise</Link>. Der kostenlose
          Tarif erlaubt das Erstellen, Gestalten und Herunterladen eines Lebenslaufs als PDF
          mit den kostenlosen Vorlagen — ohne Kreditkarte und ohne befristete Testphase.
        </p>
        <p>
          Zahlungen wickelt Paddle als Verkäufer im Rechtssinne ab: Paddle stellt in Rechnung,
          erhebt und führt die in Ihrem Land anfallende Umsatzsteuer ab und sendet Ihnen Beleg
          und Rechnung. Ihre Zahlungsdaten sehen und speichern wir nicht.
        </p>
        <p>
          Die Beträge lauten auf US-Dollar; Ihre Bank wendet ihren eigenen Umrechnungskurs an
          und kann Entgelte erheben, auf die wir keinen Einfluss haben. Ein Abonnement
          verlängert sich automatisch bis zur Kündigung; der lebenslange Zugang ist eine
          Einmalzahlung ohne Verlängerung.
        </p>
        <p>
          Wir können Preise ändern. Eine Preisänderung gilt nie rückwirkend für einen bereits
          bezahlten Zeitraum, und bei einem laufenden Abonnement informieren wir Sie vor der
          betroffenen Fälligkeit.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Rückerstattungen',
    body: (
      <p>
        Vierzehn Tage ab Kauf, nach den Bedingungen unserer{' '}
        <Link href="/de/rueckerstattung">Rückerstattungsrichtlinie</Link>, die Bestandteil
        dieser AGB ist. Ihr gesetzliches Widerrufsrecht als Verbraucher bleibt davon
        unberührt und wird durch dieses Dokument nicht eingeschränkt.
      </p>
    ),
  },
  {
    id: 'your-content',
    title: 'Ihre Inhalte',
    body: (
      <>
        <p>
          <strong>Was Sie schreiben, gehört Ihnen.</strong> Wir beanspruchen keinerlei
          Eigentum an den Inhalten Ihrer Lebensläufe, und das exportierte PDF ist Ihres, ohne
          Nutzungsbeschränkung.
        </p>
        <p>
          Sie räumen uns ausschließlich die technische Lizenz ein, die der Betrieb erfordert:
          Ihre Inhalte zu speichern, in Ihrem Browser anzuzeigen, als PDF zu setzen und —
          ausschließlich dann, wenn Sie einen Freigabelink aktivieren — unter der zugehörigen
          Adresse abrufbar zu machen.
        </p>
        <p>
          Sie sichern zu, dass die eingegebenen Angaben Sie zutreffend beschreiben und dass
          Sie zu ihrer Verwendung berechtigt sind. Kontaktdaten von Referenzen gehören nur mit
          deren Einverständnis hinein und sollten nie über einen Freigabelink veröffentlicht
          werden.
        </p>
      </>
    ),
  },
  {
    id: 'our-content',
    title: 'Unsere Vorlagen und die Website',
    body: (
      <>
        <p>
          Vorlagen, Code, Texte und Grafiken der Website gehören uns oder sind uns lizenziert.
          Ihr Tarif berechtigt Sie, die Vorlagen für eigene Dokumente zu nutzen, auch
          beruflich: Ein hier erstellter Lebenslauf darf an Arbeitgeber gesendet, auf Ihrer
          Website veröffentlicht oder gedruckt werden, ohne weitere Vergütung.
        </p>
        <p>
          Nicht umfasst ist: die Vorlagen als Vorlagen weiterzugeben oder zu verkaufen, sie in
          ein konkurrierendes Produkt zu integrieren oder Inhalte der Website in großem
          Umfang auszulesen und erneut zu veröffentlichen.
        </p>
        <p>
          Die im Editor angebotenen Schriften stehen unter ihren eigenen offenen Lizenzen, die
          die oben beschriebene dokumentarische Nutzung erlauben.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Zulässige Nutzung',
    body: (
      <>
        <p>Sie verpflichten sich, den Dienst nicht zu nutzen, um:</p>
        <ul>
          <li>
            ein täuschendes Dokument zu erzeugen — falsche Identität, nicht erworbener
            Abschluss, erfundene Erfahrung zur arglistigen Erlangung einer Stelle;
          </li>
          <li>
            rechtswidrige, ehrverletzende oder rechteverletzende Inhalte zu speichern oder zu
            verbreiten;
          </li>
          <li>
            auf das Konto oder die Dokumente anderer zuzugreifen, Nutzungsgrenzen oder
            Authentifizierung zu umgehen;
          </li>
          <li>
            den Dienst automatisiert unverhältnismäßig zu belasten oder seine Inhalte
            systematisch abzugreifen;
          </li>
          <li>den Zugang weiterzuverkaufen oder Dritten als eigenen Dienst anzubieten.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Verfügbarkeit und Änderungen',
    body: (
      <>
        <p>
          Wir streben durchgehende Verfügbarkeit an, ohne sie vertraglich zuzusichern: Es gibt
          keine Service-Level-Zusage, und Wartungsfenster oder der Ausfall eines Dienstleisters
          bleiben möglich.
        </p>
        <p>
          Das Produkt entwickelt sich weiter. Vorlagen und Funktionen kommen hinzu, einzelne
          können entfallen. Entfällt eine Funktion, die Teil eines von Ihnen bezahlten Tarifs
          war, informieren wir Sie und bieten bei wesentlichen Änderungen eine Lösung an —
          anteilige Erstattung oder gleichwertigen Ersatz.
        </p>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Sperrung und Beendigung',
    body: (
      <>
        <p>
          Sie können die Nutzung jederzeit einstellen und die Löschung Ihres Kontos in den
          Einstellungen beantragen.
        </p>
        <p>
          Wir können ein Konto sperren oder schließen bei erheblichem Verstoß gegen den
          Abschnitt „Zulässige Nutzung“, bei Zahlungsbetrug oder bei einer Nutzung, die die
          Sicherheit des Dienstes gefährdet. Außer wo Gesetz oder laufende Ermittlungen
          entgegenstehen, nennen wir den Grund und ermöglichen den Export der betroffenen
          Dokumente.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Gewährleistungsausschluss',
    body: (
      <>
        <p>
          Der Dienst wird „wie besehen“ bereitgestellt. Wir sichern weder Fehlerfreiheit noch
          unterbrechungsfreie Verfügbarkeit zu.
        </p>
        <p>
          Insbesondere, weil man uns diese Zusage am ehesten unterstellt: Der ATS-Score ist
          unsere eigene Bewertung der Layout-Eigenschaften einer Vorlage. Es gibt zahlreiche
          Bewerbermanagementsysteme, sie verhalten sich unterschiedlich, und wir können nicht
          garantieren, dass ein bestimmter Lebenslauf von einem bestimmten System korrekt
          ausgelesen wird.
        </p>
        <p>
          Zwingende gesetzliche Gewährleistungsrechte, die Ihnen als Verbraucher zustehen,
          bleiben unberührt.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Haftungsbeschränkung',
    body: (
      <>
        <p>
          Soweit gesetzlich zulässig, ist unsere Gesamthaftung aus dem Dienst auf den Betrag
          begrenzt, den Sie uns in den zwölf Monaten vor dem schädigenden Ereignis
          tatsächlich gezahlt haben.
        </p>
        <p>
          Für mittelbare Schäden — insbesondere eine nicht erhaltene Stelle, eine
          aussortierte Bewerbung oder entgangenen Gewinn — haften wir nicht.
        </p>
        <p>
          Unberührt bleibt die Haftung bei Vorsatz und grober Fahrlässigkeit, bei Verletzung
          von Leben, Körper und Gesundheit sowie in allen weiteren Fällen, in denen das Gesetz
          eine Beschränkung untersagt.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Ihre Verantwortung uns gegenüber',
    body: (
      <p>
        Nimmt ein Dritter uns wegen eines von Ihnen eingegebenen oder über einen Freigabelink
        veröffentlichten Inhalts oder wegen einer diesen Bedingungen widersprechenden Nutzung
        in Anspruch, stellen Sie uns von den angemessenen Folgen frei.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Anwendbares Recht und Streitigkeiten',
    body: (
      <>
        <p>
          Es gilt das Recht des Königreichs Marokko, wo der Betreiber ansässig ist;
          Gerichtsstand ist {site.contactAddress.locality}.
        </p>
        <p>
          Diese Klausel nimmt Ihnen nicht den zwingenden Verbraucherschutz Ihres
          Wohnsitzlandes: Als Verbraucher in der EU können Sie weiterhin die Gerichte an Ihrem
          Wohnsitz anrufen.
        </p>
        <p>
          Schreiben Sie vor jedem Verfahren an{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. Die allermeisten
          Meinungsverschiedenheiten klären sich mit einer Nachricht.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Änderungen dieser Bedingungen',
    body: (
      <p>
        Wir können diese Bedingungen ändern, wenn sich der Dienst weiterentwickelt. Das Datum
        der letzten Aktualisierung steht oben. Wesentliche Änderungen teilen wir vorab per
        E-Mail oder im Produkt mit; die weitere Nutzung nach diesem Zeitpunkt gilt als
        Zustimmung.
      </p>
    ),
  },
];

export default function GermanTermsPage() {
  return (
    <LegalDocument
      locale="de"
      title="Allgemeine Geschäftsbedingungen"
      intro={`Was ${site.name} leistet, was Sie mit der Nutzung akzeptieren und was gilt, wenn etwas nicht funktioniert.`}
      summary={[
        <>Die Inhalte Ihrer Lebensläufe gehören Ihnen. Wir beanspruchen daran nichts.</>,
        <>
          Die Vorlagen dürfen Sie für eigene Dokumente nutzen, auch beruflich — aber nicht als
          Vorlagen weitergeben.
        </>,
        <>
          Zahlungen laufen über Paddle als Verkäufer im Rechtssinne, samt Umsatzsteuer. Ihre
          Karte sehen wir nie.
        </>,
        <>
          Vierzehn Tage Rückerstattung, und Ihre gesetzlichen Verbraucherrechte kommen
          obendrauf.
        </>,
        <>
          Wir garantieren nicht, dass ein bestimmtes Bewerbermanagementsystem Ihren
          Lebenslauf korrekt ausliest. Das kann niemand seriös.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Datenschutzerklärung', href: '/de/datenschutz' },
        { label: 'Cookie-Richtlinie', href: '/de/cookies' },
        { label: 'Rückerstattung', href: '/de/rueckerstattung' },
      ]}
    />
  );
}
