import { router } from 'expo-router';
import {
  useAppStore,
  useHasFullAccess,
  useScenariosCompletedCount,
} from '../src/store/useAppStore';
import { PracticeScreen } from '../src/screens/PracticeScreen';
import { FeatureGate } from '../src/components/features/FeatureGate';
import { STRINGS } from '../src/constants/strings';

export default function PracticeRoute() {
  const recordPhraseReview = useAppStore((s) => s.recordPhraseReview);
  const recordPhraseRating = useAppStore((s) => s.recordPhraseRating);
  const checkMilestones = useAppStore((s) => s.checkMilestones);
  // Subscribing hooks — see the note in app/(tabs)/library.tsx.
  const hasAccess = useHasFullAccess();
  const scenariosCompleted = useScenariosCompletedCount();

  return (
    <FeatureGate
      hasAccess={hasAccess}
      scenariosCompleted={scenariosCompleted}
      scenariosRequired={3}
      featureName={STRINGS.practice.title}
      onGoToScenarios={() => router.replace('/(tabs)/scenarios')}
    >
      <PracticeScreen
        onExit={() => router.back()}
        onPhraseReview={recordPhraseReview}
        onPhraseRating={recordPhraseRating}
        onSessionComplete={checkMilestones}
      />
    </FeatureGate>
  );
}
