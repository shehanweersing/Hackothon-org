# 🥗 Surplus LK — Sri Lanka Surplus Food Rescue Platform

Surplus LK is a full-stack surplus food marketplace connecting small bakeries, eateries, and home kitchens in Sri Lanka with local consumers to sell end-of-day surplus food at high discounts (40%–70% off) instead of throwing it away.

---

## 🇱🇰 The Sri Lankan Context
In major Sri Lankan urban centers (Colombo, Kandy, Galle), hundreds of kilograms of freshly baked artisan bread, pastries, lunch packets, and kottu are prepared daily. By closing time, unsold portions are routinely discarded to make space for morning batches, even as consumers grapple with rising food inflation.

**Surplus LK** bridges this gap:
- **Food Providers**: Recover food preparation costs, clear end-of-day stock, and cut commercial waste.
- **Consumers**: Discover high-quality meals and bakery items at steep discounts.
- **Environment**: Diverts edible food from municipal landfills, reducing methane emissions.

---

## 👥 Modular Feature Ownership by Team Member

| Member | Feature Area | Key Components & Files |
| :--- | :--- | :--- |
| **MEMBER 1** | **Food Provider & Food Listing** | `src/components/member1/PostListingForm.tsx`<br>`src/components/member1/MyListingsView.tsx`<br>• Client & Postgres CHECK constraints validation<br>• "My Listings" view with store-level filtering |
| **MEMBER 2** | **Expiry Monitoring & Notifications** | `src/components/member2/useExpiryTracker.ts`<br>`src/components/member2/CountdownBadge.tsx`<br>`src/components/member2/ExpiryWarningBanner.tsx`<br>• Live 1-second countdown ticker<br>• Automatic status flip to `Expired`<br>• Flash closing-soon (&lt; 30m) banners |
| **MEMBER 3** | **Consumer, Location & Reservation** | `src/components/member3/BrowseView.tsx`<br>`src/components/member3/ListingCard.tsx`<br>`src/components/member3/ReserveModal.tsx`<br>• Real-time search, category & location filters<br>• Sort by discount % / time remaining<br>• Reservation + Pickup Confirmation flow |
| **MEMBER 4** | **AI/ML, Admin & Analytics** | `src/components/member4/AIDiscountHelper.tsx`<br>`src/components/member4/AdminDashboard.tsx`<br>`src/lib/aiDiscount.ts`<br>• AI Smart Markdown Pricing engine<br>• Real-time KPIs: kg saved, LKR saved, status audit |

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & Database**: Supabase PostgreSQL (`listings` and `reservations` tables) with Row Level Security (RLS) and Postgres CHECK constraints.
- **Zero-Config Demo Mode**: Includes an automatic local sync fallback with 10 authentic Sri Lankan seed listings so the app runs immediately even before Supabase credentials are configured.

---

## 🚀 Quickstart & Setup

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase project credentials (or leave blank to use the built-in Local Demo Engine):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase Database Setup (If using real Supabase)
Run the following scripts in the **Supabase SQL Editor**:
1. `supabase/schema.sql` — Creates tables, constraints, indexes, and RLS policies.
2. `supabase/seed.sql` — Populates 10 realistic Sri Lankan listings and sample reservations.

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 End-to-End Demo Script for Presentation
1. **Landing Page**: Review the Sri Lankan waste narrative, live counters, and active listings preview.
2. **Post Listing (Member 1)**: Fill the form, test validation errors (e.g. entering discount > original), click **"Apply AI Price"** (Member 4), and submit.
3. **Live Timers (Member 2)**: Observe the 1-second countdown, urgency badges, and warning banners for closing-soon items.
4. **Browse & Reserve (Member 3)**: Filter by category/location, sort by discount %, click **"Reserve for Pickup"**, enter name, view confetti celebration, and click **"Confirm Pickup"** to mark as Claimed.
5. **Admin Analytics (Member 4)**: View aggregated stats (kg food saved, total LKR saved), category bars, and the complete audit table.
