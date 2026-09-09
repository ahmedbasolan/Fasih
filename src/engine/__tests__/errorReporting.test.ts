import { isNetworkError } from '../errorReporting';

describe('isNetworkError', () => {
  it('matches the fetch failure React Native throws when offline', () => {
    // This is the exact message RN's fetch produces with no connectivity, and
    // it is the single most common one this filter exists to swallow.
    expect(isNetworkError(new TypeError('Network request failed'))).toBe(true);
  });

  it("matches syncService's own unreachable-server message", () => {
    // syncService catches and rethrows/returns this string itself, so the
    // filter has to know it or the wrapper leaks past the raw cause.
    expect(isNetworkError(new Error('Could not reach the server'))).toBe(true);
  });

  it('matches timeouts and DNS or connection refusals', () => {
    expect(isNetworkError(new Error('Request timeout'))).toBe(true);
    expect(isNetworkError(new Error('connect ECONNREFUSED 127.0.0.1:54321'))).toBe(true);
    expect(isNetworkError(new Error('getaddrinfo ENOTFOUND supabase.co'))).toBe(true);
  });

  it('is case-insensitive, because these strings come from several layers', () => {
    expect(isNetworkError(new Error('NETWORK REQUEST FAILED'))).toBe(true);
  });

  it('does NOT match a real application failure', () => {
    // The whole point. A purchase that failed for a payment reason, or a
    // Postgres error, must still reach Sentry.
    expect(isNetworkError(new Error('The payment method was declined'))).toBe(false);
    expect(isNetworkError(new Error('permission denied for table profiles'))).toBe(false);
    expect(isNetworkError(new Error('duplicate key value violates unique constraint'))).toBe(false);
  });

  it('does not match on a bare substring that happens to contain a keyword', () => {
    // "networking" is not "network request failed". A filter that swallows
    // anything containing "network" would hide real bugs in, say, a social
    // networking feature.
    expect(isNetworkError(new Error('Networking preferences could not be saved'))).toBe(false);
  });

  it('reads a plain string or an object with a message', () => {
    // RevenueCat rejects with plain objects, not Error instances.
    expect(isNetworkError('Network request failed')).toBe(true);
    expect(isNetworkError({ message: 'Network request failed' })).toBe(true);
  });

  it('treats anything unrecognisable as NOT a network error', () => {
    // Fail open: an error we cannot classify should reach Sentry rather than
    // be silently dropped. Under-filtering is recoverable; over-filtering
    // hides the bug you needed to see.
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError(undefined)).toBe(false);
    expect(isNetworkError({})).toBe(false);
    expect(isNetworkError(42)).toBe(false);
  });
});
