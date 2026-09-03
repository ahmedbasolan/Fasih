import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Search, X, Snail, ChevronRight, BookOpen, Sparkles, Grid2x2, Blocks, Trophy, ArrowRight } from '../components/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_ARABIC_BLACK, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { GhostLetters, PhraseEntry, Rule } from '../components/ui';
import { SPACE } from '../components/design/spacing';
import type { CEFRBand } from '../types';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/ui/EmptyState';
import { PHRASES, PHRASE_CATEGORIES, getCefrColors, CEFR_LABELS, TYPE_LABELS } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import { getAvailablePatterns } from '../engine/sentenceBuilder';
import { arabicIncludes } from '../engine/arabic';

type Phrase = typeof PHRASES[0];

const GRID_PAD = 20;



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
  const CEFR_COLORS = useMemo(() => getCefrColors(C), [C]);
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

  const renderItem = useCallback(({ item: p, index }: { item: Phrase; index: number }) => {
    const isUnlocked = isPhraseUnlocked(p.id);

    return (
      <PhraseEntry
        phrase={p}
        first={index === 0}
        expanded={expanded === p.id}
        saved={savedPhrases.includes(p.id)}
        playing={playingId === p.id}
        onToggleExpand={toggleExpand}
        onPlay={play}
        onToggleSave={toggleSavedPhrase}
        expandedExtra={
          <>
            <Pressable
              hitSlop={8}
              onPress={() => playSlow(p)}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.phrases.playSlowly}
              style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, minHeight: 44 }}
            >
              <Snail size={16} strokeWidth={1.5} color={C.PRIMARY} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 13, color: C.PRIMARY }}>
                {STRINGS.phrases.playSlowly}
              </Text>
            </Pressable>

            {isUnlocked && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
                <Sparkles size={14} strokeWidth={1.5} color={C.PRIMARY} />
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>
                  {STRINGS.phrases.fromFirstScenario}
                </Text>
              </View>
            )}

            {/* CEFR and type. Labels, not coloured chips — category and level
                are information, and Sadaf spends no fills on them. */}
            <View style={{ flexDirection: 'row', gap: SPACE.md, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: C.TEXT3 }}>
                {CEFR_LABELS[p.cefr]}
              </Text>
              <Text style={{ fontFamily: FONT_LATIN_MEDIUM, fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: C.TEXT3 }}>
                {TYPE_LABELS[p.type]}
              </Text>
            </View>
          </>
        }
      />
    );
  }, [expanded, playingId, savedPhrases, isPhraseUnlocked, C, toggleExpand, play, playSlow, toggleSavedPhrase]);


  // ── Category grid header component ──
  const CategoryGridHeader = useMemo(() => (
    <View style={{ marginBottom: 20 }}>
      {/* Section label. A rule and a count — no chip fills, no icon tile. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: SPACE.md,
        }}
      >
        <Text
          style={{
            fontFamily: FONT_LATIN_MEDIUM,
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: C.TEXT3,
          }}
        >
          {STRINGS.phrases.categoriesTitle}
        </Text>
        <Text
          style={{
            fontFamily: FONT_LATIN,
            fontSize: 12,
            color: C.TEXT3,
            fontVariant: ['tabular-nums'],
          }}
        >
          {STRINGS.phrases.topicsCount(PHRASE_CATEGORIES.length)}
        </Text>
      </View>

      {/* Categories as ruled entries. The bento grid assigned each category a
          pastel fill and a large/small variant by index — neither encoded
          anything about the category. A name and a count do. */}
      <View>
        {PHRASE_CATEGORIES.map((category, idx) => (
          <Rule
            key={category}
            first={idx === 0}
            onPress={() => handleCategorySelect(category)}
            accessibilityLabel={category}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: SPACE.md,
              }}
            >
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.TEXT }}>
                {category}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
                <Text
                  style={{
                    fontFamily: FONT_LATIN,
                    fontSize: 12,
                    color: C.TEXT3,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {STRINGS.phrases.expressionCount(categoryCounts[category] || 0)}
                </Text>
                <ChevronRight size={16} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </View>
          </Rule>
        ))}
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

    // Sadaf: the banner is a rule and a label, not a tinted card. There is no
    // per-category colour any more.

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
          paddingVertical: SPACE.md,
          borderBottomWidth: 1,
          borderBottomColor: C.BORDER,
          marginBottom: SPACE.md,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.TEXT }}>
              {cat}
            </Text>
            <Text style={{
              fontFamily: FONT_LATIN,
              fontSize: 12,
              color: C.TEXT3,
              fontVariant: ['tabular-nums'],
            }}>
              {filtered.length}
            </Text>
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
              borderWidth: 1,
              borderColor: C.BORDER,
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
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: active ? color : C.BORDER,
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
