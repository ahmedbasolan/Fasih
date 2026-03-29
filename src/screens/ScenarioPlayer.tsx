import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { X, ChevronRight, Volume2, RotateCcw, Home, ArrowRight, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../components/design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../components/design/gradients';
import { useTypewriter } from '../components/design/hooks';
import { KafMascot } from '../components/KafMascot';
import { EmptyState } from '../components/ui/EmptyState';
import { getScenarioScript } from '../constants/scenarios';
import { useArabicTTS } from '../hooks/useArabicTTS';
import type { UserProfile, ScenarioChoice, ScenarioScene } from '../types';

interface Props {
  scenarioId: string;
  user: UserProfile | null;
  onExit: () => void;
  onComplete?: (scenarioId: string, endingType: string) => void;
  onJournalEntry?: (arabic: string, english: string, insight: string) => void;
}

type Phase = 'intro' | 'scene' | 'feedback' | 'result';

const outcomeColor: Record<string, string> = { excellent: C.JADE2, good: C.GOLD, neutral: C.VIOLET2, bad: '#E07070' };
const outcomeLabel: Record<string, string> = { excellent: 'Excellent response', good: 'Good choice', neutral: 'Neutral impact', bad: 'Cultural misstep' };

function ScoreBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 9, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 10, color }}>{value}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' }}>
        <MotiView
          from={{ width: '0%' }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'timing', duration: 700, delay }}
          style={{ height: 6, borderRadius: 3, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

function DialogueBubble({ scene }: { scene: ScenarioScene }) {
  const { displayed } = useTypewriter(scene.english, 28, 400);
  const { speak, isSpeaking: playingAudio } = useArabicTTS();

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignSelf: 'flex-start', marginBottom: 16 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.JADE2 }} />
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2 }}>{scene.setting}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
        <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD }}>A</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 8 }}>{scene.charName}</Text>
          <View style={{ borderRadius: 16, borderTopLeftRadius: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.BORDER }}>
            <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 22, color: C.GOLD, textAlign: 'right', lineHeight: 32, marginBottom: 4 }}>{scene.arabic}</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${C.GOLD}90`, fontStyle: 'italic', marginBottom: 6 }}>{scene.roman}</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>"{displayed}"</Text>
          </View>

          <Pressable onPress={() => speak(scene.arabic)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Volume2 size={12} color={playingAudio ? C.JADE2 : C.TEXT3} />
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: playingAudio ? C.JADE2 : C.TEXT3 }}>{playingAudio ? 'Playing…' : 'Listen to pronunciation'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function ScenarioPlayer({ scenarioId, onExit, onComplete, onJournalEntry }: Props) {
  const insets = useSafeAreaInsets();
  const scriptData = getScenarioScript(scenarioId);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ trust: 40, respect: 40, culture: 40 });
  const [lastChoice, setLastChoice] = useState<ScenarioChoice | null>(null);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [completionFired, setCompletionFired] = useState(false);

  // Guard: unknown scenario
  if (!scriptData) {
    return (
      <View style={{ flex: 1, backgroundColor: C.BG, paddingTop: insets.top + 40 }}>
        <EmptyState
          arabic="؟"
          title="Scenario not found"
          subtitle={`No script available for "${scenarioId}". This scenario may be coming soon.`}
        />
        <View style={{ paddingHorizontal: 40, marginTop: 8 }}>
          <Pressable onPress={onExit} style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const scenes = scriptData.scenes;
  const endings = scriptData.endings;
  const scene = scenes[step];
  const total = scores.trust + scores.respect + scores.culture;
  const ending = endings.find(e => total >= e.min) || endings[endings.length - 1];

  useEffect(() => {
    if (phase === 'scene') {
      setChoicesVisible(false);
      const t = setTimeout(() => setChoicesVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, step]);

  // Persist result to store when reaching result phase
  useEffect(() => {
    if (phase === 'result' && !completionFired) {
      setCompletionFired(true);
      onComplete?.(scenarioId, ending.type);
      // Save a cultural journal entry from the ending
      if (ending.type !== 'failed') {
        onJournalEntry?.(ending.arabic, ending.en, ending.desc);
      }
    }
  }, [phase, completionFired, scenarioId, ending, onComplete, onJournalEntry]);

  const handleChoice = (choice: ScenarioChoice) => {
    setScores(prev => ({
      trust: Math.max(0, Math.min(100, prev.trust + choice.impact.trust)),
      respect: Math.max(0, Math.min(100, prev.respect + choice.impact.respect)),
      culture: Math.max(0, Math.min(100, prev.culture + choice.impact.culture)),
    }));
    setLastChoice(choice);
    setPhase('feedback');
  };

  const next = () => {
    if (step + 1 >= scenes.length) setPhase('result');
    else { setStep(s => s + 1); setLastChoice(null); setPhase('scene'); }
  };

  const restart = () => {
    setPhase('intro'); setStep(0); setScores({ trust: 40, respect: 40, culture: 40 }); setLastChoice(null); setCompletionFired(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12, zIndex: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 4 }}>{scriptData.title}</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {scenes.map((_: ScenarioScene, i: number) => (
                <View key={i} style={{ width: i <= step && phase !== 'intro' ? 20 : 8, height: 4, borderRadius: 2, backgroundColor: i < step ? C.JADE2 : i === step && phase !== 'intro' ? C.GOLD : 'rgba(255,255,255,0.12)' }} />
              ))}
            </View>
          </View>
          <Pressable onPress={onExit} style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color={C.TEXT2} />
          </Pressable>
        </View>

        {phase !== 'intro' && phase !== 'result' && (
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <ScoreBar label="Trust" value={scores.trust} color={C.GOLD} delay={0} />
            <ScoreBar label="Respect" value={scores.respect} color={C.JADE2} delay={100} />
            <ScoreBar label="Culture" value={scores.culture} color={C.VIOLET2} delay={200} />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>

        {/* INTRO */}
        {phase === 'intro' && (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <View style={{ alignItems: 'center', gap: 20, paddingTop: 16 }}>
              <View style={{ position: 'relative', width: '100%', alignItems: 'center', height: 80, justifyContent: 'center' }}>
                <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 80, color: C.GOLD, opacity: 0.1, position: 'absolute' }}>قهوة</Text>
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: C.GOLD_DIM, borderWidth: 1.5, borderColor: C.GOLD_BORDER, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 28, color: C.GOLD }}>ك</Text>
                </View>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT, marginBottom: 6 }}>The Coffee Invitation</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 22 }}>Ahmed, your Emirati colleague, invites you for coffee. Every choice shapes your relationship.</Text>
              </View>

              <View style={{ width: '100%', borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                  {[['10', 'decisions'], ['5', 'endings'], ['20+', 'phrases']].map(([v, l]) => (
                    <View key={l} style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 20, color: C.TEXT }}>{v}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{l}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.GOLD, textAlign: 'center' }}>Family Partnership · Job Referral · Transactional · Missed</Text>
                </View>
              </View>

              <View style={{ width: '100%', borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, backgroundColor: C.VIOLET_DIM, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
                <KafMascot size="xs" animate={false} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, marginBottom: 4 }}>Kaf says</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>Coffee is never just coffee in Emirati culture — it is an invitation to build trust.</Text>
                </View>
              </View>

              <Pressable onPress={() => setPhase('scene')} style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: '#05050E' }}>Begin</Text>
                  <ArrowRight size={17} color="#05050E" />
                </LinearGradient>
              </Pressable>
            </View>
          </MotiView>
        )}

        {/* SCENE */}
        {phase === 'scene' && scene && (
          <MotiView key={`scene-${step}`} from={{ opacity: 0, translateX: 24 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 300 }}>
            <DialogueBubble scene={scene} />

            {choicesVisible && (
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textAlign: 'center', marginBottom: 12, letterSpacing: 0.8, textTransform: 'uppercase' }}>Choose your response</Text>
                <View style={{ gap: 10 }}>
                  {scene.choices.map((choice, i) => (
                    <MotiView key={choice.id} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250, delay: i * 80 }}>
                      <Pressable onPress={() => handleChoice(choice)} style={{ borderRadius: 16, padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: C.BORDER }}>
                        {choice.arabic && <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 16, color: C.GOLD, textAlign: 'right', marginBottom: 2 }}>{choice.arabic}</Text>}
                        {choice.roman && <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: `${C.GOLD}80`, fontStyle: 'italic', marginBottom: 4 }}>{choice.roman}</Text>}
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>{choice.text}</Text>
                      </Pressable>
                    </MotiView>
                  ))}
                </View>
              </MotiView>
            )}
          </MotiView>
        )}

        {/* FEEDBACK */}
        {phase === 'feedback' && lastChoice && (
          <MotiView from={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 300 }}>
            <View style={{ gap: 16 }}>
              {/* Outcome badge */}
              <View style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: `${outcomeColor[lastChoice.outcome]}18`, borderWidth: 1, borderColor: `${outcomeColor[lastChoice.outcome]}35` }}>
                  {(lastChoice.outcome === 'excellent' || lastChoice.outcome === 'good')
                    ? <Check size={14} color={outcomeColor[lastChoice.outcome]} />
                    : <X size={14} color={outcomeColor[lastChoice.outcome]} />}
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 13, color: outcomeColor[lastChoice.outcome] }}>{outcomeLabel[lastChoice.outcome]}</Text>
                </View>
              </View>

              {/* Score changes */}
              <View style={{ borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-around', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                {Object.entries(lastChoice.impact).map(([key, val]) => {
                  const c = key === 'trust' ? C.GOLD : key === 'respect' ? C.JADE2 : C.VIOLET2;
                  return (
                    <View key={key} style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: val >= 0 ? c : '#E07070' }}>{val > 0 ? '+' : ''}{val}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3, textTransform: 'capitalize', marginTop: 3 }}>{key}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Current scores */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Current relationship</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <ScoreBar label="Trust" value={scores.trust} color={C.GOLD} delay={0} />
                  <ScoreBar label="Respect" value={scores.respect} color={C.JADE2} delay={100} />
                  <ScoreBar label="Culture" value={scores.culture} color={C.VIOLET2} delay={200} />
                </View>
              </View>

              {/* Kaf cultural note */}
              {lastChoice.note && (
                <View style={{ borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, backgroundColor: C.VIOLET_DIM, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
                  <KafMascot size="xs" animate />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.VIOLET2, marginBottom: 4 }}>Cultural Intelligence</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{lastChoice.note}</Text>
                  </View>
                </View>
              )}

              {/* Continue button */}
              <Pressable onPress={next} style={{ borderRadius: 16, overflow: 'hidden' }}>
                {step + 1 >= scenes.length ? (
                  <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: '#05050E' }}>See Your Result</Text>
                    <ChevronRight size={17} color="#05050E" />
                  </LinearGradient>
                ) : (
                  <View style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: C.BORDER }}>
                    <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT2 }}>Continue</Text>
                    <ChevronRight size={17} color={C.TEXT2} />
                  </View>
                )}
              </Pressable>
            </View>
          </MotiView>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400 }}>
            <View style={{ gap: 16, paddingTop: 8 }}>
              {/* Ending card */}
              <View style={{ borderRadius: 24, padding: 24, backgroundColor: `${ending.color}14`, borderWidth: 1.5, borderColor: `${ending.color}35` }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: ending.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                    {ending.type === 'exceptional' ? 'Exceptional' : ending.type === 'success' ? 'Success' : ending.type === 'mixed' ? 'Mixed' : 'Failed'} Outcome
                  </Text>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 8 }}>{ending.title}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20, textAlign: 'center', marginBottom: 16 }}>{ending.desc}</Text>
                  <View style={{ width: '100%', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 24, color: ending.color, textAlign: 'center', marginBottom: 4 }}>"{ending.arabic}"</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${ending.color}90`, textAlign: 'center', fontStyle: 'italic', marginBottom: 4 }}>{ending.roman}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center' }}>Ahmed: "{ending.en}"</Text>
                  </View>
                </View>
              </View>

              {/* Final scores */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
                  {[['Trust', scores.trust, C.GOLD], ['Respect', scores.respect, C.JADE2], ['Culture', scores.culture, C.VIOLET2]].map(([l, v, c]) => (
                    <View key={l as string} style={{ alignItems: 'center' }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: c as string }}>{v as number}</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{l as string}</Text>
                    </View>
                  ))}
                </View>
                <View style={{ paddingVertical: 8, borderRadius: 12, backgroundColor: `${ending.color}12`, alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: ending.color }}>Total: {total}/300</Text>
                </View>
              </View>

              {/* Phrases earned */}
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.JADE2, marginBottom: 8 }}>Phrases added to your library</Text>
                {['يلا نشرب قهوة؟', 'الحمد لله', 'إن شاء الله', 'ما شاء الله'].map(p => (
                  <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.JADE2 }} />
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>{p}</Text>
                  </View>
                ))}
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable onPress={restart} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
                  <RotateCcw size={15} color={C.TEXT2} />
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>Retry</Text>
                </Pressable>
                <Pressable onPress={onExit} style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Home size={15} color="#05050E" />
                    <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: '#05050E' }}>Home</Text>
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
