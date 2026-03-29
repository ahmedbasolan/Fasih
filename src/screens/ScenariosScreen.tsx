import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Lock, ChevronRight, Coffee, Building2, Users, Briefcase, ShoppingBag, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT_LATIN_BOLD, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_BLACK } from '../components/design/tokens';
import { GOLD_STOPS, ANGLE_135 } from '../components/design/gradients';
import { CAREER_SCENARIOS, SOCIAL_SCENARIOS } from '../constants/scenarios';
import type { UserProfile, ScenarioMode, Scenario } from '../types';

interface Props {
  user: UserProfile | null;
  onScenarioSelect: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Coffee, Building2, Briefcase, Moon, Users, ShoppingBag,
};

export function ScenariosScreen({ user, onScenarioSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ScenarioMode>(user?.mode || 'career');
  const scenarios = mode === 'career' ? CAREER_SCENARIOS : SOCIAL_SCENARIOS;
  const availableScenarios = scenarios.filter((scenario) => !scenario.locked);
  const lockedCount = scenarios.length - availableScenarios.length;

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 4 }}>Scenarios</Text>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, marginBottom: 16 }}>Choose a situation to practice</Text>

        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', borderRadius: 16, padding: 4, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
          {(['career', 'social'] as ScenarioMode[]).map(m => (
            <Pressable key={m} onPress={() => setMode(m)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: mode === m ? C.GOLD : 'transparent', alignItems: 'center' }}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: mode === m ? '#05050E' : C.TEXT3 }}>
                {m === 'career' ? 'Career' : 'Social'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80, gap: 12 }} showsVerticalScrollIndicator={false}>
        {availableScenarios.map((scenario: Scenario, i: number) => {
          const { id, iconName, title, subtitle, decisions, endings, phrases, level, color, gradientColors, arabicScene } = scenario;
          const Icon = ICON_MAP[iconName] || Coffee;
          return (
          <MotiView key={id} from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300, delay: i * 70 }}>
            <Pressable onPress={() => onScenarioSelect(id)} style={{ borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: `${color}25` }}>
              <LinearGradient colors={[gradientColors[0], gradientColors[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={{ padding: 16, flexDirection: 'row', gap: 12, position: 'relative' }}>
                  {/* Large decorative Arabic */}
                  <View style={{ position: 'absolute', top: 0, right: 16, bottom: 0, justifyContent: 'center', opacity: 0.07 }}>
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 72, color }}>{arabicScene}</Text>
                  </View>

                  <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: `${color}18`, borderWidth: 1, borderColor: `${color}25`, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 15, color: C.TEXT }}>{title}</Text>
                      <ChevronRight size={16} color={color} />
                    </View>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginBottom: 8 }}>{subtitle}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: `${color}15` }}>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color }}>{level}</Text>
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{decisions} decisions</Text>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT3 }}>{phrases} phrases</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </MotiView>
          );
        })}

        {lockedCount > 0 && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 400, delay: 500 }}>
            <View style={{ marginTop: 12, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(91,70,200,0.22)' }}>
              <LinearGradient colors={['rgba(91,70,200,0.12)', 'rgba(200,145,58,0.07)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0, borderRadius: 16 }} />
              <Lock size={18} color={C.VIOLET2} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT }}>{lockedCount} more {mode} scenario{lockedCount === 1 ? '' : 's'} coming soon</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>We are writing the next conversations now.</Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, overflow: 'hidden' }}>
                <LinearGradient colors={GOLD_STOPS} start={ANGLE_135.start} end={ANGLE_135.end}>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: '#05050E' }}>Soon</Text>
                </LinearGradient>
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
