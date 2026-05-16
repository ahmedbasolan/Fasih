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
import { Volume2, Bookmark } from 'lucide-react-native';

interface DailyPhraseProps {
  arabic: string;
  phonetic: string;
  english: string;
  onPlay?: () => void;
  onUsed?: () => void;
  onSave?: () => void;
}

export function DailyPhrase({
  arabic,
  phonetic,
  english,
  onPlay,
  onUsed,
  onSave,
}: DailyPhraseProps) {
  const { C } = useTheme();
  const [usedToday, setUsedToday] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playingRipple, setPlayingRipple] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: C.BORDER,
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      paddingLeft: 0,
    },
    leftBorder: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
    },
    content: {
      padding: 20,
      paddingLeft: 20,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 14,
    },
    topLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 10,
      color: C.TEXT3,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontWeight: '600',
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: C.PRIMARY,
    },
    newBadge: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 10,
      color: C.PRIMARY,
      fontWeight: '600',
    },
    arabicPhrase: {
      fontFamily: FONT_ARABIC_EXTRA,
      fontSize: 32,
      color: C.PRIMARY,
      textAlign: 'right',
      writingDirection: 'rtl',
      marginBottom: 10,
      fontWeight: '800',
      textShadowColor: 'rgba(0, 255, 149, 0.2)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    phonetic: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      marginBottom: 8,
    },
    english: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 15,
      color: C.TEXT,
      marginBottom: 16,
    },
    buttonsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.PRIMARY,
      backgroundColor: 'transparent',
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    buttonActive: {
      backgroundColor: C.JADE_DIM,
      borderColor: C.PRIMARY,
      borderWidth: 2,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    buttonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.PRIMARY,
      fontWeight: '700',
    },
    buttonTextActive: {
      color: C.PRIMARY,
    },
  }), [C]);

  const handlePlay = () => {
    setPlayingRipple(true);
    onPlay?.();
    setTimeout(() => setPlayingRipple(false), 600);
  };

  const handleUsed = () => {
    setUsedToday(!usedToday);
    onUsed?.();
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave?.();
  };

  return (
    <View style={styles.container}>
      {/* Left border gradient */}
      <LinearGradient
        colors={[C.PRIMARY, C.TERTIARY]}
        start={{ x: 0, y: 0.16 }}
        end={{ x: 0, y: 0.84 }}
        style={styles.leftBorder}
      />

      <View style={styles.content}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.topLabel}>Everyday</Text>
          <MotiView
            style={styles.liveDot}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: true,
            }}
          />
          <Text style={styles.newBadge}>New today</Text>
        </View>

        {/* Arabic Phrase */}
        <Text style={styles.arabicPhrase}>{arabic}</Text>

        {/* Phonetic */}
        <Text style={styles.phonetic}>{phonetic}</Text>

        {/* English */}
        <Text style={styles.english}>{english}</Text>

        {/* Buttons */}
        <View style={styles.buttonsRow}>
          {/* Play Button */}
          <Pressable
            onPress={handlePlay}
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Play pronunciation"
          >
            {playingRipple && (
              <MotiView
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                }}
                from={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ type: 'timing', duration: 600 }}
              />
            )}
            <View style={styles.buttonContent}>
              <Volume2 size={14} color={C.PRIMARY} />
              <Text style={styles.buttonText}>Play</Text>
            </View>
          </Pressable>

          {/* Used Today Button */}
          <Pressable
            onPress={handleUsed}
            style={({ pressed }) => [
              styles.button,
              usedToday && styles.buttonActive,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mark as used today"
          >
            <Text
              style={[
                styles.buttonText,
                usedToday && styles.buttonTextActive,
              ]}
            >
              {usedToday ? '✓ Used' : 'Use today'}
            </Text>
          </Pressable>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.button,
              saved && styles.buttonActive,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save phrase"
          >
            <View style={styles.buttonContent}>
              <Bookmark
                size={14}
                color={saved ? C.PRIMARY : C.TEXT}
                fill={saved ? C.PRIMARY : 'none'}
              />
              <Text
                style={[
                  styles.buttonText,
                  saved && styles.buttonTextActive,
                ]}
              >
                Save
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
