import { router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenariosScreen } from '../../src/screens/ScenariosScreen';

export default function ScenariosTab() {
  const user = useAppStore((s) => s.user);
  return (
    <ScenariosScreen
      user={user}
      onScenarioSelect={(id) => router.push(`/scenario/${id}`)}
    />
  );
}
