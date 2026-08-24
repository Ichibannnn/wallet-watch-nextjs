"use client";

import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";

import { getTitleForPath } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMobileNav } from "@/components/dashboard/mobile-nav-context";

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getTitleForPath(pathname);
  const { toggle } = useMobileNav();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-header px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-2 ">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Open navigation"
          className="lg:hidden"
        >
          <Menu />
        </Button>
        {/* <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h1> */}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <Button size="lg">
          <Plus />
          <span className="hidden sm:inline">Transaction</span>
          <span className="sr-only sm:hidden">New transaction</span>
        </Button>
      </div>
    </header>
  );
}
