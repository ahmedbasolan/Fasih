import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useAppStore } from '../../src/store/useAppStore';
import { ScenariosScreen } from '../../src/screens/ScenariosScreen';
import { useTabAnimation } from './_layout';

export default function ScenariosTab() {
  const user = useAppStore((s) => s.user);
  const { direction } = useTabAnimation();

  const content = (
    <ScenariosScreen
      user={user}
      onScenarioSelect={(id) => router.push(`/scenario/${id}`)}
    />
  );

  // Always animate with smooth easing - direction determines slide side
  const slideFrom = direction === 'right' ? 60 : direction === 'left' ? -60 : 0;

  return (
    <MotiView
      key={`scenarios-${direction || 'initial'}`}
      from={{ opacity: 0, translateX: slideFrom }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 450, easing: Easing.out(Easing.cubic) }}
      style={{ flex: 1 }}
    >
      {content}
    </MotiView>
  );
}
