import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Compass, Users, BookOpen, RotateCcw, Home, ArrowRight, Volume2, Blocks, Sparkles } from '../icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  FONT_ARABIC, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI,
} from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { useTheme } from '../../hooks/useTheme';
import { Companion } from '../ui/Companion';
import { MarginRail } from './MarginRail';
import { STRINGS } from '../../constants/strings';
import { GRAMMAR_PATTERNS } from '../../constants/grammar';
import type { RailMark } from '../../engine/marginRail';
import type { Phrase, ScenarioEnding, ScenarioScript } from '../../types';

// ─── PhraseCard ───────────────────────────────────────────────────────────────
// Only used on the result screen, so it lives here alongside its only consumer.

function PhraseCard({ arabic, roman, english, onSpeak, isPlaying }: {
  arabic: string;
  roman: string;
  english: string;
  onSpeak: () => void;
  isPlaying: boolean;
}) {
  const { C } = useTheme();
  return (
    <View style={{ borderRadius: 14, padding: 14, backgroundColor: C.JADE_SURFACE, borderWidth: 1, borderColor: C.JADE_BORDER, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: C.JADE, textAlign: 'right', flex: 1, lineHeight: 30 }}>{arabic}</Text>
        <Pressable
          hitSlop={8}
          onPress={onSpeak}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Stop audio' : 'Listen to phrase'}
          style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: isPlaying ? C.JADE_DIM : C.SURFACE, borderWidth: 1, borderColor: isPlaying ? C.JADE_BORDER : C.BORDER, marginLeft: 10 }}
        >
          <Volume2 size={13} color={isPlaying ? C.JADE : C.TEXT3} />
        </Pressable>
      </View>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${C.JADE}80`, fontStyle: 'italic' }}>{roman}</Text>
      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.TEXT2, marginTop: 2 }}>{english}</Text>
    </View>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  ending: ScenarioEnding;
  endings: ScenarioEnding[];
  impact: { trust: number; respect: number; culture: number };
  total: number;
  scenarioId: string;
  scriptData: ScenarioScript;
  /**
   * The completed run, one mark per decision. Locked by the player before
   * `finalizeScenario()` nulls the live state — see `finalizedRail` there.
   * Empty for a run whose state was already gone, in which case the section
   * is not rendered at all.
   */
  railMarks: RailMark[];
  unlockedPhrases: Phrase[];
  toneHistory: { sceneId: string; tone: 'warm' | 'neutral' | 'cold' }[];
  culturalJourneyNotes: string[];
  getCommunityEndingStat: (key: string) => number;
  isSpeaking: boolean;
  playingPhraseId: string | null;
  onPlayEndPhrase: (phraseId: string, arabic: string) => void;
  onRestart: () => void;
  onExit: () => void;
  onShare: (title: string, arabic: string, en: string, isSecret: boolean, total: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ScenarioResultPhase({
  ending, endings, impact, total, scenarioId, scriptData,
  railMarks, unlockedPhrases, toneHistory, culturalJourneyNotes,
  getCommunityEndingStat, isSpeaking, playingPhraseId,
  onPlayEndPhrase, onRestart, onExit, onShare,
}: Props) {
  const { C, G } = useTheme();
  const violetColor = C.VIOLET;

  const impactValues = [
    { label: 'Trust',   value: impact.trust,   color: C.CULTURAL_GOLD },
    { label: 'Respect', value: impact.respect, color: C.JADE2 },
    { label: 'Culture', value: impact.culture, color: C.VIOLET },
  ];
  const sortedImpact = [...impactValues].sort((a, b) => b.value - a.value);
  const hasDivergence = sortedImpact[0].value - sortedImpact[2].value >= 8;

  return (
    <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 360 }}>
      <View style={{ gap: 14, paddingTop: 8 }}>

        {/* Ending card */}
        <View style={{ borderRadius: 24, padding: 22, backgroundColor: `${ending.color}18`, borderWidth: 1.5, borderColor: `${ending.color}40` }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: ending.color, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
              {ending.type.charAt(0).toUpperCase() + ending.type.slice(1)} Outcome
            </Text>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 28, color: C.TEXT, marginBottom: 8, textAlign: 'center' }}>{ending.title}</Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, lineHeight: 20, textAlign: 'center', marginBottom: 16 }}>{ending.desc}</Text>
            <View style={{ width: '100%', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, backgroundColor: `${ending.color}10` }}>
              <Text style={{ fontFamily: FONT_ARABIC, fontSize: 22, color: ending.color, textAlign: 'center', marginBottom: 4 }}>{`"${ending.arabic}"`}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: `${ending.color}85`, textAlign: 'center', fontStyle: 'italic', marginBottom: 4 }}>{ending.roman}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3, textAlign: 'center' }}>{ending.en}</Text>
            </View>
          </View>
        </View>

        {/* Discovery badge */}
        <View style={{ borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Compass size={15} color={C.VIOLET2} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.TEXT }}>
              {STRINGS.scenarios.endingDiscovery(endings.length)}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginTop: 1 }}>
              {STRINGS.scenarios.tryDifferentChoices}
            </Text>
          </View>
        </View>

        {/* Secret ending teaser */}
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

        {/* Relationship arc */}
        {toneHistory.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 140 }}>
            <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>
                How the relationship evolved
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {toneHistory.map(({ sceneId, tone }, i) => {
                  const dotColor = tone === 'warm' ? C.JADE_ACCENT : tone === 'cold' ? C.ERROR : C.TEXT3;
                  const label = tone === 'warm' ? 'Warm' : tone === 'cold' ? 'Cold' : 'Neutral';
                  return (
                    <React.Fragment key={sceneId}>
                      <View style={{ alignItems: 'center', gap: 6 }}>
                        <View
                          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: `${dotColor}20`, borderWidth: 1.5, borderColor: dotColor, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                        </View>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: dotColor }}>{label}</Text>
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
          <View style={{ borderRadius: 14, padding: 14, backgroundColor: ending.secret ? `${C.VIOLET}12` : `${C.JADE_ACCENT}12`, borderWidth: 1, borderColor: ending.secret ? `${C.VIOLET}28` : `${C.JADE_ACCENT}28`, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Users size={18} color={ending.secret ? C.VIOLET2 : C.JADE_ACCENT} />
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT, flex: 1, lineHeight: 20 }}>
              {ending.secret
                ? STRINGS.scenarios.communityEndingSecret(getCommunityEndingStat(`${scenarioId}:${ending.type}`))
                : STRINGS.scenarios.communityEnding(getCommunityEndingStat(`${scenarioId}:${ending.type}`))}
            </Text>
          </View>
        </MotiView>

        {/* The path you took — shape above totals. The rail says WHAT you did
            and where it turned; the three numbers below say how much it added
            up to. Different questions, so both stay. */}
        {railMarks.some((m) => m.state === 'filled') && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 340, delay: 100 }}>
            <View
              accessible
              accessibilityRole="text"
              accessibilityLabel={STRINGS.scenarios.railSummary(
                railMarks
                  .filter((m) => m.state === 'filled')
                  .map((m) => STRINGS.scenarios.railWord[(m as Extract<RailMark, { state: 'filled' }>).outcome]),
              )}
              style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}
            >
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                {STRINGS.scenarios.railTitle}
              </Text>
              <MarginRail marks={railMarks} orientation="horizontal" />
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, lineHeight: 17 }}>
                {STRINGS.scenarios.railSub}
              </Text>
            </View>
          </MotiView>
        )}

        {/* Meter summary */}
        <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {impactValues.map(({ label, value, color }) => (
              <View key={label} style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</Text>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: value !== 0 ? color : C.TEXT3, marginTop: 4 }}>
                  {value > 0 ? `+${value}` : value}
                </Text>
              </View>
            ))}
          </View>
          {hasDivergence && (
            <View style={{ borderRadius: 12, padding: 12, backgroundColor: `${sortedImpact[0].color}15`, borderWidth: 1, borderColor: `${sortedImpact[0].color}30` }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, textAlign: 'center', lineHeight: 18 }}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, color: sortedImpact[0].color }}>{sortedImpact[0].label}</Text> is your strongest area (+{sortedImpact[0].value}),{' '}
                but <Text style={{ fontFamily: FONT_LATIN_BOLD, color: sortedImpact[2].color }}>{sortedImpact[2].label}</Text> needs work ({sortedImpact[2].value > 0 ? '+' : ''}{sortedImpact[2].value}).{' '}
                Try choices that balance all three dimensions.
              </Text>
            </View>
          )}
        </View>

        {/* Final score */}
        <View style={{ borderRadius: 16, padding: 20, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', gap: 4 }} accessible accessibilityRole="text" accessibilityLabel={`Final score ${total}`}>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1 }}>Final Score</Text>
          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 34, color: ending.color }}>{total}</Text>
        </View>

        {/* Cultural journey */}
        {culturalJourneyNotes.length > 0 && (
          <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 200 }}>
            <View style={{ borderRadius: 16, padding: 16, backgroundColor: C.VIOLET_SURFACE, borderWidth: 1, borderColor: C.VIOLET_BORDER }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Companion size={32} />
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: violetColor }}>
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
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE }}>
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
                    onSpeak={() => onPlayEndPhrase(p.id, p.arabic)}
                    isPlaying={playingPhraseId === p.id && isSpeaking}
                  />
                ))}
              </View>
            </View>
          </MotiView>
        )}

        {/* Pattern unlocked */}
        {(() => {
          const unlockedPatterns = GRAMMAR_PATTERNS.filter(
            (p) => p.unlockedByScenario === scenarioId && !p.secretUnlock,
          );
          if (unlockedPatterns.length === 0) return null;
          return (
            <MotiView from={{ opacity: 0, translateY: 6 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 420 }}>
              <View style={{ borderRadius: 16, padding: 16, backgroundColor: `${C.CULTURAL_GOLD}12`, borderWidth: 1, borderColor: `${C.CULTURAL_GOLD}30` }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Sparkles size={14} color={C.CULTURAL_GOLD_DARK} />
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.CULTURAL_GOLD_DARK }}>
                    {STRINGS.scenarios.patternUnlockedTitle}
                  </Text>
                </View>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 12 }}>
                  {STRINGS.scenarios.patternUnlockedSub}
                </Text>
                {unlockedPatterns.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/sentence-builder?pattern=${p.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.title} — ${STRINGS.sentenceBuilder.title}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      backgroundColor: `${C.CULTURAL_GOLD}14`,
                      borderWidth: 1,
                      borderColor: `${C.CULTURAL_GOLD}30`,
                      marginBottom: 8,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${C.CULTURAL_GOLD}22`, alignItems: 'center', justifyContent: 'center' }}>
                        <Blocks size={15} color={C.CULTURAL_GOLD_DARK} />
                      </View>
                      <Text style={{ fontFamily: FONT_ARABIC, fontSize: 16, color: C.TEXT }}>{p.title}</Text>
                    </View>
                    <ArrowRight size={14} color={C.CULTURAL_GOLD_DARK} style={{ transform: [{ rotate: '-45deg' }] }} />
                  </Pressable>
                ))}
              </View>
            </MotiView>
          );
        })()}

        {/* Share result */}
        <MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: 460 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share your result"
            onPress={() => onShare(ending.title, ending.arabic, ending.en, !!ending.secret, total)}
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
          <Pressable onPress={onRestart} accessibilityRole="button" style={{ flex: 1, paddingVertical: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
            <RotateCcw size={14} color={C.TEXT2} />
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>{STRINGS.scenarios.retry}</Text>
          </Pressable>
          <Pressable onPress={onExit} accessibilityRole="button" style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient colors={[...G.GOLD_STOPS]} start={ANGLE_135.start} end={ANGLE_135.end} style={{ paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Home size={14} color={C.BG} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.BG }}>{STRINGS.scenarios.home}</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </MotiView>
  );
}
