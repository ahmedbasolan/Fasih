import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
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
    <View style={styles.root}>
      {icon ?? (
        // The glyph is drawn with react-native-svg's own Text. It used to use
        // React Native's Text, which is not a valid SVG child and simply never
        // rendered — so the Arabic character in every empty state was invisible.
        // The Svg is also laid out in flow rather than absolutely positioned at
        // top/left -60 inside a zero-size container, which pushed the artwork
        // outside its own layout box.
        <View style={styles.arabicContainer}>
          <Svg width={120} height={120} viewBox="0 0 120 120">
            {/* Decorative geometric frame */}
            <Circle cx="60" cy="60" r="55" fill="none" stroke={C.JADE_ACCENT} strokeWidth="0.5" opacity="0.3" />
            <Circle cx="60" cy="60" r="45" fill="none" stroke={C.JADE2} strokeWidth="0.3" opacity="0.2" />

            {/* Decorative flourishes, behind the glyph */}
            <Path d="M20 60 Q30 50, 40 60 T60 60" fill="none" stroke={C.JADE_ACCENT} strokeWidth="1" opacity="0.4" />
            <Path d="M60 60 Q70 70, 80 60 T100 60" fill="none" stroke={C.JADE2} strokeWidth="1" opacity="0.4" />

            <SvgText
              x="60"
              y="60"
              fill={C.TEXT3}
              fontSize="42"
              fontFamily={FONT_ARABIC_BLACK}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {arabic}
            </SvgText>
          </Svg>
        </View>
      )}
      
      <Text style={[styles.title, { color: C.TEXT2 }]}>{title}</Text>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: C.TEXT3 }]}>{subtitle}</Text>
      )}
    </View>
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
    alignItems: 'center',
    justifyContent: 'center',
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
