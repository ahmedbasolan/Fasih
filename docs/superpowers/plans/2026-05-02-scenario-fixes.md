# Scenario Quality & Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all identified bugs, content-quality gaps, and structural omissions in the scenario system — covering a scoring bug, ghost scenario crashes, romanization inconsistencies, thin endings, missing dialect labels, and female-learner representation.

**Architecture:** Almost all changes live in `src/constants/scenarios.ts` (content) and `src/types/index.ts` (two new optional fields). One screen component (`ScenariosScreen.tsx`) needs a UI guard for coming-soon scenarios. No new files are created.

**Tech Stack:** TypeScript, React Native, Expo. No external dependencies involved.

---

## File Map

| File | What changes |
|------|-------------|
| `src/types/index.ts` | Add `comingSoon?: boolean` and `dialect?: string` to `Scenario`; add `arabicFeminine?: string` to `ScenarioChoice` |
| `src/constants/scenarios.ts` | Fix Taxi Ride scoring threshold; add `comingSoon` + `dialect` to catalog entries; reframe First Morning Scene 3 Choice C note; romanization audit; expand endings for scenarios 3–9; expand thin notes in hotel-guest, cafe-friends, eid-greeting; add `arabicFeminine` where gender diverges |
| `src/screens/ScenariosScreen.tsx` | `ScenarioCard` reads `comingSoon` — shows badge, blocks navigation |

---

## Task 1: Type Extensions

**Files:**
- Modify: `src/types/index.ts:72-103`

- [ ] **Step 1: Open the file and read lines 72–103**

  Confirm `Scenario` starts at line 72 and `ScenarioChoice` starts at line 91.

- [ ] **Step 2: Add `comingSoon` and `dialect` to `Scenario`**

  Replace the `Scenario` interface (lines 72–87) with:

  ```typescript
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
    comingSoon?: boolean;   // true = no script yet; show badge, block nav
    dialect?: string;       // e.g. 'Emirati Gulf', 'Saudi Gulf', 'Egyptian Arabic'
    color: string;
    gradientColors: [string, string];
    arabicScene: string;
    kafIntro: string;
    mode: ScenarioMode;
  }
  ```

- [ ] **Step 3: Add `arabicFeminine` to `ScenarioChoice`**

  Replace the `ScenarioChoice` interface (lines 91–103) with:

  ```typescript
  export interface ScenarioChoice {
    id: string;
    text: string;
    arabic: string;
    arabicFeminine?: string;  // alternate Arabic when learner is female (differs by gender)
    roman: string;
    score: number;
    note?: string;
    outcome: ChoiceOutcome;
    flag?: string;
    impact?: { trust: number; respect: number; culture: number };
    next?: string;
    teachingHighlight?: string;
  }
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  cd "c:\Users\ahmed\OneDrive\Desktop\Define Success Metrics\fasih-mobile"
  npx tsc --noEmit
  ```

  Expected: zero errors (the new fields are optional, so nothing breaks).

- [ ] **Step 5: Commit**

  ```bash
  git add src/types/index.ts
  git commit -m "feat(types): add comingSoon, dialect to Scenario; arabicFeminine to ScenarioChoice"
  ```

---

## Task 2: Ghost Scenario Guard — Catalog + UI

Four scenarios in the catalog (`office-meeting`, `ramadan-shift`, `weekend-invite`, `neighborhood`) have no script. Tapping them currently navigates to a blank or crashing screen.

**Files:**
- Modify: `src/constants/scenarios.ts:38-115` — catalog entries
- Modify: `src/screens/ScenariosScreen.tsx:113-200` — `ScenarioCard`

### 2a — Mark ghost scenarios in the catalog

- [ ] **Step 1: Read lines 38–115 of scenarios.ts**

  Find the four ghost scenario objects.

- [ ] **Step 2: Add `comingSoon: true` to the four entries**

  The four catalog objects that need `comingSoon: true` added are:

  ```typescript
  // office-meeting (line ~38)
  {
    id: 'office-meeting', iconName: 'Briefcase',
    title: 'The First Introduction', subtitle: 'Make a lasting impression at a formal meeting',
    decisions: 12, endings: 5, phrases: '25+', level: 'Intermediate', locked: true,
    comingSoon: true,                           // ← add
    dialect: 'Emirati Gulf',                   // ← add
    color: C.VIOLET2, gradientColors: ['#110A1C', '#080510'],
    arabicScene: 'اجتماع',
    kafIntro: 'In Gulf business culture, how you introduce yourself matters far more than your resume.',
    mode: 'career',
  },

  // ramadan-shift (line ~46)
  {
    id: 'ramadan-shift', iconName: 'Moon',
    title: 'Ramadan Respect', subtitle: 'Navigate the holy month with grace',
    decisions: 8, endings: 3, phrases: '22+', level: 'Advanced', locked: true,
    comingSoon: true,
    dialect: 'Emirati Gulf',
    color: C.VIOLET2, gradientColors: ['#0D0A1A', '#080510'],
    arabicScene: 'رمضان',
    kafIntro: 'During Ramadan, every word you choose carries the weight of the sacred month.',
    mode: 'career',
  },

  // weekend-invite (line ~98)
  {
    id: 'weekend-invite', iconName: 'Users',
    title: 'Desert Gathering', subtitle: 'Invited to a family outing outside the city',
    decisions: 10, endings: 5, phrases: '20+', level: 'Intermediate', locked: true,
    comingSoon: true,
    dialect: 'Emirati Gulf',
    color: C.VIOLET2, gradientColors: ['#1A0F08', '#0D0805'],
    arabicScene: 'صحراء',
    kafIntro: 'Accepting a desert invitation means accepting a family\'s trust and deepest hospitality.',
    mode: 'social',
  },

  // neighborhood (line ~106)
  {
    id: 'neighborhood', iconName: 'ShoppingBag',
    title: 'Market Day', subtitle: 'Navigate a local souk with confidence',
    decisions: 7, endings: 4, phrases: '16+', level: 'Intermediate', locked: true,
    comingSoon: true,
    dialect: 'Emirati Gulf',
    color: C.VIOLET2, gradientColors: ['#0F0A1A', '#080510'],
    arabicScene: 'سوق',
    kafIntro: 'In the souk, knowing the right words means knowing the culture behind them.',
    mode: 'social',
  },
  ```

### 2b — Add dialect to all non-ghost scenarios

While editing the catalog, add `dialect` to the existing live scenarios too:

```typescript
// first-morning
dialect: 'Emirati Gulf',

// coffee-invitation
dialect: 'Emirati Gulf',

// hotel-guest
dialect: 'Emirati Gulf',

// gym-consultation
dialect: 'Saudi Gulf',   // abshir, saraha lean Saudi

// the-checkup
dialect: 'Emirati Gulf',

// cafe-friends
dialect: 'Emirati Gulf',

// eid-greeting
dialect: 'Emirati Gulf',

// social_taxi_ride  — note: Youssef speaks Egyptian; this label refers to the primary target dialect
dialect: 'Mixed (Egyptian host)',

// social_elevator
dialect: 'Jordanian Arabic',
```

### 2c — Block navigation in ScenarioCard

- [ ] **Step 3: Read ScenariosScreen.tsx lines 113–200 (the ScenarioCard component)**

- [ ] **Step 4: Update ScenarioCard to handle comingSoon**

  Replace the destructured variables and the `Pressable` `onPress` + `disabled` props:

  ```tsx
  // line ~124 — was:
  const { iconName, title, phrases, locked } = scenario;

  // change to:
  const { iconName, title, phrases, locked, comingSoon } = scenario;
  ```

  Then add a "Coming Soon" badge inside the card's bottom section, after the icon render, and change `disabled`:

  ```tsx
  // was:
  <Pressable
    onPress={onPress}
    disabled={locked}
    ...
    opacity: locked ? 0.72 : 1,
  >

  // change to:
  <Pressable
    onPress={comingSoon ? undefined : onPress}
    disabled={locked || !!comingSoon}
    ...
    opacity: locked || comingSoon ? 0.72 : 1,
  >
  ```

  Add the badge just before the closing `</Pressable>` (after the icon view):

  ```tsx
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

- [ ] **Step 5: Verify no TypeScript errors**

  ```bash
  npx tsc --noEmit
  ```

  Expected: zero errors.

- [ ] **Step 6: Commit**

  ```bash
  git add src/constants/scenarios.ts src/screens/ScenariosScreen.tsx
  git commit -m "feat(scenarios): mark 4 ghost scenarios comingSoon; add dialect labels; block nav"
  ```

---

## Task 3: Fix Taxi Ride Scoring Bug

The exceptional ending (`Best Ride Ever`) requires `min: 18` but the maximum achievable score across all five scenes is **16** (scene 1: 3 + branch scene 2: 3 + branch scene 3: 3 + scene 4: 3 + scene 5: 4). No path can reach 18.

**Files:**
- Modify: `src/constants/scenarios.ts` — `social_taxi_ride` endings block (~line 780)

- [ ] **Step 1: Read lines 779–785 of scenarios.ts**

  Find the `endings` array in `social_taxi_ride`.

- [ ] **Step 2: Lower the exceptional threshold from 18 to 14**

  The score distribution with perfect play is 3+3+3+3+4=16, so 14 is a realistic but demanding target (requires choosing the best path on 4 of 5 scenes).

  ```typescript
  endings: [
    { min: 14, title: 'Best Ride Ever', ... },   // was 18
    { min: 8,  title: 'Good Chat', ... },         // was 10 — lower proportionally
    { min: 3,  title: 'Forgettable Ride', ... },  // was 4
    { min: 0,  title: 'Awkward Silence', ... },
  ],
  ```

- [ ] **Step 3: Verify the score floor — walk through worst path manually**

  Worst path: scene 1 = -1, c2_effort (scene 2) = 0, c3_dubai (scene 3) = 0, scene 4 = -2, scene 5 = -2 → total = -5.
  Minimum ending threshold is 0, so `min: 0` catches everything. ✓

- [ ] **Step 4: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "fix(scenarios): correct Taxi Ride exceptional ending threshold from 18→14 (was unreachable)"
  ```

---

## Task 4: Reframe First Morning Scene 3, Choice C

Choice C (praising coffee you don't actually like) scores `trust: -1` which feels irrational for a compliment. The cultural insight is valid but the framing needs to frame it explicitly as a **paradox moment** so learners understand the penalty is intentional and educational, not a bug.

**Files:**
- Modify: `src/constants/scenarios.ts` — scene3 choices in `first-morning`, choice id `'c'` (~line 182)

- [ ] **Step 1: Read lines 178–185 of scenarios.ts**

- [ ] **Step 2: Replace the note for choice C**

  Current note:
  > `'You accepted the coffee AND complimented it — culturally perfect. Faisal is pleased. But the coffee is actually bitter and you don't like it. In Gulf culture, white lies about hospitality are common and socially expected. However, trust is built on honesty. Small dishonesty now can become a habit. Was protecting his feelings worth it?'`

  Replace with:

  ```typescript
  note: '⚖️ Cultural paradox: Complimenting the coffee is the warm, polished move — Faisal is pleased. But the coffee is bitter and you don\'t like it. Gulf hospitality culture expects gracious acceptance, and a white lie here is socially harmless. The -1 trust is not about Faisal — it is a private signal to you: this habit, repeated, means your praise loses weight over time. Genuine appreciation lands harder than reflexive compliments. Both paths (honest gratitude or warm compliment) are valid. This choice teaches the difference.',
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "fix(content): reframe First Morning scene 3 choice C trust penalty as intentional paradox"
  ```

---

## Task 5: Romanization Audit

The romanization system is defined at the top of `scenarios.ts`:
```
' = ع   kh = خ   gh = غ   g = ق   h = ح   sh = ش   aa/ii/uu = long vowels
```

Key inconsistencies to fix throughout the file:

| Wrong | Correct | Rule |
|-------|---------|------|
| `as-salaam 'alaykum` | `as-salaamu 'alaykum` | long uu on سلام |
| `al-hamdu lillah` *(sometimes capitalized)* | `al-hamdu lillah` *(lowercase)* | consistent casing |
| `in shaa' allah` | `in shaa' allah` | keep consistent spacing |
| `in shaa allah` (no ') | `in shaa' allah` | ع in شاء = ' |
| `ma shaa' allah` | `maa shaa' allah` | long ما vowel |
| `yiit` (c2_effort Taxi) | `yiit` *(Egyptian — leave, annotate)* | Egyptian variant, note in teachingNote |
| `as-salamu alaykum` (elevator scene) | `as-salaamu 'alaykum` | long uu, ع = ' |

**Files:**
- Modify: `src/constants/scenarios.ts` — full file audit

- [ ] **Step 1: Fix ` 'alaykum` (missing ') — elevator scenario ~line 805**

  ```typescript
  // was:
  roman: 'as-salamu alaykum'

  // change to:
  roman: "as-salaamu 'alaykum"
  ```

- [ ] **Step 2: Fix `masha allah` → `maa shaa' allah` in hotel-guest and eid-greeting**

  Search for `masha allah` (without ') and fix each instance:

  ```typescript
  // was: roman: "masha allah 'alayk"
  roman: "maa shaa' allah 'alayk"
  ```

- [ ] **Step 3: Fix `in shaa allah` (missing ') throughout**

  Each instance of `in shaa allah` should be `in shaa' allah`. There are approximately 8 instances. Find and replace consistently:

  ```typescript
  // was: roman: 'in shaa allah'
  roman: "in shaa' allah"
  ```

- [ ] **Step 4: Standardize `al-hamdu lillah` casing**

  All instances should be lowercase `al-hamdu lillah`. Remove any capitalised variants.

- [ ] **Step 5: Add Egyptian annotation to Taxi Ride romanization**

  In scene `c2_open` (~line 706), the teachingNote already says Egyptian vs Gulf. Confirm the romanization in that scene's `roman` field uses Egyptian forms intentionally (e.g., `'uli ya habibi` instead of Gulf `guuli ya habibi`) and that the teachingNote covers it. If not, add:

  ```typescript
  teachingNote: "يوسف speaks Egyptian Arabic — 'قولي' becomes 'قولي' in Egyptian vs 'قوليلي' or 'گولي' in Gulf. Notice 'إيه' (eh) for 'what', and 'منين' (minein) for 'from where.' Egyptian Arabic is the most widely understood dialect in the Arab world.",
  ```

- [ ] **Step 6: Verify build still compiles**

  ```bash
  npx tsc --noEmit
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "fix(content): romanization audit — standardise long vowels, ع apostrophe, masha'allah, Egyptian annotations"
  ```

---

## Task 6: Expand Ending Narratives (Scenarios 3–9)

The `culturalJourney` array on endings is the most powerful pedagogical moment in the app — it tells learners what they actually learned. Scenarios 3–9 either lack it entirely or have thin one-liners. Add 3–4 specific `culturalJourney` bullets to every exceptional and success ending that is currently missing them.

**Files:**
- Modify: `src/constants/scenarios.ts` — endings in hotel-guest, cafe-friends, eid-greeting, social_taxi_ride, social_elevator

### 6a — hotel-guest endings

- [ ] **Step 1: Read the hotel-guest endings (~lines 574–580)**

- [ ] **Step 2: Add culturalJourney to Royal Patron and Glowing Review endings**

  ```typescript
  endings: [
    {
      min: 22, title: 'Royal Patron', arabic: 'نعم الخدمة', roman: "ni'am al-khidma",
      en: 'What excellent service',
      desc: 'Sheikh Khalid requests you personally for every future visit. In Dubai\'s hospitality industry, one VIP patron who asks for you by name changes your career trajectory.',
      color: C.GOLD, type: 'exceptional',
      culturalJourney: [
        'You returned السلام عليكم with the full ورحمة الله — showing the Sheikh you know the greeting has three tiers, not one',
        'You pledged "ضيوفك على الراس" (your guests are on our heads) — the highest form of hospitality commitment in Gulf culture',
        'You closed with "بيتك بيتنا دايماً" (your house is our house always) — transforming a hotel stay into a personal relationship',
        'You never cited policy or made him wait — VIP hospitality means anticipating needs, not managing them',
      ],
    },
    {
      min: 14, title: 'Glowing Review', arabic: 'ما شاء الله عليك', roman: "maa shaa' allah 'alayk",
      en: 'God has blessed you with skill',
      desc: 'The Sheikh tells management he was deeply impressed. You receive a commendation letter. In Gulf hospitality, word-of-mouth from a respected guest is worth more than any formal training certificate.',
      color: C.JADE2, type: 'success',
      culturalJourney: [
        'You used Arabic throughout — even imperfect Arabic signals genuine effort to a Gulf guest',
        'You prioritised his comfort over hotel procedure — the right instinct in Gulf hospitality culture',
        'A few moments could have been elevated with stronger blessings, but the core respect was there',
      ],
    },
    {
      min: 4, title: 'Professional Service', arabic: 'مشكور', roman: "mashkuur",
      en: 'Thank you',
      desc: 'A polite stay. No complaints, no compliments. Sheikh Khalid will not remember your name — and in the Gulf hospitality industry, invisible service is a missed opportunity.',
      color: C.VIOLET2, type: 'mixed',
    },
    {
      min: 0, title: 'Formal Complaint', arabic: 'الله يهديك', roman: "allah yahdik",
      en: 'May God guide you',
      desc: 'Cultural missteps left a poor impression. The Sheikh speaks to your manager. "الله يهديك" (may God guide you) is not a blessing in this context — it is a polite expression of disappointment.',
      color: C.ERROR, type: 'failed',
    },
  ],
  ```

### 6b — cafe-friends endings

- [ ] **Step 3: Read the cafe-friends endings (~lines 624–630)**

- [ ] **Step 4: Expand all four endings**

  ```typescript
  endings: [
    {
      min: 22, title: 'Lifelong Friend', arabic: 'صديقتي العزيزة', roman: "sadiigati al-'aziiza",
      en: 'My dear friend',
      desc: 'Fatima invites you to her family gathering next weekend. In Emirati social culture, a family invitation after a single café meeting is rare — it means she sees you as someone worth bringing into her inner circle.',
      color: C.GOLD, type: 'exceptional',
      culturalJourney: [
        'You opened with أهلاً وسهلاً — not just "yes" — showing warmth before a stranger even sat down',
        'You said "أنا جديدة هنا — وأنتي؟" — sharing yourself first, then showing curiosity about her roots',
        'You closed with "والله فرحانة إني عرفتك — في أمان الله" — a farewell that made the goodbye feel like a beginning',
        'Fatima asked to stay in touch. You gave her a reason to want to.',
      ],
    },
    {
      min: 14, title: 'Coffee Companion', arabic: 'نتقابل مرة ثانية', roman: "nitgaabal marra thaanya",
      en: "Let's meet again",
      desc: 'You exchange numbers and plan to meet at the same café next week. A second meeting is earned, not assumed — Fatima chose to invite you back.',
      color: C.JADE2, type: 'success',
      culturalJourney: [
        'You used Arabic at the right moments — including her name and a warm farewell phrase',
        'You showed interest in her background without making it feel like an interview',
        'The connection was genuine — a real second coffee will happen',
      ],
    },
    {
      min: 4, title: 'Passing Acquaintance', arabic: 'يلا مع السلامة', roman: "yalla ma'a as-salaama",
      en: 'Goodbye then',
      desc: 'A pleasant conversation, but no real connection formed. Fatima was friendly — she always is. But friendly and connected are different things.',
      color: C.VIOLET2, type: 'mixed',
    },
    {
      min: 0, title: 'Awkward Exit', arabic: 'الله يسهلك', roman: "allah yisahlik",
      en: "May God ease your way",
      desc: 'Fatima politely left early. In Emirati culture, cultural distance feels like coldness even when none is intended. The gap felt too wide to bridge over one coffee.',
      color: C.ERROR, type: 'failed',
    },
  ],
  ```

### 6c — eid-greeting endings

- [ ] **Step 5: Read the eid-greeting endings (~lines 674–680)**

- [ ] **Step 6: Expand the exceptional and success endings**

  ```typescript
  endings: [
    {
      min: 22, title: 'Adopted Family', arabic: 'أنت ولدنا', roman: "inta waldna",
      en: 'You are our child',
      desc: 'Uncle Rashid declares you family. In Gulf culture, being called "ولدنا" (our child) by an elder is not a figure of speech — it is a formal declaration of belonging. You will never spend another Eid alone.',
      color: C.GOLD, type: 'exceptional',
      culturalJourney: [
        'You returned "عيدكم مبارك" with "وعساكم من عواده" — the traditional follow-up that most non-natives never learn',
        'You said "بسم الله" before touching the sweets, then asked who made them — showing the food was an act of love, not just a snack',
        'You closed with "جزاكم الله خير — أنتم أهلي هنا" — telling Rashid his family filled a gap you actually felt',
        'Eid is the one day that tests everything: greeting, hospitality, farewell. You passed every stage.',
      ],
    },
    {
      min: 14, title: 'Neighbourhood Welcome', arabic: 'أهلاً فيك دايماً', roman: "ahlan fiik daayiman",
      en: 'Always welcome',
      desc: 'Rashid tells the neighbours about you. In close-knit Emirati neighbourhoods, word travels fast — you will find doors opening before you even knock.',
      color: C.JADE2, type: 'success',
      culturalJourney: [
        'You used the Eid-specific greeting correctly — عيدكم مبارك back, not generic "happy holidays"',
        'You accepted the sweets with warmth — refusing hospitality on Eid is culturally impossible',
        'A genuine farewell sealed the visit — Rashid will remember you at the next celebration',
      ],
    },
    {
      min: 4, title: 'Polite Visitor', arabic: 'تفضل وقت ما تبي', roman: "tfaddal wagt ma tabi",
      en: 'Come whenever you like',
      desc: 'A nice visit, but it felt more like a courtesy call than a connection. Rashid was generous — he always is — but the warmth did not become a bond.',
      color: C.VIOLET2, type: 'mixed',
    },
    {
      min: 0, title: 'Missed Blessing', arabic: 'الله كريم', roman: "allah kariim",
      en: 'God is generous',
      desc: 'Uncle Rashid smiles politely. "الله كريم" (God is generous) is what Gulf Arabs say when something disappointing happens and they choose grace over complaint. He chose grace.',
      color: C.ERROR, type: 'failed',
    },
  ],
  ```

### 6d — social_elevator endings

- [ ] **Step 7: Read the social_elevator endings (~lines 883–888)**

- [ ] **Step 8: Add culturalJourney to the top two endings**

  ```typescript
  endings: [
    {
      min: 14, title: 'The Chai Invitation', arabic: 'تعال على شاي!', roman: "ta'al ala shay!",
      en: 'Come for tea!',
      desc: 'In six floors and one hallway, you went from strangers to neighbours. Sami will knock on your door this weekend with Jordanian mint tea.',
      color: C.GOLD, type: 'exceptional',
      culturalJourney: [
        'You opened with السلام عليكم — the one greeting that works across every Arabic dialect',
        'You responded to the child\'s greeting with "يا بطل" (champ) — a tiny word that showed warmth and cultural ease',
        'You noticed Sami had lived there 8 years — "صار دبي بيتك" (Dubai became your home) showed you actually listened',
        'You invited first — "تعال على شاي يوم" — taking the relationship from corridor to connection',
      ],
    },
    {
      min: 8, title: 'Friendly Neighbour', arabic: 'جار طيب', roman: 'jaar tayyib',
      en: 'Good neighbour',
      desc: "You and Sami will say hi every time you pass each other. He'll hold the elevator for you. It's not a friendship yet — but it's the start of one.",
      color: C.JADE2, type: 'success',
      culturalJourney: [
        'You engaged when it counted — not every moment, but the right moments',
        'Sami is Jordanian, not Emirati — you navigated a different Arabic dialect naturally',
        'A foundation was laid. The chai invitation is still possible.',
      ],
    },
    {
      min: 3, title: 'The Hallway Nod', arabic: 'هزة راس في الممر', roman: 'hazat ras fi al-mamarr',
      en: 'Hallway nod',
      desc: "You and Sami will recognise each other. There'll be an awkward nod when you pass. Neither of you will remember the other's name.",
      color: C.VIOLET2, type: 'mixed',
    },
    {
      min: 0, title: 'Invisible Neighbours', arabic: 'جيران ما يعرفون بعض', roman: "jiraan ma ya'rifun ba'ad",
      en: 'Stranger neighbours',
      desc: "Two doors, three feet apart, and a wall between you. Sami won't try again. You'll hear his music through the wall and wonder who lives there.",
      color: C.ERROR, type: 'failed',
    },
  ],
  ```

- [ ] **Step 9: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

- [ ] **Step 10: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "feat(content): expand ending narratives with culturalJourney for scenarios 3-9"
  ```

---

## Task 7: Expand Thin Teaching Notes — Hotel Guest, Café Connection, Eid Greetings

Later scenarios have one-line notes that name the rule without explaining the cultural mechanism behind it. Each note below needs to be expanded to the standard of The First Morning: explain what the NPC feels, why the cultural principle exists, and what the long-term consequence is.

**Files:**
- Modify: `src/constants/scenarios.ts` — notes in hotel-guest, cafe-friends, eid-greeting

### 7a — Hotel Guest thin notes

- [ ] **Step 1: Read hotel-guest scenes (~lines 536–580)**

- [ ] **Step 2: Expand the three weakest notes**

  **Scene 1, Choice B** (returning سلام without full greeting):
  ```typescript
  note: 'You returned the greeting properly — وعليكم السلام is always correct. Sheikh Khalid registers you as respectful. But there is a hierarchy to the Islamic greeting: the full form is وعليكم السلام ورحمة الله وبركاته. When greeting someone of rank, the complete form signals that you know the levels of the greeting, not just the minimum. He noticed you gave the first level. He would have noticed the third.',
  ```

  **Scene 2, Choice A** (checking the system while VIP waits):
  ```typescript
  note: 'Making a VIP wait while you visibly "check" something tells him he is a problem to be solved, not a guest to be served. In Gulf hospitality culture, the correct sequence is: reassure first ("كل شي جاهز" — everything is ready), then verify privately. His comfort should never depend on your system access.',
  ```

  **Scene 3, Choice C** (asking for feedback form):
  ```typescript
  note: 'Sheikh Khalid just offered you a genuine expression of thanks — "ما قصرت" (you did not fall short) is a meaningful phrase in Gulf culture, not a polite formality. Responding by asking for a review form converts a human moment into a transactional one. It tells him the hotel sees him as a data point, not a guest. He will fill out no form. He will simply not return.',
  ```

### 7b — Café Connection thin notes

- [ ] **Step 3: Read cafe-friends scenes (~lines 586–623)**

- [ ] **Step 4: Expand the three weakest notes**

  **Scene 1, Choice A** ("Yeah, go ahead" = ii tfaddali):
  ```typescript
  note: 'You used the correct feminine form تفضلي — that is noticed and appreciated. But the English "Yeah" before it signals that Arabic is a performance, not a reflex. Fatima interprets this as someone who knows a few words but has not yet committed to the culture. The gap between "yeah, tafaddali" and "ahlan wa sahlan — tafaddali" is the gap between polite and warm.',
  ```

  **Scene 2, Choice A** (refusing to share origin):
  ```typescript
  note: '"Where are you from?" in Gulf culture is never a privacy invasion — it is the first step in understanding who you are and how to connect with you. Fatima is not asking for your address. She is asking for your story. Refusing it in a casual café setting does not signal privacy awareness; it signals you are not interested in her interest. The conversation closes here.',
  ```

  **Scene 3, Choice A** ("Maybe — I\'m pretty busy"):
  ```typescript
  note: 'Fatima took a social risk asking to stay in touch with someone she just met. Hedging her offer with "maybe" signals that her risk was not worth taking. In Emirati culture, genuine connection is treated as a gift — declining it, even gently, lands as rejection. If you truly are busy: "أكيد! بس هالأسبوع مشغولة — رقمك؟" (of course, but this week is busy — your number?) would have preserved the connection.',
  ```

### 7c — Eid Greetings thin notes

- [ ] **Step 5: Read eid-greeting scenes (~lines 636–680)**

- [ ] **Step 6: Expand the three weakest notes**

  **Scene 1, Choice C** ("Happy holidays" / كل عام وأنتم بخير):
  ```typescript
  note: '"كل عام وأنتم بخير" (may every year find you well) is a beautiful phrase — but it is the general year-end greeting, not the Eid-specific one. Using it on Eid morning tells Uncle Rashid you know Arabic phrases but have not yet learned that Eid has its own vocabulary. He will correct you gently with "عيدك مبارك" and the moment will feel like a lesson, not a greeting.',
  ```

  **Scene 2, Choice B** (thanking but calling sweets "delicious"):
  ```typescript
  note: 'You accepted and you complimented — those are the right instincts. But "شكلها لذيذة" (they look delicious) is a generic food compliment. On Eid, these sweets were made by hand, days in advance, as an act of love. The phrases that honour that: بسم الله before eating, ما شاء الله on the presentation, and "مين سواها؟" (who made them?) — asking who made them tells the maker their effort was seen.',
  ```

  **Scene 3, Choice A** ("Thanks! See you around"):
  ```typescript
  note: 'Uncle Rashid just said "بيتنا بيتك دايماً" — your house is always our house. This is one of the warmest things a Gulf Arab can say to someone outside the family. It means: you belong here. Responding with "مشكور! نشوفك" (thanks, see you) is the social equivalent of someone handing you a gift and you pocketing it without looking at it. The farewell needed to honour the size of what he offered.',
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "feat(content): expand teaching notes in hotel-guest, cafe-friends, eid-greeting to First Morning depth"
  ```

---

## Task 8: Female Learner Notes — arabicFeminine Field

When an NPC addresses the learner directly using second-person Arabic, the form changes depending on the learner's gender. This task identifies the key scenes where NPCs address the learner in ways that would differ for a female speaker, and adds `arabicFeminine` to the learner's choices where the Arabic response would differ.

**Why this matters:** In Gulf Arabic, second-person verb forms and pronouns differ by gender (e.g., `شلونك` vs `شلونج`). Female learners using this app currently see only the masculine Arabic response forms.

**Files:**
- Modify: `src/constants/scenarios.ts` — add `arabicFeminine` to choices in `first-morning` scene 2, `coffee-invitation` scene 3, `gym-consultation` scene 1

Note: First-person verb forms in Gulf Arabic (`أنا روحت`, `أنا بخير`) do not differ by speaker gender. Only second-person address forms change. The learner's own speech is largely gender-neutral; the NPC's speech to the learner is where it matters.

- [ ] **Step 1: Read first-morning scene 2 choices (~lines 161–165)**

  Faisal says `شلونك؟` — male form. If learner is female, he would say `شلونج؟`. The learner's response choices are first-person Arabic and don't change. However, add a `teachingNote` to the scene itself to flag this:

  ```typescript
  // Add to scene2 in first-morning:
  teachingNote: "Faisal says شلونك — addressing a male learner. Female learners: he would say شلونج instead. The response الحمد لله، بخير works for both.",
  ```

- [ ] **Step 2: Read the-checkup scene 1 choices (~lines 443–448)**

  This is the one scenario where feminine address is already handled well (`تفضلي`, `خالتي`). Verify all four choices correctly use feminine imperative forms when giving instructions to Umm Khalid. They already do — no change needed. ✓

- [ ] **Step 3: Add arabicFeminine to first-morning scene 1, choice A**

  Scene 1, Choice A: The learner says `صباح النور!` — same for male and female speaker. No change.
  But the NPC dialogue `صباح الخير! ويه يديد` — "يديد" is masculine "new face." If learner is female, he would say `ويه يديدة`.

  Add a scene-level `teachingNote`:
  ```typescript
  // Add to scene1 of first-morning:
  teachingNote: "Faisal says 'ويه يديد' (a new face — masculine). Female learners: he would say 'ويه يديدة' instead. The greeting صباح النور is the same for all.",
  ```

- [ ] **Step 4: Add arabicFeminine to coffee-invitation scene 3 choice D**

  The learner says: `الحمد لله — هم في بلدي، بس دايماً في قلبي`
  This is first-person speech — no gender change needed. ✓

  However, Choice C (`في بلدي. وأنت؟ عيالك بخير؟`) — "وأنت" addresses Ahmed as male. This is correct since Ahmed is male. No change needed. ✓

- [ ] **Step 5: Add arabicFeminine to gym-consultation scene 1 choice A**

  The learner says: `وعليكم السلام! أهلاً وسهلاً فيك يا سلطان. تفضل اقعد`
  `تفضل` (masculine command — correct since Sultan is male). ✓

  Add `arabicFeminine` only where the learner's own Arabic would differ by speaker gender. In this scenario, the learner is a gym trainer and Sultan is male, so `تفضل` is always correct regardless of trainer gender. No change needed. ✓

- [ ] **Step 6: Add a global teachingNote to cafe-friends scene 1**

  Fatima says `هذا الكرسي فاضي؟` — gender neutral. The learner's response options use gender-neutral forms. However, the response phrase `أهلاً وسهلاً — تفضلي` already uses the feminine form to address Fatima. This is handled correctly. ✓

  Add to scene1 of cafe-friends:
  ```typescript
  teachingNote: "Notice تفضلي (not تفضل) — the feminine imperative is used when inviting a woman. If Fatima were male, it would be تفضل. This distinction applies to any imperative you give to a person.",
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add src/constants/scenarios.ts
  git commit -m "feat(content): add gender-awareness teachingNotes to key scenes; arabicFeminine field groundwork"
  ```

---

## Task 9: Final Verification

- [ ] **Step 1: Run TypeScript check**

  ```bash
  cd "c:\Users\ahmed\OneDrive\Desktop\Define Success Metrics\fasih-mobile"
  npx tsc --noEmit
  ```

  Expected: zero errors.

- [ ] **Step 2: Run linter**

  ```bash
  npm run lint
  ```

  Expected: no new lint errors introduced by these changes.

- [ ] **Step 3: Verify Taxi Ride scoring manually**

  Open `src/constants/scenarios.ts`, find `social_taxi_ride.endings`. Confirm:
  - `min: 14` for exceptional
  - Maximum achievable score (best path: 3+3+3+3+4 = 16) ≥ 14 ✓
  - `min: 0` for failed ✓

- [ ] **Step 4: Verify ghost scenarios have comingSoon: true**

  Run:
  ```bash
  grep -n "comingSoon" "src/constants/scenarios.ts"
  ```

  Expected: 4 matches for `office-meeting`, `ramadan-shift`, `weekend-invite`, `neighborhood`.

- [ ] **Step 5: Verify dialect field present**

  ```bash
  grep -n "dialect:" "src/constants/scenarios.ts"
  ```

  Expected: at least 9 matches (one per live scenario).

- [ ] **Step 6: Final commit**

  ```bash
  git add .
  git commit -m "chore: final verification pass — all scenario fixes complete"
  ```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Ghost scenario crash guard — Task 2
- [x] Taxi Ride scoring bug — Task 3
- [x] Romanization audit — Task 5
- [x] First Morning Scene 3 Choice C note — Task 4
- [x] Ending depth for scenarios 3–9 — Task 6
- [x] Thin notes in hotel-guest, café, eid — Task 7
- [x] Dialect labels — Task 2b + Task 1
- [x] Female learner notes — Task 8
- [x] comingSoon type field — Task 1
- [x] arabicFeminine type field — Task 1

**Known not covered in this plan (future work):**
- Scripts for the 4 ghost scenarios (large content project — separate plan)
- New female-perspective career scenario
- Numbers/prices Arabic curriculum
- Wasta/hierarchy navigation scenario
- Over-enthusiasm "bad" choice examples

These are new scenarios requiring a separate content-design session with the language educator.
