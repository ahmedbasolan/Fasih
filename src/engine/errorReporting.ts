/**
 * Which failures are worth reporting.
 *
 * Pure predicate, no React and no Sentry import — same contract as the rest of
 * `src/engine/`. It decides; `src/lib/` acts on the decision.
 */

/**
 * Phrases that mean "the device could not reach the server", across the
 * several layers that produce them: React Native's fetch, Node's socket
 * errors, Supabase's client, and syncService's own wrapper message.
 *
 * Matched as whole phrases rather than single keywords. A filter keyed on the
 * bare word "network" would also swallow "Networking preferences could not be
 * saved" — a real bug, hidden by its own name.
 */
const NETWORK_PHRASES = [
  'network request failed',
  'could not reach the server',
  'network error',
  'request timeout',
  'timed out',
  'econnrefused',
  'econnreset',
  'enotfound',
  'etimedout',
  'no internet',
  'offline',
] as const;

/** Pull a message out of the several shapes a rejection arrives in. */
function messageOf(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e instanceof Error) return e.message;
  // RevenueCat and some native bridges reject with plain objects.
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const m = (e as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return '';
}

/**
 * True when a failure looks like connectivity rather than a defect.
 *
 * A learner on the metro produces the same "Could not reach the server" as a
 * real outage, and this app's users are commuting workers — reporting those
 * would bury the failures worth seeing under normal mobile connectivity, on a
 * free Sentry tier where quota is finite.
 *
 * Fails OPEN: anything it cannot classify is treated as reportable. Under-
 * filtering costs a little noise; over-filtering hides the bug you needed to
 * see, and a silent drop leaves no trace that it happened.
 */
export function isNetworkError(e: unknown): boolean {
  const msg = messageOf(e).toLowerCase();
  if (msg.length === 0) return false;
  return NETWORK_PHRASES.some(p => msg.includes(p));
}
