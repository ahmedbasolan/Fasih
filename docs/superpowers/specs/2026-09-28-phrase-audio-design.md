# Phrase audio — design

**Branch:** 10, `feat/phrase-audio`
**Date:** 2026-09-28
**Spec row:** "Bundled recorded clips keyed by phrase id + gender; TTS removed" — dependency: recordings
**Source:** [`2026-09-14-butterfly-engine-mvp-design.md`](2026-09-14-butterfly-engine-mvp-design.md) §2.10

---

## 1. Why

Device TTS is a standing violation of language-authority rule 1 (no MSA, anywhere).
`ar-AE` is a locale tag, not a dialect model: device Arabic voices are MSA-trained
whatever region tag they carry. The synthesiser says *qahwa* while the card teaches
*gahwa*, mangles شلونك because the word is not MSA at all, and cannot produce چ.

This was confirmed by ear on 2026-09-28 — "audio seems to be more MSA and formal, it
does not speak the same as text." That is a **product** observation, recorded as such.
Per authority rule 5 it is not linguistic verification of anything, and nothing in this
document treats it as such. It is quoted because it establishes the violation is
**user-visible**, not merely theoretical: the mismatch between heard audio and written
romanisation is audible without knowing any Arabic.

Audio that contradicts the card is worse than no audio. Romanisation is already the
authoritative pronunciation channel (`docs/language/authority.md`).

## 2. Decisions

Settled in brainstorming on 2026-09-28. Each was a real fork; recording them so the
implementation does not relitigate.

### 2.1 No interim audio

TTS is removed **now**, before recordings exist. Speaker buttons render only where a
clip exists, so on the day this branch lands every one of them disappears.

Rejected: keeping TTS as a fallback until clips land. It would mean knowingly shipping
the rule-1 violation for an unbounded period, and a "temporary" fallback with no
deadline attached to it tends to outlive the branch that introduced it.

The app is quieter until voices are hired. That is the intended state, not a regression.

### 2.2 Clips are keyed by phrase id + **voice** gender

The spec row's "gender" was doing two jobs. They are now separated:

- **Voice gender** — who is speaking. A learner hears the voice matching their profile
  gender. **This is what is built.**
- **Form gender** — شلونك vs شلونج. **Not** built here.

`Phrase` has no feminine-variant field; `arabicFeminine` exists only on scenario
dialogue. Only 11 phrases mark an addressee gender at all, and 9 carry the alternate
form as English prose inside `pronTip` rather than as data.

So: one Arabic string per phrase, recorded twice — once per voice. A female learner
hears a female voice saying the library's Arabic; the feminine *form* stays in prose
where it is today.

Rejected: promoting the 9 alternate forms into an `arabicFeminine` field on `Phrase`.
Pedagogically better and worth doing later, but it is a data migration plus a larger
recording brief, and it is not what this branch is for. Noted as follow-up (§8).

### 2.3 The recording brief is generated, not hand-written

The clip list is derived from `phrases.ts` and `scenarios.ts` by a script, so it cannot
drift from the library. This repo has already been bitten twice by hand-kept lists
going stale (the `MAX_UNSOURCED` ratchet, the six duplicated sync field lists).

The same script emits the app's manifest, so brief and manifest cannot disagree either.

### 2.4 `expo-speech` out, `expo-audio` in

Approved 2026-09-28. First-party Expo, and the package that plays bundled clips.
Net dependency count unchanged. No other library is added.

## 3. Scope: which phrases get clips

§2.10 says "unlocked phrases only". Measured against the current library:

| | count |
|---|---|
| phrases in library | 106 |
| taught by at least one scenario | **62** |
| taught by nothing | 44 |
| clips to record (62 × 2 voices) | **124** |

The spec estimated "~90 phrases, ~180 clips". The real figure is **62 / 124** — about
a third less recording to pay for. The estimate predates the MVP scenario cuts.

**This branch records the 62.**

### 3.1 Finding: 44 phrases are unlockable by nothing

Completing a scenario is the **only** unlock path — `unlockPhrases()` has exactly one
caller, `ScenarioPlayer.tsx:428`. Any phrase no scenario's `phrases` map names can
never be unlocked by any player.

`PhraseLibrary` nonetheless renders play controls for all 106. Under this design those
44 lose their button permanently, because no clip will exist for them.

That is the correct behaviour for this branch — it is not a bug introduced here, it
surfaces one that already exists. But it is a **content** question, not an audio one:
either those 44 are dead weight that should be cut, or scenarios should teach them, or
the recording set should be all 106 (212 clips, ~70% more spend).

Tracked separately. **Not decided here, and this branch does not act on it.**

## 4. Architecture

Four pieces. The engine rule holds: lookup is a pure function, no React, no side effects.

### 4.1 `scripts/generate-audio-manifest.mjs`

Single source of truth. Reads `phrases.ts` + `scenarios.ts`, computes the taught set
(union of every id in every scenario's `phrases` map, intersected with real phrase ids —
ending keys live in the same block and must be excluded), and emits:

1. `src/constants/audioManifest.ts` — what the app imports
2. `docs/language/recording-brief.md` — what the voice actor is sent

Run via an npm script. Deterministic: same library in, same bytes out, so a
regeneration that changes nothing produces no diff.

### 4.2 `src/constants/audioManifest.ts` (generated, checked in)

React Native cannot `require()` a computed path, so entries must be literal:

```ts
export const AUDIO_MANIFEST: AudioManifest = {
  'core-5': { male: require('../../assets/audio/core-5.male.m4a'), … },
};
```

With no recordings present it generates **empty**. That is what makes §2.1 work without
a feature flag: no clip, no button, by construction rather than by branch.

A clip is listed only when its file is actually present, so the manifest never points at
a missing asset — a `require()` of a nonexistent file is a bundler error, not a runtime
null.

### 4.3 `src/engine/phraseAudio.ts` (pure)

```ts
clipFor(phraseId: string, voice: VoiceGender, manifest: AudioManifest): AudioClip | null
```

Fully testable against a fixture manifest, so the playback path is under test before a
single real clip exists — which matters, because real clips are weeks away.

Fallback rule: if the learner's voice gender has no clip but the other does, return the
other rather than nothing. Half-recorded is a real intermediate state during a rollout,
and silence would be a worse answer than the other voice.

### 4.4 `src/hooks/usePhraseAudio.ts`

Replaces `useArabicTTS`, same call-site ergonomics so the seven consumers change
minimally:

```ts
{ play, playSlow, isPlaying, hasClip }
```

- `hasClip` — what every speaker button renders on.
- `playSlow` — the same clip at 0.7× rate. Costs no extra recordings, and keeps the
  existing "play slowly" affordance in `PhraseLibrary` and `PracticeScreen` working.

## 5. Removals

- `src/hooks/useArabicTTS.ts` — deleted
- `expo-speech` — removed from `package.json`
- **dialogue audio in `ScenarioPlayer.tsx`** (`speakAs`, line ~156) — deleted, not
  ported. §2.10: "Dialogue has no audio; romanisation carries pronunciation." This is
  the one consumer that is a deletion rather than a swap.

Seven call sites total: `ScenarioIntroPhase`, `HomeScreenNew`, `QuickWinSteps`,
`PhraseLibrary`, `PracticeScreen`, `ScenarioPlayer` (×2), `SentenceBuilder`.

## 6. Testing

TDD, per the project workflow.

- **`phraseAudio.test.ts`** — lookup, both voices, the cross-gender fallback, unknown
  id, empty manifest.
- **`audioManifest.test.ts`** — a **sync ratchet** in the established house style: the
  generated manifest and brief must match what the library implies. Adding a phrase to a
  scenario without regenerating fails CI instead of silently shipping a phrase that can
  never make a sound.
- No test asserts a real clip exists. The manifest is legitimately empty today, and a
  test that fails until voice talent is hired is a broken build, not a useful signal.

## 7. What this delivers today

1. The rule-1 violation is gone.
2. `docs/language/recording-brief.md` — a concrete artifact to send a voice actor for a
   quote. 124 clips, each with Arabic, romanisation, filename and context note, plus
   session instructions for the two voices. **This is what actually unblocks branch 10**;
   the code was never the blocker.
3. A manifest that lights buttons up as clips land, with no code change when they do.

## 8. Follow-ups (not this branch)

- The 44 never-taught phrases (§3.1) — content decision.
- Form-gender variants: promote the 9 `pronTip` alternates into `arabicFeminine` on
  `Phrase` and record them (§2.2).
- Hire the two Emirati voices. Non-code, and the real dependency.
