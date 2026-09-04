import { FoodType } from './types';

export interface AIDiscountRecommendation {
  recommendedPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  urgencyLevel: 'high' | 'medium' | 'standard';
  rationale: string;
}

/**
 * MEMBER 4: AI-Assisted Smart Discount Recommender
 * Evaluates food category perishability, remaining pickup duration, and quantity
 * to maximize sell-through rate before expiry.
 */
export function calculateSmartDiscount(
  originalPrice: number,
  pickupWindowStart: string,
  pickupWindowEnd: string,
  foodType: FoodType,
  quantity: number = 1
): AIDiscountRecommendation {
  if (!originalPrice || originalPrice <= 0) {
    return {
      recommendedPrice: 0,
      discountPercentage: 0,
      savingsAmount: 0,
      urgencyLevel: 'standard',
      rationale: 'Please enter a valid original price first.',
    };
  }

  // Calculate window duration in minutes
  const start = new Date(pickupWindowStart).getTime();
  const end = new Date(pickupWindowEnd).getTime();
  const durationMinutes = Math.max(15, Math.round((end - (isNaN(start) ? Date.now() : start)) / (1000 * 60)));

  // 1. Base Discount based on Time Urgency
  let discountPct = 40; // Default 40% markdown

  if (durationMinutes <= 60) {
    // Under 1 hour window: High urgency clearance
    discountPct = 65;
  } else if (durationMinutes <= 120) {
    // 1 to 2 hours: Moderate urgency
    discountPct = 50;
  } else if (durationMinutes <= 240) {
    // 2 to 4 hours: Standard end-of-day
    discountPct = 40;
  } else {
    // > 4 hours: Early listing
    discountPct = 30;
  }

  // 2. Perishability Adjustments
  let categoryNote = '';
  switch (foodType) {
    case 'Bakery':
      discountPct += 5; // Baked goods turn stale quickly
      categoryNote = 'Bakery items lose crispness quickly.';
      break;
    case 'Meals':
      discountPct += 10; // Cooked hot meals have shortest shelf-life
      categoryNote = 'Cooked meals require urgent sell-through.';
      break;
    case 'Produce':
      discountPct += 5;
      categoryNote = 'Fresh produce needs same-day consumption.';
      break;
    case 'Other':
      break;
  }

  // 3. Volume Clearance Adjustment
  if (quantity >= 6) {
    discountPct += 5;
    categoryNote += ' Bulk quantity bonus applied.';
  }

  // Clamp discount between 25% and 75%
  discountPct = Math.min(75, Math.max(25, discountPct));

  // Calculate rounded discounted price
  const rawDiscountedPrice = originalPrice * (1 - discountPct / 100);
  // Round to nearest 10 LKR for friendly consumer pricing
  const recommendedPrice = Math.max(50, Math.round(rawDiscountedPrice / 10) * 10);
  const actualDiscountPct = Math.round(((originalPrice - recommendedPrice) / originalPrice) * 100);
  const savings = originalPrice - recommendedPrice;

  let urgencyLevel: 'high' | 'medium' | 'standard' = 'standard';
  if (actualDiscountPct >= 60) urgencyLevel = 'high';
  else if (actualDiscountPct >= 45) urgencyLevel = 'medium';

  const rationale = `AI recommends ${actualDiscountPct}% off (LKR ${recommendedPrice.toLocaleString()}) for a ${Math.round(durationMinutes / 60 * 10) / 10}h pickup window. ${categoryNote}`;

  return {
    recommendedPrice,
    discountPercentage: actualDiscountPct,
    savingsAmount: savings,
    urgencyLevel,
    rationale,
  };
}
