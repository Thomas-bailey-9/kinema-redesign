# Reference

- **Source site:** https://thekinemainthewoods.co.uk/
- **Reference material:** `Kinema-Original-Homepage-Reference.zip` — a static homepage snapshot
  supplied by the project owner. Not a full-site clone; its scripts, navigation, forms and booking
  functions were deliberately disabled.
- **Reuse permission:** not established. The archive, its extracted files and screenshots of it are
  kept in `reference/`, which is git-ignored, and must not be committed or published.
- **Fidelity:** the snapshot has not been compared against the live site, so it should not be
  described as an exact match.

## Running the reference locally

Expected local layout (all git-ignored):

```
reference/
  Kinema-Original-Homepage-Reference.zip
  original/        # extracted snapshot — leave unchanged
  screenshots/     # baseline captures
```

1. Put the zip in `reference/` and extract it:

   ```bash
   mkdir -p reference/original && unzip -q reference/Kinema-Original-Homepage-Reference.zip -d reference/original
   ```

2. Serve it (adjust the directory if the zip contains a top-level folder):

   ```bash
   python3 -m http.server 8001 --directory reference/original
   ```

3. Open http://localhost:8001/.

4. Capture baseline screenshots and a missing-asset report (uses a globally available Playwright;
   nothing is added to this repo):

   ```bash
   node tools/capture.mjs http://localhost:8001/ reference/screenshots baseline
   ```

   This writes `baseline-<viewport>-fold.png` (first screen, 2x) and `baseline-<viewport>/NN.png`
   (the whole page as consecutive scrolled sections) for desktop 1440 px and phone 390 px.

## Baseline audit — 17 Nov 2026

Snapshot received and extracted unchanged to `reference/original/` (read-only, SHA-256 list in
`reference/original.sha256`). Served locally with `python3 -m http.server` and checked in headless
Chromium at 1440×900 and 390×844. **Not compared with the live site** (the live site was not
reachable from the build environment), so fidelity to the live homepage is unverified.

**Page structure (top to bottom):** reference banner → header (logo, social icons, search) →
account bar (basket, log in, password reset, create account) → hero carousel (hidden, see below) →
Quick Book (film/date/performance selects) → newsletter sign-up → gift voucher and loyalty card
promos → What's On (sort by name/date; 65 film cards: 63 with dated showtime buttons, 2 "Coming
Soon") → footer (site links, gallery of 12 venue photos, empty Latest Blog, newsletter) → fixed
bottom navigation bar on desktop / hamburger on phone. Pages are very long: ~29,700 px on desktop,
~52,900 px on phone.

**Working:** all 103 local assets load; 0 failed requests, 0 HTTP errors, 0 broken images, 0 console
errors at both widths. The 3 `<script>` tags are inside an `<!--[if lt IE 9]>` comment, so modern
browsers ignore them. Links use `onclick="return false"` and forms `onsubmit="return false"`.

**Observed in the snapshot** (capture limitations or snapshot behaviour — not verified defects of the live site):
1. **Text encoding (mojibake).** The HTML is UTF-8 but declares no charset, so browsers decode it as
   Windows-1252: "•" shows as "â€¢" (reference banner), "©" as "Â©" (footer), "’" as "â€™" (e.g. the
   André Rieu title), plus accented letters. 36 non-ASCII characters are affected.
2. **Hero carousel invisible.** `.owl-carousel` (10 images) is `display:none` until Owl Carousel's
   script initialises it; with scripts removed it is 0 px tall. On desktop this leaves a large empty
   grey block beside Quick Book; on phone a smaller gap.
3. **Phone horizontal overflow of 32 px** at 390 px wide, caused by two warning tooltips
   (`.ToolTip`, 160 px) and two `img.show-image` elements (426 px wide) extending past the viewport.
4. **Missing CSS-only images (no visible effect):** 10 background images referenced in stylesheets
   are not in the archive (`line-icon-1…8.svg`, `owl.video.play.png`, `icon-play.png`). No element
   on the page uses those rules and the browser never requests them.
5. **External references:** favicons point at the live site and are not bundled (the tab shows no
   icon offline); the three IE-only scripts point off-site but are never loaded.
6. **Disabled behaviour:** sort-by-name/date, Quick Book selects, search, menu and the sidebar toggle
   (`showSideBar`/`hideSideBar` are undefined; clicking would log an error) do nothing, as intended.
   "Latest Blog" in the footer is empty.

**Capture note:** Chromium's single-image full-page screenshot renders large blank areas on pages
this tall, so `tools/capture.mjs` captures by scrolling instead. In section captures the
`background-attachment: fixed` body photo appears behind every section, as it would when scrolling.
