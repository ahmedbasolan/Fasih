# Fasih — Data Collection Inventory

**Purpose:** the factual basis for Fasih's privacy policy, and for the App Store
and Play Store privacy questionnaires. Everything below is derived from the
code, not from assumption — file references are included so it can be
re-verified.

**Keep this current.** If you add an SDK, a new synced field, or a new device
permission, update this file *and* re-check the store questionnaires. A privacy
policy that describes the wrong data is worse than none.

Last verified against: `dev` @ the commit adding this file.

---

## 1. Account data — Clerk

Collected at sign-up (`app/sign-up.tsx`, `signUp.create`):

| Data | Notes |
|---|---|
| Email address | Also used for the verification code and password reset |
| Password | Sent to Clerk, hashed by Clerk. Never stored by Fasih, never touches Supabase |
| First name | Split from the "Full name" field |
| Last name | Split from the "Full name" field; optional |

Clerk is the sole identity provider. Supabase Auth is **not** used. The Clerk
user ID (`clerkUserId`) is the key that ties every other record together.

---

## 2. Learning data — Supabase (Postgres)

Pushed by `syncToCloud()` in `src/store/useAppStore.ts`, keyed by `clerkUserId`:

| Field | What it contains |
|---|---|
| `user_profile` | Display name, career/social mode, role, profession, **gender**, goals, selected plan, onboarding checklist, daily XP target |
| `stats` | Streak, days active, XP, phrases studied/mastered, per-category mastery and accuracy |
| `phrase_reviews` | Spaced-repetition history per phrase — ratings and next-review dates |
| `completed_scenarios` | Which scenarios were finished and which ending was reached |
| `endings_found` | Every ending id reached per scenario, across all runs |
| `scenario_runs` | How many times each scenario was completed |
| `saved_phrases` | Bookmarked phrase IDs |
| `unlocked_phrase_ids` | Phrases earned through scenarios |
| `milestones` | Achievements reached, with dates |
| `journal` | **User-authored** cultural journal entries (Arabic, English, personal insight) |
| `last_active_date` | Drives streak logic |
| `subscription_status`, `trial_started_at`, `trial_plan` | Entitlement state |

**Gender** is collected for a functional reason — Arabic conjugates for the
speaker's gender, so it determines which forms are taught and gates one scenario
written for a single gender. Worth stating explicitly in the policy, since
gender can be treated as sensitive data under some regimes.

**The journal is free-text authored by the user**, so it may contain anything
they choose to write. Policies should treat it as user-generated content.

---

## 3. Crash and diagnostics — Sentry

Configured in `src/lib/analytics.ts`.

- Crash and error reports, including stack traces
- Device model, OS version, app version (collected automatically by the SDK)
- A breadcrumb trail of in-app actions: onboarding started/completed, scenario
  started/choice made/completed/abandoned, practice sessions, phrase saved,
  paywall shown, subscription purchased, screen views
- `tracesSampleRate` is 100% in development, 20% in production

**No user identity is attached today.** `identifyUser()` exists in
`analytics.ts` but is never called anywhere in `src/` or `app/`, so Sentry
events are not linked to a named user. If that changes, this file and the
privacy policy both need updating.

---

## 4. Payments — RevenueCat

`src/lib/purchases.ts` calls `Purchases.logIn(clerkUserId)`, linking purchase
history to the Clerk user ID. RevenueCat handles the transaction with Apple or
Google; Fasih never sees card or payment details.

---

## 5. On-device only — never uploaded

Persisted to AsyncStorage but **not** included in the Supabase sync payload:

- Theme preference (light/dark/system)
- Favourited scenarios
- Per-scenario scene progress
- Streak freezes remaining
- `recentSessionHours` — the hour of day of the last 7 sessions, used solely to
  time the daily reminder notification
- Notification enabled flag, onboarding-complete flag, signed-in flag

---

## 6. Device permissions

| Permission | Required? | Why |
|---|---|---|
| Notifications | Optional | Daily practice reminders, streak-at-risk alerts, re-engagement after 3/7 days inactive. All scheduled **locally** via `expo-notifications` — no push server, no device token sent anywhere |

---

## 7. Not collected

Stating these explicitly shortens both the policy and the store questionnaires:

- ❌ Location of any kind
- ❌ Contacts, calendar, photos, camera
- ❌ Microphone — text-to-speech (`expo-speech`) is **output only**
- ❌ Advertising ID / IDFA
- ❌ Third-party advertising or marketing SDKs
- ❌ Health, financial, or biometric data
- ❌ Cross-app or cross-site tracking

---

## 8. Third-party processors to name in the policy

Each of these receives some user data and needs to be disclosed, ideally with a
link to their own privacy policy:

| Processor | Purpose | Receives |
|---|---|---|
| **Clerk** | Authentication | Email, name, password |
| **Supabase** | Database | All learning data in §2, keyed by Clerk user ID |
| **Sentry** | Crash reporting | Errors, device info, in-app event breadcrumbs |
| **RevenueCat** | Subscriptions | Purchase state, Clerk user ID |
| **Expo / EAS** | Builds and OTA updates | App update delivery |
| **Apple / Google** | Payment processing | Handled entirely by the store |

---

## 9. Open questions to settle before publishing

These are decisions, not code facts — they change what the policy must say:

1. **Which regions?** Fasih targets the UAE, but the App Store is global by
   default. If EU/UK users can download it, GDPR applies: you need a lawful
   basis, a data-deletion path, and a data-export path.
2. **Account deletion — built, but needs two dashboard steps to work.**
   Profile → Delete Account now erases the Supabase row (via the
   `delete_my_account()` RPC in `supabase/migrations/005_account_deletion.sql`)
   and then the Clerk account, in that order. It **fails closed**: if the data
   deletion doesn't succeed, the Clerk account is left intact and the user is
   told nothing was deleted. Before it functions you must:
   - Run migration `005_account_deletion.sql`
   - Enable Clerk↔Supabase Third-Party Auth in **both** dashboards (the same
     prerequisites listed for Option B in `003_rls.sql`) — without it
     `auth.jwt()->>'sub'` is NULL and the RPC refuses every request
   - Enable *"Allow users to delete their account"* in the Clerk Dashboard
3. **Data retention.** How long is Supabase data kept after a user stops using
   the app or deletes their account?
4. **Children.** Fasih is aimed at working adults. Declaring a 13+ (or 16+ in
   the EU) minimum keeps you out of COPPA territory.
5. **Contact address.** Policies need a real contact point for privacy requests.
