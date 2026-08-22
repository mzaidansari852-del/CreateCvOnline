import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Cookiebeleid',
  description: `Welke cookies en welke lokale opslag ${site.name} gebruikt: welke, waarvoor, hoe lang en hoe je ze uitzet.`,
  path: '/nl/cookies',
  locale: 'nl',
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
    // `overflow-x-auto` on the wrapper: four columns of prose cannot fit a 360px screen, and
    // the alternative to a scrolling table is a horizontally scrolling document.
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-ink-50">
          <tr>
            {['Naam', 'Doel', 'Soort', 'Bewaartermijn'].map((heading) => (
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
    title: 'Waar deze pagina over gaat',
    body: (
      <>
        <p>
          Een overzicht van alles wat {site.domain} in je browser kan zetten: cookies, maar ook
          lokale opslag, die geen cookie is en die de meeste beleidsstukken onvermeld laten.
        </p>
        <p>
          Het uitgangspunt is eenvoudig: één strikt noodzakelijk cookie om ingelogd te blijven,
          één cookie voor je taalkeuze, en verder niets zolang je het betaalvenster niet opent.
          Bezoekersstatistieken zijn optioneel en alleen actief als de exploitant ze heeft
          ingesteld.
        </p>
        <p>
          We gebruiken geen advertentiecookies, geen social-mediapixels en geen trackers over
          sites heen. Daarom staat er ook geen cookiebanner op deze site: er zou niets te
          weigeren zijn.
        </p>
      </>
    ),
  },
  {
    id: 'essential',
    title: 'Het sessiecookie',
    body: (
      <>
        <p>
          <code>__session</code> is het enige onmisbare cookie. Het bevat een
          Firebase-sessietoken waarmee de server weet dat het verzoek van jou komt. Zonder dat
          blijf je niet ingelogd: elke pagina zou opnieuw om je gegevens vragen.
        </p>
        <p>
          Het is gemarkeerd als <code>httpOnly</code>, dus geen enkel script op de pagina kan
          het lezen, en het wordt verwijderd zodra je uitlogt. Het dient geen enkele meting en
          geen profilering.
        </p>
        <p>
          Omdat het strikt noodzakelijk is voor een dienst die je uitdrukkelijk hebt gevraagd,
          valt het onder de uitzondering op de toestemmingsplicht in artikel 11.7a van de
          Telecommunicatiewet.
        </p>
      </>
    ),
  },
  {
    id: 'analytics',
    title: 'Analytische cookies (optioneel)',
    body: (
      <>
        <p>
          Heeft de exploitant van deze omgeving een Google Analytics-meet-id ingesteld, dan
          worden de cookies <code>_ga</code> en <code>_ga_&lt;id&gt;</code> geplaatst. Ze tellen
          bezoeken en onderscheiden de ene browser van de andere.
        </p>
        <p>
          Voor het werken van de dienst zijn ze niet nodig. Je weigert ze via de instellingen
          van je browser, een blokkeerextensie, of het “Do Not Track”-signaal als je browser dat
          stuurt.
        </p>
        <p>
          De inhoud van je cv’s gaat nooit naar een statistiektool. Wat gemeten wordt zijn
          bekeken pagina’s, geen documenten.
        </p>
      </>
    ),
  },
  {
    id: 'paddle',
    title: 'Paddle-cookies tijdens het betalen',
    body: (
      <>
        <p>
          Van Paddle draait er niets zolang je het betaalvenster niet opent. Op dat moment wordt
          het script van Paddle op onze pagina geladen en verschijnt zijn kaartformulier in een
          iframe vanaf het domein van Paddle.
        </p>
        <p>
          Paddle plaatst dan zijn eigen cookies, voor het volgen van de transactie en zijn
          fraudecontroles. Wij kunnen ze niet lezen en niet sturen; hun duur en doel vallen
          onder het beleid van Paddle, dat hier voor zijn eigen facturatie zelf
          verwerkingsverantwoordelijke is.
        </p>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'Lokale opslag, die geen cookie is',
    body: (
      <>
        <p>
          Twee dingen staan in de <code>localStorage</code> van je browser in plaats van in een
          cookie. Dat verschil is belangrijk: wat in <code>localStorage</code> staat wordt nooit
          naar de server gestuurd, het blijft op je apparaat.
        </p>
        <ul>
          <li>Je standaardinstellingen voor een nieuw cv — papierformaat en gekozen sjabloon.</li>
          <li>
            Een reservekopie van het cv dat je aan het bewerken bent, weggeschreven wanneer
            opslaan mislukt, zodat je je werk niet kwijtraakt als de verbinding wegvalt. Die
            wordt je bij het opnieuw openen aangeboden en daarna gewist.
          </li>
        </ul>
        <p>
          Sitegegevens wissen in je browser verwijdert allebei. Je cv dat op de server staat
          blijft ongemoeid.
        </p>
      </>
    ),
  },
  {
    id: 'table',
    title: 'De volledige lijst',
    body: (
      <>
        <p>
          Alles wat de site in je browser kan opslaan, in één tabel. {site.domain} plaatst
          verder niets.
        </p>
        <CookieTable
          caption="Elk cookie en opslagitem dat deze site gebruikt, met doel, soort en bewaartermijn"
          rows={[
            {
              name: '__session',
              purpose:
                'Houdt je ingelogd. Bevat een Firebase-sessietoken dat bij elke serverrendering en elke API-aanroep wordt gecontroleerd.',
              type: 'Eigen cookie · strikt noodzakelijk · httpOnly',
              duration:
                'SESSION_COOKIE_DAYS, standaard 5 dagen (maximaal 14). Verwijderd bij uitloggen.',
            },
            {
              name: 'cvo_locale',
              purpose:
                'Onthoudt in welke taal je de site leest, zodat registreren vanaf een Nederlandse pagina je niet in een Engelse omgeving laat belanden. Wordt alleen geschreven bij een navigatie naar een vertaalde pagina en alleen als de waarde verandert. Bevat niets anders dan een taalcode.',
              type: 'Eigen cookie · functioneel · leesbaar voor scripts op de pagina',
              duration: '1 jaar',
            },
            {
              name: '_ga',
              purpose:
                'Google Analytics: onderscheidt de ene browser van de andere. Alleen aanwezig als de exploitant een meet-id heeft ingesteld.',
              type: 'Eigen cookie · statistieken · optioneel',
              duration: 'Standaard van Google, ongeveer 2 jaar',
            },
            {
              name: '_ga_<meet-id>',
              purpose:
                'Google Analytics: houdt de sessiestatus van de meting bij. Alleen aanwezig als de exploitant een meet-id heeft ingesteld.',
              type: 'Eigen cookie · statistieken · optioneel',
              duration: 'Standaard van Google, ongeveer 2 jaar',
            },
            {
              name: 'Paddle-cookies',
              purpose:
                'Door Paddle geplaatst zodra je het betaalvenster opent: voortgang van de transactie, fraude- en risicocontroles. Het script van Paddle draait op onze pagina’s en zijn formulier is een iframe op zijn eigen domein, dus deze cookies kunnen onder beide domeinen verschijnen. Wij kunnen ze niet lezen en niet sturen.',
              type: 'Cookies van derden, door Paddle geplaatst · pas na het openen van de betaling',
              duration: 'Bepaald door Paddle',
            },
            {
              name: 'createcvonline:preferences',
              purpose:
                'Dit is geen cookie. Een localStorage-item met je standaard papierformaat en je voorgekozen sjabloon. Wordt nooit in een netwerkverzoek meegestuurd.',
              type: 'localStorage · eigen · functioneel',
              duration: 'Tot je de sitegegevens voor dit domein wist',
            },
          ]}
        />
        <p>
          Een verwant detail dat geen cookie is: de interface en de cv-sjablonen halen hun
          lettertypen bij Google Fonts, dus je browser neemt bij het laden van een pagina
          contact op met Google. Dat verzoek plaatst geen cookie op ons domein, maar het is een
          verbinding met een derde partij en staat daarom voor de volledigheid ook in de{' '}
          <Link href="/nl/privacy">privacyverklaring</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Hoe je ze beheert',
    body: (
      <>
        <p>
          Elke browser laat je de cookies van een site bekijken, blokkeren en verwijderen,
          meestal via het pictogram links van de adresbalk of in de privacyinstellingen.
        </p>
        <p>
          Eén nuttige waarschuwing: <code>__session</code> blokkeren logt je uit en maakt opnieuw
          inloggen onmogelijk, want dat cookie draagt je sessie. Analytische cookies blokkeren
          heeft daarentegen geen enkel effect op de werking van de dienst.
        </p>
        <p>
          Speciaal voor de statistieken biedt Google een opt-outextensie aan, en de gangbare
          contentblockers regelen het ook.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Wijzigingen in dit beleid',
    body: (
      <p>
        Voegen we iets toe aan de lijst hierboven of halen we er iets af, dan wordt dit document
        tegelijk met die wijziging bijgewerkt, niet erna. De datum van de laatste wijziging staat
        boven aan de pagina.
      </p>
    ),
  },
];

export default function DutchCookiePolicyPage() {
  return (
    <LegalDocument
      locale="nl"
      title="Cookiebeleid"
      intro={`Alles wat ${site.domain} in je browser kan zetten, waarvoor, en hoe lang.`}
      summary={[
        <>
          Eén strikt noodzakelijk cookie om in te loggen, één taalcookie, en verder niets
          standaard.
        </>,
        <>
          Geen advertentiecookies, geen social-mediapixels, geen trackers over sites heen —
          vandaar geen cookiebanner.
        </>,
        <>Cookies van Paddle verschijnen pas als je het betaalvenster opent.</>,
        <>De inhoud van je cv’s gaat naar geen enkele statistiektool.</>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacyverklaring', href: '/nl/privacy' },
        { label: 'Algemene voorwaarden', href: '/nl/voorwaarden' },
        { label: 'Terugbetalingsbeleid', href: '/nl/terugbetaling' },
      ]}
    />
  );
}
