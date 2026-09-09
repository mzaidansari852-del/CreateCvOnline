# Polar onboarding — what to put in each field

Everything below is drawn from the live product (`lib/plans.ts`, the marketing pages
and the refund policy). Do not embellish it: the reviewer will open the site, and a
claim that is not visible there is what turns a review into a rejection.

---

## Account-level: "Describe your product"

> CreateCVOnline (https://createcvonline.com) is a web-based CV and résumé builder for
> job seekers. Users sign up with email or Google, write their CV in a browser editor
> with a live preview, choose from 56 professionally designed templates, and export the
> finished document as a print-ready PDF. The site is available in English, German,
> French and Dutch.
>
> It is self-serve SaaS with no physical goods and no shipping. Delivery is instant and
> entirely digital: a successful payment upgrades the signed-in account's entitlement,
> which unlocks the paid features immediately in the same session.
>
> There are three plans. Free ($0) allows 2 saved CVs and 5 PDF downloads per month.
> Pro ($9/month) unlocks all 56 templates, unlimited CVs and downloads, full typography
> and colour customisation, custom sections, a shareable public CV link, and removes the
> CreateCVOnline credit line from exported PDFs. Lifetime ($69 one-time) grants the same
> feature set permanently, including future templates.
>
> Customers are individual job applicants, mainly in the EU, UK and North America. We
> offer a 14-day refund for any reason, published at
> https://createcvonline.com/refund-policy, and support runs through
> support@createcvonline.com. Terms, privacy and cookie policies are published and
> linked in the site footer on every page.

### If the form gives you a short field instead

> A web-based CV and résumé builder. Job seekers write their CV in a browser editor with
> a live preview, pick from 56 templates, and export a print-ready PDF. Sold as Free,
> Pro ($9/month) and Lifetime ($69 one-time) plans; delivery is instant and digital via
> the signed-in account. 14-day refund policy.

---

## Product-level descriptions

These become the line items your customers see on the Polar checkout and on their
receipt, so they must match the pricing page word for word in substance.

### Product 1 — "CreateCVOnline Pro" — $9.00 / month (recurring)

> Everything you need for an active job search. All 56 CV templates, unlimited saved CVs
> and unlimited PDF downloads, full customisation of fonts, colours and spacing, custom
> sections and section reordering, a shareable public CV link, and no CreateCVOnline
> credit on your exported PDF. Billed monthly, cancel any time.

### Product 2 — "CreateCVOnline Lifetime" — $69.00 (one-time)

> Everything in Pro, bought once and kept permanently. All 56 templates plus every
> template added in future, unlimited CVs and PDF downloads, full customisation,
> shareable CV links, no credit line on exports, and priority email support. One
> payment, no renewal.

---

## Other fields the form will ask for

| Field | Answer |
| --- | --- |
| Website | https://createcvonline.com |
| Category / industry | SaaS — productivity / career tools |
| Business model | Subscription + one-time digital licence |
| Physical goods | No |
| Delivery method | Instant, digital — account entitlement unlocked on payment |
| Support contact | support@createcvonline.com |
| Refund policy URL | https://createcvonline.com/refund-policy |
| Terms URL | https://createcvonline.com/terms |
| Privacy URL | https://createcvonline.com/privacy |

---

## Before you submit

The reviewer opens the site. Make sure that on the day you apply:

1. The site is live at the domain you give, not a Vercel preview URL.
2. Pricing, Terms, Privacy, Refund and Contact are all reachable from the footer.
3. The pricing page shows $9 and $69 — the same numbers as the products you create.
4. Signing up and building a free CV works end to end, so they can see the product
   rather than take your word for it.
5. Nothing on the site still names Paddle as the merchant of record. That is tracked
   separately — see the copy migration in the payments work.
