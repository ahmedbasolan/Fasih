# Career vs Social Mode UX — Design Spec

**Date:** 2026-05-03
**Branch:** feat/supabase-progress-sync
**Scope:** `ScenariosScreen` only

---

## Problem

`UserProfile.mode` ('career' | 'social') exists in the Zustand store but has no effect on the UI. Social scenarios (`social_taxi_ride`, `social_elevator`) have full scripts but no catalog entries and are therefore invisible to users. Career and social modes feel identical.

## Goal

- Career users see only career scenarios; social users see only social scenarios.
- Career cards feel educational (impact metrics, cool palette, numeric bars).
- Social cards feel casual and fun (same metrics renamed + styled with warm colors, emoji, pill bars, no numbers).
- `social_taxi_ride` and `social_elevator` surface in social mode.

---

## Data Layer

### `src/types/index.ts`

Add optional field to `Scenario`:

```ts
impactPreview?: { trust: number; respect: number; culture: number };
```

Values are 0–100 and are authored per scenario to represent what the scenario primarily tests (not the user's runtime score). This field is optional — cards without it simply omit the strip.

### `src/constants/scenarios.ts`

1. Add two new catalog entries:
   - `social_taxi_ride` — `mode: 'social'`, `locked: false`, full metadata, `impactPreview`
   - `social_elevator` — `mode: 'social'`, `locked: false`, full metadata, `impactPreview`

2. Add `impactPreview` to all existing catalog scenarios (career and social). Representative values — authored to signal what the scenario emphasises, not computed from script scores.

---

## Filtering Logic

**`src/screens/ScenariosScreen.tsx`**

Read `mode` from the Zustand user profile store. Filter the scenarios array before rendering:

```ts
const visibleScenarios = scenarios.filter(s => s.mode === mode);
```

Career users see career scenarios. Social users see social scenarios. No "show all with highlights" fallback — the filter is strict.

---

## Impact Preview Strip

A new inline component `ImpactPreviewStrip` (~30 lines) lives inside `ScenariosScreen.tsx`. It has no other consumer so it does not get its own file.

**Props:**
```ts
{ impactPreview: { trust: number; respect: number; culture: number }; mode: 'career' | 'social' }
```

### Career style
- Thin rectangular bars (height 4px, borderRadius 2px)
- Cool-tone fills: Trust = `#4A90D9`, Respect = `#5BA85A`, Culture = `#C07AB8`
- Labels: `Trust` / `Respect` / `Culture` (text, small, left-aligned)
- Numeric percentage shown to the right of each bar
- No emoji

### Social style
- Pill bars (height 6px, borderRadius 3px)
- Warm fills: Vibe = `#FF7043` (orange), Rapport = `#EC407A` (coral), Culture = `#7E57C2` (purple)
- Labels: `🔥 Vibe` / `🤝 Rapport` / `🌙 Culture`
- No numeric percentage — fill only

Both styles render three rows stacked vertically, placed at the bottom of the scenario card above the bottom padding.

---

## Files Changed

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `impactPreview?` to `Scenario` |
| `src/constants/scenarios.ts` | Add taxi + elevator catalog entries; add `impactPreview` to all scenarios |
| `src/screens/ScenariosScreen.tsx` | Mode filter + `ImpactPreviewStrip` component + render in card |

No new files created.

---

## Out of Scope

- Home screen, profile screen, end screen — unchanged.
- Switching between modes (already handled by profile screen toggle — no change needed).
- Scenario player UI — impact bars inside the player are unchanged.
- Ghost scenarios (office-meeting, ramadan-shift, etc.) — unchanged, still show `comingSoon` badge when their mode matches.
