import { router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { PhraseLibrary } from '../../src/screens/PhraseLibrary';
import { FeatureGate } from '../../src/components/features/FeatureGate';
import { TabSlideTransition } from './_layout';

export default function LibraryTab() {
  const hasFullAccess = useAppStore((s) => s.hasFullAccess);
  const scenariosCompletedCount = useAppStore((s) => s.scenariosCompletedCount);

  return (
    <TabSlideTransition tabKey="library">
      <FeatureGate
        hasAccess={__DEV__ || hasFullAccess()}
        scenariosCompleted={scenariosCompletedCount()}
        scenariosRequired={3}
        featureName="Phrase Library"
        onGoToScenarios={() => router.push('/(tabs)/scenarios')}
      >
        <PhraseLibrary />
      </FeatureGate>
    </TabSlideTransition>
  );
}
