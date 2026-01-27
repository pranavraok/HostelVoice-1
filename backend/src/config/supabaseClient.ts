import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Admin client with service role key - bypasses RLS
// Use this for admin operations and backend-only queries
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client for user-context operations
// This respects RLS policies based on the user's JWT
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default supabaseAdmin;
