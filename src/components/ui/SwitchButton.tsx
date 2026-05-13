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
};

export function SwitchButton({ value, onToggle, iconOn, iconOff, backgroundColor }: SwitchProps) {
  const { C } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
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
