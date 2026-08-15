# Paddle Billing — sandbox setup

Everything needed to take a test payment end to end, in the order you have to do it.
Budget half an hour. Nothing here touches live money: a sandbox account is a separate
account with separate credentials, and its cards are fake.

Paddle Billing only — not Paddle Classic. The SDK is `@paddle/paddle-node-sdk` on the
server and `@paddle/paddle-js` in the browser.

**Contents**

1. [Create the sandbox account](#1-create-the-sandbox-account)
2. [Get the two credentials — and keep them apart](#2-get-the-two-credentials--and-keep-them-apart)
3. [Create the products and prices](#3-create-the-products-and-prices)
4. [Fill in the environment](#4-fill-in-the-environment)
5. [Create the webhook](#5-create-the-webhook)
6. [Testing locally, where Paddle cannot reach you](#6-testing-locally-where-paddle-cannot-reach-you)
7. [Sandbox test cards](#7-sandbox-test-cards)
8. [How to tell it worked](#8-how-to-tell-it-worked)
9. [Going live](#9-going-live)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Create the sandbox account

Sign up at <https://sandbox-vendors.paddle.com/signup>. The sandbox dashboard then lives
at <https://sandbox-vendors.paddle.com>.

It is a **completely separate account** from a live one: "API keys, client-side tokens,
notification destinations, products, prices, and customers aren't shared between
environments" ([Sandbox](https://developer.paddle.com/build/tools/sandbox)). Everything
below has to be done twice — once now in sandbox, once again in the live dashboard before
launch — and the ids will differ. That is exactly why the price ids live in the
environment rather than in `lib/plans.ts`.

Sandbox talks to `https://sandbox-api.paddle.com`; live talks to `https://api.paddle.com`.
You never set those URLs here — `PADDLE_ENVIRONMENT` picks one (`lib/payments/paddle.ts`).

---

## 2. Get the two credentials — and keep them apart

Both are created under **Paddle → Developer tools → Authentication**. They are *not*
interchangeable and the difference matters more than any other line in this document.

| | API key | Client-side token |
| --- | --- | --- |
| Tab | **API keys** | **Client-side tokens** |
| Sandbox prefix | `pdl_sdbx_apikey_…` | `test_…` |
| Live prefix | `pdl_live_apikey_…` | `live_…` |
| Can do | everything: read customers, create and refund transactions | open a checkout, preview prices |
| Goes in | `PADDLE_API_KEY` | `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` |
| Visibility | **secret** — server only | **public** — inlined into the browser bundle by design |

The client-side token is *meant* to be public; Paddle limits it to "opening checkouts,
previewing prices, and previewing transactions"
([Authentication](https://developer.paddle.com/api-reference/about/authentication)).

The API key is not. Anything named `NEXT_PUBLIC_*` in Next.js is **compiled into the
JavaScript every visitor downloads** — putting the API key there publishes it, and the
prefixes exist so you can spot the mistake:

```bash
# If either of these prints anything, stop and rotate the key in the Paddle dashboard.
grep -r "pdl_sdbx_apikey\|pdl_live_apikey" .next/static/ 2>/dev/null
grep "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN" .env.local | grep "pdl_"
```

`lib/env.ts` carries the same warning at `publicEnv.paddleClientToken`: a client token
starts `live_`/`test_`, an API key starts `pdl_`.

Copy the API key at creation time — Paddle shows it once.

---

## 3. Create the products and prices

Two paid plans are sold (`lib/plans.ts`), so you need **two prices**. They can hang off one
product or two; one product per plan is easier to read in the dashboard.

**Paddle → Catalog → Products → New product**, then on the product, under Prices, **New
price**.

| Plan | `lib/plans.ts` price | What the app grants | Paddle price type |
| --- | --- | --- | --- |
| Pro | `9.00` | 31 days (`accessDays: 31`) | recurring monthly, or one-time |
| Lifetime | `69.00` | forever (`accessDays: null`) | one-time |

For a first sandbox run either type works for Pro: the overlay, the grant and the ledger
entry are identical, because access is granted per completed *transaction* and expires on
its own after 31 days.

Before you choose recurring for production, verify one renewal in sandbox. The app
subscribes to no `subscription.*` events at all — it grants on `transaction.completed` and
attributes the payment through `custom_data.userId`, which this app sets when it creates
the first transaction. A renewal transaction is created by Paddle, not by us, so whether it
still carries that `userId` is Paddle's behaviour to prove, not ours to assume. If a
renewal arrives without it the route answers `200 {"ignored":"unattributable"}`, nothing is
granted, and the customer's access lapses 31 days after the previous payment while Paddle
keeps charging them. Force a renewal in sandbox and watch the log before going live.

Set the base price in the same currency as `NEXT_PUBLIC_STORE_CURRENCY` (default `USD`).
Leave localised price overrides alone at first: Paddle converts automatically, and a
hand-typed override in a weak currency is the one thing that can make the amount check in
`paddleCaptureMatchesPlan` misbehave (see [§10](#10-troubleshooting)).

The prices must match `lib/plans.ts` **exactly**, to the cent. A payment whose amount does
not match the plan is refused, marked `failed` and never granted — that is the anti-tamper
check doing its job, and it cannot tell your typo from an attack.

Copy each price's id — `pri_` followed by 26 characters, e.g.
`pri_01hv8x9k2m3n4p5q6r7s8t9u0v`. It is on the price in the dashboard; if you cannot find
it there, `GET /prices` returns the ids for a product. Product ids start `pro_` and are
**not** what goes in the environment. Price ids are not secret — they appear in the
checkout the customer sees.

---

## 4. Fill in the environment

Add these to `.env.local` (and to the hosting provider's dashboard for a deployment). They
are also in `.env.example`.

```env
# --- secret: server only ---------------------------------------------------
PADDLE_API_KEY=pdl_sdbx_apikey_01hv8x9k2m3n4p5q6r7s8t9u0v_ExampleOnly_AQO
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01hv8x9k2m3n4p5q6r7s8t9u0v_ExampleOnlySecret
PADDLE_ENVIRONMENT=sandbox
PADDLE_PRICE_PRO=pri_01hv8x9k2m3n4p5q6r7s8t9u0v
PADDLE_PRICE_LIFETIME=pri_01hv8x9k2m3n4p5q6r7s8t9u0w

# --- public: compiled into the browser bundle ------------------------------
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_a1b2c3d4e5f6a7b8c9d0e1f2a3
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
NEXT_PUBLIC_STORE_CURRENCY=USD
```

| Variable | Secret? | Value | What breaks without it |
| --- | --- | --- | --- |
| `PADDLE_API_KEY` | **secret** | `pdl_sdbx_apikey_…` | Paddle is "not configured": no checkout at all. |
| `PADDLE_WEBHOOK_SECRET` | **secret** | `pdl_ntfset_…` | Every webhook is answered **401**. Payments still complete through the verify route, but nothing is granted asynchronously. |
| `PADDLE_ENVIRONMENT` | not secret, server-side | `sandbox` \| `production` | Defaults to `sandbox`. See the warning below. |
| `PADDLE_PRICE_PRO` | not secret | `pri_…` | Paddle is "not configured" — a missing price id disables the whole gateway, not just one plan. |
| `PADDLE_PRICE_LIFETIME` | not secret | `pri_…` | As above. |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | **public** | `test_…` / `live_…` | Paddle.js cannot initialise: the overlay never opens. |
| `NEXT_PUBLIC_PADDLE_ENVIRONMENT` | **public** | `sandbox` \| `production` | Defaults to `sandbox`. Anything other than `production` *is* sandbox. |
| `NEXT_PUBLIC_STORE_CURRENCY` | **public** | `USD` | The currency `lib/plans.ts` prices are quoted in, and the one an amount must match exactly. Falls back to `NEXT_PUBLIC_PAYPAL_CURRENCY`, then `USD`. Only the first three characters are used. |

Three traps worth naming:

- **`PADDLE_ENVIRONMENT=live` silently means sandbox.** PayPal spells it `live`; Paddle
  spells it `production`, and `lib/env.ts` only accepts that exact word. A production
  deployment configured with `live` quietly talks to the sandbox API and every real
  purchase fails. (Pinned by a test in `tests/lib/paddle.test.ts`.)
- **Both environment variables must agree.** `NEXT_PUBLIC_PADDLE_ENVIRONMENT` chooses
  which Paddle.js the browser loads; `PADDLE_ENVIRONMENT` chooses which API the server
  calls. Mixed, the overlay opens against a transaction the other environment has never
  heard of.
- **Half a Paddle is no Paddle.** The gateway counts as configured only when the API key
  *and* both price ids are present (`isPaddleConfigured()`), so an incomplete setup falls
  back to PayPal instead of rendering a checkout button that cannot work. The webhook
  secret is deliberately excluded from that test — you can take a payment before the
  webhook exists and reconcile afterwards.

Restart the dev server after editing `.env.local`. On a deployment, remember that the
`NEXT_PUBLIC_*` values are inlined at build time: changing one needs a **rebuild**, not a
restart.

---

## 5. Create the webhook

**Paddle → Developer tools → Notifications**, and add a destination.

1. **URL** — your public origin plus the path:

   ```
   https://<your-domain>/api/payments/paddle/webhook
   ```

   Locally that is the tunnel URL from [§6](#6-testing-locally-where-paddle-cannot-reach-you),
   not `localhost`.

2. **Events** — subscribe to exactly these two:

   - `transaction.completed`
   - `transaction.paid`

   Both mean the customer has been charged. Paddle sends `paid` first for some payment
   methods and `completed` when the transaction is finalised, so the route honours both and
   the second one is absorbed by the idempotent fulfilment
   (`app/api/payments/paddle/webhook/route.ts`). Any other event is answered `200` and
   ignored, so subscribing to more is harmless noise — but these two are what grant a plan.

3. **Save**, then reopen the destination (its ⋯ menu → **Edit destination**) and copy the
   **secret key**. It starts `pdl_ntfset_…`. That is `PADDLE_WEBHOOK_SECRET`
   ([Verify webhook signatures](https://developer.paddle.com/webhooks/signature-verification)).

The secret is per destination. A second destination — say one for local development and one
for staging — has its own secret, and each deployment needs the matching one.

**How verification works, and why the route reads the body as raw text first.** Paddle
sends `Paddle-Signature: ts=<unix>;h1=<hex>`, where `h1` is HMAC-SHA256 of
`` `${ts}:${rawBody}` `` under the secret. Re-serialising the JSON before checking would
change the bytes and the signature would never match — so the route reads
`await request.text()` *before* anything parses it. The SDK also rejects a signature whose
timestamp is more than five seconds old, which is what stops a captured request being
replayed.

---

## 6. Testing locally, where Paddle cannot reach you

Paddle delivers webhooks from its own servers, so `http://localhost:3000` is unreachable.
Two ways round it, and you want both:

**A tunnel**, for a genuine end-to-end run. Paddle's own docs recommend "a tunnelling tool
like Hookdeck CLI or ngrok for local development"
([Simulate webhooks](https://developer.paddle.com/webhooks/simulator/test-webhooks/)).

```bash
ngrok http 3000
# → Forwarding https://a1b2-93-184-216-34.ngrok-free.app -> http://localhost:3000
```

Then, in the Paddle destination, set the URL to
`https://<subdomain>.ngrok-free.app/api/payments/paddle/webhook`. Unless you have claimed a
static ngrok domain, that hostname changes every restart and the destination has to be
edited again. Also point `NEXT_PUBLIC_SITE_URL` at the tunnel origin while you test, or the
app builds links back to localhost.

**The webhook simulator**, for iterating on the route without paying for anything:
**Paddle → Developer tools → Simulations → New simulation**. Pick a single event
(`transaction.completed`) or a whole scenario, and edit the payload. Simulated events carry
a real `Paddle-Signature`, "just like real events", so they exercise the verification path
rather than bypassing it.

What the simulator will *not* do is grant a plan, and it is worth knowing where it stops:

- with the stock payload, the price id and `custom_data.userId` are not yours, so the route
  answers `200 {"received":true,"ignored":"unattributable"}` — which is the correct
  behaviour and proves the attribution check works;
- edit the payload to carry your real `pri_…` and a real uid and it gets one step further,
  then fails at the re-read, because the simulated `txn_…` does not exist in your Paddle
  account. That path answers `500 fulfilment-failed`.

So: simulator for signature verification, event filtering and attribution; tunnel plus a
test card for anything that has to end in an entitlement.

---

## 7. Sandbox test cards

Real card numbers do not work in sandbox, and sandbox cards do not work in live. From
Paddle's [Credit and debit cards](https://developer.paddle.com/concepts/payment-methods/credit-debit-card)
page (checked August 2026):

| Card number | Behaviour |
| --- | --- |
| `4242 4242 4242 4242` | Succeeds, no 3-D Secure |
| `4000 0038 0000 0446` | Succeeds, forces a 3-D Secure challenge |
| `4000 0566 5566 5556` | Valid Visa **debit** card |
| `4000 0000 0000 0002` | Declined |
| `4000 0027 6000 3184` | First payment succeeds, later ones decline — for renewal failures |

Paddle's instruction for the other fields is only this: "Enter any cardholder name and a
valid expiry date in the future." The page says nothing about the CVV; three digits are
accepted.

Use `4000 0038 0000 0446` at least once. 3-D Secure adds a challenge step before the
overlay closes, which is where an integration that assumes instant completion goes wrong.
Use `4000 0000 0000 0002` at least once too, and confirm nothing was written to the
payment ledger.

If in doubt about which account you are on: the client token in `.env.local` starts `test_`
for sandbox and `live_` for live, and the dashboard hostname is `sandbox-vendors.paddle.com`.

---

## 8. How to tell it worked

Buy Pro with `4242 4242 4242 4242`, then check all four:

**1. The browser.** The overlay closes and `/payment/success` reports the plan. That page
is driven by `POST /api/payments/paddle/verify`, which re-reads the transaction from Paddle
rather than believing the browser.

**2. The server log.** No `[paddle]` lines at all is the good outcome. Any of these means
something specific:

| Log line | Meaning |
| --- | --- |
| `[paddle] webhook signature rejected` | `PADDLE_WEBHOOK_SECRET` is wrong, missing, or belongs to another destination. |
| `[paddle] webhook amount mismatch` | The amount paid is not the plan price — check the dashboard price against `lib/plans.ts`. |
| `[paddle] webhook missing attribution` | No `custom_data.userId`, or the price id is not one of the two configured. |
| `[paddle] amount mismatch` | The same check, hit through the success page rather than the webhook. |
| `[paddle] verify failed` | Paddle was unreachable when the success page asked. The payment is *not* marked failed — the webhook will still grant it. |
| `[paddle] create transaction failed` | The overlay never opened: bad API key, wrong environment, or a price id that does not exist in this account. |

**3. The payment record.** Firestore `users/{uid}/payments/{transactionId}`, or
`/admin/payments` in the app. After a successful purchase:

| Field | Expected |
| --- | --- |
| `provider` | `paddle` |
| `providerOrderId` | the `txn_…` id, and the document id |
| `providerCaptureId` | Paddle's payment attempt id — a plain UUID such as `497f776b-851d-4ebf-89ab-8ba0f75d2d6a`, non-null once money moved |
| `status` | `completed` |
| `amount` / `currency` | `9.00` / `USD` — the real charge, not the plan's list price |
| `payerEmail` | the sandbox buyer's address |

`amount` is the value to look at hardest. Paddle reports money in minor units, so a Pro
purchase must read `9.00` — `900` or `0.09` means the minor-unit conversion went wrong for
that currency, and every amount check for it is meaningless.

**4. The entitlement.** On the user document, `entitlement`:

| Field | Pro | Lifetime |
| --- | --- | --- |
| `plan` | `pro` | `lifetime` |
| `status` | `active` | `active` |
| `currentPeriodEnd` | ISO date ~31 days out | `null` (never expires) |
| `lastPaymentId` | the `txn_…` id | the `txn_…` id |

Then confirm the user experience: `/dashboard/account` shows Pro, and the premium
templates, unlimited downloads and share links are unlocked. Entitlements are enforced
server-side in `lib/entitlements.ts`, so the UI changing is the *symptom*, not the proof.

**Idempotence.** One purchase normally produces two events (`transaction.paid`, then
`transaction.completed`) *and* a call from the success page, all racing for the same grant.
Reload the success page after a purchase: it must answer `alreadyFulfilled: true`, and
`currentPeriodEnd` must not move a second time. Re-sending a delivery from the
destination's log in the Paddle dashboard is the other way to force the collision.

---

## 9. Going live

Nothing carries over. In the live dashboard at <https://vendors.paddle.com>:

1. Complete Paddle's seller verification — a live account cannot transact until it is
   approved, and approval is not instant. Start it early.
2. Recreate the two products/prices; copy the new `pri_…` ids.
3. Create a live API key and a live client-side token (`live_…`).
4. Create a live notification destination pointing at the production domain, with the same
   two events, and copy its secret.
5. Set `PADDLE_ENVIRONMENT=production` **and** `NEXT_PUBLIC_PADDLE_ENVIRONMENT=production`
   — the exact word `production`, not `live`.
6. Check `NEXT_PUBLIC_SITE_URL` is the production origin.
7. Buy something real and refund it from the Paddle dashboard.

---

## 10. Troubleshooting

**503 `paddle-not-configured` on every payment route.** One of `PADDLE_API_KEY`,
`PADDLE_PRICE_PRO`, `PADDLE_PRICE_LIFETIME` is missing or blank. All three or nothing.

**The overlay never opens.** `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is missing, or it is an API
key rather than a client token, or the two `*_ENVIRONMENT` variables disagree. Public
variables are inlined at build time — a hosting provider needs a **rebuild**, not a
restart, after you change one.

**Every webhook is 401.** `PADDLE_WEBHOOK_SECRET` is missing or is another destination's.
Note that a 401 is the *correct* answer to an unverifiable webhook: the route cannot tell
"misconfigured" from "forged", and neither may grant a plan.

**409 `amount-mismatch` / `[paddle] webhook amount mismatch`.** The charge does not equal
the plan price in `lib/plans.ts`. Usually a dashboard price that was never updated after a
price change, or a localised override typed in the wrong magnitude.

**A payment in a currency other than `NEXT_PUBLIC_STORE_CURRENCY`.** Paddle localises
prices, so this is normal and the amount check deliberately loosens to "at least half the
list price" rather than demanding an exact figure. Two known weaknesses live in that rule —
see the `known defects` block at the bottom of `tests/lib/paddle.test.ts`. If you sell in
HUF or TWD, read it before you trust the recorded amount.

**Paddle keeps re-sending the same event.** It retries anything that is not a 2xx. The
route answers 200 to events it ignores for exactly this reason, so a repeating delivery
means the route threw. One known cause: a `Paddle-Signature` header with no `ts`/`h1` pair
currently produces a **500 rather than the intended 401**, because the rejected promise
from the SDK escapes `verifyWebhook`'s own catch — so Paddle retries it for hours. See the
`known defects` block in `tests/lib/paddle.test.ts`.
