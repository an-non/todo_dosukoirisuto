import { cookies } from 'next/headers';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function missingSupabaseConfigError(): Error {
  return new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

// フロント/サーバ用（未設定でもビルドが落ちないように、未設定時は null 扱いにする）
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;


/**
 * Route Handler 用（cookies の session から user を復元して RLS 前提で扱う）
 *
 * 未設定時に呼ばれたら明示的にエラーを返す。
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw missingSupabaseConfigError();
  }

  const cookieStore = cookies();
  const access_token = cookieStore.get('sb-access-token')?.value;
  const refresh_token = cookieStore.get('sb-refresh-token')?.value;

  const serverSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  if (access_token && typeof access_token === 'string') {
    serverSupabase.auth.setSession({
      access_token,
      refresh_token: refresh_token ?? '',
    });
  }

  return serverSupabase;
}

