import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Utensils, 
  Tag, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  PlusCircle,
  Lock,
  LogIn
} from 'lucide-react';
import { FoodType, ListingFormData } from '../../lib/types';
import { createListing } from '../../lib/supabase';
import { AIDiscountHelper } from '../member4/AIDiscountHelper';
import { useAuth } from '../../context/AuthContext';

interface PostListingFormProps {
  onSuccess: () => void;
}

const SRI_LANKA_LOCATIONS = [
  'Colombo 03 (Kollupitiya)',
  'Colombo 04 (Bambalapitiya)',
  'Colombo 05 (Havelock Town)',
  'Colombo 07 (Cinnamon Gardens)',
  'Dehiwala (Mount Lavinia)',
  'Nugegoda High Level Rd',
  'Rajagiriya / Kotte',
  'Kandy (Peradeniya Road)',
  'Galle Fort',
];

export const PostListingForm: React.FC<PostListingFormProps> = ({ onSuccess }) => {
  const { user, role, isAuthenticated, openAuthModal, showToast } = useAuth();

  const formatForInput = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const defaultStart = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now
  const defaultEnd = new Date(Date.now() + 135 * 60 * 1000);  // 2h 15m from now

  const [formData, setFormData] = useState<ListingFormData>({
    shop_name: user?.shopName || 'Paan Paan Bakery',
    food_name: '',
    food_type: 'Bakery',
    quantity: 3,
    original_price: '',
    discounted_price: '',
    pickup_window_start: formatForInput(defaultStart),
    pickup_window_end: formatForInput(defaultEnd),
    location: user?.location || 'Colombo 03 (Kollupitiya)',
  });

  useEffect(() => {
    if (user?.shopName) {
      setFormData(prev => ({
        ...prev,
        shop_name: user.shopName || prev.shop_name,
        location: user.location || prev.location,
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Access guard check for Provider
  if (!isAuthenticated || (role !== 'provider' && role !== 'admin')) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg animate-fade-in space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Food Provider Sign In Required</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Posting surplus food requires a registered Food Provider (Bakery, Restaurant, or Kitchen) account.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login', 'provider')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In as Provider</span>
          </button>
          <button
            onClick={() => openAuthModal('signup', 'provider')}
            className="w-full sm:w-auto px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-2xl transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span>Register New Kitchen</span>
          </button>
        </div>
      </div>
    );
  }

  // Validation function with user-friendly specific error messages (Member 1 spec)
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const now = Date.now();

    if (!formData.shop_name.trim()) {
      newErrors.shop_name = 'Please enter your bakery, eatery, or kitchen name.';
    }

    if (!formData.food_name.trim()) {
      newErrors.food_name = 'Please describe the surplus food item(s) being listed.';
    }

    const qty = Number(formData.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      newErrors.quantity = 'Please enter a valid quantity (must be at least 1 portion).';
    }

    const orig = Number(formData.original_price);
    if (isNaN(orig) || orig <= 0) {
      newErrors.original_price = 'Please enter the regular retail original price (LKR).';
    }

    const disc = Number(formData.discounted_price);
    if (isNaN(disc) || disc <= 0) {
      newErrors.discounted_price = 'Please enter the discounted rescue price (LKR).';
    } else if (orig > 0 && disc >= orig) {
      newErrors.discounted_price = 'Discounted price should be lower than the original price.';
    }

    const startTime = new Date(formData.pickup_window_start).getTime();
    const endTime = new Date(formData.pickup_window_end).getTime();

    if (isNaN(startTime)) {
      newErrors.pickup_window_start = 'Please specify when pickup starts.';
    }

    if (isNaN(endTime)) {
      newErrors.pickup_window_end = 'Please specify when pickup ends.';
    } else if (endTime <= startTime) {
      newErrors.pickup_window_end = 'Pickup window must be in the future, and the end time must be after the start.';
    } else if (endTime <= now) {
      newErrors.pickup_window_end = 'Pickup end time cannot be in the past.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please specify the pickup location or neighborhood.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleApplyAIDiscount = (suggestedPrice: number) => {
    setFormData(prev => ({ ...prev, discounted_price: suggestedPrice }));
    if (errors.discounted_price) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.discounted_price;
        return copy;
      });
    }
    showToast(`Applied AI suggested price: LKR ${suggestedPrice.toLocaleString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await createListing(formData);
      if (error) {
        setServerError(error);
      } else {
        showToast(`🎉 "${formData.food_name}" successfully listed for rescue!`);
        onSuccess();
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20">
            <PlusCircle className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Provider Listing Form · {user?.shopName || user?.fullName}
            </span>
            <h2 className="text-2xl font-black tracking-tight">List Surplus Food</h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-emerald-100 mt-2">
          Turn your end-of-day surplus inventory into revenue and feed local food lovers before closing time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error saving listing:</span> {serverError}
            </div>
          </div>
        )}

        {/* Shop Name & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Bakery / Shop / Kitchen Name *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="e.g. Paan Paan, Sponge Pastry"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.shop_name
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.shop_name && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.shop_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pickup Area / City *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                name="location"
                list="sri-lanka-locations-list"
                value={formData.location}
                onChange={handleChange}
                placeholder="Select or type area"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.location
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              <datalist id="sri-lanka-locations-list">
                {SRI_LANKA_LOCATIONS.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            {errors.location && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.location}
              </p>
            )}
          </div>
        </div>

        {/* Food Item Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Surplus Food Name & Description *
            </label>
            <div className="relative">
              <Utensils className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="food_name"
                value={formData.food_name}
                onChange={handleChange}
                placeholder="e.g. Sourdough Loaves & Croissant Bag"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.food_name
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.food_name && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.food_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              name="food_type"
              value={formData.food_type}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              <option value="Bakery">Bakery & Pastries</option>
              <option value="Meals">Cooked Meals & Kottu</option>
              <option value="Produce">Fresh Produce & Fruits</option>
              <option value="Other">Other Groceries & Sweets</option>
            </select>
          </div>
        </div>

        {/* Quantity, Original Price, Discounted Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Portions / Qty *
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 4"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.quantity
                  ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                  : 'border-slate-200 focus:ring-emerald-500'
              }`}
            />
            {errors.quantity && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.quantity}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Original Price (LKR) *
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-3">Rs.</span>
              <input
                type="number"
                name="original_price"
                min="10"
                step="10"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="1500"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.original_price
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.original_price && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.original_price}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Discounted Price (LKR) *
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-emerald-600 absolute left-3.5 top-3">Rs.</span>
              <input
                type="number"
                name="discounted_price"
                min="0"
                step="10"
                value={formData.discounted_price}
                onChange={handleChange}
                placeholder="650"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 transition-all ${
                  errors.discounted_price
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.discounted_price && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.discounted_price}
              </p>
            )}
          </div>
        </div>

        {/* Member 4 AI Smart Discount Helper Integration */}
        <AIDiscountHelper
          originalPrice={formData.original_price}
          foodType={formData.food_type}
          pickupStart={formData.pickup_window_start}
          pickupEnd={formData.pickup_window_end}
          quantity={formData.quantity}
          onApplyDiscount={handleApplyAIDiscount}
        />

        {/* Pickup Window Start & End */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pickup Window Starts *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="datetime-local"
                name="pickup_window_start"
                value={formData.pickup_window_start}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.pickup_window_start
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.pickup_window_start && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.pickup_window_start}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pickup Window Closes (Expiry) *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="datetime-local"
                name="pickup_window_end"
                value={formData.pickup_window_end}
                onChange={handleChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.pickup_window_end
                    ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/40'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.pickup_window_end && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.pickup_window_end}
              </p>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Publishing Listing...</span>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>Publish Surplus Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
