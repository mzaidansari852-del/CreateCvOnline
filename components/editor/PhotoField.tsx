'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { firebaseStorage } from '@/lib/firebase/client';
import { isFirebaseClientConfigured } from '@/lib/env';
import {
  PHOTO_ACCEPT,
  PhotoError,
  isOwnedPhotoUrl,
  photoPath,
  prepareProfilePhoto,
} from '@/lib/cv/photo-upload';
import { uid as newId } from '@/lib/utils/id';

/**
 * Upload control for the CV profile photo.
 *
 * Available on every plan, including Free. A photo is a requirement in much of continental
 * Europe and across North Africa and the Middle East — putting it behind a paywall would
 * make the free tier unusable for the people most likely to need it, rather than merely
 * less good.
 *
 * The field this replaces was a plain "Profile photo URL" text input, which asked the user
 * to host an image somewhere else first. The URL input is kept underneath as an escape
 * hatch for anyone who genuinely has one, but it is no longer the only way in.
 */
export function PhotoField({
  value,
  onChange,
  initials,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Shown in the placeholder frame when there is no photo, matching the CV preview. */
  initials: string;
}) {
  const { sessionUser, ready } = useAuth();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const canUpload = isFirebaseClientConfigured && ready && Boolean(sessionUser);

  const handleFile = useCallback(
    async (file: File) => {
      if (!sessionUser) return;
      setBusy(true);
      setError(null);

      const previous = value;
      try {
        const blob = await prepareProfilePhoto(file);
        const path = photoPath(sessionUser.uid, newId());
        const objectRef = ref(firebaseStorage(), path);

        await uploadBytes(objectRef, blob, {
          contentType: 'image/jpeg',
          // A CV photo rarely changes and is fetched again by the PDF renderer on every
          // export, so let it cache hard. The filename is unique per upload, which is what
          // makes a long max-age safe.
          cacheControl: 'public, max-age=31536000, immutable',
        });

        onChange(await getDownloadURL(objectRef));

        // Only ever tidy up objects we put there ourselves, and never let a failed
        // cleanup surface as a failed upload — the new photo is already saved.
        if (isOwnedPhotoUrl(previous, sessionUser.uid)) {
          await deleteObject(ref(firebaseStorage(), previous)).catch(() => undefined);
        }
      } catch (cause) {
        setError(
          cause instanceof PhotoError
            ? cause.message
            : 'The upload did not complete. Check your connection and try again.',
        );
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [onChange, sessionUser, value],
  );

  const remove = useCallback(async () => {
    const current = value;
    onChange('');
    setError(null);
    if (sessionUser && isOwnedPhotoUrl(current, sessionUser.uid)) {
      await deleteObject(ref(firebaseStorage(), current)).catch(() => undefined);
    }
  }, [onChange, sessionUser, value]);

  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <div className="flex flex-wrap items-start gap-4">
        <div
          className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-100"
          aria-hidden
        >
          {value ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-ink-500">{initials || '—'}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-ink-950">Profile photo</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-600">
            Expected in much of continental Europe, North Africa and the Middle East;
            usually left off in the UK, Ireland and the US. Templates without a photo slot
            simply ignore it.
          </p>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void handleFile(file);
            }}
            className={`mt-3 rounded-lg border border-dashed p-3 transition-colors ${
              dragging ? 'border-brand-400 bg-brand-50' : 'border-ink-300 bg-ink-50'
            }`}
          >
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={PHOTO_ACCEPT}
              className="sr-only"
              disabled={!canUpload || busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={busy}
                disabled={!canUpload || busy}
                onClick={() => inputRef.current?.click()}
              >
                {value ? 'Replace photo' : 'Upload photo'}
              </Button>

              {value ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void remove()}
                >
                  Remove
                </Button>
              ) : null}

              <span className="text-xs text-ink-500">or drop an image here</span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              JPEG, PNG, WebP or AVIF, up to 8 MB. It is cropped to a square and resized to
              600px in your browser before uploading, so a large phone photo will not slow
              your PDF down.
            </p>
          </div>

          {!ready ? null : !sessionUser ? (
            <p className="mt-2 text-xs text-ink-500">Sign in to upload a photo.</p>
          ) : !isFirebaseClientConfigured ? (
            <p className="mt-2 text-xs text-ink-500">
              Photo upload is unavailable because storage is not configured on this
              deployment. You can still paste a link below.
            </p>
          ) : null}

          {error ? (
            <p role="alert" className="mt-2 text-xs font-medium text-danger-700">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
