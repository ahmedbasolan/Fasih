import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';

interface CommunityBarProps {
  count?: number;
  location?: string;
}

const AVATAR_EMOJIS = ['👨‍💼', '👩‍💻', '🧑‍🎓'];

export function CommunityBar({
  count = 47,
  location = 'Dubai',
}: CommunityBarProps) {
  const { C } = useTheme();

  const avatarColors = [C.PRIMARY, C.TERTIARY, C.JADE];

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      paddingVertical: 14,
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatarsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 70,
    },
    avatarCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.CARD_BG,
      marginLeft: -8,
    },
    avatarEmoji: {
      fontSize: 14,
    },
    textContainer: {
      flex: 1,
    },
    text: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      lineHeight: 20,
    },
    countBold: {
      color: C.PRIMARY,
      fontFamily: FONT_LATIN_SEMI,
      fontWeight: '700',
    },
  }), [C]);

  return (
    <View style={styles.container}>
      {/* Overlapping Avatars */}
      <View style={styles.avatarsContainer}>
        {AVATAR_EMOJIS.map((emoji, idx) => (
          <View
            key={idx}
            style={[
              styles.avatarCircle,
              {
                backgroundColor: avatarColors[idx],
              },
            ]}
          >
            <Text style={styles.avatarEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          <Text style={styles.countBold}>{count}</Text> expats in {location}{' '}
          completed a scenario today.
        </Text>
      </View>
    </View>
  );
}
