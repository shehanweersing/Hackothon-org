import React from 'react';
import { 
  Info, 
  Leaf, 
  Users, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Clock, 
  ShoppingBag, 
  Code2, 
  Building2,
  CheckCircle2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Info className="w-3.5 h-3.5" />
          <span>Mission & Technical Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Solving Sri Lanka's Food Waste Crisis
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          How technology, AI-assisted pricing, and hyper-local surplus distribution rescue meals and empower local businesses.
        </p>
      </div>

      {/* Sri Lanka Food Waste Context */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">The Problem in Sri Lanka</h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          In Sri Lanka's urban hubs like Colombo, Kandy, and Galle, bakeries (*Paan Paan, Sponge, Perera & Sons*), pastry shops, and short-eat eateries prepare generous daily batches of perishable food. At closing time, thousands of edible buns, pastries, rice packets, and kottu portions are routinely discarded because of rigid display timelines.
        </p>

        <p className="text-sm text-slate-600 leading-relaxed">
          Simultaneously, severe economic challenges and high food inflation have increased living costs for urban students, workers, and families. <strong>Surplus</strong> bridges this gap by creating an end-of-day flash clearance marketplace where bakeries recoup their ingredient costs and consumers obtain quality nutrition at 40%–70% lower prices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50">
            <strong className="block text-slate-900 text-sm font-black">&gt; 3,900 Tons</strong>
            <span className="text-slate-500">Daily urban solid waste generated in Sri Lanka</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <strong className="block text-slate-900 text-sm font-black">55%+ Organic</strong>
            <span className="text-slate-500">Portion of landfill waste composed of edible food</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50">
            <strong className="block text-slate-900 text-sm font-black">40% - 70% Off</strong>
            <span className="text-slate-500">Consumer discounts on rescued meals via Surplus</span>
          </div>
        </div>
      </div>

      {/* Team Member Architecture Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">Modular Feature Split by Team Member</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Member 1 */}
          <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                MEMBER 1
              </span>
              <span className="text-xs font-semibold text-slate-400">Post & Provider Management</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Food Provider & Food Listing</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>"Post Listing" form with rich inputs (foodName, shopName, category, pricing, pickup window).</li>
              <li>Friendly inline validation with specific errors (e.g. discount &lt; original, valid quantity, future window).</li>
              <li>"My Listings" view with provider shop filter, edit, and deletion capabilities.</li>
            </ul>
          </div>

          {/* Member 2 */}
          <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                MEMBER 2
              </span>
              <span className="text-xs font-semibold text-slate-400">Live Expiry & Alerts</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Expiry Monitoring & Live Notifications</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Live 1-second countdown ticker calculating time remaining on every card.</li>
              <li>Automatic status flip to "Expired" in database/state once pickup window closes.</li>
              <li>In-app alert banners warning providers and alerting consumers to closing-soon flash deals.</li>
            </ul>
          </div>

          {/* Member 3 */}
          <div className="p-6 rounded-3xl bg-white border border-teal-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-100 text-teal-800">
                MEMBER 3
              </span>
              <span className="text-xs font-semibold text-slate-400">Consumer Marketplace</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Consumer, Location & Reservation</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>"Browse" catalog querying Available listings with multi-filter (category, location, flash deals).</li>
              <li>Sorting by discount % or time remaining.</li>
              <li>Reservation modal updating `reservations` table and marking status to `Reserved`.</li>
              <li>One-click pickup verification setting `pickup_confirmed = true` and status to `Claimed`.</li>
            </ul>
          </div>

          {/* Member 4 */}
          <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                MEMBER 4
              </span>
              <span className="text-xs font-semibold text-slate-400">AI & Impact Analytics</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">AI Pricing & Admin Analytics</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Real-time admin metrics: active listings, claimed meals, food diverted in kg, LKR saved.</li>
              <li>AI Smart Discount Helper recommending markdown % based on perishability and urgency.</li>
              <li>Category and location analytics distribution bars + complete listings audit table.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack & Supabase Architecture Tradeoff Note */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold">Tech Stack & Database Architecture Note</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Frontend:</strong> React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Canvas Confetti. <br />
          <strong>Backend / DB:</strong> Supabase (PostgreSQL) with `listings` and `reservations` tables, Postgres CHECK constraints (`check_discount_lower_than_original`, `check_pickup_window_valid`).
        </p>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <strong className="text-amber-300 block mb-1">Architecture Tradeoff (Hackathon Scope):</strong>
          To ensure effortless live demonstration without mandatory login friction, authentication is handled via a role selector (Consumer / Provider / Admin). Row Level Security (RLS) is enabled in Postgres with public SELECT, INSERT, and UPDATE policies.
        </div>
      </div>
    </div>
  );
};
