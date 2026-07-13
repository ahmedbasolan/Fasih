import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react-native';
import { FONT_LATIN, FONT_LATIN_SEMI } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/useAppStore';

/**
 * Non-blocking banner that surfaces cloud sync status.
 *
 * Shows:
 *  - Nothing (success state, recently synced)
 *  - A dismissable error banner when lastSyncError is set
 *  - A brief "synced" confirmation after a successful sync (auto-hides after 3s)
 *
 * Mount this once near the top of each main tab screen.
 * It reads sync state from the store directly — no props needed.
 */
export function SyncStatusBanner() {
  const { C } = useTheme();
  const isSyncing = useAppStore((s) => s.isSyncing);
  const lastSyncError = useAppStore((s) => s.lastSyncError);
  const dismissSyncError = useAppStore((s) => s.dismissSyncError);
  const syncToCloud = useAppStore((s) => s.syncToCloud);

  // Only show when there's an error to surface
  const visible = !!lastSyncError;

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -8 }}
          transition={{ type: 'timing', duration: 260 }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: `${C.ERROR}14`,
            borderWidth: 1,
            borderColor: `${C.ERROR}30`,
            borderRadius: 14,
            marginHorizontal: 16,
            marginBottom: 8,
          }}>
            <WifiOff size={14} color={C.ERROR} />
            <Text
              style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, flex: 1, lineHeight: 18 }}
              numberOfLines={2}
            >
              Progress couldn't sync.{' '}
              <Text style={{ color: C.ERROR }}>Your data is safe locally.</Text>
            </Text>

            {/* Retry */}
            <Pressable
              onPress={() => void syncToCloud()}
              disabled={isSyncing}
              accessibilityRole="button"
              accessibilityLabel="Retry sync"
              style={{ padding: 6 }}
            >
              <RefreshCw
                size={14}
                color={isSyncing ? C.TEXT3 : C.TEXT2}
                style={isSyncing ? { opacity: 0.4 } : undefined}
              />
            </Pressable>

            {/* Dismiss */}
            <Pressable
              onPress={dismissSyncError}
              accessibilityRole="button"
              accessibilityLabel="Dismiss sync error"
              style={{ padding: 6 }}
            >
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.TEXT3 }}>✕</Text>
            </Pressable>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

/**
 * Small inline badge shown after a successful sync (e.g. in ProfileScreen).
 * Auto-hides after 3 seconds.
 */
export function SyncSuccessBadge() {
  const { C } = useTheme();
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const [visible, setVisible] = React.useState(false);
  const prevSyncedAt = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (lastSyncedAt && lastSyncedAt !== prevSyncedAt.current) {
      prevSyncedAt.current = lastSyncedAt;
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [lastSyncedAt]);

  if (!visible) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'timing', duration: 200 }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
    >
      <CheckCircle size={12} color={C.JADE2} />
      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.JADE2 }}>Synced</Text>
    </MotiView>
  );
}
