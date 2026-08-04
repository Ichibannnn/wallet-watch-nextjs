import {
  ArrowLeftRight,
  ChartColumnBig,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { ModuleKey } from "@/lib/rbac/modules";

export type NavChild = {
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * RBAC module this item belongs to. The sidebar shows the item only when the
   * signed-in user has `read` on this module. Omit = always visible.
   */
  module?: ModuleKey;
};

export type NavItem = NavChild & {
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight, module: "transactions" },
  { label: "Statistics", href: "/statistics", icon: ChartColumnBig, module: "statistics" },
  { label: "Accounts", href: "/accounts", icon: Wallet, module: "accounts" },
  { label: "Categories", href: "/categories", icon: Tags, module: "categories" },
  {
    label: "User Management",
    href: "/user-management",
    icon: ShieldCheck,
    module: "user-management",
    children: [
      { label: "User Accounts", href: "/user-management/users", icon: Users, module: "user-management" },
      { label: "User Roles", href: "/user-management/roles", icon: UserCog, module: "user-management" },
    ],
  },
];

/** Resolve the human-readable title for a given pathname. */
export function getTitleForPath(pathname: string): string {
  for (const item of navItems) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.href));
      if (child) return child.label;
    }
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return item.label;
    }
  }
  return "Dashboard";
}
