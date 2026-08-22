import { NextResponse } from 'next/server';

import { apiError, authedRoute, readJson } from '@/lib/api/handler';
import { aiExtractionAvailable } from '@/lib/cv/import/ai';
import { completeCv } from '@/lib/cv/import/complete';
import { InterviewError, generateFromInterview } from '@/lib/cv/interview/generate';
import { hasEnoughToBuild, interviewAnswersSchema } from '@/lib/cv/interview/questions';
import { cvDataSchema } from '@/types/cv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Builds a CV from the interview answers. Saves nothing.
 *
 * ## Why this saves nothing either
 *
 * The same reason the importer does not: what comes back is generated, and generated text on
 * a CV is the user's word to an employer. It gets reviewed before it exists as a document,
 * and creation goes through `POST /api/cvs`, which owns the quota and the entitlements.
 *
 * ## Why it is tighter than the importer's limit
 *
 * An interview costs about four times an import in tokens, and unlike an import there is no
 * file to prepare — the whole payload can be replayed from a script. Three a quarter of an
 * hour is more than anyone filling in their own history needs, and far less than is
 * comfortable for anybody running up somebody else's bill.
 */
export const POST = authedRoute(
  { scope: 'cvs-interview', rateLimit: { max: 3, windowSeconds: 900 } },
  async ({ request, profile, plan }) => {
    /*
     * The gate is here, not in the interface.
     *
     * A free account can walk the whole questionnaire — the questions are worth answering on
     * their own, and a paywall in front of an empty form asks somebody to buy something they
     * have not seen. It sits at the point where the cost is actually incurred.
     */
    if (plan.id === 'free') {
      return apiError(
        402,
        'upgrade-required',
        'Building a CV from your answers is part of Pro and Lifetime.',
      );
    }
    if (!aiExtractionAvailable()) {
      return apiError(
        503,
        'unavailable',
        'The CV writer is not available right now. Your answers have been kept.',
      );
    }

    const answers = await readJson(request, interviewAnswersSchema);
    if (!hasEnoughToBuild(answers)) {
      return apiError(
        422,
        'not-enough',
        'Add your name and at least one job or qualification, and we can build the rest.',
      );
    }

    try {
      const { data, removed } = await generateFromInterview(answers, profile.locale);
      const parsed = cvDataSchema.safeParse(data);
      if (!parsed.success) {
        return apiError(502, 'unreadable', 'The CV writer returned something unusable.');
      }

      const complete = completeCv(parsed.data, profile.locale);
      return NextResponse.json({
        draft: { title: titleFor(complete, answers.targetRole), data: complete },
        /*
         * Reported, not hidden.
         *
         * `removed` counts bullets dropped for carrying a figure the user never gave. It is
         * the one number on this screen that says the guard did something, and a user who
         * sees "we left out 2 lines that mentioned figures you did not give us" understands
         * both what happened and why — which is a better lesson about this feature than any
         * amount of copy about accuracy.
         */
        removed,
      });
    } catch (error) {
      if (error instanceof InterviewError) {
        console.error('[cv-interview] generation failed', error.message);
        return apiError(
          502,
          'unavailable',
          'The CV writer could not be reached. Your answers have been kept — try again.',
        );
      }
      throw error;
    }
  },
);

/** The person's own name and the role they are aiming at, which is what they will search for. */
function titleFor(data: { personal: { firstName: string; lastName: string } }, target: string) {
  const name = `${data.personal.firstName} ${data.personal.lastName}`.trim();
  if (name && target) return `${name} — ${target}`.slice(0, 120);
  return (name || target || 'My CV').slice(0, 120);
}
