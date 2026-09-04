import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Search, X, Snail, ChevronRight, BookOpen, Sparkles, Grid2x2, Blocks, Trophy, ArrowRight } from '../components/icons';
import { FONT_LATIN, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_ARABIC_BLACK, FONT_HEADING_SEMI, FONT_HEADING_EXTRA } from '../components/design/tokens';
import { GhostLetters, PhraseEntry, Rule } from '../components/ui';
import { SPACE, SCREEN_MARGIN, RADIUS } from '../components/design/spacing';
import type { CEFRBand } from '../types';
import { useTheme } from '../hooks/useTheme';
import { EmptyState } from '../components/ui/EmptyState';
import { PHRASES, PHRASE_CATEGORIES, getCefrColors, CEFR_LABELS, TYPE_LABELS } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';
import { STRINGS } from '../constants/strings';
import { getAvailablePatterns } from '../engine/sentenceBuilder';
import { arabicIncludes } from '../engine/arabic';
import { splitBilingualTitle } from '../engine/text';

type Phrase = typeof PHRASES[0];




export function PhraseLibrary() {
  const { C } = useTheme();
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
              onPress={(e) => { e.stopPropagation?.(); playSlow(p); }}
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
    <View style={{ marginBottom: SPACE.xl }}>
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
        <View style={{ marginTop: SPACE.xl }}>
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 380, delay: 500 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACE.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
                {/* The icon, not a tinted tile holding the icon. */}
                <Blocks size={15} strokeWidth={1.5} color={C.PRIMARY} />
                <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 15, color: C.TEXT }}>
                  {STRINGS.sentenceBuilder.patternsTitle}
                </Text>
              </View>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>
                {STRINGS.sentenceBuilder.patternsSubtitle}
              </Text>
            </View>
          </MotiView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACE.md }}>
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
                      borderRadius: RADIUS.flat,
                      padding: SPACE.md,
                      borderWidth: 1,
                      borderColor: C.BORDER,
                    }}
                  >
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 17, color: C.TEXT, marginBottom: SPACE.sm, textAlign: 'right', writingDirection: 'rtl' }}>
                      {splitBilingualTitle(p.title).arabic}
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT2, lineHeight: 15, writingDirection: 'ltr' }}>
                      {splitBilingualTitle(p.title).english}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACE.md }}>
                      {/* Circular by intent — a dot is the degenerate pill, and
                          the budget's flat rule is about boxes, not marks. */}
                      <View style={{ flexDirection: 'row', gap: SPACE.xs }}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={{
                            width: 6, height: 6, borderRadius: RADIUS.pill,
                            backgroundColor: (patternProgress[p.id]?.correctBuilds ?? 0) > i ? C.PRIMARY : C.BORDER2,
                          }} />
                        ))}
                      </View>
                      {mastered ? (
                        <Trophy size={13} strokeWidth={1.5} color={C.PRIMARY} />
                      ) : (
                        <ArrowRight size={13} strokeWidth={1.5} color={C.TEXT3} />
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [C, categoryCounts, handleCategorySelect]);

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
              gap: SPACE.xs,
              paddingHorizontal: SPACE.md,
              paddingVertical: SPACE.sm,
              borderRadius: RADIUS.pill,
              borderWidth: 1,
              borderColor: C.BORDER,
            }}
          >
            <Grid2x2 size={12} strokeWidth={1.5} color={C.TEXT3} />
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 11, color: C.TEXT2 }}>{STRINGS.phrases.filterAll}</Text>
          </Pressable>
        </View>
      </MotiView>
    );
  }, [showGrid, cat, C, filtered.length, handleShowAll]);

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['ق', 'و', 'ل']} />
      {/* Fixed header — title, search + filters */}
      <View style={{ paddingHorizontal: SCREEN_MARGIN, paddingTop: insets.top + SPACE.lg, paddingBottom: SPACE.md }}>

        {/* Title row with stats */}
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 50 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: SPACE.xs }}>
            <Text style={{ fontFamily: FONT_HEADING_EXTRA, fontSize: 26, color: C.TEXT }}>
              {STRINGS.phrases.title}
            </Text>
            {/* A count, not a badge. The tinted pill around it was a fill
                spent on a number that is already legible. */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.sm }}>
              <BookOpen size={13} strokeWidth={1.5} color={C.TEXT3} />
              <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: C.TEXT3, fontVariant: ['tabular-nums'] }}>{PHRASES.length}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, marginBottom: SPACE.lg }}>
            {STRINGS.phrases.subtitle(PHRASES.length)}
          </Text>
        </MotiView>

        {/* Search */}
        <MotiView
          from={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 360, delay: 120 }}
        >
          {/* No fill. SURFACE is the sheet's material (spec section 4.1), and
              the field sits on the page — focus is the PRIMARY rule around it. */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: SPACE.md,
            paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, borderRadius: RADIUS.flat,
            borderWidth: 1,
            borderColor: searchFocused ? C.PRIMARY : C.BORDER,
            marginBottom: SPACE.md,
          }}>
            <Search size={16} strokeWidth={1.5} color={searchFocused ? C.PRIMARY : C.TEXT3} />
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
                <X size={14} strokeWidth={1.5} color={C.TEXT3} />
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
                      paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, borderRadius: RADIUS.pill,
                      borderWidth: 1,
                      borderColor: active ? C.PRIMARY : C.BORDER,
                    }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 12, color: active ? C.PRIMARY : C.TEXT3 }}>{c}</Text>
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
                    paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm, borderRadius: RADIUS.pill,
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
            paddingHorizontal: SCREEN_MARGIN,
            paddingBottom: insets.bottom + 80,
          }}
        >
          {CategoryGridHeader}

          {/* Browse-all. Was a gradient card carrying the screen's only
              shadow, an 18 radius and a tinted icon tile — three fills to say
              one thing. It is the last entry in the category list, so it is
              the same ruled row the categories above it are. */}
          <View style={{ marginTop: SPACE.xl }}>
            <Rule
              first
              onPress={() => { setCat(STRINGS.phrases.filterAll); setShowGrid(false); }}
              accessibilityLabel={STRINGS.phrases.browseAllTitle}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACE.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACE.md, flex: 1 }}>
                  <Sparkles size={18} strokeWidth={1.5} color={C.PRIMARY} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: C.TEXT }}>
                      {STRINGS.phrases.browseAllTitle}
                    </Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, marginTop: SPACE.xs }}>
                      {STRINGS.phrases.browseAllSub(PHRASES.length, PHRASE_CATEGORIES.length)}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} strokeWidth={1.5} color={C.TEXT3} />
              </View>
            </Rule>
          </View>
        </ScrollView>
      ) : (
        /* ── Phrase List View ── */
        <FlashList
          data={filtered}
          keyExtractor={(p: Phrase) => p.id}
          renderItem={renderItem}
          {...({ estimatedItemSize: 80 } as any)}
          extraData={[expanded, playingId, savedPhrases]}
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
          contentContainerStyle={{ paddingHorizontal: SCREEN_MARGIN, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
