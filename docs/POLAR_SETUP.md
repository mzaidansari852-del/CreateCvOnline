# Polar setup

Everything needed to take a payment, in the order you need it. Allow about half an hour,
most of which is waiting for Polar to approve the organisation.

Polar replaced Paddle here because **Paddle declined the seller account during review**.
The replacement had to be another *merchant of record* rather than a plain payment
processor: this site sells to Germany, France and the Netherlands, and going direct with
Stripe would mean registering for EU VAT OSS and filing it ourselves. Polar acts as
merchant of record and authorised reseller — it sells to the customer, charges the card,
and owes the VAT.

---

## Contents

1. [Before you start](#1-before-you-start)
2. [Create the organisation](#2-create-the-organisation)
3. [Create the two products](#3-create-the-two-products)
4. [Create an access token](#4-create-an-access-token)
5. [Create the webhook](#5-create-the-webhook)
6. [Fill in the environment](#6-fill-in-the-environment)
7. [Test the whole flow in sandbox](#7-test-the-whole-flow-in-sandbox)
8. [Going live](#8-going-live)
9. [When something is wrong](#9-when-something-is-wrong)

---

## 1. Before you start

Two things about Polar that differ from Paddle, both of which change how you work:

**The checkout is a redirect, not an overlay.** Pressing a buy button sends the customer to
`polar.sh`. Nothing of Polar's loads on our pages — no script, no iframe, no cookie, and
therefore no Content Security Policy entry. If you ever see advice about allowing a payment
CDN in the CSP, it does not apply here.

**Card payments only.** Polar processes through Stripe and its own legal pages describe
only card processing. There is no PayPal. Paddle's overlay offered PayPal, Apple Pay and
Google Pay, so this is a genuine reduction in payment methods — the marketing copy was
changed to stop promising them, and it must not be changed back without checking Polar's
current documentation.

---

## 2. Create the organisation

Sandbox and production are separate accounts with separate logins. Do sandbox first.

| Environment | Dashboard |
| --- | --- |
| Sandbox | <https://sandbox.polar.sh> |
| Production | <https://polar.sh/dashboard> |

Production requires review. The reviewer opens the site, so before you submit make sure
that the live domain resolves, that Pricing / Terms / Privacy / Refund / Contact are all
reachable from the footer, and that a visitor can sign up and build a free CV. The
application copy — what to write in each field — is in
[`docs/payments/POLAR_APPLICATION.md`](payments/POLAR_APPLICATION.md).

---

## 3. Create the two products

**Products → New product.** Create exactly two, and make the prices match `lib/plans.ts`
or payments will be refused by our own verification:

| Product | Type | Price |
| --- | --- | --- |
| CreateCVOnline Pro | Recurring, monthly | 9.00 USD |
| CreateCVOnline Lifetime | One-time | 69.00 USD |

Copy each product's **ID** — a UUID such as `9d1b4a7e-3c2f-4e51-8a06-7b2c9f4e1d33`. That is
the value the environment wants. It is not the price id and not the organisation id; a
non-UUID in those variables makes the whole gateway read as unconfigured, deliberately, so
that a mistake here shows as "payments unavailable" rather than as a button that fails on
the customer's card.

---

## 4. Create an access token

**Settings → Developers → New token.**

Choose an **organization** token (`polar_oat_…`), not a personal one (`polar_pat_…`). A
personal token is tied to one human: it dies when that person rotates it or leaves the
organisation, and takes checkout down with it. The app accepts a personal token but logs a
warning naming this problem.

The token is shown once. It is secret — server-side only, never in a `NEXT_PUBLIC_`
variable. Unlike Paddle's keys it does **not** encode its environment, which matters in
[section 8](#8-going-live).

---

## 5. Create the webhook

**Settings → Webhooks → Add endpoint.**

| Field | Value |
| --- | --- |
| URL | `https://<your-domain>/api/payments/polar/webhook` |
| Format | Raw |
| Events | `order.paid` and `order.refunded` |

`order.paid` is the event that grants a plan; it also fires on each subscription renewal,
which is how a monthly Pro plan extends. `order.refunded` marks the payment refunded and
takes the plan back — without it, a refunded **Lifetime** purchase would keep working
forever, because a lifetime entitlement has no expiry to reach.

Copy the signing secret (`whsec_…`) into `POLAR_WEBHOOK_SECRET`.

> **Do not "upgrade" `@polar-sh/sdk` to the `latest` tag.**
>
> Polar moved webhook signing to Standard Webhooks on 8 September 2026. Secrets generated
> before that date use an older Polar HMAC scheme, and the two derive *different* signing
> keys from the same `whsec_…` string. The pinned `1.0.0-alpha.20` derives both and accepts
> either. The `0.49.x` release that npm tags `latest` implements only the old scheme, so a
> secret generated after the cutover fails every signature check — checkout keeps working
> while fulfilment silently stops. The version is pinned exactly for this reason.

---

## 6. Fill in the environment

```bash
POLAR_ENVIRONMENT=sandbox
POLAR_ACCESS_TOKEN=polar_oat_...
POLAR_PRODUCT_PRO=<uuid>
POLAR_PRODUCT_LIFETIME=<uuid>
POLAR_WEBHOOK_SECRET=whsec_...
```

The gateway switches on only when the token **and** both product ids are present and
well-formed. The webhook secret is deliberately not part of that test: a deployment that
can take a payment but cannot yet confirm one is recoverable by reconciliation, whereas one
that cannot take a payment at all is not.

Confirm what the running build actually received:

```bash
curl https://<your-domain>/api/payments/polar/status
```

---

## 7. Test the whole flow in sandbox

1. Sign in, open `/pricing`, choose Pro.
2. Press the buy button. You should be sent to `polar.sh`.
3. Pay with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.
4. You should land back on `/payment/success?plan=pro&checkout_id=…` and see the plan
   unlock within a second or two.
5. Check `/admin/payments` for the ledger row, and Polar's webhook delivery log for a 200.

Worth testing deliberately, because each is a path customers reach and tests cannot cover
end to end:

- **Abandoning the checkout.** Press back from Polar. You should land on `/payment/cancel`,
  not a 404, and nothing should be granted.
- **A refund.** Refund the order in Polar. The ledger row should read refunded and the
  account should drop back to Free.
- **A renewal.** Subscription renewals arrive as an `order.paid` with no `checkout_id`, and
  open a *new* ledger row keyed by the order id. If renewals landed on the first purchase's
  row they would be seen as already fulfilled and access would silently never extend.

---

## 8. Going live

Switch **all five** variables together, from the production dashboard: a new access token,
both production product ids, the production webhook secret, and
`POLAR_ENVIRONMENT=production`.

> **Read this part carefully — Polar gives you less protection than Paddle did.**
>
> A Paddle API key announced its own environment in its prefix, so a half-finished go-live
> could be caught by comparing the credentials against each other. Polar's tokens use the
> same `polar_oat_` prefix in both environments. **Nothing can detect a sandbox token
> deployed to production** except the `POLAR_ENVIRONMENT` variable itself.
>
> That is why `lib/env.ts` refuses to build when `POLAR_ENVIRONMENT=sandbox` on a Vercel
> production deployment. A sandbox payment takes no real money but still satisfies every
> check that grants a plan, so without that guard anyone could pay with a test card and be
> granted Pro for free. Do not work around it.

The nearest thing to a real environment check is the probe, because a token pointed at the
wrong environment cannot see the other one's products:

```bash
curl 'https://<your-domain>/api/payments/polar/status?probe=1'
```

---

## 9. When something is wrong

| Symptom | Cause |
| --- | --- |
| Checkout says payments are unavailable | Token or a product id missing or malformed. Check `/api/payments/polar/status`. |
| "We could not start the checkout" | Token rejected, or a product id from the other environment. Run the probe. |
| Customer paid, plan not granted | Webhook. Check the delivery log in Polar for 403s — that means the signing secret is wrong, or the SDK was downgraded to `0.49.x` (see section 5). |
| Every webhook returns 403 | `POLAR_WEBHOOK_SECRET` unset or wrong. |
| Every webhook returns 503 | The gateway is not configured on the deployment receiving them. |
| Ledger row says failed with a product mismatch | The product the money was billed against is not the one configured for that plan. Check both product ids. |
| Renewals never extend access | `order.paid` not subscribed on the webhook endpoint. |

`npm run polar:doctor` walks the reachable parts of this from outside.
