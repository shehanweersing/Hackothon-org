import React from 'react';
import { Clock, Flame, AlertCircle } from 'lucide-react';
import { Listing } from '../../lib/types';
import { calculateExpiry } from './useExpiryTracker';

interface CountdownBadgeProps {
  listing: Listing;
  showProgress?: boolean;
}

/**
 * MEMBER 2: Live Time Remaining Badge
 * Displays dynamic countdown with color-coded urgency levels (Critical, Closing Soon, Normal, Expired)
 */
export const CountdownBadge: React.FC<CountdownBadgeProps> = ({ listing, showProgress = true }) => {
  const expiry = calculateExpiry(listing);

  if (listing.status === 'Expired' || expiry.isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        Window Expired
      </span>
    );
  }

  if (listing.status === 'Claimed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        Claimed & Rescued
      </span>
    );
  }

  if (listing.status === 'Reserved') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        Reserved · Pickup in {expiry.timeRemainingStr}
      </span>
    );
  }

  // Active Available Listing
  return (
    <div className="flex flex-col gap-1">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
          expiry.isCritical
            ? 'bg-rose-500 text-white shadow-md animate-pulse'
            : expiry.isClosingSoon
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-slate-100 text-slate-700 border border-slate-200'
        }`}
      >
        {expiry.isCritical ? (
          <Flame className="w-3.5 h-3.5 animate-bounce text-amber-200" />
        ) : expiry.isClosingSoon ? (
          <Flame className="w-3.5 h-3.5 text-amber-100" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-slate-500" />
        )}

        <span>
          {expiry.isCritical ? 'Ends in ' : expiry.isClosingSoon ? 'Closing in ' : 'Ends in '}
          <strong className="font-bold">{expiry.timeRemainingStr}</strong>
        </span>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              expiry.isCritical
                ? 'bg-rose-500'
                : expiry.isClosingSoon
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${expiry.progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
