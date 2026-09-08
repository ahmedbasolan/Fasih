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

### The floor

235 off-scale sizes the day the scale landed, 186 after onboarding, **0** after
the full sweep. It is a hard floor now rather than a ratchet: there is nothing
left to migrate, so a new off-scale size is a new decision and should be argued
for rather than absorbed.

The only exemption is the watermark glyphs (140–260px in `GhostLetters` and the
mode plates). They are a graphic device, not type — nobody reads them, and no
text scale sensibly extends to 260. The exemption is scoped to named files AND
to sizes above 100, so an ordinary heading cannot hide behind it.

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

### The tab bar owns the bottom inset

The bottom tab bar is a normal-flow sibling of the screen container, not an
overlay: `BottomTabView` renders `[screens (flex: 1), tabBar]` in a column, and
`BottomTabBar` only sets `position: 'absolute'` while it is hidden for the
keyboard. Confirmed in
`expo-router/build/react-navigation/bottom-tabs/views/`, and it is the same
code on both platforms.

So a tab screen already ends above the bar, and the bar already carries
`insets.bottom`. A tab screen that clears it again is padding against nothing.
All four did, by three different amounts — measured as 80–114px of dead space
at the end of every tab scroll. `tabBarHandlesBottomInset` is how a screen says
so; the lint pins the four as not touching `insets.bottom` at all.

### One way to write an offset

`insets.top + <bare number>` fails the lint anywhere in `src/` or `app/`. Not
because any particular number was wrong, but because eight of them coexisted
and nothing said whether two screens meant the same offset or had each guessed.
A token is the same offset, named.

Two screens are not on `Screen` and say why in a comment: `ScenariosScreen` and
`PhraseLibrary` are FlashLists, and a virtualised list inside `Screen`'s
ScrollView is a worse bug than the one being avoided. They call `screenPadding`
directly so they cannot drift from it.

## Primitives

- **`Screen`** — safe areas, margins, content/action split. `background` takes
  the watermark: it has to sit under the scroll, ignore `SCREEN_MARGIN` and
  bleed off all four edges, which no child in the content flow can do. The top
  inset lives on an inner zone rather than the root for the same reason — an
  absolutely positioned child is laid out against its parent's *padding* box,
  so a root `paddingTop` would push the watermark out of the status bar.
- **`Stack`** / **`Row`** — spacing between children. `gap` is typed as a key of
  `SPACE`, so `<Stack gap={13}>` does not compile.

Prefer `Stack` over `marginBottom` on children. A margin belongs to the
*relationship* between two elements, not to one of them — which is why moving a
component between screens so often drags the wrong spacing with it.

## What has not been verified

Fasih launches on iOS and is only ever looked at on Android. The web preview has
no safe areas at all. So the platform being shipped is the one nobody observes,
and this section exists so that is never implied away.

**Nothing in the lint runs on a device.** There is no render-testing library
here, so it checks pure functions and scans source text. `screenPadding` is
extracted from `Screen` precisely so the arithmetic *can* be tested — but
correct arithmetic is not a correct layout.

`INSET_FIXTURES` are approximate figures typed from memory, not measured and not
cited. They exist to exercise `screenPadding` across small, large and zero
insets. **Do not quote them as fact.**

Two platform divergences are handled, both confirmed against
`react-native/Libraries/StyleSheet/StyleSheetTypes.d.ts` rather than assumed:

| Property | Platform | Handling |
|---|---|---|
| `includeFontPadding` | Android only, defaults **true** | disabled in every `TYPE` step, so line boxes match iOS |
| `writingDirection` | **iOS only** | Android ignores it; Arabic direction there comes from the Unicode bidi algorithm alone |

The second is unresolved and matters for an Arabic app: a mixed Arabic/Latin
string can resolve differently on the two platforms, and the one being validated
is not the one being shipped. Keeping Arabic and Latin in separate `Text` runs —
which `splitBilingualTitle` does — is belt-and-braces on iOS and load-bearing on
Android.

Two screens have never been opened even in the web preview: `PracticeScreen`
and `PhraseLibrary` are both gated behind three completed scenarios, so their
layouts are covered by the lint and by nothing else.

**The fix for all of this is a build on a real iPhone.** Nothing in this
directory substitutes for it.

## Breaking the rules

A screen that must break these should not reach around the primitives. It should
lay itself out explicitly and say why, the way the mode plates do for their
deliberate full-bleed moment. An exception with a stated reason is fine; an
exception because the primitive was inconvenient is the drift this prevents.
