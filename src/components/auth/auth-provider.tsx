"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { clearUser, getStoredUser, type AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-side route guard. Reads the signed-in user from localStorage and
 * redirects to /signin when there is none, so protected content never renders
 * for a signed-out visitor.
 *
 * NOTE: this is UX-level gating only. localStorage is readable by any script on
 * the page and is never checked on the server, so the underlying routes are not
 * truly protected. Real protection needs an httpOnly session cookie verified in
 * the server (e.g. Next's proxy.ts).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.replace("/signin");
      return;
    }
    setUser(stored);
    setChecked(true);
  }, [router]);

  function logout() {
    clearUser();
    router.replace("/signin");
  }

  // Nothing to render until we've confirmed a user (prevents a flash of the
  // protected dashboard before the redirect fires).
  if (!checked || !user) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
