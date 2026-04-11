import { router } from 'expo-router';
import { useAppStore } from '../../src/store/useAppStore';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function ProfileTab() {
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const milestones = useAppStore((s) => s.milestones);
  const journal = useAppStore((s) => s.journal);
  const signOut = useAppStore((s) => s.signOut);
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);
  const openCustomerCenter = useAppStore((s) => s.openCustomerCenter);
  const presentPaywall = useAppStore((s) => s.presentPaywall);
  const restorePurchases = useAppStore((s) => s.restorePurchases);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <ProfileScreen
      user={user}
      stats={stats}
      milestones={milestones}
      journal={journal}
      subscriptionStatus={subscriptionStatus}
      onSignOut={handleSignOut}
      onManageSubscription={openCustomerCenter}
      onUpgrade={async () => { await presentPaywall(); }}
      onRestorePurchases={async () => { await restorePurchases(); }}
    />
  );
}
