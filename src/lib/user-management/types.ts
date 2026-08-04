import type { ModulePermission } from "@/lib/rbac/permissions";

/** A role as returned by the /api/roles endpoints. */
export type RoleRecord = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: ModulePermission[];
  _count: { users: number };
  createdAt: string;
  updatedAt: string;
};

/** A user as returned by the /api/users endpoints. */
export type UserRecord = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string } | null;
  createdAt: string;
};
