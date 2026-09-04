# Language Authority & Curriculum Infrastructure — Design

**Date:** 2026-09-03
**Status:** Implemented (2026-09-03). See "Implementation notes" at the end for where reality diverged from this design.
**Branch:** `feat/language-authority`

---

## 1. Why this exists

Fasih ships Arabic content with no record of where any of it came from. A grep of
`docs/`, `CLAUDE.md` and `src/constants/` returns zero lines recording who wrote or
verified a single Arabic string. There is one commit titled *"Gulf Arabic corrections"*
with no record of who made them or on what authority.

The project owner does not speak Gulf Arabic. So the honest description of the content's
provenance today is: **an AI wrote it and no one who speaks the language has checked it.**

A second, related failure is already measurable. Two documents in this repo both claim
authority over orthography and contradict each other:

- `src/constants/scenarios.ts` header: *"no tashkeel in Arabic strings"*
- `fasih-scenario-review` skill: *"All Arabic in choice cards is diacritized (تشكيل)"*

Actual coverage sits at neither rule. A third document with opinions would make this worse.
So the governing principle of this design is:

> **One home per rule. Rules a machine can check live where the machine reads them.**

---

## 2. Decisions taken

| # | Decision | Choice |
|---|---|---|
| 1 | Validation model | Published references + automated lint. No native-speaker reviewer yet. |
| 2 | Dialect scope | Emirati production, Gulf-wide tolerance, other dialects receptive-only. |
| 3 | Level ladder | Three user-facing tiers, each anchored to a CEFR band. |
| 4 | Architecture | Checkable rules in typed code; prose and rationale in `docs/language/`. |
| 5 | MSA | **Strictly none, in any channel.** Hard rule. |

**Decision 1 carries a limit that must stay visible:** references and lint catch *form*
errors — wrong morphology, MSA leaking in, non-Gulf lexemes. They cannot catch
*naturalness*, i.e. whether an Emirati would actually say it that way. Nothing in this
design closes that gap. Only a native reviewer does.

---

## 3. Language authority

Lands in `docs/language/authority.md`.

### 3.1 No MSA — hard rule

No Modern Standard Arabic anywhere: choice cards, NPC dialogue, phrase library, grammar
patterns, UI Arabic, or **audio**. MSA in content is a bug, not a style choice.

Rationale: Arabic is diglossic. MSA is nobody's native spoken register. Teaching an expat
MSA to survive in Dubai is the classic failure mode — years of study, still unable to hold
a conversation. Dialect-first is the product's whole thesis.

**Two live violations exist as of this design:**

1. `useArabicTTS.ts` comments that `ar-AE` yields a *"Khaleeji/Emirati accent."* This is
   false — `ar-AE` is a locale tag, and device Arabic voices are MSA-trained regardless of
   region. The app pronounces `قهوة` as *qahwa* while its own pronTip teaches *gahwa*, and
   `چ` is absent from the MSA inventory entirely. **Audio is currently an MSA channel.**
2. The `fasih-scenario-review` skill's diacritisation requirement (see §3.4).

### 3.2 Target variety

**Production target: contemporary urban Emirati** — Dubai/Abu Dhabi speech as used *today*,
which is what Al Ramsa teaches and what the Routledge workbook describes.

Not "most Emirati." Research on [generational change in the UAE][gen] documents younger
Emiratis shedding distinctly Emirati vocabulary in favour of a **pan-Gulf koine** — a
homogenised Gulf speech not identifiable with any one community, with words borrowed from
neighbouring Gulf countries and others gone from the local lexicon. Add heavy
[Arabic–English code-switching][hop] among Emirati millennials.

Consequence: a pan-Gulf form is often the *contemporary* one, and a distinctly-Emirati form
is sometimes the *archaic* one. Optimising for Emirati purity would teach learners to sound
dated. The flag that matters is not "pan-Gulf" — it is **`dated`** and **`heritage`**.

Ramsa's corpus documents three sub-varieties (Urban, Bedouin, Mountain/Shihhi). Only Urban is
in scope for production. Bedouin and Shihhi forms, if present at all, are `recognise`-only.

### 3.3 Source hierarchy, split by claim type

Grammar changes slowly; lexicon and pragmatics change fast. So a citation is only valid for
the *kind of claim* it supports. `SourceRef.claim` is one of
`'morphosyntax' | 'lexeme' | 'usage' | 'register'`.

**For `morphosyntax`** — verb paradigms, pronoun sets, negation structure, question
formation. Stable over decades; historical descriptions are acceptable.

1. Leung, Ntelitheos & Al Kaabi, *Basic Emirati Arabic: A Grammar and Workbook* (Routledge, 2024)
2. *Emirati Arabic: A Comprehensive Grammar* (Routledge)
3. Qafisheh, *A Short Reference Grammar of Gulf Arabic* (1977) — Abu Dhabi-based
4. Holes, *Gulf Arabic* (Routledge, 1990)

**For `lexeme` / `usage` / `register`** — anything a learner will actually utter.
**Sources 3 and 4 above are NOT acceptable as a sole citation.** Required instead:

1. **Ramsa corpus (2026)** — 41h, 157 speakers, CC BY 4.0. Attested contemporary speech and
   the only free source in this tier. [arXiv:2603.08125][ramsa]
2. **Al Ramsa Institute materials** — current, taught to expats in Dubai now
3. **Leung, Ntelitheos & Al Kaabi (2024)**
4. **Emirati social-media corpora** — contemporary written Emirati ([Springer, 2024][sm])

The lint enforces: `claim !== 'morphosyntax'` requires a post-2020 source.

### 3.4 Orthography

**Arabic script stays bare at every level.** No tashkeel.

Evidence and reasoning:

- Only 22 choice cards currently carry any tashkeel, and 21 of those carry only tanwīn on
  `شكراً / أهلاً / دايماً / طبعاً` — conventional spelling of those words, not vocalisation.
  Exactly one string is genuinely vowelled. Real vocalisation is ~1 string in 160.
- Tashkeel encodes MSA's vowel system. Emirati has mid vowels MSA lacks — the /oo/ in
  `شلون`, the /ai/ in `زين` — with **no standard mark**. Vocalising them means inventing
  conventions, which is the opposite of adopting a standard. It is also, strictly, importing
  MSA machinery into a no-MSA app.

This resolves the contradiction in §1 in favour of `scenarios.ts`. The
`fasih-scenario-review` skill's diacritisation rule is **deleted**, not enforced.

Consonantal spelling follows **CODA\*** ([Habash et al., LREC 2012][coda]; [CODA\*][codastar])
so `چ` vs `ك` and `گ` vs `ق` stop being per-file decisions.

**Romanisation is the authoritative pronunciation channel.** It already exists on every
phrase and choice, and it can write `zain` and `shloon`. The existing scheme is kept
(`'` = ع, `kh` = خ, `g` = ق, `aa/ii/uu` long) but formalised as a table with IPA
equivalences, so it is checkable and maps onto the Routledge book a learner may buy next.

### 3.5 Audio authority

The TTS channel cannot currently be trusted to pronounce dialect. Until resolved:

- Any phrase whose pronunciation is *pedagogically load-bearing* (i.e. its pronTip teaches a
  dialect-specific sound: `g` for ق, `ch` for ك, `y` for ج) must be **human-recorded**, not
  synthesised.
- The false `ar-AE` comment in `useArabicTTS.ts` is corrected to state the real limitation.
- Emirati TTS is a known unsolved problem, not something a locale tag fixes — the Ramsa paper
  exists partly because of it, and benchmarks MMS-TTS-Ara for exactly this reason.

### 3.6 Stated limits

To be reproduced verbatim in `authority.md` so it cannot quietly become an assumption that
someone checked:

> No native speaker of Emirati Arabic has reviewed this content. Validation is by published
> reference and automated morphological analysis. This catches wrong forms; it does not catch
> unnatural ones. The project owner's approval of a phrase is a product decision, never a
> linguistic one.

---

## 4. Curriculum model

### 4.1 Single source of truth

`src/constants/curriculum.ts` holds every checkable number. The app imports it to render level
badges and can-do descriptors; the Jest lint imports the same constant to assert against. A
threshold cannot drift from its own enforcement because there is one copy.

```ts
export type CEFRBand = 'A1' | 'A1+' | 'A2';

export interface LevelSpec {
  tier: DifficultyLevel;          // user-facing name
  cefr: CEFRBand;                 // external anchor
  canDo: string;                  // CEFR-style descriptor, shown in UI
  turns: Range;
  phrasesUnlocked: Range;
  meanMorphemes: Range;           // NOT whitespace words — see §4.3
  morphemeCeiling: number | null;
  maxClausesPerCard: number;
  productiveDialectFeatures: number;    // min distinct, from DIALECT_FEATURES
  receptiveDialects: 'none' | 'recognise' | 'recognise-and-respond';
}
```

### 4.2 CEFR anchoring — honest bands

An earlier draft mapped Advanced to B1. That overclaims. CEFR B1 is *"can describe experiences
and events, and briefly give reasons and explanations for opinions and plans."* A learner who
completes a 7-turn scripted scenario with 16 phrases cannot do that — they can complete a
transaction, which is A2. Al Ramsa needs **nine levels to reach B3**; their beginner block
alone is three levels. Fasih's entire content sits inside roughly A1–A2.

| Tier (user-facing) | CEFR anchor | Can-do |
|---|---|---|
| Beginner | **A1** | Reply in set exchanges when spoken to slowly |
| Intermediate | **A1+** | Handle a routine exchange and hold a turn |
| Advanced | **A2** | Sustain a familiar situation and carry register |

**B1 is roadmap, not a claim.** Marketing "B1 Emirati Arabic" on this content would be false.

### 4.3 Utterance-length gates are measured in morphemes, and are PROVISIONAL

Arabic clitics attach in writing: `بالأسبوع` is one whitespace token, three morphemes. So
"words per card" measures spelling as much as complexity — and CODA\* normalisation would
change the counts any band is calibrated on.

Measured spread of morpheme-to-whitespace inflation across the ten scripted scenarios:
**×1.29 to ×1.82** (overall ×1.54). `hotel-guest` is the densest at ×1.82; `social_taxi_ride`
the sparsest at ×1.37.

**Therefore:** all length gates are expressed in morphemes, tokenised by CAMeL Tools.

**The numbers below are provisional**, derived from a crude regex clitic-split, and MUST be
recalibrated against real CAMeL tokenisation once `tools/dialect-check.py` exists (build step 6).
Provisional per-scenario means, for calibration reference:

```
onboarding-cafe-social  3.7    cafe-friends       6.8
onboarding-cafe-career  4.2    hotel-guest        9.1
social_elevator         4.7    coffee-invitation  9.3
social_taxi_ride        5.9    eid-greeting       9.5
first-morning           6.5    the-checkup       11.7
                               gym-consultation  12.6
```

Provisional bands: **A1** 4–7 · **A1+** 8–10 · **A2** 11–14. (Boundaries are non-overlapping and inclusive.)

> **Note:** under morpheme counting, `coffee-invitation` (9.3) and `eid-greeting` (9.5) are
> denser than `hotel-guest` (9.1). The re-levelling recommendations in the 2026-09-03 difficulty
> audit were computed on whitespace counts and **will shift** after recalibration. Do not act on
> that table until this step is done.

### 4.4 Dialect features must be an enumerated set

`productiveDialectFeatures: number` is only checkable against a closed list. `curriculum.ts`
exports `DIALECT_FEATURES`, each entry carrying a matcher and its own source citation:

```ts
{ id: 'neg-mub',      pattern: /\bمب\b/,        claim: 'morphosyntax', source: ... }
{ id: 'fem-2sg-ch',   pattern: /(?:لج|عندج|...)/, claim: 'morphosyntax', source: ... }
{ id: 'now-alheen',   pattern: /الحين/,          claim: 'lexeme',       source: ... }
{ id: 'g-to-y',       pattern: /(?:ياب|يديد)/,   claim: 'morphosyntax', source: ... }
// ...
```

Without this the field would sit in `curriculum.ts` pretending to be enforceable.

### 4.5 Type consolidation — one scale

Today there are three difficulty vocabularies, and they contradict each other:
`social_taxi_ride` is `level: 'Beginner'` in the catalog and `difficulty: 'Level 2 (Elementary)'`
in the script.

- `Scenario.level` — **stays** as the user-facing tier; `cefr` derived from it
- `ScenarioScript.difficulty?: string` — **deleted**. Verified to have zero consumers.
- `ScenarioScript.estimatedMinutes` — **kept**. Consumed at `ScenarioDetailScreen.tsx:130`.
- `PhraseDifficulty` (`'basic'|'intermediate'|'advanced'`) — becomes `cefr: CEFRBand`, so
  "≥80% A1 phrases" is one comparison rather than a mapping between two scales

### 4.6 New fields on `Phrase`

Each replaces something currently trapped in English prose.

```ts
source:   SourceRef;   // { ref, locator, claim } — see §3.3
currency: 'current' | 'dated' | 'heritage' | 'unknown';
use:      'produce' | 'recognise' | 'unknown';
origin:   'emirati' | 'gulf-koine' | 'non-gulf' | 'unknown';
register: 'neutral' | 'deferential' | 'unknown';   // PROVISIONAL — see below
```

- `currency` is the archaism guard. `heritage` is a product concept, not just a warning —
  proverbs and pre-oil vocabulary belong in the cultural journal, not in "say this tomorrow."
- `use` types a distinction already made in English: `tx-2` (`انت منين؟`) carries the note
  *"Learn to recognise it, not to say it"* — a `recognise` flag written as a sentence.
- `register` is **provisional**. The earlier draft's `'neutral' | 'deferential' | 'intimate'`
  triad was invented, not drawn from the literature. The deferential register is clearly real
  (`طال عمرك`, `سعادتكم`); `intimate` was doing no defensible work and is dropped pending a source.
- **`'unknown'` is mandatory on every new field.** Defaulting `currency: 'current'` would assert
  contemporary usage nobody checked — precisely the archaism risk this design exists to prevent.
  The backfill must be allowed to be honest.

### 4.7 Forgiveness is a statistic, not a gate

An earlier draft gated on "share of reachable paths hitting the worst ending." That metric was
caveated in the difficulty audit as *descriptive* (uniform path weighting does not describe
learners, who are trying to do well) and then promoted to *normative* without justification.

Dropped. `scenarioContent.test.ts` already contains the defensible behavioural version —
*"one mistake in an otherwise good run does not reach the worst ending"* — passing for all ten
scenarios. Keep that test; report the share as a monitored statistic only.

### 4.8 Onboarding exemption

`onboarding-cafe` is exempt from all level gates. Note the id mapping: the catalog has one entry
(`onboarding-cafe`) but the scripts are `onboarding-cafe-career` and `onboarding-cafe-social`.
The exemption must cover all three ids.

---

## 5. Enforcement

Two tiers, because CAMeL Tools is Python and this is a React Native repo.

### 5.1 Jest — blocks every commit

New `src/engine/__tests__/languageContent.test.ts`, importing `curriculum.ts`:

- Level gates: turns, phrase count, morpheme mean + ceiling, clause count vs declared level
- `source` present on every phrase; the `unsourced` count reported as a tracked number
- **MSA blocklist** — `ماذا / لماذا / أين / ليس / سوف / الآن / هذه / ذلك / أريد / يمكنني / جداً`
  and similar MSA-only function words. Crude, but it catches the common leaks and enforces §3.1.
- No `dated` or `heritage` lexeme in any production choice card
- `claim !== 'morphosyntax'` requires a post-2020 source
- No tashkeel in Arabic strings (§3.4), tanwīn on conventional adverbials excepted

### 5.2 GitHub Action — nightly / on content change, non-blocking

`tools/dialect-check.py`, using [CAMeL Tools][camel]:

- **CALIMA-GLF**: flag any token that analyses under the MSA analyser but **not** under the Gulf
  analyser. This is the real MSA detector; the Jest blocklist is the cheap approximation.
- CAMeL dialect ID per string, with an MSA-probability threshold
- Emits a report artifact. Does not block the commit.

### 5.3 CLAUDE.md

Add roughly 30 lines. Must-know rules only, plus pointers — not a copy of this document:

- No MSA. Any channel. Hard rule.
- Target: contemporary urban Emirati, koine-tolerant; `dated`/`heritage` flagged
- Every Arabic string cites a source. `unsourced` is permitted but recorded, never hidden.
- Romanisation is the pronunciation channel. No tashkeel.
- **The owner's approval is a product decision, never a linguistic one.** Never record content
  as verified because he approved it.
- Pointers to `docs/language/{authority,curriculum,pipeline}.md`

### 5.4 The review skill must be fixed in the same change

`fasih-scenario-review` currently demands diacritised Arabic (contradicts §3.4) and uses
outcome-tier bands that disagree with `scenarioContent.test.ts:32` — the checklist says `good`
+3..+6 and `bad` −3..−9; the test encodes +3..+7 and −1..−9, which is why three "bad" choices
currently cost only −2. Reconcile both, or this design adds a fourth conflicting document.

---

## 6. Build order

1. `src/constants/curriculum.ts` — `LEVEL_SPECS`, `DIALECT_FEATURES`, `MSA_BLOCKLIST`, `SOURCES`
2. `languageContent.test.ts` — will fail loudly at first; that is the point
3. `docs/language/{authority,curriculum,pipeline}.md`
4. CLAUDE.md section + `fasih-scenario-review` skill fix
5. Type migration: delete `ScenarioScript.difficulty`; `PhraseDifficulty` → `cefr`; add the five
   new `Phrase` fields, all defaulting to `'unknown'`
6. `tools/dialect-check.py` + GitHub Action — **then recalibrate §4.3 bands on real tokenisation**
7. Backfill `source` / `currency` / `use` / `origin`, driving `unsourced` down as tracked work
8. Fix the TTS comment; identify phrases needing human recording (§3.5)

---

## 7. Open / provisional

| Item | Status |
|---|---|
| Morpheme bands (§4.3) | Provisional — recalibrate at build step 6 |
| Difficulty-audit re-levelling table | Superseded pending recalibration; do not act on it |
| `register` values (§4.6) | Provisional — pin against a source before hardening |
| Native-speaker validation | Not in scope. The §3.6 limit stands until it is. |
| Human audio recording | Identified as needed; sourcing not designed here |

---

## Sources

- [Generational change and Language in the UAE: The desertion of the Emirati vernacular][gen]
- [Hopkyns, *The use of English and linguistic hybridity among Emirati millennials*, World Englishes 2021][hop]
- [Ramsa: A Sociolinguistically Rich Emirati Arabic Speech Corpus (2026)][ramsa]
- [Habash et al., *Conventional Orthography for Dialectal Arabic*, LREC 2012][coda] · [CODA\*][codastar]
- [CAMeL Tools, NYU Abu Dhabi][camel]
- [Towards Gulf Emirati Dialect Corpus from Social Media][sm]
- [Al Ramsa Institute][ramsainst] — 9 levels (3 beginner / 3 intermediate / 3 advanced), A1–B3
- Leung, Ntelitheos & Al Kaabi, *Basic Emirati Arabic* (Routledge, 2024)
- Qafisheh (1977); Holes (1990) — morphosyntax only, per §3.3

[gen]: https://www.researchgate.net/publication/308710771_Generational_change_and_Language_in_the_UAE_The_desertion_of_the_Emirati_vernacular
[hop]: https://onlinelibrary.wiley.com/doi/10.1111/weng.12506
[ramsa]: https://arxiv.org/abs/2603.08125
[coda]: https://aclanthology.org/L12-1328/
[codastar]: https://camel.abudhabi.nyu.edu/madar/static/pdfs/2018-LREC-CODA-STAR.pdf
[camel]: https://github.com/CAMeL-Lab/camel_tools
[sm]: https://link.springer.com/chapter/10.1007/978-3-031-56121-4_27
[ramsainst]: https://alramsa.ae/

---

## Implementation notes (2026-09-03)

Five places where building it changed the design. Recorded because the design doc
alone would now be misleading.

**1. The lint is a ratchet, not a red suite.** §5.1 expected the lint to "fail loudly
at first, and that is the point." In practice a permanently-red suite gets ignored
within a week. Known violations are listed in source
(`KNOWN_LEVEL_VIOLATIONS`, `KNOWN_DIALECT_GAPS`, `KNOWN_TIER_BAND_VIOLATIONS`) and the
tests assert the sets have not *grown* — plus a second assertion that fixing a
violation without delisting it also fails, so the lists cannot rot into excuses.

**2. Shadda and conventional tanwīn are allowed.** §3.4 said "no tashkeel", full stop.
Applied literally that flagged `عليّ` (*'alayy*, "on me"), where the shadda marks
gemination — a consonant-length distinction real in Emirati and not MSA vowel
machinery — and `شكراً`, which is simply how the word is spelled. Only the harakat are
excluded. That is the actual no-MSA rule; the blanket version was over-broad.

**3. Turn counting had to be branching-aware.** Counting `scenes.length` marked
`social_taxi_ride` as seven turns when a learner plays five. The gate now walks the
branch graph and requires both the shortest and longest playthrough to sit in band.

**4. The morpheme counter needed an indivisible set.** The generic enclitic rule read
`الله` as `الل` + `ه`, inflating every blessing formula in the content. Sanity cases
are asserted in the lint so a future refactor cannot quietly reintroduce it.

**5. Tier bands were reconciled per band, not wholesale.** §5.4 said to pick one of
the two conflicting sources. Neither was right about both: `good` kept the test's
wider `+3..+7` (adjacent tiers overlap on purpose), `bad` kept the checklist's
stricter `-9..-3` (a mistake costing one point makes its own lesson a lie).

**Also delivered beyond the spec:** `.github/workflows/verify.yml`, because the repo
had no CI at all — without it the lint would only ever run for whoever remembered to.

**Not delivered:** the `fasih-scenario-review` skill edits (§5.4). The skill lives
outside this repo in an ephemeral session cache, so the three required corrections are
written up in `docs/language/pipeline.md` for a human to apply.

**Two content fixes made under the no-MSA rule**, both flagged by the new lint:
`coffee-invitation` said `تريد` / *turiid* in three dialogue variants — the exact form
`phrases.ts` and `grammar.ts` both teach against — now `تبي` / *tabi*; and
`gym-consultation` carried the app's only fully vocalised card.
