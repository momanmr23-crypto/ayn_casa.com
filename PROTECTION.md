# Protection & Enforcement Playbook

**Owner:** Abdul Rehman Khan — AYN CASA Interior Design Studio
**Last updated:** February 2026

This document explains how the work is protected, what has already been put in
place, and exactly what to do if someone copies the site.

> **Reality check first.** A publicly viewable website can always be read,
> screenshotted, or described to an AI. No technical measure makes that
> impossible. What *is* achievable — and what this document sets up — is:
> **private source code, explicit legal ownership, crawler blocking, and a fast
> enforceable takedown path.** That is the strongest position available.
>
> *This is practical guidance, not legal advice. For litigation or a formal
> trademark filing, consult a lawyer.*

---

## 1. What is already in place

| Layer | File / setting | What it does |
|---|---|---|
| Proprietary licence | `LICENSE` | Explicit "all rights reserved" — no permission granted to copy, reuse, or train AI on the work |
| Copyright notice | `COPYRIGHT.md` | States authorship and ownership; lists prohibited and permitted uses |
| Source-visible warning | `index.html` header comment | Anyone viewing source sees the copyright and prohibition |
| Source file banners | `css/styles.css`, `js/app.js`, `js/data.js` | Every source file carries a copyright header — copies are traceable |
| AI opt-out meta | `index.html` — `noai, noimageai`, `tdm-reservation` | Signals that the content may not be used for AI training (TDM reservation under EU law) |
| Crawler blocking | `robots.txt` | Disallows ~40 named AI/LLM crawlers, dataset builders, and site-mirroring tools |
| Visible ownership | Footer line on every page | "Website design & code © Abdul Rehman Khan. Unauthorized copying prohibited." |
| Author metadata | `<meta name="author">`, `<meta name="copyright">` | Machine-readable authorship |
| Terms for visitors | `TERMS.md` | Contractual terms of use covering IP and reuse |
| Security contact | `SECURITY.md` | Contact route for reports |

`robots.txt` is served automatically at `https://<your-live-url>/robots.txt` —
no configuration needed.

---

## 2. The main remaining exposure: the public source repository

`robots.txt` stops **polite automated crawlers**. It does **not** stop a person
from opening the public GitHub repository and downloading the source, or from
pasting the live URL into an AI tool.

**The repository being public is the single biggest exposure.** Fix it:

### Option A — Make the repository private (recommended)

1. GitHub → your repository → **Settings**
2. Scroll to the bottom → **Danger Zone** → **Change repository visibility**
3. Choose **Make private** → type the repository name to confirm

Result: the source code is no longer downloadable by the public.

> **Note on GitHub Pages:** GitHub Pages is free for **public** repositories.
> For **private** repositories, Pages requires **GitHub Pro** (about US$4/month)
> or a Team/Enterprise plan — stated in GitHub's own documentation. Your live
> site stays publicly viewable either way; only the *code* becomes private.
> That is exactly the split you want: shareable link, hidden source.

### Option B — Keep the code off GitHub entirely

Deploy the folder directly to a host that does not link to a repository:

- **Netlify Drop** — drag the project folder onto the page; you get a shareable
  URL with no public repository behind it. Free.
- **Cloudflare Pages** — free plan supports deploying from a **private**
  repository, so the code stays hidden and updates still deploy automatically.
  Also lets you enable **Block AI bots** at the edge.

Either way: **the repository must be private before the link is shared widely.**

### Option C — Access-controlled site

If the site must not be readable by strangers at all, put it behind
**Cloudflare Zero Trust Access** (email one-time-PIN gate). The link then
requires a login, so neither an AI nor a person can read it without permission.
Trade-off: clients need the PIN, so it is not a "just open the link" experience.

---

## 3. Host-level AI blocking (optional, on top of robots.txt)

If the site is later hosted on **Cloudflare** (free), enable:

- **Security → Bots → Block AI bots** — blocks known AI crawlers at the network
  edge, before they reach the site.
- Optionally a WAF rule blocking requests whose `User-Agent` contains
  `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `PerplexityBot`, `meta-externalagent`.

This reinforces `robots.txt`, which only works on bots that choose to obey it.

---

## 4. If someone copies the site — do this

**Step 1 — Preserve evidence immediately (before contacting anyone).**

- Screenshot their pages, full-page, **including the URL bar and the date**.
- Save the page: `Ctrl+S` → "Web page, complete", or
  `wget --mirror --page-requisites https://their-site.com` if comfortable with a terminal.
- Submit their URL to **web.archive.org** ("Save Page Now") to create a
  third-party timestamped copy you did not create yourself.
- Write down the date you first noticed it, plus any messages in which they
  received your design or the link.

**Step 2 — Compare, don't just assert.** Note the specific similarities:
identical layout order, same section headings, matching copy, identical spacing
and colours, copied code comments. Matching *text* and *code* is far stronger
than matching "a similar look", because layouts and general ideas are not
protected by copyright — only the specific expression is.

**Step 3 — Send a takedown notice.**

- **Hosting provider:** a **DMCA takedown notice** to their host (GitHub,
  Netlify, Cloudflare, GoDaddy, Hostinger, etc.). Every host publishes a DMCA
  agent. GitHub's form: `https://github.com/contact/dmca`
- **Platform:** if it appears on a marketplace or template site, use their
  IP report form.
- **Domain registrar:** if the domain itself impersonates the brand, complain to
  the registrar, or use the `.in` / `.com` dispute resolution process.

**Step 4 — Escalate only if needed.** If they ignore a takedown, a lawyer's
letter usually ends it. Keep every document; a documented refusal strengthens a
claim.

---

## 5. Preventive measures for the current situation

Given the client may take the design elsewhere, in order of importance:

1. **Do not hand over the source repository or the raw project folder until you
   are paid in full.** The live link is a preview, not a delivery. Keep the
   repository private (section 2).
2. **Put the agreement in writing** — even a WhatsApp message stating scope, fee,
   payment stages, and that the design and code remain your property until final
   payment, then transfer on payment.
3. **Watermark previews.** Share screenshots or the live link — never the source
   files — during discussion.
4. **Keep dated records** of everything you sent and when.
5. **Use a simple written contract** with future clients covering: scope,
   revision limits, payment schedule, IP ownership until final payment, and no
   reuse of the design.
6. **Make the design his by content, not just code.** Replace the placeholder
   stock photos with his real project photos. This code is a commodity pattern
   that anyone can recreate from scratch; his photography, brand, and client
   relationships are what cannot be copied. See `assets/CREDITS.md`.
7. **Trademark:** if the "AYN CASA" name will be used long-term, a trademark
   application gives a much stronger enforcement position than copyright alone.
   A lawyer's clearance search is the right first step.

---

## 6. What is *not* worth doing

- **JavaScript obfuscation / disabling right-click** — trivially bypassed, breaks
  accessibility and SEO, and stops nobody determined. Not recommended.
- **Blocking all search engines** — prevents clients from finding the studio.
  Only AI and mirroring crawlers are blocked, deliberately.
- **Relying on `robots.txt` alone** — it is honoured only by bots that choose to.
  It is one layer, not the whole defence.

---

## 7. Quick reference

| Question | Answer |
|---|---|
| Can I stop AI from ever reading the site? | No — not while it is publicly viewable. |
| Biggest single improvement available? | Make the GitHub repository private. |
| Does that break the shareable link? | No — the live site stays public, the code does not. |
| Cost? | Free for a private repo; ~US$4/month if you want Pages served from it. Alternatives: Netlify Drop, Cloudflare Pages. |
| What do I do if it is cloned? | Preserve evidence → DMCA to the host → escalate with a lawyer. |
| What should I never share before payment? | The source repository, the raw project folder, unwatermarked full-resolution assets. |

---

**Contact for licensing or infringement reports**
Abdul Rehman Khan — AYN CASA Interior Design Studio
Email: kabdulrehman8169@gmail.com · Phone / WhatsApp: +91 72083 80553