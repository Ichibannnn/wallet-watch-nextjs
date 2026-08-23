/** A role as returned by the /api/roles endpoints. */
export type RoleRecord = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;

  /** Module + sub-module keys this role is tagged with. */
  modules: string[];
  _count: { users: number };
  createdAt: string;
  updatedAt: string;
};

/** A user as returned by the /api/users endpoints. */
export type UserRecord = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: string } | null;
  createdAt: string;
};

/** Pagination info returned alongside a paginated list endpoint. */
export type PageMeta = {
  /** 1-based index of the page in this response. */
  page: number;
  pageSize: number;

  /** Total rows matching the current search + filters (across all pages). */
  total: number;
  totalPages: number;
};
