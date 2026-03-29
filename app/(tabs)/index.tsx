import { router } from 'expo-router';
import { HomeScreen } from '../../src/screens/HomeScreen';
import { useAppStore } from '../../src/store/useAppStore';

export default function HomeTab() {
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const getDueReviews = useAppStore((s) => s.getDueReviews);
  const dueReviewCount = getDueReviews().length;

  return (
    <HomeScreen
      user={user}
      stats={stats}
      dueReviewCount={dueReviewCount}
      onScenarioSelect={(id) => router.push(`/scenario/${id}`)}
      onPractice={() => router.push('/practice')}
    />
  );
}
