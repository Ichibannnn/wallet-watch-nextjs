import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function UserAccountsPage() {
  return (
    <div>
      <ModuleHeader
        title="User Accounts"
        description="View, enable or disable registered user accounts."
      />
      <ModulePlaceholder label="User accounts table goes here" />
    </div>
  );
}
