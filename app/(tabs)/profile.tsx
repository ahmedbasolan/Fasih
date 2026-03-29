import { router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const milestones = useAppStore((s) => s.milestones);
  const journal = useAppStore((s) => s.journal);
  const signOut = useAppStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return <ProfileScreen user={user} stats={stats} milestones={milestones} journal={journal} onSignOut={handleSignOut} />;
}
