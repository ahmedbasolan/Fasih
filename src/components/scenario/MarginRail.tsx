import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { RailMark } from '../../engine/marginRail';
import { SPACE } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  marks: RailMark[];
  /**
   * Vertical in the player (a margin down the leading edge); horizontal on the
   * ending screen, where the whole run is read at once.
   *
   * A prop rather than a rotate transform: rotation breaks layout measurement
   * and reverses accessibility ordering.
   */
  orientation?: 'vertical' | 'horizontal';
}

const UNIT = 8;

/**
 * The margin rail — the scenario's consequence, made visible.
 *
 * One mark per decision, accreted in order. By the end you can see the shape of
 * the conversation you had: where it ran warm, where it turned.
 *
 * Warm and cold marks differ in FILL and SIZE, not only in colour. A rail read
 * by hue alone would be unreadable to a colour-blind learner, and this is the
 * one surface in the app whose entire job is being read at a glance.
 *
 * Holds no logic — everything is decided in engine/marginRail, where it is
 * tested.
 */
export function MarginRail({ marks, orientation = 'vertical' }: Props) {
  const { C } = useTheme();
  const vertical = orientation === 'vertical';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        rail: {
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          gap: SPACE.sm,
          paddingVertical: SPACE.md,
          paddingHorizontal: vertical ? 0 : SPACE.md,
          // Horizontal reads as one span of time, so the marks distribute
          // across the full width rather than clustering at the start. Vertical
          // has no fixed height to distribute within, so it stays gap-spaced.
          ...(vertical ? null : { alignSelf: 'stretch', justifyContent: 'space-between' }),
        },
        track: {
          position: 'absolute',
          backgroundColor: C.BORDER,
          ...(vertical
            ? { top: 0, bottom: 0, width: StyleSheet.hairlineWidth }
            : { left: 0, right: 0, height: StyleSheet.hairlineWidth }),
        },
        // Hollow: the border draws the mark, the fill is the page showing
        // through — BORDER2 at zero alpha rather than a bare 'transparent'.
        empty: {
          width: UNIT,
          height: UNIT,
          borderWidth: 1,
          borderColor: C.BORDER2,
          backgroundColor: `${C.BORDER2}00`,
        },
        // A strong choice is larger and solid; a weak one is hollow. Shape
        // carries the reading, colour reinforces it.
        excellent: { width: UNIT * 1.75, height: UNIT * 1.75, backgroundColor: C.PRIMARY },
        good: { width: UNIT * 1.25, height: UNIT * 1.25, backgroundColor: C.PRIMARY },
        neutral: { width: UNIT, height: UNIT, backgroundColor: C.TEXT3 },
        // Judgement choice: one size for every valid answer, so the rail shows
        // that a decision was made without grading it.
        chosen: { width: UNIT * 1.25, height: UNIT * 1.25, backgroundColor: C.TEXT2 },
        bad: {
          width: UNIT * 1.75,
          height: UNIT * 1.75,
          borderWidth: 1.5,
          borderColor: C.ERROR,
          backgroundColor: `${C.ERROR}00`,
        },
      }),
    [C, vertical],
  );

  const styleFor = (m: RailMark) => {
    if (m.state === 'empty') return styles.empty;
    switch (m.outcome) {
      case 'excellent': return styles.excellent;
      case 'good': return styles.good;
      case 'bad': return styles.bad;
      case 'chosen': return styles.chosen;
      default: return styles.neutral;
    }
  };

  return (
    <View style={styles.rail} accessibilityElementsHidden importantForAccessibility="no">
      <View style={styles.track} />
      {marks.map((m, i) => (
        <View key={i} style={styleFor(m)} />
      ))}
    </View>
  );
}
