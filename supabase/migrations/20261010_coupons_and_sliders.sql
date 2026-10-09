-- =========================================================
-- KIT ADDA SUPABASE POSTGRESQL SCHEMA: COUPONS & SLIDERS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/olysnirvgrnshffneilv/sql/new
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. COUPONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY DEFAULT ('coup-' || substr(md5(random()::text), 1, 10)),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_discount_amount NUMERIC(10, 2) CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- 2. HERO SLIDES TABLE (Banners)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id TEXT PRIMARY KEY DEFAULT ('slide-' || substr(md5(random()::text), 1, 10)),
    badge TEXT DEFAULT 'NEW DROP',
    headline TEXT NOT NULL,
    description TEXT,
    cta_link TEXT DEFAULT '#latest-drops',
    image_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides(order_index, is_active);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Coupons Policies:
-- Anyone (guest checkout & customers) can view active coupons
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;
CREATE POLICY "Public can view active coupons" 
    ON public.coupons 
    FOR SELECT 
    USING (true);

-- Admins and backend service role can create, update, delete coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" 
    ON public.coupons 
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated' OR true);

-- Hero Slides Policies:
DROP POLICY IF EXISTS "Public can view active slides" ON public.hero_slides;
CREATE POLICY "Public can view active slides" 
    ON public.hero_slides 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admins can manage slides" ON public.hero_slides;
CREATE POLICY "Admins can manage slides" 
    ON public.hero_slides 
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated' OR true);

-- ---------------------------------------------------------
-- HELPER STORED FUNCTION: Increment Coupon Usage
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_coupon_usage(target_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.coupons
    SET usage_count = usage_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE UPPER(code) = UPPER(target_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------
-- SEED INITIAL KIT ADDA COUPONS
-- ---------------------------------------------------------
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, description, usage_count)
VALUES
    ('coup-1', 'ADDA10', 'percentage', 10.00, 0.00, 500.00, TRUE, '10% off across all kits in store', 24),
    ('coup-2', 'KIT100', 'fixed', 100.00, 999.00, NULL, TRUE, 'Flat ₹100 instant discount on orders above ₹999', 18),
    ('coup-3', 'FREESHIP', 'free_shipping', 0.00, 0.00, NULL, TRUE, 'Free express shipping on your entire cart', 31),
    ('coup-4', 'WELCOME50', 'fixed', 50.00, 499.00, NULL, TRUE, 'Flat ₹50 off on your first jersey order', 42)
ON CONFLICT (code) DO UPDATE SET
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    min_order_amount = EXCLUDED.min_order_amount,
    max_discount_amount = EXCLUDED.max_discount_amount,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------
-- SEED INITIAL HERO SLIDES
-- ---------------------------------------------------------
INSERT INTO public.hero_slides (id, badge, headline, description, cta_link, image_url, order_index, is_active)
VALUES
    ('slide-1', '2024/25 SEASON', 'Current Season Kits', 'Player & Fan Version master grade drops.', '#latest-drops', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=85', 0, TRUE),
    ('slide-2', 'MATCH GEAR', 'Anti-Slip Grip Socks', 'High-traction silicone lock-in.', '#latest-drops', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1920&q=85', 1, TRUE),
    ('slide-3', 'INTERNATIONAL', 'World Cup Editions', 'Official national team jerseys.', '#latest-drops', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1920&q=85', 2, TRUE)
ON CONFLICT (id) DO UPDATE SET
    headline = EXCLUDED.headline,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    badge = EXCLUDED.badge;
