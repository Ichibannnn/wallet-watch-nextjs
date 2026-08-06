// Client-safe access types + pure checks. No server imports here so the browser
// (AuthProvider, sidebar) can reuse `hasModuleAccess`.
import { parentModuleOf, subModulesOf, type ModuleKey } from "./modules";

/** The set of module + sub-module keys a role (and therefore a user) is tagged with. */
export type ModuleAccess = string[];

/** Is this module/sub-module key tagged directly? */
export function hasModuleAccess(access: ModuleAccess, key: ModuleKey): boolean {
  return access.includes(key);
}

/**
 * Should a top-level module appear for this user? True when the module itself is
 * tagged or any of its sub-modules are — so tagging only "User Roles" still
 * surfaces the "User Management" parent.
 */
export function isModuleVisible(access: ModuleAccess, moduleKey: string): boolean {
  if (access.includes(moduleKey)) return true;
  return subModulesOf(moduleKey).some((s) => access.includes(s.key));
}

/** True if `key` is a sub-module whose parent is also worth showing. */
export { parentModuleOf };
