import type { PhotoErrorInfo } from '../../cv/photo-upload';
import type { Locale } from '../locales';

/**
 * The strings that appear everywhere — buttons, states, navigation.
 *
 * Kept separate from the area modules because these are the ones most likely to be reached
 * for from a screen that has no copy of its own, and because a change here shows up in
 * thirty places at once.
 */

/**
 * Megabytes to one decimal.
 *
 * The separator is a parameter because French and German write 6,3 where English writes
 * 6.3, and a size that reads as a foreign number undermines the sentence around it.
 */
const megabytes = (bytes: number, decimalSeparator = '.'): string =>
  (bytes / 1024 / 1024).toFixed(1).replace('.', decimalSeparator);

export interface ChromeCopy {
  common: {
    notifications: string;
    dismissNotification: string;
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
    /** The dialog dismiss button, which needs to say more than plain "Close". */
    closeDialog: string;
    /** Fallback name for a progress meter that has no visible label of its own. */
    progress: string;
  };
  /** Accessible names the shared form primitives build out of a field's own label. */
  field: {
    colourPicker: (label: string) => string;
    hexValue: (label: string) => string;
    usePreset: (preset: string) => string;
  };
  photo: {
    /**
     * The message for a refused profile photo, chosen by `PhotoError.code`.
     *
     * A function rather than a table because the size limit has to name the size that was
     * refused — "too large" on its own leaves the user guessing how much to cut — and
     * because that number is not written the same way in all three languages.
     */
    error: (error: PhotoErrorInfo) => string;
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
}

const EN: ChromeCopy = {
  common: {
    notifications: 'Notifications',
    dismissNotification: 'Dismiss notification',
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
    closeDialog: 'Close dialog',
    progress: 'Progress',
  },
  field: {
    colourPicker: (label) => `${label} colour picker`,
    hexValue: (label) => `${label} hex value`,
    usePreset: (preset) => `Use ${preset}`,
  },
  photo: {
    error: ({ code, bytes }) =>
      code === 'tooLarge'
        ? `That image is ${megabytes(bytes)} MB. Please choose one under 8 MB.`
        : {
            unsupportedType:
              'That file is not an image we can use. Choose a JPEG, PNG, WebP or AVIF.',
            unreadable: 'That image could not be read. It may be corrupted — try another.',
            processingFailed: 'Your browser could not process the image.',
            tooLargeAfterResize: 'That image is too large to store even after resizing.',
          }[code],
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
};

const FR: ChromeCopy = {
  common: {
    notifications: 'Notifications',
    dismissNotification: 'Fermer la notification',
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
    closeDialog: 'Fermer la boîte de dialogue',
    progress: 'Progression',
  },
  field: {
    colourPicker: (label) => `Sélecteur de couleur : ${label}`,
    hexValue: (label) => `Valeur hexadécimale : ${label}`,
    usePreset: (preset) => `Utiliser ${preset}`,
  },
  photo: {
    error: ({ code, bytes }) =>
      code === 'tooLarge'
        ? `Cette image fait ${megabytes(bytes, ',')} Mo. Choisissez-en une de moins de 8 Mo.`
        : {
            unsupportedType:
              'Ce fichier n’est pas une image utilisable. Choisissez un JPEG, PNG, WebP ou AVIF.',
            unreadable:
              'Cette image n’a pas pu être lue. Elle est peut-être endommagée — essayez-en une autre.',
            processingFailed: 'Votre navigateur n’a pas pu traiter l’image.',
            tooLargeAfterResize:
              'Cette image reste trop volumineuse pour être enregistrée, même après redimensionnement.',
          }[code],
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
};

const DE: ChromeCopy = {
  common: {
    notifications: 'Benachrichtigungen',
    dismissNotification: 'Benachrichtigung schließen',
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
    closeDialog: 'Dialog schließen',
    progress: 'Fortschritt',
  },
  field: {
    colourPicker: (label) => `Farbwähler: ${label}`,
    hexValue: (label) => `Hex-Wert: ${label}`,
    usePreset: (preset) => `${preset} verwenden`,
  },
  photo: {
    error: ({ code, bytes }) =>
      code === 'tooLarge'
        ? `Dieses Bild ist ${megabytes(bytes, ',')} MB groß. Bitte wählen Sie eines unter 8 MB.`
        : {
            unsupportedType:
              'Diese Datei ist kein verwendbares Bild. Wählen Sie ein JPEG, PNG, WebP oder AVIF.',
            unreadable:
              'Dieses Bild konnte nicht gelesen werden. Möglicherweise ist es beschädigt — versuchen Sie ein anderes.',
            processingFailed: 'Ihr Browser konnte das Bild nicht verarbeiten.',
            tooLargeAfterResize:
              'Dieses Bild ist auch nach der Verkleinerung zu groß zum Speichern.',
          }[code],
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
};

export const CHROME_COPY: Record<Locale, ChromeCopy> = { en: EN, fr: FR, de: DE };
