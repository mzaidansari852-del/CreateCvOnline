import type { Locale } from './locales';

/**
 * Every string the signed-in product shows.
 *
 * ## Why one file rather than per-component dictionaries
 *
 * The alternative is a `copy.ts` next to each component, which reads well until you have
 * to answer "is the German done?" — a question that then requires opening thirty files.
 * Here it is one scroll, and a missing translation is a type error rather than a silent
 * fallback to English, which is the failure mode that produced the bug this replaces: the
 * German footer copy existed for weeks and rendered in English because one branch asked
 * `locale === 'fr'`.
 *
 * ## Why plain objects rather than an i18n library
 *
 * `next-intl` and friends add a provider, a message loader, a build step and a runtime
 * format parser. What they buy is pluralisation, interpolation and lazy per-route message
 * chunks. This app needs interpolation — supplied here by functions, which are typed —
 * and has three languages of a few hundred strings, which is smaller than the library
 * would be. Pluralisation appears in about six places and is handled where it occurs.
 *
 * ## The rule for the translations themselves
 *
 * Write what a native speaker would write on that screen, not what the English says. The
 * French for "Download PDF" is "Télécharger le PDF" — with the article, because French
 * does not drop it — and the German for "Settings" is "Einstellungen", not "Einstellung".
 * Where a convention differs rather than a word, follow the convention: German addresses
 * the user as *Sie* throughout, so the imperative forms are the polite ones.
 */

export interface AppCopy {
  common: {
    save: string;
    saving: string;
    saved: string;
    cancel: string;
    delete: string;
    duplicate: string;
    rename: string;
    edit: string;
    preview: string;
    download: string;
    close: string;
    back: string;
    next: string;
    loading: string;
    retry: string;
    confirm: string;
    yes: string;
    no: string;
    free: string;
    pro: string;
    upgrade: string;
    somethingWentWrong: string;
    unsavedChanges: string;
    language: string;
  };
  nav: {
    dashboard: string;
    myCvs: string;
    templates: string;
    settings: string;
    account: string;
    signOut: string;
    newCv: string;
    /** The header button at narrow widths, where the full phrase does not fit. */
    newCvShort: string;
    backToSite: string;
  };
  dashboard: {
    title: string;
    greeting: (name: string) => string;
    subtitle: string;
    cvCount: (n: number) => string;
    downloadsLeft: (n: number) => string;
    unlimited: string;
    onFreePlan: string;
    /** Both may be `null`, which the plan model uses for "no limit". */
    freePlanLimits: (cvs: number | null, downloads: number | null) => string;
    comparePlans: string;
    completeness: string;
    emptyTitle: string;
    emptyBody: string;
    createFirst: string;
    recentCvs: string;
    viewAll: string;
    lastEdited: (when: string) => string;
    untitled: string;
  };
  cvs: {
    title: string;
    subtitle: string;
    newCv: string;
    startBlank: string;
    startBlankHint: string;
    startExample: string;
    startExampleHint: string;
    chooseTemplate: string;
    deleteTitle: string;
    deleteBody: (title: string) => string;
    deleteConfirm: string;
    duplicated: string;
    shareTitle: string;
    shareBody: string;
    shareCopy: string;
    shareCopied: string;
    shareStop: string;
    downloads: (n: number) => string;
    documentLanguage: string;
    documentLanguageHint: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profileHeading: string;
    displayName: string;
    email: string;
    emailImmutable: string;
    languageHeading: string;
    languageHint: string;
    preferencesHeading: string;
    paperSize: string;
    defaultTemplate: string;
    appDefault: string;
    marketingOptIn: string;
    marketingOptInHint: string;
    dangerHeading: string;
    deleteAccount: string;
    deleteAccountHint: string;
    planHeading: string;
    currentPlan: string;
    manageBilling: string;
  };
  auth: {
    signIn: string;
    signInSubtitle: string;
    signUp: string;
    signUpSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    forgotPassword: string;
    forgotPasswordTitle: string;
    forgotPasswordSubtitle: string;
    sendResetLink: string;
    resetLinkSent: string;
    noAccount: string;
    haveAccount: string;
    continueWithGoogle: string;
    or: string;
    verifyTitle: string;
    verifyBody: (email: string) => string;
    resendVerification: string;
    verificationSent: string;
    passwordStrengthWeak: string;
    passwordStrengthFair: string;
    passwordStrengthStrong: string;
    termsNotice: string;
  };
  editor: {
    backToCvs: string;
    contentTab: string;
    designTab: string;
    sectionsTab: string;
    letterTab: string;
    addSection: string;
    addItem: string;
    removeItem: string;
    moveUp: string;
    moveDown: string;
    sectionEnabled: string;
    sectionHidden: string;
    renameSection: string;
    resetName: string;
    template: string;
    accentColour: string;
    headingFont: string;
    bodyFont: string;
    fontSize: string;
    lineHeight: string;
    pageMargin: string;
    sectionSpacing: string;
    paperSize: string;
    dateFormat: string;
    headingStyle: string;
    resetDesign: string;
    zoom: string;
    pageOf: (page: number, total: number) => string;
    downloadPdf: string;
    preparingPdf: string;
    autoSaved: (when: string) => string;
  };
}

const EN: AppCopy = {
  common: {
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    cancel: 'Cancel',
    delete: 'Delete',
    duplicate: 'Duplicate',
    rename: 'Rename',
    edit: 'Edit',
    preview: 'Preview',
    download: 'Download',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    loading: 'Loading…',
    retry: 'Try again',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    free: 'Free',
    pro: 'Pro',
    upgrade: 'Upgrade',
    somethingWentWrong: 'Something went wrong. Please try again.',
    unsavedChanges: 'You have unsaved changes.',
    language: 'Language',
  },
  nav: {
    dashboard: 'Dashboard',
    myCvs: 'My CVs',
    templates: 'Templates',
    settings: 'Settings',
    account: 'Account',
    signOut: 'Sign out',
    newCv: 'New CV',
    newCvShort: 'New',
    backToSite: 'Back to site',
  },
  dashboard: {
    title: 'Dashboard',
    greeting: (name) => (name ? `Welcome back, ${name}` : 'Welcome back'),
    subtitle: 'Your CVs, downloads and account at a glance.',
    cvCount: (n) => (n === 1 ? '1 CV' : `${n} CVs`),
    downloadsLeft: (n) =>
      n === 1 ? '1 download left this month' : `${n} downloads left this month`,
    unlimited: 'Unlimited',
    onFreePlan: 'You are on Free',
    freePlanLimits: (cvs, downloads) =>
      `${cvs ?? 'Unlimited'} CVs and ${downloads ?? 'unlimited'} downloads a month.`,
    comparePlans: 'Compare plans',
    completeness: 'Completeness',
    emptyTitle: 'You have not created a CV yet',
    emptyBody: 'Pick a template, fill it in, and download the PDF. It takes about ten minutes.',
    createFirst: 'Create your first CV',
    recentCvs: 'Recent CVs',
    viewAll: 'View all',
    lastEdited: (when) => `Edited ${when}`,
    untitled: 'Untitled CV',
  },
  cvs: {
    title: 'My CVs',
    subtitle: 'Everything you have written, ready to tailor for the next application.',
    newCv: 'New CV',
    startBlank: 'Start blank',
    startBlankHint: 'An empty document with the usual sections ready to fill in.',
    startExample: 'Start from an example',
    startExampleHint: 'A complete worked CV you can edit down — useful for seeing the shape.',
    chooseTemplate: 'Choose a template',
    deleteTitle: 'Delete this CV?',
    deleteBody: (title) => `“${title}” will be removed permanently. This cannot be undone.`,
    deleteConfirm: 'Delete permanently',
    duplicated: 'Copy created',
    shareTitle: 'Share a read-only link',
    shareBody: 'Anyone with the link can view this CV. It will not appear in search results.',
    shareCopy: 'Copy link',
    shareCopied: 'Link copied',
    shareStop: 'Stop sharing',
    downloads: (n) => (n === 1 ? '1 download' : `${n} downloads`),
    documentLanguage: 'Document language',
    documentLanguageHint:
      'Sets the section headings and date format on this CV. It does not change the language of the app, and it never rewrites what you have written.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Your profile, your plan and the defaults applied to new CVs.',
    profileHeading: 'Profile',
    displayName: 'Name',
    email: 'Email',
    emailImmutable: 'Your email address is the one you signed in with and cannot be changed here.',
    languageHeading: 'Language',
    languageHint:
      'The language of this dashboard and the editor. Each CV has its own language, set on the CV itself.',
    preferencesHeading: 'New CV defaults',
    paperSize: 'Paper size',
    defaultTemplate: 'Default template',
    appDefault: 'App default',
    marketingOptIn: 'Product emails',
    marketingOptInHint:
      'Occasional emails about new templates and features. No more than one a month.',
    dangerHeading: 'Delete account',
    deleteAccount: 'Delete my account',
    deleteAccountHint: 'Removes your account and every CV in it. This cannot be undone.',
    planHeading: 'Plan',
    currentPlan: 'Current plan',
    manageBilling: 'Manage billing',
  },
  auth: {
    signIn: 'Sign in',
    signInSubtitle: 'Welcome back — pick up where you left off.',
    signUp: 'Create your account',
    signUpSubtitle: 'Free to start. No card, no trial timer.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    nameLabel: 'Your name',
    forgotPassword: 'Forgotten your password?',
    forgotPasswordTitle: 'Reset your password',
    forgotPasswordSubtitle: 'We will email you a link to set a new one.',
    sendResetLink: 'Send reset link',
    resetLinkSent: 'If that address has an account, a reset link is on its way.',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    verifyTitle: 'Confirm your email',
    verifyBody: (email) => `We sent a confirmation link to ${email}. Open it to finish setting up.`,
    resendVerification: 'Send it again',
    verificationSent: 'Sent — check your inbox.',
    passwordStrengthWeak: 'Weak',
    passwordStrengthFair: 'Fair',
    passwordStrengthStrong: 'Strong',
    termsNotice: 'By creating an account you agree to our terms and privacy policy.',
  },
  editor: {
    backToCvs: 'Back to my CVs',
    contentTab: 'Content',
    designTab: 'Design',
    sectionsTab: 'Sections',
    letterTab: 'Cover letter',
    addSection: 'Add a section',
    addItem: 'Add',
    removeItem: 'Remove',
    moveUp: 'Move up',
    moveDown: 'Move down',
    sectionEnabled: 'Shown',
    sectionHidden: 'Hidden',
    renameSection: 'Rename',
    resetName: 'Reset name',
    template: 'Template',
    accentColour: 'Accent colour',
    headingFont: 'Heading font',
    bodyFont: 'Body font',
    fontSize: 'Text size',
    lineHeight: 'Line height',
    pageMargin: 'Page margin',
    sectionSpacing: 'Section spacing',
    paperSize: 'Paper size',
    dateFormat: 'Date format',
    headingStyle: 'Heading style',
    resetDesign: 'Reset to template defaults',
    zoom: 'Zoom',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    downloadPdf: 'Download PDF',
    preparingPdf: 'Preparing your PDF…',
    autoSaved: (when) => `Saved ${when}`,
  },
};

const FR: AppCopy = {
  common: {
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Enregistré',
    cancel: 'Annuler',
    delete: 'Supprimer',
    duplicate: 'Dupliquer',
    rename: 'Renommer',
    edit: 'Modifier',
    preview: 'Aperçu',
    download: 'Télécharger',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    loading: 'Chargement…',
    retry: 'Réessayer',
    confirm: 'Confirmer',
    yes: 'Oui',
    no: 'Non',
    free: 'Gratuit',
    pro: 'Pro',
    upgrade: 'Passer à Pro',
    somethingWentWrong: 'Une erreur est survenue. Veuillez réessayer.',
    unsavedChanges: 'Vous avez des modifications non enregistrées.',
    language: 'Langue',
  },
  nav: {
    dashboard: 'Tableau de bord',
    myCvs: 'Mes CV',
    templates: 'Modèles',
    settings: 'Paramètres',
    account: 'Compte',
    signOut: 'Se déconnecter',
    newCv: 'Nouveau CV',
    newCvShort: 'Nouveau',
    backToSite: 'Retour au site',
  },
  dashboard: {
    title: 'Tableau de bord',
    greeting: (name) => (name ? `Bon retour, ${name}` : 'Bon retour'),
    subtitle: 'Vos CV, vos téléchargements et votre compte en un coup d’œil.',
    // "CV" is invariable in French — no plural s, ever.
    cvCount: (n) => (n === 1 ? '1 CV' : `${n} CV`),
    downloadsLeft: (n) =>
      n === 1 ? '1 téléchargement restant ce mois-ci' : `${n} téléchargements restants ce mois-ci`,
    unlimited: 'Illimité',
    onFreePlan: 'Vous êtes sur la formule Gratuite',
    freePlanLimits: (cvs, downloads) =>
      `${cvs ?? 'Un nombre illimité de'} CV et ${downloads ?? 'un nombre illimité de'} téléchargements par mois.`,
    comparePlans: 'Comparer les formules',
    completeness: 'Complétude',
    emptyTitle: 'Vous n’avez pas encore créé de CV',
    emptyBody:
      'Choisissez un modèle, remplissez-le et téléchargez le PDF. Comptez une dizaine de minutes.',
    createFirst: 'Créer mon premier CV',
    recentCvs: 'CV récents',
    viewAll: 'Tout voir',
    lastEdited: (when) => `Modifié ${when}`,
    untitled: 'CV sans titre',
  },
  cvs: {
    title: 'Mes CV',
    subtitle: 'Tout ce que vous avez rédigé, prêt à adapter pour la prochaine candidature.',
    newCv: 'Nouveau CV',
    startBlank: 'Partir de zéro',
    startBlankHint: 'Un document vide avec les rubriques habituelles, prêt à remplir.',
    startExample: 'Partir d’un exemple',
    startExampleHint:
      'Un CV complet que vous pouvez élaguer — utile pour voir la structure attendue.',
    chooseTemplate: 'Choisir un modèle',
    deleteTitle: 'Supprimer ce CV ?',
    deleteBody: (title) =>
      `« ${title} » sera supprimé définitivement. Cette action est irréversible.`,
    deleteConfirm: 'Supprimer définitivement',
    duplicated: 'Copie créée',
    shareTitle: 'Partager un lien en lecture seule',
    shareBody:
      'Toute personne disposant du lien pourra consulter ce CV. Il n’apparaîtra pas dans les résultats de recherche.',
    shareCopy: 'Copier le lien',
    shareCopied: 'Lien copié',
    shareStop: 'Arrêter le partage',
    downloads: (n) => (n === 1 ? '1 téléchargement' : `${n} téléchargements`),
    documentLanguage: 'Langue du document',
    documentLanguageHint:
      'Définit les intitulés de rubrique et le format des dates de ce CV. Cela ne change pas la langue de l’application et ne réécrit jamais ce que vous avez saisi.',
  },
  settings: {
    title: 'Paramètres',
    subtitle: 'Votre profil, votre formule et les valeurs par défaut des nouveaux CV.',
    profileHeading: 'Profil',
    displayName: 'Nom',
    email: 'Adresse e-mail',
    emailImmutable:
      'Votre adresse e-mail est celle utilisée pour vous connecter ; elle ne peut pas être modifiée ici.',
    languageHeading: 'Langue',
    languageHint:
      'La langue de ce tableau de bord et de l’éditeur. Chaque CV possède sa propre langue, définie sur le CV lui-même.',
    preferencesHeading: 'Valeurs par défaut des nouveaux CV',
    paperSize: 'Format de page',
    defaultTemplate: 'Modèle par défaut',
    appDefault: 'Valeur par défaut',
    marketingOptIn: 'E-mails produit',
    marketingOptInHint:
      'Des e-mails occasionnels sur les nouveaux modèles et fonctionnalités. Pas plus d’un par mois.',
    dangerHeading: 'Supprimer le compte',
    deleteAccount: 'Supprimer mon compte',
    deleteAccountHint:
      'Supprime votre compte et tous les CV qu’il contient. Cette action est irréversible.',
    planHeading: 'Formule',
    currentPlan: 'Formule actuelle',
    manageBilling: 'Gérer la facturation',
  },
  auth: {
    signIn: 'Se connecter',
    signInSubtitle: 'Bon retour — reprenez où vous en étiez.',
    signUp: 'Créer votre compte',
    signUpSubtitle: 'Gratuit pour commencer. Sans carte bancaire, sans période d’essai limitée.',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    nameLabel: 'Votre nom',
    forgotPassword: 'Mot de passe oublié ?',
    forgotPasswordTitle: 'Réinitialiser votre mot de passe',
    forgotPasswordSubtitle: 'Nous vous enverrons un lien pour en définir un nouveau.',
    sendResetLink: 'Envoyer le lien',
    resetLinkSent:
      'Si un compte existe pour cette adresse, un lien de réinitialisation vient d’être envoyé.',
    noAccount: 'Pas encore de compte ?',
    haveAccount: 'Vous avez déjà un compte ?',
    continueWithGoogle: 'Continuer avec Google',
    or: 'ou',
    verifyTitle: 'Confirmez votre adresse e-mail',
    verifyBody: (email) =>
      `Nous avons envoyé un lien de confirmation à ${email}. Ouvrez-le pour terminer la configuration.`,
    resendVerification: 'Renvoyer',
    verificationSent: 'Envoyé — vérifiez votre boîte de réception.',
    passwordStrengthWeak: 'Faible',
    passwordStrengthFair: 'Moyen',
    passwordStrengthStrong: 'Fort',
    termsNotice:
      'En créant un compte, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.',
  },
  editor: {
    backToCvs: 'Retour à mes CV',
    contentTab: 'Contenu',
    designTab: 'Mise en forme',
    sectionsTab: 'Rubriques',
    letterTab: 'Lettre de motivation',
    addSection: 'Ajouter une rubrique',
    addItem: 'Ajouter',
    removeItem: 'Supprimer',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    sectionEnabled: 'Affichée',
    sectionHidden: 'Masquée',
    renameSection: 'Renommer',
    resetName: 'Rétablir l’intitulé',
    template: 'Modèle',
    accentColour: 'Couleur d’accentuation',
    headingFont: 'Police des titres',
    bodyFont: 'Police du texte',
    fontSize: 'Taille du texte',
    lineHeight: 'Interligne',
    pageMargin: 'Marge de page',
    sectionSpacing: 'Espacement des rubriques',
    paperSize: 'Format de page',
    dateFormat: 'Format des dates',
    headingStyle: 'Style des titres',
    resetDesign: 'Rétablir les réglages du modèle',
    zoom: 'Zoom',
    pageOf: (page, total) => `Page ${page} sur ${total}`,
    downloadPdf: 'Télécharger le PDF',
    preparingPdf: 'Préparation de votre PDF…',
    autoSaved: (when) => `Enregistré ${when}`,
  },
};

const DE: AppCopy = {
  common: {
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    duplicate: 'Duplizieren',
    rename: 'Umbenennen',
    edit: 'Bearbeiten',
    preview: 'Vorschau',
    download: 'Herunterladen',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    loading: 'Wird geladen…',
    retry: 'Erneut versuchen',
    confirm: 'Bestätigen',
    yes: 'Ja',
    no: 'Nein',
    free: 'Kostenlos',
    pro: 'Pro',
    upgrade: 'Auf Pro upgraden',
    somethingWentWrong: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    unsavedChanges: 'Sie haben nicht gespeicherte Änderungen.',
    language: 'Sprache',
  },
  nav: {
    dashboard: 'Übersicht',
    myCvs: 'Meine Lebensläufe',
    templates: 'Vorlagen',
    settings: 'Einstellungen',
    account: 'Konto',
    signOut: 'Abmelden',
    newCv: 'Neuer Lebenslauf',
    newCvShort: 'Neu',
    backToSite: 'Zurück zur Website',
  },
  dashboard: {
    title: 'Übersicht',
    greeting: (name) => (name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'),
    subtitle: 'Ihre Lebensläufe, Downloads und Ihr Konto auf einen Blick.',
    cvCount: (n) => (n === 1 ? '1 Lebenslauf' : `${n} Lebensläufe`),
    downloadsLeft: (n) =>
      n === 1 ? 'Noch 1 Download diesen Monat' : `Noch ${n} Downloads diesen Monat`,
    unlimited: 'Unbegrenzt',
    onFreePlan: 'Sie nutzen den kostenlosen Tarif',
    freePlanLimits: (cvs, downloads) =>
      `${cvs ?? 'Unbegrenzt viele'} Lebensläufe und ${downloads ?? 'unbegrenzt viele'} Downloads pro Monat.`,
    comparePlans: 'Tarife vergleichen',
    completeness: 'Vollständigkeit',
    emptyTitle: 'Sie haben noch keinen Lebenslauf erstellt',
    emptyBody: 'Vorlage wählen, ausfüllen, PDF herunterladen. Das dauert etwa zehn Minuten.',
    createFirst: 'Ersten Lebenslauf erstellen',
    recentCvs: 'Zuletzt bearbeitet',
    viewAll: 'Alle anzeigen',
    lastEdited: (when) => `Bearbeitet ${when}`,
    untitled: 'Unbenannter Lebenslauf',
  },
  cvs: {
    title: 'Meine Lebensläufe',
    subtitle: 'Alles, was Sie geschrieben haben — bereit für die nächste Bewerbung.',
    newCv: 'Neuer Lebenslauf',
    startBlank: 'Leer beginnen',
    startBlankHint: 'Ein leeres Dokument mit den üblichen Abschnitten, bereit zum Ausfüllen.',
    startExample: 'Mit einem Beispiel beginnen',
    startExampleHint:
      'Ein vollständiger Lebenslauf, den Sie kürzen können — hilfreich, um den Aufbau zu sehen.',
    chooseTemplate: 'Vorlage wählen',
    deleteTitle: 'Diesen Lebenslauf löschen?',
    deleteBody: (title) =>
      `„${title}“ wird endgültig entfernt. Das lässt sich nicht rückgängig machen.`,
    deleteConfirm: 'Endgültig löschen',
    duplicated: 'Kopie erstellt',
    shareTitle: 'Schreibgeschützten Link teilen',
    shareBody:
      'Wer den Link hat, kann diesen Lebenslauf ansehen. In Suchergebnissen erscheint er nicht.',
    shareCopy: 'Link kopieren',
    shareCopied: 'Link kopiert',
    shareStop: 'Teilen beenden',
    downloads: (n) => (n === 1 ? '1 Download' : `${n} Downloads`),
    documentLanguage: 'Sprache des Dokuments',
    documentLanguageHint:
      'Legt Abschnittsüberschriften und Datumsformat dieses Lebenslaufs fest. Die Sprache der Anwendung ändert sich dadurch nicht, und Ihre Texte bleiben unverändert.',
  },
  settings: {
    title: 'Einstellungen',
    subtitle: 'Ihr Profil, Ihr Tarif und die Voreinstellungen für neue Lebensläufe.',
    profileHeading: 'Profil',
    displayName: 'Name',
    email: 'E-Mail-Adresse',
    emailImmutable:
      'Ihre E-Mail-Adresse ist die, mit der Sie sich anmelden, und kann hier nicht geändert werden.',
    languageHeading: 'Sprache',
    languageHint:
      'Die Sprache dieser Übersicht und des Editors. Jeder Lebenslauf hat seine eigene Sprache, die am Dokument selbst eingestellt wird.',
    preferencesHeading: 'Voreinstellungen für neue Lebensläufe',
    paperSize: 'Papierformat',
    defaultTemplate: 'Standardvorlage',
    appDefault: 'Standard',
    marketingOptIn: 'Produkt-E-Mails',
    marketingOptInHint:
      'Gelegentliche E-Mails zu neuen Vorlagen und Funktionen. Höchstens eine pro Monat.',
    dangerHeading: 'Konto löschen',
    deleteAccount: 'Mein Konto löschen',
    deleteAccountHint:
      'Entfernt Ihr Konto und alle darin enthaltenen Lebensläufe. Das lässt sich nicht rückgängig machen.',
    planHeading: 'Tarif',
    currentPlan: 'Aktueller Tarif',
    manageBilling: 'Zahlungen verwalten',
  },
  auth: {
    signIn: 'Anmelden',
    signInSubtitle: 'Willkommen zurück — machen Sie dort weiter, wo Sie aufgehört haben.',
    signUp: 'Konto erstellen',
    signUpSubtitle: 'Kostenlos starten. Ohne Kreditkarte, ohne Testfrist.',
    emailLabel: 'E-Mail-Adresse',
    passwordLabel: 'Passwort',
    nameLabel: 'Ihr Name',
    forgotPassword: 'Passwort vergessen?',
    forgotPasswordTitle: 'Passwort zurücksetzen',
    forgotPasswordSubtitle: 'Wir senden Ihnen einen Link, um ein neues zu vergeben.',
    sendResetLink: 'Link senden',
    resetLinkSent:
      'Falls zu dieser Adresse ein Konto besteht, ist ein Link zum Zurücksetzen unterwegs.',
    noAccount: 'Noch kein Konto?',
    haveAccount: 'Sie haben bereits ein Konto?',
    continueWithGoogle: 'Mit Google fortfahren',
    or: 'oder',
    verifyTitle: 'Bestätigen Sie Ihre E-Mail-Adresse',
    verifyBody: (email) =>
      `Wir haben einen Bestätigungslink an ${email} gesendet. Öffnen Sie ihn, um die Einrichtung abzuschließen.`,
    resendVerification: 'Erneut senden',
    verificationSent: 'Gesendet — bitte prüfen Sie Ihren Posteingang.',
    passwordStrengthWeak: 'Schwach',
    passwordStrengthFair: 'Mittel',
    passwordStrengthStrong: 'Stark',
    termsNotice:
      'Mit der Erstellung eines Kontos stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu.',
  },
  editor: {
    backToCvs: 'Zurück zu meinen Lebensläufen',
    contentTab: 'Inhalt',
    designTab: 'Gestaltung',
    sectionsTab: 'Abschnitte',
    letterTab: 'Anschreiben',
    addSection: 'Abschnitt hinzufügen',
    addItem: 'Hinzufügen',
    removeItem: 'Entfernen',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    sectionEnabled: 'Sichtbar',
    sectionHidden: 'Ausgeblendet',
    renameSection: 'Umbenennen',
    resetName: 'Bezeichnung zurücksetzen',
    template: 'Vorlage',
    accentColour: 'Akzentfarbe',
    headingFont: 'Schrift der Überschriften',
    bodyFont: 'Schrift des Fließtexts',
    fontSize: 'Schriftgröße',
    lineHeight: 'Zeilenabstand',
    pageMargin: 'Seitenrand',
    sectionSpacing: 'Abstand zwischen Abschnitten',
    paperSize: 'Papierformat',
    dateFormat: 'Datumsformat',
    headingStyle: 'Stil der Überschriften',
    resetDesign: 'Auf Vorlagenstandard zurücksetzen',
    zoom: 'Zoom',
    pageOf: (page, total) => `Seite ${page} von ${total}`,
    downloadPdf: 'PDF herunterladen',
    preparingPdf: 'Ihr PDF wird vorbereitet…',
    autoSaved: (when) => `Gespeichert ${when}`,
  },
};

export const APP_COPY: Record<Locale, AppCopy> = { en: EN, fr: FR, de: DE };

/** The strings for `locale`. Typed, so a missing key is a build error, not a blank label. */
export function appCopy(locale: Locale): AppCopy {
  return APP_COPY[locale];
}
