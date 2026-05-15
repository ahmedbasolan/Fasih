import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenarioPlayer } from '../../src/screens/ScenarioPlayer';
import { ScenarioDetailScreen } from '../../src/screens/ScenarioDetailScreen';

export default function ScenarioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showPlayer, setShowPlayer] = useState(false);
  
  const user = useAppStore((s) => s.user);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const checkMilestones = useAppStore((s) => s.checkMilestones);

  const handleComplete = (_scenarioId: string, _endingType: string) => {
    // finalizeScenario (called inside ScenarioPlayer) already wrote completedScenarios.
    // We only need to check milestones and dismiss the player here.
    checkMilestones();
    setShowPlayer(false);
  };

  const handleJournal = (arabic: string, english: string, insight: string) => {
    addJournalEntry({ arabic, english, insight, source: 'scenario', sourceId: id as string });
  };

  if (showPlayer) {
    return (
      <ScenarioPlayer
        scenarioId={id as string}
        user={user}
        onExit={() => setShowPlayer(false)}
        onComplete={handleComplete}
        onJournalEntry={handleJournal}
      />
    );
  }

  return (
    <ScenarioDetailScreen
      scenarioId={id as string}
      onBack={() => router.back()}
      onSceneSelect={() => setShowPlayer(true)}
    />
  );
}
