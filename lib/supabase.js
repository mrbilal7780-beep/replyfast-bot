import { createClient } from '@supabase/supabase-js';

// Client Supabase GLOBAL avec persistence
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'replyfast-auth',
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'replyfast-ai',
    },
  },
});

// Helper pour vérifier la session
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Erreur session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('❌ Erreur getSession:', error);
    return null;
  }
}

// Helper pour protéger les routes
export async function requireAuth(router) {
  const session = await getSession();
  if (!session) {
    router.push('/login');
    return null;
  }
  return session;
}
