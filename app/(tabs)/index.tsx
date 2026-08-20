import { router } from 'expo-router';
import { HomeScreenNew } from '../../src/screens/HomeScreenNew';
import { useAppStore } from '../../src/store/useAppStore';

export default function HomeTab() {
  const user = useAppStore((s) => s.user);

  return (
    <HomeScreenNew
      userName={user?.name || 'there'}
      onSettingsPress={() => router.push('/profile')}
      onMissionPress={(id) => router.push(`/scenario/${id}`)}
    />
  );
}