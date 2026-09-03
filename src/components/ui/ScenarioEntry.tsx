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
  const unavailable = locked || comingSoon;

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
          color: unavailable ? C.TEXT3 : C.TEXT,
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
      }),
    [C, unavailable],
  );

  const showMetric = headline !== undefined && !unavailable;

  return (
    <Rule
      index={index}
      first={first}
      onPress={unavailable ? undefined : () => onPress(id)}
      accessibilityLabel={title}
    >
      <Text style={styles.title}>{title}</Text>

      {keyLine ? <Text style={styles.arabic}>{keyLine}</Text> : null}
      {keyLineRoman ? <Text style={styles.roman}>{keyLineRoman}</Text> : null}

      <View style={styles.meta}>
        <Text style={styles.metaText}>{STRINGS.scenarios.phrases(phrases)}</Text>
        {comingSoon ? <Text style={styles.label}>{STRINGS.scenarios.comingSoonBadge}</Text> : null}
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
