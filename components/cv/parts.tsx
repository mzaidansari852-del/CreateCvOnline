/**
 * Shared content renderers for CV templates.
 *
 * Templates own the *page*: columns, header design, section-heading chrome, typographic
 * scale, decoration. This module owns the *content* of a section — the repeated bones of
 * "a job entry", "a skill list" — in several structural flavours so that templates can
 * compose genuinely different documents without each one re-implementing bullet lists.
 *
 * Conventions inside this file:
 *  - Typography uses `em`, so everything scales with the user's font-size control.
 *  - Colours are always passed in; nothing here reads the app theme.
 *  - Every element that must not be split across pages carries `className="cv-block"`.
 */
import type { CSSProperties, ReactNode } from 'react';

import {
  WHITE,
  bodyWeight,
  bulletLines,
  contrastAgainst,
  graphicOn,
  readableOn,
  ensureProtocol,
  formatDateRange,
  formatDuration,
  formatPartialDate,
  groupSkillsByCategory,
  languageLabel,
  languagePercent,
  languageShort,
  mix,
  paragraphs,
  photoAlt,
  prettyUrl,
  skillDots,
  skillLabel,
  skillPercent,
} from '@/lib/cv/format';
import { customSectionKey, isCustomSectionId } from '@/lib/cv/sections';
import type { BuiltInSectionId, CVCustomization, CVData } from '@/types/cv';

/* -------------------------------------------------------------------------- */
/* Shared props                                                                */
/* -------------------------------------------------------------------------- */

export interface PartProps {
  cv: CVData;
  c: CVCustomization;
  /** Resolved accent colour for this document. */
  accent: string;
  /**
   * The colour this part is painted on.
   *
   * Text legibility is a property of a *pair*, and until this existed the parts only knew
   * one half of it. Every accent-coloured employer name was emitted at whatever the user
   * picked, on whatever the template happened to paint behind it — which is how eleven
   * templates shipped printing job history at between 2.15:1 and 3.8:1 on white.
   *
   * Defaults to paper. Any template that renders a part on a tinted panel or a dark sidebar
   * must say so; `tests/cv/templates.test.tsx` walks the rendered DOM and fails if a part
   * ends up on a background it was not told about.
   */
  surface?: string;
  /** Body text colour. Defaults to `inherit` so sidebars can invert. */
  color?: string;
  /** Secondary/metadata colour. */
  muted?: string;
  /** Divider colour. */
  rule?: string;
  /** Per-section structural flavour — see each component for supported values. */
  variant?: string;
  /** Space between entries, in em. */
  gap?: number;
  /** Bullet glyph for achievement and highlight lists. */
  marker?: string;
  /**
   * Set to `false` to suppress tag/chip rendering entirely. ATS templates rely on this —
   * a pill is a styled box, and boxes are exactly what a résumé parser mangles.
   */
  showTags?: boolean;
  /** Renders the secondary line of an entry head at full weight. */
  strongSecondary?: boolean;
}

const DEFAULT_MUTED = '#5b6472';
const DEFAULT_RULE = '#d8dce4';

/**
 * Resolves every colour a part draws with, against the surface it is drawn on.
 *
 * Everything legibility depends on is clamped here and nowhere else, so no individual part
 * \u2014 and no individual template \u2014 can forget one.
 *
 * `color` inherits on paper, which is what a single-column template wants. On a declared
 * panel it cannot: inheritance would carry the page's dark ink onto a purple band. So a
 * surface that is not paper resolves its own readable default, and an explicit colour is
 * still measured against the panel rather than trusted. The upshot is that a template
 * declaring `surface` gets a legible section for free; before this, it had to remember to
 * pass `color` *and* `muted`, and nine of them didn't.
 *
 * `muted` is not decoration. `ExperienceBody` renders every line of every job description
 * in it, and eleven templates override it to `tint(text, 0.38\u20130.45)` \u2014 as low as 3.60:1.
 * Modern Minimal's whole pitch is that hierarchy is carried by space rather than weight;
 * what it actually did was make the body copy too light to read on paper.
 *
 * `accentText` is the accent, darkened only as far as legibility requires. The accent
 * itself is left alone for rules, bars, panels and markers, where saturation is the point
 * and 4.5:1 is not the applicable bar. Splitting the two means a designer can still pick
 * amber and get amber \u2014 just not amber employer names at 2.15:1.
 */
function useTone(props: PartProps) {
  const surface = props.surface ?? WHITE;
  const inherited = surface === WHITE ? 'inherit' : readableOn(surface);
  return {
    surface,
    color: props.color ? contrastAgainst(props.color, surface) : inherited,
    muted: contrastAgainst(props.muted ?? DEFAULT_MUTED, surface),
    accentText: contrastAgainst(props.accent, surface),
    rule: props.rule ?? DEFAULT_RULE,
    gap: props.gap ?? 0.95,
    marker: props.marker ?? '\u2022',
    showTags: props.showTags ?? true,
    strong: bodyWeight(props.c, 700),
    secondaryWeight: bodyWeight(props.c, props.strongSecondary ? 700 : 600),
  };
}

/* -------------------------------------------------------------------------- */
/* Atoms                                                                       */
/* -------------------------------------------------------------------------- */

export function Bullets({
  items,
  color,
  marker = '•',
  markerColor,
  indent = 1.05,
  gap = 0.22,
  style,
}: {
  items: string[];
  color?: string;
  marker?: string;
  markerColor?: string;
  indent?: number;
  gap?: number;
  style?: CSSProperties;
}) {
  if (items.length === 0) return null;
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, color, ...style }}>
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            position: 'relative',
            paddingLeft: `${indent}em`,
            marginTop: index === 0 ? 0 : `${gap}em`,
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: markerColor ?? 'inherit',
              lineHeight: 'inherit',
            }}
          >
            {marker}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Description text: renders as bullets when the author used `-`/`*`/`•`, else paragraphs. */
export function RichText({
  text,
  color,
  marker = '•',
  markerColor,
  paragraphGap = 0.35,
}: {
  text: string;
  color?: string;
  marker?: string;
  markerColor?: string;
  paragraphGap?: number;
}) {
  const value = text?.trim();
  if (!value) return null;

  const looksLikeList = /(^|\n)\s*[-*•]\s+/.test(value);
  if (looksLikeList) {
    return (
      <Bullets items={bulletLines(value)} color={color} marker={marker} markerColor={markerColor} />
    );
  }

  const blocks = paragraphs(value);
  return (
    <>
      {blocks.map((block, index) => (
        <p key={index} style={{ color, marginTop: index === 0 ? 0 : `${paragraphGap}em` }}>
          {block}
        </p>
      ))}
    </>
  );
}

export function Tags({
  items,
  accent,
  variant = 'pill',
  color,
  surface = WHITE,
}: {
  items: string[];
  accent: string;
  variant?: 'pill' | 'outline' | 'plain' | 'square';
  color?: string;
  surface?: string;
}) {
  if (items.length === 0) return null;

  if (variant === 'plain') {
    return (
      <span style={{ color: color ?? 'inherit', fontSize: '0.92em' }}>{items.join(' · ')}</span>
    );
  }

  // A pill paints its own background, so the text inside it is measured against *that*,
  // not against the page. The two were computed from the same accent and never compared:
  // an amber pill put amber text on a 14%-amber wash, which is a little under 1.8:1.
  const chipBackground = variant === 'outline' ? surface : mix(accent, surface, 0.86);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3em', marginTop: '0.35em' }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            fontSize: '0.82em',
            lineHeight: 1.5,
            padding: '0.12em 0.55em',
            borderRadius: variant === 'square' ? 2 : 999,
            background: variant === 'outline' ? 'transparent' : chipBackground,
            border:
              variant === 'outline'
                ? `1px solid ${mix(accent, surface, 0.55)}`
                : '1px solid transparent',
            color:
              variant === 'outline'
                ? (color ?? 'inherit')
                : contrastAgainst(accent, chipBackground),
            whiteSpace: 'nowrap',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * A filled proportion bar.
 *
 * The track defaults to the accent blended most of the way into the surface, not into
 * white. On paper those are the same thing; on Modern Executive's near-black sidebar they
 * are opposites, and the old default produced a bright empty track behind a dark fill —
 * bars that read as the inverse of the level they encode, in the reference implementation
 * for two-column templates.
 */
export function LevelBar({
  percent,
  accent,
  track,
  surface = WHITE,
  height = 5,
  radius = 999,
}: {
  percent: number;
  accent: string;
  track?: string;
  surface?: string;
  height?: number;
  radius?: number;
}) {
  const fill = graphicOn(accent, surface);
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: track ?? mix(fill, surface, 0.8),
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, percent))}%`,
          background: fill,
          borderRadius: radius,
        }}
      />
    </div>
  );
}

export function LevelDots({
  filled,
  total = 5,
  accent,
  empty,
  surface = WHITE,
  size = 6,
}: {
  filled: number;
  total?: number;
  accent: string;
  empty?: string;
  /** See `LevelBar`: unfilled dots blend toward the surface, not toward white. */
  surface?: string;
  size?: number;
}) {
  const fill = graphicOn(accent, surface);
  return (
    <div style={{ display: 'flex', gap: size * 0.55, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: index < filled ? fill : (empty ?? mix(fill, surface, 0.78)),
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

/** Two-line entry head used by most "stack" style templates. */
export function EntryHead({
  c,
  primary,
  secondary,
  meta,
  metaSecondary,
  color,
  muted,
  accent,
  surface = WHITE,
  layout = 'split',
  primarySize = 1.06,
  secondaryWeight = 600,
  accentTarget = 'secondary',
}: {
  c: CVCustomization;
  primary: string;
  secondary?: string;
  meta?: string;
  metaSecondary?: string;
  color?: string;
  muted?: string;
  accent: string;
  /** The background behind this head. The accent is darkened against it if it has to be. */
  surface?: string;
  layout?: 'split' | 'stacked' | 'inline';
  primarySize?: number;
  secondaryWeight?: number;
  accentTarget?: 'primary' | 'secondary' | 'none';
}) {
  /*
   * This one line is the single most-repeated piece of text on the site: every employer
   * name, every institution, every certification issuer, on all 56 templates. It printed
   * in the raw accent, and for eleven of the defaults that meant somewhere between 2.15:1
   * and 3.8:1 — a job history you cannot read.
   */
  const accentText = contrastAgainst(accent, surface);
  const primaryColor = accentTarget === 'primary' ? accentText : color;
  const secondaryColor = accentTarget === 'secondary' ? accentText : (muted ?? color);

  const titleBlock = (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: `${primarySize}em`, fontWeight: bodyWeight(c, 700), color: primaryColor }}>
        {primary}
      </div>
      {secondary ? (
        <div style={{ fontWeight: bodyWeight(c, secondaryWeight), color: secondaryColor, marginTop: '0.05em' }}>
          {secondary}
        </div>
      ) : null}
    </div>
  );

  const metaBlock =
    meta || metaSecondary ? (
      <div
        style={{
          color: muted,
          fontSize: '0.92em',
          textAlign: layout === 'split' ? 'right' : 'left',
          whiteSpace: layout === 'split' ? 'nowrap' : 'normal',
          flexShrink: 0,
        }}
      >
        {meta ? <div>{meta}</div> : null}
        {metaSecondary ? <div style={{ marginTop: '0.1em' }}>{metaSecondary}</div> : null}
      </div>
    ) : null;

  if (layout === 'split') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '1em',
        }}
      >
        {titleBlock}
        {metaBlock}
      </div>
    );
  }

  if (layout === 'inline') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.45em' }}>
        <span style={{ fontSize: `${primarySize}em`, fontWeight: bodyWeight(c, 700), color: primaryColor }}>
          {primary}
        </span>
        {secondary ? (
          <span style={{ fontWeight: bodyWeight(c, secondaryWeight), color: secondaryColor }}>· {secondary}</span>
        ) : null}
        {meta ? (
          <span style={{ color: muted, fontSize: '0.92em', marginLeft: 'auto' }}>{meta}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {titleBlock}
      {metaBlock ? <div style={{ marginTop: '0.15em' }}>{metaBlock}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

export function ExperienceContent(props: PartProps & { showDuration?: boolean }) {
  const { cv, c, accent, variant = 'stack', showDuration = false } = props;
  const {
    surface,
    accentText,
    color,
    muted,
    rule,
    gap,
    marker,
    showTags,
    secondaryWeight,
    strong,
  } = useTone(props);
  const items = cv.experience.filter((item) => item.role || item.company || item.description);
  if (items.length === 0) return null;

  if (variant === 'timeline') {
    /*
     * The line is a `border-left` on a flowing wrapper, not an absolutely positioned span.
     *
     * An absolute element is laid out against its containing block, and a containing block
     * does not exist twice — when the timeline runs past the bottom of page 1 the line stops
     * at the page break and page 2 gets dots with nothing joining them. A border belongs to
     * the box itself and is redrawn on each fragment, so it continues. `ModernClean` already
     * documented this pattern; it had simply never been applied here.
     *
     * The dots stay absolute because each one sits inside a single entry, and an entry
     * carries `cv-block` so it never splits across a page in the first place.
     */
    return (
      <div
        style={{
          paddingLeft: '1.35em',
          borderLeft: `1.5px solid ${mix(accent, surface, 0.6)}`,
          marginLeft: '0.31em',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ position: 'relative', marginTop: index === 0 ? 0 : `${gap}em` }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: '-1.66em',
                top: '0.38em',
                width: '0.62em',
                height: '0.62em',
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 0 2px ${surface}`,
              }}
            />
            <EntryHead
              c={c}
              surface={surface}
              primary={item.role}
              secondary={[item.company, item.location].filter(Boolean).join(' · ')}
              meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
              metaSecondary={
                showDuration
                  ? formatDuration(item.startDate, item.endDate, item.current)
                  : undefined
              }
              color={color}
              muted={muted}
              accent={accent}
            />
            <ExperienceBody
              surface={surface}
              item={item}
              color={color}
              accent={accent}
              muted={muted}
              marker={marker}
              showTags={showTags}
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'two-col') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              display: 'grid',
              gridTemplateColumns: '7.2em 1fr',
              gap: '0.9em',
              marginTop: index === 0 ? 0 : `${gap}em`,
            }}
          >
            <div style={{ color: muted, fontSize: '0.9em', paddingTop: '0.15em' }}>
              <div>{formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}</div>
              {item.location ? (
                <div style={{ marginTop: '0.2em', opacity: 0.85 }}>{item.location}</div>
              ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.06em', fontWeight: strong, color }}>{item.role}</div>
              {item.company ? (
                <div style={{ fontWeight: secondaryWeight, color: accentText, marginTop: '0.05em' }}>
                  {item.company}
                </div>
              ) : null}
              <ExperienceBody
                surface={surface}
                item={item}
                color={color}
                accent={accent}
                muted={muted}
                marker={marker}
                showTags={showTags}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              marginTop: index === 0 ? 0 : `${gap * 0.72}em`,
              paddingTop: index === 0 ? 0 : `${gap * 0.6}em`,
              borderTop: index === 0 ? 'none' : `1px solid ${rule}`,
            }}
          >
            <EntryHead
              c={c}
              surface={surface}
              primary={item.role}
              secondary={item.company}
              meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
              color={color}
              muted={muted}
              accent={accent}
              layout="inline"
              primarySize={1}
            />
            {item.description ? (
              <p style={{ color: muted, marginTop: '0.25em' }}>{item.description}</p>
            ) : null}
            {item.achievements.length > 0 ? (
              <Bullets
                items={item.achievements}
                color={color}
                markerColor={accentText}
                marker={props.marker ?? '\u2013'}
                style={{ marginTop: '0.25em' }}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'history') {
    /*
     * Work history for a functional CV: role, employer, dates, and nothing else.
     *
     * Dropping the bullets is not a space saving, it is the format. A functional CV has
     * already made its case under the competencies; repeating the achievements here would
     * put the timeline back in charge, which is precisely what the reader was meant to
     * stop leading with. One line per role, so a patchy history reads as a list of facts
     * rather than as a series of gaps.
     */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 0.42}em` }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '0 1em',
            }}
          >
            <div style={{ minWidth: 0, color }}>
              <span style={{ fontWeight: strong }}>{item.role}</span>
              {item.company ? (
                <span style={{ fontWeight: secondaryWeight }}>{`, ${item.company}`}</span>
              ) : null}
            </div>
            <div style={{ color: muted, fontSize: '0.92em', whiteSpace: 'nowrap' }}>
              {[
                formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language),
                item.location,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ marginTop: index === 0 ? 0 : `${gap}em` }}
          >
            <div style={{ fontWeight: strong, color }}>
              {item.role}
              {item.company ? `, ${item.company}` : ''}
            </div>
            <div style={{ color: muted, fontSize: '0.92em', marginTop: '0.1em' }}>
              {[
                formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language),
                item.location,
              ]
                .filter(Boolean)
                .join(' | ')}
            </div>
            <ExperienceBody
              surface={surface}
              item={item}
              color={color}
              accent={accent}
              muted={muted}
              marker={props.marker ?? '-'}
              showTags={showTags}
            />
          </div>
        ))}
      </div>
    );
  }

  // 'stack' — the default
  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="cv-block" style={{ marginTop: index === 0 ? 0 : `${gap}em` }}>
          <EntryHead
            c={c}
            surface={surface}
            primary={item.role}
            secondary={item.company}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
            metaSecondary={item.location || undefined}
            color={color}
            muted={muted}
            accent={accent}
            secondaryWeight={secondaryWeight}
          />
          <ExperienceBody
            surface={surface}
            item={item}
            color={color}
            accent={accent}
            muted={muted}
            marker={marker}
            showTags={showTags}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The body of one job entry: description, achievements, tags.
 *
 * `muted` arrives already clamped from `useTone` \u2014 this is the component the clamp exists
 * for. Every line of every job description on the site renders through here, and eleven
 * templates were handing it a grey at 3.6:1.
 */
function ExperienceBody({
  item,
  color,
  accent,
  muted,
  surface = WHITE,
  marker = '\u2022',
  showTags = true,
}: {
  item: CVData['experience'][number];
  color?: string;
  accent: string;
  muted?: string;
  surface?: string;
  marker?: string;
  showTags?: boolean;
}) {
  const accentText = contrastAgainst(accent, surface);
  const hasDescription = item.description.trim().length > 0;
  const hasAchievements = item.achievements.filter(Boolean).length > 0;
  const hasTags = showTags && item.tags.filter(Boolean).length > 0;
  if (!hasDescription && !hasAchievements && !hasTags) return null;

  return (
    <div style={{ marginTop: '0.32em' }}>
      {hasDescription ? (
        <div style={{ color: muted }}>
          <RichText text={item.description} marker={marker} markerColor={accentText} />
        </div>
      ) : null}
      {hasAchievements ? (
        <Bullets
          items={item.achievements.filter(Boolean)}
          color={color}
          marker={marker}
          markerColor={accentText}
          style={{ marginTop: hasDescription ? '0.3em' : 0 }}
        />
      ) : null}
      {hasTags ? (
        <Tags surface={surface} items={item.tags.filter(Boolean)} accent={accent} color={color} />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Education                                                                   */
/* -------------------------------------------------------------------------- */

export function EducationContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, accentText, color, muted, gap, strong, secondaryWeight } = useTone(props);
  const items = cv.education.filter((item) => item.degree || item.institution || item.field);
  if (items.length === 0) return null;

  const degreeLine = (item: CVData['education'][number]) =>
    [item.degree, item.field].filter(Boolean).join(item.degree && item.field ? ', ' : '');

  if (variant === 'compact') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ marginTop: index === 0 ? 0 : `${gap * 0.7}em` }}
          >
            <div style={{ fontWeight: strong, color }}>{degreeLine(item)}</div>
            <div style={{ color: accentText, fontWeight: secondaryWeight }}>{item.institution}</div>
            <div style={{ color: muted, fontSize: '0.9em', marginTop: '0.05em' }}>
              {[
                formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language),
                item.location,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'two-col') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              display: 'grid',
              gridTemplateColumns: '7.2em 1fr',
              gap: '0.9em',
              marginTop: index === 0 ? 0 : `${gap}em`,
            }}
          >
            <div style={{ color: muted, fontSize: '0.9em', paddingTop: '0.15em' }}>
              {formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
            </div>
            <div>
              <div style={{ fontWeight: strong, color }}>{degreeLine(item)}</div>
              <div style={{ color: accentText, fontWeight: secondaryWeight }}>
                {[item.institution, item.location].filter(Boolean).join(' · ')}
              </div>
              {item.grade ? (
                <div style={{ color: muted, marginTop: '0.1em' }}>{item.grade}</div>
              ) : null}
              {item.description ? (
                <div style={{ color: muted, marginTop: '0.2em' }}>
                  <RichText text={item.description} markerColor={accentText} />
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ marginTop: index === 0 ? 0 : `${gap * 0.55}em` }}
          >
            <span style={{ fontWeight: strong, color }}>{degreeLine(item)}</span>
            {item.institution ? <span style={{ color: muted }}> — {item.institution}</span> : null}
            <span style={{ color: muted }}>
              {' '}
              ({formatDateRange(item.startDate, item.endDate, item.current, 'year-only')})
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="cv-block" style={{ marginTop: index === 0 ? 0 : `${gap}em` }}>
          <EntryHead
            c={c}
            surface={surface}
            primary={degreeLine(item)}
            secondary={item.institution}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
            metaSecondary={item.location || undefined}
            color={color}
            muted={muted}
            accent={accent}
          />
          {item.grade ? (
            <div style={{ color: muted, marginTop: '0.15em' }}>{item.grade}</div>
          ) : null}
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.2em' }}>
              <RichText text={item.description} markerColor={accentText} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export function SkillsContent(props: PartProps & { columns?: number; display?: string }) {
  const { cv, c, accent, columns = 2 } = props;
  const { surface, color, muted, gap, strong } = useTone(props);
  const display = props.display ?? c.skillDisplay;
  const items = cv.skills.filter((item) => item.name);
  if (items.length === 0) return null;

  const grouped = groupSkillsByCategory(items);
  const hasCategories = grouped.length > 1 || (grouped[0]?.category ?? 'General') !== 'General';

  if (display === 'tags') {
    if (hasCategories) {
      return (
        <div>
          {grouped.map((group, index) => (
            <div
              key={group.category}
              className="cv-block"
              style={{ marginTop: index === 0 ? 0 : `${gap * 0.6}em` }}
            >
              <div style={{ fontWeight: strong, color, fontSize: '0.92em', marginBottom: '0.15em' }}>
                {group.category}
              </div>
              <Tags
                surface={surface}
                items={group.items.map((skill) => skill.name)}
                accent={accent}
                color={color}
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      <Tags
        surface={surface}
        items={items.map((skill) => skill.name)}
        accent={accent}
        color={color}
      />
    );
  }

  if (display === 'text') {
    if (hasCategories) {
      return (
        <div>
          {grouped.map((group, index) => (
            <div
              key={group.category}
              className="cv-block"
              style={{ marginTop: index === 0 ? 0 : '0.28em', display: 'flex', gap: '0.4em' }}
            >
              <span style={{ fontWeight: strong, color, whiteSpace: 'nowrap' }}>
                {group.category}:
              </span>
              <span style={{ color: muted }}>
                {group.items.map((skill) => skill.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return <span style={{ color: muted }}>{items.map((skill) => skill.name).join(' · ')}</span>;
  }

  const renderRow = (skill: CVData['skills'][number]) => (
    <div key={skill.id} className="cv-block">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.6em',
        }}
      >
        <span style={{ color }}>{skill.name}</span>
        {display === 'dots' ? (
          <LevelDots surface={surface} filled={skillDots(skill.level)} accent={accent} />
        ) : (
          <span style={{ color: muted, fontSize: '0.82em' }}>{skillLabel(skill.level)}</span>
        )}
      </div>
      {display === 'bars' ? (
        <div style={{ marginTop: '0.22em' }}>
          <LevelBar surface={surface} percent={skillPercent(skill.level)} accent={accent} />
        </div>
      ) : null}
    </div>
  );

  const grid: CSSProperties =
    columns > 1
      ? {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          columnGap: '1.2em',
          rowGap: '0.5em',
        }
      : { display: 'flex', flexDirection: 'column', gap: '0.5em' };

  if (hasCategories) {
    return (
      <div>
        {grouped.map((group, index) => (
          <div key={group.category} style={{ marginTop: index === 0 ? 0 : `${gap * 0.7}em` }}>
            <div style={{ fontWeight: strong, color, fontSize: '0.92em', marginBottom: '0.3em' }}>
              {group.category}
            </div>
            <div style={grid}>{group.items.map(renderRow)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <div style={grid}>{items.map(renderRow)}</div>;
}

/* -------------------------------------------------------------------------- */
/* Languages                                                                   */
/* -------------------------------------------------------------------------- */

export function LanguagesContent(props: PartProps) {
  const { cv, accent, variant = 'stack' } = props;
  const { surface, color, muted, secondaryWeight } = useTone(props);
  const items = cv.languages.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'inline') {
    return (
      <span style={{ color: muted }}>
        {items.map((item) => `${item.name} (${languageShort(item.level)})`).join(' · ')}
      </span>
    );
  }

  if (variant === 'bars') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6em' }}>
              <span style={{ color }}>{item.name}</span>
              <span style={{ color: muted, fontSize: '0.82em' }}>{languageLabel(item.level)}</span>
            </div>
            <div style={{ marginTop: '0.2em' }}>
              <LevelBar surface={surface} percent={languagePercent(item.level)} accent={accent} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4em' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ color }}>{item.name}</span>
            <LevelDots
              surface={surface}
              filled={Math.round(languagePercent(item.level) / 20)}
              accent={accent}
            />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          columnGap: '1.2em',
          rowGap: '0.35em',
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <span style={{ color, fontWeight: secondaryWeight }}>{item.name}</span>
            <span style={{ color: muted }}> — {languageLabel(item.level)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em' }}>
      {items.map((item) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6em' }}
        >
          <span style={{ color }}>{item.name}</span>
          <span style={{ color: muted, fontSize: '0.9em' }}>{languageLabel(item.level)}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Competencies                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Areas of expertise, each with the achievements that prove it.
 *
 * The section a functional CV is built around. Where `ExperienceContent` hangs evidence off
 * an employer and a date range, this hangs it off a capability — which is the entire point
 * of the format for someone whose timeline is the weakest thing about their application.
 *
 * Three variants, because the same section has to serve three different documents. `stack`
 * is the full case, for a template where competencies *are* the CV. `grouped` sets the
 * heading beside the evidence rather than above it, which reads as a reference table and
 * suits a hybrid where the work history is still doing the persuading. `inline` drops the
 * bullets entirely and is for a sidebar, where a competency has to behave like a heading
 * with a sentence under it or it will not fit.
 */
export function CompetenciesContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, accentText, color, muted, gap, marker, strong } = useTone(props);
  const items = cv.competencies.filter(
    (item) => item.name || item.description || item.achievements.filter(Boolean).length > 0,
  );
  if (items.length === 0) return null;

  if (variant === 'inline') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 0.5}em` }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <div style={{ fontWeight: strong, color: accentText }}>{item.name}</div>
            {item.description ? (
              <div style={{ color: muted, fontSize: '0.92em', marginTop: '0.1em' }}>
                {item.description}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grouped') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${gap * 0.7}em` }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(7.5em, 11em) 1fr',
              gap: '0 1.1em',
              alignItems: 'start',
            }}
          >
            <div style={{ fontWeight: strong, color: accentText, lineHeight: 1.3 }}>
              {item.name}
            </div>
            <div style={{ minWidth: 0 }}>
              {item.description ? <div style={{ color }}>{item.description}</div> : null}
              {item.achievements.filter(Boolean).length > 0 ? (
                <Bullets
                  items={item.achievements.filter(Boolean)}
                  color={color}
                  marker={marker}
                  markerColor={accentText}
                  style={{ marginTop: item.description ? '0.25em' : 0 }}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * 0.85}em` }}
        >
          <EntryHead
            c={c}
            surface={surface}
            primary={item.name}
            color={color}
            muted={muted}
            accent={accent}
            layout="stacked"
            primarySize={1.04}
            accentTarget="primary"
          />
          {item.description ? (
            <div style={{ color, marginTop: '0.15em' }}>{item.description}</div>
          ) : null}
          {item.achievements.filter(Boolean).length > 0 ? (
            <Bullets
              items={item.achievements.filter(Boolean)}
              color={color}
              marker={marker}
              markerColor={accentText}
              style={{ marginTop: '0.25em' }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export function ProjectsContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, accentText, color, muted, gap, rule, marker, showTags, strong } = useTone(props);
  const items = cv.projects.filter((item) => item.name || item.description);
  if (items.length === 0) return null;

  if (variant === 'cards') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.7em',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="cv-block"
            style={{
              border: `1px solid ${rule}`,
              borderRadius: 4,
              padding: '0.55em 0.7em',
            }}
          >
            <div style={{ fontWeight: strong, color }}>{item.name}</div>
            {item.role ? (
              <div style={{ color: accentText, fontSize: '0.9em' }}>{item.role}</div>
            ) : null}
            {item.description ? (
              <p style={{ color: muted, marginTop: '0.25em' }}>{item.description}</p>
            ) : null}
            {showTags && item.tags.length > 0 ? (
              <Tags
                surface={surface}
                items={item.tags}
                accent={accent}
                variant="outline"
                color={muted}
              />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="cv-block"
            style={{ marginTop: index === 0 ? 0 : `${gap * 0.6}em` }}
          >
            <span style={{ fontWeight: strong, color }}>{item.name}</span>
            {item.url ? <span style={{ color: accentText }}> · {prettyUrl(item.url)}</span> : null}
            {item.description ? (
              <div style={{ color: muted, marginTop: '0.1em' }}>{item.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="cv-block" style={{ marginTop: index === 0 ? 0 : `${gap}em` }}>
          <EntryHead
            c={c}
            surface={surface}
            primary={item.name}
            secondary={item.role || undefined}
            meta={
              formatDateRange(item.startDate, item.endDate, false, c.dateFormat, cv.language) ||
              (item.url ? prettyUrl(item.url) : undefined)
            }
            color={color}
            muted={muted}
            accent={accent}
          />
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.25em' }}>
              <RichText text={item.description} marker={marker} markerColor={accentText} />
            </div>
          ) : null}
          {item.highlights.filter(Boolean).length > 0 ? (
            <Bullets
              items={item.highlights.filter(Boolean)}
              color={color}
              marker={marker}
              markerColor={accentText}
              style={{ marginTop: '0.25em' }}
            />
          ) : null}
          {showTags && item.tags.filter(Boolean).length > 0 ? (
            <Tags
              surface={surface}
              items={item.tags.filter(Boolean)}
              accent={accent}
              color={color}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Certifications / awards / volunteer / publications / interests / references */
/* -------------------------------------------------------------------------- */

export function CertificationsContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, color, muted, gap, secondaryWeight, strong } = useTone(props);
  const items = cv.certifications.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <div style={{ fontWeight: strong, color }}>{item.name}</div>
            <div style={{ color: muted, fontSize: '0.9em', fontWeight: secondaryWeight }}>
              {[item.issuer, formatPartialDate(item.date, c.dateFormat, cv.language)]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * 0.65}em` }}
        >
          <EntryHead
            c={c}
            surface={surface}
            primary={item.name}
            secondary={item.issuer || undefined}
            meta={formatPartialDate(item.date, c.dateFormat, cv.language)}
            color={color}
            muted={muted}
            accent={accent}
            primarySize={1}
            secondaryWeight={secondaryWeight}
          />
          {item.credentialId ? (
            <div style={{ color: muted, fontSize: '0.88em', marginTop: '0.1em' }}>
              Credential ID {item.credentialId}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AwardsContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, color, muted, gap, secondaryWeight } = useTone(props);
  const items = cv.awards.filter((item) => item.title);
  if (items.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <span style={{ fontWeight: secondaryWeight, color }}>{item.title}</span>
            <span style={{ color: muted }}>
              {[item.issuer, formatPartialDate(item.date, 'year-only')].filter(Boolean).length > 0
                ? ` — ${[item.issuer, formatPartialDate(item.date, 'year-only')].filter(Boolean).join(', ')}`
                : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * 0.65}em` }}
        >
          <EntryHead
            c={c}
            surface={surface}
            primary={item.title}
            secondary={item.issuer || undefined}
            meta={formatPartialDate(item.date, c.dateFormat, cv.language)}
            color={color}
            muted={muted}
            accent={accent}
            primarySize={1}
          />
          {item.description ? (
            <p style={{ color: muted, marginTop: '0.15em' }}>{item.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function VolunteerContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { surface, accentText, color, muted, gap } = useTone(props);
  const items = cv.volunteer.filter((item) => item.role || item.organization);
  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * (variant === 'compact' ? 0.6 : 1)}em` }}
        >
          <EntryHead
            c={c}
            surface={surface}
            primary={item.role}
            secondary={[item.organization, item.location].filter(Boolean).join(' · ')}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat, cv.language)}
            color={color}
            muted={muted}
            accent={accent}
            primarySize={variant === 'compact' ? 1 : 1.04}
            layout={variant === 'compact' ? 'inline' : 'split'}
          />
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.2em' }}>
              <RichText text={item.description} marker={props.marker} markerColor={accentText} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PublicationsContent(props: PartProps) {
  const { cv, c, variant = 'stack' } = props;
  const { accentText, color, muted, gap, strong } = useTone(props);
  const items = cv.publications.filter((item) => item.title);
  if (items.length === 0) return null;

  if (variant === 'numbered') {
    return (
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, counterReset: 'none' }}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className="cv-block"
            style={{
              display: 'grid',
              gridTemplateColumns: '2.1em 1fr',
              marginTop: index === 0 ? 0 : `${gap * 0.6}em`,
            }}
          >
            <span style={{ color: accentText, fontWeight: strong }}>{index + 1}.</span>
            <span>
              <span style={{ fontWeight: strong, color }}>{item.title}</span>
              <span style={{ color: muted }}>
                {[item.authors, item.publisher, formatPartialDate(item.date, c.dateFormat, cv.language)]
                  .filter(Boolean)
                  .map((part) => ` · ${part}`)
                  .join('')}
              </span>
              {item.description ? (
                <div style={{ color: muted, marginTop: '0.1em' }}>{item.description}</div>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * 0.65}em` }}
        >
          <div style={{ fontWeight: strong, color }}>{item.title}</div>
          <div style={{ color: muted, fontSize: '0.92em' }}>
            {[item.authors, item.publisher, formatPartialDate(item.date, c.dateFormat, cv.language)]
              .filter(Boolean)
              .join(' · ')}
          </div>
          {item.description && variant !== 'compact' ? (
            <p style={{ color: muted, marginTop: '0.15em' }}>{item.description}</p>
          ) : null}
          {item.url ? (
            <div style={{ color: accentText, fontSize: '0.9em', marginTop: '0.1em' }}>
              {prettyUrl(item.url)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function InterestsContent(props: PartProps) {
  const { cv, accent, variant = 'inline' } = props;
  const { surface, color, muted, secondaryWeight } = useTone(props);
  const items = cv.interests.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'tags') {
    return (
      <Tags
        surface={surface}
        items={items.map((item) => item.name)}
        accent={accent}
        color={color}
      />
    );
  }

  if (variant === 'stack') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <span style={{ color, fontWeight: secondaryWeight }}>{item.name}</span>
            {item.description ? <span style={{ color: muted }}> — {item.description}</span> : null}
          </div>
        ))}
      </div>
    );
  }

  return <span style={{ color: muted }}>{items.map((item) => item.name).join(' · ')}</span>;
}

export function ReferencesContent(props: PartProps) {
  const { cv, variant = 'stack' } = props;
  const { accentText, color, muted, gap, strong } = useTone(props);
  const items = cv.references.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'grid') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '0.7em',
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <div style={{ fontWeight: strong, color }}>{item.name}</div>
            <div style={{ color: muted, fontSize: '0.92em' }}>
              {[item.role, item.company].filter(Boolean).join(', ')}
            </div>
            <div style={{ color: accentText, fontSize: '0.9em' }}>
              {[item.email, item.phone].filter(Boolean).join(' · ')}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="cv-block"
          style={{ marginTop: index === 0 ? 0 : `${gap * 0.6}em` }}
        >
          <div style={{ fontWeight: strong, color }}>{item.name}</div>
          <div style={{ color: muted, fontSize: '0.92em' }}>
            {[item.role, item.company, item.relationship].filter(Boolean).join(' · ')}
          </div>
          <div style={{ color: muted, fontSize: '0.9em' }}>
            {[item.email, item.phone].filter(Boolean).join(' · ')}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CustomSectionContent(props: PartProps & { sectionId: string }) {
  const { cv, c, accent, sectionId } = props;
  const { surface, accentText, color, muted, gap } = useTone(props);
  const section = cv.customSections.find((entry) => entry.id === customSectionKey(sectionId));
  const items = section?.items.filter((item) => item.heading || item.description) ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="cv-block" style={{ marginTop: index === 0 ? 0 : `${gap}em` }}>
          <EntryHead
            c={c}
            surface={surface}
            primary={item.heading}
            secondary={item.subheading || undefined}
            meta={item.date || undefined}
            color={color}
            muted={muted}
            accent={accent}
            primarySize={1.02}
          />
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.2em' }}>
              <RichText text={item.description} markerColor={accentText} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                     */
/* -------------------------------------------------------------------------- */

export function SummaryContent(props: PartProps & { align?: 'left' | 'justify' | 'center' }) {
  const { cv, align = 'left' } = props;
  const { accentText, color, muted, marker } = useTone(props);
  if (!cv.summary.trim()) return null;
  return (
    <div style={{ color: muted === DEFAULT_MUTED ? color : muted, textAlign: align }}>
      <RichText text={cv.summary} marker={marker} markerColor={accentText} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                  */
/* -------------------------------------------------------------------------- */

export interface SectionContentProps extends PartProps {
  sectionId: string;
  /** Per-section variant overrides, keyed by section id. */
  variants?: Partial<Record<BuiltInSectionId | 'custom', string>>;
  skillColumns?: number;
  skillDisplay?: string;
}

/**
 * Renders the body of any section by id. Templates use this inside their own
 * section chrome so that adding a new section type is a one-file change.
 */
export function SectionContent(props: SectionContentProps): ReactNode {
  const { sectionId, variants, skillColumns, skillDisplay, ...rest } = props;

  if (isCustomSectionId(sectionId)) {
    return (
      <CustomSectionContent
        {...rest}
        sectionId={sectionId}
        variant={variants?.custom ?? rest.variant}
      />
    );
  }

  const id = sectionId as BuiltInSectionId;
  const variant = variants?.[id] ?? rest.variant;

  switch (id) {
    case 'summary':
      return <SummaryContent {...rest} variant={variant} />;
    case 'competencies':
      return <CompetenciesContent {...rest} variant={variant} />;
    case 'experience':
      return <ExperienceContent {...rest} variant={variant} />;
    case 'education':
      return <EducationContent {...rest} variant={variant} />;
    case 'skills':
      return (
        <SkillsContent {...rest} variant={variant} columns={skillColumns} display={skillDisplay} />
      );
    case 'languages':
      return <LanguagesContent {...rest} variant={variant} />;
    case 'projects':
      return <ProjectsContent {...rest} variant={variant} />;
    case 'certifications':
      return <CertificationsContent {...rest} variant={variant} />;
    case 'awards':
      return <AwardsContent {...rest} variant={variant} />;
    case 'volunteer':
      return <VolunteerContent {...rest} variant={variant} />;
    case 'publications':
      return <PublicationsContent {...rest} variant={variant} />;
    case 'interests':
      return <InterestsContent {...rest} variant={variant} />;
    case 'references':
      return <ReferencesContent {...rest} variant={variant} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Header helpers                                                              */
/* -------------------------------------------------------------------------- */

export interface ContactEntry {
  key: string;
  label: string;
  href: string;
  icon: ContactIconKey;
}

export type ContactIconKey = 'mail' | 'phone' | 'pin' | 'globe' | 'linkedin' | 'github' | 'link';

/** Ordered, de-duplicated contact rows. Empty fields are dropped. */
export function contactEntries(cv: CVData): ContactEntry[] {
  const entries: ContactEntry[] = [];
  const { personal } = cv;

  if (personal.email)
    entries.push({
      key: 'email',
      label: personal.email,
      href: `mailto:${personal.email}`,
      icon: 'mail',
    });
  if (personal.phone)
    entries.push({
      key: 'phone',
      label: personal.phone,
      href: `tel:${personal.phone.replace(/[^\d+]/g, '')}`,
      icon: 'phone',
    });
  if (personal.location)
    entries.push({ key: 'location', label: personal.location, href: '', icon: 'pin' });
  if (personal.website)
    entries.push({
      key: 'website',
      label: prettyUrl(personal.website),
      href: ensureProtocol(personal.website),
      icon: 'globe',
    });
  if (personal.linkedin)
    entries.push({
      key: 'linkedin',
      label: prettyUrl(personal.linkedin),
      href: ensureProtocol(personal.linkedin),
      icon: 'linkedin',
    });
  if (personal.github)
    entries.push({
      key: 'github',
      label: prettyUrl(personal.github),
      href: ensureProtocol(personal.github),
      icon: 'github',
    });
  for (const link of personal.links) {
    if (!link.url) continue;
    entries.push({
      key: link.id,
      label: link.label || prettyUrl(link.url),
      href: ensureProtocol(link.url),
      icon: 'link',
    });
  }

  return entries;
}

/**
 * Inline SVG icons.
 *
 * Deliberately not `lucide-react`: the print/PDF renderer must not depend on a
 * client component tree, and these five paths keep the document bundle tiny.
 */
export function ContactIcon({
  name,
  size = '1em',
  color = 'currentColor',
}: {
  name: ContactIconKey;
  size?: string | number;
  color?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    style: { flexShrink: 0, display: 'block' },
  };

  switch (name) {
    case 'mail':
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 6 10-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'github':
      return (
        <svg {...common}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-1-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8a5 5 0 0 0-.1-3.7s-1.2-.3-4 1.5a13.4 13.4 0 0 0-7 0C6 .8 4.8 1.1 4.8 1.1a5 5 0 0 0-.1 3.7 5.4 5.4 0 0 0-1.4 3.7c0 5.5 3.3 6.7 6.4 7a3.4 3.4 0 0 0-1 2.6V22" />
        </svg>
      );
    case 'link':
    default:
      return (
        <svg {...common}>
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </svg>
      );
  }
}

/** Contact row list used by most headers. */
export function ContactList({
  cv,
  accent,
  color,
  surface = WHITE,
  icons = true,
  layout = 'inline',
  separator = '  •  ',
  iconColor,
  gap = '0.75em',
  fontSize = '0.94em',
}: {
  cv: CVData;
  accent: string;
  color?: string;
  /** The panel or band behind the list; `color` is measured against it. */
  surface?: string;
  icons?: boolean;
  layout?: 'inline' | 'stack' | 'grid';
  separator?: string;
  iconColor?: string;
  gap?: string;
  fontSize?: string;
}) {
  const entries = contactEntries(cv);
  if (entries.length === 0) return null;
  color = color ? contrastAgainst(color, surface) : color;

  if (!icons && layout === 'inline') {
    return (
      <div style={{ color, fontSize }}>{entries.map((entry) => entry.label).join(separator)}</div>
    );
  }

  const containerStyle: CSSProperties =
    layout === 'stack'
      ? { display: 'flex', flexDirection: 'column', gap: '0.32em' }
      : layout === 'grid'
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: '1em',
            rowGap: '0.3em',
          }
        : { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap };

  return (
    <div style={{ ...containerStyle, color, fontSize }}>
      {entries.map((entry) => (
        <span
          key={entry.key}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4em', minWidth: 0 }}
        >
          {icons ? <ContactIcon name={entry.icon} size="1em" color={iconColor ?? accent} /> : null}
          {entry.href ? (
            <a href={entry.href} style={{ color: 'inherit' }}>
              {entry.label}
            </a>
          ) : (
            <span>{entry.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Photo frame honouring the `showPhoto` / `photoShape` controls. */
export function Photo({
  cv,
  c,
  size = 96,
  border,
  borderWidth = 3,
  fallbackBackground,
  fallbackColor,
}: {
  cv: CVData;
  c: CVCustomization;
  size?: number;
  border?: string;
  borderWidth?: number;
  fallbackBackground?: string;
  /** Defaults to whichever of white or ink is legible on `fallbackBackground`. */
  fallbackColor?: string;
}) {
  if (!c.showPhoto) return null;

  const radius = c.photoShape === 'circle' ? '50%' : c.photoShape === 'rounded' ? 8 : 0;
  const name = `${cv.personal.firstName} ${cv.personal.lastName}`.trim();
  /*
   * Four templates fill this circle with the accent and never said what colour the initials
   * should be, so they got white — "AE" at 2.15:1 on amber. The initials are the fallback a
   * user sees before they upload a photo, which makes them the first thing on the page for
   * anyone who never does.
   */
  const plate = fallbackBackground ?? '#e6e9ef';
  const initialsColour = fallbackColor ?? readableOn(plate);

  const frameStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: 'hidden',
    flexShrink: 0,
    border: border ? `${borderWidth}px solid ${border}` : undefined,
    background: plate,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (!cv.personal.photoUrl) {
    const letters =
      `${cv.personal.firstName.trim()[0] ?? ''}${cv.personal.lastName.trim()[0] ?? ''}`.toUpperCase();
    return (
      <div style={frameStyle} aria-hidden={!letters}>
        <span
          style={{
            fontSize: size * 0.34,
            fontWeight: bodyWeight(c, 700),
            color: initialsColour,
            letterSpacing: '0.02em',
          }}
        >
          {letters}
        </span>
      </div>
    );
  }

  return (
    <div style={frameStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cv.personal.photoUrl}
        alt={photoAlt(name ?? '', cv.language)}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
