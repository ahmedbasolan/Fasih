# Native Reviewer Brief

For the Emirati reviewer (and, for Taxi and Elevator, an Egyptian and a Levantine
reviewer). Written to be sent as-is. Rules it depends on live in
[`authority.md`](./authority.md); this is what we ask a reviewer to do.

---

## Who we need

- **Emirati reviewer:** grew up in Dubai or Abu Dhabi, roughly 20–35, speaks Emirati
  Arabic daily. We teach how people in those cities speak **today** — not the most
  traditional form, and not a pan-Arab or textbook form.
- **Egyptian / Levantine reviewers** (Taxi, Elevator only): native speakers who check
  that the non-Gulf characters sound like real Egyptians / Jordanians.

No linguistics background needed. We want the reaction of someone who would wince at
an unnatural line.

## What the app is

Fasih teaches expats in the UAE to speak Gulf Arabic through short conversations.
The learner picks what to say; characters react. Learners mostly cannot read Arabic
script, so **every Arabic line has a romanisation**, and that romanisation is how they
learn to pronounce it.

## What to check, per line

For every Arabic line in the scenario (character lines, the learner's choices, ending
titles):

| Question | Verdict to give |
|---|---|
| Would an Emirati in Dubai/Abu Dhabi actually say this, in this situation? | `ok` / `unnatural` / `wrong` |
| Is it current, or something older people say? | `current` / `dated` / `heritage` |
| Is the register right — a colleague at work, a neighbour, a stranger? | note if off |
| Are the gender forms right? Characters address male and female learners differently (شلونك / شلونج). Check both versions. | note if off |
| Does the romanisation match how it is said? | note if off |
| Does the English meaning match? | note if off |

Also flag any **cultural claim in the English notes** that is wrong or overstated.

## What not to do

- **Do not add tashkeel** (fatha, damma, kasra, sukun). The app writes bare script on
  purpose. Shadda where it matters (`عليّ`) and the usual `ًا` spellings (`شكراً`) are
  fine.
- **Do not "correct" into Modern Standard Arabic.** If the only fix you can think of
  is the MSA form, say so and we will rethink the line.
- Do not rewrite the story. Suggest the natural wording for the same intent.

## Deliverable

A table (spreadsheet is fine), one row per line:

`line id` · `verdict` · `currency` · `suggested wording (Arabic)` · `suggested romanisation` · `comment`

Line ids look like `first-morning/scene3/b` (a learner choice) or
`first-morning/scene3/npc-f-warm` (a character line, female-learner version, warm tone).
We will send the lines with ids attached.

## How we record it

When a review comes back, fixes go through the normal content process and the script
gets a `nativeReviews` entry (`src/types/index.ts` → `NativeReview`): dialect, a
pseudonymous reviewer handle, date, scope. Nothing is marked reviewed on anyone else's
say-so — including the project owner's.

## Order

1. **First Morning** first, alone. It calibrates this brief: if the table format or the
   questions don't work, we fix the brief before sending the other five.
2. Coffee Invitation, The Meeting, Eid (Emirati reviewer).
3. Taxi (Egyptian reviewer for the driver; Emirati reviewer for the learner's lines).
4. Elevator (Levantine reviewer for Sami; Emirati reviewer for the learner's lines).
