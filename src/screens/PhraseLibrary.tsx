import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, LayoutAnimation, UIManager, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Search, Volume2, BookmarkPlus, Info, X } from 'lucide-react-native';
import { C, FONT_LATIN_BOLD, FONT_LATIN, FONT_LATIN_SEMI, FONT_ARABIC_BLACK } from '../components/design/tokens';
import { EmptyState } from '../components/ui/EmptyState';
import { PHRASES, PHRASE_CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS } from '../constants/phrases';
import { useAppStore } from '../store/useAppStore';
import { useArabicTTS } from '../hooks/useArabicTTS';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !(globalThis as { nativeFabricUIManager?: unknown }).nativeFabricUIManager) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function PhraseLibrary() {
  const insets = useSafeAreaInsets();
  const savedPhrases = useAppStore((s) => s.savedPhrases);
  const toggleSavedPhrase = useAppStore((s) => s.toggleSavedPhrase);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { speak, isSpeaking } = useArabicTTS();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = useMemo(() => PHRASES.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.arabic.includes(search) || p.roman.toLowerCase().includes(q) || p.english.toLowerCase().includes(q);
    const matchCat = cat === 'All' || p.category === cat;
    return matchSearch && matchCat;
  }), [search, cat]);

  const play = (p: { id: string; arabic: string }) => { setPlayingId(p.id); speak(p.arabic); setTimeout(() => setPlayingId(null), 3000); };
  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === id ? null : id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 12 }}>
        <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 24, color: C.TEXT, marginBottom: 4 }}>Phrase Library</Text>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, marginBottom: 14 }}>{PHRASES.length} Gulf Arabic expressions</Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, marginBottom: 12 }}>
          <Search size={16} color={C.TEXT3} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Arabic, English, or phonetic…"
            placeholderTextColor={C.TEXT3}
            style={{ flex: 1, fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <X size={14} color={C.TEXT3} />
            </Pressable>
          )}
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {['All', ...PHRASE_CATEGORIES].map(c => {
            const active = cat === c;
            const color = CATEGORY_COLORS[c];
            return (
              <Pressable key={c} onPress={() => setCat(c)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? color : C.SURFACE, borderWidth: 1, borderColor: active ? 'transparent' : C.BORDER }}>
                <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 11, color: active ? '#05050E' : C.TEXT3 }}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80, gap: 8 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3, marginBottom: 4 }}>
          {filtered.length} expression{filtered.length !== 1 ? 's' : ''}
        </Text>

        {filtered.map((p, i) => {
          const isExpanded = expanded === p.id;
          const isPlaying = playingId === p.id;
          const isSaved = savedPhrases.includes(p.id);
          const color = CATEGORY_COLORS[p.category];

          return (
            <MotiView key={p.id} from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 250, delay: Math.min(i * 40, 240) }}>
              <Pressable onPress={() => toggleExpand(p.id)} style={{ borderRadius: 16, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: isExpanded ? `${color}35` : C.BORDER, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                  {/* Difficulty indicator */}
                  <View style={{ width: 6, height: 32, borderRadius: 3, backgroundColor: DIFFICULTY_COLORS[p.difficulty] }} />

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 18, color: C.TEXT, textAlign: 'right', marginBottom: 2 }}>{p.arabic}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.GOLD, marginBottom: 2 }}>{p.roman}</Text>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2 }}>{p.english}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Pressable onPress={(e) => { e.stopPropagation?.(); play(p); }} style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: isPlaying ? `${C.JADE2}18` : 'rgba(255,255,255,0.04)', alignItems: 'center', justifyContent: 'center' }}>
                      <Volume2 size={14} color={isPlaying ? C.JADE2 : C.TEXT3} />
                    </Pressable>
                    <Pressable onPress={(e) => { e.stopPropagation?.(); toggleSavedPhrase(p.id); }} style={{ width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <BookmarkPlus size={14} color={isSaved ? C.GOLD : C.TEXT3} fill={isSaved ? C.GOLD : 'none'} />
                    </Pressable>
                  </View>
                </View>

                {/* Expanded content */}
                {isExpanded && (
                  <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                    {p.culturalNote && (
                      <View style={{ borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, backgroundColor: `${color}10`, borderWidth: 1, borderColor: `${color}22`, marginBottom: 8 }}>
                        <Info size={13} color={color} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 11, color, marginBottom: 4 }}>Cultural Context</Text>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 20 }}>{p.culturalNote}</Text>
                        </View>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${DIFFICULTY_COLORS[p.difficulty]}14` }}>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color: DIFFICULTY_COLORS[p.difficulty], textTransform: 'capitalize' }}>{p.difficulty}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: `${color}10` }}>
                        <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 10, color }}>{p.category}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </Pressable>
            </MotiView>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState title="No phrases found" subtitle="Try a different search or category" />
        )}
      </ScrollView>
    </View>
  );
}
