import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Centralized haptic feedback helper.
 * Provides consistent tactile responses across iOS and Android.
 */
export const haptic = {
  /** Light impact tap for buttons, chips, and selection toggles */
  light: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },

  /** Medium impact tap for scenario option picks and primary CTAs */
  medium: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  },

  /** Heavy impact tap for milestones and streak activations */
  heavy: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  },

  /** Selection click for tab bar taps and list scrolling */
  selection: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.selectionAsync().catch(() => {});
    }
  },

  /** Success notification burst for scenario completion & streak rewards */
  success: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  },

  /** Error notification for invalid input or streak warning */
  error: () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  },
};
