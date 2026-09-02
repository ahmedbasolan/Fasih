import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_ARABIC_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { MotiView } from 'moti';
import { STRINGS } from '../../constants/strings';

interface QuickChallengeProps {
  /** English prompt the learner has to produce in Arabic. */
  prompt: string;
  /** The Arabic answer, revealed on tap. */
  answer: string;
  /** Romanisation of the answer. */
  roman?: string;
  onRevealed?: () => void;
}

/**
 * A one-tap recall check that changes every day.
 *
 * This used to declare `stimulus`/`response` as default parameters and its only
 * caller passed neither — so every learner saw the same two words on day 1 and
 * day 300, directly above a Daily Phrase card that does rotate. It now takes
 * its content from the caller, which rotates it by date over the real phrase
 * library.
 *
 * Note the framing changed from "someone says this — reply" to "say this in
 * Arabic". The reply format needs authored stimulus/response pairs, and the
 * library only glosses one of them ("reply to good morning"); inventing the
 * rest would be guessing at Gulf conversational convention. If the reply
 * framing is wanted back, the pairs need authoring first.
 */
export function QuickChallenge({ prompt, answer, roman, onRevealed }: QuickChallengeProps) {
  const { C } = useTheme();
  const [revealed, setRevealed] = useState(false);

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
      marginBottom: 10,
    },
    englishPrompt: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 20,
      color: C.TEXT,
      marginBottom: 20,
      lineHeight: 28,
    },
    revealButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.PRIMARY,
      alignSelf: 'flex-start',
    },
    revealButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.PRIMARY,
      fontWeight: '600',
    },
    responseContainer: {
      marginTop: 4,
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
      writingDirection: 'rtl',
      fontWeight: '800',
    },
    responseRoman: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT3,
      fontStyle: 'italic',
      textAlign: 'right',
      marginTop: 4,
    },
  }), [C]);

  const handleReveal = () => {
    setRevealed(true);
    onRevealed?.();
  };

  return (
    <View style={styles.container}>
      {/* A flat 2px rule — this was a LinearGradient between C.PRIMARY and
          itself, i.e. a native gradient view rendering a solid colour. */}
      <View style={styles.topHighlight} />

      <View style={styles.content}>
        <Text style={styles.promptText}>{STRINGS.home.quickChallengePrompt}</Text>

        <Text style={styles.englishPrompt}>{prompt}</Text>

        {!revealed ? (
          <Pressable
            onPress={handleReveal}
            style={({ pressed }) => [
              styles.revealButton,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.home.quickChallengeReveal}
          >
            <Text style={styles.revealButtonText}>{STRINGS.home.quickChallengeReveal}</Text>
          </Pressable>
        ) : (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.responseContainer}
          >
            <Text style={styles.responseLabel}>{STRINGS.home.quickChallengeAnswer}</Text>
            <Text style={styles.responseText}>{answer}</Text>
            {roman ? <Text style={styles.responseRoman}>{roman}</Text> : null}
          </MotiView>
        )}
      </View>
    </View>
  );
}
