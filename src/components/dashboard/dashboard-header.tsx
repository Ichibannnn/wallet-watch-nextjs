"use client";

import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { getTitleForPath } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getTitleForPath(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button size="lg">
          <Plus />
          Transaction
        </Button>
      </div>
    </header>
  );
}
