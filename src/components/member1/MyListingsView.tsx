import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  AlertCircle,
  TrendingDown,
  Building2,
  Lock,
  LogIn
} from 'lucide-react';
import { Listing, ListingStatus } from '../../lib/types';
import { updateListing, deleteListing } from '../../lib/supabase';
import { CountdownBadge } from '../member2/CountdownBadge';
import { useAuth } from '../../context/AuthContext';

interface MyListingsViewProps {
  listings: Listing[];
  onRefresh: () => void;
  onNavigateToPost: () => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({ listings, onRefresh, onNavigateToPost }) => {
  const { user, role, isAuthenticated, openAuthModal, showToast } = useAuth();
  const currentProviderShop = user?.shopName || 'Paan Paan Bakery';

  // Access guard check for Provider
  if (!isAuthenticated || (role !== 'provider' && role !== 'admin')) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg animate-fade-in space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Provider Sign In Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Sign in to your food provider account to view, edit, and manage your kitchen’s surplus listings.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login', 'provider')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as Provider</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter listings by current authenticated provider shop
  const providerListings = useMemo(() => {
    if (role === 'admin') return listings; // Admin sees all
    return listings.filter(l => l.shop_name.toLowerCase().trim() === currentProviderShop.toLowerCase().trim());
  }, [listings, currentProviderShop, role]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from listings?`)) {
      await deleteListing(id);
      showToast(`Removed "${name}"`);
      onRefresh();
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: ListingStatus) => {
    const newStatus: ListingStatus = currentStatus === 'Claimed' ? 'Available' : 'Claimed';
    await updateListing(id, { status: newStatus });
    showToast(`Updated status to ${newStatus}`);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Provider Store Badge */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Member 1 Module
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            My Provider Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Managing surplus inventory for <strong className="text-slate-800">{currentProviderShop}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">{currentProviderShop}</span>
          </div>

          <button
            onClick={onNavigateToPost}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Listing</span>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {providerListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No active listings for "{currentProviderShop}"</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            You don't have any active or past food rescue listings under this shop name yet.
          </p>
          <button
            onClick={onNavigateToPost}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post First Surplus Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerListings.map(item => {
            const discountPct = Math.round(
              ((item.original_price - item.discounted_price) / item.original_price) * 100
            );

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {item.food_type}
                    </span>
                    <CountdownBadge listing={item} showProgress={false} />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {item.food_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Qty: <strong className="text-slate-800">{item.quantity} portions</strong> · {item.location}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Surplus Price</span>
                      <span className="text-lg font-black text-emerald-800">
                        LKR {item.discounted_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Original</span>
                      <span className="text-xs line-through text-slate-400">
                        LKR {item.original_price.toLocaleString()}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-600 block">
                        Save {discountPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleStatusToggle(item.id, item.status)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      item.status === 'Claimed'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : item.status === 'Reserved'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {item.status === 'Claimed'
                        ? 'Claimed (Click to Revert)'
                        : item.status === 'Reserved'
                        ? 'Confirm Pickup'
                        : 'Mark Claimed'}
                    </span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.food_name)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
