import { C } from '../components/design/tokens';
import type { Scenario, ScenarioScript } from '../types';

// ─── Scenario catalog (used by ScenariosScreen + HomeScreen) ─────────────────
export const CAREER_SCENARIOS: Scenario[] = [
  {
    id: 'coffee-invitation', iconName: 'Coffee',
    title: 'The Coffee Invitation', subtitle: 'Build trust with your Emirati colleague',
    decisions: 10, endings: 5, phrases: '20+', level: 'Beginner', locked: false,
    color: C.GOLD, gradientColors: ['#1A0F0A', '#0D0608'],
    arabicScene: 'قهوة', mode: 'career',
  },
  {
    id: 'hotel-guest', iconName: 'Building2',
    title: 'VIP Guest Arrival', subtitle: 'Welcome a local dignitary to your hotel',
    decisions: 8, endings: 4, phrases: '18+', level: 'Intermediate', locked: false,
    color: C.JADE2, gradientColors: ['#0A1A14', '#050F0A'],
    arabicScene: 'فندق', mode: 'career',
  },
  {
    id: 'office-meeting', iconName: 'Briefcase',
    title: 'The First Introduction', subtitle: 'Make a lasting impression at a formal meeting',
    decisions: 12, endings: 5, phrases: '25+', level: 'Intermediate', locked: true,
    color: C.VIOLET2, gradientColors: ['#110A1C', '#080510'],
    arabicScene: 'اجتماع', mode: 'career',
  },
  {
    id: 'ramadan-shift', iconName: 'Moon',
    title: 'Ramadan Respect', subtitle: 'Navigate the holy month with grace',
    decisions: 8, endings: 3, phrases: '22+', level: 'Advanced', locked: true,
    color: '#8B7FE0', gradientColors: ['#0D0A1A', '#080510'],
    arabicScene: 'رمضان', mode: 'career',
  },
];

export const SOCIAL_SCENARIOS: Scenario[] = [
  {
    id: 'cafe-friends', iconName: 'Coffee',
    title: 'Café Connection', subtitle: 'Strike up a conversation with a local',
    decisions: 8, endings: 4, phrases: '15+', level: 'Beginner', locked: false,
    color: C.JADE2, gradientColors: ['#0A1810', '#050C08'],
    arabicScene: 'مقهى', mode: 'social',
  },
  {
    id: 'eid-greeting', iconName: 'Users',
    title: 'Eid Greetings', subtitle: 'Celebrate the holy day with neighbours',
    decisions: 6, endings: 3, phrases: '12+', level: 'Beginner', locked: false,
    color: C.GOLD, gradientColors: ['#1A140A', '#0D0A05'],
    arabicScene: 'عيد', mode: 'social',
  },
  {
    id: 'weekend-invite', iconName: 'Users',
    title: 'Desert Gathering', subtitle: 'Invited to a family outing outside the city',
    decisions: 10, endings: 5, phrases: '20+', level: 'Intermediate', locked: true,
    color: '#E07C4A', gradientColors: ['#1A0F08', '#0D0805'],
    arabicScene: 'صحراء', mode: 'social',
  },
  {
    id: 'neighborhood', iconName: 'ShoppingBag',
    title: 'Market Day', subtitle: 'Navigate a local souk with confidence',
    decisions: 7, endings: 4, phrases: '16+', level: 'Intermediate', locked: true,
    color: C.VIOLET2, gradientColors: ['#0F0A1A', '#080510'],
    arabicScene: 'سوق', mode: 'social',
  },
];

export const ALL_SCENARIOS = [...CAREER_SCENARIOS, ...SOCIAL_SCENARIOS];

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find(s => s.id === id);
}

export function getFeaturedScenario(): Scenario {
  return CAREER_SCENARIOS[0];
}

// ─── Scenario scripts (dialogue trees) ───────────────────────────────────────
export const SCENARIO_SCRIPTS: Record<string, ScenarioScript> = {
  'coffee-invitation': {
    id: 'coffee-invitation',
    title: 'The Coffee Invitation',
    scenes: [
      {
        id: 'scene1', charName: 'Ahmed', setting: 'Office — break room',
        arabic: 'يلا نشرب قهوة؟', roman: 'Yalla nishrab gahwa?', english: 'Come on, shall we grab some coffee?',
        choices: [
          { id: 'a', text: 'Love to — just let me finish this email', impact: { trust: -12, respect: -10, culture: -8 }, note: 'Prioritising tasks over an invitation signals you don\'t value the relationship.', outcome: 'bad' },
          { id: 'b', text: 'شكراً! إن شاء الله', arabic: 'شكراً! إن شاء الله', roman: 'Shukran! Inshallah', impact: { trust: 15, respect: 20, culture: 25 }, note: '"Inshallah" used sincerely shows cultural fluency and genuine respect.', outcome: 'good' },
          { id: 'c', text: 'Sure, but I only have 5 minutes', impact: { trust: -8, respect: -18, culture: -12 }, note: 'Rushing a coffee invitation is seen as disrespectful. Coffee is a ritual of bonding.', outcome: 'bad' },
          { id: 'd', text: 'يلا! الله يبارك فيك', arabic: 'يلا! الله يبارك فيك', roman: 'Yalla! Allah ybarik feek', impact: { trust: 30, respect: 26, culture: 36 }, note: 'Enthusiastic Arabic response AND invoking a blessing shows cultural mastery.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Ahmed', setting: 'Coffee corner — relaxed',
        arabic: 'تريد قهوة عربية ولا نسكافيه؟', roman: 'Tureed gahwa arabiya willa Nescafe?', english: 'Would you like Arabic coffee or Nescafé?',
        choices: [
          { id: 'a', text: "Just water — I'm not really a coffee person", impact: { trust: -18, respect: -20, culture: -16 }, note: 'Refusing a hospitality offer means rejecting the person, not just the drink.', outcome: 'bad' },
          { id: 'b', text: 'Nescafé please', impact: { trust: 5, respect: 0, culture: 2 }, note: 'Neutral — you accepted which is good, but no cultural connection was made.', outcome: 'neutral' },
          { id: 'c', text: "Whatever you're having — أنا معك", arabic: 'أنا معك', roman: "Ana ma'ak", impact: { trust: 24, respect: 20, culture: 22 }, note: '"Ana ma\'ak" (I\'m with you) shows deference to your host.', outcome: 'good' },
          { id: 'd', text: 'قهوة عربية — ما شاء الله على ريحتها', arabic: 'قهوة عربية — ما شاء الله', roman: 'Gahwa arabiya — Masha Allah', impact: { trust: 34, respect: 28, culture: 40 }, note: '"Masha Allah" on the aroma shows you appreciate the ritual itself.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Ahmed', setting: 'Coffee corner — deeper conversation',
        arabic: 'عندك أهل هنا ولا في البر؟', roman: "Indak ahal hna willa fil barr?", english: 'Do you have family here or back home?',
        choices: [
          { id: 'a', text: 'I prefer not to discuss personal things at work', impact: { trust: -26, respect: -18, culture: -22 }, note: 'Family questions are foundational, not personal, in Emirati culture.', outcome: 'bad' },
          { id: 'b', text: 'Back home — I miss them a lot', impact: { trust: 14, respect: 12, culture: 10 }, note: 'Expressing that you miss your family shows loyalty — a deeply admired value.', outcome: 'good' },
          { id: 'c', text: 'Back home. وأنت؟ عيالك بخير؟', arabic: 'وأنت؟ عيالك بخير؟', roman: "Wa inta? 'Eeyalik bikhair?", impact: { trust: 30, respect: 26, culture: 30 }, note: 'Asking "are your children well?" shows you understand family is the centre of Emirati life.', outcome: 'good' },
          { id: 'd', text: 'الحمد لله — they are back home but always in my heart', arabic: 'الحمد لله', roman: 'Alhamdulillah', impact: { trust: 40, respect: 36, culture: 42 }, note: '"Alhamdulillah" shows faith and contentment. Combined with family devotion, this builds deep trust.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 320, title: 'Family Partnership', arabic: 'أنت من أهلنا', roman: 'Inta min ahlna', en: "You're one of us now", desc: 'Ahmed invites you to meet his family. You\'ve crossed from colleague to friend.', color: C.GOLD, type: 'exceptional' },
      { min: 220, title: 'Job Referral', arabic: 'إن شاء الله خير', roman: 'Inshallah khair', en: 'God willing, only good things', desc: 'Ahmed mentions a great opening and says he\'ll personally recommend you.', color: C.JADE2, type: 'success' },
      { min: 120, title: 'Transactional Colleague', arabic: 'زين، شوف', roman: "Zain, shoof", en: "OK, we'll see", desc: 'A pleasant chat but the relationship stays professional.', color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Missed Connection', arabic: 'بكرة إن شاء الله', roman: "Bukra inshallah", en: "Tomorrow, God willing", desc: 'Cultural missteps created distance. Ahmed politely closes the conversation.', color: '#E07070', type: 'failed' },
    ],
  },

  'hotel-guest': {
    id: 'hotel-guest',
    title: 'VIP Guest Arrival',
    scenes: [
      {
        id: 'scene1', charName: 'Sheikh Khalid', setting: 'Hotel lobby — grand entrance',
        arabic: 'السلام عليكم', roman: 'Assalamu alaikum', english: 'Peace be upon you.',
        choices: [
          { id: 'a', text: 'Hello! Welcome to the hotel', impact: { trust: -10, respect: -14, culture: -12 }, note: 'Not returning the Islamic greeting when offered is seen as dismissive.', outcome: 'bad' },
          { id: 'b', text: 'وعليكم السلام — welcome, sir', arabic: 'وعليكم السلام', roman: "Wa alaikum assalam", impact: { trust: 18, respect: 22, culture: 20 }, note: 'Returning the greeting properly shows basic cultural respect.', outcome: 'good' },
          { id: 'c', text: 'Hi there — do you have a reservation?', impact: { trust: -16, respect: -22, culture: -18 }, note: 'Jumping to business without a proper greeting is deeply disrespectful to an Emirati guest.', outcome: 'bad' },
          { id: 'd', text: 'وعليكم السلام ورحمة الله — تفضل يا شيخنا', arabic: 'وعليكم السلام ورحمة الله — تفضل يا شيخنا', roman: "Wa alaikum assalam wa rahmatullah — tafaddal ya shaikhna", impact: { trust: 34, respect: 36, culture: 38 }, note: 'The full greeting plus "tafaddal ya shaikhna" (please, our Sheikh) is deeply honoring.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Sheikh Khalid', setting: 'Hotel lobby — walking to reception',
        arabic: 'الغرفة جاهزة؟ عندي ضيوف يوصلون الحين', roman: "Al ghurfa jahza? Indi dhuyoof yoosaloon alheen", english: 'Is the room ready? I have guests arriving soon.',
        choices: [
          { id: 'a', text: 'Let me check the system… one moment', impact: { trust: -6, respect: -10, culture: -8 }, note: 'Making a VIP wait while you check systems feels impersonal. Reassurance first, details second.', outcome: 'neutral' },
          { id: 'b', text: 'إن شاء الله — everything is prepared for you', arabic: 'إن شاء الله', roman: 'Inshallah', impact: { trust: 20, respect: 18, culture: 24 }, note: '"Inshallah" reassures while maintaining cultural tone. The guest feels prioritized.', outcome: 'good' },
          { id: 'c', text: 'It should be. Check-in isn\'t until 3 PM though', impact: { trust: -20, respect: -24, culture: -16 }, note: 'Citing policy to a VIP guest is a serious faux pas. Flexibility and generosity are expected.', outcome: 'bad' },
          { id: 'd', text: 'تفضل — كل شي جاهز والله. ضيوفك على الراس', arabic: 'كل شي جاهز والله. ضيوفك على الراس', roman: "Kil shay jahiz wallah. Dhuyoofak ala alras", impact: { trust: 36, respect: 32, culture: 38 }, note: '"Your guests are on our heads" — the highest form of hospitality, pledging personal honor.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Sheikh Khalid', setting: 'Hotel suite — before departure',
        arabic: 'ما قصرت. شكراً لك', roman: "Ma gassart. Shukran lak", english: 'You didn\'t fall short. Thank you.',
        choices: [
          { id: 'a', text: 'No problem. Have a nice stay!', impact: { trust: 4, respect: 2, culture: 0 }, note: 'Polite but generic. A missed opportunity to deepen the connection.', outcome: 'neutral' },
          { id: 'b', text: 'الله يخليك — it\'s our pleasure', arabic: 'الله يخليك', roman: "Allah yakhalik", impact: { trust: 22, respect: 20, culture: 24 }, note: '"God preserve you" is a warm, culturally resonant reply to gratitude.', outcome: 'good' },
          { id: 'c', text: 'Don\'t forget to fill out the feedback form!', impact: { trust: -18, respect: -20, culture: -14 }, note: 'Asking for a review trivializes a genuine expression of thanks. Transactional, not relational.', outcome: 'bad' },
          { id: 'd', text: 'هذا واجبنا يا شيخنا — بيتك بيتنا دايماً', arabic: 'هذا واجبنا — بيتك بيتنا دايماً', roman: "Hatha wajibna ya shaikhna — baitak baitna dayman", impact: { trust: 40, respect: 38, culture: 42 }, note: '"This is our duty — your house is our house always." You\'ve made the hotel feel like home.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 320, title: 'Royal Patron', arabic: 'نعم الخدمة', roman: 'Ni\'am al khidma', en: 'What excellent service', desc: 'Sheikh Khalid requests you personally for every future visit. You\'ve earned a lifelong patron.', color: C.GOLD, type: 'exceptional' },
      { min: 220, title: 'Glowing Review', arabic: 'ما شاء الله عليك', roman: "Masha Allah alaik", en: 'God has blessed you with skill', desc: 'The Sheikh tells management he was deeply impressed. You receive a commendation.', color: C.JADE2, type: 'success' },
      { min: 120, title: 'Professional Service', arabic: 'مشكور', roman: "Mashkoor", en: "Thank you", desc: 'A polite stay, but no personal connection was made. Just another hotel.', color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Formal Complaint', arabic: 'الله يهديك', roman: "Allah yahdik", en: "May God guide you", desc: 'Cultural missteps left a poor impression. The Sheikh speaks to your manager.', color: '#E07070', type: 'failed' },
    ],
  },

  'cafe-friends': {
    id: 'cafe-friends',
    title: 'Café Connection',
    scenes: [
      {
        id: 'scene1', charName: 'Fatima', setting: 'Local café — adjacent tables',
        arabic: 'هل هذا الكرسي فاضي؟', roman: "Hal hatha al kursi fadhi?", english: 'Is this chair free?',
        choices: [
          { id: 'a', text: 'Yeah, go ahead', impact: { trust: 2, respect: 0, culture: -4 }, note: 'Functional but cold. In Emirati culture, a stranger asking is an invitation to connect.', outcome: 'neutral' },
          { id: 'b', text: 'أهلاً وسهلاً — تفضلي', arabic: 'أهلاً وسهلاً — تفضلي', roman: "Ahlan wa sahlan — tafaddali", impact: { trust: 28, respect: 24, culture: 30 }, note: '"Welcome and be at ease — please sit" uses the feminine form correctly and shows warmth.', outcome: 'excellent' },
          { id: 'c', text: 'Sorry, I\'m saving it for someone', impact: { trust: -14, respect: -10, culture: -12 }, note: 'Refusing a simple request from a stranger comes across as unwelcoming.', outcome: 'bad' },
          { id: 'd', text: 'Sure! تفضلي', arabic: 'تفضلي', roman: "Tafaddali", impact: { trust: 18, respect: 16, culture: 20 }, note: '"Tafaddali" (please, to a woman) is a lovely touch that shows cultural awareness.', outcome: 'good' },
        ],
      },
      {
        id: 'scene2', charName: 'Fatima', setting: 'Local café — sharing the table',
        arabic: 'أنتِ من وين؟ أول مرة أشوفك هنا', roman: "Inti min wain? Awwal marra ashofik hina", english: 'Where are you from? First time I\'ve seen you here.',
        choices: [
          { id: 'a', text: 'I\'d rather not say — I like my privacy', impact: { trust: -20, respect: -16, culture: -18 }, note: 'Refusing to share basic information comes across as suspicious, not private.', outcome: 'bad' },
          { id: 'b', text: 'I\'m from [country] — just moved here recently', impact: { trust: 12, respect: 10, culture: 8 }, note: 'Honest and friendly, but you missed a chance to reciprocate with curiosity about her.', outcome: 'good' },
          { id: 'c', text: 'أنا من [بلد] — المكان حلو ما شاء الله', arabic: 'المكان حلو ما شاء الله', roman: "Ana min [balad] — al makan hilu masha Allah", impact: { trust: 24, respect: 22, culture: 28 }, note: 'Complimenting the place with "masha Allah" shows you appreciate local culture.', outcome: 'good' },
          { id: 'd', text: 'أنا جديدة هنا — وأنتِ؟ من أهل المنطقة؟', arabic: 'أنا جديدة هنا — وأنتِ؟ من أهل المنطقة؟', roman: "Ana jdida hina — wa inti? Min ahl al mantiga?", impact: { trust: 32, respect: 30, culture: 34 }, note: 'Sharing, then asking if she\'s from the area shows reciprocal interest — the foundation of friendship.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Fatima', setting: 'Local café — saying goodbye',
        arabic: 'كان ودي أكمل سوالف بس لازم أروح. نتواصل؟', roman: "Kan widdi akammil sawalif bas lazim aruh. Nitwasal?", english: 'I\'d love to keep chatting but I have to go. Shall we stay in touch?',
        choices: [
          { id: 'a', text: 'Maybe — I\'m pretty busy these days', impact: { trust: -16, respect: -12, culture: -14 }, note: 'Hedging a sincere offer of friendship is hurtful. In Emirati culture, connection is a gift.', outcome: 'bad' },
          { id: 'b', text: 'Sure! Here\'s my number', impact: { trust: 14, respect: 12, culture: 10 }, note: 'Willing but brief. A warmer farewell would seal the connection.', outcome: 'good' },
          { id: 'c', text: 'إن شاء الله! تشرفنا يا فاطمة', arabic: 'تشرفنا يا فاطمة', roman: "Inshallah! Tasharrafna ya Fatima", impact: { trust: 26, respect: 28, culture: 30 }, note: '"We are honored, Fatima" — using her name with this phrase feels genuinely warm.', outcome: 'good' },
          { id: 'd', text: 'أكيد! والله فرحانة إني عرفتك — في أمان الله', arabic: 'والله فرحانة إني عرفتك — في أمان الله', roman: "Akeed! Wallahi farhana ini araftik — fi aman Allah", impact: { trust: 38, respect: 34, culture: 40 }, note: '"Truly happy I met you — in God\'s protection." A heartfelt Arabic farewell that creates lasting bonds.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 320, title: 'Lifelong Friend', arabic: 'صديقتي العزيزة', roman: "Sadiqati al aziza", en: 'My dear friend', desc: 'Fatima invites you to her family gathering next weekend. A true friendship is born.', color: C.GOLD, type: 'exceptional' },
      { min: 220, title: 'Coffee Companion', arabic: 'نتقابل مرة ثانية', roman: "Nitgabal marra thanya", en: "Let's meet again", desc: 'You exchange numbers and plan to meet at the same café next week.', color: C.JADE2, type: 'success' },
      { min: 120, title: 'Passing Acquaintance', arabic: 'يلا مع السلامة', roman: "Yalla ma\'a salama", en: 'Goodbye then', desc: 'A pleasant conversation, but no real connection was formed.', color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Awkward Exit', arabic: 'الله يسهلك', roman: "Allah yisahlik", en: 'May God ease your way', desc: 'Fatima politely leaves early. The cultural gap felt too wide to bridge.', color: '#E07070', type: 'failed' },
    ],
  },

  'eid-greeting': {
    id: 'eid-greeting',
    title: 'Eid Greetings',
    scenes: [
      {
        id: 'scene1', charName: 'Uncle Rashid', setting: 'Neighbourhood — Eid morning',
        arabic: 'عيدكم مبارك! تعالوا عندنا', roman: "Eidkum mubarak! Ta\'alu indna", english: 'Blessed Eid to you! Come visit us.',
        choices: [
          { id: 'a', text: 'Thanks! Maybe later — I have plans', impact: { trust: -14, respect: -18, culture: -16 }, note: 'Declining an Eid invitation is like refusing a family embrace. This day is about togetherness.', outcome: 'bad' },
          { id: 'b', text: 'عيدكم مبارك! إن شاء الله', arabic: 'عيدكم مبارك', roman: 'Eidkum mubarak! Inshallah', impact: { trust: 18, respect: 20, culture: 22 }, note: 'Returning the greeting warmly shows respect for the occasion.', outcome: 'good' },
          { id: 'c', text: 'Happy holidays to you too!', impact: { trust: -4, respect: -8, culture: -10 }, note: '"Happy holidays" is generic. Eid has a specific greeting that should be used.', outcome: 'neutral' },
          { id: 'd', text: 'عيدكم مبارك وعساكم من عواده! تشرفنا والله', arabic: 'عيدكم مبارك وعساكم من عواده', roman: "Eidkum mubarak wa asakum min uwwadah! Tasharrafna wallah", impact: { trust: 34, respect: 32, culture: 40 }, note: '"May you celebrate it again" is the traditional follow-up. Combined with "we\'re honored" — masterful.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene2', charName: 'Uncle Rashid', setting: 'Rashid\'s home — living room',
        arabic: 'تفضل — هذي حلويات العيد. ذوق', roman: "Tafaddal — hathi halawiyat al eid. Dhoog", english: 'Please — these are Eid sweets. Try some.',
        choices: [
          { id: 'a', text: 'No thanks, I\'m watching my sugar intake', impact: { trust: -18, respect: -22, culture: -20 }, note: 'Refusing Eid sweets is like refusing the celebration itself. Always accept hospitality.', outcome: 'bad' },
          { id: 'b', text: 'Thank you! They look delicious', impact: { trust: 10, respect: 8, culture: 6 }, note: 'Accepting is good, but the response is too plain for such a generous moment.', outcome: 'neutral' },
          { id: 'c', text: 'بسم الله — يسلموا إيديك يا عمي', arabic: 'يسلموا إيديك يا عمي', roman: "Bismillah — yislamu ideik ya ammi", impact: { trust: 28, respect: 30, culture: 32 }, note: '"Bismillah" before eating + "bless your hands, uncle" — pure cultural fluency.', outcome: 'good' },
          { id: 'd', text: 'بسم الله — ما شاء الله! مين سوّاها؟ الله يعطيكم العافية', arabic: 'ما شاء الله! مين سوّاها؟ الله يعطيكم العافية', roman: "Bismillah — masha Allah! Min sawwaha? Allah ya\'tikum al afya", impact: { trust: 38, respect: 36, culture: 42 }, note: 'Saying Bismillah, praising with masha Allah, asking who made them, then blessing — this is Eid perfection.', outcome: 'excellent' },
        ],
      },
      {
        id: 'scene3', charName: 'Uncle Rashid', setting: 'Rashid\'s doorstep — farewell',
        arabic: 'الله يبارك فيك. بيتنا بيتك دايماً', roman: "Allah ybarik feek. Baitna baitak dayman", english: 'God bless you. Our home is always your home.',
        choices: [
          { id: 'a', text: 'Thanks! See you around', impact: { trust: -8, respect: -12, culture: -10 }, note: 'A casual goodbye after such warmth feels dismissive.', outcome: 'bad' },
          { id: 'b', text: 'الله يبارك فيك — شكراً على كرمكم', arabic: 'شكراً على كرمكم', roman: "Allah ybarik feek — shukran ala karamkum", impact: { trust: 20, respect: 22, culture: 24 }, note: 'Thanking their generosity while returning the blessing is respectful.', outcome: 'good' },
          { id: 'c', text: 'That was really nice, thank you so much', impact: { trust: 8, respect: 6, culture: 4 }, note: 'Sincere but lacking the Arabic reciprocity that deepens the bond.', outcome: 'neutral' },
          { id: 'd', text: 'جزاكم الله خير — أنتم أهلي هنا والله. كل عام وأنتم بخير', arabic: 'جزاكم الله خير — أنتم أهلي هنا. كل عام وأنتم بخير', roman: "Jazakum Allah khair — intum ahli hna wallah. Kil aam wa intum bikhair", impact: { trust: 40, respect: 38, culture: 44 }, note: '"May God reward you — you are my family here. May every year find you well." You\'ve become part of the neighbourhood.', outcome: 'excellent' },
        ],
      },
    ],
    endings: [
      { min: 320, title: 'Adopted Family', arabic: 'أنت ولدنا', roman: "Inta waldna", en: 'You are our child', desc: 'Uncle Rashid declares you family. You\'ll never spend another Eid alone.', color: C.GOLD, type: 'exceptional' },
      { min: 220, title: 'Neighbourhood Welcome', arabic: 'أهلاً فيك دايماً', roman: "Ahlan feek dayman", en: 'Always welcome', desc: 'Rashid tells the neighbours about you. Doors open wherever you go.', color: C.JADE2, type: 'success' },
      { min: 120, title: 'Polite Visitor', arabic: 'تفضل وقت ما تبي', roman: "Tafaddal wagt ma tabi", en: 'Come whenever you like', desc: 'A nice visit, but it felt more like a courtesy call than a connection.', color: C.VIOLET2, type: 'mixed' },
      { min: 0, title: 'Missed Blessing', arabic: 'الله كريم', roman: "Allah kareem", en: 'God is generous', desc: 'Uncle Rashid smiles politely, but the warmth never fully reached you.', color: '#E07070', type: 'failed' },
    ],
  },
};

export function getScenarioScript(id: string): ScenarioScript | undefined {
  return SCENARIO_SCRIPTS[id];
}
