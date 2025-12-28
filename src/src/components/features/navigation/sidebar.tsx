"use client";

import { cn } from "@/lib/utils";
import { NavSection } from "./nav-section";
import Link from "next/link";
import { LogoTransparent } from "@/components/ui/display";
import { useEffect, useState, useRef } from "react";
import { getRoleBasedNavSections } from "./navigation-config";
import { useActiveNavigation } from "@/lib/hooks/use-active-navigation";
import { usePathname } from "next/navigation";
import { getCurrentRole, Role } from "@/lib/auth/role-manager";
import { UserButton } from "./top-navbar/user-button";
import { Button } from "@/components/ui/forms";
import { PlusCircle, KeyRound, User, LogOut, Bell, X } from "lucide-react";
import {
  StudentOnly,
  TeacherOnly,
  RoleGuard,
} from "@/components/features/auth/role-guard";
import JoinQuizModal from "@/components/features/quiz/join-quiz-modal";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useLogout } from "@/lib/hooks/use-auth";
// THAY ĐỔI: Import component mới
import { StudentStatsBar } from "./StudentStatsBar";
import { TeacherAssignmentSelector } from "./TeacherAssignmentSelector";
import { TeacherLink } from "@/components/ui/navigation/TeacherLink";

interface SidebarProps {
  className?: string;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  className,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const { getUser } = useAuthStatus();
  const { logout } = useLogout();
  const user = getUser();
  const displayName = user?.fullName || user?.name || "Người dùng";

  const [rawNavSections, setRawNavSections] = useState(
    getRoleBasedNavSections(null)
  );

  const { processedSections: navSections } =
    useActiveNavigation(rawNavSections);

  useEffect(() => {
    if (previousPathRef.current !== pathname && isMobileOpen) {
      onMobileClose();
    }
    previousPathRef.current = pathname;
  }, [pathname, isMobileOpen, onMobileClose]);

  useEffect(() => {
    const userRole = getCurrentRole();
    if (userRole) {
      setRawNavSections(getRoleBasedNavSections(userRole));
    }
  }, []);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "flex h-screen flex-col border-l-2 border-slate-200 dark:border-slate-800 bg-background transition-all duration-300 ease-in-out z-50 group",
          "fixed md:relative right-0",
          isMobileOpen ? "translate-x-0 w-64" : "translate-x-full",
          "md:translate-x-0 md:border-l-0 md:border-r-2",
          "md:w-20 lg:w-64",
          className
        )}
      >
        {/* === BỐ CỤC DESKTOP === */}
        <div className="hidden md:flex flex-col h-full">
          <div className="flex h-16 items-center px-4 shrink-0">
            {/* Khi sidebar mở rộng: logo bên trái, icon bên phải */}
            <div className="hidden lg:flex items-center justify-between w-full">
              <Link href="/" className="font-semibold">
                <LogoTransparent
                  size="md"
                  showText={true}
                  textClassName="inline"
                  waveEffect="enhanced"
                />
              </Link>

              {/* Icon thông báo cho sinh viên - chỉ khi sidebar mở rộng */}
              <StudentOnly>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
                  title="Thông báo"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </StudentOnly>
            </div>

            {/* Khi sidebar thu gọn: logo căn giữa, không có icon (dùng icon trong nav) */}
            <div className="lg:hidden flex items-center justify-center w-full">
              <Link href="/" className="font-semibold">
                <LogoTransparent
                  size="md"
                  showText={false}
                  waveEffect="enhanced"
                />
              </Link>
            </div>
          </div>

          <RoleGuard roles={[Role.TEACHER, Role.STUDENT]}>
            {/* SỬA LỖI: Đây là khối riêng cho DESKTOP */}
            <div className="px-3 py-4 flex justify-center border-y-2 border-slate-200 dark:border-slate-800">
              <TeacherOnly>
                <TeacherLink
                  href="/dashboard/teaching/quizzes/new"
                  className="block w-full"
                >
                  <Button
                    variant="default"
                    className="h-12 w-full lg:px-6 text-base justify-center"
                    is3DNoLayout={true}
                  >
                    <PlusCircle className="h-5 w-5 lg:mr-2" />
                    <span className="truncate hidden lg:inline group-[.w-64]:inline">
                      Tạo Quiz
                    </span>
                  </Button>
                </TeacherLink>
              </TeacherOnly>
              <StudentOnly>
                <JoinQuizModal
                  trigger={
                    <Button
                      variant="default"
                      className="h-12 w-full lg:px-6 text-base justify-center"
                      is3DNoLayout={true}
                    >
                      <KeyRound className="h-5 w-5 lg:mr-2" />
                      {/* SỬA LỖI: Kết hợp cả hai */}
                      <span className="truncate hidden lg:inline group-[.w-64]:inline">
                        Nhập PIN
                      </span>
                    </Button>
                  }
                />
              </StudentOnly>
            </div>
          </RoleGuard>

          <TeacherOnly>
            {/* Component chọn môn học phân công cho teacher */}
            <TeacherAssignmentSelector />
          </TeacherOnly>

          <StudentOnly>
            {/* THAY ĐỔI: Sử dụng component StudentStatsBar mới */}
            <div className="px-3 py-4 border-b-2 border-slate-200 dark:border-slate-800">
              {/* Desktop sidebar thu gọn: chỉ icon với tooltip */}
              <div className="lg:hidden">
                <StudentStatsBar variant="icon-only" />
              </div>
              {/* Desktop sidebar mở rộng: hiển thị đầy đủ */}
              <div className="hidden lg:block group-[.w-64]:block">
                <StudentStatsBar variant="full" />
              </div>
            </div>
          </StudentOnly>

          <div className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
            {navSections.map((section, index) => (
              <NavSection key={index} section={section} className="mb-2" />
            ))}
          </div>

          <div className="p-3 border-t-2 border-slate-200 dark:border-slate-800 mt-auto">
            <UserButton />
          </div>
        </div>

        {/* === BỐ CỤC MOBILE === */}
        <div className="md:hidden flex flex-col h-full">
          <div className="p-4 border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Icon thông báo cho mobile */}
              <StudentOnly>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Thông báo"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </StudentOnly>

              {/* Nút đóng sidebar */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <StudentOnly>
            {/* THAY ĐỔI: Thêm StudentStatsBar vào mobile - hiển thị đầy đủ */}
            <div className="p-4 border-b-2 border-slate-200 dark:border-slate-800">
              <StudentStatsBar variant="full" />
            </div>
          </StudentOnly>

          {/* SỬA LỖI: Khối action button RIÊNG cho mobile */}
          <RoleGuard roles={[Role.TEACHER, Role.STUDENT]}>
            <div className="p-4 border-b-2 border-slate-200 dark:border-slate-800">
              <TeacherOnly>
                <TeacherLink
                  href="/dashboard/teaching/quizzes/new"
                  className="block w-full"
                >
                  <Button
                    variant="default"
                    className="h-12 w-full text-base justify-center"
                    is3DNoLayout={true}
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    <span>Tạo Quiz</span>
                  </Button>
                </TeacherLink>
              </TeacherOnly>
              <StudentOnly>
                <JoinQuizModal
                  trigger={
                    <Button
                      variant="default"
                      className="h-12 w-full text-base justify-center"
                      is3DNoLayout={true}
                    >
                      <KeyRound className="h-5 w-5 mr-2" />
                      <span>Nhập PIN</span>
                    </Button>
                  }
                />
              </StudentOnly>
            </div>
          </RoleGuard>

          <TeacherOnly>
            {/* Component chọn môn học phân công cho teacher trên mobile */}
            <TeacherAssignmentSelector />
          </TeacherOnly>

          <div className="flex-1 overflow-y-auto pt-2 pb-4 px-2">
            {navSections.map((section, index) => (
              <NavSection key={index} section={section} className="mb-2" />
            ))}
          </div>

          <div className="p-3 border-t-2 border-slate-200 dark:border-slate-800 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
