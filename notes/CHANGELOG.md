# Change log

Design decisions for the redesign, newest first. For each entry note what changed, why, and the
source/licence of any new asset.

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
