import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../components/design/spacing';
import { MotiView } from 'moti';
import { X } from '../components/icons';
import * as Haptics from 'expo-haptics';
import {
  FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI,
} from '../components/design/tokens';
import { useTheme } from '../hooks/useTheme';
import { useTypewriter } from '../components/design/hooks';
import { ThresholdSeam } from '../components/design/ThresholdSeam';
import { WaveBars } from '../components/features/WaveBars';
import { RippleEffect } from '../components/ui/RippleEffect';
import { EmptyState } from '../components/ui/EmptyState';
import { GhostLetters, Screen } from '../components/ui';
import { getScenarioScript, getScenarioById, isScenarioAvailableFor } from '../constants/scenarios';
import { PHRASES } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import {
  getTone, resolveNextScene, evaluateEnding, isChoiceVisible, phrasesEarned, allPhraseIds,
  sceneAfterChoice,
} from '../engine/scenarioEngine';
import {
  choiceFeedback, npcLine, endingsProgress, destinationMoments, hintsToShow,
  type ChoiceFeedback,
} from '../engine/scenarioPresentation';
import { DECISIONS_PER_RUN } from '../constants/curriculum';
import { railMarks } from '../engine/marginRail';
import type { RailMark } from '../engine/marginRail';
import {
  trackScenarioStarted,
  trackScenarioChoiceMade,
  trackScenarioCompleted,
  trackScenarioAbandoned,
} from '../lib/analytics';
import { ScenarioIntroPhase } from '../components/scenario/ScenarioIntroPhase';
import { ScenarioChoiceResultPhase } from '../components/scenario/ScenarioChoiceResultPhase';
import { ScenarioResultPhase } from '../components/scenario/ScenarioResultPhase';
import { MarginRail } from '../components/scenario/MarginRail';
import type { UserProfile, ScenarioChoice, ScenarioScene, ScenarioEnding, Phrase, Tone } from '../types';

interface Props {
  scenarioId: string;
  user: UserProfile | null;
  onExit: () => void;
  onComplete?: (scenarioId: string, endingType: string) => void;
  onJournalEntry?: (arabic: string, english: string, insight: string) => void;
}

type Phase = 'intro' | 'scene' | 'choice-result' | 'result';

/** Phrase ids → library entries, dropping any id the library doesn't have. */
function toPhrases(ids: string[]): Phrase[] {
  return ids.map(id => PHRASES.find(p => p.id === id)).filter((p): p is Phrase => p !== undefined);
}

// ─── Impact bar (trust / respect / culture) shown during play ────────────────
function ImpactCol({ label, value, color, maxVal }: { label: string; value: number; color: string; maxVal: number }) {
  const { C } = useTheme();
  const absMax = Math.max(Math.abs(maxVal), 3);
  const pct = Math.min(Math.max(Math.abs(value), 0) / absMax, 1);
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2, position: 'relative' }}>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, letterSpacing: 0.9, textTransform: 'uppercase' }}>{label}</Text>
      <MotiView
        key={`stat-${label}-${value}`}
        from={{ scale: 1.35, translateY: -4 }}
        animate={{ scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      >
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: value !== 0 ? color : C.TEXT3 }}>{value > 0 ? `+${value}` : value}</Text>
      </MotiView>
      <View style={{ width: '100%', height: 3, backgroundColor: C.BORDER2, borderRadius: 2, overflow: 'hidden' }}>
        <MotiView
          animate={{ width: `${pct * 100}%` as any }}
          transition={{ type: 'timing', duration: 400 }}
          style={{ height: 3, backgroundColor: color, borderRadius: 2 }}
        />
      </View>
    </View>
  );
}

function ImpactBar({ trust, respect, culture, maxValues }: { trust: number; respect: number; culture: number; maxValues?: { trust: number; respect: number; culture: number } }) {
  const { C } = useTheme();
  const max = maxValues ?? { trust: 12, respect: 12, culture: 12 };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
      <ImpactCol label="Trust" value={trust} color={C.CULTURAL_GOLD} maxVal={max.trust} />
      <View style={{ width: 1, height: 28, backgroundColor: C.BORDER, marginHorizontal: 10 }} />
      <ImpactCol label="Respect" value={respect} color={C.JADE2} maxVal={max.respect} />
      <View style={{ width: 1, height: 28, backgroundColor: C.BORDER, marginHorizontal: 10 }} />
      <ImpactCol label="Culture" value={culture} color={C.VIOLET} maxVal={max.culture} />
    </View>
  );
}

// ─── Dialogue bubble ──────────────────────────────────────────────────────────
function DialogueBubble({ scene, tone = 'neutral', gender }: { scene: ScenarioScene; tone?: Tone; gender: 'male' | 'female' | undefined }) {
  const { C } = useTheme();
  const accentText = C.JADE;
  const [arabicRevealed, setArabicRevealed] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);

  // Tone variant (warm/cold only when authored), in the forms this learner is
  // addressed in — a female learner hears شلونج, not شلونك.
  const dialogue = npcLine(scene, tone, gender);

  const { displayed } = useTypewriter(translationRevealed ? dialogue.english : '', 28, 50);
  const { speakAs, isSpeaking: playingAudio } = useArabicTTS();
  const initial = scene.charName.charAt(0).toUpperCase();

  // Butterfly effect indicators
  const hasToneShift = !!scene.charDialogue && tone !== 'neutral';
  const toneColor = tone === 'warm' ? C.JADE_ACCENT : C.TEXT3;

  useEffect(() => {
    setArabicRevealed(false);
    setTranslationRevealed(false);
    speakAs(dialogue.arabic, scene.charGender);
    const t1 = setTimeout(() => setArabicRevealed(true), 900);
    const t2 = setTimeout(() => setTranslationRevealed(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [dialogue.arabic, scene.charGender, speakAs]);

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER,
        alignSelf: 'flex-start', marginBottom: hasToneShift ? 8 : 14,
      }}>
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.JADE }} />
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2 }}>{scene.setting}</Text>
      </View>

      {/* Butterfly effect badge — only appears when past choices changed this NPC response */}
      {hasToneShift && (
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            alignSelf: 'flex-start', marginBottom: 12,
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
            backgroundColor: tone === 'warm' ? C.JADE_ACCENT_DIM : C.SURFACE,
            borderWidth: 1, borderColor: tone === 'warm' ? C.JADE_ACCENT_BORDER : C.BORDER,
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: toneColor }} />
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: toneColor, letterSpacing: 0.5 }}>
            {tone === 'warm' ? 'Your choices shaped this response' : 'Your choices echo here'}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: C.JADE_ACCENT_DIM,
          borderWidth: hasToneShift ? 1.5 : 1,
          borderColor: tone === 'cold' ? C.BORDER : C.JADE_ACCENT_BORDER,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE_ACCENT }}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 6 }}>{scene.charName}</Text>
          <Pressable onPress={() => { setArabicRevealed(true); setTranslationRevealed(true); }}>
            <View style={{
              borderRadius: 16, borderTopLeftRadius: 0, padding: 14,
              backgroundColor: tone === 'cold' ? C.SURFACE : C.JADE_ACCENT_SURFACE,
              borderWidth: 1,
              borderColor: tone === 'cold' ? C.BORDER : C.JADE_ACCENT_BORDER,
              minHeight: 72,
            }}>
              {!arabicRevealed ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <WaveBars isPlaying={playingAudio} size="md" color={C.JADE_ACCENT} />
                </View>
              ) : (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 280 }}>
                  <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: accentText, textAlign: 'right', lineHeight: 32, marginBottom: 6 }}>
                    {dialogue.arabic}
                  </Text>
                  <ThresholdSeam height={7} style={{ marginBottom: translationRevealed ? 8 : 0 }} />
                  {translationRevealed && (
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 250 }}>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${accentText}80`, fontStyle: 'italic', marginBottom: 4 }}>{dialogue.roman}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 20 }}>{`"${displayed}"`}</Text>
                    </MotiView>
                  )}
                </MotiView>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => speakAs(dialogue.arabic, scene.charGender)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}
          >
            <WaveBars isPlaying={playingAudio} size="sm" color={playingAudio ? C.JADE2 : C.TEXT3} />
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: playingAudio ? C.JADE2 : C.TEXT3 }}>
              {playingAudio ? STRINGS.scenarios.playing : STRINGS.scenarios.listenVoice(scene.charGender)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ScenarioPlayer({ scenarioId, onExit, onComplete, onJournalEntry }: Props) {
  const { C } = useTheme();
  // C.JADE reads well on both dark and light; C.VIOLET is safe for both modes
  const accentColor = C.JADE;
  const outcomeColor: Record<string, string> = useMemo(
    () => ({ excellent: C.JADE2, good: C.JADE_ACCENT, neutral: C.VIOLET2, bad: C.ERROR }),
    [C]
  );
  const insets = useSafeAreaInsets();
  // Doherty threshold: keep the player responsive under 400ms.
  // getScenarioScripts() is an arrow function returning a ~1,140-line object
  // literal, and getAllScenarios() spreads three more builders. Called bare in
  // the render body — as these were — the entire scenario corpus was rebuilt on
  // every state change: every phase transition, every choice tap, every
  // typewriter tick in a child. On the low-end Android hardware this app is
  // aimed at, that is exactly the kind of cost that turns a tap into a stutter.
  // It also defeated every downstream memo, since `scriptData` was a fresh
  // reference each render.
  const scriptData = useMemo(() => getScenarioScript(scenarioId, C), [scenarioId, C]);
  const scenario = useMemo(() => getScenarioById(scenarioId, C), [scenarioId, C]);

  const { speak, isSpeaking } = useArabicTTS();
  // Subscribes to the cache itself: the ending stats are fetched once the result
  // phase starts, so the screen has to re-render when they land.
  const communityStatsCache = useAppStore((s) => s.communityStatsCache);
  const fetchCommunityEndingStats = useAppStore((s) => s.fetchCommunityEndingStats);
  const recordChoiceStatAction = useAppStore((s) => s.recordChoiceStat);
  const user = useAppStore((s) => s.user);
  const activeScenarioState = useAppStore((s) => s.activeScenarioState);
  const foundEndingIds = useAppStore((s) => s.endingsFound[scenarioId]);
  const runCount = useAppStore((s) => s.scenarioRuns[scenarioId] ?? 0);

  // Track length is the scenario's authored decision count, not one derived from
  // the script — scripts branch, so the script's choice-scene count is an upper
  // bound on a run rather than the length of one.
  const railMarksForRun = useMemo(
    () => (activeScenarioState && scriptData
      ? railMarks(activeScenarioState, scriptData, scenario?.decisions ?? 0)
      : []),
    [activeScenarioState, scriptData, scenario],
  );
  const startScenario = useAppStore((s) => s.startScenario);
  const applyScenarioChoice = useAppStore((s) => s.applyScenarioChoice);
  const advanceScenarioScene = useAppStore((s) => s.advanceScenarioScene);
  const finalizeScenario = useAppStore((s) => s.finalizeScenario);
  const unlockPhrases = useAppStore((s) => s.unlockPhrases);
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [playingChoiceId, setPlayingChoiceId] = useState<string | null>(null);

  // TTS timer refs for cleanup
  const choiceTtsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phraseTtsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount (abandonScenario is NOT called here — the OS can
  // unmount/remount this component during background/foreground cycles, which
  // would silently destroy mid-game progress. Call it explicitly in onExit instead.)
  useEffect(() => {
    return () => {
      if (choiceTtsTimerRef.current) clearTimeout(choiceTtsTimerRef.current);
      if (phraseTtsTimerRef.current) clearTimeout(phraseTtsTimerRef.current);
    };
  }, []);

  // Bootstrap: initialise the run when the component mounts.
  // A gender-restricted scenario must not start a run even though the render
  // below blocks it — otherwise activeScenarioState still ends up populated
  // with a run the learner was never supposed to see.
  useEffect(() => {
    if (scriptData && isScenarioAvailableFor(scenario ?? {}, user?.gender)) {
      startScenario(scenarioId, scriptData.scenes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);
  // toneHistory is local UI state — records tone at scene entry for the end-screen arc
  const [toneHistory, setToneHistory] = useState<{ sceneId: string; tone: 'warm' | 'neutral' | 'cold' }[]>([]);
  // lastResolvedNextSceneId holds the branch target from the most recent choice (for next())
  const [lastResolvedNextSceneId, setLastResolvedNextSceneId] = useState<string | null>(null);
  // finalizedEnding/finalizedImpact lock the evaluated ending and T/R/C totals before
  // finalizeScenario() nulls activeScenarioState — otherwise the result screen would
  // render with a zeroed-out score the instant it appears.
  const [finalizedEnding, setFinalizedEnding] = useState<ScenarioEnding | null>(null);
  const [finalizedImpact, setFinalizedImpact] = useState<{ trust: number; respect: number; culture: number } | null>(null);
  // Same lock, same reason: the ending screen shows the completed rail, and
  // finalizeScenario() nulls the state the rail is derived from. Without this
  // the rail empties itself the instant the result appears.
  const [finalizedRail, setFinalizedRail] = useState<RailMark[] | null>(null);
  // Same lock again: "what sent you here" reads choiceHistory, which is gone
  // the moment finalizeScenario() runs.
  const [finalizedMoments, setFinalizedMoments] = useState<ScenarioChoice[]>([]);

  const playChoice = useCallback((choiceId: string, arabic: string) => {
    if (choiceTtsTimerRef.current) clearTimeout(choiceTtsTimerRef.current);
    setPlayingChoiceId(choiceId);
    speak(arabic);
    choiceTtsTimerRef.current = setTimeout(() => {
      setPlayingChoiceId(null);
      choiceTtsTimerRef.current = null;
    }, 4000);
  }, [speak]);

  const playEndPhrase = useCallback((phraseId: string, arabic: string) => {
    if (phraseTtsTimerRef.current) clearTimeout(phraseTtsTimerRef.current);
    setPlayingPhraseId(phraseId);
    speak(arabic);
    phraseTtsTimerRef.current = setTimeout(() => {
      setPlayingPhraseId(null);
      phraseTtsTimerRef.current = null;
    }, 4000);
  }, [speak]);

  // ─── Effects must be declared before any early return (Rules of Hooks) ───────
  // Only schedules the reveal delay — choicesVisible/selectedChoiceId are reset
  // synchronously in next() (in the same batch as setStep/setPhase) rather than
  // here. This effect runs one render AFTER the new scene's key change already
  // remounted the scene subtree, so resetting choicesVisible here let the
  // previous scene's choices flash fully visible for one frame before this
  // caught up and hid them again.
  useEffect(() => {
    if (phase === 'scene') {
      const t = setTimeout(() => setChoicesVisible(true), 1100);
      return () => clearTimeout(t);
    }
  }, [phase, step]);

  useEffect(() => {
    if (phase === 'result' && scriptData) {
      void fetchCommunityEndingStats(scenarioId, scriptData.endings.map(e => e.id));
    }
  }, [phase, scenarioId, scriptData, fetchCommunityEndingStats]);

  useEffect(() => {
    if (!scriptData || phase !== 'result' || completionFired || !activeScenarioState) return;
    const currEnding = evaluateEnding(activeScenarioState, scriptData);
    setFinalizedEnding(currEnding);
    setFinalizedImpact(Object.values(activeScenarioState.impactByNpc).reduce(
      (acc, d) => ({
        trust:   acc.trust   + d.trust,
        respect: acc.respect + d.respect,
        culture: acc.culture + d.culture,
      }),
      { trust: 0, respect: 0, culture: 0 }
    ));
    setFinalizedRail(railMarks(activeScenarioState, scriptData, scenario?.decisions ?? 0));
    setFinalizedMoments(destinationMoments(activeScenarioState.choiceHistory, scriptData, currEnding));
    setCompletionFired(true);
    finalizeScenario(currEnding);
    // Actually unlock the phrases the result screen is about to present as
    // unlocked. Without this, unlockPhrase() was only ever called from
    // onboarding, so every phrase earned by finishing a scenario stayed
    // un-unlocked in the library and the two screens disagreed. One bulk write
    // rather than one per phrase — this fires as the result screen animates in.
    // Same function as the result screen's list, so the two cannot disagree.
    unlockPhrases(phrasesEarned(scriptData, currEnding));
    trackScenarioCompleted({
      scenarioId,
      title: scriptData.title,
      endingType: currEnding.type,
      endingId: currEnding.title,
      sceneCount: activeScenarioState.choiceHistory.length,
    });
    const hapticType =
      currEnding.type === 'failed' ? Haptics.NotificationFeedbackType.Error
      : currEnding.type === 'mixed' ? Haptics.NotificationFeedbackType.Warning
      : Haptics.NotificationFeedbackType.Success;
    void Haptics.notificationAsync(hapticType).catch(() => {});
    onComplete?.(scenarioId, currEnding.type);
    if (currEnding.type !== 'failed') onJournalEntry?.(currEnding.arabic, currEnding.en, currEnding.desc);
  }, [phase, completionFired, scenarioId, scriptData, scenario, activeScenarioState, onComplete, onJournalEntry, finalizeScenario, unlockPhrases]);

  // Record scene progress as user advances through scenes
  const recordSceneProgress = useAppStore((s) => s.recordSceneProgress);
  useEffect(() => {
    if (phase === 'scene' && step < (scriptData?.scenes.length ?? 0)) {
      recordSceneProgress(scenarioId, step);
    }
  }, [step, phase, scenarioId, scriptData?.scenes.length, recordSceneProgress]);

  // ─── Hooks that depend on scriptData must use optional chaining ──────────────
  const scenes = useMemo(() => scriptData?.scenes ?? [], [scriptData?.scenes]);
  const scene = scenes[step];
  const endings = scriptData?.endings ?? [];

  // Record NPC tone the moment each scene is entered (engine-driven)
  useEffect(() => {
    if (phase !== 'scene' || !scene?.charDialogue || !activeScenarioState) return;
    setToneHistory(prev => {
      if (prev.some(t => t.sceneId === scene.id)) return prev;
      const entryTone = getTone(activeScenarioState, scene.charName, scene);
      return [...prev, { sceneId: scene.id, tone: entryTone }];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);



  // Calculate max possible meter values for this scenario (for bar scaling)
  const maxMeterValues = useMemo(() => {
    let maxTrust = 0, maxRespect = 0, maxCulture = 0;
    scenes.forEach(scene => {
      scene.choices.forEach(choice => {
        const imp = choice.impact || { trust: 0, respect: 0, culture: 0 };
        if (imp.trust > 0) maxTrust += imp.trust;
        if (imp.respect > 0) maxRespect += imp.respect;
        if (imp.culture > 0) maxCulture += imp.culture;
      });
    });
    // Ensure minimum scale for visibility
    return { trust: Math.max(maxTrust, 3), respect: Math.max(maxRespect, 3), culture: Math.max(maxCulture, 3) };
  }, [scenes]);

  const culturalJourneyNotes = useMemo(() => {
    if (!activeScenarioState || !scriptData) return [];
    return activeScenarioState.choiceHistory
      .map(({ sceneId, choiceId }) => {
        const sc = scriptData.scenes.find(s => s.id === sceneId);
        const ch = sc?.choices.find(c => c.id === choiceId);
        return ch?.note;
      })
      .filter((note): note is string => Boolean(note))
      .slice(0, 4);
  }, [activeScenarioState, scriptData]);

  // Helper to replace [name] placeholder with user's name
  const replaceName = useCallback((text: string): string => {
    const userName = user?.name || 'friend';
    return text.replace(/\[name\]/g, userName);
  }, [user?.name]);

  // Returns the correct Arabic phrasing for the user's gender.
  // Falls back to the default (male-form) arabic when arabicFeminine is not authored.
  const arabicForUser = useCallback((choice: ScenarioChoice): string => {
    if (user?.gender === 'female' && choice.arabicFeminine) return choice.arabicFeminine;
    return choice.arabic;
  }, [user?.gender]);

  const handleChoice = useCallback((choice: ScenarioChoice) => {
    if (selectedChoiceId || !scenes[step] || !activeScenarioState || !scriptData) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Resolve next scene BEFORE applying choice (pre-choice state is sufficient;
    // resolveNextScene only reads currentSceneId, which applyChoice does not mutate)
    const resolved = resolveNextScene(activeScenarioState, choice, scriptData);
    setLastResolvedNextSceneId(resolved);

    // Apply choice to engine state (updates flags, impact, totalScore, choiceHistory)
    applyScenarioChoice(choice, scenes[step].charName);

    setSelectedChoiceId(choice.id);
    void recordChoiceStatAction(scenarioId, scenes[step].id, choice.id);
    trackScenarioChoiceMade({ scenarioId, sceneId: scenes[step].id, choiceText: choice.text, flag: choice.flag });
    setTimeout(() => setPhase('choice-result'), 600);
  }, [selectedChoiceId, activeScenarioState, scriptData, applyScenarioChoice, recordChoiceStatAction, scenarioId, scenes, step]);

  const next = useCallback(() => {
    setSelectedChoiceId(null);
    // Reset synchronously, in the same batch as setStep/setPhase below — the
    // scene subtree remounts via key={`scene-${step}`}, but choicesVisible
    // lives in this parent and does not reset on its own, so resetting it a
    // render late (as the [phase, step] effect used to) let the new scene's
    // choices flash visible for one frame using the previous scene's value.
    setChoicesVisible(false);

    // Where to go is an engine decision (sceneAfterChoice): next main-path
    // scene, the bonus scene when the hidden ending was just earned, or the
    // result. Following lastResolvedNextSceneId directly — as this used to —
    // walked every player into a bonus scene sitting next in the array.
    const target = activeScenarioState && scriptData
      ? sceneAfterChoice(activeScenarioState, lastResolvedNextSceneId, scriptData)
      : null;
    setLastResolvedNextSceneId(null);
    const targetIndex = target ? scenes.findIndex(s => s.id === target) : -1;
    if (target === null || targetIndex === -1) {
      setPhase('result');
      return;
    }
    advanceScenarioScene(target);
    setStep(targetIndex);
    setPhase('scene');
  }, [scenes, scriptData, activeScenarioState, lastResolvedNextSceneId, advanceScenarioScene]);

  const handleShare = useCallback(async (endingTitle: string, endingArabic: string, endingEn: string, isSecret: boolean, finalTotal: number) => {
    const scenarioTitle = scriptData?.title ?? STRINGS.scenarios.shareFallbackTitle;
    const message = isSecret
      ? STRINGS.scenarios.shareHiddenMessage(scenarioTitle, endingArabic, endingEn)
      : STRINGS.scenarios.shareMessage(finalTotal, scenarioTitle, endingTitle, endingArabic, endingEn);
    try {
      await Share.share({ message });
    } catch { /* user dismissed share sheet — no-op */ }
  }, [scriptData?.title]);

  const restart = useCallback(() => {
    if (scriptData) startScenario(scenarioId, scriptData.scenes[0].id);
    setPhase('intro');
    setStep(0);
    setSelectedChoiceId(null);
    setChoicesVisible(false);
    setCompletionFired(false);
    setToneHistory([]);
    setLastResolvedNextSceneId(null);
    setFinalizedEnding(null);
    setFinalizedImpact(null);
    // Must be cleared with its two siblings. The result screen reads
    // `finalizedRail ?? railMarksForRun`, so a stale value never falls back —
    // a replay's first painted frame showed the PREVIOUS run's rail, on the one
    // screen whose whole job is "here is what you just did".
    setFinalizedRail(null);
    setFinalizedMoments([]);
  }, [scriptData, scenarioId, startScenario]);

  // ─── Early return after all hooks ────────────────────────────────────────────
  // A gender-restricted scenario reached by deep link or a stale favourite is
  // treated as absent rather than played to the wrong learner. `scenario ?? {}`
  // is deliberate, not a fallback we forgot: it has no requiresGender, so a
  // missing catalog entry never blocks play — the gate only fires when we
  // actually know the scenario is restricted and know the learner doesn't match.
  if (!scriptData || !isScenarioAvailableFor(scenario ?? {}, user?.gender)) {
    return (
      <Screen
        scroll={false}
        // EmptyState brings its own SCREEN_MARGIN — see ScenarioDetailScreen.
        contentStyle={{ paddingHorizontal: 0 }}
        action={
          <Pressable
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.scenarios.goBack}
            style={{ borderRadius: RADIUS.pill, paddingVertical: SPACE.lg, alignItems: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}
          >
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>{STRINGS.scenarios.goBack}</Text>
          </Pressable>
        }
      >
        <EmptyState arabic="؟" title={STRINGS.scenarios.notFound} subtitle={STRINGS.scenarios.noScript(scenarioId)} />
      </Screen>
    );
  }

  // Derive total T/R/C for ImpactBar by summing all NPCs. finalizedImpact takes
  // priority once locked, for the same reason as `ending` below — activeScenarioState
  // goes null right as the result screen appears.
  const impact = finalizedImpact
    ?? (activeScenarioState
      ? Object.values(activeScenarioState.impactByNpc).reduce(
          (acc, d) => ({
            trust:   acc.trust   + d.trust,
            respect: acc.respect + d.respect,
            culture: acc.culture + d.culture,
          }),
          { trust: 0, respect: 0, culture: 0 }
        )
      : { trust: 0, respect: 0, culture: 0 });

  // Butterfly effect: NPC tone from engine (driven by the trust/respect/culture
  // meters shown in the ImpactBar, so the bar and the NPC's demeanour agree)
  const sceneTone: 'warm' | 'neutral' | 'cold' =
    activeScenarioState && scene
      ? getTone(activeScenarioState, scene.charName, scene)
      : 'neutral';

  // Ending evaluated from engine — locked into finalizedEnding so the result screen
  // stays stable after finalizeScenario() nulls activeScenarioState.
  const ending = finalizedEnding
    ?? (activeScenarioState && scriptData
        ? evaluateEnding(activeScenarioState, scriptData)
        : endings[endings.length - 1]);

  // total for score display on result screen
  const total = impact.trust + impact.respect + impact.culture;

  // Intro: everything the scenario can teach. Result: what this run earned.
  const learnablePhrases = toPhrases(allPhraseIds(scriptData));
  const earnedPhrases = toPhrases(phrasesEarned(scriptData, ending));

  // Endings collection + hints. The store already includes this run's ending
  // by the time the result shows, so the count is current.
  const foundIds = foundEndingIds ?? [];
  const progress = endingsProgress(scriptData, foundIds);
  const destinationLabel = scriptData.routes.find(r => r.id === ending.route)?.label;

  // Progress dots count decisions, not scenes: the fork puts two variant scenes
  // in the array for one decision, and the bonus scene is not a decision.
  const totalDecisions = DECISIONS_PER_RUN;
  const decisionsMade = activeScenarioState?.choiceHistory.length ?? totalDecisions;

  // What follows the choice on screen — drives "See final result" and the tone preview.
  const upcomingSceneId = phase === 'choice-result' && activeScenarioState
    ? sceneAfterChoice(activeScenarioState, lastResolvedNextSceneId, scriptData)
    : null;
  const upcomingScene = upcomingSceneId ? scenes.find(sc => sc.id === upcomingSceneId) ?? null : null;

  const selectedChoice = scene && selectedChoiceId ? scene.choices.find(c => c.id === selectedChoiceId) : undefined;
  const feedback: ChoiceFeedback | null = scene && selectedChoice ? choiceFeedback(scene, selectedChoice) : null;
  const feedbackColor = (fb: ChoiceFeedback, choice: ScenarioChoice): string => {
    switch (fb.kind) {
      case 'misstep': return C.ERROR;
      case 'correct': return C.JADE2;
      case 'not-quite': return C.VIOLET2;
      case 'reaction': return C.JADE_ACCENT;
      default: return outcomeColor[choice.outcome];
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ك', 'ل', 'م']} />
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: SCREEN_MARGIN, paddingTop: insets.top + SPACE.lg, paddingBottom: 10, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 5 }}>{scriptData.title}</Text>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {Array.from({ length: totalDecisions }, (_, i) => (
                <MotiView
                  key={i}
                  animate={{
                    width: i <= decisionsMade && phase !== 'intro' ? 20 : 6,
                    backgroundColor: i < decisionsMade ? C.JADE2 : i === decisionsMade && phase === 'scene' ? C.JADE_ACCENT : C.TEXT3,
                  }}
                  transition={{ type: 'timing', duration: 260 }}
                  style={{ height: 3, borderRadius: 2 }}
                />
              ))}
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (phase !== 'result' && scene) {
                trackScenarioAbandoned({ scenarioId, sceneId: scene.id });
              }
              useAppStore.getState().abandonScenario();
              onExit();
            }}
            accessibilityRole="button"
            accessibilityLabel="Exit scenario"
            hitSlop={8}
            style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} color={C.TEXT3} />
          </Pressable>
        </View>

        {phase !== 'intro' && phase !== 'result' && (
          <ImpactBar trust={impact.trust} respect={impact.respect} culture={impact.culture} maxValues={maxMeterValues} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SCREEN_MARGIN, paddingBottom: insets.bottom + SPACE.xl }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >

        {/* ─── INTRO ─── */}
        {phase === 'intro' && (
          <ScenarioIntroPhase
            scriptData={scriptData}
            scenario={scenario}
            endings={endings}
            unlockedPhrases={learnablePhrases}
            decisions={totalDecisions}
            progress={progress}
            hints={runCount > 0 ? hintsToShow(scriptData, foundIds, undefined) : []}
            onBegin={() => {
              trackScenarioStarted({ scenarioId, title: scriptData.title, category: scenario?.mode });
              setPhase('scene');
            }}
          />
        )}

        {/* ─── SCENE ─── */}
        {phase === 'scene' && scene && (
          <MotiView
            key={`scene-${step}`}
            from={{ opacity: 0, translateX: sceneTone === 'warm' ? 30 : sceneTone === 'cold' ? 8 : 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: sceneTone === 'warm' ? 380 : sceneTone === 'cold' ? 180 : 260 }}
          >
            {/* The rail runs down the leading edge and accretes a mark per
                choice, so the run's shape is visible while it is still being
                made. The engine has tracked this since it was written and
                nothing rendered it. */}
            <View style={{ flexDirection: 'row' }}>
              <MarginRail marks={railMarksForRun} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <DialogueBubble scene={scene} tone={sceneTone} gender={user?.gender} />

            {choicesVisible && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 220 }}>
                {!selectedChoiceId && (
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {STRINGS.scenarios.chooseResponse}
                  </Text>
                )}

                <View style={{ gap: 8 }}>
                  {scene.choices
                    .filter((c: ScenarioChoice) => !activeScenarioState || isChoiceVisible(c, activeScenarioState))
                    .map((choice: ScenarioChoice, i: number) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const isDimmed = !!selectedChoiceId && !isSelected;
                    const color = feedbackColor(choiceFeedback(scene, choice), choice);
                    const isChoicePlaying = playingChoiceId === choice.id;
                    const choiceArabic = arabicForUser(choice);

                    return (
                      <MotiView
                        key={choice.id}
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: isDimmed ? 0.22 : 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: isDimmed ? 220 : 200, delay: isDimmed ? 0 : i * 70 }}
                      >
                        <View style={{
                          borderRadius: 16,
                          backgroundColor: isSelected ? `${color}08` : C.JADE_ACCENT_SURFACE,
                          borderWidth: isSelected ? 1.5 : 1,
                          borderColor: isSelected ? `${color}45` : C.BORDER,
                          overflow: 'hidden',
                        }}>
                          {/* Left accent bar */}
                          {isSelected && (
                            <MotiView
                              from={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
                              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: color, borderRadius: 2 }}
                            />
                          )}

                          <RippleEffect
                            onPress={() => handleChoice(choice)}
                            rippleColor={color}
                            disabled={!!selectedChoiceId}
                            accessibilityRole="button"
                            accessibilityLabel={`${replaceName(choice.text)} — ${replaceName(choice.roman)}`}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <View style={{ padding: 14, paddingLeft: isSelected ? 18 : 14, paddingBottom: selectedChoiceId ? 14 : 6 }}>
                              <Text style={{ fontFamily: FONT_ARABIC, fontSize: 18, color: isSelected ? color : accentColor, textAlign: 'right', marginBottom: 3, lineHeight: 26 }}>
                                {replaceName(choiceArabic)}
                              </Text>
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${accentColor}70`, fontStyle: 'italic', marginBottom: 5 }}>
                                {replaceName(choice.roman)}
                              </Text>
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: isSelected ? C.TEXT1_5 : C.TEXT2, lineHeight: 20 }}>
                                {replaceName(choice.text)}
                              </Text>
                            </View>
                          </RippleEffect>

                          {/* Listen button — only when not yet chosen. Kept as a sibling of
                              RippleEffect (not nested inside it): both render as a button on
                              web, and a button inside another button is invalid HTML that
                              also confuses nested-touchable accessibility on native. */}
                          {!selectedChoiceId && (
                            <Pressable
                              onPress={() => playChoice(choice.id, choiceArabic)}
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel={isChoicePlaying ? 'Playing audio' : 'Listen to choice'}
                              accessibilityState={{ selected: isChoicePlaying }}
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginLeft: 14, marginTop: 2, marginBottom: 14, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, backgroundColor: isChoicePlaying ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isChoicePlaying ? C.JADE_BORDER : C.BORDER }}
                            >
                              <WaveBars isPlaying={isChoicePlaying} size="sm" color={isChoicePlaying ? C.JADE2 : C.TEXT3} />
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: isChoicePlaying ? C.JADE2 : C.TEXT3 }}>
                                {isChoicePlaying ? STRINGS.scenarios.playing : STRINGS.scenarios.listen}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      </MotiView>
                    );
                  })}
                </View>
              </MotiView>
            )}
              </View>
            </View>
          </MotiView>
        )}

        {/* ─── CHOICE RESULT ─── */}
        {phase === 'choice-result' && selectedChoiceId && scene && feedback && (
          <ScenarioChoiceResultPhase
            scene={scene}
            selectedChoiceId={selectedChoiceId}
            feedback={feedback}
            color={selectedChoice && feedback ? feedbackColor(feedback, selectedChoice) : C.TEXT3}
            isLastStep={upcomingSceneId === null}
            nextScene={upcomingScene}
            activeScenarioState={activeScenarioState}
            replaceName={replaceName}
            arabicForUser={arabicForUser}
            onNext={next}
          />
        )}

        {/* ─── RESULT ─── */}
        {phase === 'result' && (
          <ScenarioResultPhase
            ending={ending}
            impact={impact}
            total={total}
            scenarioId={scenarioId}
            railMarks={finalizedRail ?? railMarksForRun}
            unlockedPhrases={earnedPhrases}
            progress={progress}
            destinationLabel={destinationLabel}
            moments={finalizedMoments}
            hints={hintsToShow(scriptData, foundIds, ending.id)}
            arabicForUser={arabicForUser}
            toneHistory={toneHistory}
            culturalJourneyNotes={culturalJourneyNotes}
            communityEndingPct={communityStatsCache[`${scenarioId}:${ending.id}`] ?? 0}
            isSpeaking={isSpeaking}
            playingPhraseId={playingPhraseId}
            onPlayEndPhrase={playEndPhrase}
            onRestart={restart}
            onExit={onExit}
            onShare={handleShare}
          />
        )}

      </ScrollView>
    </View>
  );
}
