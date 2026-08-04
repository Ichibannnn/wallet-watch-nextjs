// Client-safe permission types + pure checks. No server imports here so the
// browser (AuthProvider, sidebar) can reuse `hasPermission`.
import { ACTION_COLUMN, type Action, type ModuleKey } from "./modules";

export type ModulePermission = {
  module: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

/** Does this permission set grant `action` on `module`? */
export function hasPermission(
  permissions: ModulePermission[],
  module: ModuleKey,
  action: Action,
): boolean {
  const entry = permissions.find((p) => p.module === module);
  if (!entry) return false;
  return entry[ACTION_COLUMN[action]];
}
