-- ============================================================================
-- SURPLUS LK - SEED DATA SCRIPT
-- Realistic Sri Lankan eateries, bakeries, and home kitchens
-- ============================================================================

-- Clear existing data
DELETE FROM reservations;
DELETE FROM listings;

-- 1. Insert 10 Sample Listings
-- Note: Pickup timestamps use dynamic offsets from NOW() so seed data stays fresh whenever executed

INSERT INTO listings (id, shop_name, food_name, food_type, quantity, original_price, discounted_price, pickup_window_start, pickup_window_end, location, status, created_at)
VALUES
-- Item 1: Paan Paan (Available - Closing Soon in ~45 mins)
(
    'a1111111-1111-1111-1111-111111111111',
    'Paan Paan Bakery',
    'Artisan Sourdough & Multigrain Loaves (Pack of 3)',
    'Bakery',
    4,
    1800.00,
    750.00,
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '45 minutes',
    'Colombo 03 (Kollupitiya)',
    'Available',
    NOW() - INTERVAL '2 hours'
),

-- Item 2: Hotel de Pilawoos (Available - Hot Meals)
(
    'b2222222-2222-2222-2222-222222222222',
    'Hotel de Pilawoos',
    'Chicken Cheese Kottu Portions',
    'Meals',
    6,
    1650.00,
    850.00,
    NOW() + INTERVAL '15 minutes',
    NOW() + INTERVAL '3 hours',
    'Colombo 04 (Bambalapitiya)',
    'Available',
    NOW() - INTERVAL '30 minutes'
),

-- Item 3: Sponge Pastry Shop (Available - Closing Soon in ~20 mins)
(
    'c3333333-3333-3333-3333-333333333333',
    'Sponge Pastry Shop',
    'Assorted Éclairs, Savory Patties & Pastries Box',
    'Bakery',
    3,
    2200.00,
    950.00,
    NOW() - INTERVAL '30 minutes',
    NOW() + INTERVAL '20 minutes',
    'Colombo 03 (Galle Road)',
    'Available',
    NOW() - INTERVAL '1 hour'
),

-- Item 4: Green Cabin (Available - Traditional Meals)
(
    'd4444444-4444-4444-4444-444444444444',
    'Green Cabin',
    'Traditional Lamprais with Seeni Sambal & Cutlet',
    'Meals',
    5,
    1400.00,
    690.00,
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '2 hours 30 minutes',
    'Colombo 07 (Cinnamon Gardens)',
    'Available',
    NOW() - INTERVAL '45 minutes'
),

-- Item 5: Fresh Organics LK (Available - Fresh Produce)
(
    'e5555555-5555-5555-5555-555555555555',
    'Fresh Organics LK',
    'Surplus Nuwara Eliya Strawberries & Avocado Basket',
    'Produce',
    8,
    2500.00,
    1100.00,
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '4 hours',
    'Nugegoda High Level Rd',
    'Available',
    NOW() - INTERVAL '3 hours'
),

-- Item 6: Tasty Caterers (Available - Savory Short Eats)
(
    'f6666666-6666-6666-6666-666666666666',
    'Tasty Caterers',
    'Evening Short Eats Combo (12 Mutton Rolls & Fish Buns)',
    'Bakery',
    5,
    1950.00,
    890.00,
    NOW() + INTERVAL '10 minutes',
    NOW() + INTERVAL '2 hours',
    'Colombo 05 (Havelock Town)',
    'Available',
    NOW() - INTERVAL '20 minutes'
),

-- Item 7: Perera & Sons (Reserved - Awaiting Consumer Pickup)
(
    '17777777-7777-7777-7777-777777777777',
    'Perera & Sons (Bambalapitiya)',
    'Egg & Seeni Sambal Buns (Box of 8)',
    'Bakery',
    2,
    1200.00,
    550.00,
    NOW() - INTERVAL '40 minutes',
    NOW() + INTERVAL '1 hour 20 minutes',
    'Colombo 04 (Galle Road)',
    'Reserved',
    NOW() - INTERVAL '2 hours'
),

-- Item 8: Kandy Heritage Kitchen (Claimed - Successfully Picked Up)
(
    '28888888-8888-8888-8888-888888888888',
    'Kandy Heritage Kitchen',
    'Buffet Surplus Rice & Curry Claypots',
    'Meals',
    4,
    1500.00,
    600.00,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '1 hour',
    'Kandy (Peradeniya Road)',
    'Claimed',
    NOW() - INTERVAL '5 hours'
),

-- Item 9: Galle Dutch Fort Sweets (Expired - Window Closed)
(
    '39999999-9999-9999-9999-999999999999',
    'Galle Dutch Fort Bakery',
    'Dutch Butter Cake & Caramel Tarts',
    'Other',
    2,
    1750.00,
    800.00,
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '15 minutes',
    'Galle Fort',
    'Expired',
    NOW() - INTERVAL '6 hours'
),

-- Item 10: Home Kitchen by Nimalka (Available - Home Cooked)
(
    '4aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Home Kitchen by Nimalka',
    'Pol Roti & Katta Sambal Dinner Packs (Set of 6)',
    'Meals',
    7,
    1100.00,
    490.00,
    NOW() + INTERVAL '45 minutes',
    NOW() + INTERVAL '3 hours 30 minutes',
    'Dehiwala (Mount Lavinia)',
    'Available',
    NOW() - INTERVAL '15 minutes'
);

-- 2. Insert Sample Reservations
INSERT INTO reservations (id, listing_id, consumer_name, reserved_at, pickup_confirmed)
VALUES
(
    'r1111111-1111-1111-1111-111111111111',
    '17777777-7777-7777-7777-777777777777',
    'Shehan Perera',
    NOW() - INTERVAL '25 minutes',
    false
),
(
    'r2222222-2222-2222-2222-222222222222',
    '28888888-8888-8888-8888-888888888888',
    'Kasun Fernando',
    NOW() - INTERVAL '2 hours 15 minutes',
    true
);
