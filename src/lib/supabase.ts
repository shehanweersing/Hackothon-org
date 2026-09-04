import { Listing, Reservation, ListingFormData, ListingStatus } from './types';
import { INITIAL_SEED_LISTINGS, INITIAL_SEED_RESERVATIONS } from './seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate whether real Supabase credentials have been provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

// Helper for Supabase REST API calls via standard fetch
const supabaseFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Prefer': 'return=representation',
    ...(options.headers || {}),
  };

  const cleanUrl = supabaseUrl.replace(/\/+$/, '');
  const res = await fetch(`${cleanUrl}/rest/v1/${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase error (${res.status}): ${errorText}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// LocalStorage Keys for resilient demo fallback mode
const LOCAL_STORAGE_LISTINGS_KEY = 'surplus_lk_listings_v1';
const LOCAL_STORAGE_RESERVATIONS_KEY = 'surplus_lk_reservations_v1';

// Initialize local fallback store with rich seed data if empty
const getLocalListings = (): Listing[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(INITIAL_SEED_LISTINGS));
    return INITIAL_SEED_LISTINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_LISTINGS;
  }
};

const saveLocalListings = (listings: Listing[]) => {
  localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(listings));
  window.dispatchEvent(new Event('surplus_data_changed'));
};

const getLocalReservations = (): Reservation[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_RESERVATIONS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(INITIAL_SEED_RESERVATIONS));
    return INITIAL_SEED_RESERVATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_RESERVATIONS;
  }
};

const saveLocalReservations = (reservations: Reservation[]) => {
  localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(reservations));
  window.dispatchEvent(new Event('surplus_data_changed'));
};

// ============================================================================
// DATA ACCESS LAYER (Used seamlessly by Members 1, 2, 3, 4)
// Automatically directs queries to Supabase PostgREST or Local Demo Store
// ============================================================================

export async function fetchListings(): Promise<Listing[]> {
  if (isSupabaseConfigured) {
    try {
      const data = await supabaseFetch('listings?select=*&order=created_at.desc');
      if (data && Array.isArray(data) && data.length > 0) {
        return data as Listing[];
      }
    } catch (err) {
      console.warn('Supabase fetch error, falling back to local dataset:', err);
    }
  }
  return getLocalListings();
}

export async function createListing(formData: ListingFormData): Promise<{ data: Listing | null; error: string | null }> {
  const newListing: Listing = {
    id: crypto.randomUUID(),
    shop_name: formData.shop_name.trim(),
    food_name: formData.food_name.trim(),
    food_type: formData.food_type,
    quantity: Number(formData.quantity),
    original_price: Number(formData.original_price),
    discounted_price: Number(formData.discounted_price),
    pickup_window_start: new Date(formData.pickup_window_start).toISOString(),
    pickup_window_end: new Date(formData.pickup_window_end).toISOString(),
    location: formData.location.trim(),
    status: 'Available',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const data = await supabaseFetch('listings', {
        method: 'POST',
        body: JSON.stringify(newListing),
      });
      return { data: Array.isArray(data) ? data[0] : data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  }

  // Fallback store
  const current = getLocalListings();
  const updated = [newListing, ...current];
  saveLocalListings(updated);
  return { data: newListing, error: null };
}

export async function updateListing(id: string, updates: Partial<Listing>): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      await supabaseFetch(`listings?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const current = getLocalListings();
  const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
  saveLocalListings(updated);
  return { success: true };
}

export async function deleteListing(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      await supabaseFetch(`listings?id=eq.${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const current = getLocalListings();
  const updated = current.filter(item => item.id !== id);
  saveLocalListings(updated);
  return { success: true };
}

export async function createReservation(listingId: string, consumerName: string): Promise<{ reservation: Reservation | null; error: string | null }> {
  const newReservation: Reservation = {
    id: crypto.randomUUID(),
    listing_id: listingId,
    consumer_name: consumerName.trim(),
    reserved_at: new Date().toISOString(),
    pickup_confirmed: false,
  };

  if (isSupabaseConfigured) {
    try {
      // 1. Insert reservation
      const resData = await supabaseFetch('reservations', {
        method: 'POST',
        body: JSON.stringify(newReservation),
      });

      // 2. Update listing status to 'Reserved'
      await supabaseFetch(`listings?id=eq.${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Reserved' }),
      });

      return { reservation: Array.isArray(resData) ? resData[0] : resData, error: null };
    } catch (err: any) {
      return { reservation: null, error: err.message };
    }
  }

  // Fallback store
  const reservations = getLocalReservations();
  saveLocalReservations([newReservation, ...reservations]);

  const listings = getLocalListings();
  const updatedListings = listings.map(l => l.id === listingId ? { ...l, status: 'Reserved' as ListingStatus } : l);
  saveLocalListings(updatedListings);

  return { reservation: newReservation, error: null };
}

export async function confirmPickup(reservationId: string, listingId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      await supabaseFetch(`reservations?id=eq.${reservationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ pickup_confirmed: true }),
      });

      await supabaseFetch(`listings?id=eq.${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Claimed' }),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const reservations = getLocalReservations();
  saveLocalReservations(reservations.map(r => r.id === reservationId ? { ...r, pickup_confirmed: true } : r));

  const listings = getLocalListings();
  saveLocalListings(listings.map(l => l.id === listingId ? { ...l, status: 'Claimed' as ListingStatus } : l));

  return { success: true };
}

export async function fetchReservations(): Promise<Reservation[]> {
  if (isSupabaseConfigured) {
    try {
      const data = await supabaseFetch('reservations?select=*,listing:listings(*)&order=reserved_at.desc');
      if (data && Array.isArray(data)) return data as Reservation[];
    } catch (err) {
      console.warn('Error fetching Supabase reservations, fallback active:', err);
    }
  }
  const reservations = getLocalReservations();
  const listings = getLocalListings();
  return reservations.map(res => ({
    ...res,
    listing: listings.find(l => l.id === res.listing_id),
  }));
}

export function resetDemoData() {
  localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(INITIAL_SEED_LISTINGS));
  localStorage.setItem(LOCAL_STORAGE_RESERVATIONS_KEY, JSON.stringify(INITIAL_SEED_RESERVATIONS));
  window.dispatchEvent(new Event('surplus_data_changed'));
}
