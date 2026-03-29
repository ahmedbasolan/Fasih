import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD } from '../design/tokens';

interface Props {
  arabic?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ arabic = '؟', title, subtitle, icon }: Props) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.root}
    >
      {icon ?? (
        <Text style={styles.arabic}>{arabic}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: { paddingVertical: 56, alignItems: 'center', gap: 8 },
  arabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 42, color: C.TEXT3, marginBottom: 4 },
  title: { fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.TEXT2, textAlign: 'center' },
  subtitle: { fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, textAlign: 'center', maxWidth: 260 },
});
