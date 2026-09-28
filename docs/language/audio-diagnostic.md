# Audio vendor diagnostic

Run this **before** paying for a batch. It takes ten minutes and decides whether
a generator is usable at all.

## Why

`ar-AE` is a locale tag, not a dialect model. Arabic TTS — device voices and
commercial AI generators alike — is trained on Modern Standard Arabic whatever
region tag it carries. Voice cloning does not fix this: cloning transfers timbre,
not dialect phonology, so a cloned Emirati voice still reads the script with MSA
vowels. Gulf-dialect TTS is an open research problem, not a solved product.

So the question is not "does this sound like a real person" — modern generators
all pass that. It is "does it say the Gulf form or the MSA form".

## The test

Generate these six, then compare each against its romanisation. The romanisation
is what the app teaches and what the learner reads on the card.

| Arabic | App teaches | MSA generator will say | Listen for |
|---|---|---|---|
| قهوة | **gahwa** | qahwa | first consonant: hard g, not q |
| شلونك؟ | **shloonak** | mangled, letter-by-letter | it is not an MSA word at all |
| وايد | **waayid** | waajid / rejected | the j |
| يديد | **yediid** | jadiid | first consonant: y, not j |
| چ (in any word carrying it) | **ch** | silence or k | absent from the MSA inventory |
| لو سمحت | **law samaht** | law samaht | should pass — a control |

## Passing

**All five diagnostics plus the control.** Not "close enough on most". A
generator that says *qahwa* is the problem this branch exists to remove, and
buying 124 clips of it reintroduces the violation at a higher price.

## If it fails

Do not buy the batch. Options, in order of preference:

1. Hire the two Emirati voices as originally specified. This is the known-good path.
2. Record a Gulf speaker and use speech-to-speech voice conversion — the
   phonology comes from the human, the timbre from the model. Still needs a Gulf
   speaker, so it saves studio quality, not hiring.
3. Ship silent. Romanisation already carries pronunciation and is documented as
   the authoritative channel. This is the current state and it is honest.

## Whatever is chosen

Record it per clip in `assets/audio/SOURCES.json`. `kind: "synthetic"` is an
acceptable, honest value. Presenting a synthesised clip as an Emirati recording
is not.
