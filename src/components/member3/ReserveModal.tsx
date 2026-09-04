import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Store, 
  Sparkles,
  QrCode,
  ShieldCheck,
  User,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Listing, Reservation } from '../../lib/types';
import { createReservation, confirmPickup } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ReserveModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({ listing, onClose, onSuccess }) => {
  const { user, isAuthenticated, openAuthModal, showToast } = useAuth();
  const [consumerName, setConsumerName] = useState<string>(user?.fullName || 'Kasun Silva');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.fullName) {
      setConsumerName(user.fullName);
    }
  }, [user]);

  if (!listing) return null;

  const discountPct = Math.round(
    ((listing.original_price - listing.discounted_price) / listing.original_price) * 100
  );

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerName.trim()) {
      setError('Please enter your name so the kitchen can prepare your pickup.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { reservation, error: resErr } = await createReservation(listing.id, consumerName);
      if (resErr || !reservation) {
        setError(resErr || 'Failed to complete reservation. Please try again.');
      } else {
        setConfirmedReservation(reservation);
        // Fire confetti celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#065f46', '#3b82f6'],
        });
        showToast(`🎉 Reservation confirmed for ${consumerName}!`);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPickup = async () => {
    if (!confirmedReservation) return;
    setIsSubmitting(true);
    const { success, error: claimErr } = await confirmPickup(confirmedReservation.id, listing.id);
    setIsSubmitting(false);
    if (success) {
      setIsClaimed(true);
      showToast('Pickup verified! Listing marked as Claimed & Rescued.');
      onSuccess();
    } else {
      setError(claimErr || 'Failed to confirm pickup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <ShoppingBag className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                {confirmedReservation ? 'Reservation Confirmed' : 'Reserve Surplus Meal'}
              </span>
              <h3 className="text-lg font-black">{listing.food_name}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!confirmedReservation ? (
            <form onSubmit={handleReserve} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {/* Quick Auth Reminder for Guests */}
              {!isAuthenticated && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <span>Want to save reservations to your profile?</span>
                  <button
                    type="button"
                    onClick={() => { onClose(); openAuthModal('login', 'consumer'); }}
                    className="font-bold underline text-amber-950 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Meal Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Provider Store:</span>
                  <strong className="text-slate-800">{listing.shop_name}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Pickup Window:</span>
                  <strong className="text-emerald-700">
                    {formatTime(listing.pickup_window_start)} – {formatTime(listing.pickup_window_end)}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Pickup Location:</span>
                  <strong className="text-slate-800">{listing.location}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Price to Pay at Pickup:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-800">
                      LKR {listing.discounted_price.toLocaleString()}
                    </span>
                    <span className="text-xs line-through text-slate-400 ml-2">
                      LKR {listing.original_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Consumer Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name (for Pickup Verification) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={consumerName}
                    onChange={e => setConsumerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pay directly at the store during pickup. No advance payment needed.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Reserving...' : 'Confirm Reservation'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Reservation Success & Pickup Pass */
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">Your Reservation is Locked!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Show this digital pass to <strong className="text-slate-800">{listing.shop_name}</strong> during your pickup window.
                </p>
              </div>

              {/* Digital Pass Receipt */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/40 border border-emerald-200/80 text-left space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Reservation ID</span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    #{confirmedReservation.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Reserved For:</span>
                  <strong className="text-slate-800">{confirmedReservation.consumer_name}</strong>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Total at Counter:</span>
                  <strong className="text-emerald-800 font-black">
                    LKR {listing.discounted_price.toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pickup Ends:</span>
                  <strong className="text-rose-700 font-bold">
                    {formatTime(listing.pickup_window_end)}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    isClaimed ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isClaimed ? 'Claimed & Verified' : 'Awaiting Store Pickup'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {!isClaimed ? (
                  <button
                    onClick={handleConfirmPickup}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I have picked up this meal (Claim)</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-teal-50 text-teal-800 text-xs font-bold rounded-xl border border-teal-200">
                    ✅ Pickup Completed & Claimed
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
