import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../lib/types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  providerShopName: string;
  setProviderShopName: (name: string) => void;
  activeToast: string | null;
  showToast: (msg: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('surplus_user_role') as UserRole) || 'consumer';
  });

  const [providerShopName, setProviderShopNameState] = useState<string>(() => {
    return localStorage.getItem('surplus_provider_shop') || 'Paan Paan Bakery';
  });

  const [activeToast, setActiveToast] = useState<string | null>(null);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('surplus_user_role', newRole);
    showToast(`Switched view to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)} mode`);
  };

  const setProviderShopName = (name: string) => {
    setProviderShopNameState(name);
    localStorage.setItem('surplus_provider_shop', name);
  };

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => {
      setActiveToast(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        providerShopName,
        setProviderShopName,
        activeToast,
        showToast,
      }}
    >
      {children}
      {/* Global Toast Notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-sm font-medium">{activeToast}</p>
        </div>
      )}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
