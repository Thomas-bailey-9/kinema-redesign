# Change log

Design decisions for the redesign, newest first. For each entry note what changed, why, and the
source/licence of any new asset.

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
