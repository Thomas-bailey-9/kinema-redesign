# 3. Quick booking

Status: implemented 17 Nov 2026 (awaiting review). Screenshots: `notes/screenshots/section-03/`
(1440×900, 768×1024, 390×844, 320×640 — initial, film chosen, complete, explained change, demo
dialog, keyboard focus, no-blur and no-JavaScript states). Private "before" crops:
`reference/screenshots/comparison/section-03/` (not published).

**Contribution:** creative direction, design choices, feedback and review by the project owner;
implementation AI-assisted through Claude. Independent concept — not commissioned by the cinema.

## Before (saved homepage snapshot, 17 Nov 2026)
- A "QUICK BOOK" panel in the right-hand column (desktop) and below the account buttons (phone),
  with the line "Please choose Film, date and time to book" and three stacked selects:
  "SELECT FILM" (listing 63 film titles in the snapshot), "SELECT A DATE" and
  "SELECT A PERFORMANCE".
- No continue or submit button was visible in the captured panel.
- In the snapshot all three selects are disabled and scripts were removed, so **the original
  interaction (how dates and performances populate, and what happens after choosing) was not
  captured** and is not described or compared here.
- Evidence category: snapshot observation (not verified against the live site).

## Redesign
- A wide glass panel, "Your next cinema night — Choose a film, find a time", labelled
  "Demo screenings", placed at the foot of the cinematic opening. On desktop it overlaps the
  opening's lower edge and sits fully within the first screen at 1440×900; on phones and tablets
  it follows the opening content without overlap.
- Desktop: one row — Film · Date · Time · Continue — with visible labels and small icons above each
  value and fine dividers instead of boxes. Mobile: full-width Film, Date and Time side by side from
  480 px (stacked below), full-width Continue; all controls at least 44 px tall.
- Connected native selects driven by one shared fictional dataset (`site/assets/js/demo-data.js`:
  4 sample films, 4 sample dates in December 2026, 20 screenings, one sold-out time and one
  fully sold-out date).
- Clear states: "Choose a film" → "Choose a film first" / "Choose a date first" until earlier
  choices are made; Continue unavailable until a valid screening is chosen; visible guidance
  ("Next, choose a date."); compact summary "Your selection: Film · Date · Time".
- Changing an earlier choice keeps later choices only while still valid and explains what happened
  ("…so the date and time were cleared" / "…so your date and time were kept"). Nothing switches
  silently and focus never moves on its own.
- Continue opens "Your demo screening" — film, full date and time — stating "This is a portfolio
  demonstration. No seats have been reserved." and that seat selection comes in the booking
  section. "Change selection" returns to the panel. The selection is kept in page state for the
  later booking flow.
- Header "Book tickets" / "Book" now bring visitors to this panel (closing the mobile menu first),
  clear of the sticky header, with focus on the Film field.
- New concept: the connected states, explanations, summary and demo dialog have no captured
  original equivalent.

## What changed
- From three uppercase "SELECT…" boxes with no visible next step, to a labelled Film → Date →
  Time → Continue sequence with explicit availability, guidance and a summary.
- Booking moved from a side column to a prominent, consistent place reached from every "Book"
  action.

## Design reasoning (approved choices)
- **Layout:** a single row on desktop mirrors the order of the decision and keeps the panel compact
  beneath the headline; stacking on small screens keeps every value readable.
- **Colour and surface:** forest glass with a fine champagne edge distinguishes the panel from the
  ivory-edged featured-film card; champagne labels and ivory values keep the hierarchy clear.
- **Typography:** Cormorant Garamond for the panel heading continues the opening's voice; Inter for
  labels, values and guidance keeps the controls plain and legible.
- **Interaction:** native selects for dependable keyboard, screen-reader and mobile behaviour;
  sold-out options use text ("Sold out") and are disabled — never colour alone; changes are
  explained in a polite live region.
- **Motion:** soft glass highlight on hover, champagne focus outlines, 220–260 ms transitions as
  fields become available, a short fade for the summary and the existing light sweep on Continue;
  all movement removed under reduced motion.

## Why it helps (design intentions — not user-tested)
- Showing what to choose next, and why a field is unavailable, is intended to reduce uncertainty.
- Explaining cleared or kept choices is intended to prevent surprises and accidental bookings of
  the wrong screening.
- One consistent booking destination from every "Book" action is intended to make the main task
  easy to find.
- Native controls, visible focus and clear labels aim to keep booking usable by keyboard, touch and
  assistive technology.

## Outstanding
- Films, dates and times are fictional samples; the seat selection and booking demonstration
  arrives in Section 6.
- Verified with automated browser checks only — not on physical phones or with screen readers.
  Native pickers on iOS/Android were not exercised (their appearance is controlled by the OS).
