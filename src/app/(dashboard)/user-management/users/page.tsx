"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ModuleHeader } from "@/components/dashboard/module-header";
import { UserDialog } from "@/components/user-management/user-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { getInitials } from "@/lib/auth";
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
import type { RoleRecord, UserRecord } from "@/lib/user-management/types";

export default function UserAccountsPage() {
  const { can, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  const canCreate = can("user-management", "create");
  const canUpdate = can("user-management", "update");
  const canDelete = can("user-management", "delete");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/roles", { cache: "no-store" }),
      ]);
      if (!usersRes.ok || !rolesRes.ok) {
        toast.error("Could not load user accounts.");
        return;
      }
      setUsers((await usersRes.json()).users);
      setRoles((await rolesRes.json()).roles);
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

  function openEdit(user: UserRecord) {
    setEditing(user);
    setDialogOpen(true);
  }

  async function handleDelete(user: UserRecord) {
    if (!confirm(`Delete ${user.name}? This can't be undone.`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(payload.error ?? "Could not delete the user.");
      return;
    }
    toast.success("User deleted.");
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <ModuleHeader
          title="User Accounts"
          description="Create accounts, assign roles and enable or disable access."
        />
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New user
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Loading users…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No users yet.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {getInitials(user.name)}
                      </span>
                      <div className="leading-tight">
                        <p className="font-medium">
                          {user.name}
                          {user.id === currentUser.id && (
                            <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant="outline">{user.role.name}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No role</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {canDelete && user.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        roles={roles}
        onSaved={load}
      />
    </div>
  );
}
