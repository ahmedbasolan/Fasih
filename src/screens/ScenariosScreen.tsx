import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  Heart, Search, CheckCircle2, Lock,
  Coffee, Building2, Users, Briefcase, ShoppingBag, Moon,
  Sunrise, Dumbbell, Sparkles, Zap, Target, Rocket,
} from '../components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { getCareerScenarios, getMedicalScenarios, getSocialScenarios, filterScenariosForLearner } from '../constants/scenarios';
import {
  FONT_HEADING_EXTRA,
  FONT_HEADING_SEMI,
  FONT_LATIN,
  FONT_LATIN_SEMI,
  SMOOTH,
} from '../components/design/tokens';
import type { ThemeColors } from '../components/design/tokens';
import { GhostLetters, SheetPanel } from '../components/ui';
import { ANGLE_135 } from '../components/design/gradients';
import { useTheme } from '../hooks/useTheme';
import type { UserProfile, Scenario, ImpactMetrics } from '../types';

interface Props {
  user: UserProfile | null;
  onScenarioSelect: (id: string) => void;
}

type FilterTab = 'all' | 'saved' | 'recommended';

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Coffee, Building2, Briefcase, Moon, Users, ShoppingBag, Sunrise, Dumbbell, Heart, Zap,
};

// Card palettes built from theme tokens — avoids hardcoded hex
function getCardPalettes(C: ThemeColors) {
  return [
    { bg: C.CATEGORY_MINT,  accent: C.JADE,   iconBg: C.JADE_SURFACE },
    { bg: C.CATEGORY_BLUE,  accent: C.VIOLET, iconBg: C.VIOLET_SURFACE },
    { bg: C.CATEGORY_CREAM, accent: C.JADE2,  iconBg: C.JADE_SURFACE },
    { bg: C.CATEGORY_MINT,  accent: C.JADE,   iconBg: C.JADE_SURFACE },
    { bg: C.CATEGORY_BLUE,  accent: C.VIOLET, iconBg: C.VIOLET_SURFACE },
    { bg: C.CATEGORY_PEACH, accent: C.JADE2,  iconBg: C.JADE_SURFACE },
  ];
}

// Bento height pattern — alternates for visual interest
const BENTO_HEIGHTS = [210, 180, 180, 210, 210, 180];

// ─── Random motivational headings ───────────────────────────────────────────

const MOTIVATIONAL_HEADINGS = [
  { text: 'Gulf Arabic', sub: 'Choose a real situation.', icon: Sparkles },
  { text: 'Build Confidence', sub: 'One scenario at a time.', icon: Target },
  { text: 'Your Next Situation', sub: 'Practice Gulf Arabic.', icon: Rocket },
  { text: 'Real Conversations', sub: 'Cultural fluency awaits.', icon: Zap },
  { text: 'Master the Dialect', sub: 'Start where you are.', icon: Sparkles },
  { text: 'Practice Today', sub: 'A few minutes is enough.', icon: Target },
];

// Fun facts about Arabic/Gulf culture - all under 15 words
const FUN_FACTS = [
  'Gulf Arabic has unique words for camel types.',
  'Marhaba means welcome in every Arab country.',
  'Arabic is written right-to-left, unlike English.',
  'Shukran is thank you - use it often!',
  'Gulf Arabs love coffee with cardamom spice.',
  'Ya Hala is the warmest greeting here.',
  'Inshallah means God willing - very common.',
  'Mashallah protects from envy when praising.',
  'Gulf Arabic skips many vowel sounds.',
  'Habibi means my dear - use freely!',
  'Arabic has 28 letters, all consonants included.',
  'Khallas means finished or enough in Gulf.',
  'Yalla means lets go - very versatile!',
  'Dates are the traditional Gulf welcome gift.',
  'Arabic coffee is served in tiny cups.',
  'Alif is the first letter of Arabic.',
  'Gulf Arabic borrows words from English often.',
  'Salam means peace - the perfect greeting.',
  'Naam means yes, with a head nod.',
  'La means no, with upward head flick.',
  'Gulf men wear white thobes in summer.',
  'Friday is the holy day of rest.',
  'Arabic has over 12 million unique words.',
  'One word can have 100 different forms.',
  'Gulf people say wallahi meaning I swear.',
];

function useRandomHeading() {
  // Pick a random heading and fun fact once, when the component first mounts.
  // Lazy initializers keep the value stable for the component's lifetime without
  // an effect + setState (which would double-render and flash the default first).
  const [heading] = useState(
    () => MOTIVATIONAL_HEADINGS[Math.floor(Math.random() * MOTIVATIONAL_HEADINGS.length)],
  );
  const [funFact] = useState(
    () => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)],
  );

  return { heading, funFact };
}

// ─── Impact preview pill strip ────────────────────────────────────────────────
function ImpactPreviewStrip({
  impactPreview,
  mode,
}: {
  impactPreview: ImpactMetrics;
  mode: 'career' | 'social';
}) {
  const { C } = useTheme();
  const isCareer = mode === 'career';

  const metrics = isCareer
    ? [
        { label: 'Trust',   value: impactPreview.trust,   color: C.CULTURAL_GOLD },
        { label: 'Respect', value: impactPreview.respect, color: C.JADE },
        { label: 'Culture', value: impactPreview.culture, color: C.VIOLET },
      ]
    : [
        { label: 'Vibe',    value: impactPreview.trust,   color: C.ERROR },
        { label: 'Rapport', value: impactPreview.respect, color: C.JADE },
        { label: 'Culture', value: impactPreview.culture, color: C.VIOLET },
      ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingBottom: 12 }}>
      {metrics.map(({ label, value, color }) => (
        <View
          key={label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            backgroundColor: `${color}18`,
            borderWidth: 1,
            borderColor: `${color}30`,
          }}
        >
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color: C.TEXT2 }}>{label}</Text>
          <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color }}>{value}%</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Card component ───────────────────────────────────────────────────────────


function ScenarioCard({
  scenario,
  index,
  isLeft,
  onPress,
}: {
  scenario: Scenario;
  index: number;
  isLeft: boolean;
  onPress: () => void;
}) {
  const { C } = useTheme();
  const { iconName, title, phrases, locked, comingSoon, impactPreview, mode } = scenario;
  const Icon = ICON_MAP[iconName] || Coffee;
  const palette = getCardPalettes(C)[index % 6];
  const cardHeight = BENTO_HEIGHTS[index % BENTO_HEIGHTS.length];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ ...SMOOTH, delay: index * 40 }}
      style={{
        flex: 1,
        paddingRight: isLeft ? 6 : 0,
        paddingLeft: isLeft ? 0 : 6,
        paddingBottom: 12,
        // Ensure no black flash by setting initial background
        backgroundColor: 'transparent',
      }}
    >
      <Pressable
        onPress={comingSoon ? undefined : onPress}
        disabled={locked || !!comingSoon}
        style={{
          width: '100%',
          borderRadius: 24,
          backgroundColor: palette.bg,
          height: cardHeight,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: palette.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: locked ? 0.08 : 0.20,
              shadowRadius: 14,
            },
            android: { elevation: locked ? 1 : 4 },
          }),
        }}
      >
        {/* ── Top: title + phrase count ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
          <Text
            style={{
              fontFamily: FONT_HEADING_SEMI,
              fontSize: 15,
              color: locked ? C.TEXT3 : C.TEXT,
              lineHeight: 21,
            }}
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text
            style={{
              fontFamily: FONT_LATIN,
              fontSize: 12,
              color: locked ? C.TEXT3 : C.TEXT2,
              marginTop: 3,
            }}
          >
            {phrases} Phrases
          </Text>
        </View>

        {/* ── Bottom: icon + impact strip ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: impactPreview && !locked && !comingSoon ? 4 : 14 }}>
          <Icon
            size={impactPreview && !locked && !comingSoon ? 40 : 56}
            color={locked || comingSoon ? C.TEXT3 : palette.accent}
            strokeWidth={1.5}
          />
        </View>
        {impactPreview && !locked && !comingSoon && (
          <ImpactPreviewStrip impactPreview={impactPreview} mode={mode} />
        )}

        {/* ── Coming Soon overlay ── */}
        {comingSoon && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10,15,12,0.52)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <View style={{
              paddingHorizontal: 12, paddingVertical: 5,
              borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
            }}>
              <Text style={{
                fontFamily: FONT_HEADING_SEMI,
                fontSize: 11,
                color: 'rgba(255,255,255,0.75)',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}>
                Coming Soon
              </Text>
            </View>
          </View>
        )}

        {/* ── Locked overlay ── */}
        {locked && !comingSoon && (
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(10,15,12,0.38)',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            padding: 12,
          }}>
            <View style={{
              width: 30, height: 30, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.14)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={14} color="rgba(255,255,255,0.45)" strokeWidth={2} />
            </View>
          </View>
        )}
      </Pressable>
    </MotiView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function HeaderContent() {
  const { C } = useTheme();
  const { heading, funFact } = useRandomHeading();
  const HeadingIcon = heading.icon;

  return (
    <View>
      {/* Animated heading with icon */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ ...SMOOTH }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
      >
        <HeadingIcon size={24} color="rgba(255,255,255,0.9)" />
        <Text
          style={{
            fontFamily: FONT_HEADING_EXTRA,
            fontSize: 28,
            color: C.WHITE,
            lineHeight: 36,
          }}
        >
          {heading.text}
        </Text>
      </MotiView>

      {/* Subtitle */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...SMOOTH, delay: 50 }}
      >
        <Text
          style={{
            fontFamily: FONT_LATIN,
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 20,
            marginBottom: 12,
          }}
        >
          {heading.sub}
        </Text>
      </MotiView>

      {/* Fun fact - under 15 words */}
      <MotiView
        from={{ opacity: 0, translateX: -8 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ ...SMOOTH, delay: 100 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(255,255,255,0.20)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          alignSelf: 'flex-start',
        }}
      >
        <Sparkles size={12} color="rgba(255,255,255,0.8)" />
        <Text
          style={{
            fontFamily: FONT_LATIN,
            fontSize: 12,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {funFact}
        </Text>
      </MotiView>
    </View>
  );
}

export function ScenariosScreen({ user: _user, onScenarioSelect }: Props) {
  const { C, G, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
  const hasScenarioAccess = useAppStore((s) => s.hasScenarioAccess);
  const userMode = useAppStore((s) => s.user?.mode ?? 'career');
  const userGender = useAppStore((s) => s.user?.gender);

  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const allScenarios: Scenario[] = useMemo(
    () => filterScenariosForLearner(
      [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)]
        .filter((s) => s.mode === userMode),
      userGender,
    ),
    // isDark is the stable bool determining C — avoids rebuilding the scenario list
    // on every render since C is a new object reference each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDark, userMode, userGender],
  );

  const displayScenarios = useMemo(() => {
    const filtered = allScenarios.filter((s) => {
      if (filterTab === 'saved') return favoriteScenarios.includes(s.id);
      if (filterTab === 'recommended') return !s.locked;
      return true;
    });
    // Determine actual locked status based on subscription
    const withAccess = filtered.map((s, index) => ({
      ...s,
      locked: !hasScenarioAccess(index),
    }));
    // unlocked first, locked at the bottom
    return withAccess.sort((a, b) => (a.locked === b.locked ? 0 : a.locked ? 1 : -1));
  }, [allScenarios, filterTab, favoriteScenarios, hasScenarioAccess]);

  const lockedCount = displayScenarios.filter((s) => s.locked).length;

  const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'saved', label: 'Favourite' },
    { id: 'recommended', label: 'Recommended' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ع', 'ل', 'م']} />

      {/* ── Deep green header ── */}
      <LinearGradient
        colors={['#071A10', '#0C2B1A', C.JADE] as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 40,
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', right: -50, top: -30,
            width: 200, height: 200, borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', left: -40, bottom: -40,
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        />

        <HeaderContent />
      </LinearGradient>

      {/* ── Content panel ── */}
      <SheetPanel radius={32} overlap={28} style={{ flex: 1, backgroundColor: C.SURFACE, overflow: 'hidden' }}>
        {/* ── Tabs row ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 8,
            gap: 22,
          }}
        >
          {TABS.map(({ id, label }) => {
            const active = filterTab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setFilterTab(id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={label}
                hitSlop={8}
              >
                <Text
                  style={{
                    fontFamily: active ? FONT_HEADING_SEMI : FONT_LATIN,
                    fontSize: 15,
                    color: active ? C.TEXT : C.TEXT3,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Scenario grid ── */}
        <FlashList
          data={displayScenarios}
          numColumns={2}
          keyExtractor={(item: Scenario) => item.id}
          renderItem={({ item, index }: { item: Scenario; index: number }) => (
            <ScenarioCard
              scenario={item}
              index={index}
              isLeft={index % 2 === 0}
              onPress={() => onScenarioSelect(item.id)}
            />
          )}
          {...({ estimatedItemSize: 222 } as any)}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 8,
            paddingBottom: insets.bottom + 90,
          }}
          showsVerticalScrollIndicator={false}
          // Fix black square flash on Android
          removeClippedSubviews={false}
          // Disable virtualization animations
          disableAutoLayout={false}
          ListEmptyComponent={() => (
            <MotiView
              from={{ opacity: 0, translateY: 12, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ ...SMOOTH }}
              style={{ alignItems: 'center', paddingTop: 56, gap: 10 }}
            >
              <View
                style={{
                  width: 54, height: 54, borderRadius: 16,
                  backgroundColor: `${C.PRIMARY}12`,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {filterTab === 'saved'
                  ? <Heart size={24} color={C.PRIMARY} fill="transparent" />
                  : filterTab === 'recommended'
                    ? <CheckCircle2 size={24} color={C.PRIMARY} />
                    : <Search size={24} color={C.PRIMARY} />
                }
              </View>
              <Text
                style={{
                  fontFamily: FONT_HEADING_SEMI,
                  fontSize: 14,
                  color: C.TEXT2,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                {filterTab === 'saved'
                  ? 'No favourites yet\nTap the heart on any card'
                  : filterTab === 'recommended'
                    ? 'No recommendations yet\nAll scenarios coming soon!'
                    : 'No results found'}
              </Text>
            </MotiView>
          )}
          ListFooterComponent={
            filterTab === 'all' && lockedCount > 0
              ? () => (
                  <MotiView
                    from={{ opacity: 0, translateY: 16, scale: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ ...SMOOTH, delay: 200 }}
                  >
                    <View
                      style={{
                        borderRadius: 20, padding: 18,
                        flexDirection: 'row', alignItems: 'center', gap: 14,
                        backgroundColor: C.JADE_SURFACE,
                        borderWidth: 1, borderColor: C.JADE_BORDER,
                      }}
                    >
                      <LinearGradient
                        colors={G.AVATAR_STOPS}
                        start={ANGLE_135.start}
                        end={ANGLE_135.end}
                        style={{
                          width: 44, height: 44, borderRadius: 14,
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <CheckCircle2 size={20} color={C.WHITE} />
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT }}>
                          {lockedCount} more scenarios coming soon
                        </Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>
                          We are writing the next conversations now.
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 14, paddingVertical: 9,
                          borderRadius: 14, backgroundColor: C.JADE,
                        }}
                      >
                        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: C.WHITE }}>
                          Soon
                        </Text>
                      </View>
                    </View>
                  </MotiView>
                )
              : null
          }
        />
      </SheetPanel>
    </View>
  );
}
