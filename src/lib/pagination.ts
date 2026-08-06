// src/lib/pagination.ts
import type { PageMeta } from "@/lib/user-management/types";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/**
 * Read `page` / `pageSize` from a request's query string and turn them into
 * safe Prisma `skip` / `take` values. Both are clamped so a hand-crafted URL
 * can't ask for page 0, a negative page, or an unbounded page size.
 *
 * `pageSize=all` is a special case: it returns every matching row on a single
 * page (`take: undefined`), so the "All records" option can bypass paging.
 */
export function parsePagination(searchParams: URLSearchParams) {
  if (searchParams.get("pageSize") === "all") {
    return { page: 1, skip: 0, take: undefined as number | undefined };
  }
  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const pageSize = clamp(toInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), 1, MAX_PAGE_SIZE);
  return { page, skip: (page - 1) * pageSize, take: pageSize as number | undefined };
}

/**
 * Build the `meta` block returned alongside a paginated list. Pass the actual
 * `take` used (or `undefined` for an "all records" query, in which case the
 * whole result set counts as a single page).
 */
export function buildPageMeta(total: number, page: number, take: number | undefined): PageMeta {
  const pageSize = take ?? total;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return { page, pageSize, total, totalPages };
}

function toInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
