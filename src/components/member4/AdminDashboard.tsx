import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  PackageCheck, 
  Clock, 
  ShoppingBag, 
  Sparkles, 
  RotateCcw, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Lock,
  LogIn
} from 'lucide-react';
import { Listing, Reservation, ListingStatus } from '../../lib/types';
import { resetDemoData, updateListing, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  listings: Listing[];
  reservations: Reservation[];
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ listings, reservations, onRefresh }) => {
  const { user, role, isAuthenticated, openAuthModal, showToast } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Access guard: if not admin
  if (!isAuthenticated || role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg animate-fade-in space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Admin Authentication Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Platform impact metrics, full listing overrides, and database audits are restricted to authorized administrators.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login', 'admin')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sign In as Platform Admin</span>
          </button>
        </div>
      </div>
    );
  }

  // Aggregation calculations (Member 4 Analytics Engine)
  const stats = useMemo(() => {
    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === 'Available').length;
    const reservedListings = listings.filter(l => l.status === 'Reserved').length;
    const claimedListings = listings.filter(l => l.status === 'Claimed').length;
    const expiredListings = listings.filter(l => l.status === 'Expired').length;

    // Total portions rescued (Claimed + Reserved items * quantity)
    const rescuedPortions = listings
      .filter(l => l.status === 'Claimed' || l.status === 'Reserved')
      .reduce((sum, item) => sum + item.quantity, 0);

    // Approximate average portion weight = 0.65 kg (meals/bakery/produce average)
    const estimatedFoodSavedKg = Math.round(rescuedPortions * 0.65 * 10) / 10;

    // Total Money Saved for consumers (Original Price - Discounted Price) * Quantity of Claimed/Reserved
    const totalMoneySavedLkr = listings
      .filter(l => l.status === 'Claimed' || l.status === 'Reserved')
      .reduce((sum, item) => sum + (item.original_price - item.discounted_price) * item.quantity, 0);

    // Average Discount % across all listings
    const totalDiscountPct = listings.reduce((sum, item) => {
      const pct = ((item.original_price - item.discounted_price) / item.original_price) * 100;
      return sum + pct;
    }, 0);
    const averageDiscountPercent = totalListings > 0 ? Math.round(totalDiscountPct / totalListings) : 0;

    // Food Category Breakdown
    const categoryCounts: Record<string, number> = {};
    listings.forEach(item => {
      categoryCounts[item.food_type] = (categoryCounts[item.food_type] || 0) + 1;
    });

    // Top Category
    let topFoodType = 'Bakery';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topFoodType = cat;
      }
    });

    // Location Breakdown
    const locationCounts: Record<string, number> = {};
    listings.forEach(item => {
      locationCounts[item.location] = (locationCounts[item.location] || 0) + 1;
    });

    return {
      totalListings,
      activeListings,
      reservedListings,
      claimedListings,
      expiredListings,
      rescuedPortions,
      estimatedFoodSavedKg,
      totalMoneySavedLkr,
      averageDiscountPercent,
      topFoodType,
      categoryCounts,
      locationCounts,
    };
  }, [listings]);

  // Filtered listings for table
  const filteredListings = useMemo(() => {
    if (statusFilter === 'All') return listings;
    return listings.filter(l => l.status === statusFilter);
  }, [listings, statusFilter]);

  const handleReset = () => {
    setIsResetting(true);
    resetDemoData();
    setTimeout(() => {
      onRefresh();
      setIsResetting(false);
      showToast('Database reset to initial Sri Lankan seed dataset');
    }, 400);
  };

  const handleStatusChange = async (listingId: string, newStatus: ListingStatus) => {
    await updateListing(listingId, { status: newStatus });
    onRefresh();
    showToast(`Listing status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header & Connectivity Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Platform Analytics & Admin
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Member 4 Module · Logged in as <strong className="text-slate-800">{user?.fullName || 'Admin'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border bg-slate-50 text-slate-700 border-slate-200">
            <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{isSupabaseConfigured ? 'Supabase Postgres Connected' : 'Local Demo Sync Engine'}</span>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Reset to initial 10 Sri Lanka sample listings"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Active Listings */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Listings</span>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{stats.activeListings}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {stats.totalListings} total listings across platforms
            </p>
          </div>
        </div>

        {/* KPI 2: Rescued Meals & Portions */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-amber-50/40 border border-amber-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rescued Portions</span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">{stats.rescuedPortions}</div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              {stats.claimedListings} claimed · {stats.reservedListings} reserved
            </p>
          </div>
        </div>

        {/* KPI 3: Food Saved in Kg */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-teal-50/40 border border-teal-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Food Waste Diverted</span>
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {stats.estimatedFoodSavedKg} <span className="text-lg font-bold text-slate-500">kg</span>
            </div>
            <p className="text-xs text-teal-700 font-medium mt-1">
              Estimated ~{(stats.estimatedFoodSavedKg * 2.5).toFixed(1)} kg CO₂e saved
            </p>
          </div>
        </div>

        {/* KPI 4: Total Money Saved (LKR) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-blue-50/40 border border-blue-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Consumer Savings</span>
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
              LKR {stats.totalMoneySavedLkr.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 font-medium mt-1">
              Avg. {stats.averageDiscountPercent}% markdown across shops
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Breakdowns: Categories & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Listings by Food Category</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Top: {stats.topFoodType}
            </span>
          </h3>

          <div className="space-y-3.5">
            {['Bakery', 'Meals', 'Produce', 'Other'].map(category => {
              const count = stats.categoryCounts[category] || 0;
              const pct = stats.totalListings > 0 ? Math.round((count / stats.totalListings) * 100) : 0;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{category}</span>
                    <span>{count} listings ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Listing Status Distribution
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60">
              <span className="text-xs font-bold text-emerald-700 uppercase">Available</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">{stats.activeListings}</div>
              <p className="text-xs text-emerald-700 mt-0.5">Ready for instant reservation</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/60">
              <span className="text-xs font-bold text-blue-700 uppercase">Reserved</span>
              <div className="text-2xl font-black text-blue-950 mt-1">{stats.reservedListings}</div>
              <p className="text-xs text-blue-700 mt-0.5">Awaiting customer pickup</p>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/60">
              <span className="text-xs font-bold text-teal-700 uppercase">Claimed</span>
              <div className="text-2xl font-black text-teal-950 mt-1">{stats.claimedListings}</div>
              <p className="text-xs text-teal-700 mt-0.5">Successfully rescued & verified</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/60">
              <span className="text-xs font-bold text-rose-700 uppercase">Expired</span>
              <div className="text-2xl font-black text-rose-950 mt-1">{stats.expiredListings}</div>
              <p className="text-xs text-rose-700 mt-0.5">Pickup window elapsed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Listings Audit Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">All Database Listings</h3>
            <p className="text-xs text-slate-500">Live view of Supabase `listings` table and status controls</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter listings by status"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses ({listings.length})</option>
              <option value="Available">Available ({stats.activeListings})</option>
              <option value="Reserved">Reserved ({stats.reservedListings})</option>
              <option value="Claimed">Claimed ({stats.claimedListings})</option>
              <option value="Expired">Expired ({stats.expiredListings})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Food Item & Shop</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Pricing (LKR)</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No listings match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredListings.map(item => {
                  const discountPct = Math.round(
                    ((item.original_price - item.discounted_price) / item.original_price) * 100
                  );
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.food_name}</div>
                        <div className="text-slate-500 text-[11px] font-medium">{item.shop_name} · Qty: {item.quantity}</div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          {item.food_type}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-mono">
                        <span className="font-bold text-slate-900">Rs. {item.discounted_price}</span>{' '}
                        <span className="line-through text-slate-400 text-[11px]">Rs. {item.original_price}</span>
                        <span className="ml-1.5 text-emerald-600 font-bold">(-{discountPct}%)</span>
                      </td>

                      <td className="px-4 py-4 text-slate-600 max-w-[160px] truncate">
                        {item.location}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                            item.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Reserved'
                              ? 'bg-blue-100 text-blue-800'
                              : item.status === 'Claimed'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'Claimed' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Claimed')}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Force mark as Claimed"
                            >
                              Mark Claimed
                            </button>
                          )}

                          {item.status !== 'Available' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'Available')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Re-open as Available"
                            >
                              Make Available
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
