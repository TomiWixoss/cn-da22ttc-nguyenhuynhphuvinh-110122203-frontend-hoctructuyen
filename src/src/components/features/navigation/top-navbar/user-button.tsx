"use client";
import React from "react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useLogout } from "@/lib/hooks/use-auth";
import { useGamification } from "@/lib/hooks/use-gamification";
import {
  User,
  LogOut,
  MoreHorizontal,
  Package,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentRole } from "@/lib/auth/role-manager";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { ConnectedAvatarDisplay } from "@/components/features/avatar";
import Link from "next/link";
import { useTheme } from "next-themes";

export const UserButton: React.FC = () => {
  const { getUser } = useAuthStatus();
  const { userGamification } = useGamification();
  const user = getUser();
  const displayName = user?.fullName || user?.name || "Người dùng";
  const { logout } = useLogout();
  const { theme, setTheme } = useTheme();

  const currentRole = getCurrentRole();
  const currentLevel = userGamification?.current_level || 1;

  const translateRole = (role?: string | null): string => {
    if (!role) return "Người dùng";
    switch (role.toLowerCase()) {
      case "admin":
        return "Quản trị viên";
      case "teacher":
        return "Giảng viên";
      case "student":
        return "Sinh viên";
      default:
        return "Người dùng";
    }
  };

  const translatedRole = translateRole(currentRole);

  // Hiển thị level cho student, role cho các role khác
  const displayRole =
    currentRole === "student" ? `Cấp ${currentLevel}` : translatedRole;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md p-1.5 text-left text-sm font-semibold transition-colors",
            "hover:bg-primary/5 focus:bg-primary/5 focus:outline-none"
          )}
        >
          {/* Avatar */}
          {currentRole === "student" ? (
            <div className="h-8 w-8 flex-shrink-0">
              <ConnectedAvatarDisplay
                size="small"
                showName={false}
                showRarity={false}
              />
            </div>
          ) : (
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
              )}
            >
              <User className="h-4 w-4" />
            </div>
          )}

          {/* THAY ĐỔI: Sử dụng lg:flex để hiển thị trên màn hình lớn */}
          <div className="hidden min-w-0 flex-1 flex-col items-start lg:flex">
            <span className="truncate max-w-full text-sm font-medium leading-tight">
              {displayName}
            </span>
            <span className="truncate max-w-full text-xs text-muted-foreground">
              {displayRole}
            </span>
          </div>

          {/* THAY ĐỔI: Sử dụng lg:inline */}
          <MoreHorizontal className="hidden h-4 w-4 text-muted-foreground lg:inline" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* THAY ĐỔI: Menu sinh viên với mục Tiến trình cấp độ */}
        {currentRole === "student" && (
          <>
            <Link href="/dashboard/student/profile">
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/student/level-progression">
              <DropdownMenuItem className="cursor-pointer">
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Tiến trình cấp độ</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/student/inventory">
              <DropdownMenuItem className="cursor-pointer">
                <Package className="mr-2 h-4 w-4" />
                <span>Kho đồ</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="cursor-pointer"
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Chế độ sáng</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Chế độ tối</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={logout}
          className="text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
