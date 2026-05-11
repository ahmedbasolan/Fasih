# Fasih UI Redesign — Design Spec
*Date: 2026-05-11 · Status: Approved by user*

---

## 1. Overview

A visual and motion upgrade across all screens of the Fasih Gulf Arabic learning app. **Content is never changed** — only the visual treatment. The design language is built on three pillars:

1. **Ghost Arabic Letterforms** — oversized Arabic glyphs as ambient background art
2. **Souk Cards** — translucent dark panels with a top shimmer accent line
3. **Smooth Micro-Animations** — fluid ease-in/out motion, no bounce or overshoot

The goal: modern, culturally grounded, clean. Not generic. Not overloaded.

---

## 2. Visual Language

### 2.1 Color (unchanged — existing tokens apply)
- Background: `#08100A` (dark green-black)
- Primary accent: `#00FF95` (neon green)
- Secondary accent: `#00D6FC` (cyan)
- Cultural gold: `#FFB800` (Arabic greeting text)
- Text primary: `rgba(255,255,255,0.92)`
- Text muted: `rgba(255,255,255,0.38)`

### 2.2 Typography (unchanged — existing fonts apply)
- Latin headings/body: Plus Jakarta Sans
- Arabic: Tajawal (Bold, ExtraBold, Black weights)

---

## 3. Ghost Arabic Letterform System

The single most distinctive visual element. Oversized Arabic glyphs sit behind all content at extremely low opacity, rotated slightly, acting as ambient texture — never competing with content.

### Rules
| Property | Value |
|---|---|
| Opacity | `0.025–0.032` (dark theme) |
| Font weight | 900 (Black) |
| Size | 150px–320px depending on position |
| Rotation | ±4°–12° (organic, not mechanical) |
| Color | `rgba(0,255,149,…)` for primary glyph, `rgba(0,214,252,…)` for secondary |
| Z-index | Below all content (`z-index: 0`) |
| Pointer events | None |

### Per-screen glyphs
| Screen | Glyphs used |
|---|---|
| Home | م، ح، ب (from مرحبا) |
| Scenarios | ع، ل، م (from علم — knowledge) |
| Phrases Library | ق، و، ل (from قول — speech) |
| Profile | أ، ن، ا (from أنا — I/me) |
| Scenario Player | ك، ل، م (from كلام — speech/talk) |
| Practice | ف، ك، ر (from فكر — think) |
| Sign In / Sign Up | م، ر، ح (from مرحبا) |
| Onboarding | ب، د، أ (from بدأ — begin) |

### Positioning pattern (per screen, 3 glyphs)
- **Glyph 1** (largest, primary color): top-right, partially off-screen, rotate -6°
- **Glyph 2** (medium, secondary color): mid-left, partially off-screen, rotate +5°
- **Glyph 3** (smallest, primary color): bottom-right, partially off-screen, rotate -10°

---

## 4. Souk Card System

Replaces all existing card surfaces across every screen.

### Card anatomy
```
┌─────────────────────────────────────────┐  ← border: 1px rgba(255,255,255,0.08)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← top shimmer: 1px green gradient line
▌                                         │  ← left accent: 2px green gradient (content cards only)
│         card content                    │
└─────────────────────────────────────────┘
```

### Tokens
| Property | Value |
|---|---|
| Border radius | `16px` (standard), `18px` (hero/featured) |
| Background | `rgba(255,255,255,0.04)` |
| Border | `1px solid rgba(255,255,255,0.08)` |
| Top shimmer | `1px linear-gradient(90deg, transparent, rgba(0,255,149,0.38), transparent)` — spans 12%→88% of card width |
| Left accent | `2px` wide, `linear-gradient(180deg, #00FF95, rgba(0,255,149,0.15))`, inset 14px top/bottom — **only on cards with interactive content** |
| Box shadow | None (cards are flat — depth comes from ghost letters behind, not shadows in front) |

### Variant: Hero/Featured card
Same base, plus:
- Background: `linear-gradient(145deg, #001F14, #002E1C, #001F14)` — richer dark green
- Border: `1px solid rgba(0,255,149,0.12)`
- Top shimmer opacity: `0.4` (slightly more visible)
- Shows Arabic translation of the scenario title inside the card

### Variant: Stat/Info card (no left accent)
Used for stats rows, community bar, empty states — no left accent, otherwise identical.

---

## 5. Header System

### Home screen header
```
[ Hello,          ]    [              مرحبا ]
[ Ahmed           ]
```
- Left: "Hello," in `fontSize: 12, color: rgba(255,255,255,0.35)` + name in `fontSize: 26, fontWeight: 800, color: rgba(255,255,255,0.92)`
- Right: Arabic greeting in `fontSize: 40, fontWeight: 900, color: #FFB800` — changes by time of day (existing logic kept)
- Settings/gear icon removed from Home header (user-requested)
- Both sides align to bottom baseline

### Other screen headers
- Keep existing screen-specific headers exactly as-is
- Apply ghost letterforms behind them
- Do not touch settings icons on other screens

---

## 6. Animation System

**Chosen direction: Smooth** — `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard ease)

### 6.1 Card entrance (scroll into view / screen mount)
```
from: { opacity: 0, translateY: 16 }
to:   { opacity: 1, translateY: 0 }
duration: 380ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
stagger: 70ms between cards
```
Implemented via existing `MotiView` — update `transition` props only.

### 6.2 Press / tap feedback
```
active scale: 0.96
duration: 220ms in, 220ms out
easing: cubic-bezier(0.4, 0, 0.2, 1)
```
No bounce. Card compresses cleanly and returns.

### 6.3 Button press
```
active scale: 0.94
active background: +8% opacity bump on existing bg
duration: 180ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 6.4 Progress / XP bar fill
```
from: width 0%
to: width <actual value>%
duration: 700ms
delay: 250ms (after card entrance completes)
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 6.5 Tab switch transition
Existing slide direction context is already wired. Update to:
```
from: { opacity: 0, translateX: ±20 }
to:   { opacity: 1, translateX: 0 }
duration: 300ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 6.6 Weekly day bar chart (This Week card)
Bars grow upward individually with stagger:
```
from: height 0%
to: height <actual>%
duration: 400ms per bar
stagger: 50ms per bar
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 6.7 Reduced motion
All animations already respect `useReducedMotion` — keep existing hook, set all durations to `0` when active.

---

## 7. Screen-by-Screen Application

### Home (`src/screens/HomeScreen.tsx`)
- Ghost letterforms: م، ح، ب
- Header: English left / Arabic right / no settings
- All cards → Souk card style
- XP bar: animated fill on mount
- Week-day dots: glow effect when active (existing logic, new style)
- Week bar chart: staggered bar grow animation
- Card entrances: staggered smooth fade-up

### Scenarios (`src/screens/ScenariosScreen.tsx`)
- Ghost letterforms: ع، ل، م
- Bento grid cards → Souk card base with category color overlaid at 15% opacity
- Filter tabs: smooth underline slide (existing tabs, new transition)
- Card press: scale 0.96 feedback

### Phrases Library (`src/screens/PhraseLibrary.tsx`)
- Ghost letterforms: ق، و، ل
- Category cards → Souk card variant
- Phrase rows → left-accent card style
- Arabic text in phrase rows: existing green color kept

### Profile (`src/screens/ProfileScreen.tsx`)
- Ghost letterforms: أ، ن، ا
- Avatar gradient: existing `AVATAR_STOPS` — no change
- Stat cards → Souk stat variant (no left accent)
- Milestone/journal rows → left-accent card style
- Theme toggle, sign-out rows → Souk card base

### Scenario Player (`src/screens/ScenarioPlayer.tsx`)
- Ghost letterforms: ك، ل، م
- Scene cards → Souk hero variant (richer dark green bg)
- Arabic scene text: large, existing green color
- Progress bar at top: smooth animated fill

### Practice (`src/screens/PracticeScreen.tsx`)
- Ghost letterforms: ف، ك، ر
- Answer option cards → Souk card base
- Correct/incorrect feedback: existing color logic, add smooth scale pulse

### Auth screens (Sign In, Sign Up, Forgot Password)
- Ghost letterforms: م، ر، ح
- Input fields (`InputField.tsx`) → Souk card base, focused state adds green border glow
- Primary buttons: existing gradient, add smooth press scale

### Onboarding (`src/screens/OnboardingFlow.tsx`)
- Ghost letterforms: ب، د، أ
- Step cards → Souk card base
- Role/goal selection cards → Souk card with active state (green border + dim bg)
- Entrance: staggered smooth fade-up per step

---

## 8. Tab Bar

Keep existing tab bar. Refinements only:
- Active icon background: existing `GOLD_DIM` — keep
- Tab bar background: keep `#0C0A1C` (dark, already fine)
- Add smooth opacity transition on tab icon when switching: `200ms ease`

---

## 9. What Does NOT Change

- All screen content, copy, and data
- Navigation structure and routing
- Business logic, store, Supabase integration
- Font families and sizes
- Color palette values
- Component APIs and props
- Arabic TTS behavior
- Reduced-motion support logic

---

## 10. Files to Touch

| File | Change |
|---|---|
| `src/screens/HomeScreen.tsx` | Header layout, ghost letters, card styles, animation transitions |
| `src/screens/ScenariosScreen.tsx` | Ghost letters, card styles, filter tab transitions |
| `src/screens/PhraseLibrary.tsx` | Ghost letters, card styles |
| `src/screens/ProfileScreen.tsx` | Ghost letters, card styles |
| `src/screens/ScenarioPlayer.tsx` | Ghost letters, hero card styles |
| `src/screens/PracticeScreen.tsx` | Ghost letters, card styles |
| `src/screens/OnboardingFlow.tsx` | Ghost letters, card styles, selection states |
| `app/sign-in.tsx` | Ghost letters, input/button styles |
| `app/sign-up.tsx` | Ghost letters, input/button styles |
| `app/forgot-password.tsx` | Ghost letters, input/button styles |
| `app/(tabs)/_layout.tsx` | Tab icon transition timing |
| `src/components/ui/PrimaryButton.tsx` | Press scale animation |
| `src/components/ui/GhostButton.tsx` | Press scale animation |
| `src/components/ui/InputField.tsx` | Focus glow state |
| `src/components/design/tokens.ts` | Add animation constants |
| New: `src/components/ui/GhostLetters.tsx` | Reusable ghost letterform background component |
| New: `src/components/ui/SoukCard.tsx` | Reusable Souk card wrapper |
