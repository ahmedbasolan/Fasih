/**
 * When to push.
 *
 * Replaces `scheduleSync(() => get().syncToCloud())`, which was hand-appended
 * after 19 separate mutations. "Which mutations push" was remembered, not
 * declared, and forgetting one was silent. The store now subscribes once and
 * lets `FIELD_POLICY` answer the question.
 *
 * Only the timing lives here. *What* gets pushed, and whether a push would be a
 * no-op, is `src/engine/syncedProgress.ts`'s business. Dependencies are
 * injected so this is testable with fake timers and no store.
 *
 * ─── Arming ─────────────────────────────────────────────────────────────────
 * A scheduler starts disarmed and stays that way until `arm()`.
 *
 * This is not a nicety. `persist` rehydrates from AsyncStorage asynchronously
 * and applies it with `set()`, which changes synced keys and would fire the
 * subscriber. On a device with less local data than the cloud has, that pushes
 * a thin row over good data *before* the first pull has run — and the pull then
 * merges against the row it just clobbered. The store arms only once hydration
 * has happened and the first `syncFromCloud` has settled.
 */

export interface SyncScheduler {
  /** Start reacting to changes. Idempotent. */
  arm(): void;
  /** Stop, and drop any pending push. Called on sign-out and account deletion. */
  disarm(): void;
  armed(): boolean;
  /** A synced field changed. Debounces, or pushes now when `urgent`. */
  note(urgent: boolean): void;
  /** Push any pending change immediately. Used on app foreground. */
  flush(): void;
}

export interface SyncSchedulerOptions {
  push: () => void | Promise<void>;
  /** Batches rapid mutations — rating several cards is one push, not five. */
  debounceMs?: number;
}

export function createSyncScheduler({
  push,
  debounceMs = 1500,
}: SyncSchedulerOptions): SyncScheduler {
  let armed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const fire = () => {
    clear();
    void push();
  };

  return {
    arm() {
      armed = true;
    },

    disarm() {
      armed = false;
      clear();
    },

    armed() {
      return armed;
    },

    note(urgent: boolean) {
      if (!armed) return;
      // Subscription state costs money to get wrong: a purchase that fails to
      // reach the cloud is someone who paid and stayed locked out.
      if (urgent) {
        fire();
        return;
      }
      clear();
      timer = setTimeout(fire, debounceMs);
    },

    flush() {
      if (!armed) return;
      fire();
    },
  };
}
