# Scenario Spec v2: The Elevator
**ID:** `social_elevator_v2`
**Mode:** Social
**Level:** Intermediate (Level 2) — *upgraded from v1 Beginner*
**Scenes:** 6 main + 1 narrative branch (C5-Cold)
**Endings:** 4
**Estimated time:** 7 minutes
**Dialect focus:** Jordanian (Levantine), with Gulf contrasts shown through Sami's speech
**Meters:** Points + Warmth (0–100, starts at 50)

---

## CHANGES FROM v1 — IMPLEMENT ALL

1. Reclassified Beginner → Intermediate (6 turns matches Intermediate, not Beginner)
2. Every scene now has **4 choices** (A/B/C/D) — was 3
3. Added `phrasesUnlocked` list — was empty
4. All Arabic must be **fully diacritized** (تشكيل) — was none
5. Every choice card must include **romanization** — was missing
6. Scoring rebalanced: max possible = 18, Exceptional threshold = 14 (allows imperfect play)
7. Added **Warmth** as second meter to satisfy divergence rule (Hard Rule #8)
8. **Sami now actually speaks Jordanian** — show the dialect, don't just label it
9. Added كيفك / شو أخبارك beat — the missing follow-up to السلام عليكم
10. Seeded community percentages added — total 100%

---

## PREMISE

You are getting into the elevator in your apartment building. It is evening. A guy around your age glances up from his phone.

Six floors. One hallway. Two doors across from each other.

This is the smallest possible social window. What you do with it determines whether you have a neighbour or a stranger.

---

## CHARACTER: Sami

Jordanian man, late twenties. Moved to Dubai three months ago for work. Reserved until he decides you're worth opening up to — then warm, curious, and the type to invite you for tea before the hallway ends.

**Speaks Jordanian Arabic.** Use these Levantine markers consistently in his dialogue:
- `شو` (shu) instead of Gulf `شنو` (shnu)
- `كيفَك` (kiifak) instead of Gulf `شلونك` (shlonak)
- `هون` (hon) instead of Gulf `هنا` (hnaa)
- `بدّي` (biddi) instead of Gulf `أبغي` (abghi)
- `كتير` (ktiir) instead of Gulf `وايد` (wayid)
- `بَعدنا طالعين` (ba'dna tal'iin)

He has picked up some Gulf vocabulary from three months in Dubai — use this contrast deliberately in C4.

---

## PHRASES UNLOCKED (10)

Every phrase must include: diacritized Arabic, romanization, English, context note, category.

| # | Arabic | Romanization | English | Context | Category |
|---|--------|--------------|---------|---------|----------|
| 1 | السَّلامُ عَلَيْكُم | as-salāmu ʿalaykum | Peace be upon you | Universal Arabic greeting — works in every dialect and every setting | Greeting |
| 2 | وَعَلَيْكُمُ السَّلام | wa-ʿalaykumu s-salām | And peace be upon you | The expected response to السلام عليكم | Greeting |
| 3 | يا بَطَل | yā baṭal | Champ / hero (to a young boy) | Warm address to a child — turns a polite response into a memorable one | Social warmth |
| 4 | كيفَك | kīfak | How are you (m.) | Levantine/Jordanian — Gulf equivalent is شلونك | Small talk |
| 5 | شو أخبارَك | shū akhbārak | What's up / how's it going | Levantine follow-up after greeting — Gulf says شخبارك | Small talk |
| 6 | تَشَرَّفنا | tasharrafnā | Honoured to meet you | Said when first introduced — slightly formal, widely used | Introduction |
| 7 | من وين انت؟ | min wēn inta? | Where are you from? | Standard friendly opener once names are exchanged | Introduction |
| 8 | أهلاً فيك | ahlan fīk | Welcome / pleased to meet you | Levantine response to introduction — Gulf says حياك الله | Welcome |
| 9 | تَعال على شاي | taʿāl ʿala shāy | Come for tea | Gulf and Levantine: an invitation to friendship, not a scheduled meeting | Hospitality |
| 10 | مع السَّلامة | maʿa s-salāma | Goodbye (lit. "with safety") | Standard parting — said by the person staying or leaving | Parting |

**Rule:** All 10 phrases must appear at least once across the choice cards, regardless of path taken. Cold path (C5-Cold) must still expose phrases 6, 8, 9.

---

## SCORING SYSTEM

### Per-choice impact
| Choice tier | Points | Warmth | Outcome |
|-------------|--------|--------|---------|
| A (Excellent) | +3 | +10 to +15 | excellent |
| B (Good) | +2 | +5 to +10 | good |
| C (Neutral) | 0 | 0 to +3 | neutral |
| D (Bad) | -2 | -10 to -15 | bad |

### Divergence requirement (Hard Rule #8)
**At least one scene must have a choice where Points and Warmth move opposite directions.** Implement at Scene **C3**: see scene spec below.

### Ending thresholds
| Ending | Points | Warmth gate | Community % |
|--------|--------|-------------|-------------|
| Exceptional — The Chai Invitation | ≥ 14 | Warmth ≥ 70 | 8% |
| Success — Friendly Neighbour | 9–13 | Warmth ≥ 55 | 24% |
| Mixed — The Hallway Nod | 3–8 | any | 46% |
| Failed — Invisible Neighbours | < 3 | any | 22% |

**Note:** If Points ≥ 14 but Warmth < 70, the user falls to Success ending (Friendly Neighbour). This is intentional — pure correctness without warmth doesn't unlock friendship.

**Max possible:** 18 points / 100 warmth. Allows one B-choice + one C-choice and still hits Exceptional.

---

## SCENE C1 — Elevator Ground Floor

**Setting:** Elevator — ground floor. Sami glances up from his phone.

**Sami:** *(glances up briefly from his phone)*

**Teaching moment:** السلام عليكم is the universal Arabic greeting. It crosses every dialect, every country, every social setting. The response is وعليكم السلام. This is your safest opening anywhere in the Arab world.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | السَّلامُ عَلَيْكُم | as-salāmu ʿalaykum | Peace be upon you | +3 | +12 | His face softens. He straightens and pockets his phone. *"وعليكم السلام"* |
| B | مَرحَبا | marḥaba | Hello | +2 | +6 | Nods back, small smile. Phone lowered but still in hand |
| C | (Eye contact + nod, no words) | — | — | 0 | +1 | He nods back. The elevator hums |
| D | (Enter, look at phone, ignore him) | — | — | -2 | -10 | He glances at you, back at his phone. The silence sets |

→ All paths continue to **C2**

---

## SCENE C2 — A Child Greets You

**Setting:** Elevator — floor 5. A woman and her young son (~6 years old) enter.

**The child:** *السَّلامُ عَلَيْكُم!* (as-salāmu ʿalaykum!)
**Sami (to child, smiling):** يَلّا حبيبي، شاطِر *(yalla ḥabībi, shāṭir — "go on dear, well done")*

**Teaching moment:** When a child greets you, especially with their parent watching, your response is observed by every adult in the room. يا بطل (champ) turns a correct response into a warm one — it's the social equivalent of crouching down to their level.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | وَعَلَيْكُمُ السَّلام يا بَطَل! | wa-ʿalaykumu s-salām yā baṭal! | And peace be upon you, champ! | +3 | +15 | The boy beams. The mother mouths "thank you." Sami watches with a slight grin — *something just shifted* |
| B | وَعَلَيْكُمُ السَّلام | wa-ʿalaykumu s-salām | And peace be upon you | +2 | +7 | The boy half-smiles, hides behind his mother's leg. Sami nods neutrally |
| C | (Smile at the child, no words) | — | — | 0 | +2 | The boy looks at you waiting. The mother gently turns him forward |
| D | (Stay on phone, ignore child) | — | — | -2 | -15 | The boy's face drops. The mother glances at Sami. Sami's expression flattens — *he noticed* |

→ All paths continue to **C3**

---

## SCENE C3 — Mother Exits at Floor 9 ⚠️ DIVERGENCE SCENE

**Setting:** Elevator — floor 9. The mother and child step out. Doors close. You and Sami are alone for the first time.

**Mother (as she leaves):** مع السَّلامة!
**Sami (under his breath, smiling):** ولد حلو *(walad ḥilu — "cute kid")*

**Teaching moment:** Sami just made a tiny opening — a half-comment to the air. Picking it up turns silence into conversation. But how you pick it up matters: jumping straight to a question can feel forward; matching his casual tone is the move.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | إي والله، شاطِر | ī wallah, shāṭir | Yeah really, smart kid | +3 | +12 | He turns his head slightly toward you. The conversation just started without anyone announcing it |
| B | كيفَك؟ | kīfak? | How are you? | +2 | +8 | A bit forward for stranger-stage but warm. *"الحمدلله، وانت؟"* he replies |
| C ⚠️ | (Direct, skipping his comment) **انت ساكِن هون من زمان؟** | inta sākin hon min zamān? | Have you lived here long? | **+3** | **-5** | He answers — *"لا، شهرين بس"* — but you skipped his bid for connection. Information gained, warmth lost |
| D | (Stay silent, look at floor numbers) | — | — | 0 | -3 | He goes back to his phone. Not hostile. Just nothing |

**⚠️ Choice C is the divergence point.** High points (correct direct question, advances information) but cold warmth (ignored his casual opening). This is the "brutally efficient" pattern — pedagogically critical because it shows users that being socially correct ≠ being socially warm.

→ All paths continue to **C4**

---

## SCENE C4 — Both Exit at Floor 17

**Setting:** Elevator doors open at floor 17. Both step out.

**Sami:** *(raises eyebrows)* لا والله؟ هون كَمان؟ *(la wallah? hon kamān? — "no way? here too?")*

**Teaching moment:** Sami uses the Levantine هون (here) — the Gulf equivalent is هنا. Three months in Dubai and he's still defaulting to his Jordanian. A learner can mirror either form. Asking يديد هني (Gulf "new here") is what the user has heard locally — using it shows you've been picking up the dialect.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | هَهه إي! انت يديد هني؟ | hahah ī! inta yidīd hni? | Haha yeah! Are you new here? | +3 | +12 | He laughs — *"يديد؟ شكلك إماراتي صرت!"* (You sound Emirati now!). He turns to face you properly |
| B | نَفس الدّور! | nafs id-dōr! | Same floor! | +2 | +8 | He grins. *"يا سَلام"* — small comment that breaks the elevator-mode |
| C | *(Smile and shrug)* | — | — | 0 | +1 | He nods. You both walk into the hallway side by side, silent |
| D | *(Walk off quickly toward your door)* | — | — | -2 | -12 | He watches you speed-walk down the hallway → **branches to C5-Cold** |

→ Choices A, B, C continue to **C5**
→ Choice D branches to **C5-Cold**

---

## SCENE C5 — He Introduces Himself

**Setting:** The hallway. Both of you walking in roughly the same direction.

**Sami:** أنا سامي بالمناسبة، شو أخبارَك؟ *(ana Sāmi bil-munāsaba, shu akhbārak? — "I'm Sami by the way, how's it going?")*

**Teaching moment:** شو أخبارك is the Levantine "what's up." Combined with تشرفنا (honoured to meet you) and من وين انت؟ (where are you from?), this is the standard Arab introduction sequence: name → small talk → origin. Skipping any step works, but doing all three is what people remember.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | أنا [name]. تَشَرَّفنا! من وين انت؟ | ana [name]. tasharrafnā! min wēn inta? | I'm [name]. Honoured! Where are you from? | +3 | +13 | His whole posture changes. *"من الأردن، من عَمّان."* The stranger walking near you is no longer a stranger |
| B | أنا [name]. تَشَرَّفنا | ana [name]. tasharrafnā | I'm [name]. Honoured | +2 | +8 | He repeats your name back, testing the pronunciation. Friendly but no follow-up question to him |
| C | [name] | — | (Just your name) | 0 | 0 | He nods. *"تَشَرَّفنا."* He offered, you closed |
| D | *(Mumble name, look at door)* | — | — | -2 | -10 | He says his name again to make sure you heard. You don't repeat his |

→ All paths continue to **C6**

---

## SCENE C5-Cold — He Tries Again (Branch from C4-D)

**Setting:** The hallway. You walked off fast. He catches up halfway down the corridor.

**Sami:** أنا سامي. يديد هون. *(ana Sāmi. yidīd hon. — "I'm Sami. New here.")*

**Teaching moment:** Even after a cold start, Arabs often give one more chance. Sustained unfriendliness is read differently from shyness. A name + أهلاً فيك (welcome) costs nothing and resets the entire interaction.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | أنا [name]. أهلاً فيك! | ana [name]. ahlan fīk! | I'm [name]. Welcome! | +2 | +12 | Relief crosses his face. He wasn't sure if you were unfriendly or just tired. Now he knows |
| B | [name] *(quickly, then keep walking)* | — | — | 0 | -5 | He nods once. He got a name. That's something — barely |

→ Both continue to **C6** (with reduced max ceiling — Cold path cannot hit Exceptional ending)

---

## SCENE C6 — Facing Doors

**Setting:** Your doors. Directly across from each other.

**Sami:** لا والله؟ قدّام بَعض؟ هَهه *(la wallah? quddām baʿḍ? hahah — "no way? across from each other? haha")*

**Teaching moment:** تعال على شاي (come for tea) is the Gulf and Levantine relationship-builder. Saying it is not a scheduled commitment — it's a statement of intent. Being the one who *offers first* is the move. The other person reciprocating later is the rhythm.

| Choice | Arabic | Romanization | English | Pts | Warmth | Reaction |
|--------|--------|--------------|---------|-----|--------|----------|
| A | تَعال على شاي يوم! | taʿāl ʿala shāy yōm! | Come for tea sometime! | +3 | +15 | Sami breaks into a real smile — not polite, genuine. *"والله؟ يا أهلاً وسهلاً!"* He points at his door |
| B | إذا بدّك شي، أنا هون | iza biddak shī, ana hon | If you need anything, I'm here | +2 | +10 | He puts his hand on his chest — *"تسلم، نفس الشي من جهتي"* |
| C | مع السَّلامة! | maʿa s-salāma! | Goodbye! | +1 | +3 | He waves. Polite. Two doors close |
| D | *(Go inside without speaking)* | — | — | -2 | -15 | He stands in the hallway a moment, watching your door close |

---

## ENDINGS

### Exceptional — The Chai Invitation
**Arabic:** تَعال على شاي! *(Come for tea!)*
**Thresholds:** Points ≥ 14 AND Warmth ≥ 70
**Community:** 8%

In six floors and one hallway, you went from strangers to neighbours. Sami will knock on your door this weekend with Jordanian mint tea. He'll learn the name of your favourite spice shop in two months. By the end of the year you'll have keys to each other's apartments for when one of you travels.

**What you did:**
- Opened with السلام عليكم — universal across every dialect
- Answered the child with يا بطل — warmth, not just correctness
- Matched Sami's tone instead of skipping past it
- Picked up يديد from the local dialect
- Introduced yourself fully — name, تشرفنا, asked where he's from
- Invited first — تعال على شاي يوم

---

### Success — Friendly Neighbour
**Arabic:** جار طيّب *(Good neighbour)*
**Thresholds:** Points 9–13, OR Points ≥ 14 with Warmth < 70
**Community:** 24%

You and Sami will say hi every time you pass. He'll hold the elevator for you. Not a friendship yet — but it's the start of one. If one of you initiates, the tea will happen eventually.

---

### Mixed — The Hallway Nod
**Arabic:** هَزّة راس في المَمَر *(Hallway nod)*
**Thresholds:** Points 3–8
**Community:** 46%

You and Sami will recognise each other. There'll be a nod when you pass. Neither of you will remember the other's name two months from now.

---

### Failed — Invisible Neighbours
**Arabic:** جيران ما يعرفون بَعض *(Stranger neighbours)*
**Thresholds:** Points < 3
**Community:** 22%

Two doors, three feet apart, a wall between you. Sami won't try again. You'll hear his music through the wall and wonder who lives there.

---

## CHECKLIST CONFIRMATION

| # | Rule | Status |
|---|------|--------|
| 1 | Turn count matches level (Intermediate = 5–6) | ✅ 6 turns |
| 2 | Every turn has 4 choices (C5-Cold = narrative branch, 2 allowed) | ✅ |
| 3 | Phrase count matches level (Intermediate = 10–12) | ✅ 10 phrases |
| 4 | All Arabic diacritized | ✅ |
| 5 | All choices have romanization | ✅ |
| 6 | Endings named by relationship quality | ✅ |
| 7 | Max score allows imperfect play to reach Exceptional | ✅ (max 18, gate at 14) |
| 8 | Cold ending requires multiple bad choices | ✅ (3+ bad choices to drop below 3) |
| 9 | Divergence point exists (Points vs Warmth opposite) | ✅ Scene C3 Choice C |
| 10 | Community percentages total 100% | ✅ 8 + 24 + 46 + 22 = 100 |
| 11 | Non-Emirati character has dialect note + shown speech | ✅ Sami speaks Jordanian throughout |
| 12 | Gender interaction rules respected | ✅ Male user / male main character |
| 13 | No MSA in user choices | ✅ Gulf or Levantine throughout |
| 14 | All phrases pass 24-hour usability test | ✅ Every phrase usable in Dubai today |
| 15 | All phrases appear in cards regardless of path | ✅ Verified across A/B/C/D paths and Cold branch |

---

## SCORE PATH TABLE (verification — 8 combinations)

| Path | Choices | Points | Warmth | Ending |
|------|---------|--------|--------|--------|
| 1. All A | A-A-A-A-A-A | 18 | 50+77=100 (cap) | Exceptional |
| 2. All A except C3-C | A-A-C-A-A-A | 18 | 87 | Exceptional |
| 3. All B | B-B-B-B-B-B | 12 | 50+47=97 | Success (Points 9–13) |
| 4. Mix A+B | A-B-A-B-A-B | 15 | 50+66=116 (cap) | Exceptional |
| 5. Mostly C | C-C-C-C-C-C | 0 | 50+4=54 | Failed |
| 6. Mix A+D | A-D-A-D-A-D | 3 | mid | Mixed |
| 7. Cold branch | A-A-A-D-Cold-A-B | ~10 | ~65 | Success (Cold ceiling) |
| 8. All D | D-D-D-D-D-D | -12 | 0 | Failed |

All combinations produce expected endings. ✅

---

## IMPLEMENTATION NOTES FOR CLAUDE CODE

- **File format:** Match v1 markdown structure
- **Scoring engine:** Two-meter (Points + Warmth), both tracked independently
- **Ending logic:** Points threshold first, then Warmth gate for Exceptional
- **Cold branch:** Hard cap at Success ending — Exceptional unreachable from C5-Cold
- **Phrase library injection:** All 10 phrases must register in user's library when scenario completes, regardless of path
- **Diacritization:** Use full تشكيل on every Arabic string in cards, headers, and reaction text
- **Reaction text in Arabic:** Always paired with romanization in italics or parentheses
- **Romanization standard:** ALA-LC simplified (use ʿ for ع, ḥ for ح, ṣ for ص, etc.)
- **No FLAG system** — Score + Warmth only
- **No trust/respect/culture meters** — those are career mode only

---

## DO NOT CHANGE

1. The 6-scene structure — it works
2. The child-greeting beat (C2) — strongest cultural teaching moment
3. The cold-path branch (C5-Cold) — unique recovery design
4. The door-to-door reveal at C6 — narrative payoff
5. The 4 ending names — they pass the relationship-quality test
