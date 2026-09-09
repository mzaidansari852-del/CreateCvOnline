# PayPal setup — the interim gateway

PayPal is here because nothing else can take money yet. Paddle declined the seller account
during review, and Polar's account is not live. This gets a working checkout up in about
fifteen minutes, and is meant to be turned off again.

**Read this first, before anything below.**

> PayPal is a **payment processor, not a merchant of record**. It moves the money and stops
> there. That makes *you* the seller of record on every sale — including sales to Germany,
> France and the Netherlands, where you owe the VAT and are the party responsible for
> registering under EU VAT OSS and filing it.
>
> Polar and Paddle would both have owed that instead of you. That is the entire reason they
> were chosen over going direct, and it is the specific thing you give up by running on
> PayPal. Nothing in this codebase computes, collects or reports VAT: the plan price is
> charged as a flat amount with no tax component, so every EU sale taken this way accrues an
> obligation you have to settle outside the application.
>
> This is a deliberate, reversible trade for a short interim. It is a bad permanent
> arrangement. Finish the Polar application (`docs/payments/POLAR_APPLICATION.md`) and turn
> PayPal off.

---

## 1. Create the REST app

1. Sign in at <https://developer.paypal.com/dashboard/applications>.
2. You need a **PayPal Business account** to take live payments. A personal account can
   create sandbox apps but cannot go live.
3. **Apps & Credentials** → toggle **Sandbox** → **Create App**. Name it anything;
   "CreateCVOnline" is fine.
4. Copy the **Client ID** and, under it, **Secret** (press *Show*).

Both are around 80 characters. If either looks noticeably shorter, it was truncated when
you copied it — the console wraps long values across two lines and select-and-copy takes
half. `lib/env.ts` strips whitespace and quotes for you, but it cannot invent the missing
characters, and the symptom is an unexplained 401 from PayPal.

## 2. Set the environment variables

```bash
PAYPAL_ENVIRONMENT=sandbox     # "live" in production — PayPal's word, not "production"
PAYPAL_CLIENT_ID=A…            # not secret; it appears in the checkout URL
PAYPAL_CLIENT_SECRET=E…        # SECRET
PAYPAL_WEBHOOK_ID=             # step 4
```

`NEXT_PUBLIC_STORE_CURRENCY` is shared with Polar and must be a currency your PayPal
business account can actually receive. PayPal rejects an order in a currency the account
does not support, and the failure arrives at the customer as "PayPal could not start this
payment".

The gateway switches on as soon as the client id and secret are both set. The webhook id is
not part of that test — see step 4 for what you lose without it.

## 3. Check it before you touch the checkout

```bash
curl https://your-site/api/payments/paypal/status?probe=1
```

`probe=1` asks PayPal for an access token with the credentials the running build actually
received, and returns PayPal's own error text when they are refused. That distinguishes the
three failures that look identical from the outside: credentials that are wrong, valid
credentials for the *other* environment, and a client id paired with the wrong secret.

`credentialShape.looksTruncated` is the answer to the most common one.

Without `probe=1` the endpoint is booleans plus credential *lengths*, which is safe to leave
public — the client id is not secret and no part of the secret is ever returned.

`/admin/settings` reports the same state in prose, alongside every other gateway.

## 4. The webhook

**Apps & Credentials** → your app → scroll to **Webhooks** → **Add Webhook**.

- URL: `https://your-domain.com/api/payments/paypal/webhook`
- Events:
  - `CHECKOUT.ORDER.APPROVED`
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.DENIED`
  - `PAYMENT.CAPTURE.REFUNDED`
  - `PAYMENT.CAPTURE.REVERSED`
  - `CHECKOUT.ORDER.VOIDED`

Copy the **Webhook ID** it gives you into `PAYPAL_WEBHOOK_ID` and redeploy.

Without it, `app/api/payments/paypal/webhook/route.ts` answers 503 and acts on nothing —
because an event whose signature cannot be verified must never be allowed to grant paid
access, and an unauthenticated endpoint that grants entitlements would be the worst bug in
this codebase.

Checkout still works without it: the customer's browser calls the capture endpoint on
return and the plan is granted there. What you lose is the safety net for everything that
does not go through a browser — a tab closed mid-redirect, a payment that settles
asynchronously, and any refund issued later from the PayPal dashboard.

Note the difference from Polar here. Polar's webhook is the *authoritative* grant and the
browser's verify call is the impatient shortcut. PayPal's is the reverse: the capture is
sequential and happens in the browser, and the webhook is the backstop.

## 5. Test the whole flow in sandbox

Sandbox needs a test buyer: **Testing Tools → Sandbox Accounts**. PayPal creates a personal
one automatically; open it, choose *View/Edit*, and note the email and system-generated
password.

1. Sign in to your site, open `/pricing`, choose Pro.
2. Press the pay button. You should be sent to `sandbox.paypal.com`.
3. Log in as the sandbox buyer and approve.
4. You should land back on `/payment/success?plan=pro&token=…&PayerID=…` and see the plan
   unlock within a second or two.
5. Check `/admin/payments` for the ledger row, and PayPal's webhook event log for a 200.

Worth doing at least once each: close the tab immediately after approving (the webhook
should still grant the plan), and reload the success URL afterwards (you should get "already
active", not a second charge).

## 6. The copy that becomes wrong — read before going live

**This is the one part of the switch the code cannot do for you, and it is not optional.**

The site's marketing and legal pages currently tell customers that **Polar is the merchant
of record**: that Polar works out and remits the VAT due in their country, that the charge on
their statement reads Polar rather than CreateCVOnline, that Polar issues the receipt and the
refund, and — in the privacy policy — that Polar is an independent data controller for the
payment.

Under PayPal every one of those statements is false. PayPal is a processor: the statement
reads your merchant name, the receipt is PayPal's, the VAT is yours, and Polar is not
involved in the transaction at all.

These are tax and consumer-law claims on published legal pages, so what they should say
instead is a decision for whoever is responsible for the business's VAT position — not
something to guess at. The passages are listed here so none is missed:

| File | What it claims |
| --- | --- |
| `app/(marketing)/pricing/page.tsx` | Payment-methods FAQ, currency FAQ, the "Payment methods" panel and the tax panel |
| `app/(marketing)/faq/page.tsx` | "Which payment methods do you accept?", "What currency will I be charged in?", and who receives the card details |
| `app/(marketing)/terms/page.tsx` | Names Polar as merchant of record and authorised reseller, and describes the statement line |
| `app/(marketing)/privacy/page.tsx` | Names Polar as an independent controller for payment data |
| `app/(marketing)/refund-policy/page.tsx` | Says Polar issues the original charge and the refund, and names the statement line |
| `app/(marketing)/about/page.tsx` | One sentence on who handles the sale |
| `app/de/de-copy.ts`, `app/fr/fr-copy.ts`, `app/nl/nl-copy.ts` | The same payment answers in German, French and Dutch |
| `app/fr/fr-landing-copy.ts` | The payment answer repeated on the French landing pages |
| `app/de/agb`, `app/fr/conditions-generales`, `app/nl/voorwaarden` and the matching privacy and refund pages | The localised legal equivalents |

`lib/i18n/copy/dashboard.ts` does **not** need changing — the in-product checkout copy is
already gateway-aware. `confirmationLede` takes the gateway's name and the success page
passes whichever one actually took the payment.

A quick way to find anything this table misses:

```bash
grep -rn -i "merchant of record\|Verkäufer auf\|vendeur officiel\|officiële verkoper" app/
```

If PayPal is running *alongside* Polar rather than instead of it, the claims are true for one
gateway and false for the other, and the copy needs to say which — the checkout picker makes
the choice visible to the customer, so the pages can too.

---

## 7. Going live

Switch **all four together**, in one deploy:

```bash
PAYPAL_ENVIRONMENT=live
PAYPAL_CLIENT_ID=<from the Live tab>
PAYPAL_CLIENT_SECRET=<from the Live tab>
PAYPAL_WEBHOOK_ID=<from a new webhook created on the live app>
```

The live app is a separate app with separate credentials and a separate webhook. Nothing
carries over from sandbox.

`lib/env.ts` **refuses to build** when `PAYPAL_ENVIRONMENT` is `sandbox` on a Vercel
production deployment. That guard is doing real work: a sandbox order captures as
`COMPLETED` for the exact plan price, and `captureOrder` cannot tell that from a real
payment — so anyone who found the checkout would be granted a genuine Pro entitlement for
nothing. Nothing else can catch it, because a PayPal client id announces nothing about its
environment.

Preview deployments are exempt, because running those against sandbox is correct.

## 8. Turning it off

Unset `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` and redeploy. That is the whole
operation: `availableGateways()` stops listing PayPal, the checkout page stops offering it
and (with Polar configured) drops the picker for a single button.

Existing PayPal rows in the payments ledger keep displaying in the admin console. They can
no longer be re-checked against PayPal's API, which is deliberate — `gatewayFor('paypal')`
throws rather than falling back to Polar, because asking Polar about a payment it never took
returns "not found", and that reads as "this customer did not pay".

Delete the webhook in the PayPal dashboard too, or it will retry against a route that
answers 503 for a week.

## What runs where

| File | Does |
| --- | --- |
| `lib/payments/paypal.ts` | The gateway: order creation, capture, webhook signature verification, the amount check |
| `app/api/payments/paypal/create-order/route.ts` | Starts an order. Receives a plan id and never a price |
| `app/api/payments/paypal/capture/route.ts` | Captures and verifies on return. Four checks before anything is granted |
| `app/api/payments/paypal/webhook/route.ts` | The backstop for everything the browser misses |
| `app/api/payments/paypal/status/route.ts` | Configuration diagnostics, `?probe=1` for a live credential check |
| `components/payments/PayPalCheckoutButton.tsx` | The button. Sends a plan id, receives a URL, navigates |
| `components/payments/CheckoutMethodChoice.tsx` | The picker, mounted only when both gateways are live |
| `tests/lib/paypal.test.ts` | The amount check, the attribution parser, gateway selection |

## Security properties worth not breaking

- **The browser never sends a price.** `createOrder` receives a plan id and reads the amount
  from `lib/plans.ts`. A tampered client can ask for a different plan; it cannot change what
  that plan costs.
- **A payment is only real once PayPal says so.** The return URL is treated as a question,
  never as proof. `captureOrder` re-reads the order from PayPal's API and compares the
  captured amount *and* currency against the plan before anything is granted.
- **This is load-bearing in a way it is not under Polar.** Polar holds the price at the
  provider — a checkout is created against a product id and Polar decides the amount. Under
  PayPal the amount is ours, so `paypalCaptureMatchesPlan` is not one safeguard among
  several; it is the only thing that notices when the money that moved is not the money that
  was owed.
- **Fulfilment is idempotent**, keyed by order id in a Firestore transaction, so the browser
  capture and the webhook cannot both grant.
- **The order must belong to the caller.** The capture route looks the order up in our own
  ledger first, which is what stops a signed-in user pasting somebody else's order id.
