import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import type { LucideIcon } from '../icons';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { ANGLE_135 } from '../design/gradients';
import { FONT_HEADING_SEMI } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  /** Optional Lucide icon rendered to the right of the label */
  Icon?: LucideIcon;
  /**
   * Required when `children` is not a plain string, because then there is no
   * text for the accessible name to fall back to.
   *
   * This component shipped with NO accessibilityRole, label or state at all,
   * while being the primary action on onboarding steps 2-4 and on all three
   * paywall screens — including "Start Free Trial". A screen reader announced
   * the purchase button as an unlabelled, non-interactive element.
   */
  accessibilityLabel?: string;
}

/**
 * ShimmerButton
 *
 * Adapts to the app's primary theme gradient.
 */
export function ShimmerButton({
  children,
  onPress,
  style,
  disabled = false,
  Icon,
  accessibilityLabel,
}: Props) {
  const { C, G } = useTheme();

  const label = typeof children === 'string' ? children : null;
  const isStringChild = label !== null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? undefined}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          width: '100%',
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.container}>
        {/* ── Layer 1: App Theme Background Gradient ── */}
        <ExpoGradient
          colors={G.GOLD_STOPS as any}
          start={ANGLE_135.start}
          end={ANGLE_135.end}
          style={StyleSheet.absoluteFill}

        />

        {/* ── Layer 2: Button content ── */}
        <View style={styles.content} pointerEvents="none">
          {isStringChild ? (
            <>
              <Text style={[styles.text, { color: C.BG }]}>{label}</Text>
              {Icon && <Icon size={18} strokeWidth={1.5} color={C.BG} style={{ marginLeft: 6 }} />}
            </>
          ) : (
            <View style={styles.childWrapper}>{children}</View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 100,    // Pure pill shape
    overflow: 'hidden',   // Perfectly masks gradient spills
    minHeight: 50,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    zIndex: 1, // Ensures text remains on top
  },
  text: {
    fontFamily: FONT_HEADING_SEMI,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  childWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});