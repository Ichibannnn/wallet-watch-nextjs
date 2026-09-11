"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, Ellipsis, Pencil, Plus, Search, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ModuleHeader } from "@/components/dashboard/module-header";
import { UserDialog } from "@/components/user-management/user-dialog";
import { getInitials } from "@/lib/auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, type PageSize } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PageMeta, RoleRecord, UserRecord } from "@/lib/user-management/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-table/data-tables-states";

const ALL = "all";
const NO_ROLE = "none";

const STATUS_ITEMS: Record<string, string> = {
  [ALL]: "All statuses",
  active: "Active",
  disabled: "Disabled",
};

export default function UserAccountsPage() {
  const { can, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  // Search + filter + pagination state.
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const canManage = can("user-accounts");
  const debouncedSearch = useDebouncedValue(search, 300);

  const confirm = useConfirm();

  const hasFilters = debouncedSearch !== "" || roleFilter !== ALL || statusFilter !== ALL;

  // Role dropdown labels (plus the "all"/"none" pseudo-options) so the trigger
  // shows the selected role's name instead of its raw id.
  const roleItems = useMemo(() => {
    const items: Record<string, string> = {
      [ALL]: "All roles",
      [NO_ROLE]: "No role",
    };

    for (const role of roles) items[role.id] = role.name;
    return items;
  }, [roles]);

  // Reset to the first page whenever the query (search, filters, size) changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, pageSize]);

  const usersQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter !== ALL) params.set("role", roleFilter);
    if (statusFilter !== ALL) params.set("status", statusFilter);
    return params.toString();
  }, [page, pageSize, debouncedSearch, roleFilter, statusFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      const res = await fetch(`/api/users?${usersQuery}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        setIsError(true);
        toast.error("Could not load user accounts.");
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setMeta(data.meta);
    } catch {
      setIsError(true);
      toast.error("Could not load user accounts.");
    } finally {
      setLoading(false);
    }
  }, [usersQuery]);

  // Roles are loaded once for the filter dropdown and the create/edit dialog.
  const loadRoles = useCallback(async () => {
    const res = await fetch("/api/roles?pageSize=100", { cache: "no-store" });
    if (res.ok) setRoles((await res.json()).roles);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function clearFilters() {
    setSearch("");
    setRoleFilter(ALL);
    setStatusFilter(ALL);
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(user: UserRecord) {
    setEditing(user);
    setDialogOpen(true);
  }

  async function handleArchive(user: UserRecord) {
    await confirm({
      title: `Archive ${user.name}?`,
      description: "They'll lose access until restored.",
      confirmLabel: "Archive",
      variant: "destructive",
      onConfirm: async () => {
        const res = await fetch(`/api/users/${user.id}`, { method: "PATCH" });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(payload.error ?? "Could not archive the user.");
          throw new Error("archive failed"); // keeps dialog open on failure
        }
        toast.success("User archived.");
        loadUsers();
      },
    });
  }

  async function handleRestore(user: UserRecord) {
    await confirm({
      title: `Restore ${user.name}?`,
      description: "They'll regain access immediately.",
      confirmLabel: "Restore",
      onConfirm: async () => {
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(payload.error ?? "Could not restore the user.");
          throw new Error("restore failed");
        }

        toast.success("User restored.");
        loadUsers();
      },
    });
  }

  // console.log("Status: ", STATUS_ITEMS);
  // console.log("StatusFilter", statusFilter);
  // console.log("Can:", canManage);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <ModuleHeader title="User Accounts" description="Create accounts, assign roles and enable or disable access." />

        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New user
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-1.5">
          <Label htmlFor="user-search" className="text-xs text-muted-foreground">
            Search
          </Label>

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="user-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-8" autoComplete="off" />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="user-role-filter" className="text-xs text-muted-foreground">
            Role
          </Label>
          <Select items={roleItems} value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? ALL)}>
            <SelectTrigger id="user-role-filter" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All roles</SelectItem>
              <SelectItem value={NO_ROLE}>No role</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="user-status-filter" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select items={STATUS_ITEMS} value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL)}>
            <SelectTrigger id="user-status-filter" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Clear
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
              <TableHead className="w-24 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton columns={4} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <ErrorState label="Couldn't load user accounts" description="Something went wrong on our end. Try again." onRetry={loadUsers} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <EmptyState
                    label={hasFilters ? "No users match your filters." : "No users yet."}
                    description={hasFilters ? "Try adjusting or clearing your search and filters." : "Create your first user to get started."}
                    action={hasFilters ? { label: "Clear filters", onClick: clearFilters } : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{getInitials(user.name)}</span>
                      <div className="leading-tight">
                        <p className="font-medium">
                          {user.name}
                          {user.id === currentUser.id && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role ? <Badge variant="outline">{user.role.name}</Badge> : <span className="text-xs text-muted-foreground">No role</span>}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Disabled"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost">
                              <Ellipsis />
                            </Button>
                          }
                        />

                        <DropdownMenuContent align="end">
                          {canManage && (
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              <Pencil className="size-4" /> Edit
                            </DropdownMenuItem>
                          )}

                          {canManage && user.id !== currentUser.id && user.isActive ? (
                            <DropdownMenuItem onClick={() => handleArchive(user)}>
                              <Archive className="size-4" /> Archive
                            </DropdownMenuItem>
                          ) : !user.isActive ? (
                            <DropdownMenuItem onClick={() => handleRestore(user)}>
                              <ArchiveRestore className="size-4" /> Restore
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && !loading && <Pagination meta={meta} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} disabled={loading} />}
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} roles={roles} onSaved={loadUsers} />
    </div>
  );
}
