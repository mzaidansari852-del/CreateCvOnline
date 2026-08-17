import type { Locale } from '../locales';
import type { BuiltInSectionId } from '@/types/cv';

/**
 * Editor strings, in all three languages.
 *
 * Split out of the single `app-copy.ts` so that the areas of the product can be worked on
 * independently. `appCopy(locale)` still composes them into one object, so nothing that
 * reads a string has to know which file it came from.
 *
 * The rule for the translations is unchanged: write what a native speaker would write on
 * that screen, not what the English says, and where a convention differs rather than a
 * word, follow the convention.
 *
 * ## What is *not* in here
 *
 * The editor wraps a document that has a language of its own (`cv.language`). Section
 * headings, month names and the skill and language level names printed on the page all
 * follow the document, not the interface, and live in `lib/cv/format.ts` and
 * `lib/i18n/cv-labels.ts`. Anything a reader of the finished PDF sees belongs there; only
 * the chrome the applicant works in belongs here.
 */

/** Copy for one repeatable list: the add button, the empty state and the delete prompt. */
interface ListCopy {
  add: string;
  emptyTitle: string;
  emptyBody: string;
  /** Title of the delete confirmation. Written out per list so the grammar is natural. */
  deleteTitle: string;
  /** Stands in for the entry's own name before one has been typed. */
  untitled: string;
}

export interface EditorCopy {
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

    /* ---------------------------------------------------------------- workspace */
    personalDetails: string;
    /** Narrow-screen tab strip. */
    editorView: string;
    sectionField: string;
    /** Appended to a section's name in the mobile picker when it is switched off. */
    hiddenSuffix: string;
    stepOf: (step: number, total: number) => string;
    hiddenFromCv: string;
    previousSection: string;
    nextSection: string;
    reorderAndHide: string;
    completeness: string;
    downloadPdfShort: string;

    /* ------------------------------------------------------------------ toolbar */
    renameCvTooltip: string;
    renameCvTitle: string;
    renameCvBody: string;
    cvName: string;
    undo: string;
    redo: string;
    moreActions: string;
    printAction: string;
    createShareLink: string;
    turnOffSharing: string;
    previewPage: string;
    deleteCvAction: string;
    deleteCvTitle: string;
    deleteCvBody: (title: string) => string;
    deleteCvConfirm: string;
    publicNotice: string;
    copyLink: string;
    linkCopied: string;
    notSaved: string;
    /**
     * Shown *visibly* when a save fails, next to the server's own reason.
     *
     * The reason used to live in the badge's `title` attribute — a hover tooltip, which is
     * nothing at all on a phone and almost nothing on a desktop. A user filled in an entire
     * CV against a failing autosave, saw only "Not saved — retry", and had no way to learn
     * that the server had named the problem on every single attempt.
     */
    saveFailedHeading: string;
    /** The reassurance that matters most at that moment: the work is not gone. */
    saveFailedKept: string;
    draftFoundHeading: string;
    draftFoundBody: string;
    draftRestore: string;
    draftDiscard: string;
    /** Which fields the server rejected — the list under a failed save. */
    invalidFieldsHeading: string;
    /** `(section, n) => 'Experience — entry 2'` */
    issueEntry: (sectionLabel: string, index: number) => string;
    issueDateFormat: string;
    issueTooLong: string;
    unsaved: string;
    /** Autosave could not reach the server at all — distinct from the server refusing. */
    offline: string;

    /* ------------------------------------------------- shared list interactions */
    reorderHandle: (name: string) => string;
    deleteNamed: (name: string) => string;

    toast: {
      couldNotSave: string;
      pdfReady: string;
      pdfReadyBody: string;
      pdfFailed: string;
      duplicated: string;
      duplicatedBody: string;
      duplicateFailed: string;
      shareOn: string;
      shareOnBody: string;
      shareOff: string;
      shareOffBody: string;
      shareFailed: string;
      deleted: string;
      deleteFailed: string;
    };

    /** The upgrade toast, and the one-line reason each locked control gives it. */
    pro: {
      title: string;
      body: (reason: string) => string;
      seePlans: string;
      share: string;
      customSections: string;
      lockedTemplate: (name: string) => string;
      headingColour: string;
      bodyColour: string;
      font: string;
      textSize: string;
      lineHeight: string;
      headingStyle: string;
      spacing: string;
      margins: string;
      skillDisplay: string;
    };

    design: {
      colourGroup: string;
      typographyGroup: string;
      spacingGroup: string;
      contentGroup: string;
      headingColour: string;
      bodyColour: string;
      caseUpper: string;
      caseTitle: string;
      caseAsTyped: string;
      paperHint: string;
      showPhoto: string;
      showPhotoHint: string;
      photoShape: string;
      photoCircle: string;
      photoRounded: string;
      photoSquare: string;
      showIcons: string;
      showIconsHint: string;
      skillDisplay: string;
      skillBars: string;
      skillDots: string;
      skillTags: string;
      skillText: string;
      skillHint: string;
      searchTemplates: string;
      shown: (n: number) => string;
      noMatch: (query: string) => string;
      columns: (n: number) => string;
      ats: (score: number) => string;
      categories: {
        all: string;
        modern: string;
        corporate: string;
        creative: string;
        technology: string;
        classic: string;
        ats: string;
      };
    };

    preview: {
      pages: (n: number) => string;
      pageMarker: (page: number) => string;
      zoomIn: string;
      zoomOut: string;
      fitToWidth: string;
    };

    list: {
      maxEntries: (max: number) => string;
      deleteBody: (name: string) => string;
      itemNumber: (label: string, index: number) => string;
      removeItemNumber: (label: string, index: number) => string;
    };

    sections: {
      addCustom: string;
      customHint: string;
      defaultCustomTitle: string;
      renameTitle: string;
      renameBody: string;
      heading: string;
      newTitle: string;
      newBody: string;
      newPlaceholder: string;
      sectionHeading: string;
      addConfirm: string;
      deleteTitle: string;
      deleteBody: (label: string) => string;
      deleteConfirm: string;
      moveUp: (label: string) => string;
      moveDown: (label: string) => string;
      hide: (label: string) => string;
      show: (label: string) => string;
      hideTitle: string;
      showTitle: string;
    };

    /**
     * Helper text for each built-in section, shown in the section list and the "add
     * section" sheet. This is the only source of it — `SECTION_META` used to carry an
     * English `hint`, which was deleted once every section had a translation here.
     */
    sectionHints: Record<BuiltInSectionId, string>;

    photo: {
      title: string;
      body: string;
      upload: string;
      replace: string;
      dropHint: string;
      formats: string;
      signInFirst: string;
      unavailable: string;
      failed: string;
    };

    forms: {
      personal: {
        firstName: string;
        lastName: string;
        title: string;
        titlePlaceholder: string;
        titleHint: string;
        email: string;
        emailPlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        location: string;
        locationPlaceholder: string;
        locationHint: string;
        website: string;
        websitePlaceholder: string;
        linkedin: string;
        linkedinPlaceholder: string;
        github: string;
        githubPlaceholder: string;
        photoUrl: string;
        photoUrlHint: string;
        linkFallback: string;
        linkLabel: string;
        linkLabelPlaceholder: string;
        linkUrl: string;
        linkUrlPlaceholder: string;
        links: ListCopy;
      };
      summary: {
        label: string;
        placeholder: string;
        hint: string;
        wordCount: (n: number) => string;
        tooShort: string;
        tooLong: string;
      };
      competencies: {
        list: ListCopy;
        evidenceCount: (n: number) => string;
        name: string;
        namePlaceholder: string;
        framing: string;
        framingPlaceholder: string;
        evidence: string;
        evidencePlaceholder: string;
        addEvidence: string;
      };
      experience: {
        list: ListCopy;
        role: string;
        rolePlaceholder: string;
        company: string;
        companyPlaceholder: string;
        location: string;
        locationPlaceholder: string;
        startDate: string;
        endDate: string;
        presentHint: string;
        current: string;
        description: string;
        descriptionPlaceholder: string;
        descriptionHint: string;
        achievements: string;
        achievementPlaceholder: string;
        addAchievement: string;
        tags: string;
        tagsHint: string;
        tagsPlaceholder: string;
      };
      education: {
        list: ListCopy;
        degree: string;
        degreePlaceholder: string;
        field: string;
        fieldPlaceholder: string;
        institution: string;
        institutionPlaceholder: string;
        location: string;
        locationPlaceholder: string;
        startDate: string;
        endDate: string;
        grade: string;
        gradePlaceholder: string;
        current: string;
        notes: string;
        notesPlaceholder: string;
        notesHint: string;
      };
      skills: {
        list: ListCopy;
        name: string;
        namePlaceholder: string;
        category: string;
        categoryPlaceholder: string;
        categoryHint: string;
        level: string;
      };
      languages: {
        list: ListCopy;
        name: string;
        namePlaceholder: string;
        level: string;
        levelHint: string;
      };
      projects: {
        list: ListCopy;
        name: string;
        namePlaceholder: string;
        role: string;
        rolePlaceholder: string;
        start: string;
        end: string;
        link: string;
        linkPlaceholder: string;
        description: string;
        descriptionPlaceholder: string;
        highlights: string;
        highlightPlaceholder: string;
        addHighlight: string;
        tags: string;
      };
      certifications: {
        list: ListCopy;
        name: string;
        namePlaceholder: string;
        issuer: string;
        issuerPlaceholder: string;
        issued: string;
        expires: string;
        credentialId: string;
        verification: string;
      };
      awards: {
        list: ListCopy;
        title: string;
        issuer: string;
        date: string;
        description: string;
      };
      volunteer: {
        list: ListCopy;
        role: string;
        organisation: string;
        location: string;
        start: string;
        end: string;
        current: string;
        description: string;
      };
      publications: {
        list: ListCopy;
        title: string;
        publisher: string;
        date: string;
        link: string;
        authors: string;
        authorsPlaceholder: string;
        abstract: string;
      };
      interests: {
        list: ListCopy;
        name: string;
        detail: string;
        detailHint: string;
      };
      references: {
        list: ListCopy;
        name: string;
        relationship: string;
        relationshipPlaceholder: string;
        role: string;
        company: string;
        email: string;
        phone: string;
      };
      custom: {
        list: ListCopy;
        heading: string;
        entryHeading: string;
        entrySubheading: string;
        entryDate: string;
        entryDatePlaceholder: string;
        description: string;
      };
      letter: {
        enable: string;
        enableHint: string;
        recipient: string;
        recipientPlaceholder: string;
        recipientHint: string;
        recipientRole: string;
        recipientRolePlaceholder: string;
        company: string;
        companyPlaceholder: string;
        vacancy: string;
        vacancyPlaceholder: string;
        reference: string;
        referencePlaceholder: string;
        date: string;
        datePlaceholder: string;
        dateHint: string;
        address: string;
        addressPlaceholder: string;
        body: string;
        bodyPlaceholder: string;
        bodyHint: string;
        signOff: string;
        signOffPlaceholder: string;
        signOffHint: string;
        signature: string;
        signaturePlaceholder: string;
      };
    };
  };
}

const EN: EditorCopy = {
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
    sectionSpacing: 'Space between sections',
    paperSize: 'Paper size',
    dateFormat: 'Date format',
    headingStyle: 'Section heading style',
    resetDesign: 'Reset to template defaults',
    zoom: 'Zoom',
    pageOf: (page, total) => `Page ${page} of ${total}`,
    downloadPdf: 'Download PDF',
    preparingPdf: 'Preparing your PDF…',
    autoSaved: (when) => `Saved ${when}`,

    personalDetails: 'Personal details',
    editorView: 'Editor view',
    sectionField: 'Section',
    hiddenSuffix: ' (hidden)',
    stepOf: (step, total) => `Step ${step} of ${total}`,
    hiddenFromCv: 'Hidden from CV',
    previousSection: 'Previous',
    nextSection: 'Next section',
    reorderAndHide: 'Reorder and hide sections',
    completeness: 'Completeness',
    downloadPdfShort: 'PDF',

    renameCvTooltip: 'Rename this CV',
    renameCvTitle: 'Rename CV',
    renameCvBody:
      'Only you see this — it is how the CV is listed in your dashboard, not a heading on the document.',
    cvName: 'Name',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Shift+Z)',
    moreActions: 'More actions',
    printAction: 'Print…',
    createShareLink: 'Create share link',
    turnOffSharing: 'Turn off sharing',
    previewPage: 'Preview page',
    deleteCvAction: 'Delete CV',
    deleteCvTitle: 'Delete this CV?',
    deleteCvBody: (title) => `“${title}” will be permanently deleted. This cannot be undone.`,
    deleteCvConfirm: 'Delete permanently',
    publicNotice: 'This CV is public:',
    copyLink: 'Copy',
    linkCopied: 'Link copied',
    notSaved: 'Not saved — retry',
    saveFailedHeading: 'This CV has not been saved',
    saveFailedKept:
      'Your work is kept in this browser, so it is safe to keep editing — but do not close this tab until it saves.',
    draftFoundHeading: 'Unsaved work recovered',
    draftFoundBody:
      'A previous save failed and this browser kept a copy. It is newer than the version on our server.',
    draftRestore: 'Restore my work',
    draftDiscard: 'Discard it',
    invalidFieldsHeading: 'These fields need fixing before this CV can save:',
    issueEntry: (sectionLabel, index) => `${sectionLabel} — entry ${index}`,
    issueDateFormat: 'Use a year (2024) or a year and month (2024-06).',
    issueTooLong: 'This is longer than the maximum allowed. Shorten it.',
    unsaved: 'Unsaved',
    offline: 'Could not reach the server. Your changes are still here.',

    reorderHandle: (name) => `Reorder ${name}. Press space, then use the arrow keys.`,
    deleteNamed: (name) => `Delete ${name}`,

    toast: {
      couldNotSave: 'Could not save',
      pdfReady: 'PDF downloaded',
      pdfReadyBody: 'Check your downloads folder.',
      pdfFailed: 'Could not create the PDF',
      duplicated: 'CV duplicated',
      duplicatedBody: 'Opening the copy.',
      duplicateFailed: 'Could not duplicate this CV',
      shareOn: 'Share link created',
      shareOnBody: 'Copied to your clipboard.',
      shareOff: 'Sharing turned off',
      shareOffBody: 'The old link no longer works.',
      shareFailed: 'Could not change sharing',
      deleted: 'CV deleted',
      deleteFailed: 'Could not delete this CV',
    },

    pro: {
      title: 'That is a Pro feature',
      body: (reason) =>
        `${reason} Upgrade to unlock every template and the full set of design controls.`,
      seePlans: 'See Pro plans',
      share: 'Public share links are Pro.',
      customSections: 'Custom sections are Pro.',
      lockedTemplate: (name) => `“${name}” is a Pro template.`,
      headingColour: 'Heading colour is a Pro control.',
      bodyColour: 'Body text colour is a Pro control.',
      font: 'Font choice is a Pro control.',
      textSize: 'Text sizing is a Pro control.',
      lineHeight: 'Line height is a Pro control.',
      headingStyle: 'Heading style is a Pro control.',
      spacing: 'Spacing is a Pro control.',
      margins: 'Margins are a Pro control.',
      skillDisplay: 'Skill display is a Pro control.',
    },

    design: {
      colourGroup: 'Colour',
      typographyGroup: 'Typography',
      spacingGroup: 'Spacing and page',
      contentGroup: 'Content display',
      headingColour: 'Heading colour',
      bodyColour: 'Body text',
      caseUpper: 'CAPS',
      caseTitle: 'Title',
      caseAsTyped: 'As typed',
      paperHint: 'A4 for the UK, Europe and most of the world. Letter for the US and Canada.',
      showPhoto: 'Show profile photo',
      showPhotoHint: 'Only affects templates that support one.',
      photoShape: 'Photo shape',
      photoCircle: 'Circle',
      photoRounded: 'Rounded',
      photoSquare: 'Square',
      showIcons: 'Show contact icons',
      showIconsHint: 'Turn off for the strictest ATS compatibility.',
      skillDisplay: 'Skills display',
      skillBars: 'Bars',
      skillDots: 'Dots',
      skillTags: 'Tags',
      skillText: 'Text',
      skillHint:
        'Plain text parses most reliably. Bars and dots are a visual claim a recruiter cannot verify — use them sparingly.',
      searchTemplates: 'Search templates',
      shown: (n) => `${n} shown`,
      noMatch: (query) => `No template matches “${query}”.`,
      columns: (n) => (n === 1 ? '1 col' : '2 col'),
      ats: (score) => `ATS ${score}/5`,
      categories: {
        all: 'All',
        modern: 'Modern',
        corporate: 'Corporate',
        creative: 'Creative',
        technology: 'Tech',
        classic: 'Classic',
        ats: 'ATS',
      },
    },

    preview: {
      pages: (n) => (n === 1 ? '1 page' : `${n} pages`),
      pageMarker: (page) => `Page ${page}`,
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      fitToWidth: 'Fit to width',
    },

    list: {
      maxEntries: (max) => `That is the maximum of ${max} entries for this section.`,
      deleteBody: (name) =>
        `“${name}” will be removed from your CV. You can undo this with Ctrl+Z.`,
      itemNumber: (label, index) => `${label} ${index}`,
      removeItemNumber: (label, index) => `Remove ${label} ${index}`,
    },

    sections: {
      addCustom: 'Add a custom section',
      customHint: 'Custom section',
      defaultCustomTitle: 'Custom section',
      renameTitle: 'Rename section',
      renameBody: 'This is the heading printed on your CV.',
      heading: 'Heading',
      newTitle: 'New custom section',
      newBody:
        'For anything the twelve built-in sections do not cover — patents, memberships, speaking, military service.',
      newPlaceholder: 'Conference talks',
      sectionHeading: 'Section heading',
      addConfirm: 'Add section',
      deleteTitle: 'Delete this section?',
      deleteBody: (label) =>
        `“${label}” and everything in it will be removed. You can undo this with Ctrl+Z.`,
      deleteConfirm: 'Delete section',
      moveUp: (label) => `Move ${label} up`,
      moveDown: (label) => `Move ${label} down`,
      hide: (label) => `Hide ${label}`,
      show: (label) => `Show ${label}`,
      hideTitle: 'Hide from CV',
      showTitle: 'Show on CV',
    },

    sectionHints: {
      summary: 'Three or four lines that frame who you are and the value you bring.',
      competencies:
        'Three to six areas of expertise, each with the achievements that prove it. This is what makes a functional CV functional — lead with it and the work history can stay short.',
      experience: 'Roles, companies, dates and the results you delivered.',
      education: 'Degrees, institutions and relevant coursework.',
      skills: 'Hard and soft skills, optionally grouped into categories.',
      languages: 'Languages you speak and your proficiency in each.',
      projects: 'Side projects, open-source work or client deliverables.',
      certifications: 'Professional certifications, licences and credentials.',
      awards: 'Recognition, prizes and honours.',
      volunteer: 'Unpaid work that demonstrates initiative and values.',
      publications: 'Papers, articles, books and conference talks.',
      interests: 'A short, human line at the end of the document.',
      references: 'Referees, or a single "available on request" line.',
    },

    photo: {
      title: 'Profile photo',
      body: 'Expected in much of continental Europe, North Africa and the Middle East; usually left off in the UK, Ireland and the US. Templates without a photo slot simply ignore it.',
      upload: 'Upload photo',
      replace: 'Replace photo',
      dropHint: 'or drop an image here',
      formats:
        'JPEG, PNG, WebP or AVIF, up to 8 MB. It is cropped to a square and resized to 600px in your browser before uploading, so a large phone photo will not slow your PDF down.',
      signInFirst: 'Sign in to upload a photo.',
      unavailable:
        'Photo upload is unavailable because storage is not configured on this deployment. You can still paste a link below.',
      failed: 'The upload did not complete. Check your connection and try again.',
    },

    forms: {
      personal: {
        firstName: 'First name',
        lastName: 'Last name',
        title: 'Professional title',
        titlePlaceholder: 'Senior Product Designer',
        titleHint: 'The role you are applying for, not necessarily your current job title.',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        phone: 'Phone',
        phonePlaceholder: '+212 6 12 34 56 78',
        location: 'Location',
        locationPlaceholder: 'Casablanca, Morocco',
        locationHint:
          'City and country is enough. A full street address is unnecessary and best left off.',
        website: 'Website',
        websitePlaceholder: 'yoursite.com',
        linkedin: 'LinkedIn',
        linkedinPlaceholder: 'linkedin.com/in/you',
        github: 'GitHub',
        githubPlaceholder: 'github.com/you',
        photoUrl: '…or paste a photo URL',
        photoUrlHint:
          'Only needed if the image is already hosted somewhere public. Uploading above is easier and produces a smaller PDF.',
        linkFallback: 'Link',
        linkLabel: 'Label',
        linkLabelPlaceholder: 'Portfolio',
        linkUrl: 'URL',
        linkUrlPlaceholder: 'yourportfolio.com',
        links: {
          add: 'Add another link',
          emptyTitle: 'No extra links',
          emptyBody:
            'Add a portfolio, Dribbble, Behance, ORCID or anything else worth putting on the page.',
          deleteTitle: 'Delete this link?',
          untitled: 'Untitled link',
        },
      },
      summary: {
        label: 'Professional summary',
        placeholder:
          'Three or four sentences: who you are, the value you bring, and one result that proves it.',
        hint: 'Aim for 50–90 words. Lead with your discipline and years of experience, then the single achievement you would want read first.',
        wordCount: (n) => (n === 1 ? '1 word' : `${n} words`),
        tooShort: ' — a little short; add a concrete result.',
        tooLong: ' — long enough that a recruiter will skim past it. Try trimming.',
      },
      competencies: {
        list: {
          add: 'Add a competency',
          emptyTitle: 'No competencies added',
          emptyBody:
            'Three to six areas of expertise, each with the achievements that prove it. This is what a functional or hybrid CV leads with — and what lets the employment history below it stay short.',
          deleteTitle: 'Delete this competency?',
          untitled: 'Untitled competency',
        },
        evidenceCount: (n) => (n === 1 ? '1 point of evidence' : `${n} points of evidence`),
        name: 'Area of expertise',
        namePlaceholder: 'Programme delivery',
        framing: 'Framing',
        framingPlaceholder:
          'One or two lines saying what you mean by it. Optional — the evidence often carries it alone.',
        evidence: 'Evidence',
        evidencePlaceholder:
          'Coordinated a 340-pupil curriculum change across four departments to a fixed exam-board deadline.',
        addEvidence: 'Add evidence',
      },
      experience: {
        list: {
          add: 'Add a role',
          emptyTitle: 'No work experience yet',
          emptyBody:
            'Add your most recent role first. Internships, freelance work and significant volunteering all count.',
          deleteTitle: 'Delete this role?',
          untitled: 'Untitled role',
        },
        role: 'Job title',
        rolePlaceholder: 'Senior Product Designer',
        company: 'Company',
        companyPlaceholder: 'Atlas Cloud',
        location: 'Location',
        locationPlaceholder: 'Casablanca, MA',
        startDate: 'Start date',
        endDate: 'End date',
        presentHint: 'Shown as “Present”.',
        current: 'I currently work here',
        description: 'What the role involved',
        descriptionPlaceholder:
          'One or two lines of context: the scope of the role, team size, who you served.',
        descriptionHint: 'Context, not achievements — those go below.',
        achievements: 'Achievements',
        achievementPlaceholder:
          'Rebuilt onboarding, lifting activation from 34% to 58% in two quarters.',
        addAchievement: 'Add an achievement',
        tags: 'Tags',
        tagsHint:
          'Optional keywords shown as small chips by some templates. ATS templates hide them.',
        tagsPlaceholder: 'Design systems, Onboarding, B2B SaaS',
      },
      education: {
        list: {
          add: 'Add a qualification',
          emptyTitle: 'No education added',
          emptyBody:
            'List your highest qualification first. Early in a career this section belongs near the top of the CV.',
          deleteTitle: 'Delete this qualification?',
          untitled: 'Untitled qualification',
        },
        degree: 'Degree',
        degreePlaceholder: 'BSc',
        field: 'Field of study',
        fieldPlaceholder: 'Computer Science',
        institution: 'Institution',
        institutionPlaceholder: 'Université Mohammed V',
        location: 'Location',
        locationPlaceholder: 'Rabat, Morocco',
        startDate: 'Start date',
        endDate: 'End date',
        grade: 'Grade',
        gradePlaceholder: 'First class / 3.7 GPA',
        current: 'I am still studying here',
        notes: 'Notes',
        notesPlaceholder: 'Thesis title, relevant modules, or a prize.',
        notesHint: 'Worth filling in for a recent graduate; safe to leave empty later on.',
      },
      skills: {
        list: {
          add: 'Add a skill',
          emptyTitle: 'No skills listed',
          emptyBody:
            'Five to fifteen is the useful range. Group them into categories and the templates will lay them out for you.',
          deleteTitle: 'Delete this skill?',
          untitled: 'Untitled skill',
        },
        name: 'Skill',
        namePlaceholder: 'Figma',
        category: 'Category',
        categoryPlaceholder: 'Tools',
        categoryHint: 'Optional grouping.',
        level: 'Level',
      },
      languages: {
        list: {
          add: 'Add a language',
          emptyTitle: 'No languages listed',
          emptyBody:
            'Worth adding for any international application, and expected on a European CV.',
          deleteTitle: 'Delete this language?',
          untitled: 'Untitled language',
        },
        name: 'Language',
        namePlaceholder: 'French',
        level: 'Proficiency',
        levelHint: 'Mapped to the CEFR scale by templates that show one.',
      },
      projects: {
        list: {
          add: 'Add a project',
          emptyTitle: 'No projects added',
          emptyBody:
            'Side projects, open-source work and notable client deliverables. Especially valuable if your job titles undersell what you can do.',
          deleteTitle: 'Delete this project?',
          untitled: 'Untitled project',
        },
        name: 'Project name',
        namePlaceholder: 'Souk Kit',
        role: 'Your role',
        rolePlaceholder: 'Creator',
        start: 'Start',
        end: 'End',
        link: 'Link',
        linkPlaceholder: 'github.com/you/project',
        description: 'Description',
        descriptionPlaceholder: 'What it is, who it is for, and what you built.',
        highlights: 'Highlights',
        highlightPlaceholder: '4.1k GitHub stars and 60+ contributors.',
        addHighlight: 'Add a highlight',
        tags: 'Tags',
      },
      certifications: {
        list: {
          add: 'Add a certification',
          emptyTitle: 'No certifications',
          emptyBody:
            'Licences, professional certifications and credentials that a recruiter can verify.',
          deleteTitle: 'Delete this certification?',
          untitled: 'Untitled certification',
        },
        name: 'Name',
        namePlaceholder: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Issuer',
        issuerPlaceholder: 'Amazon Web Services',
        issued: 'Issued',
        expires: 'Expires',
        credentialId: 'Credential ID',
        verification: 'Verification link',
      },
      awards: {
        list: {
          add: 'Add an award',
          emptyTitle: 'No awards',
          emptyBody: 'Recognition, prizes and honours — internal awards count too.',
          deleteTitle: 'Delete this award?',
          untitled: 'Untitled award',
        },
        title: 'Title',
        issuer: 'Awarded by',
        date: 'Date',
        description: 'Description',
      },
      volunteer: {
        list: {
          add: 'Add volunteering',
          emptyTitle: 'No volunteer experience',
          emptyBody: 'Unpaid work that shows initiative, values or skills your paid roles do not.',
          deleteTitle: 'Delete this entry?',
          untitled: 'Untitled entry',
        },
        role: 'Role',
        organisation: 'Organisation',
        location: 'Location',
        start: 'Start',
        end: 'End',
        current: 'I still volunteer here',
        description: 'Description',
      },
      publications: {
        list: {
          add: 'Add a publication',
          emptyTitle: 'No publications',
          emptyBody: 'Papers, articles, books and conference talks. Essential on an academic CV.',
          deleteTitle: 'Delete this publication?',
          untitled: 'Untitled publication',
        },
        title: 'Title',
        publisher: 'Publisher',
        date: 'Date',
        link: 'Link',
        authors: 'Authors',
        authorsPlaceholder: 'El Fassi, A., Benali, Y.',
        abstract: 'Abstract',
      },
      interests: {
        list: {
          add: 'Add an interest',
          emptyTitle: 'No interests',
          emptyBody:
            'A short, specific line humanises a CV. “Long-distance running” beats “sport”.',
          deleteTitle: 'Delete this interest?',
          untitled: 'Untitled interest',
        },
        name: 'Interest',
        detail: 'Detail',
        detailHint: 'Optional. Only some templates show it.',
      },
      references: {
        list: {
          add: 'Add a referee',
          emptyTitle: 'No references listed',
          emptyBody:
            'Most employers ask for these later. Only list someone who has agreed to it — and never publish their details on a shared link.',
          deleteTitle: 'Delete this referee?',
          untitled: 'Unnamed referee',
        },
        name: 'Name',
        relationship: 'Relationship',
        relationshipPlaceholder: 'Direct manager',
        role: 'Role',
        company: 'Company',
        email: 'Email',
        phone: 'Phone',
      },
      custom: {
        list: {
          add: 'Add an entry',
          emptyTitle: 'Nothing in this section yet',
          emptyBody:
            'Each entry has a heading, a subheading, a date and a description — enough for almost anything a standard section does not cover.',
          deleteTitle: 'Delete this entry?',
          untitled: 'Untitled entry',
        },
        heading: 'Section heading',
        entryHeading: 'Heading',
        entrySubheading: 'Subheading',
        entryDate: 'Date',
        entryDatePlaceholder: '2024',
        description: 'Description',
      },
      letter: {
        enable: 'Include a cover letter',
        enableHint:
          'Exported as the first page of the same PDF, styled to match this CV. Turning it off keeps the draft.',
        recipient: 'Recipient',
        recipientPlaceholder: 'Ms Okafor',
        recipientHint: 'Leave blank for “Dear Hiring Manager”.',
        recipientRole: 'Their role',
        recipientRolePlaceholder: 'Head of Talent',
        company: 'Company',
        companyPlaceholder: 'Atlas Cloud',
        vacancy: 'Vacancy',
        vacancyPlaceholder: 'Senior Product Designer',
        reference: 'Reference',
        referencePlaceholder: 'REQ-2841',
        date: 'Date',
        datePlaceholder: '2026-08-15',
        dateHint: 'Leave blank to date it on the day you export.',
        address: 'Company address',
        addressPlaceholder: '18 Rue Lafayette\n75009 Paris',
        body: 'Letter',
        bodyPlaceholder:
          'Three or four short paragraphs: why this role, what you bring to it, and one piece of evidence they will not find on the CV.',
        bodyHint: 'A blank line starts a new paragraph.',
        signOff: 'Sign-off',
        signOffPlaceholder: 'Yours sincerely,',
        signOffHint:
          'Left blank, this follows the convention: “sincerely” to a named person, “faithfully” otherwise.',
        signature: 'Signature',
        signaturePlaceholder: 'Your name',
      },
    },
  },
};

const FR: EditorCopy = {
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
    headingStyle: 'Style des titres de rubrique',
    resetDesign: 'Rétablir les réglages du modèle',
    zoom: 'Zoom',
    pageOf: (page, total) => `Page ${page} sur ${total}`,
    downloadPdf: 'Télécharger le PDF',
    preparingPdf: 'Préparation de votre PDF…',
    autoSaved: (when) => `Enregistré ${when}`,

    personalDetails: 'Informations personnelles',
    editorView: 'Affichage de l’éditeur',
    sectionField: 'Rubrique',
    hiddenSuffix: ' (masquée)',
    stepOf: (step, total) => `Étape ${step} sur ${total}`,
    hiddenFromCv: 'Masquée sur le CV',
    previousSection: 'Précédent',
    nextSection: 'Rubrique suivante',
    reorderAndHide: 'Réorganiser et masquer les rubriques',
    completeness: 'Progression',
    downloadPdfShort: 'PDF',

    renameCvTooltip: 'Renommer ce CV',
    renameCvTitle: 'Renommer le CV',
    renameCvBody:
      'Vous seul voyez ce nom : il sert à retrouver le CV dans votre tableau de bord, il n’apparaît pas sur le document.',
    cvName: 'Nom',
    undo: 'Annuler (Ctrl+Z)',
    redo: 'Rétablir (Ctrl+Maj+Z)',
    moreActions: 'Autres actions',
    printAction: 'Imprimer…',
    createShareLink: 'Créer un lien de partage',
    turnOffSharing: 'Désactiver le partage',
    previewPage: 'Page d’aperçu',
    deleteCvAction: 'Supprimer le CV',
    deleteCvTitle: 'Supprimer ce CV ?',
    deleteCvBody: (title) =>
      `« ${title} » sera supprimé définitivement. Cette action est irréversible.`,
    deleteCvConfirm: 'Supprimer définitivement',
    publicNotice: 'Ce CV est public :',
    copyLink: 'Copier',
    linkCopied: 'Lien copié',
    notSaved: 'Non enregistré — réessayer',
    saveFailedHeading: 'Ce CV n’a pas été enregistré',
    saveFailedKept:
      'Votre travail est conservé dans ce navigateur : vous pouvez continuer à modifier, mais ne fermez pas cet onglet avant l’enregistrement.',
    draftFoundHeading: 'Travail non enregistré récupéré',
    draftFoundBody:
      'Un enregistrement précédent a échoué et ce navigateur en a gardé une copie. Elle est plus récente que la version sur notre serveur.',
    draftRestore: 'Restaurer mon travail',
    draftDiscard: 'Ignorer',
    invalidFieldsHeading:
      'Ces champs doivent être corrigés pour que ce CV puisse être enregistré :',
    issueEntry: (sectionLabel, index) => `${sectionLabel} — entrée ${index}`,
    issueDateFormat: 'Indiquez une année (2024) ou une année et un mois (2024-06).',
    issueTooLong: 'Ce texte dépasse la longueur maximale autorisée. Raccourcissez-le.',
    unsaved: 'Non enregistré',
    offline: 'Le serveur est injoignable. Vos modifications sont toujours là.',

    reorderHandle: (name) =>
      `Déplacer ${name}. Appuyez sur la barre d’espace, puis utilisez les flèches.`,
    deleteNamed: (name) => `Supprimer ${name}`,

    toast: {
      couldNotSave: 'Enregistrement impossible',
      pdfReady: 'PDF téléchargé',
      pdfReadyBody: 'Regardez dans votre dossier de téléchargements.',
      pdfFailed: 'Impossible de créer le PDF',
      duplicated: 'CV dupliqué',
      duplicatedBody: 'Ouverture de la copie.',
      duplicateFailed: 'Impossible de dupliquer ce CV',
      shareOn: 'Lien de partage créé',
      shareOnBody: 'Copié dans votre presse-papiers.',
      shareOff: 'Partage désactivé',
      shareOffBody: 'L’ancien lien ne fonctionne plus.',
      shareFailed: 'Impossible de modifier le partage',
      deleted: 'CV supprimé',
      deleteFailed: 'Impossible de supprimer ce CV',
    },

    pro: {
      title: 'Fonctionnalité réservée à Pro',
      body: (reason) =>
        `${reason} Passez à Pro pour débloquer tous les modèles et l’ensemble des réglages de mise en forme.`,
      seePlans: 'Voir les offres Pro',
      share: 'Les liens de partage public sont réservés à Pro.',
      customSections: 'Les rubriques personnalisées sont réservées à Pro.',
      lockedTemplate: (name) => `« ${name} » est un modèle Pro.`,
      headingColour: 'La couleur des titres est un réglage Pro.',
      bodyColour: 'La couleur du texte est un réglage Pro.',
      font: 'Le choix des polices est un réglage Pro.',
      textSize: 'La taille du texte est un réglage Pro.',
      lineHeight: 'L’interligne est un réglage Pro.',
      headingStyle: 'Le style des titres est un réglage Pro.',
      spacing: 'L’espacement est un réglage Pro.',
      margins: 'Les marges sont un réglage Pro.',
      skillDisplay: 'L’affichage des compétences est un réglage Pro.',
    },

    design: {
      colourGroup: 'Couleurs',
      typographyGroup: 'Typographie',
      spacingGroup: 'Espacement et page',
      contentGroup: 'Affichage du contenu',
      headingColour: 'Couleur des titres',
      bodyColour: 'Couleur du texte',
      caseUpper: 'MAJ',
      caseTitle: 'Majuscule initiale',
      caseAsTyped: 'Tel que saisi',
      paperHint:
        'A4 pour la France, l’Europe et la plus grande partie du monde. Letter pour les États-Unis et le Canada.',
      showPhoto: 'Afficher la photo',
      showPhotoHint: 'Sans effet sur les modèles qui n’en prévoient pas.',
      photoShape: 'Forme de la photo',
      photoCircle: 'Ronde',
      photoRounded: 'Arrondie',
      photoSquare: 'Carrée',
      showIcons: 'Afficher les icônes de contact',
      showIconsHint: 'À désactiver pour une compatibilité ATS maximale.',
      skillDisplay: 'Affichage des compétences',
      skillBars: 'Barres',
      skillDots: 'Points',
      skillTags: 'Étiquettes',
      skillText: 'Texte',
      skillHint:
        'Le texte simple est le plus fiable à l’analyse automatique. Les barres et les points affirment un niveau que le recruteur ne peut pas vérifier : à utiliser avec parcimonie.',
      searchTemplates: 'Rechercher un modèle',
      shown: (n) => (n === 1 ? '1 affiché' : `${n} affichés`),
      noMatch: (query) => `Aucun modèle ne correspond à « ${query} ».`,
      columns: (n) => (n === 1 ? '1 col.' : '2 col.'),
      ats: (score) => `ATS ${score}/5`,
      categories: {
        all: 'Tous',
        modern: 'Moderne',
        corporate: 'Entreprise',
        creative: 'Créatif',
        technology: 'Informatique',
        classic: 'Classique',
        ats: 'ATS',
      },
    },

    preview: {
      pages: (n) => (n === 1 ? '1 page' : `${n} pages`),
      pageMarker: (page) => `Page ${page}`,
      zoomIn: 'Zoom avant',
      zoomOut: 'Zoom arrière',
      fitToWidth: 'Ajuster à la largeur',
    },

    list: {
      maxEntries: (max) => `Vous avez atteint le maximum de ${max} entrées pour cette rubrique.`,
      deleteBody: (name) => `« ${name} » sera retiré de votre CV. Vous pouvez annuler avec Ctrl+Z.`,
      itemNumber: (label, index) => `${label} ${index}`,
      removeItemNumber: (label, index) => `Supprimer ${label} ${index}`,
    },

    sections: {
      addCustom: 'Ajouter une rubrique personnalisée',
      customHint: 'Rubrique personnalisée',
      defaultCustomTitle: 'Rubrique personnalisée',
      renameTitle: 'Renommer la rubrique',
      renameBody: 'C’est le titre imprimé sur votre CV.',
      heading: 'Titre',
      newTitle: 'Nouvelle rubrique personnalisée',
      newBody:
        'Pour tout ce que les douze rubriques prédéfinies ne couvrent pas : brevets, adhésions, conférences, service militaire.',
      newPlaceholder: 'Conférences',
      sectionHeading: 'Titre de la rubrique',
      addConfirm: 'Ajouter la rubrique',
      deleteTitle: 'Supprimer cette rubrique ?',
      deleteBody: (label) =>
        `« ${label} » et tout son contenu seront supprimés. Vous pouvez annuler avec Ctrl+Z.`,
      deleteConfirm: 'Supprimer la rubrique',
      moveUp: (label) => `Monter ${label}`,
      moveDown: (label) => `Descendre ${label}`,
      hide: (label) => `Masquer ${label}`,
      show: (label) => `Afficher ${label}`,
      hideTitle: 'Masquer sur le CV',
      showTitle: 'Afficher sur le CV',
    },

    sectionHints: {
      summary: 'Trois ou quatre lignes qui disent qui vous êtes et ce que vous apportez.',
      competencies:
        'Trois à six domaines d’expertise, chacun appuyé par les réalisations qui le prouvent. C’est ce qui fait un CV par compétences : mettez-les en avant et le parcours professionnel peut rester bref.',
      experience: 'Postes, entreprises, dates et résultats obtenus.',
      education: 'Diplômes, établissements et enseignements pertinents.',
      skills: 'Compétences techniques et humaines, regroupées par catégorie si vous le souhaitez.',
      languages: 'Les langues que vous parlez et votre niveau dans chacune.',
      projects: 'Projets personnels, contributions open source ou livrables clients.',
      certifications: 'Certifications professionnelles, licences et habilitations.',
      awards: 'Distinctions, prix et récompenses.',
      volunteer: 'Engagements bénévoles qui montrent votre initiative et vos valeurs.',
      publications: 'Articles, ouvrages, communications en conférence.',
      interests: 'Une ligne courte et humaine en fin de document.',
      references: 'Vos référents, ou une simple mention « disponibles sur demande ».',
    },

    photo: {
      title: 'Photo de profil',
      body: 'Attendue en Europe continentale, en Afrique du Nord et au Moyen-Orient ; le plus souvent omise au Royaume-Uni, en Irlande et aux États-Unis. Les modèles sans emplacement photo l’ignorent tout simplement.',
      upload: 'Importer une photo',
      replace: 'Remplacer la photo',
      dropHint: 'ou déposez une image ici',
      formats:
        'JPEG, PNG, WebP ou AVIF, jusqu’à 8 Mo. L’image est recadrée au carré et redimensionnée à 600 px dans votre navigateur avant l’envoi : une photo prise au téléphone n’alourdira pas votre PDF.',
      signInFirst: 'Connectez-vous pour importer une photo.',
      unavailable:
        'L’import de photo est indisponible : le stockage n’est pas configuré sur ce déploiement. Vous pouvez toujours coller un lien ci-dessous.',
      failed: 'L’envoi n’a pas abouti. Vérifiez votre connexion et réessayez.',
    },

    forms: {
      personal: {
        firstName: 'Prénom',
        lastName: 'Nom',
        title: 'Titre professionnel',
        titlePlaceholder: 'Designer produit senior',
        titleHint: 'Le poste que vous visez, pas nécessairement votre intitulé actuel.',
        email: 'E-mail',
        emailPlaceholder: 'vous@exemple.com',
        phone: 'Téléphone',
        phonePlaceholder: '+33 6 12 34 56 78',
        location: 'Localisation',
        locationPlaceholder: 'Lyon, France',
        locationHint:
          'La ville et le pays suffisent. L’adresse postale complète est inutile et vaut mieux être omise.',
        website: 'Site web',
        websitePlaceholder: 'votresite.com',
        linkedin: 'LinkedIn',
        linkedinPlaceholder: 'linkedin.com/in/vous',
        github: 'GitHub',
        githubPlaceholder: 'github.com/vous',
        photoUrl: '…ou collez l’URL d’une photo',
        photoUrlHint:
          'Utile uniquement si l’image est déjà hébergée publiquement. L’import ci-dessus est plus simple et produit un PDF plus léger.',
        linkFallback: 'Lien',
        linkLabel: 'Intitulé',
        linkLabelPlaceholder: 'Portfolio',
        linkUrl: 'URL',
        linkUrlPlaceholder: 'votreportfolio.com',
        links: {
          add: 'Ajouter un autre lien',
          emptyTitle: 'Aucun lien supplémentaire',
          emptyBody:
            'Ajoutez un portfolio, un profil Dribbble ou Behance, un ORCID — tout ce qui mérite de figurer sur la page.',
          deleteTitle: 'Supprimer ce lien ?',
          untitled: 'Lien sans intitulé',
        },
      },
      summary: {
        label: 'Profil professionnel',
        placeholder:
          'Trois ou quatre phrases : qui vous êtes, ce que vous apportez, et un résultat qui le prouve.',
        hint: 'Visez 50 à 90 mots. Commencez par votre métier et vos années d’expérience, puis la réalisation que vous voulez faire lire en premier.',
        wordCount: (n) => (n === 1 ? '1 mot' : `${n} mots`),
        tooShort: ' — un peu court ; ajoutez un résultat concret.',
        tooLong: ' — assez long pour qu’un recruteur le survole. Essayez de resserrer.',
      },
      competencies: {
        list: {
          add: 'Ajouter une compétence clé',
          emptyTitle: 'Aucune compétence clé',
          emptyBody:
            'Trois à six domaines d’expertise, chacun appuyé par les réalisations qui le prouvent. C’est ce qui ouvre un CV par compétences ou hybride — et ce qui permet au parcours professionnel qui suit de rester bref.',
          deleteTitle: 'Supprimer cette compétence clé ?',
          untitled: 'Compétence sans intitulé',
        },
        evidenceCount: (n) => (n === 1 ? '1 preuve' : `${n} preuves`),
        name: 'Domaine d’expertise',
        namePlaceholder: 'Pilotage de programme',
        framing: 'Cadrage',
        framingPlaceholder:
          'Une ou deux lignes pour dire ce que vous entendez par là. Facultatif — les preuves suffisent souvent.',
        evidence: 'Preuves',
        evidencePlaceholder:
          'Coordination d’une refonte de programme pour 340 élèves, avec quatre départements et une échéance imposée par le jury d’examen.',
        addEvidence: 'Ajouter une preuve',
      },
      experience: {
        list: {
          add: 'Ajouter un poste',
          emptyTitle: 'Aucune expérience professionnelle',
          emptyBody:
            'Commencez par votre poste le plus récent. Les stages, les missions en freelance et le bénévolat significatif comptent aussi.',
          deleteTitle: 'Supprimer ce poste ?',
          untitled: 'Poste sans intitulé',
        },
        role: 'Intitulé du poste',
        rolePlaceholder: 'Designer produit senior',
        company: 'Entreprise',
        companyPlaceholder: 'Atlas Cloud',
        location: 'Lieu',
        locationPlaceholder: 'Lyon, France',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        presentHint: 'Affiché comme « Aujourd’hui ».',
        current: 'J’occupe actuellement ce poste',
        description: 'En quoi consistait le poste',
        descriptionPlaceholder:
          'Une ou deux lignes de contexte : le périmètre du poste, la taille de l’équipe, les interlocuteurs.',
        descriptionHint: 'Le contexte, pas les réalisations — celles-ci vont ci-dessous.',
        achievements: 'Réalisations',
        achievementPlaceholder:
          'Refonte de l’intégration : activation passée de 34 % à 58 % en deux trimestres.',
        addAchievement: 'Ajouter une réalisation',
        tags: 'Mots-clés',
        tagsHint:
          'Facultatif. Certains modèles les affichent sous forme de petites étiquettes ; les modèles ATS les masquent.',
        tagsPlaceholder: 'Design system, Onboarding, SaaS B2B',
      },
      education: {
        list: {
          add: 'Ajouter un diplôme',
          emptyTitle: 'Aucune formation',
          emptyBody:
            'Commencez par votre diplôme le plus élevé. En début de carrière, cette rubrique a sa place en haut du CV.',
          deleteTitle: 'Supprimer ce diplôme ?',
          untitled: 'Diplôme sans intitulé',
        },
        degree: 'Diplôme',
        degreePlaceholder: 'Licence',
        field: 'Spécialité',
        fieldPlaceholder: 'Informatique',
        institution: 'Établissement',
        institutionPlaceholder: 'Université Lyon 2',
        location: 'Lieu',
        locationPlaceholder: 'Lyon, France',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        grade: 'Mention',
        gradePlaceholder: 'Mention très bien',
        current: 'J’y étudie encore',
        notes: 'Précisions',
        notesPlaceholder: 'Sujet de mémoire, enseignements pertinents ou distinction.',
        notesHint: 'Utile pour un jeune diplômé ; on peut la laisser vide par la suite.',
      },
      skills: {
        list: {
          add: 'Ajouter une compétence',
          emptyTitle: 'Aucune compétence',
          emptyBody:
            'Cinq à quinze compétences est la bonne fourchette. Regroupez-les par catégorie et les modèles s’occupent de la mise en page.',
          deleteTitle: 'Supprimer cette compétence ?',
          untitled: 'Compétence sans intitulé',
        },
        name: 'Compétence',
        namePlaceholder: 'Figma',
        category: 'Catégorie',
        categoryPlaceholder: 'Outils',
        categoryHint: 'Regroupement facultatif.',
        level: 'Niveau',
      },
      languages: {
        list: {
          add: 'Ajouter une langue',
          emptyTitle: 'Aucune langue',
          emptyBody: 'Utile pour toute candidature internationale, et attendu sur un CV européen.',
          deleteTitle: 'Supprimer cette langue ?',
          untitled: 'Langue sans intitulé',
        },
        name: 'Langue',
        namePlaceholder: 'Anglais',
        level: 'Niveau',
        levelHint: 'Converti en niveau CECRL par les modèles qui l’affichent.',
      },
      projects: {
        list: {
          add: 'Ajouter un projet',
          emptyTitle: 'Aucun projet',
          emptyBody:
            'Projets personnels, contributions open source et livrables clients marquants. Particulièrement utiles si vos intitulés de poste ne rendent pas justice à ce que vous savez faire.',
          deleteTitle: 'Supprimer ce projet ?',
          untitled: 'Projet sans nom',
        },
        name: 'Nom du projet',
        namePlaceholder: 'Souk Kit',
        role: 'Votre rôle',
        rolePlaceholder: 'Créateur',
        start: 'Début',
        end: 'Fin',
        link: 'Lien',
        linkPlaceholder: 'github.com/vous/projet',
        description: 'Description',
        descriptionPlaceholder: 'Ce que c’est, à qui cela s’adresse et ce que vous avez construit.',
        highlights: 'Points forts',
        highlightPlaceholder: '4 100 étoiles sur GitHub et plus de 60 contributeurs.',
        addHighlight: 'Ajouter un point fort',
        tags: 'Mots-clés',
      },
      certifications: {
        list: {
          add: 'Ajouter une certification',
          emptyTitle: 'Aucune certification',
          emptyBody:
            'Licences, certifications professionnelles et habilitations qu’un recruteur peut vérifier.',
          deleteTitle: 'Supprimer cette certification ?',
          untitled: 'Certification sans intitulé',
        },
        name: 'Intitulé',
        namePlaceholder: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Organisme',
        issuerPlaceholder: 'Amazon Web Services',
        issued: 'Obtenue le',
        expires: 'Expire le',
        credentialId: 'Numéro de certification',
        verification: 'Lien de vérification',
      },
      awards: {
        list: {
          add: 'Ajouter une distinction',
          emptyTitle: 'Aucune distinction',
          emptyBody:
            'Prix, récompenses et reconnaissances — les distinctions internes comptent aussi.',
          deleteTitle: 'Supprimer cette distinction ?',
          untitled: 'Distinction sans intitulé',
        },
        title: 'Intitulé',
        issuer: 'Décernée par',
        date: 'Date',
        description: 'Description',
      },
      volunteer: {
        list: {
          add: 'Ajouter un engagement',
          emptyTitle: 'Aucun engagement bénévole',
          emptyBody:
            'Une activité non rémunérée qui met en avant une initiative, des valeurs ou des compétences que vos emplois ne montrent pas.',
          deleteTitle: 'Supprimer cet engagement ?',
          untitled: 'Engagement sans intitulé',
        },
        role: 'Rôle',
        organisation: 'Organisation',
        location: 'Lieu',
        start: 'Début',
        end: 'Fin',
        current: 'Je suis toujours bénévole ici',
        description: 'Description',
      },
      publications: {
        list: {
          add: 'Ajouter une publication',
          emptyTitle: 'Aucune publication',
          emptyBody:
            'Articles, ouvrages et communications en conférence. Indispensable sur un CV académique.',
          deleteTitle: 'Supprimer cette publication ?',
          untitled: 'Publication sans titre',
        },
        title: 'Titre',
        publisher: 'Éditeur',
        date: 'Date',
        link: 'Lien',
        authors: 'Auteurs',
        authorsPlaceholder: 'El Fassi, A., Benali, Y.',
        abstract: 'Résumé',
      },
      interests: {
        list: {
          add: 'Ajouter un centre d’intérêt',
          emptyTitle: 'Aucun centre d’intérêt',
          emptyBody:
            'Une ligne courte et précise rend un CV plus humain. « Course de fond » vaut mieux que « sport ».',
          deleteTitle: 'Supprimer ce centre d’intérêt ?',
          untitled: 'Centre d’intérêt sans intitulé',
        },
        name: 'Centre d’intérêt',
        detail: 'Précision',
        detailHint: 'Facultatif. Seuls certains modèles l’affichent.',
      },
      references: {
        list: {
          add: 'Ajouter un référent',
          emptyTitle: 'Aucune référence',
          emptyBody:
            'La plupart des employeurs les demandent plus tard. N’indiquez que des personnes qui ont donné leur accord — et ne publiez jamais leurs coordonnées sur un lien partagé.',
          deleteTitle: 'Supprimer ce référent ?',
          untitled: 'Référent sans nom',
        },
        name: 'Nom',
        relationship: 'Lien avec vous',
        relationshipPlaceholder: 'Responsable direct',
        role: 'Fonction',
        company: 'Entreprise',
        email: 'E-mail',
        phone: 'Téléphone',
      },
      custom: {
        list: {
          add: 'Ajouter une entrée',
          emptyTitle: 'Cette rubrique est vide',
          emptyBody:
            'Chaque entrée comporte un titre, un sous-titre, une date et une description — de quoi couvrir presque tout ce que les rubriques standard ne prévoient pas.',
          deleteTitle: 'Supprimer cette entrée ?',
          untitled: 'Entrée sans titre',
        },
        heading: 'Titre de la rubrique',
        entryHeading: 'Titre',
        entrySubheading: 'Sous-titre',
        entryDate: 'Date',
        entryDatePlaceholder: '2024',
        description: 'Description',
      },
      letter: {
        enable: 'Joindre une lettre de motivation',
        enableHint:
          'Exportée en première page du même PDF, dans la mise en forme de ce CV. La désactiver conserve le brouillon.',
        recipient: 'Destinataire',
        recipientPlaceholder: 'Madame Okafor',
        recipientHint: 'Laissez vide pour « Madame, Monsieur ».',
        recipientRole: 'Sa fonction',
        recipientRolePlaceholder: 'Directrice du recrutement',
        company: 'Entreprise',
        companyPlaceholder: 'Atlas Cloud',
        vacancy: 'Poste visé',
        vacancyPlaceholder: 'Designer produit senior',
        reference: 'Référence',
        referencePlaceholder: 'REQ-2841',
        date: 'Date',
        datePlaceholder: '2026-08-15',
        dateHint: 'Laissez vide pour la dater du jour de l’export.',
        address: 'Adresse de l’entreprise',
        addressPlaceholder: '18 rue Lafayette\n75009 Paris',
        body: 'Lettre',
        bodyPlaceholder:
          'Trois ou quatre paragraphes courts : pourquoi ce poste, ce que vous y apportez, et un élément que le CV ne dit pas.',
        bodyHint: 'Une ligne vide commence un nouveau paragraphe.',
        signOff: 'Formule de politesse',
        signOffPlaceholder: 'Je vous prie d’agréer, Madame, mes salutations distinguées.',
        signOffHint:
          'Laissée vide, elle suit l’usage : une formule adressée nommément si vous avez un destinataire, une formule neutre sinon.',
        signature: 'Signature',
        signaturePlaceholder: 'Votre nom',
      },
    },
  },
};

const DE: EditorCopy = {
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
    headingStyle: 'Stil der Abschnittsüberschriften',
    resetDesign: 'Auf Vorlagenstandard zurücksetzen',
    zoom: 'Zoom',
    pageOf: (page, total) => `Seite ${page} von ${total}`,
    downloadPdf: 'PDF herunterladen',
    preparingPdf: 'Ihr PDF wird vorbereitet…',
    autoSaved: (when) => `Gespeichert ${when}`,

    personalDetails: 'Persönliche Angaben',
    editorView: 'Editor-Ansicht',
    sectionField: 'Abschnitt',
    hiddenSuffix: ' (ausgeblendet)',
    stepOf: (step, total) => `Schritt ${step} von ${total}`,
    hiddenFromCv: 'Nicht im Lebenslauf',
    previousSection: 'Zurück',
    nextSection: 'Nächster Abschnitt',
    reorderAndHide: 'Abschnitte sortieren und ausblenden',
    completeness: 'Vollständigkeit',
    downloadPdfShort: 'PDF',

    renameCvTooltip: 'Diesen Lebenslauf umbenennen',
    renameCvTitle: 'Lebenslauf umbenennen',
    renameCvBody:
      'Diesen Namen sehen nur Sie — er ordnet den Lebenslauf in Ihrer Übersicht ein und erscheint nicht auf dem Dokument.',
    cvName: 'Name',
    undo: 'Rückgängig (Strg+Z)',
    redo: 'Wiederholen (Strg+Umschalt+Z)',
    moreActions: 'Weitere Aktionen',
    printAction: 'Drucken…',
    createShareLink: 'Freigabelink erstellen',
    turnOffSharing: 'Freigabe beenden',
    previewPage: 'Vorschauseite',
    deleteCvAction: 'Lebenslauf löschen',
    deleteCvTitle: 'Diesen Lebenslauf löschen?',
    deleteCvBody: (title) =>
      `„${title}“ wird endgültig gelöscht. Das lässt sich nicht rückgängig machen.`,
    deleteCvConfirm: 'Endgültig löschen',
    publicNotice: 'Dieser Lebenslauf ist öffentlich:',
    copyLink: 'Kopieren',
    linkCopied: 'Link kopiert',
    notSaved: 'Nicht gespeichert — erneut versuchen',
    saveFailedHeading: 'Dieser Lebenslauf wurde nicht gespeichert',
    saveFailedKept:
      'Ihre Arbeit wird in diesem Browser aufbewahrt — Sie können weiterarbeiten, schließen Sie diesen Tab aber nicht, bevor gespeichert wurde.',
    draftFoundHeading: 'Nicht gespeicherte Arbeit wiederhergestellt',
    draftFoundBody:
      'Ein früherer Speichervorgang ist fehlgeschlagen und dieser Browser hat eine Kopie behalten. Sie ist neuer als die Version auf unserem Server.',
    draftRestore: 'Arbeit wiederherstellen',
    draftDiscard: 'Verwerfen',
    invalidFieldsHeading: 'Diese Felder müssen korrigiert werden, damit gespeichert werden kann:',
    issueEntry: (sectionLabel, index) => `${sectionLabel} — Eintrag ${index}`,
    issueDateFormat: 'Geben Sie ein Jahr (2024) oder Jahr und Monat (2024-06) an.',
    issueTooLong: 'Dieser Text ist länger als erlaubt. Kürzen Sie ihn.',
    unsaved: 'Nicht gespeichert',
    offline: 'Der Server ist nicht erreichbar. Ihre Änderungen sind weiterhin vorhanden.',

    reorderHandle: (name) =>
      `${name} verschieben. Leertaste drücken, dann die Pfeiltasten verwenden.`,
    deleteNamed: (name) => `${name} löschen`,

    toast: {
      couldNotSave: 'Speichern nicht möglich',
      pdfReady: 'PDF heruntergeladen',
      pdfReadyBody: 'Sehen Sie in Ihrem Download-Ordner nach.',
      pdfFailed: 'PDF konnte nicht erstellt werden',
      duplicated: 'Lebenslauf dupliziert',
      duplicatedBody: 'Die Kopie wird geöffnet.',
      duplicateFailed: 'Dieser Lebenslauf konnte nicht dupliziert werden',
      shareOn: 'Freigabelink erstellt',
      shareOnBody: 'In die Zwischenablage kopiert.',
      shareOff: 'Freigabe beendet',
      shareOffBody: 'Der alte Link funktioniert nicht mehr.',
      shareFailed: 'Freigabe konnte nicht geändert werden',
      deleted: 'Lebenslauf gelöscht',
      deleteFailed: 'Dieser Lebenslauf konnte nicht gelöscht werden',
    },

    pro: {
      title: 'Das ist eine Pro-Funktion',
      body: (reason) =>
        `${reason} Mit Pro erhalten Sie alle Vorlagen und sämtliche Gestaltungsoptionen.`,
      seePlans: 'Pro-Tarife ansehen',
      share: 'Öffentliche Freigabelinks gibt es nur mit Pro.',
      customSections: 'Eigene Abschnitte gibt es nur mit Pro.',
      lockedTemplate: (name) => `„${name}“ ist eine Pro-Vorlage.`,
      headingColour: 'Die Farbe der Überschriften ist eine Pro-Einstellung.',
      bodyColour: 'Die Textfarbe ist eine Pro-Einstellung.',
      font: 'Die Schriftwahl ist eine Pro-Einstellung.',
      textSize: 'Die Schriftgröße ist eine Pro-Einstellung.',
      lineHeight: 'Der Zeilenabstand ist eine Pro-Einstellung.',
      headingStyle: 'Der Stil der Überschriften ist eine Pro-Einstellung.',
      spacing: 'Die Abstände sind eine Pro-Einstellung.',
      margins: 'Die Seitenränder sind eine Pro-Einstellung.',
      skillDisplay: 'Die Darstellung der Kenntnisse ist eine Pro-Einstellung.',
    },

    design: {
      colourGroup: 'Farben',
      typographyGroup: 'Typografie',
      spacingGroup: 'Abstände und Seite',
      contentGroup: 'Darstellung der Inhalte',
      headingColour: 'Farbe der Überschriften',
      bodyColour: 'Textfarbe',
      caseUpper: 'GROSS',
      caseTitle: 'Wortanfang groß',
      caseAsTyped: 'Wie eingegeben',
      paperHint:
        'A4 für Deutschland, Europa und den größten Teil der Welt. Letter für die USA und Kanada.',
      showPhoto: 'Bewerbungsfoto anzeigen',
      showPhotoHint: 'Wirkt sich nur auf Vorlagen mit Fotoplatz aus.',
      photoShape: 'Form des Fotos',
      photoCircle: 'Rund',
      photoRounded: 'Abgerundet',
      photoSquare: 'Eckig',
      showIcons: 'Kontaktsymbole anzeigen',
      showIconsHint: 'Für maximale ATS-Kompatibilität ausschalten.',
      skillDisplay: 'Darstellung der Kenntnisse',
      skillBars: 'Balken',
      skillDots: 'Punkte',
      skillTags: 'Tags',
      skillText: 'Text',
      skillHint:
        'Reiner Text wird am zuverlässigsten ausgelesen. Balken und Punkte behaupten ein Niveau, das eine Personalerin nicht überprüfen kann — setzen Sie sie sparsam ein.',
      searchTemplates: 'Vorlagen durchsuchen',
      shown: (n) => (n === 1 ? '1 Treffer' : `${n} Treffer`),
      noMatch: (query) => `Keine Vorlage passt zu „${query}“.`,
      columns: (n) => (n === 1 ? '1 Spalte' : '2 Spalten'),
      ats: (score) => `ATS ${score}/5`,
      categories: {
        all: 'Alle',
        modern: 'Modern',
        corporate: 'Business',
        creative: 'Kreativ',
        technology: 'IT',
        classic: 'Klassisch',
        ats: 'ATS',
      },
    },

    preview: {
      pages: (n) => (n === 1 ? '1 Seite' : `${n} Seiten`),
      pageMarker: (page) => `Seite ${page}`,
      zoomIn: 'Vergrößern',
      zoomOut: 'Verkleinern',
      fitToWidth: 'An Breite anpassen',
    },

    list: {
      maxEntries: (max) => `Mehr als ${max} Einträge sind in diesem Abschnitt nicht möglich.`,
      deleteBody: (name) =>
        `„${name}“ wird aus Ihrem Lebenslauf entfernt. Mit Strg+Z können Sie das rückgängig machen.`,
      itemNumber: (label, index) => `${label} ${index}`,
      removeItemNumber: (label, index) => `${label} ${index} entfernen`,
    },

    sections: {
      addCustom: 'Eigenen Abschnitt hinzufügen',
      customHint: 'Eigener Abschnitt',
      defaultCustomTitle: 'Eigener Abschnitt',
      renameTitle: 'Abschnitt umbenennen',
      renameBody: 'Das ist die Überschrift, die auf Ihrem Lebenslauf steht.',
      heading: 'Überschrift',
      newTitle: 'Neuer eigener Abschnitt',
      newBody:
        'Für alles, was die zwölf vorgegebenen Abschnitte nicht abdecken — Patente, Mitgliedschaften, Vorträge, Wehr- oder Zivildienst.',
      newPlaceholder: 'Vorträge',
      sectionHeading: 'Überschrift des Abschnitts',
      addConfirm: 'Abschnitt hinzufügen',
      deleteTitle: 'Diesen Abschnitt löschen?',
      deleteBody: (label) =>
        `„${label}“ wird mit allen Inhalten entfernt. Mit Strg+Z können Sie das rückgängig machen.`,
      deleteConfirm: 'Abschnitt löschen',
      moveUp: (label) => `${label} nach oben`,
      moveDown: (label) => `${label} nach unten`,
      hide: (label) => `${label} ausblenden`,
      show: (label) => `${label} einblenden`,
      hideTitle: 'Im Lebenslauf ausblenden',
      showTitle: 'Im Lebenslauf anzeigen',
    },

    sectionHints: {
      summary: 'Drei bis vier Zeilen darüber, wer Sie sind und was Sie mitbringen.',
      competencies:
        'Drei bis sechs Kompetenzfelder, jedes mit den Erfolgen, die es belegen. Das macht einen kompetenzorientierten Lebenslauf aus — steht es vorn, darf der berufliche Werdegang darunter kurz bleiben.',
      experience: 'Positionen, Arbeitgeber, Zeiträume und Ihre Ergebnisse.',
      education: 'Abschlüsse, Hochschulen und einschlägige Studieninhalte.',
      skills: 'Fach- und Sozialkompetenzen, auf Wunsch nach Kategorien gruppiert.',
      languages: 'Ihre Sprachen und Ihr jeweiliges Niveau.',
      projects: 'Eigene Projekte, Open-Source-Arbeit oder Kundenprojekte.',
      certifications: 'Berufliche Zertifikate, Lizenzen und Nachweise.',
      awards: 'Auszeichnungen, Preise und Ehrungen.',
      volunteer: 'Unbezahltes Engagement, das Initiative und Haltung zeigt.',
      publications: 'Aufsätze, Artikel, Bücher und Konferenzbeiträge.',
      interests: 'Eine kurze, persönliche Zeile am Ende des Dokuments.',
      references: 'Referenzgeber oder ein einzelner Hinweis „auf Anfrage“.',
    },

    photo: {
      title: 'Bewerbungsfoto',
      body: 'In weiten Teilen Kontinentaleuropas, Nordafrikas und des Nahen Ostens erwartet; im Vereinigten Königreich, in Irland und den USA meist weggelassen. Vorlagen ohne Fotoplatz ignorieren es einfach.',
      upload: 'Foto hochladen',
      replace: 'Foto ersetzen',
      dropHint: 'oder Bild hierher ziehen',
      formats:
        'JPEG, PNG, WebP oder AVIF, bis 8 MB. Das Bild wird noch im Browser quadratisch zugeschnitten und auf 600 px verkleinert — ein großes Handyfoto bremst Ihr PDF also nicht aus.',
      signInFirst: 'Melden Sie sich an, um ein Foto hochzuladen.',
      unavailable:
        'Der Foto-Upload ist nicht verfügbar, weil für diese Installation kein Speicher konfiguriert ist. Sie können unten weiterhin einen Link einfügen.',
      failed:
        'Der Upload wurde nicht abgeschlossen. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },

    forms: {
      personal: {
        firstName: 'Vorname',
        lastName: 'Nachname',
        title: 'Berufsbezeichnung',
        titlePlaceholder: 'Senior Product Designer',
        titleHint: 'Die Position, auf die Sie sich bewerben — nicht zwingend Ihre aktuelle.',
        email: 'E-Mail',
        emailPlaceholder: 'sie@beispiel.de',
        phone: 'Telefon',
        phonePlaceholder: '+49 151 23456789',
        location: 'Ort',
        locationPlaceholder: 'München, Deutschland',
        locationHint:
          'Ort und Land genügen. Die vollständige Anschrift ist überflüssig und bleibt besser weg.',
        website: 'Website',
        websitePlaceholder: 'ihreseite.de',
        linkedin: 'LinkedIn',
        linkedinPlaceholder: 'linkedin.com/in/sie',
        github: 'GitHub',
        githubPlaceholder: 'github.com/sie',
        photoUrl: '…oder Foto-URL einfügen',
        photoUrlHint:
          'Nur nötig, wenn das Bild bereits öffentlich gehostet ist. Der Upload oben ist einfacher und ergibt ein kleineres PDF.',
        linkFallback: 'Link',
        linkLabel: 'Bezeichnung',
        linkLabelPlaceholder: 'Portfolio',
        linkUrl: 'URL',
        linkUrlPlaceholder: 'ihrportfolio.de',
        links: {
          add: 'Weiteren Link hinzufügen',
          emptyTitle: 'Keine weiteren Links',
          emptyBody: 'Portfolio, Dribbble, Behance, ORCID — alles, was auf die Seite gehört.',
          deleteTitle: 'Diesen Link löschen?',
          untitled: 'Link ohne Bezeichnung',
        },
      },
      summary: {
        label: 'Profil',
        placeholder:
          'Drei oder vier Sätze: wer Sie sind, was Sie einbringen und ein Ergebnis, das es belegt.',
        hint: 'Zielen Sie auf 50 bis 90 Wörter. Beginnen Sie mit Fachgebiet und Berufsjahren, dann der Erfolg, den man zuerst lesen soll.',
        wordCount: (n) => (n === 1 ? '1 Wort' : `${n} Wörter`),
        tooShort: ' — etwas kurz; ergänzen Sie ein konkretes Ergebnis.',
        tooLong: ' — so lang, dass Personalverantwortliche darüber hinweglesen. Kürzen Sie.',
      },
      competencies: {
        list: {
          add: 'Kernkompetenz hinzufügen',
          emptyTitle: 'Keine Kernkompetenzen',
          emptyBody:
            'Drei bis sechs Kompetenzfelder, jedes mit den Erfolgen, die es belegen. Damit beginnt ein kompetenzorientierter oder hybrider Lebenslauf — und deshalb darf der Werdegang darunter kurz bleiben.',
          deleteTitle: 'Diese Kernkompetenz löschen?',
          untitled: 'Kompetenz ohne Bezeichnung',
        },
        evidenceCount: (n) => (n === 1 ? '1 Beleg' : `${n} Belege`),
        name: 'Kompetenzfeld',
        namePlaceholder: 'Programmsteuerung',
        framing: 'Einordnung',
        framingPlaceholder:
          'Ein bis zwei Zeilen dazu, was Sie darunter verstehen. Optional — meist tragen die Belege allein.',
        evidence: 'Belege',
        evidencePlaceholder:
          'Lehrplanumstellung für 340 Schülerinnen und Schüler über vier Fachbereiche hinweg zum festen Prüfungstermin koordiniert.',
        addEvidence: 'Beleg hinzufügen',
      },
      experience: {
        list: {
          add: 'Position hinzufügen',
          emptyTitle: 'Noch keine Berufserfahrung',
          emptyBody:
            'Beginnen Sie mit Ihrer jüngsten Position. Praktika, freiberufliche Aufträge und nennenswertes Ehrenamt zählen ebenfalls.',
          deleteTitle: 'Diese Position löschen?',
          untitled: 'Position ohne Bezeichnung',
        },
        role: 'Position',
        rolePlaceholder: 'Senior Product Designer',
        company: 'Unternehmen',
        companyPlaceholder: 'Atlas Cloud',
        location: 'Ort',
        locationPlaceholder: 'München, DE',
        startDate: 'Von',
        endDate: 'Bis',
        presentHint: 'Wird als „Heute“ ausgegeben.',
        current: 'Ich arbeite derzeit hier',
        description: 'Worum es in der Position ging',
        descriptionPlaceholder:
          'Ein bis zwei Zeilen Kontext: Zuschnitt der Rolle, Teamgröße, für wen Sie gearbeitet haben.',
        descriptionHint: 'Kontext, keine Erfolge — die kommen darunter.',
        achievements: 'Erfolge',
        achievementPlaceholder:
          'Onboarding neu aufgebaut und die Aktivierung in zwei Quartalen von 34 % auf 58 % gesteigert.',
        addAchievement: 'Erfolg hinzufügen',
        tags: 'Schlagwörter',
        tagsHint:
          'Optional. Manche Vorlagen zeigen sie als kleine Chips, ATS-Vorlagen blenden sie aus.',
        tagsPlaceholder: 'Designsysteme, Onboarding, B2B-SaaS',
      },
      education: {
        list: {
          add: 'Abschluss hinzufügen',
          emptyTitle: 'Keine Ausbildung erfasst',
          emptyBody:
            'Beginnen Sie mit dem höchsten Abschluss. Am Berufsanfang gehört dieser Abschnitt weit nach oben.',
          deleteTitle: 'Diesen Abschluss löschen?',
          untitled: 'Abschluss ohne Bezeichnung',
        },
        degree: 'Abschluss',
        degreePlaceholder: 'B. Sc.',
        field: 'Fachrichtung',
        fieldPlaceholder: 'Informatik',
        institution: 'Hochschule',
        institutionPlaceholder: 'LMU München',
        location: 'Ort',
        locationPlaceholder: 'München, Deutschland',
        startDate: 'Von',
        endDate: 'Bis',
        grade: 'Note',
        gradePlaceholder: '1,7',
        current: 'Ich studiere hier noch',
        notes: 'Anmerkungen',
        notesPlaceholder: 'Thema der Abschlussarbeit, einschlägige Module oder eine Auszeichnung.',
        notesHint: 'Für Berufseinsteiger lohnend; später kann das Feld leer bleiben.',
      },
      skills: {
        list: {
          add: 'Kenntnis hinzufügen',
          emptyTitle: 'Keine Kenntnisse erfasst',
          emptyBody:
            'Fünf bis fünfzehn ist die sinnvolle Spanne. Gruppieren Sie sie nach Kategorien, um die Anordnung kümmern sich die Vorlagen.',
          deleteTitle: 'Diese Kenntnis löschen?',
          untitled: 'Kenntnis ohne Bezeichnung',
        },
        name: 'Kenntnis',
        namePlaceholder: 'Figma',
        category: 'Kategorie',
        categoryPlaceholder: 'Werkzeuge',
        categoryHint: 'Gruppierung, optional.',
        level: 'Niveau',
      },
      languages: {
        list: {
          add: 'Sprache hinzufügen',
          emptyTitle: 'Keine Sprachen erfasst',
          emptyBody:
            'Für jede internationale Bewerbung sinnvoll und auf einem europäischen Lebenslauf erwartet.',
          deleteTitle: 'Diese Sprache löschen?',
          untitled: 'Sprache ohne Bezeichnung',
        },
        name: 'Sprache',
        namePlaceholder: 'Englisch',
        level: 'Niveau',
        levelHint: 'Vorlagen, die es anzeigen, ordnen es dem GER zu.',
      },
      projects: {
        list: {
          add: 'Projekt hinzufügen',
          emptyTitle: 'Keine Projekte erfasst',
          emptyBody:
            'Eigene Projekte, Open-Source-Arbeit und bemerkenswerte Kundenprojekte. Besonders wertvoll, wenn Ihre Positionsbezeichnungen untertreiben, was Sie können.',
          deleteTitle: 'Dieses Projekt löschen?',
          untitled: 'Projekt ohne Namen',
        },
        name: 'Projektname',
        namePlaceholder: 'Souk Kit',
        role: 'Ihre Rolle',
        rolePlaceholder: 'Initiator',
        start: 'Von',
        end: 'Bis',
        link: 'Link',
        linkPlaceholder: 'github.com/sie/projekt',
        description: 'Beschreibung',
        descriptionPlaceholder: 'Was es ist, für wen es gedacht ist und was Sie gebaut haben.',
        highlights: 'Höhepunkte',
        highlightPlaceholder: '4.100 GitHub-Sterne und über 60 Mitwirkende.',
        addHighlight: 'Höhepunkt hinzufügen',
        tags: 'Schlagwörter',
      },
      certifications: {
        list: {
          add: 'Zertifikat hinzufügen',
          emptyTitle: 'Keine Zertifikate',
          emptyBody: 'Lizenzen, berufliche Zertifikate und Nachweise, die sich überprüfen lassen.',
          deleteTitle: 'Dieses Zertifikat löschen?',
          untitled: 'Zertifikat ohne Bezeichnung',
        },
        name: 'Bezeichnung',
        namePlaceholder: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Aussteller',
        issuerPlaceholder: 'Amazon Web Services',
        issued: 'Ausgestellt',
        expires: 'Gültig bis',
        credentialId: 'Zertifikatsnummer',
        verification: 'Link zur Überprüfung',
      },
      awards: {
        list: {
          add: 'Auszeichnung hinzufügen',
          emptyTitle: 'Keine Auszeichnungen',
          emptyBody: 'Preise, Ehrungen und Anerkennungen — auch interne zählen.',
          deleteTitle: 'Diese Auszeichnung löschen?',
          untitled: 'Auszeichnung ohne Bezeichnung',
        },
        title: 'Bezeichnung',
        issuer: 'Verliehen von',
        date: 'Datum',
        description: 'Beschreibung',
      },
      volunteer: {
        list: {
          add: 'Engagement hinzufügen',
          emptyTitle: 'Kein ehrenamtliches Engagement',
          emptyBody:
            'Unbezahlte Tätigkeit, die Initiative, Haltung oder Fähigkeiten zeigt, die Ihre bezahlten Positionen nicht hergeben.',
          deleteTitle: 'Diesen Eintrag löschen?',
          untitled: 'Eintrag ohne Bezeichnung',
        },
        role: 'Funktion',
        organisation: 'Organisation',
        location: 'Ort',
        start: 'Von',
        end: 'Bis',
        current: 'Ich engagiere mich hier weiterhin',
        description: 'Beschreibung',
      },
      publications: {
        list: {
          add: 'Publikation hinzufügen',
          emptyTitle: 'Keine Publikationen',
          emptyBody:
            'Aufsätze, Artikel, Bücher und Konferenzbeiträge. Auf einem akademischen Lebenslauf unverzichtbar.',
          deleteTitle: 'Diese Publikation löschen?',
          untitled: 'Publikation ohne Titel',
        },
        title: 'Titel',
        publisher: 'Verlag',
        date: 'Datum',
        link: 'Link',
        authors: 'Autorinnen und Autoren',
        authorsPlaceholder: 'El Fassi, A., Benali, Y.',
        abstract: 'Kurzfassung',
      },
      interests: {
        list: {
          add: 'Interesse hinzufügen',
          emptyTitle: 'Keine Interessen',
          emptyBody:
            'Eine kurze, konkrete Zeile macht einen Lebenslauf menschlich. „Langstreckenlauf“ sagt mehr als „Sport“.',
          deleteTitle: 'Dieses Interesse löschen?',
          untitled: 'Interesse ohne Bezeichnung',
        },
        name: 'Interesse',
        detail: 'Ergänzung',
        detailHint: 'Optional. Nur manche Vorlagen zeigen sie an.',
      },
      references: {
        list: {
          add: 'Referenzgeber hinzufügen',
          emptyTitle: 'Keine Referenzen erfasst',
          emptyBody:
            'Die meisten Arbeitgeber fragen erst später danach. Nennen Sie nur Personen, die zugestimmt haben — und veröffentlichen Sie deren Kontaktdaten nie über einen Freigabelink.',
          deleteTitle: 'Diesen Referenzgeber löschen?',
          untitled: 'Referenzgeber ohne Namen',
        },
        name: 'Name',
        relationship: 'Verhältnis zu Ihnen',
        relationshipPlaceholder: 'Direkte Führungskraft',
        role: 'Funktion',
        company: 'Unternehmen',
        email: 'E-Mail',
        phone: 'Telefon',
      },
      custom: {
        list: {
          add: 'Eintrag hinzufügen',
          emptyTitle: 'Dieser Abschnitt ist noch leer',
          emptyBody:
            'Jeder Eintrag hat eine Überschrift, eine Unterzeile, ein Datum und eine Beschreibung — genug für fast alles, was die vorgegebenen Abschnitte nicht abdecken.',
          deleteTitle: 'Diesen Eintrag löschen?',
          untitled: 'Eintrag ohne Titel',
        },
        heading: 'Überschrift des Abschnitts',
        entryHeading: 'Überschrift',
        entrySubheading: 'Unterzeile',
        entryDate: 'Datum',
        entryDatePlaceholder: '2024',
        description: 'Beschreibung',
      },
      letter: {
        enable: 'Anschreiben beilegen',
        enableHint:
          'Wird als erste Seite desselben PDFs exportiert, im Stil dieses Lebenslaufs. Ausschalten behält den Entwurf.',
        recipient: 'Empfänger',
        recipientPlaceholder: 'Frau Okafor',
        recipientHint: 'Leer lassen für „Sehr geehrte Damen und Herren“.',
        recipientRole: 'Funktion',
        recipientRolePlaceholder: 'Leiterin Recruiting',
        company: 'Unternehmen',
        companyPlaceholder: 'Atlas Cloud',
        vacancy: 'Stelle',
        vacancyPlaceholder: 'Senior Product Designer',
        reference: 'Referenz',
        referencePlaceholder: 'REQ-2841',
        date: 'Datum',
        datePlaceholder: '2026-08-15',
        dateHint: 'Leer lassen, um das Datum des Exports einzusetzen.',
        address: 'Anschrift des Unternehmens',
        addressPlaceholder: 'Maximilianstraße 18\n80539 München',
        body: 'Anschreiben',
        bodyPlaceholder:
          'Drei oder vier kurze Absätze: warum diese Stelle, was Sie mitbringen und ein Beleg, der nicht im Lebenslauf steht.',
        bodyHint: 'Eine Leerzeile beginnt einen neuen Absatz.',
        signOff: 'Grußformel',
        signOffPlaceholder: 'Mit freundlichen Grüßen',
        signOffHint:
          'Bleibt das Feld leer, wird die übliche Formel eingesetzt — mit Namen, wenn Sie einen Empfänger angegeben haben.',
        signature: 'Unterschrift',
        signaturePlaceholder: 'Ihr Name',
      },
    },
  },
};

export const EDITOR_COPY: Record<Locale, EditorCopy> = { en: EN, fr: FR, de: DE };
