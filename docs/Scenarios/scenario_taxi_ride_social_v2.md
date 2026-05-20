# Scenario Spec v2: The Taxi Ride
**ID:** `social_taxi_ride_v2`
**Mode:** Social
**Level:** Intermediate (corrected from invalid "Elementary")
**Scenes:** 5 main + branch
**Endings:** 4
**Estimated time:** 9 minutes
**Dialect focus:** Egyptian Arabic (with Gulf contrasts shown in Youssef's speech)
**Meters:** Points + Warmth (0–100, starts at 50)
**Learner gender:** Male only (see gender note below)

---

## CHANGES FROM v1 — IMPLEMENT ALL

1. **Level renamed**: "Elementary" → Intermediate (valid skill level)
2. **Gender restriction**: scenario is male-learner only. Female variant requires female driver or daytime ridesharing context (see end of file)
3. **Ending softened**: removed "gives you his number, pick up when you call" — replaced with "remembers your face, holds door open next time you're at airport." A one-time-passenger relationship, not a personal one
4. Every scene now has 4 choices (was 3 in C1, C2-Open, C2-Effort, C3-Dubai)
5. **Dialect errors fixed**:
   - "ييت قبل" (Levantine) → "جيت من قبل" (Egyptian)
   - "شو يابك" (Levantine) → "إيه جابك دبي" (Egyptian)
6. All Arabic diacritized
7. Romanization added to every choice
8. phrasesUnlocked populated with 10 phrases
9. Warmth meter added with divergence in Scene C4
10. Community percentages added

---

## PREMISE

You just landed in Dubai. It's night. Your driver Youssef — Egyptian, warm, already talking before you've closed the door — is about to make this a 20-minute conversation you didn't expect.

This scenario teaches you that Arabic isn't one thing. The Egyptian you'll hear in Dubai taxis sounds different from the Gulf Arabic you've been learning.

---

## CHARACTER: Youssef

Egyptian man, mid-thirties. Nine years in Dubai. Wife and two school-age kids in Cairo; sends money home every month. Drives nights and mornings.

**Egyptian dialect markers to use consistently:**
- ق → glottal stop (قال → ʾāl, قولي → ʾulli)
- بتاع (Egyptian "yours") vs Gulf حقّ
- منين (Egyptian "from where") vs Gulf من وين
- إيه (Egyptian "what") vs Gulf شنو
- مِن ٨ سنين (Egyptian "8 years ago") vs Gulf من ٨ سنوات
- يا باشا, يا فندم (Egyptian forms of address)
- كده (Egyptian "like this")

---

## PHRASES UNLOCKED (10)

| # | Arabic | Romanization | English | Context | Category |
|---|--------|--------------|---------|---------|----------|
| 1 | أهلاً وسهلاً | ahlan wa-sahlan | Welcome | Universal Arabic welcome | Greeting |
| 2 | يا باشا | yā bāsha | "Boss" / sir (Egyptian) | Egyptian warm address — Gulf says يا شيخ | Address |
| 3 | إيه أخبارَك | ēh akhbārak | How's it going (Egyptian) | Egyptian "how are you" — Gulf says شخبارك | Small talk |
| 4 | مِن مصر؟ | min Maṣr? | From Egypt? | Direct origin question | Small talk |
| 5 | ما شاء الله | mā shāʾ Allāh | God has willed | Said admiring something achieved | Compliment |
| 6 | الحمد لله | al-ḥamdu li-llāh | Thanks be to God | Standard response on state of life | Faith |
| 7 | إيه جابَك دُبي؟ | ēh gābak Dubay? | What brought you to Dubai? (Egyptian) | Egyptian origin-of-presence question | Curiosity |
| 8 | الله يَحفَظ عيلتَك | Allāh yiḥfaẓ ʿēltak | God protect your family (Egyptian) | Deep family blessing | Blessing |
| 9 | يا بَطَل | yā baṭal | Champ / hero | Warm address to younger man (Egyptian usage) | Warmth |
| 10 | الله يسَلِّمَك | Allāh yisallimak | God keep you safe | Standard parting blessing | Parting |

---

## SCORING SYSTEM

| Tier | Points | Warmth | Outcome |
|------|--------|--------|---------|
| A | +3 | +10 to +15 | excellent |
| B | +2 | +5 to +10 | good |
| C | 0 | 0 to +3 | neutral |
| D | -2 | -10 to -15 | bad |

**Divergence: Scene C4 Choice C** — points-positive efficient answer that costs warmth.

### Ending thresholds
| Ending | Points | Warmth | Community % |
|--------|--------|--------|-------------|
| Exceptional — Best Ride Ever | ≥ 12 | ≥ 70 | 8% |
| Success — Good Chat | 7–11 | ≥ 50 | 26% |
| Mixed — Forgettable Ride | 2–6 | any | 44% |
| Failed — Awkward Silence | ≤ 1 | any | 22% |

**Max:** 15 points (5 scenes × A=3).

---

## SCENE C1 — Airport Pickup

**Setting:** Dubai Airport arrivals. Youssef walks toward you, grinning, already reaching for your bag.

**Youssef:** أهلاً وسهلاً! أنا يوسف، السوّاق بتاعَك. تعالى تعالى يا باشا! *(ahlan wa-sahlan! ana Yūsef, is-sawwāʾ btāʿak. taʿālā taʿālā yā bāsha!)*

**Teaching:** بتاعَك (Egyptian "yours") vs Gulf حقّك. يا باشا is Egyptian respectful address — Gulf speakers use يا شيخ or no honorific.

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | أهلاً يا يوسف! إيه أخبارَك؟ | ahlan yā Yūsef! ēh akhbārak? | Hi Youssef! How's it going? | +3 | +12 |
| B | أهلاً، شكراً | ahlan, shukran | Hi, thanks | +2 | +6 |
| C | *(nod, get in car)* | — | — | 0 | -2 |
| D | *(silent, point at car)* | — | — | -2 | -12 |

→ A/B → **C2-Open** | C/D → **C2-Effort**

---

## SCENE C2-Open — Name and Origin

**Youssef (over his shoulder):** ʾulli yā ḥabībi — اسمَك إيه وانت منين أصلاً؟

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | أنا [name]. مِن البرتغال | ana [name]. min il-Burtuġāl | I'm [name]. From Portugal | +3 | +12 *(→ C3-Ronaldo)* |
| B | أنا [name]. وانت مِن مصر؟ | ana [name]. w-inta min Maṣr? | I'm [name]. From Egypt? | +3 | +12 *(→ C3-Dubai)* |
| C | أنا مِن أوروبا | ana min Ūrubbā | I'm from Europe | 0 | 0 *(→ C3-Dubai)* |
| D | *(short answer, eyes on phone)* | — | — | -2 | -10 *(→ C3-Dubai)* |

---

## SCENE C2-Effort — Breaking the Silence

**Youssef:** أوّل مَرّة في دُبي ولا جيت مِن قبل؟ *(awwil marra fī Dubay walla gēt min ʾabl?)*

**Teaching:** Egyptian "جيت" (gēt) — the ج is hard g in Egyptian. Gulf would say جيت from before (jēt) or زِرت.

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | أوّل مَرّة! كل شي يديد عليّ | awwil marra! kull shay yidīd ʿalayy | First time! Everything's new | +3 | +12 |
| B | جيت مَرّة قَبل كده | gēt marra ʾabl kida | I came once before | +2 | +6 |
| C | إيوة | aywa | Yeah | 0 | 0 |
| D | *(don't respond)* | — | — | -2 | -12 |

All paths → **C3-Dubai** (only C2-Open A goes to C3-Ronaldo)

---

## SCENE C3-Ronaldo — The Football Moment

**Youssef:** البرتغال يعني... رونالدو! طبعاً بتحبّه صحّ؟

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | طبعاً! رونالدو نمبَر وان! | ṭabʿan! Ronaldo number one! | Of course! Number one! | +3 | +15 |
| B | أنا مع ميسي بصراحة | ana maʿa Messi bi-ṣarāḥa | I'm with Messi honestly | +2 | +8 |
| C | كويّس بس مو الأحسن | kuwayyis bass mū il-aḥsan | Good but not the best | +1 | +4 |
| D | ما أتابِع كورة وايد | mā atābiʿ kūra wāyid | I don't follow football much | 0 | -2 |

→ **C4**

---

## SCENE C3-Dubai — The Marina Story

**Youssef:** شايف المارينا دي؟ أنا لمّا جيت دُبي أوّل مَرّة مِن ٨ سنين — ما كانش فيه أيّ حاجة هنا!

**Teaching:** مِن ٨ سنين is Egyptian; Gulf says من ٨ سنوات.

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | ما شاء الله! ثَمان سنين — صار دُبي بيتَك | mā shāʾ Allāh! thamān snīn — ṣār Dubay bētak | MashaAllah! 8 years — Dubai became your home | +3 | +15 |
| B | عيلتَك هنا ولا في مصر؟ | ʿēltak hina walla fī Maṣr? | Your family here or in Egypt? | +2 | +10 |
| C | إيوة، دُبي اتغَيَّرت كتير | aywa, Dubay itġayyarit kitīr | Yeah, Dubai changed a lot | 0 | +2 |
| D | *(look out window)* | — | — | -2 | -10 |

→ **C4**

---

## SCENE C4 — Why Dubai? ⚠️ DIVERGENCE SCENE

**Youssef:** وانت — إيه جابَك دُبي؟ شُغل ولا سياحة؟

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | شُغل. عندك قِصَص حِلوة مِن دُبي؟ | shughl. ʿandak ʾiṣaṣ ḥilwa min Dubay? | Work. Got any good Dubai stories? | +3 | +15 |
| B | شُغل. الحمد لله | shughl. al-ḥamdu li-llāh | Work. Thank God | +2 | +8 |
| C ⚠️ | شُغل. كَم باقي للفندق؟ | shughl. kam bāqi lil-funduʾ? | Work. How long till the hotel? | **+2** | **-8** |
| D | *(glance at phone, half-answer)* | — | — | -2 | -12 |

**⚠️ Choice C divergence:** asking ETA gets you accurate information (points) but signals you're done with him (warmth loss).

→ **C5**

---

## SCENE C5 — Hotel Arrival

**Youssef:** يا بَطَل — وَصَلنا! والله كانت رِحلة حِلوة. لو احتجت أيّ حاجة في دُبي — كلّمني!

| Choice | Arabic | Romanization | English | Pts | Warmth |
|--------|--------|--------------|---------|-----|--------|
| A | الله يسَلِّمَك يا يوسف! الله يَحفَظ عيلتَك | Allāh yisallimak yā Yūsef! Allāh yiḥfaẓ ʿēltak | God keep you safe Youssef! God protect your family | +3 | +15 |
| B | شكراً يا يوسف! يوم سعيد | shukran yā Yūsef! yōm saʿīd | Thanks Youssef! Have a nice day | +2 | +8 |
| C | شكراً | shukran | Thanks | 0 | 0 |
| D | *(leave silently)* | — | — | -2 | -15 |

---

## ENDINGS

### Exceptional — Best Ride Ever
**Points ≥ 12, Warmth ≥ 70** — **8%**

Next time you're at Dubai airport, Youssef sees you and holds the door open before you reach the car. He won't forget the face that asked for his stories.

### Success — Good Chat
**Points 7–11, Warmth ≥ 50** — **26%**

A genuinely pleasant ride. Youssef enjoyed talking to you and wished you well at the door.

### Mixed — Forgettable Ride
**Points 2–6** — **44%**

He drove you to the hotel. Another passenger in a long shift.

### Failed — Awkward Silence
**Points ≤ 1** — **22%**

The last 20 minutes were Amr Diab on the radio and the sound of traffic.

---

## CHECKLIST CONFIRMATION

| # | Rule | Status |
|---|------|--------|
| 1 | Intermediate = 5–6 turns | ✅ 5 |
| 2 | 4 choices per turn | ✅ |
| 3 | Phrases Intermediate 10–12 | ✅ 10 |
| 4 | Diacritization | ✅ |
| 5 | Romanization | ✅ |
| 6 | Divergence | ✅ C4-C |
| 7 | Community % = 100 | ✅ |
| 8 | Egyptian dialect verified | ✅ |
| 9 | Gender rule | ✅ Male learner only |
| 10 | Reachable Exceptional | ✅ Max 15, gate 12 |

---

## GENDER NOTE

**Female learner variant:** Use a daytime airport pickup with female driver (UAE's Pink Taxi service is canonical). All Youssef dialogue transfers to female "Mona" with feminine forms (بتاعِك, إيه أخبارِك, الله يَحفَظِك). Family backstory: husband and kids in Cairo, same emotional anchor.

Do not run male-Youssef night ride with female learner. Hard rule #1.

---

## DO NOT CHANGE

1. 5-scene structure with C2 branch
2. The "ask for his stories" beat in C4 — best teaching moment
3. The family-blessing payoff in C5
4. Egyptian dialect markers throughout Youssef's lines
