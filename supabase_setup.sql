-- 1. Create Profiles table (Using TEXT for ID to support NextAuth/Google IDs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- NextAuth user ID (string)
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Orders table (Using TEXT for user_id)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Reference to profiles.id
  product_name TEXT NOT NULL,
  product_ref TEXT NOT NULL,
  product_emoji TEXT,
  supplier TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'shipping', 'delivered')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Simplified: Admin client will bypass these, but good to have for Selects)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true); -- Public view or restricted as needed
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true); -- Restricted in API routes

-- NOTE: Since we are using NextAuth with supabaseAdmin (Service Role), 
-- the API routes will bypass RLS. This is the standard way to integrate 
-- NextAuth with Supabase as a database.
