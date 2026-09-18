# AYN CASA - single page website (no backend)

> **Owner / Author:** Abdul Rehman Khan · **Studio:** AYN CASA Interior Design Studio
> **Contact:** +91 88794 04352 (WhatsApp & calls) · **License:** see `COPYRIGHT.md`

A one-page site for an interior design studio: **Interior Design | Turning Houses into Homes**.
Everything a visitor needs is on one page: studio, services, projects, product collection with an
**inquiry list**, inquiry form, questions and contact - plus call and WhatsApp buttons.

**No server, no database, no build step.** Open `index.html` and it works.

> ⚠️ **Copyright:** This design and code belong to **Abdul Rehman Khan** (© 2026).
> Copying, cloning, or reusing it without written permission is not allowed —
> see `LICENSE`, `COPYRIGHT.md` and `TERMS.md` for the full terms —
> and `PROTECTION.md` for how the work is protected and enforced.

**This is NOT open source.** Copying, cloning, mirroring, redistributing, or
reusing the design, code or content — in whole or in part — is not permitted,
and neither is using it to train or condition any AI/ML model.

### Protection layers in this repository

| Layer | Where |
| --- | --- |
| Proprietary licence (all rights reserved) | `LICENSE` |
| Copyright & permitted-use notice | `COPYRIGHT.md` |
| Terms of use for visitors | `TERMS.md` |
| Enforcement playbook (private repo, DMCA, evidence) | `PROTECTION.md` |
| AI crawler blocking (~40 known LLM / dataset / mirror bots) | `robots.txt` |
| AI opt-out meta (`noai`, `noimageai`, TDM reservation) | `index.html` `<head>` |
| Copyright banner in every source file | `index.html`, `css/styles.css`, `js/app.js`, `js/data.js` |
| Visible ownership line | Site footer |

> **Important:** this repository is currently **public**. Making it **private**
> (GitHub → Settings → Danger Zone → Change repository visibility) is the single
> biggest improvement available — see `PROTECTION.md` section 2.

---

## Why a backend is not needed here

The usual reasons a small business site wants a backend are: storing form submissions, a product
database, logins, and online payments. This site covers all four without one:

| Normally needs a backend | How this build does it | Trade-off |
| --- | --- | --- |
| Product catalogue | `js/data.js` is the catalogue; products are plain objects | Editing a product = editing text and re-uploading one file |
| Inquiry / cart state | `localStorage` (`ayn.inquiry.v1`), survives refresh, per device | A visitor on another device sees an empty list |
| Form submission | The browser composes the message and opens WhatsApp (`wa.me`) or the visitor's mail app | You receive a normal WhatsApp/email message, not a dashboard entry |
| Search, filters, sorting | Done in the browser over the same list | Comfortable up to a few hundred products |
| Image galleries, lightbox | Generated in the browser | Real photos ship in assets/ and are already wired into js/data.js; swap the files any time |
| Members area / logins | Deliberately not used - a real login cannot be secured without a server | Add a backend only if this is ever needed |
| Online payments | Not used: a consultation plus a written quote is how this business already works | Money online needs a payment gateway and a server or hosted checkout |

Add a backend later only if you want submissions in a database (an inbox/CRM), stock and price sync
from suppliers, customer logins, or online payments. Until then this file set is complete.

---

## Files

```
index.html          the whole website (one page, anchor navigation)
css/styles.css      all styling - luxury-minimal theme, responsive, print friendly
js/data.js          ALL content: brand, services, products, projects, reviews, FAQs
js/app.js           ALL behaviour: rendering, inquiry list, filters, lightbox, forms
fonts/              self-hosted Cormorant Garamond (OFL licence, latin subset)
assets/             placeholder photos + CREDITS.md (licences and sources)
tests/smoke.js      optional headless test (36 assertions)
README.md           this file
```

Nothing is loaded from a CDN: the display font (Cormorant Garamond, used for all headings)
and every photo are served from this folder, so the site also works offline.

---

## Editing the content

Open `js/data.js` in any text editor. Each block of the page maps to one block of data:

| Page section | In `js/data.js` |
| --- | --- |
| Phone, WhatsApp, hours, tagline | `brand` |
| "15+ years / 240 homes" strip | `stats` |
| Scrolling strip under the hero | `highlights` |
| Services cards | `services` |
| Collection filter buttons | `categories` |
| Products | `products` |
| Projects | `projects` |
| Client words | `testimonials` |
| Questions | `faqs` |
| City dropdown in the inquiry form | `cities` |

Rules of thumb:

* Keep the quotes and commas exactly as they are. Text goes inside `'...'`.
* To add a product, copy an existing block from `{` to `},` and change the values.
* `price: null` shows **Price on request**. Put a number (`price: 12500`) and the card shows rupees.
* `colours: ['Walnut', 'Ivory']` becomes the finish dropdown on the card, and whatever the visitor
  picks is what arrives in the inquiry message.
* `badge: 'Made to order'` prints a small label on the card; leave it out for no label.
* Every product and project already points at photos in `assets/` (wired via `images: [...]`).
  To use your own photos: overwrite a file in `assets/` keeping the same name, or change the
  paths. Any missing file falls back to generated placeholder art, so nothing ever appears broken.

### Changing the phone number

Set `brand.phone` (digits, no spaces) and `brand.phoneDisplay` (how it should read). Every `tel:`
link, WhatsApp link, floating button and footer entry updates itself - no HTML editing needed.

### Turning on email

Fill `brand.email` (for example `'studio@ayncasa.in'`). A "Send by email" button then appears next to
the WhatsApp button, pre-filled with the same message.
---

## What works on the page

* **Collection** - search, category chips, sorting, "Show more", finish dropdown, *Add to inquiry*.
  *Photos and details* opens the item images in a lightbox.
* **Inquiry list** - quantity +/-, remove, clear, saved in the browser; a floating bar keeps the count
  visible and jumps back to the form.
* **Inquiry form** - validates name, phone (10 digits), city and email, then builds a message that
  contains the visitor's details *and* the pieces they picked, with finishes and quantities. They can
  **Send on WhatsApp**, copy it, or download it as `ayn-casa-inquiry.txt`.
* **Projects** - filter by city, galleries with keyboard support (Esc, arrow keys).
* **Ask price** next to each list item opens a WhatsApp message about that single piece.
* Accessibility basics: skip link, focus outlines, `aria-*` on interactive widgets, keyboard-closable
  lightbox, respects `prefers-reduced-motion`, plus a print stylesheet.

---

## Putting it online

Any static host works, because there is nothing to run:

* **Netlify / Vercel / Cloudflare Pages** - drag the folder in. No build command.
* **GitHub Pages** - push the folder and enable Pages.
* **Existing hosting / cPanel** - upload `index.html`, `css/` and `js/` by FTP.

To test locally, double-click `index.html`, or run a tiny server:

```
python -m http.server 8099   ->  http://localhost:8099
```

---

## Optional: automated smoke test

`tests/smoke.js` drives the whole page headlessly (jsdom): it renders every section, adds a piece to
the inquiry, changes quantities, filters, searches, submits the form with bad and good data, checks
the WhatsApp link contains the full message, and opens/closes the lightbox - 36 assertions.

```
npm install --no-save jsdom
node tests/smoke.js
```

jsdom is only needed for this test. The website itself has zero dependencies.

---

## Honest limitations

* The inquiry list lives in the visitor's browser. Clearing data or switching devices empties it.
  Nothing is lost on your side, because you receive the message itself.
* There is no admin screen: content changes are edits to `js/data.js`.
* No analytics and no tracking. If you want visitor numbers, add a light analytics snippet into the
  `<head>` of `index.html`.
* Phone number, prices, project photos and reviews in `js/data.js` are **placeholders** - replace them
  with the studio's real details before going live.
* Keep the phone number on the site correct: until an email is configured (or a backend added), it is
  the only delivery channel for inquiries.