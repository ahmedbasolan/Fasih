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
    title: 'The Meeting', subtitle: 'Your manager has fifteen minutes. You have an idea.',
    decisions: 6, endings: 8, phrases: '15', level: 'Intermediate',
    color: C.VIOLET2, gradientColors: ['#110A1C', '#080510'],
    arabicScene: 'اجتماع',
    kafIntro: 'In a Gulf office, how you raise an idea matters as much as the idea itself.',
    mode: 'career',
    dialect: 'Emirati Gulf',
  },
];

export const getSocialScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'social_taxi_ride', iconName: 'Zap',
    title: 'The Taxi Ride', subtitle: 'Your first night in Dubai. Your driver is Egyptian.',
    decisions: 6, endings: 6, phrases: '12', level: 'Beginner',
    color: C.JADE_ACCENT, gradientColors: ['#1A1208', '#0D0A05'],
    arabicScene: 'تاكسي',
    kafIntro: 'Youssef speaks Egyptian. Understand him, answer in Gulf Arabic — that is how Dubai really talks.',
    mode: 'social',
    dialect: 'Egyptian',
  },
  {
    id: 'social_elevator', iconName: 'Users',
    title: 'The Elevator', subtitle: 'New neighbours, moving in across the hall.',
    decisions: 6, endings: 6, phrases: '9', level: 'Beginner',
    color: C.VIOLET2, gradientColors: ['#0A0A1A', '#050510'],
    arabicScene: 'مصعد',
    kafIntro: 'Your new neighbours are Jordanian. Understand their Levantine, answer in Gulf Arabic.',
    mode: 'social',
    dialect: 'Jordanian',
  },
  {
    id: 'eid-greeting', iconName: 'Users',
    title: 'Eid Greetings', subtitle: 'Eid morning at your Emirati neighbour\'s majlis.',
    decisions: 6, endings: 6, phrases: '11', level: 'Beginner',
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

  // ── CAREER 3: THE MEETING ──────────────────────────────────────────────────
  // Route script (spec 2026-09-14), three destinations: `sponsor` (Rashid speaks
  // for you upstairs), `voice` (he starts asking what you think) and `ownership`
  // (he hands you the work). Forks at scene3 (the pitch) and scene5 (the finale).
  // Hidden: give the team the credit for your idea (scene3 c — not the top
  // choice) AND answer his ما شاء الله with a blessing (scene5).
  //
  // NOT NATIVE-REVIEWED. mt-1..mt-4 are new and unsourced; every other phrase is
  // an existing library entry. See docs/language/reviewer-brief.md.
  'office-meeting': {
    id: 'office-meeting',
    title: 'The Meeting',
    estimatedMinutes: 8,
    routes: [
      { id: 'sponsor', label: 'A sponsor upstairs' },
      { id: 'voice', label: 'A trusted voice' },
      { id: 'ownership', label: 'Given the responsibility' },
    ],
    defaultRoute: 'sponsor',
    phrases: {
      // طال عمرك / الحمد لله على السلامة / توني واصل / اجتماع / الله يبارك فيك / إن شاء الله / زين
      core: ['core-1', 'mt-1', 'w7', 'w5', 's6', 'w1', 'e1'],
      byEnding: {
        // على كيفك / الله يسعدك / أساعد
        'a-name-upstairs': ['a2', 'gr5', 'mt-4'],
        'liked-not-backed': ['a2', 'gr5', 'mt-4'],
        // خلني أفكر فيها / أحاول
        'the-one-he-asks': ['mt-2', 'mt-3'],
        'heard-not-asked': ['mt-2', 'mt-3'],
        // مشروع / متى / أساعد
        'the-project-is-yours': ['w6', 'e12', 'mt-4'],
        'slowly-slowly': ['w6', 'e12', 'mt-4'],
        // عندك أمر — accepting the kunya without overstepping it
        'call-me-bu-khalid': ['h4'],
      },
    },
    primerPhrases: ['core-1', 'mt-1', 's6'], // طال عمرك / الحمد لله على السلامة / الله يبارك فيك
    scenes: [
      {
        id: 'scene1', kind: 'language', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Sunday, 9 AM',
        arabic: 'هلا والله! تفضل اقعد. شلونك؟',
        roman: "hala wallaah! tfaddal ig'id. shloonak?",
        english: 'Welcome! Come in, sit down. How are you?',
        addressesLearner: true,
        femaleLearner: { arabic: 'هلا والله! تفضلي اقعدي. شلونج؟', roman: "hala wallaah! tfaddali ig'idi. shloonich?", english: 'Welcome! Come in, sit down. How are you?' },
        teachingNote: 'Rashid is your senior manager. طال عمرك is how Gulf Arabic honours rank or age — safer than his first name, which his peers use.',
        choices: [
          { id: 'a', text: 'Thank God, I\'m well — sir', arabic: 'الحمد لله بخير، طال عمرك', roman: "il-hamdu lillaah b-khair, taal 'umrak", score: 7, impact: { trust: 2, respect: 3, culture: 2 }, outcome: 'excellent', note: 'طال عمرك — "may your life be long" — does what "sir" does in English, and more warmly. With a senior manager it tells him you know who you are talking to.' },
          { id: 'b', text: 'Fine, thank God, thanks. And how are you?', arabic: 'زين والحمد لله، مشكور. وانت شلونك؟', roman: 'zain w-il-hamdu lillaah, mashkuur. w-inta shloonak?', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Friendly and correct — with a colleague. With the manager, the question back is fine, but it needs طال عمرك to mark the rank.' },
          { id: 'c', text: 'Hi Rashid! All good', arabic: 'هلا راشد! كل شي تمام', roman: 'hala raashid! kill shay tamaam', score: -4, impact: { trust: -1, respect: -2, culture: -1 }, outcome: 'bad', note: 'His first name on its own, from a new starter, skips a step he has not offered. Gulf offices are warm, but rank is still spoken out loud.' },
        ],
      },
      {
        id: 'scene2', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid pushes a pile of papers aside',
        arabic: 'توني راجع من السفر، وعندي اجتماع بعد شوي',
        roman: "tawni raaji' min is-safar, w-'indi ijtimaa' ba'd shwai",
        english: 'I just got back from a trip, and I have a meeting shortly.',
        teachingNote: 'توني is the Gulf "I just". Anyone back from travel, or from hospital, is greeted with الحمد لله على السلامة before anything else.',
        choices: [
          { id: 'a', text: 'Welcome back! I hope it was a good trip', arabic: 'الحمد لله على السلامة! إن شاء الله كانت سفرة حلوة', roman: "il-hamdu lillaah 'ala is-salaama! in shaa' allaah kaanat safra hilwa", score: 6, impact: { trust: 3, respect: 2, culture: 1 }, outcome: 'good', route: 'sponsor', note: 'You welcomed him back and asked after the trip before your own agenda. Rashid relaxes — this is going to be a conversation, not a request.' },
          { id: 'b', text: 'Welcome back. What matters most to you right now?', arabic: 'الحمد لله على السلامة. شو أهم شي عندك الحين؟', roman: "il-hamdu lillaah 'ala is-salaama. shu ahamm shay 'indak il-hiin?", score: 6, impact: { trust: 1, respect: 2, culture: 3 }, outcome: 'good', route: 'voice', note: 'Asking what matters to him first lets you pitch in his terms. He notices you are thinking about the team, not only yourself.' },
          { id: 'c', text: 'Welcome back. If you like, I can take something off your plate', arabic: 'الحمد لله على السلامة. إذا تبي، أشيل عنك شي', roman: "il-hamdu lillaah 'ala is-salaama. idha tabi, ashiil 'annak shay", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'ownership', note: 'Offering to carry some of his load, right after the greeting, is initiative he can see. أشيل عنك is "I\'ll lift it off you".' },
          { id: 'd', text: 'OK. Let\'s get to the point', arabic: 'زين. خلنا ندخل في الموضوع', roman: "zain. khallna nidkhal fil-mawdhuu'", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'He has just told you he is back from a trip. Skipping الحمد لله على السلامة to get to business reads as caring about the meeting more than the man.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid sits back',
        arabic: 'قلت لي عندك فكرة عن أول أسبوع للموظف اليديد. تفضل',
        roman: "gilt li 'indak fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddal",
        english: "You said you had an idea about a new starter's first week. Go ahead.",
        charDialogue: {
          warm: { arabic: 'يلا، قلت لي عندك فكرة عن أول أسبوع للموظف اليديد. تفضل، أسمعك', roman: "yalla, gilt li 'indak fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddal, asma'ak", english: "Right — you said you had an idea about a new starter's first week. Go ahead, I'm listening." },
          neutral: { arabic: 'قلت لي عندك فكرة عن أول أسبوع للموظف اليديد. تفضل', roman: "gilt li 'indak fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddal", english: "You said you had an idea about a new starter's first week. Go ahead." },
          cold: { arabic: 'عندك فكرة؟ تفضل', roman: "'indak fikra? tfaddal", english: 'You have an idea? Go on.' },
        },
        warmThreshold: 10, coldThreshold: 3,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'قلتي لي عندج فكرة عن أول أسبوع للموظف اليديد. تفضلي',
          roman: "gilti li 'indich fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddali",
          english: "You said you had an idea about a new starter's first week. Go ahead.",
          charDialogue: {
            warm: { arabic: 'يلا، قلتي لي عندج فكرة عن أول أسبوع للموظف اليديد. تفضلي، أسمعج', roman: "yalla, gilti li 'indich fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddali, asma'ich", english: "Right — you said you had an idea about a new starter's first week. Go ahead, I'm listening." },
            neutral: { arabic: 'قلتي لي عندج فكرة عن أول أسبوع للموظف اليديد. تفضلي', roman: "gilti li 'indich fikra 'an awwal usbuu' lil-muwazzaf il-ydiid. tfaddali", english: "You said you had an idea about a new starter's first week. Go ahead." },
            cold: { arabic: 'عندج فكرة؟ تفضلي', roman: "'indich fikra? tfaddali", english: 'You have an idea? Go on.' },
          },
        },
        teachingNote: 'عندك to a man, عندج to a woman. An idea at work is also a question of face: whose way it changes, and who gets the credit.',
        nextByRoute: { sponsor: 'scene4-sponsor', voice: 'scene4-voice', ownership: 'scene4-ownership' },
        choices: [
          { id: 'a', text: 'A simple plan — and I want to run it myself', arabic: 'خطة بسيطة، وأبي أمسكها بنفسي', roman: 'khutta basiita, w-abi amsikha b-nafsi', score: 7, impact: { trust: 1, respect: 3, culture: 3 }, outcome: 'good', route: 'ownership', note: 'A concrete idea and a clear ask in one breath. أبي plus a verb is the everyday Gulf "I want to" — direct, and in a meeting like this, welcome.' },
          { id: 'b', text: 'I\'ve noticed new starters get lost in week one. What do you think?', arabic: 'لاحظت إن اليديد يضيع أول أسبوع. شو رايك؟', roman: "laahazt inn il-ydiid ydhii' awwal usbuu'. shu raayak?", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'good', route: 'voice', note: 'An observation, then his view — before your solution. It invites him in rather than handing him a verdict.' },
          { id: 'c', text: 'The idea came from the team — I just put it together', arabic: 'الفكرة من الفريق، وأنا بس رتبتها', roman: 'il-fikra min il-fariig, w-ana bass rattabtha', score: 5, impact: { trust: 3, respect: -1, culture: 3 }, outcome: 'good', route: 'sponsor', flag: 'CREDITED_THE_TEAM', note: 'Sharing the credit costs you the spotlight today. It also tells Rashid you will not climb over the people around you — something a Gulf manager weighs heavily.' },
          { id: 'd', text: 'The way we do it now is wrong. It has to change', arabic: 'الطريقة الحين غلط، ولازم تتغير', roman: 'it-tariiga il-hiin ghalat, w-laazim titghayyar', score: -4, impact: { trust: -1, respect: -2, culture: -1 }, outcome: 'bad', note: 'The current way is somebody\'s way — possibly his. Calling it wrong makes him defend it instead of hearing you. Say what would help, not who got it wrong.' },
        ],
      },
      {
        id: 'scene4-sponsor', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid taps the desk',
        arabic: 'المدير العام يحب الأفكار اليديدة. بعرضها عليه',
        roman: "il-mudiir il-'aam yhibb il-afkaar il-ydiida. ba'ridhha 'alaih",
        english: "The general manager likes new ideas. I'll put it to him.",
        teachingNote: 'The بـ on بعرضها is the Gulf future: "I will present it". A manager who carries your idea upstairs is lending you his name.',
        choices: [
          { id: 'a', text: 'As you see fit, sir — you know best how to put it', arabic: 'على كيفك، طال عمرك. انت أدرى شلون تعرضها', roman: "'ala kaifak, taal 'umrak. inta adra shloon ti'ridhha", score: 6, impact: { trust: 3, respect: 2, culture: 1 }, outcome: 'good', route: 'sponsor', next: 'scene5', note: 'على كيفك hands him the lead, and انت أدرى — "you know better" — trusts his judgement upstairs. He will fight harder for an idea he feels is partly his.' },
          { id: 'b', text: 'Let me help you with it', arabic: 'خلني أساعدك فيها', roman: "khallni asaa'dak fiiha", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'ownership', next: 'scene5', note: 'خلني — "let me" — offers without pushing. You stay close to the work without taking it back from him.' },
          { id: 'c', text: 'Just don\'t forget to say it\'s my idea', arabic: 'بس لا تنسى تقول إنها فكرتي', roman: 'bass laa tinsa tguul innaha fikrati', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Asking for the credit before he has even gone upstairs tells Rashid you are counting. In the Gulf, credit tends to find the person who does not ask for it.' },
        ],
      },
      {
        id: 'scene4-voice', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid frowns',
        arabic: 'سوينا شي مثله قبل، وما نفع',
        roman: "sawwaina shay mithla gabl, w-maa nifa'",
        english: "We did something like this before, and it didn't work.",
        teachingNote: 'Disagreeing with a senior starts by agreeing with something true. صح، بس… — "right, but…" — keeps his face and your point.',
        choices: [
          { id: 'a', text: 'True — but things may be different now. What went wrong?', arabic: 'صح، بس يمكن الحين غير. شو اللي ما نفع؟', roman: "sah, bass yimkin il-hiin ghair. shu illi maa nifa'?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'voice', next: 'scene5', note: 'You agreed with what was true, then asked him to teach you what failed. That is disagreement that keeps the other person\'s face.' },
          { id: 'b', text: 'Let me try it for one month and report back', arabic: 'خلني أحاول شهر واحد، وأرد لك خبر', roman: 'khallni ahaawil shahar waahid, w-arudd lak khabar', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'good', route: 'ownership', next: 'scene5', note: 'A small trial with an end date lowers the risk he is being asked to take. خلني أحاول — "let me try" — asks permission and offers a plan at once.' },
          { id: 'c', text: 'No — you just did it wrong', arabic: 'لا، انتو سويتوها غلط', roman: 'laa, intu sawwaituuha ghalat', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Telling a senior manager his team did it wrong turns your idea into an accusation. Even if it is true, he now has to defend the past instead of hearing the plan.' },
        ],
      },
      {
        id: 'scene4-ownership', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid checks his calendar',
        arabic: 'زين، بس عندك وقت؟ شغلك وايد',
        roman: "zain, bass 'indak wagt? shughlak waayid",
        english: 'OK, but do you have the time? You have plenty on.',
        addressesLearner: true,
        femaleLearner: { arabic: 'زين، بس عندج وقت؟ شغلج وايد', roman: "zain, bass 'indich wagt? shughlich waayid", english: 'OK, but do you have the time? You have plenty on.' },
        teachingNote: 'شغلك to a man, شغلج to a woman. He is not refusing — he is checking whether you have thought it through.',
        choices: [
          { id: 'a', text: 'Yes — I\'ve sorted my time. I\'ll start on Sunday', arabic: 'إي، رتبت وقتي. أبدا يوم الأحد', roman: 'ii, rattabt wagti. abda yoom il-ahad', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'ownership', next: 'scene5', note: 'A day answers the question behind his question. Plans with a date attached are the ones a Gulf manager believes.' },
          { id: 'b', text: 'Honestly, I\'d need help with one part', arabic: 'صراحة، أحتاج مساعدة في شي واحد', roman: "saraaha, ahtaaj musaa'ada fi shay waahid", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'good', route: 'voice', next: 'scene5', note: 'Admitting the one part you cannot carry alone makes the rest of your plan more believable — and invites his advice.' },
          { id: 'c', text: 'Of course — nobody in the team is better than me', arabic: 'أكيد، ما في أحد في الفريق أحسن مني', roman: 'akiid, maa fii ahad fil-fariig ahsan minni', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Praising yourself to your manager puts you against your own team. In the Gulf, others praise you; you say الحمد لله.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid nods slowly',
        arabic: 'ما شاء الله عليك، فكرة زينة',
        roman: "maa shaa' allaah 'alaik, fikra zaina",
        english: 'MashaAllah — a good idea.',
        charDialogue: {
          warm: { arabic: 'ما شاء الله عليك! والله فكرة زينة', roman: "maa shaa' allaah 'alaik! wallaah fikra zaina", english: 'MashaAllah! Honestly, a good idea.' },
          neutral: { arabic: 'ما شاء الله عليك، فكرة زينة', roman: "maa shaa' allaah 'alaik, fikra zaina", english: 'MashaAllah — a good idea.' },
          cold: { arabic: 'ما شاء الله. نشوف', roman: "maa shaa' allaah. nshuuf", english: "MashaAllah. We'll see." },
        },
        warmThreshold: 20, coldThreshold: 8,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'ما شاء الله عليج، فكرة زينة',
          roman: "maa shaa' allaah 'alaich, fikra zaina",
          english: 'MashaAllah — a good idea.',
          charDialogue: {
            warm: { arabic: 'ما شاء الله عليج! والله فكرة زينة', roman: "maa shaa' allaah 'alaich! wallaah fikra zaina", english: 'MashaAllah! Honestly, a good idea.' },
            neutral: { arabic: 'ما شاء الله عليج، فكرة زينة', roman: "maa shaa' allaah 'alaich, fikra zaina", english: 'MashaAllah — a good idea.' },
            cold: { arabic: 'ما شاء الله. نشوف', roman: "maa shaa' allaah. nshuuf", english: "MashaAllah. We'll see." },
          },
        },
        teachingNote: 'When someone says ما شاء الله about you or your work, the answer is a blessing back — الله يبارك فيك — not a thank-you. عليك to a man, عليج to a woman.',
        nextByRoute: { sponsor: 'scene6-sponsor', voice: 'scene6-voice', ownership: 'scene6-ownership' },
        choices: [
          { id: 'a', text: 'May God bless you, sir', arabic: 'الله يبارك فيك، طال عمرك', roman: "allaah yibaarik fiik, taal 'umrak", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'BLESSED_BACK', note: 'A blessing for a blessing, and طال عمرك keeps the rank. You took the praise without holding on to it.' },
          { id: 'b', text: 'Thank you so much, sir — that\'s kind of you', arabic: 'مشكور وايد، طال عمرك، هذا من ذوقك', roman: "mashkuur waayid, taal 'umrak, haadha min dhoogak", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Gracious, and من ذوقك — "that is your good taste" — is a nice touch. But ما شاء الله is a blessing, and in the Gulf a blessing is answered with one: الله يبارك فيك.' },
          { id: 'c', text: 'I know — I worked really hard on it', arabic: 'أدري، تعبت عليها وايد', roman: "adri, ti'abt 'alaiha waayid", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'Agreeing with praise of yourself turns his compliment into your boast. Hand it back with a blessing instead.' },
        ],
      },
      {
        id: 'scene6-sponsor', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid stands up',
        arabic: 'باكر بذكر اسمك عند المدير العام',
        roman: "baachir badhkur ismak 'ind il-mudiir il-'aam",
        english: "Tomorrow I'll mention your name to the general manager.",
        addressesLearner: true,
        femaleLearner: { arabic: 'باكر بذكر اسمج عند المدير العام', roman: "baachir badhkur ismich 'ind il-mudiir il-'aam", english: "Tomorrow I'll mention your name to the general manager." },
        teachingNote: 'اسمك to a man, اسمج to a woman. بذكر is "I will mention" — the Gulf بـ future again.',
        choices: [
          { id: 'a', text: 'May God make you happy, sir. I won\'t forget it', arabic: 'الله يسعدك، طال عمرك. ما أنساها لك', roman: "allaah yis'idak, taal 'umrak. maa ansaaha lak", score: 6, impact: { trust: 3, respect: 2, culture: 1 }, outcome: 'good', route: 'sponsor', next: null, note: 'الله يسعدك blesses the man, and ما أنساها لك — "I won\'t forget this" — promises loyalty. That is what a sponsor is really backing.' },
          { id: 'b', text: 'And if you have any notes before then, tell me', arabic: 'وإذا عندك ملاحظة قبل، قول لي', roman: "w-idha 'indak mulaahza gabl, gul li", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'voice', next: null, note: 'Inviting his notes before he goes upstairs makes it a better idea — and tells him your pride will not get in the way.' },
          { id: 'c', text: 'And the promotion — when?', arabic: 'والترقية متى؟', roman: 'w-it-targiya mita?', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He offered to put your name in front of the general manager. Asking what you get for it, today, turns the favour into a transaction.' },
        ],
      },
      {
        id: 'scene6-voice', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid closes the folder',
        arabic: 'خلني أفكر فيها، إن شاء الله',
        roman: "khallni afakkir fiiha, in shaa' allaah",
        english: 'Let me think about it, God willing.',
        teachingNote: 'خلني أفكر فيها with a bare إن شاء الله and no day is often a polite "not yet" — or a "no". What you say next decides which.',
        choices: [
          { id: 'a', text: 'God willing. Shall I come back to you on Sunday?', arabic: 'إن شاء الله. أمر عليك يوم الأحد؟', roman: "in shaa' allaah. amurr 'alaik yoom il-ahad?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'ownership', next: null, note: 'You accepted his إن شاء الله and gently attached a day to it. A date turns a maybe into something he will answer — without you pushing.' },
          { id: 'b', text: 'Of course. And if something bothers you about it, tell me honestly', arabic: 'أكيد. وإذا عندك شي عليها، قول لي بصراحة', roman: "akiid. w-idha 'indak shay 'alaiha, gul li b-saraaha", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'good', route: 'voice', next: null, note: 'You invited the real objection. A manager who stalls often has one he is too polite to say — you just made it safe to say it.' },
          { id: 'c', text: 'So is that a yes or a no?', arabic: 'يعني إي ولا لا؟', roman: "ya'ni ii willa laa?", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'Forcing a straight yes or no makes him choose between being blunt and losing face. He will choose the polite no.' },
        ],
      },
      {
        id: 'scene6-ownership', kind: 'judgement', charName: 'Rashid', charGender: 'male', setting: 'Your manager\'s office — Rashid smiles',
        arabic: 'زين، المشروع لك. متى تبدا؟',
        roman: "zain, il-mashruu' lak. mita tibda?",
        english: 'Fine — the project is yours. When do you start?',
        addressesLearner: true,
        femaleLearner: { arabic: 'زين، المشروع لج. متى تبدين؟', roman: "zain, il-mashruu' lich. mita tibdiin?", english: 'Fine — the project is yours. When do you start?' },
        teachingNote: 'لك to a man, لج to a woman. He asked "when" — the answer needs a day in it.',
        choices: [
          { id: 'a', text: 'From tomorrow, God willing', arabic: 'من باكر، إن شاء الله', roman: "min baachir, in shaa' allaah", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'ownership', next: null, note: 'إن شاء الله with a day attached is a real commitment. Rashid hears a start date, and so does everyone he tells.' },
          { id: 'b', text: 'Whenever suits you, sir', arabic: 'متى ما تبي، طال عمرك', roman: "mita ma tabi, taal 'umrak", score: 6, impact: { trust: 3, respect: 2, culture: 1 }, outcome: 'good', route: 'sponsor', next: null, note: 'Leaving the timing to him honours his lead. He will pick the date — and keep an eye on how you do.' },
          { id: 'c', text: 'God willing', arabic: 'إن شاء الله', roman: "in shaa' allaah", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He asked when. A bare إن شاء الله, with no day, sounds exactly like the polite stall — from the person who just asked for the project.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Rashid', charGender: 'male', setting: 'The corridor — a week later',
        arabic: 'من اليوم، قول لي بو خالد',
        roman: 'min il-yoom, gul li bu khaalid',
        english: 'From today, call me Bu Khalid.',
        addressesLearner: true,
        femaleLearner: { arabic: 'من اليوم، قولي لي بو خالد', roman: 'min il-yoom, guuli li bu khaalid', english: 'From today, call me Bu Khalid.' },
        teachingNote: 'بو خالد — "father of Khalid" — is how friends and equals address him. Being invited to use it is a senior Emirati letting you closer.',
        choices: [
          { id: 'a', text: 'At your service, Bu Khalid', arabic: 'عندك أمر، يا بو خالد', roman: "'indak amur, ya bu khaalid", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'عندك أمر — "command me" — accepts the closeness and keeps the respect. You took the step he offered, and no further.' },
          { id: 'b', text: 'I\'m honoured, Bu Khalid', arabic: 'تشرفت، يا بو خالد', roman: 'tsharraft, ya bu khaalid', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'تشرفت — "I am honoured" — shows you know what the kunya means. Use it from now on; going back to his first name would undo it.' },
        ],
      },
    ],
    endings: [
      {
        id: 'call-me-bu-khalid', min: 30, secret: true, requiredFlags: ['CREDITED_THE_TEAM', 'BLESSED_BACK'],
        title: 'Call Me Bu Khalid', arabic: 'بو خالد', roman: 'bu khaalid', en: 'Father of Khalid',
        desc: 'A week later Rashid stops you in the corridor: from now on, call him بو خالد. You gave the team the credit for your idea, and when he praised you, you answered with a blessing instead of holding on to it. A senior Emirati offers his kunya to people he trusts to stay humble. You are one of them now.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'Credit finds the person who does not ask for it — and praise is answered with a blessing, not a thank-you.',
      },
      {
        id: 'a-name-upstairs', min: 28, route: 'sponsor', tier: 'strong',
        title: 'A Name Upstairs', arabic: 'طال عمرك', roman: "taal 'umrak", en: 'May your life be long',
        desc: 'The next day the general manager asks who came up with the first-week plan, and Rashid gives your name — with his own beside it. You honoured his rank, let him lead, and made the idea one he was proud to carry. A senior who speaks for you opens doors you could not knock on yourself.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Let him lead: honour the rank, welcome him back properly, and let him carry the idea upstairs.',
      },
      {
        id: 'liked-not-backed', min: 12, route: 'sponsor', tier: 'weak',
        title: 'Liked, Not Yet Backed', arabic: 'الله يوفقك', roman: 'allaah ywaffgak', en: 'May God grant you success',
        desc: 'Rashid likes you, and says so. A few moments landed awkwardly, though, so when the general manager asks for new ideas, yours is not the one he mentions — yet.',
        color: C.JADE2, type: 'mixed',
        hint: 'Deference is the right instinct — land the courtesies too, so he is proud to carry your name.',
      },
      {
        id: 'the-one-he-asks', min: 28, route: 'voice', tier: 'strong',
        title: 'The One He Asks', arabic: 'بصراحة', roman: 'b-saraaha', en: 'Honestly',
        desc: 'At the next team meeting Rashid turns to you: what do you think? You disagreed without making him wrong, and asked what failed before instead of dismissing it. A manager who can hear your honest view without losing face keeps asking for it.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Agree with what is true, then say what you see — and ask what went wrong last time.',
      },
      {
        id: 'heard-not-asked', min: 12, route: 'voice', tier: 'weak',
        title: 'Heard, Not Yet Asked', arabic: 'نشوف', roman: 'nshuuf', en: "We'll see",
        desc: 'Rashid listened, and some of it stuck. A few exchanges came out blunt or half-formed, though, so for now your views get a nod rather than a question.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Honesty is the right instinct — start with صح، بس… so he never has to defend himself to hear you.',
      },
      {
        id: 'the-project-is-yours', min: 28, route: 'ownership', tier: 'strong',
        title: 'The Project Is Yours', arabic: 'من باكر', roman: 'min baachir', en: 'From tomorrow',
        desc: 'By Sunday the first-week plan has your name on it, and new starters are being sent your way. You made a clear ask, showed you had thought about your time, and put a day on every promise. The person who attaches a date to إن شاء الله is the one who gets handed the work.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Ask clearly, answer the question behind his question, and put a day on every إن شاء الله.',
      },
      {
        id: 'slowly-slowly', min: 12, route: 'ownership', tier: 'weak',
        title: 'Slowly, Slowly', arabic: 'شوي شوي', roman: 'shwai shwai', en: 'Slowly, slowly',
        desc: 'Rashid lets you try part of it, carefully. A couple of answers left him unsure you had thought it through, so for now the project stays his, with you helping.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Initiative is the right instinct — back it with a plan and a date, and he will hand over more.',
      },
      {
        id: 'a-polite-god-willing', min: 0,
        title: 'A Polite "God Willing"', arabic: 'إن شاء الله', roman: "in shaa' allaah", en: 'God willing',
        desc: 'Rashid thanked you, said إن شاء الله, and never brought it up again. Nothing was refused out loud — in a Gulf office it often is not. The idea simply went quiet.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SOCIAL 3: EID GREETINGS ────────────────────────────────────────────────
  // Route script (spec 2026-09-14). Eid morning at Uncle Salem's majlis, your
  // Emirati neighbour, with his whole family around.
  //
  // Destinations: `belonging` (part of the family's Eid) and `honoured` (the
  // guest the street talks about). Forks at scene3 (the sweets) and scene5 (the
  // end of the meal). Hidden: bring Eid money for the children (scene2 c — not
  // the top choice) AND decline more food with الله يديمها نعمة (scene5).
  //
  // NOT NATIVE-REVIEWED. eid-7 is new and replaces eid-3 (يسلموا إيديك, a
  // Levantine form this scenario no longer uses), so the unsourced count holds.
  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    estimatedMinutes: 7,
    routes: [
      { id: 'belonging', label: 'Part of the family\'s Eid' },
      { id: 'honoured', label: 'An honoured guest' },
    ],
    defaultRoute: 'belonging',
    phrases: {
      // عيدكم مبارك / وعساكم من عواده / بسم الله / الله يديمها نعمة / تفضل
      core: ['eid-1', 'eid-2', 'eid-5', 'eid-7', 'h1'],
      byEnding: {
        // بيتنا بيتك / أهل / وايد
        'eid-with-the-family': ['eid-6', 'fm1', 'e6'],
        'a-warm-visit': ['eid-6', 'fm1', 'e6'],
        // جزاكم الله خير / تسلم
        'the-honoured-guest': ['eid-4', 'gr3'],
        'a-polite-guest': ['eid-4', 'gr3'],
        // يدي — what the grandchildren call him, and now you do too
        'your-own-eidiyya': ['fm2'],
      },
    },
    primerPhrases: ['eid-1', 'eid-2', 'eid-5'], // عيدكم مبارك / وعساكم من عواده / بسم الله
    scenes: [
      {
        id: 'scene1', kind: 'language', charName: 'Uncle Salem', charGender: 'male', setting: 'Uncle Salem\'s door — Eid morning',
        arabic: 'عيدك مبارك! حياك الله، تفضل',
        roman: "'iidak mubaarak! hayyaak allaah, tfaddal",
        english: 'Eid Mubarak! Welcome — come in.',
        addressesLearner: true,
        femaleLearner: { arabic: 'عيدج مبارك! حياج الله، تفضلي', roman: "'iidich mubaarak! hayyaach allaah, tfaddali", english: 'Eid Mubarak! Welcome — come in.' },
        teachingNote: 'عيدك مبارك to a man, عيدج to a woman. The Gulf answer returns the wish and adds one: that he lives to see the next Eid — وعساكم من عواده.',
        choices: [
          { id: 'a', text: 'Upon us and you — and may you see many more', arabic: 'علينا وعليكم، وعساكم من عواده', roman: "'alaina w-'alaikum, w-'asaakum min 'uwwaada", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'excellent', note: 'علينا وعليكم returns the blessing, and وعساكم من عواده wishes him many more Eids. It is the answer his own family gives — and the one learners almost never know.' },
          { id: 'b', text: 'May every year find you well — thanks for inviting me', arabic: 'كل عام وانتو بخير، مشكور على العزيمة', roman: "kill 'aam w-intu b-khair, mashkuur 'ala il-'aziima", score: 3, impact: { trust: 2, respect: 2, culture: -1 }, outcome: 'good', note: 'Kind, and heard everywhere. But كل عام وانتو بخير covers every occasion; on Eid morning, عيدك مبارك has its own answer — وعساكم من عواده.' },
          { id: 'c', text: '(Say "Happy Eid!" in English and walk in)', arabic: '—', roman: '(Happy Eid! — in English)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'He greeted you in Arabic on the biggest day of his year. Even the short عيدك مبارك back would have told him you came ready.' },
        ],
      },
      {
        id: 'scene2', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — the whole family, and a line of shoes at the door',
        arabic: 'تفضل، اقعد هني. هذولا عيالي وعيال عيالي',
        roman: "tfaddal, ig'id hini. haadhola 'iyaali w-'iyaal 'iyaali",
        english: 'Please, sit here. These are my children and my grandchildren.',
        addressesLearner: true,
        femaleLearner: { arabic: 'تفضلي، اقعدي هني. هذولا عيالي وعيال عيالي', roman: "tfaddali, ig'idi hini. haadhola 'iyaali w-'iyaal 'iyaali", english: 'Please, sit here. These are my children and my grandchildren.' },
        teachingNote: 'تفضل is the Gulf offer — "please, come, sit, take it". هذولا is the Emirati "these". Shoes stay at the door of a majlis.',
        choices: [
          { id: 'a', text: '(Greet the eldest first, then the room) Peace be upon you', arabic: 'السلام عليكم', roman: "is-salaamu 'alaikum", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', note: 'Greeting the eldest first, then the room, is exactly how an Emirati guest enters a majlis. Salem\'s father nods — someone taught you well.' },
          { id: 'b', text: 'MashaAllah — the house is full!', arabic: 'ما شاء الله، البيت مليان!', roman: "maa shaa' allaah, il-bait malyaan!", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', note: 'A house full of family is the whole point of Eid, and ما شاء الله admires it without inviting envy. Salem beams.' },
          { id: 'c', text: '(Hand each child a little Eid money) Eid Mubarak, kids!', arabic: 'عيدكم مبارك يا عيال!', roman: "'iidkum mubaarak ya 'iyaal!", score: 5, impact: { trust: 3, respect: 0, culture: 2 }, outcome: 'good', route: 'belonging', flag: 'GAVE_EIDIYYA', note: 'عيدية — a little money for the children — is how adults mark Eid in the Gulf. You came ready for the kids, which says you know whose day it really is.' },
          { id: 'd', text: '(Sit down with your shoes on)', arabic: '—', roman: '(you sit down, shoes still on)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'The line of shoes at the door was the clue. Wearing yours into a majlis brings the street onto the carpet the family sits and prays on.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — a tray of Eid sweets comes round',
        arabic: 'ذوق، هذي حلويات العيد',
        roman: "dhuug, haadhi halawiyyaat il-'iid",
        english: 'Taste — these are the Eid sweets.',
        charDialogue: {
          warm: { arabic: 'ذوق ذوق! هذي حلويات العيد، أم سعيد سوتها', roman: "dhuug dhuug! haadhi halawiyyaat il-'iid, umm sa'iid sawwatha", english: 'Taste, taste! These are the Eid sweets — Umm Saeed made them.' },
          neutral: { arabic: 'ذوق، هذي حلويات العيد', roman: "dhuug, haadhi halawiyyaat il-'iid", english: 'Taste — these are the Eid sweets.' },
          cold: { arabic: 'حلويات العيد', roman: "halawiyyaat il-'iid", english: 'Eid sweets.' },
        },
        warmThreshold: 9, coldThreshold: 3,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'ذوقي، هذي حلويات العيد',
          roman: "dhuugi, haadhi halawiyyaat il-'iid",
          english: 'Taste — these are the Eid sweets.',
          charDialogue: {
            warm: { arabic: 'ذوقي ذوقي! هذي حلويات العيد، أم سعيد سوتها', roman: "dhuugi dhuugi! haadhi halawiyyaat il-'iid, umm sa'iid sawwatha", english: 'Taste, taste! These are the Eid sweets — Umm Saeed made them.' },
            neutral: { arabic: 'ذوقي، هذي حلويات العيد', roman: "dhuugi, haadhi halawiyyaat il-'iid", english: 'Taste — these are the Eid sweets.' },
            cold: { arabic: 'حلويات العيد', roman: "halawiyyaat il-'iid", english: 'Eid sweets.' },
          },
        },
        teachingNote: 'ذوق to a man, ذوقي to a woman. بسم الله comes before the first bite; the thanks go to the household that made them.',
        nextByRoute: { belonging: 'scene4-belonging', honoured: 'scene4-honoured' },
        choices: [
          { id: 'a', text: 'In God\'s name… God give you all strength', arabic: 'بسم الله… الله يعطيكم العافية', roman: "bismillaah… allaah ya'tiikum il-'aafya", score: 7, impact: { trust: 2, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', note: 'بسم الله before eating, then a blessing on the whole household — the plural يعطيكم thanks whoever baked without you asking about his wife.' },
          { id: 'b', text: 'In God\'s name. They\'re so good!', arabic: 'بسم الله. حلوة وايد!', roman: 'bismillaah. hilwa waayid!', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', note: 'Enjoying the sweets out loud is the compliment a host wants most. Salem pushes the tray closer.' },
          { id: 'c', text: 'No thanks — I don\'t eat sugar', arabic: 'لا مشكور، أنا ما آكل سكر', roman: 'laa mashkuur, ana maa aakil sukkar', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', note: 'On Eid the sweets are the welcome itself. Take one piece — refusing the tray refuses the house.' },
        ],
      },
      {
        id: 'scene4-belonging', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — the children run in and out',
        arabic: 'وين أهلك في العيد؟',
        roman: "wain ahlak fil-'iid?",
        english: 'Where is your family for Eid?',
        addressesLearner: true,
        femaleLearner: { arabic: 'وين أهلج في العيد؟', roman: "wain ahlich fil-'iid?", english: 'Where is your family for Eid?' },
        teachingNote: 'أهلك to a man, أهلج to a woman. On Eid, a Gulf host worries about anyone spending it away from family.',
        choices: [
          { id: 'a', text: 'Far away — but today, you are my family', arabic: 'بعيد، بس اليوم انتو أهلي', roman: "b'iid, bass il-yoom intu ahli", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', next: 'scene5', note: 'You told him what his invitation meant to someone far from home. On Eid, that is the thing a host most hopes to hear.' },
          { id: 'b', text: 'Back home. I called them this morning', arabic: 'في بلدي. كلمتهم الصبح', roman: 'fi baladi. kallamthum is-subh', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', next: 'scene5', note: 'Calling your family first thing on Eid is what a good son or daughter does. Salem nods with approval.' },
          { id: 'c', text: 'Eid doesn\'t matter much to me', arabic: 'ما يهمني العيد وايد', roman: "maa yhimmni il-'iid waayid", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'You are sitting in his majlis on the day that matters most to him. Whatever Eid is to you, today it is his.' },
        ],
      },
      {
        id: 'scene4-honoured', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — an old man comes in on a stick',
        arabic: 'هذا الوالد',
        roman: 'haadha il-waalid',
        english: 'This is my father.',
        teachingNote: 'الوالد is "the father" — respectful, and also how you address any old man. Everyone in the room stands when an elder comes in.',
        choices: [
          { id: 'a', text: '(Stand up) May God lengthen your life, father', arabic: 'الله يطول عمرك يا الوالد', roman: "allaah ytawwil 'umrak ya il-waalid", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', next: 'scene5', note: 'Standing, then a blessing of long life — the two things an Emirati elder expects from a guest who was raised well.' },
          { id: 'b', text: '(Stand up) Please, take my seat, uncle', arabic: 'تفضل مكاني يا عمي', roman: "tfaddal makaani ya 'ammi", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', next: 'scene5', note: 'Giving up your seat is how a family member behaves, not a visitor. يا عمي — "uncle" — is the warm address for an older man.' },
          { id: 'c', text: '(Stay seated and wave)', arabic: '—', roman: '(a wave from your seat)', score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Everyone else stood. Staying seated for an elder is one of the few things an Emirati family will not quite forgive a guest.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — after the Eid lunch',
        arabic: 'كل بعد! ما كليت شي',
        roman: "kil ba'd! maa kilait shay",
        english: "Eat more! You've hardly eaten a thing.",
        charDialogue: {
          warm: { arabic: 'كل بعد يا ولدي! ما كليت شي', roman: "kil ba'd ya wildi! maa kilait shay", english: "Eat more, my son! You've hardly eaten a thing." },
          neutral: { arabic: 'كل بعد! ما كليت شي', roman: "kil ba'd! maa kilait shay", english: "Eat more! You've hardly eaten a thing." },
          cold: { arabic: 'كل بعد', roman: "kil ba'd", english: 'Eat more.' },
        },
        warmThreshold: 18, coldThreshold: 6,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'كلي بعد! ما كليتي شي',
          roman: "kili ba'd! maa kilaiti shay",
          english: "Eat more! You've hardly eaten a thing.",
          charDialogue: {
            warm: { arabic: 'كلي بعد يا بنتي! ما كليتي شي', roman: "kili ba'd ya binti! maa kilaiti shay", english: "Eat more, my daughter! You've hardly eaten a thing." },
            neutral: { arabic: 'كلي بعد! ما كليتي شي', roman: "kili ba'd! maa kilaiti shay", english: "Eat more! You've hardly eaten a thing." },
            cold: { arabic: 'كلي بعد', roman: "kili ba'd", english: 'Eat more.' },
          },
        },
        teachingNote: 'A Gulf host will keep urging food. The way to stop, with thanks, is الله يديمها نعمة — "may God keep this blessing". كل to a man, كلي to a woman.',
        nextByRoute: { belonging: 'scene6-belonging', honoured: 'scene6-honoured' },
        choices: [
          { id: 'a', text: 'May God keep this blessing for you', arabic: 'الله يديمها نعمة', roman: "allaah ydiimha ni'ma", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'BLESSED_THE_TABLE', note: 'الله يديمها نعمة thanks God for the table and the host for filling it — and it is the one answer that lets him stop insisting without either of you losing face.' },
          { id: 'b', text: 'I\'m full, thank you so much, uncle', arabic: 'شبعت، مشكور وايد يا عمي', roman: "shiba't, mashkuur waayid ya 'ammi", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'True and polite — but "I\'m full" invites one more round of insisting. الله يديمها نعمة is the phrase that ends it with a blessing.' },
          { id: 'c', text: '(Push the plate away)', arabic: '—', roman: '(you push the plate away)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'Pushing food away at a host\'s table reads as rejecting it. A word of thanks stops the offers far more kindly.' },
        ],
      },
      {
        id: 'scene6-belonging', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis door — you get ready to leave',
        arabic: 'بيتنا بيتك. والعيد الياي، عيدك عندنا',
        roman: "baitna baitak. w-il-'iid il-yaay, 'iidak 'indana",
        english: 'Our home is your home. And next Eid, you spend it with us.',
        addressesLearner: true,
        femaleLearner: { arabic: 'بيتنا بيتج. والعيد الياي، عيدج عندنا', roman: "baitna baitich. w-il-'iid il-yaay, 'iidich 'indana", english: 'Our home is your home. And next Eid, you spend it with us.' },
        teachingNote: 'الياي is the Emirati "next" (from الجاي, with ج→ي). بيتنا بيتك from an elder is a real invitation, not a figure of speech.',
        choices: [
          { id: 'a', text: 'God willing — I won\'t miss it', arabic: 'إن شاء الله، ما أفوته', roman: "in shaa' allaah, maa afawwta", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', next: null, note: 'إن شاء الله with a promise attached is a real yes. Salem will hold you to it — happily.' },
          { id: 'b', text: 'May God reward you — an honour for me', arabic: 'جزاكم الله خير، شرف لي', roman: 'jazaakum allaah khair, sharaf li', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', next: null, note: 'جزاكم الله خير is the heaviest thanks there is, and شرف لي — "an honour for me" — gives his invitation the weight it carries.' },
          { id: 'c', text: 'I don\'t know — I might be travelling', arabic: 'ما أدري، يمكن أسافر', roman: "maa adri, yimkin asaafir", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'An elder just offered you a place in his family\'s Eid. Hedging answers the size of the offer with a shrug.' },
        ],
      },
      {
        id: 'scene6-honoured', kind: 'judgement', charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis — the incense burner comes round',
        arabic: 'تفضل، بخور',
        roman: 'tfaddal, bukhuur',
        english: 'Please — bukhoor.',
        addressesLearner: true,
        femaleLearner: { arabic: 'تفضلي، بخور', roman: 'tfaddali, bukhuur', english: 'Please — bukhoor.' },
        teachingNote: 'Bukhoor offered to a guest is an honour: waft the smoke towards your clothes. In Emirati custom it also means the visit is closing — "ما بعد العود قعود".',
        choices: [
          { id: 'a', text: '(Waft the smoke over your clothes) Thank you, uncle. We\'ll take our leave', arabic: 'تسلم يا عمي. يلا، نستأذن', roman: "tislam ya 'ammi. yalla, nista'dhin", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'honoured', next: null, note: 'You took the bukhoor and read what it meant. نستأذن — "we ask your leave" — is how a guest ends a visit gracefully, before the host has to.' },
          { id: 'b', text: '(Waft the smoke over your clothes) Wow, it smells wonderful', arabic: 'الله! ريحته حلوة وايد', roman: "allaah! riihta hilwa waayid", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'belonging', next: null, note: 'Loving his oud is loving his house, and Salem tells you where he buys it. You stayed on a little past the hint — among family, nobody minds.' },
          { id: 'c', text: '(Wave the smoke away, coughing)', arabic: '—', roman: '(you wave the smoke away)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'Bukhoor is offered as an honour. Waving it off refuses the honour — if it is too much, let it pass with a thank-you.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Uncle Salem', charGender: 'male', setting: 'The majlis door — Uncle Salem presses an envelope into your hand',
        arabic: 'وهذي عيديتك. العيال يقولون لي يدي، وانت بعد',
        roman: "w-haadhi 'iidiitak. il-'iyaal yguuluun li yiddi, w-inta ba'd",
        english: "And this is your Eid money. The kids call me Yiddi — and so do you now.",
        addressesLearner: true,
        femaleLearner: { arabic: 'وهذي عيديتج. العيال يقولون لي يدي، وانتي بعد', roman: "w-haadhi 'iidiitich. il-'iyaal yguuluun li yiddi, w-inti ba'd", english: "And this is your Eid money. The kids call me Yiddi — and so do you now." },
        teachingNote: 'Elders give عيدية to the young people they count as their own. يدي is the Emirati "grandpa" — ج→ي again.',
        choices: [
          { id: 'a', text: 'May you see many more Eids, Yiddi', arabic: 'عساك من عواده يا يدي', roman: "'asaak min 'uwwaada ya yiddi", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'You used the name he offered and gave the Eid blessing back. The grandchildren cheer.' },
          { id: 'b', text: 'May God never take you from us', arabic: 'الله لا يحرمنا منك', roman: 'allaah laa yihrimna minnak', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'الله لا يحرمنا منك — "may God not deprive us of you" — is what grandchildren say to a grandfather. Salem has to look away for a moment.' },
        ],
      },
    ],
    endings: [
      {
        id: 'your-own-eidiyya', min: 30, secret: true, requiredFlags: ['GAVE_EIDIYYA', 'BLESSED_THE_TABLE'],
        title: 'Your Own Eidiyya', arabic: 'العيدية', roman: "il-'iidiyya", en: 'Eid money',
        desc: 'At the door, Uncle Salem presses an envelope into your hand — your own عيدية, the Eid money elders give the young people of the family. You came with something for his grandchildren, and you ended the meal with الله يديمها نعمة like one of his own. In the Gulf, an elder gives عيدية only to people he counts as family.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'Eid belongs to the children — come ready for them. And end the meal with a blessing, not just a thank-you.',
      },
      {
        id: 'eid-with-the-family', min: 28, route: 'belonging', tier: 'strong',
        title: 'Eid With the Family', arabic: 'من العايدين', roman: "min il-'aaydiin", en: 'Among those who celebrate',
        desc: 'There is already a place kept for you in Uncle Salem\'s majlis next Eid, and his grandchildren know your name. You made a fuss of the house, the sweets and the children, and told him that today his family was yours.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Be part of the day: the children, the sweets, and the family you are far from.',
      },
      {
        id: 'a-warm-visit', min: 12, route: 'belonging', tier: 'weak',
        title: 'A Warm Visit', arabic: 'عساكم من عواده', roman: "'asaakum min 'uwwaada", en: 'May you see many more',
        desc: 'Uncle Salem enjoyed having you, and the children waved you off. A few moments came out awkward, though, so it was a kind visit rather than the start of a tradition.',
        color: C.JADE2, type: 'mixed',
        hint: 'Warmth is the right instinct — land the Eid words too, and next year he will expect you.',
      },
      {
        id: 'the-honoured-guest', min: 28, route: 'honoured', tier: 'strong',
        title: 'The Honoured Guest', arabic: 'الله يطول عمرك', roman: "allaah ytawwil 'umrak", en: 'May God lengthen your life',
        desc: 'Uncle Salem tells the street about the guest who greeted his father first, blessed the table and knew what the bukhoor meant. In an Emirati home, knowing the customs is how a stranger shows respect — and it is remembered for years.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Honour the house: greet the eldest first, stand for the elders, and read what the bukhoor means.',
      },
      {
        id: 'a-polite-guest', min: 12, route: 'honoured', tier: 'weak',
        title: 'A Polite Guest', arabic: 'مشكورين', roman: 'mashkuuriin', en: 'Thank you all',
        desc: 'You were respectful, and Uncle Salem noticed. A couple of customs slipped, though, so you left as a polite guest rather than the one the neighbourhood talks about.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Respect is the right instinct — the Eid greeting and the end-of-meal blessing are what make it land.',
      },
      {
        id: 'eid-passes-by', min: 0,
        title: 'Eid Passes By', arabic: 'الله كريم', roman: 'allaah kariim', en: 'God is generous',
        desc: 'Uncle Salem smiled and wished you well. But nothing quite landed, and next Eid the invitation goes to someone else. He says الله كريم, and lets it go.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SOCIAL 1: THE TAXI RIDE ────────────────────────────────────────────────
  // Route script (spec 2026-09-14). Your first night living in Dubai; Youssef,
  // the driver, speaks Egyptian. His lines are for recognising — the learner
  // always answers in Khaleeji (docs/language/authority.md, other dialects).
  //
  // Destinations: `friend` (a friend in the city) and `insider` (the city from
  // the inside). Forks at scene3 (his story) and scene5 (the finale line).
  // Hidden: bless him with being reunited with his kids (scene3 c — not the top
  // choice) AND answer his مبروك with الله يبارك فيك (scene5).
  //
  // NOT NATIVE-REVIEWED. Youssef's lines need the Egyptian reviewer; the learner's
  // lines need the Emirati reviewer. Phrase sets reuse library entries only.
  'social_taxi_ride': {
    id: 'social_taxi_ride',
    title: 'The Taxi Ride',
    estimatedMinutes: 7,
    routes: [
      { id: 'friend', label: 'A friend in the city' },
      { id: 'insider', label: 'The city from the inside' },
    ],
    defaultRoute: 'friend',
    phrases: {
      // الله يسلمك / انت منين؟ / مبروك / الله يبارك فيك / هني
      core: ['g10', 'tx-2', 's5', 's6', 'e13'],
      byEnding: {
        // شو يابك دبي؟ / عيال / متى
        'a-friend-in-the-city': ['tx-3', 'fm7', 'e12'],
        'a-friendly-ride': ['tx-3', 'fm7', 'e12'],
        // وين / هناك / زين
        'the-city-from-the-inside': ['e11', 'e14', 'e1'],
        'a-few-tips': ['e11', 'e14', 'e1'],
        // الله يحفظ عائلتك
        'for-the-kids': ['tx-1'],
      },
    },
    primerPhrases: ['g10', 'tx-2', 's6'], // الله يسلمك / انت منين؟ / الله يبارك فيك
    scenes: [
      {
        id: 'scene1', kind: 'language', charName: 'Youssef', charGender: 'male', setting: 'Dubai Airport — your first night living here',
        arabic: 'حمد الله على السلامة! أنا يوسف. اتفضل، العربية هنا',
        roman: "hamdilla 'as-salaama! ana yuusif. itfaddal, il-'arabiyya hina",
        english: "Welcome — thank God you got here safely! I'm Youssef. Come, the car's here.",
        addressesLearner: true,
        femaleLearner: { arabic: 'حمد الله على السلامة! أنا يوسف. اتفضلي، العربية هنا', roman: "hamdilla 'as-salaama! ana yuusif. itfaddali, il-'arabiyya hina", english: "Welcome — thank God you got here safely! I'm Youssef. Come, the car's here." },
        teachingNote: 'Egyptian العربية is "the car" (Gulf: السيارة), and اتفضل is his تفضل. حمد الله على السلامة welcomes a safe arrival in both dialects — and the answer is the same in both: الله يسلمك.',
        choices: [
          { id: 'a', text: 'God keep you, Youssef', arabic: 'الله يسلمك يا يوسف', roman: 'allaah yisallmak ya yuusif', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'excellent', note: 'الله يسلمك answers a welcome-back in Cairo and in Dubai alike. You understood his Egyptian and answered in your own Arabic — the whole skill of this ride.' },
          { id: 'b', text: 'Hey Youssef, thanks', arabic: 'هلا والله يا يوسف، مشكور', roman: 'hala wallaah ya yuusif, mashkuur', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Warm and Gulf. But حمد الله على السلامة is a blessing, and it has its own answer: الله يسلمك.' },
          { id: 'c', text: '(Hand him your bag without a word)', arabic: '—', roman: '(you hand over your bag)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'He welcomed you to the country and got a suitcase. A greeting in the Arab world asks for one back, whoever is carrying the bags.' },
        ],
      },
      {
        id: 'scene2', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'Sheikh Zayed Road — the city lights start',
        arabic: 'إنت منين؟ وجاي تعيش هنا ولا زيارة؟',
        roman: "inta minein? w-gaay ti'iish hina walla ziyaara?",
        english: 'Where are you from? And are you here to live, or visiting?',
        addressesLearner: true,
        femaleLearner: { arabic: 'إنتي منين؟ وجاية تعيشي هنا ولا زيارة؟', roman: "inti minein? w-gaaya ti'iishi hina walla ziyaara?", english: 'Where are you from? And are you here to live, or visiting?' },
        teachingNote: 'منين is Egyptian "from where" — you would say من وين. هنا is his "here"; yours is هني. To a woman: إنتي… جاية تعيشي.',
        choices: [
          { id: 'a', text: 'I\'m going to live here. And you — what brought you to Dubai?', arabic: 'بعيش هني. وانت شو يابك دبي؟', roman: "ba'iish hini. w-inta shu yaabak dubay?", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'friend', note: 'Turning the question back to him says you care about his story, not just the fare. شو يابك is the Emirati form of his إيه اللي جابك.' },
          { id: 'b', text: 'I\'m going to live here. Where\'s a good area to live?', arabic: 'بعيش هني. وين أحسن مكان أسكن فيه؟', roman: "ba'iish hini. wain ahsan makaan askin fiih?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'insider', note: 'A driver of eight years knows every neighbourhood by rent, traffic and noise. Asking him treats him as the expert he is.' },
          { id: 'c', text: 'Why are you asking?', arabic: 'ليش تسأل؟', roman: 'laish tis\'al?', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'A driver asking where you are from is being friendly, not nosy — it is how a ride in Dubai starts. Suspicion ends the conversation before it begins.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'Sheikh Zayed Road — Youssef turns the radio down',
        arabic: 'أنا من إسكندرية. بقالي تمن سنين هنا، والعيال في مصر',
        roman: "ana min iskandariyya. ba'aali taman siniin hina, wil-'iyaal fi masr",
        english: "I'm from Alexandria. I've been here eight years, and the kids are in Egypt.",
        charDialogue: {
          warm: { arabic: 'أنا من إسكندرية. بقالي تمن سنين هنا، والعيال في مصر. وحشوني أوي', roman: "ana min iskandariyya. ba'aali taman siniin hina, wil-'iyaal fi masr. wahashuuni 'awi", english: "I'm from Alexandria. I've been here eight years, and the kids are in Egypt. I miss them so much." },
          neutral: { arabic: 'أنا من إسكندرية. بقالي تمن سنين هنا، والعيال في مصر', roman: "ana min iskandariyya. ba'aali taman siniin hina, wil-'iyaal fi masr", english: "I'm from Alexandria. I've been here eight years, and the kids are in Egypt." },
          cold: { arabic: 'من إسكندرية. العيال في مصر', roman: "min iskandariyya. il-'iyaal fi masr", english: 'From Alexandria. The kids are in Egypt.' },
        },
        warmThreshold: 9, coldThreshold: 3,
        teachingNote: 'بقالي ("I have been… for") and تمن ("eight") are Egyptian; أوي is his وايد. العيال — the kids — is the same word in both.',
        nextByRoute: { friend: 'scene4-friend', insider: 'scene4-insider' },
        choices: [
          { id: 'a', text: 'MashaAllah! And how are the kids?', arabic: 'ما شاء الله! وشلونهم العيال؟', roman: "maa shaa' allaah! w-shloonhum il-'iyaal?", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, outcome: 'good', route: 'friend', note: 'You admired what he has built here and asked after the reason for it. Youssef\'s shoulders drop — he likes talking about his kids.' },
          { id: 'b', text: 'Eight years! You must know Dubai inside out', arabic: 'ثمان سنين! أكيد تعرف دبي زين', roman: "thmaan siniin! akiid ti'arf dubay zain", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'insider', note: 'You heard eight years as experience. Youssef sits up a little — nobody asks a driver what he knows.' },
          { id: 'c', text: 'May God bring you back together with them soon', arabic: 'الله يجمعك فيهم عن قريب', roman: "allaah yijma'ak fiihum 'an gariib", score: 5, impact: { trust: 3, respect: 0, culture: 2 }, outcome: 'good', route: 'friend', flag: 'BLESSED_THE_REUNION', note: 'الله يجمعك فيهم is the blessing for someone living far from family. You skipped the small talk and went straight to what the eight years cost him.' },
          { id: 'd', text: 'Away from your kids? I couldn\'t do it', arabic: 'بعيد عن عيالك؟ أنا ما أقدر', roman: "b'iid 'an 'iyaalak? ana maa agdar", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', note: 'He is here because of his kids, not in spite of them. Saying you could not do it sounds like a judgement on the choice his family depends on.' },
        ],
      },
      {
        id: 'scene4-friend', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'A red light near Business Bay',
        arabic: 'بكلمهم فيديو كل يوم، بس مش زي ما تشوفهم',
        roman: "bakallimhum vidyu kull yoom, bass mish zayy ma tshuufhum",
        english: "I video-call them every day, but it's not like seeing them.",
        teachingNote: 'مش زي is Egyptian "not like" — Gulf would say مب مثل. The بـ on بكلمهم marks a habit in Egyptian; in Gulf Arabic the same بـ usually means "will".',
        choices: [
          { id: 'a', text: 'True. When will you visit them?', arabic: 'صح. متى بتزورهم؟', roman: 'sah. mita bitzuurhum?', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'friend', next: 'scene5', note: 'Asking when he goes home gives him something to look forward to out loud. بتزورهم — "will you visit them" — is the Gulf future.' },
          { id: 'b', text: 'And where do you go on your day off?', arabic: 'ووين تروح يوم عطلتك؟', roman: "w-wain truuh yoom 'utlatak?", score: 5, impact: { trust: -1, respect: 3, culture: 3 }, outcome: 'good', route: 'insider', next: 'scene5', note: 'A driver\'s day off is where the best local places are, and he is glad to share them. You did step away from his kids to ask, though — he noticed the change of subject.' },
          { id: 'c', text: 'Honestly, I don\'t like video calls', arabic: 'أنا بصراحة ما أحب مكالمات الفيديو', roman: 'ana b-saraaha maa ahibb mukaalamaat il-vidyu', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'He told you how he stays close to his children, and you answered with your preferences. The moment was his.' },
        ],
      },
      {
        id: 'scene4-insider', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'A red light near Business Bay',
        arabic: 'دبي دي أنا حافظها شارع شارع. عايز تعرف إيه؟',
        roman: "dubayy di ana haafizha shaari' shaari'. 'aayiz ti'raf eeh?",
        english: 'I know this Dubai street by street. What do you want to know?',
        addressesLearner: true,
        femaleLearner: { arabic: 'دبي دي أنا حافظها شارع شارع. عايزة تعرفي إيه؟', roman: "dubayy di ana haafizha shaari' shaari'. 'ayza ti'rafi eeh?", english: 'I know this Dubai street by street. What do you want to know?' },
        teachingNote: 'عايز is Egyptian "want" — عايزة to a woman. In Gulf Arabic that is تبي / تبين. إيه is his شو.',
        choices: [
          { id: 'a', text: 'Where can I eat good, cheap food?', arabic: 'وين آكل أكل زين ورخيص؟', roman: "wain aakil akil zain w-rikhiis?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'insider', next: 'scene5', note: 'The one question every driver in Dubai can answer better than any app. Youssef is already listing places before the light changes.' },
          { id: 'b', text: 'What do you love about Dubai?', arabic: 'انت شو تحب في دبي؟', roman: 'inta shu tihibb fi dubay?', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'friend', next: 'scene5', note: 'You asked about him, not the map. Eight years in, nobody has asked Youssef what he loves about the place.' },
          { id: 'c', text: 'No need — I have Google Maps', arabic: 'ما يحتاج، عندي خرائط جوجل', roman: "maa yihtaaj, 'indi kharaayit google", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'He offered eight years of the city. The map knows the streets; Youssef knows which shawarma is worth the queue.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Youssef', charGender: 'male', setting: 'The exit for your new neighbourhood',
        arabic: 'يعني شقة جديدة وحياة جديدة؟ مبروك!',
        roman: "ya'ni sha''a gdiida w-hayaa gdiida? mabruuk!",
        english: 'So — a new flat and a new life? Congratulations!',
        charDialogue: {
          warm: { arabic: 'يعني شقة جديدة وحياة جديدة؟ ألف مبروك!', roman: "ya'ni sha''a gdiida w-hayaa gdiida? alf mabruuk!", english: 'So — a new flat and a new life? A thousand congratulations!' },
          neutral: { arabic: 'يعني شقة جديدة وحياة جديدة؟ مبروك!', roman: "ya'ni sha''a gdiida w-hayaa gdiida? mabruuk!", english: 'So — a new flat and a new life? Congratulations!' },
          cold: { arabic: 'شقة جديدة؟ مبروك', roman: "sha''a gdiida? mabruuk", english: 'A new flat? Congratulations.' },
        },
        warmThreshold: 18, coldThreshold: 6,
        teachingNote: 'Egyptians say جديدة with a hard g (gdiida); Emiratis often say يديدة. مبروك is the same in both, and so is its answer: الله يبارك فيك.',
        nextByRoute: { friend: 'scene6-friend', insider: 'scene6-insider' },
        choices: [
          { id: 'a', text: 'May God bless you', arabic: 'الله يبارك فيك', roman: 'allaah yibaarik fiik', score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'ANSWERED_MABROOK', note: 'مبروك is a blessing, and الله يبارك فيك sends one straight back. It is the exchange you will use for every new job, flat and baby in Dubai.' },
          { id: 'b', text: 'Thanks — God willing, all good things', arabic: 'مشكور، إن شاء الله خير', roman: "mashkuur, in shaa' allaah khair", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Kind, and إن شاء الله خير is a nice wish. But مبروك has a set answer, and Youssef is waiting for it: الله يبارك فيك.' },
          { id: 'c', text: 'It\'s nothing — just a flat', arabic: 'مب شي، بس شقة', roman: 'mub shay, bass shigga', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'Brushing off a مبروك refuses the good wish along with it. Take the blessing, and give one back.' },
        ],
      },
      {
        id: 'scene6-friend', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'Outside your building',
        arabic: 'وصلنا يا باشا! خد رقمي، لو احتجت أي حاجة كلمني',
        roman: "wasalna ya baasha! khud ra'ami, law ihtagt ay haaga kallimni",
        english: "Here we are, boss! Take my number — if you need anything, call me.",
        addressesLearner: true,
        femaleLearner: { arabic: 'وصلنا يا مدام! خدي رقمي، لو احتجتي أي حاجة كلميني', roman: "wasalna ya madaam! khudi ra'ami, law ihtagti ay haaga kallimiini", english: "Here we are, madam! Take my number — if you need anything, call me." },
        teachingNote: 'Egyptian خد رقمي is Gulf خذ رقمي, and حاجة ("thing") is Gulf شي. Listen for the ق in رقمي: Egyptians swallow it, Emiratis say g.',
        choices: [
          { id: 'a', text: 'Of course! And when you see the kids, give them my salaam', arabic: 'أكيد! وإذا شفت العيال، سلم عليهم', roman: "akiid! w-idha shift il-'iyaal, sallim 'alaihum", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'friend', next: null, note: 'Sending your greetings to his children makes you part of the story he will tell them. سلم عليهم — "greet them for me" — is how families pass on warmth.' },
          { id: 'b', text: 'Thanks! I\'ll call you if I get lost in Dubai', arabic: 'تسلم! وبتصل فيك إذا ضعت في دبي', roman: "tislam! w-battasil fiik idha dhi't fi dubay", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'insider', next: null, note: 'You took the number as the local lifeline it is. In a new city, a driver who knows every shortcut is worth more than any app.' },
          { id: 'c', text: 'No need — I have the taxi app', arabic: 'ما أحتاج، عندي تطبيق التاكسي', roman: "maa ahtaaj, 'indi tatbiig it-taksi", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He offered himself, not a service. Turning it down for an app tells him the last forty minutes were just a transaction.' },
        ],
      },
      {
        id: 'scene6-insider', kind: 'judgement', charName: 'Youssef', charGender: 'male', setting: 'Outside your building',
        arabic: 'وصلنا! وعلى فكرة، أحسن شاورما في دبي في آخر الشارع ده',
        roman: "wasalna! w-'ala fikra, ahsan shawirma fi dubayy fi aakhir ish-shaari' da",
        english: "We're here! And by the way — the best shawarma in Dubai is at the end of this street.",
        teachingNote: 'ده is Egyptian "this" (masculine) — Gulf says هذا. على فكرة, "by the way", is shared by both.',
        choices: [
          { id: 'a', text: 'Really? Tomorrow I\'ll go eat there', arabic: 'صدق؟ باكر بروح آكل هناك', roman: 'sidg? baachir baruuh aakil hinaak', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'insider', next: null, note: 'You took his tip seriously enough to plan around it. صدق؟ is the Gulf "really?", and باكر بروح is a promise with a day in it.' },
          { id: 'b', text: 'Thanks! You\'re the first person I know in Dubai', arabic: 'تسلم! انت أول واحد أعرفه في دبي', roman: "tislam! inta awwal waahid a'arfa fi dubay", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'friend', next: null, note: 'You told him what the ride meant, not just where it ended. On your first night, that is true — and he will remember hearing it.' },
          { id: 'c', text: 'Shawarma? No, I don\'t eat at places like that', arabic: 'شاورما؟ لا، أنا ما آكل من هالأماكن', roman: "shaawirma? laa, ana maa aakil min hal-amaakin", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'He shared his favourite place and you looked down on it. In Dubai the best food is often in exactly those places.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Youssef', charGender: 'male', setting: 'Outside your building — you reach for your wallet',
        arabic: 'والله ما آخد منك ولا درهم',
        roman: "wallaahi ma aakhud minnak wala dirham",
        english: "By God, I won't take a single dirham from you.",
        addressesLearner: true,
        femaleLearner: { arabic: 'والله ما آخد منك ولا درهم', roman: "wallaahi ma aakhud minnik wala dirham", english: "By God, I won't take a single dirham from you." },
        teachingNote: 'Refusing the fare is a real courtesy in Egypt and the Gulf — and the expected answer is to insist. Paying is how you honour his work.',
        choices: [
          { id: 'a', text: 'By God, that\'s not right — this is yours', arabic: 'والله ما يصير، هذا حقك', roman: "wallaah maa yisiir, haadha haggak", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'ما يصير — "it isn\'t right" — insists without arguing. He refused once, as custom asks; you insisted, as custom asks. Now he can take it.' },
          { id: 'b', text: 'OK — then this is for the kids. God protect your family', arabic: 'زين، حق العيال. الله يحفظ عائلتك', roman: "zain, hagg il-'iyaal. allaah yihfaz 'aa'iltak", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'Handing it over as a gift for his children lets him accept without losing face. حق العيال — "for the kids" — is how the Gulf gives money that cannot be refused.' },
        ],
      },
    ],
    endings: [
      {
        id: 'for-the-kids', min: 30, secret: true, requiredFlags: ['BLESSED_THE_REUNION', 'ANSWERED_MABROOK'],
        title: 'For the Kids', arabic: 'حق العيال', roman: "hagg il-'iyaal", en: 'For the kids',
        desc: 'At your building Youssef pushes your money back — he will not take a dirham. You blessed a father living far from his children, and you answered his مبروك the way someone from home would. You insist, as you should, and he finally takes it for his kids. Your first night in Dubai, and a stranger has already treated you like family.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'Bless a father for the family he misses — and give a مبروك the answer it gets at home.',
      },
      {
        id: 'a-friend-in-the-city', min: 28, route: 'friend', tier: 'strong',
        title: 'A Friend in the City', arabic: 'رقم يوسف', roman: 'ragam yuusif', en: "Youssef's number",
        desc: 'Youssef\'s number is in your phone before you reach the lift, and he meant every word. You asked about his kids, not just his car, and answered him in your own Arabic all the way home. Your first night in Dubai, and you already know someone who will pick up.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Ask about the man behind the wheel — where he is from, and who he misses.',
      },
      {
        id: 'a-friendly-ride', min: 12, route: 'friend', tier: 'weak',
        title: 'A Friendly Ride', arabic: 'الله معاك', roman: "allaah ma'aak", en: 'God be with you',
        desc: 'Youssef liked you, and said so. A few answers came out awkward, though, so at the door it is a warm goodbye rather than a number. Friendly is a good start for night one.',
        color: C.JADE2, type: 'mixed',
        hint: 'Warmth is the right instinct — land the small courtesies too, and a ride becomes a contact.',
      },
      {
        id: 'the-city-from-the-inside', min: 28, route: 'insider', tier: 'strong',
        title: 'The City From the Inside', arabic: 'أحسن شاورما', roman: 'ahsan shaawirma', en: 'The best shawarma',
        desc: 'By the time you reach your building you have a list no guidebook has: where to live, where to eat, which road to avoid at six. You treated eight years of driving these streets as expertise, and Youssef handed it over gladly.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Treat him as the expert he is: ask where to live, where to eat, how the city works.',
      },
      {
        id: 'a-few-tips', min: 12, route: 'insider', tier: 'weak',
        title: 'A Few Tips', arabic: 'على طول', roman: "'ala tuul", en: 'Straight ahead',
        desc: 'Youssef pointed out a couple of places, but some of your answers fell flat and the tips dried up before your exit. You know a little more of the city than you did at the airport.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Curiosity is the right instinct — show him you are listening, and he will keep talking.',
      },
      {
        id: 'just-a-fare', min: 0,
        title: 'Just a Fare', arabic: 'وصلنا', roman: 'wasalna', en: "We're here",
        desc: 'Youssef stopped trying somewhere around the second exit. The rest of the ride was the radio and the meter, and at your building it was just a fare.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SOCIAL 2: THE ELEVATOR ─────────────────────────────────────────────────
  // Route script (spec 2026-09-14). A Jordanian family — Abu Omar, Umm Omar and
  // five-year-old Omar — moves into the flat across from yours. They speak
  // Levantine; the learner answers in Khaleeji. Invitations always come from the
  // family, never one-on-one, so the scenario works for every learner.
  //
  // Destinations: `family` (welcomed like family) and `neighbour` (the one they
  // count on). Forks at scene3 (meeting Omar) and scene5 (the goodnight).
  // Hidden: bless Omar through his father (scene3 c — not the top choice) AND
  // answer تصبح على خير with وانت من أهله (scene5).
  //
  // NOT NATIVE-REVIEWED. The family's lines need the Levantine reviewer; the
  // learner's lines need the Emirati reviewer. Phrase sets reuse library entries.
  'social_elevator': {
    id: 'social_elevator',
    title: 'The Elevator',
    estimatedMinutes: 7,
    routes: [
      { id: 'family', label: 'Welcomed like family' },
      { id: 'neighbour', label: 'The neighbour they count on' },
    ],
    defaultRoute: 'family',
    phrases: {
      // السلام عليكم / وعليكم السلام / انت في أي دور؟ / مساء الخير
      core: ['el-1', 'el-2', 'el-4', 'g5'],
      byEnding: {
        // البيت بيتك / صحتين وعافية
        'like-family': ['h3', 'h5'],
        'friendly-faces': ['h3', 'h5'],
        // عطني / أساعد
        'the-one-they-count-on': ['a6', 'mt-4'],
        'polite-neighbours': ['a6', 'mt-4'],
        // تمر — what goes back on the plate
        'the-plate-comes-back-full': ['f7'],
      },
    },
    primerPhrases: ['el-1', 'el-2', 'el-4'], // السلام عليكم / وعليكم السلام / انت في أي دور؟
    scenes: [
      {
        id: 'scene1', kind: 'language', charName: 'Abu Omar', charGender: 'male', setting: 'Your building — the elevator doors open on a wall of boxes',
        arabic: 'السلام عليكم!',
        roman: "is-salaamu 'alaikum!",
        english: 'Peace be upon you!',
        teachingNote: 'السلام عليكم is the same in every dialect, and so is its answer: وعليكم السلام. Leaving it unanswered is noticed everywhere in the Arab world.',
        choices: [
          { id: 'a', text: 'And upon you peace', arabic: 'وعليكم السلام', roman: "w-'alaikum is-salaam", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, outcome: 'excellent', note: 'السلام عليكم has one answer, and you gave it. It works with a Jordanian, an Emirati or anyone else in the building.' },
          { id: 'b', text: 'Hi — good evening', arabic: 'هلا، مساء الخير', roman: "hala, masaa' il-khair", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Friendly and correct Gulf Arabic. But السلام عليكم is a greeting with its own reply — وعليكم السلام — and he is waiting to hear it.' },
          { id: 'c', text: '(Nod and look at your phone)', arabic: '—', roman: '(a nod, eyes on your phone)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'A salaam left unanswered is one of the few things that lands badly in every Arab culture. The new neighbours just met you, and this is what they met.' },
        ],
      },
      {
        id: 'scene2', kind: 'judgement', charName: 'Abu Omar', charGender: 'male', setting: 'The elevator — squeezed between boxes',
        arabic: 'آسفين عالكراتين، لسا نقلنا هون اليوم',
        roman: "aasfiin 'al-karaatiin, lissa nagalna hoon il-yoom",
        english: "Sorry about the boxes — we only moved in here today.",
        teachingNote: 'لسا is Levantine "just / only" (Gulf: توّنا), and هون is his "here" — yours is هني. Many Jordanian men say ق as g, just like Emiratis.',
        choices: [
          { id: 'a', text: 'Welcome — you\'ve brightened the building!', arabic: 'نورتوا البناية!', roman: 'nawwartu il-binaaya!', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'family', note: 'نورتوا — "you have lit it up" — is how newcomers are welcomed across the Gulf and the Levant. He will answer منورة بأهلها: "it is bright with its people".' },
          { id: 'b', text: 'Let me help you with the boxes', arabic: 'خلني أساعدكم في الكراتين', roman: "khallni asaa'idkum fil-karaatiin", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'neighbour', note: 'Picking up a box before being asked is the kind of help people remember for years. خلني — "let me" — offers without making them say yes.' },
          { id: 'c', text: '(Squeeze past the boxes with a sigh)', arabic: '—', roman: '(a sigh as you squeeze past)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'They apologised, and the sigh told them the apology was needed. First impressions between neighbours last as long as the lease.' },
        ],
      },
      {
        id: 'scene3', kind: 'judgement', charName: 'Abu Omar', charGender: 'male', setting: 'The elevator — a small boy peeks out from behind a box',
        arabic: 'هاد عمر، ابني. عمر، سلم على جارنا!',
        roman: "haad 'umar, ibni. 'umar, sallim 'ala jaarna!",
        english: 'This is Omar, my son. Omar, say hello to our neighbour!',
        charDialogue: {
          warm: { arabic: 'هاد عمر، ابني، بحب الناس كتير. عمر، سلم على جارنا!', roman: "haad 'umar, ibni, bihibb in-naas ktiir. 'umar, sallim 'ala jaarna!", english: 'This is Omar, my son — he loves people. Omar, say hello to our neighbour!' },
          neutral: { arabic: 'هاد عمر، ابني. عمر، سلم على جارنا!', roman: "haad 'umar, ibni. 'umar, sallim 'ala jaarna!", english: 'This is Omar, my son. Omar, say hello to our neighbour!' },
          cold: { arabic: 'عمر، سلم على جارنا', roman: "'umar, sallim 'ala jaarna", english: 'Omar, say hello to the neighbour.' },
        },
        warmThreshold: 9, coldThreshold: 3,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'هاد عمر، ابني. عمر، سلم على جارتنا!',
          roman: "haad 'umar, ibni. 'umar, sallim 'ala jaaritna!",
          english: 'This is Omar, my son. Omar, say hello to our neighbour!',
          charDialogue: {
            warm: { arabic: 'هاد عمر، ابني، بحب الناس كتير. عمر، سلم على جارتنا!', roman: "haad 'umar, ibni, bihibb in-naas ktiir. 'umar, sallim 'ala jaaritna!", english: 'This is Omar, my son — he loves people. Omar, say hello to our neighbour!' },
            neutral: { arabic: 'هاد عمر، ابني. عمر، سلم على جارتنا!', roman: "haad 'umar, ibni. 'umar, sallim 'ala jaaritna!", english: 'This is Omar, my son. Omar, say hello to our neighbour!' },
            cold: { arabic: 'عمر، سلم على جارتنا', roman: "'umar, sallim 'ala jaaritna", english: 'Omar, say hello to the neighbour.' },
          },
        },
        teachingNote: 'هاد is Levantine "this" (Gulf: هذا) and كتير is his وايد. جارنا to a man, جارتنا to a woman.',
        nextByRoute: { family: 'scene4-family', neighbour: 'scene4-neighbour' },
        choices: [
          { id: 'a', text: 'Hi Omar! How are you, champ?', arabic: 'هلا عمر! شلونك يا بطل؟', roman: "hala 'umar! shloonak ya batal?", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, outcome: 'good', route: 'family', note: 'يا بطل — "champ" — is exactly the register for a shy five-year-old. Omar grins, and his father relaxes.' },
          { id: 'b', text: 'Hi Omar! Which floor are you on?', arabic: 'هلا عمر! انت في أي دور؟', roman: "hala 'umar! inta fi ay door?", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'neighbour', note: 'Giving a shy boy a job — find the button — is the quickest way past shyness. دور is the Gulf "floor"; his father would say طابق.' },
          { id: 'c', text: 'God keep him for you', arabic: 'الله يخليه لك', roman: 'allaah ykhalliih lak', score: 5, impact: { trust: 3, respect: 0, culture: 2 }, outcome: 'good', route: 'family', flag: 'BLESSED_OMAR', note: 'الله يخليه لك blesses the child through his father. Parents across the Arab world hear it as the kindest thing a stranger can say.' },
          { id: 'd', text: '(Ignore the boy and check your phone)', arabic: '—', roman: '(eyes on your phone)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'A child told to greet you is waiting for your answer. Leaving him hanging tells his parents more about you than anything you could say.' },
        ],
      },
      {
        id: 'scene4-family', kind: 'judgement', charName: 'Umm Omar', charGender: 'female', setting: 'Their flat — coffee among the boxes',
        arabic: 'تفضل، البيت بيتك. إنت متجوز؟',
        roman: 'tfaddal, il-beit beitak. inta mitjawwiz?',
        english: 'Please, make yourself at home. Are you married?',
        addressesLearner: true,
        femaleLearner: { arabic: 'تفضلي، البيت بيتك. إنتي متجوزة؟', roman: 'tfaddali, il-beit beitik. inti mitjawwze?', english: 'Please, make yourself at home. Are you married?' },
        teachingNote: 'متجوز is Levantine "married" — Gulf says متزوج. Questions like this are how Arab neighbours get to know you: warmth, not prying.',
        choices: [
          { id: 'a', text: 'Not yet — pray for me!', arabic: 'مب بعد، ادعولي!', roman: "mub ba'd, id'uuli!", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'family', next: 'scene5', note: 'Laughing it off with ادعولي — "pray for me" — answers a personal question the way family would. Umm Omar laughs and promises to.' },
          { id: 'b', text: 'Thank God. And you — do you need anything for the flat?', arabic: 'الحمد لله. وانتو، تحتاجون شي للبيت؟', roman: "il-hamdu lillaah. w-intu, tihtaajuun shay lil-bait?", score: 5, impact: { trust: -1, respect: 3, culture: 3 }, outcome: 'good', route: 'neighbour', next: 'scene5', note: 'A kind offer, and the practical help will be welcome. But you side-stepped her question to make it — she noticed the door close a little.' },
          { id: 'c', text: 'That\'s a very personal question', arabic: 'هذا سؤال شخصي وايد', roman: "haadha su'aal shakhsi waayid", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'In her world, asking about your family is how she takes an interest in you. Treating it as prying tells her you would rather stay a stranger.' },
        ],
      },
      {
        id: 'scene4-neighbour', kind: 'judgement', charName: 'Abu Omar', charGender: 'male', setting: 'The hallway — Abu Omar stares at a tangle of cables',
        arabic: 'والله ما بعرف شو بدنا نعمل بالإنترنت والكهربا هون',
        roman: "wallah ma ba'rif shu biddna ni'mal bil-internet wil-kahraba hoon",
        english: "Honestly, I don't know what we have to do about the internet and electricity here.",
        teachingNote: 'بدنا is Levantine "we need to / we want" — Gulf says نبي. ما بعرف is his ما أعرف.',
        choices: [
          { id: 'a', text: 'Easy! Tomorrow I\'ll show you how to register', arabic: 'بسيطة! باكر بوريك شلون تسجل', roman: 'basiita! baachir bawriik shloon tsajjil', score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'neighbour', next: 'scene5', note: 'A promise with a day in it. بوريك — "I will show you" — is the Gulf future, and a neighbour who knows how the building works is gold in week one.' },
          { id: 'b', text: 'Don\'t worry — neighbours look out for neighbours', arabic: 'ولا يهمك، الجار للجار', roman: 'wala yhimmak, il-jaar lil-jaar', score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'family', next: 'scene5', note: 'الجار للجار — "the neighbour is for the neighbour" — says the help comes with belonging, not a favour to repay.' },
          { id: 'c', text: 'Call the property company — not my problem', arabic: 'اتصل بشركة العقار، مب شغلي', roman: "ittasil b-sharikat il-'agaar, mub shughli", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: 'scene5', note: 'Technically true, and it shuts the door on day one. Across the Arab world, the neighbour is the first person you are expected to be able to ask.' },
        ],
      },
      {
        id: 'scene5', kind: 'language', charName: 'Abu Omar', charGender: 'male', setting: 'The hallway — your doors, face to face',
        arabic: 'يلا، تصبح على خير!',
        roman: "yalla, tisbah 'ala khair!",
        english: 'Right then — good night!',
        charDialogue: {
          warm: { arabic: 'يلا، تصبح على خير يا جار! نورتنا والله', roman: "yalla, tisbah 'ala khair ya jaar! nawwartna wallah", english: "Right then — good night, neighbour! You've made our day, honestly." },
          neutral: { arabic: 'يلا، تصبح على خير!', roman: "yalla, tisbah 'ala khair!", english: 'Right then — good night!' },
          cold: { arabic: 'تصبح على خير', roman: "tisbah 'ala khair", english: 'Good night.' },
        },
        warmThreshold: 15, coldThreshold: 5,
        addressesLearner: true,
        femaleLearner: {
          arabic: 'يلا، تصبحي على خير!',
          roman: "yalla, tisbahi 'ala khair!",
          english: 'Right then — good night!',
          charDialogue: {
            warm: { arabic: 'يلا، تصبحي على خير يا جارة! نورتينا والله', roman: "yalla, tisbahi 'ala khair ya jaara! nawwartiina wallah", english: "Right then — good night, neighbour! You've made our day, honestly." },
            neutral: { arabic: 'يلا، تصبحي على خير!', roman: "yalla, tisbahi 'ala khair!", english: 'Right then — good night!' },
            cold: { arabic: 'تصبحي على خير', roman: "tisbahi 'ala khair", english: 'Good night.' },
          },
        },
        teachingNote: 'تصبح على خير — "may you wake to good" — is said at night in every dialect, and it has a set answer: وانت من أهله, "and may you be among its people". To a woman he says تصبحي.',
        nextByRoute: { family: 'scene6-family', neighbour: 'scene6-neighbour' },
        choices: [
          { id: 'a', text: 'And you too', arabic: 'وانت من أهله', roman: 'w-inta min ahla', score: 7, impact: { trust: 2, respect: 2, culture: 3 }, outcome: 'excellent', flag: 'ANSWERED_GOODNIGHT', note: 'A blessing for a blessing. وانت من أهله wishes the good morning straight back — the answer his own family would give him.' },
          { id: 'b', text: 'Goodbye, see you', arabic: 'مع السلامة، نشوفك', roman: "ma'a is-salaama, nshuufak", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, outcome: 'good', note: 'Friendly and correct. But تصبح على خير has its own reply — وانت من أهله — and it is the one that sounds like home.' },
          { id: 'c', text: '(Close your door without a word)', arabic: '—', roman: '(your door clicks shut)', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', note: 'He wished you a good night and heard a lock. Even مع السلامة would have closed the evening kindly.' },
        ],
      },
      {
        id: 'scene6-family', kind: 'judgement', charName: 'Umm Omar', charGender: 'female', setting: 'The next evening — Umm Omar and Omar at your door with a plate',
        arabic: 'هاي مقلوبة عملتها إلك. صحتين!',
        roman: "haay ma'luube 'miltha ilak. sahtein!",
        english: 'This is maqluba I made for you. Enjoy!',
        addressesLearner: true,
        femaleLearner: { arabic: 'هاي مقلوبة عملتها إلك. صحتين!', roman: "haay ma'luube 'miltha ilik. sahtein!", english: 'This is maqluba I made for you. Enjoy!' },
        teachingNote: 'إلك is Levantine "for you" (Gulf: لك / لج), and صحتين is the "bon appétit" you will hear across the region. A plate of food from a neighbour is a welcome.',
        choices: [
          { id: 'a', text: 'Oh wow! Bless your hands, Umm Omar', arabic: 'يا سلام! تسلم يدج يا أم عمر', roman: "ya salaam! tislam yadich ya umm 'umar", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'family', next: null, note: 'تسلم يدج — "bless your hand" — thanks the cook, not just the dish. يدج has the Emirati -ich ending for a woman.' },
          { id: 'b', text: 'Thank you! And when you travel, I\'ll keep an eye on the flat', arabic: 'تسلمين! وإذا سافرتوا، أنا أنتبه على البيت', roman: "tislamiin! w-idha saafartu, ana antibih 'ala il-bait", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'neighbour', next: null, note: 'You answered food with a promise of help. تسلمين is تسلم for a woman — the Gulf thanks for something handed to you.' },
          { id: 'c', text: 'No thanks — I don\'t eat food I don\'t know', arabic: 'لا مشكورة، ما آكل أكل ما أعرفه', roman: "laa mashkuura, maa aakil akil maa a'arfa", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'Food brought to your door is the welcome itself. Refusing it refuses the family who cooked it — take the plate, even if you only try a spoonful.' },
        ],
      },
      {
        id: 'scene6-neighbour', kind: 'judgement', charName: 'Abu Omar', charGender: 'male', setting: 'The next evening — Abu Omar knocks with a suitcase',
        arabic: 'بدي أسافر أسبوع. بتقدر تنتبه عالشقة؟',
        roman: "biddi asaafir usbuu'. bti'dar tintibih 'ash-sha''a?",
        english: 'I have to travel for a week. Could you keep an eye on the flat?',
        addressesLearner: true,
        femaleLearner: { arabic: 'بدي أسافر أسبوع. بتقدري تنتبهي عالشقة؟', roman: "biddi asaafir usbuu'. bti'dari tintibhi 'ash-sha''a?", english: 'I have to travel for a week. Could you keep an eye on the flat?' },
        teachingNote: 'بدي is Levantine "I want / I have to" — Gulf أبي. بتقدر is his تقدر; to a woman, بتقدري.',
        choices: [
          { id: 'a', text: 'Of course! Give me your number, and if anything happens I\'ll call', arabic: 'أكيد! عطني رقمك، وأي شي أكلمك', roman: "akiid! 'atni ragmak, w-ay shay akallmak", score: 6, impact: { trust: 1, respect: 3, culture: 2 }, outcome: 'good', route: 'neighbour', next: null, note: 'Straight to the practical: a number and a plan. عطني is the everyday Gulf "give me" — direct, and normal between neighbours.' },
          { id: 'b', text: 'Of course! Travel with an easy heart', arabic: 'أكيد! سافر وقلبك مرتاح', roman: "akiid! saafir w-galbak mirtaah", score: 6, impact: { trust: 3, respect: 1, culture: 2 }, outcome: 'good', route: 'family', next: null, note: 'سافر وقلبك مرتاح — "go with your heart at rest" — answers the worry, not just the request.' },
          { id: 'c', text: 'Honestly, I don\'t have time', arabic: 'والله ما عندي وقت', roman: "wallaah maa 'indi wagt", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, outcome: 'bad', next: null, note: 'Watching a door for a week costs a glance on your way out. Saying no tells him not to ask you again — for anything.' },
        ],
      },
      {
        id: 'scene7-bonus', bonus: true, charName: 'Umm Omar', charGender: 'female', setting: 'A week later — you knock to return Umm Omar\'s plate',
        arabic: 'أهلين! كيف كانت المقلوبة؟',
        roman: "ahlein! keif kaanat il-ma'luube?",
        english: 'Hello! How was the maqluba?',
        teachingNote: 'Across the Gulf and the Levant, a plate of food never goes back empty. Whatever you return it with, it carries the thanks.',
        choices: [
          { id: 'a', text: '(Hand back the plate, full of dates) And a plate never goes back empty', arabic: 'والصحن ما يرجع فاضي', roman: "w-is-sahn maa yirja' faadi", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'Dates on the plate, and the saying to go with them. Umm Omar laughs — the new neighbour knows the rule her own mother taught her.' },
          { id: 'b', text: '(Hand back the plate with sweets) These are for Omar', arabic: 'هذي حق عمر', roman: "haadhi hagg 'umar", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, outcome: 'excellent', note: 'Filling it for the child makes the return a gift she cannot argue with. Omar is already reaching for the plate.' },
        ],
      },
    ],
    endings: [
      {
        id: 'the-plate-comes-back-full', min: 30, secret: true, requiredFlags: ['BLESSED_OMAR', 'ANSWERED_GOODNIGHT'],
        title: 'A Plate Never Goes Back Empty', arabic: 'الصحن ما يرجع فاضي', roman: "is-sahn maa yirja' faadi", en: 'The plate never goes back empty',
        desc: 'By the end of the week a plate is travelling between your two doors. You blessed Omar through his father, and you answered a goodnight the way their own family would. Umm Omar sends maqluba; it comes back full. Across one hallway, that is how neighbours become family.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        hint: 'Bless a child through his parents — and answer a goodnight the way family does.',
      },
      {
        id: 'like-family', min: 28, route: 'family', tier: 'strong',
        title: 'Like Family', arabic: 'من أهل البيت', roman: 'min ahl il-bait', en: 'One of the household',
        desc: 'Omar knocks on your door to show you his drawings, and there is a place for you at their Friday lunch. You welcomed them warmly, made a fuss of Omar and took their questions as the kindness they were. In the Arab world, the neighbour is family you choose.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Welcome them warmly, make a fuss of Omar, and take the food and the questions as kindness.',
      },
      {
        id: 'friendly-faces', min: 12, route: 'family', tier: 'weak',
        title: 'Friendly Faces', arabic: 'أهلين', roman: 'ahlein', en: 'Hello there',
        desc: 'The family likes you, and Omar waves when he sees you. A few moments came out awkward, though, so for now it is smiles in the hallway rather than a place at the table.',
        color: C.JADE2, type: 'mixed',
        hint: 'Warmth is the right instinct — land the greetings and blessings too, and the door opens wider.',
      },
      {
        id: 'the-one-they-count-on', min: 28, route: 'neighbour', tier: 'strong',
        title: 'The One They Count On', arabic: 'الجار للجار', roman: 'il-jaar lil-jaar', en: 'Neighbours look out for neighbours',
        desc: 'Abu Omar leaves you his spare key when he travels, and his number is the first in your phone under "building". You carried boxes, explained how things work here and kept your word. A neighbour who can be counted on is worth more than a good flat.',
        color: C.JADE_ACCENT, type: 'success',
        hint: 'Be useful: help with the boxes, show them how things work here, and keep your promises.',
      },
      {
        id: 'polite-neighbours', min: 12, route: 'neighbour', tier: 'weak',
        title: 'Polite Neighbours', arabic: 'مسا الخير', roman: 'masa il-kheir', en: 'Good evening',
        desc: 'You are on good terms, and Abu Omar would probably ask you for help. A few exchanges fell flat, though, so for now it is a polite good evening at the lift.',
        color: C.VIOLET2, type: 'mixed',
        hint: 'Helpfulness is the right instinct — pair it with the greetings they are listening for.',
      },
      {
        id: 'the-door-across', min: 0,
        title: 'The Door Across the Hall', arabic: 'جيران وبس', roman: 'jiiraan w-bass', en: 'Just neighbours',
        desc: 'Two doors, a few steps apart. The family stopped trying after the first evening, and now you hear Omar laughing through the wall without ever having said hello to him.',
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
