-- ============================================================================
-- SURPLUS LK - SUPABASE DATABASE SCHEMA
-- Purpose: Schema definition for Surplus Food Listing & Reservation Platform
-- ============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. DROP EXISTING TABLES (FOR IDEMPOTENT RUNS)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS listings CASCADE;

-- 2. CREATE 'listings' TABLE
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_name TEXT NOT NULL,
    food_name TEXT NOT NULL,
    food_type TEXT NOT NULL CHECK (food_type IN ('Bakery', 'Meals', 'Produce', 'Other')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    original_price NUMERIC(10, 2) NOT NULL CHECK (original_price > 0),
    discounted_price NUMERIC(10, 2) NOT NULL,
    pickup_window_start TIMESTAMPTZ NOT NULL,
    pickup_window_end TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Claimed', 'Expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Relational / Cross-field constraints
    CONSTRAINT check_discount_lower_than_original CHECK (discounted_price < original_price AND discounted_price >= 0),
    CONSTRAINT check_pickup_window_valid CHECK (pickup_window_end > pickup_window_start)
);

-- 3. CREATE 'reservations' TABLE
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    consumer_name TEXT NOT NULL,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    pickup_confirmed BOOLEAN NOT NULL DEFAULT false
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_food_type ON listings(food_type);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_pickup_end ON listings(pickup_window_end);
CREATE INDEX idx_reservations_listing_id ON reservations(listing_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- ARCHITECTURAL TRADEOFF NOTE (Hackathon Scope):
-- Full authentication is omitted in favor of a zero-friction instant role selector
-- (Provider / Consumer / Admin). Therefore, Row Level Security is enabled, but
-- public (anon) roles are granted SELECT, INSERT, and UPDATE permissions.
-- In a production release, auth.uid() checks and provider-specific ownership
-- claims would replace these permissive policies.
-- ============================================================================

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Permissive policies for listings
CREATE POLICY "Public Read Access for Listings" 
ON listings FOR SELECT 
USING (true);

CREATE POLICY "Public Insert Access for Listings" 
ON listings FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Update Access for Listings" 
ON listings FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public Delete Access for Listings" 
ON listings FOR DELETE 
USING (true);

-- Permissive policies for reservations
CREATE POLICY "Public Read Access for Reservations" 
ON reservations FOR SELECT 
USING (true);

CREATE POLICY "Public Insert Access for Reservations" 
ON reservations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Update Access for Reservations" 
ON reservations FOR UPDATE 
USING (true) 
WITH CHECK (true);
