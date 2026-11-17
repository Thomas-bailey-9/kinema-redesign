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
