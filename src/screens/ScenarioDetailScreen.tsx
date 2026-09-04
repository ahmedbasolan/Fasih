import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bookmark, Play, Lock, CheckCircle2 } from '../components/icons';
import { FONT_HEADING_EXTRA, FONT_HEADING_SEMI, FONT_LATIN, FONT_LATIN_SEMI } from '../components/design/tokens';
import { RADIUS } from '../components/design/spacing';
import { useTheme } from '../hooks/useTheme';
import { GhostLetters, SheetPanel, PrimaryButton, ScreenHeader } from '../components/ui';
import { getScenarioById, getScenarioScript, isScenarioAvailableFor } from '../constants/scenarios';
import { useAppStore } from '../store/useAppStore';
import { EmptyState } from '../components/ui/EmptyState';
import { STRINGS } from '../constants/strings';

interface Props {
  scenarioId: string;
  onBack: () => void;
  onSceneSelect: (sceneIndex: number) => void;
}

export function ScenarioDetailScreen({ scenarioId, onBack, onSceneSelect }: Props) {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Memoised for the same reason as ScenarioPlayer: these builders reconstruct
  // the whole scenario corpus on every call, and calling them in the render
  // body meant doing that on every re-render. See the note there.
  const scenario = useMemo(() => getScenarioById(scenarioId, C), [scenarioId, C]);
  const script = useMemo(() => getScenarioScript(scenarioId, C), [scenarioId, C]);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const sceneProgress = useAppStore((s) => s.sceneProgress);
  const userGender = useAppStore((s) => s.user?.gender);
  const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
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
      <View style={{ flex: 1, backgroundColor: C.BG, paddingTop: insets.top + 40 }}>
        <EmptyState
          arabic="؟"
          title={STRINGS.scenarios.notFound}
          subtitle={STRINGS.scenarios.noScript(scenarioId)}
        />
        <View style={{ paddingHorizontal: 40, marginTop: 8 }}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.scenarios.goBack}
            style={{
              borderRadius: 16, paddingVertical: 14, alignItems: 'center',
              backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER,
            }}
          >
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>
              {STRINGS.scenarios.goBack}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ح', 'و', 'ا']} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
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
        <SheetPanel radius={RADIUS.sheet} overlap={0} style={{ backgroundColor: C.BG, paddingHorizontal: 24, paddingTop: 32 }}>
          {/* Metadata Row.
              The save toggle used to live as a translucent circle on the hero.
              With the hero gone it sits here, beside the scene count, where it
              is on the paper rather than floating over an image. */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 24, color: C.TEXT }}>
              {script.scenes.length} Scenes
            </Text>
            <Pressable
              onPress={() => toggleFavoriteScenario(scenarioId)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from saved scenarios' : 'Save scenario'}
              accessibilityState={{ selected: isSaved }}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={22} strokeWidth={1.5} color={isSaved ? C.CULTURAL_GOLD_DARK : C.TEXT3} fill={isSaved ? C.CULTURAL_GOLD_DARK : 'none'} />
            </Pressable>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3, marginBottom: 24 }}>
            {STRINGS.home.durationMinutes(script.estimatedMinutes ?? Math.max(3, script.scenes.length * 2))}
          </Text>

          {/* Description */}
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 16, color: C.TEXT2, lineHeight: 24, marginBottom: 32 }}>
            {scenario.kafIntro || scenario.subtitle}
          </Text>

          {/* One primary action.
              Every row of the list below used to be a Pressable calling
              onSceneSelect(index) — but the route discards that index and the
              player always boots at scene 0, so tapping "Scene 04" silently
              started from the beginning. Rows that look tappable and don't do
              what they promise are worse than rows that don't look tappable
              (Jakob's law), and offering N identical-looking entry points to
              one destination is a choice that isn't one (Hick's law).
              The list is now a progress display; this is the way in. */}
          <PrimaryButton
            onPress={() => onSceneSelect(0)}
            accessibilityLabel={isCompleted
              ? STRINGS.scenarios.playAgain
              : scenesUnlocked > 0 ? STRINGS.scenarios.continueScenario : STRINGS.scenarios.startScenario}
            style={{ marginBottom: 28 }}
          >
            {isCompleted
              ? STRINGS.scenarios.playAgain
              : scenesUnlocked > 0 ? STRINGS.scenarios.continueScenario : STRINGS.scenarios.startScenario}
          </PrimaryButton>

          {/* Scenes list — progress, not navigation. */}
          <View style={{ gap: 16 }}>
            {script.scenes.length === 0 ? (
              <EmptyState
                title={STRINGS.scenarios.noScenesTitle}
                subtitle={STRINGS.scenarios.noScenesSub}
              />
            ) : (
              script.scenes.map((scene, index) => {
                const isLocked = index > scenesUnlocked && !isCompleted;
                const isDone = !isLocked && (index < scenesUnlocked || isCompleted);
                return (
                  <View
                    key={scene.id}
                    accessible
                    accessibilityLabel={`${STRINGS.scenarios.sceneNumber(index + 1)}, ${scene.setting}, ${
                      isDone ? STRINGS.scenarios.sceneDone
                      : isLocked ? STRINGS.scenarios.sceneLocked
                      : STRINGS.scenarios.sceneNext
                    }`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: C.SURFACE,
                      borderRadius: 24,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: C.BORDER,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                  >
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: isLocked ? C.SURFACE2 : isDone ? C.JADE_DIM : C.JADE_ACCENT_DIM,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16
                    }}>
                      {isLocked ? (
                        <Lock size={20} color={C.TEXT3} />
                      ) : isDone ? (
                        <CheckCircle2 size={20} color={C.JADE} />
                      ) : (
                        <Play size={20} color={C.PRIMARY} fill={C.PRIMARY} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 18, color: C.TEXT, marginBottom: 4 }}>
                        {STRINGS.scenarios.sceneNumber(index + 1)}
                      </Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3 }}>
                        {scene.setting}
                      </Text>
                    </View>

                  </View>
                );
              })
            )}
          </View>
        </SheetPanel>
      </ScrollView>
    </View>
  );
}
