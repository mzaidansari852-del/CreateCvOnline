'use client';

import type { ReactNode } from 'react';

import { PhotoField } from './PhotoField';
import { RepeatableList, StringList } from './RepeatableList';
import { useCopy } from '@/components/i18n/LocaleProvider';
import { Checkbox, Field, Input, Select, Switch, Textarea } from '@/components/ui/form';
import { LANGUAGE_LEVELS, SKILL_LEVELS, fullName } from '@/lib/cv/format';
import { customSectionKey, isCustomSectionId } from '@/lib/cv/sections';
import { uid } from '@/lib/utils/id';
import type {
  BuiltInSectionId,
  CVData,
  CustomSection,
  LanguageLevel,
  SkillLevel,
} from '@/types/cv';

/**
 * The editor's forms, one per CV section.
 *
 * Every form takes the whole `CVData` and a setter, and touches only its own slice. That
 * keeps each form independent of the others and means the section order in the sidebar —
 * which the user controls — never affects how a form behaves.
 */

export interface SectionFormProps {
  cv: CVData;
  onChange: (recipe: (current: CVData) => CVData) => void;
}

function Grid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' } as const;
  return <div className={`grid gap-4 ${cols[columns]}`}>{children}</div>;
}

/** `<input type="month">` produces exactly the `YYYY-MM` the schema expects. */
function MonthField({
  label,
  value,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          type="month"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Textarea
          id={id}
          aria-describedby={describedBy}
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/* Personal details                                                            */
/* -------------------------------------------------------------------------- */

export function PersonalForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.personal;
  const personal = cv.personal;
  const set = (patch: Partial<CVData['personal']>) =>
    onChange((current) => ({ ...current, personal: { ...current.personal, ...patch } }));

  return (
    <div className="flex flex-col gap-5">
      <Grid>
        <TextField
          label={text.firstName}
          value={personal.firstName}
          onChange={(value) => set({ firstName: value })}
          autoComplete="given-name"
        />
        <TextField
          label={text.lastName}
          value={personal.lastName}
          onChange={(value) => set({ lastName: value })}
          autoComplete="family-name"
        />
      </Grid>

      <TextField
        label={text.title}
        value={personal.title}
        onChange={(value) => set({ title: value })}
        placeholder={text.titlePlaceholder}
        hint={text.titleHint}
      />

      <Grid>
        <TextField
          label={text.email}
          type="email"
          value={personal.email}
          onChange={(value) => set({ email: value })}
          autoComplete="email"
          placeholder={text.emailPlaceholder}
        />
        <TextField
          label={text.phone}
          type="tel"
          value={personal.phone}
          onChange={(value) => set({ phone: value })}
          autoComplete="tel"
          placeholder={text.phonePlaceholder}
        />
      </Grid>

      <TextField
        label={text.location}
        value={personal.location}
        onChange={(value) => set({ location: value })}
        placeholder={text.locationPlaceholder}
        hint={text.locationHint}
      />

      <Grid>
        <TextField
          label={text.website}
          value={personal.website}
          onChange={(value) => set({ website: value })}
          placeholder={text.websitePlaceholder}
        />
        <TextField
          label={text.linkedin}
          value={personal.linkedin}
          onChange={(value) => set({ linkedin: value })}
          placeholder={text.linkedinPlaceholder}
        />
      </Grid>

      <TextField
        label={text.github}
        value={personal.github}
        onChange={(value) => set({ github: value })}
        placeholder={text.githubPlaceholder}
      />

      <PhotoField
        value={personal.photoUrl}
        onChange={(photoUrl) => set({ photoUrl })}
        initials={`${personal.firstName.trim()[0] ?? ''}${
          personal.lastName.trim()[0] ?? ''
        }`.toUpperCase()}
      />

      <TextField
        label={text.photoUrl}
        value={personal.photoUrl}
        onChange={(value) => set({ photoUrl: value })}
        placeholder="https://…"
        hint={text.photoUrlHint}
      />

      <div className="rounded-xl border border-ink-200 p-4">
        <RepeatableList
          items={personal.links}
          onChange={(links) => set({ links })}
          createItem={() => ({ id: uid(), label: '', url: '' })}
          summary={(item) => ({ title: item.label || text.linkFallback, subtitle: item.url })}
          addLabel={text.links.add}
          emptyTitle={text.links.emptyTitle}
          emptyDescription={text.links.emptyBody}
          deleteTitle={text.links.deleteTitle}
          untitledLabel={text.links.untitled}
          max={8}
        >
          {(item, update) => (
            <Grid>
              <TextField
                label={text.linkLabel}
                value={item.label}
                onChange={(value) => update({ label: value })}
                placeholder={text.linkLabelPlaceholder}
                maxLength={40}
              />
              <TextField
                label={text.linkUrl}
                value={item.url}
                onChange={(value) => update({ url: value })}
                placeholder={text.linkUrlPlaceholder}
              />
            </Grid>
          )}
        </RepeatableList>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary                                                                     */
/* -------------------------------------------------------------------------- */

export function SummaryForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.summary;
  const words = cv.summary.trim() ? cv.summary.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <AreaField
        label={text.label}
        value={cv.summary}
        onChange={(summary) => onChange((current) => ({ ...current, summary }))}
        rows={7}
        maxLength={3000}
        placeholder={text.placeholder}
        hint={text.hint}
      />
      <p className="text-xs text-ink-500">
        {text.wordCount(words)}
        {words > 0 && words < 40 ? text.tooShort : ''}
        {words > 110 ? text.tooLong : ''}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

export function ExperienceForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.experience;
  return (
    <RepeatableList
      items={cv.experience}
      onChange={(experience) => onChange((current) => ({ ...current, experience }))}
      createItem={() => ({
        id: uid(),
        role: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        achievements: [],
        tags: [],
      })}
      summary={(item) => ({
        title: item.role || item.company,
        subtitle: [item.company, item.startDate].filter(Boolean).join(' · '),
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.role}
              value={item.role}
              onChange={(value) => update({ role: value })}
              placeholder={text.rolePlaceholder}
            />
            <TextField
              label={text.company}
              value={item.company}
              onChange={(value) => update({ company: value })}
              placeholder={text.companyPlaceholder}
            />
          </Grid>

          <Grid columns={3}>
            <TextField
              label={text.location}
              value={item.location}
              onChange={(value) => update({ location: value })}
              placeholder={text.locationPlaceholder}
            />
            <MonthField
              label={text.startDate}
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label={text.endDate}
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
              hint={item.current ? text.presentHint : undefined}
            />
          </Grid>

          <Checkbox
            label={text.current}
            checked={item.current}
            onChange={(event) =>
              update({
                current: event.target.checked,
                endDate: event.target.checked ? '' : item.endDate,
              })
            }
          />

          <AreaField
            label={text.description}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={3}
            maxLength={3000}
            placeholder={text.descriptionPlaceholder}
            hint={text.descriptionHint}
          />

          <StringList
            values={item.achievements}
            onChange={(achievements) => update({ achievements })}
            label={text.achievements}
            placeholder={text.achievementPlaceholder}
            addLabel={text.addAchievement}
          />

          <TagsField
            values={item.tags}
            onChange={(tags) => update({ tags })}
            label={text.tags}
            hint={text.tagsHint}
          />
        </div>
      )}
    </RepeatableList>
  );
}

function TagsField({
  values,
  onChange,
  label,
  hint,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  label: string;
  hint?: string;
}) {
  const copy = useCopy();
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          value={values.join(', ')}
          placeholder={copy.editor.forms.experience.tagsPlaceholder}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean)
                .slice(0, 20),
            )
          }
        />
      )}
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/* Education                                                                   */
/* -------------------------------------------------------------------------- */

export function EducationForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.education;
  return (
    <RepeatableList
      items={cv.education}
      onChange={(education) => onChange((current) => ({ ...current, education }))}
      createItem={() => ({
        id: uid(),
        degree: '',
        field: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        grade: '',
        description: '',
      })}
      summary={(item) => ({
        title: [item.degree, item.field].filter(Boolean).join(', ') || item.institution,
        subtitle: item.institution,
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.degree}
              value={item.degree}
              onChange={(value) => update({ degree: value })}
              placeholder={text.degreePlaceholder}
            />
            <TextField
              label={text.field}
              value={item.field}
              onChange={(value) => update({ field: value })}
              placeholder={text.fieldPlaceholder}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.institution}
              value={item.institution}
              onChange={(value) => update({ institution: value })}
              placeholder={text.institutionPlaceholder}
            />
            <TextField
              label={text.location}
              value={item.location}
              onChange={(value) => update({ location: value })}
              placeholder={text.locationPlaceholder}
            />
          </Grid>
          <Grid columns={3}>
            <MonthField
              label={text.startDate}
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label={text.endDate}
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
            />
            <TextField
              label={text.grade}
              value={item.grade}
              onChange={(value) => update({ grade: value })}
              placeholder={text.gradePlaceholder}
            />
          </Grid>
          <Checkbox
            label={text.current}
            checked={item.current}
            onChange={(event) =>
              update({
                current: event.target.checked,
                endDate: event.target.checked ? '' : item.endDate,
              })
            }
          />
          <AreaField
            label={text.notes}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={2}
            maxLength={2000}
            placeholder={text.notesPlaceholder}
            hint={text.notesHint}
          />
        </div>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

export function SkillsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.skills;
  return (
    <RepeatableList
      items={cv.skills}
      onChange={(skills) => onChange((current) => ({ ...current, skills }))}
      createItem={() => ({ id: uid(), name: '', level: 'advanced' as SkillLevel, category: '' })}
      summary={(item) => ({
        title: item.name,
        subtitle: [item.category, SKILL_LEVELS.find((level) => level.value === item.level)?.label]
          .filter(Boolean)
          .join(' · '),
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={80}
    >
      {(item, update) => (
        <Grid columns={3}>
          <TextField
            label={text.name}
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder={text.namePlaceholder}
            maxLength={80}
          />
          <TextField
            label={text.category}
            value={item.category}
            onChange={(value) => update({ category: value })}
            placeholder={text.categoryPlaceholder}
            hint={text.categoryHint}
            maxLength={60}
          />
          <Field label={text.level}>
            {({ id }) => (
              <Select
                id={id}
                value={item.level}
                onChange={(event) => update({ level: event.target.value as SkillLevel })}
              >
                {SKILL_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Grid>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Languages                                                                   */
/* -------------------------------------------------------------------------- */

export function LanguagesForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.languages;
  return (
    <RepeatableList
      items={cv.languages}
      onChange={(languages) => onChange((current) => ({ ...current, languages }))}
      createItem={() => ({
        id: uid(),
        name: '',
        level: 'professional-working' as LanguageLevel,
      })}
      summary={(item) => ({
        title: item.name,
        subtitle: LANGUAGE_LEVELS.find((level) => level.value === item.level)?.label,
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={20}
    >
      {(item, update) => (
        <Grid>
          <TextField
            label={text.name}
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder={text.namePlaceholder}
            maxLength={60}
          />
          <Field label={text.level} hint={text.levelHint}>
            {({ id, describedBy }) => (
              <Select
                id={id}
                aria-describedby={describedBy}
                value={item.level}
                onChange={(event) => update({ level: event.target.value as LanguageLevel })}
              >
                {LANGUAGE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label} ({level.short})
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Grid>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

export function ProjectsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.projects;
  return (
    <RepeatableList
      items={cv.projects}
      onChange={(projects) => onChange((current) => ({ ...current, projects }))}
      createItem={() => ({
        id: uid(),
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        url: '',
        description: '',
        highlights: [],
        tags: [],
      })}
      summary={(item) => ({ title: item.name, subtitle: item.role || item.url })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.name}
              value={item.name}
              onChange={(value) => update({ name: value })}
              placeholder={text.namePlaceholder}
            />
            <TextField
              label={text.role}
              value={item.role}
              onChange={(value) => update({ role: value })}
              placeholder={text.rolePlaceholder}
            />
          </Grid>
          <Grid columns={3}>
            <MonthField
              label={text.start}
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label={text.end}
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
            />
            <TextField
              label={text.link}
              value={item.url}
              onChange={(value) => update({ url: value })}
              placeholder={text.linkPlaceholder}
            />
          </Grid>
          <AreaField
            label={text.description}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={3}
            maxLength={2000}
            placeholder={text.descriptionPlaceholder}
          />
          <StringList
            values={item.highlights}
            onChange={(highlights) => update({ highlights })}
            label={text.highlights}
            placeholder={text.highlightPlaceholder}
            addLabel={text.addHighlight}
            max={12}
          />
          <TagsField values={item.tags} onChange={(tags) => update({ tags })} label={text.tags} />
        </div>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Certifications, awards, volunteering, publications                          */
/* -------------------------------------------------------------------------- */

export function CertificationsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.certifications;
  return (
    <RepeatableList
      items={cv.certifications}
      onChange={(certifications) => onChange((current) => ({ ...current, certifications }))}
      createItem={() => ({
        id: uid(),
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
        url: '',
      })}
      summary={(item) => ({ title: item.name, subtitle: item.issuer })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <TextField
            label={text.name}
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder={text.namePlaceholder}
          />
          <Grid columns={3}>
            <TextField
              label={text.issuer}
              value={item.issuer}
              onChange={(value) => update({ issuer: value })}
              placeholder={text.issuerPlaceholder}
            />
            <MonthField
              label={text.issued}
              value={item.date}
              onChange={(value) => update({ date: value })}
            />
            <MonthField
              label={text.expires}
              value={item.expiryDate}
              onChange={(value) => update({ expiryDate: value })}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.credentialId}
              value={item.credentialId}
              onChange={(value) => update({ credentialId: value })}
            />
            <TextField
              label={text.verification}
              value={item.url}
              onChange={(value) => update({ url: value })}
            />
          </Grid>
        </div>
      )}
    </RepeatableList>
  );
}

export function AwardsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.awards;
  return (
    <RepeatableList
      items={cv.awards}
      onChange={(awards) => onChange((current) => ({ ...current, awards }))}
      createItem={() => ({ id: uid(), title: '', issuer: '', date: '', description: '' })}
      summary={(item) => ({ title: item.title, subtitle: item.issuer })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid columns={3}>
            <TextField
              label={text.title}
              value={item.title}
              onChange={(value) => update({ title: value })}
            />
            <TextField
              label={text.issuer}
              value={item.issuer}
              onChange={(value) => update({ issuer: value })}
            />
            <MonthField
              label={text.date}
              value={item.date}
              onChange={(value) => update({ date: value })}
            />
          </Grid>
          <AreaField
            label={text.description}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={2}
            maxLength={800}
          />
        </div>
      )}
    </RepeatableList>
  );
}

export function VolunteerForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.volunteer;
  return (
    <RepeatableList
      items={cv.volunteer}
      onChange={(volunteer) => onChange((current) => ({ ...current, volunteer }))}
      createItem={() => ({
        id: uid(),
        role: '',
        organization: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      })}
      summary={(item) => ({ title: item.role, subtitle: item.organization })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.role}
              value={item.role}
              onChange={(value) => update({ role: value })}
            />
            <TextField
              label={text.organisation}
              value={item.organization}
              onChange={(value) => update({ organization: value })}
            />
          </Grid>
          <Grid columns={3}>
            <TextField
              label={text.location}
              value={item.location}
              onChange={(value) => update({ location: value })}
            />
            <MonthField
              label={text.start}
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label={text.end}
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
            />
          </Grid>
          <Checkbox
            label={text.current}
            checked={item.current}
            onChange={(event) =>
              update({
                current: event.target.checked,
                endDate: event.target.checked ? '' : item.endDate,
              })
            }
          />
          <AreaField
            label={text.description}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={3}
            maxLength={1500}
          />
        </div>
      )}
    </RepeatableList>
  );
}

export function PublicationsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.publications;
  return (
    <RepeatableList
      items={cv.publications}
      onChange={(publications) => onChange((current) => ({ ...current, publications }))}
      createItem={() => ({
        id: uid(),
        title: '',
        publisher: '',
        date: '',
        url: '',
        authors: '',
        description: '',
      })}
      summary={(item) => ({ title: item.title, subtitle: item.publisher })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <TextField
            label={text.title}
            value={item.title}
            onChange={(value) => update({ title: value })}
          />
          <Grid columns={3}>
            <TextField
              label={text.publisher}
              value={item.publisher}
              onChange={(value) => update({ publisher: value })}
            />
            <MonthField
              label={text.date}
              value={item.date}
              onChange={(value) => update({ date: value })}
            />
            <TextField
              label={text.link}
              value={item.url}
              onChange={(value) => update({ url: value })}
            />
          </Grid>
          <TextField
            label={text.authors}
            value={item.authors}
            onChange={(value) => update({ authors: value })}
            placeholder={text.authorsPlaceholder}
          />
          <AreaField
            label={text.abstract}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={2}
            maxLength={1000}
          />
        </div>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Interests and references                                                    */
/* -------------------------------------------------------------------------- */

export function InterestsForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.interests;
  return (
    <RepeatableList
      items={cv.interests}
      onChange={(interests) => onChange((current) => ({ ...current, interests }))}
      createItem={() => ({ id: uid(), name: '', description: '' })}
      summary={(item) => ({ title: item.name, subtitle: item.description })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={20}
    >
      {(item, update) => (
        <Grid>
          <TextField
            label={text.name}
            value={item.name}
            onChange={(value) => update({ name: value })}
            maxLength={60}
          />
          <TextField
            label={text.detail}
            value={item.description}
            onChange={(value) => update({ description: value })}
            maxLength={200}
            hint={text.detailHint}
          />
        </Grid>
      )}
    </RepeatableList>
  );
}

export function ReferencesForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.references;
  return (
    <RepeatableList
      items={cv.references}
      onChange={(references) => onChange((current) => ({ ...current, references }))}
      createItem={() => ({
        id: uid(),
        name: '',
        role: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
      })}
      summary={(item) => ({
        title: item.name,
        subtitle: [item.role, item.company].filter(Boolean).join(', '),
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={10}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.name}
              value={item.name}
              onChange={(value) => update({ name: value })}
            />
            <TextField
              label={text.relationship}
              value={item.relationship}
              onChange={(value) => update({ relationship: value })}
              placeholder={text.relationshipPlaceholder}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.role}
              value={item.role}
              onChange={(value) => update({ role: value })}
            />
            <TextField
              label={text.company}
              value={item.company}
              onChange={(value) => update({ company: value })}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.email}
              type="email"
              value={item.email}
              onChange={(value) => update({ email: value })}
            />
            <TextField
              label={text.phone}
              type="tel"
              value={item.phone}
              onChange={(value) => update({ phone: value })}
            />
          </Grid>
        </div>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Custom sections                                                             */
/* -------------------------------------------------------------------------- */

export function CustomSectionForm({
  cv,
  onChange,
  sectionId,
}: SectionFormProps & { sectionId: string }) {
  const text = useCopy().editor.forms.custom;
  const key = customSectionKey(sectionId);
  const section = cv.customSections.find((entry) => entry.id === key);
  if (!section) return null;

  const setSection = (patch: Partial<CustomSection>) =>
    onChange((current) => ({
      ...current,
      customSections: current.customSections.map((entry) =>
        entry.id === key ? { ...entry, ...patch } : entry,
      ),
    }));

  return (
    <div className="flex flex-col gap-5">
      <TextField
        label={text.heading}
        value={section.title}
        onChange={(title) => {
          setSection({ title });
          onChange((current) => ({
            ...current,
            sections: current.sections.map((entry) =>
              entry.id === sectionId ? { ...entry, label: title } : entry,
            ),
          }));
        }}
        maxLength={80}
      />

      <RepeatableList
        items={section.items}
        onChange={(items) => setSection({ items })}
        createItem={() => ({ id: uid(), heading: '', subheading: '', date: '', description: '' })}
        summary={(item) => ({ title: item.heading, subtitle: item.subheading })}
        addLabel={text.list.add}
        emptyTitle={text.list.emptyTitle}
        emptyDescription={text.list.emptyBody}
        deleteTitle={text.list.deleteTitle}
        untitledLabel={text.list.untitled}
        max={30}
      >
        {(item, update) => (
          <div className="flex flex-col gap-4">
            <Grid columns={3}>
              <TextField
                label={text.entryHeading}
                value={item.heading}
                onChange={(value) => update({ heading: value })}
              />
              <TextField
                label={text.entrySubheading}
                value={item.subheading}
                onChange={(value) => update({ subheading: value })}
              />
              <TextField
                label={text.entryDate}
                value={item.date}
                onChange={(value) => update({ date: value })}
                placeholder={text.entryDatePlaceholder}
              />
            </Grid>
            <AreaField
              label={text.description}
              value={item.description}
              onChange={(value) => update({ description: value })}
              rows={3}
              maxLength={2000}
            />
          </div>
        )}
      </RepeatableList>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                  */
/* -------------------------------------------------------------------------- */

export function CompetenciesForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.competencies;
  return (
    <RepeatableList
      items={cv.competencies}
      onChange={(competencies) => onChange((current) => ({ ...current, competencies }))}
      createItem={() => ({ id: uid(), name: '', description: '', achievements: [] })}
      summary={(item) => ({
        title: item.name,
        subtitle: item.description || text.evidenceCount(item.achievements.length),
      })}
      addLabel={text.list.add}
      emptyTitle={text.list.emptyTitle}
      emptyDescription={text.list.emptyBody}
      deleteTitle={text.list.deleteTitle}
      untitledLabel={text.list.untitled}
      max={10}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <TextField
            label={text.name}
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder={text.namePlaceholder}
          />
          <AreaField
            label={text.framing}
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={2}
            maxLength={1200}
            placeholder={text.framingPlaceholder}
          />
          <StringList
            values={item.achievements}
            onChange={(achievements) => update({ achievements })}
            label={text.evidence}
            placeholder={text.evidencePlaceholder}
            addLabel={text.addEvidence}
            max={12}
          />
        </div>
      )}
    </RepeatableList>
  );
}

/**
 * The cover letter.
 *
 * It has no design controls of its own, and the form says so rather than leaving the user
 * hunting for them: the letter takes the CV's typefaces, accent and margins so the pair
 * cannot drift apart. What is edited here is only the part that is genuinely per-letter.
 */
export function CoverLetterForm({ cv, onChange }: SectionFormProps) {
  const text = useCopy().editor.forms.letter;
  const letter = cv.coverLetter;
  const update = (patch: Partial<typeof letter>) =>
    onChange((current) => ({ ...current, coverLetter: { ...current.coverLetter, ...patch } }));

  return (
    <div className="flex flex-col gap-5">
      <Switch
        checked={letter.enabled}
        onCheckedChange={(enabled) => update({ enabled })}
        label={text.enable}
        hint={text.enableHint}
      />

      <div className={letter.enabled ? '' : 'pointer-events-none opacity-50'}>
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label={text.recipient}
              value={letter.recipientName}
              onChange={(value) => update({ recipientName: value })}
              placeholder={text.recipientPlaceholder}
              hint={text.recipientHint}
            />
            <TextField
              label={text.recipientRole}
              value={letter.recipientRole}
              onChange={(value) => update({ recipientRole: value })}
              placeholder={text.recipientRolePlaceholder}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.company}
              value={letter.company}
              onChange={(value) => update({ company: value })}
              placeholder={text.companyPlaceholder}
            />
            <TextField
              label={text.vacancy}
              value={letter.vacancy}
              onChange={(value) => update({ vacancy: value })}
              placeholder={text.vacancyPlaceholder}
            />
          </Grid>
          <Grid>
            <TextField
              label={text.reference}
              value={letter.reference}
              onChange={(value) => update({ reference: value })}
              placeholder={text.referencePlaceholder}
            />
            <TextField
              label={text.date}
              value={letter.date}
              onChange={(value) => update({ date: value })}
              placeholder={text.datePlaceholder}
              hint={text.dateHint}
            />
          </Grid>
          <AreaField
            label={text.address}
            value={letter.companyAddress}
            onChange={(value) => update({ companyAddress: value })}
            rows={2}
            maxLength={300}
            placeholder={text.addressPlaceholder}
          />
          <AreaField
            label={text.body}
            value={letter.body}
            onChange={(value) => update({ body: value })}
            rows={12}
            maxLength={8000}
            placeholder={text.bodyPlaceholder}
            hint={text.bodyHint}
          />
          <Grid>
            <TextField
              label={text.signOff}
              value={letter.signOff}
              onChange={(value) => update({ signOff: value })}
              placeholder={text.signOffPlaceholder}
              hint={text.signOffHint}
            />
            <TextField
              label={text.signature}
              value={letter.signature}
              onChange={(value) => update({ signature: value })}
              placeholder={fullName(cv) || text.signaturePlaceholder}
            />
          </Grid>
        </div>
      </div>
    </div>
  );
}

export function SectionForm({
  sectionId,
  cv,
  onChange,
}: {
  sectionId: string;
  cv: CVData;
  onChange: (recipe: (current: CVData) => CVData) => void;
}) {
  if (isCustomSectionId(sectionId)) {
    return <CustomSectionForm cv={cv} onChange={onChange} sectionId={sectionId} />;
  }

  switch (sectionId as BuiltInSectionId | 'personal') {
    case 'summary':
      return <SummaryForm cv={cv} onChange={onChange} />;
    case 'competencies':
      return <CompetenciesForm cv={cv} onChange={onChange} />;
    case 'experience':
      return <ExperienceForm cv={cv} onChange={onChange} />;
    case 'education':
      return <EducationForm cv={cv} onChange={onChange} />;
    case 'skills':
      return <SkillsForm cv={cv} onChange={onChange} />;
    case 'languages':
      return <LanguagesForm cv={cv} onChange={onChange} />;
    case 'projects':
      return <ProjectsForm cv={cv} onChange={onChange} />;
    case 'certifications':
      return <CertificationsForm cv={cv} onChange={onChange} />;
    case 'awards':
      return <AwardsForm cv={cv} onChange={onChange} />;
    case 'volunteer':
      return <VolunteerForm cv={cv} onChange={onChange} />;
    case 'publications':
      return <PublicationsForm cv={cv} onChange={onChange} />;
    case 'interests':
      return <InterestsForm cv={cv} onChange={onChange} />;
    case 'references':
      return <ReferencesForm cv={cv} onChange={onChange} />;
    case 'personal':
      return <PersonalForm cv={cv} onChange={onChange} />;
    default:
      return null;
  }
}
