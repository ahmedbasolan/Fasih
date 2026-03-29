import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C, FONT_LATIN_BOLD, FONT_LATIN } from '../design/tokens';

interface Props {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  bg: string;
  onPress?: () => void;
}

export function StatCard({ icon, value, label, color, bg, onPress }: Props) {
  const Container = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} style={[styles.root, { backgroundColor: bg, borderColor: `${color}22` }]}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  value: { fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: C.TEXT },
  label: { fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 },
});
