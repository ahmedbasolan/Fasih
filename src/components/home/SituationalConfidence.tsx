/**
 * SituationalConfidence.tsx
 *
 * Replaces WeeklyXP on the home screen.
 * Shows readiness across real UAE situations, calculated from:
 *   - completedScenarios (50% weight per completed scenario mapped to situation)
 *   - categoryMastery accuracy (50% weight from phrase practice)
 *
 * Data comes entirely from existing useAppStore — no new store fields needed.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Coffee, Building2, Briefcase, Moon, Compass, Activity, Users } from '../icons';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI, FONT_HEADING_SEMI } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

type ConfidenceLevel = 'confident' | 'familiar' | 'learning' | 'not-started';

interface SituationConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  scenarioIds: string[];
  phraseCategories: string[];
}

interface SituationResult extends SituationConfig {
  score: number;
  level: ConfidenceLevel;
  phrasesStudied: number;
  scenariosCompleted: number;
}

const SITUATIONS: SituationConfig[] = [
  {
    id: 'cafe-social',
    label: 'Café & Social',
    icon: Coffee,
    scenarioIds: ['coffee-invitation', 'cafe-friends'],
    phraseCategories: ['Social', 'Food & Drink'],
  },
  {
    id: 'hotel-hospitality',
    label: 'Hotel & Hospitality',
    icon: Building2,
    scenarioIds: ['hotel-guest'],
    phraseCategories: ['Hospitality'],
  },
  {
    id: 'workplace',
    label: 'Workplace',
    icon: Briefcase,
    scenarioIds: ['first-morning', 'office-meeting'],
    phraseCategories: ['Workplace', 'Greetings'],
  },
  {
    id: 'cultural-moments',
    label: 'Cultural Moments',
    icon: Moon,
    scenarioIds: ['eid-greeting', 'ramadan-shift'],
    phraseCategories: ['Gratitude', 'Social'],
  },
  {
    id: 'daily-navigation',
    label: 'Daily Navigation',
    icon: Compass,
    scenarioIds: [],
    phraseCategories: ['Everyday'],
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: Activity,
    scenarioIds: ['the-checkup'],
    phraseCategories: [],
  },
  {
    id: 'family-friends',
    label: 'Family & Friends',
    icon: Users,
    scenarioIds: ['weekend-invite'],
    phraseCategories: ['Family'],
  },
];

/**
 * How much a completed scenario counts toward confidence, by its ending.
 *
 * Keyed by ScenarioEnding['type']. The old inline ladder tested for
 * 'success_strong', which is not a member of that union — the branch was dead
 * and plain 'success', the most common good outcome, silently fell through to
 * the neutral 1.0. `src/engine/__tests__/scenarioContent.test.ts` now asserts
 * every authored ending uses a known type.
 */
const ENDING_WEIGHTS: Record<string, number> = {
  exceptional: 1.2,
  success: 1.1,
  mixed: 1.0,
  failed: 0.6,
};

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 70) return 'confident';
  if (score >= 40) return 'familiar';
  if (score > 0)  return 'learning';
  return 'not-started';
}

const LEVEL_LABELS: Record<ConfidenceLevel, string> = {
  'confident':   'Confident',
  'familiar':    'Familiar',
  'learning':    'Learning',
  'not-started': 'Not started',
};

interface SituationalConfidenceProps {
  limit?: number;
}

export function SituationalConfidence({
  limit = 5,
}: SituationalConfidenceProps) {
  const { C } = useTheme();
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const stats              = useAppStore((s) => s.stats);
  const [expanded, setExpanded] = useState(false);

  const situations = useMemo<SituationResult[]>(() => {
    return SITUATIONS.map((sit) => {
      // Each dimension is scored 0–100 on its own, then the populated ones are
      // averaged. The previous version capped each at ~60 and summed them, so a
      // situation with only one dimension mapped could never exceed 60 — and
      // "Confident" needs 70. Daily Navigation (no scenarios) and Healthcare
      // (no phrase categories) were therefore permanently stuck at "Familiar"
      // no matter how much the learner practised.
      const totalScenarios = sit.scenarioIds.length;
      let scenarioPart: number | null = null;
      let scenariosCompleted = 0;
      if (totalScenarios > 0) {
        let weighted = 0;
        for (const id of sit.scenarioIds) {
          const run = completedScenarios[id];
          if (!run) continue;
          scenariosCompleted++;
          weighted += (100 / totalScenarios) * (ENDING_WEIGHTS[run.endingType] ?? 1);
        }
        scenarioPart = Math.min(weighted, 100);
      }

      const totalCategories = sit.phraseCategories.length;
      let phrasePart: number | null = null;
      let phrasesStudied = 0;
      if (totalCategories > 0) {
        let sum = 0;
        for (const cat of sit.phraseCategories) {
          const mastery = stats.categoryMastery?.[cat];
          if (!mastery || mastery.phrasesStudied <= 0) continue;
          phrasesStudied += mastery.phrasesStudied;
          // Mostly how well you know them, partly how many you have met.
          const coverage = Math.min(mastery.phrasesStudied / (mastery.phrasesTotal || 1), 1) * 100;
          sum += mastery.accuracy * 0.85 + coverage * 0.15;
        }
        phrasePart = Math.min(sum / totalCategories, 100);
      }

      const parts = [scenarioPart, phrasePart].filter((p): p is number => p !== null);
      const raw = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;

      return {
        ...sit,
        score: raw,
        level: getConfidenceLevel(raw),
        phrasesStudied,
        scenariosCompleted,
      };
    });
  }, [completedScenarios, stats.categoryMastery]);

  const sorted = useMemo(() => {
    return [...situations].sort((a, b) => {
      if (a.score === 0 && b.score > 0) return 1;
      if (b.score === 0 && a.score > 0) return -1;
      return b.score - a.score;
    });
  }, [situations]);

  const displayed = expanded ? sorted : sorted.slice(0, limit);
  const activeSituations = sorted.filter((s) => s.score > 0).length;
  const canExpand = !expanded && sorted.length > limit;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: 20,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
    },
    title: {
      fontFamily: FONT_HEADING_SEMI,
      fontSize: 16,
      color: C.TEXT,
      fontWeight: '700',
    },
    subtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 11,
      color: C.TEXT2,
      marginTop: 2,
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: C.JADE_DIM,
    },
    seeAllText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.PRIMARY,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: C.BORDER,
      marginHorizontal: 20,
      marginBottom: 14,
    },
    situationsList: {
      paddingHorizontal: 20,
      paddingBottom: 18,
      gap: 12,
    },
    situationRow: {
      gap: 6,
    },
    situationTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    situationLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    situationName: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 14,
      color: C.TEXT,
      fontWeight: '600',
    },
    levelBadge: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 99,
    },
    levelText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    barTrack: {
      height: 5,
      backgroundColor: C.SURFACE,
      borderRadius: 99,
      overflow: 'hidden',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: C.BORDER,
      marginTop: 4,
    },
    footerText: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
    },
    footerHighlight: {
      color: C.TEXT,
      fontFamily: FONT_LATIN_SEMI,
      fontWeight: '600',
    },
  }), [C]);

  function getLevelColors(level: ConfidenceLevel) {
    switch (level) {
      case 'confident':   return { badge: `${C.JADE_ACCENT}33`,   text: C.PRIMARY,       bar: [C.PRIMARY, C.JADE] as [string,string] };
      case 'familiar':    return { badge: C.JADE_DIM,             text: C.TERTIARY,      bar: [C.TERTIARY, C.JADE2] as [string,string] };
      case 'learning':    return { badge: C.JADE_ACCENT_SURFACE,  text: C.CULTURAL_GOLD, bar: [C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK] as [string,string] };
      case 'not-started': return { badge: C.SURFACE2,             text: C.TEXT3,         bar: [C.SURFACE, C.SURFACE] as [string,string] };
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>UAE Situations</Text>
          <Text style={styles.subtitle}>
            {activeSituations === 0
              ? 'Start a scenario to build your confidence'
              : `${activeSituations} of ${SITUATIONS.length} situations in progress`}
          </Text>
        </View>
        {canExpand && (
          <Pressable
            onPress={() => setExpanded(true)}
            style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="See all situations"
          >
            <Text style={styles.seeAllText}>All</Text>
            <ChevronRight size={12} color={C.PRIMARY} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <View style={styles.divider} />

      {activeSituations === 0 ? (
        // ── Empty state ──────────────────────────────────────────────────────────
        <View style={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          alignItems: 'center',
          gap: 14,
        }}>
          {/* Row of situation icons — gives user a preview of what they'll unlock */}
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
            {SITUATIONS.slice(0, 5).map((sit) => {
              const PreviewIcon = sit.icon;
              return (
                <View
                  key={sit.id}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: C.SURFACE,
                    borderWidth: 1,
                    borderColor: C.BORDER,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.55,
                  }}
                >
                  <PreviewIcon size={18} color={C.TEXT2} strokeWidth={1.75} />
                </View>
              );
            })}
          </View>

          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{
              fontFamily: FONT_HEADING_SEMI,
              fontSize: 14,
              color: C.TEXT2,
              textAlign: 'center',
            }}>
              No situations tracked yet
            </Text>
            <Text style={{
              fontFamily: FONT_LATIN,
              fontSize: 12,
              color: C.TEXT3,
              textAlign: 'center',
              maxWidth: 220,
              lineHeight: 18,
            }}>
              Complete a scenario to start building your UAE confidence map
            </Text>
          </View>
        </View>
      ) : (
        // ── Existing situations list ─────────────────────────────────────────────
        <View style={styles.situationsList}>
          {displayed.map((sit) => {
            const colors = getLevelColors(sit.level);
            const SitIcon = sit.icon;
            return (
              <View
                key={sit.id}
                style={styles.situationRow}
              >
                <View style={styles.situationTop}>
                  <View style={styles.situationLabel}>
                    <SitIcon size={14} color={C.TEXT2} strokeWidth={1.75} />
                    <Text style={styles.situationName}>{sit.label}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: colors.badge }]}>
                    <Text style={[styles.levelText, { color: colors.text }]}>
                      {LEVEL_LABELS[sit.level]}
                    </Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <View style={{ width: `${sit.score}%` as any, height: '100%' }}>
                    <LinearGradient
                      colors={sit.level === 'not-started' ? [C.SURFACE, C.SURFACE] : colors.bar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flex: 1, borderRadius: 99 }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {activeSituations > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Most improved:{' '}
            <Text style={styles.footerHighlight}>
              {sorted.find((s) => s.score > 0)?.label ?? '–'}
            </Text>
          </Text>
          <Text style={styles.footerText}>
            <Text style={styles.footerHighlight}>{activeSituations}</Text>{' '}active
          </Text>
        </View>
      )}
    </View>
  );
}
