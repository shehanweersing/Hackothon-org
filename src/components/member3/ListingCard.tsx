import React from 'react';
import { MapPin, ShoppingBag, Store, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { Listing } from '../../lib/types';
import { CountdownBadge } from '../member2/CountdownBadge';
import { calculateExpiry } from '../member2/useExpiryTracker';

interface ListingCardProps {
  listing: Listing;
  onReserve: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onReserve }) => {
  const expiry = calculateExpiry(listing);
  const discountPct = Math.round(
    ((listing.original_price - listing.discounted_price) / listing.original_price) * 100
  );

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'Bakery': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meals': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Produce': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const isAvailable = listing.status === 'Available' && !expiry.isExpired;

  return (
    <div className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
      expiry.isClosingSoon && isAvailable
        ? 'border-amber-300 shadow-lg shadow-amber-500/10 hover:shadow-xl'
        : 'border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1'
    }`}>
      {/* Top Banner & Badges */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryColor(listing.food_type)}`}>
            {listing.food_type}
          </span>
          <CountdownBadge listing={listing} showProgress={true} />
        </div>

        {/* Shop Name */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
          <Store className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">{listing.shop_name}</span>
        </div>

        {/* Food Title */}
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {listing.food_name}
        </h3>

        {/* Location & Quantity */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="text-xs text-slate-500 mt-1">
          Available: <strong className="text-slate-800 font-semibold">{listing.quantity} portion(s) left</strong>
        </div>
      </div>

      {/* Pricing & Reservation Box */}
      <div className="p-5 pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-100 flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Rescue Price
            </span>
            <div className="text-xl font-black text-emerald-800">
              LKR {listing.discounted_price.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs line-through text-slate-400 block">
              LKR {listing.original_price.toLocaleString()}
            </span>
            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-emerald-600 text-white shadow-xs">
              {discountPct}% OFF
            </span>
          </div>
        </div>

        {/* Reserve Button */}
        {isAvailable ? (
          <button
            onClick={() => onReserve(listing)}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Reserve for Pickup</span>
          </button>
        ) : (
          <div className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 text-xs font-bold rounded-2xl text-center border border-slate-200">
            {listing.status === 'Reserved'
              ? 'Currently Reserved'
              : listing.status === 'Claimed'
              ? 'Picked Up & Saved'
              : 'Window Closed (Expired)'}
          </div>
        )}
      </div>
    </div>
  );
};
