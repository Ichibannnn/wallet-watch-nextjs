import { z } from "zod";

import { ALL_MODULE_KEYS } from "@/lib/rbac/modules";

const moduleKeys = ALL_MODULE_KEYS as [string, ...string[]];

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name must be at least 2 characters"),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  /** The module + sub-module keys this role is tagged with. */
  modules: z.array(z.enum(moduleKeys)),
});

export type RoleInput = z.infer<typeof roleSchema>;
