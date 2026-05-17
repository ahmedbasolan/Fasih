import { Alert } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useClerk } from '@clerk/expo';
import { useAppStore } from '../../src/store/useAppStore';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { useTabAnimation } from './_layout';

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
  const { direction } = useTabAnimation();

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

  const content = (
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

  // Always animate with smooth easing - direction determines slide side
  const slideFrom = direction === 'right' ? 60 : direction === 'left' ? -60 : 0;

  return (
    <MotiView
      key={`profile-${direction || 'initial'}`}
      from={{ opacity: 0, translateX: slideFrom }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 450, easing: Easing.out(Easing.cubic) }}
      style={{ flex: 1 }}
    >
      {content}
    </MotiView>
  );
}
