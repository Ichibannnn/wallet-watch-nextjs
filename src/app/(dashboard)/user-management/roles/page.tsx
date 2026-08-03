import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function UserRolesPage() {
  return (
    <div>
      <ModuleHeader
        title="User Roles"
        description="Assign Admin or User roles to control access (RBAC)."
      />
      <ModulePlaceholder label="Role assignment (Admin / User) goes here" />
    </div>
  );
}
