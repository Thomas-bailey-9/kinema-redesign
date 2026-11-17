# Change log

Design decisions for the redesign, newest first. For each entry note what changed, why, and the
source/licence of any new asset.

## 2026-11-17 — Section 3: Quick booking
**Decision (approved design):** a wide forest-glass booking panel ("Your next cinema night —
Choose a film, find a time", "Demo screenings") at the foot of the opening: desktop one row
Film · Date · Time · Continue, overlapping the opening's lower edge; phones/tablets beneath the
opening content with full-width Film/Continue and Date/Time side by side where readable.

**Implemented**
- `site/assets/js/demo-data.js` — single shared fictional dataset (`window.KINEMA_DEMO`): 4 sample
  films (incl. "The Lantern Path"), 20 screenings on Thu 3 – Sun 6 Dec 2026, one sold-out time
  (The Lantern Path, 5 Dec 19:30) and one fully sold-out date (Fern and the Night Train, 6 Dec).
- `site/assets/js/quick-booking.js` — connected native selects; validity-preserving changes with
  explanations; guards that reject sold-out values; summary in a `role="status"` region; state in
  `window.KinemaDemoState`; Continue opens `#screening-demo` ("Your demo screening": film, full
  date, time; "This is a portfolio demonstration. No seats have been reserved."; "Change
  selection"). `<noscript>` message when JavaScript is unavailable.
- Styling: forest glass with champagne border, dividers between fields, champagne labels with
  small icons, ivory values, readable disabled explanations (8.8:1), soft hover highlight,
  champagne focus rings, 220–260 ms transitions, summary fade, Continue reuses the champagne button
  and light sweep (disabled state is muted with no sweep). Solid fallback without blur.

**Integration adjustments**
- Header "Book tickets" / "Book" changed from a button opening the Section 1 placeholder dialog to
  links to `#quick-book` that close the mobile menu, scroll clear of the sticky header (reduced
  motion: instant) and focus the Film field. The Section 1 "Booking demo coming in Section 6"
  dialog was removed (superseded). Dialog opening shared via `window.KinemaUI.openDialog`.
- Concept badge now sits beneath the header at the top of the page on every width (previously fixed
  bottom-left on desktop), because the booking panel occupies the lower first screen; it never
  covers controls.
- Opening shortened on desktop (`min-height: max(620px, 100svh - 176px)`) so the whole panel fits
  in the first screen at 1440×900; photo credit moved above the overlap.
- Section 1 checks updated for the new Book behaviour (now 85 checks).

**Assets:** none added — icons are inline SVG drawn for the concept; all data is fictional.

**Verified:** `check-section-03.cjs` 130/130, `check-section-02.cjs` 88/88, `check-section-01.cjs`
85/85 at 1440×900, 768×1024, 390×844 and 320×640 (plus 360 for Section 1): every one of the 18
available combinations, both sold-out cases, six change scenarios, forced invalid values, dialog
and focus return, keyboard-only flow, header Book links (with menu open), overlap, touch targets,
text fit, reduced motion, no-blur and no-JavaScript.

**Intended benefit:** a clear, explained path from choosing a film to a screening (design
intentions, not user-tested). Case-study entry: `case-study/03-quick-booking.md`.

## 2026-11-17 — Section 2: Cinematic opening
**Decision (approved design):** venue-led cinematic opening — evening exterior photograph, warm
cinema lights against darker woodland, introduction lower-left with the exact headline "A little
woodland. A little wonder. A world of cinema.", supporting line, "Explore what's on" (primary) and
"Discover the Kinema" (secondary), and a compact "Featured film · Demo" glass panel lower-right.
Stacked on phones/tablets: introduction first, panel beneath, natural height.

**Photography:** authentic venue photography sourced under licence — "Kinema in the Woods, Woodhall
Spa", Neil Theasby, 15 Feb 2016 (dusk), Wikimedia Commons / Geograph 4831322, **CC BY-SA 2.0**.
Cropped (landscape + 4:5 portrait), resized to 1100/1600/2400 and 560/800/1200 WebP (53–370 KB),
metadata stripped; credited on the page; details in `ASSETS.md`. No temporary or placeholder
imagery remains in the opening. (A new personal environment, `kinema-redesign`, was approved to
reach Wikimedia Commons.)

**Implemented**
- Replaced the temporary CSS opening with `<section class="opening">`: responsive `<picture>`
  (portrait crop below 600 px), `fetchpriority="high"`, not lazy-loaded; forest/charcoal gradient
  shade; headline as the page `<h1>`.
- Featured-film panel: original SVG artwork (`sample-film-lantern-path.svg`), fictional sample
  "The Lantern Path", "Sample film for this concept — not the cinema's programme" note; "View film"
  opens `#film-preview`, a native modal dialog labelled "Film preview · Demo" stating it has no
  screenings and that details/showtimes come in Section 5. No availability shown.
- Buttons: `.btn-primary` shares the approved Book-button rules (champagne, lift, one-shot sweep);
  new `.btn-glass` secondary with matching glass, lift and softer sweep.
- Motion: image settle 1.03→1 over 1.6 s once the image is ready (no delay to content); 700 ms
  fade-up reveal of introduction and panel (panel +120 ms); panel hover/focus lift with brighter
  edge and contained 1.06 artwork zoom. All removed under `prefers-reduced-motion`.
- Fallbacks: solid forest panel and glass buttons when `backdrop-filter` is unavailable.

**Integration adjustments (Section 1)**
- Dialog code generalised (`data-open-dialog`) so the booking demo and film preview share focus
  return, Escape and scroll lock; opening actions reuse the section-link handler.
- Below 960 px the concept badge now sits at the top of the page beneath the header instead of
  fixed at the bottom, because the stacked opening placed it over the film panel's controls. It
  remains visible on arrival; the menu, dialogs and footer repeat the notice. Desktop unchanged.
- Opening sky gradient deepened behind the header after measuring 2.3–2.9:1 for header text over
  the pale sky; now 6.8–8.0:1.

**Verified:** `tools/check-section-02.cjs` 88/88 and `tools/check-section-01.cjs` 80/80 at 1440×900,
768×1024, 390×844 and 320×640 (plus 360 for Section 1), served under `/kinema-redesign/`.

**Intended benefit:** an immediate sense of the real venue and a clear first step to finding a film
(design intentions, not user-tested). Case-study entry: `case-study/02-cinematic-opening.md`.

## 2026-11-17 — Section 1 live; portfolio case-study scope clarified
- **Deployed:** Pages source set to GitHub Actions by the project owner; re-run of workflow run
  44116018570 succeeded (commit `861f6fa`). Section 1 is live at
  https://tbaileyportfolio.co.uk/kinema-redesign/ and confirmed working by the project owner.
- **Brief clarified** (`PROJECT_BRIEF.md` → "Portfolio case study"): the final portfolio piece is a
  before-and-after case study; complete all ten areas first, then build a separate comparison
  presentation for the same ten areas linking to the redesign. Per area, preserve: original
  reference (where available), approved redesign at matching desktop/mobile sizes, what changed,
  design reasoning, and intended visitor benefit. Presentation aimed at recruiters: large
  before/after views, short explanations, optional detail; exact design decided later.
- **Attribution rule:** owner's creative direction, design choices, iterative feedback and review,
  with AI-assisted implementation through Claude; not hand-coded by the owner, not commissioned by
  the cinema.
- **Evidence categories** kept distinct: verified original-site observations, snapshot
  limitations, new concepts. No third-party screenshots published without permission; no invented
  performance or conversion claims.
- No changes to the live site.

## 2026-11-17 — Section 1: 320 px check and GitHub Pages deployment
- Added a 320×640 check (now 80 checks across 1440, 390, 360, 320 and 768 px). It found two
  narrow-screen issues, both fixed without changing the design at 360 px and wider:
  - Header controls needed ~314 px but only 268 px was available, pushing Menu 38 px off-screen.
    Fixed with a `max-width: 359.98px` rule tightening gutter, gaps, wordmark size and button
    padding.
  - The menu panel's grid column would not shrink below the search row (380 px wide at 320 px).
    Fixed with `grid-template-columns: minmax(0, 1fr)`.
- Added `.github/workflows/pages.yml`: deploys only `site/` to GitHub Pages via GitHub Actions on
  pushes to `main` that touch `site/` (or manually). Published URL:
  https://tbaileyportfolio.co.uk/kinema-redesign/ (the account's existing Pages custom domain;
  the github.io address redirects there).
- First run failed at "Configure Pages": a workflow token cannot switch Pages on. Pages must be
  enabled once in Settings → Pages → Source: GitHub Actions, then the run re-run.
- Screenshots added: `phone-320-01-expanded.webp`, `phone-320-02-menu-open.webp`.

## 2026-11-17 — Section 1: Header and navigation
**Decision (approved design):** cinematic woodland glass header — spacious and translucent over the
opening, transitioning on scroll into a compact sticky forest-green bar. Desktop: wordmark left;
What's On · Experiences · Our Story · Visit centre-right; search and Book tickets right. Below
960 px: wordmark, Book and a labelled Menu button opening a panel with navigation and film search.

**Implemented**
- `site/index.html`, `site/assets/css/main.css`, `site/assets/js/main.js` rebuilt for Section 1.
- Shared foundations: colour, glass, type, spacing, radius and motion tokens; focus ring; skip
  link; visually-hidden utility; scroll-lock and animated panel helpers.
- Header goes compact after 24 px of scroll (fixed header, so no content shift); hover glass lift,
  focus-visible underline, wordmark glow, search icon rotation, booking-button lift and one-shot
  700 ms light sweep (keyframe animation, removed instantly on leave), panel slide-and-fade
  (260 ms), pressed feedback on touch controls.
- Search: desktop popover and in-menu form, both returning an honest "no programme loaded" demo
  message. Book tickets: native modal `<dialog>` labelled "Booking demo coming in Section 6".
- Menu: `aria-expanded`, background made `inert`, page scroll locked, Escape closes and returns
  focus, menu links close the menu then scroll to the section and focus it.
- Fallbacks: solid forest colours when `backdrop-filter` is unsupported; transitions, lifts,
  icon rotation and sweep removed under `prefers-reduced-motion`; `scrollbar-gutter: stable`
  prevents width shift when scroll is locked.
- Notice: discreet fixed "Unofficial portfolio redesign concept" badge with an official-site link,
  repeated in the menu, booking demo and placeholder footer.
- Temporary scaffolding (to be replaced): CSS-only opening background labelled for Section 2;
  labelled placeholders for What's On (4), Experiences (8), Our Story (7) and Visit (10).

**Typography and assets**
- Wordmark/display: Cormorant Garamond 600 (Latin subset, WOFF2). Interface: Inter variable
  (Latin subset, WOFF2). Both SIL Open Font License 1.1, self-hosted from the Fontsource npm
  packages v5.3.0; licences in `site/assets/fonts/OFL-*.txt`. The KINEMA wordmark is a concept
  treatment, not the cinema's logo.
- Icons: hand-drawn inline SVG (search, menu, clear). No images or third-party assets otherwise.

**Verified** (`tools/check-section-01.cjs`, served under `/kinema-redesign/`): 63/63 checks pass at
1440×900, 390×844, 360×740 and 768×1024 — no overflow, no console/network errors, fonts load,
tab order, focus rings, expanded states, Escape and focus restoration, click-outside, no layout
shift on compact or scroll lock, menu scroll lock and inert background, menu-link navigation,
reduced motion and forced no-blur fallback. Not tested on real iOS/Android devices or with screen
readers.

**Intended benefit:** one obvious booking action and four clear destinations, a less crowded phone
header, and full keyboard access (design intentions, not user-tested). Case-study entry:
`case-study/01-header-and-navigation.md`.

## 2026-11-17 — Redesign brief agreed
- Saved full scope in `PROJECT_BRIEF.md` (merged from `BRIEF.md`): purpose and three deliverables
  (demo site, ten-area case study, comparison presentation), design direction, the ten design
  areas, per-area workflow, comparison-accuracy rules and publication constraints.
- Clarified that the snapshot's encoding faults and hidden carousel are capture limitations, not
  live-site defects; `REFERENCE.md` wording updated to match.
- Notice wording is now "Unofficial portfolio redesign concept" (placeholder `site/index.html` still
  uses the older wording; to update with Section 1).
- No design or implementation work yet — awaiting Section 1 instructions.

## 2026-11-17 — Baseline captured
- Reference snapshot extracted unchanged (git-ignored) and audited at 1440 px and 390 px; findings
  in `REFERENCE.md` (encoding mojibake, hidden hero carousel, 32 px phone overflow, unused missing
  CSS images, no live-site comparison).
- Capture tool now records whole pages as scrolled sections, because Chromium's full-page capture
  fails on very tall pages.

## 2026-11-17 — Project setup
- Created repository scaffolding: `site/` redesign workspace, project brief, reference notes.
- Recorded agreed direction: modern cinematic + woodland identity (atmospheric imagery, forest
  tones, warm ivory, clear film browsing).
- Decided: plain static site, relative asset paths, GitHub Pages at `/kinema-redesign/`
  (deployment not yet configured).
- Decided: third-party reference archive and baseline screenshots stay git-ignored under
  `reference/`.
- No visual redesign work yet — awaiting requested changes.
