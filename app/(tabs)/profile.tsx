import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useClerk, useUser } from '@clerk/expo';
import { useAppStore } from '../../src/store/useAppStore';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import { SyncStatusBanner } from '../../src/components/ui/SyncStatusBanner';
import { STRINGS } from '../../src/constants/strings';

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
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const { signOut: clerkSignOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  const D = STRINGS.profile.deleteAccount;

  const handleDeleteAccount = () => {
    if (__DEV__ && clerkUser && !clerkUser.deleteSelfEnabled) {
      console.warn(
        '⚠️ Clerk self-deletion is disabled — enable "Allow users to delete their account" in the Clerk Dashboard, or user.delete() will always fail.',
      );
    }

    Alert.alert(
      D.title,
      subscriptionStatus === 'subscribed' ? D.message + D.subscriptionWarning : D.message,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: D.confirm,
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              // 1. Cloud data first. The delete_my_account() RPC authenticates
              //    with the live Clerk session token, so this only works while
              //    the account still exists. If it fails, abort completely —
              //    never tell someone their data is gone when it isn't.
              const { error } = await deleteAccount();
              if (error) {
                Alert.alert(D.failedTitle, D.failedMessage(error));
                return;
              }

              // 2. Data is provably gone — now remove the account itself.
              try {
                if (!clerkUser) throw new Error('No Clerk user');
                await clerkUser.delete();
              } catch {
                // The data is already erased, so leaving them signed in to a
                // hollow account would be worse than signing out and saying
                // plainly what happened.
                Alert.alert(D.partialTitle, D.partialMessage);
              }

              router.replace('/sign-in');
            } finally {
              setIsDeletingAccount(false);
            }
          },
        },
      ],
    );
  };

  return (
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
        onDeleteAccount={handleDeleteAccount}
        isDeletingAccount={isDeletingAccount}
      />
    </View>
  );
}
