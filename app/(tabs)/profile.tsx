import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useClerk } from '@clerk/expo';
import { useAppStore } from '../../src/store/useAppStore';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { SyncStatusBanner } from '../../src/components/ui/SyncStatusBanner';
import { TabSlideTransition } from './_layout';

export default function ProfileTab() {
  const user = useAppStore((s) => s.user);
  const stats = useAppStore((s) => s.stats);
  const milestones = useAppStore((s) => s.milestones);
  const journal = useAppStore((s) => s.journal);
  const storeSignOut = useAppStore((s) => s.signOut);
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);
  const openCustomerCenter = useAppStore((s) => s.openCustomerCenter);
  const presentPaywall = useAppStore((s) => s.presentPaywall);
  const restorePurchases = useAppStore((s) => s.restorePurchases);
  const { signOut: clerkSignOut } = useClerk();

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      'Your progress is saved in the cloud and will be here when you sign back in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await clerkSignOut();
            await storeSignOut(); // clears RevenueCat + store auth state
            router.replace('/sign-in');
          },
        },
      ],
    );
  };

  return (
    <TabSlideTransition tabKey="profile">
      <View style={{ flex: 1 }}>
        <SyncStatusBanner />
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
      </View>
    </TabSlideTransition>
  );
}
