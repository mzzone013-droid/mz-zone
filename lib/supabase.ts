import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  specialty: string;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  product_name: string;
  product_ref: string;
  product_emoji: string;
  supplier: string;
  quantity: number;
  total_price: number;
  status: 'processing' | 'shipping' | 'delivered';
  note: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};
