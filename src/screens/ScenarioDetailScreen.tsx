import React from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bookmark, Play, Lock, CheckCircle2 } from '../components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_HEADING_EXTRA, FONT_HEADING_SEMI, FONT_LATIN, FONT_LATIN_SEMI } from '../components/design/tokens';
import { useTheme } from '../hooks/useTheme';
import { GhostLetters, SheetPanel } from '../components/ui';
import { HeroSceneBg } from '../components/features/SceneIllustrations';
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
  const { width: screenW } = useWindowDimensions();
  
  const scenario = getScenarioById(scenarioId, C);
  const script = getScenarioScript(scenarioId, C);
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
        {/* ── Header Image Section ── */}
        <View style={{ height: 450, width: '100%', backgroundColor: C.PRIMARY }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
             <HeroSceneBg width={screenW} height={450} />
             <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
             />
          </View>

          {/* Navigation Controls */}
          <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable 
              onPress={onBack}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={24} color={C.WHITE} />
            </Pressable>
            <Pressable
              onPress={() => toggleFavoriteScenario(scenarioId)}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from saved scenarios' : 'Save scenario'}
              accessibilityState={{ selected: isSaved }}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Bookmark size={20} color={isSaved ? C.PRIMARY : C.WHITE} fill={isSaved ? C.PRIMARY : 'none'} />
            </Pressable>
          </View>

          {/* Title Overlay */}
          <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24 }}>
            <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 36, color: C.WHITE, marginBottom: 8 }}>
              {scenario.title}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 18, color: 'rgba(255,255,255,0.9)' }}>
              {STRINGS.home.featuredAuthor}
            </Text>
          </View>
        </View>

        {/* ── Content Section ── */}
        <SheetPanel radius={40} overlap={30} style={{ backgroundColor: C.BG, paddingHorizontal: 24, paddingTop: 32 }}>
          {/* Metadata Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 24, color: C.TEXT }}>
              {script.scenes.length} Scenes
            </Text>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.PRIMARY }}>
              {scenario.level}
            </Text>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3, marginBottom: 24 }}>
            {STRINGS.home.durationMinutes(script.estimatedMinutes ?? Math.max(3, script.scenes.length * 2))}
          </Text>

          {/* Description */}
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 16, color: C.TEXT2, lineHeight: 24, marginBottom: 32 }}>
            {scenario.kafIntro || scenario.subtitle}
          </Text>

          {/* Scenes List */}
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
                  <Pressable
                    key={scene.id}
                    onPress={() => !isLocked && onSceneSelect(index)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: C.SURFACE,
                      borderRadius: 24,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: C.BORDER,
                    }}
                  >
                    <View style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: isLocked ? 'rgba(2,185,134,0.05)' : isDone ? C.JADE_DIM : 'rgba(2,185,134,0.12)',
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
                        Scene {String(index + 1).padStart(2, '0')}
                      </Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT3 }}>
                        {scene.setting}
                      </Text>
                    </View>

                  </Pressable>
                );
              })
            )}
          </View>
        </SheetPanel>
      </ScrollView>
    </View>
  );
}
