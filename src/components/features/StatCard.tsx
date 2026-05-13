import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { FONT_HEADING, FONT_LATIN } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  bg: string;
  onPress?: () => void;
}

export function StatCard({ icon, value, label, color, bg, onPress }: Props) {
  const { C } = useTheme();
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 18,
        padding: 14,
        backgroundColor: bg,
        gap: 6,
        ...Platform.select({
          ios: { shadowColor: `${color}30`, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8 },
          android: { elevation: 2 },
        }),
      }}
    >
      {icon}
      <Text style={{ fontFamily: FONT_HEADING, fontSize: 20, color: C.PRIMARY_DARK }}>{value}</Text>
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT_ON_LIGHT }}>{label}</Text>
    </Container>
  );
}
