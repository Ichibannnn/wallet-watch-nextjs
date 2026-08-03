import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function AccountsPage() {
  return (
    <div>
      <ModuleHeader
        title="Accounts"
        description="Manage your wallets, bank accounts and balances."
      />
      <ModulePlaceholder label="Accounts list goes here" />
    </div>
  );
}
