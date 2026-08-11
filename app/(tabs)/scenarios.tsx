import { router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenariosScreen } from '../../src/screens/ScenariosScreen';
import { TabSlideTransition } from './_layout';

export default function ScenariosTab() {
  const user = useAppStore((s) => s.user);

  return (
    <TabSlideTransition tabKey="scenarios">
      <ScenariosScreen
        user={user}
        onScenarioSelect={(id) => router.push(`/scenario/${id}`)}
      />
    </TabSlideTransition>
  );
}
