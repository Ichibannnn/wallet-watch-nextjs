"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Wallet } from "lucide-react";

import { navItems, type NavChild } from "@/lib/dashboard-nav";
import { getInitials } from "@/lib/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname, nested = false }: { item: NavChild; pathname: string; nested?: boolean }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        nested && "ml-4 gap-2.5 py-1.5 text-[0.8rem]",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon className={cn("size-[1.1rem] shrink-0", nested && "size-4")} />
      {item.label}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();

  // Show a nav item only when the user can read its module.
  const items = navItems.filter((item) => !item.module || can(item.module, "read"));

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-sidebar-foreground">Wallet Watch</p>
          <p className="text-[0.65rem] font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Personal Finance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <div key={item.href} className="space-y-1">
            <NavLink item={item} pathname={pathname} />
            {item.children && isActive(pathname, item.href) && (
              <div className="space-y-1">
                {item.children.map((child) => (
                  <NavLink key={child.href} item={child} pathname={pathname} nested />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(user.name)}
          </span>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.name}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-[1.1rem]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
