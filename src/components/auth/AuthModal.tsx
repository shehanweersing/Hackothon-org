import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Store, 
  MapPin, 
  ChefHat, 
  ShoppingBag, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/types';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    closeAuthModal, 
    authModalTab, 
    authTargetRole, 
    login, 
    signup, 
    loginAsDemo 
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup'>(authModalTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(authTargetRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('Colombo 03 (Kollupitiya)');
  const [adminKey, setAdminKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(authModalTab);
    setSelectedRole(authTargetRole);
    setError(null);
  }, [authModalTab, authTargetRole, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      if (!email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to sign in.');
      }
    } else {
      // Sign Up validation
      if (!email || !password || !fullName) {
        setError('Please complete all required fields.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (selectedRole === 'provider' && !shopName.trim()) {
        setError('Please provide your Bakery or Eatery shop name.');
        setLoading(false);
        return;
      }
      if (selectedRole === 'admin' && adminKey !== 'admin2026') {
        setError('Invalid Admin Security Key. (Use "admin2026" for testing).');
        setLoading(false);
        return;
      }

      const res = await signup(
        email, 
        password, 
        selectedRole, 
        fullName, 
        selectedRole === 'provider' ? shopName : undefined,
        selectedRole === 'provider' ? location : undefined
      );
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to register account.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-slide-up">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-6 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20">
              <ShoppingBag className="w-5 h-5 text-emerald-100" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Surplus LK Account
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {tab === 'login' ? 'Sign In to Surplus' : 'Create an Account'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            {tab === 'login'
              ? 'Access your provider kitchen listings, saved reservations, and profile.'
              : 'Join Sri Lanka’s food rescue network as a consumer, food provider, or admin.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex gap-2 mt-4 bg-black/20 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'login' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(null); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'signup' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-100 hover:text-white'
              }`}
            >
              Register New
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <>
                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    I Want to Join As *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('consumer')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'consumer'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-600 mb-1" />
                      <div className="text-xs font-bold">Consumer</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-0.5">Rescue food</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('provider')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'provider'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <ChefHat className="w-4 h-4 text-amber-600 mb-1" />
                      <div className="text-xs font-bold">Food Provider</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-0.5">List surplus</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedRole === 'admin'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-600 mb-1" />
                      <div className="text-xs font-bold">Platform Admin</div>
                      <div className="text-[10px] text-slate-500 leading-none mt-0.5">Manage data</div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Kasun Fernando"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Provider Specific Details */}
                {selectedRole === 'provider' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Bakery / Restaurant / Kitchen Name *
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={shopName}
                          onChange={e => setShopName(e.target.value)}
                          placeholder="e.g. BreadTalk, Sponge Pastry"
                          className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Location / City *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="e.g. Colombo 03 (Kollupitiya)"
                          className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Admin Specific Key */}
                {selectedRole === 'admin' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Admin Passkey * (Hint: admin2026)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={adminKey}
                        onChange={e => setAdminKey(e.target.value)}
                        placeholder="Enter admin passkey"
                        className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to Surplus' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
              ⚡ 1-Click Fast Demo Logins (for Testing & Judges)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo('provider_paan')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Paan Paan Bakery</span>
                </div>
                <div className="text-[10px] text-amber-700">Provider Role</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('provider_sponge')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Sponge Pastry</span>
                </div>
                <div className="text-[10px] text-amber-700">Provider Role</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('consumer_kasun')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Kasun Fernando</span>
                </div>
                <div className="text-[10px] text-emerald-700">Consumer Role</div>
              </button>

              <button
                type="button"
                onClick={() => loginAsDemo('admin')}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                  <span>Platform Admin</span>
                </div>
                <div className="text-[10px] text-slate-600">Admin Role</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
