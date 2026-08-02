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
    decisions: 4, endings: 5, phrases: '8', level: 'Beginner', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A0F', '#050D08'],
    arabicScene: 'أول صباح',
    kafIntro: 'Your first Arabic greeting sets the tone for every interaction that follows.',
    mode: 'career',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 75, respect: 60, culture: 80 },
  },
  {
    id: 'coffee-invitation', iconName: 'Coffee',
    title: 'The Coffee Invitation', subtitle: 'Build trust with your Emirati colleague',
    decisions: 3, endings: 4, phrases: '8', level: 'Beginner', locked: false,
    color: C.JADE_ACCENT, gradientColors: ['#1A0F0A', '#0D0608'],
    arabicScene: 'قهوة',
    kafIntro: 'Coffee is never just coffee in Emirati culture — it is an invitation to build trust.',
    mode: 'career',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 90, respect: 75, culture: 85 },
  },
  {
    id: 'hotel-guest', iconName: 'Building2',
    title: 'VIP Guest Arrival', subtitle: 'Welcome a local dignitary to your hotel',
    decisions: 3, endings: 4, phrases: '7', level: 'Intermediate', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A14', '#050F0A'],
    arabicScene: 'فندق',
    kafIntro: 'Welcoming a guest in Arabic shows a respect that no translation can fully convey.',
    mode: 'career',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 65, respect: 90, culture: 80 },
  },
  {
    id: 'office-meeting', iconName: 'Briefcase',
    title: 'The First Introduction', subtitle: 'Make a lasting impression at a formal meeting',
    decisions: 12, endings: 5, phrases: '25+', level: 'Intermediate', locked: true,
    color: C.VIOLET2, gradientColors: ['#110A1C', '#080510'],
    arabicScene: 'اجتماع',
    kafIntro: 'In Gulf business culture, how you introduce yourself matters far more than your resume.',
    mode: 'career',
    comingSoon: true,
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 70, respect: 85, culture: 75 },
  },
  {
    id: 'ramadan-shift', iconName: 'Moon',
    title: 'Ramadan Respect', subtitle: 'Navigate the holy month with grace',
    decisions: 8, endings: 3, phrases: '22+', level: 'Advanced', locked: true,
    color: C.VIOLET2, gradientColors: ['#0D0A1A', '#080510'],
    arabicScene: 'رمضان',
    kafIntro: 'During Ramadan, every word you choose carries the weight of the sacred month.',
    mode: 'career',
    comingSoon: true,
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 60, respect: 80, culture: 95 },
  },
  {
    id: 'gym-consultation', iconName: 'Dumbbell',
    title: 'The Gym Consultation', subtitle: 'Help a Saudi client start his fitness journey',
    decisions: 7, endings: 4, phrases: '13', level: 'Intermediate', locked: true,
    color: C.JADE_ACCENT, gradientColors: ['#1A1408', '#0D0A05'],
    arabicScene: 'النادي',
    kafIntro: 'Your first consultation sets the tone. Hospitality before business, always.',
    mode: 'career',
    dialect: 'Saudi Gulf',
    impactPreview: { trust: 80, respect: 65, culture: 60 },
  },
];

export const getMedicalScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'the-checkup', iconName: 'Heart',
    title: 'The Checkup', subtitle: 'Guide a patient through a routine medical visit',
    decisions: 4, endings: 4, phrases: '8', level: 'Beginner', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A0F', '#050D08'],
    arabicScene: 'الفحص',
    kafIntro: 'In Gulf healthcare, a caring nurse can transform a patient\'s entire experience at a clinic.',
    mode: 'career',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 85, respect: 70, culture: 65 },
  },
];

export const getSocialScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'cafe-friends', iconName: 'Coffee',
    title: 'Café Connection', subtitle: 'Strike up a conversation with a local',
    decisions: 3, endings: 4, phrases: '7', level: 'Beginner', locked: true,
    color: C.JADE2, gradientColors: ['#0A1810', '#050C08'],
    arabicScene: 'مقهى',
    kafIntro: 'Small talk in Arabic opens doors that formal introductions never could.',
    mode: 'social',
    // A one-on-one café encounter between an Emirati woman and an unrelated man,
    // ending in a personal number exchange, is not a situation a male learner
    // should be rehearsing. Shown to female learners only.
    requiresGender: 'female',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 70, respect: 50, culture: 70 },
  },
  {
    id: 'eid-greeting', iconName: 'Users',
    title: 'Eid Greetings', subtitle: 'Celebrate the holy day with neighbours',
    decisions: 3, endings: 4, phrases: '7', level: 'Beginner', locked: true,
    color: C.JADE_ACCENT, gradientColors: ['#1A140A', '#0D0A05'],
    arabicScene: 'عيد',
    kafIntro: 'Eid greetings carry centuries of tradition — each phrase is a gift of connection.',
    mode: 'social',
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 60, respect: 75, culture: 95 },
  },
  {
    id: 'weekend-invite', iconName: 'Users',
    title: 'Desert Gathering', subtitle: 'Invited to a family outing outside the city',
    decisions: 10, endings: 5, phrases: '20+', level: 'Intermediate', locked: true,
    color: C.VIOLET2, gradientColors: ['#1A0F08', '#0D0805'],
    arabicScene: 'صحراء',
    kafIntro: 'Accepting a desert invitation means accepting a family\'s trust and deepest hospitality.',
    mode: 'social',
    comingSoon: true,
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 80, respect: 65, culture: 85 },
  },
  {
    id: 'neighborhood', iconName: 'ShoppingBag',
    title: 'Market Day', subtitle: 'Navigate a local souk with confidence',
    decisions: 7, endings: 4, phrases: '16+', level: 'Intermediate', locked: true,
    color: C.VIOLET2, gradientColors: ['#0F0A1A', '#080510'],
    arabicScene: 'سوق',
    kafIntro: 'In the souk, knowing the right words means knowing the culture behind them.',
    mode: 'social',
    comingSoon: true,
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 55, respect: 60, culture: 75 },
  },
  {
    id: 'social_taxi_ride', iconName: 'Zap',
    title: 'The Taxi Ride', subtitle: 'Airport → Hotel, a late-night conversation',
    decisions: 5, endings: 4, phrases: '5', level: 'Beginner', locked: false,
    color: C.JADE_ACCENT, gradientColors: ['#1A1208', '#0D0A05'],
    arabicScene: 'تاكسي',
    kafIntro: 'You just landed in Dubai. Your driver is warm and chatty. Make conversation!',
    mode: 'social',
    dialect: 'Egyptian',
    impactPreview: { trust: 80, respect: 55, culture: 70 },
  },
  {
    id: 'social_elevator', iconName: 'Users',
    title: 'The Elevator', subtitle: 'A brief encounter in your building',
    decisions: 6, endings: 4, phrases: '5', level: 'Beginner', locked: false,
    color: C.VIOLET2, gradientColors: ['#0A0A1A', '#050510'],
    arabicScene: 'مصعد',
    kafIntro: 'You meet someone in your building elevator. Short phrases, simple choices.',
    mode: 'social',
    dialect: 'Jordanian',
    impactPreview: { trust: 65, respect: 60, culture: 75 },
  },
];

export const getOnboardingScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'onboarding-cafe', iconName: 'Coffee',
    title: 'Welcome to the Café', subtitle: 'Your first interaction in Gulf Arabic',
    decisions: 4, endings: 2, phrases: '5+', level: 'Beginner', locked: false,
    color: C.JADE_ACCENT, gradientColors: ['#1A1408', '#0D0A05'],
    arabicScene: 'مقهى',
    kafIntro: 'Your first Arabic moment. Simple, welcoming, and full of cultural warmth.',
    mode: 'social',
    isOnboarding: true,
    dialect: 'Emirati Gulf',
    impactPreview: { trust: 75, respect: 65, culture: 80 },
  },
];

export const getAllScenarios = (C: ThemeColors) => [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)];

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

  // ── SCENARIO 1: THE FIRST MORNING ──────────────────────────────────────────
  'first-morning': {
    id: 'first-morning',
    title: 'The First Morning',
    phrasesUnlocked: ['fm-s1-1', 'fm-s1-2', 'fm-s1-3', 'fm-s1-4', 'fm-s1-5', 'fm-s1-6', 'fm-s1-7', 'fm-s1-8'],
    scenes: [
      {
        id: 'scene1', charName: 'Faisal', charGender: 'male', setting: 'Hotel staff room — 6:45 AM',
        arabic: 'صباح الخير! ويه يديد، ما شفته من قبل',
        roman: 'sabaah il-khair! wayh ydiid, ma shifta min gabil',
        english: "Good morning! A new face I haven't seen before",
        teachingNote: "Faisal says 'ويه يديد' (a new face — masculine). Female learners: he would say 'ويه يديدة' instead. The greeting صباح النور is the same for all.",
        choices: [
          { id: 'a', text: 'Morning of light!', arabic: 'صباح النور!', roman: 'sabaah in-nuur!', score: 9, impact: { trust: 2, respect: 3, culture: 3 }, flag: 'GREETED_IN_DIALECT', note: 'You used the correct Arabic response — صباح النور, not صباح الخير back. This small detail tells Faisal you\'ve made an effort to learn. In Gulf culture, correct greetings signal respect.', outcome: 'excellent' },
          { id: 'b', text: 'Good morning!', arabic: 'صباح الخير!', roman: 'sabaah il-khair!', score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'You greeted in Arabic, which Faisal appreciates. But you replied with صباح الخير instead of صباح النور — a common beginner mix-up. Like answering "good morning" with "good morning" instead of "morning!" — it works, but it\'s slightly off.', outcome: 'good' },
          { id: 'c', text: 'Good morning! (in English)', arabic: '—', roman: '(answered in English)', score: 1, impact: { trust: 0, respect: 1, culture: 0 }, note: 'English works — almost everyone in Dubai speaks it. But Faisal greeted you in Arabic first. Responding in English when someone offers you Arabic is a missed opportunity to connect. He\'ll switch to English and the moment passes.', outcome: 'neutral' },
          { id: 'd', text: '(Silence — just nod)', arabic: '(صمت)', roman: '(samt)', score: -4, impact: { trust: -1, respect: -2, culture: -1 }, note: 'In Gulf culture, not returning a greeting is noticed. It doesn\'t matter if you\'re shy or jet-lagged — a greeting requires a greeting. Faisal will assume you\'re either rude or uninterested in connecting.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene2', charName: 'Faisal', charGender: 'male', setting: 'Hotel staff room — coffee machine',
        arabic: 'أنا فيصل! شلونك؟ أول يوم؟',
        roman: 'ana faysal! shloonak? awwal yoom?',
        english: 'I\'m Faisal! How are you? First day?',
        charDialogue: {
          warm: { arabic: 'أنا فيصل! شلونك؟ أول يوم؟', roman: 'ana faysal! shloonak? awwal yoom?', english: 'I\'m Faisal! How are you? First day?' },
          neutral: { arabic: 'أنا فيصل. شلونك؟', roman: 'ana faysal. shloonak?', english: 'I\'m Faisal. How are you?' },
          cold: { arabic: 'أنا فيصل.', roman: 'ana faysal.', english: 'I\'m Faisal.' },
        },
        warmThreshold: 5,
        coldThreshold: 1,
        teachingNote: "Faisal says 'شلونك؟' — addressing a male learner. Female learners: he would say 'شلونج؟' instead. The response 'الحمد لله، بخير' works the same for both.",
        choices: [
          { id: 'a', text: 'Thank God, I\'m well! I\'m new here. Honored to meet you!', arabic: 'الحمد لله، بخير! أنا يديد هني. تشرفنا!', roman: "al-hamdu lillah, b-khayr! ana ydiid hini. tsharrafna!", score: 9, impact: { trust: 2, respect: 3, culture: 3 }, note: 'A complete, warm response. Starting with الحمد لله shows you understand that "how are you" in Gulf culture always begins with gratitude to God. Adding تشرفنا (honored to meet you) elevates a simple introduction into a genuine gesture of respect.', outcome: 'excellent' },
          { id: 'b', text: 'Thank God! Yes, first day', arabic: 'الحمد لله! إي، أول يوم', roman: 'al-hamdu lillah! ii, awwal yoom', score: 5, impact: { trust: 2, respect: 2, culture: 1 }, note: 'Short but culturally correct. You started with الحمد لله and confirmed it\'s your first day. Faisal will appreciate the honesty. Sometimes simple and sincere beats rehearsed and long.', outcome: 'good' },
          { id: 'c', text: 'I\'m fine, thanks. Yes, first day (in English)', arabic: '—', roman: '(answered in English)', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Faisal asked you شلونك — in Arabic. Answering in English after he\'s opened the door to Arabic signals that you\'re not interested in trying. He\'ll accommodate you, but the cultural bridge stays unbuilt.', outcome: 'neutral' },
          { id: 'd', text: 'Yeah... first day', arabic: 'إي... أول يوم', roman: 'ii... awwal yoom', score: 3, impact: { trust: 1, respect: 1, culture: 1 }, note: 'Nervous but genuine. You used إي (yes in Gulf Arabic) which Faisal notices. Being nervous on your first day is human — Faisal has seen dozens of new hires. Your effort to use even one Arabic word matters more than fluency.', outcome: 'good' },
        ],
      },
      {
        id: 'scene3', charName: 'Faisal', charGender: 'male', setting: 'Hotel staff room — Faisal pours two cups',
        arabic: 'تفضل! قهوة عربية. أول قهوة في أول يوم!',
        roman: "tfaddal! gahwa 'arabiyya. awwal gahwa fi awwal yoom!",
        english: 'Here you go! Arabic coffee. First coffee on your first day!',
        charDialogue: {
          warm: { arabic: 'تفضل! قهوة عربية. أول قهوة في أول يوم!', roman: "tfaddal! gahwa 'arabiyya. awwal gahwa fi awwal yoom!", english: 'Here you go! Arabic coffee. First coffee on your first day!' },
          neutral: { arabic: 'تفضل. قهوة؟', roman: 'tfaddal. gahwa?', english: 'Here. Coffee?' },
          cold: { arabic: 'القهوة هناك.', roman: 'al-gahwa hinaak.', english: 'Coffee\'s over there.' },
        },
        warmThreshold: 10,
        coldThreshold: 3,
        teachingNote: "When someone serves you, the Gulf exchange is a pair: you say الله يعطيك العافية (God give you strength), they answer الله يعافيك. Learn both halves — you will use them every single day at work.",
        choices: [
          { id: 'a', text: 'May God give you strength! Thank you', arabic: 'الله يعطيك العافية! مشكور', roman: "allah ya'tiik al-'aafya! mashkuur", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, flag: 'BLESSED_HIS_EFFORT', note: 'This is the phrase you say to someone who just did something for you — it blesses their effort, not just the coffee. Faisal will answer الله يعافيك. Learn the pair and you have the most-used exchange in any Gulf workplace.', outcome: 'excellent' },
          { id: 'b', text: 'Thank you very much!', arabic: 'مشكور وايد!', roman: 'mashkuur waayid!', score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'مشكور is the everyday Gulf thank-you — warmer and more local than شكراً جزيلاً, which reads as textbook Arabic. You accepted the coffee and showed gratitude, which is what matters most.', outcome: 'good' },
          { id: 'c', text: 'Thanks! The coffee is really good!', arabic: 'مشكور! القهوة وايد حلوة!', roman: 'mashkuur! al-gahwa waayid hilwa!', score: 4, impact: { trust: -1, respect: 2, culture: 3 }, note: '⚖️ The coffee is bitter and you do not like it. Complimenting it anyway is the socially polished move and Faisal is pleased — but praise you do not mean loses its weight over time, which is why trust dips while respect and culture rise.', outcome: 'good' },
          { id: 'd', text: 'No thanks, I\'m fine', arabic: 'لا شكراً، أنا زين', roman: 'la shukran, ana zayn', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Declining a hospitality offer in Gulf culture doesn\'t just refuse the drink — it refuses the connection. Faisal personally poured you a cup on your first day. Saying no, even politely, signals that you\'re keeping distance. Accept first. Always.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene4', charName: 'Faisal', charGender: 'male', setting: 'Hotel staff room — 6:55 AM, shift about to start',
        arabic: 'وايد انبسطت! إذا تحتاج أي شي، أنا هني. يلا، بالتوفيق!',
        roman: "waayid inbasatt! idha tihtaaj ay shay, ana hini. yalla, bit-tawfiig!",
        english: 'I really enjoyed this! If you need anything, I\'m here. Come on, good luck!',
        charDialogue: {
          warm: { arabic: 'وايد انبسطت! إذا تحتاج أي شي، أنا هني. يلا، بالتوفيق!', roman: "waayid inbasatt! idha tihtaaj ay shay, ana hini. yalla, bit-tawfiig!", english: 'I really enjoyed this! If you need anything, I\'m here. Come on, good luck!' },
          neutral: { arabic: 'يلا، بالتوفيق في أول يوم', roman: 'yalla, bit-tawfiig fi awwal yoom', english: 'Alright, good luck on your first day' },
          cold: { arabic: 'بالتوفيق', roman: 'bit-tawfiig', english: 'Good luck.' },
        },
        warmThreshold: 14,
        coldThreshold: 5,
        choices: [
          { id: 'a', text: 'Thanks for the coffee, Faisal! May God grant you success', arabic: 'مشكور على القهوة يا فيصل! الله يوفقك', roman: "mashkuur 'ala al-gahwa ya faysal! allah ywaffgak", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'You named the specific kindness (the coffee) instead of a generic thanks, and sent him into his shift with الله يوفقك — the natural Gulf answer to بالتوفيق. Naming what someone did for you is what makes a colleague remember you.', outcome: 'excellent' },
          { id: 'b', text: 'Thanks Faisal! Let\'s go', arabic: 'شكراً فيصل! يلا', roman: 'shukran faysal! yalla', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Using his name and يلا together feels natural and friendly. You matched his energy. يلا is one of the most useful words you\'ll learn — it works as "let\'s go", "come on", "alright", and even a warm goodbye.', outcome: 'good' },
          { id: 'c', text: 'Thanks. Good luck to you too', arabic: 'شكراً. بالتوفيق لك بعد', roman: "shukran. bit-tawfiig lak ba'ad", score: 4, impact: { trust: 2, respect: 1, culture: 1 }, note: 'Returning the good wish is polite and shows you were listening. Adding لك بعد (to you too) is a natural response. It\'s simple but correct — sometimes matching someone\'s energy is enough.', outcome: 'good' },
          { id: 'd', text: '(Smile and walk away)', arabic: '—', roman: '(a smile, then you walk off)', score: -1, impact: { trust: 0, respect: 0, culture: -1 }, note: 'A smile is better than nothing, but Faisal just gave you five minutes of his morning, a cup of coffee, and an offer to help anytime. A verbal farewell — even just مشكور — completes the exchange. In Gulf culture, silence at the end of a conversation feels abrupt.', outcome: 'neutral' },
          { id: 'e', text: 'Tomorrow the coffee is on me!', arabic: 'باكر القهوة عليّ! الله يعطيك العافية', roman: "baachir al-gahwa 'alayya! allah ya'tiik al-'aafya", score: 10, impact: { trust: 3, respect: 3, culture: 3 }, requiredFlag: 'BLESSED_HIS_EFFORT', note: 'This option only exists because you blessed his effort over the coffee earlier — Faisal already reads you as someone who returns a gesture, so this lands as a promise rather than a pleasantry. باكر (baachir) is the Emirati "tomorrow"; بكرة is what you will hear from Egyptians and Levantines.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      {
        min: 30, secret: true, requiredFlags: ['GREETED_IN_DIALECT', 'BLESSED_HIS_EFFORT'],
        title: 'One of the Boys', arabic: 'صرت من الشباب', roman: 'sirt min ash-shabaab',
        en: 'Faisal: "Come sit with us at break — you\'re one of the boys now"',
        desc: 'You did the two things that matter most on a first morning: you answered his greeting the way an Emirati would, and you blessed his effort instead of just thanking him for the drink. Faisal has already told the others about you before your shift began. SECRET ENDING — most first-timers never link these two moments.',
        color: C.CULTURAL_GOLD, type: 'exceptional',
        culturalJourney: [
          'صباح النور — you knew the answer to صباح الخير is not صباح الخير back',
          'الله يعطيك العافية — you blessed the effort, and he answered الله يعافيك',
          'Because you blessed him early, the offer to buy tomorrow\'s coffee was open to you at all',
          'Two small choices, four scenes apart, that turned a new hire into a colleague',
        ],
      },
      {
        min: 26,
        title: 'The Warm Welcome', arabic: 'الترحيب الحار', roman: 'at-tarhiib al-haar',
        en: 'Faisal: "MashaAllah! I didn\'t feel like you were new — I felt like you were one of us"',
        desc: 'Your first morning couldn\'t have gone better. Faisal didn\'t just meet you — he welcomed you. By greeting correctly, accepting hospitality, and using simple blessings, you became a person, not just a new employee.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: [
          'You responded with صباح النور — the correct reply that most beginners miss',
          'You started with الحمد لله when asked how you are — showing cultural awareness from word one',
          'You blessed Faisal\'s effort with الله يعطيك العافية — the phrase that turns a thank-you into something memorable',
          'You named his kindness specifically — the coffee, the welcome, the time he gave you',
        ],
      },
      {
        min: 15,
        title: 'The Good Start', arabic: 'بداية زينة', roman: 'bidaaya zayna',
        en: 'Faisal: "Good luck! Come tomorrow and we\'ll have coffee again"',
        desc: 'You made a good impression. Faisal sees someone who\'s trying — maybe not fluent, but genuine. The invitation to coffee tomorrow means the door is open. Most new hires don\'t get a second coffee this fast.',
        color: C.JADE2, type: 'success',
        culturalJourney: [
          'You used at least some Arabic — Faisal noticed every word',
          'You accepted his hospitality when it was offered',
          'A few cultural phrases landed correctly and left a mark',
        ],
      },
      {
        min: 4,
        title: 'The Quiet Start', arabic: 'بداية هادية', roman: 'bidaaya haadya',
        en: 'Faisal: "Good luck" (polite but brief)',
        desc: 'Faisal was friendly. You were polite. But the connection stayed on the surface. He\'ll say hello when he sees you, but he won\'t go out of his way to help. In a hotel where relationships determine who gets the good shifts — that matters.',
        color: C.VIOLET2, type: 'mixed',
        culturalJourney: [
          'The conversation stayed mostly in English',
          'Some hospitality moments were missed or declined',
        ],
      },
      {
        min: 0,
        title: 'The Cold Start', arabic: 'بداية باردة', roman: 'bidaaya baarda',
        en: 'Faisal: "...Good luck" (already walking away)',
        desc: 'Faisal tried. He greeted you, offered coffee, gave you time. But the connection didn\'t land. He won\'t hold it against you — but he also won\'t be the colleague who saves you when you\'re lost on the third floor. First impressions are hard to redo.',
        color: C.ERROR, type: 'failed',
      },
    ],
  },

  // ── SCENARIO 2: THE COFFEE INVITATION ──────────────────────────────────────
  'coffee-invitation': {
    id: 'coffee-invitation',
    title: 'The Coffee Invitation',
    phrasesUnlocked: ['w1', 'w2', 'w3', 's1', 'gr1', 'gr6', 'fm7', 's6'],
    scenes: [
      {
        id: 'scene1', charName: 'Ahmed', charGender: 'male', setting: 'Office — break room',
        arabic: 'يلا نشرب قهوة؟', roman: 'yalla nishrab gahwa?', english: 'Come on, shall we grab some coffee?',
        teachingNote: 'A bare إن شاء الله, with no time attached, is how Gulf Arabic says no politely. إن شاء الله + a specific time is a real yes. This one distinction will save you months of misreading people at work.',
        choices: [
          { id: 'a', text: 'Love to — just let me finish this email', arabic: 'ودي والله بس خلني أخلص هالإيميل', roman: "widdi wallah bass khallni akhallas hal-iimail", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'ودي is how you say "I\'d love to" in Gulf Arabic — حبيت means "I liked it" and would confuse him. But the phrasing is not the problem here: putting a task ahead of the invitation tells Ahmed the relationship ranks second.', outcome: 'bad' },
          { id: 'b', text: 'Thanks! God willing', arabic: 'مشكور! إن شاء الله', roman: "mashkuur! in shaa' allah", score: 1, impact: { trust: -1, respect: 1, culture: 0 }, note: '⚖️ You sounded polite — respect goes up — but Ahmed heard a no, so trust goes down. إن شاء الله with no time attached is the standard Gulf soft refusal — he will not ask again today, and he will not bring it up. Attach a time and it becomes a yes.', outcome: 'neutral' },
          { id: 'c', text: 'Yes! Give me five minutes and I\'m with you', arabic: 'إي! خمس دقايق وأنا وياك', roman: "ii! khams dagaayig w-ana wiyyaak", score: 4, impact: { trust: 2, respect: 1, culture: 1 }, note: 'Naming a specific time is what turns a maybe into a yes in Gulf Arabic. وياك (with you) is the Gulf form — مَعَك is the textbook one. Ahmed will wait the five minutes happily.', outcome: 'good' },
          { id: 'd', text: 'يلا! الله يبارك فيك', arabic: 'يلا! الله يبارك فيك', roman: 'yalla! allah ybaarak fiik', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Enthusiastic Arabic response AND invoking a blessing shows cultural mastery.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Ahmed', charGender: 'male', setting: 'Coffee corner — relaxed',
        arabic: 'تريد قهوة عربية ولا نسكافيه؟', roman: "turiid gahwa 'arabiyya willa nescafe?", english: 'Would you like Arabic coffee or Nescafé?',
        charDialogue: {
          warm: { arabic: 'يا هلا والله! تريد قهوة عربية ولا نسكافيه؟', roman: "ya hala wallah! turiid gahwa 'arabiyya willa nescafe?", english: "Now that's what I like to hear! Arabic coffee or Nescafé?" },
          neutral: { arabic: 'تريد قهوة عربية ولا نسكافيه؟', roman: "turiid gahwa 'arabiyya willa nescafe?", english: 'Would you like Arabic coffee or Nescafé?' },
          cold: { arabic: 'قهوة ولا نسكافيه؟', roman: "gahwa willa nescafe?", english: 'Coffee or Nescafé?' },
        },
        warmThreshold: 6, coldThreshold: 1,
        choices: [
          { id: 'a', text: "Just water — I'm not really a coffee person", arabic: 'بس ماي — ما أشرب قهوة وايد', roman: "bass maay — maa ashrab gahwa waayid", score: -4, impact: { trust: -1, respect: -2, culture: -1 }, note: 'Refusing a hospitality offer means rejecting the person, not just the drink.', outcome: 'bad' },
          { id: 'b', text: 'Nescafé please', arabic: 'نسكافيه لو سمحت', roman: 'nescafe law samaht', score: 3, impact: { trust: 1, respect: 0, culture: 0 }, note: 'Neutral — you accepted which is good, but no cultural connection was made.', outcome: 'neutral' },
          { id: 'c', text: "Whatever you're having — I'm with you", arabic: 'أنا معاك — نفس اللي تشربه', roman: "ana ma'aak — nafs illi tishrabah", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, note: 'أنا معاك (I\'m with you) shows deference to your host.', outcome: 'good' },
          { id: 'd', text: 'Arabic coffee — mashaAllah, that smell', arabic: 'قهوة عربية — ما شاء الله على ريحتها', roman: "gahwa 'arabiyya — maa shaa' allah 'ala riihat-ha", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Choosing the Arabic coffee and praising its aroma shows you value the ritual, not just the caffeine. ما شاء الله is the safe way to admire anything — it praises without inviting the evil eye.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Ahmed', charGender: 'male', setting: 'Coffee corner — deeper conversation',
        arabic: 'عندك أهل هني ولا في بلدك؟', roman: "'indak ahal hini willa fi baladak?", english: 'Do you have family here or back home?',
        charDialogue: {
          warm: { arabic: 'والله ارتحت لك. عندك أهل هني ولا في بلدك؟', roman: "wallah irtaht lak. 'indak ahal hini willa fi baladak?", english: "Honestly, I feel at ease with you. Is your family here or back home?" },
          neutral: { arabic: 'عندك أهل هني ولا في بلدك؟', roman: "'indak ahal hini willa fi baladak?", english: 'Do you have family here or back home?' },
          cold: { arabic: 'أهلك هني؟', roman: "ahlak hini?", english: 'Your family here?' },
        },
        warmThreshold: 11, coldThreshold: 2,
        choices: [
          { id: 'a', text: 'I prefer not to discuss personal things at work', arabic: 'أفضل ما نتكلم عن أمور شخصية بالشغل', roman: "afaddal maa nitkallam 'an umuur shakhsiyya bish-shughul", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Family questions are foundational, not personal, in Emirati culture.', outcome: 'bad' },
          { id: 'b', text: 'Back home — I miss them a lot', arabic: 'في بلدي — وايد أشتاق لهم', roman: "fi baladi — waayid ashtaag lahum", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Expressing that you miss your family shows loyalty — a deeply admired value.', outcome: 'good' },
          { id: 'c', text: 'Back home — and you? Are your kids well?', arabic: 'في بلدي. وأنت؟ عيالك بخير؟', roman: "fi baladi. wa inta? 'iyaalak b-khayr?", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Asking "are your children well?" shows you understand family is the centre of Emirati life.', outcome: 'good' },
          { id: 'd', text: 'Thank God — back home, but always in my heart', arabic: 'الحمد لله — هم في بلدي، بس دايماً في قلبي', roman: "al-hamdu lillah — hum fi baladi, bass daayiman fi galbi", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'الحمد لله shows faith and contentment. Starting with it before expressing longing for family shows that gratitude to God comes before personal feelings — a deeply admired quality in Gulf culture.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 22, title: 'Family Partnership', arabic: 'أنت من أهلنا', roman: 'inta min ahlna', en: "You're one of us now", desc: 'Ahmed invites you to meet his family. You\'ve crossed from colleague to friend.', color: C.JADE_ACCENT, type: 'exceptional' },
      { min: 13, title: 'Job Referral', arabic: 'إن شاء الله خير', roman: "in shaa' allah khair", en: 'God willing, only good things', desc: 'Ahmed mentions a great opening and says he\'ll personally recommend you.', color: C.JADE2, type: 'success' },
      { min: 3, title: 'Transactional Colleague', arabic: 'زين، شوف', roman: 'zayn, shuuf', en: "OK, we'll see", desc: 'A pleasant chat but the relationship stays professional.', color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Missed Connection', arabic: 'بكرة إن شاء الله', roman: "bukra in shaa' allah", en: "Tomorrow, God willing", desc: 'Cultural missteps created distance. Ahmed politely closes the conversation.', color: C.ERROR, type: 'failed' },
    ],
  },

  // ── SCENARIO 3: THE GYM CONSULTATION ───────────────────────────────────────
  'gym-consultation': {
    id: 'gym-consultation',
    title: 'The Gym Consultation',
    phrasesUnlocked: ['gym-1', 'gym-2', 'gym-3', 'gym-4', 'gym-5', 'gym-6', 'gym-7', 'gym-8', 'gym-9', 'gym-10', 'gym-11', 'gym-12', 'gym-13-secret'],
    scenes: [
      {
        id: 'scene1', charName: 'Sultan', charGender: 'male', setting: 'Gym front desk — Tuesday 7:30 AM',
        arabic: 'السلام عليكم. أنا سلطان. عندي موعد استشارة',
        roman: "as-salaamu 'alaykum. ana sultaan. 'indi maw'id istishaara",
        english: "Peace be upon you. I'm Sultan. I have a consultation appointment",
        choices: [
          { id: 'a', text: 'And peace be upon you! Welcome, Sultan. Please have a seat', arabic: 'وعليكم السلام! أهلاً وسهلاً فيك يا سلطان. تفضل اقعد', roman: "wa 'alaykum as-salaam! ahlan wa sahlan fiik ya sultaan. tfaddal ig'ad", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, note: 'Perfect professional greeting. You returned the سلام properly, used his name immediately, and offered him a seat with تفضل.', outcome: 'excellent' },
          { id: 'b', text: 'And peace be upon you! Hello. How can I help you?', arabic: 'وعليكم السلام! أهلاً. كيف أقدر أساعدك؟', roman: "wa 'alaykum as-salaam! ahlan. kayf agdar asaa'dak?", score: 4, impact: { trust: 2, respect: 1, culture: 1 }, note: 'Good greeting, but you jumped straight to business. Sultan already told you he has an appointment.', outcome: 'good' },
          { id: 'c', text: 'Hey! You must be Sultan. Welcome! (in English)', arabic: '—', roman: '(answered in English)', score: 0, impact: { trust: 0, respect: 0, culture: -1 }, note: 'Sultan greeted you in Arabic. Responding in casual English ignores his language choice.', outcome: 'neutral' },
          { id: 'd', text: 'Yeah, sit over there. I\'ll come to you', arabic: 'إي، اقعد هناك. بايي لك', roman: "ii, ig'ad hinaak. baayii lak", score: -2, impact: { trust: 0, respect: -1, culture: -1 }, note: 'Directing a client without a proper greeting or تفضل makes him feel like a number, not a person.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene2', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — after water offered',
        arabic: 'الدكتور قالي لازم أنحف. أبي أنزل عشر كيلو عالأقل',
        roman: "ad-duktoor gaali laazim anhaf. abi anzil 'ashar kiilo 'al-agal",
        english: "The doctor told me I need to lose weight. I want to drop at least ten kilos",
        charDialogue: {
          warm: { arabic: 'الدكتور قالي لازم أنحف. والصراحة لقيت الجو هني مريح فأبي أبدأ جدي. عشر كيلو عالأقل', roman: "ad-duktoor gaali laazim anhaf. w-as-saraaha laqayt al-jaw hini muuriih fa-abi abda' jiddi. 'ashar kiilo 'al-agal", english: "The doctor told me I need to lose weight. Honestly I find the atmosphere here comfortable so I want to start seriously. At least ten kilos." },
          neutral: { arabic: 'الدكتور قالي لازم أنحف. أبي أنزل عشر كيلو عالأقل', roman: "ad-duktoor gaali laazim anhaf. abi anzil 'ashar kiilo 'al-agal", english: "The doctor told me I need to lose weight. I want to drop at least ten kilos." },
          cold: { arabic: 'الدكتور قالي لازم أنحف. عشر كيلو.', roman: "ad-duktoor gaali laazim anhaf. 'ashar kiilo.", english: "The doctor told me to lose weight. Ten kilos." },
        },
        warmThreshold: 5, coldThreshold: 1,
        teachingNote: 'Sultan is Saudi, not Emirati. Listen for أبي (abi = I want) and ودي (widdi = I\'d like) — an Emirati would say أبغي (abgha) or أبا. Answer him in your own Gulf Arabic; he is not expecting you to imitate Najdi.',
        choices: [
          { id: 'a', text: 'God willing, we can help you. Ten kilos is doable. What\'s your weight right now?', arabic: 'إن شاء الله نقدر نساعدك. عشر كيلو شي ممكن. كم وزنك الحين؟', roman: "in shaa' allah nigdar nisaa'dak. 'ashar kiilo shay mumkin. kam waznak al-hin?", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, note: 'You validated his goal, used إن شاء الله for cultural humility, and asked a professional follow-up.', outcome: 'excellent' },
          { id: 'b', text: 'MashaAllah that you came! That\'s the most important thing. Let\'s look at your situation', arabic: 'ما شاء الله إنك جيت! هذا أهم شي. خلنا نشوف وضعك', roman: "maa shaa' allah innak yiit! hadha aham shay. khallina nishuuf wad'ak", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Praising someone for showing up honors his decision. خلنا نشوف is collaborative.', outcome: 'good' },
          { id: 'c', text: 'Okay. What\'s your weight? What\'s your height?', arabic: 'أوكي. كم وزنك؟ كم طولك؟', roman: 'okay. kam waznak? kam toolak?', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Efficient but cold. Firing off measurement questions without acknowledging his feelings turns it into a medical intake form.', outcome: 'neutral' },
          { id: 'd', text: 'Yeah, it\'s obvious you need exercise. Don\'t worry', arabic: 'إي واضح إنك تحتاج تمارين. لا تخاف', roman: 'ii waadih innak tihtaaj tamaariin. la tikhaaf', score: -6, impact: { trust: -2, respect: -2, culture: -2 }, note: 'Never comment on a client\'s body unsolicited. This is humiliating for someone already self-conscious.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene3', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — discussing background',
        arabic: 'صراحة ما أتمرن من أيام الجامعة. ودي أرجع زي أول',
        roman: "saraha ma atmarran min ayyaam al-jaam'a. widdi arja' zay awwal",
        english: "Honestly, I haven't exercised since university. I'd like to get back to how I was",
        choices: [
          { id: 'a', text: 'A lot of people start from zero. Do you have any injuries?', arabic: 'وايد ناس يبدون من الصفر. ما عندك أي إصابات؟', roman: "waayid naas yibduun min as-sifr. ma 'indak ay isaabaat?", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'You normalized his situation without lying, then asked about injuries — showing you care about safety.', outcome: 'excellent' },
          { id: 'b', text: 'Totally normal! I have many clients in your same situation and their results are great. Any injuries?', arabic: 'عادي! أنا عندي زبايين كثير نفس وضعك ونتائجهم حلوة. ما عندك إصابات؟', roman: "'aadi! ana 'indi zabaayin kathiir nafs wad'ak w-ntaaijhum hilwa. ma 'indak isaabaat?", score: 5, impact: { trust: 3, respect: 1, culture: 1 }, flag: 'FLAG_1', note: 'Good social proof. Mentioning you handle many clients subtly positions you as someone who runs a practice.', outcome: 'good' },
          { id: 'c', text: 'The good thing is you decided to start. That\'s half the journey', arabic: 'الزين إنك قررت تبدا. هذا نص الطريق', roman: 'az-zayn innak garrart tibda. hadha nuss at-tariig', score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Motivational and genuine. But you did not follow up with any health questions.', outcome: 'good' },
          { id: 'd', text: 'You need cardio every day and a strict diet', arabic: 'تحتاج كارديو كل يوم وداييت صارم', roman: 'tihtaaj kardyo kul yoom w-daayet saarim', score: -4, impact: { trust: -1, respect: -2, culture: -1 }, note: 'Telling a man who hasn\'t exercised in years that he needs daily cardio is overwhelming and presumptuous.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene4', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — planning the program',
        arabic: 'ثلاث مرات بالأسبوع تمام. شو تقترح؟',
        roman: "thlath marraat bil-usbuu' tamaam. shuu tigtrih?",
        english: "Three times a week works. What do you suggest?",
        charDialogue: {
          warm: { arabic: 'ثلاث مرات بالأسبوع تمام والله. أثق في رأيك. شو تقترح لي؟', roman: "thlath marraat bil-usbuu' tamaam wallah. athi'g fi ra'yak. shuu tigtrih li?", english: "Three times a week, fine, by God. I trust your judgment. What do you suggest for me?" },
          neutral: { arabic: 'ثلاث مرات بالأسبوع تمام. شو تقترح؟', roman: "thlath marraat bil-usbuu' tamaam. shuu tigtrih?", english: "Three times a week works. What do you suggest?" },
          cold: { arabic: 'ثلاث مرات. شو الخطة؟', roman: "thlath marraat. shuu al-khatta?", english: "Three times. What's the plan?" },
        },
        warmThreshold: 14, coldThreshold: 3,
        choices: [
          { id: 'a', text: 'I suggest three times per week. One day cardio, two days weights. And we start light', arabic: 'أقترح لك ثلاث مرات بالأسبوع. يوم كارديو، يومين حديد. ونبدا خفيف', roman: "agtarih lak thlath marraat bil-usbuu'. yoom kardyo, yoomayn hadiid. w-nibda khafiif", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, note: 'You used أقترح respectfully, gave clear structure, and immediately added "we start light" for comfort.', outcome: 'excellent' },
          { id: 'b', text: 'Let\'s build a program based on your level. What do you like? Walking, machines, weights?', arabic: 'خلنا نسوي برنامج على حسب مستواك. شو تحب؟ مشي، أجهزة، حديد؟', roman: "khallina nisawwi barnaamij 'ala hasab mustawaak. shuu tihib? mashi, ajhiza, hadiid?", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Giving Sultan choices shows respect. However, a beginner often needs a confident recommendation.', outcome: 'good' },
          { id: 'c', text: 'Honestly, at your current level, I suggest five times per week', arabic: 'صَرَاحَة بِمُسْتَوَاك الْحِين، أَقْتَرِح خَمْس مَرَّات بِالأُسْبُوع', roman: "saraha bi-mustawaak al-hin, agtarih khams marraat bil-usbuu'", score: 3, impact: { trust: 3, respect: -1, culture: -1 }, note: '⚖️ You were blunt about what his body needs and Sultan does respect the directness — trust rises. But he told you three times a week and you overrode him, which in Gulf culture reads as not listening. Net effect: a wash. Honesty without empathy is just bluntness.', outcome: 'neutral' },
          { id: 'd', text: 'We\'ll do super sets, drop sets, and HIIT cardio to start', arabic: 'نسوي سوبر ستس، دروب ستس، وكارديو HIIT في البداية', roman: 'nisawwi super sets, drop sets, w-kardyo HIIT fil-bidaaya', score: -2, impact: { trust: -1, respect: -1, culture: 0 }, note: 'Throwing terms at someone who hasn\'t been in a gym in years makes him feel stupid.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene5', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — price discussion',
        arabic: 'حلو. عجبني الكلام. بكم الجلسة؟',
        roman: "hilw. 'ajabni al-kalaam. bikam al-jalsa?",
        english: "Nice. I like what I'm hearing. How much per session?",
        charDialogue: {
          warm: { arabic: 'والله عجبني كلامك وأسلوبك. بكم الجلسة؟', roman: "wallah 'ajabni kalaamak w-usluubak. bikam al-jalsa?", english: "By God, I like your words and your approach. How much per session?" },
          neutral: { arabic: 'حلو. عجبني الكلام. بكم الجلسة؟', roman: "hilw. 'ajabni al-kalaam. bikam al-jalsa?", english: "Nice. I like what I'm hearing. How much per session?" },
          cold: { arabic: 'بكم الجلسة؟', roman: "bikam al-jalsa?", english: "How much per session?" },
        },
        warmThreshold: 19, coldThreshold: 5,
        choices: [
          { id: 'a', text: 'One session is 300 dirhams. But we have better packages. 12 sessions for 3,000 instead of 3,600', arabic: 'الجلسة الوحدة بـ ٣٠٠ درهم. بس عندنا باقات أحسن. ١٢ جلسة بـ ٣٠٠٠ بدال ٣٦٠٠', roman: "al-jalsa al-wahda bi 300 dirham. bas 'indana baagaat ahsan. 12 jalsa bi 3000 badaal 3600", score: 7, impact: { trust: 2, respect: 3, culture: 2 }, flag: 'FLAG_2', note: 'You gave the single-session price first, then introduced the package as a better deal with clear savings. Transparent pricing lets Sultan draft proposals.', outcome: 'excellent' },
          { id: 'b', text: 'We have packages. Best deal is 12 sessions for 3,000 dirhams', arabic: 'عندنا باقات. أحسن شي باقة ١٢ جلسة بـ ٣٠٠٠ درهم', roman: "'indana baagaat. ahsan shay baaga 12 jalsa bi 3000 dirham", score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'You jumped straight to the package without mentioning the single-session price. Missing context for corporate proposals.', outcome: 'good' },
          { id: 'c', text: 'Before the price, let\'s define your goals', arabic: 'قبل السعر خلنا نحدد أهدافك', roman: "gabl as-si'r khallina nihaddid ahdaafak", score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Sultan asked a direct question. Deflecting it feels evasive. Direct answers build trust.', outcome: 'neutral' },
          { id: 'd', text: 'A session is 500 dirhams. But we can work something out', arabic: 'الجلسة بـ ٥٠٠ درهم. بس ممكن نتفاهم', roman: "al-jalsa bi 500 dirham. bas mumkin nitfaaham", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Starting high to "leave room for negotiation" is dishonest. Gulf Arabs negotiate from honest numbers.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene6', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — final decision',
        arabic: 'حلو. بس شو أحسن سعر تقدر تسويه لي؟ ودي أتأكد قبل ما أدفع',
        roman: "hilw. bas shuu ahsan si'r tigdar tisawwiih li? widdi ata'akkad gabl ma adfa'",
        english: "Nice. But what's the best price you can do? I want to be sure before I pay",
        charDialogue: {
          warm: { arabic: 'أعجبني كل شي. بس شو أحسن سعر تقدر تسويه لي؟ ودي أتأكد بس قبل ما أوقّع', roman: "a'jabni kil shay. bas shuu ahsan si'r tigdar tisawwiih li? widdi ata'akkad bas gabl ma awaqqiq", english: "I liked everything. But what's your best price? I just want to be sure before I sign." },
          neutral: { arabic: 'حلو. بس شو أحسن سعر تقدر تسويه لي؟ ودي أتأكد قبل ما أدفع', roman: "hilw. bas shuu ahsan si'r tigdar tisawwiih li? widdi ata'akkad gabl ma adfa'", english: "Nice. But what's the best price you can do? I want to be sure before I pay." },
          cold: { arabic: 'شو أحسن سعر عندك؟', roman: "shuu ahsan si'r 'indak?", english: "What's your best price?" },
        },
        warmThreshold: 23, coldThreshold: 7,
        choices: [
          { id: 'a', text: 'First two days are free. You get to know me and my style. Then you decide', arabic: 'أول يومين مجاناً. تتعرف عليّ وعلى أسلوبي. بعدها تقرر', roman: "awwal yoomayn majjaanan. tit'arraf 'alayya w-'ala usluubi. ba'daha tigarrir", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, flag: 'FLAG_3', note: 'Offering value instead of dropping price. Free trial lets Sultan confidently pitch to his office.', outcome: 'excellent' },
          { id: 'b', text: 'I can do 12 sessions for 2,800. That\'s my best price', arabic: 'أقدر أسوي لك ١٢ جلسة بـ ٢٨٠٠. هذا أحسن سعر عندي', roman: "agdar asawwi lak 12 jalsa bi 2800. hadha ahsan si'r 'indi", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'A fair discount. But you\'re asking him to commit money without trying first.', outcome: 'good' },
          { id: 'c', text: 'The price is fixed, but the quality is worth it', arabic: 'السعر ثابت، بس الجودة تستاهل', roman: "as-si'r thaabit, bas al-jawda tistaahal", score: 2, impact: { trust: 0, respect: 1, culture: 1 }, note: 'Firmness is fine, but claiming quality without proof is an empty claim.', outcome: 'neutral' },
          { id: 'd', text: 'Okay fine, I\'ll do 200 per session', arabic: 'أوكي خلاص أسوي لك ٢٠٠ للجلسة', roman: "okay khalaas asawwi lak 200 lil-jalsa", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Dropping your price instantly signals desperation. A professional who undervalues their work will be undervalued.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene7-bonus', charName: 'Sultan', charGender: 'male', setting: 'Gym exit — Sultan pauses at the door', bonus: true,
        arabic: 'اسمع... أنا أشتغل في جهة حكومية. عندنا فوق الـ ٢٠٠ موظف. صراحة وايد منهم يحتاجون تمارين. لو أسوي لك عقد مع الشركة، تقدر تسوي جلسات للموظفين؟',
        roman: "isma'... ana ashtaghul fi jiha hukoomiyya. 'indana foog al-200 muwadhdhaf. saraha waayid minhum yihtaajuun tamaariin. law asawwi lak 'agd ma' ash-sharika, tigdar tisawwi jalsaat lil-muwadhdhafiin?",
        english: "Listen... I work at a government entity. We have over 200 employees. Honestly, a lot of them need exercise. If I set up a contract with the company, could you do sessions for the staff?",
        choices: [
          { id: 'a', text: 'Of course I can! Let me prepare a corporate quote for you', arabic: 'طبعاً أقدر! خلني أجهز لك عرض سعر للشركة', roman: "tab'an agdar! khallni ajahiz lak 'ard si'r lish-sharika", score: 12, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Professional proposal. You\'ve unlocked a career-defining opportunity.', outcome: 'excellent' },
          { id: 'b', text: 'Absolutely! Let\'s connect on WhatsApp and I\'ll send you all the details', arabic: 'أبشر! نتواصل على الواتس وأرسل لك كل التفاصيل', roman: "abshir! nitwaasal 'ala al-wats w-arsil lak kul at-tafaasil", score: 12, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Enthusiastic commitment. You\'ve crossed the threshold into partnership.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      {
        min: 32, title: 'The Corporate Contract', arabic: 'العقد المؤسسي', roman: "al-'agd al-mu'assasi", en: 'The Corporate Contract',
        desc: 'Sultan didn\'t just sign up for personal training — he opened the door to a corporate wellness contract with his government entity. Your professionalism, transparent pricing, and free trial offer gave him everything he needed to pitch this to his HR department. You didn\'t chase the sale. You built the case. SECRET ENDING UNLOCKED — Only 8% of users discover this.',
        color: C.JADE_ACCENT, type: 'exceptional', secret: true, requiredFlags: ['FLAG_1', 'FLAG_2', 'FLAG_3'],
        culturalJourney: [
          'Positioning: Mentioning you have "many clients" positioned you as someone who runs a real practice, not a side hustle.',
          'Transparency: Providing both per-session and package pricing gave Sultan the data he needed for corporate proposals.',
          'Value, not price: Offering a free trial instead of discounting proved your confidence in your work.',
          'The result: A one-person consultation became a 200-person opportunity — all because you treated Sultan like a business partner, not just a client.',
        ],
      },
      {
        min: 30, title: 'The Signed Client', arabic: 'الزبون الموقع', roman: 'az-zabuun al-muwaqqic', en: 'The Signed Client',
        desc: 'Sultan signed up. Your consultation was professional, culturally aware, and confidence-building. He\'s committed to the package and will show up tomorrow morning. You gained a loyal client — and in Dubai\'s gym scene, that\'s how careers are built. One client at a time. But there was a bigger opportunity hidden in this conversation that you didn\'t unlock.',
        color: C.JADE2, type: 'success',
        culturalJourney: [
          'Cultural awareness: You handled hospitality, language, and respect correctly.',
          'Professional delivery: Your program recommendations and pricing were sound.',
          'The missed moment: Sultan works for a government office with 200+ employees. A subtle mention of your client base, transparent per-session pricing, and a free trial could have changed his thinking.',
        ],
      },
      {
        min: 6, title: 'The Maybe', arabic: 'يمكن', roman: 'yamkin', en: 'The Maybe',
        desc: 'Sultan was polite but unconvinced. "Let me think about it" in Gulf culture usually means he\'s comparing you to another trainer. He might come back. He might not. The consultation was adequate but didn\'t build enough trust or show enough professionalism to close.',
        color: C.VIOLET2, type: 'mixed',
        culturalJourney: [
          'In Gulf customer service, "adequate" loses to "memorable."',
          'Sultan meets multiple trainers. The one who made him feel most comfortable AND most confident wins.',
          'You had moments of both, but not consistently enough to lock in the decision.',
        ],
      },
      {
        min: 0, title: 'The Lost Lead', arabic: 'الفرصة الضايعة', roman: "al-fursa ad-daay'a", en: 'The Lost Lead',
        desc: 'Sultan is gone. The إن شاء الله without a date tells you everything — he\'s not coming back. The consultation felt impersonal, pushy, or culturally off. In Dubai\'s competitive fitness market, there are dozens of trainers. Sultan will find one who makes him feel respected.',
        color: C.ERROR, type: 'failed',
        culturalJourney: [
          'Multiple moments in this conversation could have gone differently.',
          'Sultan walked in nervous — he needed warmth before business, transparency before commitment, respect before expertise.',
          'Review your choices to see where the connection broke.',
        ],
      },
    ],
  },

  // ── SCENARIO 4: THE CHECKUP ─────────────────────────────────────────────────
  'the-checkup': {
    id: 'the-checkup',
    title: 'The Checkup',
    phrasesUnlocked: ['checkup-1', 'checkup-2', 'checkup-3', 'checkup-4', 'checkup-5', 'checkup-6', 'checkup-7', 'checkup-8'],
    scenes: [
      {
        id: 'scene1', charName: 'Umm Khalid', charGender: 'female', setting: 'Medical clinic — waiting area, 10:00 AM',
        arabic: 'أهلين. أنا أم خالد. كيف الحال؟',
        roman: "ahleen. ana umm khaalid. kaif al-haal?",
        english: "Hello. I'm Umm Khalid. How are you?",
        choices: [
          { id: 'a', text: 'Thank God! Hello Auntie Umm Khalid. Come with me please', arabic: 'الحمد لله! أهلاً خالتي أم خالد. تفضلي معي', roman: "al-hamdu lillah! ahlan khaalti umm khaalid. tfaddali ma'i", score: 9, impact: { trust: 2, respect: 3, culture: 2 }, note: 'خالتي (auntie) is the warm, respectful address for an older woman in Gulf Arabic — more commonly used than عمتي for non-relatives. This puts Umm Khalid at ease from the first word.', outcome: 'excellent' },
          { id: 'b', text: 'Thank God! Hello Umm Khalid. Please come', arabic: 'الحمد لله! أهلاً أم خالد. تفضلي', roman: "al-hamdu lillah! ahlan umm khaalid. tfaddali", score: 4, impact: { trust: 2, respect: 1, culture: 1 }, note: 'Good greeting but missing the honorific خالتي. Using her name alone is polite, but the term of respect tells her she is seen as family, not just a patient number.', outcome: 'good' },
          { id: 'c', text: 'Umm Khalid? Come with me to the room', arabic: 'أم خالد؟ تفضلي معي للغرفة', roman: "umm khaalid? tfaddali ma'i lil-ghurfa", score: 1, impact: { trust: 1, respect: 0, culture: 0 }, note: 'Efficient but impersonal. Umm Khalid greeted warmly and you responded with a task. At least use تفضلي (feminine form) — you did — but the warmth is missing.', outcome: 'neutral' },
          { id: 'd', text: 'Umm Khalid! Yalla come on', arabic: 'أم خالد! يلا تعالي', roman: "umm khaalid! yalla ta'aali", score: -2, impact: { trust: 0, respect: -1, culture: -1 }, note: "Calling an older woman across a waiting room with 'yalla' is too casual and dismissive. She deserves a personal, unhurried greeting — especially in a setting she already told you makes her nervous.", outcome: 'bad' },
        ],
      },
      {
        id: 'scene2', charName: 'Umm Khalid', charGender: 'female', setting: 'Clinic examination room',
        arabic: 'هههه، المستشفيات ما أحبها. بس ولدي قالي لازم فحص',
        roman: "hahaha, al-mustashfayaat ma ahibha. bas waladi gaali laazim fahs",
        english: "Haha, I don't like hospitals. But my son told me I need a checkup",
        charDialogue: {
          warm: { arabic: 'والله، المستشفيات ما أحبها — بس الحمد لله ارتحت هني. ولدي قالي لازم فحص وجيت', roman: "wallah, al-mustashfayaat ma ahibha — bas al-hamdu lillah irtaht hini. waladi gaali laazim fahs w-yiit", english: "Honestly, I don't like hospitals — but thank God, I feel at ease here. My son told me I needed a checkup and I came." },
          neutral: { arabic: 'هههه، المستشفيات ما أحبها. بس ولدي قالي لازم فحص', roman: "hahaha, al-mustashfayaat ma ahibha. bas waladi gaali laazim fahs", english: "Haha, I don't like hospitals. But my son told me I need a checkup." },
          cold: { arabic: 'ما أحب المستشفيات. ولدي قالي لازم فحص وجيت.', roman: "ma ahibu al-mustashfayaat. waladi gaali laazim fahs w-yiit.", english: "I don't like hospitals. My son told me I needed a checkup so I came." },
        },
        warmThreshold: 5, coldThreshold: 1,
        choices: [
          { id: 'a', text: "Don't worry auntie! Simple checkup. First, what's your height? Remove your shoes please", arabic: 'لا تشيلين هم خالتي! فحص بسيط. أول شي كم طولج؟ شيلي صباطج لو سمحتي', roman: "la tishiiliin ham khaalti! fahs basiit. awwal shay kam toolich? shiili sabbaatich law samahti", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, note: 'Reassurance first, then instructions — this sequence is essential for nervous patients. Using the feminine forms (تشيلين، خالتي، طولج) shows you are attentive and careful.', outcome: 'excellent' },
          { id: 'b', text: 'God willing, it\'ll be simple! Remove your shoes and stand here', arabic: 'إن شاء الله بسيط! شيلي صباطج وقفي هني', roman: "in shaa' allah basiit! shiili sabbaatich w-giffi hini", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Good reassurance with إن شاء الله but you gave two instructions at once without pacing. One step at a time helps nervous patients follow along.', outcome: 'good' },
          { id: 'c', text: 'Remove your shoes and stand on the scale', arabic: 'شيلي صباطج وقفي على الميزان', roman: "shiili sabbaatich w-giffi 'ala al-miizaan", score: 1, impact: { trust: 2, respect: 0, culture: -1 }, note: '⚖️ Crisp and competent — she can see you know your job, so trust rises. But she just told you she dislikes clinics and you answered with an instruction. One sentence of comfort costs nothing.', outcome: 'neutral' },
          { id: 'd', text: "Let's check the weight. Hopefully it's not too much", arabic: 'يلا نشوف الوزن. إن شاء الله ما يكون وايد', roman: "yalla nishuuf al-wazn. in shaa' allah ma yikuun waayid", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Never comment on expected weight before measuring. For a woman in a clinical setting, this is especially harmful — it plants anxiety and strips dignity before the scale even moves.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene3', charName: 'Umm Khalid', charGender: 'female', setting: 'Clinic examination room — seated after the weigh-in',
        arabic: 'الوزن زاد شوي عن أول... الله يعين',
        roman: "al-wazn zaad shway 'an awwal... allah y'iin",
        english: "The weight has gone up a bit from before... God help me.",
        charDialogue: {
          warm: { arabic: 'الوزن زاد شوي عن أول... بس الحمد لله، ارتحت وأنا هني', roman: "al-wazn zaad shway 'an awwal... bas al-hamdu lillah, irtaht w-ana hini", english: "The weight has gone up a bit from before... but thank God, I feel at ease being here." },
          neutral: { arabic: 'الوزن زاد شوي عن أول... الله يعين', roman: "al-wazn zaad shway 'an awwal... allah y'iin", english: "The weight has gone up a bit from before... God help me." },
          cold: { arabic: 'الوزن زاد. عادي؟', roman: "al-wazn zaad. 'aadi?", english: "The weight is up. Is that normal?" },
        },
        teachingNote: 'الله يعين (God help me) is what Gulf speakers say when facing something unwelcome but bearable. It is not a request for advice — answering it with a diet lecture misreads the room completely.',
        warmThreshold: 9, coldThreshold: 2,
        choices: [
          { id: 'a', text: 'Now let me check your blood pressure. Roll up your sleeve please and relax a little', arabic: 'الحين خليني أقيس ضغطج. شمري كمج لو سمحتي واسترخي شوي', roman: "al-hin khallini agiis daghtich. shammiri kummich law samahti w-istarkhi shway", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'You announced the procedure before contact and asked her to relax. In Gulf culture, announcing before touching a female patient is not just good practice — it is a mark of deep respect.', outcome: 'excellent' },
          { id: 'b', text: 'Let me check your blood pressure. Roll up your sleeve', arabic: 'خليني أقيس ضغطج. شمري كمج', roman: 'khallini agiis daghtich. shammiri kummich', score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'You announced the procedure but skipped "please" and the relaxation instruction. The announcement is the most important part — you got that right.', outcome: 'good' },
          { id: 'c', text: 'Give me your arm', arabic: 'مدي إيدج', roman: 'maddi iidich', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'No explanation of what you are about to do. For a female patient especially, an unexplained request to extend her arm toward you is jarring and culturally uncomfortable.', outcome: 'neutral' },
          { id: 'd', text: '(Take the device and put it on her arm without saying anything)', arabic: '—', roman: '(no words — you just reach for her arm)', score: -4, impact: { trust: -2, respect: -2, culture: -2 }, note: 'Touching a female patient without any verbal announcement is a serious breach — culturally, professionally, and Islamically. The announcement before contact is not a courtesy. It is a requirement.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene4', charName: 'Umm Khalid', charGender: 'female', setting: 'Clinic examination room — wrapping up',
        arabic: 'مرتفع شوية، يعني فيه مشكلة؟',
        roman: "murtafi' shway? ya'ni fiih mushkila?",
        english: "A little high — so there's a problem?",
        charDialogue: {
          warm: { arabic: 'مرتفع شوية — يعني فيه مشكلة؟ بصراحة أنا مرتاحة والثقة موجودة، بس أبي أعرف', roman: "murtafi' shway — ya'ni fiih mushkila? b-saraaha ana murtaaha w-ath-thiqa mawjuuda, bas abi a'raf", english: "A little high — so is there a problem? Honestly I feel at ease and the trust is there, I just want to know." },
          neutral: { arabic: 'مرتفع شوية، يعني فيه مشكلة؟', roman: "murtafi' shway? ya'ni fiih mushkila?", english: "A little high — so there's a problem?" },
          cold: { arabic: 'مرتفع. يعني فيه شي خطير؟', roman: "murtafi'. ya'ni fiih shay khattiir?", english: "High. Is there something serious?" },
        },
        warmThreshold: 13, coldThreshold: 4,
        choices: [
          { id: 'a', text: "Don't worry auntie, the doctor will explain. But let me ask: are you allergic to anything? Taking any medications?", arabic: 'لا تشيلين هم خالتي، الدكتور بيشرح لج. بس خليني أسألج: عندج حساسية من شي؟ تاخذين أي أدوية؟', roman: "la tishiiliin ham khaalti, ad-duktoor biyishrah lich. bas khallini as'alich: 'indich hasaasiyya min shay? taakhidhiin ay adwiya?", score: 9, impact: { trust: 2, respect: 3, culture: 3 }, note: 'Perfect sequence: reassure first, defer to doctor, then ask your required questions. Using the feminine forms throughout shows you see her as a person, not just a chart.', outcome: 'excellent' },
          { id: 'b', text: 'Are you allergic to anything? Taking medications? Don\'t worry, everything is fine', arabic: 'عندج حساسية من شي؟ تاخذين أدوية؟ لا تخافين، كل شي تمام', roman: "'indich hasaasiyya min shay? taakhidhiin adwiya? la tikhaafiin, kul shay tamaam", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'You asked questions then reassured. But reassuring BEFORE asking gets better answers from a worried patient — especially one already anxious about a high reading.', outcome: 'good' },
          { id: 'c', text: 'Are you allergic to anything? Medications? Smoke?', arabic: 'عندج حساسية؟ أدوية؟ تدخين؟', roman: "'indich hasaasiyya? adwiya? tidakhkhiin?", score: 1, impact: { trust: 1, respect: 0, culture: 0 }, note: 'Rapid-fire questions without context feel like an interrogation. Umm Khalid is still processing the blood pressure news — she needs a breath before the intake continues.', outcome: 'neutral' },
          { id: 'd', text: 'Your blood pressure isn\'t good. You need to eat better and exercise', arabic: 'ضغطج مو زين. لازم تاكلين أحسن وتتمرنين', roman: 'daghtich mu zayn. laazim taakliin ahsan w-titmarraniin', score: -5, impact: { trust: -2, respect: -2, culture: -2 }, note: "You are a nurse, not her doctor. Diagnosing and lecturing oversteps your role and undermines the doctor's authority.", outcome: 'bad' },
        ],
      },
    ],
    endings: [
      {
        min: 24, title: 'The Caring Touch', arabic: 'اللمسة الحنونة', roman: "al-lamsa al-hanuuna", en: 'The Caring Touch',
        desc: 'Umm Khalid walked in nervous and left smiling. You didn\'t just take her vitals — you made a clinic visit feel human. By calling her خالتي, reassuring her before each step, and announcing every procedure before contact, you showed the kind of care that Gulf patients remember. She\'ll ask for you by name next time.',
        color: C.JADE2, type: 'exceptional',
        culturalJourney: [
          'You addressed her as خالتي — showing generational respect from the first moment',
          'You reassured her before measuring — لا تشيلين هم turned anxiety into trust',
          'You announced every procedure before touching her — especially important with a female patient',
          'You deferred to the doctor instead of diagnosing — knowing the edge of your role is itself a form of respect',
        ],
      },
      {
        min: 14, title: 'The Good Nurse', arabic: 'عناية زينة', roman: "'inaaya zayna", en: 'Good care',
        desc: 'The intake went well. Umm Khalid felt respected and mostly comfortable. You did your job professionally and showed enough warmth to make the experience pleasant. A solid visit — but there were moments where a little more reassurance could have made it memorable.',
        color: C.JADE_ACCENT, type: 'success',
        culturalJourney: [
          'You showed basic respect and professional courtesy',
          'Umm Khalid left feeling adequately cared for',
          'A good experience, but not one she\'ll remember for years',
        ],
      },
      {
        min: 2, title: 'The Quiet Check', arabic: 'الفحص الهادي', roman: 'al-fahs al-haadi', en: 'The Quiet Check',
        desc: 'The vitals were taken. The questions were asked. But Umm Khalid felt processed, not cared for. She came in nervous and left nervous. The numbers are in her file, but the human connection isn\'t. In Dubai\'s competitive healthcare market, patients choose clinics where they feel seen.',
        color: C.VIOLET2, type: 'mixed',
        culturalJourney: [
          'The visit was technically adequate but emotionally cold',
          'Umm Khalid felt like a number, not a person',
          'A missed opportunity to build a loyal patient',
        ],
      },
      {
        min: 0, title: 'The Cold Clinic', arabic: 'العيادة الباردة', roman: "al-'ayaada al-baarda", en: 'The Cold Clinic',
        desc: 'Umm Khalid came in telling you she doesn\'t like clinics. You confirmed why. No greeting, no reassurance, no warmth. She\'ll tell her son to find a different clinic — and in Gulf culture, a family recommendation against a place is permanent.',
        color: C.ERROR, type: 'failed',
        culturalJourney: [
          'Umm Khalid came in nervous and left more anxious',
          'You missed opportunities to build trust at every step',
          'Her family will hear this story and choose a different clinic',
        ],
      },
    ],
  },

  // ── SCENARIO 5: VIP GUEST ARRIVAL ──────────────────────────────────────────
  'hotel-guest': {
    id: 'hotel-guest',
    title: 'VIP Guest Arrival',
    phrasesUnlocked: ['hg-1', 'hg-2', 'hg-3', 'hg-4', 'hg-5', 'hg-6', 'core-1'],
    scenes: [
      {
        id: 'scene1', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel lobby — grand entrance',
        arabic: 'السلام عليكم',
        roman: "as-salaamu 'alaykum",
        english: 'Peace be upon you.',
        teachingNote: 'طال عمرك (taal \'umrak — "may your life be long") is THE Gulf way to address someone of rank or age. It is safer than guessing a title: using معالي for someone who is not a minister is a worse mistake than saying nothing at all.',
        choices: [
          { id: 'a', text: 'Hello! Welcome to the hotel', arabic: 'هلا! أهلاً وسهلاً بالفندق', roman: "hala! ahlan wa sahlan bil-findig", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, note: 'Not returning the Islamic greeting when offered is seen as dismissive.', outcome: 'bad' },
          { id: 'b', text: 'And upon you peace', arabic: 'وعليكم السلام', roman: "wa 'alaykum as-salaam", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'You returned the greeting properly — وعليكم السلام is always correct. Sheikh Khalid registers you as respectful. But there is a hierarchy to the Islamic greeting: the full form is وعليكم السلام ورحمة الله وبركاته. When greeting someone of rank, the complete form signals that you know the levels of the greeting, not just the minimum. He noticed you gave the first level. He would have noticed the third.', outcome: 'good' },
          { id: 'c', text: 'Hi there — do you have a reservation?', arabic: 'هلا — عندك حجز؟', roman: "hala — 'indak hajz?", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Jumping to business without a proper greeting is deeply disrespectful to an Emirati guest.', outcome: 'bad' },
          { id: 'd', text: 'And upon you peace, God\'s mercy and blessings — please, may your life be long', arabic: 'وعليكم السلام ورحمة الله وبركاته — تفضل طال عمرك', roman: "wa 'alaykum as-salaam wa rahmatullaah wa barakaatuh — tfaddal taal 'umrak", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'The complete greeting, then طال عمرك — the Gulf honorific that respects rank without gambling on a specific title. This is the register a guest of standing expects, and almost no non-native reaches it.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel lobby — walking to reception',
        arabic: 'الغرفة جاهزة؟ عندي ضيوف يوصلون الحين',
        roman: "al-ghurfa jaahza? 'indi dhuyuuf yuusaluun al-hin",
        english: 'Is the room ready? I have guests arriving soon.',
        charDialogue: {
          warm: { arabic: 'ما شاء الله عليك. الغرفة جاهزة؟ عندي ضيوف يوصلون الحين', roman: "maa shaa' allah 'alayk. al-ghurfa jaahza? 'indi dhuyuuf yuusaluun al-hin", english: "MashaAllah. Is the room ready? I have guests arriving soon." },
          neutral: { arabic: 'الغرفة جاهزة؟ عندي ضيوف يوصلون الحين', roman: "al-ghurfa jaahza? 'indi dhuyuuf yuusaluun al-hin", english: "Is the room ready? I have guests arriving soon." },
          cold: { arabic: 'الغرفة جاهزة؟ ضيوفي يوصلون.', roman: "al-ghurfa jaahza? dhuyuufi yuusaluun.", english: "Is the room ready? My guests are arriving." },
        },
        warmThreshold: 6, coldThreshold: 0,
        choices: [
          { id: 'a', text: 'Let me check the system… one moment', arabic: 'خلني أشيك بالنظام... لحظة', roman: 'khallni ashayyik bin-nidhaam... lahtha', score: -2, impact: { trust: 1, respect: 0, culture: -2 }, note: '⚖️ You did not promise anything you could not deliver, and that honesty earns a little trust. But making a guest of standing wait while you visibly check tells him he is a problem being processed. Reassure first — كل شي جاهز — then verify out of sight.', outcome: 'neutral' },
          { id: 'b', text: 'Everything is prepared for you, God willing', arabic: 'كل شي مجهز لك إن شاء الله', roman: "kul shay mjahaz lak in shaa' allah", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Here إن شاء الله is doing its real job — attached to something already done, it reassures. Note the difference from an invitation, where a bare إن شاء الله means no.', outcome: 'good' },
          { id: 'c', text: 'It should be. Check-in isn\'t until 3 PM though', arabic: 'المفروض. بس التسجيل من الساعة ثلاث', roman: "al-mafruud. bass at-tasjiil min as-saa'a thalaath", score: -6, impact: { trust: -2, respect: -2, culture: -2 }, note: 'Citing policy to a VIP guest is a serious faux pas. Flexibility and generosity are expected.', outcome: 'bad' },
          { id: 'd', text: 'Everything is ready, by God. Your guests are on our heads', arabic: 'كل شي جاهز والله. ضيوفك على الراس', roman: "kul shay jaahiz wallah. dhuyuufak 'ala ar-raas", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"Your guests are on our heads" — the highest form of hospitality, pledging personal honor.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel suite — before departure',
        arabic: 'ما قصرت. شكراً لك',
        roman: "ma gassart. shukran lak",
        english: 'You didn\'t fall short. Thank you.',
        charDialogue: {
          warm: { arabic: 'والله ما قصرت يا أخي. شكراً من قلبي — هذي هي الضيافة الحقيقية', roman: "wallah ma gassart ya akhi. shukran min galbi — hadhihi hiya ad-dhiyaafa al-haqiiqiyya", english: "By God, you didn't fall short at all. Thank you from my heart — this is true hospitality." },
          neutral: { arabic: 'ما قصرت. شكراً لك', roman: "ma gassart. shukran lak", english: "You didn't fall short. Thank you." },
          cold: { arabic: 'مشكور.', roman: "mashkuur.", english: "Thank you." },
        },
        warmThreshold: 12, coldThreshold: 2,
        choices: [
          { id: 'a', text: 'No problem. Have a nice stay!', arabic: 'ما في مشكلة. إقامة سعيدة!', roman: "maa fii mushkila. igaama sa'iida!", score: 2, impact: { trust: 0, respect: 1, culture: 1 }, note: 'Polite but generic. A missed opportunity to deepen the connection.', outcome: 'neutral' },
          { id: 'b', text: 'May God preserve you', arabic: 'الله يخليك', roman: "allah ykhalliik", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: '"God preserve you" is a warm, culturally resonant reply to gratitude.', outcome: 'good' },
          { id: 'c', text: 'Don\'t forget to fill out the feedback form!', arabic: 'لا تنسى تعبي نموذج التقييم!', roman: "la tinsa ti'abbi namuudhaj at-taqyiim!", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Sheikh Khalid just offered you a genuine expression of thanks — "ما قصرت" (you did not fall short) is a meaningful phrase in Gulf culture, not a polite formality. Responding by asking for a review form converts a human moment into a transactional one. It tells him the hotel sees him as a data point, not a guest. He will fill out no form. He will simply not return.', outcome: 'bad' },
          { id: 'd', text: 'This is our duty — your house is our house, always', arabic: 'هذا واجبنا طال عمرك — بيتك بيتنا دايماً', roman: "hadha waajibna taal 'umrak — baitak baitna daayiman", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'هذا واجبنا is the correct answer to ما قصرت — it frames the service as an obligation you were glad to carry. Closing with بيتك بيتنا turns a stay into a standing invitation.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      {
        min: 22, title: 'Royal Patron', arabic: 'نعم الخدمة', roman: "ni'am al-khidma",
        en: 'What excellent service',
        desc: 'Sheikh Khalid requests you personally for every future visit. In Dubai\'s hospitality industry, one VIP patron who asks for you by name changes your career trajectory.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: [
          'You returned السلام عليكم in full — ورحمة الله وبركاته — showing the Sheikh you know the greeting has tiers, not one form',
          'You used طال عمرك rather than guessing a title — the honorific that respects rank without risking the wrong one',
          'You pledged "ضيوفك على الراس" (your guests are on our heads) — the highest form of hospitality commitment in Gulf culture',
          'You closed with "بيتك بيتنا دايماً" (your house is our house always) — transforming a hotel stay into a personal relationship',
          'You never cited policy or made him wait — VIP hospitality means anticipating needs, not managing them',
        ],
      },
      {
        min: 13, title: 'Glowing Review', arabic: 'ما شاء الله عليك', roman: "maa shaa' allah 'alayk",
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
        min: 3, title: 'Professional Service', arabic: 'مشكور', roman: "mashkuur",
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
  },

  // ── SCENARIO 6: CAFÉ CONNECTION ─────────────────────────────────────────────
  'cafe-friends': {
    id: 'cafe-friends',
    title: 'Café Connection',
    phrasesUnlocked: ['cf-1', 'cf-2', 'cf-3', 'cf-4', 'cf-5', 'cf-6', 'core-2'],
    scenes: [
      {
        id: 'scene1', charName: 'Fatima', charGender: 'female', setting: 'Local café — adjacent tables',
        arabic: 'هذا الكرسي فاضي؟',
        roman: "hadha al-kursi faadhi?",
        english: 'Is this chair free?',
        teachingNote: "Notice تفضلي (not تفضل) — the feminine imperative is used when inviting a woman to sit. If the person were male, it would be تفضل. This distinction applies any time you give an invitation or instruction to a specific person.",
        choices: [
          { id: 'a', text: 'Yeah, go ahead', arabic: 'إي تفضلي', roman: 'ii tfaddali', score: 1, impact: { trust: 0, respect: 1, culture: 0 }, note: 'You used the correct feminine form تفضلي, which is noticed. But a bare إي before it keeps the exchange functional rather than warm — the gap between "ii tfaddali" and "ahlan wa sahlan, tfaddali" is the gap between polite and welcoming.', outcome: 'neutral' },
          { id: 'b', text: 'Welcome, be at ease — please sit', arabic: 'أهلاً وسهلاً — تفضلي', roman: "ahlan wa sahlan — tfaddali", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'أهلاً وسهلاً before تفضلي turns permission into welcome. Both use the feminine form correctly — the final -i is what tells Fatima you are actually paying attention to who you are speaking to.', outcome: 'excellent' },
          { id: 'c', text: 'Sorry, I\'m saving it for someone', arabic: 'آسفة، محجوز لأحد', roman: 'aasfa, mahjooz li-ahad', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Refusing a simple request from a stranger reads as unwelcoming. Note the form for yourself: آسفة (aasfa) because you are a woman — a man would say آسف (aasif). Arabic marks your own gender every time you speak.', outcome: 'bad' },
          { id: 'd', text: 'Please, go ahead', arabic: 'تفضلي', roman: "tfaddali", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'تفضلي (to a woman) is the right form and shows cultural awareness — it just arrives without the warmth of a greeting in front of it.', outcome: 'good' },
        ],
      },
      {
        id: 'scene2', charName: 'Fatima', charGender: 'female', setting: 'Local café — sharing the table',
        arabic: 'أنتي من وين؟ أول مرة أشوفك هنا',
        roman: "inti min wayn? awwal marra ashuufich hini",
        english: 'Where are you from? First time I\'ve seen you here.',
        charDialogue: {
          warm: { arabic: 'أنتي من وين؟ صراحة نادر يردون بهالأسلوب الحلو. أول مرة أشوفك هنا؟', roman: "inti min wayn? saraaha naadir yiruddun b-hal-usluub al-hilw. awwal marra ashuufich hini?", english: "Where are you from? Honestly it's rare someone responds that warmly. First time I've seen you here?" },
          neutral: { arabic: 'أنتي من وين؟ أول مرة أشوفك هنا', roman: "inti min wayn? awwal marra ashuufich hini", english: "Where are you from? First time I've seen you here." },
          cold: { arabic: 'من وين أنتي؟', roman: "min wayn inti?", english: "Where are you from?" },
        },
        warmThreshold: 6, coldThreshold: 1,
        choices: [
          { id: 'a', text: 'I\'d rather not say — I like my privacy', arabic: 'أفضل ما أقول — أحب خصوصيتي', roman: "afaddal maa aguul — ahib khususiyyati", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: '"Where are you from?" is not a privacy question in the Gulf — it is the opening move of getting to know someone. Refusing it does not read as guarded; it reads as not interested. The conversation closes here.', outcome: 'bad' },
          { id: 'b', text: 'I\'m from [country] — just moved here recently', arabic: 'أنا من [بلد] — توني يايه هني', roman: 'ana min [balad] — tawni yaaya hini', score: 5, impact: { trust: 1, respect: 2, culture: 1 }, note: 'Honest and friendly. توني يايه uses the Emirati يـ-for-جـ swap — جايه becomes يايه (a man says توني ياي). You just missed the chance to turn the question back to her.', outcome: 'good' },
          { id: 'c', text: 'I\'m from [country] — this place is lovely, mashaAllah', arabic: 'أنا من [بلد] — المكان حلو ما شاء الله', roman: "ana min [balad] — al-makaan hilw maa shaa' allah", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Complimenting the place with ما شاء الله shows you appreciate where you are. ما شاء الله is how you admire something without inviting the evil eye.', outcome: 'good' },
          { id: 'd', text: 'I\'m new here — and you? Are you from this area?', arabic: 'أنا يديدة هني — وأنتي؟ من أهل المنطقة؟', roman: "ana ydiida hini — wa inti? min ahl al-mintaga?", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Sharing, then handing the question back, is the whole engine of Gulf small talk. Note your own form: يديدة because you are a woman (a man says يديد) — and هني, not هنا, is the Emirati "here".', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Fatima', charGender: 'female', setting: 'Local café — saying goodbye',
        arabic: 'كان ودي أكمل سوالف بس لازم أروح. نتواصل؟',
        roman: "kaan widdi akammil sawaalif bas laazim aruuh. nitwaasal?",
        english: "I'd love to keep chatting but I have to go. Shall we stay in touch?",
        charDialogue: {
          warm: { arabic: 'والله كان ودي أكمل سوالف وياج بس لازم أروح. انبسطت وايد. نتواصل؟', roman: "wallah kaan widdi akammil sawaalif wiyyaach bas laazim aruuh. inbasatt waayid. nitwaasal?", english: "Honestly I wanted to keep chatting with you but I have to go. I had a lovely time. Shall we stay in touch?" },
          neutral: { arabic: 'كان ودي أكمل سوالف بس لازم أروح. نتواصل؟', roman: "kaan widdi akammil sawaalif bas laazim aruuh. nitwaasal?", english: "I'd love to keep chatting but I have to go. Shall we stay in touch?" },
          cold: { arabic: 'لازم أروح. يلا مع السلامة.', roman: "laazim aruuh. yalla ma'a as-salaama.", english: "I have to go. Take care." },
        },
        teachingNote: 'وياج (wiyyaach) is "with you" to a woman — a man would hear وياك. Fatima has taken a small social risk by asking to stay in touch; how you answer decides whether it was worth taking.',
        warmThreshold: 11, coldThreshold: 2,
        choices: [
          { id: 'a', text: 'Maybe — I\'m pretty busy these days', arabic: 'يمكن — وايد مشغولة هالأيام', roman: 'yimkin — waayid mashghuula hal-ayyaam', score: -4, impact: { trust: -1, respect: -2, culture: -1 }, note: 'She offered first, and you answered يمكن — the vague hedge that means no. If you genuinely are busy, name a constraint and keep the thread: أكيد! بس هالأسبوع مشغولة — عطيني رقمج.', outcome: 'bad' },
          { id: 'b', text: 'Of course! Here\'s my number', arabic: 'أكيد! هذا رقمي', roman: "akiid! haadha ragmi", score: 5, impact: { trust: 2, respect: 1, culture: 1 }, note: 'A clear yes with no hedging, which is exactly what her offer deserved. Brief, though — a warmer farewell would have sealed it.', outcome: 'good' },
          { id: 'c', text: 'God willing! Honoured to meet you, Fatima', arabic: 'إن شاء الله! تشرفنا يا فاطمة', roman: "in shaa' allah! tsharrafna ya faatima", score: 5, impact: { trust: -1, respect: 2, culture: 3 }, note: '⚖️ Warm, polished, and using her name — it sounds like the most culturally fluent answer here. But a bare إن شاء الله attached to an offer is a soft no, and Fatima hears it that way. Beautiful register, quietly non-committal.', outcome: 'good' },
          { id: 'd', text: 'Of course! Honestly glad I met you — go in God\'s protection', arabic: 'أكيد! والله فرحانة إني عرفتج — في أمان الله', roman: "akiid! wallah farhaana inni 'araftich — fi amaan allah", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'أكيد commits, فرحانة إني عرفتج names the feeling, and في أمان الله is the farewell you use for someone you hope to see again — warmer than مع السلامة.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      {
        min: 22, title: 'Lifelong Friend', arabic: 'صديقتي العزيزة', roman: "sadiigati al-'aziiza",
        en: 'My dear friend',
        desc: 'Fatima invites you to her family gathering next weekend. In Emirati social culture, a family invitation after a single café meeting is rare — it means she sees you as someone worth bringing into her inner circle.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: [
          'You opened with أهلاً وسهلاً — not just "yes" — showing warmth before a stranger even sat down',
          'You said "أنا يديدة هني — وأنتي؟" — sharing yourself first, then handing the question back',
          'You closed with "في أمان الله" instead of مع السلامة — the farewell you use for someone you hope to see again',
          'Fatima asked to stay in touch and you answered أكيد, not إن شاء الله. She knew you meant it.',
        ],
      },
      {
        min: 13, title: 'Coffee Companion', arabic: 'نتقابل مرة ثانية', roman: "nitgaabal marra thaanya",
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
        min: 3, title: 'Passing Acquaintance', arabic: 'يلا مع السلامة', roman: "yalla ma'a as-salaama",
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
  },

  // ── SCENARIO 7: EID GREETINGS ───────────────────────────────────────────────
  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    phrasesUnlocked: ['eid-1', 'eid-2', 'eid-3', 'eid-4', 'eid-5', 'eid-6', 'core-3'],
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
        min: 22, title: 'Adopted Family', arabic: 'أنت ولدنا', roman: "inta waldna",
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
        min: 13, title: 'Neighbourhood Welcome', arabic: 'أهلاً فيك دايماً', roman: "ahlan fiik daayiman",
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
        min: 3, title: 'Polite Visitor', arabic: 'تفضل وقت ما تبي', roman: "tfaddal wagt ma tabi",
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
  },

  // ── SCENARIO 6: TAXI RIDE (Social Mode) ─────────────────────────────────────
  'social_taxi_ride': {
    id: 'social_taxi_ride',
    title: 'The Taxi Ride',
    subtitle: 'Airport → Hotel, nighttime',
    kafIntro: 'You just landed in Dubai. Your driver Youssef is Egyptian — warm, chatty, and ready to talk. He speaks Egyptian; you answer in Gulf Arabic. Learning to hold that conversation is the whole point.',
    iconName: 'car',
    difficulty: 'Level 2 (Elementary)',
    estimatedMinutes: 8,
    phrasesUnlocked: ['tx-1', 'tx-2', 'tx-3', 'core-2', 'core-3'],
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
      { min: 24, title: 'Best Ride Ever', arabic: 'أحسن رحلة!', roman: "ahsan rihla!", en: 'What a ride!', desc: "You didn't just take a taxi — you made a friend. Youssef gave you his number and will genuinely pick up when you call. You also did something harder than it looks: you understood Egyptian and answered in Khaleeji, all the way to the hotel.", color: C.JADE_ACCENT, type: 'exceptional' },
      { min: 13, title: 'Good Chat', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa', en: 'Nice conversation', desc: "A genuinely pleasant ride. Youssef enjoyed talking to you and wished you well.", color: C.JADE2, type: 'success' },
      { min: 3, title: 'Forgettable Ride', arabic: 'رحلة عادية', roman: "rihla 'aadiyya", en: 'Just a ride', desc: "Youssef drove you to the hotel. That's about it. Another passenger in a long day of passengers.", color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Awkward Silence', arabic: 'سكوت محرج', roman: 'sukoot muhrij', en: 'Uncomfortable silence', desc: "Youssef gave up trying. The last 20 minutes were just Amr Diab on the radio and the sound of traffic.", color: C.ERROR, type: 'failed' },
    ],
  },

  // ── SCENARIO 7: THE ELEVATOR (Social Mode) ────────────────────────────────────
  'social_elevator': {
    id: 'social_elevator',
    title: 'The Elevator',
    subtitle: 'Apartment building, evening',
    kafIntro: "You meet someone in your building elevator. Sami is Jordanian — reserved at first. This is Level 1: short phrases, simple choices. He speaks Levantine, you answer in Gulf Arabic. Noticing the difference is the lesson.",
    iconName: 'building',
    difficulty: 'Level 1 (Beginner)',
    estimatedMinutes: 6,
    phrasesUnlocked: ['el-1', 'el-2', 'el-3', 'el-4', 'core-2'],
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
        min: 30, title: 'The Chai Invitation', arabic: 'تعال على شاي!', roman: "ta'aal 'ala shaay!",
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
        min: 16, title: 'Friendly Neighbour', arabic: 'جار طيب', roman: 'jaar tayyib',
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
        min: 4, title: 'The Hallway Nod', arabic: 'هزة راس في الممر', roman: "hazzat raas fil-mamarr",
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
  },

  // ── ONBOARDING: CAFÉ (Career Mode) ────────────────────────────────────────
  'onboarding-cafe-career': {
    id: 'onboarding-cafe-career',
    title: 'Welcome to the Café',
    subtitle: 'Your first interaction in Gulf Arabic',
    kafIntro: 'Your first moment speaking Gulf Arabic. The barista is warm and unhurried — perfect for your first exchange.',
    iconName: 'coffee',
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    phrasesUnlocked: ['e_new1'],
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
          { id: 'd', text: 'One coffee', arabic: 'قهوة', roman: 'gahwa', score: 2, impact: { trust: 1, respect: 0, culture: -1 }, note: '⚖️ Perfectly clear — Layla knows exactly what you want and gets on with it. But no greeting and no لو سمحتي, and in the Gulf those are not decoration. She makes your coffee without much reaction.', outcome: 'neutral', next: 'c2' },
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
        min: 10, title: 'You\'ve Got a Café Friend', arabic: 'صار لك ربع في المقهى', roman: "saar lak rab' fil-maqha",
        en: 'You\'ve got a mate at the café',
        desc: 'Layla will remember you. Every time you come in, she\'ll greet you warmly and ask how you\'re doing. Your first Gulf Arabic conversation turned into a real connection.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: ['You opened with a proper greeting', 'You used "law samahti" — the Gulf please, in its feminine form for a female barista', 'You used "mashkura" — the feminine form of thanks, because Layla is female'],
      },
      {
        min: 5, title: 'Pleasant Exchange', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa',
        en: 'Nice conversation',
        desc: 'You ordered in Arabic, Layla appreciated the effort. Next time you come in, she\'ll say hello and might chat for a moment.',
        color: C.JADE2, type: 'success',
        culturalJourney: ['You made the effort to speak Arabic', 'The interaction was polite and straightforward'],
      },
      {
        min: 0, title: 'Transaction Complete', arabic: 'خلصنا', roman: 'khallasna',
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
    difficulty: 'Beginner',
    estimatedMinutes: 5,
    phrasesUnlocked: ['e_new1'],
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
          { id: 'd', text: 'One coffee', arabic: 'قهوة', roman: 'gahwa', score: 2, impact: { trust: 1, respect: 0, culture: -1 }, note: '⚖️ Perfectly clear — Omar knows exactly what you want and gets on with it. But no greeting and no لو سمحت, and in the Gulf those are not decoration. He makes your coffee without much reaction.', outcome: 'neutral', next: 'c2' },
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
        min: 10, title: 'You\'ve Got a Café Friend', arabic: 'صار لك ربع في المقهى', roman: "saar lak rab' fil-maqha",
        en: 'You\'ve got a mate at the café',
        desc: 'Omar will remember you. Every time you come in, he\'ll greet you warmly and ask how you\'re doing. Your first Gulf Arabic conversation turned into a real connection.',
        color: C.JADE_ACCENT, type: 'exceptional',
        culturalJourney: ['You opened with a proper greeting', 'You used "law samaht" — the Gulf please, not the textbook من فضلك', 'You used the masculine form of thanks because Omar is male'],
      },
      {
        min: 5, title: 'Pleasant Exchange', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa',
        en: 'Nice conversation',
        desc: 'You ordered in Arabic, Omar appreciated the effort. Next time you come in, he\'ll say hello and might chat for a moment.',
        color: C.JADE2, type: 'success',
        culturalJourney: ['You made the effort to speak Arabic', 'The interaction was polite and straightforward'],
      },
      {
        min: 0, title: 'Transaction Complete', arabic: 'خلصنا', roman: 'khallasna',
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
