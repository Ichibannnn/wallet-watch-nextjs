"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { ModuleHeader } from "@/components/dashboard/module-header";
import { RoleDialog } from "@/components/user-management/role-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, type PageSize } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ALL_MODULE_KEYS, MODULE_LABELS } from "@/lib/rbac/modules";
import type { PageMeta, RoleRecord } from "@/lib/user-management/types";

const ALL = "all";

const TYPE_ITEMS: Record<string, string> = {
  [ALL]: "All types",
  system: "Built-in",
  custom: "Custom",
};

// Module dropdown labels (plus the "all" pseudo-option) so the trigger shows a
// real module name instead of its raw key.
const MODULE_ITEMS: Record<string, string> = {
  [ALL]: "All modules",
  ...Object.fromEntries(ALL_MODULE_KEYS.map((key) => [key, MODULE_LABELS[key]])),
};

/** The labels of the modules a role is tagged with, in config order. */
function taggedLabels(modules: string[]): string[] {
  return ALL_MODULE_KEYS.filter((key) => modules.includes(key)).map((key) => MODULE_LABELS[key]);
}

export default function UserRolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRecord | null>(null);

  // Search + filter + pagination state.
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [moduleFilter, setModuleFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);

  const canManage = can("user-roles");

  const hasFilters = debouncedSearch !== "" || typeFilter !== ALL || moduleFilter !== ALL;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, moduleFilter, pageSize]);

  const rolesQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilter !== ALL) params.set("type", typeFilter);
    if (moduleFilter !== ALL) params.set("module", moduleFilter);
    return params.toString();
  }, [page, pageSize, debouncedSearch, typeFilter, moduleFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/roles?${rolesQuery}`, { cache: "no-store" });
      if (!res.ok) {
        toast.error("Could not load roles.");
        return;
      }
      const data = await res.json();
      setRoles(data.roles);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [rolesQuery]);

  useEffect(() => {
    load();
  }, [load]);

  function clearFilters() {
    setSearch("");
    setTypeFilter(ALL);
    setModuleFilter(ALL);
  }

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
          description="Define roles and tag the modules each one can access."
        />
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New role
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid min-w-56 flex-1 gap-1.5">
          <Label htmlFor="role-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="role-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="role-type-filter" className="text-xs text-muted-foreground">
            Type
          </Label>
          <Select items={TYPE_ITEMS} value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? ALL)}>
            <SelectTrigger id="role-type-filter" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              <SelectItem value="system">Built-in</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="role-module-filter" className="text-xs text-muted-foreground">
            Module
          </Label>
          <Select
            items={MODULE_ITEMS}
            value={moduleFilter}
            onValueChange={(v) => setModuleFilter(v ?? ALL)}
          >
            <SelectTrigger id="role-module-filter" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All modules</SelectItem>
              {ALL_MODULE_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {MODULE_LABELS[key]}
                </SelectItem>
              ))}
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
              <TableHead>Role</TableHead>
              <TableHead>Modules</TableHead>
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
                  {hasFilters ? "No roles match your filters." : "No roles yet."}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const labels = taggedLabels(role.modules);
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
                      {labels.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No access</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {labels.map((label) => (
                            <Badge key={label} variant="outline" className="font-normal">
                              {label}
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
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(role)}
                            aria-label={`Edit ${role.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canManage && !role.isSystem && (
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

        {meta && !loading && (
          <Pagination
            meta={meta}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            disabled={loading}
          />
        )}
      </div>

      <RoleDialog open={dialogOpen} onOpenChange={setDialogOpen} role={editing} onSaved={load} />
    </div>
  );
}
