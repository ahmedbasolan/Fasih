import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Scenario } from '../../types';
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
  onPress: (id: string) => void;
}

const ARABIC_SIZE = 20;

/**
 * Title-first entry for the Scenarios browse list.
 *
 * Shows ONE headline metric, not three. Three meters per card made the grid a
 * wall of instrumentation in which no title could be scanned; the full set
 * lives on the scenario detail screen where detail was asked for.
 */
export function ScenarioEntry({ scenario, index, first, onPress }: ScenarioEntryProps) {
  const { C } = useTheme();
  const {
    id, title, phrases, keyLine, keyLineRoman, impactPreview, locked, comingSoon, mode,
  } = scenario;

  const headline = impactPreview?.trust;

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

  // The Career/Social vocabulary split is a product differentiator, not a
  // cosmetic label swap — see spec §5.1. The same underlying metric is called
  // Trust in Career mode and Vibe in Social mode, and the browse list is the
  // most-seen place it appears.
  const headlineLabel =
    mode === 'career' ? STRINGS.scenarios.trust : STRINGS.scenarios.vibe;

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
        metricValue: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 12,
          color: C.PRIMARY,
          fontVariant: ['tabular-nums'],
        },
        track: {
          height: 2,
          backgroundColor: C.BORDER,
          marginTop: SPACE.md,
        },
        fill: {
          height: 2,
          backgroundColor: C.PRIMARY,
        },
        label: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 10,
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
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          // Accent, not TEXT3: this row is actionable, and the accent is what
          // separates "tap to unlock" from "nothing here yet".
          color: C.PRIMARY,
        },
      }),
    [C, dimmed],
  );

  const showMetric = headline !== undefined && !dimmed;

  return (
    <Rule
      index={index}
      first={first}
      onPress={inert ? undefined : () => onPress(id)}
      accessibilityLabel={title}
    >
      <Text style={styles.title}>{title}</Text>

      {keyLine ? <Text style={styles.arabic}>{keyLine}</Text> : null}
      {keyLineRoman ? <Text style={styles.roman}>{keyLineRoman}</Text> : null}

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

        {showMetric ? (
          <Text style={styles.metricValue}>{`${headlineLabel} ${headline}%`}</Text>
        ) : null}
      </View>

      {showMetric ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${headline}%` }]} />
        </View>
      ) : null}
    </Rule>
  );
}
