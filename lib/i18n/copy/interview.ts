import type { Locale } from '../locales';

/**
 * The CV interview's strings — and the questions themselves.
 *
 * The questions live here rather than beside the schema because they *are* the feature. What
 * separates a usable answer from a shrug is the wording of the question and the example under
 * it, and both have to work in four languages. A badly translated question does not produce a
 * badly worded CV; it produces an empty field, because the person did not understand what was
 * being asked.
 *
 * Each question carries a `hint` showing a real answer, and that example does more work than
 * the question. Somebody who has never written a CV does not know whether "what did you do
 * there" wants a job description or a paragraph — one line of sample answer settles it, and
 * the sample deliberately reads like something a person would actually type, not like copy.
 */

export interface InterviewQuestionCopy {
  label: string;
  hint: string;
}

export interface InterviewCopy {
  interview: {
    title: string;
    lede: string;
    /* ---------------------------------------------------------------- the flow */
    next: string;
    back: string;
    stepOf: (current: number, total: number) => string;
    addJob: string;
    addEducation: string;
    removeEntry: string;
    jobNumber: (index: number) => string;
    educationNumber: (index: number) => string;
    /* -------------------------------------------------------------- the finish */
    build: string;
    building: string;
    reviewTitle: string;
    reviewLede: string;
    removedNotice: (count: number) => string;
    create: string;
    creating: string;
    editAnswers: string;
    createdTitle: string;
    createdBody: string;
    /* -------------------------------------------------------------- the truths */
    honestyTitle: string;
    honestyBody: string;
    upgradeTitle: string;
    upgradeBody: string;
    upgradeCta: string;
    notEnough: string;
    genericError: string;
    /* ------------------------------------------------------------ the sections */
    steps: Record<string, { title: string; lede: string }>;
    questions: Record<string, InterviewQuestionCopy>;
  };
}

export const INTERVIEW_COPY: Record<Locale, InterviewCopy> = {
  en: {
    interview: {
      title: 'Build a CV from a few questions',
      lede: 'Answer about ten questions in your own words and we will write the CV. Nothing is invented — we only use what you tell us, and you can change every word afterwards.',
      next: 'Continue',
      back: 'Back',
      stepOf: (current, total) => `Step ${current} of ${total}`,
      addJob: 'Add another job',
      addEducation: 'Add another qualification',
      removeEntry: 'Remove',
      jobNumber: (index) => (index === 0 ? 'Most recent job' : `Previous job ${index}`),
      educationNumber: (index) =>
        index === 0 ? 'Highest qualification' : `Qualification ${index + 1}`,
      build: 'Write my CV',
      building: 'Writing…',
      reviewTitle: 'Here is your CV',
      reviewLede:
        'Read it before you keep it. Everything here came from your answers, but the wording is ours — change anything that does not sound like you.',
      removedNotice: (count) =>
        count === 1
          ? 'We left out 1 line that mentioned a figure you did not give us.'
          : `We left out ${count} lines that mentioned figures you did not give us.`,
      create: 'Keep this CV',
      creating: 'Creating…',
      editAnswers: 'Change my answers',
      createdTitle: 'CV created',
      createdBody: 'Opening the editor so you can finish it.',
      honestyTitle: 'We will not make things up',
      honestyBody:
        'If you do not give us a number, your CV will not have one. Invented figures are the fastest way to lose an interview, so we would rather write something plain and true.',
      upgradeTitle: 'Writing your CV is part of Pro',
      upgradeBody:
        'Your answers are kept. Upgrade and we will turn them into a finished CV in seconds — or go back and write it yourself, which is free and always will be.',
      upgradeCta: 'See plans',
      notEnough: 'Add your name and at least one job or qualification, and we can build the rest.',
      genericError: 'Something went wrong. Your answers are still here — try again.',
      steps: {
        about: { title: 'About you', lede: 'Two quick things to start.' },
        contact: { title: 'How employers reach you', lede: 'This goes at the top of your CV.' },
        work: {
          title: 'Your work',
          lede: 'Start with your most recent job. Add older ones after.',
        },
        education: { title: 'Your education', lede: 'Your highest qualification first.' },
        skills: {
          title: 'What you are good at',
          lede: 'Anything you would be comfortable being asked about.',
        },
        languages: { title: 'Languages', lede: 'Which ones, and how well.' },
        extras: {
          title: 'Anything else',
          lede: 'Optional — but often what makes a CV memorable.',
        },
      },
      questions: {
        fullName: { label: 'Your full name', hint: 'e.g. Nadia Belhaj' },
        targetRole: {
          label: 'What job are you applying for?',
          hint: 'e.g. Project coordinator — not necessarily your current title',
        },
        email: { label: 'Email address', hint: 'e.g. nadia.belhaj@example.com' },
        phone: { label: 'Phone number', hint: 'e.g. 06 12 34 56 78' },
        location: {
          label: 'City and country',
          hint: 'e.g. Rabat, Morocco — a full address is not needed',
        },
        role: { label: 'Job title', hint: 'e.g. Project coordinator' },
        company: { label: 'Employer', hint: 'e.g. Orbinet Maroc' },
        period: {
          label: 'When did you work there?',
          hint: 'e.g. January 2021 to now, or 2018–2020',
        },
        did: {
          label: 'What did you do there?',
          hint: 'Plain words are fine. "I managed the maintenance team and did the monthly reports" is a good answer — we will tidy it up.',
        },
        numbers: {
          label: 'Any numbers you can put to it?',
          hint: 'Team size, budget, number of sites or customers. Leave it blank if you are not sure — we will never invent one.',
        },
        qualification: {
          label: 'What did you study?',
          hint: 'e.g. Master in Marketing and Commercial Management',
        },
        school: { label: 'Where?', hint: 'e.g. Faculty of Economics and Management, Kenitra' },
        year: { label: 'What year did you finish?', hint: 'e.g. 2021' },
        skills: {
          label: 'What are you good at?',
          hint: 'Separate them with commas. e.g. Project management, budgeting, Excel, team leadership',
        },
        languages: {
          label: 'Which languages do you speak?',
          hint: 'And how well. e.g. Arabic — native, French — fluent, English — intermediate',
        },
        extras: {
          label: 'Certifications, volunteering, interests?',
          hint: 'Anything worth a line on your CV. Optional.',
        },
      },
    },
  },

  fr: {
    interview: {
      title: 'Créez un CV à partir de quelques questions',
      lede: 'Répondez à une dizaine de questions avec vos propres mots et nous rédigeons le CV. Rien n’est inventé : nous n’utilisons que ce que vous nous dites, et vous pourrez tout modifier ensuite.',
      next: 'Continuer',
      back: 'Retour',
      stepOf: (current, total) => `Étape ${current} sur ${total}`,
      addJob: 'Ajouter un autre poste',
      addEducation: 'Ajouter une autre formation',
      removeEntry: 'Supprimer',
      jobNumber: (index) => (index === 0 ? 'Poste le plus récent' : `Poste précédent ${index}`),
      educationNumber: (index) =>
        index === 0 ? 'Diplôme le plus élevé' : `Formation ${index + 1}`,
      build: 'Rédiger mon CV',
      building: 'Rédaction…',
      reviewTitle: 'Voici votre CV',
      reviewLede:
        'Relisez-le avant de le garder. Tout vient de vos réponses, mais la formulation est la nôtre — changez ce qui ne vous ressemble pas.',
      removedNotice: (count) =>
        count === 1
          ? 'Nous avons retiré 1 ligne qui citait un chiffre que vous ne nous avez pas donné.'
          : `Nous avons retiré ${count} lignes qui citaient des chiffres que vous ne nous avez pas donnés.`,
      create: 'Garder ce CV',
      creating: 'Création…',
      editAnswers: 'Modifier mes réponses',
      createdTitle: 'CV créé',
      createdBody: 'Ouverture de l’éditeur pour le finaliser.',
      honestyTitle: 'Nous n’inventons rien',
      honestyBody:
        'Si vous ne nous donnez pas de chiffre, votre CV n’en aura pas. Les chiffres inventés sont le moyen le plus rapide de rater un entretien : nous préférons écrire quelque chose de simple et de vrai.',
      upgradeTitle: 'La rédaction fait partie de Pro',
      upgradeBody:
        'Vos réponses sont conservées. Passez à Pro et nous en ferons un CV complet en quelques secondes — ou revenez en arrière et rédigez-le vous-même, ce qui est gratuit et le restera.',
      upgradeCta: 'Voir les offres',
      notEnough:
        'Indiquez votre nom et au moins un poste ou une formation, et nous nous occupons du reste.',
      genericError: 'Une erreur est survenue. Vos réponses sont conservées — réessayez.',
      steps: {
        about: { title: 'À propos de vous', lede: 'Deux questions rapides pour commencer.' },
        contact: {
          title: 'Comment vous joindre',
          lede: 'Ces informations figureront en haut de votre CV.',
        },
        work: {
          title: 'Votre parcours',
          lede: 'Commencez par votre poste le plus récent. Vous ajouterez les précédents ensuite.',
        },
        education: { title: 'Votre formation', lede: 'Votre diplôme le plus élevé d’abord.' },
        skills: {
          title: 'Vos compétences',
          lede: 'Tout ce sur quoi vous seriez à l’aise d’être interrogé.',
        },
        languages: { title: 'Langues', lede: 'Lesquelles, et à quel niveau.' },
        extras: {
          title: 'Autre chose ?',
          lede: 'Facultatif — mais c’est souvent ce qui rend un CV mémorable.',
        },
      },
      questions: {
        fullName: { label: 'Votre nom complet', hint: 'ex. Nadia Belhaj' },
        targetRole: {
          label: 'Quel poste visez-vous ?',
          hint: 'ex. Coordinatrice de projet — pas forcément votre poste actuel',
        },
        email: { label: 'Adresse e-mail', hint: 'ex. nadia.belhaj@example.com' },
        phone: { label: 'Téléphone', hint: 'ex. 06 12 34 56 78' },
        location: {
          label: 'Ville et pays',
          hint: 'ex. Rabat, Maroc — l’adresse complète est inutile',
        },
        role: { label: 'Intitulé du poste', hint: 'ex. Coordinatrice de projet' },
        company: { label: 'Employeur', hint: 'ex. Orbinet Maroc' },
        period: {
          label: 'Quand y avez-vous travaillé ?',
          hint: 'ex. de janvier 2021 à aujourd’hui, ou 2018–2020',
        },
        did: {
          label: 'Qu’y faisiez-vous ?',
          hint: 'Des mots simples suffisent. « Je gérais l’équipe de maintenance et je faisais les rapports mensuels » est une bonne réponse — nous la mettrons en forme.',
        },
        numbers: {
          label: 'Des chiffres à y associer ?',
          hint: 'Taille d’équipe, budget, nombre de sites ou de clients. Laissez vide si vous n’êtes pas sûr : nous n’en inventerons jamais.',
        },
        qualification: {
          label: 'Qu’avez-vous étudié ?',
          hint: 'ex. Master en Marketing et Management Commercial',
        },
        school: { label: 'Où ?', hint: 'ex. Faculté d’Économie et de Gestion, Kénitra' },
        year: { label: 'En quelle année avez-vous terminé ?', hint: 'ex. 2021' },
        skills: {
          label: 'Quelles sont vos compétences ?',
          hint: 'Séparez-les par des virgules. ex. Gestion de projet, budget, Excel, encadrement d’équipe',
        },
        languages: {
          label: 'Quelles langues parlez-vous ?',
          hint: 'Et à quel niveau. ex. arabe — langue maternelle, français — courant, anglais — intermédiaire',
        },
        extras: {
          label: 'Certifications, bénévolat, centres d’intérêt ?',
          hint: 'Tout ce qui mérite une ligne sur votre CV. Facultatif.',
        },
      },
    },
  },

  de: {
    interview: {
      title: 'Lebenslauf aus ein paar Fragen erstellen',
      lede: 'Beantworten Sie rund zehn Fragen in eigenen Worten, den Rest schreiben wir. Nichts wird erfunden: Wir verwenden nur, was Sie uns sagen, und Sie können danach jedes Wort ändern.',
      next: 'Weiter',
      back: 'Zurück',
      stepOf: (current, total) => `Schritt ${current} von ${total}`,
      addJob: 'Weitere Station hinzufügen',
      addEducation: 'Weitere Ausbildung hinzufügen',
      removeEntry: 'Entfernen',
      jobNumber: (index) => (index === 0 ? 'Aktuellste Station' : `Frühere Station ${index}`),
      educationNumber: (index) => (index === 0 ? 'Höchster Abschluss' : `Ausbildung ${index + 1}`),
      build: 'Lebenslauf schreiben',
      building: 'Wird geschrieben…',
      reviewTitle: 'Ihr Lebenslauf',
      reviewLede:
        'Lesen Sie ihn, bevor Sie ihn behalten. Alles stammt aus Ihren Antworten, die Formulierung ist von uns — ändern Sie, was nicht nach Ihnen klingt.',
      removedNotice: (count) =>
        count === 1
          ? 'Wir haben 1 Zeile weggelassen, die eine Zahl nannte, die Sie uns nicht gegeben haben.'
          : `Wir haben ${count} Zeilen weggelassen, die Zahlen nannten, die Sie uns nicht gegeben haben.`,
      create: 'Lebenslauf behalten',
      creating: 'Wird erstellt…',
      editAnswers: 'Antworten ändern',
      createdTitle: 'Lebenslauf erstellt',
      createdBody: 'Der Editor wird geöffnet, damit Sie ihn fertigstellen können.',
      honestyTitle: 'Wir erfinden nichts',
      honestyBody:
        'Wenn Sie uns keine Zahl nennen, steht auch keine in Ihrem Lebenslauf. Erfundene Zahlen sind der schnellste Weg, ein Vorstellungsgespräch zu verlieren — uns ist schlicht und wahr lieber.',
      upgradeTitle: 'Das Schreiben gehört zu Pro',
      upgradeBody:
        'Ihre Antworten bleiben erhalten. Mit Pro machen wir daraus in Sekunden einen fertigen Lebenslauf — oder Sie gehen zurück und schreiben ihn selbst, kostenlos und dauerhaft.',
      upgradeCta: 'Tarife ansehen',
      notEnough:
        'Nennen Sie Ihren Namen und mindestens eine Station oder Ausbildung, den Rest übernehmen wir.',
      genericError:
        'Etwas ist schiefgelaufen. Ihre Antworten sind noch da — versuchen Sie es erneut.',
      steps: {
        about: { title: 'Über Sie', lede: 'Zwei kurze Fragen zum Anfang.' },
        contact: {
          title: 'Wie Arbeitgeber Sie erreichen',
          lede: 'Das steht oben in Ihrem Lebenslauf.',
        },
        work: {
          title: 'Ihr Werdegang',
          lede: 'Beginnen Sie mit der aktuellsten Station. Frühere kommen danach.',
        },
        education: { title: 'Ihre Ausbildung', lede: 'Der höchste Abschluss zuerst.' },
        skills: {
          title: 'Was Sie können',
          lede: 'Alles, wozu Sie im Gespräch gern befragt würden.',
        },
        languages: { title: 'Sprachen', lede: 'Welche, und wie gut.' },
        extras: {
          title: 'Sonst noch etwas?',
          lede: 'Optional — aber oft genau das, was einen Lebenslauf im Gedächtnis bleiben lässt.',
        },
      },
      questions: {
        fullName: { label: 'Ihr vollständiger Name', hint: 'z. B. Nadia Belhaj' },
        targetRole: {
          label: 'Auf welche Stelle bewerben Sie sich?',
          hint: 'z. B. Projektkoordinatorin — nicht zwingend Ihre aktuelle Bezeichnung',
        },
        email: { label: 'E-Mail-Adresse', hint: 'z. B. nadia.belhaj@example.com' },
        phone: { label: 'Telefonnummer', hint: 'z. B. 06 12 34 56 78' },
        location: {
          label: 'Ort und Land',
          hint: 'z. B. Rabat, Marokko — eine vollständige Anschrift ist unnötig',
        },
        role: { label: 'Position', hint: 'z. B. Projektkoordinatorin' },
        company: { label: 'Arbeitgeber', hint: 'z. B. Orbinet Maroc' },
        period: {
          label: 'Wann waren Sie dort?',
          hint: 'z. B. Januar 2021 bis heute, oder 2018–2020',
        },
        did: {
          label: 'Was haben Sie dort gemacht?',
          hint: 'Einfache Worte genügen. „Ich habe das Wartungsteam geführt und die Monatsberichte gemacht“ ist eine gute Antwort — wir bringen sie in Form.',
        },
        numbers: {
          label: 'Können Sie Zahlen dazu nennen?',
          hint: 'Teamgröße, Budget, Anzahl Standorte oder Kunden. Lassen Sie es leer, wenn Sie unsicher sind — wir erfinden nie welche.',
        },
        qualification: {
          label: 'Was haben Sie studiert oder gelernt?',
          hint: 'z. B. Master in Marketing und Handelsmanagement',
        },
        school: { label: 'Wo?', hint: 'z. B. Fakultät für Wirtschaft und Management, Kenitra' },
        year: { label: 'In welchem Jahr abgeschlossen?', hint: 'z. B. 2021' },
        skills: {
          label: 'Was können Sie gut?',
          hint: 'Mit Kommas trennen. z. B. Projektmanagement, Budgetplanung, Excel, Teamführung',
        },
        languages: {
          label: 'Welche Sprachen sprechen Sie?',
          hint: 'Und wie gut. z. B. Arabisch — Muttersprache, Französisch — fließend, Englisch — mittel',
        },
        extras: {
          label: 'Zertifikate, Ehrenamt, Interessen?',
          hint: 'Alles, was eine Zeile wert ist. Optional.',
        },
      },
    },
  },

  nl: {
    interview: {
      title: 'Maak een cv met een paar vragen',
      lede: 'Beantwoord ongeveer tien vragen in je eigen woorden, wij schrijven het cv. Niets wordt verzonnen: we gebruiken alleen wat je ons vertelt, en je kunt daarna elk woord aanpassen.',
      next: 'Verder',
      back: 'Terug',
      stepOf: (current, total) => `Stap ${current} van ${total}`,
      addJob: 'Nog een functie toevoegen',
      addEducation: 'Nog een opleiding toevoegen',
      removeEntry: 'Verwijderen',
      jobNumber: (index) => (index === 0 ? 'Meest recente functie' : `Vorige functie ${index}`),
      educationNumber: (index) => (index === 0 ? 'Hoogste opleiding' : `Opleiding ${index + 1}`),
      build: 'Schrijf mijn cv',
      building: 'Bezig met schrijven…',
      reviewTitle: 'Dit is je cv',
      reviewLede:
        'Lees het door voordat je het bewaart. Alles komt uit jouw antwoorden, maar de formulering is van ons — pas aan wat niet als jou klinkt.',
      removedNotice: (count) =>
        count === 1
          ? 'We hebben 1 regel weggelaten die een getal noemde dat je ons niet hebt gegeven.'
          : `We hebben ${count} regels weggelaten die getallen noemden die je ons niet hebt gegeven.`,
      create: 'Cv bewaren',
      creating: 'Bezig met maken…',
      editAnswers: 'Antwoorden aanpassen',
      createdTitle: 'Cv aangemaakt',
      createdBody: 'De editor wordt geopend zodat je het kunt afmaken.',
      honestyTitle: 'We verzinnen niets',
      honestyBody:
        'Geef je ons geen getal, dan staat er ook geen in je cv. Verzonnen cijfers zijn de snelste manier om een gesprek te verliezen — liever iets eenvoudigs dat klopt.',
      upgradeTitle: 'Het schrijven hoort bij Pro',
      upgradeBody:
        'Je antwoorden blijven bewaard. Met Pro maken we er in enkele seconden een compleet cv van — of ga terug en schrijf het zelf, dat is en blijft gratis.',
      upgradeCta: 'Bekijk de pakketten',
      notEnough: 'Vul je naam in en minstens één functie of opleiding, dan doen wij de rest.',
      genericError: 'Er ging iets mis. Je antwoorden staan er nog — probeer het opnieuw.',
      steps: {
        about: { title: 'Over jou', lede: 'Twee korte vragen om te beginnen.' },
        contact: {
          title: 'Hoe werkgevers je bereiken',
          lede: 'Dit komt bovenaan je cv te staan.',
        },
        work: {
          title: 'Je werk',
          lede: 'Begin met je meest recente functie. Oudere voeg je daarna toe.',
        },
        education: { title: 'Je opleiding', lede: 'Je hoogste opleiding eerst.' },
        skills: {
          title: 'Waar ben je goed in?',
          lede: 'Alles waarover je met plezier vragen beantwoordt.',
        },
        languages: { title: 'Talen', lede: 'Welke, en hoe goed.' },
        extras: {
          title: 'Nog iets?',
          lede: 'Optioneel — maar vaak juist wat een cv memorabel maakt.',
        },
      },
      questions: {
        fullName: { label: 'Je volledige naam', hint: 'bijv. Nadia Belhaj' },
        targetRole: {
          label: 'Op welke functie solliciteer je?',
          hint: 'bijv. Projectcoördinator — niet per se je huidige titel',
        },
        email: { label: 'E-mailadres', hint: 'bijv. nadia.belhaj@example.com' },
        phone: { label: 'Telefoonnummer', hint: 'bijv. 06 12 34 56 78' },
        location: {
          label: 'Stad en land',
          hint: 'bijv. Rabat, Marokko — een volledig adres is niet nodig',
        },
        role: { label: 'Functietitel', hint: 'bijv. Projectcoördinator' },
        company: { label: 'Werkgever', hint: 'bijv. Orbinet Maroc' },
        period: {
          label: 'Wanneer werkte je daar?',
          hint: 'bijv. januari 2021 tot nu, of 2018–2020',
        },
        did: {
          label: 'Wat deed je daar?',
          hint: 'Gewone woorden zijn prima. „Ik stuurde het onderhoudsteam aan en maakte de maandrapportages” is een goed antwoord — wij maken er cv-taal van.',
        },
        numbers: {
          label: 'Kun je er getallen bij noemen?',
          hint: 'Teamgrootte, budget, aantal locaties of klanten. Laat leeg als je het niet zeker weet — wij verzinnen er nooit een.',
        },
        qualification: {
          label: 'Wat heb je gestudeerd?',
          hint: 'bijv. Master Marketing en Commercieel Management',
        },
        school: { label: 'Waar?', hint: 'bijv. Faculteit Economie en Management, Kenitra' },
        year: { label: 'In welk jaar afgerond?', hint: 'bijv. 2021' },
        skills: {
          label: 'Waar ben je goed in?',
          hint: 'Scheid ze met komma’s. bijv. Projectmanagement, budgetteren, Excel, leidinggeven',
        },
        languages: {
          label: 'Welke talen spreek je?',
          hint: 'En hoe goed. bijv. Arabisch — moedertaal, Frans — vloeiend, Engels — gemiddeld',
        },
        extras: {
          label: 'Certificaten, vrijwilligerswerk, interesses?',
          hint: 'Alles wat een regel op je cv waard is. Optioneel.',
        },
      },
    },
  },
};
