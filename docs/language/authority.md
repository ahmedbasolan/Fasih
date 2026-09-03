# Language Authority

The rules governing every word of Arabic in Fasih. This is the operating manual;
the reasoning behind it is in
[`docs/superpowers/specs/2026-09-03-language-authority-design.md`](../superpowers/specs/2026-09-03-language-authority-design.md).

Anything a machine can check lives in [`src/constants/curriculum.ts`](../../src/constants/curriculum.ts)
and is enforced by [`languageContent.test.ts`](../../src/engine/__tests__/languageContent.test.ts).
**Do not restate a threshold here.** One home per rule — two documents disagreeing
about tashkeel is the specific failure this whole system exists to prevent.

---

## 1. No MSA. Anywhere.

Fasih contains no Modern Standard Arabic. Not in choice cards, NPC dialogue, the
phrase library, grammar patterns, UI Arabic, or audio. **MSA in content is a bug**,
not a stylistic preference.

Arabic is diglossic: MSA (فصحى) is the written and formal register, and it is
nobody's native spoken language. An expat who studies MSA to survive in Dubai
hits the classic failure — years of study, still unable to hold a conversation at
the coffee machine. Dialect-first is the product's entire thesis.

The enforced blocklist is `MSA_BLOCKLIST` in `curriculum.ts`. It was built by
testing every candidate against all 457 Arabic strings in the app, and four
candidates were **rejected on evidence** — read the comment there before
re-proposing them.

**Scope:** the rule applies to learner-facing Arabic. It does **not** apply to
English teaching notes, which legitimately quote MSA forms in order to contrast
them ("أبي is the everyday Khaleeji 'I want', not أريد"). That distinction is
enforced by the lint's collector, not by judgement.

### Known standing violation: audio

The TTS layer speaks MSA. `ar-AE` is a locale tag, not a dialect model, and device
Arabic voices are MSA-trained regardless of region. The app says *qahwa* while the
card teaches *gahwa*. See the comment in
[`useArabicTTS.ts`](../../src/hooks/useArabicTTS.ts). This is recorded as a
violation, not a feature.

---

## 2. What variety we teach

**Production target: contemporary urban Emirati** — Dubai/Abu Dhabi speech as it is
spoken *today*.

Not "the most Emirati form available." Younger Emiratis have been shedding
distinctly Emirati vocabulary in favour of a **pan-Gulf koine**, with words borrowed
from neighbouring Gulf countries and others simply gone from the local lexicon.
Layer on heavy Arabic–English code-switching among Emirati millennials and Gen Z.

The consequence is counter-intuitive and worth stating plainly:

> A pan-Gulf form is often the **contemporary** one, and a distinctly-Emirati form
> is sometimes the **archaic** one. Optimising for Emirati purity teaches learners
> to sound like their neighbours' grandparents.

So the flag that matters is not "is this pan-Gulf?" but **is this still said?** —
the `currency` field on `Phrase`:

| `currency`  | Meaning | Where it may appear |
|---|---|---|
| `current`   | Attested in contemporary Emirati speech | Anywhere |
| `dated`     | Older speakers still use it | Receptive content only; never an A1 card |
| `heritage`  | Culturally real, not daily speech — proverbs, pre-oil vocabulary | Cultural journal, never a "say this tomorrow" card |
| `unknown`   | Nobody has checked | The honest default |

Emirati itself is not one accent. The Ramsa corpus documents **Urban, Bedouin and
Mountain/Shihhi** varieties. Only Urban is in scope for production; the others, if
they appear at all, are `use: 'recognise'`.

### Other dialects

UAE learners hear Egyptian, Levantine and Sudanese Arabic daily. Fasih teaches these
**receptively only** — understand them, answer in Khaleeji. That is what
`social_taxi_ride` already does with Youssef's Egyptian. Mark such content
`use: 'recognise'`, never `'produce'`.

---

## 3. Citing sources

Every Arabic string should name where it came from. The `source` field is
**required** on `Phrase`, so a new phrase cannot be added without saying something
about its provenance — even if that something is honestly `UNSOURCED`.

### Split by claim type — this is the important part

Grammar changes slowly. Lexicon and pragmatics change fast. A citation is therefore
only valid for the **kind of claim** it supports (`SourceRef.claim`):

**`morphosyntax`** — verb paradigms, pronoun sets, negation structure, question
formation. Stable across decades, so the historical grammars are fine here:
Leung/Ntelitheos/Al Kaabi (2024), the Routledge *Comprehensive Grammar*,
Qafisheh (1977), Holes (1990).

**`lexeme` / `usage` / `register`** — anything a learner will actually say.
**Qafisheh and Holes are NOT acceptable as a sole citation.** They describe Gulf
speech from before the UAE's population multiplied roughly twentyfold. Use, in
order of preference:

1. **Leung, Ntelitheos & Al Kaabi (2024)** — purchasable, Emirati-specific
2. **Al Ramsa Institute materials** — purchasable, taught to expats in Dubai now
3. **Ramsa *paper*** (arXiv:2603.08125) — CC BY 4.0. Cite its printed example
   utterances and its documented phonological substitutions. **Not the corpus** —
   see the warning below.

The lint enforces this: a non-`morphosyntax` claim requires a source published
2020 or later. `SOURCES` in `curriculum.ts` is the authoritative table.

### ⚠ Research corpora are not available to this project

An earlier version of this document told you to start sourcing from the Ramsa
corpus, described it as CC BY 4.0, and called it "the only free source in this
tier." **That was wrong**, and the error is recorded here because it is the trap
any similar project will fall into.

The CC BY 4.0 licence covers the *paper*. The *data* is governed by the paper's
§9: the interview recordings are available "on request to qualified researchers
for **noncommercial scholarly use**, subject to an institutional Data Use
Agreement," and the broadcast portion "**[is] not distributed**" at all, for
copyright reasons.

**Fasih is a paid app.** The noncommercial condition rules the corpus out even if
a Data Use Agreement were granted. The same applies to the other Emirati corpora
in the literature — Mixat, Casablanca, ZAEBUC-Spoken, Alsanaa, ADI17 — all
released for research use.

So the practical sourcing path for a commercial product is **books you buy**, not
corpora you download. Citing a book to verify a form is not redistribution and
carries no licence condition. The two purchases that would unblock the backfill
are Leung/Ntelitheos/Al Kaabi (Routledge) and the Al Ramsa Institute set.

*(Aside: ZAEBUC-Spoken would be a poor lexical source regardless — its
transcriptions are CODA-normalised toward MSA, the opposite of what this app
needs. Ramsa deliberately went the other way, transcribing "as produced" rather
than approximating MSA spelling. That is the right instinct for Fasih too.)*

### ⚠ Open question: the 2nd-person feminine suffix

Fasih writes this suffix as **ـج** throughout — عندج, شلونج, صباطج. The one
contemporary Emirati source actually read for this project documents the
substitution as **/k/ → /ʃ/**, spelled **ـش**: عرفتك → عرفتش (Ramsa §4.2.2).

Both realisations are attested across the Gulf. Which one urban Emirati speakers
actually use — and therefore which one this app should teach — cannot be settled
by citation-chasing. **It needs a native speaker.** Until then ـج stays, flagged
in `DIALECT_FEATURES`, and it belongs near the top of the first review pass.

The same source documents four other substitutions that Fasih already teaches, and
these *are* now cited in `DIALECT_FEATURES`:

| Substitution | Example | Status |
|---|---|---|
| /j/ → /y/ | جديد → يديد | cited, matches Fasih |
| /q/ → /g/ | عقب → ugub, قهوة → gahwa | cited, matches Fasih |
| glottal stop dropped | شيء → شي | matches Fasih |
| /ð/ → /ḍ/ | بياضة → بياظة | not currently taught |

---

## 4. Orthography

### Arabic script is bare. No tashkeel.

Two marks are allowed, and only two:

- **shadda (ّ)** — marks gemination, a consonant-length distinction that is real in
  Emirati and does genuine work (`عليّ` *'alayy* "on me" vs `علي` *'ali*, a name)
- **tanwīn fatḥa (ً)** on `شكراً / أهلاً / دايماً / طبعاً` — that is simply how those
  words are spelled by everyone

Everything else — fatḥa, ḍamma, kasra, sukūn — is excluded. The harakat encode MSA's
three-vowel system and **cannot write the Emirati mid vowels** in `شلون` (*shloon*)
or `زين` (*zain*). Vocalising dialect means inventing conventions, which is the
opposite of adopting a standard, and it imports MSA machinery into an app whose
first rule is that it contains none.

Consonantal spelling follows **CODA\*** so `چ` vs `ك` and `گ` vs `ق` stop being
per-file decisions.

### Romanisation is the pronunciation channel

Since the script carries no vowels, **romanisation is authoritative for
pronunciation**. It is on every phrase and every choice, and it can write what the
script cannot: `zain`, `shloon`, `gahwa`.

| Symbol | Arabic | Note |
|---|---|---|
| `'` | ع | ayn |
| `kh` | خ | |
| `gh` | غ | |
| `g` | ق | Khaleeji reflex, never `q` |
| `h` | ح | |
| `sh` | ش | |
| `ch` | ك / چ | Emirati affricate |
| `aa` `ii` `uu` | — | long vowels |

Lowercase except at sentence start and for proper nouns. No IPA.

---

## 5. Stated limits

Reproduced here so it cannot quietly become an assumption that somebody checked:

> **No native speaker of Emirati Arabic has reviewed this content.** Validation is by
> published reference and automated morphological analysis. That catches wrong
> forms. It does not catch unnatural ones — whether an Emirati would actually say
> it this way. The project owner's approval of a phrase is a product decision,
> never a linguistic one.

As of 2026-09-03, **136 of 136 phrases are `unsourced`**. That number is tracked by
the lint and may only fall. It is the honest state of the library, not a target
that has been met.

Closing this gap needs a native reviewer — Al Ramsa Institute, a UAEU linguist, or
a vetted freelancer. Nothing in the current design substitutes for one.
