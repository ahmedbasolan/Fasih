# Language Authority

The rules governing every word of Arabic in Fasih. This is the operating manual;
the reasoning behind it is in
[`docs/superpowers/specs/2026-09-03-language-authority-design.md`](../superpowers/specs/2026-09-03-language-authority-design.md).

Anything a machine can check lives in [`src/constants/curriculum.ts`](../../src/constants/curriculum.ts)
and is enforced by [`languageContent.test.ts`](../../src/engine/__tests__/languageContent.test.ts).
**Do not restate a threshold here.** One home per rule — two documents disagreeing
about tashkeel is the specific failure this whole system exists to prevent.

---

## 0. The project owner does not read or speak Arabic — at all

Not "isn't fluent in the dialect." **Ahmed cannot read Arabic script, cannot judge a
romanisation, and cannot tell whether a translation is plausible.** This is not the
usual "no native speaker has reviewed this" caveat — there is currently **no human
anywhere in the loop** who can catch a wrong Arabic string by looking at it. Every
claim of correctness in this codebase rests entirely on citable sources and automated
analysis, with nothing behind that as a backstop.

Two consequences that are not optional:

1. **Never invent a citation.** A page number, section number, or corpus id that
   sounds right but wasn't checked is worse than `UNSOURCED`, because it looks
   verified to a reader who has no way to catch the fabrication either.
2. **Never present Ahmed's approval, or the absence of a bug report, as linguistic
   validation.** He approving a feature is a product decision. It says nothing about
   whether the Arabic in it is correct, and no amount of his sign-off changes that.

A real mistake already happened under this exact condition: an earlier version of
this file cited the Ramsa speech corpus as freely usable (§3, below) when its data is
in fact restricted to noncommercial research. Nobody in this project — human or
otherwise — was positioned to catch that by inspection. Only re-reading the primary
source did. That is the standing risk this section exists to name.

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

1. **Ramsa *paper*** (arXiv:2603.08125, 2026) — CC BY 4.0. Cite its printed example
   utterances and its documented phonological substitutions. **Not the corpus** —
   see the warning below. **Actually read, cover to cover, 2026-09-03.**
2. **Szreder & Derrick (2024)**, JIPA 54(1) — peer-reviewed, open bibliographic
   record read (not the paywalled full text). Phonology only (see below).
3. **Leung, Ntelitheos & Al Kaabi (2024)** — purchasable, Emirati-specific.
   **NOT YET READ** — no preview accessible. Every existing citation to it is
   flagged unverified in `curriculum.ts`.
4. **Al Ramsa Institute materials** — purchasable, taught to expats in Dubai now.
   **NOT YET READ.** The one specific work independently identified (Al Fardan
   2016, *Spoken Emirati*) predates the 2020 cutoff below and is unread besides.

The lint enforces this: a non-`morphosyntax` claim requires a source published
2020 or later. `SOURCES` in `curriculum.ts` is the authoritative table — and as of
2026-09-03, **two entries in it have actually been read**
(`ramsa-paper-2026`, `ntelitheos-idrissi-2017`; the latter is `morphosyntax`-only)
and one has been read at abstract depth (`szreder-derrick-2024`). Every other
entry — `leung-2024`, `routledge-comprehensive`, `alramsa`, `qafisheh-1977`,
`holes-1990` — is a description of a real, purchasable book, **not a verified
citation**. Each says so in its own `note`. Treat any DIALECT_FEATURES entry or
`Phrase.source` pointing at one of the unread entries as **not actually checked**,
regardless of how confidently it reads — see §0.

### What was verified, and how (2026-09-03 research pass)

Two open-access academic sources were located, downloaded, and read directly —
not summarised secondhand:

- **Ntelitheos & Idrissi (2017)**, "Language Growth in Child Emirati Arabic," in
  *Perspectives on Arabic Linguistics XXIX* [Studies in Arabic Linguistics 5],
  John Benjamins, pp. 229–248. Freely hosted by the author:
  `faculty.uaeu.ac.ae/dimitrios_n/lang_growth.pdf`. A child-language-acquisition
  study, not a phrasebook — restricted here to `morphosyntax` because most of its
  Arabic content is documented as **children's error forms**, not attested adult
  usage. It does state two clean adult targets directly: بيت *bait/bayt* "house"
  (its worked example transcribes البيت as `DET#bajt`) and the pair أبيض *abyad* /
  بيضة *beeda* "white" (masc/fem), with `bayda` → `beeda` monophthongisation
  documented as a real, non-error Emirati process.
- **Szreder & Derrick (2024)**, "Phonological conditioning of affricate
  variability in Emirati Arabic," *Journal of the International Phonetic
  Association* 54(1), 146–164. Paywalled in full; read at the abstract/
  repository-record level. Establishes that **/k/ → [tʃ] ("ch") affrication is "a
  completed phonemic change" in Emirati Arabic**, elicited from 20 native
  speakers — see the open question below for why this matters.

Also checked and found **not usable**, so the next pass doesn't repeat the work:
a publisher preview PDF for *Basic Emirati Arabic* (403 Forbidden), Google Books
previews for both Leung/Ntelitheos/Al Kaabi titles (no accessible preview text),
the co-author's own UAEU faculty page (describes the books, contains no excerpt),
and Al Ramsa's website (403 Forbidden to automated fetch).

Wikipedia's *Emirati Arabic* article was read and is a genuinely useful **index**
to primary sources (it names, with page numbers in one case, exactly which claims
come from which book) — but it is not itself a citable source in this project's
sense, and nothing here treats it as one. Where it pointed at a specific claim in
Leung/Ntelitheos/Al Kaabi that has NOT been independently read, that fact is
recorded as a lead for a future pass, not written into `curriculum.ts` as if
verified.

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

Fasih writes this suffix as **ـج** throughout — عندج, شلونج, صباطج — and its OWN
romanisation calls it **"-ich"**, an affricate ("ch" as in "chair"), e.g.
`عندج` → `'indich` in `scenarios.ts`. Two things are now known about it that
weren't when this question was first raised:

1. The Ramsa paper documents a **different word** undergoing **/k/ → /ʃ/** (plain
   "sh", not an affricate): عرفتك → عرفتش (§4.2.2).
2. Szreder & Derrick (2024, peer-reviewed, actually read) independently establish
   that **/k/ → [tʃ] ("ch") is "a completed phonemic change"** in Emirati Arabic
   generally, in speech following a front vowel — which is exactly the phonetic
   environment of this suffix (`i` + `k`).

Read together, these are **not a contradiction** — they describe two different
processes ([tʃ] from general k-affrication vs. [ʃ] in the Ramsa example, which
may be a different word, a different speaker, or genuine free variation) and
neither confirms nor denies this specific morpheme. What they do give: Fasih's
own **"-ich" choice is phonologically well-motivated** by a real peer-reviewed
finding, not an arbitrary pick — that's new, useful information this project
didn't have before. What remains unconfirmed: whether contemporary urban Emirati
speakers realise **this exact suffix** as -ich, as -ish, or as both depending on
speaker/context. **That still needs a native speaker**, and it belongs near the
top of the first review pass — but it is now a narrower, better-informed question
than "which spelling is right," which was where this stood before.

The same source documents four other substitutions that Fasih already teaches, and
these *are* now cited in `DIALECT_FEATURES`:

| Substitution | Example | Status |
|---|---|---|
| /j/ → /y/ | جديد → يديد | cited, matches Fasih |
| /q/ → /g/ | عقب → ugub, قهوة → gahwa | cited, matches Fasih |
| glottal stop dropped | شيء → شي | matches Fasih |
| /ð/ → /ḍ/ | بياضة → بياظة | not currently taught |

### A second source tier: Wiktionary (2026-09-03, following a real budget constraint)

The purchases named above are money Ahmed does not have. Buying the reference books
is **not** the plan; it never should have been presented as *the* unblock. What
follows is what free sourcing actually looks like once real book purchases are off
the table.

Every corpus in this space — Mixat, Casablanca — turned out to be commercially
restricted on inspection, the same as Ramsa (checked directly: Mixat's own repo
states CC BY-NC-SA 4.0 on the data; Casablanca states "exclusively for research
purposes" and is sourced from copyrighted YouTube video it doesn't even redistribute
itself). Their *papers* were checked too, the way Ramsa's worked — but neither
renders Arabic script through any extraction method available here (likely
image-embedded tables), so that route produced nothing.

**English Wiktionary carries 682 Gulf Arabic lemmas**, and is genuinely free,
genuinely checkable by anyone at the same URL, and was actually read entry-by-entry
rather than assumed. It is a **different, lower tier** from the peer-reviewed and
CC-BY-paper sources above — community-maintained, not academically reviewed — and
three conditions gate every citation to it (spelled out in its `SOURCES` note):
the entry must carry an explicit **Gulf Arabic** language header (plain "Arabic" is
MSA; other dialect headers showed up as false leads while checking this); its
"Gulf Arabic" is **pan-Gulf**, not Emirati-specific (`origin: 'gulf-koine'`, not
`'emirati'`, unless something else confirms the narrower claim); and an **absent**
entry is never evidence a word is wrong — coverage is real but patchy.

Checked and confirmed (now cited in `curriculum.ts`): **وايد** *wāyid* "very"
(sources `e6` and `intensifier-waayid`), **شلون** *šlōn* "how" (sources `g3` and
`how-shloon`), **هني** *hni* "here" (sources `here-hini`, though its example was
tagged Kuwait specifically, not UAE).

Checked and **not found** — recorded so the next pass doesn't repeat the search:
**أبي** (only unrelated MSA senses on Wiktionary — "my father," a passive verb
form — nothing matching "I want"), **أبغى** (only a Hijazi Arabic section),
**مشكور** (MSA only), **شو** (Levantine and Tunisian sections exist; no Gulf one).
None of this means these Fasih forms are wrong — it means Wiktionary's coverage
didn't reach them. They remain on the unverified `alramsa` placeholder, tracked
honestly in `KNOWN_UNVERIFIED_CITATIONS`, not silently dropped or falsely cleared.

**A genuinely new finding, not just a citation upgrade:** the Gulf Arabic entry for
شلون spells its feminine form **شلونچ** — with **چ**, the dedicated Gulf letter for
the affricate [tʃ] ("ch"), not plain **ج** (jiim) and not **ش** (shin). That is the
same 2nd-person-feminine suffix this project already had an open question about
(§ above). Combined with Fasih's own "-ich" romanisation and Szreder & Derrick's
peer-reviewed finding that /k/→[tʃ] is a completed sound change, three independent
signals now point the same way. **This is a real, actionable finding — Fasih's
Arabic script may be using the wrong letter (ج) for a sound it already romanises
correctly — but it rests on one dictionary entry for one word pair, and nobody has
checked whether چ renders correctly across the app's fonts.** It has not been
mass-applied. It needs a native speaker's confirmation, or a second real source,
before ~10 files' worth of ج get changed to چ.

### Leads for the next research pass (found, not yet verified)

Located via Wikipedia's *Emirati Arabic* article, each with a specific primary-
source pointer, but **none independently read** — do not cite these into
`curriculum.ts` without reading the actual page:

- **مب negation has regional variants**: مب (Northern Emirates), مش (Abu Dhabi),
  ما (East Coast). Pointer: Leung/Ntelitheos/Al Kaabi *Comprehensive Grammar*, and
  Al Fardan (2016) *Spoken Emirati*, pp. 8–10. If true, Fasih's `neg-mub` dialect
  feature — which treats مب as one undifferentiated Gulf form — is oversimplified
  for a product that specifically targets Dubai *and* Abu Dhabi as one variety.
  Worth resolving before adding more negation content.
- **fish, chicken**: attested Emirati forms سمچ *simach* (MSA سمك), دياي *diyaay*
  (MSA دجاج) — general vocabulary, not currently in Fasih's phrase list.
- **Loanwords**: دريشة *dariisha* "window" (Persian), خاشوگة *khaashuuga* "spoon"
  (Turkish) — not currently in Fasih's phrase list, but useful colour for future
  content and evidence of the pan-Gulf substrate pattern §2 describes.

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
a vetted freelancer. Nothing in the current design substitutes for one. What we ask
of a reviewer, and how a review is recorded (`NativeReview`), is in
[`reviewer-brief.md`](./reviewer-brief.md).
