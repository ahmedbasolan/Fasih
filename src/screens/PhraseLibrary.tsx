import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Platform, Dimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Search, Volume2, BookmarkPlus, Info, X, Snail, ChevronRight, BookOpen, Sparkles, Grid2x2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_BLACK, FONT_HEADING, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import type { ThemeColors } from '../components/design/tokens';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryCard } from '../components/features/CategoryCard';
import { PHRASES, PHRASE_CATEGORIES, getCategoryColors, getDifficultyColors, TYPE_LABELS } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';

type Phrase = typeof PHRASES[0];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PAD = 20;
const COL_WIDTH = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;

// Category card configuration built from theme tokens — no hardcoded hex
function getCategoryCardConfig(C: ThemeColors): Record<string, { bg: string; accent: string; darkBg: string }> {
  return {
    'Greetings':    { bg: C.CATEGORY_BLUE,  accent: C.VIOLET,             darkBg: C.VIOLET },
    'Gratitude':    { bg: C.CATEGORY_PINK,  accent: C.ERROR,              darkBg: C.ERROR },
    'Hospitality':  { bg: C.CATEGORY_CREAM, accent: C.CULTURAL_GOLD_DARK, darkBg: C.CULTURAL_GOLD },
    'Workplace':    { bg: C.CATEGORY_MINT,  accent: C.JADE,               darkBg: C.JADE },
    'Social':       { bg: C.CATEGORY_PEACH, accent: C.ERROR,              darkBg: C.ERROR },
    'Everyday':     { bg: C.CATEGORY_MINT,  accent: C.JADE,               darkBg: C.JADE2 },
    'Food & Drink': { bg: C.CATEGORY_CREAM, accent: C.CULTURAL_GOLD_DARK, darkBg: C.CULTURAL_GOLD },
    'Family':       { bg: C.CATEGORY_BLUE,  accent: C.VIOLET,             darkBg: C.VIOLET2 },
  };
}

// Determines grid layout: alternating large/small per row pair
function getCategoryVariant(index: number): 'large' | 'small' {
  const row = Math.floor(index / 2);
  const col = index % 2;
  // Even rows: left=large, right=small. Odd rows: left=small, right=large.
  return (row % 2 === 0) ? (col === 0 ? 'large' : 'small') : (col === 0 ? 'small' : 'large');
}

export function PhraseLibrary() {
  const { C, G, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const savedPhrases = useAppStore((s) => s.savedPhrases);
  const toggleSavedPhrase = useAppStore((s) => s.toggleSavedPhrase);
  const CATEGORY_COLORS = useMemo(() => getCategoryColors(C), [C]);
  const DIFFICULTY_COLORS = useMemo(() => getDifficultyColors(C), [C]);
  const CATEGORY_CARD_CONFIG = useMemo(() => getCategoryCardConfig(C), [C]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>(STRINGS.phrases.filterAll);
  const [diff, setDiff] = useState<string>(STRINGS.phrases.filterAll);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { speak, speakSlow } = useArabicTTS();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Count phrases per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PHRASES.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => PHRASES.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.arabic.includes(search) || p.roman.toLowerCase().includes(q) || p.english.toLowerCase().includes(q);
    const matchCat = cat === STRINGS.phrases.filterAll || p.category === cat;
    const matchDiff = diff === STRINGS.phrases.filterAll || p.difficulty === diff;
    return matchSearch && matchCat && matchDiff;
  }), [search, cat, diff]);

  const play = useCallback((p: Phrase) => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    setPlayingId(p.id);
    speak(p.arabic);
    playTimeoutRef.current = setTimeout(() => setPlayingId(null), 4000);
  }, [speak]);

  const playSlow = useCallback((p: Phrase) => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    setPlayingId(p.id);
    speakSlow(p.arabic);
    playTimeoutRef.current = setTimeout(() => setPlayingId(null), 6000);
  }, [speakSlow]);

  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => prev === id ? null : id);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setCat(category);
    setShowGrid(false);
  }, []);

  const handleShowAll = useCallback(() => {
    setCat(STRINGS.phrases.filterAll);
    setShowGrid(true);
  }, []);

  const renderItem = useCallback(({ item: p }: { item: Phrase }) => {
    const isExpanded = expanded === p.id;
    const isPlaying = playingId === p.id;
    const isSaved = savedPhrases.includes(p.id);
    const color = CATEGORY_COLORS[p.category] || C.PRIMARY;

    return (
      <Pressable
        onPress={() => toggleExpand(p.id)}
        accessibilityRole="button"
        accessibilityLabel={`${p.english} phrase`}
        accessibilityState={{ expanded: isExpanded }}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: C.CARD_BG,
          borderWidth: isExpanded ? 1 : 0,
          borderColor: isExpanded ? `${color}30` : 'transparent',
          ...Platform.select({
            ios: { shadowColor: C.CARD_SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
            android: { elevation: 2 },
          }),
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: 4, backgroundColor: DIFFICULTY_COLORS[p.difficulty], borderTopLeftRadius: 16, borderBottomLeftRadius: isExpanded ? 0 : 16 }} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 18, color: C.TEXT, textAlign: 'right', marginBottom: 2 }}>{p.arabic}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.PRIMARY, marginBottom: 2 }}>{p.roman}</Text>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>{p.english}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); play(p); }}
                accessibilityRole="button"
                accessibilityLabel={isPlaying ? 'Playing audio' : 'Play audio'}
                accessibilityState={{ selected: isPlaying }}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isPlaying ? C.JADE_DIM : C.SURFACE, alignItems: 'center', justifyContent: 'center' }}
              >
                <Volume2 size={14} color={isPlaying ? C.JADE : C.TEXT3} />
              </Pressable>
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); toggleSavedPhrase(p.id); }}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? 'Remove from saved' : 'Save phrase'}
                accessibilityState={{ selected: isSaved }}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
              >
                <BookmarkPlus size={14} color={isSaved ? C.PRIMARY : C.TEXT3} fill={isSaved ? C.PRIMARY : 'none'} />
              </Pressable>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, backgroundColor: C.SURFACE }}>
            <Pressable
              onPress={() => playSlow(p)}
              accessibilityRole="button"
              accessibilityLabel="Play slowly"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 10, backgroundColor: C.GOLD_DIM, borderWidth: 1, borderColor: C.GOLD_BORDER, marginBottom: 8 }}
            >
              <Snail size={14} color={C.PRIMARY} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: C.PRIMARY }}>{STRINGS.phrases.playSlowly}</Text>
            </Pressable>

            {p.pronTip && (
              <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.CATEGORY_LAVENDER, marginBottom: 8 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color: C.PRIMARY, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{STRINGS.phrases.pronunciation}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{p.pronTip}</Text>
              </View>
            )}

            {p.culturalNote && (
              <View style={{ borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, backgroundColor: C.CATEGORY_CREAM, marginBottom: 8 }}>
                <Info size={13} color={C.CULTURAL_GOLD} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: C.CULTURAL_GOLD_DARK, marginBottom: 4 }}>{STRINGS.phrases.culturalContext}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{p.culturalNote}</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${DIFFICULTY_COLORS[p.difficulty]}18` }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color: DIFFICULTY_COLORS[p.difficulty], textTransform: 'capitalize' }}>{p.difficulty}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${color}14` }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color }}>{p.category}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: C.SURFACE }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color: C.TEXT3 }}>{TYPE_LABELS[p.type]}</Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>
    );
  }, [expanded, playingId, savedPhrases, CATEGORY_COLORS, DIFFICULTY_COLORS, C, toggleExpand, play, playSlow, toggleSavedPhrase]);

  // ── Category grid header component ──
  const CategoryGridHeader = useMemo(() => (
    <View style={{ marginBottom: 20 }}>
      {/* Hero section title */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 100 }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: C.GOLD_DIM,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Grid2x2 size={16} color={C.PRIMARY} />
            </View>
            <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT }}>
              Categories
            </Text>
          </View>
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: C.SURFACE,
          }}>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.TEXT3 }}>
              {PHRASE_CATEGORIES.length} topics
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Bento grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
        {PHRASE_CATEGORIES.map((category, idx) => {
          const config = CATEGORY_CARD_CONFIG[category] || { bg: C.SURFACE, accent: C.PRIMARY, darkBg: C.PRIMARY };
          return (
            <View key={category} style={{ width: COL_WIDTH }}>
              <CategoryCard
                category={category}
                phraseCount={categoryCounts[category] || 0}
                variant={getCategoryVariant(idx)}
                bgColor={isDark ? config.darkBg : config.bg}
                accentColor={isDark ? config.darkBg : config.accent}
                delay={150 + idx * 60}
                onPress={() => handleCategorySelect(category)}
              />
            </View>
          );
        })}
      </View>
    </View>
  ), [C, isDark, categoryCounts, handleCategorySelect]);

  // ── When a category is selected, show a back-to-grid banner ──
  const CategoryFilterBanner = useMemo(() => {
    if (showGrid || cat === STRINGS.phrases.filterAll) return null;

    const config = CATEGORY_CARD_CONFIG[cat] || { bg: C.SURFACE, accent: C.PRIMARY, darkBg: C.PRIMARY };
    const accent = isDark ? config.darkBg : config.accent;
    const bg = isDark ? `${config.darkBg}18` : config.bg;

    return (
      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 16,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: `${accent}22`,
          marginBottom: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accent,
            }} />
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT }}>
              {cat}
            </Text>
            <View style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: `${accent}18`,
            }}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: accent }}>
                {categoryCounts[cat] || 0}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleShowAll}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
            }}
          >
            <Grid2x2 size={12} color={C.TEXT3} />
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: C.TEXT2 }}>All</Text>
          </Pressable>
        </View>
      </MotiView>
    );
  }, [showGrid, cat, C, isDark, categoryCounts, handleShowAll]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      {/* Fixed header — title, search + filters */}
      <View style={{ paddingHorizontal: GRID_PAD, paddingTop: insets.top + 16, paddingBottom: 12 }}>

        {/* Title row with stats */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 50 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 26, color: C.TEXT }}>
              {STRINGS.phrases.title}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              backgroundColor: C.GOLD_DIM,
            }}>
              <BookOpen size={13} color={C.PRIMARY} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: C.PRIMARY }}>{PHRASES.length}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, marginBottom: 14 }}>
            {STRINGS.phrases.subtitle(PHRASES.length)}
          </Text>
        </MotiView>

        {/* Search */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 120 }}
        >
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
            backgroundColor: searchFocused ? C.GOLD_SURFACE : C.SURFACE,
            borderWidth: 1.5,
            borderColor: searchFocused ? C.PRIMARY : C.BORDER,
            marginBottom: 12,
          }}>
            <Search size={16} color={searchFocused ? C.PRIMARY : C.TEXT3} />
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                if (text.length > 0 && showGrid) setShowGrid(false);
                if (text.length === 0 && cat === STRINGS.phrases.filterAll) setShowGrid(true);
              }}
              placeholder={STRINGS.phrases.searchPlaceholder}
              placeholderTextColor={C.TEXT3}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ flex: 1, fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}
            />
            {search.length > 0 && (
              <Pressable onPress={() => {
                setSearch('');
                if (cat === STRINGS.phrases.filterAll) setShowGrid(true);
              }}>
                <X size={14} color={C.TEXT3} />
              </Pressable>
            )}
          </View>
        </MotiView>

        {/* Category pills (only when NOT on grid view) */}
        {!showGrid && (
          <MotiView
            from={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 280 }}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 8 }}>
              {[STRINGS.phrases.filterAll, ...PHRASE_CATEGORIES].map(c => {
                const active = cat === c;
                return (
                  <Pressable key={c} onPress={() => {
                    setCat(c);
                    if (c === STRINGS.phrases.filterAll && search.length === 0) setShowGrid(true);
                  }} style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: active ? C.PRIMARY : C.SURFACE,
                    borderWidth: active ? 0 : 1,
                    borderColor: C.BORDER,
                  }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.WHITE : C.TEXT3 }}>{c}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Difficulty filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[STRINGS.phrases.filterAll, 'basic', 'intermediate', 'advanced'].map(d => {
                const active = diff === d;
                const color = d === STRINGS.phrases.filterAll ? C.PRIMARY : DIFFICULTY_COLORS[d];
                const label = d === STRINGS.phrases.filterAll ? d : d === 'basic' ? STRINGS.common.levelBasic : d === 'intermediate' ? STRINGS.common.levelIntermediate : STRINGS.common.levelAdvanced;
                return (
                  <Pressable key={d} onPress={() => setDiff(d)} style={{
                    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
                    backgroundColor: active ? `${color}18` : 'transparent',
                    borderWidth: 1,
                    borderColor: active ? `${color}40` : C.BORDER,
                  }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: active ? color : C.TEXT3, textTransform: 'capitalize' }}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </MotiView>
        )}
      </View>

      {/* Content area */}
      {showGrid ? (
        /* ── Category Grid View ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: GRID_PAD,
            paddingBottom: insets.bottom + 80,
          }}
        >
          {CategoryGridHeader}

          {/* Quick stats banner */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 650 }}
          >
            <Pressable
              onPress={() => { setCat(STRINGS.phrases.filterAll); setShowGrid(false); }}
              style={{
                borderRadius: 18,
                overflow: 'hidden',
                ...Platform.select({
                  ios: { shadowColor: C.PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
                  android: { elevation: 3 },
                }),
              }}
            >
              <LinearGradient
                colors={isDark ? G.SCENARIO_GOLD_STOPS : G.SCENARIO_JADE_STOPS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 18,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: C.GOLD_DIM,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={20} color={C.PRIMARY} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT, marginBottom: 2 }}>
                      Browse All Phrases
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>
                      {PHRASES.length} expressions across {PHRASE_CATEGORIES.length} categories
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color={C.PRIMARY} />
              </LinearGradient>
            </Pressable>
          </MotiView>
        </ScrollView>
      ) : (
        /* ── Phrase List View ── */
        <FlashList
          data={filtered}
          keyExtractor={(p: Phrase) => p.id}
          renderItem={renderItem}
          {...({ estimatedItemSize: 80 } as any)}
          extraData={[expanded, playingId, savedPhrases]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={() => (
            <View style={{ marginBottom: 4 }}>
              {CategoryFilterBanner}
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                {STRINGS.phrases.expressionCount(filtered.length)}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <EmptyState title={STRINGS.phrases.noPhrasesFound} subtitle={STRINGS.phrases.noPhrasesSub} />
          )}
          contentContainerStyle={{ paddingHorizontal: GRID_PAD, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
