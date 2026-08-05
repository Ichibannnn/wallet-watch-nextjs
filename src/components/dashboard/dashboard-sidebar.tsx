"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut, Wallet } from "lucide-react";

import { navItems, type NavChild, type NavItem } from "@/lib/dashboard-nav";
import { getInitials } from "@/lib/auth";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const STORAGE_KEY = "ww:sidebar-collapsed";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function rowClasses(active: boolean, opts: { nested?: boolean } = {}) {
  return cn(
    "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    opts.nested && "ml-4 py-1.5 text-[0.8rem]",
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
  );
}

/** Label that slides + fades away when the sidebar collapses. */
function CollapsibleLabel({
  collapsed,
  className,
  children,
}: {
  collapsed: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      aria-hidden={collapsed}
      className={cn(
        "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
        collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[12rem] opacity-100",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A single leaf navigation link. Shows a tooltip only while collapsed. */
function NavLink({
  item,
  pathname,
  collapsed,
  nested = false,
}: {
  item: NavChild;
  pathname: string;
  collapsed: boolean;
  nested?: boolean;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Tooltip disabled={!collapsed}>
      <TooltipTrigger
        render={
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={rowClasses(active, { nested })}
          />
        }
      >
        <Icon className={cn("size-[1.1rem] shrink-0", nested && "size-4")} />
        <CollapsibleLabel collapsed={collapsed}>{item.label}</CollapsibleLabel>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * A parent module with sub-modules.
 * - Expanded: parent link + its sub-modules revealed inline (active route, or opened via icon click).
 * - Collapsed: a single icon with a tooltip; clicking it expands the sidebar and opens this group.
 */
function NavGroup({
  item,
  pathname,
  collapsed,
  openGroup,
  onOpenGroup,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  openGroup: string | null;
  onOpenGroup: (href: string) => void;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  const children = item.children ?? [];

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label={item.label}
              onClick={() => onOpenGroup(item.href)}
              className={rowClasses(active)}
            />
          }
        >
          <Icon className="size-[1.1rem] shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  const showChildren = active || openGroup === item.href;

  return (
    <div className="space-y-1">
      <NavLink item={item} pathname={pathname} collapsed={collapsed} />
      {showChildren && (
        <div className="space-y-1">
          {children.map((child) => (
            <NavLink key={child.href} item={child} pathname={pathname} collapsed={collapsed} nested />
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, can } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  // A parent group forced open after the user clicks its icon while collapsed.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Restore the persisted collapsed state after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // Let the active route drive which group is open once navigation happens.
  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  function persist(next: boolean) {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }

  function collapseSidebar() {
    setCollapsed(true);
    setOpenGroup(null);
    persist(true);
  }

  function expandSidebar(group: string | null = null) {
    setCollapsed(false);
    setOpenGroup(group);
    persist(false);
  }

  // Show a nav item only when the user can read its module.
  const items = navItems.filter((item) => !item.module || can(item.module, "read"));

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      {/* Collapse / expand handle pinned to the right edge */}
      <button
        type="button"
        onClick={() => (collapsed ? expandSidebar() : collapseSidebar())}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "absolute top-7 -right-3 z-10 flex size-6 items-center justify-center rounded-full",
          "border border-sidebar-border bg-sidebar text-sidebar-foreground/70 shadow-sm",
          "transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <ChevronLeft
          className={cn("size-4 transition-transform duration-300 ease-in-out", collapsed && "rotate-180")}
        />
      </button>

      {/* Brand */}
      <div className="flex items-center px-4 py-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-5" />
        </span>
        <CollapsibleLabel collapsed={collapsed} className="leading-tight">
          <span className="block text-sm font-bold text-sidebar-foreground">Wallet Watch</span>
          <span className="block text-[0.65rem] font-medium tracking-wide text-sidebar-foreground/60 uppercase">
            Personal Finance
          </span>
        </CollapsibleLabel>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-2">
        {items.map((item) =>
          item.children && item.children.length > 0 ? (
            <NavGroup
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              openGroup={openGroup}
              onOpenGroup={(href) => expandSidebar(href)}
            />
          ) : (
            <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ),
        )}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center rounded-lg px-1.5 py-1.5">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => expandSidebar()}
                    aria-label="Expand sidebar"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  />
                }
              >
                {getInitials(user.name)}
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(user.name)}
            </span>
          )}

          <CollapsibleLabel collapsed={collapsed} className="flex min-w-0 flex-1 items-center">
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold text-sidebar-foreground">{user.name}</span>
              <span className="block truncate text-xs text-sidebar-foreground/60">{user.email}</span>
            </span>

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="size-[1.1rem]" />
            </button>
          </CollapsibleLabel>
        </div>
      </div>
    </aside>
  );
}
