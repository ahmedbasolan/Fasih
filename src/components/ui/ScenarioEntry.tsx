import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Scenario } from '../../types';
import type { EndingsProgress } from '../../engine/scenarioPresentation';
import {
  FONT_ARABIC_SEMI,
  FONT_HEADING_SEMI,
  FONT_LATIN,
  FONT_LATIN_MEDIUM,
  ARABIC_LINE_HEIGHT_MULTIPLIER,
} from '../design/tokens';
import { SPACE } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { Lock } from '../icons';
import { Rule } from './Rule';

interface ScenarioEntryProps {
  scenario: Scenario;
  /** Sequence position, e.g. "01". Scenario order is the curriculum, so this is real information. */
  index: string;
  first?: boolean;
  /** Endings collection for a written scenario; absent for coming-soon entries. */
  endings?: EndingsProgress;
  onPress: (id: string) => void;
}

const ARABIC_SIZE = 20;

/**
 * Title-first entry for the Scenarios browse list.
 *
 * No meter. The card used to show a Trust/Vibe percentage, but it was a
 * hand-typed number per scenario, not anything the learner did — so it went.
 * What it shows instead is real: how many endings this learner has found.
 */
export function ScenarioEntry({ scenario, index, first, endings, onPress }: ScenarioEntryProps) {
  const { C } = useTheme();
  const {
    id, title, phrases, keyLine, locked, comingSoon,
  } = scenario;

  // Two different things that must not be conflated:
  //
  //   `dimmed`   — the row is not playable right now, so it reads quieter.
  //   `inert`    — the row does nothing at all when tapped.
  //
  // Only `comingSoon` is inert: that content is not written yet, so there is
  // nothing to open. A `locked` scenario IS written and IS shipping — tapping
  // it opens the paywall, and that is the app's primary conversion gesture.
  // Treating the two as one state silently killed it.
  const dimmed = locked || comingSoon;
  const inert = comingSoon === true;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontFamily: FONT_HEADING_SEMI,
          fontSize: 16,
          color: dimmed ? C.TEXT3 : C.TEXT,
        },
        arabic: {
          fontFamily: FONT_ARABIC_SEMI,
          fontSize: ARABIC_SIZE,
          lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT_MULTIPLIER,
          color: C.TEXT,
          writingDirection: 'rtl',
          textAlign: 'left',
          marginTop: SPACE.sm,
        },
        roman: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 12,
          letterSpacing: 0.6,
          color: C.PRIMARY,
          marginTop: SPACE.xs,
        },
        meta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACE.md,
          marginTop: SPACE.md,
        },
        metaText: {
          fontFamily: FONT_LATIN,
          fontSize: 12,
          color: C.TEXT3,
          fontVariant: ['tabular-nums'],
        },
        endings: {
          fontFamily: FONT_LATIN,
          fontSize: 12,
          color: C.TEXT3,
          fontVariant: ['tabular-nums'],
          marginTop: SPACE.xs,
        },
        label: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: C.TEXT3,
        },
        lockedBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACE.xs,
        },
        lockedLabel: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 11,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          // Accent, not TEXT3: this row is actionable, and the accent is what
          // separates "tap to unlock" from "nothing here yet".
          color: C.PRIMARY,
        },
      }),
    [C, dimmed],
  );

  // The badges are the row's state, and they were visual only:
  // a paywalled row and a playable one announced identically as just their
  // title, so a screen-reader user tapped one expecting to play and got the
  // paywall. The comment below says these two states "were previously
  // indistinguishable dimmed rows" — they still were, here.
  const a11yLabel = [
    title,
    comingSoon ? STRINGS.scenarios.comingSoonBadge : locked ? STRINGS.scenarios.lockedBadge : null,
    STRINGS.scenarios.phrases(phrases),
    endings && !comingSoon ? STRINGS.scenarios.endingsSummary(endings) : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Rule
      index={index}
      first={first}
      onPress={inert ? undefined : () => onPress(id)}
      accessibilityLabel={a11yLabel}
    >
      <Text style={styles.title}>{title}</Text>

      {/* One conditional, not two: the pair is either present or absent, so an
          Arabic line can no longer render without its romanisation. */}
      {keyLine ? (
        <>
          <Text style={styles.arabic}>{keyLine.arabic}</Text>
          <Text style={styles.roman}>{keyLine.roman}</Text>
        </>
      ) : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>{STRINGS.scenarios.phrases(phrases)}</Text>

        {/* Locked and coming-soon are different promises and say so. Locked
            content exists and is one tap from the paywall; coming-soon content
            is not written yet. Both were previously indistinguishable dimmed
            rows. */}
        {comingSoon ? (
          <Text style={styles.label}>{STRINGS.scenarios.comingSoonBadge}</Text>
        ) : locked ? (
          <View style={styles.lockedBadge}>
            <Lock size={12} strokeWidth={1.5} color={C.PRIMARY} />
            <Text style={styles.lockedLabel}>{STRINGS.scenarios.lockedBadge}</Text>
          </View>
        ) : null}
      </View>

      {endings && !comingSoon ? (
        <Text style={styles.endings}>{STRINGS.scenarios.endingsSummary(endings)}</Text>
      ) : null}
    </Rule>
  );
}
