"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { MODULES, ACTIONS, ACTION_COLUMN, type Action } from "@/lib/rbac/modules";
import type { ModulePermission } from "@/lib/rbac/permissions";

export type PermissionState = Record<string, ModulePermission>;

/** Build a full, all-false matrix (one row per module). */
export function emptyMatrix(): PermissionState {
  const state: PermissionState = {};
  for (const { key } of MODULES) {
    state[key] = { module: key, canCreate: false, canRead: false, canUpdate: false, canDelete: false };
  }
  return state;
}

/** Merge a role's saved permissions onto a full matrix (missing modules stay false). */
export function matrixFromPermissions(permissions: ModulePermission[]): PermissionState {
  const state = emptyMatrix();
  for (const p of permissions) {
    if (state[p.module]) {
      state[p.module] = {
        module: p.module,
        canCreate: p.canCreate,
        canRead: p.canRead,
        canUpdate: p.canUpdate,
        canDelete: p.canDelete,
      };
    }
  }
  return state;
}

export function matrixToPermissions(state: PermissionState): ModulePermission[] {
  return MODULES.map(({ key }) => state[key]);
}

const ACTION_LABEL: Record<Action, string> = {
  create: "Create",
  read: "Read",
  update: "Update",
  delete: "Delete",
};

export function PermissionMatrix({
  value,
  onChange,
  disabled = false,
}: {
  value: PermissionState;
  onChange: (next: PermissionState) => void;
  disabled?: boolean;
}) {
  function toggle(moduleKey: string, action: Action, checked: boolean) {
    const column = ACTION_COLUMN[action];
    const row = value[moduleKey];
    // Read is the base capability: granting any of C/U/D implies read; removing
    // read removes the rest, so a role can't e.g. delete without being able to read.
    const next: ModulePermission = { ...row, [column]: checked };
    if (action !== "read" && checked) next.canRead = true;
    if (action === "read" && !checked) {
      next.canCreate = false;
      next.canUpdate = false;
      next.canDelete = false;
    }
    onChange({ ...value, [moduleKey]: next });
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-4 py-2.5 font-medium">Module</th>
            {ACTIONS.map((action) => (
              <th key={action} className="px-3 py-2.5 text-center font-medium">
                {ACTION_LABEL[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULES.map(({ key, label }) => (
            <tr key={key} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 font-medium">{label}</td>
              {ACTIONS.map((action) => (
                <td key={action} className="px-3 py-2.5 text-center">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={value[key][ACTION_COLUMN[action]]}
                      onCheckedChange={(checked) => toggle(key, action, checked === true)}
                      disabled={disabled}
                      aria-label={`${label} ${ACTION_LABEL[action]}`}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
