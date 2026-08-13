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
  bulletLines,
  ensureProtocol,
  formatDateRange,
  formatDuration,
  formatPartialDate,
  groupSkillsByCategory,
  languageLabel,
  languagePercent,
  languageShort,
  paragraphs,
  prettyUrl,
  skillDots,
  skillLabel,
  skillPercent,
  tint,
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

function useTone(props: PartProps) {
  return {
    color: props.color ?? 'inherit',
    muted: props.muted ?? DEFAULT_MUTED,
    rule: props.rule ?? DEFAULT_RULE,
    gap: props.gap ?? 0.95,
    marker: props.marker ?? '\u2022',
    showTags: props.showTags ?? true,
    secondaryWeight: props.strongSecondary ? 700 : 600,
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
}: {
  items: string[];
  accent: string;
  variant?: 'pill' | 'outline' | 'plain' | 'square';
  color?: string;
}) {
  if (items.length === 0) return null;

  if (variant === 'plain') {
    return (
      <span style={{ color: color ?? 'inherit', fontSize: '0.92em' }}>{items.join(' · ')}</span>
    );
  }

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
            background: variant === 'outline' ? 'transparent' : tint(accent, 0.86),
            border: variant === 'outline' ? `1px solid ${tint(accent, 0.55)}` : '1px solid transparent',
            color: variant === 'outline' ? color ?? 'inherit' : accent,
            whiteSpace: 'nowrap',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function LevelBar({
  percent,
  accent,
  track,
  height = 5,
  radius = 999,
}: {
  percent: number;
  accent: string;
  track?: string;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: track ?? tint(accent, 0.8),
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, percent))}%`,
          background: accent,
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
  size = 6,
}: {
  filled: number;
  total?: number;
  accent: string;
  empty?: string;
  size?: number;
}) {
  return (
    <div style={{ display: 'flex', gap: size * 0.55, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: index < filled ? accent : (empty ?? tint(accent, 0.78)),
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

/** Two-line entry head used by most "stack" style templates. */
export function EntryHead({
  primary,
  secondary,
  meta,
  metaSecondary,
  color,
  muted,
  accent,
  layout = 'split',
  primarySize = 1.06,
  secondaryWeight = 600,
  accentTarget = 'secondary',
}: {
  primary: string;
  secondary?: string;
  meta?: string;
  metaSecondary?: string;
  color?: string;
  muted?: string;
  accent: string;
  layout?: 'split' | 'stacked' | 'inline';
  primarySize?: number;
  secondaryWeight?: number;
  accentTarget?: 'primary' | 'secondary' | 'none';
}) {
  const primaryColor = accentTarget === 'primary' ? accent : color;
  const secondaryColor = accentTarget === 'secondary' ? accent : (muted ?? color);

  const titleBlock = (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: `${primarySize}em`, fontWeight: 700, color: primaryColor }}>
        {primary}
      </div>
      {secondary ? (
        <div style={{ fontWeight: secondaryWeight, color: secondaryColor, marginTop: '0.05em' }}>
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
        <span style={{ fontSize: `${primarySize}em`, fontWeight: 700, color: primaryColor }}>
          {primary}
        </span>
        {secondary ? (
          <span style={{ fontWeight: secondaryWeight, color: secondaryColor }}>· {secondary}</span>
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
  const { color, muted, rule, gap, marker, showTags, secondaryWeight } = useTone(props);
  const items = cv.experience.filter((item) => item.role || item.company || item.description);
  if (items.length === 0) return null;

  if (variant === 'timeline') {
    return (
      <div style={{ position: 'relative', paddingLeft: '1.35em' }}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: '0.31em',
            top: '0.45em',
            bottom: '0.3em',
            width: 1.5,
            background: tint(accent, 0.6),
          }}
        />
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
                left: '-1.35em',
                top: '0.38em',
                width: '0.62em',
                height: '0.62em',
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 0 2px #ffffff`,
              }}
            />
            <EntryHead
              primary={item.role}
              secondary={[item.company, item.location].filter(Boolean).join(' · ')}
              meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
              metaSecondary={
                showDuration ? formatDuration(item.startDate, item.endDate, item.current) : undefined
              }
              color={color}
              muted={muted}
              accent={accent}
            />
            <ExperienceBody
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
              <div>{formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}</div>
              {item.location ? (
                <div style={{ marginTop: '0.2em', opacity: 0.85 }}>{item.location}</div>
              ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.06em', fontWeight: 700, color }}>{item.role}</div>
              {item.company ? (
                <div style={{ fontWeight: 600, color: accent, marginTop: '0.05em' }}>
                  {item.company}
                </div>
              ) : null}
              <ExperienceBody
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
              primary={item.role}
              secondary={item.company}
              meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
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
                markerColor={accent}
                marker={props.marker ?? '\u2013'}
                style={{ marginTop: '0.25em' }}
              />
            ) : null}
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
            <div style={{ fontWeight: 700, color }}>
              {item.role}
              {item.company ? `, ${item.company}` : ''}
            </div>
            <div style={{ color: muted, fontSize: '0.92em', marginTop: '0.1em' }}>
              {[
                formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat),
                item.location,
              ]
                .filter(Boolean)
                .join(' | ')}
            </div>
            <ExperienceBody
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
            primary={item.role}
            secondary={item.company}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
            metaSecondary={item.location || undefined}
            color={color}
            muted={muted}
            accent={accent}
            secondaryWeight={secondaryWeight}
          />
          <ExperienceBody
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

function ExperienceBody({
  item,
  color,
  accent,
  muted,
  marker = '\u2022',
  showTags = true,
}: {
  item: CVData['experience'][number];
  color?: string;
  accent: string;
  muted?: string;
  marker?: string;
  showTags?: boolean;
}) {
  const hasDescription = item.description.trim().length > 0;
  const hasAchievements = item.achievements.filter(Boolean).length > 0;
  const hasTags = showTags && item.tags.filter(Boolean).length > 0;
  if (!hasDescription && !hasAchievements && !hasTags) return null;

  return (
    <div style={{ marginTop: '0.32em' }}>
      {hasDescription ? (
        <div style={{ color: muted }}>
          <RichText text={item.description} marker={marker} markerColor={accent} />
        </div>
      ) : null}
      {hasAchievements ? (
        <Bullets
          items={item.achievements.filter(Boolean)}
          color={color}
          marker={marker}
          markerColor={accent}
          style={{ marginTop: hasDescription ? '0.3em' : 0 }}
        />
      ) : null}
      {hasTags ? <Tags items={item.tags.filter(Boolean)} accent={accent} color={color} /> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Education                                                                   */
/* -------------------------------------------------------------------------- */

export function EducationContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { color, muted, gap } = useTone(props);
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
            <div style={{ fontWeight: 700, color }}>{degreeLine(item)}</div>
            <div style={{ color: accent, fontWeight: 600 }}>{item.institution}</div>
            <div style={{ color: muted, fontSize: '0.9em', marginTop: '0.05em' }}>
              {[
                formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat),
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
              {formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color }}>{degreeLine(item)}</div>
              <div style={{ color: accent, fontWeight: 600 }}>
                {[item.institution, item.location].filter(Boolean).join(' · ')}
              </div>
              {item.grade ? (
                <div style={{ color: muted, marginTop: '0.1em' }}>{item.grade}</div>
              ) : null}
              {item.description ? (
                <div style={{ color: muted, marginTop: '0.2em' }}>
                  <RichText text={item.description} markerColor={accent} />
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
            <span style={{ fontWeight: 700, color }}>{degreeLine(item)}</span>
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
            primary={degreeLine(item)}
            secondary={item.institution}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
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
              <RichText text={item.description} markerColor={accent} />
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
  const { color, muted, gap } = useTone(props);
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
              <div style={{ fontWeight: 700, color, fontSize: '0.92em', marginBottom: '0.15em' }}>
                {group.category}
              </div>
              <Tags items={group.items.map((skill) => skill.name)} accent={accent} color={color} />
            </div>
          ))}
        </div>
      );
    }
    return <Tags items={items.map((skill) => skill.name)} accent={accent} color={color} />;
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
              <span style={{ fontWeight: 700, color, whiteSpace: 'nowrap' }}>
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
          <LevelDots filled={skillDots(skill.level)} accent={accent} />
        ) : (
          <span style={{ color: muted, fontSize: '0.82em' }}>{skillLabel(skill.level)}</span>
        )}
      </div>
      {display === 'bars' ? (
        <div style={{ marginTop: '0.22em' }}>
          <LevelBar percent={skillPercent(skill.level)} accent={accent} />
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
            <div style={{ fontWeight: 700, color, fontSize: '0.92em', marginBottom: '0.3em' }}>
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
  const { color, muted } = useTone(props);
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
              <LevelBar percent={languagePercent(item.level)} accent={accent} />
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
            <LevelDots filled={Math.round(languagePercent(item.level) / 20)} accent={accent} />
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
            <span style={{ color, fontWeight: 600 }}>{item.name}</span>
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
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export function ProjectsContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { color, muted, gap, rule, marker, showTags } = useTone(props);
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
            <div style={{ fontWeight: 700, color }}>{item.name}</div>
            {item.role ? (
              <div style={{ color: accent, fontSize: '0.9em' }}>{item.role}</div>
            ) : null}
            {item.description ? (
              <p style={{ color: muted, marginTop: '0.25em' }}>{item.description}</p>
            ) : null}
            {showTags && item.tags.length > 0 ? (
              <Tags items={item.tags} accent={accent} variant="outline" color={muted} />
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
            <span style={{ fontWeight: 700, color }}>{item.name}</span>
            {item.url ? <span style={{ color: accent }}> · {prettyUrl(item.url)}</span> : null}
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
            primary={item.name}
            secondary={item.role || undefined}
            meta={
              formatDateRange(item.startDate, item.endDate, false, c.dateFormat) ||
              (item.url ? prettyUrl(item.url) : undefined)
            }
            color={color}
            muted={muted}
            accent={accent}
          />
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.25em' }}>
              <RichText text={item.description} marker={marker} markerColor={accent} />
            </div>
          ) : null}
          {item.highlights.filter(Boolean).length > 0 ? (
            <Bullets
              items={item.highlights.filter(Boolean)}
              color={color}
              marker={marker}
              markerColor={accent}
              style={{ marginTop: '0.25em' }}
            />
          ) : null}
          {showTags && item.tags.filter(Boolean).length > 0 ? (
            <Tags items={item.tags.filter(Boolean)} accent={accent} color={color} />
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
  const { color, muted, gap, secondaryWeight } = useTone(props);
  const items = cv.certifications.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <div style={{ fontWeight: 700, color }}>{item.name}</div>
            <div style={{ color: muted, fontSize: '0.9em', fontWeight: secondaryWeight }}>
              {[item.issuer, formatPartialDate(item.date, c.dateFormat)].filter(Boolean).join(' · ')}
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
            primary={item.name}
            secondary={item.issuer || undefined}
            meta={formatPartialDate(item.date, c.dateFormat)}
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
  const { color, muted, gap } = useTone(props);
  const items = cv.awards.filter((item) => item.title);
  if (items.length === 0) return null;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <span style={{ fontWeight: 600, color }}>{item.title}</span>
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
            primary={item.title}
            secondary={item.issuer || undefined}
            meta={formatPartialDate(item.date, c.dateFormat)}
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
  const { color, muted, gap } = useTone(props);
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
            primary={item.role}
            secondary={[item.organization, item.location].filter(Boolean).join(' · ')}
            meta={formatDateRange(item.startDate, item.endDate, item.current, c.dateFormat)}
            color={color}
            muted={muted}
            accent={accent}
            primarySize={variant === 'compact' ? 1 : 1.04}
            layout={variant === 'compact' ? 'inline' : 'split'}
          />
          {item.description ? (
            <div style={{ color: muted, marginTop: '0.2em' }}>
              <RichText text={item.description} marker={props.marker} markerColor={accent} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PublicationsContent(props: PartProps) {
  const { cv, c, accent, variant = 'stack' } = props;
  const { color, muted, gap } = useTone(props);
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
            <span style={{ color: accent, fontWeight: 700 }}>{index + 1}.</span>
            <span>
              <span style={{ fontWeight: 700, color }}>{item.title}</span>
              <span style={{ color: muted }}>
                {[item.authors, item.publisher, formatPartialDate(item.date, c.dateFormat)]
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
          <div style={{ fontWeight: 700, color }}>{item.title}</div>
          <div style={{ color: muted, fontSize: '0.92em' }}>
            {[item.authors, item.publisher, formatPartialDate(item.date, c.dateFormat)]
              .filter(Boolean)
              .join(' · ')}
          </div>
          {item.description && variant !== 'compact' ? (
            <p style={{ color: muted, marginTop: '0.15em' }}>{item.description}</p>
          ) : null}
          {item.url ? (
            <div style={{ color: accent, fontSize: '0.9em', marginTop: '0.1em' }}>
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
  const { color, muted } = useTone(props);
  const items = cv.interests.filter((item) => item.name);
  if (items.length === 0) return null;

  if (variant === 'tags') {
    return <Tags items={items.map((item) => item.name)} accent={accent} color={color} />;
  }

  if (variant === 'stack') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25em' }}>
        {items.map((item) => (
          <div key={item.id} className="cv-block">
            <span style={{ color, fontWeight: 600 }}>{item.name}</span>
            {item.description ? <span style={{ color: muted }}> — {item.description}</span> : null}
          </div>
        ))}
      </div>
    );
  }

  return <span style={{ color: muted }}>{items.map((item) => item.name).join(' · ')}</span>;
}

export function ReferencesContent(props: PartProps) {
  const { cv, accent, variant = 'stack' } = props;
  const { color, muted, gap } = useTone(props);
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
            <div style={{ fontWeight: 700, color }}>{item.name}</div>
            <div style={{ color: muted, fontSize: '0.92em' }}>
              {[item.role, item.company].filter(Boolean).join(', ')}
            </div>
            <div style={{ color: accent, fontSize: '0.9em' }}>
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
          <div style={{ fontWeight: 700, color }}>{item.name}</div>
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
  const { cv, accent, sectionId } = props;
  const { color, muted, gap } = useTone(props);
  const section = cv.customSections.find((entry) => entry.id === customSectionKey(sectionId));
  const items = section?.items.filter((item) => item.heading || item.description) ?? [];
  if (items.length === 0) return null;

  return (
    <div>
      {items.map((item, index) => (
        <div key={item.id} className="cv-block" style={{ marginTop: index === 0 ? 0 : `${gap}em` }}>
          <EntryHead
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
              <RichText text={item.description} markerColor={accent} />
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
  const { cv, align = 'left', accent } = props;
  const { color, muted, marker } = useTone(props);
  if (!cv.summary.trim()) return null;
  return (
    <div style={{ color: muted === DEFAULT_MUTED ? color : muted, textAlign: align }}>
      <RichText text={cv.summary} marker={marker} markerColor={accent} />
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
      <CustomSectionContent {...rest} sectionId={sectionId} variant={variants?.custom ?? rest.variant} />
    );
  }

  const id = sectionId as BuiltInSectionId;
  const variant = variants?.[id] ?? rest.variant;

  switch (id) {
    case 'summary':
      return <SummaryContent {...rest} variant={variant} />;
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

export type ContactIconKey =
  | 'mail'
  | 'phone'
  | 'pin'
  | 'globe'
  | 'linkedin'
  | 'github'
  | 'link';

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
  icons?: boolean;
  layout?: 'inline' | 'stack' | 'grid';
  separator?: string;
  iconColor?: string;
  gap?: string;
  fontSize?: string;
}) {
  const entries = contactEntries(cv);
  if (entries.length === 0) return null;

  if (!icons && layout === 'inline') {
    return (
      <div style={{ color, fontSize }}>
        {entries.map((entry) => entry.label).join(separator)}
      </div>
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
          {icons ? (
            <ContactIcon name={entry.icon} size="1em" color={iconColor ?? accent} />
          ) : null}
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
  fallbackColor = '#ffffff',
}: {
  cv: CVData;
  c: CVCustomization;
  size?: number;
  border?: string;
  borderWidth?: number;
  fallbackBackground?: string;
  fallbackColor?: string;
}) {
  if (!c.showPhoto) return null;

  const radius = c.photoShape === 'circle' ? '50%' : c.photoShape === 'rounded' ? 8 : 0;
  const name = `${cv.personal.firstName} ${cv.personal.lastName}`.trim();

  const frameStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    overflow: 'hidden',
    flexShrink: 0,
    border: border ? `${borderWidth}px solid ${border}` : undefined,
    background: fallbackBackground ?? '#e6e9ef',
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
            fontWeight: 700,
            color: fallbackColor,
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
        alt={name ? `${name} profile photo` : 'Profile photo'}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}
