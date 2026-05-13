import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme, FONT_HEADING_EXTRA, FONT_LATIN, FONT_LATIN_SEMI } from '../../theme';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3 } from 'lucide-react-native';

interface DayData {
  label: string;
  value: number;
  isToday: boolean;
}

interface WeeklyXPProps {
  days: DayData[];
  currentXP: number;
  goalXP: number;
  xpToReward: number;
}

export function WeeklyXP({
  days,
  currentXP,
  goalXP,
  xpToReward,
}: WeeklyXPProps) {
  const { C } = useTheme();
  const maxValue = Math.max(...days.map((d) => d.value), 1);

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
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      minHeight: 180,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyTitle: {
      fontFamily: FONT_HEADING_EXTRA,
      fontSize: 16,
      color: C.TEXT,
      fontWeight: '800',
      marginBottom: 4,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
      textAlign: 'center',
      lineHeight: 16,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: 16,
      paddingBottom: 12,
    },
    leftSection: {
      flex: 1,
    },
    title: {
      fontFamily: FONT_HEADING_EXTRA,
      fontSize: 18,
      color: C.TEXT,
      fontWeight: '800',
      marginBottom: 4,
    },
    subtitle: {
      fontFamily: FONT_LATIN,
      fontSize: 12,
      color: C.TEXT2,
    },
    rewardBox: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: 'center',
      gap: 4,
    },
    rewardEmoji: {
      fontSize: 18,
    },
    rewardText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 11,
      color: C.INVERTED_TEXT,
      fontWeight: '700',
    },
    chartContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      paddingHorizontal: 12,
      paddingVertical: 16,
      gap: 6,
      minHeight: 100,
    },
    barWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: 80,
      gap: 4,
    },
    barTrack: {
      width: '100%',
      backgroundColor: C.SURFACE,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barLabel: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 9,
      color: C.TEXT2,
      fontWeight: '600',
    },
    barLabelToday: {
      color: C.PRIMARY,
      fontWeight: '700',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 12,
    },
    footerText: {
      fontFamily: FONT_LATIN_SEMI,
      fontSize: 12,
      color: C.TEXT2,
    },
    footerValue: {
      color: C.TEXT,
      fontWeight: '700',
    },
  }), [C]);

  const hasData = days && days.length > 0;

  return (
    <View style={styles.container}>
      {hasData ? (
        <>
          {/* Top Row - Title + Reward Box */}
          <View style={styles.topRow}>
            <View style={styles.leftSection}>
              <Text style={styles.title}>Weekly XP</Text>
              <Text style={styles.subtitle}>
                {xpToReward} XP to unlock bonus phrases
              </Text>
            </View>

            <LinearGradient
              colors={[C.CULTURAL_GOLD, C.CULTURAL_GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.rewardBox}
            >
              <Text style={styles.rewardEmoji}>🎁</Text>
              <Text style={styles.rewardText}>+10 phrases</Text>
            </LinearGradient>
          </View>

          {/* Bar Chart */}
          <View style={styles.chartContainer}>
        {days.map((day, idx) => {
          const heightPercent = (day.value / maxValue) * 100;
          return (
            <View key={day.label} style={styles.barWrapper}>
              <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                <MotiView
                  style={{
                    height: `${heightPercent}%`,
                    width: '100%',
                  }}
                  from={{ height: '0%' }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 18,
                    delay: idx * 80,
                  }}
                >
                  <LinearGradient
                    colors={[C.PRIMARY, C.JADE]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flex: 1, borderRadius: 3 }}
                  />
                </MotiView>
              </View>
              <Text
                style={[
                  styles.barLabel,
                  day.isToday && styles.barLabelToday,
                ]}
              >
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              This week:{' '}
              <Text style={styles.footerValue}>{currentXP} XP</Text>
            </Text>
            <Text style={styles.footerText}>
              Goal:{' '}
              <Text style={styles.footerValue}>{goalXP} XP</Text>
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <BarChart3 size={40} color={C.TEXT2} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            Complete missions to start tracking your weekly progress
          </Text>
        </View>
      )}
    </View>
  );
}
