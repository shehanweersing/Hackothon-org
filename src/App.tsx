import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { BrowseView } from './components/member3/BrowseView';
import { PostListingForm } from './components/member1/PostListingForm';
import { MyListingsView } from './components/member1/MyListingsView';
import { AdminDashboard } from './components/member4/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { fetchListings, fetchReservations } from './lib/supabase';
import { Listing, Reservation } from './lib/types';
import { useLiveExpiryTicker } from './components/member2/useExpiryTracker';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { role } = useAuth();

  // Load latest data from Supabase / fallback storage
  const loadData = useCallback(async () => {
    try {
      const [fetchedListings, fetchedReservations] = await Promise.all([
        fetchListings(),
        fetchReservations(),
      ]);
      setListings(fetchedListings);
      setReservations(fetchedReservations);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for cross-component storage changes
    const handleDataChange = () => {
      loadData();
    };
    window.addEventListener('surplus_data_changed', handleDataChange);
    return () => window.removeEventListener('surplus_data_changed', handleDataChange);
  }, [loadData]);

  // Member 2: Live ticker hook that counts down and flips status to 'Expired' in real-time
  useLiveExpiryTicker(listings);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        listings={listings}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Loading Surplus LK Marketplace...
            </p>
          </div>
        ) : (
          <>
            {currentPage === 'landing' && (
              <LandingPage
                listings={listings}
                onNavigate={handleNavigate}
                onRefresh={loadData}
              />
            )}

            {currentPage === 'browse' && (
              <BrowseView
                listings={listings}
                onRefresh={loadData}
              />
            )}

            {currentPage === 'post' && (
              <div className="py-4">
                <PostListingForm
                  onSuccess={() => {
                    loadData();
                    handleNavigate('my-listings');
                  }}
                />
              </div>
            )}

            {currentPage === 'my-listings' && (
              <MyListingsView
                listings={listings}
                onRefresh={loadData}
                onNavigateToPost={() => handleNavigate('post')}
              />
            )}

            {currentPage === 'admin' && (
              <AdminDashboard
                listings={listings}
                reservations={reservations}
                onRefresh={loadData}
              />
            )}

            {currentPage === 'about' && (
              <AboutPage />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal (Sign In / Register / Fast Demo Logins) */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
