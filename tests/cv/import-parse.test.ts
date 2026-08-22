import { describe, expect, it } from 'vitest';

import { parseCvText } from '@/lib/cv/import/parse';

/**
 * The importer, tested against the text a real CV extracts to.
 *
 * These fixtures are written the way PDF extraction actually delivers a document — no blank
 * lines between entries, dates jammed onto the end of a title line, bullets in whichever
 * glyph the original word processor used. Testing against tidy input would prove the parser
 * works on documents it will never see.
 *
 * The assertions are deliberately about *structure* rather than exact strings for the fields
 * that are inferred. Whether the company lands as `Atlas Cloud` or `Atlas Cloud, London` is a
 * judgement call the review screen lets the user fix; whether two jobs came out as two
 * entries is not, and that is what gets pinned.
 */

const ENGLISH_CV = `
Nadia Example
Marketing Manager — Demand Generation
nadia@example.com | +44 20 7946 0524 | London, UK
linkedin.com/in/nadia-example

Professional Summary
B2B demand generation manager, eight years in SaaS, currently running a £340k paid and
lifecycle budget at a 120-person company selling into mid-market operations teams.

Work Experience
Marketing Manager, Demand Generation — Fieldwire Systems  Jun 2022 – Present
• Grew marketing-sourced pipeline from £1.1m to £2.7m in twelve months
• Rebuilt the nurture programme from four generic sequences into eleven
Digital Marketing Executive — Brightpath Learning  Feb 2019 – May 2022
• Took paid search from a £6k to a £22k monthly budget
• Launched the onboarding email sequence

Education
BSc Marketing — University of Leeds  2015 – 2018

Skills
Demand generation, Paid search, HubSpot, Salesforce, SQL, Google Analytics

Languages
English, French, Spanish
`;

const FRENCH_CV = `
Amina Chraibi
Cheffe de projet digital
amina@exemple.fr

Profil
Cheffe de projet avec sept ans d'expérience.

Expérience professionnelle
Cheffe de projet — Atlas Cloud  janvier 2020 – aujourd'hui
• Pilotage d'une équipe de six personnes
Chargée de projet — Studio Meridien  mars 2017 – décembre 2019

Formation
Master Marketing — Université Mohammed V  2015 – 2017

Compétences
Gestion de projet, Scrum, Figma
`;

describe('CV import parser', () => {
  describe('an English CV', () => {
    const { data, report } = parseCvText(ENGLISH_CV);

    it('reads the contact details, which are the only reliable patterns in a CV', () => {
      expect(data.personal?.email).toBe('nadia@example.com');
      expect(data.personal?.phone).toContain('+44');
      expect(data.personal?.linkedin).toContain('linkedin.com/in/nadia-example');
    });

    it('takes the name from the first line and the title from the second', () => {
      expect(data.personal?.firstName).toBe('Nadia');
      expect(data.personal?.lastName).toBe('Example');
      expect(data.personal?.title).toContain('Marketing Manager');
    });

    it('separates the two jobs rather than merging them', () => {
      // The failure that matters. A merged entry reads as one long job with the wrong dates,
      // and nobody notices until a recruiter checks the employment history.
      expect(data.experience).toHaveLength(2);
      expect(data.experience?.[0]?.company).toContain('Fieldwire');
      expect(data.experience?.[1]?.company).toContain('Brightpath');
    });

    it('normalises the dates and understands an open end date', () => {
      expect(data.experience?.[0]?.startDate).toBe('2022-06');
      expect(data.experience?.[0]?.current).toBe(true);
      expect(data.experience?.[0]?.endDate).toBe('');
      expect(data.experience?.[1]?.endDate).toBe('2022-05');
    });

    it('keeps the bullets as achievements, not as one paragraph', () => {
      expect(data.experience?.[0]?.achievements).toHaveLength(2);
      expect(data.experience?.[0]?.achievements?.[0]).toMatch(/^Grew marketing-sourced/);
    });

    it('splits a comma-separated skills line', () => {
      const names = data.skills?.map((skill) => skill.name) ?? [];
      expect(names).toContain('HubSpot');
      expect(names).toContain('SQL');
      expect(names.length).toBeGreaterThanOrEqual(6);
    });

    it('reports what it found, so the review screen can be honest', () => {
      expect(report.found).toEqual(
        expect.arrayContaining(['summary', 'experience', 'education', 'skills', 'languages']),
      );
      expect(report.contact).toEqual(expect.arrayContaining(['email', 'phone', 'linkedin']));
    });
  });

  describe('a French CV', () => {
    const { data } = parseCvText(FRENCH_CV);

    it('finds sections by their French headings', () => {
      // `Expérience professionnelle` and `Formation` come from `cv-labels`, the same table
      // the renderer prints — so a language the site can write, it can also read.
      expect(data.experience?.length).toBeGreaterThanOrEqual(2);
      expect(data.education?.length).toBeGreaterThanOrEqual(1);
      expect(data.skills?.length).toBeGreaterThanOrEqual(3);
    });

    it('reads French month names and "aujourd’hui" as an open end date', () => {
      expect(data.experience?.[0]?.startDate).toBe('2020-01');
      expect(data.experience?.[0]?.current).toBe(true);
      expect(data.experience?.[1]?.endDate).toBe('2019-12');
    });
  });

  describe('when there is nothing to read', () => {
    it('returns empty rather than inventing structure', () => {
      const { data, report } = parseCvText('   \n  \n ');
      expect(report.found).toEqual([]);
      expect(data.experience).toBeUndefined();
    });

    it('will not invent a qualification out of prose under the heading', () => {
      /*
       * A real regression. A CV whose education section held only prose — no dates, no
       * degree lines — had its first two sentences taken as `degree` and `institution` on
       * position alone, producing a qualification called "Delivered a EUR 2.4m ERP migration
       * across four European sites". Reporting the section as unread is the honest outcome:
       * the user fills in a blank, instead of having to notice a confident lie first.
       */
      const { data, report } = parseCvText(
        [
          'Education',
          'Delivered a large ERP migration across four European sites, on a schedule agreed at the outset.',
          'Chaired a fortnightly steering group of nine directors and cut time-to-decision by half.',
        ].join('\n'),
      );
      expect(data.education).toEqual([]);
      expect(report.found).not.toContain('education');
      expect(report.partial).toContain('education');
    });

    it('still reads a degree that carries no date', () => {
      // The guard above must not cost the common undated case: a degree line and a school.
      const { data } = parseCvText('Education\nBSc Civil Engineering\nUniversity of Bristol');
      expect(data.education?.[0]?.degree).toBe('BSc Civil Engineering');
      expect(data.education?.[0]?.institution).toBe('University of Bristol');
    });

    it('discards a section whose heading it does not recognise', () => {
      /*
       * Rather than appending it to whichever section came before, which is how the prose
       * above reached `education` in the first place.
       */
      const { data } = parseCvText(
        [
          'EDUCATION',
          'BSc Civil Engineering',
          'University of Bristol',
          'SELECTED ACHIEVEMENTS',
          'Ran a mobile rollout to 240 engineers across three depots.',
        ].join('\n'),
      );
      expect(data.education).toHaveLength(1);
      expect(data.education?.[0]?.degree).toBe('BSc Civil Engineering');
      expect(JSON.stringify(data.education)).not.toContain('240 engineers');
    });

    it('anchors an open-ended date that has no separator', () => {
      /*
       * `Depuis janvier 2021` has no dash, so the range pattern could not see it — and an
       * unseen date is not a missing date but a missing *job*, because entries are split on
       * date anchors. The current role was being absorbed into the one above it.
       */
      const { data } = parseCvText(
        [
          'Expérience professionnelle',
          'Coordinateur de projet',
          'Groupe Meridian',
          'Depuis janvier 2021',
          'Pilotage de projets de transformation.',
          'Chargé de mission',
          'Ville de Lyon',
          'septembre 2018 – décembre 2020',
          'Suivi budgétaire et reporting.',
        ].join('\n'),
      );
      expect(data.experience).toHaveLength(2);
      expect(data.experience?.[0]?.startDate).toBe('2021-01');
      expect(data.experience?.[0]?.current).toBe(true);
      expect(data.experience?.[1]?.endDate).toBe('2020-12');
    });

    it('does not split a job at a `since` inside its own description', () => {
      // Anchored to the start of the line, so prose cannot become an entry boundary.
      const { data } = parseCvText(
        [
          'Work Experience',
          'Programme Manager',
          'Atlas Group',
          'Mar 2018 – Present',
          'Responsible for the transformation programme since 2019, across four sites.',
        ].join('\n'),
      );
      expect(data.experience).toHaveLength(1);
    });

    it('does not mistake a heading-only document for content', () => {
      const { report } = parseCvText('Work Experience\nEducation\nSkills');
      // Headings seen, nothing under them: that is `partial`, not `found`, and the review
      // screen says so instead of showing three confident empty sections.
      expect(report.found).toEqual([]);
      expect(report.partial).toEqual(expect.arrayContaining(['experience']));
    });
  });
});
