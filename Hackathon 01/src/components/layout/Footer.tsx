import React from 'react';
import { ShoppingBag, Heart, Shield, Sparkles, ExternalLink, Leaf } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                Surplus LK
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              A community-powered food rescue marketplace dedicated to curbing urban food waste in Sri Lanka.
              Connecting artisan bakeries, eateries, and home chefs with conscious food lovers for mutual economic and environmental benefit.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Diverting edible meals from landfills across Colombo, Kandy & Galle</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Browse Surplus Deals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('post')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Provider: List Surplus Food
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-listings')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  My Kitchen Listings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Admin & Impact Analytics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  About Sri Lanka Waste Crisis
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Built With
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>React 18 + Vite</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>Supabase PostgreSQL + RLS</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Tailwind CSS + Lucide</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>AI Dynamic Markdown Engine</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Surplus LK. Made with care for Sri Lanka's food security.</p>
          <p className="flex items-center gap-1">
            <span>Modular 4-Member Architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
