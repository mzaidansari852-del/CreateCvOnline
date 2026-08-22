import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie-Richtlinie',
  description: `Welche Cookies und welchen lokalen Speicher ${site.name} verwendet: welche, wozu, wie lange und wie Sie sie abschalten.`,
  path: '/de/cookies',
  locale: 'de',
});

/** Rendered inside `Prose`, so the plain table below picks up its own styling. */
function CookieTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { name: string; purpose: string; type: string; duration: string }[];
}) {
  return (
    // `overflow-x-auto` on the wrapper: four columns of prose cannot fit a 360px screen,
    // and the alternative to a scrolling table is a horizontally scrolling document.
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-ink-50">
          <tr>
            {['Name', 'Zweck', 'Art', 'Laufzeit'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="border-b border-ink-200 px-4 py-2.5 font-semibold text-ink-950"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-ink-100 last:border-0">
              <th scope="row" className="px-4 py-2.5 align-top font-mono text-[13px] text-ink-900">
                {row.name}
              </th>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.purpose}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.type}</td>
              <td className="px-4 py-2.5 align-top text-ink-700">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: 'summary',
    title: 'Worum es auf dieser Seite geht',
    body: (
      <>
        <p>
          Eine Aufstellung von allem, was {site.domain} in Ihrem Browser ablegen kann: Cookies,
          aber auch lokaler Speicher, der kein Cookie ist und in den meisten Richtlinien
          unerwähnt bleibt.
        </p>
        <p>
          Das Prinzip ist einfach: ein technisch notwendiges Cookie für die Anmeldung, ein
          Cookie für die Sprachwahl, und sonst nichts, solange Sie das Zahlungsfenster nicht
          öffnen. Die Reichweitenmessung ist freiwillig und nur aktiv, wenn der Betreiber sie
          konfiguriert hat.
        </p>
        <p>
          Wir setzen keine Werbe-Cookies, keine Social-Media-Pixel und keine
          seitenübergreifenden Tracker. Deshalb gibt es hier auch kein Consent-Banner: Es
          gäbe nichts abzulehnen.
        </p>
      </>
    ),
  },
  {
    id: 'essential',
    title: 'Das Sitzungs-Cookie',
    body: (
      <>
        <p>
          <code>__session</code> ist das einzige unverzichtbare Cookie. Es enthält ein
          Firebase-Sitzungstoken und lässt den Server erkennen, dass die Anfrage von Ihnen
          stammt. Ohne es bleiben Sie nicht angemeldet: Jede Seite würde erneut nach Ihren
          Zugangsdaten fragen.
        </p>
        <p>
          Es ist als <code>httpOnly</code> gesetzt, kann also von keinem Skript der Seite
          gelesen werden, und wird beim Abmelden gelöscht. Es dient keiner Messung und keinem
          Profiling.
        </p>
        <p>
          Da es für einen von Ihnen ausdrücklich angeforderten Dienst unbedingt erforderlich
          ist, fällt es unter die Einwilligungsausnahme des § 25 Abs. 2 TDDDG.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analyse-Cookies (freiwillig)',
    body: (
      <>
        <p>
          Hat der Betreiber dieses Deployments eine Google-Analytics-Mess-ID konfiguriert,
          werden die Cookies <code>_ga</code> und <code>_ga_&lt;id&gt;</code> gesetzt. Sie
          zählen Besuche und unterscheiden einen Browser vom anderen.
        </p>
        <p>
          Für den Betrieb des Dienstes sind sie nicht erforderlich. Sie können sie über die
          Einstellungen Ihres Browsers, eine Blocker-Erweiterung oder das
          „Do Not Track“-Signal ablehnen.
        </p>
        <p>
          Die Inhalte Ihrer Lebensläufe werden nie an ein Analysewerkzeug übermittelt.
          Gemessen werden aufgerufene Seiten, keine Dokumente.
        </p>
      </>
    ),
  },
  {
    id: 'paddle',
    title: 'Paddle-Cookies während der Zahlung',
    body: (
      <>
        <p>
          Von Paddle läuft nichts, solange Sie das Zahlungsfenster nicht öffnen. Dann wird das
          Skript von Paddle auf unserer Seite geladen, und sein Kartenformular erscheint in
          einem iframe von der Domain von Paddle.
        </p>
        <p>
          Paddle setzt dabei eigene Cookies für den Transaktionsverlauf und seine
          Betrugsprüfung. Wir können sie weder lesen noch steuern; Laufzeit und Zweck richten
          sich nach der Richtlinie von Paddle, das hier für die eigene Rechnungsstellung
          selbst Verantwortlicher ist.
        </p>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'Lokaler Speicher, der kein Cookie ist',
    body: (
      <>
        <p>
          Zwei Dinge liegen im <code>localStorage</code> Ihres Browsers statt in einem Cookie.
          Der Unterschied ist wesentlich: Inhalte des <code>localStorage</code> werden nie an
          den Server gesendet, sie bleiben auf Ihrem Gerät.
        </p>
        <ul>
          <li>Ihre Voreinstellungen für neue Lebensläufe — Papierformat und Vorlage.</li>
          <li>
            Eine Sicherungskopie des gerade bearbeiteten Lebenslaufs, geschrieben, wenn ein
            Speichern fehlschlägt, damit Ihre Arbeit bei einem Verbindungsabbruch nicht
            verloren geht. Sie wird beim nächsten Öffnen angeboten und danach gelöscht.
          </li>
        </ul>
        <p>
          Das Löschen der Websitedaten im Browser entfernt beides. Ihr serverseitig
          gespeicherter Lebenslauf bleibt davon unberührt.
        </p>
      </>
    ),
  },
  {
    id: 'table',
    title: 'Die vollständige Liste',
    body: (
      <>
        <p>
          Alles, was die Website in Ihrem Browser ablegen kann, in einer Tabelle.{' '}
          {site.domain} setzt nichts darüber hinaus.
        </p>
        <CookieTable
          caption="Alle Cookies und Speichereinträge dieser Website mit Zweck, Art und Laufzeit"
          rows={[
            {
              name: '__session',
              purpose:
                'Hält Sie angemeldet. Enthält ein Firebase-Sitzungstoken, das bei jedem Server-Rendering und jedem API-Aufruf geprüft wird.',
              type: 'Eigenes Cookie · unbedingt erforderlich · httpOnly',
              duration:
                'SESSION_COOKIE_DAYS, standardmäßig 5 Tage (maximal 14). Beim Abmelden gelöscht.',
            },
            {
              name: 'cvo_locale',
              purpose:
                'Merkt sich, in welcher Sprache Sie die Website lesen, damit eine Registrierung von einer deutschen Seite aus nicht in einem englischen Kontobereich endet. Wird nur bei einer Navigation zu einer übersetzten Seite und nur bei Änderung geschrieben. Enthält ausschließlich ein Sprachkürzel.',
              type: 'Eigenes Cookie · funktional · von Seitenskripten lesbar',
              duration: '1 Jahr',
            },
            {
              name: '_ga',
              purpose:
                'Google Analytics: unterscheidet einen Browser vom anderen. Nur vorhanden, wenn der Betreiber eine Mess-ID konfiguriert hat.',
              type: 'Eigenes Cookie · Reichweitenmessung · freiwillig',
              duration: 'Google-Standard, etwa 2 Jahre',
            },
            {
              name: '_ga_<Mess-ID>',
              purpose:
                'Google Analytics: hält den Sitzungsstatus der Messung. Nur vorhanden, wenn der Betreiber eine Mess-ID konfiguriert hat.',
              type: 'Eigenes Cookie · Reichweitenmessung · freiwillig',
              duration: 'Google-Standard, etwa 2 Jahre',
            },
            {
              name: 'Paddle-Cookies',
              purpose:
                'Von Paddle gesetzt, sobald Sie das Zahlungsfenster öffnen: Transaktionsverlauf, Betrugs- und Risikoprüfung. Das Skript von Paddle läuft auf unseren Seiten, sein Formular ist ein iframe auf seiner Domain — die Cookies können daher unter beiden Domains erscheinen. Wir können sie weder lesen noch steuern.',
              type: 'Cookies Dritter, von Paddle gesetzt · erst nach Öffnen der Zahlung',
              duration: 'Von Paddle bestimmt',
            },
            {
              name: 'createcvonline:preferences',
              purpose:
                'Kein Cookie. Ein localStorage-Eintrag mit Ihrem Standard-Papierformat und der vorausgewählten Vorlage. Wird nie mit einer Netzwerkanfrage gesendet.',
              type: 'localStorage · eigen · funktional',
              duration: 'Bis Sie die Websitedaten dieser Domain löschen',
            },
          ]}
        />
        <p>
          Ein verwandter Hinweis, der kein Cookie ist: Die Oberfläche und die
          Lebenslauf-Vorlagen laden ihre Schriften von Google Fonts, Ihr Browser kontaktiert
          beim Seitenaufruf also Google. Diese Anfrage setzt kein Cookie auf unserer Domain,
          ist aber eine Verbindung zu einem Dritten und deshalb der Vollständigkeit halber in
          der <Link href="/de/datenschutz">Datenschutzerklärung</Link> aufgeführt.
        </p>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Wie Sie sie steuern',
    body: (
      <>
        <p>
          Jeder Browser erlaubt es, Cookies einer Website anzusehen, zu blockieren und zu
          löschen — meist über das Symbol links neben der Adresse oder in den
          Datenschutzeinstellungen.
        </p>
        <p>
          Ein nützlicher Hinweis: <code>__session</code> zu blockieren meldet Sie ab und
          verhindert jede erneute Anmeldung, denn dieses Cookie trägt Ihre Sitzung.
          Analyse-Cookies zu blockieren hat dagegen keinerlei Auswirkung auf den Dienst.
        </p>
        <p>
          Speziell für die Reichweitenmessung bietet Google ein Deaktivierungs-Add-on an; die
          gängigen Inhaltsblocker erledigen das ebenfalls.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Änderungen dieser Richtlinie',
    body: (
      <p>
        Ergänzen oder entfernen wir etwas aus der obigen Liste, wird dieses Dokument mit der
        Änderung aktualisiert, nicht danach. Das Datum der letzten Aktualisierung steht oben
        auf der Seite.
      </p>
    ),
  },
];

export default function GermanCookiePolicyPage() {
  return (
    <LegalDocument
      locale="de"
      title="Cookie-Richtlinie"
      intro={`Alles, was ${site.domain} in Ihrem Browser ablegen kann, wozu und für wie lange.`}
      summary={[
        <>
          Ein unbedingt erforderliches Cookie für die Anmeldung, ein Sprach-Cookie, sonst
          nichts.
        </>,
        <>
          Keine Werbe-Cookies, keine Social-Media-Pixel, keine seitenübergreifenden Tracker —
          deshalb auch kein Consent-Banner.
        </>,
        <>Cookies von Paddle erscheinen erst, wenn Sie das Zahlungsfenster öffnen.</>,
        <>Die Inhalte Ihrer Lebensläufe gehen an kein Analysewerkzeug.</>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Datenschutzerklärung', href: '/de/datenschutz' },
        { label: 'AGB', href: '/de/agb' },
        { label: 'Rückerstattung', href: '/de/rueckerstattung' },
      ]}
    />
  );
}
