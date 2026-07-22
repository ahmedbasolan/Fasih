import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path, Circle } from 'react-native-svg';
import { FONT_ARABIC_BLACK, FONT_LATIN, FONT_HEADING_SEMI } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';

interface Props {
  arabic?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ 
  arabic = 'لا يوجد', 
  title = STRINGS.ui.emptyState.title, 
  subtitle = STRINGS.ui.emptyState.subtitle, 
  icon 
}: Props) {
  const { C } = useTheme();
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.root}
    >
      {icon ?? (
        <MotiView
          from={{ rotate: '-10deg', opacity: 0 }}
          animate={{ rotate: '0deg', opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 100 }}
          style={styles.arabicContainer}
        >
          {/* Arabic calligraphy design element */}
          <Svg width={120} height={120} viewBox="0 0 120 120" style={styles.calligraphy}>
            {/* Decorative geometric frame */}
            <Circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke={C.JADE_ACCENT}
              strokeWidth="0.5"
              opacity="0.3"
            />
            <Circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={C.JADE2}
              strokeWidth="0.3"
              opacity="0.2"
            />
            
            {/* Arabic text with artistic flourish */}
            <Text style={[styles.arabic, { color: C.TEXT3, textShadowColor: `${C.JADE_ACCENT}20` }]}>{arabic}</Text>
            
            {/* Decorative elements */}
            <Path
              d="M20 60 Q30 50, 40 60 T60 60"
              fill="none"
              stroke={C.JADE_ACCENT}
              strokeWidth="1"
              opacity="0.4"
            />
            <Path
              d="M60 60 Q70 70, 80 60 T100 60"
              fill="none"
              stroke={C.JADE2}
              strokeWidth="1"
              opacity="0.4"
            />
          </Svg>
        </MotiView>
      )}
      
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
      >
        <Text style={[styles.title, { color: C.TEXT2 }]}>{title}</Text>
      </MotiView>
      
      {subtitle && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
        >
          <Text style={[styles.subtitle, { color: C.TEXT3 }]}>{subtitle}</Text>
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: { 
    paddingVertical: 56, 
    alignItems: 'center', 
    gap: 16,
  },
  arabicContainer: {
    marginBottom: 8,
    position: 'relative',
  },
  calligraphy: {
    position: 'absolute',
    top: -60,
    left: -60,
  },
  arabic: { 
    fontFamily: FONT_ARABIC_BLACK, 
    fontSize: 42, 
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontFamily: FONT_HEADING_SEMI,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  subtitle: { 
    fontFamily: FONT_LATIN, 
    fontSize: 13, 
    textAlign: 'center', 
    maxWidth: 260,
    lineHeight: 18,
  },
});
