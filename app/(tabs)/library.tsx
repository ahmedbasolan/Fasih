import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useAppStore } from '../../src/store/useAppStore';
import { PhraseLibrary } from '../../src/screens/PhraseLibrary';
import { FeatureGate } from '../../src/components/features/FeatureGate';
import { useTabAnimation } from './_layout';

export default function LibraryTab() {
  const hasFullAccess = useAppStore((s) => s.hasFullAccess);
  const scenariosCompletedCount = useAppStore((s) => s.scenariosCompletedCount);
  const { direction } = useTabAnimation();

  const content = (
    <FeatureGate
      hasAccess={__DEV__ || hasFullAccess()}
      scenariosCompleted={scenariosCompletedCount()}
      scenariosRequired={3}
      featureName="Phrase Library"
      onGoToScenarios={() => router.push('/(tabs)/scenarios')}
    >
      <PhraseLibrary />
    </FeatureGate>
  );

  // Always animate with smooth easing - direction determines slide side
  const slideFrom = direction === 'right' ? 60 : direction === 'left' ? -60 : 0;

  return (
    <MotiView
      key={`library-${direction || 'initial'}`}
      from={{ opacity: 0, translateX: slideFrom }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 450, easing: Easing.out(Easing.cubic) }}
      style={{ flex: 1 }}
    >
      {content}
    </MotiView>
  );
}
