import type { ReactNode } from 'react';

/**
 * Inline icons for the homepage.
 *
 * Deliberately hand-rolled rather than pulled from an icon package: the homepage is a
 * server component and these six paths cost a few hundred bytes of HTML, where importing
 * an icon library would ship a client boundary and a chunk for the same result.
 */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Live preview — an eye over a page. */
export const PreviewIcon = (
  <Icon>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.9" />
  </Icon>
);

/** Autosave — a cloud with a tick. */
export const AutosaveIcon = (
  <Icon>
    <path d="M7 18.5h10.2a3.8 3.8 0 0 0 .5-7.57 5.6 5.6 0 0 0-10.87-1.6A4.2 4.2 0 0 0 7 18.5Z" />
    <path d="m9.6 13.6 1.8 1.8 3.3-3.6" />
  </Icon>
);

/** Section reordering — stacked rows with a move handle. */
export const ReorderIcon = (
  <Icon>
    <path d="M4 6.5h9M4 12h13M4 17.5h9" />
    <path d="M19 4.5v5m0 0-1.8-1.8M19 9.5l1.8-1.8" />
  </Icon>
);

/** Template switching — two overlapping pages. */
export const TemplateIcon = (
  <Icon>
    <rect x="3.2" y="3.2" width="11.6" height="14.6" rx="1.8" />
    <path d="M9.2 20.8h9a1.8 1.8 0 0 0 1.8-1.8V7.4" />
    <path d="M6.2 7.2h5.6M6.2 10.4h5.6M6.2 13.6h3.4" />
  </Icon>
);

/** PDF export — a page with a download arrow. */
export const DownloadIcon = (
  <Icon>
    <path d="M13.6 2.8H7a2 2 0 0 0-2 2v14.4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.2Z" />
    <path d="M13.4 2.9v5.2h5.3" />
    <path d="M12 11.6v5.2m0 0-2.1-2.1M12 16.8l2.1-2.1" />
  </Icon>
);

/** Multiple tailored CVs — a duplicated document. */
export const DuplicateIcon = (
  <Icon>
    <rect x="8.4" y="8.4" width="11.4" height="11.4" rx="2" />
    <path d="M15.6 5.6a2 2 0 0 0-2-2H6.2a2 2 0 0 0-2 2V13a2 2 0 0 0 2 2" />
  </Icon>
);

/** Small tick used in trust rows and checklists. */
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m5 12.6 4.4 4.4L19 7.2" />
    </svg>
  );
}

/** Right-pointing chevron/arrow used on inline "read more" links. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
