'use client';

import type { ReactNode } from 'react';

import { PhotoField } from './PhotoField';
import { RepeatableList, StringList } from './RepeatableList';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { LANGUAGE_LEVELS, SKILL_LEVELS } from '@/lib/cv/format';
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
  const personal = cv.personal;
  const set = (patch: Partial<CVData['personal']>) =>
    onChange((current) => ({ ...current, personal: { ...current.personal, ...patch } }));

  return (
    <div className="flex flex-col gap-5">
      <Grid>
        <TextField
          label="First name"
          value={personal.firstName}
          onChange={(value) => set({ firstName: value })}
          autoComplete="given-name"
        />
        <TextField
          label="Last name"
          value={personal.lastName}
          onChange={(value) => set({ lastName: value })}
          autoComplete="family-name"
        />
      </Grid>

      <TextField
        label="Professional title"
        value={personal.title}
        onChange={(value) => set({ title: value })}
        placeholder="Senior Product Designer"
        hint="The role you are applying for, not necessarily your current job title."
      />

      <Grid>
        <TextField
          label="Email"
          type="email"
          value={personal.email}
          onChange={(value) => set({ email: value })}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <TextField
          label="Phone"
          type="tel"
          value={personal.phone}
          onChange={(value) => set({ phone: value })}
          autoComplete="tel"
          placeholder="+212 6 12 34 56 78"
        />
      </Grid>

      <TextField
        label="Location"
        value={personal.location}
        onChange={(value) => set({ location: value })}
        placeholder="Casablanca, Morocco"
        hint="City and country is enough. A full street address is unnecessary and best left off."
      />

      <Grid>
        <TextField
          label="Website"
          value={personal.website}
          onChange={(value) => set({ website: value })}
          placeholder="yoursite.com"
        />
        <TextField
          label="LinkedIn"
          value={personal.linkedin}
          onChange={(value) => set({ linkedin: value })}
          placeholder="linkedin.com/in/you"
        />
      </Grid>

      <TextField
        label="GitHub"
        value={personal.github}
        onChange={(value) => set({ github: value })}
        placeholder="github.com/you"
      />

      <PhotoField
        value={personal.photoUrl}
        onChange={(photoUrl) => set({ photoUrl })}
        initials={`${personal.firstName.trim()[0] ?? ''}${
          personal.lastName.trim()[0] ?? ''
        }`.toUpperCase()}
      />

      <TextField
        label="…or paste a photo URL"
        value={personal.photoUrl}
        onChange={(value) => set({ photoUrl: value })}
        placeholder="https://…"
        hint="Only needed if the image is already hosted somewhere public. Uploading above is easier and produces a smaller PDF."
      />

      <div className="rounded-xl border border-ink-200 p-4">
        <RepeatableList
          items={personal.links}
          onChange={(links) => set({ links })}
          createItem={() => ({ id: uid(), label: '', url: '' })}
          summary={(item) => ({ title: item.label || 'Link', subtitle: item.url })}
          addLabel="Add another link"
          emptyTitle="No extra links"
          emptyDescription="Add a portfolio, Dribbble, Behance, ORCID or anything else worth putting on the page."
          itemNoun="link"
          max={8}
        >
          {(item, update) => (
            <Grid>
              <TextField
                label="Label"
                value={item.label}
                onChange={(value) => update({ label: value })}
                placeholder="Portfolio"
                maxLength={40}
              />
              <TextField
                label="URL"
                value={item.url}
                onChange={(value) => update({ url: value })}
                placeholder="yourportfolio.com"
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
  const words = cv.summary.trim() ? cv.summary.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-2">
      <AreaField
        label="Professional summary"
        value={cv.summary}
        onChange={(summary) => onChange((current) => ({ ...current, summary }))}
        rows={7}
        maxLength={3000}
        placeholder="Three or four sentences: who you are, the value you bring, and one result that proves it."
        hint="Aim for 50–90 words. Lead with your discipline and years of experience, then the single achievement you would want read first."
      />
      <p className="text-xs text-ink-500">
        {words} word{words === 1 ? '' : 's'}
        {words > 0 && words < 40 ? ' — a little short; add a concrete result.' : ''}
        {words > 110 ? ' — long enough that a recruiter will skim past it. Try trimming.' : ''}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

export function ExperienceForm({ cv, onChange }: SectionFormProps) {
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
      addLabel="Add a role"
      emptyTitle="No work experience yet"
      emptyDescription="Add your most recent role first. Internships, freelance work and significant volunteering all count."
      itemNoun="role"
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label="Job title"
              value={item.role}
              onChange={(value) => update({ role: value })}
              placeholder="Senior Product Designer"
            />
            <TextField
              label="Company"
              value={item.company}
              onChange={(value) => update({ company: value })}
              placeholder="Atlas Cloud"
            />
          </Grid>

          <Grid columns={3}>
            <TextField
              label="Location"
              value={item.location}
              onChange={(value) => update({ location: value })}
              placeholder="Casablanca, MA"
            />
            <MonthField
              label="Start date"
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label="End date"
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
              hint={item.current ? 'Shown as “Present”.' : undefined}
            />
          </Grid>

          <Checkbox
            label="I currently work here"
            checked={item.current}
            onChange={(event) =>
              update({ current: event.target.checked, endDate: event.target.checked ? '' : item.endDate })
            }
          />

          <AreaField
            label="What the role involved"
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={3}
            maxLength={3000}
            placeholder="One or two lines of context: the scope of the role, team size, who you served."
            hint="Context, not achievements — those go below."
          />

          <StringList
            values={item.achievements}
            onChange={(achievements) => update({ achievements })}
            label="Achievements"
            placeholder="Rebuilt onboarding, lifting activation from 34% to 58% in two quarters."
            addLabel="Add an achievement"
          />

          <TagsField
            values={item.tags}
            onChange={(tags) => update({ tags })}
            label="Tags"
            hint="Optional keywords shown as small chips by some templates. ATS templates hide them."
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
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          value={values.join(', ')}
          placeholder="Design systems, Onboarding, B2B SaaS"
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
      addLabel="Add a qualification"
      emptyTitle="No education added"
      emptyDescription="List your highest qualification first. Early in a career this section belongs near the top of the CV."
      itemNoun="qualification"
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label="Degree"
              value={item.degree}
              onChange={(value) => update({ degree: value })}
              placeholder="BSc"
            />
            <TextField
              label="Field of study"
              value={item.field}
              onChange={(value) => update({ field: value })}
              placeholder="Computer Science"
            />
          </Grid>
          <Grid>
            <TextField
              label="Institution"
              value={item.institution}
              onChange={(value) => update({ institution: value })}
              placeholder="Université Mohammed V"
            />
            <TextField
              label="Location"
              value={item.location}
              onChange={(value) => update({ location: value })}
              placeholder="Rabat, Morocco"
            />
          </Grid>
          <Grid columns={3}>
            <MonthField
              label="Start date"
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label="End date"
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
            />
            <TextField
              label="Grade"
              value={item.grade}
              onChange={(value) => update({ grade: value })}
              placeholder="First class / 3.7 GPA"
            />
          </Grid>
          <Checkbox
            label="I am still studying here"
            checked={item.current}
            onChange={(event) =>
              update({ current: event.target.checked, endDate: event.target.checked ? '' : item.endDate })
            }
          />
          <AreaField
            label="Notes"
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={2}
            maxLength={2000}
            placeholder="Thesis title, relevant modules, or a prize."
            hint="Worth filling in for a recent graduate; safe to leave empty later on."
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
      addLabel="Add a skill"
      emptyTitle="No skills listed"
      emptyDescription="Five to fifteen is the useful range. Group them into categories and the templates will lay them out for you."
      itemNoun="skill"
      max={80}
    >
      {(item, update) => (
        <Grid columns={3}>
          <TextField
            label="Skill"
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder="Figma"
            maxLength={80}
          />
          <TextField
            label="Category"
            value={item.category}
            onChange={(value) => update({ category: value })}
            placeholder="Tools"
            hint="Optional grouping."
            maxLength={60}
          />
          <Field label="Level">
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
      addLabel="Add a language"
      emptyTitle="No languages listed"
      emptyDescription="Worth adding for any international application, and expected on a European CV."
      itemNoun="language"
      max={20}
    >
      {(item, update) => (
        <Grid>
          <TextField
            label="Language"
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder="French"
            maxLength={60}
          />
          <Field label="Proficiency" hint="Mapped to the CEFR scale by templates that show one.">
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
      addLabel="Add a project"
      emptyTitle="No projects added"
      emptyDescription="Side projects, open-source work and notable client deliverables. Especially valuable if your job titles undersell what you can do."
      itemNoun="project"
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField
              label="Project name"
              value={item.name}
              onChange={(value) => update({ name: value })}
              placeholder="Souk Kit"
            />
            <TextField
              label="Your role"
              value={item.role}
              onChange={(value) => update({ role: value })}
              placeholder="Creator"
            />
          </Grid>
          <Grid columns={3}>
            <MonthField
              label="Start"
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label="End"
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
            />
            <TextField
              label="Link"
              value={item.url}
              onChange={(value) => update({ url: value })}
              placeholder="github.com/you/project"
            />
          </Grid>
          <AreaField
            label="Description"
            value={item.description}
            onChange={(value) => update({ description: value })}
            rows={3}
            maxLength={2000}
            placeholder="What it is, who it is for, and what you built."
          />
          <StringList
            values={item.highlights}
            onChange={(highlights) => update({ highlights })}
            label="Highlights"
            placeholder="4.1k GitHub stars and 60+ contributors."
            addLabel="Add a highlight"
            max={12}
          />
          <TagsField values={item.tags} onChange={(tags) => update({ tags })} label="Tags" />
        </div>
      )}
    </RepeatableList>
  );
}

/* -------------------------------------------------------------------------- */
/* Certifications, awards, volunteering, publications                          */
/* -------------------------------------------------------------------------- */

export function CertificationsForm({ cv, onChange }: SectionFormProps) {
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
      addLabel="Add a certification"
      emptyTitle="No certifications"
      emptyDescription="Licences, professional certifications and credentials that a recruiter can verify."
      itemNoun="certification"
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <TextField
            label="Name"
            value={item.name}
            onChange={(value) => update({ name: value })}
            placeholder="AWS Certified Solutions Architect – Associate"
          />
          <Grid columns={3}>
            <TextField
              label="Issuer"
              value={item.issuer}
              onChange={(value) => update({ issuer: value })}
              placeholder="Amazon Web Services"
            />
            <MonthField label="Issued" value={item.date} onChange={(value) => update({ date: value })} />
            <MonthField
              label="Expires"
              value={item.expiryDate}
              onChange={(value) => update({ expiryDate: value })}
            />
          </Grid>
          <Grid>
            <TextField
              label="Credential ID"
              value={item.credentialId}
              onChange={(value) => update({ credentialId: value })}
            />
            <TextField
              label="Verification link"
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
  return (
    <RepeatableList
      items={cv.awards}
      onChange={(awards) => onChange((current) => ({ ...current, awards }))}
      createItem={() => ({ id: uid(), title: '', issuer: '', date: '', description: '' })}
      summary={(item) => ({ title: item.title, subtitle: item.issuer })}
      addLabel="Add an award"
      emptyTitle="No awards"
      emptyDescription="Recognition, prizes and honours — internal awards count too."
      itemNoun="award"
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid columns={3}>
            <TextField label="Title" value={item.title} onChange={(value) => update({ title: value })} />
            <TextField
              label="Awarded by"
              value={item.issuer}
              onChange={(value) => update({ issuer: value })}
            />
            <MonthField label="Date" value={item.date} onChange={(value) => update({ date: value })} />
          </Grid>
          <AreaField
            label="Description"
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
      addLabel="Add volunteering"
      emptyTitle="No volunteer experience"
      emptyDescription="Unpaid work that shows initiative, values or skills your paid roles do not."
      itemNoun="entry"
      max={20}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField label="Role" value={item.role} onChange={(value) => update({ role: value })} />
            <TextField
              label="Organisation"
              value={item.organization}
              onChange={(value) => update({ organization: value })}
            />
          </Grid>
          <Grid columns={3}>
            <TextField
              label="Location"
              value={item.location}
              onChange={(value) => update({ location: value })}
            />
            <MonthField
              label="Start"
              value={item.startDate}
              onChange={(value) => update({ startDate: value })}
            />
            <MonthField
              label="End"
              value={item.endDate}
              onChange={(value) => update({ endDate: value })}
              disabled={item.current}
            />
          </Grid>
          <Checkbox
            label="I still volunteer here"
            checked={item.current}
            onChange={(event) =>
              update({ current: event.target.checked, endDate: event.target.checked ? '' : item.endDate })
            }
          />
          <AreaField
            label="Description"
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
      addLabel="Add a publication"
      emptyTitle="No publications"
      emptyDescription="Papers, articles, books and conference talks. Essential on an academic CV."
      itemNoun="publication"
      max={30}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <TextField label="Title" value={item.title} onChange={(value) => update({ title: value })} />
          <Grid columns={3}>
            <TextField
              label="Publisher"
              value={item.publisher}
              onChange={(value) => update({ publisher: value })}
            />
            <MonthField label="Date" value={item.date} onChange={(value) => update({ date: value })} />
            <TextField label="Link" value={item.url} onChange={(value) => update({ url: value })} />
          </Grid>
          <TextField
            label="Authors"
            value={item.authors}
            onChange={(value) => update({ authors: value })}
            placeholder="El Fassi, A., Benali, Y."
          />
          <AreaField
            label="Abstract"
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
  return (
    <RepeatableList
      items={cv.interests}
      onChange={(interests) => onChange((current) => ({ ...current, interests }))}
      createItem={() => ({ id: uid(), name: '', description: '' })}
      summary={(item) => ({ title: item.name, subtitle: item.description })}
      addLabel="Add an interest"
      emptyTitle="No interests"
      emptyDescription="A short, specific line humanises a CV. “Long-distance running” beats “sport”."
      itemNoun="interest"
      max={20}
    >
      {(item, update) => (
        <Grid>
          <TextField
            label="Interest"
            value={item.name}
            onChange={(value) => update({ name: value })}
            maxLength={60}
          />
          <TextField
            label="Detail"
            value={item.description}
            onChange={(value) => update({ description: value })}
            maxLength={200}
            hint="Optional. Only some templates show it."
          />
        </Grid>
      )}
    </RepeatableList>
  );
}

export function ReferencesForm({ cv, onChange }: SectionFormProps) {
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
      summary={(item) => ({ title: item.name, subtitle: [item.role, item.company].filter(Boolean).join(', ') })}
      addLabel="Add a referee"
      emptyTitle="No references listed"
      emptyDescription="Most employers ask for these later. Only list someone who has agreed to it — and never publish their details on a shared link."
      itemNoun="referee"
      max={10}
    >
      {(item, update) => (
        <div className="flex flex-col gap-4">
          <Grid>
            <TextField label="Name" value={item.name} onChange={(value) => update({ name: value })} />
            <TextField
              label="Relationship"
              value={item.relationship}
              onChange={(value) => update({ relationship: value })}
              placeholder="Direct manager"
            />
          </Grid>
          <Grid>
            <TextField label="Role" value={item.role} onChange={(value) => update({ role: value })} />
            <TextField
              label="Company"
              value={item.company}
              onChange={(value) => update({ company: value })}
            />
          </Grid>
          <Grid>
            <TextField
              label="Email"
              type="email"
              value={item.email}
              onChange={(value) => update({ email: value })}
            />
            <TextField
              label="Phone"
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
        label="Section heading"
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
        addLabel="Add an entry"
        emptyTitle="Nothing in this section yet"
        emptyDescription="Each entry has a heading, a subheading, a date and a description — enough for almost anything a standard section does not cover."
        itemNoun="entry"
        max={30}
      >
        {(item, update) => (
          <div className="flex flex-col gap-4">
            <Grid columns={3}>
              <TextField
                label="Heading"
                value={item.heading}
                onChange={(value) => update({ heading: value })}
              />
              <TextField
                label="Subheading"
                value={item.subheading}
                onChange={(value) => update({ subheading: value })}
              />
              <TextField
                label="Date"
                value={item.date}
                onChange={(value) => update({ date: value })}
                placeholder="2024"
              />
            </Grid>
            <AreaField
              label="Description"
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
