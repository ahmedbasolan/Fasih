import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { PracticeScreen } from '../src/screens/PracticeScreen';
import { FeatureGate } from '../src/components/features/FeatureGate';

export default function PracticeRoute() {
  const recordPhraseReview = useAppStore((s) => s.recordPhraseReview);
  const recordPhraseRating = useAppStore((s) => s.recordPhraseRating);
  const checkMilestones = useAppStore((s) => s.checkMilestones);
  const hasFullAccess = useAppStore((s) => s.hasFullAccess);
  const scenariosCompletedCount = useAppStore((s) => s.scenariosCompletedCount);

  const handlePhraseReview = (phraseId: string, correct: boolean) => {
    recordPhraseReview(phraseId, correct);
  };

  const handlePhraseRating = (phraseId: string, rating: 'new' | 'learning' | 'knew') => {
    recordPhraseRating(phraseId, rating);
  };

  const handleComplete = () => {
    checkMilestones();
  };

  return (
    <FeatureGate
      hasAccess={hasFullAccess()}
      scenariosCompleted={scenariosCompletedCount()}
      scenariosRequired={3}
      featureName="Practice"
      onGoToScenarios={() => router.replace('/(tabs)/scenarios')}
    >
      <PracticeScreen
        onExit={() => router.back()}
        onPhraseReview={handlePhraseReview}
        onPhraseRating={handlePhraseRating}
        onSessionComplete={handleComplete}
      />
    </FeatureGate>
  );
}
