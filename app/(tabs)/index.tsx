import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { HomeScreenNew } from '../../src/screens/HomeScreenNew';
import { useAppStore } from '../../src/store/useAppStore';
import { useTabAnimation } from './_layout';

export default function HomeTab() {
  const user = useAppStore((s) => s.user);
  const { direction } = useTabAnimation();

  const content = (
    <HomeScreenNew
      userName={user?.name || 'there'}
      onSettingsPress={() => router.push('/profile')}
      onMissionPress={(id) => router.push(`/scenario/${id}`)}
    />
  );

  // Always animate with smooth easing - direction determines slide side
  const slideFrom = direction === 'right' ? 60 : direction === 'left' ? -60 : 0;

  return (
    <MotiView
      key={`home-${direction || 'initial'}`}
      from={{ opacity: 0, translateX: slideFrom }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 450, easing: Easing.out(Easing.cubic) }}
      style={{ flex: 1 }}
    >
      {content}
    </MotiView>
  );
}
