import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  ArrowUpDown, 
  Store, 
  MapPin, 
  SlidersHorizontal,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Listing, FoodType } from '../../lib/types';
import { ListingCard } from './ListingCard';
import { ReserveModal } from './ReserveModal';
import { ExpiryWarningBanner } from '../member2/ExpiryWarningBanner';
import { calculateExpiry } from '../member2/useExpiryTracker';

interface BrowseViewProps {
  listings: Listing[];
  onRefresh: () => void;
  initialClosingSoonFilter?: boolean;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ listings, onRefresh, initialClosingSoonFilter = false }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('discount'); // 'discount' | 'closing' | 'price-asc' | 'newest'
  const [onlyClosingSoon, setOnlyClosingSoon] = useState<boolean>(initialClosingSoonFilter);
  const [reservingListing, setReservingListing] = useState<Listing | null>(null);

  // Extract unique locations
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    listings.forEach(l => {
      if (l.location) set.add(l.location);
    });
    return Array.from(set);
  }, [listings]);

  // Filtering & Sorting Logic
  const filteredAndSortedListings = useMemo(() => {
    return listings
      .filter(item => {
        // 1. Availability check: Only show Available items in browse
        if (item.status !== 'Available') return false;

        const expiry = calculateExpiry(item);
        if (expiry.isExpired) return false;

        // 2. Search query filter (food name or shop name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchFood = item.food_name.toLowerCase().includes(q);
          const matchShop = item.shop_name.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          if (!matchFood && !matchShop && !matchLoc) return false;
        }

        // 3. Category filter
        if (selectedCategory !== 'All' && item.food_type !== selectedCategory) {
          return false;
        }

        // 4. Location filter
        if (selectedLocation !== 'All' && item.location !== selectedLocation) {
          return false;
        }

        // 5. Closing Soon flag (< 30 min)
        if (onlyClosingSoon && !expiry.isClosingSoon && !expiry.isCritical) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'discount') {
          const discA = ((a.original_price - a.discounted_price) / a.original_price);
          const discB = ((b.original_price - b.discounted_price) / b.original_price);
          return discB - discA; // Highest discount first
        }
        if (sortBy === 'closing') {
          const expA = calculateExpiry(a).totalSecondsRemaining;
          const expB = calculateExpiry(b).totalSecondsRemaining;
          return expA - expB; // Expiring soonest first
        }
        if (sortBy === 'price-asc') {
          return a.discounted_price - b.discounted_price;
        }
        // Newest listed
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [listings, searchQuery, selectedCategory, selectedLocation, sortBy, onlyClosingSoon]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Member 2 Closing Soon Banner */}
      <ExpiryWarningBanner
        listings={listings}
        onSelectClosingSoon={() => {
          setOnlyClosingSoon(true);
          setSortBy('closing');
        }}
      />

      {/* Header & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Member 3 Module
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Browse Surplus Food Near You
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Fresh surplus bakery items, hot meals, and produce across Colombo, Kandy, and Galle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredAndSortedListings.length} Active Deals
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by food (e.g. Kottu, Sourdough, Lamprais) or shop (Paan Paan, Sponge)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-0.5 rounded-md bg-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Bakery', 'Meals', 'Produce', 'Other'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Foods' : cat}
              </button>
            ))}
          </div>

          {/* Location Dropdown & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Location Select */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                aria-label="Filter by location"
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Locations</option>
                {availableLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort listings"
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="discount">Highest Discount %</option>
                <option value="closing">Closing Soonest 🔥</option>
                <option value="price-asc">Lowest Price (LKR)</option>
                <option value="newest">Recently Listed</option>
              </select>
            </div>

            {/* Flash Deals Toggle */}
            <button
              onClick={() => setOnlyClosingSoon(!onlyClosingSoon)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyClosingSoon
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>&lt; 30m Left</span>
            </button>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredAndSortedListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No surplus deals match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Try resetting your search query, location, or closing-soon filter to discover more delicious listings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLocation('All');
              setOnlyClosingSoon(false);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedListings.map(item => (
            <ListingCard
              key={item.id}
              listing={item}
              onReserve={listing => setReservingListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Reservation Modal */}
      {reservingListing && (
        <ReserveModal
          listing={reservingListing}
          onClose={() => setReservingListing(null)}
          onSuccess={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
