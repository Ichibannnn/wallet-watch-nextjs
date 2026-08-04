import { z } from "zod";

import { MODULES } from "@/lib/rbac/modules";

const moduleKeys = MODULES.map((m) => m.key) as [string, ...string[]];

export const permissionSchema = z.object({
  module: z.enum(moduleKeys),
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
});

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters"),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  permissions: z.array(permissionSchema),
});

export type RoleInput = z.infer<typeof roleSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
