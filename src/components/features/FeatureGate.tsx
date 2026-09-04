import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Layers, ChevronRight } from '../icons';
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
  children: React.ReactNode;
}

export function FeatureGate({ hasAccess, scenariosCompleted, scenariosRequired, featureName, onGoToScenarios, children }: FeatureGateProps) {
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();

  if (hasAccess) {
    return <>{children}</>;
  }

  const remaining = scenariosRequired - scenariosCompleted;

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingBottom: insets.bottom + 40 }}>
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
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.TEXT3 }}>{i + 1}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ width: '100%' }}>
          <Pressable onPress={onGoToScenarios} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient
              colors={[...G.GOLD_STOPS]}
              start={ANGLE_135.start}
              end={ANGLE_135.end}
              style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.BG }}>{STRINGS.ui.featureGate.goToScenarios}</Text>
              <ChevronRight size={16} strokeWidth={1.5} color={C.BG} />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
