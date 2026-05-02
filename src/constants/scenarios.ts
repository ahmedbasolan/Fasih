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
    decisions: 4, endings: 4, phrases: '8', level: 'Beginner', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A0F', '#050D08'],
    arabicScene: 'أول صباح',
    kafIntro: 'Your first Arabic greeting sets the tone for every interaction that follows.',
    mode: 'career',
    dialect: 'Emirati Gulf',
  },
  {
    id: 'coffee-invitation', iconName: 'Coffee',
    title: 'The Coffee Invitation', subtitle: 'Build trust with your Emirati colleague',
    decisions: 10, endings: 5, phrases: '20+', level: 'Beginner', locked: false,
    color: C.GOLD, gradientColors: ['#1A0F0A', '#0D0608'],
    arabicScene: 'قهوة',
    kafIntro: 'Coffee is never just coffee in Emirati culture — it is an invitation to build trust.',
    mode: 'career',
    dialect: 'Emirati Gulf',
  },
  {
    id: 'hotel-guest', iconName: 'Building2',
    title: 'VIP Guest Arrival', subtitle: 'Welcome a local dignitary to your hotel',
    decisions: 8, endings: 4, phrases: '18+', level: 'Intermediate', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A14', '#050F0A'],
    arabicScene: 'فندق',
    kafIntro: 'Welcoming a guest in Arabic shows a respect that no translation can fully convey.',
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
  },
  {
    id: 'gym-consultation', iconName: 'Dumbbell',
    title: 'The Gym Consultation', subtitle: 'Help a Saudi client start his fitness journey',
    decisions: 6, endings: 3, phrases: '12', level: 'Intermediate', locked: true,
    color: C.GOLD, gradientColors: ['#1A1408', '#0D0A05'],
    arabicScene: 'النادي',
    kafIntro: 'Your first consultation sets the tone. Hospitality before business, always.',
    mode: 'career',
    dialect: 'Saudi Gulf',
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
  },
];

export const getSocialScenarios = (C: ThemeColors): Scenario[] => [
  {
    id: 'cafe-friends', iconName: 'Coffee',
    title: 'Café Connection', subtitle: 'Strike up a conversation with a local',
    decisions: 8, endings: 4, phrases: '15+', level: 'Beginner', locked: true,
    color: C.JADE2, gradientColors: ['#0A1810', '#050C08'],
    arabicScene: 'مقهى',
    kafIntro: 'Small talk in Arabic opens doors that formal introductions never could.',
    mode: 'social',
    dialect: 'Emirati Gulf',
  },
  {
    id: 'eid-greeting', iconName: 'Users',
    title: 'Eid Greetings', subtitle: 'Celebrate the holy day with neighbours',
    decisions: 6, endings: 3, phrases: '12+', level: 'Beginner', locked: true,
    color: C.GOLD, gradientColors: ['#1A140A', '#0D0A05'],
    arabicScene: 'عيد',
    kafIntro: 'Eid greetings carry centuries of tradition — each phrase is a gift of connection.',
    mode: 'social',
    dialect: 'Emirati Gulf',
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
  },
];

export const getAllScenarios = (C: ThemeColors) => [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)];

export function getScenarioById(id: string, C: ThemeColors): Scenario | undefined {
  return getAllScenarios(C).find(s => s.id === id);
}

export function getFeaturedScenario(C: ThemeColors): Scenario {
  return getCareerScenarios(C)[0];
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
        arabic: 'صباح الخير! ويه يديد ما شفته قبل',
        roman: 'sabaah il-khair! wayh ydiid ma shifta gabil',
        english: "Good morning! A new face I haven't seen before",
        teachingNote: "Faisal says 'ويه يديد' (a new face — masculine). Female learners: he would say 'ويه يديدة' instead. The greeting صباح النور is the same for all.",
        choices: [
          { id: 'a', text: 'Morning of light!', arabic: 'صباح النور!', roman: 'sabaah in-nuur!', score: 9, impact: { trust: 2, respect: 3, culture: 3 }, note: 'You used the correct Arabic response — صباح النور, not صباح الخير back. This small detail tells Faisal you\'ve made an effort to learn. In Gulf culture, correct greetings signal respect.', outcome: 'excellent' },
          { id: 'b', text: 'Good morning!', arabic: 'صباح الخير!', roman: 'sabaah il-khair!', score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'You greeted in Arabic, which Faisal appreciates. But you replied with صباح الخير instead of صباح النور — a common beginner mix-up. Like answering "good morning" with "good morning" instead of "morning!" — it works, but it\'s slightly off.', outcome: 'good' },
          { id: 'c', text: 'Good morning! (in English)', arabic: 'قود مورننق!', roman: 'good morning!', score: 1, impact: { trust: 0, respect: 1, culture: 0 }, note: 'English works — almost everyone in Dubai speaks it. But Faisal greeted you in Arabic first. Responding in English when someone offers you Arabic is a missed opportunity to connect. He\'ll switch to English and the moment passes.', outcome: 'neutral' },
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
        warmThreshold: 10,
        coldThreshold: 0,
        teachingNote: "Faisal says 'شلونك؟' — addressing a male learner. Female learners: he would say 'شلونج؟' instead. The response 'الحمد لله، بخير' works the same for both.",
        choices: [
          { id: 'a', text: 'Thank God, I\'m well! I\'m new here. Honored to meet you!', arabic: 'الحمد لله، بخير! أنا يديد هني. تشرفنا!', roman: "al-hamdu lillah, b-khayr! ana ydiid hini. tsharrafna!", score: 9, impact: { trust: 2, respect: 3, culture: 3 }, note: 'A complete, warm response. Starting with الحمد لله shows you understand that "how are you" in Gulf culture always begins with gratitude to God. Adding تشرفنا (honored to meet you) elevates a simple introduction into a genuine gesture of respect.', outcome: 'excellent' },
          { id: 'b', text: 'Thank God! Yes, first day', arabic: 'الحمد لله! إي، أول يوم', roman: 'al-hamdu lillah! ii, awwal yoom', score: 5, impact: { trust: 2, respect: 2, culture: 1 }, note: 'Short but culturally correct. You started with الحمد لله and confirmed it\'s your first day. Faisal will appreciate the honesty. Sometimes simple and sincere beats rehearsed and long.', outcome: 'good' },
          { id: 'c', text: 'I\'m fine, thanks. Yes, first day (in English)', arabic: 'آيم فاين، ثانكس. يس، فيرست داي', roman: "I'm fine, thanks. Yes, first day", score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Faisal asked you شلونك — in Arabic. Answering in English after he\'s opened the door to Arabic signals that you\'re not interested in trying. He\'ll accommodate you, but the cultural bridge stays unbuilt.', outcome: 'neutral' },
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
        warmThreshold: 15,
        coldThreshold: 5,
        choices: [
          { id: 'a', text: 'May God give you strength! Thank you', arabic: 'الله يعافيك! شكراً', roman: "allah y'aafiik! shukran", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, note: 'الله يعافيك is one of the most powerful workplace phrases in Gulf culture. It blesses someone\'s effort and energy. Faisal didn\'t just hand you coffee — he welcomed you. Your blessing acknowledges that. This is the kind of phrase that makes colleagues remember you.', outcome: 'excellent' },
          { id: 'b', text: 'Thank you very much!', arabic: 'شكراً جزيلاً!', roman: 'shukran jaziilan!', score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Polite and appreciative. شكراً جزيلاً is always appropriate. You accepted the coffee and showed gratitude — that\'s what matters most. The blessing (الله يعافيك) would have been the cultural home run, but gratitude is never wrong.', outcome: 'good' },
          { id: 'c', text: 'Thanks! The coffee is really good!', arabic: 'شُكْراً! وَايِد حِلْوَة القَهْوَة!', roman: 'shukran! waayid hilwa al-gahwa!', score: 4, impact: { trust: -1, respect: 2, culture: 3 }, note: '⚖️ Cultural paradox: Complimenting the coffee is the warm, polished move — Faisal is pleased. But the coffee is bitter and you don\'t like it. Gulf hospitality culture expects gracious acceptance, and a white lie here is socially harmless. The -1 trust is not about Faisal — it is a private signal to you: this habit, repeated, means your praise loses weight over time. Genuine appreciation lands harder than reflexive compliments. Both paths (honest gratitude or warm compliment) are valid. This choice teaches the difference.', outcome: 'good' },
          { id: 'd', text: 'No thanks, I\'m fine', arabic: 'لا شكراً، أنا زين', roman: 'la shukran, ana zayn', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Declining a hospitality offer in Gulf culture doesn\'t just refuse the drink — it refuses the connection. Faisal personally poured you a cup on your first day. Saying no, even politely, signals that you\'re keeping distance. Accept first. Always.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene4', charName: 'Faisal', charGender: 'male', setting: 'Hotel staff room — 6:55 AM, shift about to start',
        arabic: 'وايد انبسطت! إذا تحتاج أي شي، أنا هني. يلا، بالتوفيق!',
        roman: "waayid inbasat! idha tihtaaj ay shay, ana hini. yalla, bit-tawfiig!",
        english: 'I really enjoyed this! If you need anything, I\'m here. Come on, good luck!',
        charDialogue: {
          warm: { arabic: 'وايد انبسطت! إذا تحتاج أي شي، أنا هني. يلا، بالتوفيق!', roman: "waayid inbasat! idha tihtaaj ay shay, ana hini. yalla, bit-tawfiig!", english: 'I really enjoyed this! If you need anything, I\'m here. Come on, good luck!' },
          neutral: { arabic: 'يلا، بالتوفيق في أول يوم', roman: 'yalla, bit-tawfiig fi awwal yoom', english: 'Alright, good luck on your first day' },
          cold: { arabic: 'بالتوفيق', roman: 'bit-tawfiig', english: 'Good luck.' },
        },
        warmThreshold: 20,
        coldThreshold: 10,
        choices: [
          { id: 'a', text: 'May God give you strength! Thank you so much for the coffee', arabic: 'الله يعافيك! وايد شكراً على القهوة', roman: "allah y'aafiik! waayid shukran 'ala al-gahwa", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Perfect ending. You used الله يعافيك again — this time as a farewell blessing for someone heading to work. You also thanked him for the specific gesture (the coffee), not just a generic thanks. In Gulf culture, remembering and naming the kindness someone showed you creates a lasting bond.', outcome: 'excellent' },
          { id: 'b', text: 'Thanks Faisal! Let\'s go', arabic: 'شكراً فيصل! يلا', roman: 'shukran faysal! yalla', score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Using his name and يلا together feels natural and friendly. You matched his energy. يلا is one of the most useful words you\'ll learn — it works as "let\'s go", "come on", "alright", and even a warm goodbye.', outcome: 'good' },
          { id: 'c', text: 'Thanks. Good luck to you too', arabic: 'شكراً. بالتوفيق لك بعد', roman: "shukran. bit-tawfiig lak ba'ad", score: 4, impact: { trust: 2, respect: 1, culture: 1 }, note: 'Returning the good wish is polite and shows you were listening. Adding لك بعد (to you too) is a natural response. It\'s simple but correct — sometimes matching someone\'s energy is enough.', outcome: 'good' },
          { id: 'd', text: '(Smile and walk away)', arabic: '(ابتسامة ومشى)', roman: '(ibtisaama w-masha)', score: -1, impact: { trust: 0, respect: 0, culture: -1 }, note: 'A smile is better than nothing, but Faisal just gave you five minutes of his morning, a cup of coffee, and an offer to help anytime. A verbal farewell — even just شكراً — completes the exchange. In Gulf culture, silence at the end of a conversation feels abrupt.', outcome: 'neutral' },
        ],
      },
    ],
    endings: [
      {
        min: 28,
        title: 'The Warm Welcome', arabic: 'الترحيب الحار', roman: 'at-tarhiib al-haar',
        en: 'Faisal: "MashaAllah! I didn\'t feel like you were new — I felt like you were one of us"',
        desc: 'Your first morning couldn\'t have gone better. Faisal didn\'t just meet you — he welcomed you. By greeting correctly, accepting hospitality, and using simple blessings, you became a person, not just a new employee.',
        color: C.GOLD, type: 'exceptional',
        culturalJourney: [
          'You responded with صباح النور — the correct reply that most beginners miss',
          'You started with الحمد لله when asked how you are — showing cultural awareness from word one',
          'You blessed Faisal\'s effort with الله يعافيك — the phrase that turns a thank-you into something memorable',
          'You named his kindness specifically — the coffee, the welcome, the time he gave you',
        ],
      },
      {
        min: 16,
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
        min: 6,
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
        choices: [
          { id: 'a', text: 'Love to — just let me finish this email', arabic: 'حبيت بس خلني أخلص هالإيميل', roman: 'habait bass khallni akhallas hal-iimail', score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Prioritising tasks over an invitation signals you don\'t value the relationship.', outcome: 'bad' },
          { id: 'b', text: 'شكراً! إن شاء الله', arabic: 'شكراً! إن شاء الله', roman: "shukran! in shaa' allah", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'إن شاء الله used sincerely shows cultural fluency and genuine respect. Tone matters — say it with warmth, not hesitation.', outcome: 'good' },
          { id: 'c', text: 'Sure, but I only have 5 minutes', arabic: 'إي بس عندي خمس دقايق بس', roman: "ii bass 'indi khams dagaayig bass", score: -2, impact: { trust: -1, respect: 0, culture: -1 }, note: 'Rushing a coffee invitation is seen as disrespectful. Coffee is a ritual of bonding.', outcome: 'bad' },
          { id: 'd', text: 'يلا! الله يبارك فيك', arabic: 'يلا! الله يبارك فيك', roman: 'yalla! allah ybaarak fiik', score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Enthusiastic Arabic response AND invoking a blessing shows cultural mastery.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Ahmed', charGender: 'male', setting: 'Coffee corner — relaxed',
        arabic: 'تريد قهوة عربية ولا نسكافيه؟', roman: "turiid gahwa 'arabiyya willa nescafe?", english: 'Would you like Arabic coffee or Nescafé?',
        choices: [
          { id: 'a', text: "Just water — I'm not really a coffee person", arabic: 'بس ماي — ما أشرب قهوة وايد', roman: "bass maay — maa ashrab gahwa waayid", score: -4, impact: { trust: -1, respect: -2, culture: -1 }, note: 'Refusing a hospitality offer means rejecting the person, not just the drink.', outcome: 'bad' },
          { id: 'b', text: 'Nescafé please', arabic: 'نسكافيه لو سمحت', roman: 'nescafe law samaht', score: 3, impact: { trust: 1, respect: 0, culture: 0 }, note: 'Neutral — you accepted which is good, but no cultural connection was made.', outcome: 'neutral' },
          { id: 'c', text: "Whatever you're having — I'm with you", arabic: 'أنا معاك — نفس اللي تشربه', roman: "ana ma'aak — nafs illi tishrabah", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, note: 'أنا معاك (I\'m with you) shows deference to your host.', outcome: 'good' },
          { id: 'd', text: 'قهوة عربية — ما شاء الله على ريحتها', arabic: 'قهوة عربية — ما شاء الله', roman: "gahwa 'arabiyya — maa shaa' allah", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'ما شاء الله on the aroma shows you appreciate the ritual itself.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Ahmed', charGender: 'male', setting: 'Coffee corner — deeper conversation',
        arabic: 'عندك أهل هني ولا في البر؟', roman: "'indak ahal hini willa fil-barr?", english: 'Do you have family here or back home?',
        choices: [
          { id: 'a', text: 'I prefer not to discuss personal things at work', arabic: 'أفضل ما نتكلم عن أمور شخصية بالشغل', roman: "afaddal maa nitkallam 'an umuur shakhsiyya bish-shughul", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Family questions are foundational, not personal, in Emirati culture.', outcome: 'bad' },
          { id: 'b', text: 'Back home — I miss them a lot', arabic: 'في بلدي — وايد أشتاق لهم', roman: "fi baladi — waayid ashtaag lahum", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Expressing that you miss your family shows loyalty — a deeply admired value.', outcome: 'good' },
          { id: 'c', text: 'Back home — and you? Are your kids well?', arabic: 'في بلدي. وأنت؟ عيالك بخير؟', roman: "fi baladi. wa inta? 'iyaalak b-khayr?", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Asking "are your children well?" shows you understand family is the centre of Emirati life.', outcome: 'good' },
          { id: 'd', text: 'Thank God — back home, but always in my heart', arabic: 'الحمد لله — هم في بلدي، بس دايماً في قلبي', roman: "al-hamdu lillah — hum fi baladi, bass daayiman fi galbi", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'الحمد لله shows faith and contentment. Starting with it before expressing longing for family shows that gratitude to God comes before personal feelings — a deeply admired quality in Gulf culture.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 22, title: 'Family Partnership', arabic: 'أنت من أهلنا', roman: 'inta min ahlna', en: "You're one of us now", desc: 'Ahmed invites you to meet his family. You\'ve crossed from colleague to friend.', color: C.GOLD, type: 'exceptional' },
      { min: 14, title: 'Job Referral', arabic: 'إن شاء الله خير', roman: "in shaa' allah khair", en: 'God willing, only good things', desc: 'Ahmed mentions a great opening and says he\'ll personally recommend you.', color: C.JADE2, type: 'success' },
      { min: 4, title: 'Transactional Colleague', arabic: 'زين، شوف', roman: 'zayn, shuuf', en: "OK, we'll see", desc: 'A pleasant chat but the relationship stays professional.', color: C.VIOLET2, type: 'mixed' },
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
          { id: 'c', text: 'Hey! You must be Sultan. Welcome! (in English)', arabic: 'هاي! يو مست بي سلطان. ولكم!', roman: 'hey! you must be Sultan. Welcome!', score: 0, impact: { trust: 0, respect: 0, culture: -1 }, note: 'Sultan greeted you in Arabic. Responding in casual English ignores his language choice.', outcome: 'neutral' },
          { id: 'd', text: 'Yeah, sit over there. I\'ll come to you', arabic: 'إي، اقعد هناك. بايي لك', roman: "ii, ig'ad hinaak. baayii lak", score: -2, impact: { trust: 0, respect: -1, culture: -1 }, note: 'Directing a client without a proper greeting or تفضل makes him feel like a number, not a person.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene2', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — after water offered',
        arabic: 'الدكتور قالي لازم أنحف. أبي أنزل عشر كيلو عالأقل',
        roman: "ad-duktoor gaali laazim anhaf. abi anzil 'ashar kiilo 'al-agal",
        english: "The doctor told me I need to lose weight. I want to drop at least ten kilos",
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
        choices: [
          { id: 'a', text: 'I suggest three times per week. One day cardio, two days weights. And we start light', arabic: 'أقترح لك ثلاث مرات بالأسبوع. يوم كارديو، يومين حديد. ونبدا خفيف', roman: "agtarih lak thlath marraat bil-usbuu'. yoom kardyo, yoomayn hadiid. w-nibda khafiif", score: 8, impact: { trust: 2, respect: 3, culture: 3 }, note: 'You used أقترح respectfully, gave clear structure, and immediately added "we start light" for comfort.', outcome: 'excellent' },
          { id: 'b', text: 'Let\'s build a program based on your level. What do you like? Walking, machines, weights?', arabic: 'خلنا نسوي برنامج على حسب مستواك. شو تحب؟ مشي، أجهزة، حديد؟', roman: "khallina nisawwi barnaamij 'ala hasab mustawaak. shuu tihib? mashi, ajhiza, hadiid?", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Giving Sultan choices shows respect. However, a beginner often needs a confident recommendation.', outcome: 'good' },
          { id: 'c', text: 'Honestly, at your current level, I suggest five times per week', arabic: 'صَرَاحَة بِمُسْتَوَاك الْحِين، أَقْتَرِح خَمْس مَرَّات بِالأُسْبُوع', roman: "saraha bi-mustawaak al-hin, agtarih khams marraat bil-usbuu'", score: 5, impact: { trust: 3, respect: -1, culture: -1 }, note: 'You were brutally honest about what his body needs — and Sultan respects that directness. But you ignored what he told you (3 times per week) and pushed harder than he asked for. In Gulf culture, overriding someone\'s stated preference — even with good intentions — feels like you\'re not listening. Honesty without empathy is just bluntness.', outcome: 'good' },
          { id: 'd', text: 'We\'ll do super sets, drop sets, and HIIT cardio to start', arabic: 'نسوي سوبر ستس، دروب ستس، وكارديو HIIT في البداية', roman: 'nisawwi super sets, drop sets, w-kardyo HIIT fil-bidaaya', score: -2, impact: { trust: -1, respect: -1, culture: 0 }, note: 'Throwing terms at someone who hasn\'t been in a gym in years makes him feel stupid.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene5', charName: 'Sultan', charGender: 'male', setting: 'Consultation area — price discussion',
        arabic: 'حلو. عجبني الكلام. بكم الجلسة؟',
        roman: "hilw. 'ajabni al-kalaam. bikam al-jalsa?",
        english: "Nice. I like what I'm hearing. How much per session?",
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
        min: 38, title: 'The Corporate Contract', arabic: 'العقد المؤسسي', roman: "al-'agd al-mu'assasi", en: 'The Corporate Contract',
        desc: 'Sultan didn\'t just sign up for personal training — he opened the door to a corporate wellness contract with his government entity. Your professionalism, transparent pricing, and free trial offer gave him everything he needed to pitch this to his HR department. You didn\'t chase the sale. You built the case. SECRET ENDING UNLOCKED — Only 8% of users discover this.',
        color: C.GOLD, type: 'exceptional', secret: true,
        culturalJourney: [
          'Positioning: Mentioning you have "many clients" positioned you as someone who runs a real practice, not a side hustle.',
          'Transparency: Providing both per-session and package pricing gave Sultan the data he needed for corporate proposals.',
          'Value, not price: Offering a free trial instead of discounting proved your confidence in your work.',
          'The result: A one-person consultation became a 200-person opportunity — all because you treated Sultan like a business partner, not just a client.',
        ],
      },
      {
        min: 24, title: 'The Signed Client', arabic: 'الزبون الموقع', roman: 'az-zabuun al-muwaqqic', en: 'The Signed Client',
        desc: 'Sultan signed up. Your consultation was professional, culturally aware, and confidence-building. He\'s committed to the package and will show up tomorrow morning. You gained a loyal client — and in Dubai\'s gym scene, that\'s how careers are built. One client at a time. But there was a bigger opportunity hidden in this conversation that you didn\'t unlock.',
        color: C.JADE2, type: 'success',
        culturalJourney: [
          'Cultural awareness: You handled hospitality, language, and respect correctly.',
          'Professional delivery: Your program recommendations and pricing were sound.',
          'The missed moment: Sultan works for a government office with 200+ employees. A subtle mention of your client base, transparent per-session pricing, and a free trial could have changed his thinking.',
        ],
      },
      {
        min: 12, title: 'The Maybe', arabic: 'يمكن', roman: 'yamkin', en: 'The Maybe',
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
        choices: [
          { id: 'a', text: "Don't worry auntie! Simple checkup. First, what's your height? Remove your shoes please", arabic: 'لا تشيلين هم خالتي! فحص بسيط. أول شي كم طولج؟ شيلي صباطج لو سمحتي', roman: "la tishiiliin ham khaalti! fahs basiit. awwal shay kam toolich? shiili sabbaatich law samahti", score: 7, impact: { trust: 2, respect: 2, culture: 3 }, note: 'Reassurance first, then instructions — this sequence is essential for nervous patients. Using the feminine forms (تشيلين، خالتي، طولج) shows you are attentive and careful.', outcome: 'excellent' },
          { id: 'b', text: 'God willing, it\'ll be simple! Remove your shoes and stand here', arabic: 'إن شاء الله بسيط! شيلي صباطج وقفي هني', roman: "in shaa' allah basiit! shiili sabbaatich w-giffi hini", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Good reassurance with إن شاء الله but you gave two instructions at once without pacing. One step at a time helps nervous patients follow along.', outcome: 'good' },
          { id: 'c', text: 'Remove your shoes and stand on the scale', arabic: 'شيلي صباطج وقفي على الميزان', roman: "shiili sabbaatich w-giffi 'ala al-miizaan", score: 1, impact: { trust: 1, respect: 0, culture: 0 }, note: 'You skipped reassurance entirely. Umm Khalid just told you she dislikes clinics — one sentence of comfort costs nothing and changes everything.', outcome: 'neutral' },
          { id: 'd', text: "Let's check the weight. Hopefully it's not too much", arabic: 'يلا نشوف الوزن. إن شاء الله ما يكون وايد', roman: "yalla nishuuf al-wazn. in shaa' allah ma yikuun waayid", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Never comment on expected weight before measuring. For a woman in a clinical setting, this is especially harmful — it plants anxiety and strips dignity before the scale even moves.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene3', charName: 'Umm Khalid', charGender: 'female', setting: 'Clinic examination room — seated',
        arabic: 'مرتفع شوية! لا تشيل هم، فحص بسيط بس.',
        roman: "murtafi' shway! la tishiil ham, fahs basiit bass.",
        english: "A little high! Don't worry, just a simple checkup.",
        choices: [
          { id: 'a', text: 'Now let me check your blood pressure. Roll up your sleeve please and relax a little', arabic: 'الحين خليني أقيس ضغطج. شمري كمج لو سمحتي واسترخي شوي', roman: "al-hin khallini agiis daghtech. shammiri kummich law samahti w-istarkhi shway", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'You announced the procedure before contact and asked her to relax. In Gulf culture, announcing before touching a female patient is not just good practice — it is a mark of deep respect.', outcome: 'excellent' },
          { id: 'b', text: 'Let me check your blood pressure. Roll up your sleeve', arabic: 'خليني أقيس ضغطج. شمري كمج', roman: 'khallini agiis daghtech. shammiri kummich', score: 4, impact: { trust: 1, respect: 2, culture: 1 }, note: 'You announced the procedure but skipped "please" and the relaxation instruction. The announcement is the most important part — you got that right.', outcome: 'good' },
          { id: 'c', text: 'Give me your arm', arabic: 'مدي إيدج', roman: 'maddi iidich', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'No explanation of what you are about to do. For a female patient especially, an unexplained request to extend her arm toward you is jarring and culturally uncomfortable.', outcome: 'neutral' },
          { id: 'd', text: '(Takes the device and puts it on her arm without saying anything)', arabic: '(يأخذ الجهاز ويضعه على إيدها)', roman: '(yaakhidh al-jihaaz w-yihattuh ala iidha)', score: -4, impact: { trust: -2, respect: -2, culture: -2 }, note: 'Touching a female patient without any verbal announcement is a serious breach — culturally, professionally, and Islamically. The announcement before contact is not a courtesy. It is a requirement.', outcome: 'bad' },
        ],
      },
      {
        id: 'scene4', charName: 'Umm Khalid', charGender: 'female', setting: 'Clinic examination room — wrapping up',
        arabic: 'مرتفع شوية، يعني فيه مشكلة؟',
        roman: "murtafi' shway? ya'ni fiih mushkila?",
        english: "A little high — so there's a problem?",
        choices: [
          { id: 'a', text: "Don't worry auntie, the doctor will explain. But let me ask: are you allergic to anything? Taking any medications?", arabic: 'لا تشيلين هم خالتي، الدكتور بيشرح لج. بس خليني أسألج: عندج حساسية من شي؟ تاخذين أي أدوية؟', roman: "la tishiiliin ham khaalti, ad-duktoor biyishrah lich. bas khallini as'alich: 'indich hasaasiyya min shay? taakhidhiin ay adwiya?", score: 9, impact: { trust: 2, respect: 3, culture: 3 }, note: 'Perfect sequence: reassure first, defer to doctor, then ask your required questions. Using the feminine forms throughout shows you see her as a person, not just a chart.', outcome: 'excellent' },
          { id: 'b', text: 'Are you allergic to anything? Taking medications? Don\'t worry, everything is fine', arabic: 'عندج حساسية من شي؟ تاخذين أدوية؟ لا تخافين، كل شي تمام', roman: "'indich hasaasiyya min shay? taakhidhiin adwiya? la tikhaafiin, kul shay tamaam", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'You asked questions then reassured. But reassuring BEFORE asking gets better answers from a worried patient — especially one already anxious about a high reading.', outcome: 'good' },
          { id: 'c', text: 'Are you allergic to anything? Medications? Smoke?', arabic: 'عندج حساسية؟ أدوية؟ تدخين؟', roman: "'indich hasaasiyya? adwiya? tidakhkhiin?", score: 1, impact: { trust: 1, respect: 0, culture: 0 }, note: 'Rapid-fire questions without context feel like an interrogation. Umm Khalid is still processing the blood pressure news — she needs a breath before the intake continues.', outcome: 'neutral' },
          { id: 'd', text: 'Your blood pressure isn\'t good. You need to eat better and exercise', arabic: 'ضغطج ما زين. لازم تاكلين أحسن وتتمرنين', roman: 'daghtech mu zayn. laazim taakiiliin ahsan w-titmarraniin', score: -5, impact: { trust: -2, respect: -2, culture: -2 }, note: "You are a nurse, not her doctor. Diagnosing and lecturing oversteps your role and undermines the doctor's authority.", outcome: 'bad' },
        ],
      },
    ],
    endings: [
      {
        min: 28, title: 'The Caring Touch', arabic: 'اللمسة الحنونة', roman: 'al-lmsa al-hanuuna', en: 'The Caring Touch',
        desc: 'Umm Khalid walked in nervous and left smiling. You didn\'t just take her vitals — you made a clinic visit feel human. By calling her خالتي, reassuring her before each step, and announcing every procedure before contact, you showed the kind of care that Gulf patients remember. She\'ll ask for you by name next time.',
        color: C.JADE2, type: 'exceptional',
        culturalJourney: [
          'You addressed her as خالتي — showing generational respect from the first moment',
          'You reassured her before measuring — لا تشيلين هم turned anxiety into trust',
          'You announced every procedure before touching her — especially important with a female patient',
          'You said الله يشافيج — the blessing that tells a patient they are more than a file number',
        ],
      },
      {
        min: 18, title: 'The Good Nurse', arabic: 'الممرض الزين', roman: 'al-mumarrid az-zayn', en: 'The Good Nurse',
        desc: 'The intake went well. Umm Khalid felt respected and mostly comfortable. You did your job professionally and showed enough warmth to make the experience pleasant. A solid visit — but there were moments where a little more reassurance could have made it memorable.',
        color: C.GOLD, type: 'success',
        culturalJourney: [
          'You showed basic respect and professional courtesy',
          'Umm Khalid left feeling adequately cared for',
          'A good experience, but not one she\'ll remember for years',
        ],
      },
      {
        min: 6, title: 'The Quiet Check', arabic: 'الفحص الهادي', roman: 'al-fahs al-haadi', en: 'The Quiet Check',
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
    scenes: [
      {
        id: 'scene1', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel lobby — grand entrance',
        arabic: 'السلام عليكم',
        roman: "as-salaamu 'alaykum",
        english: 'Peace be upon you.',
        choices: [
          { id: 'a', text: 'Hello! Welcome to the hotel', arabic: 'هلا! أهلاً وسهلاً بالفندق', roman: "hala! ahlan wa sahlan bil-funduq", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, note: 'Not returning the Islamic greeting when offered is seen as dismissive.', outcome: 'bad' },
          { id: 'b', text: 'وعليكم السلام — welcome, sir', arabic: 'وعليكم السلام', roman: "wa 'alaykum as-salaam", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'You returned the greeting properly — وعليكم السلام is always correct. Sheikh Khalid registers you as respectful. But there is a hierarchy to the Islamic greeting: the full form is وعليكم السلام ورحمة الله وبركاته. When greeting someone of rank, the complete form signals that you know the levels of the greeting, not just the minimum. He noticed you gave the first level. He would have noticed the third.', outcome: 'good' },
          { id: 'c', text: 'Hi there — do you have a reservation?', arabic: 'هلا — عندك حجز؟', roman: "hala — 'indak hajz?", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Jumping to business without a proper greeting is deeply disrespectful to an Emirati guest.', outcome: 'bad' },
          { id: 'd', text: 'وعليكم السلام ورحمة الله — تفضل يا شيخنا', arabic: 'وعليكم السلام ورحمة الله — تفضل يا شيخنا', roman: "wa 'alaykum as-salaam wa rahmatullah — tfaddal ya shaykhna", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'The full greeting plus تفضل يا شيخنا (please, our Sheikh) is deeply honoring.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel lobby — walking to reception',
        arabic: 'الغرفة جاهزة؟ عندي ضيوف يوصلون الحين',
        roman: "al-ghurfa jaahza? 'indi dhuyuuf yuusaluun al-hin",
        english: 'Is the room ready? I have guests arriving soon.',
        choices: [
          { id: 'a', text: 'Let me check the system… one moment', arabic: 'خلني أشيك بالنظام... لحظة', roman: 'khallni ashayyik bin-nidhaam... lahtha', score: -2, impact: { trust: 0, respect: 0, culture: -1 }, note: 'Making a VIP wait while you visibly "check" something tells him he is a problem to be solved, not a guest to be served. In Gulf hospitality culture, the correct sequence is: reassure first ("كل شي جاهز" — everything is ready), then verify privately. His comfort should never depend on your system access.', outcome: 'neutral' },
          { id: 'b', text: 'إن شاء الله — everything is prepared for you', arabic: 'إن شاء الله — كل شي مجهز لك', roman: "in shaa' allah — kul shay mjahaz lak", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'إن شاء الله reassures while maintaining cultural tone. The guest feels prioritized.', outcome: 'good' },
          { id: 'c', text: 'It should be. Check-in isn\'t until 3 PM though', arabic: 'المفروض. بس التسجيل من الساعة ثلاث', roman: "al-mafruud. bass at-tasjiil min as-saa'a thalaath", score: -6, impact: { trust: -2, respect: -2, culture: -2 }, note: 'Citing policy to a VIP guest is a serious faux pas. Flexibility and generosity are expected.', outcome: 'bad' },
          { id: 'd', text: 'تفضل — كل شي جاهز والله. ضيوفك على الراس', arabic: 'كل شي جاهز والله. ضيوفك على الراس', roman: "kul shay jaahiz wallah. dhuyuufak 'ala ar-raas", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"Your guests are on our heads" — the highest form of hospitality, pledging personal honor.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Sheikh Khalid', charGender: 'male', setting: 'Hotel suite — before departure',
        arabic: 'ما قصرت. شكراً لك',
        roman: "ma gassart. shukran lak",
        english: 'You didn\'t fall short. Thank you.',
        choices: [
          { id: 'a', text: 'No problem. Have a nice stay!', arabic: 'ما في مشكلة. إقامة سعيدة!', roman: "maa fii mushkila. igaama sa'iida!", score: 2, impact: { trust: 0, respect: 1, culture: 1 }, note: 'Polite but generic. A missed opportunity to deepen the connection.', outcome: 'neutral' },
          { id: 'b', text: 'الله يخليك — it\'s our pleasure', arabic: 'الله يخليك', roman: "allah ykhalllik", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: '"God preserve you" is a warm, culturally resonant reply to gratitude.', outcome: 'good' },
          { id: 'c', text: 'Don\'t forget to fill out the feedback form!', arabic: 'لا تنسى تعبي نموذج التقييم!', roman: "la tinsa ti'abbi namuudhaj at-taqyiim!", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Sheikh Khalid just offered you a genuine expression of thanks — "ما قصرت" (you did not fall short) is a meaningful phrase in Gulf culture, not a polite formality. Responding by asking for a review form converts a human moment into a transactional one. It tells him the hotel sees him as a data point, not a guest. He will fill out no form. He will simply not return.', outcome: 'bad' },
          { id: 'd', text: 'هذا واجبنا يا شيخنا — بيتك بيتنا دايماً', arabic: 'هذا واجبنا يا شيخنا — بيتك بيتنا دايماً', roman: "hadha wajibna ya shaykhna — baitak baitna daayiman", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"This is our duty — your house is our house always." You\'ve made the hotel feel like home.', outcome: 'excellent' },
        ],
      },
    ],
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
  },

  // ── SCENARIO 6: CAFÉ CONNECTION ─────────────────────────────────────────────
  'cafe-friends': {
    id: 'cafe-friends',
    title: 'Café Connection',
    scenes: [
      {
        id: 'scene1', charName: 'Fatima', charGender: 'female', setting: 'Local café — adjacent tables',
        arabic: 'هذا الكرسي فاضي؟',
        roman: "hadha al-kursi faadhi?",
        english: 'Is this chair free?',
        teachingNote: "Notice تفضلي (not تفضل) — the feminine imperative is used when inviting a woman to sit. If the person were male, it would be تفضل. This distinction applies any time you give an invitation or instruction to a specific person.",
        choices: [
          { id: 'a', text: 'Yeah, go ahead', arabic: 'إي تفضلي', roman: 'ii tfaddali', score: 1, note: 'You used the correct feminine form تفضلي — that is noticed and appreciated. But the English "Yeah" before it signals that Arabic is a performance, not a reflex. Fatima interprets this as someone who knows a few words but has not yet committed to the culture. The gap between "yeah, tafaddali" and "ahlan wa sahlan — tafaddali" is the gap between polite and warm.', outcome: 'neutral' },
          { id: 'b', text: 'أهلاً وسهلاً — تفضلي', arabic: 'أهلاً وسهلاً — تفضلي', roman: "ahlan wa sahlan — tfaddali", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"Welcome and be at ease — please sit" uses the feminine form correctly and shows warmth.', outcome: 'excellent' },
          { id: 'c', text: 'Sorry, I\'m saving it for someone', arabic: 'آسفة، محجوز لأحد', roman: 'aasfa, mahjooz li-ahad', score: -3, note: 'Refusing a simple request from a stranger comes across as unwelcoming.', outcome: 'bad' },
          { id: 'd', text: 'Sure! تفضلي', arabic: 'تفضلي', roman: "tfaddali", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'تفضلي (please, to a woman) is a lovely touch that shows cultural awareness.', outcome: 'good' },
        ],
      },
      {
        id: 'scene2', charName: 'Fatima', charGender: 'female', setting: 'Local café — sharing the table',
        arabic: 'أنتي من وين؟ أول مرة أشوفك هنا',
        roman: "inti min wayn? awwal marra ashuufich hini",
        english: 'Where are you from? First time I\'ve seen you here.',
        choices: [
          { id: 'a', text: 'I\'d rather not say — I like my privacy', arabic: 'أفضل ما أقول — أحب خصوصيتي', roman: "afaddal maa aguul — ahib khususiyyati", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: '"Where are you from?" in Gulf culture is never a privacy invasion — it is the first step in understanding who you are and how to connect with you. Fatima is not asking for your address. She is asking for your story. Refusing it in a casual café setting does not signal privacy awareness; it signals you are not interested in her interest. The conversation closes here.', outcome: 'bad' },
          { id: 'b', text: 'I\'m from [country] — just moved here recently', arabic: 'أنا من [بلد] — توني يايه هني', roman: 'ana min [balad] — tawni yaaya hini', score: 5, note: 'Honest and friendly, but you missed a chance to reciprocate with curiosity about her.', outcome: 'good' },
          { id: 'c', text: 'أنا من [بلد] — المكان حلو ما شاء الله', arabic: 'المكان حلو ما شاء الله', roman: "ana min [balad] — al-makaan hilw maa shaa' allah", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Complimenting the place with ما شاء الله shows you appreciate local culture.', outcome: 'good' },
          { id: 'd', text: 'أنا جديدة هنا — وأنتي؟ من أهل المنطقة؟', arabic: 'أنا جديدة هنا — وأنتي؟ من أهل المنطقة؟', roman: "ana ydiida hini — wa inti? min ahl al-mintaga?", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Sharing, then asking if she\'s from the area shows reciprocal interest — the foundation of friendship.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Fatima', charGender: 'female', setting: 'Local café — saying goodbye',
        arabic: 'كان ودي أكمل سوالف بس لازم أروح. نتواصل؟',
        roman: "kaan widdi akammil saawaalif bas laazim aruuh. nitwaasal?",
        english: 'I\'d love to keep chatting but I have to go. Shall we stay in touch?',
        choices: [
          { id: 'a', text: 'Maybe — I\'m pretty busy these days', arabic: 'يمكن — وايد مشغولة هالأيام', roman: 'yimkin — waayid mashghuula hal-ayyaam', score: -4, note: 'Fatima took a social risk asking to stay in touch with someone she just met. Hedging her offer with "maybe" signals that her risk was not worth taking. In Emirati culture, genuine connection is treated as a gift — declining it, even gently, lands as rejection. If you truly are busy: "أكيد! بس هالأسبوع مشغولة — رقمك؟" (of course, but this week is busy — your number?) would have preserved the connection.', outcome: 'bad' },
          { id: 'b', text: 'Sure! Here\'s my number', arabic: 'أكيد! هذا رقمي', roman: "akiid! haadha ragmi", score: 5, impact: { trust: 1, respect: 2, culture: 2 }, note: 'Willing but brief. A warmer farewell would seal the connection.', outcome: 'good' },
          { id: 'c', text: 'إن شاء الله! تشرفنا يا فاطمة', arabic: 'تشرفنا يا فاطمة', roman: "in shaa' allah! tsharrafna ya faatima", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: '"We are honored, Fatima" — using her name with this phrase feels genuinely warm.', outcome: 'good' },
          { id: 'd', text: 'أكيد! والله فرحانة إني عرفتك — في أمان الله', arabic: 'والله فرحانة إني عرفتك — في أمان الله', roman: "akiid! wallah farhana inni 'araftich — fi amaan allah", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"Truly happy I met you — in God\'s protection." A heartfelt Arabic farewell that creates lasting bonds.', outcome: 'excellent' },
        ],
      },
    ],
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
  },

  // ── SCENARIO 7: EID GREETINGS ───────────────────────────────────────────────
  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    scenes: [
      {
        id: 'scene1', charName: 'Uncle Rashid', charGender: 'male', setting: 'Neighbourhood — Eid morning',
        arabic: 'عيدكم مبارك! تعالوا عندنا',
        roman: "eidkum mubaarak! ta'aalaw 'indna",
        english: 'Blessed Eid to you! Come visit us.',
        choices: [
          { id: 'a', text: 'Thanks! Maybe later — I have plans', arabic: 'مشكور! يمكن بعدين — عندي خطة', roman: "mashkuur! yimkin ba'dayn — 'indi khatta", score: -4, impact: { trust: -2, respect: -1, culture: -1 }, note: 'Declining an Eid invitation is like refusing a family embrace. This day is about togetherness.', outcome: 'bad' },
          { id: 'b', text: 'عيدكم مبارك! إن شاء الله', arabic: 'عيدكم مبارك! إن شاء الله', roman: "eidkum mubaarak! in shaa' allah", score: 6, impact: { trust: 2, respect: 2, culture: 2 }, note: 'Returning the greeting warmly shows respect for the occasion.', outcome: 'good' },
          { id: 'c', text: 'Happy holidays to you too!', arabic: 'كل عام وأنتم بخير!', roman: "kul 'aam wa antum b-khayr!", score: -2, impact: { trust: 0, respect: -1, culture: -1 }, note: '"كل عام وأنتم بخير" (may every year find you well) is a beautiful phrase — but it is the general year-end greeting, not the Eid-specific one. Using it on Eid morning tells Uncle Rashid you know Arabic phrases but have not yet learned that Eid has its own vocabulary. He will correct you gently with "عيدك مبارك" and the moment will feel like a lesson, not a greeting.', outcome: 'neutral' },
          { id: 'd', text: 'عيدكم مبارك وعساكم من عواده! تشرفنا والله', arabic: 'عيدكم مبارك وعساكم من عواده', roman: "eidkum mubaarak wa 'asaakum min 'uwwaadah! tsharrafna wallah", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"May you celebrate it again" is the traditional follow-up. Combined with "we\'re honored" — masterful.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Uncle Rashid', charGender: 'male', setting: 'Rashid\'s home — living room',
        arabic: 'تفضل — هذي حلويات العيد. ذوق',
        roman: "tfaddal — hadhi halawiyyaat al-'eid. dhoog",
        english: 'Please — these are Eid sweets. Try some.',
        choices: [
          { id: 'a', text: 'No thanks, I\'m watching my sugar intake', arabic: 'لا شكراً، أنا محافظ على السكر', roman: "la shukran, ana muhaafit 'ala as-sukkar", score: -5, impact: { trust: -1, respect: -2, culture: -2 }, note: 'Refusing Eid sweets is like refusing the celebration itself. Always accept hospitality.', outcome: 'bad' },
          { id: 'b', text: 'Thank you! They look delicious', arabic: 'شكراً! شكلها لذيذة', roman: "shukran! shakilha ladhiidha", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, note: 'You accepted and you complimented — those are the right instincts. But "شكلها لذيذة" (they look delicious) is a generic food compliment. On Eid, these sweets were made by hand, days in advance, as an act of love. The phrases that honour that: بسم الله before eating, ما شاء الله on the presentation, and "مين سواها؟" (who made them?) — asking who made them tells the maker their effort was seen.', outcome: 'neutral' },
          { id: 'c', text: 'بسم الله — يسلموا إيديك يا عمي', arabic: 'يسلموا إيديك يا عمي', roman: "bismillah — yislamu ideik ya 'ammi", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'بسم الله before eating + "bless your hands, uncle" — pure cultural fluency.', outcome: 'good' },
          { id: 'd', text: 'بسم الله — ما شاء الله! مين سواها؟ الله يعطيكم العافية', arabic: 'ما شاء الله! مين سواها؟ الله يعطيكم العافية', roman: "bismillah — maa shaa' allah! miin sawwaha? allah ya'tiikum al-'aafya", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: 'Saying بسم الله, praising with ما شاء الله, asking who made them, then blessing — this is Eid perfection.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Uncle Rashid', charGender: 'male', setting: 'Rashid\'s doorstep — farewell',
        arabic: 'الله يبارك فيك. بيتنا بيتك دايماً',
        roman: "allah ybaarak fiik. baitna baitak daayiman",
        english: 'God bless you. Our home is always your home.',
        choices: [
          { id: 'a', text: 'Thanks! See you around', arabic: 'مشكور! نشوفك', roman: "mashkuur! nishuufak", score: -3, impact: { trust: -1, respect: -1, culture: -1 }, note: 'Uncle Rashid just said "بيتنا بيتك دايماً" — your house is always our house. This is one of the warmest things a Gulf Arab can say to someone outside the family. It means: you belong here. Responding with "مشكور! نشوفك" (thanks, see you) is the social equivalent of someone handing you a gift and you pocketing it without looking at it. The farewell needed to honour the size of what he offered.', outcome: 'bad' },
          { id: 'b', text: 'الله يبارك فيك — شكراً على كرمكم', arabic: 'شكراً على كرمكم', roman: "allah ybaarak fiik — shukran 'ala karamkum", score: 7, impact: { trust: 3, respect: 2, culture: 2 }, note: 'Thanking their generosity while returning the blessing is respectful.', outcome: 'good' },
          { id: 'c', text: 'That was really nice, thank you so much', arabic: 'كان حلو وايد، شكراً جزيلاً', roman: "kaan hilw waayid, shukran jaziilan", score: 3, impact: { trust: 1, respect: 1, culture: 1 }, note: 'Sincere but lacking the Arabic reciprocity that deepens the bond.', outcome: 'neutral' },
          { id: 'd', text: 'جزاكم الله خير — أنتم أهلي هنا والله. كل عام وأنتم بخير', arabic: 'جزاكم الله خير — أنتم أهلي هنا. كل عام وأنتم بخير', roman: "jazaakum allah khair — antum ahli hini wallah. kul 'aam wa antum b-khayr", score: 9, impact: { trust: 3, respect: 3, culture: 3 }, note: '"May God reward you — you are my family here. May every year find you well." You\'ve become part of the neighbourhood.', outcome: 'excellent' },
        ],
      },
    ],
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
  },

  // ── SCENARIO 6: TAXI RIDE (Social Mode) ─────────────────────────────────────
  'social_taxi_ride': {
    id: 'social_taxi_ride',
    title: 'The Taxi Ride',
    subtitle: 'Airport → Hotel, nighttime',
    kafIntro: 'You just landed in Dubai. Your driver Youssef is Egyptian — warm, chatty, and ready to talk. This is social mode: no trust/respect/culture meters, just points and connection. Make conversation!',
    iconName: 'car',
    difficulty: 'Level 2 (Elementary)',
    estimatedMinutes: 8,
    phrasesUnlocked: [],
    scenes: [
      {
        id: 'c1', charName: 'Youssef', charGender: 'male', setting: 'Dubai Airport pickup',
        arabic: 'أهلاً وسهلاً! أنا يوسف، السواق بتاعك. تعال تعال يا باشا!',
        roman: "ahlan wa sahlan! ana yusuf, as-suwwaq bita'ak. ta'aal ta'aal ya basha!",
        english: "Welcome! I'm Youssef, your driver. Come, come, boss!",
        teachingNote: "يوسف speaks Egyptian Arabic — notice 'بتاعك' (yours) instead of Gulf 'حقّك'. Egyptian drivers are known for being warm and talkative.",
        choices: [
          { id: 'a', text: 'Hi Youssef! How are you?', arabic: 'أهلاً يا يوسف! كيفك؟', roman: 'ahlan ya yusuf! keefak?', score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef's eyebrows jump up. He grabs your bag before you can protest, already talking a mile a minute.", outcome: 'excellent', next: 'c2_open' },
          { id: 'b', text: 'Hello, thanks', arabic: 'مرحبا، شكراً', roman: 'marhaba, shukran', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'Youssef nods approvingly, takes your bag, and opens the back door with a slight bow.', outcome: 'good', next: 'c2_open' },
          { id: 'c', text: 'Just nod, hand him your bag', arabic: '—', roman: '(Nod and get in the car)', score: -1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef's grin shrinks a little. He loads your bag quietly, glancing at you in the rearview mirror as he starts driving.", outcome: 'bad', next: 'c2_effort' },
        ],
      },
      {
        id: 'c2_open', charName: 'Youssef', charGender: 'male', setting: 'On Sheikh Zayed Road',
        arabic: 'قولي يا حبيبي — اسمك إيه وانت منين أصلاً؟',
        roman: "'uli ya habibi — ismak eh w-inta minin aslan?",
        english: "Tell me habibi — what's your name and where are you originally from?",
        teachingNote: "'قولي' becomes ''uli' in Egyptian Arabic — the ق (qaf) drops to a glottal stop. In Gulf Arabic you'd say 'gool' (with a hard g). Also: 'منين' (minein) is Egyptian for 'from where'; Gulf Arabic says 'من وين' (min wein). Same words, different sounds.",
        choices: [
          { id: 'a', text: "I'm [name]. I'm from Portugal", arabic: 'أنا [name]. أنا من البرتغال', roman: 'ana [name]. ana min al-burtughal', score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef nearly swerves the car. He slaps the steering wheel and turns around with wide eyes.", outcome: 'excellent', next: 'c3_ronaldo', teachingHighlight: "البرتغال (al-Burtughal) — Many country names sound different in Arabic. Portugal becomes 'al-Burtughal.'" },
          { id: 'b', text: "I'm [name]. And you're from Egypt?", arabic: 'أنا [name]. وانت من مصر؟', roman: 'ana [name]. w-inta min masr?', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef laughs, pleased you recognized his accent. He taps his chest proudly.", outcome: 'good', next: 'c3_dubai' },
          { id: 'c', text: "I'm from Europe", arabic: 'أنا من أوروبا', roman: 'ana min orubba', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef squints at the mirror, trying to read you. He lets out a small laugh and moves on.", outcome: 'neutral', next: 'c3_dubai' },
        ],
      },
      {
        id: 'c2_effort', charName: 'Youssef', charGender: 'male', setting: 'Breaking the silence',
        arabic: 'أول مرة في دبي ولا جاي قبل كدا؟',
        roman: 'awwil marra fi dubai wala gay abl kida?',
        english: 'First time in Dubai or have you been before?',
        teachingNote: "'جاي قبل كدا' (gaay abl kida) is Egyptian for 'came before this.' He's giving you an easy way back into the conversation.",
        choices: [
          { id: 'a', text: 'First time! Everything is new to me', arabic: 'أول مرة! كل شي يديد عليّ', roman: 'awwil marra! kil shay yideed alayy', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef lights up — a first-timer is his favorite kind of passenger. He suddenly has a mission.", outcome: 'good', next: 'c3_dubai' },
          { id: 'b', text: "I've been before", arabic: 'ييت قبل', roman: 'yeet gabil', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef nods slowly. Not much to work with, but he's not giving up yet.", outcome: 'neutral', next: 'c3_dubai' },
        ],
      },
      {
        id: 'c3_ronaldo', charName: 'Youssef', charGender: 'male', setting: 'The football moment',
        arabic: 'البرتغال يعني... رونالدو! طبعاً بتحبه صح؟ أحسن لاعب في التاريخ!',
        roman: "al-burtughal ya'ni... ronaldo! tab'an bithibbu sah? ahsan la'ib fi at-tarikh!",
        english: 'Portugal means... Ronaldo! Obviously you love him right? Best player in history!',
        teachingNote: "This is a 'harmless lie' moment. In social Arabic conversation, agreeing enthusiastically about football can be more fun than being honest. Both paths are valid.",
        choices: [
          { id: 'a', text: 'Of course! Ronaldo is number one!', arabic: 'طبعاً! رونالدو نمبر وان!', roman: "tab'an! ronaldo number one!", score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef ERUPTS. He honks the horn, pounds the steering wheel, and starts listing Ronaldo's goals like a commentator.", outcome: 'excellent', next: 'c4' },
          { id: 'b', text: "Haha... I'm with Messi honestly", arabic: 'هههه... أنا مع ميسي بصراحة', roman: 'hahaha... ana ma"a messi bi-saraha', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef freezes for a full three seconds. Then he slowly shakes his head like you just insulted his mother's cooking.", outcome: 'good', next: 'c4' },
          { id: 'c', text: "I don't really follow football", arabic: 'ما أتابع كورة وايد', roman: 'ma atab"a koora wayid', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef deflates like someone let the air out of him. He stares at the road in genuine confusion.", outcome: 'neutral', next: 'c4' },
          { id: 'd', text: "He's good but not the best", arabic: 'كويس بس مو الأحسن', roman: 'kwayyis bas moo il-ahsan', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef narrows his eyes in the mirror, sizing you up with newfound respect. A nuanced opinion — rare.", outcome: 'good', next: 'c4' },
        ],
      },
      {
        id: 'c3_dubai', charName: 'Youssef', charGender: 'male', setting: 'Passing the Marina',
        arabic: 'شايف المارينا دي؟ أنا لما جيت دبي أول مرة من ٨ سنين — مكانش فيه أي حاجة هنا!',
        roman: "shayif al-marina di? ana lamma geit dubbi awwil marra min 8 sineen — makansh fiha ay haga hina!",
        english: "See this Marina? When I first came to Dubai 8 years ago — there was nothing here!",
        teachingNote: "'من ٨ سنين' (min 8 sineen) means '8 years ago' in Egyptian. Gulf Arabic would say 'من ٨ سنوات' (min 8 sanawaat).",
        choices: [
          { id: 'a', text: 'MashaAllah! 8 years — Dubai became your home', arabic: 'ما شاء الله! ثمان سنوات — صار دبي بيتك', roman: "maa shaa' allah! thaman sanawaat — saar dubbi beitak", score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Something softens in Youssef's face. He wasn't expecting that.", outcome: 'excellent', next: 'c4' },
          { id: 'b', text: 'Your family here or in Egypt?', arabic: 'عائلتك هنا ولا في مصر؟', roman: "'a'iltak hina walla fi masr?", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef pulls out his phone at a red light and flashes a photo of two kids in school uniforms.", outcome: 'good', next: 'c4' },
          { id: 'c', text: 'Yeah, Dubai changed a lot', arabic: 'هيه، دبي تغيرت وايد', roman: 'heeh, dubbi taghayarat wayid', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef agrees but your flat tone doesn't give him much to work with. He nods and focuses on driving.", outcome: 'neutral', next: 'c4' },
        ],
      },
      {
        id: 'c4', charName: 'Youssef', charGender: 'male', setting: 'Near Business Bay',
        arabic: 'وانت — شو يابك دبي؟ شغل ولا سياحة؟',
        roman: "w-inta — shoo yabak dubbi? shughul wala siyaha?",
        english: 'And you — what brought you to Dubai? Work or tourism?',
        teachingNote: "'شو يابك' (shoo yabak) means 'what brought you.' It's a warm way to ask someone's reason for being somewhere.",
        choices: [
          { id: 'a', text: 'Work. Got any good Dubai stories?', arabic: 'شغل. عندك قصص حلوة من دبي؟', roman: "shughul. 'indak qisas hilwa min dubbi?", score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef's face lights up like you gave him a gift. Nobody ever asks him for HIS stories.", outcome: 'excellent', next: 'c5' },
          { id: 'b', text: 'Work. Thank God', arabic: 'شغل. الحمد لله', roman: 'shughul. al-hamdu lillah', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef nods respectfully. Short answer, but 'Alhamdulillah' is the right closer.", outcome: 'good', next: 'c5' },
          { id: 'c', text: 'A bit of tourism', arabic: 'سياحة شوية', roman: 'siyaha shwayya', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef immediately switches to tour-guide mode, pointing at everything.", outcome: 'neutral', next: 'c5' },
          { id: 'd', text: 'Glance at your phone, half-answer', arabic: '—', roman: '(Check your phone, give a vague nod)', score: -2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef catches the phone check in the mirror. The energy drains from the car. He turns up the radio.", outcome: 'bad', next: 'c5' },
        ],
      },
      {
        id: 'c5', charName: 'Youssef', charGender: 'male', setting: 'Hotel arrival',
        arabic: 'يا بطل — وصلنا! والله كانت رحلة حلوة. لو احتجت أي حاجة في دبي — كلمني!',
        roman: "ya buttul — wasalna! wallah kanit rihla hilwa. law ihtajt ay haga fi dubbi — kallimni!",
        english: "Champ — we're here! Wallahi it was a nice ride. If you need anything in Dubai — call me!",
        choices: [
          { id: 'a', text: 'God bless you Youssef! God protect your family', arabic: 'الله يسلمك يا يوسف! الله يحفظ عائلتك', roman: "allah yisallimak ya yusuf! allah yihfaz 'a'iltak", score: 4, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef goes completely still for a second. Then his eyes go glassy. He grabs your hand with both of his and squeezes.", outcome: 'excellent' },
          { id: 'b', text: 'Thanks Youssef! Have a nice day', arabic: 'شكراً يا يوسف! يوم سعيد', roman: 'shukran ya yusuf! yawm sa"eed', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef gives you a genuine smile and a wave as you walk toward the hotel doors.", outcome: 'good' },
          { id: 'c', text: 'Thanks', arabic: 'شكراً', roman: 'shukran', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef gives a polite nod. Another passenger, another ride. The door closes.", outcome: 'neutral' },
          { id: 'd', text: 'Leave without a word', arabic: '—', roman: '(Get out, grab bag, walk away)', score: -2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Youssef watches you walk into the hotel without looking back. He sits there for a moment, then mutters to himself.", outcome: 'bad' },
        ],
      },
    ],
    endings: [
      { min: 14, title: 'Best Ride Ever', arabic: 'أحسن رحلة!', roman: "ahsan rihla!", en: 'What a ride!', desc: "You didn't just take a taxi — you made a friend. Youssef gave you his number and will genuinely pick up when you call.", color: C.GOLD, type: 'exceptional' },
      { min: 8, title: 'Good Chat', arabic: 'سوالف حلوة', roman: 'sawwalif hilwa', en: 'Nice conversation', desc: "A genuinely pleasant ride. Youssef enjoyed talking to you and wished you well.", color: C.JADE2, type: 'success' },
      { min: 3, title: 'Forgettable Ride', arabic: 'رحلة عادية', roman: 'rihla "adiyya', en: 'Just a ride', desc: "Youssef drove you to the hotel. That's about it. Another passenger in a long day of passengers.", color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Awkward Silence', arabic: 'سكوت محرج', roman: 'sukoot muḥrij', en: 'Uncomfortable silence', desc: "Youssef gave up trying. The last 20 minutes were just Amr Diab on the radio and the sound of traffic.", color: C.ERROR, type: 'failed' },
    ],
  },

  // ── SCENARIO 7: THE ELEVATOR (Social Mode) ────────────────────────────────────
  'social_elevator': {
    id: 'social_elevator',
    title: 'The Elevator',
    subtitle: 'Apartment building, evening',
    kafIntro: "You meet someone in your building elevator. Sami is Jordanian — reserved at first. This is Level 1: short phrases, simple choices. Notice how his Arabic differs from yours. That's the lesson.",
    iconName: 'building',
    difficulty: 'Level 1 (Beginner)',
    estimatedMinutes: 6,
    phrasesUnlocked: [],
    scenes: [
      {
        id: 'c1', charName: 'Sami', charGender: 'male', setting: 'Elevator — ground floor',
        arabic: '...',
        roman: '(Sami glances up from his phone)',
        english: 'The elevator doors are closing. Inside, a guy around your age glances up from his phone.',
        teachingNote: "السلام عليكم (as-salaamu 'alaykum) is the universal Arabic greeting. The response is وعليكم السلام (wa 'alaykum as-salaam).",
        choices: [
          { id: 'a', text: 'Peace be upon you', arabic: 'السلام عليكم', roman: "as-salaamu 'alaykum", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: 'His face softens immediately. He straightens up and pockets his phone.', outcome: 'excellent', next: 'c2' },
          { id: 'b', text: 'Hello', arabic: 'مرحبا', roman: 'marhaba', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'He nods back, a small smile. Friendly enough. He keeps his phone in his hand but lowers it.', outcome: 'good', next: 'c2' },
          { id: 'c', text: 'Enter without acknowledging', arabic: '—', roman: '(Step in, face the doors, say nothing)', score: -1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'He glances at you, then back at his phone. The elevator hums. Neither of you moves.', outcome: 'bad', next: 'c2' },
        ],
      },
      {
        id: 'c2', charName: 'Sami', charGender: 'male', setting: 'Elevator — floor 5',
        arabic: 'يلا حبيبي، قول السلام',
        roman: 'yalla habibi, gool as-salam',
        english: "Come on sweetheart, say salam",
        teachingNote: "When someone says السلام عليكم, the expected response is وعليكم السلام. Not responding — especially to a child trying their best — is noticed.",
        choices: [
          { id: 'a', text: 'Peace be upon you, champ!', arabic: 'وعليكم السلام يا بطل!', roman: "wa 'alaykum as-salaam ya batal!", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "The boy beams. The mother mouths 'thank you.' Sami watches you with a slight grin.", outcome: 'excellent', next: 'c3' },
          { id: 'b', text: 'And peace be upon you', arabic: 'وعليكم السلام', roman: "wa 'alaykum as-salaam", score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'The boy hides behind his mother\'s leg. Sami gives a neutral nod.', outcome: 'good', next: 'c3' },
          { id: 'c', text: "Don't respond to the child", arabic: '—', roman: '(Smile faintly, look back at the doors)', score: -1, impact: { trust: 0, respect: 0, culture: 0 }, note: "The boy's face drops. Sami's expression flattens — he noticed you left a child hanging.", outcome: 'bad', next: 'c3' },
        ],
      },
      {
        id: 'c3', charName: 'Sami', charGender: 'male', setting: 'Elevator — floor 9, mother exits',
        arabic: 'مع السلامة!',
        roman: "ma' as-salama!",
        english: 'Goodbye!',
        teachingNote: "'دور' (door) means 'floor' in Gulf Arabic. In Jordanian, the word is 'طابق' (tabi'). Both mean the same thing.",
        choices: [
          { id: 'a', text: 'What floor are you?', arabic: 'انت دور كم؟', roman: 'inta door kam?', score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: 'He looks surprised — then amused. He points at the already-lit 17 button.', outcome: 'excellent', next: 'c4' },
          { id: 'b', text: "We're still going up", arabic: 'بعدنا طالعين', roman: "ba'adna tal'een", score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'He laughs softly. A small comment, but it broke the silence.', outcome: 'good', next: 'c4' },
          { id: 'c', text: 'Wait in silence', arabic: '—', roman: '(Stare at the floor numbers. 13... 14... 15...)', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: 'The silence is not hostile — it is just nothing. He goes back to his phone.', outcome: 'neutral', next: 'c4' },
        ],
      },
      {
        id: 'c4', charName: 'Sami', charGender: 'male', setting: 'Floor 17 — both exit',
        arabic: 'هون بعد؟ هههه',
        roman: "hoon ba'ad? hahaha",
        english: 'Here too? Haha',
        teachingNote: "'يديد' (yideed) is the Gulf pronunciation of 'جديد' (jadeed = new). The ج often becomes a ي in Emirati speech.",
        choices: [
          { id: 'a', text: 'Haha yeah! Are you new here?', arabic: 'هههه إي! انت يديد هني؟', roman: "hahaha ee! inta yideed hini?", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "He turns to face you properly for the first time. You're having an actual conversation now.", outcome: 'excellent', next: 'c5' },
          { id: 'b', text: 'Same floor!', arabic: 'نفس الدور!', roman: 'nafs id-door!', score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: "He grins. It's a small comment but you're engaging.", outcome: 'good', next: 'c5' },
          { id: 'c', text: 'Exit without engaging', arabic: '—', roman: '(Step out quickly, walk to your door)', score: -1, impact: { trust: 0, respect: 0, culture: 0 }, note: 'He watches you speed-walk down the hallway. Message received.', outcome: 'bad', next: 'c5_cold' },
        ],
      },
      {
        id: 'c5', charName: 'Sami', charGender: 'male', setting: 'The hallway',
        arabic: 'أنا سامي بالمناسبة. وإنت؟',
        roman: "ana sami bil-munasaba. w-inta?",
        english: "I'm Sami by the way. And you?",
        teachingNote: "'تشرفنا' (tasharrafna) means 'honored to meet you.' It's slightly formal but widely used when meeting someone for the first time.",
        choices: [
          { id: 'a', text: "I'm [name]. Nice to meet you! Where are you from?", arabic: 'أنا [name]. تشرفنا! من وين انت؟', roman: 'ana [name]. tasharrafna! min wein inta?', score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami's whole posture changes. He's no longer a stranger walking near you — he's talking to you.", outcome: 'excellent', next: 'c6', teachingHighlight: "الأردن (il-Urdun) = Jordan. عمّان (Amman) = the capital. Jordanians are one of the largest Arab communities in the UAE." },
          { id: 'b', text: "I'm [name]. The building is nice here", arabic: 'أنا [name]. البناية حلوة هني', roman: "ana [name]. il-binaya hilwa hini", score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami nods. Safe topic. He's happy to talk but you haven't gotten personal yet.", outcome: 'good', next: 'c6' },
          { id: 'c', text: 'Just say your name', arabic: '[name]', roman: '[name]', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami repeats it back, testing the pronunciation. He offers nothing more.", outcome: 'neutral', next: 'c6' },
        ],
      },
      {
        id: 'c5_cold', charName: 'Sami', charGender: 'male', setting: 'The hallway (after cold exit)',
        arabic: 'أنا سامي. يديد هون',
        roman: 'ana sami. yideed hoon',
        english: "I'm Sami. New here",
        teachingNote: "Even when a conversation starts cold, Arabs often give one more chance. A simple name exchange costs nothing and can change the dynamic.",
        choices: [
          { id: 'a', text: "I'm [name]. Welcome!", arabic: 'أنا [name]. أهلاً فيك!', roman: "ana [name]. ahlan feek!", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Relief crosses Sami's face. He wasn't sure if you were unfriendly or just tired. Now he knows.", outcome: 'excellent', next: 'c6' },
          { id: 'b', text: 'Just your name', arabic: '[name]', roman: '[name]', score: 0, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami nods once. He got a name. That's something.", outcome: 'neutral', next: 'c6' },
        ],
      },
      {
        id: 'c6', charName: 'Sami', charGender: 'male', setting: 'Your doors — across from each other',
        arabic: 'لا جد؟ قدام بعض؟ هههه',
        roman: "la jadd? giddaam ba'ad? hahaha",
        english: 'No way? Across from each other? Haha',
        teachingNote: "'تعال على شاي' (ta'al ala shay) means 'come over for tea.' Inviting someone for tea is the Gulf equivalent of 'let's hang out.'",
        choices: [
          { id: 'a', text: 'Come for tea sometime!', arabic: 'تعال على شاي يوم!', roman: "ta'al ala shay yoom!", score: 3, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami breaks into a real smile — not polite, genuine. He points at his door.", outcome: 'excellent' },
          { id: 'b', text: "If you need anything, I'm here", arabic: 'إذا تبي شي، أنا هني', roman: "itha tibi shay, ana hini", score: 2, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami puts his hand on his chest — the classic Arab gesture of gratitude.", outcome: 'good' },
          { id: 'c', text: 'Goodbye!', arabic: 'مع السلامة!', roman: "ma' as-salama!", score: 1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami waves. Polite. He goes inside. You go inside. Two doors close.", outcome: 'neutral' },
          { id: 'd', text: 'Go inside without saying anything', arabic: '—', roman: '(Unlock your door quickly, step inside)', score: -1, impact: { trust: 0, respect: 0, culture: 0 }, note: "Sami stands in the hallway for a moment, watching your door close.", outcome: 'bad' },
        ],
      },
    ],
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
  },
});

export function getScenarioScript(id: string, C: ThemeColors): ScenarioScript | undefined {
  return getScenarioScripts(C)[id];
}
