import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_LATIN_SEMI } from '../design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../design/gradients';

type Variant = 'gold' | 'jade';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
}

const VARIANT_STOPS: Record<Variant, readonly string[]> = {
  gold: GOLD_STOPS,
  jade: JADE_STOPS,
};

const DISABLED_STOPS: readonly string[] = ['rgba(200,145,58,0.2)', 'rgba(200,145,58,0.2)'];

export function PrimaryButton({ children, onPress, disabled, variant = 'gold', style }: Props) {
  const stops = disabled ? DISABLED_STOPS : VARIANT_STOPS[variant];

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.root, { opacity: disabled ? 0.5 : 1 }, style]}>
      <LinearGradient
        colors={stops as [string, string, ...string[]]}
        start={ANGLE_135.start}
        end={ANGLE_135.end}
        style={styles.gradient}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, disabled && styles.textDisabled]}>{children}</Text>
        ) : children}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: 16, overflow: 'hidden' },
  gradient: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  text: { fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: '#05050E' },
  textDisabled: { color: C.TEXT3 },
});
