# Curriculum

How Fasih's difficulty ladder is built and why. The numbers themselves live in
[`src/constants/curriculum.ts`](../../src/constants/curriculum.ts) — **this file
does not restate them**, because a threshold written in two places is a threshold
that will eventually disagree with itself.

---

## Why the ladder drifted

Before 2026-09-03, Fasih had three levels that referenced nothing external. An audit
of the ten scripted scenarios found:

- **Zero** scripted Advanced scenarios. The tier existed only as a label.
- Only five of ten scenarios sat inside the band their own level claimed.
- `the-checkup`, labelled Beginner, carried the longest and most complex choice card
  in the app — a four-clause, two-question utterance in feminine address.
- `gym-consultation`, labelled Intermediate, met every structural marker of a tier
  above it.
- `scenario.level` appeared in exactly **one** place in the UI and gated nothing.

Nothing here was carelessness. It is what happens when a scale has no outside
anchor: there is nothing to drift *from*, so drift is undetectable.

---

## The anchor: CEFR, honestly

Each tier is pinned to a CEFR band. The tier name is what the learner sees; the band
is what makes the ladder comparable to anything outside this repo.

| Tier | CEFR | Can-do |
|---|---|---|
| Beginner | **A1** | Reply in set exchanges when spoken to slowly |
| Intermediate | **A1+** | Handle a routine exchange and hold a turn |
| Advanced | **A2** | Sustain a familiar situation and carry register |

### Why it stops at A2

An earlier draft mapped Advanced to B1. That was wrong. CEFR B1 is *"can describe
experiences and events, and briefly give reasons and explanations for opinions and
plans."* A learner who finishes a seven-turn scripted scenario cannot do that. They
can complete a transaction — which is A2.

For scale: **Al Ramsa Institute needs nine levels to reach B3**, and their beginner
block alone is three of them. Fasih's entire library sits inside A1–A2.

**B1 is roadmap, not a claim.** Do not market "B1 Emirati Arabic" on this content,
and do not add `'B1'` to `CEFRBand` until content exists that earns it.

---

## Length is measured in morphemes

Arabic writes clitics attached: `بالأسبوع` is one whitespace token and three
morphemes (*bi-* + *al-* + *usbuu'*). So counting words measures **spelling** as much
as complexity — and adopting CODA\* would shift the counts underneath any band
calibrated on them.

Measured across the ten scripted scenarios, morpheme-to-word inflation ranges
**×1.09 to ×1.47**. Two scenarios with the same word count can differ by nearly half
again in real morphological load.

So every length gate uses `countMorphemes` from
[`src/engine/arabicMetrics.ts`](../../src/engine/arabicMetrics.ts).

> **The bands are provisional.** `countMorphemes` is a deterministic orthographic
> approximation, not a morphological analysis — it detects clitics that are
> unambiguous in writing and declines the ambiguous ones. The bands were calibrated
> against *that function*, so they are self-consistent today. When
> `tools/dialect-check.py` lands, recalibrate against real CALIMA-GLF tokenisation
> and update the numbers in the same commit.

---

## What the gates measure, and why each one exists

- **turns** — computed as the actual playthrough length, not `scenes.length`.
  `social_taxi_ride` declares seven scenes but branches, so a learner plays five.
- **phrasesUnlocked** — vocabulary load per scenario.
- **meanMorphemes** — typical utterance complexity.
- **morphemeCeiling** — the outlier guard. A scenario can have a gentle average and
  still contain one card that ambushes the learner.
- **maxClausesPerCard** — stops a card posing two asks in one breath. This is the
  gate `the-checkup` fails most clearly.
- **productiveDialectFeatures** — counted against the enumerated `DIALECT_FEATURES`
  set. A count is only checkable against a closed list, which is why that list
  exists rather than a vague "should use dialect."
- **receptiveDialects** — how much non-Emirati Arabic the learner is expected to
  *understand* at this level.

### What is deliberately NOT a gate

**Forgiveness percentage.** The audit measured the share of all reachable paths that
end at the worst ending, and an early draft made it a gate. That was a mistake:
uniform path weighting does not describe learners, who are trying to do well. The
statistic is descriptive and was being used prescriptively.

`scenarioContent.test.ts` already contains the defensible behavioural version —
*"one mistake in an otherwise good run does not reach the worst ending"* — and it
passes for every scenario. Keep that; report the share as an observation only.

---

## The ratchet

`languageContent.test.ts` does not fail the build for every existing violation.
A permanently red suite gets ignored within a week, and a lint nobody reads enforces
nothing.

Instead, known violations are listed explicitly in `KNOWN_LEVEL_VIOLATIONS` and
`KNOWN_DIALECT_GAPS`, and the tests assert the sets have **not grown**. Both
directions are checked:

- a **new** violation fails CI immediately
- **fixing** a violation without delisting it *also* fails

That second assertion is what stops the allowlist rotting into a list of permanent
excuses. The lists are meant to shrink to nothing.

### Outstanding at 2026-09-03

18 level violations across 8 scenarios, plus `hotel-guest` producing no dialect
feature at all. `cafe-friends` is the only scenario that passes every gate.

`hotel-guest` is the interesting one: its difficulty is formal **register**
(`طال عمرك`, honorifics, dignitary protocol), not dialect grammar. That is a real
second axis the single level scale cannot express, and it explains why the scenario
reads as harder than its measurements suggest. Worth solving properly rather than by
padding it with dialect words.

### Update 2026-09-14

MVP cut `the-checkup`, `gym-consultation`, `hotel-guest` and `cafe-friends`
(spec `docs/superpowers/specs/2026-09-14-butterfly-engine-mvp-design.md`). 9 level
violations remain, across `coffee-invitation`, `eid-greeting`, `first-morning`,
`social_elevator` and `social_taxi_ride` — all five are being rewritten under that
spec. The register-vs-dialect axis above still matters: The Meeting will hit it.
