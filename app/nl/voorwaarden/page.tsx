import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Algemene voorwaarden',
  description: `De gebruiksvoorwaarden van ${site.name}: wat de dienst doet, de abonnementen en betaling, de rechten op je inhoud en de grenzen van onze aansprakelijkheid.`,
  path: '/nl/voorwaarden',
  locale: 'nl',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Deze overeenkomst',
    body: (
      <>
        <p>
          Door een account aan te maken of {site.name} te gebruiken op {site.domain} ga je
          akkoord met deze voorwaarden. Ga je er niet mee akkoord, gebruik de dienst dan niet —
          een ander gevolg is er niet.
        </p>
        <p>
          Samen met de <Link href="/nl/privacy">privacyverklaring</Link>, het{' '}
          <Link href="/nl/cookies">cookiebeleid</Link> en het{' '}
          <Link href="/nl/terugbetaling">terugbetalingsbeleid</Link> vormen ze de volledige
          overeenkomst tussen jou en de exploitant van de dienst.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'Wat de dienst is',
    body: (
      <>
        <p>
          {site.name} is gereedschap om een document mee te maken. Je zet je loopbaan in
          gestructureerde velden, geeft die vorm met sjablonen en exporteert het resultaat als
          pdf.
        </p>
        <p>
          Het is geen uitzendbureau, geen werving-en-selectiebureau en geen vacaturebank. We
          sturen je cv naar geen enkele werkgever, bieden het aan geen enkele recruiter aan, en
          garanderen uiteraard geen enkel resultaat bij je sollicitaties.
        </p>
        <p>
          De redactionele aanwijzingen op de site — de ATS-score, de schrijftips, de opmerkingen
          over wat een Nederlands cv verwacht — zijn onderbouwde meningen, geen persoonlijk
          loopbaanadvies.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Je account',
    body: (
      <>
        <p>
          Je moet minstens zestien zijn om een account aan te maken. Je bent verantwoordelijk
          voor de juistheid van het e-mailadres dat je opgeeft en voor het geheimhouden van je
          inloggegevens; laat het ons meteen weten bij een vermoeden van ongeoorloofde toegang.
        </p>
        <p>
          Een account is persoonlijk. Een betaald account delen met meerdere mensen is in strijd
          met deze voorwaarden, al was het maar omdat de gebruikslimieten per account worden
          berekend.
        </p>
        <p>
          Je e-mailadres bevestigen is sterk aan te raden en blokkeert niets in de editor: het
          is de enige weg terug als je je wachtwoord vergeet.
        </p>
      </>
    ),
  },
  {
    id: 'plans',
    title: 'Abonnementen, prijzen en betaling',
    body: (
      <>
        <p>
          De abonnementen staan op de pagina <Link href="/nl/prijzen">prijzen</Link>. Met het
          gratis abonnement maak je een cv, geef je het vorm en download je de pdf met de
          gratis sjablonen, zonder creditcard en zonder aflopende proefperiode.
        </p>
        <p>
          Betalingen lopen via Paddle, dat optreedt als verkoper in juridische zin: Paddle
          factureert, int en draagt de btw af die in jouw land geldt, en stuurt je de bon en de
          factuur. Wij zien noch bewaren je betaalgegevens.
        </p>
        <p>
          De bedragen luiden in Amerikaanse dollars; je bank hanteert zijn eigen wisselkoers en
          kan kosten rekenen waar wij buiten staan. Een abonnement verlengt automatisch tot je
          opzegt; levenslange toegang is een eenmalige betaling zonder verlenging.
        </p>
        <p>
          We kunnen onze prijzen aanpassen. Een prijswijziging werkt nooit terug op een reeds
          betaalde periode, en bij een lopend abonnement laten we het je weten vóór de
          betreffende vervaldatum.
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Terugbetalingen',
    body: (
      <p>
        Veertien dagen vanaf de aankoop, onder de voorwaarden van ons{' '}
        <Link href="/nl/terugbetaling">terugbetalingsbeleid</Link>, dat onderdeel is van deze
        voorwaarden. Woon je in de EU, dan geldt je wettelijke herroepingsrecht sowieso en wordt
        dat door dit document niet beperkt.
      </p>
    ),
  },
  {
    id: 'your-content',
    title: 'Jouw inhoud',
    body: (
      <>
        <p>
          <strong>Wat je schrijft is van jou.</strong> We claimen geen enkel eigendomsrecht op
          de inhoud van je cv’s, en de pdf die je exporteert is van jou, zonder beperking op het
          gebruik.
        </p>
        <p>
          Je geeft ons uitsluitend de technische licentie die het draaien van de dienst vraagt:
          je inhoud opslaan, in je browser tonen, tot pdf opmaken en — alleen als je zelf een
          deellink aanzet — bereikbaar maken op het bijbehorende adres.
        </p>
        <p>
          Je staat ervoor in dat wat je invult over jou klopt en dat je het mag gebruiken.
          Contactgegevens van een referent horen er alleen in met diens toestemming, en zouden
          nooit via een deellink openbaar moeten worden gemaakt.
        </p>
      </>
    ),
  },
  {
    id: 'our-content',
    title: 'Onze sjablonen en de site',
    body: (
      <>
        <p>
          De sjablonen, de code, de teksten en de beelden van de site zijn van ons of aan ons
          gelicentieerd. Je abonnement geeft je het recht de sjablonen te gebruiken voor je
          eigen documenten, ook zakelijk: een hier gemaakt cv mag je naar een werkgever sturen,
          op je site zetten of afdrukken, zonder verdere vergoeding.
        </p>
        <p>
          Wat dat recht niet dekt: de sjablonen als sjablonen doorgeven of doorverkopen, ze in
          een concurrerend product opnemen, of de inhoud van de site grootschalig oogsten en
          opnieuw publiceren.
        </p>
        <p>
          De lettertypen in de editor worden geleverd onder hun eigen open licenties, die het
          hierboven beschreven gebruik in documenten toestaan.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Aanvaardbaar gebruik',
    body: (
      <>
        <p>Je gebruikt de dienst niet om:</p>
        <ul>
          <li>
            een misleidend document te maken — een valse identiteit, een niet-behaald diploma,
            verzonnen ervaring om een baan te krijgen op basis van bedrog;
          </li>
          <li>
            onrechtmatige, lasterlijke of inbreukmakende inhoud op te slaan of te verspreiden;
          </li>
          <li>
            toegang te krijgen tot het account of de documenten van iemand anders, of
            gebruikslimieten of authenticatie te omzeilen;
          </li>
          <li>
            de dienst onevenredig geautomatiseerd te belasten of de inhoud stelselmatig te
            scrapen;
          </li>
          <li>de toegang door te verkopen of aan derden als eigen dienst aan te bieden.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Beschikbaarheid en wijzigingen',
    body: (
      <>
        <p>
          We streven naar ononderbroken beschikbaarheid zonder die contractueel toe te zeggen:
          er is geen serviceniveau-afspraak, en onderhoud of een storing bij een leverancier
          blijft mogelijk.
        </p>
        <p>
          Het product ontwikkelt door. Er komen sjablonen en functies bij; enkele kunnen
          verdwijnen. Verdwijnt een functie die deel uitmaakte van een betaald abonnement dat je
          hebt afgerekend, dan laten we het je weten en bieden we bij een wezenlijke wijziging
          een oplossing — een evenredige terugbetaling of iets gelijkwaardigs.
        </p>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Opschorting en beëindiging',
    body: (
      <>
        <p>
          Je kunt op elk moment stoppen met de dienst en in de instellingen vragen om je account
          te verwijderen.
        </p>
        <p>
          Wij kunnen een account opschorten of sluiten bij een duidelijke schending van
          “Aanvaardbaar gebruik”, bij betaalfraude, of bij gebruik dat de veiligheid van de
          dienst in gevaar brengt. Behalve waar de wet of een lopend onderzoek dat verbiedt,
          noemen we de reden en geven we de gelegenheid de betrokken documenten te exporteren.
        </p>
      </>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Uitsluiting van garanties',
    body: (
      <>
        <p>
          De dienst wordt geleverd “zoals hij is”. We garanderen niet dat hij foutloos of
          ononderbroken beschikbaar is.
        </p>
        <p>
          In het bijzonder, omdat men ons deze garantie het snelst toedicht: de ATS-score is
          onze eigen beoordeling van de opmaakeigenschappen van een sjabloon. Er zijn veel
          Applicant Tracking Systems, ze gedragen zich verschillend, en we kunnen niet
          garanderen dat een bepaald cv door een bepaald systeem correct wordt uitgelezen.
        </p>
        <p>
          Deze uitsluitingen beperken de dwingende wettelijke garanties die je als consument
          hebt niet.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Beperking van aansprakelijkheid',
    body: (
      <>
        <p>
          Voor zover de wet dat toestaat, is onze totale aansprakelijkheid uit hoofde van de
          dienst beperkt tot het bedrag dat je ons in de twaalf maanden vóór de schadeveroorzakende
          gebeurtenis daadwerkelijk hebt betaald.
        </p>
        <p>
          Voor indirecte schade — met name een misgelopen baan, een afgewezen sollicitatie of
          gederfde winst — zijn we niet aansprakelijk.
        </p>
        <p>
          Niets in deze sectie sluit onze aansprakelijkheid uit bij opzet, bewuste roekeloosheid,
          letsel of overlijden, of in de overige gevallen waarin de wet uitsluiting verbiedt.
        </p>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Jouw verantwoordelijkheid tegenover ons',
    body: (
      <p>
        Spreekt een derde ons aan vanwege inhoud die jij hebt ingevoerd of via een deellink hebt
        gepubliceerd, of vanwege gebruik in strijd met deze voorwaarden, dan vrijwaar je ons voor
        de redelijke gevolgen daarvan.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Toepasselijk recht en geschillen',
    body: (
      <>
        <p>
          Op deze voorwaarden is het recht van het Koninkrijk Marokko van toepassing, waar de
          exploitant is gevestigd, en de rechtbanken van {site.contactAddress.locality} zijn
          bevoegd.
        </p>
        <p>
          Deze bepaling ontneemt je niet de dwingende consumentenbescherming van je woonland: ben
          je consument in de EU, dan houd je het recht de rechter van je woonplaats te adiëren.
        </p>
        <p>
          Mail ons vóór elke procedure op{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. Verreweg de meeste
          geschillen zijn met één bericht opgelost.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Wijzigingen in deze voorwaarden',
    body: (
      <p>
        We kunnen deze voorwaarden aanpassen wanneer de dienst verandert. De datum van de laatste
        wijziging staat boven aan de pagina. Een wezenlijke wijziging melden we vooraf per e-mail
        of in het product; de dienst na die datum blijven gebruiken geldt als aanvaarding.
      </p>
    ),
  },
];

export default function DutchTermsPage() {
  return (
    <LegalDocument
      locale="nl"
      title="Algemene voorwaarden"
      intro={`Wat ${site.name} levert, waar je mee akkoord gaat door het te gebruiken, en wat er geldt als iets niet werkt.`}
      summary={[
        <>De inhoud van je cv’s is van jou. Daar claimen wij niets op.</>,
        <>
          De sjablonen gebruik je voor je eigen documenten, ook zakelijk — maar je geeft ze niet
          door als sjablonen.
        </>,
        <>
          Betalingen lopen via Paddle als verkoper in juridische zin, inclusief btw. Je kaart
          zien we nooit.
        </>,
        <>
          Veertien dagen om je geld terug te krijgen, en je wettelijke consumentenrechten komen
          daar bovenop.
        </>,
        <>
          We garanderen niet dat een bepaald recruitmentsysteem je cv goed uitleest. Dat kan
          niemand eerlijk beloven.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Privacyverklaring', href: '/nl/privacy' },
        { label: 'Cookiebeleid', href: '/nl/cookies' },
        { label: 'Terugbetalingsbeleid', href: '/nl/terugbetaling' },
      ]}
    />
  );
}
