'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minus, Plus } from 'lucide-react';

import { CoverLetterDocument } from '@/components/cv/CoverLetterDocument';
import { CVDocument } from '@/components/cv/CVDocument';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { PAPER } from '@/lib/cv/format';
import { cn } from '@/lib/utils/cn';
import type { CVCustomization, CVData } from '@/types/cv';

/**
 * The live preview.
 *
 * The document is always laid out at true page pixels and scaled with a CSS transform,
 * never re-flowed at a smaller width — so what the user sees here is what Chromium will
 * paginate into the PDF, down to where the page breaks fall.
 *
 * Page boundaries are drawn as an overlay measured from the rendered height, which is why
 * the "3 pages" indicator is trustworthy rather than an estimate from word count.
 */

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.6;

/** Vertical gap between the letter sheet and the CV sheet, in CSS px. */
const LETTER_GAP = 28;

export function PreviewPane({
  cv,
  customization,
  className,
  onPageCountChange,
}: {
  cv: CVData;
  customization: CVCustomization;
  className?: string;
  onPageCountChange?: (pages: number) => void;
}) {
  const copy = useCopy();
  const paper = PAPER[customization.paperSize];
  /*
   * Today, resolved once per mount rather than per render.
   *
   * The letter dates itself on the day it is exported when the user has not set a date,
   * and reading the clock inside the render would make the preview a moving target — it
   * would also disagree with the server, which stamps the date at export time.
   */
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const viewportRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.62);
  const [autoFit, setAutoFit] = useState(true);
  const [pageCount, setPageCount] = useState(1);

  const fit = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const available = viewport.clientWidth - 48;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, available / paper.width));
    setZoom(Number(next.toFixed(3)));
  }, [paper.width]);

  // Re-fit on container resize (sidebar collapse, window resize, orientation change).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      if (autoFit) fit();
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [autoFit, fit]);

  // Measure the real rendered height so the page count and the break guides are honest.
  useEffect(() => {
    const element = documentRef.current;
    if (!element) return;

    const measure = () => {
      const height = element.scrollHeight;
      const pages = Math.max(1, Math.ceil((height - 2) / paper.height));
      setPageCount((current) => (current === pages ? current : pages));
      onPageCountChange?.(pages);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [paper.height, cv, customization, onPageCountChange]);

  const setZoomManually = (next: number) => {
    setAutoFit(false);
    setZoom(Number(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)).toFixed(3)));
  };

  return (
    <div className={cn('flex min-h-0 flex-col bg-ink-100', className)}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-2">
        <p className="text-xs font-medium text-ink-600" aria-live="polite">
          {copy.editor.preview.pages(pageCount)} · {paper.label}
        </p>

        <div className="flex items-center gap-1">
          <ZoomButton
            label={copy.editor.preview.zoomOut}
            onClick={() => setZoomManually(zoom - 0.1)}
            disabled={zoom <= MIN_ZOOM}
          >
            <Minus className="size-4" />
          </ZoomButton>
          <span className="w-11 text-center font-mono text-xs text-ink-600 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomButton
            label={copy.editor.preview.zoomIn}
            onClick={() => setZoomManually(zoom + 0.1)}
            disabled={zoom >= MAX_ZOOM}
          >
            <Plus className="size-4" />
          </ZoomButton>
          <ZoomButton
            label={copy.editor.preview.fitToWidth}
            onClick={() => {
              setAutoFit(true);
              fit();
            }}
            active={autoFit}
          >
            <Maximize2 className="size-4" />
          </ZoomButton>
        </div>
      </div>

      <div ref={viewportRef} className="scroll-thin min-h-0 flex-1 overflow-auto p-6">
        <div
          className="mx-auto"
          style={{
            width: paper.width * zoom,
            height:
              (Math.max(paper.height, pageCount * paper.height) +
                (cv.coverLetter.enabled ? paper.height + LETTER_GAP : 0)) *
              zoom,
          }}
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: paper.width,
            }}
          >
            {/*
              The letter is shown above the CV because that is the order it exports in and
              the order it is read in. It is a separate sheet rather than a page of the CV,
              so it gets its own shadow and its own gap — the preview should not imply the
              two documents flow into one another.
            */}
            {cv.coverLetter.enabled ? (
              <CoverLetterDocument
                cv={cv}
                customization={customization}
                className="shadow-page"
                style={{ minHeight: paper.height, marginBottom: LETTER_GAP }}
                today={today}
              />
            ) : null}
            <div ref={documentRef} className="relative">
              <CVDocument
                cv={cv}
                customization={customization}
                className="shadow-page"
                style={{ minHeight: Math.max(paper.height, pageCount * paper.height) }}
                overlay={<PageGuides pageCount={pageCount} pageHeight={paper.height} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Dashed rules where Chromium will break the document into pages. */
function PageGuides({ pageCount, pageHeight }: { pageCount: number; pageHeight: number }) {
  const copy = useCopy();
  if (pageCount < 2) return null;
  return (
    <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
      {Array.from({ length: pageCount - 1 }, (_, index) => (
        <div
          key={index}
          className="absolute inset-x-0 flex items-center"
          style={{ top: (index + 1) * pageHeight }}
        >
          <span className="h-px flex-1 border-t border-dashed border-danger-400/70" />
          <span className="bg-danger-500 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase">
            {copy.editor.preview.pageMarker(index + 2)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'cursor-pointer rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
      )}
    >
      {children}
    </button>
  );
}
