import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Search, Volume2, BookmarkPlus, Info, X, Snail, ChevronRight, BookOpen, Sparkles, Grid2x2, Blocks, Trophy, ArrowRight } from '../components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_BLACK, FONT_HEADING, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { GhostLetters } from '../components/ui';
import type { ThemeColors } from '../components/design/tokens';
import type { CEFRBand } from '../types';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryCard } from '../components/features/CategoryCard';
import { PHRASES, PHRASE_CATEGORIES, getCategoryColors, getCefrColors, CEFR_LABELS, TYPE_LABELS } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import { getAvailablePatterns } from '../engine/sentenceBuilder';
import { arabicIncludes } from '../engine/arabic';

type Phrase = typeof PHRASES[0];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 12;
const GRID_PAD = 20;
const COL_WIDTH = (SCREEN_WIDTH - GRID_PAD * 2 - GRID_GAP) / 2;

// Category card configuration built from theme tokens — no hardcoded hex
function getCategoryCardConfig(C: ThemeColors): Record<string, { bg: string; accent: string; darkBg: string }> {
  return {
    'Greetings':    { bg: 'transparent',  accent: C.VIOLET,             darkBg: C.VIOLET },
    'Gratitude':    { bg: 'transparent',  accent: C.ERROR,              darkBg: C.ERROR },
    'Hospitality':  { bg: 'transparent', accent: C.CULTURAL_GOLD_DARK, darkBg: C.CULTURAL_GOLD },
    'Workplace':    { bg: 'transparent',  accent: C.JADE,               darkBg: C.JADE },
    'Social':       { bg: 'transparent', accent: C.ERROR,              darkBg: C.ERROR },
    'Everyday':     { bg: 'transparent',  accent: C.JADE,               darkBg: C.JADE2 },
    'Food & Drink': { bg: 'transparent', accent: C.CULTURAL_GOLD_DARK, darkBg: C.CULTURAL_GOLD },
    'Family':       { bg: 'transparent',  accent: C.VIOLET,             darkBg: C.VIOLET2 },
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
  const isPhraseUnlocked = useAppStore((s) => s.isPhraseUnlocked);
  const unlockedPhraseIds = useAppStore((s) => s.unlockedPhraseIds);
  const completedScenarios = useAppStore((s) => s.completedScenarios);
  const secretEndingsEarned = useAppStore((s) => s.secretEndingsEarned);
  const patternProgress = useAppStore((s) => s.patternProgress);
  const availablePatterns = useMemo(
    () => getAvailablePatterns(unlockedPhraseIds, completedScenarios, secretEndingsEarned),
    [unlockedPhraseIds, completedScenarios, secretEndingsEarned],
  );
  const CATEGORY_COLORS = useMemo(() => getCategoryColors(C), [C]);
  const CEFR_COLORS = useMemo(() => getCefrColors(C), [C]);
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
  const categoryScrollRef = useRef<ScrollView>(null);
  const categoryChipX = useRef<Record<string, number>>({});

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
    // Postel's law: be liberal in what you accept. Matching the raw query
    // against the raw stored string meant a learner who typed a form they had
    // seen elsewhere — with vowel marks, or a bare alef where we store a
    // hamzated one — got an empty list and no explanation. arabicIncludes
    // folds those differences; Latin queries pass through it unchanged.
    const matchSearch = !search
      || arabicIncludes(p.arabic, search)
      || p.roman.toLowerCase().includes(q)
      || p.english.toLowerCase().includes(q);
    const matchCat = cat === STRINGS.phrases.filterAll || p.category === cat;
    const matchDiff = diff === STRINGS.phrases.filterAll || p.cefr === diff;
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

  // Bring the active category chip into view — it's the only visual
  // confirmation of what's selected, since the row always mounts scrolled
  // to the leftmost position regardless of which chip triggered the filter.
  const scrollToCategoryChip = useCallback((label: string, animated: boolean) => {
    const x = categoryChipX.current[label];
    if (x !== undefined) {
      categoryScrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated });
    }
  }, []);

  useEffect(() => {
    if (!showGrid) scrollToCategoryChip(cat, true);
  }, [cat, showGrid, scrollToCategoryChip]);

  const renderItem = useCallback(({ item: p }: { item: Phrase }) => {
    const isExpanded = expanded === p.id;
    const isPlaying = playingId === p.id;
    const isSaved = savedPhrases.includes(p.id);
    const isUnlocked = isPhraseUnlocked(p.id);
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
          <View style={{ width: 4, backgroundColor: CEFR_COLORS[p.cefr], borderTopLeftRadius: 16, borderBottomLeftRadius: isExpanded ? 0 : 16 }} />
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
                hitSlop={4}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isPlaying ? C.JADE_DIM : C.SURFACE, alignItems: 'center', justifyContent: 'center' }}
              >
                <Volume2 size={14} color={isPlaying ? C.JADE : C.TEXT3} />
              </Pressable>
              <Pressable
                onPress={(e) => { e.stopPropagation?.(); toggleSavedPhrase(p.id); }}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? 'Remove from saved' : 'Save phrase'}
                accessibilityState={{ selected: isSaved }}
                hitSlop={4}
                style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
              >
                <BookmarkPlus size={14} color={isSaved ? C.PRIMARY : C.TEXT3} fill={isSaved ? C.PRIMARY : 'none'} />
              </Pressable>
            </View>
          </View>
        </View>

        {isExpanded && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, backgroundColor: C.SURFACE }}>
            <Pressable
              hitSlop={8}
              onPress={() => playSlow(p)}
              accessibilityRole="button"
              accessibilityLabel="Play slowly"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 10, backgroundColor: C.JADE_ACCENT_DIM, borderWidth: 1, borderColor: C.JADE_ACCENT_BORDER, marginBottom: 8 }}
            >
              <Snail size={14} color={C.PRIMARY} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: C.PRIMARY }}>{STRINGS.phrases.playSlowly}</Text>
            </Pressable>

            {isUnlocked && (
              <View style={{ borderRadius: 12, padding: 10, backgroundColor: C.JADE_DIM, borderWidth: 1, borderColor: C.JADE_BORDER, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color={C.PRIMARY} />
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.PRIMARY }}>{STRINGS.phrases.fromFirstScenario}</Text>
              </View>
            )}

            {p.pronTip && (
              <View style={{ borderRadius: 12, padding: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: C.BORDER, marginBottom: 8 }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color: C.PRIMARY, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{STRINGS.phrases.pronunciation}</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{p.pronTip}</Text>
              </View>
            )}

            {p.culturalNote && (
              <View style={{ borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, backgroundColor: 'transparent', borderWidth: 1, borderColor: C.BORDER, marginBottom: 8 }}>
                <Info size={13} color={C.CULTURAL_GOLD} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: C.CULTURAL_GOLD_DARK, marginBottom: 4 }}>{STRINGS.phrases.culturalContext}</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{p.culturalNote}</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${CEFR_COLORS[p.cefr]}18` }}>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 10, color: CEFR_COLORS[p.cefr] }}>{CEFR_LABELS[p.cefr]}</Text>
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
  }, [expanded, playingId, savedPhrases, isPhraseUnlocked, CATEGORY_COLORS, CEFR_COLORS, C, toggleExpand, play, playSlow, toggleSavedPhrase]);

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
              backgroundColor: C.JADE_ACCENT_DIM,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Grid2x2 size={16} color={C.PRIMARY} />
            </View>
            <Text style={{ fontFamily: FONT_HEADING, fontSize: 17, color: C.TEXT }}>
              {STRINGS.phrases.categoriesTitle}
            </Text>
          </View>
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: C.SURFACE,
          }}>
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: C.TEXT3 }}>
              {STRINGS.phrases.topicsCount(PHRASE_CATEGORIES.length)}
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
                onPress={() => handleCategorySelect(category)}
              />
            </View>
          );
        })}
      </View>

      {/* Patterns strip */}
      {availablePatterns.length > 0 && (
        <View style={{ marginTop: 24 }}>
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 500 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: C.JADE_ACCENT_DIM, alignItems: 'center', justifyContent: 'center' }}>
                  <Blocks size={15} color={C.CULTURAL_GOLD_DARK} />
                </View>
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.TEXT }}>
                  {STRINGS.sentenceBuilder.patternsTitle}
                </Text>
              </View>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                {STRINGS.sentenceBuilder.patternsSubtitle}
              </Text>
            </View>
          </MotiView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {availablePatterns.map((p, idx) => {
              const mastered = (patternProgress[p.id]?.correctBuilds ?? 0) >= 3;
              return (
                <MotiView
                  key={p.id}
                  from={{ opacity: 0, translateX: 12 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'timing', duration: 340, delay: 560 + idx * 60 }}
                >
                  <Pressable
                    onPress={() => router.push(`/sentence-builder?pattern=${p.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={p.title}
                    style={{
                      width: 168,
                      borderRadius: 18,
                      padding: 14,
                      backgroundColor: `${C.CULTURAL_GOLD}0F`,
                      borderWidth: 1,
                      borderColor: `${C.CULTURAL_GOLD}2E`,
                    }}
                  >
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 17, color: C.TEXT, marginBottom: 6, textAlign: 'right' }}>
                      {p.title.split(' — ')[0]}
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2, lineHeight: 15 }}>
                      {p.title.split(' — ')[1] ?? ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={{
                            width: 6, height: 6, borderRadius: 3,
                            backgroundColor: (patternProgress[p.id]?.correctBuilds ?? 0) > i ? C.CULTURAL_GOLD : C.BORDER2,
                          }} />
                        ))}
                      </View>
                      {mastered ? (
                        <Trophy size={13} color={C.CULTURAL_GOLD} />
                      ) : (
                        <ArrowRight size={13} color={C.CULTURAL_GOLD_DARK} />
                      )}
                    </View>
                  </Pressable>
                </MotiView>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  // CATEGORY_CARD_CONFIG is a module-level constant — stable, safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                {filtered.length}
              </Text>
            </View>
          </View>
          <Pressable
            hitSlop={8}
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
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: C.TEXT2 }}>{STRINGS.phrases.filterAll}</Text>
          </Pressable>
        </View>
      </MotiView>
    );
  // CATEGORY_CARD_CONFIG is a module-level constant — stable, safe to omit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGrid, cat, C, isDark, filtered.length, handleShowAll]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ق', 'و', 'ل']} />
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
              backgroundColor: C.JADE_ACCENT_DIM,
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
            backgroundColor: searchFocused ? C.JADE_ACCENT_SURFACE : C.SURFACE,
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
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 6 }}>
              {STRINGS.phrases.categoryFilterLabel}
            </Text>
            <ScrollView ref={categoryScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 8 }}>
              {[STRINGS.phrases.filterAll, ...PHRASE_CATEGORIES].map(c => {
                const active = cat === c;
                return (
                  <Pressable
                    hitSlop={8}
                    key={c}
                    onPress={() => {
                      setCat(c);
                      if (c === STRINGS.phrases.filterAll && search.length === 0) setShowGrid(true);
                    }}
                    onLayout={(e) => {
                      categoryChipX.current[c] = e.nativeEvent.layout.x;
                      if (active) scrollToCategoryChip(c, false);
                    }}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: active ? C.PRIMARY : C.SURFACE,
                      borderWidth: active ? 0 : 1,
                      borderColor: C.BORDER,
                    }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.BG : C.TEXT3 }}>{c}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Difficulty filter */}
            <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color: C.TEXT3, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 6 }}>
              {STRINGS.phrases.levelFilterLabel}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {[STRINGS.phrases.filterAll, 'A1', 'A1+', 'A2'].map(d => {
                const active = diff === d;
                const color = d === STRINGS.phrases.filterAll ? C.PRIMARY : CEFR_COLORS[d as CEFRBand];
                const label = d === STRINGS.phrases.filterAll ? d : CEFR_LABELS[d as CEFRBand];
                return (
                  <Pressable key={d} onPress={() => setDiff(d)} hitSlop={8} style={{
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
                    backgroundColor: C.JADE_ACCENT_DIM,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={20} color={C.PRIMARY} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 14, color: C.TEXT, marginBottom: 2 }}>
                      {STRINGS.phrases.browseAllTitle}
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>
                      {STRINGS.phrases.browseAllSub(PHRASES.length, PHRASE_CATEGORIES.length)}
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
              {/* The banner's own pill already shows this count once a category is
                  selected — only show the standalone line when there's no banner. */}
              {cat === STRINGS.phrases.filterAll && (
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                  {STRINGS.phrases.expressionCount(filtered.length)}
                </Text>
              )}
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
