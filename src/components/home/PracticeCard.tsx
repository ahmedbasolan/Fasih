import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RotateCcw, Lock, ChevronRight } from '../icons';
import { useTheme, FONT_HEADING_SEMI, FONT_LATIN } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { TYPE } from '../design/layout';

interface PracticeCardProps {
  dueCount: number;
  /** Scenarios still needed to unlock Practice; 0 or undefined when unlocked. */
  lockedRemaining?: number;
  onPress: () => void;
}

/** Home's entry point to /practice — flashcards and quizzes. */
export function PracticeCard({ dueCount, lockedRemaining = 0, onPress }: PracticeCardProps) {
  const { C } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 64,
      padding: 14,
      borderRadius: 18,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: C.JADE_ACCENT_DIM,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      ...TYPE.body,
      fontFamily: FONT_HEADING_SEMI,
      color: C.TEXT,
    },
    sub: {
      ...TYPE.caption,
      fontFamily: FONT_LATIN,
      color: C.TEXT2,
      marginTop: 2,
    },
  }), [C]);

  const locked = lockedRemaining > 0;
  const sub = locked
    ? STRINGS.homeSections.reviewLocked(lockedRemaining)
    : dueCount > 0 ? STRINGS.homeSections.reviewDue(dueCount) : STRINGS.homeSections.reviewNoneDue;
  const Icon = locked ? Lock : RotateCcw;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${STRINGS.homeSections.reviewTitle}. ${sub}`}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.iconWrap}>
        <Icon size={18} color={C.JADE_ACCENT} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{STRINGS.homeSections.reviewTitle}</Text>
        <Text style={styles.sub}>{sub}</Text>
      </View>
      <ChevronRight size={18} color={C.TEXT3} />
    </Pressable>
  );
}
