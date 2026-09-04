import { useState, useEffect } from 'react';
import { Listing } from '../../lib/types';
import { updateListing } from '../../lib/supabase';

export interface ExpiryStatus {
  timeRemainingStr: string;
  totalSecondsRemaining: number;
  isExpired: boolean;
  isClosingSoon: boolean; // < 30 minutes
  isCritical: boolean;    // < 15 minutes
  progressPercent: number; // 0 (start) to 100 (ended)
}

/**
 * MEMBER 2: Live Expiry Tracker Hook
 * Computes exact time remaining, updates Postgres/local state to 'Expired' upon window close,
 * and alerts providers/consumers about expiring listings.
 */
export function calculateExpiry(listing: Listing): ExpiryStatus {
  const now = Date.now();
  const start = new Date(listing.pickup_window_start).getTime();
  const end = new Date(listing.pickup_window_end).getTime();

  if (listing.status === 'Expired' || now >= end) {
    return {
      timeRemainingStr: 'Expired',
      totalSecondsRemaining: 0,
      isExpired: true,
      isClosingSoon: false,
      isCritical: false,
      progressPercent: 100,
    };
  }

  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, now - start);
  const progressPercent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

  const diffMs = end - now;
  const totalSecondsRemaining = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSecondsRemaining / 3600);
  const minutes = Math.floor((totalSecondsRemaining % 3600) / 60);
  const seconds = totalSecondsRemaining % 60;

  let timeRemainingStr = '';
  if (hours > 0) {
    timeRemainingStr = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    timeRemainingStr = `${minutes}m ${seconds}s`;
  } else {
    timeRemainingStr = `${seconds}s`;
  }

  const isClosingSoon = totalSecondsRemaining <= 1800 && totalSecondsRemaining > 0; // <= 30 mins
  const isCritical = totalSecondsRemaining <= 900 && totalSecondsRemaining > 0;    // <= 15 mins

  return {
    timeRemainingStr,
    totalSecondsRemaining,
    isExpired: false,
    isClosingSoon,
    isCritical,
    progressPercent,
  };
}

export function useLiveExpiryTicker(listings: Listing[]) {
  const [, setTick] = useState(0);

  useEffect(() => {
    // 1-second interval for crisp live countdown display
    const interval = setInterval(() => {
      setTick(t => t + 1);

      // Check if any Available or Reserved listing has now passed pickup_window_end
      const now = Date.now();
      listings.forEach(listing => {
        if ((listing.status === 'Available' || listing.status === 'Reserved')) {
          const endTime = new Date(listing.pickup_window_end).getTime();
          if (now >= endTime) {
            // Member 2 requirement: Auto-flip status to 'Expired'
            updateListing(listing.id, { status: 'Expired' });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [listings]);
}
