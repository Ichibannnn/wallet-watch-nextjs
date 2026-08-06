import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/rbac/guard";
import { hasModuleAccess } from "@/lib/rbac/permissions";

export default async function UserManagementPage() {
  // Send the user to the first sub-module they can actually open.
  const user = await getCurrentUser();
  if (user && !hasModuleAccess(user.modules, "user-accounts") && hasModuleAccess(user.modules, "user-roles")) {
    redirect("/user-management/roles");
  }
  redirect("/user-management/users");
}
