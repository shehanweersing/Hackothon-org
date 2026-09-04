import React, { useState } from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Store, 
  BarChart3, 
  Info, 
  Home, 
  Menu, 
  X, 
  Flame, 
  UserCheck, 
  ShieldCheck, 
  ChefHat, 
  Sparkles,
  LogIn,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, Listing } from '../../lib/types';
import { calculateExpiry } from '../member2/useExpiryTracker';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  listings: Listing[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, listings }) => {
  const { user, role, isAuthenticated, logout, openAuthModal, loginAsDemo, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Active listings count
  const activeListingsCount = listings.filter(
    l => l.status === 'Available' && !calculateExpiry(l).isExpired
  ).length;

  const navLinks = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'browse', label: 'Browse Food', icon: ShoppingBag, badge: activeListingsCount },
    { id: 'post', label: 'Post Listing', icon: PlusCircle, roleHint: 'provider' },
    { id: 'my-listings', label: 'My Listings', icon: Store, roleHint: 'provider' },
    { id: 'admin', label: 'Analytics & Admin', icon: BarChart3, roleHint: 'admin' },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (pageId: string) => {
    // Access control checks
    if (pageId === 'post' || pageId === 'my-listings') {
      if (!isAuthenticated) {
        openAuthModal('login', 'provider');
        return;
      }
      if (role !== 'provider' && role !== 'admin') {
        switchRole('provider');
      }
    }
    if (pageId === 'admin') {
      if (!isAuthenticated) {
        openAuthModal('login', 'admin');
        return;
      }
      if (role !== 'admin') {
        switchRole('admin');
      }
    }

    onNavigate(pageId);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'provider':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'admin':
        return 'bg-slate-900 text-white border-slate-700';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Surplus
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LK 🇱🇰
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block -mt-1 hidden sm:block">
                Save Food · Save Money
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth & Profile Box */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                      {user.fullName || user.email}
                    </div>
                    <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase border ${getRoleBadgeStyle(user.role)}`}>
                      {user.shopName ? user.shopName : user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-slate-200 shadow-xl p-3 space-y-2 z-50 animate-fade-in">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      {user.shopName && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                          Store: {user.shopName}
                        </p>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Active Account Mode
                      </span>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
                        <button
                          onClick={() => { switchRole('consumer'); setProfileDropdownOpen(false); }}
                          className={`py-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            user.role === 'consumer' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Consumer
                        </button>
                        <button
                          onClick={() => { switchRole('provider'); setProfileDropdownOpen(false); }}
                          className={`py-1 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            user.role === 'provider' ? 'bg-white text-amber-800 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Provider
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                        Switch Demo Persona
                      </span>
                      <div className="space-y-1">
                        <button
                          onClick={() => { loginAsDemo('provider_paan'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                          <span>Paan Paan Bakery (Provider)</span>
                        </button>

                        <button
                          onClick={() => { loginAsDemo('consumer_kasun'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kasun Fernando (Consumer)</span>
                        </button>

                        <button
                          onClick={() => { loginAsDemo('admin'); setProfileDropdownOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                          <span>Platform Admin</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={async () => {
                          await logout();
                          setProfileDropdownOpen(false);
                          onNavigate('landing');
                        }}
                        className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup', 'consumer')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user ? (
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase border ${getRoleBadgeStyle(user.role)}`}>
                {user.role}
              </span>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-xl"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          {/* User Status Bar */}
          {isAuthenticated && user ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[10px] text-slate-500">{user.email} · {user.shopName || user.role}</p>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  setMobileMenuOpen(false);
                  onNavigate('landing');
                }}
                className="px-2.5 py-1 text-rose-600 bg-rose-50 rounded-xl text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                className="py-2 text-xs font-bold bg-slate-100 rounded-xl text-slate-800"
              >
                Sign In
              </button>
              <button
                onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }}
                className="py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-400" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
