# Scenario: The Lunch Rush (وقت الغدا)

## Mode: Career
## Difficulty: Intermediate
## Category: Food & Beverage

---

# SCENE 1: The Table (الطاولة)

**Setting tag:** `Hotel restaurant — Thursday 1:00 PM`
**Duration:** ~6 minutes
**Turns:** 7 (+ 1 bonus turn for secret ending)
**Difficulty:** Intermediate (4 choices per turn)

---

## CHARACTERS

```
CHARACTER 1:
Name:        نورة (Noura)
Gender:      Female
Nationality: Qatari
Age:         Early 40s
Background:  Regional hospitality director at a Gulf hotel chain.
             In Dubai for a hospitality conference.
             Elegant, composed, observant. She notices everything —
             how you hold the menu, how you address her friends,
             how you handle mistakes. She's the senior of the group
             and will insist on paying the bill.
Personality: Graceful, commanding, quietly evaluating
Dialect:     Uses "شنو" (shnu) for "what" instead of Emirati "شو"
             Uses "أبي" (abi) for "I want"
             Says "هيه" for yes

CHARACTER 2:
Name:        دانة (Dana)
Gender:      Female
Nationality: Emirati (from Abu Dhabi)
Age:         Early 30s
Background:  Marketing manager at a luxury brand. Knows food well.
             Has a shellfish allergy — serious, not a preference.
             She's the most relaxed of the three but pays
             attention to how her allergy is handled.
Personality: Warm, easygoing, food-aware
Dialect:     Standard Emirati Gulf Arabic
             Uses "أبغي" (abghi) for "I want"
             Uses "شو" (shuu) for "what"
             Uses "إي" (ii) for yes

CHARACTER 3:
Name:        ريم (Reem)
Gender:      Female
Nationality: Lebanese (living in Dubai for 5 years)
Age:         Early 20s
Background:  Food and lifestyle content creator with 500K+
             followers across Instagram and TikTok. She photographs
             everything she eats. The group doesn't announce this —
             she looks like any other young woman at lunch.
Personality: Chatty, curious, enthusiastic about food, asks many questions
Dialect:     Lebanese Arabic mixed with Gulf from years in Dubai
             Uses "بدي" (biddi) for "I want" — Levantine
             Uses "شو" (shuu) for "what" — shared with Gulf
             Uses "كتير" (ktiir) for "very" instead of Gulf "وايد"
             Says "هيدا" (hayda) for "this" — Levantine marker
```

---

## BRANCHING LOGIC

```
           TURN 1 → TURN 2 → TURN 3 → TURN 4 → TURN 5 → TURN 6 → TURN 7
                                                                       │
                                                                  Score Check
                                                                       │
                                                       ┌───── Flag Check ──────┐
                                                       │                       │
                                             All 3 Flags              No/Partial
                                             + Score ≥ 34                    │
                                                       │           ┌─────────┼─────────┐
                                                 BONUS TURN 8   Score≥36  20-35    <20
                                                       │            │       │        │
                                                 Secret Ending   Warm   Neutral    Cold


FLAGS:
  FLAG_1 = Turn 3 (Choice B) — Ask about allergies BEFORE anyone mentions it
  FLAG_2 = Turn 4 (Choice A) — Go to kitchen to verify allergy
  FLAG_3 = Turn 6 (Choice B) — Credit the kitchen with يسلموا الأيادي
```

---

## LUNCH MENU (displayed as context at Turn 3)

```
╔══════════════════════════════════════════════════════════╗
║           قائمة الغدا — LUNCH MENU                      ║
║                                                          ║
║  🥗 سَلَطَات (Salads)                                   ║
║  فَتُّوش .............................................. 38 AED  ║
║  تَبُّولَة ............................................ 35 AED  ║
║                                                          ║
║  🍲 أَطْبَاق رَئِيسِيَّة (Mains)                        ║
║  مَچْبُوس دَجَاج (Chicken machboos) .................. 85 AED  ║
║  سَمَك مَشْوِي مَع رُز (Grilled fish with rice) ...... 95 AED  ║
║  لَحْم مَنْدِي (Mandi lamb) ........................... 110 AED ║
║  رُبْيَان مَقْلِي (Fried shrimp) ...................... 90 AED  ║
║  مَعْكَرُونَة بِالدَّجَاج (Chicken pasta) ............. 75 AED  ║
║                                                          ║
║  🍹 مَشْرُوبَات (Drinks)                                 ║
║  عَصِير لَيْمُون بِالنَّعْنَاع (Lemon mint) ........... 28 AED  ║
║  شَاي كَرَك (Karak tea) ............................... 18 AED  ║
║  مَاي (Water) ......................................... 12 AED  ║
║                                                          ║
║  🍮 حَلَا (Desserts)                                     ║
║  لُقَيْمَات (Sweet dumplings) .......................... 35 AED  ║
║  كُنَافَة (Kunafa) ..................................... 40 AED  ║
║                                                          ║
║  ⭐ طَبَق اليُوم — DISH OF THE DAY                      ║
║  مَچْبُوس لَحْم بِالتَّمْر (Lamb machboos with        ║
║  dates) — Chef's special, slow-cooked 6 hours            ║
║  ................................................... 120 AED    ║
╚══════════════════════════════════════════════════════════╝
```

> **ALLERGY NOTE:**
> ربيان مقلي (fried shrimp) = shellfish.
> سمك مشوي (grilled fish) is cooked on the same grill surface.
> Chef can prepare fish on a separate clean pan if requested.

---

## PHRASE LIST (13 phrases + 1 bonus)

| # | Arabic | Romanization | English | Context | Category |
|---|--------|-------------|---------|---------|----------|
| 1 | تْفَضَّلُوا | tfaddalu | Please / here you go (to group) | Plural of تفضل for 2+ people. | Workplace |
| 2 | تِحِبُّون مَاي أَوْ عَصِير؟ | tihibbuun maay aw 'asiir? | Would you like water or juice? | First offer after seating. Hospitality before menus. | Food |
| 3 | عِنْدَنَا طَبَق اليُوم | 'indana tabaq al-yoom | We have a dish of the day | Leading with the special shows product knowledge. | Workplace |
| 4 | شُو تِنْصَحْنَا؟ | shuu tinsahna? | What do you recommend? | Customer phrase. Answer specifically, not "everything is good." | Workplace |
| 5 | عِنْدِكُم حَسَاسِيَّة مِنْ شَي؟ | 'indikum hasaasiyya min shay? | Does anyone have allergies? | Proactive allergy check. Required by Dubai Food Code. | Health |
| 6 | أَأَكِّد لِج مِنْ المَطْبَخ | a'akkid lij min al-matbakh | I'll confirm from the kitchen (to female) | Professional allergy response. Go check, don't guess. | Workplace |
| 7 | بِالعَافِيَة | bil-'aafiya | Bon appétit / enjoy | Said when placing food AND when they finish eating. | Food |
| 8 | حَاضْرِين | haadhriin | Right away / at your service | Most powerful waiter word in Gulf Arabic. | Workplace |
| 9 | كُل شَي تَمَام؟ | kul shay tamaam? | Everything okay? | 2-minute / 2-bite check-in after food arrives. | Workplace |
| 10 | يِسْلَمُوا الأَيَادِي | yislamu al-ayaadi | Bless the hands that made this | Credits kitchen when complimented. Humble and correct. | Blessings |
| 11 | تِحِبُّون حَلَا أَوْ قَهْوَة؟ | tihibbuun hala aw gahwa? | Would you like dessert or coffee? | Must offer before bill. Skipping = lost revenue + broken SOP. | Food |
| 12 | الحِسَاب لَو سَمَحْت | al-hisaab law samaht | The bill please | Customer phrase the waiter must recognize. | Retail |
| 13 | تِشَرَّفْنَا فِيكُم | tisharrafna fiikum | We were honored by your visit (to group) | Professional farewell. Invites return without being pushy. | Greetings |
| 🔓 | أَبْشِرِي | abshiri | Consider it done (to female) | SECRET ENDING BONUS. Feminine of أبشر. | Blessings |

---

## TURN 1: The Welcome & Water

### Setting tag
`Hotel restaurant — corner table, 1:05 PM`

### Context
Three women are seated at a corner table. You approach within 1 minute of seating. Noura is scanning the restaurant interior. Reem is photographing the table setting. Dana is scrolling her phone.

### Character dialogue

**All tones (Turn 1 default):**
```
Arabic:     مَرْحَبَا!
Roman:      marhaba!
English:    Noura: "Hello!"
```

### Choices (4)

**Choice A — Water first, then menus, then special**
```
arabic:     أَهْلاً وَسَهْلاً! تِحِبُّون مَاي أَوْ عَصِير بِالأَوَّل؟
roman:      ahlan wa sahlan! tihibbuun maay aw 'asiir bil-awwal?
english:    Welcome! Would you like water or juice first?
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
note:       "Drinks first — before menus, before specials, before anything. In Gulf hospitality, the first thing you offer a guest is something to drink. It signals 'you are welcome here, relax.' Using plural تحبون shows you're addressing the whole table. Textbook hotel service."
```

**Choice B — Menus and special, skip water**
```
arabic:     أَهْلاً وَسَهْلاً فِيكُم! تْفَضَّلُوا القَائِمَة. عِنْدَنَا طَبَق اليُوم مَچْبُوس لَحْم بِالتَّمْر
roman:      ahlan wa sahlan fiikum! tfaddalu al-gaa'ima. 'indana tabaq al-yoom machbuus lahm bit-tamr
english:    Welcome! Here's the menu. We have today's special — lamb machboos with dates
outcome:    good
impact:     { trust: +1, respect: +2, culture: +1 }
note:       "Warm greeting and you led with the special — good. But you skipped water. In a hotel restaurant, drinks come first, menus second. Small miss, but Noura notices the sequence."
```

**Choice C — Greet Noura only**
```
arabic:     أَهْلاً! تْفَضَّلِي القَائِمَة. شُو تِحِبِّين؟
roman:      ahlan! tfaddali al-gaa'ima. shuu tihibbiin?
english:    Hello! Here's the menu. What would you like? (to Noura only)
outcome:    neutral
impact:     { trust: +1, respect: -1, culture: 0 }
note:       "Singular تفضلي to one person when three are seated. Always use plural (تفضلوا / تحبون) for a group, even if one seems to lead."
```

**Choice D — Drop menus and leave**
```
arabic:     القَائِمَة هِنِي. بَرْجَع آخِذ الطَّلَب
roman:      al-gaa'ima hini. barja' aakhidh at-talab
english:    Menu's here. I'll come back for the order
outcome:    bad
impact:     { trust: 0, respect: -2, culture: -2 }
note:       "No greeting, no water, no eye contact. You dropped menus like delivering packages. Service IS the product in a hotel restaurant."
```

### Phrases introduced: تفضلوا، تحبون ماي أو عصير

---

## TURN 2: Drinks Served, Menu & Special

### Setting tag
`Hotel restaurant — table, 1:08 PM`

### Context
Drinks are served (water/lemon mint/karak tea based on their order). You present menus and mention the special. Reem has questions.

### Character dialogue

**Warm** (score 6+):
```
[Reem]
Arabic:     شُو أَحْلَى شَي عِنْدَكُم؟ بَدِّي شَي يِسْتَاهَل تَصْوِير!
Roman:      shuu ahla shay 'indakum? biddi shay yistaahil taswir!
English:    Reem: "What's the best thing you have? I want something worth photographing!"

[Noura]
Arabic:     شْنُو تِنْصَحْنَا فِيه؟
Roman:      shnu tinsahna fiih?
English:    Noura: "What do you recommend?"
```

**Neutral** (score 3-5):
```
[Noura]
Arabic:     شْنُو عِنْدَكُم زَيْن؟
Roman:      shnu 'indakum zayn?
English:    Noura: "What's good here?"
```

**Cold** (score below 3):
```
[Noura]
Arabic:     نِشُوف القَائِمَة
Roman:      nishuuf al-gaa'ima
English:    Noura: "We'll look at the menu" (no engagement)
```

> **🌍 DIALECT NOTE:**
> Noura (Qatari) says "شنو" (shnu). Reem (Lebanese) says "شو" (shuu). Same meaning,
> different dialect. Reem says "بدي" (biddi) for "I want" — Lebanese. Emirati: "أبغي".
> Qatari/Saudi: "أبي". One table, three dialects — this is Dubai.

### Choices (4)

**Choice A — Confident specific recommendation**
```
arabic:     أَنْصَحْكُم بِطَبَق اليُوم — مَچْبُوس لَحْم بِالتَّمْر. الشِّيف يِطْبَخَه سِت سَاعَات. وَايِد يِنْمَدَح
roman:      ansahkum bi-tabaq al-yoom — machbuus lahm bit-tamr. ash-shiif yitbakhah sit saa'aat. waayid yinmadah
english:    I recommend the dish of the day — lamb machboos with dates. The chef cooks it for six hours. Highly praised
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +2 }
note:       "Specific details ('six hours, chef's recipe') beat 'everything is good.' Reem gets her photo story. Noura gets expert guidance. A waiter who knows the menu earns trust."
```

**Choice B — Offer options without opinion**
```
arabic:     عِنْدَنَا مَچْبُوس وَسَمَك وَلَحْم مَنْدِي. كُلْهُم حِلْوِين
roman:      'indana machbuus w-samak w-lahm mandi. kulhum hilwiin
english:    We have machboos, fish, and mandi lamb. They're all good
outcome:    good
impact:     { trust: +1, respect: +1, culture: +1 }
note:       "'They're all good' is what every waiter says — it tells nothing. When someone asks شو تنصحنا, they want YOUR opinion. A specific recommendation shows confidence."
```

**Choice C — Point at the menu**
```
arabic:     كُل شَي مَكْتُوب فِي القَائِمَة
roman:      kul shay maktuub fil-gaa'ima
english:    Everything is written in the menu
outcome:    neutral
impact:     { trust: 0, respect: -1, culture: 0 }
note:       "Redirecting to the menu when they asked for YOUR recommendation is dismissive. They can read — they want guidance."
```

**Choice D — Recommend the most expensive item**
```
arabic:     أَنْصَحْكُم بِاللَّحْم المَنْدِي. أَغْلَى شَي بَس يِسْتَاهَل
roman:      ansahkum bil-lahm al-mandi. aghla shay bas yistaahil
english:    I recommend the mandi lamb. Most expensive but worth it
outcome:    bad
impact:     { trust: -2, respect: -1, culture: -1 }
note:       "Never recommend by price. 'Most expensive but worth it' makes you sound like a salesman. Recommend by quality and story, not price tag."
```

### Phrases introduced: عندنا طبق اليوم، شو تنصحنا

---

## TURN 3: The Order ⭐ FLAG 1 HIDDEN HERE

### Setting tag
`Hotel restaurant — table, 1:12 PM`

### Context
They've decided. You return for food orders.

### Character dialogue

**Warm** (score 12+):
```
[Noura]
Arabic:     أَنَا أَبِي المَچْبُوس اللِّي قُلْت عَنَّه
Roman:      ana abi al-machbuus illi gult 'anna
English:    Noura: "I'll have the machboos you mentioned"

[Reem]
Arabic:     أَنَا بَعْد بَدِّي المَچْبُوس! بَس الدَّجَاج مُو اللَّحْم
Roman:      ana ba'd biddi al-machbuus! bas ad-dajaaj mu al-lahm
English:    Reem: "I also want the machboos! But chicken, not lamb"

[Dana]
Arabic:     أَنَا أَبْغِي السَّمَك المَشْوِي مَع سَلَطَة
Roman:      ana abghi as-samak al-mashwi ma' salata
English:    Dana: "I want the grilled fish with salad"
```

> **🌍 DIALECT NOTE:**
> Three ways to say "I want" at one table. Noura: "أبي" (abi — Qatari/Saudi). Reem: "بدي"
> (biddi — Lebanese). Dana: "أبغي" (abghi — Emirati). Welcome to F&B in Dubai.

### Choices (4)

**Choice A — Confirm orders clearly**
```
arabic:     تَمَام! مَچْبُوس لَحْم بِالتَّمْر، مَچْبُوس دَجَاج، وَسَمَك مَشْوِي مَع سَلَطَة. صَح؟
roman:      tamaam! machbuus lahm bit-tamr, machbuus dajaaj, w-samak mashwi ma' salata. sah?
english:    Perfect! Lamb machboos with dates, chicken machboos, and grilled fish with salad. Correct?
outcome:    good
impact:     { trust: +2, respect: +2, culture: +1 }
note:       "You confirmed orders — professional. But you missed dietary restrictions. Dana ordered fish where shrimp is also cooked. Dubai Food Code expects staff to check for allergens."
```

**⭐ Choice B — Confirm AND ask about allergies (FLAG 1)**
```
arabic:     تَمَام! قَبْل مَا أُرْسِل الطَّلَب لِلْمَطْبَخ — عِنْدِكُم حَسَاسِيَّة مِنْ شَي؟
roman:      tamaam! gabl ma ursil at-talab lil-matbakh — 'indikum hasaasiyya min shay?
english:    Perfect! Before I send the order to the kitchen — does anyone have any allergies?
outcome:    excellent
impact:     { trust: +3, respect: +2, culture: +2 }
flag:       sets FLAG_1 = true
note:       "Proactive allergy checking before sending orders to the kitchen. Dubai Food Code requires trained staff to be ready for allergen questions — asking first is elite service. Dana's expression changes. She has a serious shellfish allergy. The fact that YOU asked first tells the table you take safety seriously."
```

**Choice C — Focus only on Reem's questions**
```
arabic:     المَچْبُوس الدَّجَاج حَار وَلَّا لَا؟
roman:      al-machbuus ad-dajaaj haar walla la?
english:    Is the chicken machboos spicy or not? (engages only with Reem)
outcome:    neutral
impact:     { trust: +1, respect: -1, culture: +1 }
note:       "You answered Reem but ignored Noura and Dana who already gave clear orders. Capture all orders first, then handle individual questions."
```

**Choice D — Rush through**
```
arabic:     مَچْبُوس، مَچْبُوس، سَمَك. تَمَام
roman:      machbuus, machbuus, samak. tamaam
english:    Machboos, machboos, fish. Got it
outcome:    bad
impact:     { trust: -1, respect: -2, culture: -1 }
note:       "No confirmation of specifics, no allergy check. Noura watched you skip basic service steps."
```

### Phrases introduced: عندكم حساسية من شي

---

## TURN 4: The Allergy ⭐ FLAG 2 HIDDEN HERE

### Setting tag
`Hotel restaurant — table, 1:14 PM`

### Context
Dana reveals her shellfish allergy — responding to your question (FLAG_1) or bringing it up herself.

### Character dialogue

**If FLAG_1 set:**
```
[Dana — relieved]
Arabic:     إِي وَالله! عِنْدِي حَسَاسِيَّة مِنْ المَحَار. زَيْن إِنَّك سَأَلْت
Roman:      ii wallah! 'indi hasaasiyya min al-mahaar. zayn innak sa'alt
English:    Dana: "Yes! I have a shellfish allergy. Good that you asked"
```

**If FLAG_1 NOT set:**
```
[Dana — slightly anxious]
Arabic:     سُؤَال — السَّمَك المَشْوِي، يِنْطَبَخ يَمّ المَحَار؟ عِنْدِي حَسَاسِيَّة
Roman:      su'aal — as-samak al-mashwi, yintabakh yamm al-mahaar? 'indi hasaasiyya
English:    Dana: "Question — is the fish cooked near shellfish? I have an allergy"
```

### Choices (4)

**⭐ Choice A — Verify with the kitchen (FLAG 2)**
```
arabic:     أَكِيد. خَلِّنِي أَأَكِّد لِج مِنْ المَطْبَخ عَنْ طَرِيقَة الطَّبْخ. دَقِيقَة وَحْدَة
roman:      akiid. khallini a'akkid lij min al-matbakh 'an tariiqa at-tabkh. dagiiga wahda
english:    Of course. Let me confirm from the kitchen about the cooking method. One minute
outcome:    excellent
impact:     { trust: +3, respect: +2, culture: +1 }
flag:       sets FLAG_2 = true
note:       "You went to verify. When you return and say 'the chef will use a separate clean pan, no cross-contamination,' that's five-star service. Dubai Food Code requires cross-contamination prevention with separate equipment."
```

**Choice B — Reassure without checking (METER DIVERGENCE)**
```
arabic:     لَا تِشِيلِين هَم! السَّمَك المَشْوِي مَا فِيه مَحَار. إِنْتِي بِأَمَان
roman:      la tishiliin ham! as-samak al-mashwi ma fiih mahaar. inti bi-amaan
english:    Don't worry! The grilled fish doesn't have shellfish. You're safe
outcome:    good
impact:     { trust: -2, respect: +2, culture: +2 }
note:       "لا تشيلين هم is culturally perfect — Dana smiles. But you didn't check. The fish IS cooked on the same grill as shrimp. You prioritized comfort over safety. Trust drops because you gave unverified medical information."
```

**Choice C — Suggest she change her order**
```
arabic:     يِمْكِن أَحْسَن تِطْلِبِين المَچْبُوس بَدَال السَّمَك؟ أَضْمَن
roman:      yimkin ahsan titilbiin al-machbuus badaal as-samak? adhman
english:    Maybe order machboos instead of fish? Safer
outcome:    neutral
impact:     { trust: +1, respect: -1, culture: 0 }
note:       "Dana chose fish — your job is to make fish safe, not redirect her. Suggests your kitchen can't handle allergies."
```

**Choice D — Dismiss**
```
arabic:     مَا أَعْتَقِد فِيه مُشْكِلَة. السَّمَك سَمَك مُو مَحَار
roman:      ma a'taqid fiih mushkila. as-samak samak mu mahaar
english:    I don't think there's a problem. Fish is fish, not shellfish
outcome:    bad
impact:     { trust: -3, respect: -1, culture: -2 }
note:       "Dismissing a food allergy is dangerous. Shellfish allergies can cause anaphylaxis. Zero understanding of cross-contamination."
```

### Phrases introduced: أأكد لج من المطبخ، لا تشيلين هم

---

## TURN 5: Food Arrives

### Setting tag
`Hotel restaurant — table, 1:28 PM`

### Context
Food is ready. You bring three dishes. If FLAG_2 set, you confirmed the separate pan already.

### Choices (4)

**Choice A — Place each dish correctly without asking**
```
arabic:     مَچْبُوس اللَّحْم بِالتَّمْر حَقِّج... مَچْبُوس الدَّجَاج حَقِّج... وَالسَّمَك المَشْوِي مَع السَّلَطَة. بِالعَافِيَة!
roman:      machbuus al-lahm bit-tamr haggij... machbuus ad-dajaaj haggij... was-samak al-mashwi ma' as-salata. bil-'aafiya!
english:    Lamb machboos with dates for you... chicken machboos for you... and grilled fish with salad. Enjoy!
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +2 }
note:       "You remembered who ordered what without asking. Placed each dish correctly. Said بالعافية. Professional service — Noura noticed."
```

**Choice B — Serve and announce generally**
```
arabic:     تْفَضَّلُوا! مَچْبُوس لَحْم، مَچْبُوس دَجَاج، وَسَمَك مَشْوِي. بِالعَافِيَة
roman:      tfaddalu! machbuus lahm, machbuus dajaaj, w-samak mashwi. bil-'aafiya
english:    Here you go! Lamb machboos, chicken machboos, and grilled fish. Enjoy!
outcome:    good
impact:     { trust: +1, respect: +2, culture: +2 }
note:       "You announced dishes and said بالعافية. But you let them sort out plates themselves. Acceptable but not five-star."
```

**Choice C — Ask who ordered what**
```
arabic:     مِين طَلَبَت المَچْبُوس اللَّحْم؟
roman:      miin talabat al-machbuus al-lahm?
english:    Who ordered the lamb machboos?
outcome:    neutral
impact:     { trust: +1, respect: 0, culture: 0 }
note:       "At a three-person table, you should remember. Asking signals you weren't paying attention."
```

**Choice D — Place randomly and rush**
```
arabic:     تْفَضَّلُوا! (يِحُطّ الأَطْبَاق وَيِمْشِي)
roman:      tfaddalu! (yihutt al-atbaaq w-yimshi)
english:    Here you go! (places wrong dishes, leaves)
outcome:    bad
impact:     { trust: -1, respect: -1, culture: -1 }
note:       "Wrong dishes in front of wrong people. They swap plates themselves. Rushed and careless."
```

### Phrases introduced: بالعافية

---

## TURN 6: Check-In & Compliment ⭐ FLAG 3 HIDDEN HERE

### Setting tag
`Hotel restaurant — table, 1:31 PM (2-3 min after food)`

### Context
You return for the 2-minute check. Reem is photographing. Noura catches your eye.

### Character dialogue

**Warm** (score 24+):
```
[You]
"كل شي تمام?"

[Noura]
Arabic:     وَالله الأَكْل وَايِد لَذِيذ. المَچْبُوس يِذَكِّرْنِي بِالدُّوحَة
Roman:      wallah al-akl waayid ladhiidh. al-machbuus yidhakkirni bid-dooha
English:    Noura: "The food is really delicious. The machboos reminds me of Doha"

[Reem]
Arabic:     كْتِير طَيِّب! لَازِم أَحُط هَيْدَا عَالإِنْسْتَا
Roman:      ktiir tayyib! laazim ahut hayda 'al-insta
English:    Reem: "So good! I have to post this on Insta"
```

**Neutral** (score 14-23):
```
[Noura]
Arabic:     الأَكْل طَيِّب
English:    "The food is good" (brief)
```

**Cold** (score below 14):
```
[Noura]
Arabic:     ..تَمَام
English:    "..Fine"
```

> **🌍 DIALECT NOTE:**
> Reem: "كتير طيب" (ktiir tayyib) — pure Lebanese for "very good." Gulf: "وايد لذيذ."
> "هيدا" (hayda — this) — another Lebanese marker.

### Choices (4)

**Choice A — Accept compliment personally (METER DIVERGENCE)**
```
arabic:     شُكْراً! أَنَا دَايِماً أَحِرْص إِنّ الضُّيُوف يِنْبَسِطُون
roman:      shukran! ana daayman ahirs inn ad-dhuyuuf yinbistuun
english:    Thank you! I always make sure guests are happy
outcome:    good
impact:     { trust: -1, respect: +1, culture: -1 }
note:       "You took personal credit for the chef's work. Noura complimented the machboos, not your service. In Gulf culture, humility wins."
```

**⭐ Choice B — Credit the kitchen (FLAG 3)**
```
arabic:     يِسْلَمُوا الأَيَادِي! الشِّيف عِنْدَنَا مِنْ ١٥ سَنَة — يِطْبَخ بِقَلْب
roman:      yislamu al-ayaadi! ash-shiif 'indana min 15 sana — yitbakh bi-galb
english:    Bless the hands that made it! Our chef has been here 15 years — he cooks with heart
outcome:    excellent
impact:     { trust: +2, respect: +2, culture: +3 }
flag:       sets FLAG_3 = true
note:       "يسلموا الأيادي is THE phrase. Credits the kitchen while showing team loyalty. Noura hears: this waiter is humble and this restaurant retains talent. Both signal quality."
```

**Choice C — Deflect**
```
arabic:     شُكْراً! تِحِبُّون شَي ثَانِي؟
roman:      shukran! tihibbuun shay thaani?
english:    Thanks! Would you like anything else?
outcome:    neutral
impact:     { trust: +1, respect: 0, culture: 0 }
note:       "A missed moment. يسلموا الأيادي turns a compliment into warmth. You closed the door."
```

**Choice D — Oversell**
```
arabic:     أَكِيد! عِنْدَنَا أَحْسَن مَچْبُوس فِي دُبَي
roman:      akiid! 'indana ahsan machbuus fi dubai
english:    Of course! Best machboos in Dubai
outcome:    bad
impact:     { trust: -1, respect: -1, culture: -2 }
note:       "Telling a Qatari woman your machboos is the best in Dubai when she just said it reminds her of Doha — culturally tone-deaf."
```

### Phrases introduced: يسلموا الأيادي، كل شي تمام

---

## TURN 7: Dessert, Bill & Farewell

### Setting tag
`Hotel restaurant — table, 1:55 PM`

### Context
Plates cleared. SOP: offer dessert and coffee BEFORE bill. Then the bill fight.

### Character dialogue

*After dessert offer:*
```
[Reem]
Arabic:     عِنْدَكُم لُقَيْمَات؟ يَلَّا يَا بَنَات!
English:    Reem: "Do you have luqaimat? Come on girls!"

[Noura]
Arabic:     يَلَّا. وَقَهْوَة عَرَبِيَّة لَو سَمَحْت
English:    Noura: "Sure. And Arabic coffee please"
```

*After dessert, the bill:*
```
[Reem]
Arabic:     الحِسَاب لَو سَمَحْت!
English:    Reem: "The bill please!"

[Noura]
Arabic:     الحِسَاب عَلَيَّ اليُوم
English:    Noura: "The bill is on me today"

[Dana]
Arabic:     لَا خَلِّيني أَدْفَع! إِنْتِي دَايِماً تِدْفِعِين يَا نُورَة
English:    Dana: "No let me pay! You always pay, Noura"
```

> **🌍 CULTURAL NOTE — THE BILL FIGHT:**
> Rules: eldest usually wins. "عليّ" said firmly wins. NEVER hand to youngest. NEVER
> suggest splitting. Bill in a folder, placed near the person with authority. Never
> announce the total aloud.

### Choices (4)

**Choice A — Offer dessert first, then place bill near Noura quietly in folder**
```
arabic:     (بَعْد التَّحْلِيَة وَالقَهْوَة) تِشَرَّفْنَا فِيكُم. (يِحُطّ المِلَفّ جَنْب نُورَة)
roman:      (ba'd at-tahliya wal-gahwa) tisharrafna fiikum. (yihutt al-milaff janb nuura)
english:    (After dessert and coffee) We were honored by your visit. (Places bill folder near Noura)
outcome:    excellent
impact:     { trust: +2, respect: +3, culture: +3 }
note:       "Perfect sequence: dessert → coffee → bill. In a folder, near Noura, no total announced. تشرفنا فيكم to the whole group. You read the hierarchy, respected the ritual, and didn't take sides."
```

**Choice B — Offer dessert, place bill in center**
```
arabic:     (بَعْد التَّحْلِيَة) تْفَضَّلُوا الحِسَاب. نِتْمَنَّى إِنَّكُم اِنْبَسَطْتُوا
roman:      (ba'd at-tahliya) tfaddalu al-hisaab. nitamanna innakum inbasattuu
english:    (After dessert) Here's the bill. We hope you enjoyed
outcome:    good
impact:     { trust: +2, respect: +1, culture: +1 }
note:       "Center placement is safe but Noura clearly said 'it's on me.' Placing it in the center prolongs the fight. A skilled waiter resolves it."
```

**Choice C — Hand it to Reem**
```
arabic:     تْفَضَّلِي الحِسَاب (يِعْطِي رِيم)
roman:      tfaddali al-hisaab (yi'ti reem)
english:    Here's the bill (hands to Reem)
outcome:    bad
impact:     { trust: +1, respect: -2, culture: -3 }
note:       "Handing the bill to the youngest when the eldest claimed it overrides Noura's authority. Cultural mistake."
```

**Choice D — Suggest splitting**
```
arabic:     تِبُّون نِقْسِمَه عَلَى ثْلَاث؟
roman:      tibbuun nigsimah 'ala thlath?
english:    Split three ways?
outcome:    bad
impact:     { trust: 0, respect: -2, culture: -3 }
note:       "Never suggest splitting in Gulf dining. The bill fight is about generosity, not math."
```

### Phrases introduced: تحبون حلا أو قهوة، الحساب لو سمحت، تشرفنا فيكم

---

## BONUS TURN 8: The Reveal (SECRET PATH ONLY)

### Context
Noura pays. They stand to leave. Noura pauses, pulls out a business card.

### Character dialogue

```
[Noura]
Arabic:     اِسْمَع... أَنَا نُورَة المَنْصُورِي، مُدِيرَة الضِّيَافَة الإِقْلِيمِيَّة فِي مَجْمُوعَة الفَنَادِق.
            كُنْت أَقَيِّم الخِدْمَة هِنِي. وَصَرَاحَة — اِنْبَهَرْت.
            سَأَلْت عَنْ الحَسَاسِيَّة قَبْل مَا أَحَد يِقُول شَي. رُحْت لِلْمَطْبَخ تِتْأَكَّد.
            وَمَدَحْت فَرِيقَك بَدَال نَفْسَك.
            أَبِي أَتْكَلَّم مَع مُدِيرَك عَنْ شَرَاكَة تَمْوِين لِلْمُؤْتَمَرَات عِنْدَنَا.
English:    Noura: "Listen... I'm Noura Al Mansouri, Regional Hospitality Director.
            I was evaluating service here. Honestly — I was impressed.
            You asked about allergies before anyone said anything.
            You went to the kitchen to verify.
            And you praised your team instead of yourself.
            I want to talk to your manager about a catering partnership."

[Reem]
Arabic:     وَأَنَا — عِنْدِي ٥٠٠ أَلْف مُتَابِع. البُوسْت عَنْ المَچْبُوس طَالِع اللَّيلَة. حِضِّرُوا حَقّ الزَّحْمَة!
English:    Reem: "And me — I have 500K followers. The machboos post goes up tonight. Get ready for the rush!"
```

### Choices (2 — narrative, not scored)

**Choice A:**
```
arabic:     أَبْشِرِي! أَنَا أَوَصِّلِج لِلْمُدِير الْحِين. وَشُكْراً عَلَى الثِّقَة
english:    Consider it done! I'll connect you with the manager. Thank you for the trust
```

**Choice B:**
```
arabic:     يَا سَلَام! وَالله تِشَرَّفْنَا. خَلِّنِي أَجِيب المُدِير
english:    Truly honored. Let me get the manager
```

### Bonus phrase: أَبْشِرِي (abshiri)

---

## ENDING SCREENS

### 🔓 Secret: "The Hidden Evaluation" (التقييم السري)
**Trigger:** FLAG_1 + FLAG_2 + FLAG_3 + score ≥ 34

A catering contract. A 500K-follower post. One lunch shift changed the restaurant's year and your career. You caught it because you asked about safety before being told, verified instead of guessing, and praised your team instead of yourself.

**"Only 6% of users discover this ending"**

**Achievements:** "Hidden Evaluation", "Secret Path", "Service Elite"

### ✅ Warm: "The Repeat Customer" (الزبونة الدائمة)
**Trigger:** Score ≥ 36, missing any flag

Noura: "إن شاء الله نرجع بكرة" — They'll return. You served well. But a bigger opportunity was hidden in this lunch.

**Hint:** "1 of 4 endings. One changes more than your shift."

### ⚠️ Neutral: "The Quiet Table" (الطاولة الهادية)
**Trigger:** Score 20-35

"شكراً. مع السلامة." Nothing stood out. In Dubai, forgettable = replaceable.

### ❌ Cold: "The Bad Review" (التقييم السيء)
**Trigger:** Score below 20

Noura whispers to Reem. Reem puts her phone away. No post. No return. 500,000 people will never hear about this restaurant.

---

## SCORING SUMMARY

| Ending | Score | Flags | Seeded % |
|--------|-------|-------|----------|
| 🔓 Secret | ≥ 34 | All 3 | 6% |
| ✅ Warm | ≥ 36 | Missing any | 22% |
| ⚠️ Neutral | 20-35 | — | 48% |
| ❌ Cold | < 20 | — | 24% |

---

## WHAT THIS SCENE TEACHES

**Service SOP:** Water → menus → specials → drinks → food order → allergy check → serve → 2-min check → dessert/coffee → bill → farewell

**Vocabulary:** Food (مچبوس، سمك، لقيمات، كنافة، فتوش)، Service (بالعافية، حاضرين، تفضلوا)، Plural forms (تحبون، عندكم، فيكم)، Gender forms (تفضلي، حقج، لج)

**Cultural skills:** Hospitality-first sequencing, allergy protocols, the bill fight, crediting the kitchen, bill-in-folder etiquette

**3 dialects:** Qatari (شنو، أبي)، Emirati (شو، أبغي)، Lebanese (بدي، كتير، هيدا)
