import type { ThemeColors } from '../components/design/tokens';
import type { Scenario, ScenarioScript } from '../types';

// ─── Scenario catalog ────────────────────────────────────────────────────────
// Romanisation: ' = ع  kh = خ  gh = غ  g = ق  h = ح  sh = ش
//               aa/ii/uu = long vowels. No tashkeel in Arabic strings.
// Scoring: starts at 0, choices add or subtract, total shown at end.

export const getCareerScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'first-morning', iconName: 'Sunrise',
    title: 'The First Morning', subtitle: 'Your first day. One greeting can change everything.',
    decisions: 6, endings: 6, phrases: '12', level: 'Beginner',
    color: C.JADE2, gradientColors: ['#0A1A0F', '#050D08'],
    arabicScene: 'أول صباح',
    kafIntro: 'Your first Arabic greeting sets the tone for every interaction that follows.',
    mode: 'career',
    dialect: 'Emirati Gulf',
  },
  {
    id: 'coffee-invitation', iconName: 'Coffee',
    title: 'The Coffee Invitation', subtitle: 'Two weeks in, a colleague asks you for coffee.',
    decisions: 6, endings: 6, phrases: '12', level: 'Beginner',
    color: C.JADE_ACCENT, gradientColors: ['#1A0F0A', '#0D0608'],
    arabicScene: 'قهوة',
    kafIntro: 'Coffee is never just coffee in Emirati culture — it is an invitation to build trust.',
    mode: 'career',
    dialect: 'Emirati Gulf',
  },
  {
    id: 'office-meeting', iconName: 'Briefcase',
    title: 'The First Introduction', subtitle: 'Make a lasting impression at a formal meeting',
    // Not written yet, so there is nothing to count: these were 12 / 5 / '25+',
    // typed in for a script that does not exist. ScenarioEntry shows no counts
    // for a coming-soon row.
    decisions: 0, endings: 0, phrases: '0', level: 'Intermediate',
    color: C.VIOLET2, gradientColors: ['#110A1C', '#080510'],
    arabicScene: 'اجتماع',
    kafIntro: 'In Gulf business culture, how you introduce yourself matters far more than your resume.',
    mode: 'career',
    comingSoon: true,
    dialect: 'Emirati Gulf',
  },
];

export const getSocialScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'social_taxi_ride', iconName: 'Zap',
    title: 'The Taxi Ride', subtitle: 'Airport → Hotel, a late-night conversation',
    decisions: 5, endings: 4, phrases: '5', level: 'Beginner',
    color: C.JADE_ACCENT, gradientColors: ['#1A1208', '#0D0A05'],
    arabicScene: 'تاكسي',
    kafIntro: 'You just landed in Dubai. Your driver is warm and chatty. Make conversation!',
    mode: 'social',
    dialect: 'Egyptian',
  },
  {
    id: 'social_elevator', iconName: 'Users',
    title: 'The Elevator', subtitle: 'A brief encounter in your building',
    decisions: 6, endings: 4, phrases: '5', level: 'Beginner',
    color: C.VIOLET2, gradientColors: ['#0A0A1A', '#050510'],
    arabicScene: 'مصعد',
    kafIntro: 'You meet someone in your building elevator. Short phrases, simple choices.',
    mode: 'social',
    dialect: 'Jordanian',
  },
  {
    id: 'eid-greeting', iconName: 'Users',
    title: 'Eid Greetings', subtitle: 'Celebrate the holy day with neighbours',
    decisions: 3, endings: 4, phrases: '7', level: 'Beginner',
    color: C.JADE_ACCENT, gradientColors: ['#1A140A', '#0D0A05'],
    arabicScene: 'عيد',
    kafIntro: 'Eid greetings carry centuries of tradition — each phrase is a gift of connection.',
    mode: 'social',
    dialect: 'Emirati Gulf',
  },
];

export const getOnboardingScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'onboarding-cafe', iconName: 'Coffee',
    title: 'Welcome to the Café', subtitle: 'Your first interaction in Gulf Arabic',
    decisions: 4, endings: 2, phrases: '5+', level: 'Beginner',
    color: C.JADE_ACCENT, gradientColors: ['#1A1408', '#0D0A05'],
    arabicScene: 'مقهى',
    kafIntro: 'Your first Arabic moment. Simple, welcoming, and full of cultural warmth.',
    mode: 'social',
    isOnboarding: true,
    dialect: 'Emirati Gulf',
  },
];

export const getAllScenarios = (C: ThemeColors) => [...getCareerScenarios(C), ...getSocialScenarios(C)];

/**
 * Whether a scenario should be offered to this learner.
 *
 * A scenario with `requiresGender` stages a situation that would be culturally
 * wrong for the other gender to practise, so it stays hidden until we actually
 * know — an unset gender hides it rather than guessing.
 */
export function isScenarioAvailableFor(
  scenario: Pick<Scenario, 'requiresGender'>,
  gender: 'male' | 'female' | undefined,
): boolean {
  if (!scenario.requiresGender) return true;
  return scenario.requiresGender === gender;
}

/** Filters a scenario list down to what this learner should see. */
export function filterScenariosForLearner<T extends Pick<Scenario, 'requiresGender'>>(
  scenarios: T[],
  gender: 'male' | 'female' | undefined,
): T[] {
  return scenarios.filter(s => isScenarioAvailableFor(s, gender));
}

export function getScenarioById(id: string, C: ThemeColors): Scenario | undefined {
  return getAllScenarios(C).find(s => s.id === id);
}

export function getFeaturedScenario(C: ThemeColors): Scenario {
  return getCareerScenarios(C)[0];
}

export function getOnboardingScenario(C: ThemeColors): Scenario | undefined {
  return getOnboardingScenarios(C)[0];
}

// ─── Scenario scripts (dialogue trees) ───────────────────────────────────────
export const getScenarioScripts = (C: ThemeColors): Record<string, ScenarioScript> => ({

  // ── CAREER 1: THE FIRST MORNING ────────────────────────────────────────────
  // Route script (spec 2026-09-14) — the reference the other five follow.
  //
  // Destinations: `colleague` (Faisal becomes your person at work) and
  // `professional` (you arrive with a reputation). Forks at scene3 (the middle)
  // and scene5 (the finale line), so a replay on the other route plays differently.
  // Hidden: ask after Faisal when he says he's tired (not the top choice in
  // scene3) AND answer his بالتوفيق with a blessing (scene5).
  //
  // NOT NATIVE-REVIEWED. New lines here are authored, not sourced — the phrase
  // sets reuse existing library entries only. See docs/language/reviewer-brief.md.
  'first-morning': {
    id: 'first-morning',
    title: 'The First Morning',
    estimatedMinutes: 7,
    routes: [
      { id: 'colleague', label: 'Friend at work' },
      { id: 'professional', label: 'Reputation at work' },
    ],
    defaultRoute: 'colleague',
    phrases: {
      // صباح الخير / صباح النور / شلونك؟ / الحمد لله، بخير / أنا يديد هني
      core: ['fm-s1-1', 'fm-s1-2', 'fm-s1-3', 'fm-s1-4', 'fm-s1-5'],
      byEnding: {
        // الله يعطيك العافية / الله يعافيك / تفضل
        'the-go-to-colleague': ['core-3', 'core-4', 'h1'],
        'friendly-not-close': ['core-3', 'core-4', 'h1'],
        // تشرفنا / يلا، بالتوفيق / لو سمحت
        'the-one-to-watch': ['fm-s1-6', 'fm-s1-8', 'core-5'],
        'polite-not-noticed': ['fm-s1-6', 'fm-s1-8', 'core-5'],
        // الله يسلمك — the answer to سلامتك
        'coffee-from-home': ['g10'],
      },
    },
    primerPhrases: ['fm-s1-1', 'fm-s1-2', 'fm-s1-5'], // صباح الخير / صباح النور / أنا يديد هني
    scenes: [
      {
        id: 'scene1', kind: 'language', charName: 'Faisal', charGender: 'male', setting: 'Staff room — 7:45 AM, your first day',
        arabic: 'صباح الخير! انت يديد؟',
        roman: 'sabaah il-khair! inta ydiid?',
        english: 'Good morning! Are you new?',
        addressesLearner: true,
        femaleLearner: { arabic: 'صباح الخير! انتي يديدة؟', roman: 'sabaah il-khair! inti ydiida?', english: 'Good morning! Are you new?' },
        teachingNote: 'يديد is جديد (new) with the Emirati ج→ي sound. To a woman, Faisal says انتي يديدة. The reply to صباح الخير has its own form — it is not صباح الخير back.',
        choices: [
          { id: 'a', text: 'Morning of light!', arabic: 'صباح النور!', roman: 'sabaah in-nuur!', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'excellent', note: 'صباح النور is the answer to صباح الخير. Getting the pair right on your first morning tells Faisal you have been listening, not just memorising.' },
          { id: 'b', text: 'Good morning! Hey there', arabic: 'صباح الخير! هلا فيك', roman: 'sabaah il-khair! hala fiik', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Warm, and in Arabic — Faisal is pleased. But صباح الخير gets صباح النور back, not the same greeting.' },
          { id: 'c', text: '(Nod, eyes on your phone)', arabic: '—', roman: '(a nod, eyes on your phone)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'A greeting in the Gulf asks for a greeting back. Shy or jet-lagged, a nod reads as not interested — and first impressions at work are slow to repair.' },
        ],
      },
      {
        id: 'scene2', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — the coffee corner',
        arabic: 'أنا فيصل. شلونك؟',
        roman: 'ana faisal. shloonak?',
        english: "I'm Faisal. How are you?",
        addressesLearner: true,
        femaleLearner: { arabic: 'أنا فيصل. شلونج؟', roman: 'ana faisal. shloonich?', english: "I'm Faisal. How are you?" },
        teachingNote: 'شلونك to a man, شلونج to a woman. Either way, the answer starts with الحمد لله.',
        choices: [
          { id: 'a', text: 'Thank God, I\'m well! And how are you?', arabic: 'الحمد لله، بخير! وانت شلونك؟', roman: 'il-hamdu lillaah, b-khair! w-inta shloonak?', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'colleague', note: 'Handing the question straight back is the engine of Gulf small talk. You have made this about the two of you, not about your first day.' },
          { id: 'b', text: 'Thank God. Honoured to meet you, Faisal', arabic: 'الحمد لله. تشرفنا يا فيصل', roman: 'il-hamdu lillaah. tsharrafna ya faisal', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'professional', note: 'تشرفنا with his name is a proper, slightly formal introduction. It says you know how to meet people at work — respectful, a little reserved.' },
          { id: 'c', text: 'Fine. (Turn back to the coffee machine)', arabic: 'زين.', roman: 'zain.', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'زين is a real Gulf word, but on its own, with your back turned, it closes the conversation Faisal just opened. In the Gulf, شلونك is an invitation, not a status check.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — Faisal pours two cups',
        arabic: 'تفضل، قهوة. والله تعبان اليوم',
        roman: "tfaddal, gahwa. wallaah ta'baan il-yoom",
        english: "Here, coffee. Honestly, I'm tired today.",
        charDialogue: {
          warm: { arabic: 'تفضل، قهوة عربية. والله تعبان اليوم، بس يلا', roman: "tfaddal, gahwa 'arabiyya. wallaah ta'baan il-yoom, bass yalla", english: "Here, Arabic coffee. Honestly, I'm tired today — but come on." },
          neutral: { arabic: 'تفضل، قهوة. والله تعبان اليوم', roman: "tfaddal, gahwa. wallaah ta'baan il-yoom", english: "Here, coffee. Honestly, I'm tired today." },
          cold: { arabic: 'القهوة هناك.', roman: 'il-gahwa hinaak.', english: "Coffee's over there." },
        },
        warmThreshold: 9, coldThreshold: 3,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'تفضلي، قهوة. والله تعبان اليوم',
          roman: "tfaddali, gahwa. wallaah ta'baan il-yoom",
          english: "Here, coffee. Honestly, I'm tired today.",
          charDialogue: {
            warm: { arabic: 'تفضلي، قهوة عربية. والله تعبان اليوم، بس يلا', roman: "tfaddali, gahwa 'arabiyya. wallaah ta'baan il-yoom, bass yalla", english: "Here, Arabic coffee. Honestly, I'm tired today — but come on." },
            neutral: { arabic: 'تفضلي، قهوة. والله تعبان اليوم', roman: "tfaddali, gahwa. wallaah ta'baan il-yoom", english: "Here, coffee. Honestly, I'm tired today." },
            cold: { arabic: 'القهوة هناك.', roman: 'il-gahwa hinaak.', english: "Coffee's over there." },
          },
        },
        teachingNote: 'تفضل to a man, تفضلي to a woman — it covers "here you are", "come in" and "after you".',
        nextByRoute: { colleague: 'scene4-colleague', professional: 'scene4-professional' },
        choices: [
          { id: 'a', text: 'Thanks! May God give you strength', arabic: 'مشكور! الله يعطيك العافية', roman: "mashkuur! allaah ya'tiik il-'aafya", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'good', route: 'colleague', note: 'الله يعطيك العافية blesses the effort, not just the coffee. Faisal will answer الله يعافيك — learn the pair and you have the most-used exchange in any Gulf workplace.' },
          { id: 'b', text: 'Sorry you\'re worn out! Thanks so much for the coffee', arabic: 'سلامتك! مشكور وايد على القهوة', roman: "salaamtak! mashkuur waayid 'ala il-gahwa", score: 4, impact: { trust: 3, respect: 0, culture: 1 }, outcome: 'good', route: 'colleague', flag: 'ASKED_AFTER_HIM', note: 'سلامتك is what you say when someone isn\'t well. You heard the tired before you reached for the cup — Faisal noticed that you noticed.' },
          { id: 'c', text: 'Thanks. When does the shift start?', arabic: 'مشكور. متى يبدا الدوام؟', roman: 'mashkuur. mita yibda id-dawaam?', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'professional', note: 'دوام is the Gulf word for working hours. Accepting the coffee and asking about the shift reads as someone who came to work — polite, and focused.' },
          { id: 'd', text: 'No thanks, I don\'t drink coffee', arabic: 'لا شكراً، ما أشرب قهوة', roman: 'laa shukran, maa ashrab gahwa', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'Declining hospitality declines the person offering it. If you really can\'t drink coffee, take the cup anyway, or ask for tea.' },
        ],
      },
      {
        id: 'scene4-colleague', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — Faisal checks his phone',
        arabic: 'كلنا نتغدى سوا يوم الخميس. تبي تتغدى ويانا؟',
        roman: 'kullana nitghadda sawa yoom il-khamiis. tabi titghadda wiyyaana?',
        english: 'We all have lunch together on Thursday. Want to join us?',
        addressesLearner: true,
        femaleLearner: { arabic: 'كلنا نتغدى سوا يوم الخميس. تبين تتغدين ويانا؟', roman: 'kullana nitghadda sawa yoom il-khamiis. tabiin titghaddiin wiyyaana?', english: 'We all have lunch together on Thursday. Want to join us?' },
        teachingNote: 'تبي / تبين is the Gulf "do you want". Listen for what comes after an answer, too: إن شاء الله with a day attached is a yes; on its own it is usually a polite no.',
        choices: [
          { id: 'a', text: 'Definitely! Thursday, God willing', arabic: 'أكيد! يوم الخميس إن شاء الله', roman: "akiid! yoom il-khamiis in shaa' allaah", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'colleague', next: 'scene5', note: 'A day attached to إن شاء الله makes it a real yes. Faisal will save you a seat.' },
          { id: 'b', text: 'God willing', arabic: 'إن شاء الله', roman: "in shaa' allaah", score: 2, impact: { trust: -1, respect: 2, culture: 1 }, outcome: 'neutral', route: 'professional', next: 'scene5', note: 'Polite, and Faisal will not push. But a bare إن شاء الله is heard as a soft no — you have kept lunch, and him, at work\'s length.' },
          { id: 'c', text: 'I don\'t like eating with people I don\'t know', arabic: 'ما أحب أتغدى مع ناس ما أعرفهم', roman: "maa ahibb atghadda ma' naas maa a'rifhum", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Shared food is how Gulf workplaces turn strangers into colleagues. Refusing it for that reason refuses exactly what the invitation offers.' },
        ],
      },
      {
        id: 'scene4-professional', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — 7:55 AM',
        arabic: 'المدير يبي يشوفك الساعة ثمان',
        roman: "il-mudiir yibi yishuufak is-saa'a thmaan",
        english: 'The manager wants to see you at eight.',
        addressesLearner: true,
        femaleLearner: { arabic: 'المدير يبي يشوفج الساعة ثمان', roman: "il-mudiir yibi yishuufich is-saa'a thmaan", english: 'The manager wants to see you at eight.' },
        teachingNote: 'يشوفك to a man, يشوفج to a woman — the Emirati feminine ending is -ich.',
        choices: [
          { id: 'a', text: 'OK, thanks. Where is his office, please?', arabic: 'زين، مشكور. وين مكتبه لو سمحت؟', roman: 'zain, mashkuur. wain maktaba law samaht?', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'professional', next: 'scene5', note: 'Calm, practical, and لو سمحت on the question. Faisal points the way and remembers you as someone who does not panic.' },
          { id: 'b', text: 'God help me! What does he want with me on day one?', arabic: 'الله يستر! شو يبي مني في أول يوم؟', roman: 'allaah yistur! shu yibi minni fi awwal yoom?', score: 4, impact: { trust: 2, respect: 0, culture: 2 }, outcome: 'good', route: 'colleague', next: 'scene5', note: 'الله يستر ("God protect us"), said half-joking, makes Faisal laugh and reassure you. Humour made him an ally, even if it was not very businesslike.' },
          { id: 'c', text: 'Now? Let me finish my coffee first', arabic: 'الحين؟ خلني أخلص قهوتي أول', roman: "il-hiin? khallni akhallis gahwati awwal", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Keeping a manager waiting on your first morning says the coffee ranks higher. Go now; the coffee will still be here.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Faisal', charGender: 'male', setting: 'Staff room — Faisal heads out',
        arabic: 'يلا، بالتوفيق!',
        roman: 'yalla, bit-tawfiig!',
        english: 'Come on — good luck!',
        charDialogue: {
          warm: { arabic: 'يلا، بالتوفيق! والله انبسطت', roman: 'yalla, bit-tawfiig! wallaah inbasatt', english: 'Come on — good luck! Honestly, that was nice.' },
          neutral: { arabic: 'يلا، بالتوفيق!', roman: 'yalla, bit-tawfiig!', english: 'Come on — good luck!' },
          cold: { arabic: 'بالتوفيق.', roman: 'bit-tawfiig.', english: 'Good luck.' },
        },
        warmThreshold: 18, coldThreshold: 6,
        teachingNote: 'بالتوفيق ("with success") is answered with a blessing: الله يوفقك, "may God grant you success".',
        nextByRoute: { colleague: 'scene6-colleague', professional: 'scene6-professional' },
        choices: [
          { id: 'a', text: 'May God grant you success', arabic: 'الله يوفقك', roman: 'allaah ywaffgak', score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'RETURNED_THE_BLESSING', note: 'A blessing for a blessing. الله يوفقك sends him into his day the way he sent you into yours.' },
          { id: 'b', text: 'Thanks so much, Faisal!', arabic: 'مشكور وايد يا فيصل!', roman: 'mashkuur waayid ya faisal!', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Warm and personal — using his name helps. But بالتوفيق is a blessing, and in the Gulf a blessing gets one back.' },
          { id: 'c', text: '(Walk off without a word)', arabic: '—', roman: '(you walk off)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'Faisal wished you well and got silence. Even a quick مشكور would have closed the circle.' },
        ],
      },
      {
        id: 'scene6-colleague', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — your shift starts',
        arabic: 'إذا تحتاج أي شي، أنا هني',
        roman: 'idha tihtaaj ay shay, ana hini',
        english: "If you need anything, I'm here.",
        addressesLearner: true,
        femaleLearner: { arabic: 'إذا تحتاجين أي شي، أنا هني', roman: 'idha tihtaajiin ay shay, ana hini', english: "If you need anything, I'm here." },
        teachingNote: 'تحتاج to a man, تحتاجين to a woman. هني is the Emirati "here".',
        choices: [
          { id: 'a', text: 'Tomorrow the coffee\'s on me!', arabic: 'باكر القهوة عليّ!', roman: "baachir il-gahwa 'alayy!", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'colleague', next: null, note: 'Returning a gesture turns a favour into a friendship. باكر is the Emirati "tomorrow" — Egyptians and Levantines say بكرة.' },
          { id: 'b', text: 'Thanks. If I have a question, I\'ll ask you', arabic: 'مشكور. إذا عندي سؤال بسألك', roman: "mashkuur. idha 'indi su'aal bas'alak", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'professional', next: null, note: 'You took the offer seriously and on work\'s terms. The بـ on بسألك is the Gulf future: "I will ask you".' },
          { id: 'c', text: 'No thanks, I know my job', arabic: 'لا مشكور، أعرف شغلي', roman: "laa mashkuur, a'rif shughli", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He offered help, not supervision. Turning it down this way tells a new colleague you will not be asking — and they stop offering.' },
        ],
      },
      {
        id: 'scene6-professional', kind: 'judgement', charName: 'Faisal', charGender: 'male', setting: 'Staff room — your shift starts',
        arabic: 'المدير سأل عنك',
        roman: "il-mudiir sa'al 'annak",
        english: 'The manager was asking about you.',
        addressesLearner: true,
        femaleLearner: { arabic: 'المدير سأل عنج', roman: "il-mudiir sa'al 'annich", english: 'The manager was asking about you.' },
        teachingNote: 'عنك to a man, عنج to a woman: the same Emirati -ich ending as شلونج.',
        choices: [
          { id: 'a', text: 'God willing, he\'s happy with me', arabic: 'إن شاء الله يكون راضي', roman: "in shaa' allaah ykuun raadhi", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'professional', next: null, note: 'Modest, and it hands the outcome to God rather than claiming it. On day one, that reads as confidence without arrogance.' },
          { id: 'b', text: 'God help me! Thanks for telling me', arabic: 'الله يستر! مشكور إنك قلت لي', roman: "allaah yistur! mashkuur innak gilt li", score: 5, impact: { trust: 3, respect: 0, culture: 2 }, outcome: 'good', route: 'colleague', next: null, note: 'You thanked Faisal for looking out for you. The manager can wait; the colleague who warned you just became an ally.' },
          { id: 'c', text: 'Of course — my work is better than everyone\'s', arabic: 'أكيد، شغلي أحسن من الكل', roman: "akiid, shughli ahsan min il-kill", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'Praising yourself in front of a colleague on your first morning sets you against the team. In the Gulf, others praise you; you thank God.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Faisal', charGender: 'male', setting: 'Staff room — end of the shift',
        arabic: 'الله يسلمك. هاي قهوة من البيت، الوالدة سوتها',
        roman: 'allaah yisallmak. haay gahwa min il-bait, il-waalda sawwatha',
        english: 'God keep you. This is coffee from home — my mother made it.',
        teachingNote: 'الله يسلمك is the answer to سلامتك. Faisal remembered that you asked this morning.',
        choices: [
          { id: 'a', text: 'Thank you! May God protect your mother', arabic: 'تسلم! الله يحفظ الوالدة', roman: 'tislam! allaah yihfaz il-waalda', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'تسلم for the gift, and a blessing for the person who made it. Coffee from someone\'s home is trust you do not get on day one — unless you earn it.' },
          { id: 'b', text: 'MashaAllah! May God give her strength', arabic: 'ما شاء الله! الله يعطيها العافية', roman: "maa shaa' allaah! allaah ya'tiiha il-'aafya", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'ما شاء الله admires without inviting envy; الله يعطيها العافية credits his mother\'s effort. Both land exactly right.' },
        ],
      },
    ],
    endings: [
      {
        id: 'coffee-from-home', min: 30, secret: true, requiredFlags: ['ASKED_AFTER_HIM', 'RETURNED_THE_BLESSING'],
        title: 'Coffee From Home', arabic: 'قهوة من البيت', roman: 'gahwa min il-bait', en: 'Coffee from home',
        desc: 'At the end of your shift Faisal comes back with a small flask his mother filled that morning. You asked after him when he said he was tired, and you answered his بالتوفيق with a blessing of your own — two small moments that are easy to rush past. In the Gulf, that is how a colleague becomes someone you would ask for help without thinking twice.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'When someone tells you they are tired, the coffee can wait. And a blessing deserves a blessing back.',
      },
      {
        id: 'the-go-to-colleague', min: 28, route: 'colleague', tier: 'strong',
        title: 'The Go-To Colleague', arabic: 'باكر القهوة عليّ', roman: "baachir il-gahwa 'alayy", en: "Tomorrow the coffee's on me",
        desc: 'Before your shift even starts, Faisal has mentioned the new colleague to two people. You met his warmth with your own and gave something back. When the rota changes or a system breaks, you will know exactly who to ask.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Treat the first morning as people, not paperwork: give back what you are given.',
      },
      {
        id: 'friendly-not-close', min: 12, route: 'colleague', tier: 'weak',
        title: 'Friendly, Not Yet Close', arabic: 'مع السلامة', roman: "ma'a is-salaama", en: 'Goodbye, then',
        desc: 'You leaned toward Faisal as a person, and he noticed. A few exchanges came out half-formed, though, so the warmth has not become a bond yet. He will say hello tomorrow; whether he saves you a seat is still open.',
        color: C.JADE2, type: 'mixed',
        hint: 'Warmth is the right instinct — land the greetings and blessings too, and it sticks.',
      },
      {
        id: 'the-one-to-watch', min: 28, route: 'professional', tier: 'strong',
        title: 'The One to Watch', arabic: 'ما شاء الله', roman: "maa shaa' allaah", en: 'MashaAllah',
        desc: 'When the manager asks how the new starter seems, Faisal says ما شاء الله — polite, serious, knows how things work. You have not made a friend yet, but you have made a reputation, and on day one a reputation travels further.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Show you take the work seriously: ask about the shift, find the manager, keep your word.',
      },
      {
        id: 'polite-not-noticed', min: 12, route: 'professional', tier: 'weak',
        title: 'Polite, Not Yet Noticed', arabic: 'بالتوفيق', roman: 'bit-tawfiig', en: 'Good luck',
        desc: 'You kept things professional, and Faisal respects that. A couple of exchanges fell flat, so nobody is describing you to the manager yet. Neutral is a start, not a result.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Businesslike is fine — but a missed greeting on day one is remembered longer than a good question.',
      },
      {
        id: 'the-cold-start', min: 0,
        title: 'The Cold Start', arabic: 'الله يعين', roman: "allaah y'iin", en: 'God help us',
        desc: 'Faisal tried — a greeting, a coffee, an offer of help. None of it landed. He will not hold it against you, but he will not go out of his way either, and in a new workplace the people who go out of their way are the ones who show you how things really work.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── CAREER 2: THE COFFEE INVITATION ────────────────────────────────────────
  // Route script (spec 2026-09-14), built on the First Morning model.
  //
  // Destinations: `circle` (you become one of the ten o'clock coffee regulars)
  // and `guide` (Hamad, eight years in, starts opening doors for you). Forks at
  // scene3 (the refill) and scene5 (the finale line).
  // Hidden: give the cup the small shake that means "enough" (scene3 c — not the
  // top choice) AND admire his son with ما شاء الله (scene5).
  //
  // NOT NATIVE-REVIEWED. New lines here are authored, not sourced — the phrase
  // sets reuse existing library entries only. See docs/language/reviewer-brief.md.
  'coffee-invitation': {
    id: 'coffee-invitation',
    title: 'The Coffee Invitation',
    estimatedMinutes: 7,
    routes: [
      { id: 'circle', label: 'Part of the circle' },
      { id: 'guide', label: 'A guide at work' },
    ],
    defaultRoute: 'circle',
    phrases: {
      // يلا نشرب قهوة / قهوة / تسلم / ما شاء الله / إي
      core: ['s1', 'f1', 'gr3', 'w2', 'e7'],
      byEnding: {
        // أهل / سوالف / تمر
        'one-of-the-circle': ['fm1', 's9', 'f7'],
        'a-guest-for-now': ['fm1', 's9', 'f7'],
        // إذا ما عليك أمر / ما قصرت / الله يجزاك خير
        'a-good-word': ['a3', 'gr7', 'gr6'],
        'advice-not-yet-a-word': ['a3', 'gr7', 'gr6'],
        // حياك الله — what the one who pours says
        'the-dallah': ['g6'],
      },
    },
    primerPhrases: ['s1', 'gr3', 'w2'], // يلا نشرب قهوة / تسلم / ما شاء الله
    scenes: [
      {
        id: 'scene1', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — week two, the mid-morning break',
        arabic: 'يلا نشرب قهوة؟ انت فاضي؟',
        roman: 'yalla nishrab gahwa? inta faadi?',
        english: 'Come on, coffee? Are you free?',
        addressesLearner: true,
        femaleLearner: { arabic: 'يلا نشرب قهوة؟ انتي فاضية؟', roman: 'yalla nishrab gahwa? inti faadya?', english: 'Come on, coffee? Are you free?' },
        teachingNote: 'فاضي is "free, not busy"; to a woman, فاضية. يلا turns it into an invitation rather than a question.',
        choices: [
          { id: 'a', text: 'Yes, honestly! Let\'s go', arabic: 'إي والله! يلا', roman: 'ii wallaah! yalla', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'circle', note: 'إي والله is a yes with feeling behind it. Dropping what you were doing for his coffee tells Hamad the person comes before the task.' },
          { id: 'b', text: 'Yes — thanks for the invitation', arabic: 'إي، مشكور على العزيمة', roman: "ii, mashkuur 'ala il-'aziima", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', note: 'العزيمة is the invitation itself. Thanking him for it treats the gesture as a gesture — a little formal, and it shows you notice how things are done.' },
          { id: 'c', text: '(Without looking up) Yeah, yeah — a minute', arabic: 'إي إي، دقيقة', roman: 'ii ii, dagiiga', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'An invitation answered without looking up says the work outranks him. You do go — but he has already noticed. Look up, and give him a real answer.' },
        ],
      },
      {
        id: 'scene2', kind: 'language', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad pours from the dallah for the table',
        arabic: 'تفضل، قهوة بالهيل',
        roman: 'tfaddal, gahwa bil-heel',
        english: 'Here you go — coffee with cardamom.',
        addressesLearner: true,
        femaleLearner: { arabic: 'تفضلي، قهوة بالهيل', roman: 'tfaddali, gahwa bil-heel', english: 'Here you go — coffee with cardamom.' },
        teachingNote: 'Arabic coffee is poured a little at a time and topped up. تفضل to a man, تفضلي to a woman.',
        choices: [
          { id: 'a', text: '(Take it in your right hand) Thank you', arabic: 'تسلم', roman: 'tislam', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'excellent', note: 'تسلم — "may you be kept safe" — is the Gulf thanks for something handed to you. The right hand matters as much as the word: it is the hand you give and take with.' },
          { id: 'b', text: 'Thanks', arabic: 'شكراً', roman: 'shukran', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'شكراً works anywhere in the Arab world. When a Gulf colleague hands you something, though, تسلم is what they would say.' },
          { id: 'c', text: 'Why only a little?', arabic: 'ليش شوي بس؟', roman: 'laish shwai bass?', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'The small pour is the hospitality, not stinginess — Arabic coffee comes a little at a time and the host keeps topping it up. Hamad hears a complaint about his coffee.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad goes round the table again',
        arabic: 'تبي بعد؟',
        roman: "tabi ba'd?",
        english: 'Want some more?',
        charDialogue: {
          warm: { arabic: 'حياك الله! تبي بعد؟', roman: "hayyaak allaah! tabi ba'd?", english: 'Good to have you! Want some more?' },
          neutral: { arabic: 'تبي بعد؟', roman: "tabi ba'd?", english: 'Want some more?' },
          cold: { arabic: 'بعد؟', roman: "ba'd?", english: 'More?' },
        },
        warmThreshold: 9, coldThreshold: 3,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'تبين بعد؟',
          roman: "tabiin ba'd?",
          english: 'Want some more?',
          charDialogue: {
            warm: { arabic: 'حياج الله! تبين بعد؟', roman: "hayyaach allaah! tabiin ba'd?", english: 'Good to have you! Want some more?' },
            neutral: { arabic: 'تبين بعد؟', roman: "tabiin ba'd?", english: 'Want some more?' },
            cold: { arabic: 'بعد؟', roman: "ba'd?", english: 'More?' },
          },
        },
        teachingNote: 'تبي / تبين is the Gulf "do you want"; بعد here means "more". Hamad will keep refilling until you give the cup a small shake.',
        nextByRoute: { circle: 'scene4-circle', guide: 'scene4-guide' },
        choices: [
          { id: 'a', text: '(Hold out your cup) Yes — your coffee is good', arabic: 'إي، قهوتك حلوة', roman: 'ii, gahwatak hilwa', score: 7, impact: { trust: 3, respect: 2, culture: 2 }, outcome: 'good', route: 'circle', note: 'Holding the cup out again says you are in no hurry to leave. Praising the coffee praises the person who made it.' },
          { id: 'b', text: '(Hold out your cup) Yes, thanks. Can I ask you something?', arabic: 'إي، تسلم. أقدر أسألك شي؟', roman: "ii, tislam. agdar as'alak shay?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', note: 'He has been here eight years. Using the second cup to ask him something tells Hamad his experience is worth something to you — being asked is taken as respect.' },
          { id: 'c', text: '(Give the cup a small shake) Enough, thanks. Can I ask you something?', arabic: 'بس، تسلم. أقدر أسألك شي؟', roman: "bass, tislam. agdar as'alak shay?", score: 5, impact: { trust: -1, respect: 3, culture: 3 }, outcome: 'good', route: 'guide', flag: 'SHOOK_THE_CUP', note: 'The small shake is how the Gulf says "enough" without a word — Hamad sees you know it. You also cut the coffee a little short to talk, which he notices too.' },
          { id: 'd', text: '(Put the cup down) No, I don\'t want any', arabic: 'لا، ما أبي', roman: 'laa, maa abi', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'ما أبي on its own refuses the host, not the coffee. To stop, give the cup a small shake as you hand it back — it says "enough, thank you" without a word.' },
        ],
      },
      {
        id: 'scene4-circle', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad sits down with the others',
        arabic: 'شلون أهلك؟ كلهم بخير؟',
        roman: 'shloon ahlak? kullhum b-khair?',
        english: 'How is your family? All well?',
        addressesLearner: true,
        femaleLearner: { arabic: 'شلون أهلج؟ كلهم بخير؟', roman: 'shloon ahlich? kullhum b-khair?', english: 'How is your family? All well?' },
        teachingNote: 'أهلك to a man, أهلج to a woman. Family is ordinary small talk in the Gulf — asked about as a whole, الأهل.',
        choices: [
          { id: 'a', text: 'Thank God, well. And how is your family?', arabic: 'الحمد لله، بخير. وأهلك شلونهم؟', roman: 'il-hamdu lillaah, b-khair. w-ahlak shloonhum?', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'circle', next: 'scene5', note: 'Asking back about his family — as a whole — is exactly the right size of question. Hamad starts telling you about his.' },
          { id: 'b', text: 'Thank God. And how is your father?', arabic: 'الحمد لله. والوالد شلونه؟', roman: 'il-hamdu lillaah. w-il-waalid shloona?', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', next: 'scene5', note: 'الوالد — "the father" — is the respectful way to ask after someone\'s dad. Asking after a colleague\'s parents shows you know where respect flows in a Gulf family.' },
          { id: 'c', text: 'And your wife? What\'s her name?', arabic: 'وحرمتك؟ شو اسمها؟', roman: 'w-hurmatak? shu ismha?', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Asking a Gulf man for his wife\'s name crosses a line of privacy, however friendly it is meant. Ask after الأهل and let him share what he wants to.' },
        ],
      },
      {
        id: 'scene4-guide', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad sits down with the others',
        arabic: 'أنا هني من ثمان سنين. اسألني اللي تبي',
        roman: 'ana hini min thmaan siniin. is\'alni illi tabi',
        english: "I've been here eight years. Ask me whatever you like.",
        addressesLearner: true,
        femaleLearner: { arabic: 'أنا هني من ثمان سنين. اسأليني اللي تبين', roman: 'ana hini min thmaan siniin. is\'aliini illi tabiin', english: "I've been here eight years. Ask me whatever you like." },
        teachingNote: 'اللي is the Gulf "whatever / that which". اسألني اللي تبي to a man, اسأليني اللي تبين to a woman.',
        choices: [
          { id: 'a', text: 'If you don\'t mind — who should I get to know here?', arabic: 'إذا ما عليك أمر، منو لازم أتعرف عليه؟', roman: "idha maa 'alaik amur, minu laazim at'arraf 'alaih?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', next: 'scene5', note: 'إذا ما عليك أمر is the politest way to ask for something. And asking who to know lets Hamad introduce you — which puts his name next to yours.' },
          { id: 'b', text: 'First — where are you from?', arabic: 'أول شي، انت من وين؟', roman: 'awwal shay, inta min wain?', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'circle', next: 'scene5', note: 'You turned the offer back to him. For an Emirati, من وين opens his town, his family and a long story — you want to know Hamad, not only what he knows.' },
          { id: 'c', text: 'How do I get promoted fast?', arabic: 'شلون أترقى بسرعة؟', roman: "shloon atraggaa b-sur'a?", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Two weeks in, asking for the shortcut over your first coffee makes the coffee about you. Here the relationship comes first; the doors follow it.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad\'s phone buzzes',
        arabic: 'شوف! ولدي، أول يوم له بالمدرسة',
        roman: 'shuuf! wildi, awwal yoom lah bil-madrasa',
        english: 'Look! My son — his first day at school.',
        charDialogue: {
          warm: { arabic: 'شوف شوف! ولدي سيف، أول يوم له بالمدرسة', roman: 'shuuf shuuf! wildi saif, awwal yoom lah bil-madrasa', english: 'Look, look! My son Saif — his first day at school.' },
          neutral: { arabic: 'شوف! ولدي، أول يوم له بالمدرسة', roman: 'shuuf! wildi, awwal yoom lah bil-madrasa', english: 'Look! My son — his first day at school.' },
          cold: { arabic: 'هذا ولدي. أول يوم بالمدرسة', roman: 'haadha wildi. awwal yoom bil-madrasa', english: "That's my son. First day at school." },
        },
        warmThreshold: 18, coldThreshold: 6,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'شوفي! ولدي، أول يوم له بالمدرسة',
          roman: 'shuufi! wildi, awwal yoom lah bil-madrasa',
          english: 'Look! My son — his first day at school.',
          charDialogue: {
            warm: { arabic: 'شوفي شوفي! ولدي سيف، أول يوم له بالمدرسة', roman: 'shuufi shuufi! wildi saif, awwal yoom lah bil-madrasa', english: 'Look, look! My son Saif — his first day at school.' },
            neutral: { arabic: 'شوفي! ولدي، أول يوم له بالمدرسة', roman: 'shuufi! wildi, awwal yoom lah bil-madrasa', english: 'Look! My son — his first day at school.' },
            cold: { arabic: 'هذا ولدي. أول يوم بالمدرسة', roman: 'haadha wildi. awwal yoom bil-madrasa', english: "That's my son. First day at school." },
          },
        },
        teachingNote: 'Praise for a child, a home or a new car starts with ما شاء الله. The parent answers الله يبارك فيك. شوف to a man, شوفي to a woman.',
        nextByRoute: { circle: 'scene6-circle', guide: 'scene6-guide' },
        choices: [
          { id: 'a', text: 'MashaAllah, God protect him', arabic: 'ما شاء الله، الله يحفظه', roman: "maa shaa' allaah, allaah yihfaza", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'SAID_MASHALLAH', note: 'ما شاء الله admires without inviting envy, and الله يحفظه asks God to keep the boy safe. Hamad answers الله يبارك فيك — and you can see it meant something.' },
          { id: 'b', text: 'So sweet! How old is he now?', arabic: 'والله حلو وايد! كم عمره الحين؟', roman: "wallaah hilu waayid! kam 'umra il-hiin?", score: 3, impact: { trust: 2, respect: 1, culture: 0 }, outcome: 'good', note: 'Warm, and the question keeps him talking. But praise for a child without ما شاء الله can leave a Gulf parent uneasy about the evil eye — say it first, then the compliment.' },
          { id: 'c', text: '(Glance, nod, hand the phone back)', arabic: '—', roman: '(a glance and a nod)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'A father showing you his son\'s first school day is sharing something big. A nod hands it back unopened.' },
        ],
      },
      {
        id: 'scene6-circle', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad rinses the cups',
        arabic: 'كل يوم الساعة عشر، قهوة وسوالف هني. تعال ويانا',
        roman: "kill yoom is-saa'a 'ashar, gahwa w-sawaalif hini. ta'aal wiyyaana",
        english: 'Every day at ten — coffee and a chat, right here. Come join us.',
        addressesLearner: true,
        femaleLearner: { arabic: 'كل يوم الساعة عشر، قهوة وسوالف هني. تعالي ويانا', roman: "kill yoom is-saa'a 'ashar, gahwa w-sawaalif hini. ta'aali wiyyaana", english: 'Every day at ten — coffee and a chat, right here. Come join us.' },
        teachingNote: 'سوالف is easy, rambling conversation. تعال to a man, تعالي to a woman; ويانا is "with us".',
        choices: [
          { id: 'a', text: 'God willing! And tomorrow I\'ll bring dates', arabic: 'إن شاء الله! وباكر أييب تمر', roman: "in shaa' allaah! w-baachir ayiib tamar", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'circle', next: null, note: 'Bringing something to share turns a guest into a regular — and dates are the classic partner to Arabic coffee. أييب is أجيب with the Emirati ج→ي.' },
          { id: 'b', text: 'Sure. Who else comes?', arabic: 'أكيد. منو يشرب ويانا بعد؟', roman: "akiid. minu yishrab wiyyaana ba'd?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', next: null, note: 'Asking who else comes treats the circle as a map of the office — useful, and Hamad will tell you. It keeps the coffee a little closer to work.' },
          { id: 'c', text: 'Every day? That\'s a lot of work time', arabic: 'كل يوم؟ هذا وايد من وقت الدوام', roman: "kill yoom? haadha waayid min wagt id-dawaam", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'The ten o\'clock coffee is not time off — it is where the office actually talks. Counting it as lost time tells the circle you would rather not be in it.' },
        ],
      },
      {
        id: 'scene6-guide', kind: 'judgement', charName: 'Hamad', charGender: 'male', setting: 'Staff room — Hamad rinses the cups',
        arabic: 'باكر بكلم المدير عنك',
        roman: "baachir bakallim il-mudiir 'annak",
        english: "Tomorrow I'll talk to the manager about you.",
        addressesLearner: true,
        femaleLearner: { arabic: 'باكر بكلم المدير عنج', roman: "baachir bakallim il-mudiir 'annich", english: "Tomorrow I'll talk to the manager about you." },
        teachingNote: 'The بـ on بكلم is the Gulf future: "I will talk". عنك to a man, عنج to a woman.',
        choices: [
          { id: 'a', text: 'That\'s so good of you! May God reward you', arabic: 'ما قصرت! الله يجزاك خير', roman: 'maa gassart! allaah yijzaak khair', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'guide', next: null, note: 'ما قصرت thanks him for going out of his way; الله يجزاك خير is the deepest thanks there is. It fits — Hamad is spending his name on you.' },
          { id: 'b', text: 'Don\'t trouble yourself — the coffee was enough', arabic: 'لا تتعب نفسك، القهوة كفاية', roman: "laa tit'ab nafsak, il-gahwa kifaaya", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'circle', next: null, note: 'لا تتعب نفسك is the polite first refusal — Hamad will insist. You have told him the coffee was about him, not what he can do for you.' },
          { id: 'c', text: 'Great — and tell him I want a raise', arabic: 'زين، وقل له أبي زيادة', roman: 'zain, w-gul lah abi ziyaada', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He offered to put his name next to yours. Loading a demand onto it in week two spends his name for him.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Hamad', charGender: 'male', setting: 'Staff room — ten o\'clock the next morning',
        arabic: 'خذ الدلة. اليوم انت تصب',
        roman: 'khudh id-dalla. il-yoom inta tsibb',
        english: 'Take the dallah. Today, you pour.',
        addressesLearner: true,
        femaleLearner: { arabic: 'خذي الدلة. اليوم انتي تصبين', roman: 'khudhi id-dalla. il-yoom inti tsibbiin', english: 'Take the dallah. Today, you pour.' },
        teachingNote: 'The dallah stays in the left hand; cups go out with the right. The eldest is served first — or you start from your right.',
        choices: [
          { id: 'a', text: '(Serve the eldest first) Please, Abu Saeed', arabic: 'تفضل يا بو سعيد', roman: "tfaddal ya bu sa'iid", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'بو سعيد — "father of Saeed" — addresses a man by his eldest son\'s name, with respect. Serving the eldest first honours the whole room.' },
          { id: 'b', text: '(Start from your right) Please, welcome', arabic: 'تفضل، حياك الله', roman: 'tfaddal, hayyaak allaah', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'Starting from the right is the other old rule, and حياك الله welcomes each person as you pour. Done with the right hand, either order is done right.' },
        ],
      },
    ],
    endings: [
      {
        id: 'the-dallah', min: 30, secret: true, requiredFlags: ['SHOOK_THE_CUP', 'SAID_MASHALLAH'],
        title: 'The Dallah', arabic: 'الدلة', roman: 'id-dalla', en: 'The coffee pot',
        desc: 'At ten the next morning, in front of everyone, Hamad hands you the dallah. You gave your cup the small shake that means "enough", and you met his son\'s photo with ما شاء الله — two quiet moments that show someone who has watched how things are done. In the Gulf, the one who pours is the host. Today, that is you.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'Coffee has a language without words — learn how to say "enough". And admire a child the way a Gulf parent hopes to hear it.',
      },
      {
        id: 'one-of-the-circle', min: 28, route: 'circle', tier: 'strong',
        title: 'One of the Circle', arabic: 'قهوة وسوالف', roman: 'gahwa w-sawaalif', en: 'Coffee and conversation',
        desc: 'By Thursday, someone at the ten o\'clock coffee asks where you are when you are late. You took what Hamad offered, asked after his family and brought something back. The coffee circle is where the office news travels first — and now it travels to you.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Stay for the second cup, ask after the family, and bring something to share.',
      },
      {
        id: 'a-guest-for-now', min: 12, route: 'circle', tier: 'weak',
        title: 'A Guest, For Now', arabic: 'يا هلا', roman: 'ya hala', en: 'Welcome',
        desc: 'Hamad likes you, and the invitation stands. A few moments came out awkward, though, so at the ten o\'clock coffee you are still a guest rather than one of the circle. Guests get the coffee; regulars get the news.',
        color: C.JADE2, type: 'mixed',
        hint: 'Warmth is the right instinct — land the small courtesies too: the right thanks for the cup, the right words for his son.',
      },
      {
        id: 'a-good-word', min: 28, route: 'guide', tier: 'strong',
        title: 'A Good Word', arabic: 'الله يجزاك خير', roman: 'allaah yijzaak khair', en: 'May God reward you',
        desc: 'The next morning Hamad mentions you to the manager — by name, with something good attached. You treated his eight years as worth learning from and showed you can follow how things are done. In the Gulf, a good word from the right person opens doors a CV cannot.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Treat his years here as worth learning from: ask politely, ask who to know, and take help with a blessing.',
      },
      {
        id: 'advice-not-yet-a-word', min: 12, route: 'guide', tier: 'weak',
        title: 'Advice, Not Yet a Word', arabic: 'إن شاء الله خير', roman: "in shaa' allaah khair", en: 'God willing, good things',
        desc: 'Hamad gave you good advice and meant it. A few exchanges fell flat, though, so he is not ready to put his name next to yours with the manager yet. Advice is free; a good word is earned.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Asking is the right instinct — show him you have learned how things are done here, and the word follows.',
      },
      {
        id: 'just-a-coffee', min: 0,
        title: 'Just a Coffee', arabic: 'الله يسهل', roman: 'allaah ysahhil', en: 'God make it easy',
        desc: 'Hamad finished his cup, rinsed it and went back to work. Nothing went badly wrong, but nothing landed either — and a coffee invitation that goes nowhere is not always offered again.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SOCIAL 3: EID GREETINGS ─────────────────────────────────────────────────
  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    phrases: { core: ['eid-1', 'eid-2', 'eid-3', 'eid-4', 'eid-5', 'eid-6', 'core-3'], byEnding: {} },
    primerPhrases: ['eid-1', 'eid-3', 'eid-6'], // عيدكم مبارك / يسلموا إيديك / بيتنا بيتك
    scenes: [
      {
        id: 'scene1', charName: 'Uncle Rashid', charGender: 'male', setting: 'Neighbourhood — Eid morning',
        arabic: 'عيدكم مبارك! تعالوا عندنا',
        roman: "eidkum mubaarak! ta'aalaw 'indna",
        english: 'Blessed Eid to you! Come visit us.',
        choices: [
          { id: 'a', text: 'Thanks! Maybe later — I have plans', arabic: 'مشكور! يمكن بعدين — عندي خطة', roman: "mashkuur! yimkin ba'dayn — 'indi khatta", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, note: 'Declining an Eid invitation is like refusing a family embrace. This day is about togetherness.', outcome: 'bad' },
          { id: 'b', text: 'Blessed Eid! I\'ll definitely come by', arabic: 'عيدكم مبارك! أكيد بمر عليكم', roman: "'eidkum mubaarak! akiid bamurr 'alaykum", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'You returned the Eid greeting and actually committed. أكيد بمر عليكم is a yes — a bare إن شاء الله here would have been heard as a polite no, and on Eid morning that stings.', outcome: 'good' },
          { id: 'c', text: 'May every year find you well!', arabic: 'كل عام وأنتم بخير!', roman: "kul 'aam wa antum b-khayr!", score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'Correct and heard everywhere on Eid — nobody will blink. It is simply the all-purpose greeting that also covers Ramadan and the new year, where عيدكم مبارك marks this specific day. Rashid notices the difference, but only as a shade.', outcome: 'good' },
          { id: 'd', text: 'Blessed Eid, and may you live to see it again! Honoured, truly', arabic: 'عيدكم مبارك وعساكم من عواده! تشرفنا والله', roman: "'eidkum mubaarak wa 'asaakum min 'uwwaadah! tsharrafna wallah", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, flag: 'EID_GREETING_MASTERED', note: 'وعساكم من عواده — "may you be among those who see it again" — is the traditional Gulf follow-up almost no non-native learns. Saying it marks you as someone who has been listening for years.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Uncle Rashid', charGender: 'male', setting: 'Rashid\'s home — living room',
        arabic: 'تفضل — هذي حلويات العيد. ذوق',
        roman: "tfaddal — hadhi halawiyyaat al-'eid. dhoog",
        english: 'Please — these are Eid sweets. Try some.',
        charDialogue: {
          warm: { arabic: 'يا هلا هلا! تفضل — هذي حلويات العيد. زوجتي سوّتها من أمس. ذوق وقولي رأيك', roman: "ya hala hala! tfaddal — hadhi halawiyyaat al-'eid. zawjati sawwatha min ams. dhoog w-gulli ra'yak", english: "Welcome, welcome! Please — these are Eid sweets. My wife made them yesterday. Try some and tell me what you think." },
          neutral: { arabic: 'تفضل — هذي حلويات العيد. ذوق', roman: "tfaddal — hadhi halawiyyaat al-'eid. dhoog", english: "Please — these are Eid sweets. Try some." },
          cold: { arabic: 'تفضل. فيه حلويات.', roman: "tfaddal. fii halawiyyaat.", english: "Please. There are sweets." },
        },
        warmThreshold: 6, coldThreshold: 1,
        choices: [
          { id: 'a', text: 'No thanks, I\'m watching my sugar intake', arabic: 'لا شكراً، أنا محافظ على السكر', roman: "la shukran, ana muhaafit 'ala as-sukkar", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Refusing Eid sweets is like refusing the celebration itself. Always accept hospitality.', outcome: 'bad' },
          { id: 'b', text: 'Thank you! They look delicious', arabic: 'مشكور! شكلها لذيذة', roman: "mashkuur! shakilha ladhiidha", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, note: 'You accepted and complimented — the right instincts. But شكلها لذيذة praises the plate, not the person. On Eid these were made by hand days in advance; the phrases that honour that are بسم الله before the first bite and يسلموا إيديك for whoever made them.', outcome: 'good' },
          { id: 'c', text: 'In God\'s name — bless your hands, uncle', arabic: 'بسم الله — يسلموا إيديك يا عمي', roman: "bismillah — yislamu ideik ya 'ammi", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'بسم الله before eating, then يسلموا إيديك — blessing the hands that did the work. يا عمي is the warm, correct way to address an older man who is not a relative.', outcome: 'good' },
          { id: 'd', text: 'In God\'s name — mashaAllah! God give you all strength', arabic: 'بسم الله — ما شاء الله! الله يعطيكم العافية', roman: "bismillah — maa shaa' allah! allah ya'tiikum al-'aafya", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, flag: 'HONOURED_THE_HOSPITALITY', note: 'بسم الله, then ما شاء الله on the spread, then a blessing on the whole household with the plural يعطيكم — which credits whoever did the baking without you having to ask about his wife directly.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Uncle Rashid', charGender: 'male', setting: 'Rashid\'s doorstep — farewell',
        arabic: 'الله يبارك فيك. بيتنا بيتك دايماً',
        roman: "allah ybaarak fiik. baitna baitak daayiman",
        english: 'God bless you. Our home is always your home.',
        charDialogue: {
          warm: { arabic: 'الله يبارك فيك يا ولدي. والله انبسطنا بيك اليوم. بيتنا بيتك دايماً — ما هو كلام', roman: "allah ybaarak fiik ya waladi. wallah inbasatna biik al-yoom. baitna baitak daayiman — maa huu kalaam", english: "God bless you, my son. By God, we were so happy to have you today. Our home is always your home — and I mean it." },
          neutral: { arabic: 'الله يبارك فيك. بيتنا بيتك دايماً', roman: "allah ybaarak fiik. baitna baitak daayiman", english: "God bless you. Our home is always your home." },
          cold: { arabic: 'الله يسلمك. مع السلامة.', roman: "allah yisallmak. ma'a as-salaama.", english: "God keep you safe. Goodbye." },
        },
        warmThreshold: 11, coldThreshold: 2,
        choices: [
          { id: 'a', text: 'Thanks! See you around', arabic: 'مشكور! نشوفك', roman: "mashkuur! nishuufak", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Uncle Rashid just said "بيتنا بيتك دايماً" — your house is always our house. This is one of the warmest things a Gulf Arab can say to someone outside the family. It means: you belong here. Responding with "مشكور! نشوفك" (thanks, see you) is the social equivalent of someone handing you a gift and you pocketing it without looking at it. The farewell needed to honour the size of what he offered.', outcome: 'bad' },
          { id: 'b', text: 'الله يبارك فيك — شكراً على كرمكم', arabic: 'الله يبارك فيك — شكراً على كرمكم', roman: "allah ybaarak fiik — shukran 'ala karamkum", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Thanking their generosity while returning the blessing is respectful.', outcome: 'good' },
          { id: 'c', text: 'That was really nice, thank you so much', arabic: 'كان حلو وايد، مشكور', roman: "kaan hilw waayid, mashkuur", score: 3, impact: { trust: 2, respect: 0, culture: -1 }, note: '⚖️ Plainly sincere, and Rashid hears that — trust rises. But he offered you belonging and you answered with a compliment. In Gulf farewells, a blessing returned for a blessing given is what closes the circle.', outcome: 'neutral' },
          { id: 'd', text: 'جزاكم الله خير — أنتم أهلي هنا والله. كل عام وأنتم بخير', arabic: 'جزاكم الله خير — أنتم أهلي هنا. كل عام وأنتم بخير', roman: "jazaakum allah khair — antum ahli hini wallah. kul 'aam wa antum b-khayr", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"May God reward you — you are my family here. May every year find you well." You\'ve become part of the neighbourhood.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      {
        id: 'adopted-family', min: 22, title: 'Adopted Family', arabic: 'أنت ولدنا', roman: "inta waldna",
        en: 'You are our child',
        desc: 'Uncle Rashid declares you family. In Gulf culture, being called "ولدنا" (our child) by an elder is not a figure of speech — it is a formal declaration of belonging. You will never spend another Eid alone.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: [
          'You returned "عيدكم مبارك" with "وعساكم من عواده" — the traditional follow-up that most non-natives never learn',
          'You said "بسم الله" before touching the sweets and blessed the household with الله يعطيكم العافية — treating the food as the act of love it was',
          'You closed with "جزاكم الله خير — أنتم أهلي هنا" — telling Rashid his family filled a gap you actually felt',
          'Eid is the one day that tests everything: greeting, hospitality, farewell. You passed every stage.',
        ],
      },
      {
        id: 'neighbourhood-welcome', min: 13, title: 'Neighbourhood Welcome', arabic: 'أهلاً فيك دايماً', roman: "ahlan fiik daayiman",
        en: 'Always welcome',
        desc: 'Rashid tells the neighbours about you. In close-knit Emirati neighbourhoods, word travels fast — you will find doors opening before you even knock.',
        color: C.JADE2, type: 'success',
        culturalJourney: [
          'You returned the greeting in Arabic and committed to the visit instead of hedging',
          'You accepted the sweets with warmth — refusing hospitality on Eid is culturally impossible',
          'A genuine farewell sealed the visit — Rashid will remember you at the next celebration',
        ],
      },
      {
        id: 'polite-visitor', min: 3, title: 'Polite Visitor', arabic: 'تفضل وقت ما تبي', roman: "tfaddal wagt ma tabi",
        en: 'Come whenever you like',
        desc: 'A nice visit, but it felt more like a courtesy call than a connection. Rashid was generous — he always is — but the warmth did not become a bond.',
        color: C.VIOLET2, type: 'mixed',
      },
      {
        id: 'missed-blessing', min: 0, title: 'Missed Blessing', arabic: 'الله كريم', roman: "allah kariim",
        en: 'God is generous',
        desc: 'Uncle Rashid smiles politely. "الله كريم" (God is generous) is what Gulf Arabs say when something disappointing happens and they choose grace over complaint. He chose grace.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SOCIAL 1: TAXI RIDE ─────────────────────────────────────────────────────
  'social_taxi_ride': {
    id: 'social_taxi_ride',
    title: 'The Taxi Ride',
    subtitle: 'Airport → Hotel, nighttime',
    kafIntro: 'You just landed in Dubai. Your driver Youssef is Egyptian — warm, chatty, and ready to talk. He speaks Egyptian; you answer in Gulf Arabic. Learning to hold that conversation is the whole point.',
    iconName: 'car',
    estimatedMinutes: 8,
    phrases: { core: ['tx-1', 'tx-2', 'tx-3', 'core-2', 'core-3'], byEnding: {} },
    primerPhrases: ['tx-1', 'tx-3', 'core-2'], // الله يحفظ عائلتك / شو يابك دبي؟ / شخبارك؟
    scenes: [
      {
        id: 'c1', charName: 'Youssef', charGender: 'male', setting: 'Dubai Airport pickup',
        arabic: 'أهلاً وسهلاً! أنا يوسف، السواق بتاعك. تعال تعال يا باشا!',
        roman: "ahlan wa sahlan! ana yusuf, as-suwwaq bita'ak. ta'aal ta'aal ya basha!",
        english: "Welcome! I'm Youssef, your driver. Come, come, boss!",
        teachingNote: "Youssef speaks Egyptian — بتاعك (yours) where a Gulf speaker says حقّك, and يا باشا as a friendly 'boss'. You do not need to imitate him. Understand Egyptian, answer in Khaleeji: that is exactly how Dubai actually works.",
        choices: [
          { id: 'a', text: 'Hello Youssef! How are you doing?', arabic: 'هلا يا يوسف! شلونك؟', roman: 'hala ya yusuf! shloonak?', score: 3, impact: { trust: 2, respect: 2, culture: 2 }, note: "شلونك is the Gulf 'how are you' — Youssef would say إزيك, and a Levantine would say كيفك. Answering him in Khaleeji is not a mismatch; it is you speaking your own Arabic. His eyebrows jump up and he grabs your bag before you can protest.", outcome: 'excellent', next: 'c2_open' },
          { id: 'b', text: 'Hello, thanks', arabic: 'هلا، مشكور', roman: 'hala, mashkuur', score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: 'هلا and مشكور are both solidly Gulf — short but genuine. (مرحبا would have been Levantine, and شكراً is the textbook form.) Youssef nods approvingly and opens the back door.', outcome: 'good', next: 'c2_open' },
          { id: 'c', text: 'Just nod, hand him your bag', arabic: '—', roman: '(you nod and get in the car)', score: -1, impact: { trust: -1, respect: -1, culture: -1 }, note: "Youssef's grin shrinks a little. He loads your bag quietly, glancing at you in the rearview mirror as he starts driving.", outcome: 'bad', next: 'c2_effort' },
        ],
      },
      {
        id: 'c2_open', charName: 'Youssef', charGender: 'male', setting: 'On Sheikh Zayed Road',
        arabic: 'قولي يا حبيبي — اسمك إيه وانت منين أصلاً؟',
        roman: "'uli ya habibi — ismak eh w-inta minein aslan?",
        english: "Tell me habibi — what's your name and where are you originally from?",
        teachingNote: "Two Egyptian markers to recognise: قولي comes out as 'uli — the ق drops to a glottal stop, where Gulf keeps a hard g (gul). And منين (minein) is Egyptian for 'from where'; you would say من وين (min wayn).",
        choices: [
          { id: 'a', text: "I'm [name]. I'm from Portugal", arabic: 'أنا [name]. أنا من البرتغال', roman: 'ana [name]. ana min al-burtughaal', score: 3, impact: { trust: 2, respect: 2, culture: 2 }, note: "Youssef nearly swerves the car. He slaps the steering wheel and turns around with wide eyes.", outcome: 'excellent', next: 'c3_ronaldo', teachingHighlight: "البرتغال (al-Burtughaal) — country names shift in Arabic. Portugal becomes al-Burtughaal." },
          { id: 'b', text: "I'm [name]. And you — you're Egyptian?", arabic: 'أنا [name]. وانت؟ مصري صح؟', roman: 'ana [name]. w-inta? masri sah?', score: 2, impact: { trust: 2, respect: 1, culture: 1 }, note: "Recognising someone's dialect is a compliment everywhere in the Gulf — it says you were listening closely enough to place him. Youssef laughs and taps his chest proudly.", outcome: 'good', next: 'c3_dubai' },
          { id: 'c', text: "I'm from Europe", arabic: 'أنا من أوروبا', roman: 'ana min uurubba', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "A whole continent is not an answer. Youssef squints at the mirror, trying to read you, lets out a small laugh and moves on.", outcome: 'neutral', next: 'c3_dubai' },
        ],
      },
      {
        id: 'c2_effort', charName: 'Youssef', charGender: 'male', setting: 'Breaking the silence',
        arabic: 'أول مرة في دبي ولا جاي قبل كدا؟',
        roman: 'awwil marra fi dubai wala gay abl kida?',
        english: 'First time in Dubai or have you been before?',
        teachingNote: "'جاي قبل كدا' (gaay abl kida) is Egyptian for 'been here before'. In Gulf Arabic that idea comes out as ييت من قبل (yeet min gabil) — جاء becomes ياء, the same يـ-for-جـ swap you hear in يديد.",
        choices: [
          { id: 'a', text: 'First time! Everything is new to me', arabic: 'أول مرة! كل شي يديد عليّ', roman: "awwal marra! kil shay ydiid 'alayy", score: 2, impact: { trust: 1, respect: 1, culture: 1 }, note: "يديد instead of جديد is pure Emirati and Youssef will clock it instantly. He lights up — a first-timer is his favourite kind of passenger.", outcome: 'good', next: 'c3_dubai' },
          { id: 'b', text: "I've been before", arabic: 'ييت من قبل', roman: 'yeet min gabil', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef nods slowly. Not much to work with, but he's not giving up yet.", outcome: 'neutral', next: 'c3_dubai' },
        ],
      },
      {
        id: 'c3_ronaldo', charName: 'Youssef', charGender: 'male', setting: 'The football moment',
        arabic: 'البرتغال يعني... رونالدو! طبعاً بتحبه صح؟ أحسن لاعب في التاريخ!',
        roman: "al-burtughaal ya'ni... ronaldo! tab'an bithibbu sah? ahsan laa'ib fi at-taariikh!",
        english: 'Portugal means... Ronaldo! Obviously you love him right? Best player in history!',
        teachingNote: "A real social fork. Enthusiastic agreement wins the moment and costs a little honesty; a nuanced opinion earns more lasting respect. Watch the meters move in different directions here — that is deliberate.",
        choices: [
          { id: 'a', text: 'Of course! Ronaldo is number one!', arabic: 'طبعاً! رونالدو رقم واحد!', roman: "tab'an! ronaldo ragam waahid!", score: 3, impact: { trust: -1, respect: 2, culture: 3 }, note: "⚖️ Youssef ERUPTS — horn, steering wheel, the lot. Matching someone's enthusiasm is genuine social skill and it reads as culturally fluent. But you did not mean it, and reflexive agreement is a habit that quietly costs you later.", outcome: 'good', next: 'c4' },
          { id: 'b', text: "Haha... I'm with Messi honestly", arabic: 'هههه... أنا مع ميسي بصراحة', roman: "hahaha... ana ma'a messi b-saraaha", score: 2, impact: { trust: 3, respect: 1, culture: 1 }, note: "بصراحة (honestly) is a licence to disagree without offence — it flags that you are being straight with someone, not picking a fight. Youssef freezes for three seconds, then shakes his head like you insulted his mother's cooking. He respects it.", outcome: 'good', next: 'c4' },
          { id: 'c', text: "I don't really follow football", arabic: 'ما أتابع كورة وايد', roman: "ma ataabi' koora waayid", score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Honest but a conversational dead end. Youssef deflates like someone let the air out of him and stares at the road.", outcome: 'neutral', next: 'c4' },
          { id: 'd', text: "He's good but not the best", arabic: 'كويس بس مو الأحسن', roman: "kwayyis bas muu il-ahsan", score: 1, impact: { trust: 2, respect: 2, culture: 2 }, note: "مو is the Gulf negator for adjectives — مو الأحسن, not ما الأحسن. A nuanced take delivered warmly is the sweet spot: honest without deflating him. Youssef sizes you up in the mirror with new respect.", outcome: 'excellent', next: 'c4' },
        ],
      },
      {
        id: 'c3_dubai', charName: 'Youssef', charGender: 'male', setting: 'Passing the Marina',
        arabic: 'شايف المارينا دي؟ أنا لما جيت دبي أول مرة من ٨ سنين — مكانش فيه أي حاجة هنا!',
        roman: "shayif al-marina di? ana lamma geit dubay awwil marra min 8 sineen — makansh fiiha ay haaga hina!",
        english: "See this Marina? When I first came to Dubai 8 years ago — there was nothing here!",
        teachingNote: "'من ٨ سنين' (min 8 sineen) is Egyptian for '8 years ago'; you would say من ٨ سنوات. Note هنا (hina) too — the Gulf form is هني (hini).",
        choices: [
          { id: 'a', text: 'MashaAllah! Eight years — Dubai became your home', arabic: 'ما شاء الله! ثمان سنوات — صارت دبي بيتك', roman: "maa shaa' allah! thamaan sanawaat — saarat dubay baitak", score: 3, impact: { trust: 2, respect: 2, culture: 2 }, note: "Naming what someone built rather than what they lost is the warmest move available here. Something softens in Youssef's face — he wasn't expecting it.", outcome: 'excellent', next: 'c4' },
          { id: 'b', text: 'Is your family here or in Egypt?', arabic: 'أهلك هني ولا في مصر؟', roman: "ahlak hini walla fi masr?", score: 2, impact: { trust: 2, respect: 1, culture: 1 }, note: "أهل is the everyday Gulf word for family — warmer and far more common than عائلة. And هني, not هنا. Youssef flashes a phone photo of two kids in school uniforms at the next red light.", outcome: 'good', next: 'c4' },
          { id: 'c', text: 'Yeah, Dubai changed a lot', arabic: 'إي، دبي تغيرت وايد', roman: "ii, dubay tghayyarat waayid", score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "True, but flat. He agrees, nods, and goes back to the road.", outcome: 'neutral', next: 'c4' },
        ],
      },
      {
        id: 'c4', charName: 'Youssef', charGender: 'male', setting: 'Near Business Bay',
        arabic: 'وانت — إيه اللي جابك دبي؟ شغل ولا سياحة؟',
        roman: "w-inta — eh illi gaabak dubay? shughl walla siyaaha?",
        english: 'And you — what brought you to Dubai? Work or tourism?',
        teachingNote: "Egyptian asks إيه اللي جابك (eh illi gaabak). The Gulf version of exactly this question is شو يابك (shu yaabak) — جاب becomes ياب, the same swap as يديد. Same question, two accents.",
        choices: [
          { id: 'a', text: 'Work. Got any good Dubai stories?', arabic: 'شغل. عندك سوالف حلوة من دبي؟', roman: "shughl. 'indak sawaalif hilwa min dubay?", score: 3, impact: { trust: 2, respect: 2, culture: 2 }, note: "سوالف is the Gulf word for stories and chat — much more natural here than قصص. Youssef's face lights up: nobody ever asks him for HIS stories.", outcome: 'excellent', next: 'c5' },
          { id: 'b', text: 'Work. Thank God', arabic: 'شغل. الحمد لله', roman: 'shughl. al-hamdu lillah', score: 2, impact: { trust: 1, respect: 1, culture: 1 }, note: "Short, but الحمد لله is the right closer — it turns a bare fact into contentment. Youssef nods respectfully.", outcome: 'good', next: 'c5' },
          { id: 'c', text: 'A bit of tourism', arabic: 'سياحة شوي', roman: 'siyaaha shway', score: 1, impact: { trust: 0, respect: 1, culture: 0 }, note: "شوي is the Gulf 'a little' (Egyptians say شوية). Youssef immediately switches to tour-guide mode, pointing at everything.", outcome: 'neutral', next: 'c5' },
          { id: 'd', text: 'Glance at your phone, half-answer', arabic: '—', roman: '(you check your phone and give a vague nod)', score: -2, impact: { trust: -1, respect: -1, culture: -1 }, note: "Youssef catches the phone check in the mirror. The energy drains from the car. He turns up the radio.", outcome: 'bad', next: 'c5' },
        ],
      },
      {
        id: 'c5', charName: 'Youssef', charGender: 'male', setting: 'Hotel arrival',
        arabic: 'يا بطل — وصلنا! والله كانت رحلة حلوة. لو احتجت أي حاجة في دبي — كلمني!',
        roman: "ya batal — wasalna! wallah kaanit rihla hilwa. law ihtagt ay haaga fi dubay — kallimni!",
        english: "Champ — we're here! Wallahi it was a nice ride. If you need anything in Dubai — call me!",
        charDialogue: {
          warm: { arabic: 'يا بطل — وصلنا! والله رحلة حلوة قوي، بجد. لو احتجت أي حاجة في دبي — كلمني، أنا أخوك!', roman: "ya batal — wasalna! wallah rihla hilwa 'awi, bi-gadd. law ihtagt ay haaga fi dubay — kallimni, ana akhuuk!", english: "Champ — we're here! Honestly, a really lovely ride. If you need anything in Dubai — call me, I'm your brother!" },
          neutral: { arabic: 'يا بطل — وصلنا! والله كانت رحلة حلوة. لو احتجت أي حاجة في دبي — كلمني!', roman: "ya batal — wasalna! wallah kaanit rihla hilwa. law ihtagt ay haaga fi dubay — kallimni!", english: "Champ — we're here! Wallahi it was a nice ride. If you need anything in Dubai — call me!" },
          cold: { arabic: 'وصلنا. مع السلامة.', roman: "wasalna. ma'a as-salaama.", english: "We're here. Goodbye." },
        },
        warmThreshold: 15, coldThreshold: 3,
        teachingNote: "قوي ('awi) is Egyptian for 'very' — the Gulf equivalent is وايد (waayid). By now you should be able to hear which is which without being told.",
        choices: [
          { id: 'a', text: 'God keep you safe, Youssef! May God protect your family', arabic: 'الله يسلمك يا يوسف! الله يحفظ أهلك', roman: "allah yisallmak ya yusuf! allah yihfaz ahlak", score: 4, impact: { trust: 3, respect: 3, culture: 3 }, note: "Blessing a man's family lands deeper than thanking him — especially with someone whose family is the whole reason he is here. Youssef goes still, then grabs your hand with both of his.", outcome: 'excellent' },
          { id: 'b', text: 'Thanks Youssef! Take care of yourself', arabic: 'مشكور يا يوسف! خلي بالك من نفسك', roman: "mashkuur ya yusuf! khalli baalak min nafsak", score: 2, impact: { trust: 1, respect: 1, culture: 1 }, note: "Warm and personal — using his name is what lifts it above a generic thanks. He gives you a genuine smile and a wave.", outcome: 'good' },
          { id: 'c', text: 'Thanks', arabic: 'مشكور', roman: 'mashkuur', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef gives a polite nod. Another passenger, another ride. The door closes.", outcome: 'neutral' },
          { id: 'd', text: 'Leave without a word', arabic: '—', roman: '(you get out, grab your bag and walk away)', score: -2, impact: { trust: -1, respect: -1, culture: -1 }, note: "Youssef watches you walk into the hotel without looking back. He sits there for a moment, then mutters to himself.", outcome: 'bad' },
        ],
      },
    ],
    endings: [
      { id: 'best-ride-ever', min: 24, title: 'Best Ride Ever', arabic: 'أحسن رحلة!', roman: "ahsan rihla!", en: 'What a ride!', desc: "You didn't just take a taxi — you made a friend. Youssef gave you his number and will genuinely pick up when you call. You also did something harder than it looks: you understood Egyptian and answered in Khaleeji, all the way to the hotel.", color: C.JADE_ACCENT, type: 'exceptional' },
      { id: 'good-chat', min: 13, title: 'Good Chat', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa', en: 'Nice conversation', desc: "A genuinely pleasant ride. Youssef enjoyed talking to you and wished you well.", color: C.JADE2, type: 'success' },
      { id: 'forgettable-ride', min: 3, title: 'Forgettable Ride', arabic: 'رحلة عادية', roman: "rihla 'aadiyya", en: 'Just a ride', desc: "Youssef drove you to the hotel. That's about it. Another passenger in a long day of passengers.", color: C.VIOLET2, type: 'mixed' },
      { id: 'awkward-silence', min: 0, title: 'Awkward Silence', arabic: 'سكوت محرج', roman: 'sukoot muhrij', en: 'Uncomfortable silence', desc: "Youssef gave up trying. The last 20 minutes were just Amr Diab on the radio and the sound of traffic.", color: C.ERROR, type: 'failed' },
    ],
  },

  // ── SOCIAL 2: THE ELEVATOR ──────────────────────────────────────────────────
  'social_elevator': {
    id: 'social_elevator',
    title: 'The Elevator',
    subtitle: 'Apartment building, evening',
    kafIntro: "You meet someone in your building elevator. Sami is Jordanian — reserved at first. This is Level 1: short phrases, simple choices. He speaks Levantine, you answer in Gulf Arabic. Noticing the difference is the lesson.",
    iconName: 'building',
    estimatedMinutes: 6,
    phrases: { core: ['el-1', 'el-2', 'el-3', 'el-4', 'core-2'], byEnding: {} },
    primerPhrases: ['el-1', 'el-3', 'el-4'], // السلام عليكم / تعال على شاي / انت في أي دور؟
    scenes: [
      {
        id: 'c1', charName: 'Sami', charGender: 'male', setting: 'Elevator — ground floor',
        arabic: '...',
        roman: '(he glances up from his phone)',
        english: 'The elevator doors are closing. Inside, a guy around your age glances up from his phone.',
        teachingNote: "السلام عليكم is the one greeting that works in every Arabic dialect and every country. The answer is always وعليكم السلام. When you are unsure of anything else, this pair never fails.",
        choices: [
          { id: 'a', text: 'Peace be upon you', arabic: 'السلام عليكم', roman: "as-salaamu 'alaykum", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: 'His face softens immediately. He straightens up and pockets his phone. This greeting carries weight everywhere — it is never too formal and never too casual.', outcome: 'excellent', next: 'c2' },
          { id: 'b', text: 'Hey there', arabic: 'هلا', roman: 'hala', score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: 'هلا is the Gulf casual hello — friendly and correct. (Sami would say مرحبا; that is the Levantine one.) He nods back with a small smile and lowers his phone.', outcome: 'good', next: 'c2' },
          { id: 'c', text: 'Enter without acknowledging', arabic: '—', roman: '(you step in, face the doors, say nothing)', score: -1, impact: { trust: -1, respect: -1, culture: -1 }, note: 'He glances at you, then back at his phone. The elevator hums. Neither of you moves.', outcome: 'bad', next: 'c2' },
        ],
      },
      {
        id: 'c2', charName: 'Umm Yousef', charGender: 'female', setting: 'Elevator — floor 5, a neighbour and her son step in',
        arabic: 'يلا حبيبي، قول السلام',
        roman: "yalla habiibi, guul as-salaam",
        english: "Come on sweetheart, say salam",
        teachingNote: "A neighbour nudges her small son to greet you. Leaving any السلام عليكم unanswered is noticed across the whole Arab world — leaving a child's unanswered is noticed more. Sami is watching how you handle it.",
        choices: [
          { id: 'a', text: 'And peace be upon you, champ!', arabic: 'وعليكم السلام يا بطل!', roman: "wa 'alaykum as-salaam ya batal!", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: "يا بطل (champ) to a small boy is exactly the right register — warm, playful, and very Gulf. The boy beams, his mother mouths a thank you, and Sami watches with a slight grin.", outcome: 'excellent', next: 'c3' },
          { id: 'b', text: 'And peace be upon you', arabic: 'وعليكم السلام', roman: "wa 'alaykum as-salaam", score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: 'Correct and complete — you returned the greeting, which is the part that matters. The boy hides behind his mother\'s leg.', outcome: 'good', next: 'c3' },
          { id: 'c', text: "Don't respond to the child", arabic: '—', roman: '(you smile faintly and look back at the doors)', score: -1, impact: { trust: -1, respect: -1, culture: -1 }, note: "The boy's face drops. Sami's expression flattens — he noticed you left a child hanging.", outcome: 'bad', next: 'c3' },
        ],
      },
      {
        id: 'c3', charName: 'Sami', charGender: 'male', setting: 'Elevator — floor 9, the neighbour exits',
        arabic: 'مع السلامة! … طلعنا لحالنا',
        roman: "ma'a as-salaama! … tili'na la-haalna",
        english: "Goodbye! … Looks like it's just us now.",
        teachingNote: "دور (door) is the Gulf word for floor; Sami would say طابق (taabeq). Both are understood everywhere in Dubai — use the Gulf one and you will still be answered in Levantine.",
        choices: [
          { id: 'a', text: 'Which floor are you on?', arabic: 'انت في أي دور؟', roman: "inta fi ay door?", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: 'A small question that does real work — it converts standing silently beside someone into a conversation. He looks surprised, then amused, and points at the already-lit 17.', outcome: 'excellent', next: 'c4' },
          { id: 'b', text: "We're still going up", arabic: 'بعدنا طالعين', roman: "ba'adna taal'iin", score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: 'He laughs softly. A small comment, but it broke the silence.', outcome: 'good', next: 'c4' },
          { id: 'c', text: 'Wait in silence', arabic: '—', roman: '(you watch the floor numbers: 13… 14… 15…)', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'The silence is not hostile — it is just nothing. He goes back to his phone.', outcome: 'neutral', next: 'c4' },
        ],
      },
      {
        id: 'c4', charName: 'Sami', charGender: 'male', setting: 'Floor 17 — both exit',
        arabic: 'هون كمان؟ هههه',
        roman: "hoon kamaan? hahaha",
        english: 'Here too? Haha',
        teachingNote: "هون (hoon) is Levantine for 'here' — your Gulf equivalent is هني (hini). And يديد is how جديد (new) comes out in Emirati: the ج softens to a ي.",
        choices: [
          { id: 'a', text: 'Haha yes! Are you new here?', arabic: 'هههه إي! انت يديد هني؟', roman: "hahaha ii! inta ydiid hini?", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: "You answered his هون with هني and his جديد with يديد — same words, your accent. He turns to face you properly for the first time.", outcome: 'excellent', next: 'c5' },
          { id: 'b', text: 'Same floor!', arabic: 'نفس الدور!', roman: 'nafs id-door!', score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: "He grins. It's a small comment but you're engaging.", outcome: 'good', next: 'c5' },
          { id: 'c', text: 'Exit without engaging', arabic: '—', roman: '(you step out quickly and walk to your door)', score: -1, impact: { trust: -1, respect: -1, culture: -1 }, note: 'He watches you speed-walk down the hallway. Message received.', outcome: 'bad', next: 'c5_cold' },
        ],
      },
      {
        id: 'c5', charName: 'Sami', charGender: 'male', setting: 'The hallway',
        arabic: 'أنا سامي بالمناسبة. وإنت؟',
        roman: "ana sami bil-munasaba. w-inta?",
        english: "I'm Sami by the way. And you?",
        teachingNote: "'تشرفنا' (tasharrafna) means 'honored to meet you.' It's slightly formal but widely used when meeting someone for the first time.",
        choices: [
          { id: 'a', text: "I'm [name]. Honoured to meet you! Where are you from?", arabic: 'أنا [name]. تشرفنا! من وين انت؟', roman: "ana [name]. tsharrafna! min wayn inta?", score: 3, impact: { trust: 3, respect: 2, culture: 2 }, note: "تشرفنا on a first meeting, then handing the question straight back. من وين is the Gulf form — Sami would say منين, and he will notice you did not borrow it. His whole posture changes.", outcome: 'excellent', next: 'c6', teachingHighlight: "الأردن (il-Urdun) = Jordan. عمّان (Amman) = the capital. Jordanians are one of the largest Arab communities in the UAE." },
          { id: 'b', text: "I'm [name]. Nice building, this one", arabic: 'أنا [name]. البناية حلوة هني', roman: "ana [name]. il-binaaya hilwa hini", score: 1, impact: { trust: 1, respect: 1, culture: 1 }, note: "Sami nods. Safe topic. He's happy to talk but you haven't gotten personal yet.", outcome: 'good', next: 'c6' },
          { id: 'c', text: 'Just say your name', arabic: '[name]', roman: '[name]', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami repeats it back, testing the pronunciation. He offers nothing more.", outcome: 'neutral', next: 'c6' },
        ],
      },
      {
        id: 'c5_cold', charName: 'Sami', charGender: 'male', setting: 'The hallway (after cold exit)',
        arabic: 'أنا سامي. جديد هون',
        roman: 'ana sami. jdiid hoon',
        english: "I'm Sami. New here",
        teachingNote: "Even when a conversation starts cold, one more chance is usually offered. A name exchange costs nothing and can reset the whole dynamic.",
        choices: [
          { id: 'a', text: "I'm [name]. Welcome!", arabic: 'أنا [name]. أهلاً فيك!', roman: "ana [name]. ahlan fiik!", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: "Relief crosses Sami's face. He wasn't sure if you were unfriendly or just tired. Now he knows.", outcome: 'excellent', next: 'c6' },
          { id: 'b', text: 'Just your name', arabic: '[name]', roman: '[name]', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami nods once. He got a name. That's something.", outcome: 'neutral', next: 'c6' },
        ],
      },
      {
        id: 'c6', charName: 'Sami', charGender: 'male', setting: 'Your doors — across from each other',
        arabic: 'لا جد؟ قدام بعض؟ هههه',
        roman: "la jadd? guddaam ba'ad? hahaha",
        english: 'No way? Across from each other? Haha',
        charDialogue: {
          warm: { arabic: 'لا جد؟ قدام بعض؟ هههه — يا زلمة انبسطت فيك والله', roman: "la jadd? guddaam ba'ad? hahaha — ya zalame inbasatt fiik wallah", english: "No way? Across from each other? Haha — honestly, it's been good talking to you." },
          neutral: { arabic: 'لا جد؟ قدام بعض؟ هههه', roman: "la jadd? guddaam ba'ad? hahaha", english: 'No way? Across from each other? Haha' },
          cold: { arabic: 'قدام بعض. طيب، تصبح على خير.', roman: "guddaam ba'ad. tayyib, tisbah 'ala khayr.", english: "Across from each other. Right — goodnight." },
        },
        warmThreshold: 15, coldThreshold: 3,
        teachingNote: "تعال على شاي is the Gulf 'let's hang out'. Being the one who invites first carries real weight — it says you are willing to go first.",
        choices: [
          { id: 'a', text: 'Come over for tea sometime!', arabic: 'تعال على شاي يوم من الأيام!', roman: "ta'aal 'ala shaay yoom min al-ayyaam!", score: 3, impact: { trust: 3, respect: 3, culture: 3 }, note: "You invited first. In Gulf social life that is the move that converts a neighbour into a friend — and it costs you nothing but the nerve. Sami breaks into a real smile and points at his door.", outcome: 'excellent' },
          { id: 'b', text: "If you need anything, I'm right here", arabic: 'إذا تبي شي، أنا هني', roman: "idha tibi shay, ana hini", score: 2, impact: { trust: 2, respect: 2, culture: 2 }, note: "Offering help before being asked is its own kind of invitation. Sami puts his hand on his chest — the classic gesture of thanks.", outcome: 'good' },
          { id: 'c', text: 'Goodbye!', arabic: 'مع السلامة!', roman: "ma'a as-salaama!", score: 1, impact: { trust: 1, respect: 1, culture: -1 }, note: "⚖️ Friendly and perfectly correct Arabic. But مع السلامة closes a conversation, and the moment called for something that opened one. Sami waves. Two doors close.", outcome: 'neutral' },
          { id: 'd', text: 'Go inside without saying anything', arabic: '—', roman: '(you unlock your door quickly and step inside)', score: -1, impact: { trust: -1, respect: -1, culture: -1 }, note: "Sami stands in the hallway for a moment, watching your door close.", outcome: 'bad' },
        ],
      },
    ],
    endings: [
      {
        id: 'the-chai-invitation', min: 30, title: 'The Chai Invitation', arabic: 'تعال على شاي!', roman: "ta'aal 'ala shaay!",
        en: 'Come for tea!',
        desc: 'In six floors and one hallway, you went from strangers to neighbours. Sami will knock on your door this weekend with Jordanian mint tea.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: [
          'You opened with السلام عليكم — the one greeting that works across every Arabic dialect',
          'You responded to the child\'s greeting with "يا بطل" (champ) — a tiny word that showed warmth and cultural ease',
          'You asked Sami which floor he was on — a small question that turned an awkward silence into a real conversation',
          'You invited first — "تعال على شاي" — taking the relationship from corridor to connection',
        ],
      },
      {
        id: 'friendly-neighbour', min: 16, title: 'Friendly Neighbour', arabic: 'جار طيب', roman: 'jaar tayyib',
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
        id: 'the-hallway-nod', min: 4, title: 'The Hallway Nod', arabic: 'هزة راس في الممر', roman: "hazzat raas fil-mamarr",
        en: 'Hallway nod',
        desc: "You and Sami will recognise each other. There'll be an awkward nod when you pass. Neither of you will remember the other's name.",
        color: C.VIOLET2, type: 'mixed',
      },
      {
        id: 'invisible-neighbours', min: 0, title: 'Invisible Neighbours', arabic: 'جيران ما يعرفون بعض', roman: "jiraan ma ya'rifun ba'ad",
        en: 'Stranger neighbours',
        desc: "Two doors, three feet apart, and a wall between you. Sami won't try again. You'll hear his music through the wall and wonder who lives there.",
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── ONBOARDING: CAFÉ (Career Mode) ────────────────────────────────────────
  'onboarding-cafe-career': {
    id: 'onboarding-cafe-career',
    title: 'Welcome to the Café',
    subtitle: 'Your first interaction in Gulf Arabic',
    kafIntro: 'Your first moment speaking Gulf Arabic. The barista is warm and unhurried — perfect for your first exchange.',
    iconName: 'coffee',
    estimatedMinutes: 5,
    phrases: { core: ['e_new1'], byEnding: {} },
    scenes: [
      {
        id: 'c1', charName: 'Layla', charGender: 'female', setting: 'Small café — morning',
        arabic: 'صباح الخير! شنو تاخذ؟',
        roman: 'sabaah il-khair! shnu taakhidh?',
        english: 'Good morning! What can I get you?',
        teachingNote: 'Layla uses شنو (shnu) for "what" — you will hear it constantly from Kuwaiti, Qatari and Bahraini speakers, while Emiratis lean towards شو (shu). Either one marks you as speaking Gulf; the textbook ماذا would not.',
        choices: [
          { id: 'a', text: 'Good morning! A coffee please', arabic: 'صباح الخير! قهوة لو سمحتي', roman: 'sabaah il-khair! gahwa law samahti', score: 8, impact: { trust: 2, respect: 2, culture: 3 }, note: 'لو سمحتي is the Gulf "please" — and the final -i is the feminine form, because you are speaking to Layla. (من فضلك is correct Arabic but sounds like a textbook here.) She smiles and starts your coffee with care.', outcome: 'excellent', next: 'c2' },
          { id: 'b', text: 'Good morning! Just coffee', arabic: 'صباح الخير! قهوة بس', roman: 'sabaah il-khair! gahwa bass', score: 5, impact: { trust: 1, respect: 1, culture: 1 }, note: 'You greeted first and used بس (just/only) — a small word you will hear a hundred times a day here. Layla nods and starts preparing your coffee.', outcome: 'good', next: 'c2' },
          { id: 'c', text: 'A coffee please', arabic: 'قهوة لو سمحتي', roman: 'gahwa law samahti', score: 6, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Polite and correctly gendered — لو سمحتي rather than لو سمحت, because Layla is a woman. You just skipped the greeting, which in the Gulf is rarely optional.', outcome: 'good', next: 'c2' },
          { id: 'd', text: 'One coffee', arabic: 'قهوة', roman: 'gahwa', score: 2, impact: { trust: 1, respect: 0, culture: -1 }, note: 'Perfectly clear — Layla knows exactly what you want and gets on with it. But no greeting and no لو سمحتي, and in the Gulf those are not decoration. She makes your coffee without much reaction.', outcome: 'neutral', next: 'c2' },
        ],
      },
      {
        id: 'c2', charName: 'Layla', charGender: 'female', setting: 'Café counter',
        arabic: 'هاك، صحتين وعافية! بالعافية',
        roman: "haak, sahtain w-'aafya! bil-'aafya",
        english: 'Here you go — health and strength to you! Enjoy',
        teachingNote: 'صحتين وعافية is the Gulf "bon appétit" — literally "two healths and strength". بالعافية does the same job in one word. Both are said constantly; the textbook تستمتع is not.',
        choices: [
          { id: 'a', text: 'Thank you so much!', arabic: 'مشكورة يا ليلى!', roman: 'mashkura ya layla!', score: 7, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Layla\'s face lights up. You used "مشكورة" (the female form) — the Khaleeji thank you — and called her by her name. You\'ve made a real human connection.', outcome: 'excellent' },
          { id: 'b', text: 'Thank you!', arabic: 'شكراً!', roman: 'shukran!', score: 4, impact: { trust: 1, respect: 1, culture: 1 }, note: 'A simple thank you. Layla gives a friendly smile.', outcome: 'good' },
          { id: 'c', text: '(Nod and take the coffee)', arabic: '—', roman: '(Silent nod)', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Layla hands you the coffee with a polite smile, but the moment of connection passes.', outcome: 'neutral' },
        ],
      },
    ],
    endings: [
      {
        id: 'youve-got-a-cafe-friend', min: 10, title: 'You\'ve Got a Café Friend', arabic: 'صار لك ربع في المقهى', roman: "saar lak rab' fil-maqha",
        en: 'You\'ve got a mate at the café',
        desc: 'Layla will remember you. Every time you come in, she\'ll greet you warmly and ask how you\'re doing. Your first Gulf Arabic conversation turned into a real connection.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: ['You opened with a proper greeting', 'You used "law samahti" — the Gulf please, in its feminine form for a female barista', 'You used "mashkura" — the feminine form of thanks, because Layla is female'],
      },
      {
        id: 'pleasant-exchange', min: 5, title: 'Pleasant Exchange', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa',
        en: 'Nice conversation',
        desc: 'You ordered in Arabic, Layla appreciated the effort. Next time you come in, she\'ll say hello and might chat for a moment.',
        color: C.JADE2, type: 'success',
        culturalJourney: ['You made the effort to speak Arabic', 'The interaction was polite and straightforward'],
      },
      {
        id: 'transaction-complete', min: 0, title: 'Transaction Complete', arabic: 'خلصنا', roman: 'khallasna',
        en: 'All done',
        desc: 'You got your coffee. Layla was professional. Next time you come in, it will be a similar interaction.',
        color: C.VIOLET2, type: 'mixed',
        culturalJourney: ['You communicated what you needed'],
      },
    ],
  },

  // ── ONBOARDING: CAFÉ (Social Mode) ────────────────────────────────────────
  'onboarding-cafe-social': {
    id: 'onboarding-cafe-social',
    title: 'Welcome to the Café',
    subtitle: 'Your first interaction in Gulf Arabic',
    kafIntro: 'Your first moment speaking Gulf Arabic. The barista is warm and unhurried — perfect for your first exchange.',
    iconName: 'coffee',
    estimatedMinutes: 5,
    phrases: { core: ['e_new1'], byEnding: {} },
    scenes: [
      {
        id: 'c1', charName: 'Omar', charGender: 'male', setting: 'Small café — morning',
        arabic: 'صباح الخير! شنو تاخذ؟',
        roman: 'sabaah il-khair! shnu taakhidh?',
        english: 'Good morning! What can I get you?',
        teachingNote: 'Omar uses شنو (shnu) for "what" — you will hear it constantly from Kuwaiti, Qatari and Bahraini speakers, while Emiratis lean towards شو (shu). Either one marks you as speaking Gulf; the textbook ماذا would not.',
        choices: [
          { id: 'a', text: 'Good morning! A coffee please', arabic: 'صباح الخير! قهوة لو سمحت', roman: 'sabaah il-khair! gahwa law samaht', score: 8, impact: { trust: 2, respect: 2, culture: 3 }, note: 'لو سمحت is the Gulf "please" — what you will actually hear in Dubai, where من فضلك sounds like a textbook. Omar smiles and starts your coffee with care.', outcome: 'excellent', next: 'c2' },
          { id: 'b', text: 'Good morning! Just coffee', arabic: 'صباح الخير! قهوة بس', roman: 'sabaah il-khair! gahwa bass', score: 5, impact: { trust: 1, respect: 1, culture: 1 }, note: 'You greeted first and used بس (just/only) — a small word you will hear a hundred times a day here. Omar nods and starts preparing your coffee.', outcome: 'good', next: 'c2' },
          { id: 'c', text: 'A coffee please', arabic: 'قهوة لو سمحت', roman: 'gahwa law samaht', score: 6, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Polite and correct — لو سمحت to a man, لو سمحتي to a woman. You just skipped the greeting, which in the Gulf is rarely optional.', outcome: 'good', next: 'c2' },
          { id: 'd', text: 'One coffee', arabic: 'قهوة', roman: 'gahwa', score: 2, impact: { trust: 1, respect: 0, culture: -1 }, note: 'Perfectly clear — Omar knows exactly what you want and gets on with it. But no greeting and no لو سمحت, and in the Gulf those are not decoration. He makes your coffee without much reaction.', outcome: 'neutral', next: 'c2' },
        ],
      },
      {
        id: 'c2', charName: 'Omar', charGender: 'male', setting: 'Café counter',
        arabic: 'هاك، صحتين وعافية! بالعافية',
        roman: "haak, sahtain w-'aafya! bil-'aafya",
        english: 'Here you go — health and strength to you! Enjoy',
        teachingNote: 'صحتين وعافية is the Gulf "bon appétit" — literally "two healths and strength". بالعافية does the same job in one word. Both are said constantly; the textbook تستمتع is not.',
        choices: [
          { id: 'a', text: 'Thank you so much!', arabic: 'مشكور يا عمر!', roman: 'mashkur ya omar!', score: 7, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Omar\'s face lights up. You used "مشكور" (the male form) — the Khaleeji thank you — and called him by his name. You\'ve made a real human connection.', outcome: 'excellent' },
          { id: 'b', text: 'Thank you!', arabic: 'شكراً!', roman: 'shukran!', score: 4, impact: { trust: 1, respect: 1, culture: 1 }, note: 'A simple thank you. Omar gives a friendly smile.', outcome: 'good' },
          { id: 'c', text: '(Nod and take the coffee)', arabic: '—', roman: '(Silent nod)', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Omar hands you the coffee with a polite smile, but the moment of connection passes.', outcome: 'neutral' },
        ],
      },
    ],
    endings: [
      {
        id: 'youve-got-a-cafe-friend', min: 10, title: 'You\'ve Got a Café Friend', arabic: 'صار لك ربع في المقهى', roman: "saar lak rab' fil-maqha",
        en: 'You\'ve got a mate at the café',
        desc: 'Omar will remember you. Every time you come in, he\'ll greet you warmly and ask how you\'re doing. Your first Gulf Arabic conversation turned into a real connection.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: ['You opened with a proper greeting', 'You used "law samaht" — the Gulf please, not the textbook من فضلك', 'You used the masculine form of thanks because Omar is male'],
      },
      {
        id: 'pleasant-exchange', min: 5, title: 'Pleasant Exchange', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa',
        en: 'Nice conversation',
        desc: 'You ordered in Arabic, Omar appreciated the effort. Next time you come in, he\'ll say hello and might chat for a moment.',
        color: C.JADE2, type: 'success',
        culturalJourney: ['You made the effort to speak Arabic', 'The interaction was polite and straightforward'],
      },
      {
        id: 'transaction-complete', min: 0, title: 'Transaction Complete', arabic: 'خلصنا', roman: 'khallasna',
        en: 'All done',
        desc: 'You got your coffee. Omar was professional. Next time you come in, it will be a similar interaction.',
        color: C.VIOLET2, type: 'mixed',
        culturalJourney: ['You communicated what you needed'],
      },
    ],
  },
});

export function getScenarioScript(id: string, C: ThemeColors, mode?: 'career' | 'social'): ScenarioScript | undefined {
  if (id === 'onboarding-cafe' && mode) {
    return getScenarioScripts(C)[`${id}-${mode}`];
  }
  return getScenarioScripts(C)[id];
}
