-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for RoyalPets.nl
-- Tables: profiles, portraits, orders, costumes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Costumes table (stores the 8 royal costumes)
CREATE TABLE costumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_nl TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category TEXT NOT NULL,
    description_nl TEXT,
    description_en TEXT,
    image_url TEXT,
    prompt_template TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'NL',
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portraits table (stores generated portraits)
CREATE TYPE portrait_status AS ENUM ('pending', 'generating', 'completed', 'failed');
CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'other');

CREATE TABLE portraits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- For guest users
    pet_name TEXT,
    pet_type pet_type,
    costume_id UUID REFERENCES costumes(id) ON DELETE SET NULL,
    original_image_url TEXT NOT NULL,
    original_image_path TEXT NOT NULL,
    generated_images JSONB DEFAULT '[]'::jsonb, -- Array of {url, path, is_watermarked}
    selected_image_index INTEGER,
    status portrait_status DEFAULT 'pending',
    generation_error TEXT,
    is_favorite BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (stores purchase orders)
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE product_tier AS ENUM ('digital_basic', 'digital_premium', 'print_digital', 'canvas_deluxe');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT, -- For guest users
    portrait_id UUID REFERENCES portraits(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    product_tier product_tier NOT NULL,
    status order_status DEFAULT 'pending',
    amount_total INTEGER NOT NULL, -- In cents (euro cents)
    amount_subtotal INTEGER NOT NULL,
    tax_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur',
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    shipping_address JSONB,
    shipping_tracking_number TEXT,
    shipping_carrier TEXT,
    shipping_estimated_delivery TIMESTAMPTZ,
    download_urls JSONB, -- Array of download URLs for digital orders
    download_expires_at TIMESTAMPTZ,
    print_partner_order_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_portraits_user_id ON portraits(user_id);
CREATE INDEX idx_portraits_session_id ON portraits(session_id);
CREATE INDEX idx_portraits_status ON portraits(status);
CREATE INDEX idx_portraits_costume_id ON portraits(costume_id);
CREATE INDEX idx_portraits_expires_at ON portraits(expires_at);
CREATE INDEX idx_portraits_created_at ON portraits(created_at);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_session_id ON orders(session_id);
CREATE INDEX idx_orders_portrait_id ON orders(portrait_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_costumes_slug ON costumes(slug);
CREATE INDEX idx_costumes_category ON costumes(category);
CREATE INDEX idx_costumes_is_active ON costumes(is_active);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE costumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portraits ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for costumes (public read-only)
CREATE POLICY "Costumes are viewable by everyone" 
    ON costumes FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Only admins can modify costumes" 
    ON costumes FOR ALL 
    USING (auth.uid() IN (
        SELECT id FROM profiles WHERE is_admin = true
    ));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- RLS Policies for portraits
CREATE POLICY "Users can view own portraits" 
    ON portraits FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

CREATE POLICY "Users can insert own portraits" 
    ON portraits FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

CREATE POLICY "Users can update own portraits" 
    ON portraits FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

CREATE POLICY "Users can delete own portraits" 
    ON portraits FOR DELETE 
    USING (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

-- RLS Policies for orders
CREATE POLICY "Users can view own orders" 
    ON orders FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

CREATE POLICY "Users can insert own orders" 
    ON orders FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

CREATE POLICY "Users can update own orders (limited fields)" 
    ON orders FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR session_id = COALESCE(current_setting('app.current_session_id', true), '')
    );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_costumes_updated_at BEFORE UPDATE ON costumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portraits_updated_at BEFORE UPDATE ON portraits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
