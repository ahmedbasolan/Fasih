import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { getClerkInstance } from '@clerk/expo';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Fasih uses Clerk for authentication — Supabase is the database only.
//
// `accessToken` forwards the current Clerk session token on every request, so
// Postgres sees the signed-in user and RLS policies can read the Clerk user id
// via auth.jwt()->>'sub' (see migrations/003_rls.sql).
//
// getClerkInstance() is the imperative handle — it works outside React, which
// this module-level client requires (hooks are not available here).
//
// Supabase Auth stays fully disabled: sessions are owned by Clerk, so there is
// nothing for supabase-js to persist or refresh.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    try {
      return (await getClerkInstance().session?.getToken()) ?? null;
    } catch {
      // Signed out, or Clerk not ready yet — fall back to the anon role.
      return null;
    }
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetch.bind(globalThis),
  },
});
