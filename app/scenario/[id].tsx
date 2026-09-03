import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { MotiView } from 'moti';
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
    // finalizeScenario (called inside ScenarioPlayer) already wrote completedScenarios,
    // and ScenarioPlayer already fires trackScenarioCompleted itself with the real
    // title/scene count — this route only needs to check milestones and dismiss the player.
    checkMilestones();
    setShowPlayer(false);
  };

  const handleJournal = (arabic: string, english: string, insight: string) => {
    addJournalEntry({ arabic, english, insight, source: 'scenario', sourceId: id as string });
  };

  if (showPlayer) {
    return (
      <MotiView
        key="scenario-player"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 280 }}
        style={{ flex: 1 }}
      >
        <ScenarioPlayer
          scenarioId={id as string}
          user={user}
          onExit={() => {
            // ScenarioPlayer already fires trackScenarioAbandoned itself, with the
            // real current scene id, before calling this.
            setShowPlayer(false);
          }}
          onComplete={handleComplete}
          onJournalEntry={handleJournal}
        />
      </MotiView>
    );
  }

  return (
    <ScenarioDetailScreen
      scenarioId={id as string}
      onBack={() => router.back()}
      onSceneSelect={() => {
        // ScenarioPlayer fires trackScenarioStarted itself, with the real title,
        // once the player actually begins (not just when a scene row is tapped).
        setShowPlayer(true);
      }}
    />
  );
}
