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

1. **Ramsa corpus (2026)** — attested contemporary speech, CC BY 4.0, and the only
   free source in this tier. Start here.
2. **Al Ramsa Institute materials** — current, taught to expats in Dubai now
3. **Leung, Ntelitheos & Al Kaabi (2024)**
4. **Emirati social-media corpora** — contemporary written Emirati

The lint enforces this: a non-`morphosyntax` claim requires a source published
2020 or later. `SOURCES` in `curriculum.ts` is the authoritative table.

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

**Every phrase in the library is `unsourced`.** The count is `MAX_UNSOURCED` in
[`languageContent.test.ts`](../../src/engine/__tests__/languageContent.test.ts),
which asserts it matches the library and may only fall — so it is not restated
here. It is the honest state of the library, not a target that has been met.

Closing this gap needs a native reviewer — Al Ramsa Institute, a UAEU linguist, or
a vetted freelancer. Nothing in the current design substitutes for one.
