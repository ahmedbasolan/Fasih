import type { Phrase, PhraseCategory } from '../types';
import type { ThemeColors } from '../components/design/tokens';

// ─── Full phrase library (single source of truth) ────────────────────────────
// Romanisation uses a simplified system readable by non-Arabic speakers:
//   q → g  (Khaleeji ق),  kh (خ),  gh (غ),  ' for ع,  long vowels aa/ii/uu
//   No IPA characters. All lowercase except sentence start and proper nouns.
export const PHRASES: Phrase[] = [
  // ── GREETINGS ──
  { id: 'g1', arabic: 'السلام عليكم', roman: 'is-salaam \'alaykum', english: 'Peace be upon you', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: 'Stress on "laam". Always reply: wa \'alaykum is-salaam.', culturalNote: 'The universal Islamic greeting — always respond to complete the exchange of peace.' },
  { id: 'g2', arabic: 'أهلا وسهلا', roman: 'ahlan wa sahlan', english: 'Welcome', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: '"ah-lan" not "ah-lean". Keep it short and warm.', culturalNote: 'Means "you are among family and the path is easy". Use it generously.' },
  { id: 'g3', arabic: 'شلونك؟', roman: 'shloonak?', english: 'How are you? (to a male)', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: '"shloo-nak" — the sh is soft. For a female: "shloonich".', culturalNote: 'The Khaleeji way to say "how are you". More natural than "kayf haalak" in the Gulf.' },
  { id: 'g4', arabic: 'صباح الخير', roman: 'sabaah il-khair', english: 'Good morning', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: 'Emphasise the "kh" — a deep throat sound, like clearing your throat gently.' },
  { id: 'g5', arabic: 'مساء الخير', roman: 'masaa\' il-khair', english: 'Good evening', category: 'Greetings', type: 'phrase', difficulty: 'basic' },
  { id: 'g6', arabic: 'حياك الله', roman: 'hayyaak allaah', english: 'May God greet you / Welcome', category: 'Greetings', type: 'expression', difficulty: 'intermediate', pronTip: '"hay-YAAK" — stress on second syllable. The h is a strong breathy H.', culturalNote: 'More elevated than "ahlan" — reserved for people you want to honour. Very Emirati.' },
  { id: 'g7', arabic: 'هلا والله', roman: 'hala wallaah', english: 'Hey! Welcome!', category: 'Greetings', type: 'expression', difficulty: 'basic', pronTip: '"ha-LA wal-LAAH" — enthusiastic and warm.', culturalNote: 'Casual, warm greeting among friends. Can be repeated "hala hala hala" for extra warmth.' },
  { id: 'g8', arabic: 'صباح النور', roman: 'sabaah in-nuur', english: 'Morning of light (reply to good morning)', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: 'Reply to "sabaah il-khair". "nuur" rhymes with "tour".', culturalNote: 'The correct response to good morning. Replying "sabaah il-khair" back is a common beginner mistake.' },
  { id: 'g9', arabic: 'كيف الحال؟', roman: 'kaif il-haal?', english: 'How is everything?', category: 'Greetings', type: 'phrase', difficulty: 'basic', pronTip: '"kaif" — Khaleeji pronunciation drops the Y sound.' },
  { id: 'g10', arabic: 'الله يسلمك', roman: 'allaah yisallmak', english: 'May God keep you safe', category: 'Greetings', type: 'expression', difficulty: 'intermediate', pronTip: 'Standard warm reply to greetings. For a female: "yisallmich".' },

  // ── GRATITUDE ──
  { id: 'gr1', arabic: 'مشكور', roman: 'mashkuur', english: 'Thanks (Khaleeji)', category: 'Gratitude', type: 'vocab', difficulty: 'basic', pronTip: '"mash-KUUR" — long "uu". For a female: "mashkuura".', culturalNote: 'The Gulf way to say thanks. Sounds more natural to Emiratis than "shukran".' },
  { id: 'gr2', arabic: 'شكرا', roman: 'shukran', english: 'Thank you', category: 'Gratitude', type: 'vocab', difficulty: 'basic', pronTip: '"SHUK-ran" — short and crisp.' },
  { id: 'gr3', arabic: 'تسلم', roman: 'tislam', english: 'Bless you / Thanks', category: 'Gratitude', type: 'vocab', difficulty: 'basic', pronTip: '"tis-LAM". For a female: "tislamiin".', culturalNote: 'Very natural Khaleeji thank you. Said when someone does you a favour or hands you something.' },
  { id: 'gr4', arabic: 'الله يعافيك', roman: 'allaah yi\'aafik', english: 'May God grant you wellness', category: 'Gratitude', type: 'expression', difficulty: 'intermediate', pronTip: '"yi-AA-fik" — the \' before AA is a soft throat sound. For a female: "yi\'aafich".', culturalNote: 'Said to someone working hard, or as a respectful "thank you" to service staff.' },
  { id: 'gr5', arabic: 'الله يسعدك', roman: 'allaah yis\'idak', english: 'May God make you happy', category: 'Gratitude', type: 'expression', difficulty: 'intermediate', pronTip: '"yis-\'i-dak" — for a female: "yis\'idich".', culturalNote: 'A beautiful response to a kind gesture — shows warmth and faith at the same time.' },
  { id: 'gr6', arabic: 'الله يجزاك خير', roman: 'allaah yijzaak khair', english: 'May God reward you with good', category: 'Gratitude', type: 'expression', difficulty: 'intermediate', pronTip: '"yij-ZAAK" — the j is soft. For a female: "yijzaach".', culturalNote: 'The most sincere form of gratitude. Used when someone goes above and beyond.' },
  { id: 'gr7', arabic: 'ما قصرت', roman: 'maa gassart', english: "You didn't fall short / Well done", category: 'Gratitude', type: 'expression', difficulty: 'intermediate', pronTip: '"maa ga-SSART" — the g replaces q in Khaleeji. For a female: "maa gassartii".', culturalNote: 'Very Khaleeji way to say "you really came through". High praise.' },

  // ── HOSPITALITY ──
  { id: 'h1', arabic: 'تفضل', roman: 'tfaddal', english: 'Please / Here you go / Come in', category: 'Hospitality', type: 'vocab', difficulty: 'basic', pronTip: '"ti-FAD-dal" — stress on middle. For a female: "tifaddali". For a group: "tifaddalu".', culturalNote: 'One of the most versatile Gulf words — means "sit down", "take this", "you first", "please enter". Context is everything.' },
  { id: 'h2', arabic: 'يعطيك العافية', roman: 'ya\'tiik il-\'aafya', english: 'May God give you strength', category: 'Hospitality', type: 'expression', difficulty: 'intermediate', pronTip: '"ya\'-TIIK" — long ii. Said to someone who is working hard.', culturalNote: 'Deeply meaningful — shows you see and appreciate someone\'s effort.' },
  { id: 'h3', arabic: 'البيت بيتك', roman: 'il-bait baitak', english: 'My home is your home', category: 'Hospitality', type: 'expression', difficulty: 'intermediate', pronTip: '"il-BAIT BAI-tak". For a female: "baitich".', culturalNote: 'Emiratis say this genuinely. Hospitality is a core cultural value — guests are treated like royalty.' },
  { id: 'h4', arabic: 'عندك أمر', roman: '\'indak amur', english: 'At your service / Command me', category: 'Hospitality', type: 'expression', difficulty: 'advanced', pronTip: '"\'IN-dak A-mur" — shows deep respect and willingness to help.', culturalNote: 'Said to show complete willingness to help. Very formal and respectful in Emirati culture.' },
  { id: 'h5', arabic: 'صحتين وعافية', roman: 'sahtain w-\'aafya', english: 'Double health and wellness (bon appétit)', category: 'Hospitality', type: 'expression', difficulty: 'intermediate', pronTip: '"sah-TAIN" — said before or after someone eats.', culturalNote: 'The Khaleeji "bon appétit". Reply: "\'ala galbak" (on your heart).' },

  // ── EVERYDAY ──
  { id: 'e1', arabic: 'زين', roman: 'zain', english: 'Good / OK / Fine', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'Rhymes with "rain". Short and snappy.', culturalNote: 'Quintessential Gulf Arabic — heard everywhere in the UAE. Master this and you sound local.' },
  { id: 'e2', arabic: 'بس', roman: 'bass', english: "That's enough / Just / Stop", category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'Like English "bus" but shorter.', culturalNote: '"bass khalaas" = "that\'s it, all done". Extremely common.' },
  { id: 'e3', arabic: 'خلاص', roman: 'khalaas', english: 'Done / Finished / Enough', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"kha-LAAS" — the kh is a deep throat sound.' },
  { id: 'e4', arabic: 'يلا', roman: 'yalla', english: "Let's go / Come on", category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"YAL-la" — fast and energetic.' },
  { id: 'e_new1', arabic: 'من فضلك', roman: 'min fadlak / min fadlich', english: 'Please', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'To a male: "min FAD-lak". To a female: "min FAD-lich". The ending changes based on who you\'re speaking to.', culturalNote: 'The universal Gulf way to make a polite request. Works for ordering, asking for help, or getting someone\'s attention. Always match the gender of the person you\'re speaking to.' },
  { id: 'e5', arabic: 'شوي', roman: 'shwai', english: 'A little / Slowly', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"SHWAI" — one syllable. "shwai shwai" means "slowly slowly".', culturalNote: '"shwai shwai" is said constantly — slow down, take it easy, bit by bit.' },
  { id: 'e6', arabic: 'وايد', roman: 'waayid', english: 'A lot / Very', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"WAA-yid" — distinctly Khaleeji. Use instead of "kathiir".', culturalNote: 'The Khaleeji word for "a lot". "waayid zain" = "very good".' },
  { id: 'e7', arabic: 'إي', roman: 'ii', english: 'Yes', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'Long "ee" sound — like "ee" in "see". Khaleeji for "na\'am".' },
  { id: 'e8', arabic: 'لا', roman: 'laa', english: 'No', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'Long "aa" — "LAAA". Firm but not rude.' },
  { id: 'e9', arabic: 'شو؟', roman: 'shuu?', english: 'What?', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: 'Long "uu" — like "shoe" with a question tone.' },
  { id: 'e10', arabic: 'ليش؟', roman: 'laish?', english: 'Why?', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"LAISH" — one syllable.' },
  { id: 'e11', arabic: 'وين؟', roman: 'wain?', english: 'Where?', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"WAIN" — rhymes with "rain".' },
  { id: 'e12', arabic: 'متى؟', roman: 'mita?', english: 'When?', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"MI-ta" — short and direct.' },
  { id: 'e13', arabic: 'هني', roman: 'hini', english: 'Here', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"HI-ni" — Khaleeji for "huna".' },
  { id: 'e14', arabic: 'هناك', roman: 'hinaak', english: 'There', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"hi-NAAK" — long second syllable.' },
  { id: 'e15', arabic: 'حلو', roman: 'hilu', english: 'Nice / Sweet / Beautiful', category: 'Everyday', type: 'vocab', difficulty: 'basic', pronTip: '"HI-lu" — the h is breathy. Used for things AND people.' },
  { id: 'e16', arabic: 'مب زين', roman: 'mub zain', english: 'Not good', category: 'Everyday', type: 'phrase', difficulty: 'basic', pronTip: '"MUB ZAIN" — "mub" is Khaleeji for "not".' },

  // ── WORKPLACE ──
  { id: 'w1', arabic: 'إن شاء الله', roman: 'in shaa\' allaah', english: 'God willing', category: 'Workplace', type: 'expression', difficulty: 'basic', pronTip: '"in SHAAAA al-laah" — draw out the "shaa" naturally.', culturalNote: 'Critical nuance: enthusiastic tone = genuine commitment. Slow and drawn out = "maybe, we\'ll see".' },
  { id: 'w2', arabic: 'ما شاء الله', roman: 'maa shaa\' allaah', english: 'What God has willed (admiration)', category: 'Workplace', type: 'expression', difficulty: 'basic', pronTip: '"maa SHAAAA al-laah" — said with genuine admiration.', culturalNote: 'Expresses admiration and protects from the evil eye. Always say it when praising someone.' },
  { id: 'w3', arabic: 'الحمد لله', roman: 'il-hamdu lillaah', english: 'Praise be to God', category: 'Workplace', type: 'expression', difficulty: 'basic', pronTip: '"il-HAM-du lil-LAAH" — the h is breathy, not a regular H.', culturalNote: 'Response to "how are you" — always said even during hardship. Shows faith and contentment.' },
  { id: 'w4', arabic: 'بكرة إن شاء الله', roman: 'bachir in shaa\' allaah', english: 'Tomorrow, God willing', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', pronTip: '"BA-chir" — the ch is distinctly Khaleeji (not "bukra").', culturalNote: '"Bachir" is the Khaleeji pronunciation. Implies flexibility — time is relational, not transactional.' },
  { id: 'w5', arabic: 'اجتماع', roman: 'ijtimaa\'', english: 'Meeting', category: 'Workplace', type: 'vocab', difficulty: 'intermediate', pronTip: '"ij-ti-MAA\'" — the \' at the end is a soft throat stop.' },
  { id: 'w6', arabic: 'مشروع', roman: 'mashroo\'', english: 'Project', category: 'Workplace', type: 'vocab', difficulty: 'intermediate', pronTip: '"mash-ROO\'" — emphasis on "roo".' },
  { id: 'w7', arabic: 'توني واصل', roman: 'tawni waasil', english: 'I just arrived', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', pronTip: '"TAW-ni WAA-sil" — "tawni" is Khaleeji for "just now I".', culturalNote: '"Taw" is a Khaleeji time marker meaning "just now". Very common.' },
  { id: 'w8', arabic: 'خلصت الشغل', roman: 'khallaast ish-shughul', english: 'I finished work', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', pronTip: '"khal-LAAST ish-SHUGH-ul" — "shughul" is the Khaleeji word for work.' },

  // ── SOCIAL ──
  { id: 's1', arabic: 'يلا نشرب قهوة', roman: 'yalla nishrab gahwa', english: "Let's grab coffee", category: 'Social', type: 'phrase', difficulty: 'basic', pronTip: '"nish-rab GAH-wa" — g not q for قهوة in Khaleeji.', culturalNote: 'Coffee is the language of trust in Emirati culture. This phrase opens doors that formal language cannot.' },
  { id: 's2', arabic: 'يلا بينا', roman: 'yalla baina', english: "Let's go together", category: 'Social', type: 'phrase', difficulty: 'basic', pronTip: '"YAL-la BAI-na" — casual and friendly.' },
  { id: 's3', arabic: 'عيد مبارك', roman: '\'iid mubaarak', english: 'Blessed Eid', category: 'Social', type: 'phrase', difficulty: 'basic', pronTip: '"\'IID mu-BAA-rak" — the \' is a soft throat sound.', culturalNote: 'Essential during Eid. Will be deeply appreciated and remembered.' },
  { id: 's4', arabic: 'رمضان كريم', roman: 'ramadaan kariim', english: 'Generous Ramadan', category: 'Social', type: 'phrase', difficulty: 'basic', pronTip: '"ra-ma-DAAN ka-RIIM".', culturalNote: 'Used at the start of Ramadan. Respond with "allaahu akram" (God is more generous).' },
  { id: 's5', arabic: 'مبروك', roman: 'mabruuk', english: 'Congratulations', category: 'Social', type: 'vocab', difficulty: 'basic', pronTip: '"mab-RUUK" — long "uu".', culturalNote: 'Reply: "allaah yibaarik fiik" (may God bless you).' },
  { id: 's6', arabic: 'الله يبارك فيك', roman: 'allaah yibaarik fiik', english: 'May God bless you', category: 'Social', type: 'expression', difficulty: 'intermediate', pronTip: '"yi-BAA-rik FIIK" — reply to "mabruuk".' },
  { id: 's7', arabic: 'ما يخالف', roman: 'maa yikhaalif', english: "No problem / It's fine", category: 'Social', type: 'expression', difficulty: 'intermediate', pronTip: '"maa yi-KHAA-lif" — very common Khaleeji "no worries".' },
  { id: 's8', arabic: 'عادي', roman: '\'aadi', english: 'Normal / No big deal', category: 'Social', type: 'vocab', difficulty: 'basic', pronTip: '"\'AA-di" — said casually, like "it\'s chill".', culturalNote: 'Very casual. Used to downplay something or say "it\'s all good".' },
  { id: 's9', arabic: 'سوالف', roman: 'sawaalif', english: 'Chatting / Stories', category: 'Social', type: 'vocab', difficulty: 'intermediate', pronTip: '"sa-WAA-lif" — Khaleeji word for casual conversation.', culturalNote: '"Yallsa w sawaalif" = gathering and chatting. Central to Gulf social life.' },

  // ── FOOD & DRINK ──
  { id: 'f1', arabic: 'قهوة', roman: 'gahwa', english: 'Coffee (Arabic coffee)', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"GAH-wa" — always g not q in Khaleeji.', culturalNote: 'Arabic coffee (light, cardamom-flavoured) is served at every gathering. Accept with your right hand.' },
  { id: 'f2', arabic: 'شاي', roman: 'chaai', english: 'Tea', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"CHAAI" — long aa. The ch is Khaleeji pronunciation for ش in this word.', culturalNote: 'Karak chai (strong milk tea) is the UAE\'s unofficial national drink.' },
  { id: 'f3', arabic: 'ماي', roman: 'maay', english: 'Water', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"MAAY" — Khaleeji for the formal "maa\'" (water). Rhymes with "my".', culturalNote: 'In formal Arabic it\'s "maa\'" but locals always say "maay".' },
  { id: 'f4', arabic: 'جوعان', roman: 'yoo\'aan', english: 'Hungry', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"yoo-\'AAN" — ج becomes y in Khaleeji. The \' is a deep throat sound. Female: "yoo\'aana".', culturalNote: 'The ج→y shift is one of the key features of Emirati Khaleeji Arabic.' },
  { id: 'f5', arabic: 'عطشان', roman: '\'atshaan', english: 'Thirsty', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"\'at-SHAAN" — Female: "\'atshaana".' },
  { id: 'f6', arabic: 'لقيمات', roman: 'lugaimaat', english: 'Sweet dumplings (Emirati dessert)', category: 'Food & Drink', type: 'vocab', difficulty: 'intermediate', pronTip: '"lu-gai-MAAT" — a beloved Emirati treat.', culturalNote: 'Crunchy fried dough balls drizzled with date syrup. A must during Ramadan.' },
  { id: 'f7', arabic: 'تمر', roman: 'tamar', english: 'Dates (fruit)', category: 'Food & Drink', type: 'vocab', difficulty: 'basic', pronTip: '"TA-mar" — short and simple.', culturalNote: 'Dates are served with Arabic coffee. Always offered to guests as a sign of hospitality.' },
  { id: 'f8', arabic: 'أبي آكل', roman: 'abi aakil', english: 'I want to eat', category: 'Food & Drink', type: 'phrase', difficulty: 'intermediate', pronTip: '"A-bi AA-kil" — "abi" is Khaleeji for "I want" (not "uriid").', culturalNote: '"Abi" is the everyday Khaleeji way to say "I want". You\'ll hear it constantly.' },

  // ── FAMILY ──
  { id: 'fm1', arabic: 'أهل', roman: 'ahal', english: 'Family / People', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"A-hal" — short and common.' },
  { id: 'fm2', arabic: 'يدي', roman: 'yiddi', english: 'My grandfather', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"YID-di" — Khaleeji for grandfather. Very affectionate.' },
  { id: 'fm3', arabic: 'يدتي', roman: 'yiddati', english: 'My grandmother', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"yid-DA-ti" — Khaleeji for grandmother.' },
  { id: 'fm4', arabic: 'ولد', roman: 'walad', english: 'Boy / Son', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"WA-lad" — also used casually to mean "dude" among friends.' },
  { id: 'fm5', arabic: 'بنت', roman: 'bint', english: 'Girl / Daughter', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"BINT" — one syllable, crisp.' },
  { id: 'fm6', arabic: 'ربيعي', roman: 'rabii\'i', english: 'My close friend (male)', category: 'Family', type: 'vocab', difficulty: 'intermediate', pronTip: '"ra-BII-\'i" — literally "my spring" but means "my best friend".', culturalNote: 'A deeply Emirati term for a close male friend. Female equivalent: "rabii\'ti".' },
  { id: 'fm7', arabic: 'عيال', roman: '\'iyaal', english: 'Kids / Children', category: 'Family', type: 'vocab', difficulty: 'basic', pronTip: '"\'i-YAAL" — commonly used. "\'iyaali" = my kids.' },

  // ── ADVANCED PHRASES ──
  { id: 'a1', arabic: 'ما عليه', roman: 'maa \'alaih', english: 'Never mind / No worries', category: 'Social', type: 'expression', difficulty: 'advanced', pronTip: '"maa \'a-LAIH" — very casual, dismissive in a friendly way.' },
  { id: 'a2', arabic: 'على كيفك', roman: '\'ala kaifak', english: 'As you wish / Up to you', category: 'Social', type: 'expression', difficulty: 'advanced', pronTip: '"\'a-la KAI-fak" — "kaif" has many meanings: mood, wish, desire. Female: "kaifich".', culturalNote: '"\'ala kaifu" can also describe someone who does whatever they want — a bit spoiled but endearing.' },
  { id: 'a3', arabic: 'إذا ما عليك أمر', roman: 'idhaa maa \'alaik amur', english: "If you don't mind / Please (polite)", category: 'Hospitality', type: 'expression', difficulty: 'advanced', pronTip: '"i-DHAA maa \'a-LAIK A-mur" — very polite way to ask for something.', culturalNote: 'The most polite way to make a request. Shows deep respect for the other person\'s time.' },
  { id: 'a4', arabic: 'تراني مستعيل', roman: 'taraani mista\'yil', english: "I'm in a hurry actually", category: 'Everyday', type: 'phrase', difficulty: 'advanced', pronTip: '"ta-RAA-ni mis-TA\'-yil" — "taraani" is Khaleeji for "actually, I am...".', culturalNote: '"Tara" is a Khaleeji discourse marker meaning "actually" or "you know". Very natural filler.' },
  { id: 'a5', arabic: 'ما أدري', roman: 'maa adri', english: "I don't know", category: 'Everyday', type: 'phrase', difficulty: 'intermediate', pronTip: '"maa AD-ri" — Khaleeji for "I don\'t know". Simple and common.' },
  { id: 'a6', arabic: 'عطني', roman: '\'atni', english: 'Give me', category: 'Everyday', type: 'vocab', difficulty: 'intermediate', pronTip: '"\'AT-ni" — direct but normal in Khaleeji. Add "lau samaht" for politeness.' },

  // ── SCENARIO: THE FIRST MORNING ──
  { id: 'fm-s1-1', arabic: 'صباح الخير', roman: 'sabaah al-khair', english: 'Good morning', category: 'Greetings', type: 'phrase', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['صباح', 'الخير'], culturalNote: 'Universal morning greeting in Gulf Arabic. Use with everyone — colleagues, guests, strangers.' },
  { id: 'fm-s1-2', arabic: 'صباح النور', roman: 'sabaah an-nuur', english: 'Morning of light (reply to good morning)', category: 'Greetings', type: 'phrase', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['صباح', 'النور'], culturalNote: 'The correct response to صباح الخير. Saying صباح الخير back is a common beginner mistake — like answering "good morning" with "good morning" instead of "morning!"' },
  { id: 'fm-s1-3', arabic: 'شلونك؟', roman: 'shloonak?', english: 'How are you? (to a male)', category: 'Greetings', type: 'phrase', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['شلونك؟'], culturalNote: 'Gulf Arabic for "how are you" when speaking to a man. شلونج (shloonich) for a woman.' },
  { id: 'fm-s1-4', arabic: 'الحمد لله، بخير', roman: 'al-hamdu lillaah, b-khair', english: "Thank God, I'm well", category: 'Greetings', type: 'phrase', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['الحمد', 'لله،', 'بخير'], culturalNote: 'The standard response to "how are you". Always start with الحمد لله — it shows faith and contentment.' },
  { id: 'fm-s1-5', arabic: 'أنا يديد هني', roman: 'ana ydiid hini', english: "I'm new here", category: 'Workplace', type: 'phrase', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['أنا', 'يديد', 'هني'], culturalNote: 'Note: يديد (ydiid) is Gulf dialect for جديد (jadiid). The ج→ي shift is a key feature of Khaleeji Arabic.' },
  { id: 'fm-s1-6', arabic: 'تشرفنا', roman: 'tsharrafna', english: 'Honoured to meet you', category: 'Greetings', type: 'expression', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['تشرفنا'], culturalNote: 'Said after someone introduces themselves. Stronger and warmer than "nice to meet you".' },
  { id: 'fm-s1-7', arabic: 'الله يعافيك', roman: 'allaah y\'aafiik', english: 'May God give you strength', category: 'Greetings', type: 'expression', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['الله', 'يعافيك'], culturalNote: 'Said to someone who is working or about to start work. One of the most appreciated workplace phrases in Gulf culture. For a woman: الله يعافيج (allaah y\'aafich).' },
  { id: 'fm-s1-8', arabic: 'يلا، بالتوفيق', roman: 'yalla, bit-tawfiiq', english: 'Come on, good luck', category: 'Everyday', type: 'expression', difficulty: 'basic', scenarioSource: 'first-morning', wordTiles: ['يلا،', 'بالتوفيق'], culturalNote: 'Casual encouragement. يلا is the most versatile word in Gulf Arabic. بالتوفيق specifically blesses someone\'s effort.' },

  // ── SCENARIO: GYM CONSULTATION ──
  { id: 'gym-1', arabic: 'استشارة', roman: 'istishaara', english: 'Consultation', category: 'Workplace', type: 'vocab', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-2', arabic: 'أنحف', roman: 'anhaf', english: 'To lose weight / get thinner', category: 'Everyday', type: 'vocab', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-3', arabic: 'إصابات', roman: 'isaabaat', english: 'Injuries', category: 'Everyday', type: 'vocab', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-4', arabic: 'حديد', roman: 'hadiid', english: 'Weights (literally: iron)', category: 'Everyday', type: 'vocab', difficulty: 'basic', scenarioSource: 'gym-consultation', culturalNote: 'In the Gulf, "playing iron" (yil\'ab hadiid) is the standard way to say weightlifting.' },
  { id: 'gym-5', arabic: 'باقات', roman: 'baagaat', english: 'Packages / Bundles', category: 'Workplace', type: 'vocab', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-6', arabic: 'مجانا', roman: 'majjaanan', english: 'For free', category: 'Everyday', type: 'vocab', difficulty: 'basic', scenarioSource: 'gym-consultation' },
  { id: 'gym-7', arabic: 'أبشر', roman: 'abshir', english: 'Consider it done / Good news', category: 'Social', type: 'expression', difficulty: 'intermediate', scenarioSource: 'gym-consultation', culturalNote: 'A powerful word of commitment. When someone says "abshir", they are giving you their word with joy.' },
  { id: 'gym-8', arabic: 'تفضل اقعد', roman: 'tfaddal ig\'ad', english: 'Please, have a seat', category: 'Hospitality', type: 'phrase', difficulty: 'basic', scenarioSource: 'gym-consultation' },
  { id: 'gym-9', arabic: 'كم وزنك الحين؟', roman: 'kam waznak al-hin?', english: 'How much is your weight now?', category: 'Everyday', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-10', arabic: 'خلنا نبدا خفيف', roman: 'khallina nibda khafiif', english: "Let's start light", category: 'Everyday', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-11', arabic: 'أقترح لك', roman: 'agtarih lak', english: 'I suggest to you', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },
  { id: 'gym-12', arabic: 'أحسن سعر', roman: 'ahsan si\'r', english: 'Best price', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'gym-consultation' },

  // ── SCENARIO: THE CHECKUP ──
  { id: 'checkup-1', arabic: 'تفضلي معي', roman: 'tfaddali ma\'i', english: 'Come with me please (to a female)', category: 'Hospitality', type: 'phrase', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"ti-FAD-da-li ma-\'i" — تفضلي is the feminine form. Never say "تابعيني" (follow me) to a patient.', culturalNote: 'Polite way to guide someone in a clinic, hotel, or office.' },
  { id: 'checkup-2', arabic: 'كم طولك؟', roman: 'kam toolak?', english: "What's your height?", category: 'Workplace', type: 'phrase', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"kam TOO-lak" — كم (kam) = how much/many. For a female patient: كم طولج (kam toolich).', culturalNote: 'كم is used for any measurement question in Gulf Arabic — كم عمرك (age), كم وزنك (weight).' },
  { id: 'checkup-3', arabic: 'قفي على الميزان', roman: 'giffi \'ala al-miizaan', english: 'Stand on the scale (to a female)', category: 'Workplace', type: 'phrase', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"gif-fi \'a-la al-mii-ZAAN" — قفي becomes "giffi" in Khaleeji. الميزان = the scale.', culturalNote: 'قف/gif is a gentle imperative. Add لو سمحت (please) when uncertain of the register.' },
  { id: 'checkup-4', arabic: 'خليني أقيس ضغطك', roman: 'khallini agiis daghtak', english: 'Let me check your blood pressure', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'the-checkup', pronTip: '"khal-LI-ni A-giis DAGH-tak" — خليني = let me. أقيس = I measure. For a female patient: ضغطج (daghtech).', culturalNote: 'Always announce before touching a patient. This phrase signals respect and gives the person a moment to prepare.' },
  { id: 'checkup-5', arabic: 'استرخي شوي', roman: 'istarkhi shway', english: 'Relax a little (to a female)', category: 'Everyday', type: 'expression', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"is-TAR-khi SHWAI" — استرخي = relax (imperative for female). شوي = a little.', culturalNote: 'Works beyond clinics — use any time someone looks anxious or tense.' },
  { id: 'checkup-6', arabic: 'عندك حساسية من شي؟', roman: '\'indak hasaasiyya min shay?', english: 'Are you allergic to anything?', category: 'Workplace', type: 'phrase', difficulty: 'intermediate', scenarioSource: 'the-checkup', pronTip: '"\'in-DAK ha-SA-siy-YA min SHAY" — عندك = do you have. For a female patient: عندج (\'indich).', culturalNote: 'حساسية literally means "sensitivity" — it covers both allergies and strong reactions.' },
  { id: 'checkup-7', arabic: 'كل شي تمام', roman: 'kul shay tamaam', english: 'Everything is fine', category: 'Workplace', type: 'expression', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"KUL SHAY ta-MAAM" — كل شي = everything. تمام = perfect/fine.', culturalNote: 'Universal reassurance in Gulf Arabic — medical, professional, or social.' },
  { id: 'checkup-8', arabic: 'الله يشافيك', roman: 'allaah yishaafiik', english: 'May God heal you', category: 'Social', type: 'expression', difficulty: 'basic', scenarioSource: 'the-checkup', pronTip: '"al-LAH yi-SHAA-fiik" — from شفاء (healing). For a female: الله يشافيج (allaah yishaafiich).', culturalNote: 'One of the most meaningful phrases in Gulf Arabic — said to anyone who is sick. Tells a patient they are more than a file number.' },
];

// ─── Category metadata ───────────────────────────────────────────────────────
export const PHRASE_CATEGORIES: PhraseCategory[] = ['Greetings', 'Gratitude', 'Hospitality', 'Workplace', 'Social', 'Everyday', 'Food & Drink', 'Family'];

export const getCategoryColors = (C: ThemeColors): Record<string, string> => ({
  All: C.GOLD,
  Greetings: C.JADE2,
  Gratitude: C.GOLD2,
  Hospitality: C.VIOLET2,
  Workplace: C.JADE3,
  Social: C.ERROR,
  Everyday: C.VIOLET2,
  'Food & Drink': C.GOLD3,
  Family: C.VIOLET2,
});

export const getDifficultyColors = (C: ThemeColors): Record<string, string> => ({
  basic: C.JADE2,
  intermediate: C.GOLD,
  advanced: C.ERROR,
});

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
