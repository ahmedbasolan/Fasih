import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, AccessibilityRole, AccessibilityState, GestureResponderEvent } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  rippleColor?: string;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
}

interface RippleProps {
  x: number;
  y: number;
  id: number;
}

export function RippleEffect({
  children,
  onPress,
  rippleColor,
  disabled = false,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: Props) {
  const { C } = useTheme();
  const effectColor = rippleColor || C.JADE_ACCENT;
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  // Ripple cleanup timers, cleared on unmount. The main consumer is the
  // scenario choice button, whose own handler advances the phase after exactly
  // 600ms — the same delay — so these used to fire into a torn-down tree on
  // essentially every choice.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Monotonic id: Date.now() collides when two ripples land in the same
  // millisecond, which duplicates React keys on a fast double-tap.
  const nextId = useRef(0);

  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach(clearTimeout); };
  }, []);

  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    const { locationX, locationY } = event.nativeEvent;
    const newRipple = { x: locationX, y: locationY, id: nextId.current++ };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    const t = setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      timers.current = timers.current.filter(x => x !== t);
    }, 600);
    timers.current.push(t);

    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      style={styles.container}
    >
      <View style={styles.content}>
        {children}
      </View>
      
      {ripples.map(ripple => (
        <MotiView
          key={ripple.id}
          from={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={[
            styles.ripple,
            {
              backgroundColor: effectColor,
              left: ripple.x - 25,
              top: ripple.y - 25,
            }
          ]}
        />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    pointerEvents: 'none',
  },
});
