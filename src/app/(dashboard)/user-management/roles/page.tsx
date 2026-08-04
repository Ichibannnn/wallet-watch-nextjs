"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ModuleHeader } from "@/components/dashboard/module-header";
import { RoleDialog } from "@/components/user-management/role-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MODULES, ACTIONS, ACTION_COLUMN } from "@/lib/rbac/modules";
import type { ModulePermission } from "@/lib/rbac/permissions";
import type { RoleRecord } from "@/lib/user-management/types";

/** Short "Transactions: CRUD" style summary of what a permission row grants. */
function summarize(permissions: ModulePermission[]): { label: string; grants: string }[] {
  return MODULES.map(({ key, label }) => {
    const row = permissions.find((p) => p.module === key);
    const grants = row
      ? ACTIONS.filter((a) => row[ACTION_COLUMN[a]])
          .map((a) => a[0].toUpperCase())
          .join("")
      : "";
    return { label, grants };
  }).filter((entry) => entry.grants.length > 0);
}

export default function UserRolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRecord | null>(null);

  const canCreate = can("user-management", "create");
  const canUpdate = can("user-management", "update");
  const canDelete = can("user-management", "delete");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles", { cache: "no-store" });
      if (!res.ok) {
        toast.error("Could not load roles.");
        return;
      }
      const data = await res.json();
      setRoles(data.roles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(role: RoleRecord) {
    setEditing(role);
    setDialogOpen(true);
  }

  async function handleDelete(role: RoleRecord) {
    if (!confirm(`Delete the "${role.name}" role? This can't be undone.`)) return;
    const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error ?? "Could not delete the role.");
      return;
    }
    toast.success("Role deleted.");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <ModuleHeader
          title="User Roles"
          description="Define roles and the module permissions (RBAC) each one grants."
        />
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New role
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-20 text-center">Users</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading roles…
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No roles yet.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const summary = summarize(role.permissions);
                return (
                  <TableRow key={role.id}>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.isSystem && <Badge variant="secondary">Built-in</Badge>}
                      </div>
                      {role.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      {summary.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {summary.map((entry) => (
                            <Badge key={entry.label} variant="outline" className="font-normal">
                              {entry.label}: {entry.grants}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center align-top tabular-nums">
                      {role._count.users}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex justify-end gap-1">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(role)}
                            aria-label={`Edit ${role.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete && !role.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(role)}
                            aria-label={`Delete ${role.name}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={editing} onSaved={load} />
    </div>
  );
}
