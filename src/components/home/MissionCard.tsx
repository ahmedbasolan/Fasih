import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_HEADING_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { Companion } from '../ui/Companion';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from '../icons';

interface MissionCardProps {
  scenarioTitle: string;
  scenesCurrent: number;
  scenesTotal: number;
  hookLine: string;
  onPress?: () => void;
}

export function MissionCard({
  scenarioTitle,
  scenesCurrent,
  scenesTotal,
  hookLine,
  onPress,
}: MissionCardProps) {
  const { C } = useTheme();

  const progressPercent = (scenesCurrent / scenesTotal) * 100;

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
    heroArea: {
      height: 120,
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative',
    },
    starDot: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.WHITE,
    },
    moonEmoji: {
      position: 'absolute',
      top: 12,
      right: 16,
      fontSize: 24,
    },
    mosqueSilhouette: {
      position: 'absolute',
      bottom: 8,
      alignItems: 'center',
      opacity: 0.6,
    },
    contentArea: {
      padding: 14,
    },
    mascotSlot: {
      width: 48,
      height: 48,
      alignSelf: 'center',
      marginBottom: 8,
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sceneTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: C.JADE_DIM,
    },
    sceneTagText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 9,
      color: C.PRIMARY,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      fontWeight: '600',
    },
    timerLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.TEXT2,
    },
    title: {
      fontFamily: FONT_HEADING_EXTRA,
      fontSize: 18,
      color: C.TEXT,
      marginBottom: 6,
      fontWeight: '800',
    },
    subtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 13,
      color: C.TEXT2,
      marginBottom: 14,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressSection: {
      flex: 1,
      gap: 6,
    },
    progressBar: {
      height: 4,
      backgroundColor: C.SURFACE,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.TEXT2,
    },
    continueButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginLeft: 12,
    },
    continueButtonText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 13,
      color: C.BG,
      fontWeight: '700',
    },
  }), [C]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { transform: [{ scale: 0.96 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${scenarioTitle}. ${scenesCurrent} of ${scenesTotal} scenes complete.`}
    >
        {/* Hero Area */}
        <View style={styles.heroArea}>
          <LinearGradient
            colors={[C.JADE2, C.PRIMARY_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Ambient Glow Backdrop */}
          <LinearGradient
            colors={['rgba(234,197,124,0.3)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60 }}
          />

          {/* Static stars */}
          {[
            { top: 16, left: 24 },
            { top: 20, right: 32 },
            { bottom: 28, left: 16 },
            { bottom: 24, right: 20 },
          ].map((pos, idx) => (
            <View key={idx} style={[styles.starDot, pos]} />
          ))}

          {/* Moon */}
          <Text style={styles.moonEmoji}>🌙</Text>

          {/* Mosque Silhouette SVG */}
          <View style={styles.mosqueSilhouette}>
            <Text style={{ fontSize: 32, opacity: 0.4 }}>🕌</Text>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {/* Mascot */}
          <View style={styles.mascotSlot}>
            <Companion size={48} />
          </View>

          {/* Tag + Timer Row */}
          <View style={styles.tagRow}>
            <View style={styles.sceneTag}>
              <Text style={styles.sceneTagText}>
                {scenesCurrent > 0
                  ? `Scene ${scenesCurrent} of ${scenesTotal}`
                  : `${scenesTotal} scenes`}
              </Text>
            </View>
            <Text style={styles.timerLabel}>⏱ ~5 min scenario</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{scenarioTitle}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{hookLine}</Text>

          {/* Bottom Row - Progress + Button */}
          <View style={styles.bottomRow}>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View style={{ height: '100%', width: `${progressPercent}%` }}>
                  <LinearGradient
                    colors={[C.PRIMARY, C.TERTIARY]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
              <Text style={styles.progressLabel}>
                {scenesCurrent} of {scenesTotal} scenes
              </Text>
            </View>

            {/* Continue Button */}
            <LinearGradient
              colors={[C.PRIMARY, C.JADE]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
              <ChevronRight size={16} color={C.BG} strokeWidth={2.5} />
            </LinearGradient>
          </View>
        </View>
      </Pressable>
  );
}
