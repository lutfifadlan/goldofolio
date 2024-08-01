import { createClient, SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.URL_SUPABASE || '';
const supabaseAnonKey: string = process.env.ANON_KEY_SUPABASE || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type { Session, AuthChangeEvent, User };
