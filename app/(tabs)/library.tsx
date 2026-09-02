import { router } from 'expo-router';
import { useHasFullAccess, useScenariosCompletedCount } from '../../src/store/useAppStore';
import { PhraseLibrary } from '../../src/screens/PhraseLibrary';
import { FeatureGate } from '../../src/components/features/FeatureGate';
import { STRINGS } from '../../src/constants/strings';

export default function LibraryTab() {
  // These hooks subscribe to the state the access rules read. Selecting the
  // store getter instead (`useAppStore(s => s.hasFullAccess)`) subscribes to a
  // function identity that never changes, which left this tab frozen at its
  // first-mount answer — and because tab screens stay mounted, the library
  // never unlocked after the third scenario until the app was restarted.
  const hasAccess = useHasFullAccess();
  const scenariosCompleted = useScenariosCompletedCount();

  return (
    <FeatureGate
      hasAccess={hasAccess}
      scenariosCompleted={scenariosCompleted}
      scenariosRequired={3}
      featureName={STRINGS.phrases.title}
      onGoToScenarios={() => router.push('/(tabs)/scenarios')}
    >
      <PhraseLibrary />
    </FeatureGate>
  );
}
