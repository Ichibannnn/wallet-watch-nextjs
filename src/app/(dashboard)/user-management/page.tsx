import { redirect } from "next/navigation";

export default function UserManagementPage() {
  // Default the section to its first sub-module.
  redirect("/user-management/users");
}
