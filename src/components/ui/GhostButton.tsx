import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { C, FONT_LATIN } from '../design/tokens';

interface Props {
  children: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GhostButton({ children, onPress, style }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.root, style]}>
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.BORDER,
  },
  text: { fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 },
});
