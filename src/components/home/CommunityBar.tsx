import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';

interface CommunityBarProps {
  /** A real count of learners. Required on purpose — see the note below. */
  count: number;
  /** The learner's actual city. Required on purpose. */
  location: string;
}

const AVATAR_EMOJIS = ['👨‍💼', '👩‍💻', '🧑‍🎓'];

/**
 * Social-proof bar.
 *
 * `count` and `location` used to default to 47 and "Dubai", so the card stated
 * a specific, false fact to every user regardless of where they were — and a
 * caller that forgot a prop still rendered a confident claim. Both are now
 * required, so this cannot render invented numbers. It is currently not
 * mounted anywhere; wire it up when there is a real source for the count.
 */
export function CommunityBar({ count, location }: CommunityBarProps) {
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
