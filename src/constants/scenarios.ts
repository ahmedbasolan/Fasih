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
  },
];

export const getSocialScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'social_taxi_ride', iconName: 'Zap',
    title: 'The Taxi Ride', subtitle: 'Airport → Hotel, a late-night conversation',
    decisions: 5, endings: 4, phrases: '5', level: 'Beginner', locked: false,
    color: C.JADE_ACCENT, gradientColors: ['#1A1208', '#0D0A05'],
    arabicScene: 'تاكسي',
    kafIntro: 'You just landed in Dubai. Your driver is warm and chatty. Make conversation!',
    mode: 'social',
    dialect: 'Egyptian',
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
  'first-morning': {
    id: 'first-morning',
    title: 'The First Morning',
    phrasesUnlocked: ['fm-s1-1', 'fm-s1-2', 'fm-s1-3', 'fm-s1-4', 'fm-s1-5', 'fm-s1-6', 'fm-s1-7', 'fm-s1-8'],
    primerPhrases: ['fm-s1-1', 'fm-s1-2', 'fm-s1-5'], // صباح الخير / صباح النور / أنا يديد هني
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

  // ── CAREER 2: THE COFFEE INVITATION ────────────────────────────────────────
  'coffee-invitation': {
    id: 'coffee-invitation',
    title: 'The Coffee Invitation',
    phrasesUnlocked: ['w1', 'w2', 'w3', 's1', 'gr1', 'gr6', 'fm7', 's6'],
    primerPhrases: ['w1', 's1', 'gr1'], // إن شاء الله / يلا نشرب قهوة / مشكور
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
        arabic: 'تبي قهوة عربية ولا نسكافيه؟', roman: "tabi gahwa 'arabiyya willa nescafe?", english: 'Would you like Arabic coffee or Nescafé?',
        charDialogue: {
          warm: { arabic: 'يا هلا والله! تبي قهوة عربية ولا نسكافيه؟', roman: "ya hala wallah! tabi gahwa 'arabiyya willa nescafe?", english: "Now that's what I like to hear! Arabic coffee or Nescafé?" },
          neutral: { arabic: 'تبي قهوة عربية ولا نسكافيه؟', roman: "tabi gahwa 'arabiyya willa nescafe?", english: 'Would you like Arabic coffee or Nescafé?' },
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

  // ── SOCIAL 3: EID GREETINGS ─────────────────────────────────────────────────
  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    phrasesUnlocked: ['eid-1', 'eid-2', 'eid-3', 'eid-4', 'eid-5', 'eid-6', 'core-3'],
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

  // ── SOCIAL 1: TAXI RIDE ─────────────────────────────────────────────────────
  'social_taxi_ride': {
    id: 'social_taxi_ride',
    title: 'The Taxi Ride',
    subtitle: 'Airport → Hotel, nighttime',
    kafIntro: 'You just landed in Dubai. Your driver Youssef is Egyptian — warm, chatty, and ready to talk. He speaks Egyptian; you answer in Gulf Arabic. Learning to hold that conversation is the whole point.',
    iconName: 'car',
    estimatedMinutes: 8,
    phrasesUnlocked: ['tx-1', 'tx-2', 'tx-3', 'core-2', 'core-3'],
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
      { min: 24, title: 'Best Ride Ever', arabic: 'أحسن رحلة!', roman: "ahsan rihla!", en: 'What a ride!', desc: "You didn't just take a taxi — you made a friend. Youssef gave you his number and will genuinely pick up when you call. You also did something harder than it looks: you understood Egyptian and answered in Khaleeji, all the way to the hotel.", color: C.JADE_ACCENT, type: 'exceptional' },
      { min: 13, title: 'Good Chat', arabic: 'سوالف حلوة', roman: 'sawaalif hilwa', en: 'Nice conversation', desc: "A genuinely pleasant ride. Youssef enjoyed talking to you and wished you well.", color: C.JADE2, type: 'success' },
      { min: 3, title: 'Forgettable Ride', arabic: 'رحلة عادية', roman: "rihla 'aadiyya", en: 'Just a ride', desc: "Youssef drove you to the hotel. That's about it. Another passenger in a long day of passengers.", color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Awkward Silence', arabic: 'سكوت محرج', roman: 'sukoot muhrij', en: 'Uncomfortable silence', desc: "Youssef gave up trying. The last 20 minutes were just Amr Diab on the radio and the sound of traffic.", color: C.ERROR, type: 'failed' },
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
    phrasesUnlocked: ['el-1', 'el-2', 'el-3', 'el-4', 'core-2'],
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
