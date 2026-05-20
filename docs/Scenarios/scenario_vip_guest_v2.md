# Scenario: The VIP Guest (الضيف الكبير)

## Mode: Career
## Difficulty: Advanced
## Category: Hospitality — VIP Protocol

---

# SCENE 1: The Arrival (الوصول)

**Setting tag:** `Five-star hotel lobby — Dubai, Wednesday 4:30 PM`
**Duration:** ~8 minutes
**Turns:** 6 (+ 1 bonus for secret ending)
**Difficulty:** Advanced — choices are genuinely ambiguous, not obviously right/wrong

---

## CHARACTER

```
Name:        خالد المزروعي (Khaled Al Mazrouei)
Gender:      Male
Nationality: Emirati
Age:         Mid-50s
Background:  Undersecretary at a UAE federal ministry (وكيل وزارة).
             Frequent guest — 6-8 visits per year.
             Travels with one assistant: طارق (Tariq), Jordanian.
             Has stayed in hotels across the Gulf for 25 years.
             Knows exactly what five-star service looks like.
             Won't raise his voice. Won't complain loudly.
             He simply does — or does not — return.
Personality: Composed, precise, warm when respected, distant when not

HONORIFIC SYSTEM — CRITICAL FOR THIS SCENARIO:
UAE protocol assigns honorifics by rank, not by general formality.
Using the wrong one tells the official you either didn't prepare
or don't know protocol.

  معالي (ma'ali)      = Ministers and above — "His Excellency (Minister)"
  سعادة (sa'aada)    = Undersecretaries, Directors-General
                       Formal address: سعادتكم (sa'adatakum)
                       Reference: سعادته (sa'aadatih — "His Excellency")
  سيدي (sayyidi)     = General respectful sir — acceptable but generic
  أخي (akhi)         = Informal brother — inappropriate for this context

Khaled's rank: وكيل وزارة → correct form = سعادتكم
Using معالي = promoting him incorrectly (insult, not compliment)
Using سيدي = acceptable but shows no protocol knowledge
Using سعادتكم = shows you prepared specifically for him

ASSISTANT CHARACTER:
Name:        طارق (Tariq)
Nationality: Jordanian
Dialect:     Levantine Arabic — users hear a different dialect
             through the assistant in Bonus Turn 7
             Says "بدي" (biddi) for "I want" — Levantine
             Says "كيفك" (kifak) not "شلونك" — Levantine greeting
             Speaks formally because he's in a professional role
```

---

## GUEST PROFILE (shown to user at scenario start)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUEST PROFILE — CONFIDENTIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:         خالد المزروعي
Title:        وكيل وزارة (Undersecretary)
              Address as: سعادتكم
Frequency:    Returning guest (6th visit this year)
Room:         Al Noor Suite (his regular)
Coffee:       قهوة عربية — هيل فقط، بدون زعفران
              (Arabic coffee — cardamom ONLY, no saffron)
Dates:        تمر من العين إن توفر
              (Al Ain dates if available)
Prayer:       Muslim — Qibla arrow and prayer times card required
Notes:        Guest values discretion. Any service issues
              resolved invisibly. Do not reference room status
              in front of guest.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

> **Why the guest profile is shown upfront:**
> In real five-star hotels, senior concierge staff receive a guest profile before
> VIP arrivals. Showing it to the user solves the Turn 3 information overload problem
> — they now have هيل (cardamom), تمر العين (Al Ain dates), and Qibla requirement
> in advance. The test becomes whether they USE that information proactively, not
> whether they guess it.

---

## BRANCHING LOGIC

```
        TURN 1 → TURN 2 → TURN 3 → TURN 4 → TURN 5 → TURN 6
                                                           │
                                                      Score Check
                                                           │
                                           ┌────── Flag Check ──────┐
                                           │                        │
                                     All 3 Flags             Partial/None
                                     + Score ≥ 28                   │
                                           │           ┌───────────┼───────────┐
                                     BONUS TURN 7    Score≥33  Score 5-32   Score<5
                                           │            │            │           │
                                     Secret Ending    Warm       Neutral       Cold


FLAGS:
  FLAG_1 = Turn 2 (Choice B) — Proactively upgrade WITHOUT being asked
           NOTE: This is a GOOD choice, not EXCELLENT — the flag is hidden
           in a lower-scoring option, requiring intentional deviation
  FLAG_2 = Turn 4 (Choice A) — Know AND offer Qibla + prayer times proactively
  FLAG_3 = Turn 5 (Choice A) — Say على راسي + give a concrete resolution

SCORING VALIDATION:
  Max possible score = 6 turns × max ~8 pts each = ~48
  Secret trigger: all 3 flags + score ≥ 28 (achievable even with FLAG_1's lower score)
  Warm trigger: score ≥ 33 (requires mostly excellent choices)
  Neutral: 5-32
  Cold: below 5
```

---

## PHRASE LIST (13 phrases + 1 bonus)

All phrases defined before writing any dialogue. Every phrase appears naturally.

| # | Arabic | Romanization | English | Context | Category |
|---|--------|-------------|---------|---------|----------|
| 1 | سَعَادَتِكُم | sa'adatakum | Your Excellency (Undersecretary) | Rank-specific. Not سيدي (generic). Not معالي (ministers only). Using this correctly signals protocol knowledge. | Workplace |
| 2 | شَرَّفْتُمُونَا | sharraftumuna | You honored us (plural formal) | VIP arrival welcome. Not "welcome" — "you HONORED us." Formal plural. | Greetings |
| 3 | عَلَى رَاسِي | 'ala raasi | On my head / I personally take responsibility | The ultimate service commitment. Stronger than أبشر. Used by senior staff for VIP requests. | Workplace |
| 4 | نَرْفَع لِكُم | narfa' likum | We'll upgrade for you | Service upgrade phrase. نرفع = we elevate. Used specifically for room upgrades. | Workplace |
| 5 | تَفَضَّلُوا فِي الصَّالَة | tafaddalu fis-saala | Please wait in the lounge (formal plural) | Directing a VIP with dignity. Never "wait over there." | Workplace |
| 6 | خِلَال دَقَايِق | khilaal dagaayig | Within minutes | Professional time commitment. Specific enough to reassure. | Workplace |
| 7 | هَيْل | heel | Cardamom | Arabic coffee spice. Gulf standard. Must know the difference from زعفران (saffron). | Food |
| 8 | قِبْلَة الصَّلَاة | gibla as-salaah | Direction of prayer | Every Muslim guest may need this. A trained concierge knows it from every room. | Culture |
| 9 | مَوَاقِيت الصَّلَاة | mawaaqiit as-salaah | Prayer times schedule | Offering the day's prayer times card proactively is five-star Gulf service. | Culture |
| 10 | الضَّوْضَاء تَعَبَتْنِي شْوَي | adh-dhawdaa' ta'abatni shway | The noise is tiring me a bit | RECOGNITION PHRASE. How a Gulf VIP complains indirectly. شوي = serious, not mild. Never treat this as "slightly." | Culture |
| 11 | نَأْسَف عَلَى الإِزْعَاج | na'saf 'alan-iz'aaj | We apologize for the inconvenience | Service recovery opener. Always leads with apology, never with explanation. | Workplace |
| 12 | كَيْف كَانَت إِقَامَتِكُم؟ | kayf kaanat igaamatikum? | How was your stay? (formal plural) | Departure check. More formal than "how was everything?" | Workplace |
| 13 | زِيَارَتِكُم نُور | ziyaratikum nuur | Your visit is a light | Formal farewell for distinguished guests. One of the most elegant closing phrases in Gulf hospitality. | Greetings |
| 🔓 | بِنَاءً عَلَى طَلَب سَعَادَتِه | binaa'an 'ala talab sa'aadatih | Based on His Excellency's request | SECRET BONUS. Formal phrase used when a senior official requests something specifically. | Workplace |

---

## TURN 1: The Arrival

### Setting tag
`Hotel lobby — main entrance, 4:32 PM`

### Context
Khaled Al Mazrouei enters through the main doors in a white kandura. His Jordanian assistant Tariq carries a briefcase. You're at the front desk. You've read his guest profile — you know his name, rank, room, coffee preference, and prayer requirements. He approaches.

*Khaled nods slightly as he approaches. He doesn't speak first. The greeting is yours to give.*

> **Cultural context:**
> In UAE VIP protocol, the host makes the first move. Khaled approaching the desk
> without speaking is not rudeness — it's a test. How you open tells him whether
> this visit will be pleasant or merely functional.

### Choices (4)

**Choice A — Correct honorific with formal welcome**
```
arabic:     أَهْلاً وَسَهْلاً بِسَعَادَتِكُم! شَرَّفْتُمُونَا. تَفَضَّلُوا
roman:      ahlan wa sahlan bi-sa'adatikum! sharraftumuna. tafaddalu
english:    Welcome, Your Excellency! You honored us. Please come
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
flag:       none
note:       "سعادتكم is correct for an Undersecretary — not سيدي, not معالي. You named his exact rank. شرفتمونا elevates the welcome beyond standard hotel language. Khaled's posture relaxes slightly. This is the greeting he receives from people who prepared."
```

**Choice B — Respectful but generic address**
```
arabic:     أَهْلاً وَسَهْلاً سَيِّدِي! مَرْحَبَا بِكُم. تَفَضَّلُوا
roman:      ahlan wa sahlan sayyidi! marhaba bikum. tafaddalu
english:    Welcome, sir! Hello and welcome. Please come
outcome:    good
impact:     { trust: +2, respect: +2, culture: +1 }
flag:       none
note:       "سيدي is respectful and acceptable. Khaled won't fault you. But you had his profile — you knew his rank. Using سيدي when سعادتكم was available signals either you didn't read the profile or you don't know UAE protocol. Professional gap, not an insult."
```

**Choice C — English greeting**
```
arabic:     وَلْكَم مِسْتَر خَالِد! وَلْكَم بَاك
roman:      welcome mister khalid! welcome back
english:    Welcome Mister Khalid! Welcome back (in English)
outcome:    neutral
impact:     { trust: +1, respect: 0, culture: 0 }
flag:       none
note:       "First name, in English. Khaled's profile says Undersecretary Al Mazrouei. Addressing a senior government official by first name in casual English at arrival sets a transactional tone for the stay."
```

**Choice D — Wrong honorific (معالي)**
```
arabic:     أَهْلاً وَسَهْلاً بِمَعَالِيكُم!
roman:      ahlan wa sahlan bima'aalikum!
english:    Welcome, Your Excellency (Minister-level) — incorrect rank
outcome:    bad
impact:     { trust: 0, respect: -2, culture: -2 }
flag:       none
note:       "معالي is for ministers and above. Khaled is an Undersecretary — سعادتكم. Using معالي for someone who hasn't reached that rank is a protocol error that tells him you confused your honorifics. Every government official knows their own correct form of address."
```

> **FIX NOTE — Trust 0 not +1 for Choice D:**
> Being addressed with the wrong honorific gives Khaled no reason to trust you more.
> The previous version had trust +1 here — corrected to 0.

### Phrases introduced: سعادتكم، شرفتمونا

---

## TURN 2: The Suite Delay ⭐ FLAG 1 HIDDEN HERE

### Setting tag
`Hotel lobby — front desk, 4:35 PM`

### Context
You pull up his reservation. His regular suite — Al Noor Suite — is not ready. Housekeeping needs 15 more minutes. He doesn't know this yet. The Presidential Suite is available and costs more — but the hotel can absorb it as a service recovery. You have a choice: act before he finds out, or manage it after.

> **Cultural context:**
> The guest never feels the problem. A proactive solution before he asks is invisible
> service recovery — the highest skill in Gulf VIP hospitality. An explanation after
> he notices is damage control.

### Character dialogue

**Warm** (score 6+):
```
Arabic:     أُمُورِي كُلّها جَاهِزَة؟
English:    Khaled: "Everything ready for me?"
```

**Neutral** (score 2-5):
```
Arabic:     الغُرْفَة جَاهِزَة؟
English:    Khaled: "Room ready?"
```

**Cold** (score below 2):
```
Arabic:     وَيْن الغُرْفَة؟
English:    Khaled: "Where's the room?"
```

### Choices (4)

**Choice A — Honest apology + professional waiting offer**
```
arabic:     نَأْسَف سَعَادَتِكُم — الجُنَاح مَا زَال جَاهِز. خِلَال خَمْسَتْعَشَر دَقِيقَة. تَفَضَّلُوا فِي الصَّالَة
roman:      na'saf sa'adatikum — al-junaah ma zaal jaahiz. khilaal khamista'shar dagiiga. tafaddalu fis-saala
english:    We apologize, Your Excellency — the suite isn't ready yet. Within fifteen minutes. Please wait in the lounge
outcome:    good
impact:     { trust: +2, respect: +2, culture: +1 }
flag:       none
note:       "Honest and polite. Correct honorific, proper direction. But you made him feel the failure — he now knows his suite wasn't ready. The apology is appropriate but the awareness costs something. He arrived expecting his room and will wait knowing there was a problem."
```

**⭐ Choice B — Proactive upgrade, guest never hears about the delay (FLAG 1)**
```
arabic:     سَعَادَتِكُم — لَقَّيْنَا لِكُم الجُنَاح الرِّئَاسِي حُرّ اليُوم. نَرْفَع لِكُم بِدُون زِيَادَة. تَفَضَّلُوا فِي الصَّالَة وَأَنَا أُوصِّلِكُم شَخْصِيَاً خِلَال عَشَر دَقَايِق
roman:      sa'adatikum — laggayna likum al-junaah ar-ri'aasi hurr al-yoom. narfa' likum biduun ziyaada. tafaddalu fis-saala w-ana uwassilikum shakhsiyyan khilaal 'ashar dagaayig
english:    Your Excellency — we found the Presidential Suite available today. We'll upgrade you at no extra charge. Please wait in the lounge and I'll escort you personally in ten minutes
outcome:    good
impact:     { trust: +2, respect: +3, culture: +2 }
flag:       sets FLAG_1 = true
note:       "Khaled never heard the word 'delay.' He heard 'Presidential Suite' and 'no extra charge' and 'I'll escort you personally.' You turned a service failure into a service gift. نرفع لكم is the professional upgrade phrase. This scores the same as Choice A overall — but what Khaled experienced is completely different."
```

> **⚙️ FLAG 1 DESIGN RATIONALE — THE KEY FIX:**
> Choice A scores +5 total. Choice B scores +7 total BUT sets FLAG_1.
> WAIT — let me recalculate: A = trust+2, respect+2, culture+1 = 5. B = trust+2, respect+3, culture+2 = 7.
> Choice B IS higher scoring. So FLAG_1 is on the higher scorer.
> For flag to require deviation: swap — make Choice A the upgrade (FLAG, +7) and Choice B
> the honest apology (+5, no flag). Restructuring:
>
> CORRECTED FLAG LOGIC FOR TURN 2:
> Choice A (upgrade proactively) = excellent, +8, FLAG_1
> Choice B (honest apology) = good, +5, no flag
> This means FLAG_1 IS on the highest scorer — but it's a deliberate ACTION choice
> (doing something proactive) vs a passive one (explaining). Users who don't think
> to upgrade will pick Choice B. FLAG_1 rewards initiative, not just politeness.
>
> See corrected choices below:

**CORRECTED TURN 2 CHOICES:**

**⭐ Choice A — Proactive upgrade, guest never hears about the delay (FLAG 1)**
```
arabic:     سَعَادَتِكُم — لَقَّيْنَا لِكُم الجُنَاح الرِّئَاسِي حُرّ اليُوم. نَرْفَع لِكُم بِدُون زِيَادَة. تَفَضَّلُوا فِي الصَّالَة وَأَنَا أُوصِّلِكُم شَخْصِيَاً خِلَال عَشَر دَقَايِق
roman:      sa'adatikum — laggayna likum al-junaah ar-ri'aasi hurr al-yoom. narfa' likum biduun ziyaada. tafaddalu fis-saala w-ana uwassilikum shakhsiyyan khilaal 'ashar dagaayig
english:    Your Excellency — the Presidential Suite is available today. We'll upgrade you at no extra charge. Please wait in the lounge and I'll escort you personally in ten minutes
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
flag:       sets FLAG_1 = true
note:       "Khaled never heard 'delay.' He heard 'Presidential Suite,' 'no extra charge,' 'escort you personally.' نرفع لكم is the upgrade phrase. تفضلوا في الصالة directs him with dignity. In Gulf VIP hospitality, invisible problem-solving is the highest skill. The failure happened — what matters is whether Khaled ever experienced it."
```

**Choice B — Honest apology + professional waiting offer**
```
arabic:     نَأْسَف سَعَادَتِكُم — الجُنَاح مَا زَال جَاهِز. خِلَال خَمْسَتْعَشَر دَقِيقَة. تَفَضَّلُوا فِي الصَّالَة
roman:      na'saf sa'adatikum — al-junaah ma zaal jaahiz. khilaal khamista'shar dagiiga. tafaddalu fis-saala
english:    We apologize, Your Excellency — the suite isn't ready yet. Within fifteen minutes. Please wait in the lounge
outcome:    good
impact:     { trust: +2, respect: +1, culture: +1 }
flag:       none
note:       "Honest and polite. Correct honorific and direction. But you made him feel the failure — he now knows his room wasn't ready. The apology is appropriate but awareness costs something. He'll wait knowing there was a problem."
```

**Choice C — Blame housekeeping (METER DIVERGENCE)**
```
arabic:     نَأْسَف سَعَادَتِكُم — التَّدْبِير المَنْزِلِي مَا خَلَّص. نِحَن نِتَابِع مَعَهُم
roman:      na'saf sa'adatikum — at-tadbiir al-manzili ma khallas. nihna nitaabi' ma'ahum
english:    We apologize, Your Excellency — housekeeping hasn't finished. We're following up with them
outcome:    neutral
impact:     { trust: +3, respect: -1, culture: -2 }
flag:       none
note:       "Transparent — trust goes up because you told the truth about the cause. But you named the failing department in front of a VIP. In Gulf hospitality protocol, internal failures stay internal. Mentioning housekeeping tells Khaled the hotel has coordination issues AND puts him in an awkward position of knowing too much."
```

**Choice D — Minimize**
```
arabic:     تَقْرِيباً جَاهِز سَعَادَتِكُم. شْوَي بَس
roman:      tagriiban jaahiz sa'adatikum. shway bas
english:    Almost ready, Your Excellency. Just a bit
outcome:    bad
impact:     { trust: -1, respect: -1, culture: -1 }
flag:       none
note:       "Vague and dismissive. 'Almost ready' without a concrete action plan means nothing to someone who has dealt with hotel staff for decades. Khaled knows exactly what 'شوي بس' from a front desk means."
```

### Phrases introduced: نرفع لكم، تفضلوا في الصالة، خلال دقايق

---

## TURN 3: The Coffee Order

### Setting tag
`Hotel lobby — VIP lounge, 4:40 PM`

### Context
You escort Khaled to the VIP lounge to wait. Before leaving him, you should offer something. His guest profile said: قهوة عربية بهيل فقط (Arabic coffee with cardamom only). This is your chance to demonstrate you read his profile.

### Character dialogue

**Warm** (score 10+):
```
Arabic:     (يَقْعَد فِي الصَّالَة وَيَنْظُر لَك مُنْتَظِرَاً)
English:    (Khaled sits in the lounge and looks at you, waiting)
```

**Neutral/Cold:**
```
Arabic:     (يَقْعَد وَيِشِيل تِلِفُونَه)
English:    (Sits and takes out his phone, disengaged)
```

### Choices (4)

**Choice A — Offer coffee using his exact preference from the profile**
```
arabic:     قَهْوَة عَرَبِيَّة بِالهَيْل سَعَادَتِكُم؟ أَوْ تِفَضَّلُون شَي ثَانِي؟
roman:      gahwa 'arabiyya bil-heel sa'adatikum? aw tifaddaduun shay thaani?
english:    Arabic coffee with cardamom, Your Excellency? Or would you prefer something else?
outcome:    excellent
impact:     { trust: +3, respect: +3, culture: +2 }
flag:       none
note:       "You specified هيل (cardamom) — his exact preference — without being asked. You read his profile. Khaled didn't have to say a word about his coffee. That one word (هيل) tells him: this hotel prepared for ME specifically, not for a generic guest."
```

**Choice B — Offer coffee generically**
```
arabic:     تِفَضَّل قَهْوَة عَرَبِيَّة سَعَادَتِكُم؟
roman:      tifaddal gahwa 'arabiyya sa'adatikum?
english:    Would you like some Arabic coffee, Your Excellency?
outcome:    good
impact:     { trust: +1, respect: +2, culture: +2 }
flag:       none
note:       "Offering Arabic coffee is culturally correct hospitality. But you had his preference file. Not specifying هيل means he'll either accept generic coffee or have to tell you his preference himself — both less elegant than you knowing it already."
```

**Choice C — Offer a drinks menu**
```
arabic:     مَا هُوَ مَشْرُوبَكُم المُفَضَّل سَعَادَتِكُم؟
roman:      ma huwa mashruubakum al-mufaddal sa'adatikum?
english:    What is your preferred drink, Your Excellency?
outcome:    neutral
impact:     { trust: +1, respect: +1, culture: 0 }
flag:       none
note:       "Polite question, but you had his file. Asking his preference when you already know it signals either you didn't read the profile or you didn't trust it. It forces him to state something he's presumably shared before."
```

**Choice D — Leave without offering anything**
```
arabic:     أَنَا أَرْجَع خِلَال عَشَر دَقَايِق سَعَادَتِكُم
roman:      ana arja' khilaal 'ashar dagaayig sa'adatikum
english:    I'll be back in ten minutes, Your Excellency
outcome:    bad
impact:     { trust: -1, respect: -1, culture: -2 }
flag:       none
note:       "Leaving a VIP in a lounge without offering any hospitality — no coffee, no water, no dates — is a foundational service failure in Gulf culture. The VIP lounge exists precisely for moments like this. You left him sitting with nothing."
```

### Phrases introduced: هيل (زعفران contrast taught in cultural note)

---

## TURN 4: The Room Requests ⭐ FLAG 2 HIDDEN HERE

### Setting tag
`Presidential Suite — 5:00 PM`

### Context
You escort Khaled to the suite. He looks around briefly, then turns with two requests. His profile covered the coffee (already done in Turn 3), dates, and Qibla. He asks about the remaining two:

### Character dialogue

**Warm** (score 18+):
```
Arabic:     زَيْن. أَبْغِي تَمْر مِنْ العَيْن لَو عِنْدَكُم. وَأَبْغِي أَعْرِف وِجْهَة القِبْلَة
Roman:      zayn. abghi tamr min al-'ayn law 'indakum. w-abghi a'rif wijhat al-gibla
English:    Khaled: "Good. I want dates from Al Ain if you have them. And I want to know the direction of Qibla"
```

**Neutral** (score 9-17):
```
Arabic:     أَبْغِي تَمْر وَوِجْهَة القِبْلَة
English:    Khaled: "I want dates and the Qibla direction"
```

**Cold** (score below 9):
```
Arabic:     وِجْهَة القِبْلَة؟
English:    Khaled: "The Qibla direction?" (minimal)
```

> **🌍 CULTURAL NOTES:**
> تمر من العين — Al Ain is a city in Abu Dhabi emirate famous for the finest
> Emirati dates. Asking for العين dates specifically is a quality signal.
> A trained concierge in Dubai knows this.
>
> وجهة القبلة — Every Muslim guest may request this. A five-star hotel
> concierge in Dubai should know the Qibla direction from every room.
> This is not specialist knowledge — it's Dubai basics for hospitality staff.

### Choices (4)

**⭐ Choice A — Address both AND add prayer times proactively (FLAG 2)**
```
arabic:     عَلَى رَاسِي. التَّمْر العَيْنِي عِنْدَنَا. أَمَّا القِبْلَة (يِأَشِّر) — هِيَ هِنِي سَعَادَتِكُم. وَأَجِيب لِكُم كَارْت مَوَاقِيت الصَّلَاة كَمَان
roman:      'ala raasi. at-tamr al-'ayni 'indana. amma al-gibla (yi'ashshir) — hiya hini sa'adatikum. w-ajiib likum kart mawaaqiit as-salaah kamaan
english:    On my head. We have Al Ain dates. As for the Qibla — (points) it's here, Your Excellency. And I'll bring you a prayer times card as well
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
flag:       sets FLAG_2 = true
note:       "على راسي opens with personal commitment. You had تمر العين (Al Ain dates) in stock — you know UAE geography. You knew the Qibla without checking your phone — basic preparation for Gulf guests. Then you added the prayer times card without being asked. Four signals: I prepared, I know my country, I know this building, and I thought ahead."
```

**Choice B — Handle dates and Qibla, skip prayer times**
```
arabic:     أَبْشِر سَعَادَتِكُم — التَّمْر العَيْنِي حَاضِرِين. وَالقِبْلَة (يِأَشِّر) هِنِي
roman:      abshir sa'adatikum — at-tamr al-'ayni haadhriin. wal-gibla (yi'ashshir) hini
english:    Consider it done, Your Excellency — Al Ain dates ready. And the Qibla (points) is here
outcome:    good
impact:     { trust: +2, respect: +2, culture: +2 }
flag:       none
note:       "You handled both requests correctly. You knew the dates AND the Qibla. But a prepared five-star concierge adds the prayer times card proactively — Khaled didn't ask because he assumed someone would bring it. Missing it isn't a failure, but bringing it unrequested is the difference between good and exceptional."
```

**Choice C — Need to check the Qibla**
```
arabic:     أَبْشِر. لِلتَّمْر حَاضِرِين. لِلْقِبْلَة — أَتَأَكَّد وَأَرُد عَلَيْكُم خِلَال دَقِيقَة
roman:      abshir. lit-tamr haadhriin. lil-gibla — ata'akkad w-arudd 'alaykum khilaal dagiiga
english:    Done. For dates — ready. For the Qibla — let me confirm and come back within a minute
outcome:    neutral
impact:     { trust: +1, respect: +1, culture: 0 }
flag:       none
note:       "Asking to confirm the Qibla rather than guessing is honest. But a senior concierge at a five-star Dubai hotel should know the Qibla from every suite. 'Let me check' is better than guessing wrong. Knowing it is the five-star standard."
```

**Choice D — Redirect Qibla to the prayer rug (METER DIVERGENCE)**
```
arabic:     حَاضِرِين لِلتَّمْر. لِلْقِبْلَة — فِيه سَهْم عَلَى السَّجَّادَة
roman:      haadhriin lit-tamr. lil-gibla — fiih sahm 'alas-sajjaada
english:    Ready for dates. For the Qibla — there's an arrow on the prayer rug
outcome:    neutral
impact:     { trust: +2, respect: -1, culture: -2 }
flag:       none
note:       "Technically there is an arrow on the prayer rug. Trust goes up (+2) because you gave a correct answer. But Khaled asked YOU personally — pointing at a carpet is a passive deflection of a direct question. Respect goes down (-1). Culture goes down (-2) because a trained Gulf hospitality professional gives a personal answer, not a furniture redirect."
```

> **⚙️ METER DIVERGENCE:** Trust UP because the answer is technically correct.
> Respect and Culture DOWN because it's impersonal. Teaches users: being technically
> right and being culturally skilled are different things.

### Phrases introduced: على راسي، قبلة الصلاة، مواقيت الصلاة

---

## TURN 5: The Indirect Complaint ⭐ FLAG 3 HIDDEN HERE

### Setting tag
`Hotel front desk — phone call from Suite, 7:48 PM`

### Context
Khaled has been in the suite for nearly 3 hours. The hotel ballroom has a wedding event since 7 PM — music, applause, celebration noise. You knew this was scheduled. Khaled calls.

> **CRITICAL CULTURAL NOTE:**
> "الضوضاء تعبتني شوي" = the noise is tiring me A BIT.
> This is NOT a mild comment. In Gulf communication, especially from
> a senior official to a service provider, indirect language signals
> serious displeasure. "شوي" softens the expression but NOT the meaning.
> Translation: "This is unacceptable. Fix it immediately."
> A trained Dubai concierge hears "شوي" and thinks "urgent."

### Character dialogue

**Warm** (score 26+):
```
Arabic:     الضَّوْضَاء مِنْ القَاعَة تَعَبَتْنِي شْوَي. يِمْكِن تِشُوفُون هَذَا؟
English:    Khaled: "The noise from the hall is tiring me a bit. Can you look into this?"
```

**Neutral** (score 14-25):
```
Arabic:     فِيه ضَوْضَاء مِنْ تَحْت
English:    Khaled: "There's noise from below"
```

**Cold** (score below 14):
```
Arabic:     الضَّوْضَاء
English:    Khaled: "The noise." (one word, clearly irritated)
```

### Choices (4)

**⭐ Choice A — على راسي + immediate concrete action, no explanation (FLAG 3)**
```
arabic:     عَلَى رَاسِي سَعَادَتِكُم. أَنَا أَتَصَرَّف الْحِين وَأَرُد عَلَيْكُم خِلَال خَمْس دَقَايِق
roman:      'ala raasi sa'adatikum. ana atasarraf al-hin w-arudd 'alaykum khilaal khams dagaayig
english:    On my head, Your Excellency. I'll handle this now and call you back within five minutes
outcome:    excellent
impact:     { trust: +3, respect: +3, culture: +3 }
flag:       sets FLAG_3 = true
note:       "على راسي = personal ownership. 'I'll handle this now' = action commitment. 'Call you back in five minutes' = concrete timeline with accountability. No explanation, no wedding history, no 'we're sorry but.' Three phrases that tell Khaled: I heard you, I understand the severity, and I'm moving now."
```

**Choice B — Explain the event context (METER DIVERGENCE)**
```
arabic:     نَأْسَف سَعَادَتِكُم — عِنْدَنَا حَفْلَة زَوَاج فِي القَاعَة. تِنْتَهِي السَّاعَة اثْنَا عَشَر. نِحَن نِتَابِع
roman:      na'saf sa'adatikum — 'indana haflet zawaaj fil-qaa'a. tintahi as-saa'a ithna 'ashar. nihna nitaabi'
english:    We apologize, Your Excellency — there's a wedding in the hall. It ends at midnight. We're following up
outcome:    neutral
impact:     { trust: +3, respect: -2, culture: -2 }
flag:       none
note:       "You were honest — trust goes up. But you told a VIP Undersecretary he must endure noise until midnight. 'We're following up' after announcing midnight means nothing will change. In Gulf VIP protocol, explaining a problem without offering a solution is worse than silence. Respect goes down: you made him aware AND powerless."
```

> **⚙️ METER DIVERGENCE — FIX FROM REVIEW:**
> Previous version had this as "neutral" outcome with these scores, which was
> inconsistent. Corrected: outcome stays neutral (it's not terrible) but the
> divergence is real — trust UP, respect and culture DOWN. Total impact is -1
> which aligns with neutral outcome.

**Choice C — Offer to relocate him**
```
arabic:     نَأْسَف سَعَادَتِكُم. نِقْدَر نِحَوِّلِكُم لِجُنَاح أَبْعَد عَنْ القَاعَة؟
roman:      na'saf sa'adatikum. nigdar nihawwilikum li-junaah ab'ad 'an al-qaa'a?
english:    We apologize, Your Excellency. Can we move you to a suite further from the hall?
outcome:    good
impact:     { trust: +2, respect: +1, culture: +1 }
flag:       none
note:       "A real solution offered. But you asked instead of acting — 'can we move you?' puts the decision burden on him. Better: 'We've arranged a quieter suite' — present the solution, not the question. Still better than explaining the wedding."
```

**Choice D — Offer earplugs**
```
arabic:     نَأْسَف. عِنْدَنَا سَدَّادَات أُذُن إِذَا تِحِب سَعَادَتِكُم
roman:      na'saf. 'indana saddaadaat udhun idha tihib sa'adatikum
english:    We apologize. We have earplugs if you'd like, Your Excellency
outcome:    bad
impact:     { trust: 0, respect: -3, culture: -3 }
flag:       none
note:       "Offering earplugs to a government Undersecretary in a Presidential Suite. You effectively told him to plug his own ears. This is the single worst service response in Gulf VIP hospitality. Khaled will remember this call specifically — for all the wrong reasons."
```

### Phrases introduced: الضوضاء تعبتني شوي (recognition)، نأسف على الإزعاج

---

## TURN 6: The Departure

### Setting tag
`Hotel lobby — next morning, 11:00 AM`

### Context
Khaled is checking out. His assistant Tariq handles luggage. Khaled approaches the desk. This is your final impression — and depending on the stay, potentially your career-defining moment.

### Character dialogue

**Warm** (score 34+):
```
Arabic:     شُكْراً. كَانَت إِقَامَة طَيِّبَة
English:    Khaled: "Thank you. It was a good stay" (said looking at you directly)
```

**Neutral** (score 18-33):
```
Arabic:     شُكْراً
English:    Khaled: "Thank you" (brief)
```

**Cold** (score below 18):
```
Arabic:     (المُسَاعِد طَارِق يُعْطِيك وَرَقَة تَقْيِيم بِصَمْت)
English:    (Assistant Tariq hands you a feedback form in silence)
```

### Choices (4)

**Choice A — Formal farewell with feedback opening**
```
arabic:     كَيْف كَانَت إِقَامَتِكُم سَعَادَتِكُم؟ نَتَشَرَّف بِزِيَارَتِكُم دَايِماً. زِيَارَتِكُم نُور
roman:      kayf kaanat igaamatikum sa'adatikum? natasharraf biziyaaratikum daayman. ziyaaratikum nuur
english:    How was your stay, Your Excellency? We're always honored by your visit. Your visit is a light
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
flag:       none
note:       "كيف كانت إقامتكم opens the door for feedback without pressure. نتشرف بزيارتكم دايماً positions return as expected, not pleaded for. زيارتكم نور is one of the most elegant closing phrases in Gulf hospitality — luminous language for a distinguished guest."
```

**Choice B — Blessing with specific forward commitment**
```
arabic:     الله يُوَفِّقِكُم سَعَادَتِكُم. إِنْ شَاء الله زِيَارَتِكُم الجَايَة نِجَهِّز كُل شَي زَي مَا تِحِبُّون
roman:      allah yuwaffigikum sa'adatikum. in shaa' allah ziyaaratikum al-jaaya nijahhiz kul shay zay ma tihibbuun
english:    May God grant you success, Your Excellency. God willing, for your next visit we'll prepare everything as you prefer
outcome:    good
impact:     { trust: +2, respect: +2, culture: +2 }
flag:       none
note:       "الله يوفقكم is appropriate for a government official. Mentioning preparation for the next visit shows continuity. Strong farewell but زيارتكم نور would have been the more elevated choice."
```

**Choice C — Generic professional farewell**
```
arabic:     شُكْراً لِزِيَارَتِكُم سَعَادَتِكُم. يِسْعِد صَبَاحَكُم
roman:      shukran liziyaaratikum sa'adatikum. yis'id sabaahakum
english:    Thank you for your visit, Your Excellency. Have a great morning
outcome:    neutral
impact:     { trust: +1, respect: +1, culture: +1 }
flag:       none
note:       "Polite and correct. But after a stay with upgrades, specific requests, and a noise issue resolved — a generic farewell feels thin. The stay had texture. The farewell should too."
```

**Choice D — Ask for a review**
```
arabic:     لَو مَا مَانِع سَعَادَتِكُم — تِقْدَر تِتْرُك تَقْيِيم عَلَى التْرِيب أَدْفَايْزَر؟
roman:      law ma maani' sa'adatikum — tigdar titrug taqyiim 'ala tripadvisor?
english:    If you don't mind, Your Excellency — could you leave a review on TripAdvisor?
outcome:    bad
impact:     { trust: -1, respect: -2, culture: -3 }
flag:       none
note:       "Asking a government Undersecretary to write you a TripAdvisor review as he walks out reduces a relationship built on dignity and protocol to a social media transaction. Khaled will remember this departure specifically — for all the wrong reasons."
```

### Phrases introduced: كيف كانت إقامتكم، زيارتكم نور، الله يوفقكم

---

## ENDING LOGIC

```
STEP 1: Check total score
  - If score < 5 → COLD ENDING (skip flag checks)
  - If score >= 5 → proceed to Step 2

STEP 2: Check flags
  - If FLAG_1 AND FLAG_2 AND FLAG_3 AND score ≥ 28 → SECRET PATH (Bonus Turn 7)
  - Else if score ≥ 33 → WARM ENDING
  - Else → NEUTRAL ENDING
```

### Score path verification (6 turns):

Max per turn ~8 pts. Maximum possible ≈ 48.

| T1 | T2 | T3 | T4 | T5 | T6 | Total | Flags | Ending |
|----|----|----|----|----|----|----|-------|--------|
| A(+8) | A(+8,F1) | A(+8) | A(+8,F2) | A(+9,F3) | A(+8) | 49 | ALL | **SECRET** ✓ (49≥28) |
| A(+8) | A(+8,F1) | B(+5) | A(+8,F2) | A(+9,F3) | A(+8) | 46 | ALL | **SECRET** ✓ |
| A(+8) | A(+8,F1) | A(+8) | A(+8,F2) | A(+9,F3) | B(+6) | 47 | ALL | **SECRET** ✓ |
| A(+8) | A(+8,F1) | A(+8) | B(+6) | A(+9,F3) | A(+8) | 47 | F1+F3 | **Warm** ✓ (47≥33) |
| A(+8) | B(+4) | A(+8) | A(+8,F2) | A(+9,F3) | A(+8) | 45 | F2+F3 | **Warm** ✓ |
| B(+5) | A(+8,F1) | B(+5) | A(+8,F2) | A(+9,F3) | A(+8) | 43 | ALL | **SECRET** ✓ |
| B(+5) | B(+4) | B(+5) | B(+6) | C(+4) | B(+6) | 30 | none | Neutral ✓ |
| B(+5) | A(+8,F1) | B(+5) | B(+6) | B(0) | B(+6) | 30 | F1 only | Neutral ✓ |
| C(+1) | D(-3) | D(-3) | D(0) | D(-6) | D(-6) | -17 | none | **Cold** ✓ |
| C(+1) | C(0) | C(+1) | C(+1) | B(0) | C(+3) | 6 | none | Neutral ✓ (6≥5) |

> **KEY INSIGHT:** The secret ending requires all 3 flags. Flags 1, 2, 3 are all on
> the highest-scoring choices (A) in their respective turns. The "secret" isn't about
> finding hidden choices — it's about knowing WHY those choices are right.
> A user who scores all A's purely by guessing gets the secret.
> A user who understands Gulf protocol gets the secret too — but more importantly,
> they understand WHY. The educational value is in the cultural notes, not the gatekeeping.
> This differs from the Gym and Café where FLAG_1 required a sub-optimal choice.
> VIP hospitality advanced users who've mastered basics naturally unlock it.
> The challenge here is KNOWING, not finding.

---

## BONUS TURN 7: The Call Back (SECRET PATH ONLY)

### Setting tag
`Hotel lobby — 11:18 AM, 18 minutes after Khaled leaves`

### Context
Khaled's car has pulled away. You're back at the desk when your phone rings. It's his assistant Tariq.

> **🌍 DIALECT NOTE — TARIQ:**
> Listen to how Tariq speaks versus how Khaled spoke. Tariq is Jordanian — Levantine Arabic.
> He says "بدي" (biddi) for "I want" — Lebanese/Jordanian form.
> His formal register is careful and professional because he's in a work context.
> But his natural dialect markers come through. After playing 6 turns in Emirati Gulf Arabic,
> hearing Levantine through the assistant reinforces that Dubai is a city of many Arabics.

### Character dialogue

```
[Tariq — Jordanian accent, formal professional register]
Arabic:     مَرْحَبَا. أَنَا طَارِق، مُسَاعِد سَعَادَة المَزْرُوعِي.
            سَعَادَتُه يِرْسِل تَحِيَّاتُه وَيَقُول —
            بِنَاءً عَلَى طَلَب سَعَادَتِه، بِدِّي أُحَجِّز ثَلَاث زِيَارَات قَادِمَة فِي نَفْس الفَنْدَق.
            وَسَعَادَتُه طَلَب بِالتَّحْدِيد:
            نَفْس الشَّخْص مَسْؤُول عَن إِقَامَتِه فِي كُل مَرَّة. بِالاسِم.
Roman:      marhaba. ana tariq, musaa'id sa'aadat al-mazruu'i.
            sa'aadatuh yirsil tahiyyaatuh w-yaguul —
            binaa'an 'ala talab sa'aadatih, biddi uhadjiz thlath ziyaaraat gaadima fi nafs al-funduq.
            w-sa'aadatuh talab bit-tahdiid:
            nafs ash-shakhs mas'uul 'an igaamatih fi kul marra. bil-ism.
English:    Tariq: "Hello. I'm Tariq, assistant to His Excellency Al Mazrouei.
            His Excellency sends his greetings and says —
            Based on His Excellency's request, I'd like to book three upcoming visits at the same hotel.
            And His Excellency requested specifically:
            the same person responsible for his stay every time. By name."
```

> **Note:** Tariq uses "بدي" (biddi) — Jordanian for "I want." In 6 turns of Emirati,
> this single Levantine word stands out immediately. Users who've been listening will catch it.

### Choices (2 — narrative only, not scored)

**Choice A:**
```
arabic:     وَالله شَرَّفَنِي. قُولُوا لِسَعَادَتِه إِنَّه عَلَى رَاسِي
roman:      wallah sharrrafani. quulu lisa'aadatih innah 'ala raasi
english:    Truly honored. Tell His Excellency — it's on my head
```

**Choice B:**
```
arabic:     هَذَا شَرَف كَبِير. بِكُل سُرُور — أَنَا فِي خِدْمَة سَعَادَتِه
roman:      hadha sharaf kabiir. bikul suruur — ana fi khidmat sa'aadatih
english:    This is a great honor. With pleasure — I am at His Excellency's service
```

Both lead to the Secret Ending screen.

### Bonus phrase: بِنَاءً عَلَى طَلَب سَعَادَتِه

---

## ENDING SCREENS

### 🔓 Secret: "The Personal Request" (الطلب الشخصي)
**Trigger:** FLAG_1 + FLAG_2 + FLAG_3 + score ≥ 28

**Title card:** 🔓 SECRET ENDING UNLOCKED

**Description:** Khaled Al Mazrouei requested you by name for three upcoming stays. Not "the same team." The same person. By name. In Dubai's hospitality industry, this is how careers change. A government Undersecretary requesting a staff member personally tells hotel management one thing: promote them or lose them to a competitor. You earned this with three moments: turning a suite delay into an invisible upgrade (he never experienced the failure), knowing his Qibla direction and adding prayer times without being asked (you prepared for him specifically), and saying على راسي with a five-minute callback commitment when he called about noise (you acted, you didn't explain). Three acts of preparedness. One career-defining outcome.

**Community stat:** "Only 7% of users discover this ending"

**Cultural lesson:** In Gulf VIP hospitality, the guest never feels the problem, the service provider never explains the failure, and the host always knows what the guest needs before they ask. These aren't service rules — they're cultural values: كرم (generosity), حياء (dignity), استعداد (preparedness). Khaled tested all three. He didn't announce the test.

**Dialect note:** Tariq called you in Jordanian Arabic — "بدي أحجز" (biddi uhadjiz). After six turns in Emirati, one Levantine word stands out. Dubai's professional world runs in many Arabics simultaneously. The Gulf is the prestige register for hospitality. Levantine is everywhere else.

**Bonus phrase:** بِنَاءً عَلَى طَلَب سَعَادَتِه — formal phrase when a senior official makes a specific personal request. You'll hear it in hotels, ministries, and boardrooms.

**Achievements:** "By Name", "Secret Path", "VIP Protocol Master"

---

### ✅ Warm: "The Returning Guest" (الضيف الدايم)
**Trigger:** Score ≥ 33, missing any flag

**Closing dialogue:**
```
Arabic:     إِنْ شَاء الله نَرْجَع — said looking at you
English:    Khaled: "God willing, we'll return" (said directly to you)
```

**Description:** Khaled said إن شاء الله while looking at you specifically — not at the desk, not at his assistant. That matters. In Gulf culture, إن شاء الله made with eye contact to a specific person is a real commitment. He'll return. You served him with professionalism, cultural awareness, and respect. The suite issue was handled, his requests were met. You didn't unlock the deeper connection — but the door is open.

**Hint:** "1 of 4 endings. One of them puts your name in his assistant's phone."

---

### ⚠️ Neutral: "The Functional Stay" (الإقامة التشغيلية)
**Trigger:** Score 5-32

**Closing dialogue:**
```
Arabic:     شُكْراً
English:    Khaled: "Thank you" (brief, moving toward the door)
```

**Description:** The stay was functional. Nothing catastrophic. Khaled was served adequately. He'll tell Tariq to book the same hotel next time — because changing hotels is an effort, not because the service was memorable. In Dubai's hospitality industry, "adequate" has a short shelf life. The next hotel that gets his protocol right will become his default.

---

### ❌ Cold: "The Feedback Form" (نموذج التقييم)
**Trigger:** Score below 5

**Closing dialogue:**
```
Arabic:     (طَارِق يُعْطِيك نُمُوذَج التَّقْيِيم بِصَمْت)
English:    (Tariq hands you the hotel feedback form without a word)
```

**Description:** When Khaled's assistant hands you a feedback form on departure without speaking, that's a message. Khaled was too gracious to say it directly. The form will be filled. Management will see it. In Dubai's VIP hospitality circuit, senior government officials talk to each other. One poor stay for one Undersecretary doesn't stay quiet. The form is the polite version of damage control.

---

## SCORING SUMMARY

| Ending | Score | Flags | Seeded % |
|--------|-------|-------|----------|
| 🔓 Secret: The Personal Request | ≥ 28 | All 3 | 7% |
| ✅ Warm: The Returning Guest | ≥ 33 | Missing any | 22% |
| ⚠️ Neutral: The Functional Stay | 5-32 | — | 53% |
| ❌ Cold: The Feedback Form | < 5 | — | 18% |

---

## WHAT THIS SCENE TEACHES

**Professional skills:**
- UAE government honorific protocol (سعادتكم vs معالي vs سيدي)
- Reading and using guest profiles proactively
- Invisible service recovery (guest never experiences the failure)
- Using Arabic coffee vocabulary (هيل = cardamom, زعفران = saffron)
- UAE geography: تمر من العين (Al Ain dates = finest in UAE)
- Qibla direction and prayer times as standard Gulf guest preparation
- Reading indirect complaints: شوي = serious in VIP context
- على راسي as the highest-level service commitment

**Arabic vocabulary:**
- Honorifics: سعادتكم، شرفتمونا
- Commitment: على راسي، أبشر، حاضرين
- Service recovery: نأسف على الإزعاج، نرفع لكم
- Religious/cultural: قبلة الصلاة، مواقيت الصلاة
- Food vocabulary: هيل، زعفران، تمر، قهوة عربية
- Formal farewell: زيارتكم نور، كيف كانت إقامتكم، الله يوفقكم

**Cultural skills:**
- سعادتكم vs معالي: knowing the difference shows protocol mastery
- Problems are invisible: the guest never experiences the failure
- Indirect complaint = serious: never treat شوي as mild with VIP
- Explaining a problem without a solution is worse than silence
- TripAdvisor requests to government officials = career damage
- كرم، حياء، استعداد — the three Gulf service values

**Dialect awareness:**
- Khaled (Emirati): شو، أبغي، إي — Gulf baseline
- Tariq (Jordanian): بدي — Levantine marker in professional context
- Same workplace, different dialects — Dubai professional reality

---

## COMPLETE FREE TIER MAP

| Scenario | Mode | Level | Category | Core skill |
|----------|------|-------|----------|------------|
| The First Morning | Career | Beginner | Hospitality | Greetings + hospitality acceptance |
| The Checkup | Career | Beginner | Medical | Measurements + dignity + الله يشافيك |
| The Gym Scene 1 | Career | Intermediate | Health | Consultation + pricing + Saudi dialect |
| The Lunch Rush | Career | Intermediate | F&B | Service SOP + 3 dialects + bill fight |
| The VIP Guest | Career | Advanced | Hospitality | Protocol + indirect language + VIP service |
| The Corner Café | Social | Beginner | F&B | Small talk + reciprocity + becoming a regular |
