import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_ARABIC_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { STRINGS } from '../../constants/strings';

const CHALLENGES = [
  { stimulus: 'مساء الخير', response: 'مساء النور' },
  { stimulus: 'كيف حالك؟', response: 'بخير والحمد لله' },
  { stimulus: 'شكراً', response: 'عفواً' },
  { stimulus: 'صباح الخير', response: 'صباح النور' },
  { stimulus: 'هلا والله', response: 'هلا فيك' },
  { stimulus: 'مرحبا', response: 'أهلاً وسهلاً' },
  { stimulus: 'يسعد مساك', response: 'يسعد قلبك' },
];

interface QuickChallengeProps {
  stimulus?: string;
  response?: string;
  onRevealed?: () => void;
}

export function QuickChallenge({
  stimulus,
  response,
  onRevealed,
}: QuickChallengeProps) {
  const { C } = useTheme();
  const [revealed, setRevealed] = useState(false);

  const todayChallenge = useMemo(() => {
    const d = new Date();
    const idx = (d.getDate() + d.getMonth() * 31) % CHALLENGES.length;
    return CHALLENGES[idx];
  }, []);

  const activeStimulus = stimulus ?? todayChallenge.stimulus;
  const activeResponse = response ?? todayChallenge.response;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      // Add shadow in light mode for depth
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    topHighlight: {
      height: 2,
      backgroundColor: C.PRIMARY,
    },
    content: {
      padding: 20,
    },
        promptText: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      marginBottom: 14,
    },
    arabicText: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 28,
      color: C.TEXT,
      textAlign: 'right',
      writingDirection: 'rtl',
      marginBottom: 20,
      fontWeight: '800',
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    revealButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.PRIMARY,
    },
    revealButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.PRIMARY,
      fontWeight: '600',
    },
    responseContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: C.BORDER,
    },
    responseLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.TEXT2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      fontWeight: '600',
    },
    responseText: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 26,
      color: C.PRIMARY,
      textAlign: 'right',
      fontWeight: '800',
    },
  }), [C]);

  const handleReveal = () => {
    setRevealed(true);
    onRevealed?.();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[C.PRIMARY, C.PRIMARY]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topHighlight}
      />

      <View style={styles.content}>
        {/* Prompt */}
        <Text style={styles.promptText}>{STRINGS.home.challengePrompt}</Text>

        {/* Stimulus Arabic */}
        <Text style={styles.arabicText}>{activeStimulus}</Text>

        {/* Reveal Button */}
        {!revealed ? (
          <Pressable
            onPress={handleReveal}
            style={({ pressed }) => [
              styles.revealButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Reveal correct response"
          >
            <Text style={styles.revealButtonText}>Tap to reveal →</Text>
          </Pressable>
        ) : (
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.responseContainer}
          >
            <Text style={styles.responseLabel}>{STRINGS.home.challengeAnswer}</Text>
            <Text style={styles.responseText}>{activeResponse}</Text>
          </MotiView>
        )}
      </View>
    </View>
  );
}
