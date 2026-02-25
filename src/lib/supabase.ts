import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    storageKey: 'nuraykeser-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// Artık gerçek URL olduğu için isMocking false dönecektir
export const isMocking = !SUPABASE_URL || SUPABASE_URL.includes("placeholder");