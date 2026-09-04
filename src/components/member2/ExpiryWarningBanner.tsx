import React from 'react';
import { Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import { Listing } from '../../lib/types';
import { calculateExpiry } from './useExpiryTracker';
import { useAuth } from '../../context/AuthContext';

interface ExpiryWarningBannerProps {
  listings: Listing[];
  onSelectClosingSoon?: () => void;
}

/**
 * MEMBER 2: Live In-App Notification & Expiry Warning Banner
 * Warns providers when their listings are close to closing,
 * and alerts consumers to urgent flash surplus deals before they expire.
 */
export const ExpiryWarningBanner: React.FC<ExpiryWarningBannerProps> = ({ listings, onSelectClosingSoon }) => {
  const { role, user } = useAuth();
  const providerShopName = user?.shopName || '';

  // Filter listings closing soon (< 30 minutes) and available
  const closingSoonListings = listings.filter(l => {
    if (l.status !== 'Available') return false;
    const exp = calculateExpiry(l);
    return exp.isClosingSoon || exp.isCritical;
  });

  // Filter provider's own listings expiring soon
  const providerClosingListings = closingSoonListings.filter(
    l => l.shop_name.toLowerCase() === providerShopName.toLowerCase()
  );

  if (role === 'provider' && providerClosingListings.length > 0) {
    return (
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl my-4 text-amber-900 flex items-start gap-3 shadow-sm animate-fade-in">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold">
            Action Required: You have {providerClosingListings.length} listing(s) closing within 30 minutes!
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            "{providerClosingListings[0].food_name}" will expire shortly. Consider marking down further or monitoring for pickup.
          </p>
        </div>
      </div>
    );
  }

  if (closingSoonListings.length > 0) {
    return (
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white px-4 py-3 rounded-2xl shadow-md my-4 flex items-center justify-between gap-4 animate-fade-in closing-soon-glow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-5 h-5 text-amber-200 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
              Flash Surplus Alert: {closingSoonListings.length} delicious meal(s) closing in &lt; 30 mins!
            </h4>
            <p className="text-xs text-amber-100 hidden sm:block">
              Rescue freshly baked bread & hot meals in Colombo before pickup windows close.
            </p>
          </div>
        </div>

        {onSelectClosingSoon && (
          <button
            onClick={onSelectClosingSoon}
            className="flex-shrink-0 px-3.5 py-1.5 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all shadow hover:shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Flash Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return null;
};
