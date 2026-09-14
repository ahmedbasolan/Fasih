import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import {
  Heart, Search, CheckCircle2, Lock,
} from '../components/icons';
import { useAppStore, useScenariosCompletedCount } from '../store/useAppStore';
import {
  getCareerScenarios, getMedicalScenarios, getSocialScenarios, filterScenariosForLearner,
} from '../constants/scenarios';
import {
  FONT_HEADING_SEMI,
  FONT_LATIN,
  FONT_LATIN_MEDIUM,
  SMOOTH,
} from '../components/design/tokens';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../components/design/spacing';
import { TAB_LIST_SCROLL_BOTTOM } from '../components/design/layout';
import { GhostLetters, ScreenHeader, ScenarioEntry } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import { STRINGS } from '../constants/strings';
import type { UserProfile, Scenario } from '../types';

interface Props {
  user: UserProfile | null;
  onScenarioSelect: (id: string) => void;
}

// Hick's law / Occam's razor: 'Recommended' was defined as !s.locked — i.e.
// 'All, minus the locked ones'. It recommended nothing, duplicated a view the
// user already had, and its empty state claimed 'All scenarios coming soon!',
// which can never be true while the first three are free. Two tabs that each
// mean something distinct beat three where one is noise.
type FilterTab = 'all' | 'saved';

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function useRandomHeading() {
  // Pick a random heading and fun fact once, when the component first mounts.
  // Lazy initializers keep the value stable for the component's lifetime without
  // an effect + setState (which would double-render and flash the default first).
  const [heading] = useState(() => pickRandom(STRINGS.scenarios.headings));
  const [funFact] = useState(() => pickRandom(STRINGS.scenarios.funFacts));

  return { heading, funFact };
}

export function ScenariosScreen({ user: _user, onScenarioSelect }: Props) {
  const { C, isDark } = useTheme();
  const { heading, funFact } = useRandomHeading();

  const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
  const hasScenarioAccess = useAppStore((s) => s.hasScenarioAccess);
  // hasScenarioAccess is a store getter, so selecting it subscribes to the
  // function identity — which never changes. These two subscribe to the state
  // it actually reads, so the list re-locks/unlocks when the user subscribes or
  // finishes their third scenario instead of staying stale until remount.
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);
  const completedCount = useScenariosCompletedCount();
  const presentPaywall = useAppStore((s) => s.presentPaywall);
  const userMode = useAppStore((s) => s.user?.mode ?? 'career');
  const userGender = useAppStore((s) => s.user?.gender);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const allScenarios: Scenario[] = useMemo(
    () => filterScenariosForLearner(
      [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)]
        .filter((s) => s.mode === userMode),
      userGender,
    ),
    // isDark is the stable bool determining C — avoids rebuilding the scenario list
    // on every render since C is a new object reference each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, userMode, userGender],
  );

  const displayScenarios = useMemo(() => {
    // Determine actual locked status based on subscription. hasScenarioAccess
    // expects the scenario's position in the full list — index must be taken
    // from allScenarios, NOT the filtered subset, or the "first 3 free" gate
    // rebases and lets paywalled scenarios appear unlocked on filtered tabs.
    const withAccess = allScenarios.map((s, index) => ({
      ...s,
      locked: !hasScenarioAccess(index),
    }));
    const filtered = withAccess.filter((s) => {
      if (filterTab === 'saved') return favoriteScenarios.includes(s.id);
      return true;
    });
    // unlocked first, locked at the bottom
    return filtered.sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1));
    // subscriptionStatus and completedCount are what hasScenarioAccess reads —
    // they are the real dependencies. hasScenarioAccess itself is a stable ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScenarios, filterTab, favoriteScenarios, hasScenarioAccess, subscriptionStatus, completedCount]);

  // Paywalled and unwritten are different states and get different copy.
  // `locked` is assigned above from hasScenarioAccess (subscription); `comingSoon`
  // is authored content metadata.
  const paywalledCount = displayScenarios.filter((s) => s.locked && !s.comingSoon).length;
  const comingSoonCount = displayScenarios.filter((s) => s.comingSoon).length;

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: STRINGS.scenarios.tabAll },
    { id: 'saved', label: STRINGS.scenarios.tabFavourite },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ع', 'ل', 'م']} />

      {/* The eyebrow is the running head: it says which mode you are in on
          every screen, rather than mode being a colour swap nobody reads. */}
      <ScreenHeader
        eyebrow={userMode === 'career' ? STRINGS.scenarios.career : STRINGS.scenarios.social}
        title={heading}
        subtitle={funFact}
      />

      {/* ── Tabs row ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SCREEN_MARGIN,
          paddingBottom: SPACE.md,
          gap: SPACE.sm,
        }}
      >
        {TABS.map(({ id, label }) => {
          const active = filterTab === id;
          return (
            <Pressable
              key={id}
              onPress={() => setFilterTab(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
              hitSlop={8}
              style={{
                paddingHorizontal: SPACE.md,
                paddingVertical: SPACE.sm,
                borderRadius: RADIUS.pill,
                borderWidth: 1,
                borderColor: active ? C.PRIMARY : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: active ? FONT_HEADING_SEMI : FONT_LATIN,
                  fontSize: 14,
                  color: active ? C.PRIMARY : C.TEXT3,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Scenario list ──
          Single column. Entries are separated by their own hairline, so the
          list has no gap and no card fills. */}
      <FlashList
        data={displayScenarios}
        keyExtractor={(item: Scenario) => item.id}
        renderItem={({ item, index }: { item: Scenario; index: number }) => (
          <ScenarioEntry
            scenario={item}
            index={String(index + 1).padStart(2, '0')}
            first={index === 0}
            onPress={() =>
              item.locked ? void presentPaywall() : onScenarioSelect(item.id)
            }
          />
        )}
        {...({ estimatedItemSize: 120 } as any)}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_MARGIN,
          paddingBottom: TAB_LIST_SCROLL_BOTTOM,
        }}
        showsVerticalScrollIndicator={false}
        // Fix black square flash on Android
        removeClippedSubviews={false}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', paddingTop: SPACE.xxxl, gap: SPACE.md }}>
            {filterTab === 'saved'
              ? <Heart size={24} strokeWidth={1.5} color={C.TEXT3} fill="transparent" />
              : <Search size={24} strokeWidth={1.5} color={C.TEXT3} />}
            <Text
              style={{
                fontFamily: FONT_HEADING_SEMI,
                fontSize: 14,
                color: C.TEXT2,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              {filterTab === 'saved'
                ? STRINGS.scenarios.noFavourites
                : STRINGS.scenarios.noResults}
            </Text>
          </View>
        )}
        ListFooterComponent={
          filterTab === 'all' && (paywalledCount > 0 || comingSoonCount > 0)
            ? () => (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...SMOOTH, delay: 120 }}
                >
                  {/* Paywalled scenarios are written and shipping — the row
                      offers the upgrade. Unwritten ones say so and stay inert. */}
                  <Pressable
                    onPress={paywalledCount > 0 ? () => void presentPaywall() : undefined}
                    disabled={paywalledCount === 0}
                    accessibilityRole={paywalledCount > 0 ? 'button' : undefined}
                    accessibilityLabel={
                      paywalledCount > 0
                        ? STRINGS.scenarios.lockedCount(paywalledCount)
                        : undefined
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: SPACE.md,
                      paddingVertical: SPACE.xl,
                    }}
                  >
                    {paywalledCount > 0
                      ? <Lock size={20} strokeWidth={1.5} color={C.PRIMARY} />
                      : <CheckCircle2 size={20} strokeWidth={1.5} color={C.TEXT3} />}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT }}>
                        {paywalledCount > 0
                          ? STRINGS.scenarios.lockedCount(paywalledCount)
                          : STRINGS.scenarios.comingSoon(comingSoonCount, userMode)}
                      </Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: SPACE.xs }}>
                        {paywalledCount > 0
                          ? STRINGS.scenarios.lockedSub
                          : STRINGS.scenarios.writingNext}
                      </Text>
                    </View>
                    {paywalledCount > 0 ? (
                      <Text
                        style={{
                          fontFamily: FONT_LATIN_MEDIUM,
                          fontSize: 11,
                          letterSpacing: 1.6,
                          textTransform: 'uppercase',
                          color: C.PRIMARY,
                        }}
                      >
                        {STRINGS.scenarios.unlock}
                      </Text>
                    ) : null}
                  </Pressable>
                </MotiView>
              )
            : null
        }
      />
    </View>
  );
}
