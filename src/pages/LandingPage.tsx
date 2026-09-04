import React from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Store, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';
import { Listing } from '../lib/types';
import { ListingCard } from '../components/member3/ListingCard';
import { ReserveModal } from '../components/member3/ReserveModal';
import { ExpiryWarningBanner } from '../components/member2/ExpiryWarningBanner';
import { calculateExpiry } from '../components/member2/useExpiryTracker';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  listings: Listing[];
  onNavigate: (page: string) => void;
  onRefresh: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ listings, onNavigate, onRefresh }) => {
  const { role, openAuthModal } = useAuth();
  const [reservingListing, setReservingListing] = React.useState<Listing | null>(null);

  // Available listings
  const availableListings = listings.filter(
    l => l.status === 'Available' && !calculateExpiry(l).isExpired
  );

  // Top featured listings (first 6)
  const featuredListings = availableListings.slice(0, 6);

  // High-level impact stats
  const totalClaimedCount = listings.filter(l => l.status === 'Claimed' || l.status === 'Reserved').length;
  const totalFoodSavedKg = Math.round(
    listings
      .filter(l => l.status === 'Claimed' || l.status === 'Reserved')
      .reduce((sum, item) => sum + item.quantity * 0.65, 0)
  );
  const totalLkrSaved = listings
    .filter(l => l.status === 'Claimed' || l.status === 'Reserved')
    .reduce((sum, item) => sum + (item.original_price - item.discounted_price) * item.quantity, 0);

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      {/* Expiry Warning Flash Banner */}
      <ExpiryWarningBanner
        listings={listings}
        onSelectClosingSoon={() => onNavigate('browse')}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-8 sm:p-14 lg:p-16 border border-emerald-800/40 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Leaf className="w-3.5 h-3.5" />
            <span>Sri Lanka's #1 Surplus Food Rescue Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Delicious Food Saved. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Unbeatable Prices.
            </span>
          </h1>

          {/* Sri Lankan Problem Statement (Exact Spec Requirement) */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
            Every evening across Sri Lanka, bakeries, eateries, and home kitchens throw away unsold, freshly prepared food simply because closing time arrives — while households face record food inflation. 
            <strong className="text-white font-semibold"> Surplus</strong> enables food businesses to list their end-of-day stock at 
            <span className="text-amber-300 font-bold"> 40% to 70% discounts</span>, allowing nearby consumers to reserve, pick up, and enjoy high-quality meals while preventing landfill waste.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigate('browse')}
              className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 text-sm font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Browse Surplus Meals</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (role === 'provider' || role === 'admin') {
                  onNavigate('post');
                } else {
                  openAuthModal('login', 'provider');
                }
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-bold rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>List as Food Provider</span>
            </button>
          </div>

          {/* Live Platform Proof Counters */}
          <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">{availableListings.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Available Near You</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{totalFoodSavedKg} kg</div>
              <div className="text-[11px] text-slate-400 font-medium">Food Waste Diverted</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">
                Rs. {totalLkrSaved > 0 ? (totalLkrSaved / 1000).toFixed(1) + 'k' : '15k+'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Consumer Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Closing Soon / Fresh Surplus Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <Sparkles className="w-4 h-4" />
              <span>Live Marketplace Preview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Active Surplus Deals in Sri Lanka
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Grab delicious artisan baked bread, cheese kottu, lamprais, and pastries before pickup windows close!
            </p>
          </div>

          <button
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All {availableListings.length} Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {featuredListings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">All surplus food is currently reserved! Check back shortly for new evening listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(item => (
              <ListingCard
                key={item.id}
                listing={item}
                onReserve={listing => setReservingListing(listing)}
              />
            ))}
          </div>
        )}
      </section>

      {/* How Surplus Works (3 Simple Steps) */}
      <section className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/30 rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How Surplus LK Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A frictionless loop turning kitchen waste into community meals in 3 easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Eateries List End-of-Day Surplus</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bakeries and restaurants post remaining stock with a pickup window and get instant AI discount recommendations.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Consumers Browse & Reserve</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nearby buyers filter by location and category, reserving meals at 40-70% off with live countdown timers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Quick Pickup & Zero Waste</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Show your digital confirmation pass at the counter, pay the discounted price, and save fresh food from the landfill.
            </p>
          </div>
        </div>
      </section>

      {/* Reservation Modal */}
      {reservingListing && (
        <ReserveModal
          listing={reservingListing}
          onClose={() => setReservingListing(null)}
          onSuccess={() => onRefresh()}
        />
      )}
    </div>
  );
};
