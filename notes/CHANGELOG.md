# Change log

Design decisions for the redesign, newest first. For each entry note what changed, why, and the
source/licence of any new asset.

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
  https://thomas-bailey-9.github.io/kinema-redesign/
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
