import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// ─── Clerk → Supabase token bridge ────────────────────────────────────────────
// Fasih uses Clerk for authentication, not Supabase Auth, so there is no
// Supabase session to refresh. Instead we hold the latest Clerk-issued
// "supabase" template JWT here and hand it to the client via the documented
// `accessToken` option (supabase-js v2.43+), which supabase-js calls before
// every REST/Realtime request. This is the supported way to forward a
// third-party JWT — it does not require touching client internals.
// See: SupabaseAuthBridge in app/_layout.tsx, which keeps this in sync with
// Clerk's auth state, and setClerkSupabaseToken() below.
let clerkSupabaseToken: string | null = null;

/**
 * Set (or clear) the Clerk JWT used to authenticate Supabase requests.
 * Call with a fresh `{ template: 'supabase' }` token whenever Clerk's auth
 * state changes, and with `null` on sign-out to fall back to anon-only access.
 */
export function setClerkSupabaseToken(token: string | null): void {
  clerkSupabaseToken = token;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
  // Forwards the Clerk JWT (when present) as the request's bearer token;
  // returns null when signed out, which supabase-js falls back to the anon key for.
  accessToken: async () => clerkSupabaseToken,
});
