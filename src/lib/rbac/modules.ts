/**
 * Single source of truth for the RBAC-tagged modules. Roles are tagged with the
 * modules (and sub-modules) they can access; the Roles dialog, the sidebar, and
 * every server-side access check derive from this list, so adding a module (or a
 * sub-module) here wires it through the whole app.
 *
 * A module may declare `subModules`. Sub-module keys are tagged independently of
 * their parent, which is how "User Management → User Accounts / User Roles" in
 * the role form works: check the parent to reveal the section, check each child
 * to grant that page.
 */
export type SubModule = { key: string; label: string };
export type Module = { key: string; label: string; subModules?: readonly SubModule[] };

export const MODULES = [
  { key: "transactions", label: "Transactions" },
  { key: "statistics", label: "Statistics" },
  { key: "accounts", label: "Accounts" },
  { key: "categories", label: "Categories" },
  {
    key: "user-management",
    label: "User Management",
    subModules: [
      { key: "user-accounts", label: "User Accounts" },
      { key: "user-roles", label: "User Roles" },
    ],
  },
] as const satisfies readonly Module[];

// --- Key types, derived from the config so they stay in sync ---------------

type TopModuleKey = (typeof MODULES)[number]["key"];

type SubModuleKeyOf<M> = M extends { subModules: readonly (infer S)[] }
  ? S extends { key: infer K }
    ? K
    : never
  : never;
type SubModuleKey = SubModuleKeyOf<(typeof MODULES)[number]>;

/** Any taggable key: a top-level module or a sub-module. */
export type ModuleKey = TopModuleKey | SubModuleKey;

// --- Lookups ----------------------------------------------------------------

/** Every taggable key (top-level modules + all sub-modules). */
export const ALL_MODULE_KEYS: ModuleKey[] = MODULES.flatMap((m) => [
  m.key,
  ...("subModules" in m ? m.subModules.map((s) => s.key) : []),
]);

/** Human-readable label for any module or sub-module key. */
export const MODULE_LABELS: Record<string, string> = Object.fromEntries(
  MODULES.flatMap((m) => [
    [m.key, m.label] as [string, string],
    ...("subModules" in m ? m.subModules.map((s) => [s.key, s.label] as [string, string]) : []),
  ]),
);

/** Map each sub-module key back to its parent module key. */
const SUB_TO_PARENT: Record<string, string> = Object.fromEntries(
  MODULES.flatMap((m) =>
    "subModules" in m ? m.subModules.map((s) => [s.key, m.key] as [string, string]) : [],
  ),
);

export function isModuleKey(value: string): value is ModuleKey {
  return ALL_MODULE_KEYS.includes(value as ModuleKey);
}

/** The sub-modules declared under a module (empty if it has none). */
export function subModulesOf(moduleKey: string): readonly SubModule[] {
  const mod = MODULES.find((m) => m.key === moduleKey);
  return mod && "subModules" in mod ? mod.subModules : [];
}

/** The parent module key of a sub-module, or undefined for a top-level key. */
export function parentModuleOf(key: string): string | undefined {
  return SUB_TO_PARENT[key];
}
