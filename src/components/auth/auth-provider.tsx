"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import type { AuthRole, AuthUser } from "@/lib/auth";
import { navItems } from "@/lib/dashboard-nav";
import { hasModuleAccess, type ModuleAccess } from "@/lib/rbac/permissions";
import type { ModuleKey } from "@/lib/rbac/modules";

/**
 * The RBAC module (or sub-module) that owns a given dashboard pathname, if any.
 * Sub-module links are matched first so /user-management/roles gates on
 * "user-roles" rather than the parent "user-management".
 */

function moduleForPath(pathname: string): ModuleKey | undefined {
  for (const item of navItems) {
    for (const child of item.children ?? []) {
      if (pathname === child.href || pathname.startsWith(`${child.href}/`)) {
        return child.module;
      }
    }
    if (
      item.href !== "/" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`))
    ) {
      return item.module;
    }
  }
  return undefined;
}

/**
 * First route the user can actually open, checking sub-module links before their
 * parent so we never land on a grouping page (e.g. /user-management) the user
 * can't drill into — which would bounce straight back here.
 */
function firstAccessibleHref(modules: ModuleAccess): string | null {
  for (const item of navItems) {
    for (const child of item.children ?? []) {
      if (child.module && hasModuleAccess(modules, child.module))
        return child.href;
    }
    if (!item.children && item.module && hasModuleAccess(modules, item.module))
      return item.href;
  }
  return null;
}

type AuthContextValue = {
  user: AuthUser;
  role: AuthRole;
  modules: ModuleAccess;
  /** True if the signed-in user's role is tagged with `module`. */
  can: (module: ModuleKey) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-side session gate. Hydrates the signed-in user, role and permission
 * matrix from GET /api/me (the server verifies the httpOnly cookie), and
 * redirects to /signin when there is no valid session.
 *
 * This drives UX (which nav/pages/actions to show). It is not the security
 * boundary — every mutation is re-checked server-side in the Route Handlers
 * via lib/rbac/guard.ts.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<{
    user: AuthUser;
    role: AuthRole;
    modules: ModuleAccess;
  } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/signin");
          return;
        }
        const data = await res.json();
        if (!active) return;
        setSession({ user: data.user, role: data.role, modules: data.modules });
        setChecked(true);
      } catch {
        router.replace("/signin");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [router]);

  // Route-level guard: if the user opens a module page they can't read (e.g. by
  // typing the URL), send them to the first module they can read, or /signin.
  useEffect(() => {
    if (!session) return;
    const module = moduleForPath(pathname);
    if (!module || hasModuleAccess(session.modules, module)) return;

    const fallback = firstAccessibleHref(session.modules);
    router.replace(fallback ?? "/signin");
  }, [session, pathname, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/signin");
  }

  // Nothing to render until we've confirmed a session (prevents a flash of the
  // protected dashboard before any redirect fires).
  if (!checked || !session) {
    return null;
  }

  const value: AuthContextValue = {
    user: session.user,
    role: session.role,
    modules: session.modules,
    can: (module) => hasModuleAccess(session.modules, module),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
