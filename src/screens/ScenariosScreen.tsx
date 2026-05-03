import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import {
  Heart, Search, CheckCircle2,
  Coffee, Building2, Users, Briefcase, ShoppingBag, Moon,
  Sunrise, Dumbbell, Sparkles, Zap, Target, Rocket,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { getCareerScenarios, getMedicalScenarios, getSocialScenarios } from '../constants/scenarios';
import {
  FONT_HEADING_EXTRA,
  FONT_HEADING_SEMI,
  FONT_LATIN,
} from '../components/design/tokens';
import { ANGLE_135 } from '../components/design/gradients';
import { useTheme } from '../hooks/useTheme';
import type { UserProfile, Scenario } from '../types';

interface Props {
  user: UserProfile | null;
  onScenarioSelect: (id: string) => void;
}

type FilterTab = 'all' | 'saved' | 'recommended';

// ─── Constants ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Coffee, Building2, Briefcase, Moon, Users, ShoppingBag, Sunrise, Dumbbell, Heart, Zap,
};

// Card palettes — green/cyan themed pastels
const CARD_PALETTES = [
  { bg: '#E0FFF5', accent: '#02B986', iconBg: '#B8FFE0' },
  { bg: '#E0FAFF', accent: '#00D6FC', iconBg: '#B8F5FF' },
  { bg: '#E8FFF0', accent: '#00C978', iconBg: '#C8FFD8' },
  { bg: '#F0FFF8', accent: '#02B986', iconBg: '#D0FFE8' },
  { bg: '#E0F5FF', accent: '#00B8E0', iconBg: '#B8EBFF' },
  { bg: '#E8FFFA', accent: '#00D6A0', iconBg: '#C0FFEE' },
];

// Bento height pattern — alternates for visual interest
const BENTO_HEIGHTS = [210, 180, 180, 210, 210, 180];

// ─── Green header matching new theme ──────────────────────────────────────────

const HEADER_GRADIENT: [string, string, string] = ['#00D69A', '#00FF95', '#02B986'];

// ─── Random motivational headings ───────────────────────────────────────────

const MOTIVATIONAL_HEADINGS = [
  { text: 'Ready To Learn?', sub: 'Choose your subject.', icon: Sparkles },
  { text: 'Level Up Today!', sub: 'New phrases await.', icon: Zap },
  { text: 'Your Next Adventure', sub: 'Pick a scenario.', icon: Rocket },
  { text: 'Master Gulf Arabic', sub: 'One phrase at a time.', icon: Target },
  { text: 'Time to Shine', sub: 'Practice makes perfect.', icon: Sparkles },
  { text: 'Unlock New Skills', sub: 'Dive into scenarios.', icon: Zap },
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
  const [heading, setHeading] = useState(MOTIVATIONAL_HEADINGS[0]);
  const [funFact, setFunFact] = useState(FUN_FACTS[0]);

  useEffect(() => {
    // Pick random heading and fun fact on mount only
    const randomHeadingIndex = Math.floor(Math.random() * MOTIVATIONAL_HEADINGS.length);
    const randomFactIndex = Math.floor(Math.random() * FUN_FACTS.length);
    setHeading(MOTIVATIONAL_HEADINGS[randomHeadingIndex]);
    setFunFact(FUN_FACTS[randomFactIndex]);
  }, []);

  return { heading, funFact };
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
  const { iconName, title, phrases, locked, comingSoon } = scenario;
  const Icon = ICON_MAP[iconName] || Coffee;
  const palette = CARD_PALETTES[index % CARD_PALETTES.length];
  const cardHeight = BENTO_HEIGHTS[index % BENTO_HEIGHTS.length];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
        delay: index * 40,
      }}
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
          opacity: locked || comingSoon ? 0.72 : 1,
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
              color: locked ? '#9CA3AF' : '#1F2937',
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
              color: locked ? '#9CA3AF' : '#6B7280',
              marginTop: 3,
            }}
          >
            {phrases} Phrases
          </Text>
        </View>

        {/* ── Bottom: large icon centered ── */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 14 }}>
          <Icon size={56} color={locked ? '#CBD5E1' : palette.accent} strokeWidth={1.5} />
        </View>
        {comingSoon && (
          <View style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#0D0D0D',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
            <Text style={{
              fontFamily: FONT_LATIN,
              fontSize: 10,
              color: '#FFFFFF',
              letterSpacing: 0.5,
            }}>
              Coming Soon
            </Text>
          </View>
        )}
      </Pressable>
    </MotiView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function HeaderContent() {
  const { heading, funFact } = useRandomHeading();
  const HeadingIcon = heading.icon;

  return (
    <View>
      {/* Animated heading with icon */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
      >
        <HeadingIcon size={24} color="rgba(255,255,255,0.9)" />
        <Text
          style={{
            fontFamily: FONT_HEADING_EXTRA,
            fontSize: 28,
            color: '#FFFFFF',
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
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 50 }}
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
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 100 }}
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
  const { C, G } = useTheme();
  const insets = useSafeAreaInsets();

  const favoriteScenarios = useAppStore((s) => s.favoriteScenarios);
  const hasScenarioAccess = useAppStore((s) => s.hasScenarioAccess);
  const userMode = useAppStore((s) => s.user?.mode ?? 'career');

  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const allScenarios: Scenario[] = useMemo(
    () => [...getCareerScenarios(C), ...getMedicalScenarios(C), ...getSocialScenarios(C)]
      .filter((s) => s.mode === userMode),
    [C, userMode],
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

      {/* ── Green header matching theme ── */}
      <LinearGradient
        colors={HEADER_GRADIENT}
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
      <View
        style={{
          flex: 1,
          backgroundColor: C.SURFACE,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -28,
          overflow: 'hidden',
        }}
      >
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
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
                    transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 200 }}
                  >
                    <View
                      style={{
                        borderRadius: 20, padding: 18,
                        flexDirection: 'row', alignItems: 'center', gap: 14,
                        backgroundColor: C.CATEGORY_LAVENDER,
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
                        <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.PRIMARY_DARK }}>
                          {lockedCount} more scenarios coming soon
                        </Text>
                        <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: 2 }}>
                          We are writing the next conversations now.
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 14, paddingVertical: 9,
                          borderRadius: 14, backgroundColor: C.PRIMARY,
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
      </View>
    </View>
  );
}
