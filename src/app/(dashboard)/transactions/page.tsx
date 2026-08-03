import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function TransactionsPage() {
  return (
    <div>
      <ModuleHeader
        title="Transactions"
        description="Track income, expenses and transfers across all your accounts."
      />
      <ModulePlaceholder label="Transactions table goes here" />
    </div>
  );
}
