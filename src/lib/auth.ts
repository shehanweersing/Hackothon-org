import { UserRole } from './types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  shopName?: string;
  location?: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface StoredUserAccount {
  user: AuthUser;
  passwordHash: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

// Local fallback accounts for 1-click demo logins
export const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  provider_paan: {
    id: 'user-provider-paan-paan',
    email: 'contact@paanpaan.lk',
    role: 'provider',
    fullName: 'Ravi Jayawardena',
    shopName: 'Paan Paan Bakery',
    location: 'Colombo 03 (Kollupitiya)',
    createdAt: new Date().toISOString(),
  },
  provider_sponge: {
    id: 'user-provider-sponge',
    email: 'orders@sponge.lk',
    role: 'provider',
    fullName: 'Malik Perera',
    shopName: 'Sponge Pastry Shop',
    location: 'Colombo 03 (Galle Road)',
    createdAt: new Date().toISOString(),
  },
  consumer_kasun: {
    id: 'user-consumer-kasun',
    email: 'kasun.fernando@gmail.com',
    role: 'consumer',
    fullName: 'Kasun Fernando',
    location: 'Colombo 04 (Bambalapitiya)',
    createdAt: new Date().toISOString(),
  },
  admin: {
    id: 'user-admin-surplus',
    email: 'admin@surplus.lk',
    role: 'admin',
    fullName: 'Surplus Admin Team',
    createdAt: new Date().toISOString(),
  },
};

const AUTH_STORAGE_KEY = 'surplus_lk_auth_session_v1';
const REGISTERED_ACCOUNTS_KEY = 'surplus_lk_registered_users_v1';

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null) {
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  window.dispatchEvent(new Event('surplus_auth_changed'));
}

export function updateUserSessionRole(newRole: UserRole, shopName?: string): AuthSession | null {
  const current = getStoredSession();
  if (!current || !current.user) return null;

  const updatedUser: AuthUser = {
    ...current.user,
    role: newRole,
    shopName: shopName || current.user.shopName || (newRole === 'provider' ? 'My Local Bakery' : undefined),
  };

  const updatedSession: AuthSession = {
    ...current,
    user: updatedUser,
  };

  const accounts = getRegisteredAccounts();
  const cleanEmail = updatedUser.email.toLowerCase().trim();
  if (accounts[cleanEmail]) {
    accounts[cleanEmail].user = updatedUser;
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  saveSession(updatedSession);
  return updatedSession;
}

function getRegisteredAccounts(): Record<string, StoredUserAccount> {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveRegisteredAccount(email: string, user: AuthUser, password: string) {
  const accounts = getRegisteredAccounts();
  accounts[email.toLowerCase().trim()] = {
    user,
    passwordHash: btoa(password),
  };
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

/**
 * Sign Up with Supabase Auth (or Fallback Local Auth)
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  role: UserRole,
  fullName: string,
  shopName?: string,
  location?: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  let createdUser: AuthUser = {
    id: crypto.randomUUID(),
    email: email.trim(),
    role: role,
    fullName: fullName.trim(),
    shopName: shopName ? shopName.trim() : undefined,
    location: location ? location.trim() : undefined,
    createdAt: new Date().toISOString(),
  };

  let tokenData: { access_token?: string; refresh_token?: string } = {};

  if (isSupabaseConfigured) {
    try {
      const cleanUrl = supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          data: {
            role,
            full_name: fullName.trim(),
            shop_name: shopName ? shopName.trim() : '',
            location: location ? location.trim() : '',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If user already exists on Supabase, don't fail registration locally
        if (!data.msg?.includes('already registered')) {
          console.warn('Supabase signup notice:', data);
        }
      } else {
        if (data.id || data.user?.id) {
          createdUser.id = data.id || data.user?.id;
        }
        tokenData = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        };
      }
    } catch (err: any) {
      console.warn('Supabase Auth network notice, registering locally:', err);
    }
  }

  // Save registered account so user can immediately sign in even if email confirmation is pending
  saveRegisteredAccount(email, createdUser, password);

  const session: AuthSession = {
    user: createdUser,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
  };

  saveSession(session);
  return { user: createdUser, error: null };
}

/**
 * Sign In with Supabase Auth (or Fallback Local Auth)
 */
export async function supabaseSignIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check if it's one of the built-in demo accounts
  for (const acc of Object.values(DEMO_ACCOUNTS)) {
    if (acc.email.toLowerCase() === cleanEmail) {
      saveSession({ user: acc });
      return { user: acc, error: null };
    }
  }

  // 2. Check locally registered accounts cache
  const localAccounts = getRegisteredAccounts();
  const registered = localAccounts[cleanEmail];

  if (isSupabaseConfigured) {
    try {
      const cleanUrl = supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const userMetadata = data.user?.user_metadata || {};
        const user: AuthUser = {
          id: data.user?.id || crypto.randomUUID(),
          email: data.user?.email || cleanEmail,
          role: (userMetadata.role as UserRole) || registered?.user?.role || 'consumer',
          fullName: userMetadata.full_name || registered?.user?.fullName || cleanEmail.split('@')[0],
          shopName: userMetadata.shop_name || registered?.user?.shopName,
          location: userMetadata.location || registered?.user?.location,
          createdAt: data.user?.created_at || new Date().toISOString(),
        };

        const session: AuthSession = {
          user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        };

        saveSession(session);
        return { user, error: null };
      }

      // Handle "Email not confirmed" by auto-authenticating seamlessly for testing
      const errorMsg = data.error_description || data.msg || data.message || '';
      if (errorMsg.toLowerCase().includes('email not confirmed')) {
        const role: UserRole = registered?.user?.role || (cleanEmail.includes('provider') || cleanEmail.includes('bakery') ? 'provider' : cleanEmail.includes('admin') ? 'admin' : 'consumer');
        const user: AuthUser = registered?.user || {
          id: data.user?.id || crypto.randomUUID(),
          email: cleanEmail,
          role: role,
          fullName: cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        saveRegisteredAccount(cleanEmail, user, password);
        saveSession({ user });
        return { user, error: null };
      }

      // If credentials failed and we have no local match
      if (!registered) {
        throw new Error(errorMsg || 'Invalid email or password');
      }
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.toLowerCase().includes('email not confirmed')) {
        const role: UserRole = registered?.user?.role || (cleanEmail.includes('provider') || cleanEmail.includes('bakery') ? 'provider' : cleanEmail.includes('admin') ? 'admin' : 'consumer');
        const user: AuthUser = registered?.user || {
          id: crypto.randomUUID(),
          email: cleanEmail,
          role: role,
          fullName: cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
        };
        saveRegisteredAccount(cleanEmail, user, password);
        saveSession({ user });
        return { user, error: null };
      }
      if (registered && registered.passwordHash === btoa(password)) {
        saveSession({ user: registered.user });
        return { user: registered.user, error: null };
      }
      return { user: null, error: err.message || 'Invalid email or password' };
    }
  }

  // 3. Fallback verification against local registered accounts
  if (registered) {
    if (registered.passwordHash === btoa(password)) {
      saveSession({ user: registered.user });
      return { user: registered.user, error: null };
    }
    return { user: null, error: 'Incorrect password. Please try again.' };
  }

  // 4. Default auto-generate profile for testing
  const role: UserRole = cleanEmail.includes('provider') || cleanEmail.includes('bakery') ? 'provider' : cleanEmail.includes('admin') ? 'admin' : 'consumer';
  const user: AuthUser = {
    id: crypto.randomUUID(),
    email: cleanEmail,
    role,
    fullName: cleanEmail.split('@')[0],
    shopName: role === 'provider' ? 'My Local Bakery' : undefined,
    createdAt: new Date().toISOString(),
  };

  saveRegisteredAccount(cleanEmail, user, password);
  saveSession({ user });
  return { user, error: null };
}

/**
 * Sign Out
 */
export async function supabaseSignOut(): Promise<void> {
  const session = getStoredSession();
  if (isSupabaseConfigured && session?.accessToken) {
    try {
      const cleanUrl = supabaseUrl.replace(/\/+$/, '');
      await fetch(`${cleanUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  saveSession(null);
}
