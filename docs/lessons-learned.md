# Lessons Learned

A running, dated log of real mistakes and discoveries from past sessions on this
repo — the kind of thing that's too specific and too narrative to keep inline in
`CLAUDE.md`, but too useful to lose. `CLAUDE.md` points here; this file is meant
to keep growing.

**How to use this file:**
- Before a large design/token change, a cross-cutting refactor, or anything touching
  files with a history of drift (`tokens.ts`, `gradients.ts`, scenario content),
  skim this file for anything relevant.
- When you hit a real gotcha — something that cost real time, or that a future
  session would otherwise repeat — add a dated entry. Keep entries short: what
  happened, why, and the one-line rule it turns into (the rule itself usually
  belongs in `CLAUDE.md` too; this file is where the *story* behind the rule lives).
- Don't log routine bugs or normal back-and-forth. Log the ones where the root
  cause was surprising, or where the fix generalizes beyond the one file it was
  found in.

---

## 2026-08-03 — Palette rebrand (feat/khaleeji-brand-tokens)

**Context:** Replaced the app's neon-green/cyan token values with a warm gold
("Khaleeji") palette, without renaming any keys in `ThemeColors`.

**Fill vs. text is not the same color, twice.** `ShimmerButton.tsx` hardcoded
`#FFFFFF` for its label text over `G.GOLD_STOPS`. Once GOLD_STOPS became actual
gold (a light color), white-on-light-gold measured 2.53:1 — nowhere near
readable. Found the *identical* bug independently in `PhraseBuilder.tsx`'s
"Continue" button (`color: '#fff'` over `C.ERROR`/`C.JADE2`). Same root cause,
different file, because nothing enforced "a fill token and a label-text token
are different concerns" — a token being *readable as text on the background*
tells you nothing about whether it's *safe as a background behind text*.
Fix used in both places: `color: C.BG` as the label ink, matching a convention
that already existed correctly in `OnboardingScenarioPlayer.tsx` — worth
grepping for that pattern before inventing a new one.

**A token's role isn't what its comment says, it's what greps to.** `tokens.ts`
labeled the `JADE_ACCENT*` cluster "Primary green (main accent)" — but
`JADE_ACCENT2`/`JADE_ACCENT3` turned out, on actually grepping usage, to be
used in exactly one place each: as `phrases.ts` category-badge *backgrounds*
(paired with `TEXT_ON_LIGHT`), never as foreground text anywhere. Meanwhile
`JADE2` (no relation by role, just adjacent naming) *is* used as literal
correctness-feedback text in `PhraseBuilder.tsx`. Assigning all of these the
same "make it a text-safe dark gold" treatment for light mode would have
shipped badly-contrasted category badges, because a light-mode text-safe gold
is necessarily dark, and a category-badge wash needs to stay light. Two tokens
that look like siblings by name can need opposite treatment by actual usage.

**Ad-hoc gradients hide cross-token assumptions.** Real components combine
tokens as literal `colors={[C.PRIMARY, C.JADE]}` gradient stops in at least 7
places (`DailyPhrase`, `MissionCard` ×2, `StreakWidget`, `WeeklyXP`, and 3× in
`OnboardingScenarioPlayer`) — none of that is visible from `gradients.ts`
alone. This is why the whole `JADE_ACCENT*/JADE*/PRIMARY*/TERTIARY` cluster had
to become **one** hue family (light-to-deep gold) rather than splitting into
separate gold/teal families as an earlier design draft proposed — splitting
would have made every one of those gradients render as a muddy two-hue blend.
Rule: before recoloring a cluster of tokens, grep for `colors={[C\.` across the
whole repo, not just the declared gradients in `gradients.ts`.

**A branch can compile only because of someone else's uncommitted file.**
`OnboardingFlow.tsx` (committed, pushed, PR already open) imported
`ARABIC_SCALE` from `tokens.ts` — an export that existed only in a *different*,
unrelated, uncommitted change sitting in the working tree at the time. `tsc`
passed locally because that uncommitted file happened to be present. Running
`git stash` (stashing everything) then `tsc --noEmit` on the literal committed
state caught it immediately: `Module has no exported member 'ARABIC_SCALE'`.
This is now a required check before calling a branch done (see `CLAUDE.md` →
Git Discipline) — anyone else pulling that branch fresh would have hit a
compile error with no idea why, since their checkout would have looked
identical to what was reviewed in the PR diff.

**First-draft palettes fail their own audit.** The initial replacement gold
values (before the ones above) were chosen by eye against the *concept*
("warm, premium, gold") and failed 4 contrast checks when actually measured —
including one in a light-theme category badge that would have made the badge
background and its own text nearly the same color. The fix wasn't "pick better
colors from experience," it was "run the identical verification script against
the proposal that was run against the original, before shipping either." A
palette isn't verified by having a rationale; it's verified by the same
numbers the audit used.

**Stray shell-quoting junk files.** Several `node -e "..."` invocations with
backticks or braces inside double-quoted strings leaked literal filenames like
`4.5`, `{`, or `` check(`ink `` into the repo as empty untracked files (shell
misinterpreting part of the command as a redirect target). Always check
`git status` after ad-hoc inline scripts for stray zero-byte files before
staging anything, and prefer writing a real script file over long inline
`node -e` one-liners with special characters.
