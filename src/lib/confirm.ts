import { Alert, Platform } from 'react-native';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

/**
 * Ask before a destructive step. Uses the native alert, falling back to
 * window.confirm on web, where Alert.alert with buttons is a silent no-op
 * (the paywall's skip dialog never appears there for that reason).
 */
export function confirmDestructive({ title, message, confirmText, cancelText, onConfirm }: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
