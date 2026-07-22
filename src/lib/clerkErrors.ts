import { STRINGS } from '../constants/strings';

interface ClerkLikeError {
  code?: string;
  longMessage?: string;
  message?: string;
}

/**
 * Clerk's own rate limits (5 requests/10s on sign-in/sign-up creation,
 * 3 requests/10s on verification) surface as an error with code
 * 'too_many_requests' — show a distinct message for that instead of
 * relaying Clerk's raw text, since users have no context for it otherwise.
 */
export function getClerkErrorMessage(
  error: ClerkLikeError | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;
  if (error.code === 'too_many_requests') return STRINGS.auth.rateLimited;
  return error.longMessage ?? error.message ?? fallback;
}
