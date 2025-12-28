"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "@/components/features/navigation";
import { Button } from "@/components/ui/forms";
import { Menu } from "lucide-react";
import { LogoTransparent } from "@/components/ui/display";
import { useAuthGuard } from "@/lib/hooks/use-auth-guard";
import { AuthLoading } from "@/components/features/shared/loading";
import Link from "next/link";
// THAY ĐỔI: Import UserButton để sử dụng trên mobile header
import { UserButton } from "@/components/features/navigation/top-navbar/user-button";
import { AssignmentProvider } from "@/lib/contexts/assignment-context";
// --- THÊM IMPORT NÀY ---
import { AvatarProvider } from "@/lib/contexts/avatar-context";
import { getCurrentRole } from "@/lib/auth/role-manager";
import { ConnectionStatus } from "@/components/features/shared";

// Inner component để wrap với Suspense
function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentRole = getCurrentRole();

  return (
    <AvatarProvider>
      <AssignmentProvider>
        <div className="flex h-screen bg-muted/30">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* THAY ĐỔI: Header trên mobile giờ sẽ chứa cả UserButton */}
            <header className="md:hidden flex items-center justify-between h-16 px-4 bg-background border-b-2 border-slate-200 dark:border-slate-800">
              <Link href="/dashboard">
                <LogoTransparent
                  size="md"
                  showText={true}
                  waveEffect="enhanced"
                />
              </Link>

              <div className="flex items-center gap-2">
                {/* UserButton chỉ hiển thị cho student trên mobile */}
                {currentRole === "student" && <UserButton />}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Mở menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6">{children}</main>

            {/* Connection Status Indicator */}
            <ConnectionStatus />
          </div>
        </div>
      </AssignmentProvider>
    </AvatarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, isAuthorized } = useAuthGuard();

  if (isChecking || !isAuthorized) {
    return <AuthLoading />;
  }

  return (
    <Suspense fallback={<AuthLoading />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
