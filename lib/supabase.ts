import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key — bypasses RLS
// Use ONLY in server-side API routes where we manually enforce user ownership
export function createServerSupabaseClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Set the Clerk user ID for RLS policies in a transaction
export async function withUserContext<T>(
  userId: string,
  fn: (client: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const client = createServerSupabaseClient();
  await client.rpc('set_config', {
    setting: 'app.current_user_id',
    value: userId,
  });
  return fn(client);
}
