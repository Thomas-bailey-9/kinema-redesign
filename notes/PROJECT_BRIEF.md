# Project brief

Agreed scope for the Kinema in the Woods redesign concept. Supersedes the earlier `BRIEF.md`
(merged here on 17 Nov 2026). Design decisions for each area are logged in `CHANGELOG.md`;
reference-snapshot findings are in `REFERENCE.md`.

## Purpose
An independent, **unofficial** redesign concept for The Kinema in the Woods
(https://thekinemainthewoods.co.uk/), built as a portfolio project demonstrating creative
direction, visual design decisions and improvements to the visitor experience. It is a design
concept, not a replacement site, and is not affiliated with or endorsed by the cinema.

**Deliverables**
1. A responsive demonstration website, prepared for GitHub Pages.
2. A before-and-after case study covering the ten design areas below.
3. A short slideshow or comparison presentation explaining what changed and why.

**Cinema first.** The demonstration site should feel like a real cinema website. The portfolio
comparison lives in a separate presentation or route and does not interrupt the cinema experience.

## Design direction
Modern cinematic design blended with a distinctive woodland identity. Explore:
- **Forest greens and charcoal** as the base palette.
- **Warm ivory** for type, surfaces and contrast.
- **Atmospheric imagery** — film-forward visuals with a sense of place.
- **Readable typography** and **polished, controlled interactions**.
- **Clear film browsing** — what's on, when, and how to book should be obvious.

Preserve the cinema's character while improving clarity and usability. A consistent system for
typography, colour, spacing, buttons, icons and motion is established progressively as designs are
approved — nothing is fixed in advance (no fonts or palette values chosen yet). Do not import
styling from the owner's unrelated portfolio projects.

## The ten design areas
These are design areas, not ten sections forced onto one homepage. Film details and booking get
their own focused views.

1. **Header and navigation** — clear navigation, branding, search, a prominent booking action and a
   compact mobile menu.
2. **Cinematic opening** — a strong featured-film or venue introduction, readable messaging, clear
   actions and controlled transitions.
3. **Quick booking** — a connected Film → Date → Time selector with understandable states and a
   clear next step.
4. **What's On** — an organised film grid with date, genre and screening-type filters; not the whole
   programme as one overwhelming page.
5. **Film details** — focused view with artwork, synopsis, runtime, certificate, trailer where
   available and grouped showtimes.
6. **Seat selection and booking demonstration** — interactive seating plan, ticket quantities,
   transparent example pricing and a summary. Clearly fictional: no reservations, payments or
   account creation.
7. **Discover the Kinema** — editorial introduction to the venue, its woodland setting, verified
   history and photography, with a gallery.
8. **Special screenings and experiences** — clearly presented events and screening categories;
   verified offerings distinguished from proposed concepts.
9. **Gift vouchers and loyalty** — clear explanations, attractive presentation and demonstration
   interactions; no real purchases or sign-ups.
10. **Plan your visit and footer** — directions, parking, accessibility, contact information and
    useful links; newsletter promotion secondary and any form demonstrative.

## Workflow
Areas are developed **one at a time**, starting with Section 1 once its design instructions are
supplied. Nothing is designed or implemented ahead of instructions. For each approved area:
1. Record the design decision in `CHANGELOG.md`.
2. Implement only the agreed scope plus necessary shared foundations.
3. Check desktop and mobile behaviour, keyboard access and readability.
4. Capture comparable screenshots at consistent viewport sizes — 1440×900 desktop and 390×844
   phone, matching the baseline (`tools/capture.mjs`).
5. Record the change and its intended benefit.

Preserve the reference unchanged. Do not re-audit all 65 film cards or recapture the whole original
page unless required; reuse the existing baseline captures and crop the relevant area.

## Comparison accuracy
Each case-study entry uses: **Before → Redesign → What changed → Why it helps.**
- The snapshot's text-encoding faults, invisible hero carousel and other capture artefacts are
  limitations of the saved snapshot, **not verified defects of the live website**. Do not present
  them as original-site problems the redesign solved. (The 32 px phone overflow was also observed
  only in the snapshot and is unverified on the live site.)
- Where no original reference exists (e.g. seat selection), label the feature **"New concept"**.
  Do not invent an original booking flow or fabricate a before screenshot.
- Describe usability improvements as **design intentions** unless testing provides evidence. No
  invented conversion increases, visitor statistics or user feedback.

## Content and publication
- **Reference material** (archive, extracted snapshot, baseline screenshots) stays in git-ignored
  `reference/` and is never committed or deployed. Before images for a published case study need a
  decision on reuse permission first.
- **Assets:** only original or appropriately licensed images, fonts and icons in `site/`. Record the
  source and licence of each in `CHANGELOG.md`. Nothing from the snapshot is reused unless
  permission is established and recorded.
- **Film listings** captured in the snapshot are dated reference content (programme as of 17 Nov
  2026), not a live programme.
- **Demonstration data:** schedules, seat availability and prices are clearly labelled as examples.
- **Notice:** every page shows a discreet, visible **"Unofficial portfolio redesign concept"**
  notice with a link to the official website for real tickets.
- **No real transactions:** no payments, account submissions, newsletter subscriptions or bookings;
  no data leaves the browser.
- **Hosting:** GitHub Pages project site at `https://thomas-bailey-9.github.io/kinema-redesign/`.
  All links and asset paths are relative so the site works locally and under `/kinema-redesign/`.
  Routes for separate views (film details, booking, case study) must work on GitHub Pages without
  server rewrites — approach to be agreed when the first such view is built. Planned deployment: a
  small GitHub Actions workflow publishing `site/` only. **Do not deploy until requested.**
- **Lightweight:** plain static HTML/CSS/JS; no build step, frameworks or dependencies unless a
  later decision justifies one.
- **Accessibility:** semantic HTML, keyboard-operable controls, visible focus, WCAG AA text
  contrast, respect `prefers-reduced-motion`; responsive from ~360 px phones to wide desktop.

## Open decisions
- Route approach for separate views on GitHub Pages.
- Format and location of the comparison presentation (separate route vs. standalone slideshow).
- Whether and how reference "before" images may appear in a published case study.
- Typography, palette values, iconography and motion — set per approved area.
