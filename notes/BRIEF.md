# Project brief

## What this is
An independent, **unofficial** portfolio redesign of the homepage experience at
https://thekinemainthewoods.co.uk/ (the Kinema in the Woods cinema). It is a design concept,
not a replacement site.

## Agreed direction
Modern cinematic design blended with a woodland identity:
- **Atmospheric imagery** — moody, film-forward visuals with a sense of place.
- **Forest tones** — deep greens and natural darks as the base palette.
- **Warm ivory** — for type, surfaces and contrast against the forest tones.
- **Clear film browsing** — what's on, when, and how to book should be obvious at a glance.

Specific changes will be supplied by the project owner after reviewing the baseline and are
recorded in `CHANGELOG.md`.

## Constraints
- **Unofficial label:** every page carries a visible "Unofficial portfolio concept" notice and
  links to the official site for real bookings.
- **Demo-only interactions:** booking and seat selection are front-end demonstrations. No real
  payments, accounts, logins, network submissions or personal data collection.
- **Assets:** only original or appropriately licensed images, fonts and icons in `site/`. Record
  the source and licence of every third-party asset in `CHANGELOG.md`. Nothing from the reference
  snapshot is reused unless permission is established and recorded.
- **Hosting:** GitHub Pages project site at `https://thomas-bailey-9.github.io/kinema-redesign/`.
  All in-site links and asset paths are relative (`assets/css/main.css`, not `/assets/...`) so the
  site works both locally and under the `/kinema-redesign/` sub-path. Planned deployment (not yet
  set up): a small GitHub Actions workflow that publishes `site/` only, so `notes/`, `tools/` and
  the README are not served.
- **Lightweight:** plain static HTML/CSS/JS; no build step or frameworks unless a later decision
  justifies one.
- **Accessibility:** semantic HTML, keyboard-operable controls, WCAG AA text contrast, respect
  `prefers-reduced-motion`; responsive from ~360 px phones to wide desktop.

## Before/after
Baseline screenshots of the reference snapshot (desktop 1440 px, phone 390 px) are kept locally in
`reference/screenshots/` (git-ignored) and used for private before/after comparison.
