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

export type NavChild = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to see this item (RBAC). Omit = everyone. */
  roles?: Array<"admin" | "user">;
};

export type NavItem = NavChild & {
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Statistics", href: "/statistics", icon: ChartColumnBig },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Categories", href: "/categories", icon: Tags },
  {
    label: "User Management",
    href: "/user-management",
    icon: ShieldCheck,
    roles: ["admin"],
    children: [
      { label: "User Accounts", href: "/user-management/users", icon: Users },
      { label: "User Roles", href: "/user-management/roles", icon: UserCog },
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
