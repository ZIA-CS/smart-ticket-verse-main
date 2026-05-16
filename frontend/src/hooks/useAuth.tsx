import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, clearToken, getToken, setToken, type AppUser } from "@/lib/api";

export type AppRole = "admin" | "staff" | "user";

interface AuthCtx {
  session: null;
  user: AppUser | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setRoles([]);
        return;
      }
      const res = await api.me();
      setUser(res.user);
      setRoles([res.user.role || "user"]);
    } catch {
      clearToken();
      setUser(null);
      setRoles([]);
    }
  };

  useEffect(() => {
    loadRoles().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setRoles([res.user.role || "user"]);
  };

  const register = async (payload: { email: string; password: string; firstName?: string; lastName?: string }) => {
    await api.register(payload);
    clearToken();
    setUser(null);
    setRoles([]);
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
    setRoles([]);
  };

  const refreshRoles = async () => {
    await loadRoles();
  };

  return (
    <Ctx.Provider value={{ session: null, user, roles, loading, signOut, signIn, register, refreshRoles }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const useHasRole = (role: AppRole) => {
  const { roles } = useAuth();
  return roles.includes(role);
};
