import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenarioPlayer } from '../../src/screens/ScenarioPlayer';
import { ScenarioDetailScreen } from '../../src/screens/ScenarioDetailScreen';
import { trackScenarioStarted, trackScenarioCompleted, trackScenarioAbandoned } from '../../src/lib/analytics';

export default function ScenarioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showPlayer, setShowPlayer] = useState(false);
  
  const user = useAppStore((s) => s.user);
  const addJournalEntry = useAppStore((s) => s.addJournalEntry);
  const checkMilestones = useAppStore((s) => s.checkMilestones);

  const handleComplete = (scenarioId: string, endingType: string) => {
    // finalizeScenario (called inside ScenarioPlayer) already wrote completedScenarios.
    // We only need to check milestones and dismiss the player here.
    checkMilestones();
    trackScenarioCompleted({
      scenarioId,
      title: scenarioId,
      endingType,
      endingId: endingType,
      sceneCount: 0,
    });
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
        onExit={() => {
          trackScenarioAbandoned({ scenarioId: id as string, sceneId: '' });
          setShowPlayer(false);
        }}
        onComplete={handleComplete}
        onJournalEntry={handleJournal}
      />
    );
  }

  return (
    <ScenarioDetailScreen
      scenarioId={id as string}
      onBack={() => router.back()}
      onSceneSelect={() => {
        trackScenarioStarted({ scenarioId: id as string, title: id as string });
        setShowPlayer(true);
      }}
    />
  );
}
