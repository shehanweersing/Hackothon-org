import React from 'react';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { FoodType } from '../../lib/types';
import { calculateSmartDiscount } from '../../lib/aiDiscount';

interface AIDiscountHelperProps {
  originalPrice: number | string;
  foodType: FoodType;
  pickupStart: string;
  pickupEnd: string;
  quantity: number | string;
  onApplyDiscount: (suggestedPrice: number) => void;
}

/**
 * MEMBER 4: AI Smart Discount Suggestion Component
 * Displays intelligent dynamic pricing recommendations based on perishability,
 * time window urgency, and inventory volume.
 */
export const AIDiscountHelper: React.FC<AIDiscountHelperProps> = ({
  originalPrice,
  foodType,
  pickupStart,
  pickupEnd,
  quantity,
  onApplyDiscount,
}) => {
  const numPrice = Number(originalPrice) || 0;
  const numQty = Number(quantity) || 1;

  if (numPrice <= 0) {
    return (
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>Enter an original price to calculate an AI-optimized markdown rate.</span>
      </div>
    );
  }

  const recommendation = calculateSmartDiscount(
    numPrice,
    pickupStart,
    pickupEnd,
    foodType,
    numQty
  );

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/40 border border-emerald-200/80 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            AI Dynamic Pricing Recommendation
          </h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          {recommendation.discountPercentage}% OFF
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        {recommendation.rationale}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-200/60">
        <div>
          <span className="text-xs text-slate-500 block">Recommended Price</span>
          <span className="text-base font-extrabold text-slate-900">
            LKR {recommendation.recommendedPrice.toLocaleString()}{' '}
            <span className="text-xs font-normal text-emerald-700">
              (Save LKR {recommendation.savingsAmount.toLocaleString()})
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onApplyDiscount(recommendation.recommendedPrice)}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Apply AI Price</span>
        </button>
      </div>
    </div>
  );
};
