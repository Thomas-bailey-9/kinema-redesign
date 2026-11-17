# Kinema in the Woods — unofficial redesign concept

An independent portfolio redesign concept for [thekinemainthewoods.co.uk](https://thekinemainthewoods.co.uk/).

> **Unofficial portfolio redesign concept.** This project is not affiliated with, endorsed by, or operated by
> The Kinema in the Woods. Booking and seat selection are demonstrations only — no real payments,
> accounts, bookings or form submissions. For real tickets, use the official website.

## Layout

| Path | Purpose | Tracked? |
|------|---------|----------|
| `site/` | The redesign (static HTML/CSS/JS). Published to GitHub Pages at `/kinema-redesign/`. | Yes |
| `notes/PROJECT_BRIEF.md` | Agreed purpose, direction, ten design areas, workflow and constraints | Yes |
| `notes/CHANGELOG.md` | Log of design decisions | Yes |
| `notes/REFERENCE.md` | Reference source URL, permission status, how to run the baseline | Yes |
| `tools/` | Local helper scripts (serve, screenshot) — no installed dependencies | Yes |
| `reference/` | Third-party homepage snapshot + baseline screenshots | **No** (git-ignored) |

## Published preview

https://tbaileyportfolio.co.uk/kinema-redesign/ (the account's Pages custom domain;
`https://thomas-bailey-9.github.io/kinema-redesign/` redirects there) — deployed from `site/` only by
`.github/workflows/pages.yml` on pushes to `main` that change `site/`.

## Run locally

```bash
python3 -m http.server 8000 --directory site
```

Open http://localhost:8000/. See `notes/REFERENCE.md` for running the original reference snapshot.
