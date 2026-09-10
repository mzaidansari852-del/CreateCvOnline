# Email setup — announcements from Hostinger

`/admin/email` sends announcements to members who opted in to product e-mail, each in their
own language. This connects it to your Hostinger mailbox.

---

## 1. The variables

In Vercel → **Settings → Environment Variables**, scoped to **Production**:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contact@createcvonline.com
SMTP_PASSWORD=<the mailbox password>
```

Three things people get wrong here:

- **`SMTP_USER` is the full address**, not `contact`. Hostinger authenticates on the whole
  mailbox address.
- **The password is the mailbox's**, set in hPanel → Emails → your domain → the mailbox. It
  is not your Hostinger account password. If you have never set one, reset it there.
- **Port 465, not 587.** Both work on Hostinger, but 465 is implicit TLS and the code
  derives the encryption mode from the port. Mismatch it and the connection hangs rather
  than failing, which is a far more annoying thing to debug.

Then **redeploy** — variables only apply at build time.

## 2. Check it before you write anything

Open `/admin/email`. If SMTP is missing you get a red banner naming the variables, and the
send buttons are disabled while preview still works.

If it looks configured, use **Send a test to myself** before anything else. That does a real
SMTP handshake and a real delivery, so it fails loudly and specifically:

| Error contains | Means |
| --- | --- |
| `Invalid login` / `535` | Wrong password, or `SMTP_USER` is not the full address |
| `ETIMEDOUT` / hangs | Port and TLS mode disagree — try 465 with `SMTP_SECURE` unset |
| `Mail from not owned by user` | `SMTP_FROM` is an address the mailbox is not allowed to send as; unset it |
| `ENOTFOUND` | `SMTP_HOST` typo |

## 3. Who receives it

**People with `marketingOptIn: true` on their profile. Only them, always.** There is no
option to send to everyone, and that is deliberate rather than unfinished — see the note at
the top of `lib/db/audience.ts`.

The signup form asks for this consent and stores the answer, so the list is people who said
yes. Users can change it under Settings, and every e-mail carries an unsubscribe link.

The audience panel shows the total and the split by language before you send anything.

## 4. The templates

| Template | What it does | Needs an offer |
| --- | --- | --- |
| **Offer announcement** | Writes itself from the running offer — plan, price, saving, seat count | Yes |
| **Offer ending** | A short "last call" for the same offer | Yes |
| **Product update** | New templates or features. You write the subject, heading and body | No |
| **Plain announcement** | Anything else, in the site's shell | No |

The two offer templates read `/admin/offers` directly, so the price in the e-mail is the
price on the site — there is no second place to update and no way for them to disagree.

**Only the greeting and the button are translated in the two you write yourself.** Your body
text is sent to everyone in the language you typed it. The form says so; it is worth
knowing before writing to a mostly-German list in English.

## 5. Sending

Preview → test → send. The send button asks for confirmation and names the number.

Messages go **one at a time, about 1.2 seconds apart**, over one reused connection. Two
hundred recipients takes roughly four minutes. That pacing is not caution for its own sake:
a mailbox that exceeds its hourly cap gets rate-limited, and doing it repeatedly gets the
*domain* treated as a spam source — which lands on password resets and payment receipts, not
just on marketing.

Keep the browser tab open until it reports back. The run is synchronous.

One send failing does not stop the rest; failures are collected and listed at the end with
the reason for each.

If the audience changed while you were composing, the send is refused rather than going out
to a different number of people than you approved.

## 6. Unsubscribes

Every message carries both a footer link and the `List-Unsubscribe` header that Gmail and
Outlook turn into an Unsubscribe control next to the sender name.

The header matters more than the link. A reader who cannot find the link marks the message
as spam instead, and a spam complaint costs the domain's reputation where an unsubscribe
costs one address.

`/unsubscribe` acts on load — no confirmation, no sign-in. Somebody who clicked has decided,
and every step in their way is a step at which they press the spam button instead. It sets
the same `marketingOptIn` field the settings page uses, so there is one answer to "is this
person opted in" and no suppression list to drift out of step.

**Unsubscribing does not stop account e-mail** — payments, passwords, verification. The
confirmation page says so, because that is the question somebody actually has at that
moment.

## 7. When this stops being the right tool

At a few thousand recipients, an SMTP mailbox is the wrong instrument regardless of pacing:
no bounce handling, no complaint feedback loop, no domain warm-up, and shared IP reputation
you do not control. At that point the panel stays and the transport behind it changes —
`lib/email/send.ts` is the only file that knows about SMTP, and swapping it for a sending
service is a change to that file plus three environment variables.

## What runs where

| File | Does |
| --- | --- |
| `lib/email/templates.ts` | The four templates, each in four languages. No HTML |
| `lib/email/render.ts` | The shared shell — table layout, inline styles, plain-text alternative |
| `lib/email/send.ts` | SMTP transport, pacing, per-recipient failure collection |
| `lib/email/unsubscribe.ts` | Signed, non-expiring unsubscribe tokens |
| `lib/db/audience.ts` | Who may be written to, and the opt-out write |
| `app/admin/email/` | The composer |
| `app/api/admin/email/route.ts` | Preview, test and send |
| `app/unsubscribe/` + `app/api/email/unsubscribe/` | The page, and one-click for mail clients |
| `tests/lib/email.test.ts` | Token round-trip and forgery, escaping, all templates in all languages |
