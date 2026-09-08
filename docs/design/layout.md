# Layout system

The low-level design layer: what decides **where** something is allowed to sit,
so a screen cannot be laid out by eye.

Source of truth is [`src/components/design/layout.ts`](../../src/components/design/layout.ts).
Enforced by [`src/engine/__tests__/layout.test.ts`](../../src/engine/__tests__/layout.test.ts).
**Never restate a number from that file in prose here** — two documents
disagreeing about the baseline is the failure this exists to prevent.

## Baseline

Everything derives from `BASELINE`. Spacing, line heights and zone heights are
all multiples of it, so type and boxes land on the same rhythm instead of near
it.

It is 4, not 8. Android density buckets and the iOS point grid both resolve
cleanly at 4, and an 8 baseline forces either 16 or 24px line heights onto
11–13px type — 16 is tight, 24 is loose.

`SCREEN_MARGIN` is the one deliberate exception and `spacing.ts` says why. It is
asserted in the lint so one exception cannot quietly become two.

## Grid

Four columns, not twelve. A phone at 360–430dp cannot show twelve meaningful
columns; pretending otherwise produces sub-30dp cells nothing fits in. Four
gives halves, quarters and rough thirds, which covers every layout in this app.

Use `span(contentWidth, n)` for column widths. **`contentWidth` is the screen
width minus both margins** — passing raw window width is the usual cause of a
grid that overflows by exactly one margin, so the lint asserts a full span
equals the content width exactly.

## Type

Eight steps, each line height a multiple of the baseline.

Before this existed the app had **22 distinct font sizes between 9 and 72**,
with 11, 12, 13 and 14 all in heavy use — four sizes inside a 3pt range. That is
not a scale, it is the absence of one, and nothing downstream could be
consistent because there was nothing to be consistent with.

Arabic is deliberately **not** in the scale. It needs more leading than Latin at
the same optical size; `ARABIC_LINE_HEIGHT_MULTIPLIER` and `ARABIC_SCALE` in
`tokens.ts` apply on top of a chosen size.

### The ratchet

235 off-scale sizes were recorded the day the scale landed, 186 after onboarding was migrated. The lint asserts the
count does not grow, and a second assertion stops the ceiling drifting far above
reality.

**Raising `MAX_OFF_SCALE` to make a build pass defeats the mechanism.** Fix the
call site, or make the case that the size belongs on the scale.

This is the same ratchet `languageContent.test.ts` uses, for the same reason: a
permanently-red suite gets ignored within a week, and a lint nobody reads
enforces nothing.

## Zones

Every screen is three bands:

| Zone | Owns | Rule |
|---|---|---|
| header | top safe-area inset | `ScreenHeader` is the only thing that renders here |
| content | scrolling | everything else |
| action | bottom safe-area inset | the primary action, pinned within thumb reach |

`Screen` implements this. Use it rather than hand-rolling padding.

This is written down because the alternative was tested and failed: Sentence
Builder forgot the top inset entirely and put its back button under the notch,
three screens each applied the inset at a different level, and every onboarding
step invented its own `paddingTop: insets.top + <a number>`.

## Primitives

- **`Screen`** — safe areas, margins, content/action split.
- **`Stack`** / **`Row`** — spacing between children. `gap` is typed as a key of
  `SPACE`, so `<Stack gap={13}>` does not compile.

Prefer `Stack` over `marginBottom` on children. A margin belongs to the
*relationship* between two elements, not to one of them — which is why moving a
component between screens so often drags the wrong spacing with it.

## Breaking the rules

A screen that must break these should not reach around the primitives. It should
lay itself out explicitly and say why, the way the mode plates do for their
deliberate full-bleed moment. An exception with a stated reason is fine; an
exception because the primitive was inconvenient is the drift this prevents.
