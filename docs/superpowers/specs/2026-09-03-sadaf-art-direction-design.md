# Sadaf — art direction design

**Date:** 2026-09-03
**Branch:** `feat/sadaf-art-direction`
**Status:** design approved in conversation, awaiting spec review
**Supersedes:** the pastel `CATEGORY_*` card language introduced with the "new design system" tokens

---

## 1. Why this exists

`src/components/design/tokens.ts` holds a considered warm palette — Layl night, Sadaf
cream, Zafaran gold — with contrast reasoning recorded in its own comments. The layer
sitting on top of it does not use that palette. The Scenarios grid, the Phrase Library
category cards, the Profile stat tiles and the milestone rows are built from six pastel
tokens that are near-identical in light and dark, assigned by array index, and drawn from a
different visual tradition entirely.

The result reads as a template. This document decides what replaces it.

### Evidence gathered before deciding

Measured against the running app (Metro on `:8081`) and the source, 2026-09-03:

| Finding | Location |
|---|---|
| Meter labels compute to **≈1.0:1** against their own pill ground (AA needs 4.5:1) | `ScenariosScreen.tsx:171` |
| Card palette assigned by `index % 6`, so colour encodes nothing | `ScenariosScreen.tsx:50` |
| Six `CATEGORY_*` tokens near-identical across both themes | `tokens.ts:164` / `tokens.ts:249` |
| Bidi broken in mixed runs — `كم / وين / شو — how much? ?where? what` | Sentence Builder |
| 345 hardcoded hex values outside the token files, 283 of them in three illustration files | `CategoryIllustrations` 130, `SceneIllustrations` 107, `KafMascot` 46 |
| 3.5 MB of mascot PNG for one onboarding screen | `foxy_male.png` 1.3 MB, `foxy_girl.png` 2.2 MB |
| `GhostLetters` renders the app's only typographic motif at **2–6% opacity** on 11 screens | `ui/GhostLetters.tsx` |
| 22 dead or wrong tokens — `SAND`, `SECONDARY`, `PRIMARY_LIGHT`, `INVERTED_TEXT`, `WARM_BG`, `WARM_SURFACE` have zero uses; `NEUTRAL_50–900` is Tailwind's *cool* grey inside a warm palette | `tokens.ts` |
| Career/Social mode has 7 usages, almost all a colour or label swap | `OnboardingFlow.tsx:336`, `ScenariosScreen.tsx:140` |

The last row is the important one. The scenario engine genuinely tracks per-NPC
accumulated impact (`impactByNpc`), derives warm/neutral/cold (`getTone`) and gates choices
on flags (`isChoiceVisible`). Both differentiators — mode, and the butterfly-effect engine —
are implemented and invisible.

---

## 2. Decision

**Sadaf.** Warm paper ground, near-black ink, one gold spent only where it does a job.
Nothing is a card; separation is a hairline and space.

Chosen over two alternatives presented at
`https://claude.ai/code/artifact/7e402cef-b780-488f-81be-01d2984f0c4b`:

- **Majlis** — layered warm blacks, gold rim-light, dark-first. Rejected as the predictable
  outcome; every value already existed, so it was mostly deletion, and it produced "a very
  well-made dark app" rather than a point of view.
- **Mashrabiya** — the eight-point lattice from `GeoPattern.tsx` made structural. Rejected on
  cost and Android list performance, not on merit.

### Sub-decisions taken in conversation

| Question | Decision |
|---|---|
| Dark mode | **Kept.** Light becomes the default. Dark is a night variant of the *same* ruled-paper language — identical structure and spacing, inverted material. Not a separate visual system. |
| Character art | **Retired from use, not deleted.** The six `KafMascot` call sites and seven `IMAGES.foxy*` / mode-image sites collapse into one `<Companion />` slot. Ahmed may reintroduce characters later; that must cost one component, not six screens. |
| Avatar | **Monogram.** The `foxyMale`/`foxyFemale` selection at `OnboardingFlow.tsx:343` is a real feature, not decoration. It becomes a typographic avatar on the Zafaran ramp — scales to any user, and drops the gendered two-fox framing. |
| Emphasis budget | **Mode and consequence.** See §5. |
| Icons | **Lucide only**, already a dependency. One grammar: 1.5 px stroke, 24 px grid, round caps. No bespoke icon art. |

---

## 3. Inherited non-negotiables

These come from `CLAUDE.md` and `docs/language/authority.md` and this work does not relax them.

1. **No MSA anywhere in content.** This document introduces no new Arabic strings. Every
   Arabic glyph referenced below already exists in the codebase.
2. **Bare Arabic script, no tashkeel.** Romanisation is the authoritative pronunciation
   channel — §4.2 gives it the typographic weight that claim implies.
3. **Contrast is computed, never eyeballed.** Every pairing in §4 carries a ratio computed
   from relative luminance. Any value added later carries one too.
4. **Ahmed's approval is a product decision, never a linguistic one.** Nothing here is
   recorded as linguistically verified.

### One item needs a language check, not a design check

The `GhostLetters` watermark glyphs are bare consonantal roots already shipping in the app
(`ع ل م`, `ق و ل`, `ف ك ر`, `أ ن ا`, `ك ل م`, `ح و ا`, `م ح ب`, `ب د أ`, `م ر ح`).
§5.1 proposes two additions for the mode running heads: `ع م ل` and `ص ح ب`.

**These two are proposed, not verified.** Isolated consonantal roots carry no register, so
the MSA rule plausibly does not engage — but "plausibly" is not the standard this project
holds, and I do not speak Gulf Arabic. Treat them as blocked until checked against
`docs/language/authority.md`, and fall back to English-only running heads if the check fails.
The design does not depend on them.

---

## 4. The material system

### 4.1 Colour

Sadaf spends nothing on hue. One ground, one ink, one accent, one semantic red.

**Light (default)**

| Role | Value | Against ground | Verdict |
|---|---|---|---|
| `BG` — Sadaf ground | `#FBF6EC` | — | — |
| `TEXT` — ink | `#1C150D` | **16.67:1** | AA / AAA |
| `TEXT2` — secondary | `rgba(28,21,13,0.72)` | **7.14:1** | AA / AAA |
| `TEXT3` — tertiary | `rgba(28,21,13,0.64)` | **5.28:1** | AA |
| `PRIMARY` — Zafaran | `#8A5C1F` | **5.41:1** | AA |
| `SURFACE` — sheet only | `#FFFFFF` | ink at **17.95:1** | AA / AAA |

**Dark (night variant)**

| Role | Value | Against ground | Verdict |
|---|---|---|---|
| `BG` — Layl ground | `#14100B` | — | — |
| `TEXT` — ink | `rgba(243,233,214,0.96)` | **14.49:1** | AA / AAA |
| `PRIMARY` — Zafaran | `#EAC57C` | **11.53:1** | AA / AAA |

All six values already exist in `tokens.ts`. Sadaf does not introduce a new palette — it
deletes the one that was fighting this one.

**Deleted (22 tokens).**
`CATEGORY_PINK`, `CATEGORY_MINT`, `CATEGORY_BLUE`, `CATEGORY_PEACH`, `CATEGORY_CREAM`,
`CATEGORY_LAVENDER` — the pastel system.
`NEUTRAL_50` … `NEUTRAL_900` — Tailwind's cool grey ramp; two live uses migrate to
`TEXT3` (`(tabs)/_layout.tsx:44`, the tab bar's inactive tint, currently cold `#6B7280`
against a warm ground) and `TEXT3`/`BORDER` (`OnboardingFlow.tsx:1183`).
`SAND`, `SECONDARY`, `PRIMARY_LIGHT`, `INVERTED_TEXT`, `WARM_BG`, `WARM_SURFACE` — zero uses.

**Kept but demoted.** `VIOLET*` stays as the one genuinely distinct hue, used *only* for the
Culture metric so the third axis stays distinguishable at a glance. `ERROR` (Hinna) stays
semantic. Neither is ever a card fill.

### 4.2 Type

The scale is fixed and everything sits on it. Existing constants only — no new families.

| Role | Face | Size / weight | Notes |
|---|---|---|---|
| Arabic hero | `FONT_ARABIC_EXTRA` (Tajawal 800) | 34 / 28 / 22 | Ink, not gold. The largest thing on the screen. |
| Romanisation | `FONT_LATIN_MEDIUM` | 12, `letterSpacing: 0.6` | Directly beneath the Arabic. This is the authoritative pronunciation channel and is set to look like one. |
| English gloss | `FONT_LATIN` | 14 | Tertiary. `TEXT2`. |
| Screen title | `FONT_HEADING_EXTRA` | 28, `letterSpacing: -0.5` | |
| Entry title | `FONT_HEADING_SEMI` | 16 | |
| Running head / label | `FONT_LATIN_MEDIUM` | 10, `letterSpacing: 1.6`, uppercase | `TEXT3`. |
| Numerals | any | `fontVariant: ['tabular-nums']` | Mandatory wherever digits stack in a column. |

`ARABIC_LINE_HEIGHT_MULTIPLIER` (1.35) and the documented 1.15× optical boost for Arabic
against Latin both stay as they are.

**Hierarchy rule.** Arabic → romanisation → English, in that order, always, on every surface
that shows a phrase. The Scenarios browse grid currently shows *no Arabic at all*; under
Sadaf every entry carries its key line.

### 4.3 Spacing

Sadaf has no fills or shadows to hide drift, so the scale is fixed here rather than left to
each screen. Every margin, padding and gap is one of these:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

Fixed applications, so screens cannot each invent their own:

| Slot | Value |
|---|---|
| Screen horizontal margin | 20 (the one off-scale value, matching the existing safe-area gutter) |
| Gap between entries | 0 — entries are separated by their hairline, not by space |
| Entry vertical padding | 16 |
| Gap between a title and its Arabic line | 8 |
| Gap between Arabic and romanisation | 4 |
| Gap between an entry's text block and its meta row | 12 |
| Section spacing | 32 |
| Above a section heading | 48 |

### 4.4 Chrome — tab bar and sheet

The tab bar is the most persistent surface in the app and needs stating explicitly.

- Ground `BG`, not a separate `TAB_BG` — the bar is the page, not a tray on top of it.
- The existing iOS/Android shadow block is **removed**; the bar separates with a single
  hairline at `BORDER`.
- Active tint `PRIMARY`, inactive `TEXT3` (replacing the cool `NEUTRAL_500`).
- The active-tab filled rounded-square behind the icon is removed. Active state is weight and
  colour, consistent with §4.3's radius budget.
- Icons: Lucide at 1.5 px stroke, 22 px, round caps.
- `SheetPanel` keeps `SURFACE` and the app's only shadow, per §4.5.

### 4.5 Depth

The whole app gets **one** elevated surface: the bottom sheet (`SheetPanel`). Nothing else
takes a shadow. Everything else separates with a 1px hairline at `BORDER` and space.

Radius budget (referenced by §4.4): `SheetPanel` 24, interactive pills 999, everything else **0**. A rounded
rectangle around every block is what flattens hierarchy; removing it is most of the work.

### 4.6 The watermark

`GhostLetters` is promoted from invisible decoration to the identity device.

- Opacity to ~8% light / ~5% dark — quiet, but legibly *there*.
- **Rotation removed.** `-6°`, `5°`, `-10°` reads as stickers. Set upright and aligned to the
  page margin, like a folio mark in a printed reference.
- The existing per-screen root triads stay; they are already meaningful and already shipping.
- Colour from `TEXT3` at low alpha, not from `JADE`/`VIOLET` — the watermark is ink, not accent.

---

## 5. Where Sadaf spends its emphasis

A design with no fills and no shadows has exactly one emphasis budget. It goes here.

### 5.1 Mode becomes a running head

Career vs Social is currently a colour swap. It becomes a persistent typographic identity.

- **Selection is the one full-bleed moment in the app.** Two facing plates — the only place
  the ruled-page logic breaks. Typographic, not photographic: no imagery required.
  This replaces `career_mode.png` / `social_mode.png` (1.2 MB combined).
- **The mode persists as a running head** on every screen, the way a book's running header
  tells you which section you are in. Set in the label style from §4.2.
- **Each mode owns its watermark root** — proposed `ع م ل` for Career and `ص ح ب` for Social,
  subject to the language check in §3.
- **The metric vocabulary split already exists** (`Trust / Respect / Culture` vs
  `Vibe / Rapport / Culture`, `ScenariosScreen.tsx:140`) and stays. It becomes visible
  evidence that the two modes are different products, not a filter.

### 5.2 Consequence becomes a margin

The butterfly-effect engine is the thing no flashcard competitor can copy, and nothing
renders it. This is the one aesthetic risk in the direction.

The scenario player gains a **margin rail** down the leading edge of the page:

- One mark per choice, accreted in order as the scenario runs.
- Mark weight derives from `getTone(state, scene)` — warm marks and cold marks are
  typographically distinct (weight and fill), never distinguished by hue alone.
- Because `impactByNpc` is per-NPC, the rail can group by interlocutor when a scene has more
  than one. Single-NPC scenes render a single column.
- **On the ending screen the rail becomes the summary**: the shape of the conversation you
  had, in order, with the turn visible. This replaces the current three-bar readout as the
  emotional payload of the result phase.

The engine already computes everything this needs. `src/engine/` stays pure — the rail reads
state, and no rendering concern moves into the engine.

### 5.3 Everything else stays quiet

Browse surfaces show **one** headline metric, not three. The full three appear on the
scenario detail screen, where the user has asked for detail.

---

## 6. Component inventory

### Build

| Component | Purpose |
|---|---|
| `ui/Entry.tsx` | The ruled entry. Replaces every card in browse contexts. Slots: index, title, Arabic, romanisation, meta row, one progress rule. |
| `ui/RunningHead.tsx` | Mode + section label, top of every screen. §5.1. |
| `ui/Monogram.tsx` | Typographic avatar on the Zafaran ramp. Replaces the two fox PNGs. |
| `ui/Companion.tsx` | The mascot seam. Renders the monogram today; one file to change when characters return. |
| `scenario/MarginRail.tsx` | §5.2. Reads `ScenarioState`, renders accreted marks. |
| `ui/ScreenHeader.tsx` | One header primitive — back, title, subtitle on their own rows. Fixes the Sentence Builder collision. |

### Change

`ScenariosScreen`, `PhraseLibrary`, `ProfileScreen`, `HomeScreenNew`, `PracticeScreen`,
`SentenceBuilder`, `ScenarioDetailScreen`, `ScenarioPlayer`, `OnboardingFlow`,
`(tabs)/_layout.tsx`, `GhostLetters`, `EmptyState`, `PrimaryButton`, `ShimmerButton`,
`SwitchButton`, and the three `home/` cards.

`OnboardingFlow.tsx` is 1,441 lines and takes the most change (hero, mode plates, avatar,
role/goal steps). It should be split as part of this work, not after.

### Retire from use

`KafMascot` (6 sites) · `IMAGES.foxyMale` (5) · `IMAGES.foxyFemale` (1) ·
`IMAGES.careerMode` / `IMAGES.socialMode` (1) · `CategoryIllustrations` (512 lines,
130 hex, single consumer) · `CategoryCard` (its only consumer — `PhraseLibrary` moves to
`Entry`) · `SceneIllustrations` (465 lines, 107 hex, single consumer —
`ScenarioDetailScreen`'s `HeroSceneBg`).

Two different dispositions, deliberately:

- **`.tsx` files stay on disk**, unimported. `KafMascot` in particular is the mascot seam —
  keeping it costs nothing at runtime and makes reintroducing characters a one-file change.
- **PNG assets are deleted** from `assets/images/` and from `constants/images.ts`. They are
  the 3.5 MB, and leaving them would mean the bundle never actually shrinks.

This removes **283 of 345** hardcoded hex values and ~3.5 MB of PNG.

---

## 7. Motion

Near-zero, by design. Moti stays only where it earns its place.

| Allowed | Not allowed |
|---|---|
| Press states (scale 0.98, 120 ms) | Entrance animations on lists |
| Progress and meter fills (400 ms ease-out) | Staggered card reveals |
| Sheet present/dismiss | Ambient/looping decoration |
| Margin-rail mark landing (§5.2), 200 ms | Mascot idle loops |
| Tab transitions (existing `fade`) | Shimmer on buttons |

`ShimmerButton`'s shimmer is removed; the component stays as the primary button.
All motion respects the reduced-motion setting.

---

## 8. Verification

Non-negotiable, and the reason the current state shipped broken.

1. **Contrast computed for every pairing**, foreground against the *composited* background —
   the ≈1.0:1 bug existed because a themed text token was placed on a theme-invariant fill and
   nobody composited the two. Text ≥ 4.5:1; meaningful non-text boundaries ≥ 3:1.
2. **A test asserting it.** Extend the existing `src/engine/__tests__/` pattern with a
   contrast test over the token pairings, so this class of bug cannot regress silently.
3. **A bidi test** over mixed Arabic/Latin runs, covering the Sentence Builder pattern strings.
4. **A lint rule** banning hex literals outside `tokens.ts` / `gradients.ts`.
5. **`npx tsc --noEmit` clean**, verified from a clean stash per `CLAUDE.md`.

---

## 9. Build order

Each step ends compiling and usable; none depends on a later one.

1. **Token surgery** — delete the 22 dead/wrong tokens, migrate the 2 live `NEUTRAL_` uses,
   add the contrast test. No visual change beyond the tab bar's inactive tint warming up.
2. **Primitives** — `Entry`, `ScreenHeader`, `RunningHead`, `Monogram`, `Companion`.
3. **Browse surfaces** — Scenarios, Phrase Library, Profile. This is where the pastels die and
   the ≈1.0:1 bug goes with them.
4. **`GhostLetters` promotion** + `EmptyState` rebuild.
5. **Onboarding** — split the 1,441-line file, mode plates, monogram avatar.
6. **Scenario player + margin rail** (§5.2) — the emphasis moment, last, on stable primitives.
7. **Sentence Builder** — header fix and the bidi fix, with its test.
8. **Sweep** — icon grammar to Lucide 1.5 px, hex lint, dead asset removal.

**This is more than one PR.** Steps 1–4 are the art direction proper — tokens, primitives,
browse surfaces — and land as one branch that is shippable on its own: the pastels are gone,
the contrast bug is fixed, and the app is coherent. Steps 5–8 are the deeper screens and
should be a second branch off the first. The implementation plan should be written for
steps 1–4, with 5–8 planned separately once the primitives have survived real use.

---

## 10. What I need from Ahmed

Nothing blocking. Lucide covers all iconography and the mode plates are typographic.

Two optional calls, neither of which holds up the build:

- **Scenario hero imagery.** `SceneIllustrations` currently draws hero backgrounds in code;
  `Office_morning.jpg` and `scene.jpg` (212 KB) exist but are barely used. Sadaf's default is
  typographic heroes — no imagery. If you want photographic heroes instead, that is 7 images
  and it changes step 6.
- **The two mode roots** (`ع م ل`, `ص ح ب`) need the language check in §3, not a design call.

---

## 11. Open risks

- **Sadaf is unforgiving.** With no fills or shadows, every spacing and baseline error is
  visible. Step 2 must establish the spacing scale properly or steps 3–7 inherit the drift.
- **Light-first flips the app's default mood** for existing users. Dark remains one toggle away
  and is a first-class variant, not an afterthought.
- **The margin rail is new interaction design**, not a restyle. It is scheduled last so it
  builds on settled primitives, and it is the one item that may need its own iteration.
