import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authAPI } from "./mongodb";

export type Profile = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  trustScore: number;
  reportCount: number;
  isAdmin: boolean;
};

type User = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await authAPI.getMe();
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile().then(p => {
        setProfile(p);
        setUser(p ? { id: p._id, email: p.email } : null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    try {
      const p = await fetchProfile();
      setProfile(p);
    } catch {}
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
  };

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser({ id: res.data._id, email: res.data.email });
    setProfile(res.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser({ id: res.data._id, email: res.data.email });
    setProfile(res.data);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}