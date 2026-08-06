import { AuthProvider } from "@/components/auth/auth-provider";
import { MobileNavProvider } from "@/components/dashboard/mobile-nav-context";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MobileNavProvider>
        <div className="flex h-screen overflow-hidden bg-muted/40">
          <DashboardSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <DashboardHeader />

            {/* Outlet */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </MobileNavProvider>
    </AuthProvider>
  );
}
