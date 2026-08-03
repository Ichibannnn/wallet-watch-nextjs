import { ModuleHeader, ModulePlaceholder } from "@/components/dashboard/module-header";

export default function StatisticsPage() {
  return (
    <div>
      <ModuleHeader
        title="Statistics"
        description="Visualize spending trends and cash flow over time."
      />
      <ModulePlaceholder label="Charts and insights go here" />
    </div>
  );
}
