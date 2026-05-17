import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useTheme, FONT_HEADING_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { IMAGES } from '../../constants/images';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface DayStatus {
  label: string;
  status: 'done' | 'today' | 'future';
}

interface StreakWidgetProps {
  streakDays: number;
  currentXP: number;
  goalXP: number;
  weekDays: DayStatus[];
  mood?: 'happy' | 'excited' | 'celebrating';
  onComplete?: () => void;
}

type ConfettiParticle = { id: number; x: number };

export function StreakWidget({
  streakDays,
  currentXP,
  goalXP,
  weekDays,
  mood = 'happy',
  onComplete,
}: StreakWidgetProps) {
  const { C } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  const progressPercent = Math.min((currentXP / goalXP) * 100, 100);
  const isEmpty = streakDays === 0 && currentXP === 0;

  useEffect(() => {
    if (mood === 'celebrating' && confetti.length === 0) {
      const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * (screenW - 48),
      }));
      setConfetti(particles);
      // Reset mood after celebration animation
      setTimeout(() => {
        setConfetti([]);
        // Note: Parent component should reset mood to 'happy' after celebration
      }, 900);
    }
  }, [mood, screenW, confetti.length]);

  const mascotSource = mood === 'excited' ? IMAGES.foxyMaleWaving : IMAGES.foxyMale;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: 90,
      marginHorizontal: 24,
      marginTop: 14,
      borderRadius: 20,
      backgroundColor: C.CARD_BG,
      borderWidth: 1,
      borderColor: mood === 'celebrating' ? 'rgba(0,255,149,0.3)' : C.BORDER,
      overflow: 'hidden',
      // Add shadow in light mode for depth
      shadowColor: C.CARD_SHADOW,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    leftBlock: {
      width: 64,
      height: 90,
      backgroundColor: C.JADE_DIM,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: C.BORDER,
      paddingVertical: 8,
    },
    mascotImage: {
      width: 42,
      height: 42,
    },
    streakNumber: {
      fontFamily: FONT_HEADING_EXTRA,
      fontSize: 18,
      color: C.PRIMARY,
      fontWeight: '800',
    },
    daysLabel: {
      fontFamily: FONT_LATIN,
      fontSize: 10,
      color: C.TEXT2,
    },
    shimmer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 20,
      pointerEvents: 'none',
    },
    rightBlock: {
      flex: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
      justifyContent: 'space-between',
    },
    streakInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    daysTitle: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.TEXT,
      fontWeight: '600',
    },
    bestDays: {
      fontFamily: FONT_LATIN,
      fontSize: 11,
      color: C.TEXT2,
    },
    emptyHint: {
      fontFamily: FONT_LATIN,
      fontSize: 11,
      color: C.TEXT3,
    },
    progressBarContainer: {
      height: 7,
      backgroundColor: C.SURFACE,
      borderRadius: 4,
      overflow: 'hidden',
      marginVertical: 6,
    },
    daysRow: {
      flexDirection: 'row',
      gap: 5,
      justifyContent: 'space-between',
    },
    dayDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      shadowColor: C.PRIMARY,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    dayDotDone: {
      backgroundColor: C.PRIMARY,
      borderColor: C.PRIMARY,
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
    },
    dayDotToday: {
      backgroundColor: 'transparent',
      borderColor: C.PRIMARY,
    },
    dayDotFuture: {
      backgroundColor: C.SURFACE,
      borderColor: C.BORDER,
    },
    dayDotText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      fontWeight: '600',
    },
  }), [C, mood]);

  return (
    <>
      <MotiView
        style={styles.container}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {/* LEFT BLOCK - Mascot + Streak */}
        <View style={styles.leftBlock}>
          <MotiView
            animate={{
              scale: mood === 'celebrating' ? 1.12 : mood === 'excited' ? 1.08 : 1,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Image
              source={mascotSource}
              style={styles.mascotImage}
              resizeMode="contain"
            />
          </MotiView>
          <Text style={styles.streakNumber}>{streakDays}</Text>
          <Text style={styles.daysLabel}>days</Text>
        </View>

        {/* RIGHT BLOCK */}
        <View style={styles.rightBlock}>
          {/* Streak Info Row */}
          <View style={styles.streakInfoRow}>
            <Text style={styles.daysTitle}>Learning Days</Text>
            {!isEmpty && (
              <Text style={styles.bestDays}>Best: {Math.max(streakDays, 1)}</Text>
            )}
            {isEmpty && (
              <Text style={styles.emptyHint}>Start today</Text>
            )}
          </View>

          {/* Progress Bar - show empty state with 0% */}
          <View style={styles.progressBarContainer}>
            <MotiView
              style={{ height: '100%' }}
              animate={{
                width: `${isEmpty ? 0 : progressPercent}%`,
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              <LinearGradient
                colors={[C.PRIMARY, C.TERTIARY]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              />
            </MotiView>
          </View>

          {/* Days Row - always show */}
          <View style={styles.daysRow}>
            {weekDays.map((day, idx) => (
              <MotiView
                key={day.label}
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 15,
                  delay: idx * 80,
                }}
                style={{ flex: 1, alignItems: 'center' }}
              >
                <View
                  style={[
                    styles.dayDot,
                    day.status === 'done'
                      ? styles.dayDotDone
                      : day.status === 'today'
                      ? styles.dayDotToday
                      : styles.dayDotFuture,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayDotText,
                      day.status === 'done'
                        ? { color: C.BG }
                        : day.status === 'today'
                        ? { color: C.PRIMARY }
                        : { color: C.TEXT3 },
                    ]}
                  >
                    {day.status === 'done' ? '✓' : day.label[0]}
                  </Text>
                </View>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Shimmer sweep effect */}
        <MotiView
          style={styles.shimmer}
          from={{ translateX: -320 }}
          animate={{ translateX: 320 }}
          transition={{ type: 'timing', duration: 1200, delay: 300 }}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </MotiView>
      </MotiView>

      {/* Confetti particles for celebrating state */}
      {mood === 'celebrating' &&
        confetti.map((particle) => (
          <MotiView
            key={particle.id}
            style={{
              position: 'absolute',
              left: particle.x,
              top: 24 + 14 + 45, // Approximate center of card from top
              width: 8,
              height: 8,
              borderRadius: 2,
              backgroundColor:
                particle.id % 3 === 0
                  ? C.PRIMARY
                  : particle.id % 3 === 1
                  ? C.TERTIARY
                  : C.JADE,
              zIndex: 1,
            }}
            from={{ opacity: 1, translateY: 0 }}
            animate={{ opacity: 0, translateY: 200 }}
            transition={{ type: 'timing', duration: 900 }}
            onDidAnimate={() => {
              if (particle.id === confetti.length - 1) {
                setConfetti([]);
              }
            }}
          />
        ))}
    </>
  );
}
