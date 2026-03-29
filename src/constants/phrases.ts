import type { Phrase, PhraseCategory } from '../types';
import { C } from '../components/design/tokens';

// ─── Full phrase library (single source of truth) ────────────────────────────
export const PHRASES: Phrase[] = [
  { id: '1', arabic: 'السلام عليكم', roman: 'Assalam alaikum', english: 'Peace be upon you', category: 'Greetings', culturalNote: 'The standard Muslim greeting — always respond with "Wa alaikum assalam" to complete the exchange of peace', difficulty: 'basic' },
  { id: '2', arabic: 'أهلاً وسهلاً', roman: 'Ahlan wa sahlan', english: 'Welcome', category: 'Greetings', culturalNote: 'Deeply warm welcome. Means "you are family and the path is easy". Use it generously.', difficulty: 'basic' },
  { id: '3', arabic: 'كيف حالك؟', roman: 'Kayf halak?', english: 'How are you?', category: 'Greetings', difficulty: 'basic' },
  { id: '4', arabic: 'حياك الله', roman: 'Hayak Allah', english: 'God bless your life', category: 'Greetings', culturalNote: 'More elevated than "ahlan" — reserved for people you genuinely respect or want to honour.', difficulty: 'intermediate' },
  { id: '5', arabic: 'صباح الخير', roman: 'Sabah al-khayr', english: 'Good morning', category: 'Greetings', difficulty: 'basic' },
  { id: '6', arabic: 'مساء الخير', roman: "Masa al-khayr", english: 'Good evening', category: 'Greetings', difficulty: 'basic' },
  { id: '7', arabic: 'شكراً جزيلاً', roman: 'Shukran jazelan', english: 'Thank you very much', category: 'Gratitude', difficulty: 'basic' },
  { id: '8', arabic: 'الله يسعدك', roman: "Allah yis'aadak", english: 'May God make you happy', category: 'Gratitude', culturalNote: 'A beautiful response to "thank you" — shows warmth and faith at the same time.', difficulty: 'intermediate' },
  { id: '9', arabic: 'مشكور', roman: 'Mashkur', english: 'Thanks (Gulf dialect)', category: 'Gratitude', culturalNote: 'Specifically Gulf Arabic — sounds natural to Emiratis vs the more formal "shukran".', difficulty: 'basic' },
  { id: '10', arabic: 'الله يعافيك', roman: "Allah y'afik", english: 'May God grant you health', category: 'Gratitude', difficulty: 'intermediate' },
  { id: '11', arabic: 'تفضل', roman: 'Tafaddal', english: 'Please / Come in / Here you go', category: 'Hospitality', culturalNote: 'One of the most versatile Gulf words — can mean "sit down", "take this", "you first", "please enter". Context is everything.', difficulty: 'basic' },
  { id: '12', arabic: 'يعطيك العافية', roman: "Ya'teek al-'afiya", english: 'May God give you strength', category: 'Hospitality', culturalNote: 'Said to someone who is working hard. Deeply meaningful — shows you see and appreciate their effort.', difficulty: 'intermediate' },
  { id: '13', arabic: 'زين', roman: 'Zain', english: 'Good / OK / Fine', category: 'Hospitality', culturalNote: 'Quintessential Gulf Arabic — heard everywhere in the UAE. Master this and you sound local.', difficulty: 'basic' },
  { id: '14', arabic: 'إن شاء الله', roman: 'Inshallah', english: 'God willing', category: 'Workplace', culturalNote: 'Critical nuance: tone reveals meaning. Enthusiastic = genuine commitment. Slow and drawn out = "maybe, we\'ll see".', difficulty: 'basic' },
  { id: '15', arabic: 'ما شاء الله', roman: 'Masha Allah', english: 'What God has willed', category: 'Workplace', culturalNote: 'Express admiration and protect from the evil eye simultaneously. Always appropriate when praising.', difficulty: 'basic' },
  { id: '16', arabic: 'بكرة إن شاء الله', roman: 'Bukra inshallah', english: 'Tomorrow, God willing', category: 'Workplace', culturalNote: '"Bukra" means tomorrow but culturally implies flexibility. Time is relational, not transactional.', difficulty: 'intermediate' },
  { id: '17', arabic: 'الحمد لله', roman: 'Alhamdulillah', english: 'Praise be to God', category: 'Workplace', culturalNote: 'Response to "how are you" — always said even during hardship. Shows faith and contentment.', difficulty: 'basic' },
  { id: '18', arabic: 'يلا نشرب قهوة؟', roman: 'Yalla nishrab gahwa?', english: "Let's grab coffee", category: 'Social', culturalNote: 'Coffee is the language of trust in Emirati culture. This phrase opens doors that formal language cannot.', difficulty: 'basic' },
  { id: '19', arabic: 'يلا بينا', roman: 'Yalla bayna', english: "Let's go together", category: 'Social', difficulty: 'basic' },
  { id: '20', arabic: 'عيد مبارك', roman: 'Eid Mubarak', english: 'Blessed Eid', category: 'Social', culturalNote: 'Essential during Eid. Will be deeply appreciated and remembered.', difficulty: 'basic' },
  { id: '21', arabic: 'رمضان كريم', roman: 'Ramadan Kareem', english: 'Generous Ramadan', category: 'Social', culturalNote: 'Used at the start of Ramadan. Respond with "Allahu akram" (God is more generous).', difficulty: 'basic' },
  { id: '22', arabic: 'بس', roman: 'Bass', english: "That's enough / Just / Stop", category: 'Social', culturalNote: '"Bass khalas" = "that\'s it, all done". Extremely common — use it and you sound completely natural.', difficulty: 'basic' },
];

// ─── Category metadata ───────────────────────────────────────────────────────
export const PHRASE_CATEGORIES: PhraseCategory[] = ['Greetings', 'Gratitude', 'Hospitality', 'Workplace', 'Social'];

export const CATEGORY_COLORS: Record<string, string> = {
  All: C.GOLD,
  Greetings: C.JADE2,
  Gratitude: '#E0A04A',
  Hospitality: C.VIOLET2,
  Workplace: '#4EC8C0',
  Social: '#E07070',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  basic: C.JADE2,
  intermediate: C.GOLD,
  advanced: '#E07070',
};

// ─── Quick-practice subset for HomeScreen ────────────────────────────────────
export const QUICK_PRACTICE_PHRASES = PHRASES.filter(p =>
  ['18', '7', '14', '11'].includes(p.id)
);

export function getPhraseById(id: string): Phrase | undefined {
  return PHRASES.find(p => p.id === id);
}
