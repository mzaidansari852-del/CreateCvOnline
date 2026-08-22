import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalDocument, type LegalSection } from '@/components/marketing/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';
import { site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terugbetalingsbeleid',
  description: `Veertien dagen om je geld terug te krijgen bij ${site.name}: wat eronder valt, hoe je het aanvraagt en hoe lang het duurt.`,
  path: '/nl/terugbetaling',
  locale: 'nl',
});

/** Section ids match the English page so a deep link works across both languages. */
const SECTIONS: LegalSection[] = [
  {
    id: 'the-promise',
    title: 'De veertien dagen',
    body: (
      <>
        <p>
          Je hebt <strong>veertien dagen</strong> vanaf de aankoop om je geld volledig terug te
          vragen, zonder uitleg. Mail ons, noem het bestelnummer, meer is het niet.
        </p>
        <p>
          We vragen niet wat er niet beviel, we bieden niet eerst drie andere abonnementen aan
          voordat we ja zeggen, en er is geen formulier. Een dienst die terugbetaling lastig
          maakt, verdient het vertrouwen niet dat hij bij het afrekenen vraagt.
        </p>
        <p>
          Ben je consument in de EU, dan geldt je wettelijke herroepingsrecht bovenop dit beleid
          en wordt het er op geen enkele manier door beperkt.
        </p>
      </>
    ),
  },
  {
    id: 'what-is-refundable',
    title: 'Wat wordt terugbetaald',
    body: (
      <ul>
        <li>
          <strong>Een eerste aankoop van een abonnement</strong>, binnen veertien dagen, hoeveel
          je er in de tussentijd ook mee hebt gedaan.
        </li>
        <li>
          <strong>Levenslange toegang</strong>, binnen veertien dagen na aankoop.
        </li>
        <li>
          <strong>Een verlenging die je niet zag aankomen</strong>, als je er snel na de
          afschrijving bij bent. Een vergeten verlenging is geen val die we willen laten
          dichtklappen.
        </li>
        <li>
          <strong>Een dubbele betaling</strong>, een verkeerd bedrag of een transactie die je
          niet herkent: volledig terugbetaald, zonder termijn.
        </li>
      </ul>
    ),
  },
  {
    id: 'what-is-not',
    title: 'Wat niet',
    body: (
      <>
        <ul>
          <li>
            <strong>Al verstreken abonnementsperiodes na de veertien dagen.</strong> Zeg je in de
            achtste maand op, dan betalen we de zeven gebruikte maanden niet terug. Opzeggen
            voorkomt de volgende afschrijving.
          </li>
          <li>
            <strong>Herhaalde terugbetalingen van hetzelfde abonnement.</strong> Heb je een
            abonnement al eens teruggekregen, dan valt het opnieuw kopen en opnieuw terugvragen
            buiten dit beleid.
          </li>
        </ul>
        <p>
          Die lijst is kort, en dat is bewust. We weigeren geen terugbetaling omdat je een pdf
          hebt gedownload of een Pro-sjabloon hebt gebruikt: daar had je nu juist voor betaald,
          en het je tegenwerpen zou neerkomen op het verkopen van een recht dat je niet mag
          uitoefenen.
        </p>
      </>
    ),
  },
  {
    id: 'how-to-ask',
    title: 'Hoe je terugbetaling aanvraagt',
    body: (
      <>
        <p>
          Mail <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> of gebruik het{' '}
          <Link href="/contact">contactformulier</Link> met als onderwerp “Refund request”.
        </p>
        <p>Vermeld daarbij:</p>
        <ul>
          <li>
            het <strong>Paddle-transactienummer</strong>, dat op de bon staat die je bij de
            aankoop per e-mail hebt gekregen;
          </li>
          <li>
            het <strong>e-mailadres van je account</strong>, als dat afwijkt van het adres
            waarvandaan je mailt.
          </li>
        </ul>
        <p>
          Een reden is optioneel. Die helpt ons het product te verbeteren en is nergens een
          voorwaarde voor.
        </p>
        <p>
          Omdat Paddle de verkoper in juridische zin is, kun je ook de link op je bon gebruiken.
          Beide wegen leiden tot hetzelfde; ons mailen is meestal sneller.
        </p>
      </>
    ),
  },
  {
    id: 'how-long',
    title: 'Hoe lang het duurt',
    body: (
      <>
        <ul>
          <li>
            <strong>Onze beslissing</strong> — binnen twee werkdagen, meestal dezelfde dag.
          </li>
          <li>
            <strong>Verwerking door Paddle</strong> — de opdracht gaat direct na onze goedkeuring
            de deur uit.
          </li>
          <li>
            <strong>Het geld op je rekening</strong> — drie tot tien werkdagen, afhankelijk van
            je bank of kaartuitgever. Die laatste stap ligt niet bij ons en niet bij Paddle.
          </li>
        </ul>
        <p>
          Is er tien werkdagen na onze bevestiging nog niets binnen, mail ons dan: we sturen je
          de referentie van de terugbetaling om aan je bank te laten zien.
        </p>
      </>
    ),
  },
  {
    id: 'after-a-refund',
    title: 'Wat er met je cv’s en downloads gebeurt',
    body: (
      <>
        <p>
          Je account gaat terug naar het gratis abonnement.{' '}
          <strong>Er wordt geen enkel cv verwijderd.</strong> Ze blijven te bekijken, te bewerken
          en te exporteren met de gratis sjablonen.
        </p>
        <p>
          Wat je kwijtraakt: de Pro-sjablonen, meerdere cv’s boven de gratis limiet, de
          uitgebreide opmaak, eigen secties, de openbare deellink en de pdf zonder vermelding in
          de voettekst. Een cv dat met een Pro-sjabloon is opgemaakt blijft zichtbaar in je
          omgeving; de export schakelt over op een gratis sjabloon.
        </p>
        <p>
          De pdf’s die je al had gedownload zijn van jou en blijven dat. We trekken ze niet in en
          zouden dat ook niet kunnen — het zijn bestanden op je eigen schijf.
        </p>
      </>
    ),
  },
  {
    id: 'cancelling',
    title: 'Hoe je voorkomt dat er opnieuw wordt afgeschreven',
    body: (
      <>
        <p>
          Terugbetalen en opzeggen zijn twee verschillende dingen. Terugbetalen geeft het geld
          van een al gedane betaling terug; opzeggen voorkomt de volgende.
        </p>
        <p>
          Opzeggen doe je op de pagina “Account” in je omgeving, of via de beheerlink op je
          Paddle-bon. Het gaat in aan het eind van de periode die je al hebt betaald: tot dan
          houd je toegang, wat logisch is omdat die periode in rekening is gebracht.
        </p>
        <p>
          Levenslange toegang zeg je niet op, omdat die niet verlengt. Er wordt nooit een tweede
          keer afgeschreven.
        </p>
      </>
    ),
  },
  {
    id: 'chargebacks',
    title: 'Geschillen en terugboekingen',
    body: (
      <>
        <p>
          Herken je een betaling niet, mail ons dan voordat je bij je bank een terugboeking
          aanvraagt. Een terugboeking start bij Paddle een formele procedure, duurt enkele weken
          en zet het dossier vast — terwijl een directe terugbetaling twee dagen kost.
        </p>
        <p>
          Een lopende terugboeking schort de betaalde toegang op zolang die wordt onderzocht. Dat
          is een eis van de betaaldienstverlener, geen straf van ons.
        </p>
      </>
    ),
  },
  {
    id: 'statutory-rights',
    title: 'Je wettelijke rechten',
    body: (
      <>
        <p>
          Dit beleid komt bovenop je wettelijke rechten en vervangt ze niet. Op meerdere punten is
          het gunstiger dan het wettelijke minimum; waar dat niet zo zou zijn, gaat de wet voor.
        </p>
        <p>
          In de EU geeft de aankoop van digitale inhoud een herroepingsrecht van veertien dagen.
          Een verkoper mag de consument vragen daarvan af te zien in ruil voor directe toegang;
          dat doen wij niet, en de veertien dagen hierboven gelden hoe dan ook.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Wijzigingen in dit beleid',
    body: (
      <p>
        Een wijziging werkt nooit terug: op een aankoop is het beleid van toepassing dat gold op
        de dag van die aankoop. De datum van de laatste wijziging staat boven aan de pagina.
      </p>
    ),
  },
];

export default function DutchRefundPolicyPage() {
  return (
    <LegalDocument
      locale="nl"
      title="Terugbetalingsbeleid"
      intro="Veertien dagen, zonder uitleg. Hier staat precies wat eronder valt, hoe je het aanvraagt en wanneer het geld terug is."
      summary={[
        <>Veertien dagen om je geld volledig terug te krijgen, zonder dat je je hoeft te verklaren.</>,
        <>
          Een gedownloade pdf of een gebruikt Pro-sjabloon kost je dat recht niet: daar had je
          voor betaald.
        </>,
        <>Een verlenging die je niet zag aankomen krijg je terug als je er snel bij bent.</>,
        <>
          Na een terugbetaling wordt er geen cv verwijderd; je account gaat gewoon terug naar
          gratis.
        </>,
        <>
          Mail ons vóór je een terugboeking aanvraagt: twee dagen per e-mail tegen enkele weken
          procedure.
        </>,
      ]}
      sections={SECTIONS}
      relatedLinks={[
        { label: 'Prijzen', href: '/nl/prijzen' },
        { label: 'Algemene voorwaarden', href: '/nl/voorwaarden' },
        { label: 'Privacyverklaring', href: '/nl/privacy' },
      ]}
    />
  );
}
