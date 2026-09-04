import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Volume2, Bookmark } from '../icons';
import type { Phrase } from '../../types';
import {
  FONT_ARABIC_EXTRA,
  FONT_LATIN,
  FONT_LATIN_MEDIUM,
  ARABIC_LINE_HEIGHT_MULTIPLIER,
} from '../design/tokens';
import { SPACE, RADIUS } from '../design/spacing';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { Rule } from './Rule';

interface PhraseEntryProps {
  phrase: Phrase;
  expanded: boolean;
  saved: boolean;
  playing: boolean;
  first?: boolean;
  onToggleExpand: (id: string) => void;
  onPlay: (phrase: Phrase) => void;
  onToggleSave: (id: string) => void;
  /**
   * Screen-specific content for the expanded state — the Library's play-slowly
   * control, unlock badge and CEFR chips live here.
   *
   * A slot rather than more props on purpose: the entry owns the canonical
   * phrase hierarchy, and anything only one screen needs stays that screen's
   * business. Adding a prop per affordance is how the component this replaced
   * grew to 110 lines of inline styles.
   */
  expandedExtra?: React.ReactNode;
}

const ARABIC_SIZE = 28;

/**
 * Arabic-first entry. Hierarchy is fixed by the spec and is not configurable:
 * Arabic, then romanisation, then English. Romanisation is the authoritative
 * pronunciation channel (see docs/language/authority.md) and is set to look
 * like one rather than like a caption.
 */
export function PhraseEntry({
  phrase, expanded, saved, playing, first,
  onToggleExpand, onPlay, onToggleSave, expandedExtra,
}: PhraseEntryProps) {
  const { C } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        arabic: {
          fontFamily: FONT_ARABIC_EXTRA,
          fontSize: ARABIC_SIZE,
          lineHeight: ARABIC_SIZE * ARABIC_LINE_HEIGHT_MULTIPLIER,
          color: C.TEXT,
          writingDirection: 'rtl',
          textAlign: 'left',
        },
        roman: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 12,
          letterSpacing: 0.6,
          color: C.PRIMARY,
          marginTop: SPACE.xs,
        },
        english: {
          fontFamily: FONT_LATIN,
          fontSize: 14,
          color: C.TEXT2,
          marginTop: SPACE.sm,
        },
        meta: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACE.md,
          marginTop: SPACE.md,
        },
        label: {
          fontFamily: FONT_LATIN_MEDIUM,
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: C.TEXT3,
        },
        actions: {
          flexDirection: 'row',
          gap: SPACE.lg,
          marginLeft: 'auto',
        },
        hit: {
          minWidth: 44,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: RADIUS.pill,
        },
        detail: {
          marginTop: SPACE.md,
          gap: SPACE.lg,
        },
        detailText: {
          fontFamily: FONT_LATIN,
          fontSize: 13,
          marginTop: SPACE.xs,
          lineHeight: 19,
          color: C.TEXT2,
        },
      }),
    [C],
  );

  return (
    <Rule
      first={first}
      onPress={() => onToggleExpand(phrase.id)}
      // The row contains its own Play and Save buttons. Left accessible, the
      // Pressable would collapse them into a single element and a screen-reader
      // user could not reach either — so the row opts out and the text block
      // below carries the focusable expand affordance instead.
      accessible={false}
    >
      {/* writingDirection is set on the Arabic run itself so a mixed
          Arabic/Latin string cannot leak direction into the romanisation
          beneath it. */}
      <Pressable
        onPress={() => onToggleExpand(phrase.id)}
        accessible
        accessibilityRole="button"
        // Romanisation first, then the gloss: romanisation is the authoritative
        // pronunciation channel, and the Arabic script is read by a voice that
        // does not speak Khaleeji. See docs/language/authority.md.
        accessibilityLabel={`${phrase.roman}. ${phrase.english}`}
        accessibilityState={{ expanded }}
      >
        <Text style={styles.arabic}>{phrase.arabic}</Text>
        <Text style={styles.roman}>{phrase.roman}</Text>
        <Text style={styles.english}>{phrase.english}</Text>
      </Pressable>

      <View style={styles.meta}>
        <Text style={styles.label}>{phrase.category}</Text>
        <Text style={styles.label}>{phrase.cefr}</Text>

        {/* These sit inside Rule's Pressable, so the press has to be stopped
            here or it reaches the row and toggles expand as a side effect.
            React Native's responder system already gives the press to the
            innermost view, but React Native Web dispatches real DOM events that
            bubble — without this, tapping Play on web also collapses the phrase
            the user just asked to hear. */}
        <View style={styles.actions}>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onPlay(phrase); }}
            style={styles.hit}
            accessibilityRole="button"
            accessibilityLabel={`${STRINGS.phrases.play}: ${phrase.roman}`}
          >
            <Volume2 size={20} strokeWidth={1.5} color={playing ? C.PRIMARY : C.TEXT3} />
          </Pressable>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onToggleSave(phrase.id); }}
            style={styles.hit}
            accessibilityRole="button"
            accessibilityLabel={`${STRINGS.phrases.save}: ${phrase.roman}`}
            accessibilityState={{ selected: saved }}
          >
            <Bookmark
              size={20}
              strokeWidth={1.5}
              color={saved ? C.PRIMARY : C.TEXT3}
              fill={saved ? C.PRIMARY : 'transparent'}
            />
          </Pressable>
        </View>
      </View>

      {expanded ? (
        <View style={styles.detail}>
          {phrase.pronTip ? (
            <View>
              <Text style={styles.label}>{STRINGS.phrases.pronunciation}</Text>
              <Text style={styles.detailText}>{phrase.pronTip}</Text>
            </View>
          ) : null}
          {phrase.culturalNote ? (
            <View>
              <Text style={styles.label}>{STRINGS.phrases.culturalContext}</Text>
              <Text style={styles.detailText}>{phrase.culturalNote}</Text>
            </View>
          ) : null}
          {expandedExtra}
        </View>
      ) : null}
    </Rule>
  );
}
