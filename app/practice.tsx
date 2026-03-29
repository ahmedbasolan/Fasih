import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { PracticeScreen } from '../src/screens/PracticeScreen';

export default function PracticeRoute() {
  const recordPhraseReview = useAppStore((s) => s.recordPhraseReview);
  const checkMilestones = useAppStore((s) => s.checkMilestones);

  const handlePhraseReview = (phraseId: string, correct: boolean) => {
    recordPhraseReview(phraseId, correct);
  };

  const handleComplete = () => {
    checkMilestones();
  };

  return (
    <PracticeScreen
      onExit={() => router.back()}
      onPhraseReview={handlePhraseReview}
      onSessionComplete={handleComplete}
    />
  );
}
