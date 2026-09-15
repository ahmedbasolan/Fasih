import type { Phrase, PhraseCategory, CEFRBand } from '../types';
import { STRINGS } from './strings';
import { UNSOURCED } from './curriculum';
import type { ThemeColors } from '../components/design/tokens';

// ─── Full phrase library (single source of truth) ────────────────────────────
// Romanisation uses a simplified system readable by non-Arabic speakers:
//   q → g  (Khaleeji ق),  kh (خ),  gh (غ),  ' for ع,  long vowels aa/ii/uu
//   No IPA characters. All lowercase except sentence start and proper nouns.
export const PHRASES: Phrase[] = [
  // ── GREETINGS ──
  { id: 'g1', arabic: 'السلام عليكم', roman: 'is-salaam \'alaykum', english: 'Peace be upon you', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: 'Stress on "laam". Always reply: wa \'alaykum is-salaam.', culturalNote: 'The universal Islamic greeting — always respond to complete the exchange of peace.' },
  { id: 'g2', arabic: 'أهلا وسهلا', roman: 'ahlan wa sahlan', english: 'Welcome', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"ah-lan" not "ah-lean". Keep it short and warm.', culturalNote: 'Means "you are among family and the path is easy". Use it generously.' },
  { id: 'g3', arabic: 'شلونك؟', roman: 'shloonak?', english: 'How are you? (to a male)', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"shloo-nak" — the sh is soft. For a female: "shloonich".', culturalNote: 'The Khaleeji way to say "how are you". More natural than "kayf haalak" in the Gulf.' },
  { id: 'g4', arabic: 'صباح الخير', roman: 'sabaah il-khair', english: 'Good morning', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: 'Emphasise the "kh" — a deep throat sound, like clearing your throat gently.' },
  { id: 'g5', arabic: 'مساء الخير', roman: 'masaa\' il-khair', english: 'Good evening', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED },
  { id: 'g6', arabic: 'حياك الله', roman: 'hayyaak allaah', english: 'May God greet you / Welcome', category: 'Greetings', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"hay-YAAK" — stress on second syllable. The h is a strong breathy H.', culturalNote: 'More elevated than "ahlan" — reserved for people you want to honour. Very Emirati.' },
  { id: 'g7', arabic: 'هلا والله', roman: 'hala wallaah', english: 'Hey! Welcome!', category: 'Greetings', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"ha-LA wal-LAAH" — enthusiastic and warm.', culturalNote: 'Casual, warm greeting among friends. Can be repeated "hala hala hala" for extra warmth.' },
  { id: 'g8', arabic: 'صباح النور', roman: 'sabaah in-nuur', english: 'Morning of light (reply to good morning)', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: 'Reply to "sabaah il-khair". "nuur" rhymes with "tour".', culturalNote: 'The correct response to good morning. Replying "sabaah il-khair" back is a common beginner mistake.' },
  { id: 'g9', arabic: 'كيف الحال؟', roman: 'kaif il-haal?', english: 'How is everything?', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"kaif" — Khaleeji pronunciation drops the Y sound.' },
  { id: 'g10', arabic: 'الله يسلمك', roman: 'allaah yisallmak', english: 'May God keep you safe', category: 'Greetings', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: 'Standard warm reply to greetings. For a female: "yisallmich".' },

  // ── GRATITUDE ──
  { id: 'gr1', arabic: 'مشكور', roman: 'mashkuur', english: 'Thanks (Khaleeji)', category: 'Gratitude', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"mash-KUUR" — long "uu". For a female: "mashkuura".', culturalNote: 'The Gulf way to say thanks. Sounds more natural to Emiratis than "shukran".' },
  { id: 'gr2', arabic: 'شكرا', roman: 'shukran', english: 'Thank you', category: 'Gratitude', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"SHUK-ran" — short and crisp.' },
  { id: 'gr3', arabic: 'تسلم', roman: 'tislam', english: 'Bless you / Thanks', category: 'Gratitude', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"tis-LAM". For a female: "tislamiin".', culturalNote: 'Very natural Khaleeji thank you. Said when someone does you a favour or hands you something.' },
  { id: 'gr4', arabic: 'الله يعافيك', roman: 'allaah yi\'aafik', english: 'May God grant you wellness', category: 'Gratitude', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"yi-AA-fik" — the \' before AA is a soft throat sound. For a female: "yi\'aafich".', culturalNote: 'Said to someone working hard, or as a respectful "thank you" to service staff.' },
  { id: 'gr5', arabic: 'الله يسعدك', roman: 'allaah yis\'idak', english: 'May God make you happy', category: 'Gratitude', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"yis-\'i-dak" — for a female: "yis\'idich".', culturalNote: 'A beautiful response to a kind gesture — shows warmth and faith at the same time.' },
  { id: 'gr6', arabic: 'الله يجزاك خير', roman: 'allaah yijzaak khair', english: 'May God reward you with good', category: 'Gratitude', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"yij-ZAAK" — the j is soft. For a female: "yijzaach".', culturalNote: 'The most sincere form of gratitude. Used when someone goes above and beyond.' },
  { id: 'gr7', arabic: 'ما قصرت', roman: 'maa gassart', english: "You didn't fall short / Well done", category: 'Gratitude', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"maa ga-SSART" — the g replaces q in Khaleeji. For a female: "maa gassartii".', culturalNote: 'Very Khaleeji way to say "you really came through". High praise.' },

  // ── HOSPITALITY ──
  { id: 'h1', arabic: 'تفضل', roman: 'tfaddal', english: 'Please / Here you go / Come in', category: 'Hospitality', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"ti-FAD-dal" — stress on middle. For a female: "tifaddali". For a group: "tifaddalu".', culturalNote: 'One of the most versatile Gulf words — means "sit down", "take this", "you first", "please enter". Context is everything.' },
  { id: 'h2', arabic: 'يعطيك العافية', roman: 'ya\'tiik il-\'aafya', english: 'May God give you strength', category: 'Hospitality', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"ya\'-TIIK" — long ii. Said to someone who is working hard.', culturalNote: 'Deeply meaningful — shows you see and appreciate someone\'s effort.' },
  { id: 'h3', arabic: 'البيت بيتك', roman: 'il-bait baitak', english: 'My home is your home', category: 'Hospitality', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"il-BAIT BAI-tak". For a female: "baitich".', culturalNote: 'Emiratis say this genuinely. Hospitality is a core cultural value — guests are treated like royalty.' },
  { id: 'h4', arabic: 'عندك أمر', roman: '\'indak amur', english: 'At your service / Command me', category: 'Hospitality', type: 'expression', cefr: 'A2', source: UNSOURCED, pronTip: '"\'IN-dak A-mur" — shows deep respect and willingness to help.', culturalNote: 'Said to show complete willingness to help. Very formal and respectful in Emirati culture.' },
  { id: 'h5', arabic: 'صحتين وعافية', roman: 'sahtain w-\'aafya', english: 'Double health and wellness (bon appétit)', category: 'Hospitality', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"sah-TAIN" — said before or after someone eats.', culturalNote: 'The Khaleeji "bon appétit". Reply: "\'ala galbak" (on your heart).' },

  // ── EVERYDAY ──
  { id: 'e1', arabic: 'زين', roman: 'zain', english: 'Good / OK / Fine', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'Rhymes with "rain". Short and snappy.', culturalNote: 'Quintessential Gulf Arabic — heard everywhere in the UAE. Master this and you sound local.' },
  { id: 'e2', arabic: 'بس', roman: 'bass', english: "That's enough / Just / Stop", category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'Like English "bus" but shorter.', culturalNote: '"bass khalaas" = "that\'s it, all done". Extremely common.' },
  { id: 'e3', arabic: 'خلاص', roman: 'khalaas', english: 'Done / Finished / Enough', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"kha-LAAS" — the kh is a deep throat sound.' },
  { id: 'e4', arabic: 'يلا', roman: 'yalla', english: "Let's go / Come on", category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"YAL-la" — fast and energetic.' },
  { id: 'e_new1', arabic: 'من فضلك', roman: 'min fadlak / min fadlich', english: 'Please', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'To a male: "min FAD-lak". To a female: "min FAD-lich". The ending changes based on who you\'re speaking to.', culturalNote: 'The universal Gulf way to make a polite request. Works for ordering, asking for help, or getting someone\'s attention. Always match the gender of the person you\'re speaking to.' },
  { id: 'e5', arabic: 'شوي', roman: 'shwai', english: 'A little / Slowly', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"SHWAI" — one syllable. "shwai shwai" means "slowly slowly".', culturalNote: '"shwai shwai" is said constantly — slow down, take it easy, bit by bit.' },
  { id: 'e6', arabic: 'وايد', roman: 'waayid', english: 'A lot / Very', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"WAA-yid" — distinctly Khaleeji. Use instead of "kathiir".', culturalNote: 'The Khaleeji word for "a lot". "waayid zain" = "very good".' },
  { id: 'e7', arabic: 'إي', roman: 'ii', english: 'Yes', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'Long "ee" sound — like "ee" in "see". Khaleeji for "na\'am".' },
  { id: 'e8', arabic: 'لا', roman: 'laa', english: 'No', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'Long "aa" — "LAAA". Firm but not rude.' },
  { id: 'e9', arabic: 'شو؟', roman: 'shuu?', english: 'What?', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: 'Long "uu" — like "shoe" with a question tone.' },
  { id: 'e10', arabic: 'ليش؟', roman: 'laish?', english: 'Why?', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"LAISH" — one syllable.' },
  { id: 'e11', arabic: 'وين؟', roman: 'wain?', english: 'Where?', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"WAIN" — rhymes with "rain".' },
  { id: 'e12', arabic: 'متى؟', roman: 'mita?', english: 'When?', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"MI-ta" — short and direct.' },
  { id: 'e13', arabic: 'هني', roman: 'hini', english: 'Here', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"HI-ni" — Khaleeji for "huna".' },
  { id: 'e14', arabic: 'هناك', roman: 'hinaak', english: 'There', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"hi-NAAK" — long second syllable.' },
  { id: 'e15', arabic: 'حلو', roman: 'hilu', english: 'Nice / Sweet / Beautiful', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"HI-lu" — the h is breathy. Used for things AND people.' },
  { id: 'e16', arabic: 'مب زين', roman: 'mub zain', english: 'Not good', category: 'Everyday', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"MUB ZAIN" — "mub" is Khaleeji for "not".' },

  // ── WORKPLACE ──
  { id: 'w1', arabic: 'إن شاء الله', roman: 'in shaa\' allaah', english: 'God willing', category: 'Workplace', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"in SHAAAA al-laah" — draw out the "shaa" naturally.', culturalNote: 'Critical nuance: enthusiastic tone = genuine commitment. Slow and drawn out = "maybe, we\'ll see".' },
  { id: 'w2', arabic: 'ما شاء الله', roman: 'maa shaa\' allaah', english: 'What God has willed (admiration)', category: 'Workplace', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"maa SHAAAA al-laah" — said with genuine admiration.', culturalNote: 'Expresses admiration and protects from the evil eye. Always say it when praising someone.' },
  { id: 'w3', arabic: 'الحمد لله', roman: 'il-hamdu lillaah', english: 'Praise be to God', category: 'Workplace', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"il-HAM-du lil-LAAH" — the h is breathy, not a regular H.', culturalNote: 'Response to "how are you" — always said even during hardship. Shows faith and contentment.' },
  { id: 'w4', arabic: 'بكرة إن شاء الله', roman: 'bachir in shaa\' allaah', english: 'Tomorrow, God willing', category: 'Workplace', type: 'phrase', cefr: 'A1+', source: UNSOURCED, pronTip: '"BA-chir" — the ch is distinctly Khaleeji (not "bukra").', culturalNote: '"Bachir" is the Khaleeji pronunciation. Implies flexibility — time is relational, not transactional.' },
  { id: 'w5', arabic: 'اجتماع', roman: 'ijtimaa\'', english: 'Meeting', category: 'Workplace', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"ij-ti-MAA\'" — the \' at the end is a soft throat stop.' },
  { id: 'w6', arabic: 'مشروع', roman: 'mashroo\'', english: 'Project', category: 'Workplace', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"mash-ROO\'" — emphasis on "roo".' },
  { id: 'w7', arabic: 'توني واصل', roman: 'tawni waasil', english: 'I just arrived', category: 'Workplace', type: 'phrase', cefr: 'A1+', source: UNSOURCED, pronTip: '"TAW-ni WAA-sil" — "tawni" is Khaleeji for "just now I".', culturalNote: '"Taw" is a Khaleeji time marker meaning "just now". Very common.' },
  { id: 'w8', arabic: 'خلصت الشغل', roman: 'khallaast ish-shughul', english: 'I finished work', category: 'Workplace', type: 'phrase', cefr: 'A1+', source: UNSOURCED, pronTip: '"khal-LAAST ish-SHUGH-ul" — "shughul" is the Khaleeji word for work.' },

  // ── SOCIAL ──
  { id: 's1', arabic: 'يلا نشرب قهوة', roman: 'yalla nishrab gahwa', english: "Let's grab coffee", category: 'Social', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"nish-rab GAH-wa" — g not q for قهوة in Khaleeji.', culturalNote: 'Coffee is the language of trust in Emirati culture. This phrase opens doors that formal language cannot.' },
  { id: 's2', arabic: 'يلا بينا', roman: 'yalla baina', english: "Let's go together", category: 'Social', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"YAL-la BAI-na" — casual and friendly.' },
  { id: 's3', arabic: 'عيد مبارك', roman: '\'iid mubaarak', english: 'Blessed Eid', category: 'Social', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"\'IID mu-BAA-rak" — the \' is a soft throat sound.', culturalNote: 'Essential during Eid. Will be deeply appreciated and remembered.' },
  { id: 's4', arabic: 'رمضان كريم', roman: 'ramadaan kariim', english: 'Generous Ramadan', category: 'Social', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"ra-ma-DAAN ka-RIIM".', culturalNote: 'Used at the start of Ramadan. Respond with "allaahu akram" (God is more generous).' },
  { id: 's5', arabic: 'مبروك', roman: 'mabruuk', english: 'Congratulations', category: 'Social', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"mab-RUUK" — long "uu".', culturalNote: 'Reply: "allaah yibaarik fiik" (may God bless you).' },
  { id: 's6', arabic: 'الله يبارك فيك', roman: 'allaah yibaarik fiik', english: 'May God bless you', category: 'Social', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"yi-BAA-rik FIIK" — reply to "mabruuk".' },
  { id: 's7', arabic: 'ما يخالف', roman: 'maa yikhaalif', english: "No problem / It's fine", category: 'Social', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"maa yi-KHAA-lif" — very common Khaleeji "no worries".' },
  { id: 's8', arabic: 'عادي', roman: '\'aadi', english: 'Normal / No big deal', category: 'Social', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"\'AA-di" — said casually, like "it\'s chill".', culturalNote: 'Very casual. Used to downplay something or say "it\'s all good".' },
  { id: 's9', arabic: 'سوالف', roman: 'sawaalif', english: 'Chatting / Stories', category: 'Social', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"sa-WAA-lif" — Khaleeji word for casual conversation.', culturalNote: '"Yallsa w sawaalif" = gathering and chatting. Central to Gulf social life.' },

  // ── FOOD & DRINK ──
  { id: 'f1', arabic: 'قهوة', roman: 'gahwa', english: 'Coffee (Arabic coffee)', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"GAH-wa" — always g not q in Khaleeji.', culturalNote: 'Arabic coffee (light, cardamom-flavoured) is served at every gathering. Accept with your right hand.' },
  { id: 'f2', arabic: 'شاي', roman: 'chaai', english: 'Tea', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"CHAAI" — long aa. The ch is Khaleeji pronunciation for ش in this word.', culturalNote: 'Karak chai (strong milk tea) is the UAE\'s unofficial national drink.' },
  { id: 'f3', arabic: 'ماي', roman: 'maay', english: 'Water', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"MAAY" — Khaleeji for the formal "maa\'" (water). Rhymes with "my".', culturalNote: 'In formal Arabic it\'s "maa\'" but locals always say "maay".' },
  { id: 'f4', arabic: 'جوعان', roman: 'yoo\'aan', english: 'Hungry', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"yoo-\'AAN" — ج becomes y in Khaleeji. The \' is a deep throat sound. Female: "yoo\'aana".', culturalNote: 'The ج→y shift is one of the key features of Emirati Khaleeji Arabic.' },
  { id: 'f5', arabic: 'عطشان', roman: '\'atshaan', english: 'Thirsty', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"\'at-SHAAN" — Female: "\'atshaana".' },
  { id: 'f6', arabic: 'لقيمات', roman: 'lugaimaat', english: 'Sweet dumplings (Emirati dessert)', category: 'Food & Drink', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"lu-gai-MAAT" — a beloved Emirati treat.', culturalNote: 'Crunchy fried dough balls drizzled with date syrup. A must during Ramadan.' },
  { id: 'f7', arabic: 'تمر', roman: 'tamar', english: 'Dates (fruit)', category: 'Food & Drink', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"TA-mar" — short and simple.', culturalNote: 'Dates are served with Arabic coffee. Always offered to guests as a sign of hospitality.' },
  { id: 'f8', arabic: 'أبي آكل', roman: 'abi aakil', english: 'I want to eat', category: 'Food & Drink', type: 'phrase', cefr: 'A1+', source: UNSOURCED, pronTip: '"A-bi AA-kil" — "abi" is Khaleeji for "I want" (not "uriid").', culturalNote: '"Abi" is the everyday Khaleeji way to say "I want". You\'ll hear it constantly.' },

  // ── FAMILY ──
  { id: 'fm1', arabic: 'أهل', roman: 'ahal', english: 'Family / People', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"A-hal" — short and common.' },
  { id: 'fm2', arabic: 'يدي', roman: 'yiddi', english: 'My grandfather', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"YID-di" — Khaleeji for grandfather. Very affectionate.' },
  { id: 'fm3', arabic: 'يدتي', roman: 'yiddati', english: 'My grandmother', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"yid-DA-ti" — Khaleeji for grandmother.' },
  { id: 'fm4', arabic: 'ولد', roman: 'walad', english: 'Boy / Son', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"WA-lad" — also used casually to mean "dude" among friends.' },
  { id: 'fm5', arabic: 'بنت', roman: 'bint', english: 'Girl / Daughter', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"BINT" — one syllable, crisp.' },
  { id: 'fm6', arabic: 'ربيعي', roman: 'rabii\'i', english: 'My close friend (male)', category: 'Family', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"ra-BII-\'i" — literally "my spring" but means "my best friend".', culturalNote: 'A deeply Emirati term for a close male friend. Female equivalent: "rabii\'ti".' },
  { id: 'fm7', arabic: 'عيال', roman: '\'iyaal', english: 'Kids / Children', category: 'Family', type: 'vocab', cefr: 'A1', source: UNSOURCED, pronTip: '"\'i-YAAL" — commonly used. "\'iyaali" = my kids.' },

  // ── ADVANCED PHRASES ──
  { id: 'a1', arabic: 'ما عليه', roman: 'maa \'alaih', english: 'Never mind / No worries', category: 'Social', type: 'expression', cefr: 'A2', source: UNSOURCED, pronTip: '"maa \'a-LAIH" — very casual, dismissive in a friendly way.' },
  { id: 'a2', arabic: 'على كيفك', roman: '\'ala kaifak', english: 'As you wish / Up to you', category: 'Social', type: 'expression', cefr: 'A2', source: UNSOURCED, pronTip: '"\'a-la KAI-fak" — "kaif" has many meanings: mood, wish, desire. Female: "kaifich".', culturalNote: '"\'ala kaifu" can also describe someone who does whatever they want — a bit spoiled but endearing.' },
  { id: 'a3', arabic: 'إذا ما عليك أمر', roman: 'idhaa maa \'alaik amur', english: "If you don't mind / Please (polite)", category: 'Hospitality', type: 'expression', cefr: 'A2', source: UNSOURCED, pronTip: '"i-DHAA maa \'a-LAIK A-mur" — very polite way to ask for something.', culturalNote: 'The most polite way to make a request. Shows deep respect for the other person\'s time.' },
  { id: 'a4', arabic: 'تراني مستعيل', roman: 'taraani mista\'yil', english: "I'm in a hurry actually", category: 'Everyday', type: 'phrase', cefr: 'A2', source: UNSOURCED, pronTip: '"ta-RAA-ni mis-TA\'-yil" — "taraani" is Khaleeji for "actually, I am...".', culturalNote: '"Tara" is a Khaleeji discourse marker meaning "actually" or "you know". Very natural filler.' },
  { id: 'a5', arabic: 'ما أدري', roman: 'maa adri', english: "I don't know", category: 'Everyday', type: 'phrase', cefr: 'A1+', source: UNSOURCED, pronTip: '"maa AD-ri" — Khaleeji for "I don\'t know". Simple and common.' },
  { id: 'a6', arabic: 'عطني', roman: '\'atni', english: 'Give me', category: 'Everyday', type: 'vocab', cefr: 'A1+', source: UNSOURCED, pronTip: '"\'AT-ni" — direct but normal in Khaleeji. Add "lau samaht" for politeness.' },

  // ── SCENARIO: THE FIRST MORNING ──
  { id: 'fm-s1-1', arabic: 'صباح الخير', roman: 'sabaah al-khair', english: 'Good morning', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['صباح', 'الخير'], culturalNote: 'Universal morning greeting in Gulf Arabic. Use with everyone — colleagues, guests, strangers.' },
  { id: 'fm-s1-2', arabic: 'صباح النور', roman: 'sabaah an-nuur', english: 'Morning of light (reply to good morning)', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['صباح', 'النور'], culturalNote: 'The correct response to صباح الخير. Saying صباح الخير back is a common beginner mistake — like answering "good morning" with "good morning" instead of "morning!"' },
  { id: 'fm-s1-3', arabic: 'شلونك؟', roman: 'shloonak?', english: 'How are you? (to a male)', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['شلونك؟'], culturalNote: 'Gulf Arabic for "how are you" when speaking to a man. شلونج (shloonich) for a woman.' },
  { id: 'fm-s1-4', arabic: 'الحمد لله، بخير', roman: 'al-hamdu lillaah, b-khair', english: "Thank God, I'm well", category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['الحمد', 'لله،', 'بخير'], culturalNote: 'The standard response to "how are you". Always start with الحمد لله — it shows faith and contentment.' },
  { id: 'fm-s1-5', arabic: 'أنا يديد هني', roman: 'ana ydiid hini', english: "I'm new here", category: 'Workplace', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['أنا', 'يديد', 'هني'], culturalNote: 'Note: يديد (ydiid) is Gulf dialect for جديد (jadiid). The ج→ي shift is a key feature of Khaleeji Arabic.' },
  { id: 'fm-s1-6', arabic: 'تشرفنا', roman: 'tsharrafna', english: 'Honoured to meet you', category: 'Greetings', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['تشرفنا'], culturalNote: 'Said after someone introduces themselves. Stronger and warmer than "nice to meet you".' },
  { id: 'fm-s1-8', arabic: 'يلا، بالتوفيق', roman: 'yalla, bit-tawfiiq', english: 'Come on, good luck', category: 'Everyday', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'first-morning', wordTiles: ['يلا،', 'بالتوفيق'], culturalNote: 'Casual encouragement. يلا is the most versatile word in Gulf Arabic. بالتوفيق specifically blesses someone\'s effort.' },

  // ── SCENARIO: THE MEETING ──
  // New with the rewrite and unsourced (MAX_UNSOURCED raised by exactly these four).
  // mt-3 / mt-4 are the verb slots for the abi-verb and khalni-verb patterns.
  { id: 'mt-1', arabic: 'الحمد لله على السلامة', roman: 'il-hamdu lillaah \'ala is-salaama', english: 'Thank God you\'re back safely', category: 'Greetings', type: 'expression', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'office-meeting', wordTiles: ['الحمد', 'لله', 'على', 'السلامة'], pronTip: '"il-HAM-du lil-LAAH \'a-la is-sa-LAA-ma" — the reply is الله يسلمك.', culturalNote: 'Said first, before anything else, to someone back from a trip or out of hospital.' },
  { id: 'mt-2', arabic: 'خلني أفكر فيها', roman: 'khallni afakkir fiiha', english: 'Let me think about it', category: 'Workplace', type: 'phrase', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'office-meeting', wordTiles: ['خلني', 'أفكر', 'فيها'], pronTip: '"KHALL-ni a-FAK-kir FII-ha" — خلني is the Gulf "let me".', culturalNote: 'With no day attached it is often a polite "not now". Answer it by gently offering a day to come back.' },
  { id: 'mt-3', arabic: 'أحاول', roman: 'ahaawil', english: 'try', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, scenarioSource: 'office-meeting', pronTip: '"a-HAA-wil" — the ح is a breathy h. This is the I-form (I try): خلني أحاول = let me try.' },
  { id: 'mt-4', arabic: 'أساعد', roman: 'asaa\'id', english: 'help', category: 'Everyday', type: 'vocab', cefr: 'A1', source: UNSOURCED, scenarioSource: 'office-meeting', pronTip: '"a-SAA-\'id" — the I-form (I help): أبي أساعد = I want to help; خلني أساعد = let me help.' },

  // ── CORE GULF FORMULAS (cross-scenario, used daily) ──
  { id: 'core-1', arabic: 'طال عمرك', roman: 'taal \'umrak', english: 'May your life be long (respectful address)', category: 'Greetings', type: 'expression', cefr: 'A1+', source: UNSOURCED, pronTip: '"TAAL \'UM-rak" — to a woman: طال عمرج (taal \'umrich).', culturalNote: 'THE Gulf honorific. Used when addressing anyone of rank or age — a sheikh, a manager, an elder. Safer and more local than سيدي, and far safer than guessing a title like معالي.' },
  { id: 'core-2', arabic: 'شخبارك؟', roman: 'shakhbaarak?', english: 'How are you? / What\'s your news?', category: 'Greetings', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"shakh-BAA-rak" — to a woman: شخبارج (shakhbaarich).', culturalNote: 'More distinctly Gulf than كيف الحال. Pairs naturally with شلونك — Emiratis often stack both: شلونك؟ شخبارك؟' },
  { id: 'core-3', arabic: 'الله يعطيك العافية', roman: 'allaah ya\'tiik al-\'aafya', english: 'May God give you strength', category: 'Gratitude', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"al-LAH ya\'-TIIK al-\'AAF-ya" — to a woman: الله يعطيج العافية (ya\'tiich).', culturalNote: 'Said TO someone who did work or served you. The single most useful workplace phrase in the Gulf — use it on a colleague finishing a shift, a driver, a waiter, anyone.' },
  { id: 'core-4', arabic: 'الله يعافيك', roman: 'allaah y\'aafiik', english: 'And may God keep you well (reply)', category: 'Gratitude', type: 'expression', cefr: 'A1', source: UNSOURCED, pronTip: '"al-LAH y\'AA-fiik" — to a woman: الله يعافيج (y\'aafiich).', culturalNote: 'The ANSWER to الله يعطيك العافية. Learn the pair together — using the reply as an opener is the giveaway of a learner who memorised phrases out of context.' },
  { id: 'core-5', arabic: 'لو سمحت', roman: 'law samaht', english: 'Please / excuse me', category: 'Everyday', type: 'phrase', cefr: 'A1', source: UNSOURCED, pronTip: '"law sa-MAHT" — to a woman: لو سمحتي (law samahti).', culturalNote: 'This is the Gulf "please". من فضلك is correct Arabic but reads as textbook or Egyptian — لو سمحت is what you will actually hear in Dubai.' },

  // ── SCENARIO: EID GREETINGS ──
  { id: 'eid-1', arabic: 'عيدكم مبارك', roman: '\'eidkum mubaarak', english: 'Blessed Eid to you (plural)', category: 'Social', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'eid-greeting', pronTip: '"\'EID-kum mu-BAA-rak" — to one person: عيدك مبارك (\'eidak / \'eidich mubaarak).', culturalNote: 'The Eid-specific greeting. كل عام وأنتم بخير also works and is heard everywhere, but عيدكم مبارك is the one that marks the day itself.' },
  { id: 'eid-2', arabic: 'وعساكم من عواده', roman: 'wa \'asaakum min \'uwwaadah', english: 'And may you live to see it again', category: 'Social', type: 'expression', cefr: 'A2', source: UNSOURCED, scenarioSource: 'eid-greeting', pronTip: '"wa \'a-SAA-kum min \'uw-WAA-dah" — عسى = may it be that.', culturalNote: 'The traditional Gulf follow-up to عيدكم مبارك, and the one almost no non-native learns. Saying it marks you as someone who has been paying attention for years.' },
  // eid-3 (يسلموا إيديك) removed with the 2026-09-15 rewrite: a Levantine form the
  // scenario no longer uses. eid-7 took its slot, so the unsourced count holds.
  { id: 'eid-4', arabic: 'جزاكم الله خير', roman: 'jazaakum allaah khair', english: 'May God reward you', category: 'Gratitude', type: 'expression', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'eid-greeting', pronTip: '"ja-ZAA-kum al-LAAH KHAIR" — to one person: جزاك الله خير (jazaak).', culturalNote: 'The heaviest thank-you in the language. Reserve it for real generosity — using it for small favours flattens its weight.' },
  { id: 'eid-5', arabic: 'بسم الله', roman: 'bismillaah', english: 'In the name of God', category: 'Food & Drink', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'eid-greeting', pronTip: '"bis-mil-LAAH" — said quietly, just before the first bite.', culturalNote: 'Said before eating, drinking, driving, or starting anything. Skipping it at a host\'s table is noticed even when nobody comments.' },
  { id: 'eid-6', arabic: 'بيتنا بيتك', roman: 'baitna baitak', english: 'Our home is your home', category: 'Hospitality', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'eid-greeting', pronTip: '"BAIT-na BAI-tak" — to a woman: بيتنا بيتج (baitna baitich).', culturalNote: 'When an elder says this to someone outside the family, it is a declaration of belonging, not small talk. Answer it with something of equal weight.' },
  { id: 'eid-7', arabic: 'الله يديمها نعمة', roman: 'allaah ydiimha ni\'ma', english: 'May God keep this blessing (after a meal)', category: 'Food & Drink', type: 'expression', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'eid-greeting', wordTiles: ['الله', 'يديمها', 'نعمة'], pronTip: '"al-LAAH y-DIIM-ha NI\'-ma" — the same to a man or a woman.', culturalNote: 'The way to stop a Gulf host urging more food: it thanks God for the table and the host for filling it, and ends the insisting without anyone losing face.' },

  // ── SCENARIO: THE TAXI RIDE (Egyptian contrast set) ──
  { id: 'tx-1', arabic: 'الله يحفظ عائلتك', roman: 'allaah yihfaz \'aa\'iltak', english: 'May God protect your family', category: 'Family', type: 'expression', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'social_taxi_ride', pronTip: '"al-LAAH YIH-faz \'AA-\'il-tak" — to a woman: عائلتج (\'aa\'iltich).', culturalNote: 'Blessing someone\'s family lands far deeper than thanking them personally — especially with migrant workers whose families are the reason they are here.' },
  { id: 'tx-2', arabic: 'انت منين؟', roman: 'inta minein?', english: 'Where are you from? (Egyptian)', category: 'Social', type: 'phrase', cefr: 'A1', source: UNSOURCED, use: 'recognise', scenarioSource: 'social_taxi_ride', pronTip: '"IN-ta mi-NEIN" — Gulf Arabic says من وين (min wayn) instead.', culturalNote: 'Learn to recognise it, not to say it. Roughly a quarter of Dubai speaks Egyptian — understanding منين while answering in Gulf Arabic is exactly the skill this city needs.' },
  { id: 'tx-3', arabic: 'شو يابك دبي؟', roman: 'shu yaabak dubay?', english: 'What brought you to Dubai?', category: 'Social', type: 'phrase', cefr: 'A1+', source: UNSOURCED, scenarioSource: 'social_taxi_ride', pronTip: '"SHU YAA-bak du-BAY" — جاب (brought) becomes ياب in Emirati. To a woman: شو يابج (shu yaabich).', culturalNote: 'The warm way to ask why someone is here. Everyone in Dubai has an answer to this and most enjoy giving it.' },

  // ── SCENARIO: THE ELEVATOR ──
  { id: 'el-1', arabic: 'السلام عليكم', roman: 'as-salaamu \'alaykum', english: 'Peace be upon you', category: 'Greetings', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'social_elevator', pronTip: '"as-sa-LAA-mu \'a-LAY-kum" — identical in every dialect and country.', culturalNote: 'The one greeting that works everywhere, with everyone, at any level of formality. When in doubt, this is never wrong.' },
  { id: 'el-2', arabic: 'وعليكم السلام', roman: 'wa \'alaykum as-salaam', english: 'And upon you peace', category: 'Greetings', type: 'expression', cefr: 'A1', source: UNSOURCED, scenarioSource: 'social_elevator', pronTip: '"wa \'a-LAY-kum as-sa-LAAM" — the order matters; it mirrors the greeting back.', culturalNote: 'Returning the greeting is close to obligatory. Leaving السلام عليكم unanswered is one of the few things that genuinely offends across the whole Arab world.' },
  { id: 'el-3', arabic: 'تعال على شاي', roman: 'ta\'aal \'ala shaay', english: 'Come over for tea', category: 'Hospitality', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'social_elevator', pronTip: '"ta-\'AAL \'a-la SHAAY" — to a woman: تعالي (ta\'aali).', culturalNote: 'The Gulf version of "let\'s hang out". Being the one who invites first carries real weight — it says you are willing to go first.' },
  { id: 'el-4', arabic: 'انت في أي دور؟', roman: 'inta fi ay door?', english: 'Which floor are you on?', category: 'Everyday', type: 'phrase', cefr: 'A1', source: UNSOURCED, scenarioSource: 'social_elevator', pronTip: '"IN-ta fi AY DOOR" — Jordanians and Levantines say طابق (taabeq) for floor.', culturalNote: 'A throwaway question that does real work — it converts standing silently beside someone into an actual conversation.' },
];

// ─── Category metadata ───────────────────────────────────────────────────────
export const PHRASE_CATEGORIES: PhraseCategory[] = ['Greetings', 'Gratitude', 'Hospitality', 'Workplace', 'Social', 'Everyday', 'Food & Drink', 'Family'];

export const getCategoryColors = (C: ThemeColors): Record<string, string> => ({
  All: C.JADE_ACCENT,
  Greetings: C.JADE2,
  Gratitude: C.JADE_ACCENT2,
  Hospitality: C.VIOLET2,
  Workplace: C.JADE3,
  Social: C.ERROR,
  Everyday: C.VIOLET2,
  'Food & Drink': C.JADE_ACCENT3,
  Family: C.VIOLET2,
});

/**
 * Phrase level colours, keyed by CEFR band.
 *
 * Was keyed by the old 'basic'|'intermediate'|'advanced' scale. The app now
 * carries one difficulty vocabulary (CEFR) rather than three that disagreed.
 */
export const getCefrColors = (C: ThemeColors): Record<CEFRBand, string> => ({
  'A1': C.JADE2,
  'A1+': C.JADE_ACCENT,
  'A2': C.ERROR,
});

/**
 * Plain-English label for a CEFR band.
 *
 * Most UAE expats do not know what A2 means, so the badge shows the familiar
 * word while the data carries the band. The CEFR value is what makes the ladder
 * comparable to Al Ramsa's A1–B3; the label is what makes it readable.
 */
export const CEFR_LABELS: Record<CEFRBand, string> = {
  'A1': STRINGS.common.levelBasic,
  'A1+': STRINGS.common.levelIntermediate,
  'A2': STRINGS.common.levelAdvanced,
};

export const TYPE_LABELS: Record<string, string> = {
  vocab: 'Vocabulary',
  phrase: 'Phrase',
  expression: 'Expression',
};

// ─── O(1) lookup maps (computed once at module load) ─────────────────────────
/**
 * Keyed by phrase ID. Use instead of PHRASES.find() for O(1) lookups.
 * Replacing scattered PHRASES.find(ph => ph.id === id) calls with this
 * eliminates O(n) scans that compound inside loops.
 */
export const PHRASE_BY_ID: Readonly<Record<string, Phrase>> = Object.fromEntries(
  PHRASES.map(p => [p.id, p])
);

/**
 * Phrase count per category — computed once, used for mastery percentage display.
 * Avoids re-filtering PHRASES inside every review update.
 */
export const PHRASES_PER_CATEGORY: Readonly<Record<PhraseCategory, number>> = Object.fromEntries(
  PHRASE_CATEGORIES.map(cat => [cat, PHRASES.filter(p => p.category === cat).length])
) as Record<PhraseCategory, number>;

// ─── Quick-practice subset for HomeScreen ────────────────────────────────────
export const QUICK_PRACTICE_PHRASES = PHRASES.filter(p =>
  ['s1', 'gr1', 'w1', 'h1'].includes(p.id)
);

/** O(1) phrase lookup by ID. */
export function getPhraseById(id: string): Phrase | undefined {
  return PHRASE_BY_ID[id];
}
