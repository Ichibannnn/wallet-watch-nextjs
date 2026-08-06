import type { ModuleAccess } from "@/lib/rbac/permissions";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthRole = {
  id: string;
  name: string;
} | null;

/** Shape returned by GET /api/me — the client's full RBAC state. */
export type AuthSession = {
  user: AuthUser;
  role: AuthRole;
  modules: ModuleAccess;
};

/** "Miguel Reyes" -> "MR" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
