import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { MotiView } from 'moti';
import { ChevronRight } from 'lucide-react-native';
import { FONT_HEADING, FONT_LATIN_SEMI } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { CATEGORY_ILLUSTRATIONS } from './CategoryIllustrations';

interface CategoryCardProps {
  category: string;
  phraseCount: number;
  /** Controls card layout: 'large' = tall card (first column), 'small' = compact card (second column) */
  variant: 'large' | 'small';
  /** Background tint color for the card */
  bgColor: string;
  /** Accent color for text/decorations */
  accentColor: string;
  /** Animation delay in ms */
  delay?: number;
  onPress: () => void;
}

/**
 * Premium pastel category card with a bento-grid aesthetic.
 * Inspired by modern course platform UI with soft backgrounds,
 * bold typography, and rich SVG illustrations.
 */
export function CategoryCard({ category, phraseCount, variant, bgColor, accentColor, delay = 0, onPress }: CategoryCardProps) {
  const { C, isDark } = useTheme();
  const Illustration = CATEGORY_ILLUSTRATIONS[category];
  const isLarge = variant === 'large';

  // Adjust bg opacity for dark mode
  const cardBg = isDark ? `${bgColor}18` : bgColor;
  const borderColor = isDark ? `${accentColor}22` : `${accentColor}12`;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 420, delay }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${category} - ${phraseCount} phrases`}
        style={({ pressed }) => ({
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor,
          height: isLarge ? 200 : 160,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          ...Platform.select({
            ios: {
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.2 : 0.12,
              shadowRadius: 16,
            },
            android: { elevation: 3 },
          }),
        })}
      >
        {/* Content layer */}
        <View style={{ flex: 1, padding: 16, justifyContent: 'space-between' }}>
          {/* Title & count */}
          <View>
            <Text
              numberOfLines={2}
              style={{
                fontFamily: FONT_HEADING,
                fontSize: isLarge ? 17 : 15,
                color: C.TEXT,
                marginBottom: 4,
                lineHeight: isLarge ? 22 : 20,
              }}
            >
              {category}
            </Text>
            <Text
              style={{
                fontFamily: FONT_LATIN_SEMI,
                fontSize: 12,
                color: accentColor,
                opacity: 0.85,
              }}
            >
              {phraseCount} phrase{phraseCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Illustration */}
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            marginTop: 4,
          }}>
            {Illustration && (
              <Illustration size={isLarge ? 95 : 75} />
            )}
          </View>
        </View>

        {/* Subtle bottom action indicator */}
        <View style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ChevronRight size={12} color={accentColor} />
        </View>
      </Pressable>
    </MotiView>
  );
}
