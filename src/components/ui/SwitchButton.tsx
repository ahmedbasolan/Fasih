import React, { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../hooks/useTheme';

type SwitchProps = {
  value: boolean;
  onToggle: () => void;
  iconOn: ReactNode;
  iconOff: ReactNode;
  backgroundColor?: string;
  /**
   * Required. The icons inside are decorative and carry no accessible name, so
   * without this the control announced as an unlabelled button. Making it
   * optional would let the next call site ship the same gap.
   */
  accessibilityLabel: string;
};

export function SwitchButton({ value, onToggle, iconOn, iconOff, backgroundColor, accessibilityLabel }: SwitchProps) {
  const { C } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={{
        flexDirection: 'row',
        width: 60,
        height: 32,
        borderRadius: 16,
        padding: 4,
        backgroundColor: backgroundColor || C.SURFACE2,
        borderWidth: 1,
        borderColor: backgroundColor ? `${backgroundColor}40` : C.BORDER,
        alignItems: 'center',
      }}
    >
      <MotiView
        animate={{
          translateX: value ? 26 : 0,
        }}
        transition={{
          type: 'spring',
          damping: 18,
          stiffness: 220,
        }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 14,
          backgroundColor: C.SURFACE,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: 4,
          // No shadow: SheetPanel is the app's only one. The knob reads as
          // raised from its own fill against the coloured track.
          zIndex: 10,
        }}
      >
        <AnimatePresence>
          {value ? (
            <MotiView
              key="on"
              from={{ opacity: 0, scale: 0.5, rotate: '-45deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
              exit={{ opacity: 0, scale: 0.5, rotate: '45deg' }}
              transition={{ type: 'timing', duration: 250 }}
              style={{ position: 'absolute' }}
            >
              {iconOn}
            </MotiView>
          ) : (
            <MotiView
              key="off"
              from={{ opacity: 0, scale: 0.5, rotate: '45deg' }}
              animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
              exit={{ opacity: 0, scale: 0.5, rotate: '-45deg' }}
              transition={{ type: 'timing', duration: 250 }}
              style={{ position: 'absolute' }}
            >
              {iconOff}
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
    </Pressable>
  );
}
