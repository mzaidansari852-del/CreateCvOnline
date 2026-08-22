import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacyverklaring',
  description: `Hoe ${site.name} je accountgegevens en cv-inhoud verzamelt, bewaart en verwijdert, welke verwerkers erbij betrokken zijn en hoe je je rechten uitoefent.`,
  path: '/nl/privacy',
  locale: 'nl',
});

/**
 * The Dutch privacy policy.
 *
 * Section ids match the English, French and German pages, so `/privacy#your-rights` and
 * `/nl/privacy#your-rights` land on the same clause — support answers questions with deep
 * links and does not know which language the reader is in.
 *
 * The vocabulary is the AVG's own Dutch: `verwerkingsverantwoordelijke`, `verwerker`,
 * `grondslag`, `gerechtvaardigd belang`. Someone checking their rights is looking for those
 * words, and a literal translation of the English terms would walk them past the section
 * they came for.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'scope',
    title: 'Wie we zijn en waar dit over gaat',
    body: (
      <>
        <p>
          Deze verklaring legt uit wat er met persoonsgegevens gebeurt wanneer je {site.name}{' '}
          gebruikt op {site.domain} (“de dienst”). Ze geldt voor de openbare website, de
          cv-editor, de pdf-export en je accountomgeving. Ze geldt niet voor andere websites
          die je via een link vanaf hier bereikt.
        </p>
        <p>
          In de zin van de AVG is de exploitant van {site.domain} de
          verwerkingsverantwoordelijke voor de gegevens die hieronder staan. Vragen, verzoeken
          en klachten gaan naar{' '}
          <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
        </p>
        <p>
          Eén opmerking die er hier toe doet: een cv is uitzonderlijk onthullend. Het bevat
          meestal je volledige naam, je contactgegevens, je loopbaan en je opleiding. We
          behandelen de inhoud van je documenten als het gevoeligste onderdeel van de hele
          dienst, en de secties hieronder zeggen precies wie erbij kan.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Wat we verzamelen',
    body: (
      <>
        <h3>Accountgegevens</h3>
        <p>
          Je e-mailadres, een weergavenaam als je die opgeeft, en de gebruikte inlogmethode.
          Log je in met Google, dan ontvangen we van Google je e-mailadres, je naam en de URL
          van je profielfoto.{' '}
          <strong>Je wachtwoord ontvangen of bewaren we nooit</strong> — het inloggen verloopt
          via Firebase Authentication, en wachtwoorden bereiken onze applicatiecode niet.
        </p>
        <h3>Cv-inhoud</h3>
        <p>
          Alles wat je in de editor typt: contactgegevens, werkervaring, opleiding,
          vaardigheden, talen, projecten en eigen secties, plus de opmaakinstellingen per
          document. Dat wordt bewaard zodat je het terugvindt, en voor niets anders.
        </p>
        <h3>Betaalgegevens</h3>
        <p>
          Koop je een abonnement, dan bewaren we het Paddle-transactienummer, het gekochte
          abonnement, het bedrag, de valuta, de status en het tijdstip.{' '}
          <strong>Je kaartnummer zien we nooit.</strong> Het betaalvenster opent over onze
          pagina heen, maar het formulier erin is een iframe van Paddle: kaartgegevens worden
          daar ingevoerd en volledig door Paddle verwerkt.
        </p>
        <h3>Technische en gebruiksgegevens</h3>
        <p>
          De serverzijdige registraties die het draaien en beveiligen van een webdienst
          vragen: het aantal cv’s in je account, je downloadteller van deze maand,
          tijdstempels en — voor snelheidsbegrenzing en misbruikpreventie — een kortlevende
          waarde afgeleid uit verzoek-headers. Berichten via het contactformulier bewaren we
          met het adres dat je daar opgeeft.
        </p>
      </>
    ),
  },
  {
    id: 'why',
    title: 'Waarom we ze verwerken, en op welke grondslag',
    body: (
      <>
        <p>
          Elke verwerking hier steunt op een van de grondslagen uit artikel 6 van de AVG:
        </p>
        <ul>
          <li>
            <strong>Uitvoering van de overeenkomst</strong> — je account aanmaken en bijhouden,
            je cv’s bewaren, je pdf’s maken, de grenzen van je abonnement toepassen en je
            betaling afhandelen. Zonder deze verwerkingen kan de dienst niet worden geleverd.
          </li>
          <li>
            <strong>Gerechtvaardigd belang</strong> — de dienst beveiligen, misbruik en fraude
            voorkomen, en technische logboeken bewaren zolang dat nodig is om een storing te
            onderzoeken. Het belang is een betrouwbaar werkende dienst; de inbreuk blijft
            klein omdat deze gegevens technisch en kortlevend zijn.
          </li>
          <li>
            <strong>Wettelijke verplichting</strong> — het bewaren van betaalstukken voor de
            wettelijk voorgeschreven termijn.
          </li>
          <li>
            <strong>Toestemming</strong> — producte-mails, waarvoor je je zelf aanmeldt en met
            één klik weer afmeldt, en analytische cookies als die op deze omgeving zijn
            ingeschakeld.
          </li>
        </ul>
        <p>
          We gebruiken de inhoud van je cv’s niet voor advertenties, verkopen die niet en
          bieden die aan geen enkele recruiter aan. Er bestaat geen kandidatendatabank.
        </p>
      </>
    ),
  },
  {
    id: 'processors',
    title: 'Wie er verder bij betrokken zijn',
    body: (
      <>
        <p>We schakelen een klein aantal verwerkers in, elk voor één duidelijke taak:</p>
        <ul>
          <li>
            <strong>Google Firebase</strong> (authenticatie, Firestore-database, bestandsopslag)
            — host je account, je cv’s en je profielfoto’s.
          </li>
          <li>
            <strong>Paddle</strong> — verkoper in juridische zin voor betalingen. Paddle
            verzamelt je betaalgegevens, berekent en draagt de btw af die in jouw land geldt,
            en geeft ons een transactienummer en een status door. Voor zijn eigen facturatie
            is Paddle zelf verwerkingsverantwoordelijke.
          </li>
          <li>
            <strong>Vercel</strong> — hosting van de applicatie en het uitleveringsnetwerk.
          </li>
          <li>
            <strong>Google Analytics</strong> — alleen als er op deze omgeving een meet-id is
            ingesteld. Zie het <Link href="/nl/cookies">cookiebeleid</Link>.
          </li>
        </ul>
        <p>
          Elk van hen is gebonden aan een verwerkersovereenkomst en mag de gegevens alleen
          verwerken voor de doelen die wij bepalen. Aan anderen geven we niets door, tenzij de
          wet ons daartoe verplicht.
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
          De dienst plaatst één strikt noodzakelijk sessiecookie, zonder welke je niet
          ingelogd kunt blijven, en één cookie voor je taalvoorkeur. Analytische cookies
          worden alleen geplaatst als analytics is ingesteld, en zijn optioneel.
        </p>
        <p>
          De volledige lijst — naam, doel, bewaartermijn en hoe je ze uitzet — staat in het{' '}
          <Link href="/nl/cookies">cookiebeleid</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Hoe lang we dingen bewaren',
    body: (
      <>
        <ul>
          <li>
            <strong>Account en cv’s</strong> — zolang het account bestaat. Documenten van een
            inactief account verwijderen we niet zonder je vooraf te waarschuwen.
          </li>
          <li>
            <strong>Betaalgeschiedenis</strong> — voor de wettelijke bewaartermijn, ook na het
            verwijderen van je account, omdat dat een wettelijke plicht is en geen keuze van
            ons.
          </li>
          <li>
            <strong>Contactberichten</strong> — vierentwintig maanden, daarna verwijderd. Lang
            genoeg om de context van een eerder gesprek terug te vinden, te kort om een archief
            te zijn.
          </li>
          <li>
            <strong>Technische logboeken en snelheidsbegrenzing</strong> — hooguit enkele
            dagen.
          </li>
        </ul>
        <p>
          Verwijder je een cv, dan gaat het uit de database; in de back-ups van onze hoster kan
          het nog kort bestaan tot die roteren.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Waar je gegevens worden verwerkt',
    body: (
      <>
        <p>
          Onze verwerkers draaien onder meer infrastructuur in de Verenigde Staten.
          Doorgiften buiten de EER steunen op de mechanismen uit hoofdstuk V van de AVG: het
          EU-VS-datenprivacyraamwerk waar de aanbieder daarvoor gecertificeerd is, en anders
          de modelcontractbepalingen van de Europese Commissie.
        </p>
        <p>
          We kunnen niet garanderen dat geen enkele buitenlandse autoriteit ooit een verzoek
          bij een van die aanbieders indient. Dat is een echte grens van wereldwijde
          infrastructuur, en we vinden het eerlijker die te benoemen dan te verzwijgen.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Beveiliging',
    body: (
      <>
        <p>
          Al het verkeer loopt uitsluitend over HTTPS. Wachtwoorden worden beheerd door
          Firebase Authentication en bereiken onze code nooit. De toegang tot je documenten
          wordt bovendien op databaseniveau beperkt door Firestore-beveiligingsregels die de
          identiteit van de aanvrager controleren — een fout in onze applicatiecode is dus niet
          genoeg om het cv van iemand anders bloot te leggen.
        </p>
        <p>
          Een openbare deellink, als je die aanmaakt, wijst naar een willekeurig, niet te raden
          adres dat zoekmachines niet indexeren. Wie de link heeft kan het document wel zien:
          verspreid hem niet ruimer dan nodig, en zet hem uit als hij zijn werk heeft gedaan.
        </p>
        <p>
          Geen enkele dienst is onaantastbaar. Bij een datalek met een risico voor je rechten
          en vrijheden informeren we jou en melden we het bij de bevoegde toezichthouder binnen
          de termijnen van de AVG.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Je rechten',
    body: (
      <>
        <p>De AVG geeft je de volgende rechten, die je op elk moment kunt uitoefenen:</p>
        <ul>
          <li>
            <strong>Inzage</strong> — een kopie van de gegevens die we over je hebben. De
            JSON-export in de instellingen beantwoordt dat meteen, zonder ons te mailen.
          </li>
          <li>
            <strong>Rectificatie</strong> — onjuiste gegevens corrigeren. De inhoud van je cv’s
            pas je rechtstreeks in de editor aan.
          </li>
          <li>
            <strong>Verwijdering</strong> — je account en de inhoud ervan laten wissen, met
            uitzondering van de betaalstukken die we wettelijk moeten bewaren.
          </li>
          <li>
            <strong>Beperking</strong> en <strong>bezwaar</strong> — een verwerking op grond van
            gerechtvaardigd belang beperken of daartegen bezwaar maken.
          </li>
          <li>
            <strong>Overdraagbaarheid</strong> — je gegevens in een gestructureerd,
            machineleesbaar formaat ontvangen. Precies wat de JSON-export oplevert.
          </li>
          <li>
            <strong>Toestemming intrekken</strong> — voor producte-mails en optionele cookies,
            zonder dat dat afdoet aan de rechtmatigheid van eerdere verwerking.
          </li>
        </ul>
        <p>
          Mail <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>. We antwoorden
          binnen een maand, zoals de verordening voorschrijft, en in de praktijk veel sneller.
          Ben je niet tevreden met ons antwoord, dan kun je terecht bij de toezichthouder van
          je woonland — in Nederland de Autoriteit Persoonsgegevens.
        </p>
      </>
    ),
  },
  {
    id: 'export-delete',
    title: 'Je gegevens exporteren en verwijderen',
    body: (
      <>
        <p>
          <strong>Exporteren.</strong> In je accountinstellingen downloadt één knop al je cv’s
          als JSON — contactgegevens, secties en opmaakinstellingen per document. Het bestand
          wordt in je browser opgebouwd uit je eigen account: daarvoor wordt niets elders
          opgeslagen.
        </p>
        <p>
          <strong>Verwijderen.</strong> Het verwijderen van je account vraag je aan in de
          instellingen. Het is nog niet geautomatiseerd: het verzoek opent een vooraf ingevuld
          bericht aan ons team, dat het met de hand afhandelt en de verwijdering per e-mail
          bevestigt. We schrijven dat liever zo op dan een knop te tonen die doet alsof het
          meteen gebeurt.
        </p>
        <p>
          Exporteer voordat je verwijdert: het verzoek haalt je profiel, al je cv’s en de
          bijbehorende geschiedenis weg, en is onomkeerbaar.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Minderjarigen',
    body: (
      <p>
        De dienst is niet bedoeld voor kinderen onder de zestien en we verzamelen hun gegevens
        niet bewust. Een cv van een scholier die stage zoekt is een legitiem gebruik; ben je
        ouder of voogd en denk je dat er zonder geldige grondslag een account is aangemaakt,
        mail ons dan en we verwijderen het.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Wijzigingen in deze verklaring',
    body: (
      <p>
        We werken dit document bij wanneer de dienst verandert. De datum van de laatste
        wijziging staat boven aan de pagina. Een wezenlijke wijziging — een nieuw
        verwerkingsdoel, een nieuwe verwerker met toegang tot de inhoud van je cv’s — melden we
        vooraf per e-mail of in het product, niet achteraf.
      </p>
    ),
  },
];

export default function DutchPrivacyPage() {
  return (
    <LegalDocument
      locale="nl"
      title="Privacyverklaring"
      intro={`Wat ${site.name} verzamelt, waarom, met wie het wordt gedeeld, hoe lang het bewaard blijft en hoe je je rechten uitoefent.`}
      summary={[
        <>
          We verkopen je gegevens niet en bieden geen cv’s aan recruiters aan. Er is geen
          kandidatendatabank.
        </>,
        <>
          Niemand behalve jij ziet je cv’s, zolang je zelf geen deellink aanzet.
        </>,
        <>
          Je wachtwoord en je kaartnummer zien we nooit: Firebase en Paddle handelen die af.
        </>,
        <>Je exporteert al je cv’s wanneer je wilt als JSON, vanuit de instellingen.</>,
        <>
          Je account verwijderen haalt alles weg, op de betaalstukken na die we wettelijk
          moeten bewaren.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Algemene voorwaarden', href: '/nl/voorwaarden' },
        { label: 'Cookiebeleid', href: '/nl/cookies' },
        { label: 'Terugbetalingsbeleid', href: '/nl/terugbetaling' },
      ]}
    />
  );
}
