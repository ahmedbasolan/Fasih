import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACE } from '../design/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Layers, ChevronRight, X } from '../icons';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../design/tokens';
import { ANGLE_135 } from '../design/gradients';
import { Companion } from '../ui/Companion';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';

interface FeatureGateProps {
  hasAccess: boolean;
  scenariosCompleted: number;
  scenariosRequired: number;
  featureName: string;
  onGoToScenarios: () => void;
  /**
   * Shown as a close button when set. Pass it wherever the gate renders inside a
   * full-screen modal (Practice): there is no tab bar there, and iOS
   * full-screen modals cannot be swiped away, so without it the only exit was
   * "Go to Scenarios".
   */
  onClose?: () => void;
  children: React.ReactNode;
}

export function FeatureGate({ hasAccess, scenariosCompleted, scenariosRequired, featureName, onGoToScenarios, onClose, children }: FeatureGateProps) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();

  // scenariosRequired is the unlock rule, not just the progress display. It
  // used to be display-only: the gate opened on full access alone, so the
  // "complete N more" promise was never what actually unlocked it.
  if (hasAccess || scenariosCompleted >= scenariosRequired) {
    return <>{children}</>;
  }

  const remaining = scenariosRequired - scenariosCompleted;

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      {onClose && (
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.common.close}
          style={{ position: 'absolute', top: insets.top + SPACE.md, left: SPACE.lg, zIndex: 10, width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}
        >
          <X size={18} strokeWidth={1.5} color={C.TEXT2} />
        </Pressable>
      )}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingBottom: insets.bottom + SPACE.xl }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Companion size={80} />
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: C.JADE_ACCENT_DIM, borderWidth: 1, borderColor: C.JADE_ACCENT_BORDER, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Lock size={24} strokeWidth={1.5} color={C.JADE_ACCENT} />
          </View>

          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 22, color: C.TEXT, textAlign: 'center', marginBottom: 8 }}>
            {STRINGS.ui.featureGate.locked(featureName)}
          </Text>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
            {STRINGS.ui.featureGate.completeMore(remaining, featureName)}
          </Text>

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
            {Array.from({ length: scenariosRequired }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  backgroundColor: i < scenariosCompleted ? C.JADE_ACCENT_DIM : C.SURFACE,
                  borderWidth: 1.5,
                  borderColor: i < scenariosCompleted ? C.JADE_ACCENT_BORDER : C.BORDER,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i < scenariosCompleted ? (
                  <Layers size={16} strokeWidth={1.5} color={C.JADE_ACCENT} />
                ) : (
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT3 }}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ width: '100%' }}>
          <Pressable onPress={onGoToScenarios} accessibilityRole="button" accessibilityLabel={STRINGS.ui.featureGate.goToScenarios} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient
              colors={[...G.GOLD_STOPS]}
              start={ANGLE_135.start}
              end={ANGLE_135.end}
              style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 16, color: C.BG }}>{STRINGS.ui.featureGate.goToScenarios}</Text>
              <ChevronRight size={16} strokeWidth={1.5} color={C.BG} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
