export type FoodType = 'Bakery' | 'Meals' | 'Produce' | 'Other';

export type ListingStatus = 'Available' | 'Reserved' | 'Claimed' | 'Expired';

export type UserRole = 'consumer' | 'provider' | 'admin';

export interface Listing {
  id: string;
  shop_name: string;
  food_name: string;
  food_type: FoodType;
  quantity: number;
  original_price: number;
  discounted_price: number;
  pickup_window_start: string; // ISO 8601 string
  pickup_window_end: string;   // ISO 8601 string
  location: string;
  status: ListingStatus;
  created_at: string;
}

export interface Reservation {
  id: string;
  listing_id: string;
  consumer_name: string;
  reserved_at: string;
  pickup_confirmed: boolean;
  listing?: Listing;
}

export interface ListingFormData {
  shop_name: string;
  food_name: string;
  food_type: FoodType;
  quantity: number | string;
  original_price: number | string;
  discounted_price: number | string;
  pickup_window_start: string;
  pickup_window_end: string;
  location: string;
}

export interface ImpactStats {
  totalListings: number;
  activeListings: number;
  claimedCount: number;
  reservedCount: number;
  expiredCount: number;
  estimatedFoodSavedKg: number;
  totalMoneySavedLkr: number;
  averageDiscountPercent: number;
  topFoodType: string;
}
