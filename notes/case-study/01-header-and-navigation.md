# 1. Header and navigation

Status: implemented 17 Nov 2026 (awaiting review). Screenshots: `notes/screenshots/section-01/`
(1440×900 desktop, 390×844 phone, plus 360×740, 320×640 and 768×1024). Matching "before" crops of the saved
snapshot are kept privately in `reference/screenshots/comparison/section-01/` (not published).

## Before (saved homepage snapshot, 17 Nov 2026)
Observed in the static snapshot, whose scripts and navigation were disabled — live behaviour may
differ.
- Desktop: an image logo over an auditorium photograph, social icons and a search icon top right,
  and a separate bar of red buttons for Basket, Log in, Password reset and Create an account.
- The main site links (What's On, Private Hire, Vouchers, About, FAQs, Contact) were not visible
  in the first screen of the snapshot; they appeared in a bar at the bottom of the page.
- Phone: logo, search and a ☰ menu icon, with the four account buttons stacked beneath, taking
  roughly a quarter of the first screen before any content.
- There was no booking action in the header itself; booking started from the Quick Book panel.

## Redesign
- A translucent glass header over the opening background: serif concept wordmark "KINEMA" with
  "IN THE WOODS" beneath, four destinations (What's On · Experiences · Our Story · Visit), a
  search button and a champagne "Book tickets" button.
- On scroll it eases into a compact, sticky forest-green bar (76 → 64 px on desktop).
- Phone and tablet (below 960 px): wordmark, "Book" and a labelled "Menu" button; the menu opens
  a full-screen panel with film search and the four destinations.
- Search opens a panel with an honest demo state; Book opens a "Booking demo coming in Section 6"
  notice. Account functions are not part of this concept.

## What changed
- Account actions removed from the header; one primary action (Book tickets) instead.
- Navigation reduced to four plain-language destinations, visible in the header at desktop width.
- Phone header reduced to three controls; navigation and search moved into the menu panel.
- New visual language: forest green, charcoal, warm ivory text, champagne primary button, glass
  layering, serif wordmark with a sans-serif interface.
- Polished but restrained motion (180–400 ms, 700 ms light sweep), disabled under reduced-motion.

## Why it helps (design intentions — not user-tested)
- A single, prominent booking action is intended to make the main task obvious from any scroll
  position.
- Fewer, clearer destinations are intended to reduce scanning effort.
- A compact phone header is intended to leave more of the first screen for content.
- Keyboard access, visible focus, labelled controls, correct expanded states and Escape-to-close
  aim to make navigation usable without a mouse or hover.
