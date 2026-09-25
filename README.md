# Fasih

A Gulf Arabic learning app for non-native professionals living in the UAE. Teaches Khaleeji Arabic through interactive role-play scenarios with NPC characters, spaced-repetition phrasal practice, and a cultural journal.

## Features

- **Role-play scenarios** — Butterfli-effect dialogues with NPC characters (butterfly-effect dialogues, tokenized responses)
- **Spaced-repetition** — Flashcard drills with SRS algorithm for phrase retention
- **Phrase library** — Categorized, filterable, with Arabic TTS playback
- **Cultural journal** — Save moments, review insights
- **Onboarding flow** — Role, mode, goals → quick-win scenarios → paywall
- **Situational confidence tracking** — Across 7 real UAE situations
- **Freemium model** — Daily free guidance limits with Premium unlock

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo ~55 |
| Language | TypeScript 5.x (strict) |
| Navigation | Expo Router v4 |
| Styling | StyleSheet.create + useTheme() |
| Animations | Moti + expo-linear-gradient |
| State | Zustand |
| Persistence | AsyncStorage via Zustand persist |
| Auth | Clerk (expo v3.x) |
| Backend / DB | Supabase (PostgreSQL only — no Supabase Auth) |
| Subscriptions | RevenueCat |
| Icons | Lucide React Native |
| Arabic TTS | expo-speech |

## Getting Started

```bash
git clone https://github.com/ahmedbasolan/Fasih.git
cd Fasih
npm install
npm start
```

Scan the QR code with Expo Go (Android) or Camera (iOS).

## Project Structure

```
Fasih/
├── app/                    # Expo Router routes/screens
├── src/
│   ├── components/         # Reusable UI
│   ├── design/             # Tokens, gradients, hooks
│   ├── features/           # KafMaskot, RoleGoalIcons, etc.
│   ├── home/               # Home screen cards
│   ├── onboarding/         # OnboardingScenarioPlayer
│   ├── ui/                 # EmptyState, ErrorBoundary, FadeIn
│   ├── constants/          # Static data
│   ├── engine/             # Pure business logic (no React)
│   │   ├── ScenarioEngine.ts
│   │   └── __tests__/
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # External service helpers
│   ├── screens/            # Full screen components
│   ├── store/              # Zustand stores
│   ├── theme/              # Fonts, tokens, gradients, useTheme
│   └── types/              # All TypeScript types
├── assets/                 # App images
└── docs/                   # Agent instructions, lessons learned
```

## Rules

- **No MSA.** Arabic content is Khaleeji/Gulf dialect only.
- **Clerk for auth.** Supabase is DB only — no Supabase Auth.
- **One feature = one branch = one PR.**
- **Never commit directly to `main`.**
- **Use `C.TOKEN` for all colors.** No hardcoded hex values.
- **Use font constants from `src/theme`.** No hardcoded font strings.
- **Run `npx tsc --noEmit` before finishing.** Zero errors required.
