import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { PHOTO_ACCEPT, isOwnedPhotoUrl, photoPath } from '@/lib/cv/photo-upload';

/**
 * Profile photo upload.
 *
 * The schema field, the storage rules, the client and admin storage helpers and the
 * template rendering were all built. The file picker was not — so the only way a user
 * could add a photo was to host it elsewhere and paste a URL into a text box. These tests
 * cover the pieces of the upload path that are pure logic, plus the wiring that made it
 * reachable at all.
 */

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const field = read('components/editor/PhotoField.tsx');
const forms = read('components/editor/SectionForms.tsx');
const rules = read('storage.rules');
const entitlements = read('lib/entitlements.ts');

describe('photo storage paths', () => {
  it('scopes an upload to the owner, matching storage.rules', () => {
    expect(photoPath('abc123', 'xyz')).toBe('users/abc123/photo/xyz.jpg');
    // The rules match `users/{userId}/photo/{fileName}` and compare userId to the token.
    expect(rules).toContain('match /users/{userId}/photo/{fileName}');
    expect(rules).toContain('allow write: if isOwner(userId)');
  });

  it('accepts only the formats the rules allow', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
      expect(PHOTO_ACCEPT).toContain(type);
    }
    expect(PHOTO_ACCEPT).not.toContain('image/gif');
    expect(PHOTO_ACCEPT).not.toContain('image/svg');
    // An SVG is a script container; the rules reject it too.
    expect(rules).toContain("contentType.matches('image/(jpeg|png|webp|avif)')");
  });
});

describe('ownership check before deleting a replaced photo', () => {
  const uid = 'user-1';
  const owned =
    'https://firebasestorage.googleapis.com/v0/b/p.appspot.com/o/users%2Fuser-1%2Fphoto%2Fabc.jpg?alt=media';

  it('recognises an object this user uploaded', () => {
    expect(isOwnedPhotoUrl(owned, uid)).toBe(true);
  });

  it('refuses another user’s object', () => {
    expect(isOwnedPhotoUrl(owned.replace('user-1', 'user-2'), uid)).toBe(false);
  });

  it('refuses a pasted third-party URL', () => {
    // `photoUrl` may hold anything the user typed. Deleting is only ever our business for
    // objects under their own prefix.
    expect(isOwnedPhotoUrl('https://example.com/me.jpg', uid)).toBe(false);
    expect(isOwnedPhotoUrl('https://i.imgur.com/x.png', uid)).toBe(false);
  });

  it('refuses a look-alike host', () => {
    expect(
      isOwnedPhotoUrl('https://firebasestorage.googleapis.com.evil.test/users/user-1/photo/a', uid),
    ).toBe(false);
  });

  it('handles empty and malformed input without throwing', () => {
    expect(isOwnedPhotoUrl('', uid)).toBe(false);
    expect(isOwnedPhotoUrl('not a url', uid)).toBe(false);
  });
});

describe('the upload control is reachable and ungated', () => {
  it('is mounted in the personal details form', () => {
    expect(forms).toContain('<PhotoField');
    expect(forms).toContain("import { PhotoField } from './PhotoField'");
  });

  it('offers a real file input rather than only a URL box', () => {
    expect(field).toContain('type="file"');
    expect(field).toContain('uploadBytes');
  });

  it('is available on every plan, including Free', () => {
    // A photo is expected in much of continental Europe, North Africa and the Middle East.
    // Gating it would make the free tier unusable for the people most likely to need it.
    expect(entitlements).not.toContain('photoUrl');
    expect(field).not.toMatch(/isPremium|assertCanUse|upgrade/i);
  });

  it('downscales in the browser before uploading', () => {
    // A 6MB phone photo would otherwise be refetched by the PDF renderer on every export.
    const lib = read('lib/cv/photo-upload.ts');
    expect(lib).toContain('OUTPUT_SIZE = 600');
    expect(lib).toContain("imageOrientation: 'from-image'");
    expect(lib).toMatch(/never upscale/i);
  });
});
