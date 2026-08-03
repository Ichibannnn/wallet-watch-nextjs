import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function CategoriesPage() {
  return (
    <div>
      <ModuleHeader
        title="Categories"
        description="Organize transactions with custom income and expense categories."
      />
      <ModulePlaceholder label="Categories list goes here" />
    </div>
  );
}
