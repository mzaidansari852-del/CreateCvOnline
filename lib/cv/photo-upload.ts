/**
 * Profile photo processing and upload.
 *
 * Runs entirely in the browser. The bytes go straight from the user's device to Cloud
 * Storage under `users/{uid}/photo/{id}.jpg`, which is the path `storage.rules` scopes to
 * the owner; nothing passes through our server.
 *
 * The processing step is not cosmetic. A photo off a modern phone is 3–8 MB at 4000px
 * wide, and every byte of it would be fetched again by the headless Chromium that renders
 * the PDF — for an image the templates display at 88–200px. Downscaling to 600px square
 * before upload turns a 6 MB original into roughly 60 KB and takes the PDF render from
 * seconds of image fetching to nothing.
 *
 * The crop is a centre crop rather than an interactive cropper. Every template frames the
 * photo with `object-fit: cover`, so an off-centre subject is already handled visually;
 * squaring the *file* is about not carrying pixels that will never be seen.
 */

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
/** `storage.rules` rejects anything larger; stay well inside it after processing. */
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
const OUTPUT_SIZE = 600;
const OUTPUT_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.85;

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
/** For the file input's `accept`, so the OS picker filters before the user chooses. */
export const PHOTO_ACCEPT = ACCEPTED.join(',');

export type PhotoErrorCode =
  'unsupportedType' | 'tooLarge' | 'unreadable' | 'processingFailed' | 'tooLargeAfterResize';

/** What the copy layer needs to build a sentence about a rejected photo. */
export interface PhotoErrorInfo {
  code: PhotoErrorCode;
  /** Size of the file that was refused. Only meaningful for `tooLarge`. */
  bytes: number;
}

/**
 * A photo that was refused, identified by `code` rather than by its wording.
 *
 * This module runs outside React and is importable server-side, so it cannot reach
 * `useCopy()` to translate itself. The render site does that, keyed by `code`, via
 * `copy.photo.error()` in `lib/i18n/copy/chrome.ts`.
 *
 * `message` stays English on purpose: it is what lands in logs and stack traces, and it
 * keeps any render site that still shows `error.message` displaying a sentence rather than
 * an identifier. It is therefore a second copy of the English text — if the two drift, the
 * one in `chrome.ts` is the one users read.
 */
export class PhotoError extends Error implements PhotoErrorInfo {
  constructor(
    readonly code: PhotoErrorCode,
    message: string,
    readonly bytes = 0,
  ) {
    super(message);
    this.name = 'PhotoError';
  }
}

function assertAcceptable(file: File): void {
  if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
    throw new PhotoError(
      'unsupportedType',
      'That file is not an image we can use. Choose a JPEG, PNG, WebP or AVIF.',
    );
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError(
      'tooLarge',
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please choose one under 8 MB.`,
      file.size,
    );
  }
}

/** Largest centred square that fits the source, in source coordinates. */
function centreSquare(width: number, height: number) {
  const side = Math.min(width, height);
  return { side, x: (width - side) / 2, y: (height - side) / 2 };
}

/**
 * Decodes, centre-crops to a square and downscales to a JPEG blob.
 *
 * `createImageBitmap` is used rather than an `<img>` + load event because it decodes off
 * the main thread and, importantly, honours EXIF orientation — without which portrait
 * photos taken on a phone arrive rotated 90°.
 */
export async function prepareProfilePhoto(file: File): Promise<Blob> {
  assertAcceptable(file);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new PhotoError(
      'unreadable',
      'That image could not be read. It may be corrupted — try another.',
    );
  }

  try {
    const { side, x, y } = centreSquare(bitmap.width, bitmap.height);
    // Never upscale: a 200px source stays 200px rather than being blown up and softened.
    const target = Math.min(OUTPUT_SIZE, Math.round(side));

    const canvas = document.createElement('canvas');
    canvas.width = target;
    canvas.height = target;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new PhotoError('processingFailed', 'Your browser could not process the image.');
    }
    context.imageSmoothingQuality = 'high';
    // White rather than transparent: the output is JPEG, and a transparent PNG flattened
    // onto the default black would turn a cut-out portrait into a silhouette.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, target, target);
    context.drawImage(bitmap, x, y, side, side, 0, 0, target, target);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY),
    );
    if (!blob)
      throw new PhotoError('processingFailed', 'Your browser could not process the image.');
    if (blob.size > MAX_OUTPUT_BYTES) {
      throw new PhotoError(
        'tooLargeAfterResize',
        'That image is too large to store even after resizing.',
        blob.size,
      );
    }
    return blob;
  } finally {
    bitmap.close();
  }
}

/** Storage path for a user's photo. The filename is generated, so it is not enumerable. */
export function photoPath(uid: string, id: string): string {
  return `users/${uid}/photo/${id}.jpg`;
}

/**
 * True when a URL points at an object this app uploaded for this user.
 *
 * Used before deleting a replaced photo: `photoUrl` may hold something the user pasted by
 * hand, and deleting is only ever our business for objects under their own storage prefix.
 */
export function isOwnedPhotoUrl(url: string, uid: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('firebasestorage.googleapis.com')) return false;
    return decodeURIComponent(parsed.pathname).includes(`users/${uid}/photo/`);
  } catch {
    return false;
  }
}
