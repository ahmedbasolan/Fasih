import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, FadeIn } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import { FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_HEADING_SEMI } from '../design/tokens';

interface PhraseBuilderProps {
  english: string;
  arabic: string;
  wordTiles?: string[];
  onComplete: (correct: boolean) => void;
}

interface TileProps {
  word: string;
  id: string;
  isPlaced: boolean;
  onTap: (id: string) => void;
  colorPrimary: string;
  colorBg: string;
}

function DraggableTile({ word, id, isPlaced, onTap, colorPrimary, colorBg }: TileProps) {
  // We use a simple tap-to-place mechanic here as a fallback baseline, 
  // but wrap it in GestureDetector to allow drag & drop "swipe up" to place.
  const offsetY = useSharedValue(0);
  const offsetX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      offsetX.value = e.translationX;
      offsetY.value = e.translationY;
    })
    .onEnd((e) => {
      // If swiped up or dragged into the answer zone (negative Y)
      if (e.translationY < -50 || e.velocityY < -500) {
        runOnJS(onTap)(id);
      } else if (e.translationY > 50 || e.velocityY > 500) {
        // swipe down (remove)
        runOnJS(onTap)(id);
      }
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value }
      ],
      zIndex: offsetY.value !== 0 ? 100 : 1,
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <Pressable 
          onPress={() => onTap(id)}
          style={[styles.tile, { backgroundColor: colorBg, borderColor: colorPrimary }]}
        >
          <Text style={[styles.tileText, { color: colorPrimary }]}>{word}</Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function PhraseBuilder({ english, arabic, wordTiles, onComplete }: PhraseBuilderProps) {
  const { C } = useTheme();
  
  // Create unique IDs for words in case of duplicates
  const fallbackTiles = arabic.split(' ').filter(w => w.trim().length > 0);
  const initialTiles = (wordTiles && wordTiles.length > 0 ? wordTiles : fallbackTiles).map((w, i) => ({ id: `w-${i}-${w}`, word: w }));
  
  // Shuffle words for bank
  const [bank, setBank] = useState(() => {
    const arr = [...initialTiles];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  
  const [placed, setPlaced] = useState<typeof initialTiles>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleTileTap = (id: string) => {
    if (hasChecked) return; // Locked
    
    const inBank = bank.find(t => t.id === id);
    if (inBank) {
      setBank(prev => prev.filter(t => t.id !== id));
      setPlaced(prev => [...prev, inBank]);
      return;
    }
    
    const inPlaced = placed.find(t => t.id === id);
    if (inPlaced) {
      setPlaced(prev => prev.filter(t => t.id !== id));
      setBank(prev => [...prev, inPlaced]);
    }
  };

  const handleCheck = () => {
    // Reconstruct Arabic string from placed tiles in order
    // Because Arabic is RTL, when they place words [A, B], it renders A B visually 
    // Wait, array order: 0th element should be the first word (rightmost in Arabic).
    const constructed = placed.map(t => t.word).join(' ');
    const correct = constructed === arabic;
    setIsCorrect(correct);
    setHasChecked(true);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={[styles.promptLabel, { color: C.TEXT3 }]}>Translate this phrase</Text>
        <Text style={[styles.promptText, { color: C.TEXT }]}>{english}</Text>
      </View>

      <Text style={[styles.instruction, { color: C.TEXT3 }]}>Support Drag & Drop or Tap</Text>

      {/* Answer Area */}
      <View style={[styles.answerArea, { backgroundColor: C.SURFACE2, borderColor: C.BORDER }]}>
        {placed.map((t) => (
          <Animated.View key={t.id} entering={FadeIn.duration(200)}>
            <DraggableTile 
              {...t} 
              isPlaced={true} 
              onTap={handleTileTap} 
              colorPrimary={C.JADE_ACCENT} 
              colorBg={C.GOLD_SURFACE} 
            />
          </Animated.View>
        ))}
      </View>

      {/* Word Bank */}
      <View style={styles.bankArea}>
        {bank.map((t) => (
          <Animated.View key={t.id} entering={FadeIn.duration(200)}>
             <DraggableTile 
              {...t} 
              isPlaced={false} 
              onTap={handleTileTap} 
              colorPrimary={C.TEXT2} 
              colorBg={C.SURFACE} 
            />
          </Animated.View>
        ))}
      </View>

      {/* Bottom Check / Next action */}
      <View style={styles.footer}>
        {!hasChecked ? (
          <Pressable 
            onPress={handleCheck}
            disabled={placed.length !== initialTiles.length}
            style={[styles.checkBtn, { backgroundColor: placed.length === initialTiles.length ? C.JADE2 : C.SURFACE, borderColor: placed.length === initialTiles.length ? C.JADE2 : C.BORDER }]}
          >
            <Text style={[styles.checkBtnText, { color: placed.length === initialTiles.length ? C.BG : C.TEXT3 }]}>Check</Text>
          </Pressable>
        ) : (
          <View style={[styles.resultCard, { backgroundColor: isCorrect ? C.JADE_SURFACE : C.ERROR_SURFACE }]}>
             <Text style={[styles.resultText, { color: isCorrect ? C.JADE2 : C.ERROR }]}>
               {isCorrect ? 'Excellent!' : 'Correct solution:'}
             </Text>
             {!isCorrect && (
               <Text style={[styles.correctArabic, { color: C.ERROR }]}>{arabic}</Text>
             )}
             <Pressable 
               onPress={() => onComplete(isCorrect)}
               style={[styles.nextBtn, { backgroundColor: isCorrect ? C.JADE2 : C.ERROR }]}
             >
               <Text style={styles.nextBtnText}>Continue</Text>
             </Pressable>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  promptContainer: { marginBottom: 24 },
  promptLabel: { fontFamily: FONT_LATIN_SEMI, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  promptText: { fontFamily: FONT_HEADING_SEMI, fontSize: 20, lineHeight: 28 },
  instruction: { fontFamily: FONT_LATIN, fontSize: 11, textAlign: 'center', marginBottom: 12, opacity: 0.7 },
  
  // RTL layout for Arabic phrasing
  answerArea: { 
    minHeight: 120, 
    borderRadius: 20, 
    borderWidth: 2, 
    borderStyle: 'dashed',
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    padding: 16, 
    gap: 12,
    marginBottom: 32,
    direction: 'rtl'
  },
  
  bankArea: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 12,
    direction: 'rtl'
  },
  
  tile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#02B986',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tileText: { fontFamily: FONT_ARABIC_BLACK, fontSize: 22, textAlign: 'center' },
  
  footer: { marginTop: 'auto', paddingTop: 20 },
  checkBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  checkBtnText: { fontFamily: FONT_HEADING_SEMI, fontSize: 16 },
  
  resultCard: { padding: 20, borderRadius: 16, gap: 12 },
  resultText: { fontFamily: FONT_LATIN_BOLD, fontSize: 16 },
  correctArabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 24, textAlign: 'right' },
  nextBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  nextBtnText: { fontFamily: FONT_HEADING_SEMI, fontSize: 16, color: '#fff' }
});
