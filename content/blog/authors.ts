import type { BlogAuthor } from '@/types/blog';

/**
 * Editorial personas used as article bylines.
 *
 * These are in-house editorial identities, not individual contributors' personal
 * accounts — a byline here means the article was written and reviewed by the
 * CreateCVOnline editorial desk under that remit.
 */

export const editorialTeam: BlogAuthor = {
  name: 'The CreateCVOnline editorial team',
  role: 'CV writing desk',
  avatarInitials: 'CC',
};

export const hiringDesk: BlogAuthor = {
  name: 'Marcus Reid',
  role: 'Hiring practices editor',
  avatarInitials: 'MR',
};

export const regionalDesk: BlogAuthor = {
  name: 'Leila Fassi',
  role: 'Regional careers editor',
  avatarInitials: 'LF',
};
