"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  PageMeta,
  RoleRecord,
  UserRecord,
} from "@/lib/user-management/types";
import type { PageSize } from "@/components/ui/pagination";

export const ALL = "all";
export const NO_ROLE = "none";

type FilterState = {
  search: string;
  roleFilter: string;
  statusFilter: string;
  page: number;
  pageSize: PageSize;
};

type FilterAction =
  | { type: "SEARCH"; value: string }
  | { type: "ROLE"; value: string }
  | { type: "STATUS"; value: string }
  | { type: "PAGE"; value: number }
  | { type: "PAGE_SIZE"; value: PageSize }
  | { type: "CLEAR" };

const initialFilters: FilterState = {
  search: "",
  roleFilter: ALL,
  statusFilter: ALL,
  page: 1,
  pageSize: 25,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SEARCH":
      return { ...state, search: action.value };
    case "ROLE":
      return { ...state, roleFilter: action.value };
    case "STATUS":
      return { ...state, statusFilter: action.value };
    case "PAGE":
      return { ...state, page: action.value };
    case "PAGE_SIZE":
      return { ...state, pageSize: action.value };
    case "CLEAR":
      return { ...state, search: "", roleFilter: ALL, statusFilter: ALL };
    default:
      return state;
  }
}

export function useUserAccountsTable() {
  const [filters, dispatch] = useReducer(filterReducer, initialFilters);
  const { search, roleFilter, statusFilter, page, pageSize } = filters;

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PageMeta | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const hasFilters =
    debouncedSearch !== "" || roleFilter !== ALL || statusFilter !== ALL;

  const roleItems = useMemo(() => {
    const items: Record<string, string> = {
      [ALL]: "All roles",
      [NO_ROLE]: "No role",
    };
    for (const role of roles) items[role.id] = role.name;
    return items;
  }, [roles]);

  // Jump back to page 1 whenever the effective query changes.
  useEffect(() => {
    dispatch({ type: "PAGE", value: 1 });
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
    try {
      const res = await fetch(`/api/users?${usersQuery}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Could not load user accounts.");
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [usersQuery]);

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

  return {
    users,
    roles,
    loading,
    meta,
    roleItems,
    hasFilters,
    search,
    setSearch: (value: string) => dispatch({ type: "SEARCH", value }),
    roleFilter,
    setRoleFilter: (value: string) => dispatch({ type: "ROLE", value }),
    statusFilter,
    setStatusFilter: (value: string) => dispatch({ type: "STATUS", value }),
    page,
    setPage: (value: number) => dispatch({ type: "PAGE", value }),
    pageSize,
    setPageSize: (value: PageSize) => dispatch({ type: "PAGE_SIZE", value }),
    clearFilters: () => dispatch({ type: "CLEAR" }),
    refetch: loadUsers,
  };
}
