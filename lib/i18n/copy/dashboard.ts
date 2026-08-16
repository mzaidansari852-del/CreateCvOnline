import type { Locale } from '../locales';
import type { Plan } from '@/lib/plans';
import type { TemplateCategory } from '@/types/cv';
import type { PaymentStatus } from '@/types/payment';
import type { SubscriptionStatus } from '@/types/user';

/**
 * Dashboard strings, in all three languages.
 *
 * Split out of the single `app-copy.ts` so that the areas of the product can be worked on
 * independently. `appCopy(locale)` still composes them into one object, so nothing that
 * reads a string has to know which file it came from.
 *
 * The rule for the translations is unchanged: write what a native speaker would write on
 * that screen, not what the English says, and where a convention differs rather than a
 * word, follow the convention.
 */

/**
 * The completeness checks, named where their sentences live.
 *
 * The union is declared here rather than beside the checks in
 * `components/dashboard/completeness.ts` so the dependency runs components → lib and not
 * both ways. Keying `checkTodo` and `checkDone` by it is what makes a thirteenth check
 * impossible to ship without a sentence in all three languages.
 */
export type CompletenessCheckId =
  | 'name'
  | 'headline'
  | 'email'
  | 'phone'
  | 'location'
  | 'summary'
  | 'experience'
  | 'achievements'
  | 'education'
  | 'skills'
  | 'languages'
  | 'extras';

export interface DashboardCopy {
  dashboard: {
    title: string;
    /**
     * The account menu's link to the admin area, which only an admin sees. Not in `nav`:
     * that holds the five destinations the rail and the tab bar both render, and this is
     * neither of those.
     */
    adminConsole: string;
    /**
     * The landmark name for the bottom tab bar. Deliberately not `nav.dashboard`, which
     * names the sidebar: two navigations announced identically are two navigations a
     * screen-reader user cannot tell apart.
     */
    tabBarAria: string;
    greeting: (name: string) => string;
    /** The overview heading for an account with nothing in it yet, where "back" would be a lie. */
    greetingNew: (name: string) => string;
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
    overviewLedeEmpty: string;
    overviewLede: (n: number) => string;
    viewAllCvs: string;
    planUsage: string;
    statCvsSaved: string;
    statDownloads: string;
    statPlan: string;
    statCompleteness: string;
    unlimitedOnPlan: string;
    atCvLimitHint: string;
    /** `plan` is a plan name — "Free", "Pro" — which is a product name and stays as it is. */
    cvsLeftOnPlan: (n: number, plan: string) => string;
    unlimitedExports: string;
    resetsOn: (date: string) => string;
    renewsOn: (date: string) => string;
    permanentAccess: string;
    freeForever: string;
    completenessNoData: string;
    completenessAcrossCvs: string;
    downloadLimitTitle: string;
    downloadLimitBody: (date: string) => string;
    seePlans: string;
    finishHeading: (title: string) => string;
    finishLede: (percent: number) => string;
    continueEditing: string;
    recentlyEdited: string;
    allCvsCount: (n: number) => string;
    noCvsYet: string;
    noCvsBody: string;
    browseTemplates: string;
    startNewCv: string;
    cvLimitTitle: (limit: number, plan: string) => string;
    /**
     * Written around the link to My CVs, which sits mid-sentence. The tail carries its own
     * leading space or comma, because German needs a comma where English needs a space and
     * putting the separator in the markup would force one of them to be wrong.
     */
    cvLimitBodyLead: string;
    cvLimitBodyTail: string;
    errorTitle: string;
    errorBody: string;
    /** The digest, not the message: the message may be internal, the digest is what support needs. */
    errorBodyWithRef: (reference: string) => string;
    backToDashboard: string;
    errorSupport: (email: string) => string;
    /**
     * The free-plan upsell card. Every figure in it is read from `lib/plans.ts` and the
     * template registry, so the strings take them as arguments rather than naming them —
     * that is what stops the card promising a limit the plans no longer grant.
     */
    upgradeHeading: (plan: string, price: string, interval: string) => string;
    /** Keyed by the plan's own cadence, so a new billing interval cannot ship unlabelled. */
    billingInterval: Record<Plan['interval'], string>;
    getPlan: (plan: string) => string;
    gainUnlimitedCvs: (freeLimit: number) => string;
    gainUnlimitedDownloads: (freeLimit: number) => string;
    gainAllTemplates: (total: number, free: number) => string;
    gainCustomisation: string;
    /** Written around two links. The join carries its own leading punctuation. */
    upgradeAltLead: string;
    upgradeLifetime: (plan: string, price: string) => string;
    upgradeAltJoin: string;
    comparePlansLink: string;
    /**
     * What a failed request says when the server's own sentence is missing or is not
     * something a person can read. `ApiRequestError.message` itself stays in whatever
     * language the server sent, because callers match on it and it is logged.
     */
    planLimitTitle: string;
    planLimitBody: string;
    networkError: string;
    requestRefused: (status: number) => string;
    pleaseTryAgain: string;
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
    /** `limit` is `null` on a plan with no cap. */
    savedSummary: (saved: number, limit: number | null, plan: string) => string;
    nothingSavedYet: string;
    sortName: string;
    sortAria: string;
    layoutAria: string;
    gridView: string;
    listView: string;
    gridViewAria: string;
    listViewAria: string;
    slotsFullTitle: (limit: number, plan: string) => string;
    slotsFullBody: string;
    noneTitle: string;
    noneBody: string;
    createOne: string;
    createTitle: string;
    createLede: string;

    /* The toast after a create. Raised alike by the overview panel, the full new-CV flow
       and the in-app template browser, which is why it is not filed under any of them. */
    createdTitle: string;
    /** The body differs by starter: an example needs a warning, a blank page does not. */
    createdExampleBody: string;
    createdBlankBody: string;
    createFailed: string;

    backToMyCvs: string;
    premiumTemplateTitle: (name: string) => string;
    premiumTemplateBody: (count: number) => string;
    unknownTemplateTitle: string;
    unknownTemplateBody: string;
    detailLede: (template: string, percent: number, when: string) => string;
    previewAria: string;
    detailsHeading: string;
    factTemplate: string;
    factCreated: string;
    factLastEdited: string;
    factDownloads: string;
    factVisibility: string;
    neverDownloaded: string;
    downloadsWithLast: (n: number, when: string) => string;
    unknownTime: string;
    publicLinkOn: string;
    privateLabel: string;
    publicLinkHeading: string;
    publicLinkHint: string;
    overall: string;
    /**
     * The completeness checklist — the "biggest gaps" list on the overview and the full
     * list on a CV's own page.
     *
     * `checkTodo` is advice and reads as an instruction; `checkDone` is a plain noun
     * phrase, because a line that is already satisfied is a receipt rather than a
     * suggestion. Where a check names a section, it uses that section's real heading from
     * `lib/i18n/cv-labels.ts`, so the advice points at something the reader can see.
     */
    checkTodo: Record<CompletenessCheckId, string>;
    checkDone: Record<CompletenessCheckId, string>;
    /**
     * Replaces `checkTodo.skills` once the CV lists some skills but not yet five. Naming
     * how many are still missing is actionable where restating the target is not.
     */
    skillsShortTodo: (missing: number) => string;
    /** Appended to a checklist line for screen readers, so it starts with its own separator. */
    srDone: string;
    srMissing: string;
    fixInEditor: string;
    notFoundTitle: string;
    notFoundBody: string;

    /* A saved CV as a card or a row. */
    openAria: (title: string) => string;
    publicBadge: string;

    /* The action menu, shared by the list and the detail page. */
    actionsAria: (title: string) => string;
    downloadPdf: string;
    preparingPdf: string;
    /** The trailing ellipsis is the usual "this opens a dialog" signal, in every language. */
    renameAction: string;
    shareAction: string;
    sharingAction: string;
    deleteAction: string;
    shareShort: string;
    pdfReadyTitle: string;
    pdfReadyBody: string;
    pdfFailed: string;
    duplicatedBody: (title: string) => string;
    duplicateFailed: string;
    nameLabel: string;
    nameRequired: string;
    nameTooLong: (max: number) => string;
    renameTitle: string;
    renameLede: string;
    renameSave: string;
    renamedTitle: string;
    renamedBody: (title: string) => string;
    renameFailed: string;
    deletedTitle: string;
    deletedBody: (title: string) => string;
    deleteFailed: string;
    shareModalLede: string;
    shareProTitle: string;
    shareProBody: string;
    sharePublicLabel: string;
    shareLiveHint: string;
    shareOffHint: string;
    shareUpdating: string;
    shareOnTitle: string;
    shareOnBody: string;
    shareOffTitle: string;
    shareOffBody: string;
    shareFailed: string;
    copyFailedTitle: string;
    copyFailedBody: string;

    /* The new-CV flow. Its quota banner has no plan name to hand, so it says "your plan". */
    limitTitle: (limit: number) => string;
    limitBody: string;
    usedOfLimit: (used: number, limit: number) => string;
    proRemovesLimit: string;
    stepStart: string;
    stepTemplate: string;
    stepTemplateHint: string;
    stepName: string;
    nameHint: (untitled: string) => string;
    namePlaceholder: string;
    /** Carry their own colon: French puts a space before it, English and German do not. */
    summaryTemplate: string;
    summaryPaper: string;
    summaryContent: string;
    noneSelected: string;
    contentExample: string;
    contentEmpty: string;
    chooseTemplateHint: string;
  };
  templates: {
    allAvailable: (count: number) => string;
    freeSubset: (free: number, total: number) => string;
    filterAria: string;
    allFilter: string;
    showing: (shown: number, total: number) => string;
    /**
     * The category names, which the registry holds in English only because it is shared
     * with the marketing site and the sitemap. Each localised surface already names the
     * categories in its own copy module — `app/fr/fr-copy.ts` does the same — and the
     * terms here follow those pages so a visitor does not meet two names for one thing.
     */
    categoryLabel: Record<TemplateCategory, string>;
    oneColumn: string;
    twoColumns: string;
    details: string;
    searchPlaceholder: string;
    searchAria: string;
    planFilterAria: string;
    blockedTitle: string;
    blockedBody: string;
    emptyTitle: string;
    emptyBody: string;
    /**
     * The corner badge on a picker tile, which is one short word wide before it starts
     * eating the template name beside it. That rules out `common.free` in German, where
     * "Kostenlos" is nine characters; "Gratis" says the same thing in six.
     */
    badgeFree: string;
    badgePro: string;
    useTemplate: string;
    unlockWithPro: string;
    lockedAria: (name: string) => string;
  };
  account: {
    unfinishedHeading: string;
    unfinishedBody: (count: number) => string;
    lede: string;
    unverifiedTitle: string;
    unverifiedBody: string;
    verifyNow: string;
    profileHint: string;
    displayName: string;
    notSet: string;
    email: string;
    verified: string;
    unverified: string;
    memberSince: string;
    lastSignIn: string;
    /** Split around the "ask support" link; the tail carries its own leading punctuation. */
    profileLockedLead: (siteName: string) => string;
    askSupport: string;
    profileLockedTail: string;
    planHint: string;
    statusLabel: string;
    /** Keyed by the stored enum, so a new subscription state cannot ship without a label. */
    subscriptionStatus: Record<SubscriptionStatus, string>;
    expires: string;
    renews: string;
    neverPermanent: string;
    notApplicableFree: string;
    cvsAndDownloads: string;
    cvAllowance: (n: number | null) => string;
    downloadAllowance: (n: number | null) => string;
    billingHeading: string;
    billingHint: string;
    noPaymentsTitle: string;
    noPaymentsPremium: string;
    noPaymentsAbandoned: string;
    noPaymentsFree: string;
    colDate: string;
    colPlan: string;
    colAmount: string;
    colStatus: string;
    colOrder: string;
    paymentStatus: Record<PaymentStatus, string>;
    invoiceLead: string;
    contactUs: string;
    invoiceTail: string;
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
    pageLede: string;
    preferencesHint: string;
    emailHeading: string;
    emailHint: string;
    readOnly: string;
    marketingEmail: string;
    optedIn: string;
    optedOut: string;
    accountEmail: string;
    accountEmailAlways: string;
    /** Split around the "ask us" link; the tail carries its own leading punctuation. */
    emailLockedLead: (siteName: string) => string;
    askUs: string;
    emailLockedTail: string;
    dataHeading: string;
    dataHint: string;
    exportNote: string;
    dangerZone: string;
    dangerZoneHint: string;

    /* New-CV defaults, stored per browser. */
    defaultsSaved: string;
    defaultsSaveFailedTitle: string;
    defaultsSaveFailedBody: string;
    readingDefaults: string;
    paperSizeHint: string;
    /** The measurements are a format spec and stay put; only the clause after them moves. */
    paperA4Hint: string;
    paperLetterHint: string;
    defaultTemplateHint: string;
    defaultTemplateFreeHint: string;
    useAppDefault: (templateName: string) => string;
    saveDefaults: string;
    savedLocallyNote: (siteName: string) => string;

    /* The JSON export. */
    exportButton: string;
    exportListing: string;
    exportProgress: (done: number, total: number) => string;
    exportNothingTitle: string;
    exportNothingBody: string;
    exportPartialTitle: (done: number, total: number) => string;
    exportPartialBody: (titles: string) => string;
    exportReadyTitle: string;
    exportReadyBody: (n: number) => string;
    exportFailed: string;

    /* Account deletion, which is a support request rather than an endpoint. */
    deleteAccountBody: string;
    deleteAccountAction: string;
    deleteModalTitle: string;
    deleteModalLede: string;
    deleteContinue: string;
    deleteNothingTitle: string;
    deleteNothingBody: (siteName: string) => string;
    typeEmailToConfirm: (email: string) => string;
    emailMismatch: string;
    /**
     * The pre-filled support request. Written in the user's own language: they read it
     * before sending it, and a form that answers in English is a form people abandon.
     */
    deleteRequestSubject: string;
    deleteRequestBody: (siteName: string, email: string) => string;
  };
  /**
   * Paying, and finding out whether the payment worked.
   *
   * Two gateways are live, and the strings here are the ones a customer reads while money
   * is in flight — so every one of them says plainly whether anything has been charged.
   * That is not politeness: a person who has just typed a card number and seen a spinner
   * stop is deciding whether to press the button a second time, and the sentence in front
   * of them is what makes that decision for them.
   */
  checkout: {
    noTransactionTitle: string;
    noTransactionBody: string;
    unconfiguredTitle: string;
    unconfiguredBody: string;
    openFailedTitle: string;
    openFailedBody: string;
    openingCheckout: string;
    completing: string;
    reopen: string;
    /** Rendered only when both gateways are configured; one option is not a choice. */
    methodHeading: string;
    methodPaddle: string;
    methodPaypal: string;
    methodPaddleHint: string;
    methodPaypalHint: string;
    /** `priceLabel` is already formatted by the page, e.g. `$9 per month`. */
    payNow: (priceLabel: string) => string;
    opening: string;
    confirming: string;
    paddleNote: (planName: string) => string;
    startFailedTitle: string;
    startFailedBody: string;
    /**
     * The customer-facing sentence for an API error code.
     *
     * Our API answers with an English `message` alongside its `code`, and the checkout used
     * to render that message under a translated title — so a French buyer whose payment
     * failed read « Le paiement n'a pas pu démarrer » followed by an English sentence. The
     * message is written for whoever reads the logs; this is written for whoever is holding
     * the card. Returns `null` for a code with nothing specific to say, so the caller can
     * fall back to its own already-translated wording rather than to the server's English.
     */
    serverError: (code: string | undefined) => string | null;
    scriptFailed: string;
    offline: string;
    confirmTitle: string;
    confirmBody: string;
    stillConfirmingBody: string;
    confirmFailedTitle: string;
    nextSignIn: string;
    nextSupport: (email: string) => string;
    /** Shown when the answer is "not yet" rather than "no" — the webhook may still land. */
    nextWait: string;
    receiptNote: string;
    transactionRef: string;
    unavailableTitle: string;
    unavailableBody: (email: string) => string;

    /* ------------------------------------------------------- the payment shell */
    /** `domain` is the bare host — `createcvonline.com` — not a URL. */
    backToDomain: (domain: string) => string;
    footerPricing: string;
    footerRefund: string;
    footerTerms: string;
    footerPrivacy: string;
    footerContact: string;

    /* ------------------------------------------------------ reviewing the order */
    /**
     * How often the money is taken, keyed by the plan's own cadence so a new interval
     * cannot ship unlabelled. The long form — `$9 per month` rather than `$9/month` —
     * because this is the figure a payer checks before committing.
     */
    interval: Record<Plan['interval'], string>;
    stepReview: string;
    confirmPlanTitle: (planName: string) => string;
    orderSummary: string;
    rowPlan: string;
    rowBilling: string;
    billingOneOff: string;
    billingRecurring: (days: number) => string;
    totalToday: string;
    /** Someone who already owns Lifetime and has followed a link to buy something. */
    ownsLifetimeTitle: (lifetimeName: string) => string;
    ownsLifetimeBody: (lifetimeName: string, planName: string) => string;
    viewAccount: string;
    /**
     * Buying Pro while already on Pro. Legitimate — it extends the access — but Lifetime
     * is usually the better purchase, and saying so is worth more than the second sale.
     */
    repeatTitle: (planName: string) => string;
    repeatBody: (
      days: number,
      from: string,
      siteName: string,
      lifetimeName: string,
      lifetimePrice: string,
    ) => string;
    /**
     * The date the extension runs from, as a whole phrase rather than a bare date. French
     * elides the preposition before a vowel — `à compter du 3 mars` but `à compter
     * d'aujourd'hui` — so the two cases cannot share one sentence with a hole in it.
     */
    extendsFromDate: (date: string) => string;
    extendsFromToday: string;
    /** The link that closes `repeatBody`. */
    repeatSwitch: (lifetimeName: string) => string;
    /*
     * The small print under the button, cut where each language wants the break rather
     * than where English does, because both sentences are written around a link.
     */
    termsIntro: string;
    termsLink: string;
    termsAnd: string;
    refundLink: string;
    cardDetailsNote: string;
    changedMind: string;
    comparePlansAgain: string;
    orWriteTo: string;

    /* --------------------------------------------------- PayPal, before it opens */
    continueToPaypal: (priceLabel: string) => string;
    redirectingToPaypal: string;
    paypalNote: (planName: string) => string;
    paypalStartFailed: string;
    paypalNoApproveUrl: (email: string) => string;
    /** PayPal's own machine-readable cause and support reference, labelled. */
    diagnosticCause: (issue: string) => string;
    diagnosticReference: (reference: string) => string;

    /* ----------------------------------------------- coming back from the gateway */
    stepConfirmation: string;
    confirmationTitle: string;
    confirmationLede: string;
    payerReference: string;
    payerReferenceNote: string;
    paypalConfirmBody: string;
    paypalFailedBody: string;
    /** The PayPal wording of `nextSupport` and its unknown-order case, which name Paddle. */
    paypalNextSupport: (email: string) => string;
    paypalNextUnknownOrder: (email: string) => string;
    confirmOffline: string;
    nextRetryConnection: string;
    missingReference: string;
    missingReferenceNext: string;
    emailSupport: (email: string) => string;
    quoteReference: string;
    backToPricing: string;
    planActive: (planName: string) => string;
    planAlreadyActive: (planName: string) => string;
    alreadyConfirmedBody: string;
    paypalReceiptNote: string;
    noRenewalNote: string;
    accessDaysNote: (days: number) => string;
    refundLead: string;
    refundTail: string;
    orderRef: string;

    /* ------------------------------------------------------ backing out of PayPal */
    cancelledTitle: string;
    cancelledNothingCharged: string;
    /** `planName` is `null` when the return link carried no plan, which drops a clause. */
    cancelledBody: (planName: string | null) => string;
    cancelledCvsSafe: string;
    cancelledNextHeading: string;
    cancelledStep1Lead: string;
    pricingPageLink: string;
    cancelledStep1Tail: (planName: string | null, currency: string) => string;
    cancelledStep2: string;
    cancelledStep3: string;
    cancelledHelpLead: string;
    cancelledHelpOr: string;
    contactFormLink: string;
    cancelledHelpTail: string;
    cancelledMismatchLead: string;
    cancelledMismatchTail: string;
  };
}

const EN: DashboardCopy = {
  dashboard: {
    title: 'Dashboard',
    adminConsole: 'Admin console',
    tabBarAria: 'Dashboard tabs',
    greeting: (name) => (name ? `Welcome back, ${name}` : 'Welcome back'),
    greetingNew: (name) => (name ? `Welcome, ${name}` : 'Welcome'),
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
    overviewLedeEmpty:
      'Nothing saved yet. Pick a starting point below and you will have a finished CV in one sitting.',
    overviewLede: (n) =>
      n === 1 ? 'You have 1 CV in your account.' : `You have ${n} CVs in your account.`,
    viewAllCvs: 'View all CVs',
    planUsage: 'Plan usage',
    statCvsSaved: 'CVs saved',
    statDownloads: 'Downloads',
    statPlan: 'Plan',
    statCompleteness: 'Avg. completeness',
    unlimitedOnPlan: 'Unlimited on your plan.',
    atCvLimitHint: 'At the limit — delete one or upgrade to add more.',
    cvsLeftOnPlan: (n, plan) => `${n} left on ${plan}.`,
    unlimitedExports: 'Unlimited PDF exports.',
    resetsOn: (date) => `Resets ${date}.`,
    renewsOn: (date) => `Renews ${date}.`,
    permanentAccess: 'Permanent access — no renewal.',
    freeForever: 'Free forever, with limits.',
    completenessNoData: 'Create a CV to start tracking this.',
    completenessAcrossCvs: 'Across every CV in your account.',
    downloadLimitTitle: 'You have used every download this month',
    downloadLimitBody: (date) => `The counter resets on ${date}. Pro removes the limit entirely.`,
    seePlans: 'See plans',
    finishHeading: (title) => `Finish “${title}”`,
    finishLede: (percent) => `It is ${percent}% complete. These are the biggest gaps:`,
    continueEditing: 'Continue editing',
    recentlyEdited: 'Recently edited',
    allCvsCount: (n) => `All ${n} CVs`,
    noCvsYet: 'No CVs yet',
    noCvsBody:
      'Start blank, start from a worked example, or browse the templates first — whichever gets you writing.',
    browseTemplates: 'Browse templates',
    startNewCv: 'Start a new CV',
    cvLimitTitle: (limit, plan) => `You are using all ${limit} CVs the ${plan} plan allows`,
    cvLimitBodyLead: 'Delete one from',
    cvLimitBodyTail: ' to make room, or upgrade to Pro for unlimited CVs.',
    errorTitle: 'That page did not load',
    errorBody: 'Something went wrong on our side. Your CVs are safe — nothing was changed.',
    errorBodyWithRef: (reference) =>
      `Something went wrong on our side. Quote reference ${reference} if you contact support.`,
    backToDashboard: 'Back to the dashboard',
    errorSupport: (email) => `If it keeps happening, e-mail ${email}.`,
    upgradeHeading: (plan, price, interval) => `Upgrade to ${plan} — $${price}/${interval}`,
    billingInterval: {
      forever: 'forever',
      month: 'month',
      year: 'year',
      'one-time': 'one-time',
    },
    getPlan: (plan) => `Get ${plan}`,
    gainUnlimitedCvs: (freeLimit) => `Unlimited CVs instead of ${freeLimit}`,
    gainUnlimitedDownloads: (freeLimit) =>
      `Unlimited PDF downloads instead of ${freeLimit} a month`,
    gainAllTemplates: (total, free) => `All ${total} templates instead of ${free}`,
    gainCustomisation: 'Fonts, spacing, custom sections and a public share link',
    upgradeAltLead: 'Or',
    upgradeLifetime: (plan, price) => `${plan.toLowerCase()} access once for $${price}`,
    upgradeAltJoin: ', or',
    comparePlansLink: 'compare the plans',
    planLimitTitle: 'You have reached a plan limit',
    planLimitBody: 'Your current plan does not allow that. Upgrading removes the limit.',
    networkError: 'Network problem — check your connection and try again.',
    requestRefused: (status) => `The server refused that request (${status}).`,
    pleaseTryAgain: 'Please try again.',
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
    savedSummary: (saved, limit, plan) =>
      limit === null ? `${saved} saved.` : `${saved} saved of ${limit} on the ${plan} plan.`,
    nothingSavedYet: 'Nothing here yet.',
    sortName: 'Name',
    sortAria: 'Sort CVs',
    layoutAria: 'Layout',
    gridView: 'Grid',
    listView: 'List',
    gridViewAria: 'Grid view',
    listViewAria: 'List view',
    slotsFullTitle: (limit, plan) => `All ${limit} CV slots on the ${plan} plan are in use`,
    slotsFullBody:
      'Delete or rename an existing CV to reuse a slot, or upgrade to Pro for unlimited CVs.',
    noneTitle: 'No CVs in your account',
    noneBody:
      'Create one from a blank page, from a worked example, or straight from a template you like.',
    createOne: 'Create a CV',
    createTitle: 'Create a new CV',
    createLede:
      'Pick how you want to start and which design to use. Nothing is saved until you press Create.',
    createdTitle: 'CV created',
    createdExampleBody: 'We filled it with a worked example — replace it with your own details.',
    createdBlankBody: 'Opening the editor…',
    createFailed: 'Could not create the CV',
    backToMyCvs: 'Back to my CVs',
    premiumTemplateTitle: (name) => `“${name}” is a Pro template`,
    premiumTemplateBody: (count) =>
      `We have selected a free template instead. Upgrade to unlock all ${count} designs, or pick any of the free ones below.`,
    unknownTemplateTitle: 'That template does not exist',
    unknownTemplateBody:
      'The link you followed points at a template we no longer publish. Pick another one below.',
    detailLede: (template, percent, when) => `${template} · ${percent}% complete · edited ${when}`,
    previewAria: 'CV preview',
    detailsHeading: 'Details',
    factTemplate: 'Template',
    factCreated: 'Created',
    factLastEdited: 'Last edited',
    factDownloads: 'PDF downloads',
    factVisibility: 'Visibility',
    neverDownloaded: 'Never downloaded',
    downloadsWithLast: (n, when) => `${n} · last ${when}`,
    unknownTime: 'unknown',
    publicLinkOn: 'Public link on',
    privateLabel: 'Private',
    publicLinkHeading: 'Public link',
    publicLinkHint: 'Use the Share action to copy or switch it off.',
    overall: 'Overall',
    checkTodo: {
      name: 'Add your first and last name',
      headline: 'Add a professional headline, such as “Senior Product Designer”',
      email: 'Add an e-mail address recruiters can reply to',
      phone: 'Add a phone number',
      location: 'Add your city and country',
      summary: 'Write a professional summary of at least three lines',
      experience: 'Add at least one role to Work Experience',
      achievements: 'Describe what you achieved in a role, not just what you were responsible for',
      education: 'Add an entry to Education',
      skills: 'Add at least five skills',
      languages: 'Add at least one language and your level in it',
      extras: 'Add a project, certification, award or publication',
    },
    checkDone: {
      name: 'Name',
      headline: 'Professional headline',
      email: 'Contact e-mail',
      phone: 'Phone number',
      location: 'Location',
      summary: 'Professional summary',
      experience: 'Work experience',
      achievements: 'Achievements on a role',
      education: 'Education',
      skills: 'Skills',
      languages: 'Languages',
      extras: 'Projects, certifications or awards',
    },
    skillsShortTodo: (missing) =>
      `Add ${missing} more skill${missing === 1 ? '' : 's'} (five is the minimum that reads as deliberate)`,
    srDone: ' — done',
    srMissing: ' — missing',
    fixInEditor: 'Fix these in the editor',
    notFoundTitle: 'That CV is not here',
    notFoundBody: 'It may have been deleted, or the link may point at a CV in another account.',
    openAria: (title) => `Open ${title}`,
    publicBadge: 'Public',
    actionsAria: (title) => `Actions for ${title}`,
    downloadPdf: 'Download PDF',
    preparingPdf: 'Preparing PDF…',
    renameAction: 'Rename…',
    shareAction: 'Share…',
    sharingAction: 'Sharing…',
    deleteAction: 'Delete…',
    shareShort: 'Share',
    pdfReadyTitle: 'PDF ready',
    pdfReadyBody: 'Your download should start automatically.',
    pdfFailed: 'Could not create the PDF',
    duplicatedBody: (title) => `“${title}” is in your list.`,
    duplicateFailed: 'Could not duplicate that CV',
    nameLabel: 'CV name',
    nameRequired: 'Give the CV a name so you can find it later.',
    nameTooLong: (max) => `Keep the name to ${max} characters or fewer.`,
    renameTitle: 'Rename CV',
    renameLede: 'Only you see this name — it is not printed on the document.',
    renameSave: 'Save name',
    renamedTitle: 'Renamed',
    renamedBody: (title) => `Now called “${title}”.`,
    renameFailed: 'Could not rename that CV',
    deletedTitle: 'CV deleted',
    deletedBody: (title) => `“${title}” has been removed.`,
    deleteFailed: 'Could not delete that CV',
    shareModalLede:
      'Publishing creates a read-only page at an unguessable address. Turn it off at any time.',
    shareProTitle: 'Public links are a Pro feature',
    shareProBody:
      'Upgrade to publish your CV at a link you can put in an e-mail or a job application.',
    sharePublicLabel: 'Anyone with the link can view this CV',
    shareLiveHint: 'The page is live now.',
    shareOffHint: 'Nothing is published until you turn this on.',
    shareUpdating: 'Updating the link…',
    shareOnTitle: 'Share link on',
    shareOnBody: 'Anyone with the link can now view this CV.',
    shareOffTitle: 'Share link off',
    shareOffBody: 'The link no longer works.',
    shareFailed: 'Could not change sharing',
    copyFailedTitle: 'Could not copy',
    copyFailedBody: 'Select the link and copy it manually.',
    limitTitle: (limit) => `You are using all ${limit} CVs your plan allows`,
    limitBody: 'Delete a CV to make room, or upgrade to Pro for unlimited CVs.',
    usedOfLimit: (used, limit) => `${used} of ${limit} CVs used on your plan`,
    proRemovesLimit: 'Pro removes the limit and unlocks every template.',
    stepStart: '1. Choose a starting point',
    stepTemplate: '2. Pick a template',
    stepTemplateHint: 'You can change it later without losing anything you have written.',
    stepName: '3. Name it and create',
    nameHint: (untitled) => `Only you see this. Leave it blank to call it “${untitled}”.`,
    namePlaceholder: 'e.g. Product designer — Atlas Cloud',
    summaryTemplate: 'Template:',
    summaryPaper: 'Paper:',
    summaryContent: 'Content:',
    noneSelected: 'None selected',
    contentExample: 'Worked example',
    contentEmpty: 'Empty',
    chooseTemplateHint: 'Browse every design, filter by style, then start from the one you like.',
  },
  templates: {
    allAvailable: (count) =>
      `All ${count} designs are available on your plan. Starting a CV from one takes a single click.`,
    freeSubset: (free, total) =>
      `${free} of the ${total} designs are on the Free plan. The rest are marked Pro.`,
    filterAria: 'Filter templates by category',
    allFilter: 'All',
    showing: (shown, total) => `Showing ${shown} of ${total} templates`,
    categoryLabel: {
      modern: 'Modern',
      corporate: 'Corporate',
      creative: 'Creative',
      technology: 'Technology',
      classic: 'Classic',
      ats: 'ATS-friendly',
    },
    oneColumn: 'one column',
    twoColumns: 'two columns',
    details: 'Details',
    searchPlaceholder: 'Search templates — “ats”, “executive”, “designer”…',
    searchAria: 'Search templates',
    planFilterAria: 'Filter by plan',
    blockedTitle: 'That is a Pro template',
    blockedBody:
      'Upgrade to unlock every design, or keep going with one of the free templates — the free set includes every ATS-safe layout.',
    emptyTitle: 'No template matches that',
    emptyBody: 'Try a shorter search, or clear the category and plan filters.',
    badgeFree: 'FREE',
    badgePro: 'PRO',
    useTemplate: 'Use template',
    unlockWithPro: 'Unlock with Pro',
    lockedAria: (name) => `${name} is a Pro template — see plans`,
  },
  account: {
    unfinishedHeading: 'Unfinished checkouts · nothing was charged',
    unfinishedBody: (count) =>
      `${count === 1 ? 'This checkout was' : 'These checkouts were'} started but never completed — the order was opened with PayPal and abandoned before payment. No money left your account and no plan was granted. We keep the reference so support can trace it if you think otherwise.`,
    lede: 'Who you are signed in as, what your plan allows, and what you have paid for.',
    unverifiedTitle: 'Your e-mail address is not verified',
    unverifiedBody: 'Verifying protects your account and makes password recovery possible.',
    verifyNow: 'Verify now',
    profileHint: 'These details come from the account you sign in with.',
    displayName: 'Display name',
    notSet: 'Not set',
    email: 'E-mail',
    verified: 'Verified',
    unverified: 'Unverified',
    memberSince: 'Member since',
    lastSignIn: 'Last sign-in',
    profileLockedLead: (siteName) =>
      `Read-only for now. Your display name and e-mail are taken from your sign-in provider and refreshed every time you sign in — ${siteName} has no profile-editing endpoint yet, so changing them here would not persist. Change them with your provider, or`,
    askSupport: 'ask support',
    profileLockedTail: ' to do it for you.',
    planHint: 'What your account can do right now.',
    statusLabel: 'Status',
    subscriptionStatus: {
      none: 'No subscription',
      active: 'Active',
      expired: 'Expired',
      cancelled: 'Cancelled',
      pending: 'Pending',
    },
    expires: 'Expires',
    renews: 'Renews',
    neverPermanent: 'Never — permanent access',
    notApplicableFree: 'Not applicable on Free',
    cvsAndDownloads: 'CVs / downloads',
    cvAllowance: (n) => (n === null ? 'Unlimited' : `${n} CVs`),
    downloadAllowance: (n) => (n === null ? 'unlimited downloads' : `${n} downloads a month`),
    billingHeading: 'Billing history',
    billingHint: 'Payments actually taken from this account.',
    noPaymentsTitle: 'No payments yet',
    noPaymentsPremium:
      'Your access was granted without a recorded payment. Contact support if that looks wrong.',
    noPaymentsAbandoned:
      'You have started a checkout but never completed one, so nothing has been charged.',
    noPaymentsFree: 'You are on the Free plan, so there is nothing to bill.',
    colDate: 'Date',
    colPlan: 'Plan',
    colAmount: 'Amount',
    colStatus: 'Status',
    colOrder: 'Order',
    paymentStatus: {
      created: 'Created',
      approved: 'Approved',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    },
    invoiceLead: 'Need an invoice, a refund or a receipt re-sent?',
    contactUs: 'Contact us',
    invoiceTail: ' with the order id.',
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
    pageLede:
      'Only the things that genuinely do something are switchable here. Everything else says so.',
    preferencesHint: 'Applied the next time you create a CV from this browser.',
    emailHeading: 'E-mail preferences',
    emailHint: 'What we are allowed to send you.',
    readOnly: 'Read-only',
    marketingEmail: 'Product and marketing e-mail',
    optedIn: 'Opted in',
    optedOut: 'Opted out',
    accountEmail: 'Account e-mail',
    accountEmailAlways: 'Always sent — receipts, verification and security notices',
    emailLockedLead: (siteName) =>
      `${siteName} has no endpoint for changing this yet, so there is no switch here that would pretend to work. Every marketing e-mail carries a one-click unsubscribe link, or`,
    askUs: 'ask us',
    emailLockedTail: ' to change it.',
    dataHeading: 'Your data',
    dataHint: 'Take a copy of everything you have written here, at any time.',
    exportNote:
      'The file contains every CV in full — personal details, sections, and the design settings for each one — as JSON. It is built in your browser from your own account, so nothing is stored or sent anywhere else.',
    dangerZone: 'Danger zone',
    dangerZoneHint: 'Irreversible things.',
    defaultsSaved: 'Defaults saved',
    defaultsSaveFailedTitle: 'Could not save on this device',
    defaultsSaveFailedBody:
      'Your browser is blocking local storage — private browsing usually does.',
    readingDefaults: 'Reading your saved defaults…',
    paperSizeHint: 'Applied when a CV is created. You can still change it per CV in the editor.',
    paperA4Hint: '210 × 297 mm — standard outside North America',
    paperLetterHint: '8.5 × 11 in — standard in the US and Canada',
    defaultTemplateHint: 'Pre-selected in the new-CV flow.',
    defaultTemplateFreeHint: 'Only free templates can be a default while you are on the Free plan.',
    useAppDefault: (templateName) => `Use the app default (${templateName})`,
    saveDefaults: 'Save defaults',
    savedLocallyNote: (siteName) =>
      `Saved in this browser only — ${siteName} has no endpoint for syncing preferences across devices yet.`,
    exportButton: 'Download all my CVs as JSON',
    exportListing: 'Listing your CVs…',
    exportProgress: (done, total) => `Exporting ${done} of ${total}…`,
    exportNothingTitle: 'Nothing to export',
    exportNothingBody: 'You have not saved a CV yet.',
    exportPartialTitle: (done, total) => `Exported ${done} of ${total}`,
    exportPartialBody: (titles) => `Could not read: ${titles}. Try again in a minute.`,
    exportReadyTitle: 'Export ready',
    exportReadyBody: (n) => (n === 1 ? '1 CV saved as JSON.' : `${n} CVs saved as JSON.`),
    exportFailed: 'Could not export your CVs',
    deleteAccountBody:
      'Removes your profile, every saved CV and your payment history. There is no self-service deletion yet, so this opens a pre-filled request to our support team — we action it by hand and confirm by e-mail.',
    deleteAccountAction: 'Delete account…',
    deleteModalTitle: 'Delete your account',
    deleteModalLede: 'This cannot be undone. Type your e-mail address to confirm you mean it.',
    deleteContinue: 'Continue to request',
    deleteNothingTitle: 'Nothing is deleted on this screen',
    deleteNothingBody: (siteName) =>
      `${siteName} has no automated deletion endpoint. Confirming here takes you to a pre-filled support request; your data is removed once our team processes it.`,
    typeEmailToConfirm: (email) => `Type ${email} to confirm`,
    emailMismatch: 'That does not match your e-mail address.',
    deleteRequestSubject: 'Account deletion request',
    deleteRequestBody: (siteName, email) =>
      `Please delete my ${siteName} account (${email}) and everything stored under it: my saved CVs, my payment history and my profile.`,
  },
  checkout: {
    noTransactionTitle: 'This link is missing its payment reference',
    noTransactionBody:
      'Payment links expire and can only be opened once. Start again from the pricing page, or reply to the email you received and we will send a new one.',
    unconfiguredTitle: 'Card payments are not available right now',
    unconfiguredBody:
      'This is a problem on our side, not with your payment — nothing has been charged. Please try again shortly, or contact us and we will send you a working link.',
    openFailedTitle: 'We could not open the payment window',
    openFailedBody:
      'Nothing has been charged. Refresh the page to try again — if it keeps failing, contact us and quote the link you followed.',
    openingCheckout: 'Opening the payment window…',
    completing: 'Payment received — confirming it now…',
    reopen: 'Reopen the payment window',
    methodHeading: 'How would you like to pay?',
    methodPaddle: 'Card or wallet',
    methodPaypal: 'PayPal',
    methodPaddleHint:
      'Card, Apple Pay, Google Pay or PayPal, in a window that opens over this page. Paddle is the seller of record, so the VAT or sales tax for your country is worked out and shown before you pay.',
    methodPaypalHint:
      'You approve the payment on PayPal and come straight back here. A PayPal account is not required — a bank or debit card works too.',
    payNow: (priceLabel) => `Pay ${priceLabel}`,
    opening: 'Opening the payment window…',
    confirming: 'Confirming your payment…',
    paddleNote: (planName) =>
      `The payment window is Paddle's, not ours — we never see or store your card details. ${planName} is unlocked only after our server confirms the payment with Paddle.`,
    startFailedTitle: 'Checkout could not start',
    startFailedBody:
      'We could not start the payment. Nothing has been charged — please try again in a moment.',
    serverError: (code) =>
      ({
        unauthenticated: 'Your session has ended. Sign in again and the payment will resume.',
        forbidden: 'This account is not allowed to make that purchase.',
        'email-unverified':
          'Confirm your e-mail address first — we have sent you a link. Nothing has been charged.',
        'rate-limited':
          'That was tried several times in a row. Wait a minute and try again — nothing has been charged.',
        'invalid-plan': 'That plan cannot be purchased.',
        'invalid-request': 'Something in that request was not valid. Nothing has been charged.',
        'not-found': 'We could not find that payment.',
        'unknown-order':
          'We have no record of that payment on this account. If money left your account, it has not been lost — contact us with the transaction reference below.',
        'payments-unavailable':
          'Card payments are unavailable right now. Nothing has been charged — please try again shortly.',
        'not-configured':
          'Card payments are unavailable right now. Nothing has been charged — please try again shortly.',
        'payment-provider-error':
          'Our payment provider did not answer. Nothing has been charged — please try again in a moment.',
        'payment-not-completed':
          'This payment has not gone through yet. If you have just paid, give it a few seconds.',
        'amount-mismatch':
          'The amount paid does not match this plan, so we have not unlocked it. Nothing further has been charged — please contact us and we will sort it out.',
        'server-error': 'Something went wrong on our side. Nothing has been charged.',
        'request-failed': 'Something went wrong on our side. Nothing has been charged.',
      })[code ?? ''] ?? null,
    scriptFailed:
      'The payment window could not load. Check that no ad blocker or privacy extension is blocking Paddle, then try again — nothing has been charged.',
    offline:
      'We could not reach the server. Check your connection and try again — nothing has been charged.',
    confirmTitle: 'Confirming your payment…',
    confirmBody:
      'Paddle has taken the payment and we are checking it with them before unlocking anything. You can close this tab if you need to — your plan is granted either way.',
    stillConfirmingBody:
      'Paddle has not confirmed the payment yet. We are still asking — this can take a few seconds while your bank settles it. Nothing is lost by waiting here.',
    confirmFailedTitle: 'We could not confirm that payment',
    nextSignIn:
      'Sign in with the account you paid with and open this page again. Your payment is safe — the plan is granted as soon as we can match it to your account.',
    nextSupport: (email) =>
      `If money left your account, e-mail ${email} with your Paddle transaction id and we will fix it or refund it.`,
    nextWait:
      'If you completed the payment, the plan is granted on its own within a minute. Press “Try again”, or open your account page shortly — you do not need to pay twice.',
    receiptNote: 'Paddle has e-mailed you a receipt and an invoice you can claim as an expense.',
    transactionRef: 'Transaction',
    unavailableTitle: 'Payments are not available right now',
    unavailableBody: (email) =>
      `No payment provider is configured on this deployment, so there is nothing here to pay with and nothing has been charged. Write to ${email} and we will set your plan up by hand.`,
    backToDomain: (domain) => `Back to ${domain}`,
    footerPricing: 'Pricing',
    footerRefund: 'Refund policy',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
    interval: {
      forever: 'forever',
      month: 'per month',
      year: 'per year',
      'one-time': 'one-time payment',
    },
    stepReview: 'Step 1 of 3 · Review',
    confirmPlanTitle: (planName) => `Confirm your ${planName} plan`,
    orderSummary: 'Order summary',
    rowPlan: 'Plan',
    rowBilling: 'Billing',
    billingOneOff: 'One payment, no renewal',
    billingRecurring: (days) => `Every ${days} days, cancel any time`,
    totalToday: 'Total today',
    ownsLifetimeTitle: (lifetimeName) => `You already have ${lifetimeName}`,
    ownsLifetimeBody: (lifetimeName, planName) =>
      `${lifetimeName} access never expires and already includes everything in ${planName}, so there is nothing here for you to pay for. We would rather say that than take the money.`,
    viewAccount: 'View my account',
    repeatTitle: (planName) => `You are already on ${planName}`,
    repeatBody: (days, from, siteName, lifetimeName, lifetimePrice) =>
      `Paying again extends your access by another ${days} days ${from}. If you expect to keep using ${siteName}, ${lifetimeName} at ${lifetimePrice} works out cheaper after eight months —`,
    extendsFromDate: (date) => `from ${date}`,
    extendsFromToday: 'from today',
    repeatSwitch: (lifetimeName) => `switch to ${lifetimeName}`,
    termsIntro: 'By continuing you agree to our',
    termsLink: 'terms',
    termsAnd: 'and',
    refundLink: 'refund policy',
    cardDetailsNote:
      'We never see or store your card details — the payment provider handles that entirely.',
    changedMind: 'Changed your mind?',
    comparePlansAgain: 'Compare the plans again',
    orWriteTo: 'or write to',
    continueToPaypal: (priceLabel) => `Continue to PayPal — ${priceLabel}`,
    redirectingToPaypal: 'Taking you to PayPal…',
    paypalNote: (planName) =>
      `You will approve the payment on PayPal, then come straight back here. You can pay with a PayPal balance, a bank account, or a debit or credit card — a PayPal account is not required. ${planName} is unlocked only after our server confirms the payment with PayPal.`,
    paypalStartFailed: 'PayPal could not start this payment. Please try again in a moment.',
    paypalNoApproveUrl: (email) =>
      `The order was created but PayPal did not return a checkout link. Nothing has been charged — please try again, or contact ${email} if it keeps happening.`,
    diagnosticCause: (issue) => `Cause: ${issue}`,
    diagnosticReference: (reference) => `Reference: ${reference}`,
    stepConfirmation: 'Step 3 of 3 · Confirmation',
    confirmationTitle: 'Payment confirmation',
    confirmationLede:
      'You have come back from PayPal. Before anything is unlocked, our server checks the order with PayPal directly — so what you see below is the real outcome, not a message triggered by the redirect.',
    payerReference: 'PayPal payer reference',
    payerReferenceNote:
      'Keep it with your receipt — quoting it alongside the order id lets us find a payment instantly.',
    paypalConfirmBody:
      'We are checking the order with PayPal before we unlock anything. This normally takes a couple of seconds — please do not close this tab.',
    paypalFailedBody: 'We could not confirm this payment with PayPal.',
    paypalNextSupport: (email) =>
      `If money left your account, e-mail ${email} with your PayPal transaction id and we will fix it or refund it.`,
    paypalNextUnknownOrder: (email) =>
      `Send us your PayPal transaction id at ${email} and we will sort it out the same day.`,
    confirmOffline: 'We could not reach our server to confirm the payment.',
    nextRetryConnection:
      'Check your connection and press “Try again”. Your payment is safe either way — nothing is granted or charged twice.',
    missingReference: 'This confirmation link is missing its payment reference.',
    missingReferenceNext:
      'Open the receipt your payment provider e-mailed you and follow the link in it, or check your account page — a completed payment unlocks the plan on its own.',
    emailSupport: (email) => `E-mail ${email}`,
    quoteReference: 'Quote this reference if you contact us:',
    backToPricing: 'Back to pricing',
    planActive: (planName) => `You are on ${planName}`,
    planAlreadyActive: (planName) => `${planName} is already active`,
    alreadyConfirmedBody:
      'This order was already confirmed, so we have not charged or granted anything twice. Everything below is available on your account right now.',
    paypalReceiptNote: 'PayPal has e-mailed you a receipt.',
    noRenewalNote: 'This plan does not expire and there is nothing to renew or cancel.',
    accessDaysNote: (days) =>
      `This payment covers ${days} days of access and does not renew by itself — you will never be charged automatically.`,
    refundLead: 'Changed your mind? Our',
    refundTail: 'gives you 14 days.',
    orderRef: 'Order',
    cancelledTitle: 'Checkout cancelled',
    cancelledNothingCharged: 'Nothing was charged.',
    cancelledBody: (planName) =>
      `You left PayPal before approving the payment, so no order was completed${
        planName ? ` and ${planName} has not been added to your account` : ''
      }. Your account is exactly as it was a minute ago.`,
    cancelledCvsSafe:
      'Every CV you have written is still there, still editable, and still downloadable within your current plan’s allowance.',
    cancelledNextHeading: 'Picking up where you left off',
    cancelledStep1Lead: 'Open the',
    pricingPageLink: 'pricing page',
    cancelledStep1Tail: (planName, currency) =>
      `and choose ${
        planName ? `${planName} again, or the other plan` : 'a plan'
      }. Prices are in ${currency} and are shown in full before you are sent to PayPal.`,
    cancelledStep2:
      'Approve the payment on PayPal. You can pay with a PayPal balance, a linked bank account, or a debit or credit card — a PayPal account is not required.',
    cancelledStep3:
      'You land back here and the plan is unlocked once our server has confirmed the order with PayPal. It takes a couple of seconds.',
    cancelledHelpLead:
      'Cancelled because something looked wrong, or because PayPal would not complete? Tell us at',
    cancelledHelpOr: 'or through the',
    contactFormLink: 'contact form',
    cancelledHelpTail: 'We would rather fix a broken checkout than lose the sale quietly.',
    cancelledMismatchLead:
      'If money did leave your account despite this page, that is a mismatch we want to know about immediately — e-mail us with your PayPal transaction id and we will grant the plan or refund it the same day. Our',
    cancelledMismatchTail: 'covers it either way.',
  },
};

const FR: DashboardCopy = {
  dashboard: {
    title: 'Tableau de bord',
    adminConsole: 'Console d’administration',
    tabBarAria: 'Onglets du tableau de bord',
    greeting: (name) => (name ? `Bon retour, ${name}` : 'Bon retour'),
    greetingNew: (name) => (name ? `Bienvenue, ${name}` : 'Bienvenue'),
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
    overviewLedeEmpty:
      'Rien d’enregistré pour l’instant. Choisissez un point de départ ci-dessous et vous aurez un CV terminé en une seule séance.',
    overviewLede: (n) => `Vous avez ${n} CV dans votre compte.`,
    viewAllCvs: 'Voir tous mes CV',
    planUsage: 'Utilisation de votre formule',
    statCvsSaved: 'CV enregistrés',
    statDownloads: 'Téléchargements',
    statPlan: 'Formule',
    statCompleteness: 'Complétude moyenne',
    unlimitedOnPlan: 'Illimité avec votre formule.',
    atCvLimitHint: 'Limite atteinte — supprimez-en un ou passez à une formule supérieure.',
    cvsLeftOnPlan: (n, plan) => `Il en reste ${n} avec la formule ${plan}.`,
    unlimitedExports: 'Exports PDF illimités.',
    resetsOn: (date) => `Remise à zéro le ${date}.`,
    renewsOn: (date) => `Renouvellement le ${date}.`,
    permanentAccess: 'Accès permanent — sans renouvellement.',
    freeForever: 'Gratuit à vie, avec des limites.',
    completenessNoData: 'Créez un CV pour commencer à suivre cet indicateur.',
    completenessAcrossCvs: 'Sur l’ensemble des CV de votre compte.',
    downloadLimitTitle: 'Vous avez utilisé tous vos téléchargements ce mois-ci',
    downloadLimitBody: (date) =>
      `Le compteur repart le ${date}. Pro supprime complètement cette limite.`,
    seePlans: 'Voir les formules',
    finishHeading: (title) => `Terminer « ${title} »`,
    finishLede: (percent) =>
      `Il est complété à ${percent} %. Voici les manques les plus importants :`,
    continueEditing: 'Continuer la rédaction',
    recentlyEdited: 'Modifiés récemment',
    allCvsCount: (n) => `Tous mes ${n} CV`,
    noCvsYet: 'Aucun CV pour l’instant',
    noCvsBody:
      'Partez de zéro, d’un exemple complet, ou parcourez d’abord les modèles — l’essentiel est de commencer à écrire.',
    browseTemplates: 'Parcourir les modèles',
    startNewCv: 'Créer un nouveau CV',
    cvLimitTitle: (limit, plan) => `Vous utilisez les ${limit} CV autorisés par la formule ${plan}`,
    cvLimitBodyLead: 'Supprimez-en un depuis',
    cvLimitBodyTail: ' pour libérer une place, ou passez à Pro pour un nombre illimité de CV.',
    errorTitle: 'Cette page ne s’est pas chargée',
    errorBody: 'Une erreur est survenue de notre côté. Vos CV sont intacts — rien n’a été modifié.',
    errorBodyWithRef: (reference) =>
      `Une erreur est survenue de notre côté. Indiquez la référence ${reference} si vous contactez l’assistance.`,
    backToDashboard: 'Retour au tableau de bord',
    errorSupport: (email) => `Si le problème persiste, écrivez à ${email}.`,
    upgradeHeading: (plan, price, interval) => `Passez à ${plan} — ${price} $/${interval}`,
    billingInterval: {
      forever: 'à vie',
      month: 'mois',
      year: 'an',
      'one-time': 'paiement unique',
    },
    getPlan: (plan) => `Passer à ${plan}`,
    gainUnlimitedCvs: (freeLimit) => `Un nombre illimité de CV au lieu de ${freeLimit}`,
    gainUnlimitedDownloads: (freeLimit) =>
      `Des téléchargements PDF illimités au lieu de ${freeLimit} par mois`,
    gainAllTemplates: (total, free) => `Les ${total} modèles au lieu de ${free}`,
    gainCustomisation: 'Polices, espacements, rubriques personnalisées et lien de partage public',
    upgradeAltLead: 'Ou',
    upgradeLifetime: (plan, price) => `l’accès ${plan} en un seul paiement de ${price} $`,
    upgradeAltJoin: ', ou',
    comparePlansLink: 'comparez les formules',
    planLimitTitle: 'Vous avez atteint une limite de votre formule',
    planLimitBody:
      'Votre formule actuelle ne le permet pas. Passer à une formule supérieure supprime cette limite.',
    networkError: 'Problème de réseau — vérifiez votre connexion et réessayez.',
    requestRefused: (status) => `Le serveur a refusé cette requête (${status}).`,
    pleaseTryAgain: 'Veuillez réessayer.',
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
    savedSummary: (saved, limit, plan) => {
      const enregistres = saved === 1 ? '1 CV enregistré' : `${saved} CV enregistrés`;
      return limit === null
        ? `${enregistres}.`
        : `${enregistres} sur ${limit} avec la formule ${plan}.`;
    },
    nothingSavedYet: 'Rien pour l’instant.',
    sortName: 'Nom',
    sortAria: 'Trier les CV',
    layoutAria: 'Affichage',
    gridView: 'Grille',
    listView: 'Liste',
    gridViewAria: 'Affichage en grille',
    listViewAria: 'Affichage en liste',
    slotsFullTitle: (limit, plan) =>
      `Les ${limit} emplacements de CV de la formule ${plan} sont tous occupés`,
    slotsFullBody:
      'Supprimez ou renommez un CV existant pour libérer un emplacement, ou passez à Pro pour un nombre illimité de CV.',
    noneTitle: 'Aucun CV dans votre compte',
    noneBody:
      'Créez-en un à partir d’une page vierge, d’un exemple complet, ou directement depuis un modèle qui vous plaît.',
    createOne: 'Créer un CV',
    createTitle: 'Créer un nouveau CV',
    createLede:
      'Choisissez votre point de départ et le design à utiliser. Rien n’est enregistré tant que vous n’avez pas cliqué sur Créer.',
    createdTitle: 'CV créé',
    createdExampleBody:
      'Nous l’avons rempli avec un exemple complet — remplacez-le par vos propres informations.',
    createdBlankBody: 'Ouverture de l’éditeur…',
    createFailed: 'Impossible de créer le CV',
    backToMyCvs: 'Retour à mes CV',
    premiumTemplateTitle: (name) => `« ${name} » est un modèle Pro`,
    premiumTemplateBody: (count) =>
      `Nous avons sélectionné un modèle gratuit à la place. Passez à Pro pour débloquer les ${count} designs, ou choisissez l’un des modèles gratuits ci-dessous.`,
    unknownTemplateTitle: 'Ce modèle n’existe pas',
    unknownTemplateBody:
      'Le lien que vous avez suivi renvoie à un modèle que nous ne publions plus. Choisissez-en un autre ci-dessous.',
    detailLede: (template, percent, when) =>
      `${template} · complété à ${percent} % · modifié ${when}`,
    previewAria: 'Aperçu du CV',
    detailsHeading: 'Détails',
    factTemplate: 'Modèle',
    factCreated: 'Créé le',
    factLastEdited: 'Dernière modification',
    factDownloads: 'Téléchargements PDF',
    factVisibility: 'Visibilité',
    neverDownloaded: 'Jamais téléchargé',
    downloadsWithLast: (n, when) => `${n} · dernier ${when}`,
    unknownTime: 'inconnu',
    publicLinkOn: 'Lien public actif',
    privateLabel: 'Privé',
    publicLinkHeading: 'Lien public',
    publicLinkHint: 'Utilisez l’action Partager pour le copier ou le désactiver.',
    overall: 'Global',
    checkTodo: {
      name: 'Indiquez votre prénom et votre nom',
      headline: 'Ajoutez un titre professionnel, par exemple « Designer produit senior »',
      email: 'Ajoutez une adresse e-mail à laquelle les recruteurs peuvent répondre',
      phone: 'Ajoutez un numéro de téléphone',
      location: 'Indiquez votre ville et votre pays',
      summary: 'Rédigez un profil d’au moins trois lignes',
      experience: 'Ajoutez au moins un poste à la rubrique Expérience professionnelle',
      achievements:
        'Décrivez ce que vous avez accompli à un poste, pas seulement ce dont vous étiez responsable',
      education: 'Ajoutez une entrée à la rubrique Formation',
      skills: 'Ajoutez au moins cinq compétences',
      languages: 'Ajoutez au moins une langue et votre niveau',
      extras: 'Ajoutez un projet, une certification, une distinction ou une publication',
    },
    checkDone: {
      name: 'Nom',
      headline: 'Titre professionnel',
      email: 'E-mail de contact',
      phone: 'Numéro de téléphone',
      location: 'Ville et pays',
      summary: 'Profil',
      experience: 'Expérience professionnelle',
      achievements: 'Réalisations à un poste',
      education: 'Formation',
      skills: 'Compétences',
      languages: 'Langues',
      extras: 'Projets, certifications ou distinctions',
    },
    skillsShortTodo: (missing) =>
      `Ajoutez encore ${missing} compétence${missing === 1 ? '' : 's'} (cinq est le minimum pour que la liste paraisse réfléchie)`,
    srDone: ' — terminé',
    srMissing: ' — manquant',
    fixInEditor: 'Compléter dans l’éditeur',
    notFoundTitle: 'Ce CV est introuvable',
    notFoundBody:
      'Il a peut-être été supprimé, ou le lien renvoie à un CV appartenant à un autre compte.',
    openAria: (title) => `Ouvrir ${title}`,
    publicBadge: 'Public',
    actionsAria: (title) => `Actions pour ${title}`,
    downloadPdf: 'Télécharger le PDF',
    preparingPdf: 'Préparation du PDF…',
    renameAction: 'Renommer…',
    shareAction: 'Partager…',
    sharingAction: 'Partage…',
    deleteAction: 'Supprimer…',
    shareShort: 'Partager',
    pdfReadyTitle: 'PDF prêt',
    pdfReadyBody: 'Le téléchargement devrait démarrer automatiquement.',
    pdfFailed: 'Impossible de créer le PDF',
    duplicatedBody: (title) => `« ${title} » figure dans votre liste.`,
    duplicateFailed: 'Impossible de dupliquer ce CV',
    nameLabel: 'Nom du CV',
    nameRequired: 'Donnez un nom à ce CV pour le retrouver plus tard.',
    nameTooLong: (max) => `Le nom ne doit pas dépasser ${max} caractères.`,
    renameTitle: 'Renommer le CV',
    renameLede: 'Vous seul voyez ce nom ; il n’apparaît pas sur le document.',
    renameSave: 'Enregistrer le nom',
    renamedTitle: 'Renommé',
    renamedBody: (title) => `Ce CV s’appelle désormais « ${title} ».`,
    renameFailed: 'Impossible de renommer ce CV',
    deletedTitle: 'CV supprimé',
    deletedBody: (title) => `« ${title} » a été supprimé.`,
    deleteFailed: 'Impossible de supprimer ce CV',
    shareModalLede:
      'La publication crée une page en lecture seule à une adresse impossible à deviner. Vous pouvez la désactiver à tout moment.',
    shareProTitle: 'Les liens publics sont réservés à Pro',
    shareProBody:
      'Passez à Pro pour publier votre CV à une adresse que vous pourrez glisser dans un e-mail ou une candidature.',
    sharePublicLabel: 'Toute personne disposant du lien peut consulter ce CV',
    shareLiveHint: 'La page est en ligne.',
    shareOffHint: 'Rien n’est publié tant que vous n’avez pas activé cette option.',
    shareUpdating: 'Mise à jour du lien…',
    shareOnTitle: 'Lien de partage activé',
    shareOnBody: 'Toute personne disposant du lien peut désormais consulter ce CV.',
    shareOffTitle: 'Lien de partage désactivé',
    shareOffBody: 'Le lien ne fonctionne plus.',
    shareFailed: 'Impossible de modifier le partage',
    copyFailedTitle: 'Copie impossible',
    copyFailedBody: 'Sélectionnez le lien et copiez-le manuellement.',
    limitTitle: (limit) => `Vous utilisez les ${limit} CV autorisés par votre formule`,
    limitBody:
      'Supprimez un CV pour libérer une place, ou passez à Pro pour un nombre illimité de CV.',
    usedOfLimit: (used, limit) =>
      used === 1
        ? `1 CV utilisé sur ${limit} avec votre formule`
        : `${used} CV utilisés sur ${limit} avec votre formule`,
    proRemovesLimit: 'Pro supprime cette limite et débloque tous les modèles.',
    stepStart: '1. Choisissez un point de départ',
    stepTemplate: '2. Choisissez un modèle',
    stepTemplateHint:
      'Vous pourrez en changer plus tard sans rien perdre de ce que vous avez écrit.',
    stepName: '3. Nommez-le et créez-le',
    nameHint: (untitled) =>
      `Vous seul le voyez. Laissez ce champ vide pour l’appeler « ${untitled} ».`,
    namePlaceholder: 'ex. Designer produit — Atlas Cloud',
    summaryTemplate: 'Modèle :',
    summaryPaper: 'Format :',
    summaryContent: 'Contenu :',
    noneSelected: 'Aucun sélectionné',
    contentExample: 'Exemple complet',
    contentEmpty: 'Vide',
    chooseTemplateHint:
      'Parcourez tous les designs, filtrez par style, puis partez de celui qui vous plaît.',
  },
  templates: {
    allAvailable: (count) =>
      `Les ${count} designs sont inclus dans votre formule. Il suffit d’un clic pour commencer un CV.`,
    freeSubset: (free, total) =>
      `${free} des ${total} designs sont inclus dans la formule Gratuite. Les autres sont signalés Pro.`,
    filterAria: 'Filtrer les modèles par catégorie',
    allFilter: 'Tous',
    showing: (shown, total) => `${shown} modèles affichés sur ${total}`,
    // Singular, unlike the plural chips on the marketing site: the same label also sits
    // under a single template card, where « Modernes » would not agree.
    categoryLabel: {
      modern: 'Moderne',
      corporate: 'Entreprise',
      creative: 'Créatif',
      technology: 'Informatique',
      classic: 'Classique',
      ats: 'Compatible ATS',
    },
    oneColumn: 'une colonne',
    twoColumns: 'deux colonnes',
    details: 'Détails',
    searchPlaceholder: 'Rechercher un modèle — « ats », « cadre », « designer »…',
    searchAria: 'Rechercher un modèle',
    planFilterAria: 'Filtrer par formule',
    blockedTitle: 'Ce modèle est réservé à Pro',
    blockedBody:
      'Passez à Pro pour débloquer tous les designs, ou continuez avec un modèle gratuit — la sélection gratuite comprend toutes les mises en page compatibles ATS.',
    emptyTitle: 'Aucun modèle ne correspond',
    emptyBody:
      'Essayez une recherche plus courte, ou retirez les filtres de catégorie et de formule.',
    badgeFree: 'GRATUIT',
    badgePro: 'PRO',
    useTemplate: 'Utiliser ce modèle',
    unlockWithPro: 'Débloquer avec Pro',
    lockedAria: (name) => `${name} est un modèle Pro — voir les formules`,
  },
  account: {
    unfinishedHeading: 'Paiements non finalisés · aucun montant n’a été débité',
    unfinishedBody: (count) =>
      `${count === 1 ? 'Ce paiement a été' : 'Ces paiements ont été'} entamé${count === 1 ? '' : 's'} sans jamais aboutir : la commande a été ouverte avec PayPal puis abandonnée avant le règlement. Aucun montant n’a été débité de votre compte et aucune formule n’a été activée. Nous conservons la référence pour que le support puisse vérifier si vous pensez le contraire.`,
    lede: 'Le compte avec lequel vous êtes connecté, ce que votre formule autorise et ce que vous avez payé.',
    unverifiedTitle: 'Votre adresse e-mail n’est pas vérifiée',
    unverifiedBody:
      'La vérification protège votre compte et rend possible la récupération du mot de passe.',
    verifyNow: 'Vérifier maintenant',
    profileHint: 'Ces informations proviennent du compte avec lequel vous vous connectez.',
    displayName: 'Nom affiché',
    notSet: 'Non renseigné',
    email: 'Adresse e-mail',
    verified: 'Vérifiée',
    unverified: 'Non vérifiée',
    memberSince: 'Membre depuis',
    lastSignIn: 'Dernière connexion',
    profileLockedLead: (siteName) =>
      `En lecture seule pour l’instant. Votre nom affiché et votre adresse e-mail proviennent de votre fournisseur de connexion et sont actualisés à chaque connexion — ${siteName} n’a pas encore de point d’accès pour modifier le profil, une modification faite ici ne serait donc pas conservée. Modifiez-les chez votre fournisseur, ou`,
    askSupport: 'demandez à l’assistance',
    profileLockedTail: ' de le faire pour vous.',
    planHint: 'Ce que votre compte permet actuellement.',
    statusLabel: 'Statut',
    subscriptionStatus: {
      none: 'Aucun abonnement',
      active: 'Actif',
      expired: 'Expiré',
      cancelled: 'Résilié',
      pending: 'En attente',
    },
    expires: 'Expire le',
    renews: 'Renouvellement le',
    neverPermanent: 'Jamais — accès permanent',
    notApplicableFree: 'Sans objet avec la formule Gratuite',
    cvsAndDownloads: 'CV / téléchargements',
    cvAllowance: (n) => (n === null ? 'Illimité' : `${n} CV`),
    downloadAllowance: (n) =>
      n === null ? 'téléchargements illimités' : `${n} téléchargements par mois`,
    billingHeading: 'Historique de facturation',
    billingHint: 'Les paiements réellement prélevés sur ce compte.',
    noPaymentsTitle: 'Aucun paiement pour l’instant',
    noPaymentsPremium:
      'Votre accès a été accordé sans paiement enregistré. Contactez l’assistance si cela vous semble anormal.',
    noPaymentsAbandoned:
      'Vous avez commencé un paiement sans jamais le finaliser : rien n’a donc été prélevé.',
    noPaymentsFree: 'Vous êtes sur la formule Gratuite : il n’y a donc rien à facturer.',
    colDate: 'Date',
    colPlan: 'Formule',
    colAmount: 'Montant',
    colStatus: 'Statut',
    colOrder: 'Commande',
    paymentStatus: {
      created: 'Créé',
      approved: 'Approuvé',
      completed: 'Effectué',
      failed: 'Échoué',
      cancelled: 'Annulé',
      refunded: 'Remboursé',
    },
    invoiceLead: 'Besoin d’une facture, d’un remboursement ou d’un reçu renvoyé ?',
    contactUs: 'Contactez-nous',
    invoiceTail: ' en indiquant le numéro de commande.',
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
    pageLede:
      'Seuls les réglages qui font vraiment quelque chose sont modifiables ici. Les autres le disent clairement.',
    preferencesHint: 'Appliqué au prochain CV que vous créerez depuis ce navigateur.',
    emailHeading: 'Préférences d’e-mail',
    emailHint: 'Ce que nous sommes autorisés à vous envoyer.',
    readOnly: 'Lecture seule',
    marketingEmail: 'E-mails produit et marketing',
    optedIn: 'Accepté',
    optedOut: 'Refusé',
    accountEmail: 'E-mails liés au compte',
    accountEmailAlways: 'Toujours envoyés — reçus, vérification et alertes de sécurité',
    emailLockedLead: (siteName) =>
      `${siteName} n’a pas encore de point d’accès pour modifier ce réglage ; il n’y a donc ici aucun interrupteur qui ferait semblant de fonctionner. Chaque e-mail marketing contient un lien de désinscription en un clic, ou`,
    askUs: 'demandez-nous',
    emailLockedTail: ' de le modifier.',
    dataHeading: 'Vos données',
    dataHint: 'Récupérez à tout moment une copie de tout ce que vous avez écrit ici.',
    exportNote:
      'Le fichier contient l’intégralité de chaque CV — coordonnées, rubriques et réglages de design — au format JSON. Il est constitué dans votre navigateur à partir de votre propre compte : rien n’est stocké ni envoyé ailleurs.',
    dangerZone: 'Zone sensible',
    dangerZoneHint: 'Actions irréversibles.',
    defaultsSaved: 'Valeurs par défaut enregistrées',
    defaultsSaveFailedTitle: 'Enregistrement impossible sur cet appareil',
    defaultsSaveFailedBody:
      'Votre navigateur bloque le stockage local — c’est souvent le cas en navigation privée.',
    readingDefaults: 'Lecture de vos valeurs par défaut…',
    paperSizeHint:
      'Appliqué à la création d’un CV. Vous pouvez toujours le modifier CV par CV dans l’éditeur.',
    paperA4Hint: '210 × 297 mm — standard hors Amérique du Nord',
    paperLetterHint: '8,5 × 11 po — standard aux États-Unis et au Canada',
    defaultTemplateHint: 'Présélectionné lors de la création d’un CV.',
    defaultTemplateFreeHint:
      'Seuls les modèles gratuits peuvent servir de valeur par défaut avec la formule Gratuite.',
    useAppDefault: (templateName) => `Utiliser la valeur par défaut (${templateName})`,
    saveDefaults: 'Enregistrer les préférences',
    savedLocallyNote: (siteName) =>
      `Enregistré uniquement dans ce navigateur — ${siteName} n’a pas encore de point d’accès pour synchroniser les préférences entre appareils.`,
    exportButton: 'Télécharger tous mes CV en JSON',
    exportListing: 'Recensement de vos CV…',
    exportProgress: (done, total) => `Export de ${done} sur ${total}…`,
    exportNothingTitle: 'Rien à exporter',
    exportNothingBody: 'Vous n’avez pas encore enregistré de CV.',
    exportPartialTitle: (done, total) =>
      done === 1 ? `1 CV exporté sur ${total}` : `${done} CV exportés sur ${total}`,
    exportPartialBody: (titles) => `Impossible de lire : ${titles}. Réessayez dans une minute.`,
    exportReadyTitle: 'Export prêt',
    exportReadyBody: (n) =>
      n === 1 ? '1 CV enregistré au format JSON.' : `${n} CV enregistrés au format JSON.`,
    exportFailed: 'Impossible d’exporter vos CV',
    deleteAccountBody:
      'Supprime votre profil, tous vos CV enregistrés et votre historique de paiement. La suppression automatique n’existe pas encore : ce bouton ouvre une demande pré-remplie à notre assistance, que nous traitons à la main et confirmons par e-mail.',
    deleteAccountAction: 'Supprimer le compte…',
    deleteModalTitle: 'Supprimer votre compte',
    deleteModalLede:
      'Cette action est irréversible. Saisissez votre adresse e-mail pour confirmer votre choix.',
    deleteContinue: 'Poursuivre la demande',
    deleteNothingTitle: 'Rien n’est supprimé sur cet écran',
    deleteNothingBody: (siteName) =>
      `${siteName} n’a pas de point d’accès de suppression automatique. Confirmer ici vous amène à une demande d’assistance pré-remplie ; vos données sont supprimées une fois que notre équipe l’a traitée.`,
    typeEmailToConfirm: (email) => `Saisissez ${email} pour confirmer`,
    emailMismatch: 'Cela ne correspond pas à votre adresse e-mail.',
    deleteRequestSubject: 'Demande de suppression de compte',
    deleteRequestBody: (siteName, email) =>
      `Merci de supprimer mon compte ${siteName} (${email}) ainsi que tout ce qu’il contient : mes CV enregistrés, mon historique de paiement et mon profil.`,
  },
  checkout: {
    noTransactionTitle: 'Il manque la référence de paiement dans ce lien',
    noTransactionBody:
      'Les liens de paiement expirent et ne peuvent être ouverts qu’une seule fois. Recommencez depuis la page des tarifs, ou répondez à l’e-mail reçu et nous vous en enverrons un nouveau.',
    unconfiguredTitle: 'Le paiement par carte est indisponible pour le moment',
    unconfiguredBody:
      'Le problème vient de chez nous, pas de votre paiement — aucun montant n’a été débité. Réessayez dans quelques instants, ou contactez-nous et nous vous enverrons un lien fonctionnel.',
    openFailedTitle: 'Impossible d’ouvrir la fenêtre de paiement',
    openFailedBody:
      'Aucun montant n’a été débité. Actualisez la page pour réessayer — si le problème persiste, contactez-nous en indiquant le lien que vous avez suivi.',
    openingCheckout: 'Ouverture de la fenêtre de paiement…',
    completing: 'Paiement reçu — confirmation en cours…',
    reopen: 'Rouvrir la fenêtre de paiement',
    methodHeading: 'Comment souhaitez-vous payer ?',
    methodPaddle: 'Carte ou portefeuille',
    methodPaypal: 'PayPal',
    methodPaddleHint:
      'Carte, Apple Pay, Google Pay ou PayPal, dans une fenêtre qui s’ouvre par-dessus cette page. Paddle est le vendeur officiel : la TVA applicable à votre pays est calculée et affichée avant le paiement.',
    methodPaypalHint:
      'Vous validez le paiement sur PayPal, puis vous revenez directement ici. Aucun compte PayPal n’est nécessaire : une carte bancaire suffit.',
    payNow: (priceLabel) => `Payer ${priceLabel}`,
    opening: 'Ouverture de la fenêtre de paiement…',
    confirming: 'Confirmation du paiement…',
    paddleNote: (planName) =>
      `La fenêtre de paiement est celle de Paddle, pas la nôtre : nous ne voyons ni ne conservons vos données bancaires. La formule ${planName} n’est activée qu’une fois le paiement confirmé par notre serveur auprès de Paddle.`,
    startFailedTitle: 'Le paiement n’a pas pu démarrer',
    startFailedBody:
      'Nous n’avons pas pu démarrer le paiement. Rien n’a été débité — réessayez dans un instant.',
    serverError: (code) =>
      ({
        unauthenticated:
          'Votre session a expiré. Reconnectez-vous et le paiement reprendra où il en était.',
        forbidden: 'Ce compte n’est pas autorisé à effectuer cet achat.',
        'email-unverified':
          'Confirmez d’abord votre adresse e-mail : nous vous avons envoyé un lien. Rien n’a été débité.',
        'rate-limited':
          'Plusieurs tentatives ont été faites coup sur coup. Patientez une minute et réessayez — rien n’a été débité.',
        'invalid-plan': 'Cette formule ne peut pas être achetée.',
        'invalid-request': 'Un élément de cette demande n’était pas valide. Rien n’a été débité.',
        'not-found': 'Nous n’avons pas trouvé ce paiement.',
        'unknown-order':
          'Nous n’avons aucune trace de ce paiement sur ce compte. Si une somme a bien été débitée, elle n’est pas perdue — contactez-nous avec la référence de transaction ci-dessous.',
        'payments-unavailable':
          'Le paiement par carte est indisponible pour le moment. Rien n’a été débité — réessayez sous peu.',
        'not-configured':
          'Le paiement par carte est indisponible pour le moment. Rien n’a été débité — réessayez sous peu.',
        'payment-provider-error':
          'Notre prestataire de paiement n’a pas répondu. Rien n’a été débité — réessayez dans un instant.',
        'payment-not-completed':
          'Ce paiement n’est pas encore passé. Si vous venez de payer, laissez-lui quelques secondes.',
        'amount-mismatch':
          'Le montant payé ne correspond pas à cette formule ; nous ne l’avons donc pas activée. Rien de plus n’a été débité — contactez-nous et nous régulariserons.',
        'server-error': 'Une erreur est survenue de notre côté. Rien n’a été débité.',
        'request-failed': 'Une erreur est survenue de notre côté. Rien n’a été débité.',
      })[code ?? ''] ?? null,
    scriptFailed:
      'La fenêtre de paiement n’a pas pu se charger. Vérifiez qu’aucun bloqueur de publicités ni aucune extension de confidentialité ne bloque Paddle, puis réessayez — rien n’a été débité.',
    offline:
      'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez — rien n’a été débité.',
    confirmTitle: 'Confirmation de votre paiement…',
    confirmBody:
      'Paddle a encaissé le paiement et nous le vérifions auprès d’eux avant de débloquer quoi que ce soit. Vous pouvez fermer cet onglet si nécessaire : votre formule sera activée dans tous les cas.',
    stillConfirmingBody:
      'Paddle n’a pas encore confirmé le paiement. Nous continuons de demander — cela peut prendre quelques secondes, le temps que votre banque le valide. Attendre ici ne fait rien perdre.',
    confirmFailedTitle: 'Nous n’avons pas pu confirmer ce paiement',
    nextSignIn:
      'Connectez-vous avec le compte utilisé pour payer, puis rouvrez cette page. Votre paiement n’est pas perdu : la formule est activée dès que nous pouvons la rattacher à votre compte.',
    nextSupport: (email) =>
      `Si un montant a été débité, écrivez à ${email} en indiquant votre identifiant de transaction Paddle : nous corrigerons la situation ou vous rembourserons.`,
    nextWait:
      'Si vous avez finalisé le paiement, la formule s’active d’elle-même en moins d’une minute. Appuyez sur « Réessayer » ou ouvrez la page de votre compte dans un instant — inutile de payer une seconde fois.',
    receiptNote:
      'Paddle vous a envoyé par e-mail un reçu ainsi qu’une facture que vous pouvez passer en frais.',
    transactionRef: 'Transaction',
    unavailableTitle: 'Les paiements sont indisponibles pour le moment',
    unavailableBody: (email) =>
      `Aucun prestataire de paiement n’est configuré sur ce déploiement : il n’y a donc rien à payer ici et rien n’a été débité. Écrivez à ${email} et nous activerons votre formule manuellement.`,
    backToDomain: (domain) => `Retour sur ${domain}`,
    footerPricing: 'Tarifs',
    footerRefund: 'Politique de remboursement',
    footerTerms: 'Conditions d’utilisation',
    footerPrivacy: 'Confidentialité',
    footerContact: 'Contact',
    interval: {
      forever: 'à vie',
      month: 'par mois',
      year: 'par an',
      'one-time': 'paiement unique',
    },
    stepReview: 'Étape 1 sur 3 · Vérification',
    confirmPlanTitle: (planName) => `Confirmez votre formule ${planName}`,
    orderSummary: 'Récapitulatif de la commande',
    rowPlan: 'Formule',
    rowBilling: 'Facturation',
    billingOneOff: 'Paiement unique, sans renouvellement',
    billingRecurring: (days) => `Tous les ${days} jours, résiliable à tout moment`,
    totalToday: 'Total à payer aujourd’hui',
    ownsLifetimeTitle: (lifetimeName) => `Vous avez déjà ${lifetimeName}`,
    ownsLifetimeBody: (lifetimeName, planName) =>
      `L’accès ${lifetimeName} n’expire jamais et comprend déjà tout ce que contient ${planName} : il n’y a donc rien à payer ici. Nous préférons vous le dire plutôt que d’encaisser.`,
    viewAccount: 'Voir mon compte',
    repeatTitle: (planName) => `Vous êtes déjà sur ${planName}`,
    repeatBody: (days, from, siteName, lifetimeName, lifetimePrice) =>
      `Payer à nouveau prolonge votre accès de ${days} jours ${from}. Si vous comptez continuer à utiliser ${siteName}, ${lifetimeName} à ${lifetimePrice} revient moins cher au bout de huit mois —`,
    extendsFromDate: (date) => `à compter du ${date}`,
    extendsFromToday: 'à compter d’aujourd’hui',
    repeatSwitch: (lifetimeName) => `passez à ${lifetimeName}`,
    termsIntro: 'En continuant, vous acceptez nos',
    termsLink: 'conditions d’utilisation',
    termsAnd: 'et notre',
    refundLink: 'politique de remboursement',
    cardDetailsNote:
      'Nous ne voyons ni ne conservons vos données bancaires — le prestataire de paiement s’en charge entièrement.',
    changedMind: 'Vous avez changé d’avis ?',
    comparePlansAgain: 'Comparez à nouveau les formules',
    orWriteTo: 'ou écrivez-nous à',
    continueToPaypal: (priceLabel) => `Continuer vers PayPal — ${priceLabel}`,
    redirectingToPaypal: 'Redirection vers PayPal…',
    paypalNote: (planName) =>
      `Vous validez le paiement sur PayPal, puis vous revenez directement ici. Vous pouvez payer avec votre solde PayPal, un compte bancaire ou une carte bancaire — aucun compte PayPal n’est nécessaire. La formule ${planName} n’est activée qu’une fois le paiement confirmé par notre serveur auprès de PayPal.`,
    paypalStartFailed: 'PayPal n’a pas pu démarrer ce paiement. Réessayez dans un instant.',
    paypalNoApproveUrl: (email) =>
      `La commande a bien été créée, mais PayPal n’a renvoyé aucun lien de paiement. Rien n’a été débité — réessayez, ou écrivez à ${email} si cela se reproduit.`,
    diagnosticCause: (issue) => `Cause : ${issue}`,
    diagnosticReference: (reference) => `Référence : ${reference}`,
    stepConfirmation: 'Étape 3 sur 3 · Confirmation',
    confirmationTitle: 'Confirmation du paiement',
    confirmationLede:
      'Vous revenez de PayPal. Avant tout déblocage, notre serveur vérifie la commande directement auprès de PayPal : ce que vous voyez ci-dessous est le résultat réel, pas un message déclenché par la redirection.',
    payerReference: 'Référence payeur PayPal',
    payerReferenceNote:
      'Conservez-la avec votre reçu : en l’indiquant avec le numéro de commande, nous retrouvons un paiement immédiatement.',
    paypalConfirmBody:
      'Nous vérifions la commande auprès de PayPal avant de débloquer quoi que ce soit. Cela prend généralement quelques secondes — ne fermez pas cet onglet.',
    paypalFailedBody: 'Nous n’avons pas pu confirmer ce paiement auprès de PayPal.',
    paypalNextSupport: (email) =>
      `Si un montant a été débité, écrivez à ${email} en indiquant votre identifiant de transaction PayPal : nous corrigerons la situation ou vous rembourserons.`,
    paypalNextUnknownOrder: (email) =>
      `Envoyez-nous votre identifiant de transaction PayPal à ${email} et nous réglerons cela le jour même.`,
    confirmOffline: 'Nous n’avons pas pu joindre notre serveur pour confirmer le paiement.',
    nextRetryConnection:
      'Vérifiez votre connexion et appuyez sur « Réessayer ». Votre paiement ne risque rien : rien ne sera accordé ni débité deux fois.',
    missingReference: 'Il manque la référence de paiement dans ce lien de confirmation.',
    missingReferenceNext:
      'Ouvrez le reçu que votre prestataire de paiement vous a envoyé par e-mail et suivez le lien qu’il contient, ou consultez la page de votre compte : un paiement abouti active la formule de lui-même.',
    emailSupport: (email) => `Écrire à ${email}`,
    quoteReference: 'Indiquez cette référence si vous nous contactez :',
    backToPricing: 'Retour aux tarifs',
    planActive: (planName) => `Vous êtes sur ${planName}`,
    planAlreadyActive: (planName) => `${planName} est déjà actif`,
    alreadyConfirmedBody:
      'Cette commande avait déjà été confirmée : rien n’a été débité ni accordé deux fois. Tout ce qui suit est disponible dès maintenant sur votre compte.',
    paypalReceiptNote: 'PayPal vous a envoyé un reçu par e-mail.',
    noRenewalNote: 'Cette formule n’expire pas : il n’y a rien à renouveler ni à résilier.',
    accessDaysNote: (days) =>
      `Ce paiement couvre ${days} jours d’accès et ne se renouvelle pas tout seul — vous ne serez jamais débité automatiquement.`,
    refundLead: 'Vous avez changé d’avis ? Notre',
    refundTail: 'vous laisse 14 jours.',
    orderRef: 'Commande',
    cancelledTitle: 'Paiement annulé',
    cancelledNothingCharged: 'Rien n’a été débité.',
    cancelledBody: (planName) =>
      `Vous avez quitté PayPal avant de valider le paiement : aucune commande n’a abouti${
        planName ? ` et ${planName} n’a pas été ajouté à votre compte` : ''
      }. Votre compte est exactement dans l’état où il était il y a une minute.`,
    cancelledCvsSafe:
      'Tous les CV que vous avez rédigés sont toujours là, toujours modifiables et toujours téléchargeables dans la limite de votre formule actuelle.',
    cancelledNextHeading: 'Reprendre là où vous en étiez',
    cancelledStep1Lead: 'Ouvrez la',
    pricingPageLink: 'page des tarifs',
    cancelledStep1Tail: (planName, currency) =>
      `et choisissez ${
        planName ? `à nouveau ${planName}, ou l’autre formule` : 'une formule'
      }. Les prix sont indiqués en ${currency} et affichés en totalité avant votre redirection vers PayPal.`,
    cancelledStep2:
      'Validez le paiement sur PayPal. Vous pouvez payer avec votre solde PayPal, un compte bancaire associé ou une carte bancaire — aucun compte PayPal n’est nécessaire.',
    cancelledStep3:
      'Vous revenez ici et la formule est activée dès que notre serveur a confirmé la commande auprès de PayPal. Cela prend quelques secondes.',
    cancelledHelpLead:
      'Vous avez annulé parce que quelque chose vous a semblé anormal, ou parce que PayPal n’aboutissait pas ? Dites-le-nous à',
    cancelledHelpOr: 'ou via le',
    contactFormLink: 'formulaire de contact',
    cancelledHelpTail:
      'Nous préférons réparer un paiement défaillant plutôt que de perdre la vente en silence.',
    cancelledMismatchLead:
      'Si un montant a malgré tout été débité, c’est une anomalie que nous voulons connaître immédiatement : écrivez-nous en indiquant votre identifiant de transaction PayPal et nous activerons la formule ou vous rembourserons le jour même. Notre',
    cancelledMismatchTail: 's’applique dans les deux cas.',
  },
};

const DE: DashboardCopy = {
  dashboard: {
    title: 'Übersicht',
    adminConsole: 'Admin-Konsole',
    tabBarAria: 'Tableiste der Übersicht',
    greeting: (name) => (name ? `Willkommen zurück, ${name}` : 'Willkommen zurück'),
    greetingNew: (name) => (name ? `Willkommen, ${name}` : 'Willkommen'),
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
    overviewLedeEmpty:
      'Noch nichts gespeichert. Wählen Sie unten einen Ausgangspunkt — Ihr Lebenslauf ist in einem Zug fertig.',
    overviewLede: (n) =>
      n === 1
        ? 'Sie haben 1 Lebenslauf in Ihrem Konto.'
        : `Sie haben ${n} Lebensläufe in Ihrem Konto.`,
    viewAllCvs: 'Alle Lebensläufe anzeigen',
    planUsage: 'Nutzung Ihres Tarifs',
    statCvsSaved: 'Gespeicherte Lebensläufe',
    statDownloads: 'Downloads',
    statPlan: 'Tarif',
    statCompleteness: 'Ø Vollständigkeit',
    unlimitedOnPlan: 'In Ihrem Tarif unbegrenzt.',
    atCvLimitHint: 'Limit erreicht — löschen Sie einen oder führen Sie ein Upgrade durch.',
    cvsLeftOnPlan: (n, plan) => `Noch ${n} frei im Tarif ${plan}.`,
    unlimitedExports: 'Unbegrenzte PDF-Exporte.',
    resetsOn: (date) => `Wird am ${date} zurückgesetzt.`,
    renewsOn: (date) => `Verlängert sich am ${date}.`,
    permanentAccess: 'Dauerhafter Zugang — keine Verlängerung.',
    freeForever: 'Dauerhaft kostenlos, mit Grenzen.',
    completenessNoData: 'Erstellen Sie einen Lebenslauf, um diesen Wert zu verfolgen.',
    completenessAcrossCvs: 'Über alle Lebensläufe in Ihrem Konto.',
    downloadLimitTitle: 'Sie haben alle Downloads dieses Monats verbraucht',
    downloadLimitBody: (date) =>
      `Der Zähler wird am ${date} zurückgesetzt. Mit Pro entfällt die Grenze ganz.`,
    seePlans: 'Tarife ansehen',
    finishHeading: (title) => `„${title}“ fertigstellen`,
    finishLede: (percent) => `Er ist zu ${percent} % vollständig. Das sind die größten Lücken:`,
    continueEditing: 'Weiter bearbeiten',
    recentlyEdited: 'Zuletzt bearbeitet',
    allCvsCount: (n) => `Alle ${n} Lebensläufe`,
    noCvsYet: 'Noch keine Lebensläufe',
    noCvsBody:
      'Leer beginnen, mit einem ausgearbeiteten Beispiel starten oder erst die Vorlagen durchsehen — Hauptsache, Sie kommen ins Schreiben.',
    browseTemplates: 'Vorlagen durchsehen',
    startNewCv: 'Neuen Lebenslauf beginnen',
    cvLimitTitle: (limit, plan) =>
      `Sie nutzen alle ${limit} Lebensläufe, die der Tarif ${plan} erlaubt`,
    cvLimitBodyLead: 'Löschen Sie einen unter',
    cvLimitBodyTail:
      ', um Platz zu schaffen, oder wechseln Sie zu Pro für unbegrenzt viele Lebensläufe.',
    errorTitle: 'Diese Seite wurde nicht geladen',
    errorBody:
      'Auf unserer Seite ist etwas schiefgelaufen. Ihre Lebensläufe sind sicher — es wurde nichts geändert.',
    errorBodyWithRef: (reference) =>
      `Auf unserer Seite ist etwas schiefgelaufen. Nennen Sie die Referenz ${reference}, wenn Sie den Support kontaktieren.`,
    backToDashboard: 'Zurück zur Übersicht',
    errorSupport: (email) => `Wenn es weiterhin auftritt, schreiben Sie an ${email}.`,
    upgradeHeading: (plan, price, interval) => `Upgrade auf ${plan} — ${price} $/${interval}`,
    billingInterval: {
      forever: 'dauerhaft',
      month: 'Monat',
      year: 'Jahr',
      'one-time': 'einmalig',
    },
    getPlan: (plan) => `Zu ${plan} wechseln`,
    gainUnlimitedCvs: (freeLimit) => `Unbegrenzt viele Lebensläufe statt ${freeLimit}`,
    gainUnlimitedDownloads: (freeLimit) => `Unbegrenzte PDF-Downloads statt ${freeLimit} pro Monat`,
    gainAllTemplates: (total, free) => `Alle ${total} Vorlagen statt ${free}`,
    gainCustomisation: 'Schriften, Abstände, eigene Abschnitte und ein öffentlicher Freigabelink',
    upgradeAltLead: 'Oder',
    upgradeLifetime: (plan, price) => `${plan}-Zugang einmalig für ${price} $`,
    upgradeAltJoin: ', oder',
    comparePlansLink: 'vergleichen Sie die Tarife',
    planLimitTitle: 'Sie haben ein Tariflimit erreicht',
    planLimitBody: 'Ihr aktueller Tarif erlaubt das nicht. Ein Upgrade hebt die Grenze auf.',
    networkError: 'Netzwerkproblem — prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    requestRefused: (status) => `Der Server hat diese Anfrage abgelehnt (${status}).`,
    pleaseTryAgain: 'Bitte versuchen Sie es erneut.',
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
    savedSummary: (saved, limit, plan) =>
      limit === null
        ? `${saved} gespeichert.`
        : `${saved} von ${limit} im Tarif ${plan} gespeichert.`,
    nothingSavedYet: 'Noch nichts vorhanden.',
    sortName: 'Name',
    sortAria: 'Lebensläufe sortieren',
    layoutAria: 'Ansicht',
    gridView: 'Raster',
    listView: 'Liste',
    gridViewAria: 'Rasteransicht',
    listViewAria: 'Listenansicht',
    slotsFullTitle: (limit, plan) => `Alle ${limit} Lebenslauf-Plätze im Tarif ${plan} sind belegt`,
    slotsFullBody:
      'Löschen Sie einen vorhandenen Lebenslauf oder benennen Sie ihn um, um einen Platz freizugeben, oder wechseln Sie zu Pro für unbegrenzt viele Lebensläufe.',
    noneTitle: 'Keine Lebensläufe in Ihrem Konto',
    noneBody:
      'Erstellen Sie einen aus einer leeren Seite, aus einem ausgearbeiteten Beispiel oder direkt aus einer Vorlage, die Ihnen gefällt.',
    createOne: 'Lebenslauf erstellen',
    createTitle: 'Neuen Lebenslauf erstellen',
    createLede:
      'Wählen Sie Ihren Ausgangspunkt und das Design. Gespeichert wird erst, wenn Sie auf Erstellen klicken.',
    createdTitle: 'Lebenslauf erstellt',
    createdExampleBody:
      'Wir haben ihn mit einem ausgearbeiteten Beispiel gefüllt — ersetzen Sie es durch Ihre eigenen Angaben.',
    createdBlankBody: 'Der Editor wird geöffnet…',
    createFailed: 'Der Lebenslauf konnte nicht erstellt werden',
    backToMyCvs: 'Zurück zu meinen Lebensläufen',
    premiumTemplateTitle: (name) => `„${name}“ ist eine Pro-Vorlage`,
    premiumTemplateBody: (count) =>
      `Wir haben stattdessen eine kostenlose Vorlage ausgewählt. Mit einem Upgrade erhalten Sie alle ${count} Designs — oder wählen Sie unten eine der kostenlosen.`,
    unknownTemplateTitle: 'Diese Vorlage gibt es nicht',
    unknownTemplateBody:
      'Der Link, dem Sie gefolgt sind, verweist auf eine Vorlage, die wir nicht mehr anbieten. Wählen Sie unten eine andere.',
    detailLede: (template, percent, when) =>
      `${template} · zu ${percent} % vollständig · bearbeitet ${when}`,
    previewAria: 'Vorschau des Lebenslaufs',
    detailsHeading: 'Details',
    factTemplate: 'Vorlage',
    factCreated: 'Erstellt',
    factLastEdited: 'Zuletzt bearbeitet',
    factDownloads: 'PDF-Downloads',
    factVisibility: 'Sichtbarkeit',
    neverDownloaded: 'Nie heruntergeladen',
    downloadsWithLast: (n, when) => `${n} · zuletzt ${when}`,
    unknownTime: 'unbekannt',
    publicLinkOn: 'Öffentlicher Link aktiv',
    privateLabel: 'Privat',
    publicLinkHeading: 'Öffentlicher Link',
    publicLinkHint: 'Über die Aktion Teilen können Sie ihn kopieren oder abschalten.',
    overall: 'Insgesamt',
    checkTodo: {
      name: 'Tragen Sie Vor- und Nachnamen ein',
      headline: 'Ergänzen Sie eine Berufsbezeichnung, etwa „Senior Product Designer“',
      email: 'Ergänzen Sie eine E-Mail-Adresse, unter der Recruiter Sie erreichen',
      phone: 'Ergänzen Sie eine Telefonnummer',
      location: 'Geben Sie Wohnort und Land an',
      summary: 'Schreiben Sie ein Profil von mindestens drei Zeilen',
      experience: 'Tragen Sie mindestens eine Station unter Berufserfahrung ein',
      achievements:
        'Beschreiben Sie, was Sie in einer Position erreicht haben — nicht nur, wofür Sie zuständig waren',
      education: 'Tragen Sie einen Eintrag unter Ausbildung ein',
      skills: 'Ergänzen Sie mindestens fünf Kenntnisse',
      languages: 'Ergänzen Sie mindestens eine Sprache und Ihr Niveau',
      extras: 'Ergänzen Sie ein Projekt, ein Zertifikat, eine Auszeichnung oder eine Publikation',
    },
    checkDone: {
      name: 'Name',
      headline: 'Berufsbezeichnung',
      email: 'Kontakt-E-Mail',
      phone: 'Telefonnummer',
      location: 'Wohnort und Land',
      summary: 'Profil',
      experience: 'Berufserfahrung',
      achievements: 'Erfolge in einer Position',
      education: 'Ausbildung',
      skills: 'Kenntnisse',
      languages: 'Sprachen',
      extras: 'Projekte, Zertifikate oder Auszeichnungen',
    },
    skillsShortTodo: (missing) =>
      `Ergänzen Sie ${missing} weitere Kenntnis${missing === 1 ? '' : 'se'} (fünf sind das Minimum, damit die Liste durchdacht wirkt)`,
    srDone: ' — erledigt',
    srMissing: ' — fehlt',
    fixInEditor: 'Im Editor ergänzen',
    notFoundTitle: 'Diesen Lebenslauf gibt es hier nicht',
    notFoundBody:
      'Er wurde möglicherweise gelöscht, oder der Link verweist auf einen Lebenslauf in einem anderen Konto.',
    openAria: (title) => `${title} öffnen`,
    publicBadge: 'Öffentlich',
    actionsAria: (title) => `Aktionen für ${title}`,
    downloadPdf: 'PDF herunterladen',
    preparingPdf: 'PDF wird vorbereitet…',
    renameAction: 'Umbenennen…',
    shareAction: 'Teilen…',
    sharingAction: 'Freigabe…',
    deleteAction: 'Löschen…',
    shareShort: 'Teilen',
    pdfReadyTitle: 'PDF bereit',
    pdfReadyBody: 'Der Download sollte automatisch starten.',
    pdfFailed: 'PDF konnte nicht erstellt werden',
    duplicatedBody: (title) => `„${title}“ steht in Ihrer Liste.`,
    duplicateFailed: 'Dieser Lebenslauf konnte nicht dupliziert werden',
    nameLabel: 'Name des Lebenslaufs',
    nameRequired: 'Geben Sie dem Lebenslauf einen Namen, damit Sie ihn wiederfinden.',
    nameTooLong: (max) => `Der Name darf höchstens ${max} Zeichen lang sein.`,
    renameTitle: 'Lebenslauf umbenennen',
    renameLede: 'Diesen Namen sehen nur Sie — auf dem Dokument steht er nicht.',
    renameSave: 'Namen speichern',
    renamedTitle: 'Umbenannt',
    renamedBody: (title) => `Heißt jetzt „${title}“.`,
    renameFailed: 'Dieser Lebenslauf konnte nicht umbenannt werden',
    deletedTitle: 'Lebenslauf gelöscht',
    deletedBody: (title) => `„${title}“ wurde entfernt.`,
    deleteFailed: 'Dieser Lebenslauf konnte nicht gelöscht werden',
    shareModalLede:
      'Beim Veröffentlichen entsteht eine schreibgeschützte Seite unter einer nicht erratbaren Adresse. Sie können sie jederzeit wieder abschalten.',
    shareProTitle: 'Öffentliche Links gibt es nur mit Pro',
    shareProBody:
      'Mit einem Upgrade veröffentlichen Sie Ihren Lebenslauf unter einem Link, den Sie in eine E-Mail oder eine Bewerbung setzen können.',
    sharePublicLabel: 'Wer den Link hat, kann diesen Lebenslauf ansehen',
    shareLiveHint: 'Die Seite ist jetzt online.',
    shareOffHint: 'Es wird nichts veröffentlicht, solange Sie das nicht einschalten.',
    shareUpdating: 'Link wird aktualisiert…',
    shareOnTitle: 'Freigabelink aktiv',
    shareOnBody: 'Wer den Link hat, kann diesen Lebenslauf jetzt ansehen.',
    shareOffTitle: 'Freigabelink deaktiviert',
    shareOffBody: 'Der Link funktioniert nicht mehr.',
    shareFailed: 'Freigabe konnte nicht geändert werden',
    copyFailedTitle: 'Kopieren nicht möglich',
    copyFailedBody: 'Markieren Sie den Link und kopieren Sie ihn von Hand.',
    limitTitle: (limit) => `Sie nutzen alle ${limit} Lebensläufe, die Ihr Tarif erlaubt`,
    limitBody:
      'Löschen Sie einen Lebenslauf, um Platz zu schaffen, oder wechseln Sie zu Pro für unbegrenzt viele Lebensläufe.',
    usedOfLimit: (used, limit) => `${used} von ${limit} Lebensläufen in Ihrem Tarif genutzt`,
    proRemovesLimit: 'Pro hebt die Grenze auf und schaltet alle Vorlagen frei.',
    stepStart: '1. Ausgangspunkt wählen',
    stepTemplate: '2. Vorlage wählen',
    stepTemplateHint:
      'Sie können sie später wechseln, ohne etwas von dem zu verlieren, was Sie geschrieben haben.',
    stepName: '3. Benennen und erstellen',
    nameHint: (untitled) => `Das sehen nur Sie. Leer lassen, um ihn „${untitled}“ zu nennen.`,
    namePlaceholder: 'z. B. Produktdesigner — Atlas Cloud',
    summaryTemplate: 'Vorlage:',
    summaryPaper: 'Papier:',
    summaryContent: 'Inhalt:',
    noneSelected: 'Keine ausgewählt',
    contentExample: 'Ausgearbeitetes Beispiel',
    contentEmpty: 'Leer',
    chooseTemplateHint:
      'Sehen Sie alle Designs durch, filtern Sie nach Stil und beginnen Sie mit dem, der Ihnen gefällt.',
  },
  templates: {
    allAvailable: (count) =>
      `Alle ${count} Designs sind in Ihrem Tarif enthalten. Ein Klick genügt, um damit einen Lebenslauf zu beginnen.`,
    freeSubset: (free, total) =>
      `${free} der ${total} Designs sind im kostenlosen Tarif enthalten. Der Rest ist mit Pro gekennzeichnet.`,
    filterAria: 'Vorlagen nach Kategorie filtern',
    allFilter: 'Alle',
    showing: (shown, total) => `${shown} von ${total} Vorlagen werden angezeigt`,
    categoryLabel: {
      modern: 'Modern',
      corporate: 'Business',
      creative: 'Kreativ',
      technology: 'IT',
      classic: 'Klassisch',
      ats: 'ATS-tauglich',
    },
    oneColumn: 'einspaltig',
    twoColumns: 'zweispaltig',
    details: 'Details',
    searchPlaceholder: 'Vorlagen durchsuchen — „ats“, „Führungskraft“, „Designer“…',
    searchAria: 'Vorlagen durchsuchen',
    planFilterAria: 'Nach Tarif filtern',
    blockedTitle: 'Das ist eine Pro-Vorlage',
    blockedBody:
      'Mit einem Upgrade erhalten Sie alle Designs — oder Sie machen mit einer kostenlosen Vorlage weiter: die kostenlose Auswahl enthält jedes ATS-taugliche Layout.',
    emptyTitle: 'Dazu passt keine Vorlage',
    emptyBody:
      'Versuchen Sie eine kürzere Suche, oder setzen Sie Kategorie- und Tariffilter zurück.',
    badgeFree: 'GRATIS',
    badgePro: 'PRO',
    useTemplate: 'Vorlage verwenden',
    unlockWithPro: 'Mit Pro freischalten',
    lockedAria: (name) => `${name} ist eine Pro-Vorlage — Tarife ansehen`,
  },
  account: {
    unfinishedHeading: 'Nicht abgeschlossene Zahlungen · es wurde nichts abgebucht',
    unfinishedBody: (count) =>
      `${count === 1 ? 'Dieser Bezahlvorgang wurde' : 'Diese Bezahlvorgänge wurden'} begonnen, aber nie abgeschlossen — die Bestellung wurde bei PayPal geöffnet und vor der Zahlung abgebrochen. Es wurde nichts von Ihrem Konto abgebucht und kein Tarif freigeschaltet. Wir behalten die Referenz, damit der Support das nachvollziehen kann, falls Sie anderer Meinung sind.`,
    lede: 'Mit welchem Konto Sie angemeldet sind, was Ihr Tarif erlaubt und was Sie bezahlt haben.',
    unverifiedTitle: 'Ihre E-Mail-Adresse ist nicht bestätigt',
    unverifiedBody:
      'Die Bestätigung schützt Ihr Konto und macht das Zurücksetzen des Passworts möglich.',
    verifyNow: 'Jetzt bestätigen',
    profileHint: 'Diese Angaben stammen aus dem Konto, mit dem Sie sich anmelden.',
    displayName: 'Anzeigename',
    notSet: 'Nicht angegeben',
    email: 'E-Mail-Adresse',
    verified: 'Bestätigt',
    unverified: 'Nicht bestätigt',
    memberSince: 'Mitglied seit',
    lastSignIn: 'Letzte Anmeldung',
    profileLockedLead: (siteName) =>
      `Vorerst nur lesbar. Ihr Anzeigename und Ihre E-Mail-Adresse stammen von Ihrem Anmeldedienst und werden bei jeder Anmeldung aktualisiert — ${siteName} hat noch keinen Endpunkt zum Bearbeiten des Profils, eine Änderung hier bliebe also nicht erhalten. Ändern Sie sie bei Ihrem Anbieter oder`,
    askSupport: 'bitten Sie den Support',
    profileLockedTail: ', es für Sie zu tun.',
    planHint: 'Was Ihr Konto derzeit kann.',
    statusLabel: 'Status',
    subscriptionStatus: {
      none: 'Kein Abonnement',
      active: 'Aktiv',
      expired: 'Abgelaufen',
      cancelled: 'Gekündigt',
      pending: 'Ausstehend',
    },
    expires: 'Läuft ab am',
    renews: 'Verlängert sich am',
    neverPermanent: 'Nie — dauerhafter Zugang',
    notApplicableFree: 'Im kostenlosen Tarif nicht zutreffend',
    cvsAndDownloads: 'Lebensläufe / Downloads',
    cvAllowance: (n) => (n === null ? 'Unbegrenzt' : `${n} Lebensläufe`),
    downloadAllowance: (n) => (n === null ? 'unbegrenzte Downloads' : `${n} Downloads pro Monat`),
    billingHeading: 'Zahlungsverlauf',
    billingHint: 'Zahlungen, die tatsächlich von diesem Konto abgebucht wurden.',
    noPaymentsTitle: 'Noch keine Zahlungen',
    noPaymentsPremium:
      'Ihr Zugang wurde ohne erfasste Zahlung gewährt. Wenden Sie sich an den Support, falls das nicht stimmt.',
    noPaymentsAbandoned:
      'Sie haben eine Bestellung begonnen, aber nie abgeschlossen — es wurde nichts abgebucht.',
    noPaymentsFree: 'Sie nutzen den kostenlosen Tarif, es gibt also nichts abzurechnen.',
    colDate: 'Datum',
    colPlan: 'Tarif',
    colAmount: 'Betrag',
    colStatus: 'Status',
    colOrder: 'Bestellung',
    paymentStatus: {
      created: 'Erstellt',
      approved: 'Genehmigt',
      completed: 'Abgeschlossen',
      failed: 'Fehlgeschlagen',
      cancelled: 'Storniert',
      refunded: 'Erstattet',
    },
    invoiceLead: 'Brauchen Sie eine Rechnung, eine Erstattung oder einen erneut zugesandten Beleg?',
    contactUs: 'Schreiben Sie uns',
    invoiceTail: ' — mit der Bestellnummer.',
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
    pageLede:
      'Umschaltbar ist hier nur, was tatsächlich etwas bewirkt. Bei allem anderen steht es dabei.',
    preferencesHint: 'Gilt für den nächsten Lebenslauf, den Sie in diesem Browser erstellen.',
    emailHeading: 'E-Mail-Einstellungen',
    emailHint: 'Was wir Ihnen senden dürfen.',
    readOnly: 'Nur lesbar',
    marketingEmail: 'Produkt- und Marketing-E-Mails',
    optedIn: 'Zugestimmt',
    optedOut: 'Nicht zugestimmt',
    accountEmail: 'Konto-E-Mails',
    accountEmailAlways: 'Werden immer gesendet — Belege, Bestätigungen und Sicherheitshinweise',
    emailLockedLead: (siteName) =>
      `${siteName} hat dafür noch keinen Endpunkt, deshalb gibt es hier keinen Schalter, der nur so täte, als würde er wirken. Jede Marketing-E-Mail enthält einen Abmeldelink mit nur einem Klick — oder`,
    askUs: 'bitten Sie uns',
    emailLockedTail: ', es zu ändern.',
    dataHeading: 'Ihre Daten',
    dataHint: 'Holen Sie sich jederzeit eine Kopie von allem, was Sie hier geschrieben haben.',
    exportNote:
      'Die Datei enthält jeden Lebenslauf vollständig — persönliche Angaben, Abschnitte und die Design-Einstellungen — als JSON. Sie wird in Ihrem Browser aus Ihrem eigenen Konto erzeugt; nichts wird gespeichert oder anderswohin gesendet.',
    dangerZone: 'Gefahrenzone',
    dangerZoneHint: 'Unumkehrbare Aktionen.',
    defaultsSaved: 'Voreinstellungen gespeichert',
    defaultsSaveFailedTitle: 'Auf diesem Gerät konnte nicht gespeichert werden',
    defaultsSaveFailedBody:
      'Ihr Browser blockiert den lokalen Speicher — im privaten Modus ist das üblich.',
    readingDefaults: 'Ihre gespeicherten Voreinstellungen werden gelesen…',
    paperSizeHint:
      'Wird beim Erstellen eines Lebenslaufs angewendet. Im Editor können Sie es je Lebenslauf weiterhin ändern.',
    paperA4Hint: '210 × 297 mm — Standard außerhalb Nordamerikas',
    paperLetterHint: '8,5 × 11 Zoll — Standard in den USA und Kanada',
    defaultTemplateHint: 'Beim Erstellen eines Lebenslaufs vorausgewählt.',
    defaultTemplateFreeHint:
      'Im kostenlosen Tarif kann nur eine kostenlose Vorlage die Standardvorlage sein.',
    useAppDefault: (templateName) => `App-Standard verwenden (${templateName})`,
    saveDefaults: 'Voreinstellungen speichern',
    savedLocallyNote: (siteName) =>
      `Nur in diesem Browser gespeichert — ${siteName} hat noch keinen Endpunkt, um Voreinstellungen zwischen Geräten abzugleichen.`,
    exportButton: 'Alle meine Lebensläufe als JSON herunterladen',
    exportListing: 'Ihre Lebensläufe werden aufgelistet…',
    exportProgress: (done, total) => `${done} von ${total} werden exportiert…`,
    exportNothingTitle: 'Nichts zu exportieren',
    exportNothingBody: 'Sie haben noch keinen Lebenslauf gespeichert.',
    exportPartialTitle: (done, total) => `${done} von ${total} exportiert`,
    exportPartialBody: (titles) =>
      `Nicht lesbar: ${titles}. Versuchen Sie es in einer Minute erneut.`,
    exportReadyTitle: 'Export bereit',
    exportReadyBody: (n) =>
      n === 1 ? '1 Lebenslauf als JSON gespeichert.' : `${n} Lebensläufe als JSON gespeichert.`,
    exportFailed: 'Ihre Lebensläufe konnten nicht exportiert werden',
    deleteAccountBody:
      'Entfernt Ihr Profil, jeden gespeicherten Lebenslauf und Ihren Zahlungsverlauf. Eine Selbstbedienungslöschung gibt es noch nicht — dieser Knopf öffnet eine vorausgefüllte Anfrage an unseren Support, die wir von Hand bearbeiten und per E-Mail bestätigen.',
    deleteAccountAction: 'Konto löschen…',
    deleteModalTitle: 'Ihr Konto löschen',
    deleteModalLede:
      'Das lässt sich nicht rückgängig machen. Geben Sie Ihre E-Mail-Adresse ein, um zu bestätigen, dass Sie es ernst meinen.',
    deleteContinue: 'Weiter zur Anfrage',
    deleteNothingTitle: 'Auf diesem Bildschirm wird nichts gelöscht',
    deleteNothingBody: (siteName) =>
      `${siteName} hat keinen Endpunkt für die automatische Löschung. Die Bestätigung hier bringt Sie zu einer vorausgefüllten Support-Anfrage; Ihre Daten werden entfernt, sobald unser Team sie bearbeitet hat.`,
    typeEmailToConfirm: (email) => `Geben Sie zur Bestätigung ${email} ein`,
    emailMismatch: 'Das stimmt nicht mit Ihrer E-Mail-Adresse überein.',
    deleteRequestSubject: 'Antrag auf Kontolöschung',
    deleteRequestBody: (siteName, email) =>
      `Bitte löschen Sie mein ${siteName}-Konto (${email}) und alles, was darunter gespeichert ist: meine gespeicherten Lebensläufe, meinen Zahlungsverlauf und mein Profil.`,
  },
  checkout: {
    noTransactionTitle: 'Diesem Link fehlt die Zahlungsreferenz',
    noTransactionBody:
      'Zahlungslinks laufen ab und lassen sich nur einmal öffnen. Beginnen Sie erneut auf der Preisseite, oder antworten Sie auf die erhaltene E-Mail — wir senden Ihnen dann einen neuen Link.',
    unconfiguredTitle: 'Kartenzahlung ist derzeit nicht verfügbar',
    unconfiguredBody:
      'Das liegt an uns und nicht an Ihrer Zahlung — es wurde nichts abgebucht. Bitte versuchen Sie es in Kürze erneut, oder kontaktieren Sie uns; wir senden Ihnen dann einen funktionierenden Link.',
    openFailedTitle: 'Das Zahlungsfenster konnte nicht geöffnet werden',
    openFailedBody:
      'Es wurde nichts abgebucht. Laden Sie die Seite neu, um es erneut zu versuchen — falls es weiterhin fehlschlägt, kontaktieren Sie uns und nennen Sie den verwendeten Link.',
    openingCheckout: 'Zahlungsfenster wird geöffnet…',
    completing: 'Zahlung eingegangen — wird bestätigt…',
    reopen: 'Zahlungsfenster erneut öffnen',
    methodHeading: 'Wie möchten Sie bezahlen?',
    methodPaddle: 'Karte oder Wallet',
    methodPaypal: 'PayPal',
    methodPaddleHint:
      'Karte, Apple Pay, Google Pay oder PayPal — in einem Fenster, das sich über dieser Seite öffnet. Paddle ist der Verkäufer, die Umsatzsteuer für Ihr Land wird also berechnet und vor dem Bezahlen angezeigt.',
    methodPaypalHint:
      'Sie bestätigen die Zahlung bei PayPal und kommen direkt hierher zurück. Ein PayPal-Konto ist nicht nötig — eine Bankkarte genügt.',
    payNow: (priceLabel) => `${priceLabel} bezahlen`,
    opening: 'Zahlungsfenster wird geöffnet…',
    confirming: 'Zahlung wird bestätigt…',
    paddleNote: (planName) =>
      `Das Zahlungsfenster gehört Paddle, nicht uns — wir sehen und speichern Ihre Kartendaten nicht. ${planName} wird erst freigeschaltet, wenn unser Server die Zahlung bei Paddle bestätigt hat.`,
    startFailedTitle: 'Der Bezahlvorgang konnte nicht starten',
    startFailedBody:
      'Wir konnten die Zahlung nicht starten. Es wurde nichts abgebucht — bitte versuchen Sie es gleich noch einmal.',
    serverError: (code) =>
      ({
        unauthenticated:
          'Ihre Sitzung ist abgelaufen. Melden Sie sich erneut an, dann wird die Zahlung fortgesetzt.',
        forbidden: 'Dieses Konto darf diesen Kauf nicht tätigen.',
        'email-unverified':
          'Bestätigen Sie zuerst Ihre E-Mail-Adresse — wir haben Ihnen einen Link geschickt. Es wurde nichts abgebucht.',
        'rate-limited':
          'Das wurde mehrfach hintereinander versucht. Warten Sie eine Minute und versuchen Sie es erneut — es wurde nichts abgebucht.',
        'invalid-plan': 'Dieser Tarif kann nicht gekauft werden.',
        'invalid-request': 'An dieser Anfrage war etwas ungültig. Es wurde nichts abgebucht.',
        'not-found': 'Wir konnten diese Zahlung nicht finden.',
        'unknown-order':
          'Zu diesem Konto liegt uns keine solche Zahlung vor. Falls doch Geld abgebucht wurde, ist es nicht verloren — melden Sie sich mit der unten stehenden Transaktionsnummer bei uns.',
        'payments-unavailable':
          'Kartenzahlung ist derzeit nicht verfügbar. Es wurde nichts abgebucht — bitte versuchen Sie es in Kürze erneut.',
        'not-configured':
          'Kartenzahlung ist derzeit nicht verfügbar. Es wurde nichts abgebucht — bitte versuchen Sie es in Kürze erneut.',
        'payment-provider-error':
          'Unser Zahlungsdienstleister hat nicht geantwortet. Es wurde nichts abgebucht — bitte versuchen Sie es gleich noch einmal.',
        'payment-not-completed':
          'Diese Zahlung ist noch nicht durchgegangen. Wenn Sie gerade bezahlt haben, geben Sie ihr ein paar Sekunden.',
        'amount-mismatch':
          'Der gezahlte Betrag passt nicht zu diesem Tarif, deshalb haben wir ihn nicht freigeschaltet. Es wurde nichts weiter abgebucht — melden Sie sich bei uns, wir klären das.',
        'server-error': 'Auf unserer Seite ist etwas schiefgelaufen. Es wurde nichts abgebucht.',
        'request-failed': 'Auf unserer Seite ist etwas schiefgelaufen. Es wurde nichts abgebucht.',
      })[code ?? ''] ?? null,
    scriptFailed:
      'Das Zahlungsfenster konnte nicht geladen werden. Prüfen Sie, ob ein Werbeblocker oder eine Datenschutz-Erweiterung Paddle blockiert, und versuchen Sie es erneut — es wurde nichts abgebucht.',
    offline:
      'Der Server ist nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut — es wurde nichts abgebucht.',
    confirmTitle: 'Ihre Zahlung wird bestätigt…',
    confirmBody:
      'Paddle hat die Zahlung eingezogen und wir prüfen sie dort, bevor etwas freigeschaltet wird. Sie können diesen Tab schließen, wenn Sie müssen — Ihr Tarif wird so oder so freigeschaltet.',
    stillConfirmingBody:
      'Paddle hat die Zahlung noch nicht bestätigt. Wir fragen weiter nach — das kann ein paar Sekunden dauern, bis Ihre Bank sie verbucht hat. Warten kostet Sie nichts.',
    confirmFailedTitle: 'Wir konnten diese Zahlung nicht bestätigen',
    nextSignIn:
      'Melden Sie sich mit dem Konto an, mit dem Sie bezahlt haben, und öffnen Sie diese Seite erneut. Ihre Zahlung ist sicher — der Tarif wird freigeschaltet, sobald wir sie Ihrem Konto zuordnen können.',
    nextSupport: (email) =>
      `Falls Geld von Ihrem Konto abgebucht wurde, schreiben Sie an ${email} und nennen Sie Ihre Paddle-Transaktionsnummer — wir bringen das in Ordnung oder erstatten den Betrag.`,
    nextWait:
      'Wenn Sie die Zahlung abgeschlossen haben, wird der Tarif innerhalb einer Minute von selbst freigeschaltet. Klicken Sie auf „Erneut versuchen“ oder öffnen Sie gleich Ihre Kontoseite — ein zweites Mal bezahlen müssen Sie nicht.',
    receiptNote:
      'Paddle hat Ihnen einen Beleg und eine Rechnung per E-Mail geschickt, die Sie als Ausgabe geltend machen können.',
    transactionRef: 'Transaktion',
    unavailableTitle: 'Zahlungen sind derzeit nicht möglich',
    unavailableBody: (email) =>
      `Auf dieser Installation ist kein Zahlungsanbieter eingerichtet — es gibt hier also nichts zu bezahlen und es wurde nichts abgebucht. Schreiben Sie an ${email}, dann richten wir Ihren Tarif von Hand ein.`,
    backToDomain: (domain) => `Zurück zu ${domain}`,
    footerPricing: 'Preise',
    footerRefund: 'Rückerstattung',
    footerTerms: 'Nutzungsbedingungen',
    footerPrivacy: 'Datenschutz',
    footerContact: 'Kontakt',
    interval: {
      forever: 'dauerhaft',
      month: 'pro Monat',
      year: 'pro Jahr',
      'one-time': 'Einmalzahlung',
    },
    stepReview: 'Schritt 1 von 3 · Prüfen',
    confirmPlanTitle: (planName) => `Bestätigen Sie Ihren ${planName}-Tarif`,
    orderSummary: 'Bestellübersicht',
    rowPlan: 'Tarif',
    rowBilling: 'Abrechnung',
    billingOneOff: 'Einmalige Zahlung, keine Verlängerung',
    billingRecurring: (days) => `Alle ${days} Tage, jederzeit kündbar`,
    totalToday: 'Heute fällig',
    ownsLifetimeTitle: (lifetimeName) => `Sie haben ${lifetimeName} bereits`,
    ownsLifetimeBody: (lifetimeName, planName) =>
      `Der ${lifetimeName}-Zugang läuft nie ab und enthält bereits alles aus ${planName} — hier gibt es für Sie also nichts zu bezahlen. Das sagen wir Ihnen lieber, als das Geld zu nehmen.`,
    viewAccount: 'Mein Konto ansehen',
    repeatTitle: (planName) => `Sie nutzen bereits ${planName}`,
    repeatBody: (days, from, siteName, lifetimeName, lifetimePrice) =>
      `Eine erneute Zahlung verlängert Ihren Zugang um weitere ${days} Tage ${from}. Wenn Sie ${siteName} voraussichtlich weiter nutzen, ist ${lifetimeName} für ${lifetimePrice} nach acht Monaten günstiger —`,
    extendsFromDate: (date) => `ab dem ${date}`,
    extendsFromToday: 'ab heute',
    repeatSwitch: (lifetimeName) => `wechseln Sie zu ${lifetimeName}`,
    termsIntro: 'Mit dem Fortfahren akzeptieren Sie unsere',
    termsLink: 'Nutzungsbedingungen',
    termsAnd: 'und unsere',
    refundLink: 'Rückerstattungsrichtlinie',
    cardDetailsNote:
      'Ihre Kartendaten sehen und speichern wir nie — das übernimmt vollständig der Zahlungsanbieter.',
    changedMind: 'Doch anders entschieden?',
    comparePlansAgain: 'Vergleichen Sie die Tarife noch einmal',
    orWriteTo: 'oder schreiben Sie an',
    continueToPaypal: (priceLabel) => `Weiter zu PayPal — ${priceLabel}`,
    redirectingToPaypal: 'Sie werden zu PayPal weitergeleitet…',
    paypalNote: (planName) =>
      `Sie bestätigen die Zahlung bei PayPal und kommen direkt hierher zurück. Zahlen können Sie mit PayPal-Guthaben, per Bankkonto oder mit Debit- oder Kreditkarte — ein PayPal-Konto ist nicht nötig. ${planName} wird erst freigeschaltet, wenn unser Server die Zahlung bei PayPal bestätigt hat.`,
    paypalStartFailed:
      'PayPal konnte diese Zahlung nicht starten. Bitte versuchen Sie es gleich noch einmal.',
    paypalNoApproveUrl: (email) =>
      `Die Bestellung wurde angelegt, aber PayPal hat keinen Zahlungslink zurückgegeben. Es wurde nichts abgebucht — bitte versuchen Sie es erneut oder schreiben Sie an ${email}, falls es weiterhin passiert.`,
    diagnosticCause: (issue) => `Ursache: ${issue}`,
    diagnosticReference: (reference) => `Referenz: ${reference}`,
    stepConfirmation: 'Schritt 3 von 3 · Bestätigung',
    confirmationTitle: 'Zahlungsbestätigung',
    confirmationLede:
      'Sie kommen gerade von PayPal zurück. Bevor etwas freigeschaltet wird, prüft unser Server die Bestellung direkt bei PayPal — was Sie unten sehen, ist also das tatsächliche Ergebnis und keine Meldung, die nur die Weiterleitung ausgelöst hat.',
    payerReference: 'PayPal-Zahlerreferenz',
    payerReferenceNote:
      'Bewahren Sie sie mit Ihrem Beleg auf — zusammen mit der Bestellnummer finden wir eine Zahlung damit sofort.',
    paypalConfirmBody:
      'Wir prüfen die Bestellung bei PayPal, bevor etwas freigeschaltet wird. Das dauert normalerweise ein paar Sekunden — bitte schließen Sie diesen Tab nicht.',
    paypalFailedBody: 'Wir konnten diese Zahlung nicht bei PayPal bestätigen.',
    paypalNextSupport: (email) =>
      `Falls Geld von Ihrem Konto abgebucht wurde, schreiben Sie an ${email} und nennen Sie Ihre PayPal-Transaktionsnummer — wir bringen das in Ordnung oder erstatten den Betrag.`,
    paypalNextUnknownOrder: (email) =>
      `Schicken Sie uns Ihre PayPal-Transaktionsnummer an ${email}, dann klären wir das noch am selben Tag.`,
    confirmOffline: 'Wir konnten unseren Server nicht erreichen, um die Zahlung zu bestätigen.',
    nextRetryConnection:
      'Prüfen Sie Ihre Verbindung und klicken Sie auf „Erneut versuchen“. Ihre Zahlung ist in jedem Fall sicher — es wird nichts doppelt freigeschaltet oder abgebucht.',
    missingReference: 'Diesem Bestätigungslink fehlt die Zahlungsreferenz.',
    missingReferenceNext:
      'Öffnen Sie den Beleg, den Ihnen Ihr Zahlungsanbieter per E-Mail geschickt hat, und folgen Sie dem Link darin — oder sehen Sie auf Ihrer Kontoseite nach: Eine abgeschlossene Zahlung schaltet den Tarif von selbst frei.',
    emailSupport: (email) => `E-Mail an ${email}`,
    quoteReference: 'Nennen Sie diese Referenz, wenn Sie uns kontaktieren:',
    backToPricing: 'Zurück zu den Preisen',
    planActive: (planName) => `Sie nutzen jetzt ${planName}`,
    planAlreadyActive: (planName) => `${planName} ist bereits aktiv`,
    alreadyConfirmedBody:
      'Diese Bestellung war bereits bestätigt — es wurde nichts doppelt abgebucht oder freigeschaltet. Alles Weitere steht Ihnen ab sofort in Ihrem Konto zur Verfügung.',
    paypalReceiptNote: 'PayPal hat Ihnen einen Beleg per E-Mail geschickt.',
    noRenewalNote: 'Dieser Tarif läuft nicht ab; es gibt nichts zu verlängern oder zu kündigen.',
    accessDaysNote: (days) =>
      `Diese Zahlung deckt ${days} Tage Zugang ab und verlängert sich nicht von selbst — automatisch abgebucht wird nie etwas.`,
    refundLead: 'Doch anders entschieden? Unsere',
    refundTail: 'gibt Ihnen 14 Tage Zeit.',
    orderRef: 'Bestellung',
    cancelledTitle: 'Bezahlvorgang abgebrochen',
    cancelledNothingCharged: 'Es wurde nichts abgebucht.',
    cancelledBody: (planName) =>
      `Sie haben PayPal verlassen, bevor Sie die Zahlung bestätigt haben — es kam also keine Bestellung zustande${
        planName ? ` und ${planName} wurde Ihrem Konto nicht hinzugefügt` : ''
      }. Ihr Konto ist genau so, wie es vor einer Minute war.`,
    cancelledCvsSafe:
      'Alle Lebensläufe, die Sie geschrieben haben, sind weiterhin da, weiterhin bearbeitbar und im Rahmen Ihres aktuellen Tarifs weiterhin herunterladbar.',
    cancelledNextHeading: 'Dort weitermachen, wo Sie aufgehört haben',
    cancelledStep1Lead: 'Öffnen Sie die',
    pricingPageLink: 'Preisseite',
    cancelledStep1Tail: (planName, currency) =>
      `und wählen Sie ${
        planName ? `erneut ${planName} oder den anderen Tarif` : 'einen Tarif'
      }. Die Preise sind in ${currency} angegeben und werden vollständig angezeigt, bevor Sie zu PayPal weitergeleitet werden.`,
    cancelledStep2:
      'Bestätigen Sie die Zahlung bei PayPal. Sie können mit PayPal-Guthaben, einem verknüpften Bankkonto oder einer Debit- oder Kreditkarte zahlen — ein PayPal-Konto ist nicht nötig.',
    cancelledStep3:
      'Sie landen wieder hier und der Tarif wird freigeschaltet, sobald unser Server die Bestellung bei PayPal bestätigt hat. Das dauert ein paar Sekunden.',
    cancelledHelpLead:
      'Abgebrochen, weil etwas nicht stimmig aussah oder weil PayPal nicht durchlief? Sagen Sie uns Bescheid unter',
    cancelledHelpOr: 'oder über das',
    contactFormLink: 'Kontaktformular',
    cancelledHelpTail:
      'Wir reparieren lieber einen kaputten Bezahlvorgang, als den Verkauf still zu verlieren.',
    cancelledMismatchLead:
      'Falls trotz dieser Seite Geld von Ihrem Konto abgebucht wurde, ist das eine Abweichung, von der wir sofort erfahren möchten — schreiben Sie uns mit Ihrer PayPal-Transaktionsnummer und wir schalten den Tarif noch am selben Tag frei oder erstatten den Betrag. Unsere',
    cancelledMismatchTail: 'gilt in beiden Fällen.',
  },
};

export const DASHBOARD_COPY: Record<Locale, DashboardCopy> = { en: EN, fr: FR, de: DE };
