import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, AuthSession, getStoredSession, saveSession, supabaseSignIn, supabaseSignUp, supabaseSignOut, DEMO_ACCOUNTS } from '../lib/auth';
import { UserRole } from '../lib/types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, pass: string, role: UserRole, fullName: string, shopName?: string, location?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (demoKey: string) => void;
  authModalOpen: boolean;
  openAuthModal: (tab?: 'login' | 'signup', targetRole?: UserRole) => void;
  closeAuthModal: () => void;
  authModalTab: 'login' | 'signup';
  authTargetRole: UserRole;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authTargetRole, setAuthTargetRole] = useState<UserRole>('consumer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setSession(getStoredSession());
    };
    window.addEventListener('surplus_auth_changed', handleAuthChange);
    return () => window.removeEventListener('surplus_auth_changed', handleAuthChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const login = async (email: string, pass: string) => {
    const { user, error } = await supabaseSignIn(email, pass);
    if (error || !user) {
      return { success: false, error: error || 'Authentication failed' };
    }
    setSession({ user });
    showToast(`👋 Welcome back, ${user.fullName || user.email}!`);
    setAuthModalOpen(false);
    return { success: true };
  };

  const signup = async (
    email: string,
    pass: string,
    role: UserRole,
    fullName: string,
    shopName?: string,
    location?: string
  ) => {
    const { user, error } = await supabaseSignUp(email, pass, role, fullName, shopName, location);
    if (error || !user) {
      return { success: false, error: error || 'Signup failed' };
    }
    setSession({ user });
    showToast(`🎉 Account created for ${fullName}! Logged in as ${role.toUpperCase()}.`);
    setAuthModalOpen(false);
    return { success: true };
  };

  const logout = async () => {
    await supabaseSignOut();
    setSession(null);
    showToast('You have signed out successfully.');
  };

  const loginAsDemo = (demoKey: string) => {
    const demoUser = DEMO_ACCOUNTS[demoKey];
    if (demoUser) {
      saveSession({ user: demoUser });
      setSession({ user: demoUser });
      showToast(`⚡ Fast Login: Switched to ${demoUser.fullName} (${demoUser.role.toUpperCase()})`);
      setAuthModalOpen(false);
    }
  };

  const openAuthModal = (tab: 'login' | 'signup' = 'login', targetRole: UserRole = 'consumer') => {
    setAuthModalTab(tab);
    setAuthTargetRole(targetRole);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const user = session?.user || null;
  const role: UserRole = user?.role || 'consumer';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        signup,
        logout,
        loginAsDemo,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalTab,
        authTargetRole,
        toastMessage,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up flex items-center gap-3 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
