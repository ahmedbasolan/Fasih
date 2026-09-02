# Code Quality Review — Fasih

Rolling, file-by-file review of the whole codebase. Started 2026-09-02 on
`feat/design-cleanup`. Findings are recorded here as each batch is read; nothing
in this file has been fixed unless a line says so explicitly.

Severity key: **P0** ship-blocking / data-loss / security · **P1** real bug users
will hit · **P2** correctness or maintainability debt · **P3** nit / consistency.

---

## Progress

| Batch | Scope | Status |
|---|---|---|
| 0 | Baseline health (tsc / eslint / jest) | ✅ done |
| 1 | Foundations — store, engine, types, theme, design hooks | ✅ done |
| 2 | Routes — `app/**` | ✅ done |
| 3 | Services — `src/lib/**` (supabase, sync, analytics, clerkErrors) | ✅ done |
| 4 | Services — `src/lib/**` (purchases, notifications, haptics) | ✅ done |
| 5 | Screens — ScenarioPlayer, ScenarioDetail, `useArabicTTS` | ✅ done |
| 6a | Screens — HomeScreenNew, ScenariosScreen | ✅ done |
| 6b | Screens — PhraseLibrary, PracticeScreen | ✅ done |
| 6c | Screens — ProfileScreen, OnboardingFlow | ✅ done |
| 7 | Components — `ui/`, `features/` (gate, buttons), `scenario/` | ✅ done |
| 8 | Components — `home/`, `features/`, `onboarding/` | ✅ done |
| 9 | Components — remaining `ui/`, `design/` | ✅ done |
| 10 | Constants, tests, config, SQL migrations | ✅ done |

**Review complete.** 117 findings — see [Summary](#summary) at the end.

---

## Batch 0 — Baseline health

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npx jest` | **129 passed / 129**, 5 suites |
| `npx eslint .` | 7 errors, 56 warnings |

All 7 ESLint errors are outside app code: 4 × unresolved `ajv` imports in the
vendored `expo-cicd-workflows` skill (`.agents/` and `.claude/`), and 3 ×
`__dirname is not defined` in `generate-icons.js` / `scripts/compress-images.js`
(Node CJS scripts being linted with the app's ESM/browser globals). Neither ships
in the bundle, but they make `npm run lint` non-green, which trains people to
ignore it. Fix by adding a Node-globals override for `scripts/**` +
`generate-icons.js` and ignoring `.agents/**` and `.claude/**`.

Warning breakdown: 31 × `react-native/no-color-literals`, 8 ×
`react-hooks/set-state-in-effect`, 6 × `react-hooks/immutability`, 5 × unused
`eslint-disable` directives, 3 × `react-hooks/refs`, 1 × `exhaustive-deps`.

---

## Batch 1 — Foundations

### P1 — `useTypewriter` and `useCountUp` never clear their intervals
`src/components/design/hooks.ts:9-21`, `src/components/design/hooks.ts:31-51`

Both hooks return a cleanup function from **inside the `setTimeout` callback**:

```ts
const timeout = setTimeout(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer);   // ← thrown away, not an effect cleanup
}, delay);
return () => clearTimeout(timeout);    // ← only clears the timeout
```

`setTimeout` discards its callback's return value, so the interval is only ever
cleared by its own internal terminating branch. Consequences:

- Unmounting mid-animation leaves an interval writing state to a dead component
  for up to `duration` ms.
- For `useTypewriter`, when `text` **changes mid-typing** the old interval keeps
  running against the old closure and races the new one — two intervals writing
  `setDisplayed` with different strings. This is live in
  `ScenarioPlayer.tsx:98`, where `text` flips between `''` and the English line
  every time the learner reveals a translation or advances a scene.

Fix: hoist `timer` to a variable in the effect scope and clear both in the
effect's own cleanup.

### P1 — `getDueReviews` uses local dates, notification scheduling uses UTC
`src/store/useAppStore.ts:466`, `src/store/useAppStore.ts:481` vs `src/engine/srsEngine.ts:19-25`

`srsEngine.todayISO()` is deliberately local-time ("so streak days match the
user's clock") and drives `getDueReviews`. But both notification paths compute
the same due count with `new Date().toISOString().split('T')[0]`, which is
**UTC**. In UAE (UTC+4) those two disagree between 00:00 and 04:00 local: the
reminder says "3 cards due" while the Practice screen shows a different number.
`todayISO` is already imported in this file — use it.

### P2 — Trial-window check is duplicated
`src/store/useAppStore.ts:562-566` and `src/store/useAppStore.ts:574-578`

Identical 5-line "is the trial still running" block in `hasFullAccess` and
`hasScenarioAccess`. The comment on `TRIAL_DAYS` says it is the single source of
truth for both, but only the *constant* is shared, not the logic. Extract
`isTrialActive(s)`.

### P2 — RevenueCat listener is never torn down on sign-out
`src/store/useAppStore.ts:549-556`, `src/store/useAppStore.ts:407-438`

`initSubscription` stores `_customerInfoUnsub` and correctly deregisters a
previous listener before re-registering. `signOut` does not call it. After
signing out, the listener stays live and can still `set({ subscriptionStatus })`
on the now-empty store. Call `_customerInfoUnsub?.()` in `signOut`.

### P2 — `any` in the store, against the project's own rule
`src/store/useAppStore.ts:340` — `catch (e: any)`. CLAUDE.md says no `any`.
Use `e instanceof Error ? e.message : 'Sync failed'`, matching the pattern
already used in `syncService.deleteAccountData` (`src/lib/syncService.ts:169`).

### P2 — `scheduleSync` fires even when the mutation was a no-op
`src/store/useAppStore.ts:587-604`

`recordDailyActivity` returns `{}` when `lastActiveDate === today`, but
`scheduleSync(...)` runs unconditionally after the `set`. Every app open on the
same day queues a full-payload push. Same shape in `recordSceneProgress`
(`:654-660`) — though that one doesn't sync, so it's harmless there.

### P2 — `applyRatingToCard('learning')` records neither correct nor incorrect
`src/engine/srsEngine.ts:82`

Mastery is computed as `correct >= 3 && correct/(correct+incorrect) >= 0.8`
(`src/store/useAppStore.ts:127`). A learner who rates everything "learning"
accumulates no signal at all — the card reschedules but never moves toward or
away from mastery. If that is intended, say so in the doc comment; right now the
comment only describes intervals and ease, so the omission reads as an oversight.

### P2 — CLAUDE.md's documented engine signatures no longer match the code
`CLAUDE.md` (Scenario Engine Rules) vs `src/engine/scenarioEngine.ts`

| Documented | Actual |
|---|---|
| `getTone(state, scene)` | `getTone(state, npcId, scene)` (`:97`) |
| `resolveNextScene(state, scene, choice)` → `string \| undefined` | `resolveNextScene(state, choice, script)` → `string \| null` (`:114`) |
| `isChoiceVisible(state, choice)` | `isChoiceVisible(choice, state)` (`:164`) |

Argument order is *swapped* in `isChoiceVisible`, which is the kind of drift that
produces a silently-wrong call rather than a type error if the two params ever
share a type. Update CLAUDE.md.

### P3 — `addDays` mixes UTC parsing with local mutation
`src/engine/srsEngine.ts:28-32`

`new Date('YYYY-MM-DD')` parses as UTC midnight, `setDate`/`getDate` operate in
local time, and `toISOString()` formats back in UTC. For a fixed UTC offset the
three cancel out exactly, so this is **correct today** and correct in the UAE.
It stops being correct across a DST transition (the offset changes between parse
and format, shifting the result by an hour and potentially a day). Not a bug for
the target market; worth a comment, or worth building the string with the same
local-parts approach `todayISO` uses, so nobody "fixes" one half later.

### P3 — `evaluateEnding` throws inside a render-triggered path
`src/engine/scenarioEngine.ts:149` throws when a script has no non-secret
endings. It is called from a `useEffect` in `ScenarioPlayer.tsx:301`. There is a
top-level `ErrorBoundary`, so this degrades to "app-wide error screen" rather
than a white screen — but a content-authoring mistake taking down the whole app
is a harsh failure mode. The invariant is better enforced in
`scenarioContent.test.ts` (which already exists) than at runtime.

---

## Batch 2 — Routes (`app/**`)

### P1 — Feature gates read a stale value and never re-render
`app/(tabs)/library.tsx:7-13`, `app/practice.tsx:10-11,27-28`

```ts
const hasFullAccess = useAppStore((s) => s.hasFullAccess);      // stable fn ref
const scenariosCompletedCount = useAppStore((s) => s.scenariosCompletedCount);
...
<FeatureGate hasAccess={hasFullAccess()} scenariosCompleted={scenariosCompletedCount()} />
```

The selector returns the action's identity, which never changes, so the component
is **not subscribed to `completedScenarios`**. The Library tab stays mounted
across tab switches, so after the learner finishes their 3rd scenario the tab
keeps showing the locked state until the app is restarted. Subscribe to the data
instead: `useAppStore((s) => Object.keys(s.completedScenarios).length)` and derive,
or call `useAppStore.getState()` inside a value that *is* subscribed.

(The Practice route is `router.push`ed fresh each time, so it remounts and mostly
gets away with it — but it has the same shape.)

### P1 — Daily streak silently stops being recorded if sign-in-time sync rejects
`app/index.tsx:37-42`

```ts
void loginPurchasesUser(userId)
  .then(() => syncFromCloud())
  .then(() => { recordDailyActivity(); checkMilestones(); });
```

No `.catch()`. If `loginPurchasesUser` rejects (RevenueCat unreachable, no
network, simulator) the chain stops and `recordDailyActivity()` never runs — the
user opens the app, practices, and loses their streak. The comment explains *why*
the ordering exists but the ordering is exactly what makes the failure total.
Chain a `.catch(captureError)` that still runs the two local calls.

### P1 — `__DEV__` access bypass shipped in the Library tab only
`app/(tabs)/library.tsx:12` — `hasAccess={__DEV__ || hasFullAccess()}`

`app/practice.tsx:27` gates the same entitlement with a bare `hasFullAccess()`.
One of the two is wrong. The `__DEV__ ||` also masks the stale-selector bug above
during development, so the gate is only ever exercised in release builds.

### P1 — Committed fallback credentials mean a misconfigured release still boots
`app/_layout.tsx:44-52`, `src/lib/supabase.ts:5-6`

Both Clerk and Supabase fall back to hardcoded production-looking values with a
`console.warn` when the env var is missing. A release build with a broken EAS
secret will therefore start up and quietly talk to the fallback project instead
of failing. Publishable/anon keys are safe to expose — the problem is the silent
fallback, not the key. Make it `if (!__DEV__ && !process.env.X) throw new Error(...)`.

### P2 — Hardcoded UI copy next to correct `STRINGS` usage
`app/(tabs)/profile.tsx:26-28`

`'Sign out?'` and `'Your progress is saved in the cloud…'` are inline, two lines
above `const D = STRINGS.profile.deleteAccount;`. Move both to
`STRINGS.profile.signOut`.

### P2 — Scenario route never validates `id`
`app/scenario/[id].tsx:38,54` casts `id as string` and hands it straight to
`ScenarioDetailScreen` / `ScenarioPlayer`. A stale deep link or a typo produces
an unknown id. Verify both screens render an empty state rather than dereferencing
`undefined` (flagged for batch 5).

### P3 — Inconsistent route hrefs for the same destination
`app/(tabs)/index.tsx:11` uses `/profile`; `app/(tabs)/library.tsx:16` and
`app/practice.tsx:31` use `/(tabs)/scenarios`. Both forms resolve, but pick one.

### P3 — `SplashScreen.preventAutoHideAsync()` / `hideAsync()` unawaited
`app/_layout.tsx:60,81`. Both return promises; a rejection here is an unhandled
rejection. `void ...catch(() => {})` is the usual Expo idiom.

### P3 — Trivial pass-through handlers
`app/practice.tsx:13-23` wraps three store actions in identically-shaped
one-liners. Pass the actions directly.

---

## Batch 3 — Services (`src/lib/`)

### P0 — Any client can read or write any user's row
`src/lib/syncService.ts:14-18`, `supabase/migrations/003_rls.sql:26-34`

RLS is disabled (Option A is the one actually applied) and `user_id` is supplied
by the client. Combined with the anon key committed at `src/lib/supabase.ts:6`,
anyone who unpacks the APK can `select * from user_data` and read every user's
name, profession, goals, journal entries, and subscription status — and overwrite
them. The file's own header calls this out and calls it "acceptable for launch",
so this is a **known, accepted risk being re-flagged**, not a discovery: it needs
a decision with a date on it, because "before significant user growth" is not a
trigger anyone will notice passing.

Note also that `src/lib/supabase.ts:15-17` describes the *Option B* world ("RLS
policies can read the Clerk user id via `auth.jwt()->>'sub'`") as if it were
current. Two files, two opposite descriptions of the live security posture.

### P1 — Cloud payload is written into state without validation
`src/lib/syncService.ts:111` → `src/store/useAppStore.ts:384`

`pullProgress` declares its return as `CloudUserData` (so `stats: UserStats`) but
actually returns `data.stats ?? {}`. `data` is untyped from supabase-js, so
TypeScript never checks it — `{}` satisfies nothing but is returned as `UserStats`.
`syncFromCloud` then does `stats: data.stats ?? s.stats`; `{}` is truthy, so it
replaces good local stats. The very next call in `app/index.tsx:41` is
`checkMilestones()`, which does `s.stats.scenariosCompleted.length` →
`TypeError: Cannot read property 'length' of undefined`, i.e. a crash on the first
screen after sign-in.

`stats JSONB NOT NULL DEFAULT '{}'` (`001_initial_schema.sql:18`) means `{}` is
exactly what a row created by anything other than `pushProgress` contains — and
per the P0 above, "anything other than `pushProgress`" includes any third party.
Validate the shape (or at minimum `{ ...DEFAULT_USER_STATS, ...data.stats }`)
before it reaches the store.

### P1 — `schema_version` is read, then ignored
`src/lib/syncService.ts:102-105`

The comment says "we treat null as version 1 and let the caller decide what to do
with it". No caller decides anything — `syncFromCloud` never reads
`data.schema_version`. A v1 row is consumed as though it were v2, which is the
exact scenario the constant exists to prevent. Either branch on it or delete the
guard so it stops reading as protection that isn't there.

### P1 — Invented community statistics are presented to users as real
`src/lib/syncService.ts:129-146,252-253`

`ENDING_STAT_SEEDS` returns fabricated distributions ("34% exceptional, 41%
success…") whenever the table is empty, and the UI renders them as community
data. The comment frames this as a display convenience, but the learner cannot
tell seeded numbers from real ones. Either label them ("typical outcomes") or show
nothing until there is real data. This is a product-integrity call, not a code
one — flagging it for a decision.

### P2 — The learner's name reaches Sentry, and the privacy inventory says it doesn't
`app/onboarding.tsx:23-29`, `src/lib/analytics.ts:61-69`

`trackOnboardingCompleted({ name: profile.name, ... })` puts the learner's
display name (plus role, mode, goals) into a Sentry breadcrumb, which is attached
to every crash report for the rest of the session.

`docs/privacy-data-inventory.md:69-73` states: *"No user identity is attached
today. `identifyUser()` exists in `analytics.ts` but is never called anywhere."*
The second sentence is accurate — `identifyUser` and `resetIdentity` are dead
code, never called from `app/` or `src/`. The first sentence is not: identity
arrives through the breadcrumb payload instead of through `Sentry.setUser`. The
inventory's breadcrumb list ("onboarding started/completed…") names the events
but not the fields inside them.

Either drop `name` from the event, or update the inventory and the privacy
policy. Also delete `identifyUser`/`resetIdentity` or wire them up — right now
they are unused API surface that the privacy doc reasons about as if it were the
whole story.

### P2 — `getChoiceStats` percentages need not sum to 100
`src/lib/syncService.ts:207-212` rounds each share independently. With three
choices at 33.33% the UI shows 33/33/33. Use a largest-remainder pass, or render
"33%" without implying the set is exhaustive.

### P3 — `pushProgress` doc comment contradicts its signature
`src/lib/syncService.ts:52` says "Silent on error", but the function returns
`{ error }` and `syncToCloud` surfaces it in `lastSyncError`. Stale comment.

---

## Batch 4 — Services (`src/lib/` remainder)

### P1 — The documented paywall fallback chain is unreachable
`src/lib/purchases.ts:216-253`, `src/store/useAppStore.ts:514-532`, `app/onboarding.tsx:39-57`

`presentPaywall` and `presentPaywallIfNeeded` are the only two functions in
`purchases.ts` **without** a `try/catch` — every other one treats "not
configured / no store" as a normal case and returns a safe default. But
`configurePurchases()` deliberately skips `Purchases.configure()` when the API
key is missing (`:63-76`), which is exactly when `RevenueCatUI.presentPaywall()`
rejects.

`app/onboarding.tsx` then does:

```ts
const paywallResult = await presentPaywall();   // ← rejects here
if (paywallResult.purchased) { ... }
const { cancelled, error } = await purchaseSubscription(plan);  // never runs
if (error) startTrial(plan);                                    // never runs
```

The comment above that block describes a 3-step fallback ending in "grant a local
trial so the user isn't blocked". Step 1 throwing takes out steps 2 and 3, so
tapping **Start Free Trial** on a build without RevenueCat keys does nothing
visible and raises an unhandled rejection. Wrap both paywall functions in
`try/catch` returning `{ purchased: false, restored: false, cancelled: true }`.

### P1 — `NOT_PRESENTED` is treated as a successful purchase
`src/lib/purchases.ts:226-228`

```ts
case PAYWALL_RESULT.NOT_PRESENTED:
  // User already has entitlement — treat as "purchased"
  return { purchased: true, ... };
```

Already having the entitlement is only *one* reason RevenueCat returns
`NOT_PRESENTED` — a missing/misconfigured paywall on the offering returns it too.
The store then does `if (result.purchased) set({ subscriptionStatus: 'subscribed' })`
and pushes that to the cloud (`useAppStore.ts:524-532`), so a dashboard
misconfiguration grants and *persists* free Pro access. Check
`getEntitlementStatus()` instead of inferring from the enum.

### P1 — Simulated dev purchases are persisted and pushed to the cloud
`src/lib/purchases.ts:175-180` → `src/store/useAppStore.ts:495-502`

```ts
if (!pkg) {
  if (__DEV__) return { status: 'subscribed', cancelled: false, error: null };
```

`purchaseSubscription` writes `subscriptionStatus: 'subscribed'` into persisted
state **and calls `syncToCloud()`**. So testing the paywall in a dev build writes
`subscription_status = 'subscribed'` to that Clerk user's real Supabase row; a
later release build pulls it back down via `syncFromCloud` and grants permanent
free Pro. The simulation is a good idea, but it must stay local — return the
simulated result without letting it reach `syncToCloud`, or gate the whole
subscription row on `__DEV__`.

### P2 — Notification copy is hardcoded, next to correct `STRINGS` usage
`src/lib/notifications.ts:142,187-188,210-211,271-278`

`scheduleStreakRiskIfNeeded` correctly uses `STRINGS.streakRisk.notificationTitle` /
`.notificationBody` (`:248-249`). Every other notification in the same file
inlines its copy — including the Arabic titles `'يلا! 🇦🇪'` and `'الأسبوع مر! 😮'`
and the whole `buildDailyBody` ladder. This is user-facing copy in a
learner-facing language; it belongs in `STRINGS` like everything else.

### P2 — `any` in catch clauses
`src/lib/purchases.ts:184,198`. Same rule as `useAppStore.ts:340`. `err?.userCancelled`
also relies on an untyped property — RevenueCat exposes `PurchasesError`; narrow to it.

### P3 — Date-only strings parsed as UTC then mutated locally (2nd occurrence)
`src/lib/notifications.ts:165,179-181,202-204`

`lastActiveDateISO` is a `YYYY-MM-DD` string from `todayISO()`, so
`new Date(lastActiveDateISO)` anchors at **UTC** midnight; `.setHours(9,0,0,0)`
then sets a **local** wall clock. In UTC+4 the two land on the same calendar day,
so this is correct for the target market. West of UTC it schedules the D3/D7
re-engagement a day early. Same root pattern as `srsEngine.addDays`
(Batch 1, P3) — worth one shared date helper rather than two independent
UTC/local mixes.

### P3 — `setupNotifications` fires an unawaited async call at module load
`src/lib/notifications.ts:59-65`, called from `app/_layout.tsx:58`.
`setNotificationChannelAsync` returns a promise that is neither awaited nor
`.catch`ed, at import time. Add `.catch(() => {})`.

### P3 — `shouldShowAlert` is deprecated
`src/lib/notifications.ts:51-56` sets `shouldShowAlert` alongside its
replacements `shouldShowBanner` / `shouldShowList`. Harmless today; drop it.

### P3 — Permission is requested cold, on every launch
`src/lib/notifications.ts:78-85` ← `app/index.tsx:46`

`initNotifications()` runs unconditionally on every signed-in launch and prompts
for notification permission with no in-app pre-prompt explaining why. The
`existing === 'denied'` guard prevents re-prompting after an explicit denial, but
a user who dismisses the OS sheet without choosing stays `undetermined` and is
re-prompted every launch — which on Android 13+ burns the two-dismissal budget
and permanently auto-denies. A soft pre-prompt tied to a moment the user cares
about (first streak, first due review) converts far better.

### P3 — Platform guard repeated six times
`src/lib/haptics.ts:11,18,25,32,39,46` — identical
`if (Platform.OS === 'ios' || Platform.OS === 'android')` in every method.
Hoist to a module-level `const SUPPORTED = Platform.OS !== 'web';`.

---

## Batch 5 — Scenario screens + TTS

### P1 — "Bonus" scenes are shown to every player, and the secret-ending gate is dead code
`src/screens/ScenarioPlayer.tsx:421-438`, `src/types/index.ts:153`, `src/constants/scenarios.ts:526`

`ScenarioScene.bonus` is documented as *"True if this is a bonus scene only shown
for secret ending."* The gate in `next()` is:

```ts
const isOnBonusScene = scenes[step]?.bonus === true;
if (!isOnBonusScene && nextStep >= scenes.length && ...) { /* jump to bonus */ }
```

But the bonus scene **lives inside `scenes[]`**, so `scenes.length` counts it. Walk
the gym script (`scene1 … scene6`, `scene7-bonus` at the last index):

- At `scene6` (index 5 of 7): `nextStep = 6`, `6 >= 7` is false → the secret gate
  is skipped entirely → linear progression advances to index 6, **the bonus scene**.
- At the bonus scene: `isOnBonusScene` is true → gate skipped → `nextStep = 7 >= 7`
  → result screen.

So the bonus scene plays unconditionally for everyone, and the flag/score check
that was supposed to earn it never executes on any path. Fix by excluding
`bonus` scenes from linear progression (`const mainScenes = scenes.filter(s => !s.bonus)`)
and indexing the gate against that list.

### P1 — Deep-linking an unknown or gender-restricted scenario shows a blank screen
`src/screens/ScenarioDetailScreen.tsx:38`

```ts
if (!scenario || !script || !isScenarioAvailableFor(scenario, userGender)) return null;
```

`app/scenario/[id].tsx` renders this as a full-screen route with no fallback of
its own, so the user gets an empty background with no back affordance — the route
was pushed, so the header is hidden too. `ScenarioPlayer.tsx:479-491` handles the
identical condition correctly with an `EmptyState` plus a "Go back" button. Reuse
that. This is the concrete form of the deep-link risk flagged in Batch 2.

### P1 — The entire scenario corpus is rebuilt on every render of two screens
`src/screens/ScenarioPlayer.tsx:212-213`, `src/screens/ScenarioDetailScreen.tsx:26-27`

`getScenarioScripts` (`scenarios.ts:222`) is an arrow function returning a ~1,140-line
object literal; `getAllScenarios` (`:184`) spreads three more builders. Both
screens call them **directly in the render body**, unmemoized:

```ts
const scriptData = getScenarioScript(scenarioId, C);   // rebuilds every script
const scenario   = getScenarioById(scenarioId, C);     // rebuilds every scenario, then .find()
```

Beyond the allocation cost on every state change, this destroys downstream
memoization: `scenes` (`useMemo` on `scriptData?.scenes`), `culturalJourneyNotes`
(`useMemo` on `[activeScenarioState, scriptData]`), and the completion `useEffect`
(dep list includes `scriptData`) all see a fresh reference every render and
re-run.

`HomeScreenNew.tsx:105-119` and `ScenariosScreen.tsx:404-414` already do this
correctly with `useMemo`. Apply the same treatment here.

### P2 — The memo-dependency comments in the two screens that *do* memoize are wrong
`src/screens/HomeScreenNew.tsx:116-118`, `src/screens/ScenariosScreen.tsx:411-413`

Both carry an `eslint-disable-next-line react-hooks/exhaustive-deps` justified by:
*"C is a new object reference each render but isDark only changes on theme switch."*

That premise is false. `useTheme` returns `isDark ? darkTheme : lightTheme`
(`useTheme.ts:17`), and both are module-level `const` objects
(`tokens.ts:94,172`). `C` is already referentially stable and flips exactly when
`isDark` does. The disable and the substitution are unnecessary — just depend on
`[C, ...]` and delete the comment, before it gets copy-pasted somewhere the
premise actually matters.

### P2 — Completed scenarios never unlock their phrases
`src/screens/ScenarioPlayer.tsx:517-519` vs `src/store/useAppStore.ts:721-729`

`ScenarioPlayer` computes `unlockedPhrases` and the result screen presents them as
unlocked, but **`unlockPhrase()` is never called** from the scenario flow. The only
call site in the whole app is `OnboardingFlow.tsx:1141`. So
`unlockedPhraseIds` only ever contains the onboarding phrases, and
`PhraseLibrary.tsx:138,204` withholds the unlocked badge from every phrase the
learner actually earned by finishing a scenario. Either call `unlockPhrase` in
the completion effect, or drop the concept — right now it half-exists.

### P2 — Pre-rebrand jade green survives in five files
`src/components/features/KafMascot.tsx:17,245` · `src/components/features/CategoryIllustrations.tsx:205,215,234-236,344-349` · `src/components/features/PhraseBuilder.tsx:227` · `src/components/features/RoleGoalIcons.tsx` (13 default params) · `src/screens/ScenarioDetailScreen.tsx:136`

Every `JADE*` token is now gold (`JADE: '#D6A24C'`, `JADE_ACCENT: '#EAC57C'`,
`tokens.ts:107-116`), but `#02B986` / `#3BD4A0` — the old neon jade — is still
hardcoded in ~30 places. This branch's own recent commits are
*"sweep leftover neon-green/cyan brand colors to gold"*, so this is what the sweep
missed. Live and user-visible:

- **`KafMascot.tsx:17`** — `bodyPrimary = mood === 'happy' ? '#3BD4A0' : '#02B986'`.
  The mascot is green. Not overridable by a prop.
- **`CategoryIllustrations.tsx`** — SVG `stopColor` / `stroke` / `fill` literals.
- **`ScenarioDetailScreen.tsx:136`** — locked/unplayed scene chips render green
  next to `C.JADE_DIM` gold ones, in the same row.
- **`PhraseBuilder.tsx:227`** — green `shadowColor`.

The 13 `RoleGoalIcons` defaults are currently harmless — every call site passes an
explicit `color` (`OnboardingFlow.tsx:406,622,722`) — but they are a loaded gun for
the next caller who omits it.

### P2 — The scene list looks like a chapter picker but every row starts from scene 1
`src/screens/ScenarioDetailScreen.tsx:115-121` → `app/scenario/[id].tsx:56`

`onSceneSelect(index)` passes the tapped scene index; the route signature is
`onSceneSelect: (sceneIndex: number) => void` — and the route discards it
(`onSceneSelect={() => setShowPlayer(true)}`). `ScenarioPlayer` always boots at
`scenes[0]`. The lock/check/play iconography (`:116-117,141-147`) therefore
communicates resumable per-scene progress that does not exist. Either wire the
index through to `startScenario`, or render the list as non-interactive progress.

### P2 — Hardcoded user-facing copy across both screens
`ScenarioPlayer.tsx:140` (`'Your choices shaped this response'` / `'Your choices echo here'`),
`:450-455` (the whole share-sheet message template, including the tagline and
hashtags), `:545` (`'Exit scenario'`), `:600-601` (`'Playing audio'` / `'Listen to choice'`).
`ScenarioDetailScreen.tsx:68` (`'Remove from saved scenarios'` / `'Save scenario'`),
`:92` (`Scenes`), `:152` (`Scene NN`).

Both files import and use `STRINGS` correctly elsewhere in the same render, so
this is drift rather than an unaware author. The share template is the one that
matters most — it is marketing copy that ships to social feeds.

### P2 — `evaluateEnding` runs on every render, in every phase
`src/screens/ScenarioPlayer.tsx:504-508`

```ts
const ending = finalizedEnding ?? (activeScenarioState && scriptData ? evaluateEnding(...) : ...);
```

This is render-body, not memoized, and not gated on `phase === 'result'` — so it
sorts a copy of the endings array on every render during intro and every scene.
It is also the function that `throw`s on malformed content (Batch 1, P3), so a bad
script takes down the ErrorBoundary from the intro screen rather than at the end.
Wrap in `useMemo` gated on phase.

### P2 — Bootstrap effect can leave the player permanently dead
`src/screens/ScenarioPlayer.tsx:245-251`

```ts
useEffect(() => {
  if (scriptData && isScenarioAvailableFor(scenario ?? {}, user?.gender)) {
    startScenario(scenarioId, scriptData.scenes[0].id);
  }
}, []);   // eslint-disable-next-line react-hooks/exhaustive-deps
```

Empty deps, so this reads `user` exactly once at mount. Nothing gates this route
on `_hydrated` (only `app/index.tsx` does), so on a deep link or a fast
navigation `user` can still be `null` — `user?.gender` is `undefined`, a
gender-restricted scenario fails `isScenarioAvailableFor`, and no run is created.
The render path re-evaluates the same condition with the now-hydrated user and
happily renders the player, but `activeScenarioState` is `null`, so
`handleChoice` returns at its first guard (`:365`) and **every choice tap does
nothing, forever**. Add `user?.gender`/`_hydrated` to the effect, or retry when
`activeScenarioState` is null and the scenario is playable.

### P3 — One unguarded `setTimeout` among several guarded ones
`src/screens/ScenarioPlayer.tsx:381` — `setTimeout(() => setPhase('choice-result'), 600)`
has no ref and no cleanup, while the two TTS timers in the same component
(`:227-228,238-244`) are carefully ref-tracked and cleared on unmount. Exiting
within 600 ms of a choice sets state on an unmounted tree.

### P3 — `as any` on an animated style
`src/screens/ScenarioPlayer.tsx:62` — `width: \`${pct * 100}%\` as any`. The
project bans `any`; Moti accepts `DimensionValue`, so the cast can be typed
properly or the value computed as a number.

### P3 — Loop variable shadows an outer binding
`src/screens/ScenarioPlayer.tsx:344-352` — `scenes.forEach(scene => ...)` shadows
the outer `const scene = scenes[step]` (`:328`). Harmless today, confusing to read.

### Reviewed and found sound

`src/hooks/useArabicTTS.ts` — the one file in this batch with no findings.
Unmount cleanup calls `Speech.stop()` and clears the timer (`:138-143`), the 15 s
safety timeout is re-armed for the `ar` fallback path rather than left to expire
early (`:87-92`), and voice selection degrades to pitch differentiation when no
Arabic voice exists. Worth noting the module-global coupling: `ScenarioPlayer` and
its child `DialogueBubble` each instantiate the hook, and `Speech` is a singleton,
so one instance's `stop()` silences the other's audio. Currently benign because
`onStopped` clears the other instance's `isSpeaking`, but it is the reason a third
concurrent instance would misbehave.

---

## Batch 6a — Home + Scenarios screens

### P0 — Locked scenarios are inert and are described as unwritten
`src/screens/ScenariosScreen.tsx:200-203`, `:583-628`

Two things combine into a monetization dead-end:

1. `ScenarioCard`'s Pressable is `disabled={locked || !!comingSoon}` (`:200`).
   Tapping a paywalled card does **nothing** — no paywall, no explanation, no
   upgrade prompt. `presentPaywall()` exists in the store and is wired into
   Profile, but never reached from the place the user actually feels the limit.
2. The footer that appears when `lockedCount > 0` reads
   *"{lockedCount} more scenarios coming soon"* / *"We are writing the next
   conversations now."* (`:610-616`). Those scenarios are **written and shipping** —
   they are subscription-locked. `Scenario` already has a separate `comingSoon`
   field for genuinely unwritten content, and this footer ignores it.

So a user who has hit the limit is told the content does not exist yet, and is
never asked to subscribe. Route locked-card taps to `presentPaywall()` and
reserve the "coming soon" copy for `comingSoon` scenarios.

### P1 — Third instance of the stale-selector gate bug
`src/screens/ScenariosScreen.tsx:398,417-429`

```ts
const hasScenarioAccess = useAppStore((s) => s.hasScenarioAccess);   // stable fn
const displayScenarios = useMemo(() => { ... hasScenarioAccess(index) ... },
  [allScenarios, filterTab, favoriteScenarios, hasScenarioAccess]);  // ← never changes
```

Neither the selector nor the memo depends on `subscriptionStatus` or
`completedScenarios`, so the grid does not re-lock or unlock when either changes.
Buy a subscription from the Profile tab, come back, and every card is still
locked until the screen remounts.

With `app/(tabs)/library.tsx:7-13` and `app/practice.tsx:10-11` (Batch 2), that is
**three independent sites with the same defect**. This is a pattern problem, not
three bugs: `hasFullAccess`, `hasScenarioAccess` and `scenariosCompletedCount`
are getters on the store, and pulling a getter through a selector never
subscribes to what it reads. Either expose them as derived values
(`useAppStore((s) => s.subscriptionStatus)` + a pure helper) or document that
every call site must also subscribe to the underlying fields.

### P1 — The week strip can show a checkmark for a day that hasn't happened
`src/screens/HomeScreenNew.tsx:39-60`

The strip is Monday-first (`days = ['Mon' … 'Sun']`), and `jsDay = (idx + 1) % 7`
correctly maps Sunday to `0`. But "is this day in the past" is then tested with
`jsDay < todayJsDay`, and the date is computed as `addDays(todayIso, jsDay - todayJsDay)`.

For Sunday, `jsDay = 0`, so on any weekday it is *always* `< todayJsDay` and its
date is computed as **negative days from today** — i.e. last week's Sunday. On a
Wednesday, the "Sun" pill therefore describes the Sunday three days *ago*, and
renders `done` whenever that date falls inside the streak window. In a Monday-first
week, this week's Sunday is four days in the *future*.

The comment directly above says *"never display unearned checkmarks"* — which is
exactly what the Sunday cell does. Compute each cell's date from the Monday of the
current week rather than from `jsDay - todayJsDay`.

### P1 — The daily XP goal is measured against a lifetime total
`src/screens/HomeScreenNew.tsx:92-93,237-241`

```ts
const totalXP = stats.scenariosCompleted.length * 50;   // lifetime
const goalXP  = user?.dailyGoalXP ?? 500;               // per day
<StreakWidget currentXP={totalXP} goalXP={goalXP} ... />
```

`computeDailyGoalXP` (`onboardingProgress.ts:35-46`) is explicitly documented as an
*"Adaptive **daily** XP goal"*, and `UserStats` has no XP field at all — the number
is derived from lifetime scenario count. So the ring fills permanently once a
learner has completed 10 scenarios (500 XP at the default goal) and never resets
at midnight. The daily-goal mechanic, and the onboarding question that sizes it,
currently do nothing after the first two weeks. Either track XP per day in
`UserStats`, or stop presenting it as a daily goal.

### P2 — Two more fabricated numbers shown as real
`src/screens/HomeScreenNew.tsx:281-282`

```tsx
{/* TODO: Replace with real count from API */}
<CommunityBar count={47} location="Dubai" />
```

47 learners, in Dubai, for every user regardless of where they are. Same class as
`ENDING_STAT_SEEDS` (Batch 3). At minimum the location should come from the
profile; ideally the bar is hidden until there is a real number.

### P2 — `ImpactMetrics` means two incompatible things
`src/types/index.ts:76,103,119` vs `src/screens/ScenariosScreen.tsx:167`

- `Scenario.impactPreview: ImpactMetrics` holds **percentages** (`{trust: 75, respect: 60, culture: 80}`, `scenarios.ts:19`) and is rendered with a `%` suffix.
- `ScenarioChoice.impact?: ImpactMetrics` holds **point deltas** (`-2`…`+3`), summed by the engine into `ImpactDelta`.

One type alias, two units, plus a third structurally-identical type (`ImpactDelta`,
`:226-230`) for the accumulated form. Nothing stops a preview percentage being
passed where a delta is expected. Split into `ImpactPercent` and `ImpactDelta` and
drop `ImpactMetrics`.

### P2 — ~40 user-facing strings hardcoded across the two screens
`HomeScreenNew.tsx:203,253,261,273,279` (all five section headings), `:217`
(accessibility label).
`ScenariosScreen.tsx:74-81` (`MOTIVATIONAL_HEADINGS`, 6 × text + sub), `:85-110`
(`FUN_FACTS`, **25 strings**), `:443-447` (tab labels), `:570-576` (three empty
states), `:611-624` (footer copy + "Soon").

This is the biggest concentration of `STRINGS`-rule violations found so far. The
`FUN_FACTS` list in particular is content, not chrome — it is the kind of thing
that gets reviewed, translated, or corrected, and it is buried in a screen file.

### P2 — `any` cast smuggles a dead FlashList prop
`src/screens/ScenariosScreen.tsx:534` — `{...({ estimatedItemSize: 222 } as any)}`.
The project is on `@shopify/flash-list@2.0.2`, where `estimatedItemSize` was
removed; the cast is what lets a now-meaningless prop compile. Combined with
`BENTO_HEIGHTS` giving cells two different heights (`:63`) in a `numColumns={2}`
grid, it is worth confirming the grid still measures correctly rather than leaving
a cast that hides the API change.

### P2 — Per-render allocations in the list path
`src/screens/ScenariosScreen.tsx:189` — `getCardPalettes(C)` builds a fresh
6-element array of objects inside **every card**, on every render and every
FlashList cell recycle. Hoist it to a `useMemo` in the parent or a module-level
map keyed by theme.
`:432-436,440-444` — `gridData` and `TABS` are rebuilt each render; `gridData` is
FlashList's `data` prop, so a new identity every render defeats its bail-outs.

### P3 — Unused prop kept in the public signature
`src/screens/ScenariosScreen.tsx:393` — `{ user: _user, onScenarioSelect }`. The
component reads mode and gender from the store instead. `app/(tabs)/scenarios.tsx:6-10`
still selects `user` from the store purely to pass it in. Delete both.

### P3 — "Recommended" is not a recommendation
`src/screens/ScenariosScreen.tsx:424` — `if (filterTab === 'recommended') return !s.locked;`
It is "All, minus locked". Its empty state (`:574`) says *"All scenarios coming
soon!"*, which can never be true while the first three are free.

### P3 — Uncleaned timer and non-reactive time check
`HomeScreenNew.tsx:247` — `setTimeout(() => setStreakMood('happy'), 3000)` with no
cleanup. `:97` — `new Date().getHours() >= 18` is evaluated during render, so the
streak-risk banner will not appear for a session that is already open at 18:00.

### P3 — Two hardcoded hexes in a themed gradient
`src/screens/ScenariosScreen.tsx:451` — `colors={['#241C13', '#14100B', C.JADE]}`.
The `LOCK_SCRIM_*` constants at `:57-69` are hardcoded too, but carry a clear
comment explaining they must stay theme-invariant. The header gradient has no such
rationale, and mixes literals with a token in one array. Same file also mixes
`C.WHITE` with `'rgba(255,255,255,0.9)'` for the same ink (`:326,335`).

### P3 — Count stored as a display string
`src/types/index.ts:85` — `phrases: string`, holding `'8'` or `'25+'`
(`scenarios.ts:13,46`). The string type is deliberate (some values aren't numbers),
but the field name reads as a count and is rendered as `{phrases} Phrases`. Rename
to `phrasesLabel`.

---

## Batch 6b — PhraseLibrary + PracticeScreen

### P0 — Every flashcard rating is written twice, and the second write corrupts the first
`src/screens/PracticeScreen.tsx:373-376`

```ts
// 3-tier SRS scheduling (1/3/7 days)
onPhraseRating?.(deck[current].id, rating);
// Also record binary for backward compat (milestones, category mastery)
onPhraseReview?.(deck[current].id, rating === 'knew');
```

Both callbacks write the same card, in order, through the store
(`recordPhraseRating` → `applyRatingToCard`, then `recordPhraseReview` →
`updateReviewCard`). The second read picks up the card the first one just wrote,
so the binary update **overwrites the 3-tier schedule**:

| Rating | `applyRatingToCard` sets | then `updateReviewCard` turns it into | Net |
|---|---|---|---|
| `knew` | interval 7 (or `interval × ease`), `correct + 1` | `correct = true` → `interval × ease` again, `correct + 1` again | interval ~2× too long, **correct counted twice** |
| `learning` | interval **3**, ease unchanged, no counters | `correct = false` → interval **1**, `ease − 0.2`, `incorrect + 1` | "I'm still learning this" is recorded as **a wrong answer** |
| `new` | interval 1, `ease − 0.2`, `incorrect + 1` | `correct = false` → `ease − 0.2` again, `incorrect + 1` again | ease drops 2×, **incorrect counted twice** |

The stated reason — *"backward compat (milestones, category mastery)"* — does not
hold: `recordPhraseRating` (`useAppStore.ts:629-638`) already runs the identical
`computeMastery(newReviews)` pass and writes `phrasesStudied`, `phrasesMastered`
and `categoryMastery`, exactly as `recordPhraseReview` does. The second call buys
nothing and costs the entire 3-tier scheduling model plus the accuracy ratio that
drives the "mastered" milestone.

Delete the `onPhraseReview` call from `rateCard`. (Related: Batch 1 noted that
`applyRatingToCard('learning')` records neither correct nor incorrect — that is
true of the pure function; this double-write is *why* it never showed up as a
problem in practice, because the binary call was silently supplying an
`incorrect`.)

### P1 — Quiz distractors can be identical to the correct answer
`src/screens/PracticeScreen.tsx:314-328,395-411`

```ts
const others = PHRASES.filter((p) => p.id !== correct.id);   // filtered by id
const options = shuffle([correct.roman, ...wrong.map((w) => w.roman)]);
...
const isCorrect = answer === deck[current].roman;            // compared by string
```

Distractors are excluded by **id** but the answer is checked by **string**, and the
136-phrase library contains genuine duplicates of both compared fields:

- `arabic` (reverse quiz) — 7 duplicated strings, including `السلام عليكم`,
  `صباح الخير`, `صباح النور`, `شلونك؟`, `تشرفنا`, `ما قصرت`, `الله يعافيك`.
- `roman` (standard quiz) — includes `ahlan wa sahlan`, `shloonak?`, `tsharrafna`.

When the drawn phrase is half of such a pair, its twin can be selected as a
"wrong" option, so the user is shown the same answer twice with no way to choose
correctly, and the string comparison scores whichever they tap as correct. Dedupe
on the compared field: `PHRASES.filter(p => p.roman !== correct.roman)`.

### P1 — Two of the three practice modes ignore the SRS schedule
`src/screens/PracticeScreen.tsx:330-348` vs `:299-311`

`startFlashcards` builds an SRS-aware deck (due cards first, topped up with fresh
ones) under a comment saying *"This ensures the spaced-repetition schedule is
actually honoured."* `startQuiz` and `startReverseQuiz` both do
`shuffle(PHRASES).slice(0, DECK_SIZE)` — uniformly random over all 136 phrases.

Both then call `onPhraseReview`, which reschedules whatever they happened to draw.
So the quiz modes actively churn the SRS intervals of cards that were not due,
undoing the scheduling the flashcard mode maintains.

### P2 — A UI label is extracted by string-splitting formatted copy
`src/screens/PracticeScreen.tsx:427`

```ts
{ label: STRINGS.practice.correctCount(score.correct).split(' ')[1], value: score.correct, ... }
```

This calls the formatter to produce something like `"3 Correct"` and then splits on
whitespace to recover the word `"Correct"`. It breaks on any copy change that
alters word order or word count, and on any language where the number does not
lead. Add a plain `STRINGS.practice.correct` label instead — the two siblings on
the next lines (`STRINGS.practice.learning`, `.missed`) already do exactly that.

### P2 — The lint warning on `dueCount` is wrong; do not "fix" it
`src/screens/PracticeScreen.tsx:286`

```ts
const dueCount = useMemo(() => getDueReviews().length, [getDueReviews, phraseReviews]);
```

ESLint reports *"React Hook useMemo has an unnecessary dependency: 'phraseReviews'"*
(the single `exhaustive-deps` warning in the whole codebase). It is wrong here:
`getDueReviews` is a stable store action, so `phraseReviews` is the **only**
dependency that can ever invalidate this memo. Removing it would freeze the due
count for the life of the screen. Suppress with a comment explaining why, so the
next person to clean up lint warnings does not silently break it.

### P2 — Grid column width is frozen at module load
`src/screens/PhraseLibrary.tsx:20-23`

```ts
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COL_WIDTH = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;
```

Computed once at import, so the category bento grid does not respond to rotation,
split-screen, or foldable unfold — the cards keep the width they had when the JS
bundle loaded. `ScenarioDetailScreen.tsx:24` already uses `useWindowDimensions()`;
use that here.

### P2 — Two more memo-justification comments that are factually wrong
`src/screens/PhraseLibrary.tsx:305-306,373-374`

Both read: *"CATEGORY_CARD_CONFIG is a module-level constant — stable, safe to omit"*.
It is not module-level — it is `useMemo(() => getCategoryCardConfig(C), [C])` at
`:56`, a component-local memo. The omission is harmless in practice (it is stable
exactly when `C` is, and `C` is already in both dep arrays), but the stated reason
is false.

With `HomeScreenNew.tsx:116-118` and `ScenariosScreen.tsx:411-413` (Batch 5), that
is **four `eslint-disable` comments in three files justified by an incorrect claim
about referential stability**. Worth one pass to correct all four, because the next
person who copies the pattern into a case where it *does* matter will introduce a
real stale-closure bug and cite a comment as precedent.

### P2 — UI copy is used as a state sentinel
`src/screens/PhraseLibrary.tsx:57-58,80-82,433-435,466,472,491,496`

`cat` and `diff` are initialised to `STRINGS.phrases.filterAll` and compared
against it throughout to mean "no filter applied":

```ts
const [cat, setCat] = useState<string>(STRINGS.phrases.filterAll);
const matchCat = cat === STRINGS.phrases.filterAll || p.category === cat;
```

The display string is doing duty as an enum member. Change the copy — or localise
it — and the filter logic silently stops matching, leaving the library
permanently empty with no error. Use `null` or `'__all__'` for state and map to
copy only at render.

### P3 — Dead FlashList prop, second instance
`src/screens/PhraseLibrary.tsx:583` — `{...({ estimatedItemSize: 80 } as any)}`,
the same removed-in-v2 prop and the same `any` cast noted in
`ScenariosScreen.tsx:534`.

### P3 — Arabic search does no normalisation
`src/screens/PhraseLibrary.tsx:78` — `p.arabic.includes(search)` matches the raw
query against raw stored text. Case is irrelevant for Arabic, but diacritics and
alef variants (`ا`/`أ`/`إ`) are not folded, so a learner typing a form they saw
elsewhere gets no results. Low priority given the search box is Latin-first, but
worth a normalise-both-sides helper if Arabic input is expected.

### Reviewed and found sound

`PhraseLibrary` is the strongest screen reviewed so far: `STRINGS` used
consistently throughout (the only screen with no hardcoded copy findings), theme
config properly memoised on `C`, TTS timeout cleared on unmount (`:101-105`), and
`renderItem` correctly wrapped in `useCallback` with a complete dep list.
`QuizOption` (`PracticeScreen.tsx:205-290`) has real accessibility work —
`accessibilityState`, and a `stateLabel` that announces "correct answer" /
"your answer, incorrect" rather than relying on colour alone.

---

## Batch 6c — ProfileScreen + OnboardingFlow

### P0 — Legal URLs are empty; the app cannot pass store review
`src/constants/legal.ts:18-21`

```ts
export const LEGAL_URLS = { privacy: '', terms: '' } as const;
```

The file's own header says it: *"BOTH MUST BE FILLED IN BEFORE STORE SUBMISSION…
it will be rejected at review without one."* Fasih collects account details,
learning history and subscription state, so both Apple and Google require a
publicly reachable privacy policy URL.

The handling around it is good — `isLegalUrlSet` hides the rows rather than
rendering dead links (`ProfileScreen.tsx:88-99`), the sign-up screen does the
same, and there is a `__DEV__` warning at `:37-41`. So this is a tracked,
well-flagged blocker rather than an oversight. It is listed here because it is
the single highest-priority item in this document and nothing else in the review
supersedes it. `docs/privacy-data-inventory.md` already has the input a policy
needs.

### P1 — Swipe-back never works, and the comment cites a ref that does not exist
`src/screens/OnboardingFlow.tsx:274-296`

```ts
const composedGesture = useMemo(() => {
  ...
  const rightFling = Gesture.Fling().direction(Directions.RIGHT)
    .onEnd(() => { runOnJS(back)(); });
  ...
  // Gesture object created once — back/next accessed via stable refs (nextRef/backRef)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only create once
```

`next` is correctly routed through `nextRef` (`:261,268`). **`backRef` does not
exist** — grep the file. `back` is captured directly from the first render, where
its closure holds `step === 0`, so `if (step > 0)` is permanently false and
swiping right does nothing on any step of the 12-step flow. The `[]` dep list plus
the disable comment is what makes it compile silently.

This is the most misleading comment found in the review: it names the exact
mechanism that would have prevented the bug, as though it were in place.

### P1 — A first-time user completes onboarding without ever creating an account
`app/index.tsx:48-56` → `app/onboarding.tsx:19-31`

The auth gate sends a signed-out user with `hasOnboarded === false` straight to
`/onboarding` — the sign-up screen is never shown. `OnboardingFlow` contains no
router navigation and no Clerk sign-up call (it only *reads* `useUser()` to
prefill the name at `:141-146`), and `handleComplete` unconditionally does
`setHasOnboarded(true)` then `router.replace('/(tabs)')`.

So on first launch the user walks the full 12 steps — including both paywall
steps — and lands in the app with `clerkUserId: null`. Consequences:

- `syncToCloud` returns at its first line (`useAppStore.ts:317`), so **nothing is
  ever backed up**, silently.
- A trial or purchase made at step 9/11 is attached to an anonymous RevenueCat
  customer, because `loginPurchasesUser` only runs from the signed-in branch.
- On the **next** cold start, the gate now sees signed-out + `hasOnboarded` and
  redirects to `/sign-in` — the user is bounced out of an app they were using
  minutes earlier, with no explanation.
- Meanwhile the Profile tab renders a "Sign out" row for someone who never
  signed in.

`app/sign-up.tsx:404-410` has a `router.replace('/onboarding')` escape hatch, but
it is correctly wrapped in `__DEV__` and labelled "skip (dev only)" — so the
production path into anonymous onboarding is the auth gate itself. Either route
new users to `/sign-up` first, or add an account-creation step before `finish()`.

### P1 — The About row reports version 1.0 forever
`src/screens/ProfileScreen.tsx:92-93`

```ts
value: STRINGS.profile.version('1.0'),
onPress: () => Alert.alert(STRINGS.profile.aboutFasih, STRINGS.profile.version('1.0')),
```

Hardcoded in both places, while `expo-application` is already a dependency and
`app.json` carries the real version. Support and crash triage depend on the user
being able to read back which build they are on; this makes that impossible, and
it will silently stay "1.0" through every release.

### P2 — `useHold` is dead code, reimplemented inline with a different duration
`src/components/design/hooks.ts:56-103` vs `src/screens/OnboardingFlow.tsx:167,218-247`

`useHold` is exported and **never imported anywhere** in `app/` or `src/`.
`OnboardingFlow` implements the same hold-to-confirm interaction from scratch with
a raw `setInterval`, at `HOLD_DURATION = 2200` against the hook's default of
`2400`.

The dead hook is not inert: it is the source of two of the three
`react-hooks/refs` ESLint warnings and one `react-hooks/purity` warning, each with
its own `eslint-disable` comment reasoning carefully about gesture-callback
timing — 47 lines of defended code that nothing calls. Delete it, or adopt it in
`OnboardingFlow` and delete the inline copy.

### P2 — Notification status is read once and never refreshes
`src/screens/ProfileScreen.tsx:43-46,80-84`

```ts
useEffect(() => { getNotificationPermissionStatus().then(s => setNotificationsEnabled(s === 'granted')); }, []);
```

The row's `onPress` is `Linking.openSettings()` — its entire purpose is sending
the user out to change this permission. When they come back, the value is stale
until the screen unmounts and remounts, so the app says "Disabled" immediately
after they enabled it. Re-read on `AppState` `active`.

### P2 — Three more `any` casts
`src/screens/ProfileScreen.tsx:55,59` — `(STRINGS.onboarding.goals as any)[g]` and
`(STRINGS.onboarding.roles as any)[r]`, both to index a `STRINGS` sub-object by a
runtime key. `:296` — `setTheme(id as any)`. Type the lookups as
`Record<string, …>` and narrow the theme id to its union.

### P2 — Daily-goal thresholds duplicated from the engine
`src/screens/ProfileScreen.tsx:382-384` hardcodes `{ xp: 250 }`, `{ xp: 500 }`,
`{ xp: 750 }` — the exact values `computeDailyGoalXP` returns
(`onboardingProgress.ts:41-45`). Export them as named constants from the engine so
the picker and the inference cannot drift apart.

### P2 — Another unguarded read of `stats`
`src/screens/ProfileScreen.tsx:52` — `Object.values(stats.categoryMastery)`.
`Object.values(undefined)` throws. This is a third crash surface for the
`stats: {}` cloud payload flagged in Batch 3 (alongside `checkMilestones` and
`HomeScreenNew.tsx:92`), which reinforces validating that payload at the boundary
rather than defending at each site.

### P2 — A learner can never change their name
`src/screens/OnboardingFlow.tsx:181` — `name: name || 'Guest'`; ProfileScreen has
toggles for mode, gender, appearance and daily goal, but no name field and no
`setUser` call. Anyone who skips the name step is "Guest" permanently, and the
home header greets them that way every session (`HomeScreenNew.tsx:189`).

### P3 — Raw ISO dates rendered to users
`src/screens/ProfileScreen.tsx:236` (`m.dateReached`) and `:265` (`entry.date`)
print the stored `YYYY-MM-DD` strings directly into the milestone and journal
cards.

### P3 — Uncleaned timer in the hold interaction
`src/screens/OnboardingFlow.tsx:243` — `setTimeout(() => nextRef.current(), 700)`
after the hold completes, with no ref and no cleanup, while the sibling
`holdTimer` interval *is* cleared on unmount (`:255-257`).

### P3 — Journal is capped at 5 with no way to see more
`src/screens/ProfileScreen.tsx:259` — `journal.slice(0, 5)`. The store retains 100
entries (`useAppStore.ts:695`) and syncs them to the cloud, but 95 of them are
unreachable from the UI.

### P3 — Hardcoded accessibility labels
`src/screens/ProfileScreen.tsx` — "Manage subscription", "Restore purchases",
"Upgrade to Fasih Pro", `` `${label} theme` ``, `` `${label} mode` ``,
`` `${label} daily goal` ``. Visible copy in this file is correctly in `STRINGS`;
only the screen-reader strings were missed — which inverts the priority, since
those are the ones a user cannot work around.

---

## Batch 7 — `components/ui/`, `components/features/`, `components/scenario/`

### P0 — Every gold-gradient button label fails WCAG AA in dark mode (14 call sites, 5 files)

`docs/lessons-learned.md` records this bug twice, in `ShimmerButton.tsx` and
`PhraseBuilder.tsx`, and states the fix: *"`color: C.BG` as the label ink…worth
grepping for that pattern before inventing a new one."* Both of those files are
fixed. The pattern was never grepped for elsewhere.

Measured ratios (WCAG relative luminance, AA needs ≥ 4.5:1 for body text,
≥ 3:1 for large text and icons):

| Ink | Gradient | Dark theme | Light theme |
|---|---|---|---|
| `C.WHITE` `#FFFFFF` | `GOLD_STOPS` | **1.64 / 2.30 / 2.78** ✗ | 5.78 / 6.89 / 7.98 ✓ |
| `C.WHITE` `#FFFFFF` | `JADE_STOPS` | **1.46 / 1.99 / 2.30** ✗ | 5.78 / 6.89 / 7.98 ✓ |
| `C.TEXT` | `GOLD_STOPS` | **1.36 / 1.91 / 2.31** ✗ | **3.12 / 2.62 / 2.26** ✗ |
| `C.BG` *(the convention)* | `GOLD_STOPS` | 11.52 / 8.24 / 6.82 ✓ | 5.37 / 6.40 / 7.41 ✓ |

It is dark-mode-only for `C.WHITE` because the light theme's `GOLD_STOPS` are dark
browns (`#8A5C1F…`) while the dark theme's are actual light gold (`#EAC57C…`).
`C.TEXT` fails in **both** themes, because it is by definition the ink that
contrasts with `C.BG`, and these buttons are the inverse surface.

Affected call sites:

| File | Lines | Ink | What it is |
|---|---|---|---|
| `features/FeatureGate.tsx` | 81, 82 | `C.TEXT` | "Go to Scenarios" CTA — worst at **1.36:1** |
| `scenario/ScenarioIntroPhase.tsx` | 92, 93 | `C.WHITE` | **"Begin"** — the entry point to every scenario |
| `scenario/ScenarioChoiceResultPhase.tsx` | 150, 153 | `C.WHITE` | "Continue" between scenes |
| `scenario/ScenarioResultPhase.tsx` | 292, 293 | `C.WHITE` | "Home" on the results screen |
| `screens/OnboardingFlow.tsx` | 364, 828, 833, 1297 | `C.WHITE` | step CTA, hold ring %, "save 57%" badge |
| `screens/PracticeScreen.tsx` | 762, 765, 846, 849, 1005 | `C.WHITE` | quiz "Next" ×2, "Done" |

`OnboardingFlow.tsx:945` uses `C.BG` for a `Bell` icon on the same gradient — so
both conventions live in one file, 100 lines apart.

Fix: replace `C.WHITE` / `C.TEXT` with `C.BG` at all 14 sites, matching
`PrimaryButton.tsx:78` and `ShimmerButton.tsx:68`. Then add the check to CI, or
this recurs a fourth time.

### P1 — The error screen shows the raw exception message instead of the friendly copy
`src/components/ui/ErrorBoundary.tsx:48-50`

```tsx
{this.state.error?.message || this.props.fallbackSubtitle || STRINGS.ui.errorBoundary.subtitle}
```

`error.message` is **first**, so the localised copy is only reached when the error
has no message — the rare case. A user hitting the `stats: {}` crash from Batch 3
sees `Cannot read property 'length' of undefined` as the app's entire explanation.
Invert the order and log the message rather than rendering it.

### P1 — "Try again" cannot recover from a deterministic error, and there is only one boundary
`src/components/ui/ErrorBoundary.tsx:37-39`, `app/_layout.tsx:96`

`handleReset` clears `hasError` but nothing about the subtree that threw, so a
reproducible error (bad cloud payload, malformed script) re-throws on the next
render — tap "Try again", get the same screen, forever. And because the only
boundary wraps the entire `Stack`, the fallback replaces navigation too: there is
no way to reach another screen, so the app is unusable until force-quit.

Give the boundary a `resetKey` (e.g. the current route) so remounting actually
produces a different tree, and add per-screen boundaries so one broken screen
does not take the shell down with it.

### P2 — `SyncStatusBanner` is mounted on one screen out of four
`src/components/ui/SyncStatusBanner.tsx:17`, `app/(tabs)/profile.tsx:97`

The component's own doc says *"Mount this once near the top of each main tab
screen."* It is mounted only in Profile. Since `lastSyncError` is set by the
debounced background push that fires after practice and scenario completion, the
user is most likely to be on Home, Scenarios or Library when a sync fails — and
will never see it. Either mount it in the other three tabs or hoist it into
`app/(tabs)/_layout.tsx`.

### P2 — `SyncSuccessBadge` is dead code
`src/components/ui/SyncStatusBanner.tsx:96-125` — exported, documented as *"e.g. in
ProfileScreen"*, and imported nowhere. Second dead export found, after `useHold`
(Batch 6c).

### P2 — `ShimmerButton` has no accessibility props and no shimmer
`src/components/ui/ShimmerButton.tsx`

No `accessibilityRole`, no `accessibilityLabel`, no `accessibilityState` — while
`PrimaryButton.tsx:65-67` has all three including `busy`. `ShimmerButton` is the
primary CTA on the onboarding name step (`OnboardingFlow.tsx:557`), so the first
button a screen-reader user meets is unlabelled.

Also `style?: any` (`:18`) and `colors={G.GOLD_STOPS as any}` (`:57`) — two `any`s
in a 108-line file. And the name promises an effect the component does not have:
the "Layer 1 / Layer 2" comments read as leftovers from a removed shimmer layer.

### P2 — `GhostButton` cannot be disabled and carries no label
`src/components/ui/GhostButton.tsx:12-16` — the `Props` interface has no
`disabled` and no `accessibilityLabel`, so its `Pressable` stays active and
unnamed. Its sibling `PrimaryButton` supports both. Any caller needing a disabled
secondary action has to work around it.

### P2 — `FeatureGate` renders a negative countdown when the gate is stale
`src/components/features/FeatureGate.tsx:29,47,52-69`

`remaining = scenariosRequired - scenariosCompleted` is not clamped. Because
`hasAccess` is computed from a stale selector at every call site (Batch 2 / 6a),
a learner who has completed 4 scenarios can see *"Complete −1 more scenarios"*
above a row of progress dots that are all filled. Clamp with `Math.max(0, …)` and
fix the upstream selectors.

### P3 — Two ESLint `react-hooks/immutability` warnings are false positives
`ui/PrimaryButton.tsx:41,48`, `ui/GhostButton.tsx:27,34`, `ui/SoukCard.tsx:45,53`

All six are `scale.value = withTiming(...)` — the standard Reanimated shared-value
write. Assigning to `.value` is the documented API, not a mutation the rule should
flag. Noting it here so these are not "fixed" into `useState`, which would move
the animation onto the JS thread. Configure the rule to ignore Reanimated shared
values rather than silencing each site.

### P3 — Sync banner copy is hardcoded and the dismiss target is undersized
`src/components/ui/SyncStatusBanner.tsx:57-58,66,80,83,122` — "Progress couldn't
sync.", "Your data is safe locally.", "Retry sync", "Dismiss sync error",
"Synced". The dismiss control is a `✕` text glyph at font size 12 with `padding: 6`
— roughly a 24 pt target, against the project's own stated 44 pt minimum, and it
uses a glyph where every other control in the codebase uses the `X` Lucide icon.

---

## Batch 8 — `components/home/`, `features/`, `onboarding/`

### P1 — The "Quick Challenge" is the same two words for every user, forever
`src/components/home/QuickChallenge.tsx:18-22` ← `src/screens/HomeScreenNew.tsx:255-257`

```tsx
export function QuickChallenge({ stimulus = 'مساء الخير', response = 'مساء النور', onRevealed })
...
<QuickChallenge onRevealed={() => setStreakMood('excited')} />   // no stimulus, no response
```

The only call site passes neither prop, so the defaults are the challenge — the
same greeting/response pair on day 1 and day 300. It sits directly above the
"Daily Phrase" card, which *does* rotate by date (`getPhraseOfTheDay`), so the
inconsistency is visible on one screen. Either rotate it the same way or drive it
from the user's due SRS cards.

### P1 — The Daily Phrase card always says "Everyday", whatever the phrase is
`src/components/home/DailyPhrase.tsx:13-19,179`

`DailyPhraseProps` has `arabic`, `phonetic`, `english` — **no `category`** — and the
card renders a hardcoded `<Text style={styles.topLabel}>Everyday</Text>`.
`HomeScreenNew.tsx:263-269` feeds it `PHRASES[dayIndex % PHRASES.length]`, which
ranges across all eight categories. So a Hospitality or Workplace phrase is
labelled "Everyday" — a category badge that is wrong roughly 7 days out of 8, on
the home screen, every day. Pass `p.category` through.

### P1 — Two of the seven confidence situations can never reach "Confident"
`src/components/home/SituationalConfidence.tsx:65-78,88-93,114-158`

Scoring is scenario-derived + phrase-derived, each capped at ~60, and
`getConfidenceLevel` needs **≥ 70** for "Confident". Two situations have an empty
array on one side of that sum:

| Situation | `scenarioIds` | `phraseCategories` | Max achievable | Best level |
|---|---|---|---|---|
| Daily Navigation | `[]` | `['Everyday']` | 50 + 10 = **60** | Familiar |
| Healthcare | `['the-checkup']` | `[]` | 50 × 1.2 = **60** | Familiar |

No amount of practice moves either past "Familiar". Every other situation has
both sides populated and can reach 100. Either give these two the missing
mapping, or scale the score by the number of populated dimensions.

### P1 — A dead ending-type comparison silently drops the intended bonus
`src/components/home/SituationalConfidence.tsx:124-127`

```ts
const bonus = ending === 'exceptional' ? 1.2
  : ending === 'success_strong' ? 1.1
  : ending === 'failed' ? 0.6 : 1.0;
```

`'success_strong'` is not a member of `ScenarioEnding['type']`, which is
`'exceptional' | 'success' | 'mixed' | 'failed'` (`types/index.ts:164`). The
branch is unreachable, and the actual `'success'` ending — the most common good
outcome — falls through to `1.0`, so the intended tiering between "exceptional"
and "strong success" does not exist.

TypeScript cannot catch this because the store widens the type on the way in:
`completedScenarios: Record<string, { endingType: string; date: string }>`
(`useAppStore.ts:170`). Narrowing that to `ScenarioEnding['type']` would have
made this a compile error, and would protect the other consumers too
(`finalizeScenario`, `rcRecordEndingStat`, `ENDING_STAT_SEEDS`).

### P1 — Fabricated engagement data is baked into a component's own defaults
`src/components/home/CommunityBar.tsx:14-19,97-100`

```ts
const AVATAR_EMOJIS = ['👨‍💼', '👩‍💻', '🧑‍🎓'];
export function CommunityBar({ count = 47, location = 'Dubai' })
...
<Text style={styles.countBold}>{count}</Text> expats in {location} completed a scenario today.
```

Three invented people and an invented daily count, as *defaults* — so even a
future caller who forgets a prop still renders a confident, specific, false
claim. This is the third fabricated-statistic finding (after `ENDING_STAT_SEEDS`
in Batch 3 and the `TODO`-marked call site in Batch 6a) and the one most likely
to be read as a factual statement by a user.

### P2 — A wrong answer in Phrase Builder is rescheduled *further out* than a correct-but-shaky one
`src/screens/PracticeScreen.tsx:876-884`

```ts
if (isCorrect) onPhraseRating?.(id, 'knew');
else           onPhraseRating?.(id, 'learning');
```

`'learning'` sets a **3-day** interval and records neither a correct nor an
incorrect (`srsEngine.ts:82`). `'new'` — the rating meant for "I didn't know this"
— sets **1 day** and decrements ease. So failing to build the phrase pushes the
card three days out and leaves the accuracy ratio untouched. Use `'new'`.

Worth noting the same block is otherwise *more* correct than the flashcard path:
it calls `onPhraseRating` only, without the duplicate `onPhraseReview` that
corrupts the schedule in `rateCard` (Batch 6b, P0).

### P2 — Both swipe directions in Phrase Builder do the same thing
`src/components/features/PhraseBuilder.tsx:34-42`

```ts
if (e.translationY < -50 || e.velocityY < -500) { runOnJS(onTap)(id); }
else if (e.translationY > 50 || e.velocityY > 500) {
  // swipe down (remove)
  runOnJS(onTap)(id);
}
```

Identical bodies. `handleTileTap` toggles between bank and placed, so the net
effect is that swiping *up* on a placed tile removes it and swiping *down* on a
bank tile places it — the inverse of what the comments describe. It happens to be
usable, which is why it has survived; collapse the branches or implement the
directional behaviour the comment claims.

### P2 — Nested `GestureHandlerRootView`
`src/components/features/PhraseBuilder.tsx:117` mounts its own
`GestureHandlerRootView` inside the app-wide one at `app/_layout.tsx:97`. RNGH
documents a single root; nesting is a known source of dropped gestures on Android.

### P2 — Answer checking is exact string equality against a separately-authored field
`src/components/features/PhraseBuilder.tsx:105-108`

`constructed = placed.map(t => t.word).join(' ')` compared with `=== arabic`.
`wordTiles` is authored independently of `arabic` in `phrases.ts`, so any
difference in spacing, punctuation or diacritics makes a correct arrangement
score as wrong, with no diagnostic. Normalise both sides (collapse whitespace,
strip tashkeel) before comparing.

The same function still carries the author's thinking-out-loud in the source:
*"Wait, array order: 0th element should be the first word (rightmost in Arabic)."*
That is an unresolved question about RTL ordering sitting in shipped code — worth
answering deliberately, since it determines whether the game is even scoring the
right thing.

### P2 — Hardcoded UI copy across the component tree
A conservative scan for literal `<Text>Some words</Text>` (which misses array
literals, template strings and accessibility labels) finds **23** in
`src/components` alone:

| Directory | Count | Examples |
|---|---|---|
| `onboarding/` | 8 | "Phrase Unlocked!", "Continue to App", "Cultural Note", "You said" |
| `home/` | 6 | "Everyday", "New today", "Correct response:", "Tap to reveal →" |
| `features/` | 4 | "Translate this phrase", "Support Drag & Drop or Tap", "Check" |
| `scenario/` | 3 | "Cultural Insight", "Impact", "Final Score" |
| `ui/` | 2 | "Your data is safe locally.", "Synced" |

Plus `OnboardingFlow.tsx` (6 more, including a bare `<Text>Loading...</Text>` at
`:1132`) and the five section headings in `HomeScreenNew.tsx`. Combined with the
`FUN_FACTS`/`MOTIVATIONAL_HEADINGS` arrays from Batch 6a, the `STRINGS` rule is
the single most-violated convention in the codebase.

### P3 — A gradient between a colour and itself
`src/components/home/QuickChallenge.tsx:111-116` — `colors={[C.PRIMARY, C.PRIMARY]}`
on a 2 px bar. A `View` with `backgroundColor` does the same thing without a
native gradient view.

### P3 — `PhraseBuilder` is only safe because its caller remembers to key it
`src/components/features/PhraseBuilder.tsx:74-86` seeds `bank` with a lazy
`useState` initialiser and never resyncs it when `arabic`/`wordTiles` change.
`PracticeScreen.tsx:872` passes `key={deck[current].id}`, which forces a remount
and makes this correct today — but the component gives no hint that the key is
load-bearing. Derive from props with a `useEffect` reset, or document the
requirement.

### P3 — Scoring comment does not match the scoring
`src/components/home/SituationalConfidence.tsx:5-8` says *"50% weight per completed
scenario…50% weight from phrase practice"*. The actual maxima are 60 and 60,
clamped to 100 at `:149` — so the weights are neither 50/50 nor normalised.

### Reviewed and found sound

`StreakRiskBanner.tsx` — all copy in `STRINGS`, `accessibilityState` with the
disabled reason in the label (`"Use streak freeze, N left"`), and `C.BG` on a
`C.PRIMARY` fill, which measures 11.52:1 dark / 5.37:1 light. A good template for
the buttons in the Batch 7 P0.

`SituationalConfidence.tsx:136` guards `stats.categoryMastery` before reading it —
the only one of the three consumers of that field to do so (compare
`ProfileScreen.tsx:52` and `HomeScreenNew.tsx:92`).

---

## Batch 9 — remaining `components/ui/` and `components/design/`

### P1 — `EmptyState` renders a React Native `<Text>` inside an `<Svg>`, so its artwork never draws
`src/components/ui/EmptyState.tsx:1-3,27-66`

```tsx
import { View, Text, StyleSheet } from 'react-native';       // ← RN Text
import Svg, { Path, Circle } from 'react-native-svg';        // ← no Text imported
...
<Svg width={120} height={120} viewBox="0 0 120 120" style={styles.calligraphy}>
  <Circle ... />
  <Text style={[styles.arabic, ...]}>{arabic}</Text>          // ← RN Text as an SVG child
```

`react-native-svg` requires its own `Text` element; a React Native `Text` is not a
valid SVG child and does not render. So the Arabic glyph (`'لا يوجد'`, or the `'؟'`
that `ScenarioPlayer.tsx:483` passes for a missing scenario) is invisible.

Two supporting symptoms in the same block: `styles.arabic` sets `textShadowColor`
/ `textShadowRadius`, which have no meaning inside SVG; and `styles.calligraphy`
absolutely positions the `<Svg>` at `top: -60, left: -60` inside
`arabicContainer`, which has no dimensions of its own — so even the circles and
paths that *do* render sit outside the layout box.

`EmptyState` is the zero-data component the UI Quality Bar in `CLAUDE.md`
mandates, and it is used on four screens. Import `Text` from `react-native-svg`
(or drop the Svg wrapper and render the glyph as plain text).

### P1 — The shared `ProgressBar` is dead code; seven hand-rolled copies remain
`src/components/ui/ProgressBar.tsx` vs 7 call sites

The component's own doc says:

> *"Replaces the scattered inline View-based progress bars that were copy-pasted
> across ProfileScreen, HomeScreenNew, StreakWidget, and ScenariosScreen."*

It replaced none of them. The only import is the barrel re-export
(`ui/index.ts:12`); nothing renders it. The only `<ProgressBar>` actually mounted
in the app is a **different, locally-defined function** of the same name inside
`OnboardingFlow.tsx:108`, used at `:1397` — so the shared name is also shadowed.

Still hand-rolled:

| File | Line |
|---|---|
| `screens/PracticeScreen.tsx` | 513, 867 |
| `screens/ProfileScreen.tsx` | 188 |
| `screens/ScenarioPlayer.tsx` | 62 |
| `components/home/MissionCard.tsx` | 233 |
| `components/home/StreakWidget.tsx` | 225 |
| `components/home/SituationalConfidence.tsx` | 402 |

None of the seven carry `accessibilityRole="progressbar"` or `accessibilityValue`
— the shared component has both. Two of them (`ScenarioPlayer.tsx:62`,
`SituationalConfidence.tsx:402`) need an `as any` on the width string, which the
shared component types correctly as `` `${number}%` ``. So the unused version is
strictly better than all seven copies on both accessibility and type safety.

This is the third dead export found (after `useHold` and `SyncSuccessBadge`) and
the most costly one.

### P2 — `SoukCard` is dead code *and* the only theme-blind component in the app
`src/components/ui/SoukCard.tsx`

It never imports `useTheme`. Every colour is a module-level literal:
`'rgba(255,255,255,0.04)'` background, `'rgba(255,255,255,0.08)'` border,
`'#241C13'` hero fill, `'#D6A24C'` accent, `'rgba(234,197,124,0.38)'` shimmer —
i.e. dark-theme values baked in. Rendered in light mode, a 4 %-white card on
`C.BG` `#FBF6EC` would be invisible and the hero variant a near-black block.

It is currently harmless because nothing renders it (only `ui/index.ts:4`
re-exports it) — fourth dead export. But it sits in the shared UI barrel looking
like a supported primitive, so the first person to reach for it inherits the bug.
Delete it or convert it to `useTheme` before it gets adopted.

### P2 — `tokens.ts` asserts a WCAG guarantee that no longer holds
`src/components/design/tokens.ts:11-13`

> *"Every text/fill pairing below is WCAG AA-verified (>=4.5:1) — see the note on
> ShimmerButton.tsx, which was the one place a hardcoded white label broke this
> (2.53:1 on the old gradient)."*

Batch 7 measured 14 live call sites between **1.36:1 and 2.78:1**, so
`ShimmerButton` was not "the one place" — it was the one place that got fixed.
This comment is the reason the others were never re-checked: a reader who trusts
it has no cause to measure anything. Either re-verify and re-scope the claim to
what it actually covers (the token values in isolation, not their use as fills),
or remove it.

### P2 — `RippleEffect` leaks a 600 ms timer, on the exact component that unmounts at 600 ms
`src/components/ui/RippleEffect.tsx:37-51`

```ts
setTimeout(() => { setRipples(prev => prev.filter(r => r.id !== newRipple.id)); }, 600);
```

No ref, no cleanup. Its main consumer is the scenario choice button
(`ScenarioPlayer.tsx:588`), and `handleChoice` schedules
`setTimeout(() => setPhase('choice-result'), 600)` — the same 600 ms. So on
essentially every choice the two timers race, and the ripple's `setRipples` can
fire after the scene has been torn down. Hold the timer in a ref and clear it on
unmount.

### P2 — `SwitchButton` exposes nothing to screen readers
`src/components/ui/SwitchButton.tsx:17-31`

A toggle with no `accessibilityRole="switch"`, no
`accessibilityState={{ checked: value }}`, and no `accessibilityLabel`. It is used
for the notification preference toggles in onboarding
(`OnboardingFlow.tsx:988-996`), so a screen-reader user gets an unlabelled button
that does not announce its on/off state. Of all control types this is the one
where the state *is* the information.

### P3 — Two more `any`s and a colliding key
`src/components/ui/RippleEffect.tsx:37` — `(event: any)`; the correct type is
`GestureResponderEvent`. `:41` — `id: Date.now()` as the React key, so two ripples
created in the same millisecond (a fast double-tap) collide.
`src/components/ui/SwitchButton.tsx:50` — `shadowColor: '#000'` hardcoded.

### Reviewed and found sound

`InputField.tsx` — small, fully themed, and it defaults `accessibilityLabel` to
the placeholder (`:31`) so a caller who forgets one still gets a labelled field.
`ProgressBar.tsx` — clamps its input, sets `accessibilityRole="progressbar"` with
a live `accessibilityValue`, documents every prop, and types the percentage width
without a cast. It is the best-written component in `src/components/ui/`; it is
simply not used.

---

## Batch 10 — constants, tests, config

### P1 — "92.66% coverage" describes 2% of the codebase
`jest.config.js`, `src/engine/__tests__/`

```
Statements : 92.66% ( 139/150 )
Lines      : 94.06% ( 111/118 )
```

That looks excellent until you notice the denominator. `jest.config.js` sets no
`collectCoverageFrom`, so Jest instruments **only files a test imports** — which
is `src/engine/` and nothing else. All five suites live in
`src/engine/__tests__/`; there is not one test anywhere in `app/`, `src/screens/`,
`src/components/`, `src/store/` or `src/lib/`.

So 118 covered lines out of a ~19,800-line codebase, reported as 94%.

This is the structural reason the defects in this review went unnoticed. Every
P0 and nearly every P1 found here sits outside the engine:

| Finding | Location | Tested? |
|---|---|---|
| Double SRS write corrupts every rating | `screens/PracticeScreen` | no |
| Quiz distractors duplicate the answer | `screens/PracticeScreen` | no |
| Bonus scenes shown to everyone | `screens/ScenarioPlayer` | no |
| Cloud `stats: {}` crashes on sign-in | `store/` + `lib/syncService` | no |
| 14 button labels below 2.8:1 contrast | `components/` | no |
| Swipe-back never fires | `screens/OnboardingFlow` | no |

The engine — the one part with tests — is also the one part where this review
found only P2/P3 issues. The tests are good; they are pointed at the code that
was already correct.

Two cheap steps: add `collectCoverageFrom: ['src/**/*.{ts,tsx}', 'app/**/*.tsx']`
so the number stops flattering, and add store-level tests (the store is pure
enough to test without a renderer — `recordPhraseRating` followed by
`recordPhraseReview` would have failed immediately).

### P2 — The content test suite has exactly the gaps that shipped as bugs
`src/engine/__tests__/scenarioContent.test.ts`

This file is the best thing in the test suite. It validates that every
`phrasesUnlocked` id exists, every `choice.next` points at a real scene, every
`requiredFlag` is settable by an earlier choice, catalog metadata matches the real
ending count, no Latin letters appear in Arabic fields, and every choice's impact
lands inside its outcome tier.

Three invariants it does not assert map one-to-one onto P1s found elsewhere in
this review:

1. **`bonus: true` scenes must not be reachable by linear progression** — would
   have caught Batch 5's dead secret-ending gate.
2. **`endingType` literals used in app code must be members of
   `ScenarioEnding['type']`** — would have caught Batch 8's `'success_strong'`.
3. **Phrases must be unique on the fields the quiz compares (`roman`, `arabic`)**
   — would have caught Batch 6b's duplicate distractors (7 duplicate `arabic`
   values are in the library today).

All three are a few lines each in a file that already imports everything needed.

### P2 — `runtimeVersion` is a literal, so OTA updates are not fingerprinted
`app.json:70-72`

```json
"updates": { "url": "https://u.expo.dev/387c…" },
"runtimeVersion": "1.0.0",
```

A hardcoded string means the runtime identity never changes when native code
does. Add a native module, ship a new binary, publish an OTA — the update is
delivered to *old* binaries too, because they all claim runtime `1.0.0`, and it
crashes on the first call into the missing native module. Use
`"runtimeVersion": { "policy": "appVersion" }` or `"fingerprint"`.

Related: `version` is `1.0.0` here while `ProfileScreen.tsx:92` hardcodes its own
`'1.0'` (Batch 6c) — two sources of truth, neither reading the other.

### P2 — Splash and adaptive-icon backgrounds are pure white; no theme is
`app.json:11,25,32` — `"backgroundColor": "#FFFFFF"` in the iOS splash, the
Android adaptive icon, and the Android splash. Neither theme's background is
white: dark is `#14100B`, light is `#FBF6EC` (`tokens.ts:96,174`). With
`userInterfaceStyle: "automatic"`, a dark-mode launch flashes white and then
snaps to near-black.

### P3 — The `@/*` path alias is configured and never used
`tsconfig.json:5-9` maps `@/*` → `./src/*`; zero imports in `app/` or `src/` use
it. `CLAUDE.md`'s Image Rule example is written against it
(`import careerMode from '@/assets/images/career_mode.png'`) — which would resolve
to `src/assets/`, where nothing lives. The real `src/constants/images.ts` uses
relative `require()` calls. Either adopt the alias or drop it from both places.

### P3 — A hardcoded string that already exists in `STRINGS`
`STRINGS.common.loading` is `'Loading...'` (`strings.ts:18`), and
`OnboardingFlow.tsx:1132` renders `<Text>Loading...</Text>`. With 422 keys already
defined, the convention is not the problem — enforcement is. An ESLint rule
banning string literals as `<Text>` children would catch the ~60 violations this
review found across batches 6a, 6c and 8.

### Reviewed and found sound

`metro.config.js` — the lucide deep-import resolver shim is a genuine
optimisation (avoids bundling a ~3,390-icon barrel Metro cannot tree-shake in
dev), and the comment explains both the mechanism and why the package's `exports`
map forces it.

`eslint.config.js` — every downgraded rule carries a rationale, and
`react-hooks/purity` is deliberately kept as an **error** with a note naming the
two real bugs it caught (WaveBars jitter, ScenariosScreen double-render). That is
the right instinct; the gap is that four of the downgraded-to-warning rules are
now permanently ignored rather than incrementally cleaned.

`.gitignore` — `.env`, `.env.local`, `.env*.local` and `.env.sentry-build-plugin`
are all covered, so the `.env.local` workflow that `purchases.ts:12-14` instructs
developers to use cannot leak keys.

`src/constants/images.ts` — matches the Image Rule: one module, no `require()` in
components.

---

## Summary

**117 findings across 10 batches** — 5 P0, 32 P1, 49 P2, 31 P3.

### Fix status (branch `fix/p0-review-findings`)

| P0 | Status |
|---|---|
| 2. Double flashcard write | ✅ fixed — `PracticeScreen.tsx`, + regression test in `srsEngine.test.ts` |
| 3. Contrast failures | ✅ fixed — 26 sites / 11 files swapped to `C.BG` (12 more than this report catalogued) |
| 5. Locked scenarios inert | ✅ fixed — cards route to the paywall, footer copy splits paywalled vs unwritten |
| 1. Empty legal URLs | ⛔ needs published policy/terms URLs — cannot be invented |
| 4. RLS disabled | ⛔ needs a Supabase + Clerk dashboard decision; `003_rls.sql` warns that enabling it before verifying the token silently breaks every sync write |

Two follow-ups deliberately left alone: `OnboardingFlow.tsx:1179,1236` render icons
over **data-driven** gradients where some entries are gold (white fails) and others
are neutral/violet/error (where `C.BG` would fail instead) — these need a per-entry
ink decision, not a blanket swap. And `ScenariosScreen.tsx:342`'s heading sits on a
three-stop gradient whose final stop is `C.JADE`; the text renders over the dark end,
so it passes in practice but is fragile.

### The five P0s, in the order they should be fixed

1. **Legal URLs are empty** (`legal.ts:18`) — blocks store submission outright.
   Nothing else matters until this ships.
2. **Every flashcard rating is written twice** (`PracticeScreen.tsx:373`) — the
   second write silently destroys the 3-tier SRS schedule and double-counts
   accuracy. One line to delete.
3. **14 button labels fail WCAG AA in dark mode** (1.36–2.78:1) — including
   "Begin", the entry point to every scenario. The fix (`C.BG`) is already the
   documented convention and already correct in two files.
4. **Any client can read or write any user's row** (`003_rls.sql`) — RLS is
   disabled and `user_id` is client-supplied. Documented as accepted-for-launch;
   needs a dated decision, not a rediscovery.
5. **Locked scenarios are inert and mislabelled** (`ScenariosScreen.tsx:200`) —
   tapping a paywalled card does nothing, and the footer tells the user the
   content is unwritten. The paywall is never offered where it is felt.

### Patterns worth fixing once rather than 3–7 times

- **Store getters pulled through selectors don't subscribe** — 3 sites
  (`library.tsx`, `practice.tsx`, `ScenariosScreen.tsx`). Gates stay stale until
  remount.
- **`eslint-disable` comments justified by a false claim** — 4 comments, 3 files,
  all asserting `C` is unstable when it is a module constant. One of them
  (`OnboardingFlow.tsx:293`) names a `backRef` that does not exist, which is
  precisely the bug.
- **Dead exports that are better than what's used** — `ProgressBar` (accessible,
  typed) vs 7 hand-rolled copies; `useHold` vs an inline reimplementation;
  `SoukCard`, `SyncSuccessBadge`, `identifyUser`/`resetIdentity`.
- **Fabricated data presented as real** — `ENDING_STAT_SEEDS`, `CommunityBar`'s
  `count = 47, location = 'Dubai'` defaults, and the `TODO`-marked call site.
- **Unvalidated cloud payload** — `stats: {}` reaches 3 separate crash sites;
  validate once at the `pullProgress` boundary.
- **~60 hardcoded UI strings** against a 422-key `STRINGS` object — an ESLint rule
  would end this permanently.

### What is genuinely well built

The scenario engine and its 129 tests; `scenarioContent.test.ts`'s data-integrity
checks; `useArabicTTS`; `PhraseLibrary`; `ProgressBar` and `InputField`;
`StreakRiskBanner`; the account-deletion ordering in `deleteAccount`; the
`metro.config.js` lucide shim; and the `eslint.config.js` rationale comments.
The codebase's problem is not care — it is that the care is concentrated in the
20% that has tests, and the conventions it documents for itself are not enforced
anywhere.
