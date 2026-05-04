# Career vs Social Mode UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Filter ScenariosScreen by user mode (career/social) and display mode-aware impact preview bars on every scenario card.

**Architecture:** Three files change — `types/index.ts` gains `impactPreview?`, `constants/scenarios.ts` gains two new catalog entries plus `impactPreview` values on all entries, and `ScenariosScreen.tsx` gains a mode filter and an inline `ImpactPreviewStrip` component rendered inside `ScenarioCard`.

**Tech Stack:** React Native, Expo, TypeScript, Zustand, Moti, Lucide React Native

---

## File Map

| File | What changes |
|------|-------------|
| `src/types/index.ts` | Add `impactPreview?` to `Scenario` interface |
| `src/constants/scenarios.ts` | Add `impactPreview` to all catalog entries; add `social_taxi_ride` + `social_elevator` catalog entries; add `Zap` to re-exports |
| `src/screens/ScenariosScreen.tsx` | Read `userMode` from Zustand; filter `allScenarios` by mode; add `ImpactPreviewStrip`; render strip in `ScenarioCard`; add `Zap` to `ICON_MAP` |

---

## Task 1: Add `impactPreview` to the `Scenario` type

**Files:**
- Modify: `src/types/index.ts:72-89` (the `Scenario` interface)

- [ ] **Step 1: Open the file and locate the `Scenario` interface**

  In `src/types/index.ts`, find the `Scenario` interface (starts around line 72). It currently ends with:
  ```ts
  mode: ScenarioMode;
  ```

- [ ] **Step 2: Add `impactPreview?` as the last field in `Scenario`**

  Change:
  ```ts
  export interface Scenario {
    id: string;
    iconName: string;
    title: string;
    subtitle: string;
    decisions: number;
    endings: number;
    phrases: string;
    level: DifficultyLevel;
    locked: boolean;
    comingSoon?: boolean;
    dialect?: string;
    color: string;
    gradientColors: [string, string];
    arabicScene: string;
    kafIntro: string;
    mode: ScenarioMode;
  }
  ```

  To:
  ```ts
  export interface Scenario {
    id: string;
    iconName: string;
    title: string;
    subtitle: string;
    decisions: number;
    endings: number;
    phrases: string;
    level: DifficultyLevel;
    locked: boolean;
    comingSoon?: boolean;
    dialect?: string;
    color: string;
    gradientColors: [string, string];
    arabicScene: string;
    kafIntro: string;
    mode: ScenarioMode;
    impactPreview?: { trust: number; respect: number; culture: number };
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: 0 errors

- [ ] **Step 4: Commit**

  ```bash
  git add src/types/index.ts
  git commit -m "feat: add impactPreview field to Scenario type"
  ```

---

## Task 2: Add `impactPreview` values to all catalog entries and add two new social catalog entries

**Files:**
- Modify: `src/constants/scenarios.ts:9-130` (the three catalog functions)

**Context:** `impactPreview` values are authored to represent what each scenario *primarily tests* — not computed from runtime scores. Values are 0–100. The `trust` slot maps to Vibe in social mode; `respect` maps to Rapport.

- [ ] **Step 1: Add `impactPreview` to all career catalog entries in `getCareerScenarios`**

  In `src/constants/scenarios.ts`, update each career entry to add the `impactPreview` field. Add it as the last field of each object, after `dialect`:

  ```ts
  // first-morning
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 75, respect: 60, culture: 80 },

  // coffee-invitation
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 90, respect: 75, culture: 85 },

  // hotel-guest
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 65, respect: 90, culture: 80 },

  // office-meeting
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 70, respect: 85, culture: 75 },

  // ramadan-shift
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 60, respect: 80, culture: 95 },

  // gym-consultation
  dialect: 'Saudi Gulf',
  impactPreview: { trust: 80, respect: 65, culture: 60 },
  ```

- [ ] **Step 2: Add `impactPreview` to the medical catalog entry in `getMedicalScenarios`**

  ```ts
  // the-checkup
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 85, respect: 70, culture: 65 },
  ```

- [ ] **Step 3: Add `impactPreview` to the four existing social catalog entries in `getSocialScenarios`**

  ```ts
  // cafe-friends
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 70, respect: 50, culture: 70 },

  // eid-greeting
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 60, respect: 75, culture: 95 },

  // weekend-invite
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 80, respect: 65, culture: 85 },

  // neighborhood
  dialect: 'Emirati Gulf',
  impactPreview: { trust: 55, respect: 60, culture: 75 },
  ```

- [ ] **Step 4: Add the `social_taxi_ride` catalog entry to `getSocialScenarios`**

  Append this entry inside the `getSocialScenarios` array, after the `neighborhood` entry and before the closing `]`:

  ```ts
  {
    id: 'social_taxi_ride', iconName: 'Zap',
    title: 'The Taxi Ride', subtitle: 'Airport → Hotel, a late-night conversation',
    decisions: 6, endings: 4, phrases: '12+', level: 'Beginner', locked: false,
    color: C.GOLD, gradientColors: ['#1A1208', '#0D0A05'],
    arabicScene: 'تاكسي',
    kafIntro: 'You just landed in Dubai. Your driver is warm and chatty. Make conversation!',
    mode: 'social',
    dialect: 'Egyptian Gulf',
    impactPreview: { trust: 80, respect: 55, culture: 70 },
  },
  ```

- [ ] **Step 5: Add the `social_elevator` catalog entry to `getSocialScenarios`**

  Append this entry inside the `getSocialScenarios` array, after `social_taxi_ride`:

  ```ts
  {
    id: 'social_elevator', iconName: 'Users',
    title: 'The Elevator', subtitle: 'A brief encounter in your building',
    decisions: 4, endings: 3, phrases: '8+', level: 'Beginner', locked: false,
    color: C.VIOLET2, gradientColors: ['#0A0A1A', '#050510'],
    arabicScene: 'مصعد',
    kafIntro: 'You meet someone in your building elevator. Short phrases, simple choices.',
    mode: 'social',
    dialect: 'Jordanian Gulf',
    impactPreview: { trust: 65, respect: 60, culture: 75 },
  },
  ```

- [ ] **Step 6: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: 0 errors

- [ ] **Step 7: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "feat: add impactPreview to all catalog entries; add taxi + elevator social catalog entries"
  ```

---

## Task 3: Mode filtering in ScenariosScreen

**Files:**
- Modify: `src/screens/ScenariosScreen.tsx:302-314` (the `ScenariosScreen` function top section)

- [ ] **Step 1: Add `Zap` to the `ICON_MAP`**

  `Zap` is already imported at the top of the file (line ~11). Find `ICON_MAP` around line 34:

  ```ts
  const ICON_MAP: Record<string, React.ElementType> = {
    Coffee, Building2, Briefcase, Moon, Users, ShoppingBag, Sunrise, Dumbbell, Heart,
  };
  ```

  Change to:
  ```ts
  const ICON_MAP: Record<string, React.ElementType> = {
    Coffee, Building2, Briefcase, Moon, Users, ShoppingBag, Sunrise, Dumbbell, Heart, Zap,
  };
  ```

- [ ] **Step 2: Read `userMode` from the Zustand store inside `ScenariosScreen`**

  In the `ScenariosScreen` function body, after the existing store selectors (around line 306–308), add:

  ```ts
  const userMode = useAppStore((s) => s.user?.mode ?? 'career');
  ```

  After this addition the top of `ScenariosScreen` looks like:
  ```ts
  export function ScenariosScreen({ user: _user, onScenarioSelect }: Props) {
    const { C, G } = useTheme();
    const insets = useSafeAreaInsets();

    const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
    const hasScenarioAccess = useAppStore((s) => s.hasScenarioAccess);
    const userMode = useAppStore((s) => s.user?.mode ?? 'career');

    const [filterTab, setFilterTab] = useState<FilterTab>('all');
    ...
  ```

- [ ] **Step 3: Add mode filter to `allScenarios`**

  Find the `allScenarios` useMemo (around line 311–314):

  ```ts
  const allScenarios: Scenario[] = useMemo(
    () => [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)],
    [C],
  );
  ```

  Change to:
  ```ts
  const allScenarios: Scenario[] = useMemo(
    () => [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)]
      .filter((s) => s.mode === userMode),
    [C, userMode],
  );
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: 0 errors

- [ ] **Step 5: Smoke-test in Expo**

  In your running Expo dev server, navigate to the Scenarios tab. With a career-mode user, you should see only career scenarios (First Morning, Coffee Invitation, VIP Guest Arrival, The Gym Consultation, The Checkup, etc.). Social scenarios (Café Connection, Eid Greetings, etc.) should be absent.

  To verify social mode, temporarily change the mode in the profile screen (or set `user?.mode: 'social'` in the store devtools). Social scenarios (Café Connection, Eid Greetings, Taxi Ride, Elevator, etc.) should appear; career scenarios should not.

- [ ] **Step 6: Commit**

  ```bash
  git add src/screens/ScenariosScreen.tsx
  git commit -m "feat: filter ScenariosScreen by user mode (career/social)"
  ```

---

## Task 4: ImpactPreviewStrip component + render in ScenarioCard

**Files:**
- Modify: `src/screens/ScenariosScreen.tsx:110-222` (the `ScenarioCard` component and the area just above it)

- [ ] **Step 1: Add the `ImpactPreviewStrip` component**

  Insert this component definition immediately above the `// ─── Card component ──` comment (around line 110):

  ```tsx
  // ─── Impact preview strip ─────────────────────────────────────────────────────

  function ImpactPreviewStrip({
    impactPreview,
    mode,
  }: {
    impactPreview: { trust: number; respect: number; culture: number };
    mode: 'career' | 'social';
  }) {
    const isCareer = mode === 'career';

    const metrics = isCareer
      ? [
          { label: 'Trust', value: impactPreview.trust, color: '#4A90D9' },
          { label: 'Respect', value: impactPreview.respect, color: '#5BA85A' },
          { label: 'Culture', value: impactPreview.culture, color: '#C07AB8' },
        ]
      : [
          { label: '🔥 Vibe', value: impactPreview.trust, color: '#FF7043' },
          { label: '🤝 Rapport', value: impactPreview.respect, color: '#EC407A' },
          { label: '🌙 Culture', value: impactPreview.culture, color: '#7E57C2' },
        ];

    return (
      <View style={{ paddingHorizontal: 14, paddingBottom: 10, gap: 4 }}>
        {metrics.map(({ label, value, color }) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: FONT_LATIN,
                fontSize: 9,
                color: '#6B7280',
                width: isCareer ? 44 : 68,
              }}
            >
              {label}
            </Text>
            <View
              style={{
                flex: 1,
                height: isCareer ? 4 : 6,
                borderRadius: isCareer ? 2 : 3,
                backgroundColor: '#E5E7EB',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${value}%`,
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: isCareer ? 2 : 3,
                }}
              />
            </View>
            {isCareer && (
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: '#9CA3AF', width: 26, textAlign: 'right' }}>
                {value}%
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }
  ```

- [ ] **Step 2: Update `ScenarioCard` to destructure `impactPreview` and `mode` and render the strip**

  Find the `ScenarioCard` function (around line 113). It currently starts with:
  ```tsx
  function ScenarioCard({
    scenario,
    index,
    isLeft,
    onPress,
  }: {
    scenario: Scenario;
    index: number;
    isLeft: boolean;
    onPress: () => void;
  }) {
    const { iconName, title, phrases, locked, comingSoon } = scenario;
  ```

  Change the destructure line to:
  ```tsx
    const { iconName, title, phrases, locked, comingSoon, impactPreview, mode } = scenario;
  ```

- [ ] **Step 3: Shrink the icon when a strip is present, and render the strip**

  Find the bottom section of `ScenarioCard` (around line 196–218):
  ```tsx
  {/* ── Bottom: large icon centered ── */}
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14 }}>
    <Icon size={56} color={locked ? '#CBD5E1' : palette.accent} strokeWidth={1.5} />
  </View>
  {comingSoon && (
  ```

  Replace that `View` (the icon section only, stopping before `{comingSoon &&`) with:
  ```tsx
  {/* ── Bottom: icon + impact strip ── */}
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: impactPreview && !locked ? 4 : 14 }}>
    <Icon
      size={impactPreview && !locked ? 40 : 56}
      color={locked ? '#CBD5E1' : palette.accent}
      strokeWidth={1.5}
    />
  </View>
  {impactPreview && !locked && !comingSoon && (
    <ImpactPreviewStrip impactPreview={impactPreview} mode={mode} />
  )}
  ```

  After this change the full bottom of the Pressable looks like:
  ```tsx
        {/* ── Bottom: icon + impact strip ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: impactPreview && !locked ? 4 : 14 }}>
          <Icon
            size={impactPreview && !locked ? 40 : 56}
            color={locked ? '#CBD5E1' : palette.accent}
            strokeWidth={1.5}
          />
        </View>
        {impactPreview && !locked && !comingSoon && (
          <ImpactPreviewStrip impactPreview={impactPreview} mode={mode} />
        )}
        {comingSoon && (
          <View style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#0D0D0D',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
            <Text style={{
              fontFamily: FONT_LATIN,
              fontSize: 10,
              color: '#FFFFFF',
              letterSpacing: 0.5,
            }}>
              Coming Soon
            </Text>
          </View>
        )}
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: 0 errors

- [ ] **Step 5: Verify in Expo**

  In the Scenarios tab with **career mode**:
  - Each unlocked card shows three thin rectangular bars at the bottom: Trust (blue), Respect (green), Culture (purple), each with a percentage label on the right.
  - Locked cards and comingSoon cards show no strip (icon remains full-size at 56).

  Switch to **social mode** (via Profile screen):
  - Social scenarios (Café Connection, Eid Greetings, Taxi Ride, Elevator) are the only cards shown.
  - Each unlocked card shows three pill-shaped bars: 🔥 Vibe (orange), 🤝 Rapport (coral), 🌙 Culture (purple), no percentage shown.
  - The icon is 40px on unlocked cards with a strip, 56px on locked/comingSoon cards.

- [ ] **Step 6: Commit**

  ```bash
  git add src/screens/ScenariosScreen.tsx
  git commit -m "feat: add ImpactPreviewStrip to scenario cards with career/social styling"
  ```
