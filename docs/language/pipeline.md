# Content Pipeline

How to add or change Arabic in Fasih without breaking the language rules.

Read [`authority.md`](./authority.md) first. The rules are there; this is the
procedure.

---

## Adding a phrase

1. **Write the Arabic bare.** No harakat. Shadda only where it does real work
   (`عليّ`), tanwīn only in the conventional spellings (`شكراً`).
2. **Write the romanisation.** This is the pronunciation channel, not decoration —
   it carries the vowels the script does not. `g` for ق, never `q`.
3. **Cite a source.** `source` is required, so TypeScript will not let you skip it.
   Pick the `claim` honestly:
   - a verb form or pronoun suffix → `'morphosyntax'` (historical grammars allowed)
   - a word choice, an expression, a politeness formula → `'lexeme'` / `'usage'` /
     `'register'` (contemporary sources only)
   If you have not actually checked a source, write `UNSOURCED`. **Do not guess a
   page number.** A fabricated citation is worse than an honest gap, because it
   removes the very signal the backfill depends on.
4. **Set `cefr`.** A1 for the everyday core, A1+ for the blessing/response pairs,
   A2 for register-heavy or structurally complex material.
5. **Consider `currency`.** If you are not sure the form is still in daily use,
   `'unknown'` is correct. Do not write `'current'` to make the number look better.
6. **Run `npx jest`.** The lint will tell you if you have tripped a rule.

## Adding or editing a scenario

Everything above, plus:

- Keep the scenario inside its level's gates. `npx jest` reports which gate failed
  and by how much.
- If a change *fixes* a listed violation, **remove it from `KNOWN_LEVEL_VIOLATIONS`**
  in the same commit. The test fails if you do not — deliberately.
- If you add a genuinely new violation, do not just append it to the list. Either
  fix the content or re-level the scenario. The list is for the backlog inherited on
  2026-09-03, not a place to park new debt.

---

## The `unsourced` backfill

131 of 136 phrases carry `UNSOURCED` today. Driving that to zero is the single
highest-value piece of language work available. **Buying a reference book is not
the plan** — that was floated in an earlier pass and is money Ahmed does not have.
Sourcing here runs entirely on what's genuinely free.

**Sourced so far, from things actually read (2026-09-03, two research passes):**

- `e1` زين, `w2` ما شاء الله, `h3` البيت بيتك — from the Ramsa paper's printed
  examples (CC BY 4.0, unlike its restricted data) and an open-access UAEU paper
  on child Emirati Arabic.
- `e6` وايد, `g3` شلونك؟ — from English Wiktionary's Gulf Arabic entries, checked
  individually (see the tier explanation in [`authority.md`](./authority.md); it is
  a lower-confidence tier than the academic sources above, but genuinely checked).
- Five `DIALECT_FEATURES` entries upgraded from an unverified placeholder to a real
  citation: `good-zain`, `intensifier-waayid`, `how-shloon`, `here-hini`, and the
  affrication note on `fem-2sg-ch` — the last of which turned up a real, unresolved
  finding worth reading in full: Fasih may be writing the wrong Arabic *letter*
  (ج instead of چ) for a sound its own romanisation already gets right.
- Two entries (`want-abi`, `what-shu`) were checked against Wiktionary and **not
  found** — recorded honestly as still-unverified rather than either silently
  cleared or wrongly marked disproven. Coverage gaps aren't refutations.

**What free sourcing cannot do:** reach volume. Every research corpus in this space
(Ramsa, Mixat, Casablanca) turned out to be commercially restricted on inspection —
checked directly each time, not assumed — and open-access academic papers are
studies of narrow phenomena, not phrasebooks; each yields a handful of words, not a
category. Wiktionary is real but patchy: for every hit (وايد، شلون، هني) there was a
miss (أبي، أبغى، مشكور، شو) on words no less basic. **There is currently no free path
to sourcing this library at volume.** The honest options from here: keep harvesting
one paper and one dictionary entry at a time (slow, free, what this pipeline
describes below), or wait for a native speaker who can confirm forms directly
without needing a citation trail at all.

**Procedure for a batch:**

1. Pick a category (`Greetings`, `Gratitude`, …) so you are looking things up in one
   coherent sweep rather than at random.
2. For each phrase, find it in a source from `SOURCES` that is valid for the claim
   you are making.
3. Record the locator precisely enough that someone else can find it again: a page,
   a unit, a corpus utterance id. `'p.42'` is fine; `''` is not, and the lint
   rejects it.
4. While you are there, set `currency`, `use`, `origin` and `register` for that
   phrase. You are already holding the evidence.
5. **Lower `MAX_UNSOURCED`** in `languageContent.test.ts` to the new count. The test
   fails if you sourced phrases without lowering the cap.

**If a phrase cannot be sourced,** that is a finding, not a failure. It may be
invented, dated, or from another dialect. Flag it rather than forcing a citation.

---

## What this pipeline cannot do

It checks **form**: wrong morphology, MSA leaking in, non-Gulf lexemes, level drift.

It cannot check **naturalness** — whether an Emirati would actually say the thing.
No amount of citation or morphological analysis substitutes for a native speaker
reading the line and wincing.

So: content that passes the lint is *not verified correct*. It is *not obviously
wrong*. Those are different claims, and only the second one is currently supported.

---

## ⚠ The `fasih-scenario-review` skill needs three corrections

That skill predates this system and now contradicts it in places. It lives outside
this repo (it is a Claude skill, not a project file), so it could not be fixed in the
same commit — **someone has to edit it by hand.** Until then, where the skill and this
repo disagree, **the repo wins**.

**1. Delete the diacritisation requirement.** Section 4 says *"All Arabic in choice
cards is diacritized (تشكيل)."* This is now wrong and actively harmful: tashkeel
encodes MSA's vowel system, cannot write Emirati mid-vowels, and importing it breaks
the no-MSA rule. Replace with: *"Arabic script is bare. Shadda and conventional tanwīn
only. Romanisation carries pronunciation."*

**2. Remove the impact bands.** The skill's `good +3..+6` / `bad −3..−9` table
conflicted with the test file's `+3..+7` / `−1..−9`. Both are now reconciled in
`TIER_BANDS` in `src/constants/curriculum.ts` — `good` kept the wider band (adjacent
tiers overlap on purpose), `bad` kept the stricter one (a mistake costing one point
teaches nothing). The skill should point at that constant, not restate numbers.

**3. Remove the turn and phrase count tables.** They now live in `LEVEL_SPECS`, keyed
to CEFR bands. The skill's values happened to match, which is luck, not a system.

**Worth adding while editing it:** the no-MSA rule, and the requirement that every new
phrase carries a `source`.

---

## Two tiers of check

| | Runs | Blocks a commit | Catches |
|---|---|---|---|
| `languageContent.test.ts` | `npx jest` | Yes | Level gates, MSA blocklist, orthography, provenance |
| `tools/dialect-check.py` | CI, nightly | No | Real morphological analysis via CALIMA-GLF; the true MSA detector |

**The Jest blocklist is the better MSA detector**, and that is not a temporary
state. The first run of `dialect-check.py` against real content produced 114
"MSA-only" hits of which nearly all were false positives — ordinary shared nouns
(`سعر`, `كيلو`), proper nouns (`رونالدو`), an English loanword (`أوكي`), and `هذي`,
which is the *Gulf* feminine demonstrative the blocklist bans MSA `هذه` in favour of.

The cause: **CALIMA-GLF is a verb database** (~2,600 verbal lemmas), not a full
Gulf lexicon. "Does not analyse as Gulf" overwhelmingly means "is not a Gulf verb".

So the tool sorts its output into three buckets, and only the first is actionable:

| Bucket | Meaning | Act on it? |
|---|---|---|
| **Blocklist hit** | On `MSA_BLOCKLIST` (read straight from `curriculum.ts`) | **Yes** — should always be zero, since Jest fails the build on these. A hit means the detectors disagree. |
| **Out of vocabulary** | Neither database analyses it | Review. Real Emirati forms (`يديد`, `صباطج`), deliberate other-dialect content (`بتاعك` is Youssef's Egyptian), loanwords. |
| **Weak signal** | MSA yes, Gulf no | Skim only. Mostly shared nouns. Never action without a source. |

CI gates on the first bucket alone (`--max-blocklist 0`).
