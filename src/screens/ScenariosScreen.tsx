import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import {
  Heart, Search, CheckCircle2, Lock,
} from '../components/icons';
import { useAppStore, useScenariosCompletedCount } from '../store/useAppStore';
import {
  getCareerScenarios, getSocialScenarios, filterScenariosForLearner, getScenarioScripts,
} from '../constants/scenarios';
import { endingsProgress, type EndingsProgress } from '../engine/scenarioPresentation';
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
import type { UserProfile, Scenario, ScenarioMode } from '../types';

interface Props {
  user: UserProfile | null;
  onScenarioSelect: (id: string) => void;
}

// Hick's law / Occam's razor: 'Recommended' was defined as !s.locked — i.e.
// 'All, minus the locked ones'. It recommended nothing, duplicated a view the
// user already had, and its empty state claimed 'All scenarios coming soon!',
// which can never be true while any scenario is free. Two tabs that each
// mean something distinct beat three where one is noise.
type FilterTab = 'all' | 'saved';

/** The list is grouped by mode, so it mixes section headings with entries. */
type Row =
  | { kind: 'header'; mode: ScenarioMode }
  | {
      kind: 'scenario';
      scenario: Scenario;
      /** Row order within the section, after the filter and the locked-last sort. */
      index: number;
      /** Position in the mode's curriculum — the number shown. Stable across sort and filter. */
      position: number;
      endings: EndingsProgress | undefined;
    };

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
  const endingsFound = useAppStore((s) => s.endingsFound);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const styles = useMemo(() => StyleSheet.create({
    modeHeader: {
      fontFamily: FONT_LATIN_MEDIUM,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: C.TEXT3,
      paddingTop: SPACE.xl,
      paddingBottom: SPACE.sm,
    },
  }), [C]);

  // Both modes, always (spec 2026-09-14 Q19): with six scenarios, hiding the
  // other mode's three made a paid app look half-empty — and a career learner
  // still rides taxis. The learner's own mode is listed first.
  const allScenarios: Scenario[] = useMemo(
    () => filterScenariosForLearner([...getCareerScenarios(C), ...getSocialScenarios(C)], userGender),
    // isDark is the stable bool determining C — avoids rebuilding the scenario list
    // on every render since C is a new object reference each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, userGender],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scripts = useMemo(() => getScenarioScripts(C), [isDark]);

  const rows: Row[] = useMemo(() => {
    const modes: ScenarioMode[] = userMode === 'career' ? ['career', 'social'] : ['social', 'career'];
    const out: Row[] = [];
    for (const mode of modes) {
      // hasScenarioAccess takes the position WITHIN the mode — "scenario 1 of
      // each mode is free" is a per-mode rule — and it must be taken before the
      // saved filter, or the free slots rebase onto whatever is left.
      const list = allScenarios
        .filter((s) => s.mode === mode)
        .map((s, position) => ({ scenario: { ...s, locked: !hasScenarioAccess(position) }, position }))
        .filter(({ scenario }) => filterTab !== 'saved' || favoriteScenarios.includes(scenario.id))
        // unlocked first, locked at the bottom
        .sort((a, b) => (a.scenario.locked === b.scenario.locked ? 0 : a.scenario.locked ? 1 : -1));
      if (list.length === 0) continue;
      out.push({ kind: 'header', mode });
      list.forEach(({ scenario, position }, index) => {
        const script = scripts[scenario.id];
        out.push({
          kind: 'scenario',
          scenario,
          index,
          position,
          endings: script ? endingsProgress(script, endingsFound[scenario.id] ?? []) : undefined,
        });
      });
    }
    return out;
    // subscriptionStatus and completedCount are what hasScenarioAccess reads —
    // they are the real dependencies. hasScenarioAccess itself is a stable ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allScenarios, scripts, userMode, filterTab, favoriteScenarios, endingsFound, hasScenarioAccess, subscriptionStatus, completedCount]);

  const displayScenarios = rows.flatMap((r) => (r.kind === 'scenario' ? [r.scenario] : []));

  // Paywalled and unwritten are different states and get different copy.
  // `locked` is assigned above from hasScenarioAccess (subscription); `comingSoon`
  // is authored content metadata.
  const paywalledCount = displayScenarios.filter((s) => s.locked && !s.comingSoon).length;
  const comingSoonScenarios = displayScenarios.filter((s) => s.comingSoon);
  const comingSoonCount = comingSoonScenarios.length;

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
                // Same width either way, so the label doesn't shift; PRIMARY at zero alpha.
                borderColor: active ? C.PRIMARY : `${C.PRIMARY}00`,
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
        data={rows}
        keyExtractor={(row: Row) => (row.kind === 'header' ? `header-${row.mode}` : row.scenario.id)}
        getItemType={(row: Row) => row.kind}
        renderItem={({ item: row }: { item: Row }) =>
          row.kind === 'header' ? (
            <Text accessibilityRole="header" style={styles.modeHeader}>
              {row.mode === 'career' ? STRINGS.scenarios.career : STRINGS.scenarios.social}
            </Text>
          ) : (
            <ScenarioEntry
              scenario={row.scenario}
              index={String(row.position + 1).padStart(2, '0')}
              first={row.index === 0}
              endings={row.endings}
              onPress={() =>
                row.scenario.locked ? void presentPaywall() : onScenarioSelect(row.scenario.id)
              }
            />
          )
        }
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
                          : STRINGS.scenarios.comingSoon(comingSoonCount, comingSoonScenarios[0]?.mode ?? userMode)}
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
