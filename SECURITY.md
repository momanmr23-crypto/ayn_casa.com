# Security Policy

## Supported version
This is a static, single-page website (HTML + CSS + vanilla JavaScript) with
no server, database, or user accounts. The current deployment is the only
supported version.

## Where security applies
Because there is no backend, the attack surface is small, but these points
are maintained:

1. **No sensitive data is collected or stored.** The inquiry list lives only
   in the visitor's own browser (`localStorage`) and is sent — by the visitor
   themselves — via WhatsApp. Nothing is transmitted to any server.
2. **No third-party scripts or trackers.** All JS is local; fonts are
   self-hosted. No analytics, ads, or external embeds that could inject code.
3. **External links** (WhatsApp deep links, Instagram, telephone) are plain
   links — they never receive form data silently.
4. **Input handling:** inquiry form fields are rendered as text (never as
   raw HTML), preventing injection through user-typed product names or notes.

## Reporting a vulnerability
If you find a security issue (e.g. XSS via a form field, a malicious link
injection, or anything else):

- **Email:** kabdulrehman8169@gmail.com
- **WhatsApp:** +91 72083 80553

Please include a description, steps to reproduce, and — if possible — a
suggested fix. Do not publicly disclose the issue before it is fixed.

**Developer / maintainer:** Abdul Rehman Khan
