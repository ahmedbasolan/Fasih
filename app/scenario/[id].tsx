import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenarioPlayer } from '../../src/screens/ScenarioPlayer';

export default function ScenarioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAppStore((s) => s.user);
  const completeScenario = useAppStore((s) => s.completeScenario);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const checkMilestones = useAppStore((s) => s.checkMilestones);

  const handleComplete = (scenarioId: string, endingType: string) => {
    completeScenario(scenarioId, endingType);
    checkMilestones();
  };

  const handleJournal = (arabic: string, english: string, insight: string) => {
    addJournalEntry({ arabic, english, insight, source: 'scenario', sourceId: id as string });
  };

  return (
    <ScenarioPlayer
      scenarioId={id as string}
      user={user}
      onExit={() => router.back()}
      onComplete={handleComplete}
      onJournalEntry={handleJournal}
    />
  );
}
