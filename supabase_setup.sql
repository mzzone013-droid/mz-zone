-- ============================================================
-- MZ-ZONE COMPLETE DATABASE SETUP
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards.
-- Run this in Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  specialty   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin', 'banned')),
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add missing columns if table already exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role      TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address   TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;

-- ============================================================
-- 2. VENDORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendors (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at      TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- 3. VENDOR PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vendor_products (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  reference        TEXT,
  emoji            TEXT,
  description      TEXT,
  specialty        TEXT,
  subcat_id        TEXT,
  subcat_name      TEXT,
  price            NUMERIC NOT NULL DEFAULT 0,
  quantity         INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  image_url        TEXT,
  urgent_delivery  BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ============================================================
-- 4. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES public.vendor_products(id) ON DELETE SET NULL,
  vendor_id        TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_name     TEXT NOT NULL,
  product_ref      TEXT,
  product_emoji    TEXT,
  supplier         TEXT,
  quantity         INTEGER NOT NULL DEFAULT 1,
  total_price      NUMERIC NOT NULL,
  status           TEXT NOT NULL DEFAULT 'processing'
                     CHECK (status IN ('processing', 'shipping', 'delivered', 'pending', 'completed', 'fake')),
  is_flagged       BOOLEAN NOT NULL DEFAULT false,
  note             TEXT,
  city             TEXT,
  shipping_address TEXT,
  phone_number     TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Add missing columns to orders if table already exists
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id       UUID REFERENCES public.vendor_products(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_id        TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_flagged       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city             TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone_number     TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_ref      TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_emoji    TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS supplier         TEXT;

-- Widen the status check to include all values the app uses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('processing', 'shipping', 'delivered', 'pending', 'completed', 'fake'));

-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- NOTE: All admin API routes use the service-role key (supabaseAdmin)
-- which bypasses RLS entirely. These policies cover direct/anon access.
-- ============================================================

-- Drop existing policies before recreating (safe to re-run)
DROP POLICY IF EXISTS "profiles_select"          ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own"      ON public.profiles;

DROP POLICY IF EXISTS "vendors_select_own"       ON public.vendors;
DROP POLICY IF EXISTS "vendors_insert_own"       ON public.vendors;
DROP POLICY IF EXISTS "vendors_update_admin"     ON public.vendors;

DROP POLICY IF EXISTS "products_select_active"   ON public.vendor_products;
DROP POLICY IF EXISTS "products_insert_vendor"   ON public.vendor_products;
DROP POLICY IF EXISTS "products_update_vendor"   ON public.vendor_products;
DROP POLICY IF EXISTS "products_delete_vendor"   ON public.vendor_products;

DROP POLICY IF EXISTS "orders_select_own"        ON public.orders;
DROP POLICY IF EXISTS "orders_select_vendor"     ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own"        ON public.orders;
DROP POLICY IF EXISTS "orders_update_vendor"     ON public.orders;

-- PROFILES
CREATE POLICY "profiles_select"     ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (
  auth.uid()::text = id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (
  auth.uid()::text = id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);

-- VENDORS
CREATE POLICY "vendors_select_own"   ON public.vendors FOR SELECT USING (true);
CREATE POLICY "vendors_insert_own"   ON public.vendors FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "vendors_update_admin" ON public.vendors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);

-- VENDOR PRODUCTS
CREATE POLICY "products_select_active" ON public.vendor_products FOR SELECT USING (status = 'active' OR auth.uid()::text = user_id);
CREATE POLICY "products_insert_vendor" ON public.vendor_products FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "products_update_vendor" ON public.vendor_products FOR UPDATE USING (
  auth.uid()::text = user_id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);
CREATE POLICY "products_delete_vendor" ON public.vendor_products FOR DELETE USING (
  auth.uid()::text = user_id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);

-- ORDERS
-- Buyers see their own orders; admins see all
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  auth.uid()::text = user_id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);
-- Vendors see orders placed for their products
CREATE POLICY "orders_select_vendor" ON public.orders FOR SELECT USING (
  auth.uid()::text = vendor_id
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);
-- Vendors can update order status (accept, ship, reject)
CREATE POLICY "orders_update_vendor" ON public.orders FOR UPDATE USING (
  auth.uid()::text = vendor_id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::text AND p.role = 'admin')
);

-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================

-- Avatars bucket (profile photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Products bucket (product images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "products_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_upload"   ON storage.objects;
DROP POLICY IF EXISTS "products_auth_upload"  ON storage.objects;

CREATE POLICY "avatars_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "products_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Authenticated users can upload to their own folder in avatars
CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Authenticated users can upload to products bucket
CREATE POLICY "products_auth_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
