/**
 * Fasih push-notification service.
 *
 * All notification scheduling is local (expo-notifications).
 * No push server required — notifications fire entirely on-device.
 *
 * Smart timing: the app tracks which hour users typically open Fasih,
 * then schedules daily reminders at that hour instead of a fixed time.
 *
 * Notification types:
 *   1. Daily streak reminder   — fires every day at the user's preferred hour
 *   2. Phrase review reminder  — fires when SRS cards are due (same timing)
 *   3. Re-engagement           — fires after 3 or 7 days of inactivity
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isStreakAtRisk } from '../engine/streakEngine';
import { todayISO } from '../engine/srsEngine';
import { STRINGS } from '../constants/strings';

// ─── Config ───────────────────────────────────────────────────────────────────

/** Default hour (9 AM local) when no session history is available yet. */
const DEFAULT_REMINDER_HOUR = 9;

/** Clamp notification hour to a reasonable range (8 AM – 9 PM). */
const MIN_HOUR = 8;
const MAX_HOUR = 21;

/** Notification channel ID (Android). */
const CHANNEL_ID = 'fasih-reminders';

/** Identifiers used to cancel/replace existing scheduled notifications. */
export const NOTIFICATION_IDS = {
  dailyStreak: 'fasih-daily-streak',
  reEngagement3d: 'fasih-reengagement-3d',
  reEngagement7d: 'fasih-reengagement-7d',
  streakRisk: 'fasih-streak-risk',
} as const;

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Configure the notification handler and Android channel.
 * Call once at app startup (before requesting permission).
 */
export function setupNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/**
 * Request notification permission from the user.
 * Returns true if granted, false if denied or unsupported.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  if (existing === 'denied') return false; // user explicitly denied — don't re-prompt

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Smart timing ─────────────────────────────────────────────────────────────

/**
 * Derive the user's preferred reminder hour from their session history.
 *
 * Algorithm: take the mode (most frequent hour) of the last N sessions.
 * Falls back to DEFAULT_REMINDER_HOUR when history is empty.
 * Clamped to MIN_HOUR–MAX_HOUR so we never notify at 3 AM.
 */
export function derivePreferredHour(recentSessionHours: number[]): number {
  if (recentSessionHours.length === 0) return DEFAULT_REMINDER_HOUR;

  // Count frequency of each hour
  const freq: Record<number, number> = {};
  for (const h of recentSessionHours) {
    freq[h] = (freq[h] ?? 0) + 1;
  }

  // Pick the most common hour
  let bestHour = DEFAULT_REMINDER_HOUR;
  let bestCount = 0;
  for (const [h, count] of Object.entries(freq)) {
    if (count > bestCount) {
      bestCount = count;
      bestHour = Number(h);
    }
  }

  return Math.min(Math.max(bestHour, MIN_HOUR), MAX_HOUR);
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

/**
 * Schedule (or reschedule) the daily streak + review reminder.
 * Cancels any existing daily reminder first, then creates a new one
 * at the given local hour, repeating every day.
 *
 * @param hour Local hour (0–23). Use derivePreferredHour() to get a smart value.
 * @param streakCount Current streak — used to personalise the message.
 * @param dueCount Number of SRS cards due today.
 */
export async function scheduleDailyReminder(
  hour: number,
  streakCount: number,
  dueCount: number,
): Promise<void> {
  // Cancel existing so we don't stack duplicates
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.dailyStreak).catch(() => {});

  const body = buildDailyBody(streakCount, dueCount);

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.dailyStreak,
    content: {
      title: 'يلا! 🇦🇪',
      body,
      sound: false,
      data: { type: 'daily_streak' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
}

/**
 * Schedule a one-shot re-engagement notification after N days of inactivity.
 * Call this when the app opens if the user hasn't been active for 2 days.
 */
export async function scheduleReEngagementIfNeeded(
  lastActiveDateISO: string | null,
  userName: string,
): Promise<void> {
  if (!lastActiveDateISO) return;

  const lastActive = new Date(lastActiveDateISO);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  // Cancel any previous re-engagement notifications
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.reEngagement3d).catch(() => {}),
    Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.reEngagement7d).catch(() => {}),
  ]);

  const name = userName || 'there';

  // Schedule D3 re-engagement (fires 3 days from last session)
  if (daysSince < 3) {
    const d3Date = new Date(lastActive);
    d3Date.setDate(d3Date.getDate() + 3);
    d3Date.setHours(DEFAULT_REMINDER_HOUR, 0, 0, 0);

    if (d3Date > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.reEngagement3d,
        content: {
          title: `Missing you, ${name}!`,
          body: 'Your Gulf Arabic is waiting. Just 5 minutes today keeps the streak alive. 🌙',
          sound: false,
          data: { type: 're_engagement_3d' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: d3Date,
        },
      });
    }
  }

  // Schedule D7 re-engagement (fires 7 days from last session)
  if (daysSince < 7) {
    const d7Date = new Date(lastActive);
    d7Date.setDate(d7Date.getDate() + 7);
    d7Date.setHours(DEFAULT_REMINDER_HOUR, 0, 0, 0);

    if (d7Date > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.reEngagement7d,
        content: {
          title: 'الأسبوع مر! 😮',
          body: `A whole week, ${name}. Come back — your scenarios are waiting. 🦊`,
          sound: false,
          data: { type: 're_engagement_7d' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: d7Date,
        },
      });
    }
  }
}

/**
 * Schedule a one-shot "streak at risk" notification for tonight.
 * Mirrors scheduleReEngagementIfNeeded's reschedule-on-every-open pattern —
 * cancelled and recomputed on every app open so it never fires once the
 * user has already practiced today.
 */
export async function scheduleStreakRiskIfNeeded(
  lastActiveDateISO: string | null,
  currentStreak: number,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDS.streakRisk).catch(() => {});

  if (!isStreakAtRisk(currentStreak, lastActiveDateISO, todayISO())) return;

  const now = new Date();
  const fireDate = new Date(now);
  fireDate.setHours(20, 0, 0, 0);
  if (fireDate <= now) {
    fireDate.setTime(now.getTime() + 30 * 60 * 1000); // already past 8 PM — fire in 30 min
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.streakRisk,
    content: {
      title: STRINGS.streakRisk.notificationTitle(currentStreak),
      body: STRINGS.streakRisk.notificationBody,
      sound: false,
      data: { type: 'streak_risk' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
    },
  });
}

/** Cancel all Fasih notifications (e.g. on sign-out). */
export async function cancelAllNotifications(): Promise<void> {
  await Promise.all(
    Object.values(NOTIFICATION_IDS).map(id =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}

// ─── Message builder ──────────────────────────────────────────────────────────

function buildDailyBody(streak: number, dueCount: number): string {
  if (streak >= 7 && dueCount > 0)
    return `${streak} day streak 🔥 + ${dueCount} phrase${dueCount > 1 ? 's' : ''} due. Keep it up!`;
  if (streak >= 3)
    return `${streak} days in a row 🔥 Keep your Gulf Arabic sharp.`;
  if (dueCount > 0)
    return `${dueCount} phrase${dueCount > 1 ? 's' : ''} ready for review. 5 minutes is enough.`;
  return 'Time for a quick Gulf Arabic session. يلا! 🇦🇪';
}
