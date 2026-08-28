# FORFIN 2026 — Event Website

A modern, responsive marketing website for **FORFIN 2026 (Fortifying Finance)** —
*AI-Driven Cyber Resilience for the Digital Future*.
1<sup>st</sup> & 2<sup>nd</sup> October 2026 · White Sands Resort & Conference Centre, Dar es Salaam, Tanzania.
An event by **Computer Centre Tanzania (CCTZ)**.

Built as a dependency-free static site (plain HTML, CSS and vanilla JS) — no build
step, no frameworks. Just open it or serve it.

---

## Folder structure

```
forfin-2026-website/
├── index.html          # main one-page site (incl. "Moments from 2025" teaser)
├── agenda.html         # full two-day agenda
├── gallery.html        # photo gallery (bento mosaic + filter + lightbox)
├── css/
│   └── styles.css      # all styling (brand tokens at the top)
├── js/
│   └── main.js         # nav, countdown, particle network, reveal, counters, tabs, gallery + lightbox
├── assets/
│   ├── forfin-logo.png         # navy logo (light backgrounds)
│   ├── forfin-logo-white.png   # white logo (dark nav / footer)
│   ├── gallery/                # last-year event photos (photo-01.jpg … photo-12.jpg)
│   └── sponsors/               # partner logos (fortinet, thales, idira, hpe, defenix, evad)
└── README.md
```

## Open it in VS Code

1. **File → Open Folder…** and select `forfin-2026-website`.
2. Recommended: install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server** (live reload while you edit).

> You can also just double-click `index.html` to open it in a browser. The Google
> Fonts and the venue map need an internet connection; everything else works offline.

## Editing essentials

- **Colours & fonts:** edit the CSS variables at the top of `css/styles.css`
  (`--navy`, `--cyan`, etc.).
- **Dates / countdown:** the countdown target is in `js/main.js`
  (`new Date("2026-10-01T09:00:00+03:00")`). Update the date text in `index.html`
  (hero `.chip`, venue, footer) to match.
- **Agenda:** edit the `.ag-row` items in `index.html` (preview) and `agenda.html` (full).
- **Sponsors:** drop new logos into `assets/sponsors/` and update the `<img>` tags in
  the `#partners` section. Logos were pre-processed to sit on light cards.
- **Registration form:** the form is a front-end stub (`onsubmit="return false"`).
  Connect it to your provider (e.g. Microsoft Forms, Mailchimp, a backend endpoint),
  or replace it with a link to your registration page.
- **Contact:** email/phone/socials live in the footer and the CTA section.

## Notes

- The **gallery** photos in `assets/gallery/` are branded placeholders — just replace
  `photo-01.jpg … photo-12.jpg` with your real FORFIN 2025 images (any size; tiles crop
  to fit). To add more, copy a `<figure class="tile">…</figure>` block in `gallery.html`
  and point it at a new file. Tile sizes: `tile--big`, `tile--wide`, `tile--tall`, or
  default. The filter uses `data-cat` (keynote / panel / workshop / networking / venue / awards).
- Speaker cards are placeholders ("To be announced") — swap in photos and names when confirmed.
- Sponsor logos are the official brand marks supplied; keep their proportions when replacing.
- The confirmed event dates are **1<sup>st</sup> & 2<sup>nd</sup> October 2026**.
- "Defenix" is spelled per the supplied logo.

© 2026 FORFIN · Computer Centre Tanzania.
