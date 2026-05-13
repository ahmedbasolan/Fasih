import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, ChevronRight, RotateCcw, Home, ArrowRight, Volume2, BookOpen, Compass, Users, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  FONT_ARABIC, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD,
  FONT_LATIN_SEMI, FONT_HEADING_SEMI,
} from '../components/design/tokens';
import { ANGLE_135 } from '../components/design/gradients';
import { useTheme } from '../hooks/useTheme';
import { useTypewriter } from '../components/design/hooks';
import { WaveBars } from '../components/features/WaveBars';
import { RippleEffect } from '../components/ui/RippleEffect';
import { KafMascot } from '../components/features/KafMascot';
import { EmptyState } from '../components/ui/EmptyState';
import { GhostLetters } from '../components/ui';
import { getScenarioScript, getScenarioById } from '../constants/scenarios';
import { PHRASES } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import type { UserProfile, ScenarioChoice, ScenarioScene } from '../types';

interface Props {
  scenarioId: string;
  user: UserProfile | null;
  onExit: () => void;
  onComplete?: (scenarioId: string, endingType: string) => void;
  onJournalEntry?: (arabic: string, english: string, insight: string) => void;
}

type Phase = 'intro' | 'scene' | 'choice-result' | 'result';

// ─── Impact bar (trust / respect / culture) shown during play ────────────────
function ImpactBar({ trust, respect, culture, maxValues }: { trust: number; respect: number; culture: number; maxValues?: { trust: number; respect: number; culture: number } }) {
  const { C } = useTheme();
  // Default max is 12 (4 scenes × max impact 3), but can be overridden per scenario
  const max = maxValues ?? { trust: 12, respect: 12, culture: 12 };

  const Col = ({ label, value, color, maxVal }: { label: string; value: number; color: string; maxVal: number }) => {
    // Calculate percentage of bar to fill (handles both positive and negative values)
    const absMax = Math.max(Math.abs(maxVal), 3); // Minimum scale of 3 for visibility
    const pct = Math.min(Math.max(Math.abs(value), 0) / absMax, 1);
    return (
      <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: C.TEXT3, letterSpacing: 0.9, textTransform: 'uppercase' }}>{label}</Text>
        <MotiView from={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: 'timing', duration: 260 }} key={value}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: value !== 0 ? color : C.TEXT3 }}>{value > 0 ? `+${value}` : value}</Text>
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
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
      <Col label="Trust" value={trust} color={C.CULTURAL_GOLD} maxVal={max.trust} />
      <View style={{ width: 1, height: 28, backgroundColor: C.BORDER, marginHorizontal: 10 }} />
      <Col label="Respect" value={respect} color={C.JADE2} maxVal={max.respect} />
      <View style={{ width: 1, height: 28, backgroundColor: C.BORDER, marginHorizontal: 10 }} />
      <Col label="Culture" value={culture} color={C.VIOLET} maxVal={max.culture} />
    </View>
  );
}

// ─── Dialogue bubble ──────────────────────────────────────────────────────────
function DialogueBubble({ scene, tone = 'neutral' }: { scene: ScenarioScene; tone?: 'warm' | 'neutral' | 'cold' }) {
  const { C } = useTheme();
  const accentText = C.JADE;
  const [arabicRevealed, setArabicRevealed] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);

  // Resolve the correct dialogue variant — warm/cold only if the scene defines charDialogue
  const dialogue = (scene.charDialogue && tone !== 'neutral')
    ? scene.charDialogue[tone]
    : { arabic: scene.arabic, roman: scene.roman, english: scene.english };

  const { displayed } = useTypewriter(translationRevealed ? dialogue.english : '', 28, 50);
  const { speakAs, isSpeaking: playingAudio } = useArabicTTS();
  const initial = scene.charName.charAt(0).toUpperCase();

  // Butterfly effect indicators
  const hasToneShift = !!scene.charDialogue && tone !== 'neutral';
  const toneColor = tone === 'warm' ? C.GOLD : C.TEXT3;

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
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT2 }}>{scene.setting}</Text>
      </View>

      {/* Butterfly effect badge — only appears when past choices changed this NPC response */}
      {hasToneShift && (
        <MotiView
          from={{ opacity: 0, translateY: -6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 180, delay: 350 }}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            alignSelf: 'flex-start', marginBottom: 12,
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
            backgroundColor: tone === 'warm' ? C.GOLD_DIM : C.SURFACE,
            borderWidth: 1, borderColor: tone === 'warm' ? C.GOLD_BORDER : C.BORDER,
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: toneColor }} />
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: toneColor, letterSpacing: 0.5 }}>
            {tone === 'warm' ? 'Your choices shaped this response' : 'Your choices echo here'}
          </Text>
        </MotiView>
      )}

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{
          width: 40, height: 40, borderRadius: 14,
          backgroundColor: C.GOLD_DIM,
          borderWidth: hasToneShift ? 1.5 : 1,
          borderColor: tone === 'cold' ? C.BORDER : C.GOLD_BORDER,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.GOLD }}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginBottom: 6 }}>{scene.charName}</Text>
          <Pressable onPress={() => { setArabicRevealed(true); setTranslationRevealed(true); }}>
            <View style={{
              borderRadius: 16, borderTopLeftRadius: 0, padding: 14,
              backgroundColor: tone === 'cold' ? C.SURFACE : C.GOLD_SURFACE,
              borderWidth: 1,
              borderColor: tone === 'cold' ? C.BORDER : C.GOLD_BORDER,
              minHeight: 72,
            }}>
              {!arabicRevealed ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <WaveBars isPlaying={playingAudio} size="md" color={C.GOLD} />
                </View>
              ) : (
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 280 }}>
                  <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: accentText, textAlign: 'right', lineHeight: 32, marginBottom: translationRevealed ? 3 : 0 }}>
                    {dialogue.arabic}
                  </Text>
                  {translationRevealed && (
                    <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 250 }}>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: `${accentText}80`, fontStyle: 'italic', marginBottom: 4 }}>{dialogue.roman}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{`"${displayed}"`}</Text>
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
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: playingAudio ? C.JADE2 : C.TEXT3 }}>
              {playingAudio ? STRINGS.scenarios.playing : STRINGS.scenarios.listenVoice(scene.charGender)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Rich phrase card ─────────────────────────────────────────────────────────
function PhraseCard({ arabic, roman, english, onSpeak, isPlaying }: {
  arabic: string; roman: string; english: string;
  onSpeak: () => void; isPlaying: boolean;
}) {
  const { C } = useTheme();
  const jadeText = C.JADE;
  return (
    <View style={{ borderRadius: 14, padding: 14, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontFamily: FONT_ARABIC, fontSize: 20, color: jadeText, textAlign: 'right', flex: 1, lineHeight: 30 }}>{arabic}</Text>
        <Pressable
          onPress={onSpeak}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Stop audio' : 'Listen to phrase'}
          style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: isPlaying ? C.JADE_DIM : C.SURFACE, borderWidth: 1, borderColor: isPlaying ? C.JADE_BORDER : C.BORDER, marginLeft: 10 }}
        >
          <Volume2 size={13} color={isPlaying ? jadeText : C.TEXT3} />
        </Pressable>
      </View>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: `${jadeText}80`, fontStyle: 'italic' }}>{roman}</Text>
      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.TEXT2, marginTop: 2 }}>{english}</Text>
    </View>
  );
}

const outcomeLabel: Record<string, string> = { excellent: 'Excellent', good: 'Good choice', neutral: 'Neutral', bad: 'Cultural misstep' };

// ─── Main Component ───────────────────────────────────────────────────────────
export function ScenarioPlayer({ scenarioId, onExit, onComplete, onJournalEntry }: Props) {
  const { C, G } = useTheme();
  // C.JADE reads well on both dark and light; C.VIOLET is safe for both modes
  const accentColor = C.JADE;
  const violetColor = C.VIOLET;
  const outcomeColor: Record<string, string> = useMemo(
    () => ({ excellent: C.JADE2, good: C.GOLD, neutral: C.VIOLET2, bad: C.ERROR }),
    [C]
  );
  const insets = useSafeAreaInsets();
  const scriptData = getScenarioScript(scenarioId, C);
  const scenario = getScenarioById(scenarioId, C);
  const { speak, isSpeaking } = useArabicTTS();
  const getCommunityEndingStat = useAppStore((s) => s.getCommunityEndingStat);
  const fetchCommunityEndingStats = useAppStore((s) => s.fetchCommunityEndingStats);
  const recordChoiceStatAction = useAppStore((s) => s.recordChoiceStat);
  const user = useAppStore((s) => s.user);
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [playingChoiceId, setPlayingChoiceId] = useState<string | null>(null);

  // TTS timer refs for cleanup
  const choiceTtsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phraseTtsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (choiceTtsTimerRef.current) clearTimeout(choiceTtsTimerRef.current);
      if (phraseTtsTimerRef.current) clearTimeout(phraseTtsTimerRef.current);
    };
  }, []);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [impact, setImpact] = useState({ trust: 0, respect: 0, culture: 0 });
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<ScenarioChoice[]>([]);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({ FLAG_1: false, FLAG_2: false, FLAG_3: false });
  const [nextSceneId, setNextSceneId] = useState<string | null>(null);
  // Tone history: records the NPC tone at the moment each scene was entered
  const [toneHistory, setToneHistory] = useState<Array<{ sceneId: string; tone: 'warm' | 'neutral' | 'cold' }>>([]);

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
  useEffect(() => {
    if (phase === 'scene') {
      setChoicesVisible(false);
      setSelectedChoiceId(null);
      const t = setTimeout(() => setChoicesVisible(true), 1100);
      return () => clearTimeout(t);
    }
  }, [phase, step]);

  useEffect(() => {
    if (phase === 'result') void fetchCommunityEndingStats(scenarioId);
  }, [phase, scenarioId, fetchCommunityEndingStats]);

  // Record NPC tone the moment each scene is entered (only for scenes with charDialogue)
  useEffect(() => {
    if (phase !== 'scene' || !scene?.charDialogue) return;
    setToneHistory(prev => {
      if (prev.some(t => t.sceneId === scene.id)) return prev;
      const entryTone: 'warm' | 'neutral' | 'cold' =
        score >= (scene.warmThreshold ?? Infinity) ? 'warm'
        : score < (scene.coldThreshold ?? -Infinity) ? 'cold'
        : 'neutral';
      return [...prev, { sceneId: scene.id, tone: entryTone }];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase]);

  useEffect(() => {
    if (!scriptData || phase !== 'result' || completionFired) return;
    const _endings = scriptData.endings;
    const _total = impact.trust + impact.respect + impact.culture;
    const _secret = _endings.find(e => e.secret);
    const _flagsMet = !_secret?.requiredFlags ||
      _secret.requiredFlags.every(f => flags[f] === true);
    const currEnding = (_secret && _flagsMet && _total >= 20)
      ? _secret
      : _endings.find(e => !e.secret && _total >= e.min) ?? _endings[_endings.length - 1];
    setCompletionFired(true);
    const hapticType =
      currEnding.type === 'failed' ? Haptics.NotificationFeedbackType.Error
      : currEnding.type === 'mixed' ? Haptics.NotificationFeedbackType.Warning
      : Haptics.NotificationFeedbackType.Success;
    void Haptics.notificationAsync(hapticType).catch(() => {});
    onComplete?.(scenarioId, currEnding.type);
    if (currEnding.type !== 'failed') onJournalEntry?.(currEnding.arabic, currEnding.en, currEnding.desc);
  }, [phase, completionFired, scenarioId, scriptData, impact, flags, onComplete, onJournalEntry]);

  // ─── Hooks that depend on scriptData must use optional chaining ──────────────
  const scenes = scriptData?.scenes ?? [];
  const endings = scriptData?.endings ?? [];

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

  const culturalJourneyNotes = useMemo(() => choiceHistory
    .map(c => c.note)
    .filter((note): note is string => Boolean(note))
    .slice(0, 4), [choiceHistory]);

  // Helper to replace [name] placeholder with user's name
  const replaceName = useCallback((text: string): string => {
    const userName = user?.name || 'friend';
    return text.replace(/\[name\]/g, userName);
  }, [user?.name]);

  const handleChoice = useCallback((choice: ScenarioChoice) => {
    if (selectedChoiceId || !scenes[step]) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setScore(prev => prev + choice.score);
    if (choice.impact) {
      setImpact(prev => ({
        trust: prev.trust + choice.impact!.trust,
        respect: prev.respect + choice.impact!.respect,
        culture: prev.culture + choice.impact!.culture,
      }));
    }

    // Set flag if choice has one
    if ('flag' in choice && choice.flag) {
      setFlags(prev => ({ ...prev, [choice.flag as string]: true }));
    }

    // Store next scene ID for branching (social mode scenarios)
    if (choice.next) {
      setNextSceneId(choice.next);
    } else {
      setNextSceneId(null);
    }

    setChoiceHistory(prev => [...prev, choice]);
    setSelectedChoiceId(choice.id);
    void recordChoiceStatAction(scenarioId, scenes[step].id, choice.id);

    // Transition to choice-result phase after a short delay
    setTimeout(() => {
      setPhase('choice-result');
    }, 600);
  }, [selectedChoiceId, recordChoiceStatAction, scenarioId, scenes, step]);

  const next = useCallback(() => {
    setSelectedChoiceId(null);
    setNextSceneId(null);
    
    // Handle branching: if choice specified a next scene ID, navigate to it
    if (nextSceneId) {
      const targetIndex = scenes.findIndex(s => s.id === nextSceneId);
      if (targetIndex !== -1) {
        setStep(targetIndex);
        setPhase('scene');
        return;
      }
    }
    
    // Default linear progression
    const nextStep = step + 1;

    // Check if we should show bonus scene for secret ending (only if not already on it)
    const isOnBonusScene = scenes[step]?.bonus === true;
    if (!isOnBonusScene && nextStep >= scenes.length && scriptData) {
      const total = impact.trust + impact.respect + impact.culture;
      const secretEnding = scriptData.endings?.find(e => e.secret);
      const requiredFlagsMet = !secretEnding?.requiredFlags ||
        secretEnding.requiredFlags.every(f => flags[f] === true);

      if (secretEnding && requiredFlagsMet && total >= 20) {
        const bonusScene = scenes.find(s => s.bonus === true);
        if (bonusScene) {
          setStep(scenes.indexOf(bonusScene));
          setPhase('scene');
          return;
        }
      }
    }

    if (nextStep >= scenes.length) setPhase('result');
    else { setStep(nextStep); setPhase('scene'); }
  }, [step, scenes.length, flags, scriptData, scenes, impact, nextSceneId]);

  const handleShare = useCallback(async (endingTitle: string, endingArabic: string, endingEn: string, isSecret: boolean, finalTotal: number) => {
    const scenarioTitle = scriptData?.title ?? 'a Fasih scenario';
    const message = isSecret
      ? `I just discovered the secret ending in "${scenarioTitle}" on Fasih 🔑\n\n"${endingArabic}" — ${endingEn}\n\nVery few players ever find this.\n\nFasih — Learn Arabic by Living It`
      : `I scored ${finalTotal} in "${scenarioTitle}" and unlocked "${endingTitle}"\n\n"${endingArabic}" — ${endingEn}\n\nFasih — Learn Arabic by Living It\n#Fasih #ArabicLearning`;
    try {
      await Share.share({ message });
    } catch { /* user dismissed share sheet — no-op */ }
  }, [scriptData?.title]);

  const restart = useCallback(() => {
    setPhase('intro');
    setStep(0);
    setScore(0);
    setImpact({ trust: 0, respect: 0, culture: 0 });
    setSelectedChoiceId(null);
    setChoiceHistory([]);
    setCompletionFired(false);
    setFlags({ FLAG_1: false, FLAG_2: false, FLAG_3: false });
    setNextSceneId(null);
    setToneHistory([]);
  }, []);

  // ─── Early return after all hooks ────────────────────────────────────────────
  if (!scriptData) {
    return (
      <View style={{ flex: 1, backgroundColor: C.BG, paddingTop: insets.top + 40 }}>
        <EmptyState arabic="؟" title={STRINGS.scenarios.notFound} subtitle={STRINGS.scenarios.noScript(scenarioId)} />
        <View style={{ paddingHorizontal: 40, marginTop: 8 }}>
          <Pressable onPress={onExit} style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>{STRINGS.scenarios.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const scene = scenes[step];
  // totalScore = sum of all three meters (as per guide)
  const total = impact.trust + impact.respect + impact.culture;

  // Butterfly effect: NPC tone driven by accumulated score (not impact sum — score is
  // the designer's primary rating; impact is for the T/R/C bars)
  const sceneTone: 'warm' | 'neutral' | 'cold' = scene?.charDialogue
    ? score >= (scene.warmThreshold ?? Infinity) ? 'warm'
      : score < (scene.coldThreshold ?? -Infinity) ? 'cold'
      : 'neutral'
    : 'neutral';

  // Determine ending — secret endings require requiredFlags + score threshold
  const secretEnding = endings.find(e => e.secret);
  const requiredFlagsMet = !secretEnding?.requiredFlags ||
    secretEnding.requiredFlags.every(f => flags[f] === true);
  const ending = (secretEnding && requiredFlagsMet && total >= 20)
    ? secretEnding
    : endings.find(e => !e.secret && total >= e.min) ?? endings[endings.length - 1];

  const unlockedPhrases = scriptData.phrasesUnlocked
    ? scriptData.phrasesUnlocked.map(id => PHRASES.find(p => p.id === id)).filter(Boolean) as typeof PHRASES
    : PHRASES.filter(p => p.scenarioSource === scenarioId).slice(0, 8);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ك', 'ل', 'م']} />
      {/* ── Header ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 14, paddingBottom: 10, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 5 }}>{scriptData.title}</Text>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {scenes.map((_: ScenarioScene, i: number) => (
                <MotiView
                  key={i}
                  animate={{
                    width: i <= step && phase !== 'intro' ? 20 : 6,
                    backgroundColor: i < step ? C.JADE2 : i === step && phase !== 'intro' ? C.GOLD : C.TEXT3,
                  }}
                  transition={{ type: 'timing', duration: 260 }}
                  style={{ height: 3, borderRadius: 2 }}
                />
              ))}
            </View>
          </View>
          <Pressable
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Exit scenario"
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
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      >

        {/* ─── INTRO ─── */}
        {phase === 'intro' && (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
            <View style={{ alignItems: 'center', gap: 18, paddingTop: 12 }}>
              <View style={{ position: 'relative', width: '100%', alignItems: 'center', height: 72, justifyContent: 'center' }}>
                <Text style={{ fontFamily: FONT_ARABIC, fontSize: 72, color: C.GOLD, opacity: 0.07, position: 'absolute' }}>
                  {scenario?.arabicScene || ''}
                </Text>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 26, color: C.GOLD }}>ك</Text>
                </View>
              </View>

              <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 22, color: C.TEXT, marginBottom: 8, textAlign: 'center' }}>{scriptData.title}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 22 }}>
                  {scenario?.subtitle || STRINGS.scenarios.introDesc}
                </Text>
              </View>

              <View style={{ width: '100%', borderRadius: 16, padding: 14, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, flexDirection: 'row', gap: 12 }}>
                <KafMascot size="xs" animate={false} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, marginBottom: 3 }}>{STRINGS.scenarios.kafSays}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>
                    {scenario?.kafIntro || STRINGS.scenarios.kafIntro}
                  </Text>
                </View>
              </View>

              <View style={{ width: '100%', flexDirection: 'row', gap: 10 }}>
                {[
                  [`${scenes.filter(s => !s.bonus).length}`, STRINGS.scenarios.decisionLabel(scenes.filter(s => !s.bonus).length)],
                  [`${endings.length}`, STRINGS.scenarios.outcomeLabel(endings.length)],
                  [unlockedPhrases.length > 0 ? `${unlockedPhrases.length}` : '8+', STRINGS.scenarios.phraseLabel(8)],
                ].map(([v, l]) => (
                  <View key={l} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 20, color: C.TEXT }}>{v}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginTop: 2 }}>{l}</Text>
                  </View>
                ))}
              </View>

              {scriptData.endings.some(e => e.secret) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.VIOLET2 }} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET2 }}>
                    {STRINGS.scenarios.secretEndingExists}
                  </Text>
                </View>
              )}

              <Pressable onPress={() => setPhase('scene')} accessibilityRole="button" style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.WHITE }}>{STRINGS.scenarios.begin}</Text>
                  <ArrowRight size={17} color={C.WHITE} />
                </LinearGradient>
              </Pressable>
            </View>
          </MotiView>
        )}

        {/* ─── SCENE ─── */}
        {phase === 'scene' && scene && (
          <MotiView
            key={`scene-${step}`}
            from={{ opacity: 0, translateX: sceneTone === 'warm' ? 30 : sceneTone === 'cold' ? 8 : 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: sceneTone === 'warm' ? 380 : sceneTone === 'cold' ? 180 : 260 }}
          >
            <DialogueBubble scene={scene} tone={sceneTone} />

            {choicesVisible && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 220 }}>
                {!selectedChoiceId && (
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, textAlign: 'center', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {STRINGS.scenarios.chooseResponse}
                  </Text>
                )}

                <View style={{ gap: 8 }}>
                  {scene.choices.map((choice: ScenarioChoice, i: number) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const isDimmed = !!selectedChoiceId && !isSelected;
                    const color = outcomeColor[choice.outcome];
                    const isChoicePlaying = playingChoiceId === choice.id;

                    return (
                      <MotiView
                        key={choice.id}
                        from={{ opacity: 0, translateY: 8 }}
                        animate={{ opacity: isDimmed ? 0.22 : 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: isDimmed ? 220 : 200, delay: isDimmed ? 0 : i * 70 }}
                      >
                        <RippleEffect onPress={() => handleChoice(choice)} rippleColor={color} disabled={!!selectedChoiceId}>
                          <View style={{
                            borderRadius: 16,
                            backgroundColor: isSelected ? `${color}08` : C.GOLD_SURFACE,
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

                            <View style={{ padding: 14, paddingLeft: isSelected ? 18 : 14 }}>
                              <Text style={{ fontFamily: FONT_ARABIC, fontSize: 17, color: isSelected ? color : accentColor, textAlign: 'right', marginBottom: 3, lineHeight: 26 }}>
                                {replaceName(choice.arabic)}
                              </Text>
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: `${accentColor}70`, fontStyle: 'italic', marginBottom: 5 }}>
                                {replaceName(choice.roman)}
                              </Text>
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: isSelected ? C.TEXT1_5 : C.TEXT2, lineHeight: 20 }}>
                                {replaceName(choice.text)}
                              </Text>

                              {/* Listen button — only when not yet chosen */}
                              {!selectedChoiceId && (
                                <Pressable
                                  onPress={(e) => { e.stopPropagation?.(); playChoice(choice.id, choice.arabic); }}
                                  accessibilityRole="button"
                                  accessibilityLabel={isChoicePlaying ? 'Playing audio' : 'Listen to choice'}
                                  accessibilityState={{ selected: isChoicePlaying }}
                                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, backgroundColor: isChoicePlaying ? C.JADE_SURFACE : C.SURFACE, borderWidth: 1, borderColor: isChoicePlaying ? C.JADE_BORDER : C.BORDER }}
                                >
                                  <WaveBars isPlaying={isChoicePlaying} size="sm" color={isChoicePlaying ? C.JADE2 : C.TEXT3} />
                                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: isChoicePlaying ? C.JADE2 : C.TEXT3 }}>
                                    {isChoicePlaying ? STRINGS.scenarios.playing : STRINGS.scenarios.listen}
                                  </Text>
                                </Pressable>
                              )}
                            </View>
                          </View>
                        </RippleEffect>
                      </MotiView>
                    );
                  })}
                </View>
              </MotiView>
            )}
          </MotiView>
        )}

        {/* ─── CHOICE RESULT ─── */}
        {phase === 'choice-result' && selectedChoiceId && (
          <MotiView
            key={`choice-result-${step}`}
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 300 }}
          >
            <View style={{ gap: 20, paddingTop: 10 }}>
              {(() => {
                const choice = scene.choices.find(c => c.id === selectedChoiceId)!;
                const color = outcomeColor[choice.outcome];
                return (
                  <>
                    {/* Result Header */}
                    <View style={{ alignItems: 'center', gap: 8 }}>
                      <MotiView
                        from={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        style={{
                          width: 64, height: 64, borderRadius: 32,
                          backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                         <CheckCircle size={32} color={color} />
                      </MotiView>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color }}>
                        {outcomeLabel[choice.outcome]}
                      </Text>
                    </View>

                    {/* What you said */}
                    <View style={{ borderRadius: 20, padding: 18, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>You Said</Text>
                      <Text style={{ fontFamily: FONT_ARABIC, fontSize: 20, color: accentColor, textAlign: 'right', marginBottom: 6, lineHeight: 30 }}>{replaceName(choice.arabic)}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 22 }}>{replaceName(choice.text)}</Text>
                    </View>

                    {/* Kaf's Insight */}
                    <View style={{ borderRadius: 20, padding: 20, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <KafMascot size="xs" animate={true} />
                        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: violetColor }}>Cultural Insight</Text>
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 15, color: C.TEXT2, lineHeight: 24 }}>
                        {choice.note || "A solid choice in this context. Keep it up!"}
                      </Text>
                    </View>

                    {/* Impact - Total of all three meters */}
                    {(() => {
                      const totalImpact = (choice.impact?.trust || 0) + (choice.impact?.respect || 0) + (choice.impact?.culture || 0);
                      return (
                        <View style={{ alignItems: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: totalImpact >= 0 ? C.JADE2 : C.ERROR }}>
                            {totalImpact > 0 ? `+${totalImpact}` : totalImpact}
                          </Text>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>Impact</Text>
                          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.CULTURAL_GOLD }}>T: {choice.impact?.trust || 0}</Text>
                            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.JADE2 }}>R: {choice.impact?.respect || 0}</Text>
                            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.VIOLET }}>C: {choice.impact?.culture || 0}</Text>
                          </View>
                        </View>
                      );
                    })()}

                    {/* Butterfly effect forward prediction — what tone will the next scene carry */}
                    {(() => {
                      // Respect branching: if the choice set a nextSceneId, look that scene up
                      const nextIdx = nextSceneId
                        ? scenes.findIndex(s => s.id === nextSceneId)
                        : step + 1;
                      const nextScene = nextIdx >= 0 && nextIdx < scenes.length ? scenes[nextIdx] : null;
                      if (!nextScene?.charDialogue) return null;
                      const nextTone: 'warm' | 'neutral' | 'cold' =
                        score >= (nextScene.warmThreshold ?? Infinity) ? 'warm'
                        : score < (nextScene.coldThreshold ?? -Infinity) ? 'cold'
                        : 'neutral';
                      if (nextTone === 'neutral') return null;
                      const firstName = nextScene.charName.split(' ')[0];
                      return (
                        <MotiView
                          from={{ opacity: 0, translateY: 6 }}
                          animate={{ opacity: 1, translateY: 0 }}
                          transition={{ type: 'timing', duration: 300, delay: 420 }}
                        >
                          <View style={{
                            borderRadius: 14, padding: 14,
                            backgroundColor: nextTone === 'warm' ? C.GOLD_DIM : C.SURFACE,
                            borderWidth: 1, borderColor: nextTone === 'warm' ? C.GOLD_BORDER : C.BORDER,
                            flexDirection: 'row', alignItems: 'center', gap: 10,
                          }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: nextTone === 'warm' ? C.GOLD : C.TEXT3, flexShrink: 0 }} />
                            <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: nextTone === 'warm' ? C.GOLD : C.TEXT3, flex: 1, lineHeight: 18 }}>
                              {nextTone === 'warm'
                                ? `${firstName} will be more open with you in the next scene`
                                : `${firstName} will be more guarded in the next scene`}
                            </Text>
                          </View>
                        </MotiView>
                      );
                    })()}

                    {/* Continue Action */}
                    <Pressable onPress={next} accessibilityRole="button" accessibilityLabel={step + 1 >= scenes.length ? 'See final result' : 'Continue'} style={{ borderRadius: 20, overflow: 'hidden', marginTop: 10 }}>
                      <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
                        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.WHITE }}>
                          {step + 1 >= scenes.length ? 'See Final Result' : 'Continue'}
                        </Text>
                        <ArrowRight size={20} color={C.WHITE} />
                      </LinearGradient>
                    </Pressable>
                  </>
                );
              })()}
            </View>
          </MotiView>
        )}

        {/* ─── RESULT ─── */}
        {phase === 'result' && (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
            <View style={{ gap: 14, paddingTop: 8 }}>

              {/* Ending card */}
              <View style={{ borderRadius: 24, padding: 22, backgroundColor: `${ending.color}18`, borderWidth: 1.5, borderColor: `${ending.color}40` }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: ending.color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
                    {ending.type.charAt(0).toUpperCase() + ending.type.slice(1)} Outcome
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 26, color: C.TEXT, marginBottom: 8, textAlign: 'center' }}>{ending.title}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20, textAlign: 'center', marginBottom: 16 }}>{ending.desc}</Text>
                  <View style={{ width: '100%', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, backgroundColor: `${ending.color}10` }}>
                    <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: ending.color, textAlign: 'center', marginBottom: 4 }}>{`"${ending.arabic}"`}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: `${ending.color}85`, textAlign: 'center', fontStyle: 'italic', marginBottom: 4 }}>{ending.roman}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center' }}>{ending.en}</Text>
                  </View>
                </View>
              </View>

              {/* Discovery badge */}
              <View style={{ borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Compass size={15} color={C.VIOLET2} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.TEXT }}>
                    {STRINGS.scenarios.endingDiscovery(endings.length)}
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 1 }}>
                    {STRINGS.scenarios.tryDifferentChoices}
                  </Text>
                </View>
              </View>

              {/* Secret ending teaser — shown only when this ending isn't secret but one exists */}
              {!ending.secret && endings.some(e => e.secret) && (
                <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 60 }}>
                  <View style={{ borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.VIOLET2 }} />
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.VIOLET2, flex: 1, lineHeight: 19 }}>
                      {STRINGS.scenarios.secretEndingTeaser}
                    </Text>
                  </View>
                </MotiView>
              )}

              {/* Relationship arc — visual timeline of NPC tone across all scenes */}
              {toneHistory.length > 0 && (
                <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 140 }}>
                  <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>
                      How the relationship evolved
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {toneHistory.map(({ sceneId, tone }, i) => {
                        const dotColor = tone === 'warm' ? C.GOLD : tone === 'cold' ? C.ERROR : C.TEXT3;
                        const label = tone === 'warm' ? 'Warm' : tone === 'cold' ? 'Cold' : 'Neutral';
                        return (
                          <React.Fragment key={sceneId}>
                            <View style={{ alignItems: 'center', gap: 6 }}>
                              <MotiView
                                from={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 14, delay: 80 + i * 130 }}
                                style={{
                                  width: 28, height: 28, borderRadius: 14,
                                  backgroundColor: `${dotColor}20`,
                                  borderWidth: 1.5, borderColor: dotColor,
                                  alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                              </MotiView>
                              <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: dotColor }}>{label}</Text>
                            </View>
                            {i < toneHistory.length - 1 && (
                              <View style={{ flex: 1, height: 1.5, backgroundColor: C.BORDER, marginHorizontal: 6, marginBottom: 16 }} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>
                    {(() => {
                      const finalTone = toneHistory[toneHistory.length - 1]?.tone;
                      const hasTurn = toneHistory.some((t, i) => i > 0 && t.tone !== toneHistory[i - 1].tone);
                      if (finalTone === 'warm') return (
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 12, textAlign: 'center', lineHeight: 17 }}>
                          {hasTurn ? 'You turned the relationship around. That takes awareness.' : 'Consistent respect kept the connection warm throughout.'}
                        </Text>
                      );
                      if (finalTone === 'cold') return (
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 12, textAlign: 'center', lineHeight: 17 }}>
                          {hasTurn ? 'The relationship cooled as it went on. One early choice can change everything.' : 'Distance grew from the first scene. Try again — warmth is learnable.'}
                        </Text>
                      );
                      return null;
                    })()}
                  </View>
                </MotiView>
              )}

              {/* Community stat */}
              <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 700, delay: 280 }}>
                <View style={{ borderRadius: 14, padding: 14, backgroundColor: ending.secret ? `${C.VIOLET}12` : `${C.GOLD}12`, borderWidth: 1, borderColor: ending.secret ? `${C.VIOLET}28` : `${C.GOLD}28`, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Users size={18} color={ending.secret ? C.VIOLET2 : C.GOLD} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.TEXT, flex: 1, lineHeight: 20 }}>
                    {ending.secret
                      ? STRINGS.scenarios.communityEndingSecret(getCommunityEndingStat(`${scenarioId}:${ending.type}`))
                      : STRINGS.scenarios.communityEnding(getCommunityEndingStat(`${scenarioId}:${ending.type}`))}
                  </Text>
                </View>
              </MotiView>

              {/* Meter Summary with Divergence Insight */}
              {(() => {
                const { trust, respect, culture } = impact;
                const values = [
                  { label: 'Trust',   value: trust,   color: C.CULTURAL_GOLD },
                  { label: 'Respect', value: respect, color: C.JADE2 },
                  { label: 'Culture', value: culture, color: C.VIOLET },
                ];
                const sorted = [...values].sort((a, b) => b.value - a.value);
                const maxDiff = sorted[0].value - sorted[2].value;
                const hasDivergence = maxDiff >= 8;
                
                return (
                  <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                      {values.map(({ label, value, color }) => (
                        <View key={label} style={{ alignItems: 'center' }}>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
                          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: value !== 0 ? color : C.TEXT3, marginTop: 4 }}>
                            {value > 0 ? `+${value}` : value}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {hasDivergence && (
                      <View style={{ borderRadius: 12, padding: 12, backgroundColor: `${sorted[0].color}15`, borderWidth: 1, borderColor: `${sorted[0].color}30` }}>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, textAlign: 'center', lineHeight: 18 }}>
                          <Text style={{ fontFamily: FONT_LATIN_BOLD, color: sorted[0].color }}>{sorted[0].label}</Text> is your strongest area (+{sorted[0].value}), 
                          but <Text style={{ fontFamily: FONT_LATIN_BOLD, color: sorted[2].color }}>{sorted[2].label}</Text> needs work ({sorted[2].value > 0 ? '+' : ''}{sorted[2].value}). 
                          Try choices that balance all three dimensions.
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })()}

              {/* Final Score */}
              <View style={{ borderRadius: 16, padding: 20, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', gap: 4 }} accessible={true} accessibilityRole="text" accessibilityLabel={`Final score ${total}`}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1 }}>Final Score</Text>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 52, color: ending.color }}>{total}</Text>
              </View>

              {/* Cultural journey */}
              {culturalJourneyNotes.length > 0 && (
                <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 200 }}>
                  <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <KafMascot size="xs" animate={false} />
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: violetColor }}>
                        {STRINGS.scenarios.culturalJourneyTitle}
                      </Text>
                    </View>
                    <View style={{ gap: 8 }}>
                      {culturalJourneyNotes.map((note, i) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                          <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: violetColor, marginTop: 6, flexShrink: 0 }} />
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 19, flex: 1 }}>{note}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </MotiView>
              )}

              {/* Phrases unlocked */}
              {unlockedPhrases.length > 0 && (
                <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 380 }}>
                  <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <BookOpen size={14} color={C.JADE2} />
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: C.JADE }}>
                        {STRINGS.scenarios.phrasesUnlocked(unlockedPhrases.length)}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 12 }}>
                      {STRINGS.scenarios.phrasesUnlockedSub}
                    </Text>
                    <View style={{ gap: 8 }}>
                      {unlockedPhrases.map((p) => (
                        <PhraseCard
                          key={p.id}
                          arabic={p.arabic}
                          roman={p.roman}
                          english={p.english}
                          onSpeak={() => playEndPhrase(p.id, p.arabic)}
                          isPlaying={playingPhraseId === p.id && isSpeaking}
                        />
                      ))}
                    </View>
                  </View>
                </MotiView>
              )}

              {/* Share result */}
              <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 460 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Share your result"
                  onPress={() => handleShare(ending.title, ending.arabic, ending.en, !!ending.secret, total)}
                  style={{ borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: ending.secret ? `${C.VIOLET}18` : `${C.JADE}14`, borderWidth: 1, borderColor: ending.secret ? `${C.VIOLET}35` : `${C.JADE}30` }}
                >
                  <ArrowRight size={14} color={ending.secret ? C.VIOLET2 : C.JADE2} style={{ transform: [{ rotate: '-45deg' }] }} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: ending.secret ? C.VIOLET2 : C.JADE2 }}>
                    {ending.secret ? 'Share this rare discovery' : 'Share your result'}
                  </Text>
                </Pressable>
              </MotiView>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={restart} accessibilityRole="button" style={{ flex: 1, paddingVertical: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                  <RotateCcw size={14} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>{STRINGS.scenarios.retry}</Text>
                </Pressable>
                <Pressable onPress={onExit} accessibilityRole="button" style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Home size={14} color={C.WHITE} />
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.WHITE }}>{STRINGS.scenarios.home}</Text>
                  </LinearGradient>
                </Pressable>
              </View>

            </View>
          </MotiView>
        )}

      </ScrollView>
    </View>
  );
}
