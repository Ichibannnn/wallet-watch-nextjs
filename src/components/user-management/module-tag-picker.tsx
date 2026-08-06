"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MODULES } from "@/lib/rbac/modules";

/**
 * Tag which modules (and sub-modules) a role can access. Mirrors the role
 * process form: a Modules box of top-level checkboxes, and a Sub Modules box
 * that reveals a parent's sub-modules once that parent is checked.
 *
 * `value` is the flat list of tagged keys (module + sub-module keys mixed).
 */
export function ModuleTagPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const tagged = new Set(value);

  function setKey(key: string, checked: boolean, alsoRemove: string[] = []) {
    const next = new Set(tagged);
    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
      // Un-tagging a parent module drops its now-orphaned sub-modules too.
      for (const k of alsoRemove) next.delete(k);
    }
    onChange([...next]);
  }

  // Parents that are both checked and actually have sub-modules to reveal.
  const parentsWithSubs = MODULES.filter(
    (m) => "subModules" in m && m.subModules.length > 0 && tagged.has(m.key),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label>Modules</Label>
        <div className="rounded-lg border border-border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODULES.map((mod) => {
              const subKeys = "subModules" in mod ? mod.subModules.map((s) => s.key) : [];
              return (
                <label
                  key={mod.key}
                  className="flex items-center gap-2.5 text-sm font-medium"
                >
                  <Checkbox
                    checked={tagged.has(mod.key)}
                    onCheckedChange={(c) => setKey(mod.key, c === true, subKeys)}
                    disabled={disabled}
                    aria-label={mod.label}
                  />
                  {mod.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Sub Modules</Label>
        <div className="rounded-lg border border-border p-4">
          {parentsWithSubs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Check a module that has sub-modules (e.g. User Management) to tag them.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {parentsWithSubs.map((mod) => (
                <div key={mod.key} className="grid gap-2.5">
                  <p className="text-sm font-medium">{mod.label}</p>
                  <div className="grid grid-cols-1 gap-3 pl-1 sm:grid-cols-2">
                    {("subModules" in mod ? mod.subModules : []).map((sub) => (
                      <label
                        key={sub.key}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                      >
                        <Checkbox
                          checked={tagged.has(sub.key)}
                          onCheckedChange={(c) => setKey(sub.key, c === true)}
                          disabled={disabled}
                          aria-label={`${mod.label} ${sub.label}`}
                        />
                        {sub.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
