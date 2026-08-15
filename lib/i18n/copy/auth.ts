import type { Locale } from '../locales';

/**
 * Auth strings, in all three languages.
 *
 * Split out of the single `app-copy.ts` so that the areas of the product can be worked on
 * independently. `appCopy(locale)` still composes them into one object, so nothing that
 * reads a string has to know which file it came from.
 *
 * The rule for the translations is unchanged: write what a native speaker would write on
 * that screen, not what the English says, and where a convention differs rather than a
 * word, follow the convention.
 *
 * A handful of entries are sentence *fragments* — `notConfiguredTo`, `acceptAnd`,
 * `verifiedSuffix`. They exist because the rendered sentence has a link or a `<code>` in
 * the middle of it, and the three languages do not put the break in the same place. Each
 * set of fragments is written as one sentence per language and then cut, rather than
 * translated piece by piece, which is how a fragment ends up grammatical on its own and
 * wrong in place.
 */

export interface AuthCopy {
  auth: {
    /* ------------------------------------------------------------- shared labels */
    signIn: string;
    signInSubtitle: string;
    signUp: string;
    signUpSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
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

    /* ------------------------------------------------------------- page headings */
    signInHeading: string;
    signUpHeading: string;
    verifySubtitle: string;

    /* -------------------------------------------------- titles and descriptions */
    signInMetaDescription: (brand: string) => string;
    signUpMetaDescription: (brand: string) => string;
    forgotPasswordMetaDescription: (brand: string) => string;
    verifyMetaTitle: string;
    verifyMetaDescription: (brand: string) => string;

    /* --------------------------------------------------------- the auth shell */
    browseTemplates: string;
    footerPrivacy: string;
    footerTerms: string;
    footerContact: string;
    livePreview: string;
    livePreviewNote: string;
    panelHeading: string;
    pointTemplatesTitle: (count: number) => string;
    pointTemplatesBody: string;
    pointPrintTitle: string;
    pointPrintBody: string;
    pointFreeTitle: string;
    pointFreeBody: string;
    panelSecurityNote: (brand: string) => string;

    /* ------------------------------------------------------------- sign-up page */
    startingWith: string;
    changeTemplateAnytime: string;

    /* ------------------------------------------------------ provider and divider */
    signInWithGoogle: string;
    signUpWithGoogle: string;
    orContinueWithEmail: string;
    orSignUpWithEmail: string;

    /* ------------------------------------------------ Firebase not configured */
    notConfiguredTitle: string;
    notConfiguredIntro: string;
    notConfiguredTo: string;
    notConfiguredFill: string;
    notConfiguredRestart: string;
    notConfiguredStillWorks: string;
    notConfiguredBrowseLink: string;

    /* ---------------------------------------------------------- password field */
    showPassword: string;
    hidePassword: string;

    /* --------------------------------------------------------- strength meter */
    passwordStrengthTooShort: string;
    passwordStrengthGood: string;
    checkLength: string;
    checkLengthMissing: string;
    checkCase: string;
    checkCaseMissing: string;
    checkDigit: string;
    checkDigitMissing: string;
    checkSymbol: string;
    checkSymbolMissing: string;
    checkMet: string;
    checkNotMet: string;
    /** Conjunction for the spoken list of unmet requirements: "a number *and* a symbol". */
    listAnd: string;
    passwordStrengthEmpty: string;
    passwordStrengthSummary: (level: string) => string;
    passwordStrengthMissing: (list: string) => string;
    passwordStrengthAllMet: string;

    /* -------------------------------------------------------------- validation */
    thingsToFix: (count: number) => string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    nameRequired: string;
    emailRequiredSignUp: string;
    passwordTooShort: (min: number) => string;
    confirmRequired: string;
    confirmMismatch: string;
    acceptRequired: string;

    /* --------------------------------------------------------------- sign in */
    signInFailedTitle: string;
    createFreeAccount: string;

    /* --------------------------------------------------------------- sign up */
    signUpFailedTitle: string;
    acceptIntro: string;
    acceptAnd: string;
    termsOfService: string;
    privacyPolicy: string;
    marketingLabel: string;
    marketingHint: string;
    createMyFreeAccount: string;

    /* -------------------------------------------------------- password reset */
    resetFailedTitle: string;
    checkInbox: string;
    resetSentTo: string;
    resetSentValidity: string;
    resetSentSpam: string;
    useDifferentAddress: string;
    backToSignIn: string;
    rememberedIt: string;
    emailAccountHint: (brand: string) => string;

    /* ------------------------------------------------------- e-mail confirmation */
    notSignedInTitle: string;
    notSignedInBody: string;
    createAnAccount: string;
    verifiedTitle: string;
    verifiedSuffix: string;
    goToDashboard: string;
    resendFailedTitle: string;
    resendSentTo: (email: string) => string;
    yourInbox: string;
    waitingForConfirmation: string;
    verifyOpenLink: string;
    whatThisChanges: string;
    verifyPointEditor: string;
    verifyPointReset: string;
    verifyPointContact: (brand: string) => string;
    verifiedContinue: string;
    resendIn: (seconds: number) => string;
    resendAvailable: string;
    wrongAddress: string;

    /* ------------------------------------------------------------ failure text */
    errorUserDisabled: string;
    errorBadCredentials: string;
    errorEmailInUse: string;
    errorWeakPassword: string;
    errorTooManyRequests: string;
    errorPopupClosed: string;
    errorPopupBlocked: string;
    errorOperationNotAllowed: string;
    errorNetwork: string;
    errorSessionFailed: string;
    errorResendSignedOut: string;
  };
}

const EN: AuthCopy = {
  auth: {
    signIn: 'Sign in',
    signInSubtitle: 'Sign in to pick up your CV where you left off.',
    signUp: 'Create your account',
    signUpSubtitle:
      'Two saved CVs and five PDF downloads a month, free forever. No card required.',
    emailLabel: 'E-mail address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm password',
    nameLabel: 'Full name',
    forgotPassword: 'Forgot your password?',
    forgotPasswordTitle: 'Reset your password',
    forgotPasswordSubtitle:
      'Give us the address on your account and we will e-mail you a link to choose a new password. Your CVs are untouched.',
    sendResetLink: 'Send reset link',
    resetLinkSent: 'If an account exists for that address, a reset link is on its way.',
    noAccount: 'New here?',
    haveAccount: 'Already have an account?',
    continueWithGoogle: 'Continue with Google',
    or: 'or',
    verifyTitle: 'Confirm your e-mail',
    verifyBody: (email) => `We sent a confirmation link to ${email}. Open it to finish setting up.`,
    resendVerification: 'Resend verification e-mail',
    verificationSent: 'Sent — check your inbox.',
    passwordStrengthWeak: 'Weak',
    passwordStrengthFair: 'Fair',
    passwordStrengthStrong: 'Strong',
    termsNotice: 'By creating an account you agree to our terms and privacy policy.',

    signInHeading: 'Welcome back',
    signUpHeading: 'Create your free account',
    verifySubtitle:
      'We sent you a one-time link. Opening it proves the address is yours and secures your account.',

    signInMetaDescription: (brand) =>
      `Sign in to your ${brand} account to edit your CVs and download them as PDF.`,
    signUpMetaDescription: (brand) =>
      `Create a free ${brand} account and build a professional CV in minutes.`,
    forgotPasswordMetaDescription: (brand) =>
      `Request a password reset link for your ${brand} account.`,
    verifyMetaTitle: 'Confirm your e-mail address',
    verifyMetaDescription: (brand) => `Confirm the e-mail address on your ${brand} account.`,

    browseTemplates: 'Browse templates',
    footerPrivacy: 'Privacy',
    footerTerms: 'Terms',
    footerContact: 'Contact',
    livePreview: 'Live preview',
    livePreviewNote:
      'Every template is rendered by the same engine that writes your PDF — this is a real document, not a mock-up.',
    panelHeading: 'A CV a recruiter can read in six seconds.',
    pointTemplatesTitle: (count) => `${count} templates, all recruiter-ready`,
    pointTemplatesBody:
      'Modern, classic, creative and ATS-safe layouts. Switch between them at any time without retyping a single line.',
    pointPrintTitle: 'What you see is what prints',
    pointPrintBody:
      'The preview is laid out at true page size, so the PDF you download matches the screen exactly — no surprise second page.',
    pointFreeTitle: 'Free to start, yours to keep',
    pointFreeBody:
      'Build and download a complete CV on the free plan. No credit card, no trial timer, and you can delete everything in one click.',
    panelSecurityNote: (brand) =>
      `Sign-in is handled by Google Firebase Authentication — ${brand} never sees your Google password, and your CVs are private until you choose to share them.`,

    startingWith: 'You are starting with',
    changeTemplateAnytime: 'You can change template at any time.',

    signInWithGoogle: 'Sign in with Google',
    signUpWithGoogle: 'Sign up with Google',
    orContinueWithEmail: 'or continue with e-mail',
    orSignUpWithEmail: 'or sign up with e-mail',

    notConfiguredTitle: 'Sign-in is not configured on this deployment',
    notConfiguredIntro:
      'No Firebase credentials were found, so accounts cannot be created or used yet. Copy',
    notConfiguredTo: 'to',
    notConfiguredFill: ', fill in the',
    notConfiguredRestart: 'values and restart the server.',
    notConfiguredStillWorks: 'Everything that does not need an account still works —',
    notConfiguredBrowseLink: 'browse the templates',

    showPassword: 'Show password',
    hidePassword: 'Hide password',

    passwordStrengthTooShort: 'Too short',
    passwordStrengthGood: 'Good',
    checkLength: 'At least 8 characters',
    checkLengthMissing: '8 characters',
    checkCase: 'Upper and lower case',
    checkCaseMissing: 'an upper-case and a lower-case letter',
    checkDigit: 'A number',
    checkDigitMissing: 'a number',
    checkSymbol: 'A symbol (!, ?, £…)',
    checkSymbolMissing: 'a symbol',
    checkMet: '— met',
    checkNotMet: '— not met',
    listAnd: 'and',
    passwordStrengthEmpty: 'Password strength: nothing typed yet.',
    passwordStrengthSummary: (level) => `Password strength: ${level}.`,
    passwordStrengthMissing: (list) => `Still missing ${list}.`,
    passwordStrengthAllMet: 'All four requirements met.',

    thingsToFix: (count) => `There are ${count} things to fix below.`,
    emailRequired: 'Enter the e-mail address you signed up with.',
    emailInvalid: 'That does not look like a valid e-mail address.',
    passwordRequired: 'Enter your password.',
    nameRequired: 'Tell us the name that should appear on your CV.',
    emailRequiredSignUp: 'An e-mail address is required — it is how you sign in.',
    passwordTooShort: (min) => `Use at least ${min} characters.`,
    confirmRequired: 'Type the password once more.',
    confirmMismatch: 'The two passwords do not match.',
    acceptRequired: 'Please accept the terms and the privacy policy to continue.',

    signInFailedTitle: 'Could not sign you in',
    createFreeAccount: 'Create a free account',

    signUpFailedTitle: 'Could not create your account',
    acceptIntro: 'I agree to the',
    acceptAnd: 'and the',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    marketingLabel: 'Send me CV writing tips and product news',
    marketingHint: 'At most once a month. You can turn this off in Settings at any time.',
    createMyFreeAccount: 'Create my free account',

    resetFailedTitle: 'Could not send the reset link',
    checkInbox: 'Check your inbox',
    resetSentTo: 'We used',
    resetSentValidity: '. The link is valid for one hour and can only be used once.',
    resetSentSpam:
      'Nothing after a few minutes? Look in your spam or promotions folder — automated mail often lands there — and check the address above for a typo.',
    useDifferentAddress: 'Use a different address',
    backToSignIn: 'Back to sign in',
    rememberedIt: 'Remembered it?',
    emailAccountHint: (brand) => `The address on your ${brand} account.`,

    notSignedInTitle: 'You are not signed in',
    notSignedInBody:
      'Verification links belong to an account, so sign in first and we will pick up where you left off.',
    createAnAccount: 'Create an account',
    verifiedTitle: 'Your e-mail address is confirmed',
    verifiedSuffix: 'is verified — there is nothing left to do here.',
    goToDashboard: 'Go to your dashboard',
    resendFailedTitle: 'That did not work',
    resendSentTo: (email) => `A new link is on its way to ${email}.`,
    yourInbox: 'your inbox',
    waitingForConfirmation: 'Waiting for confirmation',
    verifyOpenLink:
      'Open the link in that message to confirm the address is yours. It can take a minute to arrive, and it is often filed as spam or promotions.',
    whatThisChanges: 'What this changes',
    verifyPointEditor:
      'Nothing in the editor is locked: you can keep building, customising and downloading CVs while the address is unconfirmed.',
    verifyPointReset:
      'A confirmed address is the only way back in if you forget your password — a reset link sent to a mistyped address lands in a stranger’s inbox.',
    verifyPointContact: (brand) =>
      `It is also how ${brand} reaches you about a receipt or a sign-in from a new device.`,
    verifiedContinue: 'I’ve verified — continue',
    resendIn: (seconds) => `Resend in ${seconds}s`,
    resendAvailable: 'You can request another verification e-mail now.',
    wrongAddress: 'Wrong address, or not your account?',

    errorUserDisabled:
      'This account has been disabled. Contact support if you think that is a mistake.',
    errorBadCredentials: 'That e-mail and password combination does not match an account.',
    errorEmailInUse: 'An account already exists with that e-mail. Try signing in instead.',
    errorWeakPassword: 'Choose a password of at least 8 characters.',
    errorTooManyRequests:
      'Too many attempts. Wait a few minutes and try again, or reset your password.',
    errorPopupClosed: 'The Google sign-in window was closed before finishing.',
    errorPopupBlocked:
      'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.',
    errorOperationNotAllowed: 'That sign-in method is not enabled for this project yet.',
    errorNetwork: 'Network problem — check your connection and try again.',
    errorSessionFailed: 'Could not start your session. Please try again.',
    errorResendSignedOut: 'Sign in again to resend the verification e-mail.',
  },
};

const FR: AuthCopy = {
  auth: {
    signIn: 'Se connecter',
    signInSubtitle: 'Connectez-vous pour reprendre votre CV là où vous l’avez laissé.',
    signUp: 'Créer votre compte',
    signUpSubtitle:
      'Deux CV enregistrés et cinq téléchargements PDF par mois, gratuits à vie. Sans carte bancaire.',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'vous@exemple.com',
    passwordLabel: 'Mot de passe',
    confirmPasswordLabel: 'Confirmer le mot de passe',
    nameLabel: 'Nom complet',
    forgotPassword: 'Mot de passe oublié ?',
    forgotPasswordTitle: 'Réinitialiser votre mot de passe',
    forgotPasswordSubtitle:
      'Indiquez l’adresse de votre compte et nous vous enverrons un lien pour choisir un nouveau mot de passe. Vos CV restent intacts.',
    sendResetLink: 'Envoyer le lien',
    resetLinkSent: 'Si un compte existe pour cette adresse, un lien de réinitialisation est en route.',
    noAccount: 'Vous êtes nouveau ?',
    haveAccount: 'Vous avez déjà un compte ?',
    continueWithGoogle: 'Continuer avec Google',
    or: 'ou',
    verifyTitle: 'Confirmez votre adresse e-mail',
    verifyBody: (email) =>
      `Nous avons envoyé un lien de confirmation à ${email}. Ouvrez-le pour terminer la configuration.`,
    resendVerification: 'Renvoyer l’e-mail de confirmation',
    verificationSent: 'Envoyé — vérifiez votre boîte de réception.',
    passwordStrengthWeak: 'Faible',
    passwordStrengthFair: 'Moyen',
    passwordStrengthStrong: 'Fort',
    termsNotice:
      'En créant un compte, vous acceptez nos conditions d’utilisation et notre politique de confidentialité.',

    signInHeading: 'Bon retour',
    signUpHeading: 'Créez votre compte gratuit',
    verifySubtitle:
      'Nous vous avons envoyé un lien à usage unique. En l’ouvrant, vous prouvez que l’adresse est bien la vôtre et vous sécurisez votre compte.',

    signInMetaDescription: (brand) =>
      `Connectez-vous à votre compte ${brand} pour modifier vos CV et les télécharger en PDF.`,
    signUpMetaDescription: (brand) =>
      `Créez un compte ${brand} gratuit et rédigez un CV professionnel en quelques minutes.`,
    forgotPasswordMetaDescription: (brand) =>
      `Demandez un lien de réinitialisation du mot de passe de votre compte ${brand}.`,
    verifyMetaTitle: 'Confirmez votre adresse e-mail',
    verifyMetaDescription: (brand) => `Confirmez l’adresse e-mail de votre compte ${brand}.`,

    browseTemplates: 'Voir les modèles',
    footerPrivacy: 'Confidentialité',
    footerTerms: 'Conditions',
    footerContact: 'Contact',
    livePreview: 'Aperçu en direct',
    livePreviewNote:
      'Chaque modèle est produit par le moteur qui génère votre PDF : c’est un vrai document, pas une maquette.',
    panelHeading: 'Un CV qu’un recruteur lit en six secondes.',
    pointTemplatesTitle: (count) => `${count} modèles, tous prêts pour les recruteurs`,
    pointTemplatesBody:
      'Des mises en page modernes, classiques, créatives et compatibles ATS. Changez-en à tout moment sans retaper une seule ligne.',
    pointPrintTitle: 'Ce que vous voyez est ce qui s’imprime',
    pointPrintBody:
      'L’aperçu est composé à la taille réelle de la page : le PDF téléchargé correspond exactement à l’écran, sans deuxième page surprise.',
    pointFreeTitle: 'Gratuit au départ, à vous pour toujours',
    pointFreeBody:
      'Créez et téléchargez un CV complet avec l’offre gratuite. Sans carte bancaire, sans compte à rebours, et vous pouvez tout supprimer en un clic.',
    panelSecurityNote: (brand) =>
      `La connexion est assurée par Google Firebase Authentication : ${brand} ne voit jamais votre mot de passe Google, et vos CV restent privés tant que vous ne décidez pas de les partager.`,

    startingWith: 'Vous commencez avec',
    changeTemplateAnytime: 'Vous pouvez changer de modèle à tout moment.',

    signInWithGoogle: 'Se connecter avec Google',
    signUpWithGoogle: 'S’inscrire avec Google',
    orContinueWithEmail: 'ou continuer par e-mail',
    orSignUpWithEmail: 'ou s’inscrire par e-mail',

    notConfiguredTitle: 'La connexion n’est pas configurée sur ce déploiement',
    notConfiguredIntro:
      'Aucun identifiant Firebase n’a été trouvé : les comptes ne peuvent pas encore être créés ni utilisés. Copiez',
    notConfiguredTo: 'vers',
    notConfiguredFill: ', renseignez les valeurs',
    notConfiguredRestart: 'puis redémarrez le serveur.',
    notConfiguredStillWorks: 'Tout ce qui ne nécessite pas de compte fonctionne toujours —',
    notConfiguredBrowseLink: 'parcourez les modèles',

    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',

    passwordStrengthTooShort: 'Trop court',
    passwordStrengthGood: 'Bon',
    checkLength: 'Au moins 8 caractères',
    checkLengthMissing: '8 caractères',
    checkCase: 'Majuscules et minuscules',
    checkCaseMissing: 'une majuscule et une minuscule',
    checkDigit: 'Un chiffre',
    checkDigitMissing: 'un chiffre',
    checkSymbol: 'Un symbole (!, ?, €…)',
    checkSymbolMissing: 'un symbole',
    checkMet: '— rempli',
    checkNotMet: '— non rempli',
    listAnd: 'et',
    passwordStrengthEmpty: 'Force du mot de passe : rien de saisi pour l’instant.',
    passwordStrengthSummary: (level) => `Force du mot de passe : ${level}.`,
    passwordStrengthMissing: (list) => `Il manque encore ${list}.`,
    passwordStrengthAllMet: 'Les quatre critères sont remplis.',

    thingsToFix: (count) => `Il y a ${count} points à corriger ci-dessous.`,
    emailRequired: 'Saisissez l’adresse e-mail utilisée à l’inscription.',
    emailInvalid: 'Cette adresse e-mail ne semble pas valide.',
    passwordRequired: 'Saisissez votre mot de passe.',
    nameRequired: 'Indiquez le nom qui doit figurer sur votre CV.',
    emailRequiredSignUp:
      'Une adresse e-mail est nécessaire : c’est avec elle que vous vous connecterez.',
    passwordTooShort: (min) => `Utilisez au moins ${min} caractères.`,
    confirmRequired: 'Saisissez à nouveau le mot de passe.',
    confirmMismatch: 'Les deux mots de passe ne correspondent pas.',
    acceptRequired:
      'Veuillez accepter les conditions d’utilisation et la politique de confidentialité pour continuer.',

    signInFailedTitle: 'Connexion impossible',
    createFreeAccount: 'Créer un compte gratuit',

    signUpFailedTitle: 'Création du compte impossible',
    acceptIntro: 'J’accepte les',
    acceptAnd: 'et la',
    termsOfService: 'conditions d’utilisation',
    privacyPolicy: 'politique de confidentialité',
    marketingLabel: 'Envoyez-moi des conseils de rédaction de CV et les nouveautés du produit',
    marketingHint:
      'Une fois par mois au maximum. Vous pouvez désactiver cette option à tout moment dans les Paramètres.',
    createMyFreeAccount: 'Créer mon compte gratuit',

    resetFailedTitle: 'Envoi du lien impossible',
    checkInbox: 'Vérifiez votre boîte de réception',
    resetSentTo: 'Nous avons utilisé',
    resetSentValidity: '. Le lien est valable une heure et ne peut servir qu’une fois.',
    resetSentSpam:
      'Toujours rien après quelques minutes ? Regardez dans vos courriers indésirables ou vos promotions — les envois automatiques y atterrissent souvent — et vérifiez qu’il n’y a pas de faute de frappe dans l’adresse ci-dessus.',
    useDifferentAddress: 'Utiliser une autre adresse',
    backToSignIn: 'Retour à la connexion',
    rememberedIt: 'Ça vous revient ?',
    emailAccountHint: (brand) => `L’adresse de votre compte ${brand}.`,

    notSignedInTitle: 'Vous n’êtes pas connecté',
    notSignedInBody:
      'Les liens de confirmation sont liés à un compte : connectez-vous d’abord et nous reprendrons où vous en étiez.',
    createAnAccount: 'Créer un compte',
    verifiedTitle: 'Votre adresse e-mail est confirmée',
    verifiedSuffix: 'est vérifiée — il n’y a plus rien à faire ici.',
    goToDashboard: 'Aller à votre tableau de bord',
    resendFailedTitle: 'Cela n’a pas fonctionné',
    resendSentTo: (email) => `Un nouveau lien est en route vers ${email}.`,
    yourInbox: 'votre boîte de réception',
    waitingForConfirmation: 'En attente de confirmation',
    verifyOpenLink:
      'Ouvrez le lien contenu dans ce message pour confirmer que l’adresse est bien la vôtre. Il peut mettre une minute à arriver et finit souvent dans les indésirables ou les promotions.',
    whatThisChanges: 'Ce que cela change',
    verifyPointEditor:
      'Rien n’est bloqué dans l’éditeur : vous pouvez continuer à créer, personnaliser et télécharger des CV tant que l’adresse n’est pas confirmée.',
    verifyPointReset:
      'Une adresse confirmée est le seul moyen de revenir si vous oubliez votre mot de passe : un lien envoyé à une adresse mal saisie atterrit chez un inconnu.',
    verifyPointContact: (brand) =>
      `C’est aussi ainsi que ${brand} vous joint pour un reçu ou une connexion depuis un nouvel appareil.`,
    verifiedContinue: 'C’est confirmé — continuer',
    resendIn: (seconds) => `Renvoyer dans ${seconds} s`,
    resendAvailable: 'Vous pouvez demander un nouvel e-mail de confirmation.',
    wrongAddress: 'Mauvaise adresse, ou ce n’est pas votre compte ?',

    errorUserDisabled:
      'Ce compte a été désactivé. Contactez le support si vous pensez qu’il s’agit d’une erreur.',
    errorBadCredentials:
      'Cette combinaison d’adresse e-mail et de mot de passe ne correspond à aucun compte.',
    errorEmailInUse:
      'Un compte existe déjà avec cette adresse e-mail. Essayez plutôt de vous connecter.',
    errorWeakPassword: 'Choisissez un mot de passe d’au moins 8 caractères.',
    errorTooManyRequests:
      'Trop de tentatives. Attendez quelques minutes et réessayez, ou réinitialisez votre mot de passe.',
    errorPopupClosed: 'La fenêtre de connexion Google a été fermée avant la fin.',
    errorPopupBlocked:
      'Votre navigateur a bloqué la fenêtre de connexion Google. Autorisez les fenêtres contextuelles pour ce site, puis réessayez.',
    errorOperationNotAllowed:
      'Cette méthode de connexion n’est pas encore activée pour ce projet.',
    errorNetwork: 'Problème de réseau — vérifiez votre connexion et réessayez.',
    errorSessionFailed: 'Impossible de démarrer votre session. Veuillez réessayer.',
    errorResendSignedOut: 'Reconnectez-vous pour renvoyer l’e-mail de confirmation.',
  },
};

const DE: AuthCopy = {
  auth: {
    signIn: 'Anmelden',
    signInSubtitle: 'Melden Sie sich an und schreiben Sie dort weiter, wo Sie aufgehört haben.',
    signUp: 'Konto erstellen',
    signUpSubtitle:
      'Zwei gespeicherte Lebensläufe und fünf PDF-Downloads pro Monat, dauerhaft kostenlos. Ohne Kreditkarte.',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@beispiel.de',
    passwordLabel: 'Passwort',
    confirmPasswordLabel: 'Passwort bestätigen',
    nameLabel: 'Vollständiger Name',
    forgotPassword: 'Passwort vergessen?',
    forgotPasswordTitle: 'Passwort zurücksetzen',
    forgotPasswordSubtitle:
      'Nennen Sie uns die Adresse Ihres Kontos, und wir senden Ihnen einen Link, um ein neues Passwort zu wählen. Ihre Lebensläufe bleiben unberührt.',
    sendResetLink: 'Link senden',
    resetLinkSent:
      'Falls zu dieser Adresse ein Konto besteht, ist ein Link zum Zurücksetzen unterwegs.',
    noAccount: 'Neu hier?',
    haveAccount: 'Sie haben bereits ein Konto?',
    continueWithGoogle: 'Mit Google fortfahren',
    or: 'oder',
    verifyTitle: 'Bestätigen Sie Ihre E-Mail-Adresse',
    verifyBody: (email) =>
      `Wir haben einen Bestätigungslink an ${email} gesendet. Öffnen Sie ihn, um die Einrichtung abzuschließen.`,
    resendVerification: 'Bestätigungs-E-Mail erneut senden',
    verificationSent: 'Gesendet — bitte prüfen Sie Ihren Posteingang.',
    passwordStrengthWeak: 'Schwach',
    passwordStrengthFair: 'Mittel',
    passwordStrengthStrong: 'Stark',
    termsNotice:
      'Mit der Erstellung eines Kontos stimmen Sie unseren Nutzungsbedingungen und der Datenschutzerklärung zu.',

    signInHeading: 'Willkommen zurück',
    signUpHeading: 'Erstellen Sie Ihr kostenloses Konto',
    verifySubtitle:
      'Wir haben Ihnen einen einmaligen Link geschickt. Wenn Sie ihn öffnen, bestätigen Sie, dass die Adresse Ihnen gehört, und sichern Ihr Konto.',

    signInMetaDescription: (brand) =>
      `Melden Sie sich bei Ihrem ${brand}-Konto an, um Ihre Lebensläufe zu bearbeiten und als PDF herunterzuladen.`,
    signUpMetaDescription: (brand) =>
      `Erstellen Sie ein kostenloses ${brand}-Konto und schreiben Sie in wenigen Minuten einen professionellen Lebenslauf.`,
    forgotPasswordMetaDescription: (brand) =>
      `Fordern Sie einen Link zum Zurücksetzen des Passworts für Ihr ${brand}-Konto an.`,
    verifyMetaTitle: 'E-Mail-Adresse bestätigen',
    verifyMetaDescription: (brand) => `Bestätigen Sie die E-Mail-Adresse Ihres ${brand}-Kontos.`,

    browseTemplates: 'Vorlagen ansehen',
    footerPrivacy: 'Datenschutz',
    footerTerms: 'AGB',
    footerContact: 'Kontakt',
    livePreview: 'Live-Vorschau',
    livePreviewNote:
      'Jede Vorlage wird von derselben Engine gerendert, die Ihr PDF erzeugt — das hier ist ein echtes Dokument, keine Attrappe.',
    panelHeading: 'Ein Lebenslauf, den Personalverantwortliche in sechs Sekunden erfassen.',
    pointTemplatesTitle: (count) => `${count} Vorlagen, alle bewerbungsfertig`,
    pointTemplatesBody:
      'Moderne, klassische, kreative und ATS-sichere Layouts. Wechseln Sie jederzeit, ohne eine einzige Zeile neu zu tippen.',
    pointPrintTitle: 'Was Sie sehen, wird gedruckt',
    pointPrintBody:
      'Die Vorschau ist in echter Seitengröße gesetzt, deshalb entspricht das heruntergeladene PDF genau dem Bildschirm — ohne überraschende zweite Seite.',
    pointFreeTitle: 'Kostenlos starten, dauerhaft behalten',
    pointFreeBody:
      'Erstellen und laden Sie einen vollständigen Lebenslauf im kostenlosen Tarif herunter. Ohne Kreditkarte, ohne Testfrist — und Sie können alles mit einem Klick löschen.',
    panelSecurityNote: (brand) =>
      `Die Anmeldung läuft über Google Firebase Authentication — ${brand} sieht Ihr Google-Passwort nie, und Ihre Lebensläufe bleiben privat, bis Sie sie selbst teilen.`,

    startingWith: 'Sie starten mit',
    changeTemplateAnytime: 'Sie können die Vorlage jederzeit wechseln.',

    signInWithGoogle: 'Mit Google anmelden',
    signUpWithGoogle: 'Mit Google registrieren',
    orContinueWithEmail: 'oder mit E-Mail fortfahren',
    orSignUpWithEmail: 'oder mit E-Mail registrieren',

    notConfiguredTitle: 'Die Anmeldung ist auf dieser Installation nicht konfiguriert',
    notConfiguredIntro:
      'Es wurden keine Firebase-Zugangsdaten gefunden, daher können noch keine Konten erstellt oder verwendet werden. Kopieren Sie',
    notConfiguredTo: 'nach',
    notConfiguredFill: ', tragen Sie die Werte für',
    notConfiguredRestart: 'ein und starten Sie den Server neu.',
    notConfiguredStillWorks: 'Alles, was kein Konto braucht, funktioniert weiterhin —',
    notConfiguredBrowseLink: 'sehen Sie sich die Vorlagen an',

    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort verbergen',

    passwordStrengthTooShort: 'Zu kurz',
    passwordStrengthGood: 'Gut',
    checkLength: 'Mindestens 8 Zeichen',
    checkLengthMissing: '8 Zeichen',
    checkCase: 'Groß- und Kleinbuchstaben',
    checkCaseMissing: 'ein Groß- und ein Kleinbuchstabe',
    checkDigit: 'Eine Ziffer',
    checkDigitMissing: 'eine Ziffer',
    checkSymbol: 'Ein Sonderzeichen (!, ?, €…)',
    checkSymbolMissing: 'ein Sonderzeichen',
    checkMet: '— erfüllt',
    checkNotMet: '— nicht erfüllt',
    listAnd: 'und',
    passwordStrengthEmpty: 'Passwortstärke: noch nichts eingegeben.',
    passwordStrengthSummary: (level) => `Passwortstärke: ${level}.`,
    passwordStrengthMissing: (list) => `Es fehlt noch: ${list}.`,
    passwordStrengthAllMet: 'Alle vier Anforderungen erfüllt.',

    thingsToFix: (count) => `Unten sind ${count} Punkte zu korrigieren.`,
    emailRequired: 'Geben Sie die E-Mail-Adresse ein, mit der Sie sich registriert haben.',
    emailInvalid: 'Das sieht nicht nach einer gültigen E-Mail-Adresse aus.',
    passwordRequired: 'Geben Sie Ihr Passwort ein.',
    nameRequired: 'Nennen Sie den Namen, der auf Ihrem Lebenslauf stehen soll.',
    emailRequiredSignUp: 'Eine E-Mail-Adresse ist erforderlich — damit melden Sie sich an.',
    passwordTooShort: (min) => `Verwenden Sie mindestens ${min} Zeichen.`,
    confirmRequired: 'Geben Sie das Passwort noch einmal ein.',
    confirmMismatch: 'Die beiden Passwörter stimmen nicht überein.',
    acceptRequired:
      'Bitte akzeptieren Sie die Nutzungsbedingungen und die Datenschutzerklärung, um fortzufahren.',

    signInFailedTitle: 'Anmeldung nicht möglich',
    createFreeAccount: 'Kostenloses Konto erstellen',

    signUpFailedTitle: 'Konto konnte nicht erstellt werden',
    acceptIntro: 'Ich akzeptiere die',
    acceptAnd: 'und die',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzerklärung',
    marketingLabel: 'Schicken Sie mir Tipps zum Lebenslauf und Produktneuigkeiten',
    marketingHint:
      'Höchstens einmal im Monat. Sie können das jederzeit in den Einstellungen abschalten.',
    createMyFreeAccount: 'Mein kostenloses Konto erstellen',

    resetFailedTitle: 'Der Link konnte nicht gesendet werden',
    checkInbox: 'Prüfen Sie Ihren Posteingang',
    resetSentTo: 'Gesendet an',
    resetSentValidity: '. Der Link ist eine Stunde gültig und kann nur einmal verwendet werden.',
    resetSentSpam:
      'Nach ein paar Minuten immer noch nichts? Sehen Sie im Spam- oder Werbeordner nach — automatische E-Mails landen oft dort — und prüfen Sie die Adresse oben auf Tippfehler.',
    useDifferentAddress: 'Andere Adresse verwenden',
    backToSignIn: 'Zurück zur Anmeldung',
    rememberedIt: 'Doch wieder eingefallen?',
    emailAccountHint: (brand) => `Die Adresse Ihres ${brand}-Kontos.`,

    notSignedInTitle: 'Sie sind nicht angemeldet',
    notSignedInBody:
      'Bestätigungslinks gehören zu einem Konto — melden Sie sich zuerst an, dann machen wir dort weiter, wo Sie aufgehört haben.',
    createAnAccount: 'Konto erstellen',
    verifiedTitle: 'Ihre E-Mail-Adresse ist bestätigt',
    verifiedSuffix: 'ist bestätigt — hier gibt es nichts mehr zu tun.',
    goToDashboard: 'Zur Übersicht',
    resendFailedTitle: 'Das hat nicht geklappt',
    resendSentTo: (email) => `Ein neuer Link ist an ${email} unterwegs.`,
    yourInbox: 'Ihren Posteingang',
    waitingForConfirmation: 'Warten auf Bestätigung',
    verifyOpenLink:
      'Öffnen Sie den Link in dieser Nachricht, um zu bestätigen, dass die Adresse Ihnen gehört. Die E-Mail kann eine Minute brauchen und landet oft im Spam- oder Werbeordner.',
    whatThisChanges: 'Was sich dadurch ändert',
    verifyPointEditor:
      'Im Editor ist nichts gesperrt: Sie können weiter Lebensläufe erstellen, anpassen und herunterladen, solange die Adresse unbestätigt ist.',
    verifyPointReset:
      'Eine bestätigte Adresse ist der einzige Weg zurück, wenn Sie Ihr Passwort vergessen — ein Link an eine vertippte Adresse landet im Postfach einer fremden Person.',
    verifyPointContact: (brand) =>
      `So erreicht ${brand} Sie auch bei einer Rechnung oder einer Anmeldung von einem neuen Gerät.`,
    verifiedContinue: 'Ich habe bestätigt — weiter',
    resendIn: (seconds) => `Erneut senden in ${seconds} s`,
    resendAvailable: 'Sie können jetzt eine neue Bestätigungs-E-Mail anfordern.',
    wrongAddress: 'Falsche Adresse oder nicht Ihr Konto?',

    errorUserDisabled:
      'Dieses Konto wurde deaktiviert. Wenden Sie sich an den Support, wenn Sie das für einen Fehler halten.',
    errorBadCredentials: 'Diese Kombination aus E-Mail-Adresse und Passwort passt zu keinem Konto.',
    errorEmailInUse:
      'Mit dieser E-Mail-Adresse besteht bereits ein Konto. Melden Sie sich stattdessen an.',
    errorWeakPassword: 'Wählen Sie ein Passwort mit mindestens 8 Zeichen.',
    errorTooManyRequests:
      'Zu viele Versuche. Warten Sie einige Minuten und versuchen Sie es erneut, oder setzen Sie Ihr Passwort zurück.',
    errorPopupClosed: 'Das Google-Anmeldefenster wurde vorzeitig geschlossen.',
    errorPopupBlocked:
      'Ihr Browser hat das Google-Anmeldefenster blockiert. Erlauben Sie Pop-ups für diese Website und versuchen Sie es erneut.',
    errorOperationNotAllowed: 'Diese Anmeldemethode ist für dieses Projekt noch nicht aktiviert.',
    errorNetwork: 'Netzwerkproblem — prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    errorSessionFailed: 'Ihre Sitzung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.',
    errorResendSignedOut:
      'Melden Sie sich erneut an, um die Bestätigungs-E-Mail noch einmal zu senden.',
  },
};

export const AUTH_COPY: Record<Locale, AuthCopy> = { en: EN, fr: FR, de: DE };
