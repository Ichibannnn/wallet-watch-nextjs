"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PageMeta } from "@/lib/user-management/types";

/** Selectable rows-per-page values; `"all"` fetches every matching row. */
export const PAGE_SIZE_OPTIONS = [5, 25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number] | "all";

/** Labels for the rows-per-page dropdown, so the trigger shows real text. */
const PAGE_SIZE_ITEMS: Record<string, string> = {
  ...Object.fromEntries(PAGE_SIZE_OPTIONS.map((n) => [String(n), String(n)])),
  all: "All records",
};

/**
 * Footer pagination control for a server-paginated table. Shows a rows-per-page
 * selector, the current slice ("1–10 of 42"), and Prev/Next buttons, calling
 * `onPageChange` with a clamped 1-based page. Renders nothing while empty.
 */
export function Pagination({
  meta,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: {
  meta: PageMeta;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
  disabled?: boolean;
}) {
  const { page, total, totalPages } = meta;

  if (total === 0) return null;

  // meta.pageSize collapses to `total` for an "all records" query; use the
  // caller's selected size for the slice math so it stays stable.
  const size = pageSize === "all" ? total : pageSize;
  const first = (page - 1) * size + 1;
  const last = Math.min(page * size, total);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="rows-per-page"
            className="text-xs text-muted-foreground"
          >
            Rows per page
          </Label>
          <Select
            items={PAGE_SIZE_ITEMS}
            value={String(pageSize)}
            onValueChange={(v) =>
              onPageSizeChange(v === "all" ? "all" : (Number(v) as PageSize))
            }
            disabled={disabled}
          >
            <SelectTrigger id="rows-per-page" size="sm" className="min-w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground tabular-nums">
            {first}
          </span>
          –
          <span className="font-medium text-foreground tabular-nums">
            {last}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground tabular-nums">
            {total}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || !canPrev}
        >
          <ChevronLeft data-icon="inline-start" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !canNext}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
