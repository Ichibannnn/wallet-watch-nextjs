/**
 * Single source of truth for the RBAC-protected modules. The Roles permission
 * matrix, the sidebar, and every server-side permission check derive from this
 * list, so adding a module here wires it through the whole app.
 */
export const MODULES = [
  { key: "transactions", label: "Transactions" },
  { key: "statistics", label: "Statistics" },
  { key: "accounts", label: "Accounts" },
  { key: "categories", label: "Categories" },
  { key: "user-management", label: "User Management" },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];

export const ACTIONS = ["create", "read", "update", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

/** Prisma `Permission.can*` column for a given action. */
export const ACTION_COLUMN: Record<Action, "canCreate" | "canRead" | "canUpdate" | "canDelete"> = {
  create: "canCreate",
  read: "canRead",
  update: "canUpdate",
  delete: "canDelete",
};

export function isModuleKey(value: string): value is ModuleKey {
  return MODULES.some((m) => m.key === value);
}
