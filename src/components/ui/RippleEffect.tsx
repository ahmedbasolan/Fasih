import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  rippleColor?: string;
  disabled?: boolean;
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
  disabled = false 
}: Props) {
  const { C } = useTheme();
  const effectColor = rippleColor || C.GOLD;
  const [ripples, setRipples] = useState<RippleProps[]>([]);

  const handlePress = (event: any) => {
    if (disabled) return;
    
    const { locationX, locationY } = event.nativeEvent;
    const newRipple = { x: locationX, y: locationY, id: Date.now() };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={styles.container}>
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
