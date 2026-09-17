import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Bookmark } from '../components/icons';
import { FONT_HEADING_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../components/design/tokens';
import { RADIUS, SCREEN_MARGIN, SPACE } from '../components/design/spacing';
import { useTheme } from '../hooks/useTheme';
import { GhostLetters, SheetPanel, PrimaryButton, ScreenHeader, Screen } from '../components/ui';
import { getScenarioById, getScenarioScript, isScenarioAvailableFor } from '../constants/scenarios';
import { useAppStore } from '../store/useAppStore';
import { EmptyState } from '../components/ui/EmptyState';
import { STRINGS } from '../constants/strings';
import { DECISIONS_PER_RUN } from '../constants/curriculum';
import { endingsProgress } from '../engine/scenarioPresentation';

interface Props {
  scenarioId: string;
  onBack: () => void;
  onSceneSelect: (sceneIndex: number) => void;
}

export function ScenarioDetailScreen({ scenarioId, onBack, onSceneSelect }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    noMargin: { paddingHorizontal: 0 },
    goBack: {
      borderRadius: RADIUS.pill, paddingVertical: SPACE.lg, alignItems: 'center',
      backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER,
    },
    goBackText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 },
    sheet: { backgroundColor: C.BG, paddingHorizontal: SCREEN_MARGIN, paddingTop: SPACE.xxl },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    decisions: { fontFamily: FONT_HEADING_EXTRA, fontSize: 22, color: C.TEXT },
    saveButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    meta: { fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3 },
    duration: { marginBottom: SPACE.sm },
    endings: { marginBottom: 24 },
    description: { fontFamily: FONT_LATIN, fontSize: 16, color: C.TEXT2, lineHeight: 24, marginBottom: 32 },
    primary: { marginBottom: 28 },
  }), [C]);

  // Memoised for the same reason as ScenarioPlayer: these builders reconstruct
  // the whole scenario corpus on every call, and calling them in the render
  // body meant doing that on every re-render. See the note there.
  const scenario = useMemo(() => getScenarioById(scenarioId, C), [scenarioId, C]);
  const script = useMemo(() => getScenarioScript(scenarioId, C), [scenarioId, C]);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const sceneProgress = useAppStore((s) => s.sceneProgress);
  const userGender = useAppStore((s) => s.user?.gender);
  const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
  const foundEndingIds = useAppStore((s) => s.endingsFound[scenarioId]);
  const toggleFavoriteScenario = useAppStore((s) => s.toggleFavoriteScenario);
  const isCompleted = completedScenarios[scenarioId] !== undefined;
  const scenesUnlocked = sceneProgress[scenarioId] ?? 0;
  const isSaved = favoriteScenarios.includes(scenarioId);

  // Also guards deep links and stale favourites, not just the browse list.
  // Returning bare null here rendered an empty full-screen route with no back
  // affordance — a dead end for anyone arriving on a stale link. ScenarioPlayer
  // already handles the identical case with an empty state and a way out.
  if (!scenario || !script || !isScenarioAvailableFor(scenario, userGender)) {
    return (
      <Screen
        scroll={false}
        // EmptyState is flex: 1, centres itself, and applies SCREEN_MARGIN of
        // its own. Screen's margin on top of that indents it to 40.
        contentStyle={styles.noMargin}
        action={
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.scenarios.goBack}
            style={styles.goBack}
          >
            <Text style={styles.goBackText}>
              {STRINGS.scenarios.goBack}
            </Text>
          </Pressable>
        }
      >
        <EmptyState
          arabic="؟"
          title={STRINGS.scenarios.notFound}
          subtitle={STRINGS.scenarios.noScript(scenarioId)}
        />
      </Screen>
    );
  }

  // Decisions, not scenes: the fork puts two variant scenes in the array for
  // one decision. No scene list either — the scene settings would give the
  // branches away, and a bonus scene would announce the hidden ending's reward.
  const decisions = DECISIONS_PER_RUN;
  const progress = endingsProgress(script, foundEndingIds ?? []);

  return (
    <Screen
      background={<GhostLetters glyphs={['ح', 'و', 'ا']} />}
      // ScreenHeader applies the top inset itself, and both it and the sheet
      // below run edge to edge and set their own horizontal padding.
      headerHandlesTopInset
      contentStyle={styles.noMargin}
    >
        {/* ── Header ──
            Was a 450pt illustrated hero with white text over a black scrim.
            Sadaf has no photographic ground to write on, and the illustration
            was the last consumer of SceneIllustrations. Type on paper instead:
            the title carries the screen. */}
        <ScreenHeader
          eyebrow={scenario.level}
          title={scenario.title}
          subtitle={scenario.subtitle}
          onBack={onBack}
        />

        {/* ── Content Section ── */}
        <SheetPanel radius={RADIUS.sheet} overlap={0} style={styles.sheet}>
          {/* Metadata Row.
              The save toggle used to live as a translucent circle on the hero.
              With the hero gone it sits here, beside the scene count, where it
              is on the paper rather than floating over an image. */}
          <View style={styles.metaRow}>
            <Text style={styles.decisions}>
              {STRINGS.scenarios.decisions(decisions)}
            </Text>
            <Pressable
              onPress={() => toggleFavoriteScenario(scenarioId)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? STRINGS.scenarios.unsaveScenario : STRINGS.scenarios.saveScenario}
              accessibilityState={{ selected: isSaved }}
              style={styles.saveButton}
            >
              <Bookmark size={22} strokeWidth={1.5} color={isSaved ? C.CULTURAL_GOLD_DARK : C.TEXT3} fill={isSaved ? C.CULTURAL_GOLD_DARK : 'none'} />
            </Pressable>
          </View>
          <Text style={[styles.meta, styles.duration]}>
            {STRINGS.home.durationMinutes(script.estimatedMinutes ?? Math.max(3, decisions * 2))}
          </Text>
          <Text style={[styles.meta, styles.endings]}>
            {STRINGS.scenarios.endingsSummary(progress)}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {scenario.kafIntro || scenario.subtitle}
          </Text>

          {/* One primary action.
              Every row of the list below used to be a Pressable calling
              onSceneSelect(index) — but the route discards that index and the
              player always boots at scene 0, so tapping "Scene 04" silently
              started from the beginning. Rows that look tappable and don't do
              what they promise are worse than rows that don't look tappable
              (Jakob's law), and offering N identical-looking entry points to
              one destination is a choice that isn't one (Hick's law). */}
          <PrimaryButton
            onPress={() => onSceneSelect(0)}
            accessibilityLabel={isCompleted
              ? STRINGS.scenarios.playAgain
              : scenesUnlocked > 0 ? STRINGS.scenarios.continueScenario : STRINGS.scenarios.startScenario}
            style={styles.primary}
          >
            {isCompleted
              ? STRINGS.scenarios.playAgain
              : scenesUnlocked > 0 ? STRINGS.scenarios.continueScenario : STRINGS.scenarios.startScenario}
          </PrimaryButton>
        </SheetPanel>
    </Screen>
  );
}
