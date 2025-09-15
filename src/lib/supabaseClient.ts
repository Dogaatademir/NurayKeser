// v2 supabase-js varsayıldı
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Tekil (singleton) client ve benzersiz auth storage key
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    storageKey: 'emlak-site-auth', // projene özel
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-app': 'emlak-site' },
  },
});
