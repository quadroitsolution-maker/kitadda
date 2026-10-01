-- =========================================================
-- KIT ADDA SUPABASE POSTGRESQL SCHEMA & MIGRATIONS
-- Database: PostgreSQL 15+ (Supabase)
-- =========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PRODUCTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= price),
    category TEXT NOT NULL CHECK (category IN ('club', 'retro', 'international', 'jackets', 'accessories')),
    image_url TEXT NOT NULL,
    gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    team TEXT,
    league TEXT,
    season TEXT,
    badge TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    version_type TEXT DEFAULT 'Fan Version' CHECK (version_type IN ('Fan Version', 'Player Version')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- 2. ORDERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT DEFAULT 'razorpay' CHECK (payment_method IN ('razorpay', 'cod')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    shipping_address JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- 3. ORDER_ITEMS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    size TEXT NOT NULL,
    custom_name TEXT,
    custom_number TEXT,
    patches BOOLEAN DEFAULT FALSE,
    customizations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ---------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status, status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products Policies:
-- Anyone (authenticated or anonymous) can view active products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" 
    ON public.products 
    FOR SELECT 
    USING (true);

-- Only authenticated admins/service role can insert or update products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
    ON public.products 
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'authenticated');

-- Orders Policies:
-- Anyone can create an order (guest checkout support)
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" 
    ON public.orders 
    FOR INSERT 
    WITH CHECK (true);

-- Authenticated users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
    ON public.orders 
    FOR SELECT 
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- Anyone can insert order items
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items" 
    ON public.order_items 
    FOR INSERT 
    WITH CHECK (true);

-- View order items linked to visible orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" 
    ON public.order_items 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE public.orders.id = public.order_items.order_id 
            AND (public.orders.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role')
        )
    );

-- ---------------------------------------------------------
-- SEED DATA FOR KIT ADDA INVENTORY
-- ---------------------------------------------------------
INSERT INTO public.products (id, title, description, price, compare_at_price, category, image_url, gallery, stock_status, team, league, season, badge, is_featured, version_type)
VALUES
('rm-home-2425', 'Real Madrid 2024/25 Home Master Grade Kit', 'The iconic all-white Los Blancos home jersey featuring high-breathability houndstooth textured fabric, heat-applied crest, and golden detailing.', 1199.00, 2199.00, 'club', 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Real Madrid', 'La Liga', '2024/25', 'BESTSELLER', TRUE, 'Fan Version'),
('arsenal-away-2425', 'Arsenal 24/25 African Heritage Away Kit', 'Designed in collaboration with Labrum London celebrating pan-African heritage with bold red and green accents on black base.', 1249.00, 2299.00, 'club', 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Arsenal', 'Premier League', '2024/25', 'HOT DROP', TRUE, 'Player Version'),
('barca-anniv-2425', 'FC Barcelona 125th Anniversary Home Kit', 'Half-and-half classic Blaugrana split commemorating 125 glorious years of Catalan football majesty.', 1199.00, 2199.00, 'club', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'FC Barcelona', 'La Liga', '2024/25', '125TH ANNIV', TRUE, 'Fan Version'),
('arg-wc-three-stars', 'Argentina 3-Stars World Champions Home Kit', 'The historic Albiceleste shirt with the third gold star and central FIFA World Champions 2022 golden crest.', 1299.00, 2499.00, 'international', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Argentina', 'International', '2024', '3-STARS GOLD', TRUE, 'Player Version'),
('mancity-fourth-oasis', 'Man City Definitely City 4th Kit (Oasis Collab)', 'Designed in collaboration with Noel Gallagher to celebrate 30 years of Definitely Maybe.', 1349.00, 2399.00, 'club', 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Manchester City', 'Premier League', '2024/25', 'OASIS SPECIAL', TRUE, 'Player Version'),
('milan-retro-0607', 'AC Milan 2006/07 UCL Final Athens Retro Kit', 'The fabled white away jersey worn on that historic night in Athens when Kaká and Inzaghi lifted the Champions League trophy.', 1399.00, 2599.00, 'retro', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'], 'low_stock', 'AC Milan', 'Serie A / Retro', '2006/07', 'RETRO VAULT', TRUE, 'Fan Version'),
('manu-retro-0708', 'Manchester United 2007/08 Double Winning Retro', 'The iconic red shirt with back white stripe worn by Cristiano Ronaldo during their Moscow double triumph.', 1399.00, 2699.00, 'retro', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Manchester United', 'Premier League / Retro', '2007/08', 'RONALDO VAULT', TRUE, 'Fan Version'),
('psg-windbreaker-2425', 'PSG x Jordan Anthem Windbreaker Jacket', 'Streetwear-meets-football technical water-resistant windbreaker jacket featuring iridescent Paris crest.', 1899.00, 3499.00, 'jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'], 'in_stock', 'Paris Saint-Germain', 'Ligue 1', '2024/25', 'STREETWEAR', TRUE, 'Fan Version')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url;
