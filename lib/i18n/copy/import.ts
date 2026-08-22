import type { Locale } from '../locales';

/**
 * The CV importer's strings.
 *
 * Its own module for the reason the others are: `app-copy.ts` composes the areas, and a
 * feature that arrives as one file is a feature that can be reviewed as one file.
 *
 * ## The register these are written in
 *
 * Importing is the one place in this product where the software is openly guessing, and the
 * copy says so rather than performing confidence. "We read what we could" and "check these
 * before you continue" are not hedging — they are the accurate description of what happened,
 * and a user who is told the truth checks the dates. A user told "Import complete!" does not,
 * and finds out when a recruiter asks why two jobs ran concurrently.
 */

export interface ImportCopy {
  importCv: {
    title: string;
    lede: string;
    /* ------------------------------------------------------------------ upload */
    dropHere: string;
    chooseFile: string;
    formats: string;
    reading: string;
    /* ------------------------------------------------------------------ review */
    reviewTitle: string;
    reviewLede: string;
    foundHeading: string;
    partialHeading: string;
    nothingHeading: string;
    nothingBody: string;
    entriesFound: (count: number) => string;
    itemsFound: (count: number) => string;
    contactHeading: string;
    contactLede: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    email: string;
    phone: string;
    /* ----------------------------------------------------------------- caveats */
    multiColumnTitle: string;
    multiColumnBody: string;
    checkDatesTitle: string;
    checkDatesBody: string;
    /* ------------------------------------------------------------------ finish */
    create: string;
    creating: string;
    startOver: string;
    editAfterwards: string;
    createdTitle: string;
    createdBody: string;
    /* ------------------------------------------------------------------ errors */
    error: (code: string) => string;
    genericError: string;
  };
}

const EN: ImportCopy = {
  importCv: {
    title: 'Import a CV',
    lede: 'Already have a CV? Upload it and we will read what we can into a new document, which you can then correct, restyle and export.',
    dropHere: 'Drop your CV here',
    chooseFile: 'Choose a file',
    formats: 'PDF, Word (.docx) or a CreateCVOnline JSON export — up to 8 MB.',
    reading: 'Reading your CV…',

    reviewTitle: 'Check what we read',
    reviewLede:
      'Nothing has been saved yet. A PDF does not record which line is a job title, so the sections below are our best reading of yours — look them over before you continue.',
    foundHeading: 'Read successfully',
    partialHeading: 'Found, but empty',
    nothingHeading: 'We could not read much',
    nothingBody:
      'The file opened, but almost none of it matched the shape of a CV. You can still create the document and fill it in, or go back and try a different file.',
    entriesFound: (count) => (count === 1 ? '1 entry' : `${count} entries`),
    itemsFound: (count) => (count === 1 ? '1 item' : `${count} items`),

    contactHeading: 'Check these details',
    contactLede:
      'Your name and contact details are the fields we most often get wrong, and the ones a recruiter reads first.',
    firstName: 'First name',
    lastName: 'Last name',
    jobTitle: 'Professional title',
    email: 'E-mail',
    phone: 'Phone',

    multiColumnTitle: 'This looks like a two-column CV',
    multiColumnBody:
      'The text came out in an order that suggests a sidebar layout. A PDF does not record columns, so the sidebar and the main column may be interleaved below. It is the same reason applicant tracking systems struggle with two-column CVs.',
    checkDatesTitle: 'Check the dates in particular',
    checkDatesBody:
      'Dates are read from the text and are the easiest thing to get wrong. A wrong one is also the hardest to spot later, because the document still reads correctly.',

    create: 'Create this CV',
    creating: 'Creating…',
    startOver: 'Try a different file',
    editAfterwards:
      'Everything is editable afterwards — you can change the template, rewrite any section and export a PDF.',
    createdTitle: 'CV imported',
    createdBody: 'Opening the editor so you can finish it.',

    error: (code) =>
      ({
        'too-large': 'That file is larger than 8 MB.',
        'unsupported-type': 'Upload a PDF, a Word .docx or a CreateCVOnline JSON export.',
        empty: 'No text could be read from that file. It is most likely a scan or an image.',
        unreadable: 'That file could not be read. It may be damaged.',
        encrypted: 'That PDF is password-protected. Remove the password and try again.',
        'invalid-json': 'That JSON is not a CreateCVOnline export.',
        'rate-limited': 'Too many imports in a short time. Wait a few minutes and try again.',
      })[code] ?? 'That file could not be imported.',
    genericError: 'That file could not be imported. Please try another.',
  },
};

const FR: ImportCopy = {
  importCv: {
    title: 'Importer un CV',
    lede: 'Vous avez déjà un CV ? Importez-le : nous en lisons ce que nous pouvons pour créer un nouveau document, que vous pourrez ensuite corriger, remettre en forme et exporter.',
    dropHere: 'Déposez votre CV ici',
    chooseFile: 'Choisir un fichier',
    formats: 'PDF, Word (.docx) ou un export JSON CreateCVOnline — jusqu’à 8 Mo.',
    reading: 'Lecture de votre CV…',

    reviewTitle: 'Vérifiez ce que nous avons lu',
    reviewLede:
      'Rien n’est encore enregistré. Un PDF n’indique pas quelle ligne est un intitulé de poste : ce qui suit est notre meilleure lecture du vôtre. Relisez avant de continuer.',
    foundHeading: 'Lu correctement',
    partialHeading: 'Rubrique trouvée, mais vide',
    nothingHeading: 'Nous n’avons pas pu lire grand-chose',
    nothingBody:
      'Le fichier s’est ouvert, mais presque rien n’y ressemblait à un CV. Vous pouvez créer le document et le remplir vous-même, ou revenir en arrière et essayer un autre fichier.',
    entriesFound: (count) => (count === 1 ? '1 entrée' : `${count} entrées`),
    itemsFound: (count) => (count === 1 ? '1 élément' : `${count} éléments`),

    contactHeading: 'Vérifiez ces informations',
    contactLede:
      'Votre nom et vos coordonnées sont les champs que nous nous trompons le plus souvent, et les premiers que lit un recruteur.',
    firstName: 'Prénom',
    lastName: 'Nom',
    jobTitle: 'Titre professionnel',
    email: 'E-mail',
    phone: 'Téléphone',

    multiColumnTitle: 'Ce CV semble être sur deux colonnes',
    multiColumnBody:
      'Le texte est ressorti dans un ordre qui suggère une bande latérale. Un PDF n’enregistre pas les colonnes : la bande latérale et le corps du texte peuvent donc être entremêlés ci-dessous. C’est exactement ce qui gêne aussi les logiciels de tri.',
    checkDatesTitle: 'Vérifiez surtout les dates',
    checkDatesBody:
      'Les dates sont déduites du texte et c’est ce qui se lit le plus mal. Une date fausse est aussi la plus difficile à repérer ensuite, car le document reste cohérent en apparence.',

    create: 'Créer ce CV',
    creating: 'Création…',
    startOver: 'Essayer un autre fichier',
    editAfterwards:
      'Tout reste modifiable ensuite : vous pouvez changer de modèle, réécrire n’importe quelle rubrique et exporter un PDF.',
    createdTitle: 'CV importé',
    createdBody: 'Ouverture de l’éditeur pour le finaliser.',

    error: (code) =>
      ({
        'too-large': 'Ce fichier dépasse 8 Mo.',
        'unsupported-type':
          'Importez un PDF, un fichier Word .docx ou un export JSON CreateCVOnline.',
        empty: 'Aucun texte n’a pu être lu. Il s’agit probablement d’un scan ou d’une image.',
        unreadable: 'Ce fichier n’a pas pu être lu. Il est peut-être endommagé.',
        encrypted:
          'Ce PDF est protégé par un mot de passe. Retirez-le et réessayez.',
        'invalid-json': 'Ce JSON n’est pas un export CreateCVOnline.',
        'rate-limited':
          'Trop d’imports en peu de temps. Attendez quelques minutes et réessayez.',
      })[code] ?? 'Ce fichier n’a pas pu être importé.',
    genericError: 'Ce fichier n’a pas pu être importé. Essayez-en un autre.',
  },
};

const DE: ImportCopy = {
  importCv: {
    title: 'Lebenslauf importieren',
    lede: 'Sie haben schon einen Lebenslauf? Laden Sie ihn hoch — wir lesen daraus, was wir können, und legen ein neues Dokument an, das Sie danach korrigieren, umgestalten und exportieren können.',
    dropHere: 'Lebenslauf hier ablegen',
    chooseFile: 'Datei auswählen',
    formats: 'PDF, Word (.docx) oder ein CreateCVOnline-JSON-Export — bis 8 MB.',
    reading: 'Ihr Lebenslauf wird gelesen…',

    reviewTitle: 'Prüfen Sie, was wir gelesen haben',
    reviewLede:
      'Es ist noch nichts gespeichert. Ein PDF hält nicht fest, welche Zeile eine Positionsbezeichnung ist — das Folgende ist unsere beste Lesart Ihres Lebenslaufs. Sehen Sie es durch, bevor Sie fortfahren.',
    foundHeading: 'Erfolgreich gelesen',
    partialHeading: 'Abschnitt gefunden, aber leer',
    nothingHeading: 'Wir konnten wenig lesen',
    nothingBody:
      'Die Datei ließ sich öffnen, aber fast nichts darin sah nach einem Lebenslauf aus. Sie können das Dokument trotzdem anlegen und selbst ausfüllen oder zurückgehen und eine andere Datei versuchen.',
    entriesFound: (count) => (count === 1 ? '1 Eintrag' : `${count} Einträge`),
    itemsFound: (count) => (count === 1 ? '1 Element' : `${count} Elemente`),

    contactHeading: 'Prüfen Sie diese Angaben',
    contactLede:
      'Name und Kontaktdaten sind die Felder, die wir am häufigsten falsch lesen — und die ein Personalverantwortlicher zuerst liest.',
    firstName: 'Vorname',
    lastName: 'Nachname',
    jobTitle: 'Berufsbezeichnung',
    email: 'E-Mail',
    phone: 'Telefon',

    multiColumnTitle: 'Das sieht nach einem zweispaltigen Lebenslauf aus',
    multiColumnBody:
      'Der Text kam in einer Reihenfolge heraus, die auf eine Seitenleiste hindeutet. Ein PDF speichert keine Spalten, deshalb können Seitenleiste und Fließtext unten ineinander verschachtelt sein. Genau daran scheitern auch Bewerbermanagementsysteme.',
    checkDatesTitle: 'Prüfen Sie besonders die Daten',
    checkDatesBody:
      'Datumsangaben werden aus dem Text erschlossen und gehen am leichtesten daneben. Ein falsches Datum fällt später auch am schwersten auf, weil das Dokument stimmig aussieht.',

    create: 'Diesen Lebenslauf anlegen',
    creating: 'Wird angelegt…',
    startOver: 'Andere Datei versuchen',
    editAfterwards:
      'Danach ist alles änderbar: Vorlage wechseln, jeden Abschnitt neu schreiben und als PDF exportieren.',
    createdTitle: 'Lebenslauf importiert',
    createdBody: 'Der Editor wird geöffnet, damit Sie ihn fertigstellen können.',

    error: (code) =>
      ({
        'too-large': 'Diese Datei ist größer als 8 MB.',
        'unsupported-type':
          'Laden Sie ein PDF, eine Word-.docx oder einen CreateCVOnline-JSON-Export hoch.',
        empty: 'Aus dieser Datei ließ sich kein Text lesen. Vermutlich ein Scan oder ein Bild.',
        unreadable: 'Diese Datei konnte nicht gelesen werden. Möglicherweise ist sie beschädigt.',
        encrypted: 'Dieses PDF ist passwortgeschützt. Entfernen Sie das Passwort und versuchen Sie es erneut.',
        'invalid-json': 'Dieses JSON ist kein CreateCVOnline-Export.',
        'rate-limited':
          'Zu viele Importe in kurzer Zeit. Warten Sie ein paar Minuten und versuchen Sie es erneut.',
      })[code] ?? 'Diese Datei konnte nicht importiert werden.',
    genericError: 'Diese Datei konnte nicht importiert werden. Versuchen Sie eine andere.',
  },
};

const NL: ImportCopy = {
  importCv: {
    title: 'Cv importeren',
    lede: 'Heb je al een cv? Upload het — we lezen eruit wat we kunnen en maken er een nieuw document van, dat je daarna kunt corrigeren, opnieuw vormgeven en exporteren.',
    dropHere: 'Sleep je cv hierheen',
    chooseFile: 'Kies een bestand',
    formats: 'Pdf, Word (.docx) of een CreateCVOnline JSON-export — tot 8 MB.',
    reading: 'Je cv wordt gelezen…',

    reviewTitle: 'Controleer wat we hebben gelezen',
    reviewLede:
      'Er is nog niets opgeslagen. Een pdf legt niet vast welke regel een functietitel is, dus hieronder staat onze beste lezing van jouw cv. Loop het na voordat je verdergaat.',
    foundHeading: 'Goed gelezen',
    partialHeading: 'Sectie gevonden, maar leeg',
    nothingHeading: 'We konden weinig lezen',
    nothingBody:
      'Het bestand ging open, maar bijna niets erin leek op een cv. Je kunt het document alsnog aanmaken en zelf invullen, of teruggaan en een ander bestand proberen.',
    entriesFound: (count) => (count === 1 ? '1 item' : `${count} items`),
    itemsFound: (count) => (count === 1 ? '1 item' : `${count} items`),

    contactHeading: 'Controleer deze gegevens',
    contactLede:
      'Je naam en contactgegevens lezen we het vaakst verkeerd, en ze zijn het eerste wat een recruiter bekijkt.',
    firstName: 'Voornaam',
    lastName: 'Achternaam',
    jobTitle: 'Functietitel',
    email: 'E-mail',
    phone: 'Telefoon',

    multiColumnTitle: 'Dit lijkt een cv in twee kolommen',
    multiColumnBody:
      'De tekst kwam er in een volgorde uit die op een zijbalk wijst. Een pdf legt geen kolommen vast, dus de zijbalk en de hoofdtekst kunnen hieronder door elkaar lopen. Het is dezelfde reden waarom recruitmentsoftware moeite heeft met cv’s in twee kolommen.',
    checkDatesTitle: 'Let vooral op de datums',
    checkDatesBody:
      'Datums worden uit de tekst afgeleid en gaan het snelst mis. Een verkeerde datum is later ook het lastigst te zien, omdat het document er verder klopt.',

    create: 'Dit cv aanmaken',
    creating: 'Bezig met aanmaken…',
    startOver: 'Ander bestand proberen',
    editAfterwards:
      'Daarna is alles aan te passen: wissel van sjabloon, herschrijf elke sectie en exporteer een pdf.',
    createdTitle: 'Cv geïmporteerd',
    createdBody: 'De editor wordt geopend zodat je het kunt afmaken.',

    error: (code) =>
      ({
        'too-large': 'Dit bestand is groter dan 8 MB.',
        'unsupported-type':
          'Upload een pdf, een Word-.docx of een CreateCVOnline JSON-export.',
        empty: 'Uit dit bestand kon geen tekst worden gelezen. Waarschijnlijk een scan of een afbeelding.',
        unreadable: 'Dit bestand kon niet worden gelezen. Mogelijk is het beschadigd.',
        encrypted: 'Deze pdf is met een wachtwoord beveiligd. Haal het wachtwoord eraf en probeer opnieuw.',
        'invalid-json': 'Deze JSON is geen CreateCVOnline-export.',
        'rate-limited':
          'Te veel imports in korte tijd. Wacht een paar minuten en probeer het opnieuw.',
      })[code] ?? 'Dit bestand kon niet worden geïmporteerd.',
    genericError: 'Dit bestand kon niet worden geïmporteerd. Probeer een ander.',
  },
};

export const IMPORT_COPY: Record<Locale, ImportCopy> = { en: EN, fr: FR, de: DE, nl: NL };
